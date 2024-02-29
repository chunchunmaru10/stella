import { getStatsFromRawString } from '$lib';
import type { Stat, RelicSet, RelicPiece, Character, CharacterRelicValue } from '$lib/types';
import sharp from 'sharp';
import { createWorker } from 'tesseract.js';
import contentful from '$lib/contentful';
import type { Entry } from 'contentful';

export const POST = async ({ request }) => {
	try {
		const [{ items: relicSets }, subStatsRaw, { items: characters }] = await Promise.all([
			contentful.withoutUnresolvableLinks.getEntries<RelicSet>({
				content_type: 'relicSets',
				include: 3
			}),
			contentful.getEntries<Stat>({
				content_type: 'stats',
				'fields.canBeSubstat': true
			}),
			contentful.withoutUnresolvableLinks.getEntries<Character>({
				content_type: 'characters'
			})
		]);
		const subStats = subStatsRaw.items.map((stat) => stat.fields.name);

		const dataUrl: string = await request.json();
		const buffer = Buffer.from(dataUrl.split(',')[1], 'base64');
		const processedBuffer = await sharp(buffer)
			.greyscale()
			.negate({ alpha: false })
			.linear(1.7, 0)
			.toBuffer();

		const worker = await createWorker();
		const ret = await worker.recognize(processedBuffer);
		await worker.terminate();

		let rawString = ret.data.text.replaceAll(/[^a-zA-Z0-9\s.%+:']/g, '');

		let matchedSet: Entry<RelicSet, 'WITHOUT_UNRESOLVABLE_LINKS', string> | undefined;
		let matchedPiece: Entry<RelicPiece, 'WITHOUT_UNRESOLVABLE_LINKS', string> | undefined;
		let stats: ReturnType<typeof getStatsFromRawString> | undefined;

		for (const set of relicSets) {
			const setIndex = rawString.indexOf(set.fields.name);
			if (setIndex !== -1) {
				matchedSet = set;

				// remove string after set name (which is usually the set abilities and descriptions)
				rawString = rawString.slice(0, setIndex + set.fields.name.length);
			}
		}

		if (!matchedSet)
			return new Response('No matched set found', {
				status: 400
			});

		for (const piece of matchedSet.fields.pieces) {
			if (piece && rawString.includes(piece.fields.name) && piece.fields.type?.fields.type) {
				matchedPiece = piece;
				stats = getStatsFromRawString(
					rawString,
					piece.fields.type.fields.mainStats.map((stat) => {
						if (stat?.fields.name) return stat.fields.name;
						else throw new Error('Stat from matched set is empty');
					}),
					subStats
				);
			}
		}

		if (!matchedPiece)
			return new Response('No matched piece found', {
				status: 400
			});

		if (!matchedPiece.fields.type)
			return new Response('No matched type found', {
				status: 400
			});

		if (!stats)
			return new Response('No stats found', {
				status: 400
			});

		const matchedCharacters: CharacterRelicValue[] = [];

		for (const character of characters) {
			// if character's best set does not include the matched set
			if (
				!character.fields.bestSets.map((set) => set?.fields.name).includes(matchedSet.fields.name)
			)
				continue;

			// if character's matched set's type does not have the correct main stats
			const matchedType = matchedPiece.fields.type.fields.type;
			if (
				matchedType === 'Body' &&
				!character.fields.bodyStats.map((stat) => stat?.fields.name).includes(stats.mainStat)
			)
				continue;
			else if (
				matchedType === 'Feet' &&
				!character.fields.feetStats.map((stat) => stat?.fields.name).includes(stats.mainStat)
			)
				continue;
			else if (
				matchedType === 'Planar Sphere' &&
				!character.fields.planarSphereStats
					.map((stat) => stat?.fields.name)
					.includes(stats.mainStat)
			)
				continue;
			else if (
				matchedType === 'Link Rope' &&
				!character.fields.planarSphereStats
					.map((stat) => stat?.fields.name)
					.includes(stats.mainStat)
			)
				continue;

			// calculate substats rating in fraction, the numerator is the value, and the denominator is the max potential value
			// max potential value is calculated by adding up the number of points for 4 best substats arranged descendingly
			// where best = 5 points, second best = 4 points, and etc... until 1 point
			// for example, if character A has CRIT DMG (5) and CRIT Rate (5) as best, ATK% (4) and SPD (4) as second best, and Break Effect (3) as third best,
			// if arranged descendingly, it would be CRIT DMG -> CRIT Rate -> ATK% -> SPD -> Break Effect
			// thus, the max potential value would be 5 + 5 + 4 + 4 = 18 (We are only taking the 4 best values since a relic can only have max 4 substats)

			let subStatsIncluded = 0;
			let maxPotentialValue = 0; // accumulated max potential value
			const actualValues: { stat: string; value: number }[] = []; // actual value/rating of the relic for this character
			// if the relic only has 3 substats, the unknown 4th substat will be the optimistic potential value
			// using character A from above as an example, if the relic only has CRIT DMG, ATK%, and HP%, the actual value is 10,
			// but the potential value is 5, because the max possible value it hasn't gotten yet is 5 (CRIT Rate)
			// all potentially good stats are added to the array, the frontend will display the stats which when added to the actual
			// value will exceed the threshold value set by the user.
			let potentialValues: { stat: string; value: number }[] = [];

			const subStatValues: { substat: string; value: number }[] = [];
			character.fields.bestSubstats.forEach((stat) => {
				if (stat)
					subStatValues.push({
						substat: stat.fields.name,
						value: 5
					});
			});
			character.fields.secondBestSubstats?.forEach((stat) => {
				if (stat)
					subStatValues.push({
						substat: stat.fields.name,
						value: 4
					});
			});
			character.fields.thirdBestSubstats?.forEach((stat) => {
				if (stat)
					subStatValues.push({
						substat: stat.fields.name,
						value: 3
					});
			});
			character.fields.fourthBestSubstats?.forEach((stat) => {
				if (stat)
					subStatValues.push({
						substat: stat.fields.name,
						value: 2
					});
			});
			character.fields.fifthBestSubstats?.forEach((stat) => {
				if (stat)
					subStatValues.push({
						substat: stat.fields.name,
						value: 1
					});
			});

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
				const relicStats = stats; // must reassign otherwise stats may be undefined in the line below
				// since the substat values are already arranged in descending order,
				// we just need to filter out the ones that are already included in the relic substats
				// main stat is also excluded since if the stat is main stat, it cant be a potential substat
				// optional chaining is used for accessing elements at index 0 because a character may only have 2 best stats
				// and if the relic contains both of them, in this case, the filtered out array will be empty
				potentialValues = subStatValues
					.filter(
						(subStatValue) =>
							!relicStats.subStats.includes(subStatValue.substat) &&
							relicStats.mainStat !== subStatValue.substat
					)
					.map((stat) => {
						return {
							stat: stat.substat,
							value: stat.value
						};
					});
			}

			matchedCharacters.push({
				name: character.fields.name,
				thumbnail: character.fields.thumbnail?.fields.file?.url + '?fm=webp',
				rarity: character.fields.rarity === 4 ? 4 : 5,
				releaseDate: new Date(character.fields.releaseDate.toString()),
				maxPotentialValue,
				actualValues,
				potentialValues
			});
		}

		return new Response(
			JSON.stringify({
				setName: matchedSet.fields.name,
				image: matchedPiece.fields.thumbnail?.fields.file?.url + '?fm=webp',
				relicName: matchedPiece.fields.name,
				type: matchedPiece.fields.type.fields.type,
				...stats,
				characters: matchedCharacters
			})
		);
	} catch (e: unknown) {
		let message = '';

		if (e instanceof Error) message = e.message;
		else message = 'Something went wrong. Please try again later';

		return new Response(message, {
			status: 400
		});
	}
};
