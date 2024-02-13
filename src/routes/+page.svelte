<script lang="ts">
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
	let loading = false;
	let data = 'Data';

	async function onPaste(e: ClipboardEvent) {
		data = '';
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
				const result = await response.json();
				data = JSON.stringify(result);
			} else {
				const result = await response.text();
				alert(result);
			}

			loading = false;
		};

		reader.readAsDataURL(blob);
	}
</script>

<div class="grid w-full gap-4 px-8 md:h-full md:grid-cols-2 xl:grid-cols-3">
	<div class="md:h-full">
		{#if imagePreview}
			<img class="mx-auto h-full object-scale-down align-middle" src={imagePreview} alt="preview" />
		{:else}
			<Dropzone class="md:h-full">
				<div class="flex h-full w-full flex-col items-center justify-center">
					<Icon class="mb-2 text-gray-400" icon="fa6-solid:upload" width={32} height={32} />
					<p class="text-gray-400">Upload or Paste Image Here</p>
				</div>
			</Dropzone>
		{/if}
	</div>
	<div class="h-auto max-w-full bg-blue-500">
		{#if loading}
			<p>Loading</p>
		{:else}
			<p class="max-w-full break-all">
				{data}
			</p>
		{/if}
	</div>
	<div class="mb-8 hidden bg-green-500 xl:col-span-1 xl:mb-0 xl:block">Characters</div>
</div>
