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

		let rawString = ret.data.text.replaceAll(/[^a-zA-Z0-9\s.%+']/g, '');

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
				break;

			// if character's matched set's type does not have the correct main stats
			const matchedType = matchedPiece.fields.type.fields.type;
			if (
				matchedType === 'Body' &&
				!character.fields.bodyStats.map((stat) => stat?.fields.name).includes(stats.mainStat)
			)
				break;
			else if (
				matchedType === 'Feet' &&
				!character.fields.feetStats.map((stat) => stat?.fields.name).includes(stats.mainStat)
			)
				break;
			else if (
				matchedType === 'Planar Sphere' &&
				!character.fields.planarSphereStats
					.map((stat) => stat?.fields.name)
					.includes(stats.mainStat)
			)
				break;
			else if (
				matchedType === 'Link Rope' &&
				!character.fields.planarSphereStats
					.map((stat) => stat?.fields.name)
					.includes(stats.mainStat)
			)
				break;

			// calculate substats rating in fraction, the numerator is the value, and the denominator is the max potential value
			// max potential value is calculated by adding up the number of points for 4 best substats arranged descendingly
			// where best = 4 points, second best = 3 points, and etc... until 1 point
			// for example, if character A has CRIT DMG (4) and CRIT Rate (4) as best, ATK% (3) and SPD (3) as second best, and Break Effect (2) as third best,
			// if arranged descendingly, it would be CRIT DMG -> CRIT Rate -> ATK% -> SPD -> Break Effect
			// thus, the max potential value would be 4 + 4 + 3 + 3 = 14 (We are only taking the 4 best values since a relic can only have max 4 substats)

			let subStatsIncluded = 0; // number of substats that has been counted for max value
			let maxPotentialValue = 0; // accumulated max potential value
			let actualValue = 0; // actual value/rating of the relic for this character

			const characterSubstatsValues = [
				{
					subStats: character.fields.bestSubstats,
					value: 4
				},
				{
					subStats: character.fields.secondBestSubstats,
					value: 3
				},
				{
					subStats: character.fields.thirdBestSubstats,
					value: 2
				},
				{
					subStats: character.fields.fourthBestSubstats,
					value: 1
				}
			];

			for (const subStatsValuePair of characterSubstatsValues) {
				if (!subStatsValuePair.subStats) continue;

				// calculate for max potential value
				if (subStatsIncluded < 4) {
					maxPotentialValue +=
						Math.min(subStatsValuePair.subStats.length, 4 - subStatsIncluded) *
						subStatsValuePair.value;
					subStatsIncluded += subStatsValuePair.subStats.length;
				}
				// calculate for actual value
				const relicSubstats = stats.subStats; // don't know why when stats.subStast is used in the line below stats may be undefined
				actualValue +=
					subStatsValuePair.subStats.filter(
						(stat) => relicSubstats.includes(stat?.fields.name ?? '') ?? false
					).length * subStatsValuePair.value;
			}

			matchedCharacters.push({
				name: character.fields.name,
				thumbnail: character.fields.thumbnail?.fields.file?.url ?? '',
				maxPotentialValue,
				actualValue
			});
		}

		return new Response(
			JSON.stringify({
				setName: matchedSet.fields.name,
				image: matchedPiece.fields.thumbnail?.fields.file?.url ?? '',
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
