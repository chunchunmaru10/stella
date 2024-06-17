import { getDbData } from '$lib/server/index.js';
import type { Relic, RelicData } from '$lib/types.js';
import { rateRelic } from '$lib/server/index.js';

export const POST = async ({ request }) => {
	try {
		const { sets, characters } = await getDbData();

		const relicData: RelicData[] = await request.json();

		const relics: Relic[] = [];

		for (const relic of relicData) {
			const matchedSet = sets.find((set) => set.name === relic.set);

			if (!matchedSet) continue;

			const matchedPiece = matchedSet.pieces.find((piece) => piece.type?.name === relic.type);

			if (!matchedPiece) continue;

			relics.push(
				rateRelic(
					{
						matchedSet,
						matchedPiece,
						matchedType: matchedPiece.type,
						stats: {
							mainStat: relic.mainStat,
							subStats: relic.substats
						}
					},
					characters
				)
			);
		}

		return new Response(JSON.stringify(relics));
	} catch (e: unknown) {
		let message = '';

		if (e instanceof Error) message = e.message;
		else message = 'Something went wrong. Please try again later';

		return new Response(message, {
			status: 400
		});
	}
};
