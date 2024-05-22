<script lang="ts">
	import { A, Button, Card, Fileupload, Spinner } from 'flowbite-svelte';
	import Listbox from '../components/common/Listbox.svelte';
	import { toast } from '$lib/stores/toast';
	import { BatchRelicSchema, HsrScannerJsonSchema } from '$lib/schemas';
	import type { Relic, RelicData } from '$lib/types';
	import Icon from '@iconify/svelte';

	let importMode: 'stella' | 'hsrScanner' = 'stella';
	let files: FileList | undefined = undefined;
	let loading = false;

	export let batchRelics: Relic[] = [];

	async function submitImport() {
		if (!files || !files.length) {
			toast.error('No files uploaded');
			return;
		}

		loading = true;

		const rawJson = JSON.parse(await files[0].text());
		let relicData: RelicData[] = [];

		if (importMode === 'stella') {
			const result = BatchRelicSchema.safeParse(rawJson);

			if (!result.success) {
				toast.error('An error occured while parsing the data. The JSON format may be incorrect.');
				loading = false;
				return;
			}

			for (const relic of result.data) {
				relicData.push({
					set: relic.setName,
					...relic
				});
			}
		} else if (importMode === 'hsrScanner') {
			const result = HsrScannerJsonSchema.safeParse(rawJson);
			if (!result.success) {
				toast.error('An error occured while parsing the data. The JSON format may be incorrect.');
				loading = false;
				return;
			}

			for (const relic of result.data.relics) {
				// format main stat
				if (relic.mainstat.match(/(HP|ATK|DEF)/) && !relic.slot.match(/(Head|Hands)/)) {
					// if main stat is HP, ATK or DEF, and is not head or hands, append % to the end
					relic.mainstat += '%';
				}

				const subStats = relic.substats.map((substat) => {
					let res = substat.key;

					// if ends with a _, check if need to replace it with % (needed to differentiate ATK from ATK% and etc)
					// otherwise can remove for stats like CRIT Rate where the % is always there
					if (res.endsWith('_')) {
						if (res.match(/(HP|ATK|DEF)/)) return res.replace('_', '%');
						else return res.replace('_', '');
					}

					return res;
				});

				relicData.push({
					set: relic.set,
					mainStat: relic.mainstat,
					subStats,
					type: relic.slot
				});
			}
		}

		if (!relicData.length) {
			toast.error('No relic data detected');
			loading = false;
			return;
		}

		const rateRelicsResponse = await fetch('/api/rateRelics', {
			method: 'POST',
			body: JSON.stringify(relicData)
		});

		if (rateRelicsResponse.ok) {
			batchRelics = await rateRelicsResponse.json();
			toast.success(`${batchRelics.length}/${relicData.length} matches found`);
		} else {
			const result = await rateRelicsResponse.text();
			toast.error(result);
		}

		loading = false;
	}
</script>

<div class="flex h-full w-full items-center justify-center">
	<Card>
		<form class="text-white" on:submit|preventDefault={submitImport}>
			<h2 class="relative text-center text-xl font-bold">
				Batch Import
				<a
					class="absolute right-0 top-1/2 -translate-y-1/2 text-sm hover:underline"
					href="/info#batchImport"
				>
					<Icon icon="fa-solid:question-circle" />
				</a>
			</h2>
			<div class="h-4" />
			<span class="font-semibold">Source</span>
			<Listbox
				options={[
					{
						name: 'Stella',
						value: 'stella'
					},
					{
						name: 'HSR Scanner',
						value: 'hsrScanner'
					}
				]}
				bind:value={importMode}
				className="min-w-full"
				itemListClassName="min-w-full"
			/>
			<div class="my-4">
				<span class="font-semibold">File</span>
				<div class="mt-2">
					<Fileupload bind:files id="jsonFile" accept="application/JSON" />
				</div>
			</div>
			<Button type="submit" class="mt-6 w-full" disabled={loading}>
				{#if loading}
					<Spinner size={5} />
				{:else}
					Import
				{/if}
			</Button>
		</form>
	</Card>
</div>
