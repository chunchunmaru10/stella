<script lang="ts">
	import type { Relic } from '$lib/types';
	import type { createDialog } from 'svelte-headlessui';

	export let relic: Relic & { usableCharacters: Relic['characters'] };
	export let dialog: ReturnType<typeof createDialog>;
	export let activeRelic: Relic | undefined;
</script>

<div class="rounded-md transition hover:scale-110">
	<button
		class="from-gold-dark to-gold-light relative rounded-md bg-gradient-to-br p-1 outline-none"
		on:click={() => {
			activeRelic = relic;
			dialog?.open();
		}}
	>
		<div
			class="absolute right-0 top-0 flex h-6 w-6 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-white bg-gray-700"
		>
			<span class="text-sm">{relic.usableCharacters.length}</span>
		</div>
		<img src={relic.image} alt={relic.relicName} width="80" height="80" />
	</button>
</div>
