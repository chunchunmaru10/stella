<script lang="ts">
	import { getContext } from 'svelte';
	import CharacterToggle from './CharacterToggle.svelte';
	import { settings } from '$lib/stores/settings';
	import type { Character } from 'database';

	// data stuff
	const data = getContext<Promise<Character[]>>('characters');
</script>

<section class="max-h-full w-full">
	<h2 class="my-4 text-xl font-semibold">Included Characters</h2>
	<div class="grid w-full grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] justify-center gap-3 pb-4">
		{#await data then characters}
			{@const sorted = characters.sort((a, b) => a.name.localeCompare(b.name))}
			{#each sorted as character}
				<!-- only render if user wants leaks or character release date is before now -->
				{#if $settings.includeUnreleaseCharacters || character.releaseDate.getTime() < new Date().getTime()}
					<CharacterToggle {character} />
				{/if}
			{/each}
		{/await}
	</div>
</section>
