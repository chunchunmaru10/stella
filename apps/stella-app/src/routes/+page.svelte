<script lang="ts">
	import RelicInput from '../components/RelicInput.svelte';
	import type { Relic } from '$lib/types';
	import CharacterList from '../components/CharacterList.svelte';
	import { Button, Card, Spinner } from 'flowbite-svelte';
	import Icon from '@iconify/svelte';
	import RelicStats from '../components/RelicStats.svelte';
	import Modal from '../components/common/Modal.svelte';
	import type { createDialog } from 'svelte-headlessui';
	import { onMount } from 'svelte';
	import { mediaQuery } from '$lib/stores/mediaQuery';

	let loading = false;
	let dialog: ReturnType<typeof createDialog> | undefined;
	let relic: Relic | undefined;

	const mq = mediaQuery('(min-width: 1280px)');

	onMount(() => {
		if (!$mq) dialog?.open();
	});

	$: {
		if ($mq) dialog?.close();
		else dialog?.open();
	}
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
		<Card
			class="scrollbar-thin my-auto flex h-full max-h-full min-w-0 max-w-full flex-col justify-between overflow-y-auto"
		>
			<RelicStats data={relic} />
			<div>
				<Modal bind:dialog>
					<Button class="mt-6 w-full xl:hidden" slot="button" on:click={dialog?.open}>
						<Icon icon="fa6-solid:chart-bar" class="mr-2" />
						<span>Details</span>
					</Button>
					<CharacterList characters={relic.characters} />
				</Modal>
			</div>
		</Card>
		<Card
			class="scrollbar-thin mb-8 hidden h-full min-w-full overflow-y-auto xl:mb-0 xl:block xl:h-[var(--main-height)]"
		>
			<CharacterList characters={relic.characters} />
		</Card>
	{/if}
</div>
