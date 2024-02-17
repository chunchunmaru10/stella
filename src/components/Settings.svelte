<script lang="ts">
	import { settings } from '$lib/stores/settings';
	import type { CharacterData } from '$lib/types';
	import { getContext } from 'svelte';
	import type { Readable } from 'svelte/store';

	const characters = getContext<Readable<CharacterData[]>>('characters');
	$: console.log($characters);
</script>

<h2 class="text-xl font-bold">Settings</h2>
