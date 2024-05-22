import { prisma } from '$lib/server/prisma';
import { error } from '@sveltejs/kit';

export async function load() {
	async function fetchRelicSets() {
		return await prisma.set.findMany();
	}

	async function fetchPieceTypes() {
		return await prisma.type.findMany({
			include: {
				stats: true
			}
		});
	}

	async function fetchStats() {
		return await prisma.stat.findMany();
	}

	try {
		return {
			relicSets: fetchRelicSets(), // data streaming https://svelte.dev/blog/streaming-snapshots-sveltekit
			relicTypes: fetchPieceTypes(),
			relicStats: fetchStats()
		};
	} catch (e) {
		let message = '';

		if (e instanceof Error) message = e.message;
		else message = 'Something went wrong. Please try again later';

		error(500, message);
	}
}
