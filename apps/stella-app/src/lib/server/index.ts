import type { CharacterRelicValue, Relic } from '../types';
import { findCombination, getStatValue, removeSpace } from '$lib';
import { db, type Rarity, type Stat } from 'database';

export async function getDbData() {
	const [sets, subStatList, characters, rarities] = await Promise.all([
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
								stats: {
									include: {
										mainStatScalings: true
									}
								}
							}
						}
					}
				}
			}
		}),
		db.stat.findMany({
			include: {
				subStatScalings: true
			},
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
		}),
		db.rarity.findMany()
	]);

	return {
		sets,
		subStatList,
		characters,
		rarities
	};
}

export function getStatsFromRawString(
	rawString: string,
	mainStatList: Stat[],
	subStatList: Stat[]
) {
	let mainStat:
		| {
				name: string;
				value: number;
				displayPercentage: boolean;
		  }
		| undefined;
	const substats: NonNullable<ReturnType<typeof getStatNameFromLine>>[] = [];
	const lines = rawString.split('\n');

	let mainStatLineIndex = -1;

	for (const [index, line] of lines.entries()) {
		for (const stat of mainStatList) {
			const parsedMainStat = getStatNameFromLine(
				line,
				stat,
				getFlatStatsWithPercentageVariants(mainStatList.map((s) => s.name))
			);

			if (!parsedMainStat) continue;

			mainStatLineIndex = index;
			mainStat = parsedMainStat;
		}
		if (mainStat) break;
	}

	if (!mainStat || mainStatLineIndex === -1) throw new Error('Main stat is not found');

	// start from the line where the mainstat is to the end
	for (let i = mainStatLineIndex + 1; i < lines.length; i++) {
		for (const stat of subStatList) {
			const substat = getStatNameFromLine(
				lines[i],
				stat,
				getFlatStatsWithPercentageVariants(subStatList.map((s) => s.name))
			);
			if (substat) substats.push(substat);

			// stop once there are 4 substats detected
			if (substats.length >= 4) break;
		}
	}

	return {
		mainStat,
		substats: substats.map((s) => ({
			...s,
			upgrades: [] as number[],
			maxValue: 0
		}))
	};
}

export function getRelicData(
	rawString: string,
	sets: Awaited<ReturnType<typeof getDbData>>['sets'],
	substatList: Awaited<ReturnType<typeof getDbData>>['subStatList'],
	rarities: Awaited<ReturnType<typeof getDbData>>['rarities']
) {
	let matchedSet: (typeof sets)[number] | undefined;
	let matchedPiece: (typeof sets)[number]['pieces'][number] | undefined;
	let stats: ReturnType<typeof getStatsFromRawString> | undefined;

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
			stats = getStatsFromRawString(rawString, piece.type.stats, substatList);
		}
	}

	if (!matchedPiece) throw new Error('No matched piece found');

	if (!matchedPiece.type) throw new Error('No matched piece type found');

	if (!stats) throw new Error('No stats found');

	// determine level
	const possibleLevels: (Rarity & { level: number })[] = [];
	for (const rarity of rarities) {
		for (let i = 0; i <= rarity.maxLevel; i++) {
			const mainStatScalingAtThisRarity = matchedPiece.type.stats
				.find((s) => s.name === stats.mainStat.name)
				?.mainStatScalings.find((s) => s.rarityId === rarity.rarity);
			if (!mainStatScalingAtThisRarity) continue;
			const [a, b] = getStatValue(
				stats.mainStat.value,
				mainStatScalingAtThisRarity.baseValue + mainStatScalingAtThisRarity.scalingValue * i,
				stats.mainStat.displayPercentage
			);
			if (a === b) {
				possibleLevels.push({
					...rarity,
					level: i
				});
			}
			// break if already found/past value
			if (b >= a) {
				break;
			}
		}
	}

	// determine substat upgrades
	if (!possibleLevels.length) throw new Error('Could not determine relic level');
	let foundRarity: (typeof possibleLevels)[number] | undefined = undefined;

	for (const level of possibleLevels) {
		// loop through each substat to see if it matches
		const numberOfUpgrades = Math.floor(level.level / 3); // each substats can be upgraded once every 3 levels
		console.log('numberOfUpgrades: ', numberOfUpgrades);
		for (const substat of stats.substats) {
			console.log(
				`values passed to getSubstatUpgrades, substat: ${substat}, substatList: ${substatList}, rarity: ${level.rarity}`
			);
			getSubstatUpgrades(substat, substatList, level.rarity);
			console.log('modified substat values to: ', substat);
		}
		console.log('stat.substats: ', stats.substats);

		// verify that the upgrades count match
		const calculatedUpgradeCount = stats.substats.reduce((prev, curr) => {
			return prev + curr.upgrades.length - 1; // need to minus 1 to count for the initial substat value that is also counted in the combo
		}, 0);

		console.log('calculatedUpgradeCount: ', calculatedUpgradeCount);
		const diff = numberOfUpgrades - calculatedUpgradeCount;
		console.log('diff: ', diff);
		if (calculatedUpgradeCount >= 0 && (diff === 0 || diff === 1)) {
			console.log('if condition fulfilled, found rarity: ', level);
			// different need to be 0 or 1 because we don't know whether the relic has 3 or 4 substats initially
			foundRarity = {
				...level
			};
			break;
		}
	}

	console.log('foundRarity: ', foundRarity);
	if (!foundRarity) throw new Error('Could not determine relic rarity');

	return {
		matchedSet,
		matchedPiece,
		matchedType: matchedPiece.type,
		...foundRarity,
		stats
	};
}

