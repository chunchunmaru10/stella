<script lang="ts">
	import type { Relic } from '$lib/types';
	import { Card, Spinner } from 'flowbite-svelte';
	import Icon from '@iconify/svelte';
	import RelicStats from './RelicStats.svelte';

	export let loading: boolean;
	export let data: Relic | undefined;
</script>

{#if loading}
	<Card class="flex max-w-full items-center justify-center text-gray-400">
		<div class="flex items-center gap-4 truncate p-1">
			<Spinner class="h-8 w-8" />
			<span>Analyzing image data...</span>
		</div>
	</Card>
{:else if !data}
	<Card class="flex max-w-full items-center justify-center text-gray-400">
		<p class="inline-flex items-center gap-3">
			<Icon icon="lucide:search-x" width={24} height={24} />
			<span>No relics detected</span>
		</p>
	</Card>
{:else}
	<RelicStats {data} />
{/if}
