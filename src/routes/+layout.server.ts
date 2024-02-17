import contentful from '$lib/contentful';
import type { Character, CharacterData } from '$lib/types';
import { error } from '@sveltejs/kit';

export async function load() {
	async function fetchCharacters() {
		return (
			await contentful.withoutUnresolvableLinks.getEntries<Character>({
				content_type: 'characters'
			})
		).items.map((character) => {
			const characterData: CharacterData = {
				name: character.fields.name,
				rarity: character.fields.rarity === 4 ? 4 : 5,
				thumbnail: character.fields.thumbnail?.fields.file?.url + '?fm=webp',
				releaseDate: new Date(character.fields.releaseDate.toString())
			};
			return characterData;
		});
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