export function rateRelic(
	{
		matchedSet,
		matchedPiece,
		matchedType,
		stats,
		level,
		...rarity
	}: ReturnType<typeof getRelicData>,
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
			!mainStatsWithMatchedType.find((stat) => stat.statName === stats.mainStat.name)
		)
			continue;

		// calculate substats rating in fraction, the numerator is the value, and the denominator is the max potential value
		// max potential value is calculated by adding up the number of points for 4 best substats arranged descendingly
		// where the higher the priority, the higher the points
		// the point for each priority is calculated as (value of lowest priority) - (value of this priority) + 1
		// for example, if character A has CRIT DMG (priority 1) and CRIT Rate (priority 1) as best, ATK% (priority 2) and SPD (priority 2) as second best, and Break Effect (priority 3) as third best,
		// if arranged descendingly, it would be CRIT DMG -> CRIT Rate -> ATK% -> SPD -> Break Effect
		// thus, the max potential value would be 3 + 3 + 2 + 2 = 10 (We are only taking the 4 best values since a relic can only have max 4 substats)

		let maxPotentialValue = 0;
		let maxPotentialValueAtMaxLevel = 0;
		const actualValues: CharacterRelicValue['actualValues'] = []; // actual value/rating of the relic for this character
		let potentialStats: string[] = [];

		// sort by descending priority value and take first priority value (the biggest value, lowest priority)
		const lowestPriorityValue = character.characterSubstats.sort(
			(a, b) => b.priority - a.priority
		)[0].priority;
		// need to sort here because we only want to take the highest values to include as max potential value
		// when the array has value of something like [4, 4, 3, 3, 2], the substatValues.slice called below will only take the highest values
		const substatValues = character.characterSubstats
			.map((stat) => ({
				substat: stat.statName,
				value: lowestPriorityValue - stat.priority + 1
			}))
			.sort((a, b) => b.value - a.value);

		const numberOfUpgrades = Math.floor(level / 3);
		const numberOfUpgradesAtMaxLevel = Math.floor(rarity.maxLevel / 3);
		const maxSubstatValue = substatValues.reduce((prev, curr) => Math.max(prev, curr.value), 0);
		// base potential value is the value that an un-upgraded relic could have assuming all of its stats are the best possible
		const basePotentialValue = substatValues
			.slice(0, rarity.maxSubstatAmount)
			.reduce((prev, curr) => prev + curr.value, 0);
		maxPotentialValue += maxSubstatValue * numberOfUpgrades + basePotentialValue;
		maxPotentialValueAtMaxLevel +=
			maxSubstatValue * numberOfUpgradesAtMaxLevel + basePotentialValue;

		// calculate for actual value
		for (const substatValue of substatValues) {
			const found = stats.substats.find((s) => s.name === substatValue.substat);

			if (!found) continue;

			for (let i = 0; i < found.upgrades.length; i++) {
				const penaltyPercentage = found.upgrades[i] / found.maxValue;
				if (i === 0) {
					actualValues.push({
						stat: substatValue.substat,
						values: [substatValue.value * penaltyPercentage]
					});
				} else {
					const last = actualValues[actualValues.length - 1];
					last.values.push(substatValue.value * penaltyPercentage);
				}
			}
		}

		// calculate for potential values
		// potential stats that could be upgraded in the future
		// can include already existing substats depending on if it is the highest value
		potentialStats = [];
		let eligibleSubstats: typeof substatValues = [];
		// if still can gain substat, assume that it is the best among the remaning ones
		// get substat from the remaining substat with the highest value
		// if there are multiple, include them all
		if (stats.substats.length < rarity.maxSubstatAmount) {
			// a substat can only be included if it isnt already the main stat and is not included in the existing substat that the relic has
			eligibleSubstats = substatValues.filter(
				(s) =>
					!potentialStats.find((stat) => stat === s.substat) && stats.mainStat.name !== s.substat
			);
		} else {
			for (const stat of stats.substats) {
				const found = substatValues.find((s) => s.substat === stat.name);
				if (found) eligibleSubstats.push(found);
			}
		}
		// find substats that have the highest value that is non-zero (can include multiple substats)
		// the potential values will then be the substats found
		let highestValue = 0;

		for (const { substat: stat, value } of eligibleSubstats) {
			if (value === 0) continue;
			if (value > highestValue) {
				highestValue = value;
				potentialStats = [stat];
			} else if (value === highestValue) potentialStats.push(stat);
		}

		if (actualValues.length > 0 || highestValue > 0) {
			matchedCharacters.push({
				name: character.name,
				thumbnail: character.thumbnail,
				rarity: character.rarity === 4 ? 4 : 5,
				releaseDate: character.releaseDate,
				maxPotentialValue,
				maxPotentialValueAtMaxLevel,
				remainingNumberOfUpgrades: Math.ceil((rarity.maxLevel - level) / 3),
				actualValues,
				potentialStats,
				potentialStatsValue: highestValue
			});
		}
	}

	return {
		setName: matchedSet.name,
		image: matchedPiece.thumbnail,
		level,
		rarity: rarity.rarity,
		relicName: matchedPiece.name,
		type: matchedType.name,
		...stats,
		characters: matchedCharacters
	};
}

