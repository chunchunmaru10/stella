<script lang="ts">
	import { onMount } from 'svelte';

	onMount(() => {
		document.addEventListener('paste', onPaste);

		return () => {
			document.removeEventListener('paste', onPaste);
		};
	});

	let imagePreview = '';

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
			const response = await fetch('/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(imageData)
			});

			if (response.ok) {
				const result = await response.json();
				console.log(result);
			} else {
				const result = await response.text();
				alert(result);
			}
		};

		reader.readAsDataURL(blob);
	}
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
{#if imagePreview}
	<img src={imagePreview} alt="preview" />
{/if}
