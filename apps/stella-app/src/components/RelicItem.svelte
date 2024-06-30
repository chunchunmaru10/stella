<script lang="ts">
	import { getRelicColor } from '$lib';
	import type { Relic } from '$lib/types';
	import type { createDialog } from 'svelte-headlessui';
	import type { Writable } from 'svelte/store';

	export let relic: Relic & { usableCharacters: Relic['characters'] };
	export let dialog: ReturnType<typeof createDialog>;
	// export let activeRelic: Relic | undefined;
	export let activeRelic: Writable<Relic | undefined>;
	let relicColor: ReturnType<typeof getRelicColor>;

	$: relicColor = getRelicColor(relic.rarity);
</script>

<div class="rounded-md transition hover:scale-110">
	<button
		class={`${relicColor.from} ${relicColor.to} relative rounded-md bg-gradient-to-br outline-none`}
		on:click={() => {
			$activeRelic = relic;
			dialog?.open();
		}}
	>
		<div
			class="absolute right-0 top-0 flex h-6 w-6 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-white bg-gray-700 p-1"
		>
			<span class="text-sm">{relic.usableCharacters.length}</span>
		</div>
		<img src={relic.image} alt={relic.relicName} width="80" height="80" />
		<div class="mb-1 w-full bg-black/80">
			<span>+</span>{relic.level}
		</div>
	</button>
</div>
