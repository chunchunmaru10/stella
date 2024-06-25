import { db } from 'database';
import { error } from '@sveltejs/kit';

export async function load() {
	async function fetchCharacters() {
		return await db.character.findMany();
	}

	const announcement = await db.announcement.findFirst({
		orderBy: {
			createdAt: 'desc'
		}
	});

	try {
		return {
			characters: fetchCharacters(), // data streaming https://svelte.dev/blog/streaming-snapshots-sveltekit
			announcement
		};
	} catch (e) {
		let message = '';

		if (e instanceof Error) message = e.message;
		else message = 'Something went wrong. Please try again later';

		error(500, message);
	}
}
