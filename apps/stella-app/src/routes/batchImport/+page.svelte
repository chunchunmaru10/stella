<script lang="ts">
	import { browser } from '$app/environment';
	import { camelize, getUsableCharactersFromRelic } from '$lib';
	import { BatchRelicSchema } from '$lib/schemas';
	import { settings } from '$lib/stores/settings';
	import { toast } from '$lib/stores/toast';
	import type { Relic, Settings } from '$lib/types';
	import Icon from '@iconify/svelte';
	import { Hr, Spinner } from 'flowbite-svelte';
	import lz from 'lz-string';
	import { onMount } from 'svelte';
	import type { createDialog } from 'svelte-headlessui';
	import { writable } from 'svelte/store';
	import BatchImportForm from '../../components/BatchImportForm.svelte';
	import CharacterList from '../../components/CharacterList.svelte';
	import FilterDrawer from '../../components/FilterDrawer.svelte';
	import RelicItem from '../../components/RelicItem.svelte';
	import RelicStats from '../../components/RelicStats.svelte';
	import Dropdown from '../../components/common/Dropdown.svelte';
	import Modal from '../../components/common/Modal.svelte';

	export let data;
	let batchRelics: Relic[] = [];
	const activeRelic = writable<Relic | undefined>(undefined);
	// let activeRelic: Relic | undefined;
	let loading = true;
	let dialog: ReturnType<typeof createDialog>;
	let filterDrawerHidden = true;

	const filteredBatchRelics = writable(mapBatchRelicWithCharacter(batchRelics, $settings));

	const { relicSets, relicStats, relicTypes } = data;

	$: {
		if (batchRelics.length && browser) {
			loading = true;
			compress(JSON.stringify(batchRelics))
				.then((output) => {
					localStorage.setItem('batchRelics', output);
				})
				.catch(() => {
					toast.info(
						'Too many relics, unable to store in browser storage. You may export to save the data instead.',
						4000
					);
				})
				.finally(() => (loading = false));
		}
	}

	$: {
		filteredBatchRelics.set(mapBatchRelicWithCharacter(batchRelics, $settings));
	}

	$: {
		console.trace(activeRelic);
	}

	onMount(() => {
		loading = true;
		const localStorageItem = localStorage.getItem('batchRelics');
		decompress(localStorageItem ?? '')
			.then((output) => {
				const res = BatchRelicSchema.safeParse(output);
				if (res.success) {
					batchRelics = res.data;
				} else {
					localStorage.removeItem('batchRelics');
				}
			})
			.finally(() => (loading = false));
	});

	async function compress(input: string): Promise<string> {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				try {
					const result = lz.compress(input);
					resolve(result);
				} catch (error) {
					reject(error);
				}
			}, 0); // Use 0ms timeout to simulate asynchronous behavior
		});
	}

	async function decompress(input: string): Promise<string> {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				try {
					const result = lz.decompress(input);
					resolve(result);
				} catch (error) {
					reject(error);
				}
			}, 0); // Use 0ms timeout to simulate asynchronous behavior
		});
	}

	function mapBatchRelicWithCharacter(batchRelic: Relic[], settings: Settings) {
		return batchRelic.map((r) => getUsableCharactersFromRelic(r, settings));
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
			{#if $activeRelic}
				<div class="max-w-full md:w-full lg:mr-96 lg:w-96">
					<RelicStats data={$activeRelic} />
				</div>
				<Hr hrClass="lg:hidden border-primary-500 bg-primary-500" />
				<div class="hidden w-4 lg:block" />
				<div
					class="scrollbar-thin right-0 top-0 h-full max-h-full w-full max-w-full overflow-y-auto py-2 pr-2 lg:absolute lg:w-96"
				>
					<CharacterList characters={$activeRelic.characters} />
				</div>
			{/if}
		</div>
	</Modal>
	<FilterDrawer
		bind:hidden={filterDrawerHidden}
		filterData={{ relicSets, relicStats, relicTypes }}
		restoreFilteredData={() =>
			($filteredBatchRelics = mapBatchRelicWithCharacter(batchRelics, $settings))}
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
			<RelicItem {relic} {dialog} {activeRelic} />
		{/each}
	</div>
{:else}
	<BatchImportForm bind:batchRelics />
{/if}
