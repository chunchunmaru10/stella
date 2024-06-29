<script lang="ts">
	import { getRelicColor } from '$lib';
	import type { Relic } from '$lib/types';
	import Tooltip from './common/Tooltip.svelte';

	export let data: Relic;
	let relicColor: ReturnType<typeof getRelicColor>;

	$: relicColor = getRelicColor(data.rarity);
</script>

<div class="font-[DIN]">
	<!-- Place a button here to redirect auto focus to this element when modal open in batch import otherwise the tooltip will show-->
	<button class="hidden" />
	<h2 class={`${relicColor.text} w-full min-w-0 truncate text-2xl`}>
		{data.relicName}
	</h2>
	<div class={`${relicColor.bg} mt-1 h-1 min-w-full rounded-full`} />
	<div
		class={`${relicColor.from} ${relicColor.to} mt-4 flex aspect-[21/9] w-full items-end rounded-md bg-gradient-to-br p-4`}
	>
		<div class="flex flex-col">
			<h3 class="text-nowrap text-xl text-white/80">{data.type}</h3>
			<div class="flex items-center gap-1 text-3xl text-white">
				<span>+</span>{data.level}
			</div>
		</div>
		<div class="relative h-full max-h-full w-full">
			<img
				src={data.image}
				alt={data.relicName}
				class="absolute bottom-0 right-0 max-h-full object-scale-down"
			/>
		</div>
	</div>
	<h3
		class="text-gold-medium mb-1 mt-6 flex justify-between rounded-md bg-white/20 p-2 py-1 text-2xl"
	>
		<span>
			{data.mainStat.name.replace('%', '')}
		</span>
		<span>
			{data.mainStat.displayPercentage
				? data.mainStat.value.toFixed(1) + '%'
				: Math.floor(data.mainStat.value)}
		</span>
	</h3>
	{#each data.substats as substat, i}
		<h3
			class={`rounded-md text-white/80 ${i % 2 === 0 ? 'bg-gray-900/50' : ''} flex justify-between p-2 py-1 text-2xl`}
		>
			<span>
				{substat.name}
			</span>
			<Tooltip
				options={{
					content: substat.upgrades.join(', ')
				}}
			>
				<span>
					{substat.displayPercentage ? substat.value + '%' : substat.value}
				</span>
			</Tooltip>
		</h3>
	{/each}
	<h3 class="text-gold-medium mt-4 text-2xl">
		{data.setName}
	</h3>
</div>
