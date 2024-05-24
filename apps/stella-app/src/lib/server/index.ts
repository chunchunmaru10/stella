import type { CharacterRelicValue, Relic } from '../types';
import { removeSpace } from '$lib';
import { db } from 'database';

export async function getDbData() {
	const [sets, subStatList, characters] = await Promise.all([
		db.set.findMany({
			include: {
				characters: {
					include: {
						characterMainStats: true,
						characterSubstats: true
					}
				},
				pieces: {
					include: {
						type: {
							include: {
								stats: true
							}
						}
					}
				}
			}
		}),
		db.stat.findMany({
			where: {
				canBeSubstats: true
			}
		}),
		db.character.findMany({
			include: {
				sets: true,
				characterMainStats: true,
				characterSubstats: true
			}
		})
	]);

	return {
		sets,
		subStatList,
		characters
	};
}

export function getStatsFromRawString(
	rawString: string,
	mainStatList: string[],
	subStatList: string[]
) {
	let mainStat = '';
	const subStats = [];
	const lines = rawString.split('\n');

	let mainStatLineIndex = -1;

	for (const [index, line] of lines.entries()) {
		for (const stat of mainStatList) {
			// if the stat includes %, such as HP%, ATK%, and DEF%, check if the line has both the stat (HP) and the percentage
			// other percentage stats (such as CRITs) is not included in this statment because they dont have the non-% variant
			if (stat.includes('%')) {
				if (line.includes(stat.replaceAll('%', '')) && line.includes('%')) {
					mainStatLineIndex = index;
					mainStat = stat;
					break;
				}
			} else {
				if (line.includes(stat)) {
					mainStatLineIndex = index;
					mainStat = stat;
					break;
				}
			}
		}
		if (mainStatLineIndex !== -1) break;
	}

	if (mainStatLineIndex === -1) throw new Error('Main stat is not found');

	if (['HP', 'ATK', 'DEF'].includes(mainStat) && lines[mainStatLineIndex].endsWith('%'))
		mainStat += '%';

	for (let i = mainStatLineIndex + 1; i < lines.length; i++) {
		for (const stat of subStatList) {
			if (lines[i].includes(stat)) {
				let subStat = stat;
				if (['HP', 'ATK', 'DEF'].includes(subStat) && lines[i].includes('%')) subStat += '%';
				subStats.push(subStat);
			}

			// stop once there are 4 substats detected
			if (subStats.length >= 4) break;
		}
	}

	return {
		mainStat,
		subStats
	};
}

export function getRelicData(
	rawString: string,
	sets: Awaited<ReturnType<typeof getDbData>>['sets'],
	subStatList: Awaited<ReturnType<typeof getDbData>>['subStatList']
) {
	let matchedSet: (typeof sets)[number] | undefined;
	let matchedPiece: (typeof sets)[number]['pieces'][number] | undefined;
	let stats:
		| {
				mainStat: string;
				subStats: string[];
		  }
		| undefined;

	for (const set of sets) {
		// temporary remove line breaks because some relic set names may be too long
		if (removeSpace(rawString).includes(removeSpace(set.name))) {
			matchedSet = set;

			// remove text after 2-Pc, which is the set details and description
			// this is to prevent if there is a set that let's say increases CRIT DMG by 10%, it might include CRIT DMG as one of the substats.
			rawString = rawString.slice(0, rawString.toLowerCase().indexOf('2-pc'));
		}
	}

	if (!matchedSet) throw new Error('No matched set found');

	for (const piece of matchedSet.pieces) {
		// temporary remove line breaks because some relic set names may be too long
		if (piece && removeSpace(rawString).includes(removeSpace(piece.name)) && piece.type?.name) {
			matchedPiece = piece;
			stats = getStatsFromRawString(
				rawString,
				piece.type.stats.map((stat) => stat.name),
				subStatList.map((stat) => stat.name)
			);
		}
	}

	if (!matchedPiece) throw new Error('No matched piece found');

	if (!matchedPiece.type) throw new Error('No matched piece type found');

	if (!stats) throw new Error('No stats found');

	return {
		matchedSet,
		matchedPiece,
		matchedType: matchedPiece.type,
		stats
	};
}

