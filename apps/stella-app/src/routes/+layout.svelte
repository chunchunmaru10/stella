<script lang="ts">
	import '../app.css';
	import Nav from '../components/Nav.svelte';
	import Toaster from '../components/Toaster.svelte';
	import { readable } from 'svelte/store';
	import { setContext } from 'svelte';
	import { dev } from '$app/environment';
	import { inject } from '@vercel/analytics';
	import type { Character } from '.prisma/client';

	export let data;

	inject({ mode: dev ? 'development' : 'production' });

	const characters = readable<Promise<Character[]>>(data.characters);
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
