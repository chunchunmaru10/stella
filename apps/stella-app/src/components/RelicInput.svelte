<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { settings } from '$lib/stores/settings';
	import { toast } from '$lib/stores/toast';
	import type { Relic } from '$lib/types';
	import Icon from '@iconify/svelte';
	import { Dropzone } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { createWorker } from 'tesseract.js';

	onMount(() => {
		document.addEventListener('paste', onPaste);

		return () => {
			document.removeEventListener('paste', onPaste);
		};
	});

	let imagePreview = '';
	let imageElement: HTMLImageElement;
	export let loading;
	export let data: Relic | undefined = undefined;

	// prevent image overflow from input
	$: imageElement?.parentElement?.classList.add('max-h-[95%]');

	async function onPaste(e: ClipboardEvent) {
		const items = e.clipboardData?.items;

		if (!items || items.length === 0 || items[0].type.indexOf('image') === -1) return;

		const file = items[0].getAsFile();

		await sendImageToServer(file);
	}

	async function onDrop(e: DragEvent) {
		e.preventDefault();
		if (!e.dataTransfer) return;
		if (e.dataTransfer.items) {
			if (!e.dataTransfer.items.length) return;

			const item = e.dataTransfer.items[0];

			if (item.kind !== 'file') return;

			const file = item.getAsFile();

			await sendImageToServer(file);
		} else {
			if (!e.dataTransfer.files.length) return;

			await sendImageToServer(e.dataTransfer.files[0]);
		}
	}

	async function onChange(e: Event) {
		if (!e.target) return;

		let file = (e.target as HTMLInputElement).files?.[0];

		await sendImageToServer(file ?? null);
	}

	async function sendImageToServer(file: File | null) {
		if (!file) return;

		const validFormats = ['image/png', 'image/jpeg', 'image/webp'];
		if (!validFormats.includes(file.type)) {
			toast.error('This file type is not supported');
			return;
		}

		const reader = new FileReader();

		reader.onload = async function (e) {
			try {
				if (!e.target?.result) return;

				const imageData = e.target.result;
				imagePreview = imageData.toString();
				let processedImagePreview = imagePreview;

				loading = true;

				if (env.PUBLIC_ENABLE_SHARP === 'true') {
					const processImageResponse = await fetch('/api/processImage', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify(imageData)
					});
					const processImageResult = await processImageResponse.text();

					if (!processImageResponse.ok) {
						toast.error(processImageResult);
						data = undefined;
						loading = false;
						return;
					}

					processedImagePreview = `data:${file.type};base64,${processImageResult}`;
				}

				const worker = await createWorker();
				const ret = await worker.recognize(processedImagePreview);
				await worker.terminate();

				let rawString = ret.data.text;

				const rateRelicResponse = await fetch('/api/rateRelic', {
					method: 'POST',
					body: JSON.stringify({
						rawString,
						excludedCharacters: $settings.excludedCharacters
					})
				});

				if (rateRelicResponse.ok) {
					data = await rateRelicResponse.json();
				} else {
					const result = await rateRelicResponse.text();
					toast.error(result);
					data = undefined;
				}

				loading = false;
			} catch {
				toast.error('An error occurred while recognizing the image..');
				loading = false;
			}
		};

		reader.readAsDataURL(file);
	}
</script>

<div class="flex w-full items-center md:h-[var(--main-height)] md:max-h-full">
	<button
		on:click={(e) => {
			e.preventDefault();
			document.getElementById('dropzone')?.click();
		}}
		class="h-full w-full"
	>
		<Dropzone
			id="dropzone"
			class={`min-w-full md:h-full`}
			on:drop={onDrop}
			on:dragover={(e) => {
				e.preventDefault();
			}}
			on:change={onChange}
			on:click={(e) => e.stopPropagation()}
		>
			{#if imagePreview}
				<img
					class="max-h-full min-w-full px-3 align-middle md:w-auto md:object-scale-down"
					src={imagePreview}
					alt="preview"
					bind:this={imageElement}
				/>
			{:else}
				<Icon class="mb-2 text-gray-400" icon="fa6-solid:upload" width={32} height={32} />
				<p class="text-gray-400">Upload or Paste Image Here</p>
			{/if}
		</Dropzone>
	</button>
</div>
