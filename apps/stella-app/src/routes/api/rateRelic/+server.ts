import { getDbData, getRelicData, rateRelic } from '$lib/server/index.js';

export const POST = async ({ request }) => {
	try {
		const { rawString, excludedCharacters }: { rawString: string; excludedCharacters: string[] } =
			await request.json();

		const { sets, subStatList, characters, rarities } = await getDbData();

		const relicData = getRelicData(rawString, sets, subStatList, rarities);

		return new Response(
			JSON.stringify(
				rateRelic(
					relicData,
					characters.filter((c) => !excludedCharacters.includes(c.name))
				)
			)
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
