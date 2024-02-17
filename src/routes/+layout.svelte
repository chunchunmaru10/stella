<script lang="ts">
	import { page } from '$app/stores';
	import '../app.css';
	import Nav from '../components/Nav.svelte';
	import Toaster from '../components/Toaster.svelte';
	import { readable } from 'svelte/store';
	import type { CharacterData } from '$lib/types';
	import { setContext } from 'svelte';

	const characters = readable<CharacterData[]>($page.data.characters);
	$: setContext('characters', characters);
</script>

<svelte:head>
	<title>Stella</title>
</svelte:head>
<Toaster />
<Nav />
<main class="mb-8 md:h-[calc(100svh-7rem-2rem)]">
	<slot />
</main>
