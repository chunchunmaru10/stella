<script lang="ts">
	import { browser } from '$app/environment';
	import { settings } from '$lib/stores/settings';
	import { Button } from 'flowbite-svelte';

	let minRatingPercentage = $settings.minRatingPercentage;

	$: {
		settings.update((prev) => {
			return {
				...prev,
				minRatingPercentage
			};
		});
	}
</script>

<!-- if check is needed here otherwise the default settings will appear briefly due to how the settings store is configured -->
<!-- if browser is false (running on server), the server will use the default settings value, which is what was returned here -->
{#if browser}
	<div class="flex items-center gap-2">
		<h2 class="mb-1 text-xl font-semibold">
			Minimum Rating Percentage ({$settings.minRatingPercentage}%)
		</h2>
		<Button class="h-4 w-4 p-0 dark:focus:focus-within:ring-transparent">i</Button>
	</div>
	<input
		type="range"
		min="1"
		max="100"
		bind:value={minRatingPercentage}
		class="h-2 w-full appearance-none rounded-full dark:bg-gray-700"
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
