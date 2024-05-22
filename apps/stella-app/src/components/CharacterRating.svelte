<script lang="ts">
	import type { CharacterRelicValue } from '$lib/types';
	import { Badge } from 'flowbite-svelte';
	import ProgressBar from './common/ProgressBar.svelte';
	import { settings } from '$lib/stores/settings';

	export let character: CharacterRelicValue & {
		rating: number;
	};

	function formatValue(value: number) {
		return $settings.ratingsFormat === 'fraction'
			? value.toString()
			: Math.round((value / character.maxPotentialValue) * 100) + '%';
	}

	let stats: typeof character.actualValues;
	let label: string;
	let progress: number;

	$: {
		stats = character.actualValues;
		progress = (character.rating / character.maxPotentialValue) * 100;
		label =
			$settings.ratingsFormat === 'fraction'
				? `${character.rating}/${character.maxPotentialValue}`
				: Math.round(progress) + '%';
	}
</script>

<div class="flex items-center gap-4">
	<div
		class={`h-20 min-h-[5rem] w-20 min-w-[5rem] overflow-hidden rounded-full dark:bg-gradient-to-b ${
			character.rarity === 4 ? 'from-purple-dark to-purple-light' : 'from-gold-dark to-gold-light'
		}`}
	>
		<img
			src={character.thumbnail}
			alt={character.name}
			class="min-h-full min-w-full translate-y-1"
		/>
	</div>
	<div class="flex h-fit flex-grow flex-col justify-between gap-2 py-1">
		<h3 class="text-lg font-semibold leading-none">{character.name}</h3>
		<ProgressBar {progress} {label} />
		<div class="flex flex-wrap gap-2">
			{#each stats as stat}
				<Badge>{stat.stat} ({formatValue(stat.value)})</Badge>
			{/each}
			{#if $settings.relicRatings == 'potential' && character.potentialValues.length > 0}
				{@const biggestPotentialValue = character.potentialValues[0].value}
				{@const biggestPotentialValueFormat = formatValue(biggestPotentialValue)}
				{@const potentialValues = character.potentialValues.filter(
					(stat) => stat.value >= biggestPotentialValue
				)}
				<Badge class="dark:bg-primary-900/40">
					{potentialValues.map((potentialValues) => potentialValues.stat).join(', ')} (+{biggestPotentialValueFormat})
				</Badge>
			{/if}
		</div>
	</div>
</div>
