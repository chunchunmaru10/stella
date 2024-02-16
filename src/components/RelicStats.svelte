<script lang="ts">
	import { mediaQuery } from '$lib/stores/mediaQuery';
	import type { Relic } from '$lib/types';
	import Icon from '@iconify/svelte';
	import { Button, Card } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { createDialog } from 'svelte-headlessui';
	import Modal from './common/Modal.svelte';
	import CharacterList from './CharacterList.svelte';

	export let data: Relic;

	const mq = mediaQuery('(min-width: 1280px)');

	let dialog: ReturnType<typeof createDialog>;

	onMount(() => {
		if (!$mq) dialog?.open();
	});

	$: if ($mq) dialog?.close();
</script>

<Card class="my-auto flex h-full min-w-0 max-w-full flex-col justify-between">
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
	<div>
		<Modal bind:dialog>
			<Button class="mt-6 w-full xl:hidden" slot="button" on:click={dialog.open}>
				<Icon icon="fa6-solid:chart-bar" class="mr-2" />
				<span>Details</span>
			</Button>
			<CharacterList />
		</Modal>
	</div>
</Card>
