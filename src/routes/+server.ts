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

	// fs.writeFileSync('C:\\Users\\Admin\\Downloads\\hello.png', processedBuffer);
	const worker = await createWorker();
	const ret = await worker.recognize(processedBuffer);
	await worker.terminate();

	return new Response(JSON.stringify(ret.data.text.replaceAll(/[^a-zA-Z0-9\s.%+']/g, '')));
};
