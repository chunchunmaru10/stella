<script lang="ts">
	import { Button, Card, Fileupload, Spinner } from 'flowbite-svelte';
	import Listbox from '../components/common/Listbox.svelte';
	import { toast } from '$lib/stores/toast';
	import type { BatchImportOption, Relic, RelicData } from '$lib/types';
	import Icon from '@iconify/svelte';

	let importMode: BatchImportOption = 'Stella';
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

		const rateRelicsResponse = await fetch('/api/rateRelics', {
			method: 'POST',
			body: JSON.stringify({
				importType: importMode,
				jsonData: rawJson
			})
		});

		if (rateRelicsResponse.ok) {
			batchRelics = await rateRelicsResponse.json();
			toast.success(`${batchRelics.length} matches found`, 5000);
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
						value: 'Stella'
					},
					{
						name: 'HSR Scanner',
						value: 'HSR Scanner'
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
