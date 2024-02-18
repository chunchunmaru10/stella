<script lang="ts">
	import { getContext } from 'svelte';
	import type { CharacterData } from '$lib/types';

	// data stuff
	const data = getContext<Promise<CharacterData[]>>('characters');
</script>

<section class="max-h-full w-full">
	{#await data then characters}
		{#each characters as character}
			{character.name}
		{/each}
	{/await}
</section>
