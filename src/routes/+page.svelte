<script lang="ts">
	import RelicInput from '../components/RelicInput.svelte';
	import RelicDetails from '../components/RelicDetails.svelte';
	import type { Relic } from '$lib/types';

	let loading = false;
	let data: Relic | undefined;
</script>

<div class="grid max-h-full w-full gap-4 px-8 md:h-full md:grid-cols-2 xl:grid-cols-3">
	<RelicInput bind:loading bind:data />
	<RelicDetails {loading} {data} />
	<div class="mb-8 hidden bg-green-500 xl:col-span-1 xl:mb-0 xl:block">Characters</div>
</div>