export function rateRelic(
	{ matchedSet, matchedPiece, matchedType, stats }: ReturnType<typeof getRelicData>,
	allCharacters: Awaited<ReturnType<typeof getDbData>>['characters']
): Relic {
	const matchedCharacters: CharacterRelicValue[] = [];

	for (const character of allCharacters) {
		// if character's best set does not include the matched set
		if (!character.sets.find((set) => set.name === matchedSet.name)) continue;

		// if character's matched set's type does not have the correct main stats
		const mainStatsWithMatchedType = character.characterMainStats.filter(
			(stat) => stat.typeName === matchedType.name
		);
		// if this type has more than 1 main stats (means its not head or hands), then it is the only mainstat that the relic can get,
		// thus we can omit to store it in db, which means we cant query it, so need to check here to make sure that the matched type has
		// at least 2 recommended stats. Note that this should not count when there are only 1 stat recommended for a type (such as only
		// recommending Energy Regen for Rope) because it is matching by type instead of by character main stats
		if (
			matchedType.stats.length > 1 &&
			!mainStatsWithMatchedType.find((stat) => stat.statName === stats.mainStat)
		)
			continue;

		// calculate substats rating in fraction, the numerator is the value, and the denominator is the max potential value
		// max potential value is calculated by adding up the number of points for 4 best substats arranged descendingly
		// where the higher the priority, the higher the points
		// the point for each priority is calculated as (value of lowest priority) - (value of this priority) + 1
		// for example, if character A has CRIT DMG (priority 1) and CRIT Rate (priority 1) as best, ATK% (priority 2) and SPD (priority 2) as second best, and Break Effect (priority 3) as third best,
		// if arranged descendingly, it would be CRIT DMG -> CRIT Rate -> ATK% -> SPD -> Break Effect
		// thus, the max potential value would be 3 + 3 + 2 + 2 = 10 (We are only taking the 4 best values since a relic can only have max 4 substats)

		let subStatsIncluded = 0;
		let maxPotentialValue = 0; // accumulated max potential value
		const actualValues: { stat: string; value: number }[] = []; // actual value/rating of the relic for this character
		// if the relic only has 3 substats, the unknown 4th substat will be the optimistic potential value
		// using character A from above as an example, if the relic only has CRIT DMG, ATK%, and HP%, the actual value is 5,
		// but the potential value is 8, because the max possible value it hasn't gotten yet is 3 (CRIT Rate)
		// all potentially good stats are added to the array, the frontend will display the stats which when added to the actual
		// value will exceed the threshold value set by the user.
		let potentialValues: { stat: string; value: number }[] = [];

		// sort by descending priority value and take first priority value (the biggest value, lowest priority)
		const lowestPriorityValue = character.characterSubstats.sort(
			(a, b) => b.priority - a.priority
		)[0].priority;
		// need to sort here because we only want to take the highest values to include as max potential value
		// when the array has value of something like [4, 4, 3, 3, 2], the loop below will only accumulate the max potential value of [4, 4, 3, 3]
		const subStatValues = character.characterSubstats
			.map((stat) => ({
				substat: stat.statName,
				value: lowestPriorityValue - stat.priority + 1
			}))
			.sort((a, b) => b.value - a.value);

		// calculate for max potential value
		for (let i = 0; subStatsIncluded < 4; i++) {
			// when a character only has very little suitable substats, this check is to ensure element exists before accessing the element
			if (!subStatValues[i]) break;
			// if this substat is the same as main stat, do not count this into the max because substats cannot contain the main stat
			if (subStatValues[i].substat === stats.mainStat) continue;

			maxPotentialValue += subStatValues[subStatsIncluded].value;
			subStatsIncluded++;
		}

		// calculate for actual value
		for (const subStatValue of subStatValues) {
			if (stats.subStats.includes(subStatValue.substat)) {
				actualValues.push({
					stat: subStatValue.substat,
					value: subStatValue.value
				});
			}
		}

		// calculate for potential value
		if (stats.subStats.length < 4) {
			// since the substat values are already arranged in descending order,
			// we just need to filter out the ones that are already included in the relic substats
			// main stat is also excluded since if the stat is main stat, it cant be a potential substat
			// optional chaining is used for accessing elements at index 0 because a character may only have 2 best stats
			// and if the relic contains both of them, in this case, the filtered out array will be empty
			potentialValues = subStatValues
				.filter(
					(subStatValue) =>
						!stats.subStats.includes(subStatValue.substat) &&
						stats.mainStat !== subStatValue.substat
				)
				.map((stat) => {
					return {
						stat: stat.substat,
						value: stat.value
					};
				});
		}

		if (actualValues.length > 0 || potentialValues.length > 0) {
			matchedCharacters.push({
				name: character.name,
				thumbnail: character.thumbnail,
				rarity: character.rarity === 4 ? 4 : 5,
				releaseDate: character.releaseDate,
				maxPotentialValue,
				actualValues,
				potentialValues
			});
		}
	}

	return {
		setName: matchedSet.name,
		image: matchedPiece.thumbnail,
		relicName: matchedPiece.name,
		type: matchedType.name,
		...stats,
		characters: matchedCharacters
	};
}
