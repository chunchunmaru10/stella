import { db } from 'database';
import { error } from '@sveltejs/kit';

export async function load() {
	async function fetchCharacters() {
		return await db.character.findMany();
	}

	try {
		return {
			characters: fetchCharacters() // data streaming https://svelte.dev/blog/streaming-snapshots-sveltekit
		};
	} catch (e) {
		let message = '';

		if (e instanceof Error) message = e.message;
		else message = 'Something went wrong. Please try again later';

		error(500, message);
	}
}
