<script lang="ts">
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

<div class="grid gap-4 px-8 md:grid-cols-2 xl:h-full xl:grid-cols-3">
	<div class="bg-red-500 xl:h-full">
		{#if imagePreview}
			<img src={imagePreview} alt="preview" />
		{:else}
			<div>Paste image here</div>
		{/if}
	</div>
	<div class="bg-blue-500">
		{#if loading}
			<p>Loading</p>
		{:else}
			<p>{data}</p>
		{/if}
	</div>
	<div class="mb-8 bg-green-500 md:col-span-2 xl:col-span-1 xl:mb-0">Characters</div>
</div>
