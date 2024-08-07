<script lang="ts">
	import { browser } from '$app/environment';
	import { settings } from '$lib/stores/settings';
	import Icon from '@iconify/svelte';
	import Listbox from './common/Listbox.svelte';
	import Tooltip from './common/Tooltip.svelte';

	let minRatingPercentage = $settings.minRatingPercentage;
	let useRatingValue = $settings.relicRatings;
	let ratingsDisplayedAs = $settings.ratingsFormat;
	let includeUnreleasedCharacters = $settings.includeUnreleaseCharacters ? 'Yes' : 'No';

	$: {
		settings.update((prev) => {
			return {
				...prev,
				relicRatings: useRatingValue,
				ratingsFormat: ratingsDisplayedAs,
				includeUnreleaseCharacters: includeUnreleasedCharacters === 'Yes',
				minRatingPercentage
			};
		});
	}
</script>

<!-- if check is needed here otherwise the default settings will appear briefly due to how the settings store is configured -->
<!-- if browser is false (running on server), the server will use the default settings value, which is what was returned here -->
{#if browser}
	<!-- Minimum Rating Percentage -->
	<div class="flex items-center gap-6">
		<h2 class="mb-1 text-xl font-semibold">
			Minimum Rating Percentage ({$settings.minRatingPercentage}%)
		</h2>
		<Tooltip
			options={{
				content: 'Only relics rated above this percentage will be displayed'
			}}
		>
			<div
				class="bg-primary-500 flex min-h-[20px] min-w-[20px] cursor-pointer items-center justify-center rounded-full"
				role="tooltip"
			>
				<span class="inline-flex min-h-[20px] min-w-[20px] items-center justify-center">
					<Icon icon="fa6-solid:info" width={12} height={12} />
				</span>
			</div>
		</Tooltip>
	</div>
	<input
		type="range"
		min="1"
		max="100"
		bind:value={minRatingPercentage}
		class="mt-5 h-2 w-full appearance-none rounded-full md:w-1/2 dark:bg-gray-700"
	/>
	<!-- Rating Displayed As -->
	<div class="mt-6 flex items-center gap-4">
		<h2 class="mb-1 text-xl font-semibold">Ratings Displayed As</h2>
	</div>
	<Listbox
		options={[
			{
				name: 'Fraction',
				value: 'fraction'
			},
			{
				name: 'Percentage',
				value: 'percentage'
			}
		]}
		bind:value={ratingsDisplayedAs}
	/>
	<!-- Include Unreleased Characters -->
	<div class="mt-6 flex items-center gap-4">
		<h2 class="mb-1 text-xl font-semibold">Include Unreleased Characters</h2>
	</div>
	<Listbox
		options={[
			{
				name: 'No',
				value: 'No'
			},
			{
				name: 'Yes',
				value: 'Yes'
			}
		]}
		bind:value={includeUnreleasedCharacters}
	/>
{/if}

<style>
	input[type='range']::-webkit-slider-thumb {
		width: 20px;
		height: 20px;
		cursor: pointer;
		appearance: none;
		background-color: rgb(237 161 61);
	}
</style>
