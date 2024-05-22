import sharp from 'sharp';

export const POST = async ({ request }) => {
	try {
		const dataUrl: string = await request.json();
		const buffer = Buffer.from(dataUrl.split(',')[1], 'base64');
		const processedBuffer = await sharp(buffer)
			.greyscale()
			.negate({ alpha: false })
			.linear(1.3, 0)
			.toBuffer();

		return new Response(processedBuffer.toString('base64'));
	} catch (e: unknown) {
		let message = '';

		if (e instanceof Error) message = e.message;
		else message = 'Something went wrong. Please try again later';

		return new Response(message, {
			status: 400
		});
	}
};
