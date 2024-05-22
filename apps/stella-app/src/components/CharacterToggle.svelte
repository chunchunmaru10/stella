<script lang="ts">
	import { settings } from '$lib/stores/settings';
	import type { Character } from '.prisma/client';

	export let character: Character;
	let active = !$settings.excludedCharacters.includes(character.name);

	function toggleActive() {
		active = !active;

		settings.update((prev) => {
			return {
				...prev,
				excludedCharacters: active
					? prev.excludedCharacters.filter((c) => c !== character.name)
					: [...prev.excludedCharacters, character.name]
			};
		});
	}
</script>

<button
	on:click={toggleActive}
	class={`${active ? '' : 'opacity-50'} flex flex-col items-center justify-between rounded-md bg-gradient-to-b py-2 ${
		character.rarity === 4 ? 'from-purple-dark to-purple-light' : 'from-gold-dark to-gold-light'
	} transition hover:scale-110`}
>
	<img src={character.thumbnail} alt={character.name} class="mb-4 h-20 w-20" />
	<p class="my-auto font-semibold">{character.name}</p>
</button>
