import { sets, type Set, pieceType } from '$lib/types';
import sharp from 'sharp';
import { createWorker } from 'tesseract.js';

export const POST = async ({ request }) => {
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

	const rawString = ret.data.text.replaceAll(/[^a-zA-Z0-9\s.%+']/g, '');

	let matchedSet: Set | undefined;
	let matchedType: (typeof pieceType)[number] | undefined;
	for (const set of sets) {
		if (rawString.includes(set.setName)) {
			matchedSet = set;
		}
	}

	if (!matchedSet)
		return new Response('No matched set found', {
			status: 400
		});

	switch (true) {
		case matchedSet.head && rawString.includes(matchedSet.head):
			matchedType = 'Head';
			break;
		case matchedSet.hands && rawString.includes(matchedSet.hands):
			matchedType = 'Hands';
			break;
		case matchedSet.body && rawString.includes(matchedSet.body):
			matchedType = 'Body';
			break;
		case matchedSet.feet && rawString.includes(matchedSet.feet):
			matchedType = 'Feet';
			break;
		case matchedSet.planarSphere && rawString.includes(matchedSet.planarSphere):
			matchedType = 'Planar Sphere';
			break;
		case matchedSet.linkRope && rawString.includes(matchedSet.linkRope):
			matchedType = 'Link Rope';
			break;
	}

	if (!matchedType)
		return new Response('Error scanning piece type', {
			status: 400
		});

	return new Response(
		JSON.stringify({
			rawString,
			setName: matchedSet.setName,
			type: matchedType
		})
	);
};
