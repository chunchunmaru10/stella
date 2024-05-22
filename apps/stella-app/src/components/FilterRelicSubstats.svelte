<script lang="ts">
	import { Button, Checkbox } from 'flowbite-svelte';
	import Modal from './common/Modal.svelte';
	import Icon from '@iconify/svelte';

	export let substats: Map<string, string>;
	export let selectedSubstats: Map<string, string>;

	function selectSubstat([name, image]: [string, string]) {
		let existing = selectedSubstats.get(name);

		if (!existing) selectedSubstats.set(name, image);
		else selectedSubstats.delete(name);

		selectedSubstats = selectedSubstats;
	}
</script>

<div class="mt-6 flex items-center gap-4">
	<h3 class="text-lg font-semibold">Substats</h3>
	<div class="h-[1px] flex-grow rounded-full bg-primary-500 opacity-50" />
</div>
<Modal let:dialog>
	<div slot="button" let:dialog>
		<Button on:click={() => dialog.open()} class="mt-3 w-full py-2">Select</Button>
		{#each selectedSubstats.entries() as [name, image]}
			<button
				class="my-2 flex w-full items-center justify-between rounded-md border-2 border-gray-700 p-2 hover:border-gray-500"
				on:click={() => selectSubstat([name, image])}
			>
				<div class="flex items-center gap-2 text-left">
					<img src={image} alt={name} width="28" height="28" />
					{name}
				</div>
				<Icon icon="mingcute:close-fill" class="text-red-400" />
			</button>
		{/each}
	</div>
	<div class="max-h-full">
		<ul
			class="grid h-[500px] max-h-full grid-cols-1 gap-2 overflow-y-auto px-2 scrollbar-thin md:h-auto md:grid-cols-2"
		>
			{#each substats as [name, image]}
				<li class="w-full">
					<button
						class="flex h-full w-full items-center gap-2 rounded-md border-2 border-gray-700 bg-gray-700 p-1 text-left hover:border-gray-600"
						on:click={() => selectSubstat([name, image])}
					>
						<Checkbox disabled checked={!!selectedSubstats.get(name)} class="ml-2" />
						<img src={image} alt={name} width="28" height="28" class="aspect-square h-7 w-7" />
						<span class="mr-2">
							{name}
						</span>
					</button>
				</li>
			{/each}
		</ul>
		<div class="mt-4 flex gap-2">
			<Button
				class="w-1/2 p-2 dark:bg-red-500 dark:hover:bg-red-500 dark:hover:opacity-90"
				on:click={() => {
					selectedSubstats.clear();
					selectedSubstats = selectedSubstats;
				}}
			>
				Clear All
			</Button>
			<Button class="w-1/2 p-2" on:click={() => dialog.close()}>OK</Button>
		</div>
	</div>
</Modal>
