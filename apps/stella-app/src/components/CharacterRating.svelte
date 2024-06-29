<script lang="ts">
	import type { CharacterRelicValue } from '$lib/types';
	import { Badge } from 'flowbite-svelte';
	import ProgressBar from './common/ProgressBar.svelte';
	import { settings } from '$lib/stores/settings';
	import { fixFloatPrecision } from '$lib';
	import Tooltip from './common/Tooltip.svelte';

	export let character: CharacterRelicValue & {
		rating: number;
	};

	function formatValue(value: number) {
		return $settings.ratingsFormat === 'fraction'
			? fixFloatPrecision(value)
			: Math.round(
					(value /
						($settings.relicRatings === 'actual'
							? character.maxPotentialValue
							: character.maxPotentialValueAtMaxLevel)) *
						100
				) + '%';
	}

	let stats: typeof character.actualValues;
	let label: string;
	let progress: number;

	$: {
		stats = character.actualValues;
		progress =
			(character.rating /
				($settings.relicRatings === 'potential'
					? character.maxPotentialValueAtMaxLevel
					: character.maxPotentialValue)) *
			100;
		label =
			$settings.ratingsFormat === 'fraction'
				? `${fixFloatPrecision(character.rating)}/${fixFloatPrecision(
						$settings.relicRatings === 'actual'
							? character.maxPotentialValue
							: character.maxPotentialValueAtMaxLevel
					)}`
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
				<Tooltip
					options={{
						content: stat.values.map((v) => fixFloatPrecision(v)).join(', ')
					}}
				>
					<Badge>
						{stat.stat} ({formatValue(stat.values.reduce((prev, curr) => prev + curr, 0))})
					</Badge>
				</Tooltip>
			{/each}
			{#if $settings.relicRatings == 'potential' && character.potentialStats.length > 0 && character.remainingNumberOfUpgrades > 0 && character.potentialStatsValue > 0}
				<Tooltip
					options={{
						content: `${character.potentialStats.join(', ')} (${character.potentialStatsValue} * ${character.remainingNumberOfUpgrades})`
					}}
				>
					<Badge class="dark:bg-primary-900/40">
						Future Upgrades (+{formatValue(
							character.remainingNumberOfUpgrades * character.potentialStatsValue
						)})
					</Badge>
				</Tooltip>
			{/if}
		</div>
	</div>
</div>
