<script lang="ts">
	import RelicInput from '../components/RelicInput.svelte';
	import type { Relic } from '$lib/types';
	import CharacterList from '../components/CharacterList.svelte';
	import { Card, Spinner } from 'flowbite-svelte';
	import Icon from '@iconify/svelte';
	import RelicStats from '../components/RelicStats.svelte';
	import Error from './+error.svelte';

	let loading = false;
	let relic: Relic | undefined;
</script>

<div class="grid w-full gap-4 md:h-[var(--main-height)] md:grid-cols-2 xl:grid-cols-3">
	<RelicInput bind:loading bind:data={relic} />
	{#if !relic || loading}
		<Card class="flex max-w-full items-center justify-center text-gray-400 xl:col-span-2">
			{#if !relic && !loading}
				<p class="inline-flex items-center gap-3">
					<Icon icon="lucide:search-x" width={24} height={24} />
					<span>No relics detected</span>
				</p>
			{:else}
				<div class="flex items-center gap-4 truncate p-1">
					<Spinner class="h-8 w-8" />
					<span>Analyzing image data...</span>
				</div>
			{/if}
		</Card>
	{:else}
		<RelicStats data={relic} />
		<Card
			class="mb-8 hidden h-full min-w-full overflow-y-auto scrollbar-thin xl:mb-0 xl:block xl:h-[var(--main-height)]"
		>
			<CharacterList characters={relic?.characters} />
		</Card>
	{/if}
</div>
