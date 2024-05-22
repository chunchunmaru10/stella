<script lang="ts">
	import type { CharacterRelicValue } from '$lib/types';
	import CharacterRating from './CharacterRating.svelte';
	import { settings } from '$lib/stores/settings';

	export let characters: CharacterRelicValue[];

	let charactersWithRating: (CharacterRelicValue & {
		rating: number;
	})[];

	$: {
		charactersWithRating = characters
			.map((character) => {
				// if relic ratings is set to display potential values,
				// we only pick the zero'th value since we are just calculating the total ratings for sorting,
				// the displaying of the actual potantial stat's values are not handled in this component
				const rating = (
					$settings.relicRatings === 'potential' && character.potentialValues.length > 0
						? [...character.actualValues, character.potentialValues[0]]
						: character.actualValues
				) // if character.potentialValues.length is 0, the resulting array will be the same
					.reduce((totalRating, currentStat) => totalRating + currentStat.value, 0);

				return {
					...character,
					releaseDate: new Date(character.releaseDate),
					rating
				};
			})
			.filter((c) => {
				return (
					(c.rating / c.maxPotentialValue) * 100 >= $settings.minRatingPercentage &&
					($settings.includeUnreleaseCharacters ||
						c.releaseDate.getTime() < new Date().getTime()) &&
					!$settings.excludedCharacters.includes(c.name)
				);
			})
			.sort((a, b) => {
				const diff = a.rating / a.maxPotentialValue - b.rating / b.maxPotentialValue;

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
