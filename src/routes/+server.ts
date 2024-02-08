import { getStatsFromRawString } from '$lib';
import type { Stat, RelicSet } from '$lib/types';
import sharp from 'sharp';
import { createWorker } from 'tesseract.js';
import contentful from '$lib/contentful';
import type { Entry } from 'contentful';

export const POST = async ({ request }) => {
	try {
		const relicSets = (
			await contentful.withoutUnresolvableLinks.getEntries<RelicSet>({
				content_type: 'relicSets',
				include: 3
			})
		).items;
		const subStats = (
			await contentful.getEntries<Stat>({
				content_type: 'stats',
				'fields.canBeSubstat': true
			})
		).items.map((stat) => stat.fields.name);

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
		let matchedType: string | undefined;
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
				matchedType = piece.fields.type.fields.type;
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

		if (!matchedType)
			return new Response('No matched type found', {
				status: 400
			});

		if (!stats)
			return new Response('No stats found', {
				status: 400
			});

		return new Response(
			JSON.stringify({
				rawString,
				setName: matchedSet.fields.name,
				type: matchedType,
				...stats
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
