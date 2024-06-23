<script lang="ts">
	import type { Relic } from '$lib/types';
	import { onMount } from 'svelte';
	import BatchImportForm from '../../components/BatchImportForm.svelte';
	import { Hr, Spinner } from 'flowbite-svelte';
	import { BatchRelicSchema } from '$lib/schemas';
	import { browser } from '$app/environment';
	import RelicItem from '../../components/RelicItem.svelte';
	import Modal from '../../components/common/Modal.svelte';
	import type { createDialog } from 'svelte-headlessui';
	import RelicStats from '../../components/RelicStats.svelte';
	import CharacterList from '../../components/CharacterList.svelte';
	import Dropdown from '../../components/common/Dropdown.svelte';
	import Icon from '@iconify/svelte';
	import { camelize, getUsableCharactersFromRelic } from '$lib';
	import FilterDrawer from '../../components/FilterDrawer.svelte';
	import { writable } from 'svelte/store';
	import { settings } from '$lib/stores/settings';
	import { toast } from '$lib/stores/toast';
	import lz from 'lz-string';

	export let data;
	let batchRelics: Relic[] = [];
	let activeRelic: Relic | undefined;
	let loading = true;
	let dialog: ReturnType<typeof createDialog>;
	let filterDrawerHidden = true;

	const filteredBatchRelics = writable(mapBatchRelicWithCharacter(batchRelics));

	const { relicSets, relicStats, relicTypes } = data;

	$: {
		if (batchRelics.length && browser) {
			loading = true;
			try {
				const compressed = lz.compress(JSON.stringify(batchRelics));
				localStorage.setItem('batchRelics', compressed);
			} catch (e) {
				toast.info(
					'Too many relics, unable to store in browser storage. You may export to save the data instead.',
					4000
				);
			}
			loading = false;
		}
	}

	$: {
		filteredBatchRelics.set(mapBatchRelicWithCharacter(batchRelics));
	}

	onMount(() => {
		const localStorageItem = localStorage.getItem('batchRelics');
		const rawJson = localStorageItem !== null ? JSON.parse(lz.decompress(localStorageItem)) : null;

		const res = BatchRelicSchema.safeParse(rawJson);
		if (res.success) {
			batchRelics = res.data;
		} else {
			localStorage.removeItem('batchRelics');
		}

		loading = false;
	});

	function mapBatchRelicWithCharacter(batchRelic: Relic[]) {
		return batchRelic.map((r) => getUsableCharactersFromRelic(r, $settings));
	}

	function onDropdownSelect(selected: string) {
		switch (camelize(selected)) {
			case 'export':
				exportRelicData();
				break;
			case 'clearImportedData':
				clearImportedData();
				break;
			case 'filter':
				filterDrawerHidden = false;
				break;
		}
	}

	function exportRelicData() {
		const a = document.createElement('a');
		a.href = URL.createObjectURL(
			new Blob([JSON.stringify(batchRelics, null, '\t')], {
				type: 'text/plain'
			})
		);
		a.setAttribute('download', 'stella-export.json');
		document.body.appendChild(a);

		a.click();

		URL.revokeObjectURL(a.href);
		document.body.removeChild(a);
	}

	function clearImportedData() {
		batchRelics = [];
		localStorage.removeItem('batchRelics');
	}
</script>

{#if loading}
	<div class="flex h-full w-full items-center justify-center">
		<Spinner class="h-8 w-8" />
	</div>
{:else if batchRelics.length}
	<Modal bind:dialog>
		<div class="relative flex h-full max-h-full w-full flex-col gap-4 lg:flex-row">
			{#if activeRelic}
				<div class="max-w-full md:w-full lg:mr-96 lg:w-96">
					<RelicStats data={activeRelic} />
				</div>
				<Hr hrClass="lg:hidden border-primary-500 bg-primary-500" />
				<div class="hidden w-4 lg:block" />
				<div
					class="scrollbar-thin right-0 top-0 h-full max-h-full w-full max-w-full overflow-y-auto py-2 pr-2 lg:absolute lg:w-96"
				>
					<CharacterList characters={activeRelic.characters} />
				</div>
			{/if}
		</div>
	</Modal>
	<FilterDrawer
		bind:hidden={filterDrawerHidden}
		filterData={{ relicSets, relicStats, relicTypes }}
		restoreFilteredData={() => ($filteredBatchRelics = mapBatchRelicWithCharacter(batchRelics))}
		{filteredBatchRelics}
	/>
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-3xl font-bold">Batch Import</h1>
		<div class="">
			<Dropdown options={['Export', 'Clear Imported Data', 'Filter']} onSelect={onDropdownSelect}>
				<Icon icon="fluent:options-16-filled" class="h-4 w-4" slot="button" />
			</Dropdown>
		</div>
	</div>
	<div class="grid w-full grid-cols-[repeat(auto-fill,minmax(5rem,1fr))] gap-4 pb-4">
		{#each $filteredBatchRelics as relic}
			<RelicItem {relic} {dialog} bind:activeRelic />
		{/each}
	</div>
{:else}
	<BatchImportForm bind:batchRelics />
{/if}
