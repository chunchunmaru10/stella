import { getMainStatFromRawString } from '$lib';
import {
	sets,
	type Set,
	pieceType,
	headMainStat,
	handsMainStat,
	bodyMainStat,
	feetMainStat,
	planarSphereMainStat,
	linkRopeMainStat
} from '$lib/types';
import sharp from 'sharp';
import { createWorker } from 'tesseract.js';

export const POST = async ({ request }) => {
	try {
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

		let matchedSet: Set | undefined;
		let matchedType: (typeof pieceType)[number] | undefined;
		for (const set of sets) {
			const setIndex = rawString.indexOf(set.setName);
			if (setIndex !== -1) {
				matchedSet = set;
				// remove string after set name (which is usually the set abilities and descriptions)
				rawString = rawString.slice(0, setIndex + set.setName.length);
			}
		}

		if (!matchedSet)
			return new Response('No matched set found', {
				status: 400
			});

		let setMainStat: string[] = [];
		switch (true) {
			case matchedSet.head && rawString.includes(matchedSet.head):
				matchedType = 'Head';
				setMainStat = [...headMainStat];
				break;
			case matchedSet.hands && rawString.includes(matchedSet.hands):
				matchedType = 'Hands';
				setMainStat = [...handsMainStat];
				break;
			case matchedSet.body && rawString.includes(matchedSet.body):
				matchedType = 'Body';
				setMainStat = [...bodyMainStat];
				break;
			case matchedSet.feet && rawString.includes(matchedSet.feet):
				matchedType = 'Feet';
				setMainStat = [...feetMainStat];
				break;
			case matchedSet.planarSphere && rawString.includes(matchedSet.planarSphere):
				matchedType = 'Planar Sphere';
				setMainStat = [...planarSphereMainStat];
				break;
			case matchedSet.linkRope && rawString.includes(matchedSet.linkRope):
				matchedType = 'Link Rope';
				setMainStat = [...linkRopeMainStat];
				break;
		}

		const mainStat = getMainStatFromRawString(rawString, [...setMainStat]);

		if (!matchedType)
			return new Response('Error scanning piece type', {
				status: 400
			});

		if (!mainStat)
			return new Response('Main stat not found', {
				status: 400
			});

		return new Response(
			JSON.stringify({
				rawString,
				setName: matchedSet.setName,
				type: matchedType,
				mainStat
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
