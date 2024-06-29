import type { BatchImportOption, Relic } from '$lib/types.js';
import { hsrScannerBatch, stellaBatch } from '$lib/server/batchImportHandler.js';

export const POST = async ({ request }) => {
	try {
		const req: {
			importType: BatchImportOption;
			jsonData: object;
		} = await request.json();

		let result: Relic[] = [];

		switch (req.importType) {
			case 'Stella':
				result = await stellaBatch(req.jsonData);
				break;
			case 'HSR Scanner':
				result = await hsrScannerBatch(req.jsonData);
				break;
			default:
				throw new Error('Invalid import type');
		}

		return new Response(JSON.stringify(result));
	} catch (e: unknown) {
		let message = '';

		if (e instanceof Error) message = e.message;
		else message = 'Something went wrong. Please try again later';

		return new Response(message, {
			status: 400
		});
	}
};
