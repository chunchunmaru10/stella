<script lang="ts">
	import RelicInput from '../components/RelicInput.svelte';
	import RelicDetails from '../components/RelicDetails.svelte';
	import type { Relic } from '$lib/types';
	import CharacterList from '../components/CharacterList.svelte';
	import { Card } from 'flowbite-svelte';

	let loading = false;
	let data: Relic | undefined;
</script>

<div class="grid w-full gap-4 px-8 md:h-full md:grid-cols-2 xl:grid-cols-3">
	<RelicInput bind:loading bind:data />
	<RelicDetails {loading} {data} />
	<Card class="mb-8 hidden max-h-full overflow-y-auto xl:mb-0 xl:block">
		<CharacterList characters={data?.characters} />
	</Card>
</div>
