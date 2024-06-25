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
	import { AnnouncementSchema } from '$lib/schemas';

	export let data;
	let displayAnnouncement = false;
	let doNotShow: boolean;

	inject({ mode: dev ? 'development' : 'production' });

	const characters = readable<Promise<Character[]>>(data.characters);
	$: setContext('characters', $characters);

	onMount(() => {
		try {
			const announcementString = localStorage.getItem('announcement');

			const res = AnnouncementSchema.safeParse(JSON.parse(announcementString ?? ''));

			if (res.error) throw new Error();

			doNotShow = res.data.doNotShow;

			if (
				data.announcement &&
				(res.data.message !== data.announcement.message || !res.data.doNotShow)
			) {
				displayAnnouncement = true;
			}
		} catch (e) {
			displayAnnouncement = true;
			doNotShow = false;
			localStorage.setItem(
				'announcement',
				JSON.stringify({
					message: data.announcement?.message ?? '',
					doNotShow: false
				})
			);
		}
	});

	function handleCheckboxChange(e: Event) {
		const checked = (<HTMLInputElement>e.target).checked;
		localStorage.setItem(
			'announcement',
			JSON.stringify({
				message: data.announcement?.message ?? '',
				doNotShow: checked
			})
		);
		doNotShow = checked;
	}
</script>

<svelte:head>
	<title>Stella</title>
</svelte:head>
{#if displayAnnouncement && data.announcement?.message && doNotShow !== undefined}
	<Banner position="absolute" innerClass="w-full flex">
		<div class="mx-4 flex w-full flex-col items-start justify-between md:flex-row md:items-center">
			<p>
				{data.announcement.message}
			</p>
			<div class="mt-4 min-w-fit md:mt-0">
				<Checkbox checked={doNotShow} on:change={handleCheckboxChange}>
					Don't show this again
				</Checkbox>
			</div>
		</div>
	</Banner>
{/if}
<Toaster />
<Nav />
<main class="mb-8 px-8 md:h-[var(--main-height)]">
	<slot />
</main>