// get flat stats by checking if all stats contain another element with this name but with a %
export function getFlatStatsWithPercentageVariants(allStats: string[]) {
	return allStats.filter((s) => allStats.includes(s + '%'));
}

// no need to return, this will directly modify the object since it is passed by reference
export function getSubstatUpgrades(
	substat: ReturnType<typeof getStatsFromRawString>['substats'][number],
	substatList: Awaited<ReturnType<typeof getDbData>>['subStatList'],
	rarity: number
) {
	const matchingSubstatScalingsAtThisRarity = substatList
		.find((s) => s.name === substat.name)
		?.subStatScalings.filter((s) => s.rarityId === rarity);

	if (!matchingSubstatScalingsAtThisRarity)
		throw new Error('Could not determine substat value distribution');

	// get max value to be used later to determine the rating penalty
	substat.maxValue = matchingSubstatScalingsAtThisRarity.reduce(
		(prev, curr) => Math.max(prev, curr.scalingValue),
		0
	);

	const combo = findCombination(
		matchingSubstatScalingsAtThisRarity.map((s) => s.scalingValue),
		substat.value,
		substat.displayPercentage
	);

	if (combo) substat.upgrades = combo;
}

function getStatNameFromLine(line: string, stat: Stat, flatStatsWithPercentageVariants: string[]) {
	const result = {
		name: '',
		value: 0,
		displayPercentage: true
	};
	// if a word in the line can be parsed into a number, then set it to this variable
	// need to determine whether statname should include percentage or not
	let foundValueString = '';

	// find from last element split by space on which element can be successfully parsed to a float after removing the %
	const split = line.split(' ');
	for (let i = split.length - 1; i >= 0; i--) {
		const word = split[i];

		const parsed = Number.parseFloat(word.replace('%', ''));
		if (isNaN(parsed)) continue;
		// only include % to stat name if there is a flat stat equivalent for this name and this stat is a %
		// eg.HP, ATK, and DEF, but not CRIT DMG since CRIT DMG does not have an equivalent that doesnt have the percentage
		if (flatStatsWithPercentageVariants.includes(result.name) && word.endsWith('%'))
			result.name += '%';

		foundValueString = word;
		result.value = parsed;
		result.displayPercentage = stat.displayPercentage;
		break;
	}

	// if the stat includes %, such as HP%, ATK%, and DEF%, check if the line has both the stat (HP) and the percentage
	// other percentage stats (such as CRITs) is not included in this statment because they dont have the non-% variant
	if (stat.name.includes('%')) {
		if (line.includes(stat.name.replaceAll('%', '')) && line.includes('%')) {
			result.name = stat.name;
			result.displayPercentage = stat.displayPercentage;
		}
	} else if (line.includes(stat.name)) {
		const isFlatStatAndWithoutPercentage =
			flatStatsWithPercentageVariants.includes(stat.name) && !foundValueString.includes('%');
		if (isFlatStatAndWithoutPercentage || !flatStatsWithPercentageVariants.includes(stat.name)) {
			result.name = stat.name;
			result.displayPercentage = stat.displayPercentage;
		}
	}

	return result.name && result.value ? result : undefined;
}
