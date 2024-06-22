<script lang="ts">
	import type { Relic } from '$lib/types';

	export let data: Relic;

	const relicColor = getRelicBackground();

	function getRelicBackground() {
		switch (data.rarity) {
			case 2:
				return {
					from: 'from-green-dark',
					to: 'to-green-light',
					text: 'text-green-light',
					bg: 'bg-green-light'
				};
			case 3:
				return {
					from: 'from-blue-dark',
					to: 'to-blue-light',
					text: 'text-blue-light',
					bg: 'bg-blue-light'
				};
			case 4:
				return {
					from: 'from-purple-dark',
					to: 'to-purple-light',
					text: 'text-purple-light',
					bg: 'bg-purple-light'
				};
			default:
				return {
					from: 'from-gold-dark',
					to: 'to-gold-light',
					text: 'text-gold-light',
					bg: 'bg-gold-light'
				};
		}
	}
</script>

<div class="font-[DIN]">
	<h2 class={`${relicColor.text} w-full min-w-0 truncate text-2xl`}>
		{data.relicName}
	</h2>
	<div class={`${relicColor.bg} mt-1 h-1 min-w-full rounded-full`} />
	<div
		class={`${relicColor.from} ${relicColor.to} mt-4 flex aspect-[21/9] w-full items-end rounded-md bg-gradient-to-br p-4`}
	>
		<h3 class="text-2xl text-white/80">{data.type}</h3>
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
			{data.mainStat.displayPercentage ? data.mainStat.value + '%' : data.mainStat.value}
		</span>
	</h3>
	{#each data.substats as substat, i}
		<h3
			class={`rounded-md text-white/80 ${i % 2 === 0 ? 'bg-gray-900/50' : ''} flex justify-between p-2 py-1 text-2xl`}
		>
			<span>
				{substat.name}
			</span>
			<span>
				{substat.displayPercentage ? substat.value + '%' : substat.value}
			</span>
		</h3>
	{/each}
	<h3 class="text-gold-medium mt-4 text-2xl">
		{data.setName}
	</h3>
</div>
