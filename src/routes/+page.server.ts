import contentful from '$lib/contentful';
import type { Character, CharacterData } from '$lib/types';
import { error } from '@sveltejs/kit';

export async function load() {
	try {
		return {
			characters: (
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
			})
		};
	} catch (e) {
		let message = '';

		if (e instanceof Error) message = e.message;
		else message = 'Something went wrong. Please try again later';

		error(500, message);
	}
}
