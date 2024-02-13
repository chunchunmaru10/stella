<script lang="ts">
	import type { Relic } from '$lib/types';
	import Icon from '@iconify/svelte';
	import { Dropzone } from 'flowbite-svelte';
	import { onMount } from 'svelte';

	onMount(() => {
		document.addEventListener('paste', onPaste);

		return () => {
			document.removeEventListener('paste', onPaste);
		};
	});

	let imagePreview = '';
	export let loading;
	export let data: Relic | undefined;

	async function onPaste(e: ClipboardEvent) {
		const items = e.clipboardData?.items;

		if (!items || items.length === 0 || items[0].type.indexOf('image') === -1) return;

		const blob = items[0].getAsFile();

		if (!blob) return;

		const reader = new FileReader();

		reader.onload = async function (e) {
			if (!e.target?.result) return;

			const imageData = e.target.result;
			imagePreview = imageData.toString();

			loading = true;

			const response = await fetch('/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(imageData)
			});

			if (response.ok) {
				data = await response.json();
			} else {
				const result = await response.text();
				alert(result);
			}

			loading = false;
		};

		reader.readAsDataURL(blob);
	}
</script>

<div class="flex w-full items-center md:h-[calc(100svh-7rem-2rem)] md:max-h-full">
	{#if imagePreview}
		<img
			class="mx-auto w-full align-middle md:max-h-full md:w-auto md:object-scale-down"
			src={imagePreview}
			alt="preview"
		/>
	{:else}
		<Dropzone class="md:h-full">
			<div class="flex h-full w-full flex-col items-center justify-center">
				<Icon class="mb-2 text-gray-400" icon="fa6-solid:upload" width={32} height={32} />
				<p class="text-gray-400">Upload or Paste Image Here</p>
			</div>
		</Dropzone>
	{/if}
</div>
