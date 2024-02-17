<script lang="ts">
	import type { CharacterRelicValue } from '$lib/types';

	export let characters: CharacterRelicValue[] | undefined;
</script>

<div class="h-fit w-full">
	Character List

	{#if characters}
		<ul>
			{#each characters as character}
				<img src={character.thumbnail} alt={character.name} />
				<p>{character.name}</p>
			{/each}
		</ul>
	{/if}
</div>
