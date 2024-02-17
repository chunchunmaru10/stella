<script lang="ts">
	import { settings } from '$lib/stores/settings';
	import type { CharacterData } from '$lib/types';
	import { getContext } from 'svelte';

	const data = getContext<Promise<CharacterData[]>>('characters');
</script>

<h2 class="text-xl font-bold">Settings</h2>
{#await data}
	<p>Loading</p>
{:then characters}
	{#each characters as character}
		{character.name}
	{/each}
{/await}
