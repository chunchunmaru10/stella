<script lang="ts">
	import '../app.css';
	import Nav from '../components/Nav.svelte';
	import Toaster from '../components/Toaster.svelte';
	import { readable } from 'svelte/store';
	import type { CharacterData } from '$lib/types';
	import { setContext } from 'svelte';

	export let data;
	const characters = readable<Promise<CharacterData[]>>(data.characters);
	$: setContext('characters', $characters);
</script>

<svelte:head>
	<title>Stella</title>
</svelte:head>
<Toaster />
<Nav />
<main class="mb-8 px-8 md:h-[var(--main-height)]">
	<slot />
</main>
