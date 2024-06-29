<script lang="ts">
	import type { CharacterRelicValue } from '$lib/types';
	import CharacterRating from './CharacterRating.svelte';
	import { settings } from '$lib/stores/settings';
	import { fixFloatPrecision } from '$lib';

	export let characters: CharacterRelicValue[];

	let charactersWithRating: (CharacterRelicValue & {
		rating: number;
	})[];

	$: {
		charactersWithRating = characters
			.map((character) => {
				let rating = character.actualValues.reduce(
					(prev, curr) => prev + curr.values.reduce((p, c) => p + c, 0),
					0
				);

				if ($settings.relicRatings === 'potential')
					rating += character.potentialStatsValue * character.remainingNumberOfUpgrades;

				return {
					...character,
					releaseDate: new Date(character.releaseDate),
					rating: fixFloatPrecision(rating)
				};
			})
			.filter((c) => {
				return (
					(c.rating /
						($settings.relicRatings === 'potential'
							? c.maxPotentialValueAtMaxLevel
							: c.maxPotentialValue)) *
						100 >=
						$settings.minRatingPercentage &&
					($settings.includeUnreleaseCharacters ||
						c.releaseDate.getTime() < new Date().getTime()) &&
					!$settings.excludedCharacters.includes(c.name)
				);
			})
			.sort((a, b) => {
				let diff = 0;
				if ($settings.relicRatings === 'potential')
					diff =
						a.rating / a.maxPotentialValueAtMaxLevel - b.rating / b.maxPotentialValueAtMaxLevel;
				else diff = a.rating / a.maxPotentialValue - b.rating / b.maxPotentialValue;

				// if no difference between actual values, sort by name instead
				return diff === 0 ? a.name.localeCompare(b.name) : -diff; // -diff to sort rating descendingly
			});
	}
</script>

{#if charactersWithRating && charactersWithRating.length}
	<div class="h-fit w-full">
		<ul class="space-y-6 text-white">
			{#each charactersWithRating as character}
				<CharacterRating {character} />
			{/each}
		</ul>
	</div>
{:else}
	<div class="my-auto flex h-full w-full flex-col items-center justify-center gap-4 text-center">
		<img class="h-52 w-52" src="./huohuo_sad.webp" alt="Huohuo Sad" />
		<p class="text-lg">
			This relic does not match the minimum requirements. You may salvage this relic.
		</p>
	</div>
{/if}
