<script lang="ts">
	import { Button } from 'flowbite-svelte';
	import Modal from './common/Modal.svelte';
	import Icon from '@iconify/svelte';
	import type { SortOption } from '$lib/types';

	export let allSortOptions: SortOption[];
	export let selectedSortOptions: SortOption[];
	export let sortOrder: 'asc' | 'desc';

	function selectSort(option: SortOption) {
		const index = selectedSortOptions.findIndex((s) => s === option);

		if (index !== -1) {
			selectedSortOptions.splice(index, 1);
		} else {
			selectedSortOptions.push(option);
		}

		selectedSortOptions = selectedSortOptions;
	}
</script>

<div class="mt-6 flex items-center gap-4">
	<h3 class="text-lg font-semibold">Sort</h3>
	<div class="h-[1px] flex-grow rounded-full bg-primary-500 opacity-50" />
</div>
<Modal let:dialog>
	<div slot="button" let:dialog>
		<div class="flex justify-between gap-4">
			<button
				class={`my-2 flex flex-grow items-center justify-between rounded-md border-2 border-gray-700 p-2 hover:border-gray-500 ${sortOrder === 'asc' ? 'bg-gray-100 bg-opacity-10' : ''}`}
				on:click={() => (sortOrder = 'asc')}
			>
				<Icon icon="fa-solid:sort-amount-up" />
				Ascending
			</button>
			<button
				class={`my-2 flex flex-grow items-center justify-between rounded-md border-2 border-gray-700 p-2 hover:border-gray-500 ${
					sortOrder === 'desc' ? 'bg-gray-100 bg-opacity-10' : ''
				}`}
				on:click={() => (sortOrder = 'desc')}
			>
				<Icon icon="fa-solid:sort-amount-down" />
				Descending
			</button>
		</div>
		<Button on:click={() => dialog.open()} class="mt-3 w-full py-2">Select</Button>
		{#each selectedSortOptions as option}
			<button
				class="my-2 flex w-full items-center justify-between rounded-md border-2 border-gray-700 p-2 hover:border-gray-500"
				on:click={() => selectSort(option)}
			>
				<div class="flex items-center gap-2 text-left">
					{option}
				</div>
				<Icon icon="mingcute:close-fill" class="text-red-400" />
			</button>
		{/each}
	</div>
	<div class="max-h-full">
		<ul class="grid max-h-full grid-cols-1 gap-2 overflow-y-auto px-2 scrollbar-thin">
			{#each allSortOptions as sortOption}
				{@const order = selectedSortOptions.findIndex((s) => s === sortOption)}
				<li class="w-full">
					<button
						class="flex w-full items-center gap-2 rounded-md border-2 border-gray-700 bg-gray-700 p-2 text-left hover:border-gray-600"
						on:click={() => {
							selectSort(sortOption);
						}}
					>
						<div
							class={`mx-1 flex h-5 w-5 items-center justify-center rounded-full border border-gray-600 text-xs ${order !== -1 ? 'bg-primary-600' : ''}`}
						>
							{#if order !== -1}
								{order + 1}
							{:else}
								<span />
							{/if}
						</div>
						<span class="mr-2">
							{sortOption}
						</span>
					</button>
				</li>
			{/each}
		</ul>
		<div class="mt-4 flex gap-2">
			<Button
				class="w-1/2 p-2 dark:bg-red-500 dark:hover:bg-red-500 dark:hover:opacity-90"
				on:click={() => {
					selectedSortOptions = [];
				}}
			>
				Clear All
			</Button>
			<Button class="w-1/2 p-2" on:click={() => dialog.close()}>OK</Button>
		</div>
	</div>
</Modal>
