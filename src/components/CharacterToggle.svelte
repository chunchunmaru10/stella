<script lang="ts">
	import type { CharacterData } from '$lib/types';
	import { settings } from '$lib/stores/settings';

	export let character: CharacterData;
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
	class={`${active ? '' : 'opacity-50'} flex w-24 flex-col items-center justify-between rounded-md bg-gradient-to-b py-4 ${
		character.rarity === 4 ? 'from-purple-dark to-purple-light' : 'from-gold-dark to-gold-light'
	} transition hover:scale-110`}
>
	<img src={character.thumbnail} alt={character.name} class="mb-4 h-20 w-20" />
	<p class="my-auto font-semibold">{character.name}</p>
</button>
