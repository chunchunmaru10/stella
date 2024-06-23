<script lang="ts">
	import { fly } from 'svelte/transition';
	import CharacterToggleSettings from '../../components/CharacterToggleSettings.svelte';
	import PreferencesSettings from '../../components/PreferencesSettings.svelte';

	// tab stuff
	const tabs = ['Characters', 'Preferences'] as const;
	let activeTabIndex = 0;

	// tab animation https://www.youtube.com/watch?v=ecP8RwpkiQw
	let tabUnderline: HTMLDivElement;
	function switchTab(tab: number) {
		const first = tabUnderline.getBoundingClientRect();

		activeTabIndex = tab;

		requestAnimationFrame(() => {
			const last = tabUnderline.getBoundingClientRect();
			const diffPos = first.left - last.left;

			tabUnderline.animate(
				[
					{ translate: `${diffPos}px`, width: `${first.width}px` },
					{ translate: '0px', width: `${last.width}px` }
				],
				{
					duration: 300,
					easing: 'ease-out'
				}
			);
		});
	}
</script>

<h1 class="text-3xl font-bold">Settings</h1>
<ul class="mt-4 flex w-full">
	{#each tabs as tab, index (tab)}
		<li class="relative">
			<button
				class={`px-5 py-4 font-semibold ${index === activeTabIndex ? 'text-gold-medium' : 'text-gray-400'}`}
				on:click={() => switchTab(index)}
				role="tab"
			>
				{tab}
			</button>
			{#if activeTabIndex === index}
				<div
					bind:this={tabUnderline}
					class="bg-gold-medium absolute bottom-0 left-0 h-1 w-full rounded-full"
				/>
			{/if}
		</li>
	{/each}
</ul>
{#key activeTabIndex}
	<section class="mt-6" in:fly={{ y: 30, duration: 400 }}>
		{#if tabs[activeTabIndex] === 'Characters'}
			<CharacterToggleSettings />
		{:else}
			<PreferencesSettings />
		{/if}
	</section>
{/key}
