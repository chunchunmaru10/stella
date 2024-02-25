<script lang="ts">
	import { getContext } from 'svelte';
	import type { CharacterData } from '$lib/types';
	import CharacterToggle from './CharacterToggle.svelte';
	import { settings } from '$lib/stores/settings';

	// data stuff
	const data = getContext<Promise<CharacterData[]>>('characters');
</script>

<section class="max-h-full w-full">
	<h2 class="my-4 text-xl font-semibold">Included Characters</h2>
	<div class="flex flex-wrap gap-4 pb-4">
		{#await data then characters}
			{#each characters as character}
				<!-- only render if user wants leaks or character release date is before now -->
				{#if $settings.includeUnreleaseCharacters || character.releaseDate.getTime() < new Date().getTime()}
					<CharacterToggle {character} />
				{/if}
			{/each}
		{/await}
	</div>
</section>
