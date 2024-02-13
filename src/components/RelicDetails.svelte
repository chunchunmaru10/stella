<script lang="ts">
	import type { Relic } from '$lib/types';
	import { Button, Card } from 'flowbite-svelte';
	import Modal from './common/Modal.svelte';
	import Icon from '@iconify/svelte';

	export let loading: boolean;
	export let data: Relic | undefined;
</script>

{#if loading}
	<Card class="flex max-w-full items-center justify-center text-gray-400">
		<p>Loading</p>
	</Card>
{:else if !data}
	<Card class="flex max-w-full items-center justify-center text-gray-400">
		<p class="">No relic detected</p>
	</Card>
{:else}
	<Card class="my-auto h-fit min-w-0 max-w-full">
		<div class="font-[DIN]">
			<h2 class="w-full min-w-0 truncate text-2xl text-gold-light">
				{data.relicName}
			</h2>
			<div class="mt-1 h-1 min-w-full rounded-full bg-gold-light" />
			<div
				class="mt-4 flex aspect-[21/9] w-full items-end rounded-md bg-gradient-to-br from-gold-dark to-gold-light p-4"
			>
				<h3 class="text-2xl text-white/80">{data.type}</h3>
				<div class="relative h-full max-h-full w-full">
					<img
						src={data.image}
						alt={data.relicName}
						class="absolute right-0 top-0 max-h-full object-scale-down"
					/>
				</div>
			</div>
			<h3 class="mb-1 mt-6 rounded-md bg-white/20 p-2 py-1 text-2xl text-gold-medium">
				{data.mainStat}
			</h3>
			{#each data.subStats as subStat, i}
				<h3
					class={`rounded-md text-white/80 ${i % 2 === 0 ? 'bg-gray-900/50' : ''} p-2 py-1 text-2xl`}
				>
					{subStat}
				</h3>
			{/each}
			<h3 class="mt-4 truncate text-2xl text-gold-medium">
				{data.setName}
			</h3>
		</div>
		<Modal>
			<Button class="mt-6 xl:hidden" slot="button" let:dialog on:click={dialog.open}>
				<Icon icon="fa6-solid:chart-bar" class="mr-2" />
				<span>Details</span>
			</Button>
			<div>Hello</div>
		</Modal>
	</Card>
{/if}
