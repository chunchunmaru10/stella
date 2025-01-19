<script lang="ts">
	import '../app.css';
	import Nav from '../components/Nav.svelte';
	import Toaster from '../components/Toaster.svelte';
	import { readable } from 'svelte/store';
	import { onMount, setContext } from 'svelte';
	import { dev } from '$app/environment';
	import { inject } from '@vercel/analytics';
	import type { Character } from '.prisma/client';
	import { Banner, Checkbox } from 'flowbite-svelte';
	import { settings } from '$lib/stores/settings';

	export let data;
	let displayAnnouncement = false;

	inject({ mode: dev ? 'development' : 'production' });

	const characters = readable<Promise<Character[]>>(data.characters);
	$: setContext('characters', $characters);

	onMount(() => {
		if (
			data.announcement &&
			($settings.announcement !== data.announcement.message || !$settings.doNotShowAnnouncement)
		) {
			$settings.announcement = data.announcement.message;
			displayAnnouncement = true;
		}
	});

	function handleCheckboxChange(e: Event) {
		const checked = (<HTMLInputElement>e.target).checked;
		settings.update((prev) => ({
			...prev,
			announcement: data.announcement?.message ?? '',
			doNotShowAnnouncement: checked
		}));
	}
</script>

<svelte:head>
	<title>Stella</title>
</svelte:head>
{#if displayAnnouncement && data.announcement?.message}
	<Banner position="absolute" innerClass="w-full flex">
		<div class="mx-4 flex w-full flex-col items-start justify-between md:flex-row md:items-center">
			<p>
				{data.announcement.message}
			</p>
			<div class="mt-4 min-w-fit md:mt-0">
				<Checkbox checked={$settings.doNotShowAnnouncement} on:change={handleCheckboxChange}>
					Don't show this again
				</Checkbox>
			</div>
		</div>
	</Banner>
{/if}
<Toaster />
<Nav />
<main class="px-8 pb-8 md:h-[var(--main-height)]">
	<slot />
</main>
