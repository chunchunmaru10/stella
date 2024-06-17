<script lang="ts">
	import type { Relic, SortOption } from '$lib/types';
	import { Button, Drawer, Spinner } from 'flowbite-svelte';
	import { sineIn } from 'svelte/easing';
	import type { Writable } from 'svelte/store';
	import FilterRelicSet from './FilterRelicSet.svelte';
	import FilterRelicType from './FilterRelicType.svelte';
	import FilterRelicMainStat from './FilterRelicMainStat.svelte';
	import FilterRelicSubStats from './FilterRelicSubstats.svelte';
	import SortRelic from './SortRelic.svelte';
	import type { Set, Stat, Type } from '.prisma/client';

	type RelicWithUsableCharacters = Relic & { usableCharacters: Relic['characters'] };

	export let hidden = false;
	export let filterData: {
		relicSets: Promise<Set[]>;
		relicTypes: Promise<
			(Type & {
				stats: Stat[];
			})[]
		>;
		relicStats: Promise<Stat[]>;
	};
	export let filteredBatchRelics: Writable<RelicWithUsableCharacters[]>;
	export let restoreFilteredData: () => void;

	let selectedRelicSets: Map<string, string> = new Map();
	let selectedRelicTypes: Map<string, string> = new Map();
	let selectedMainStats: Map<string, string> = new Map();
	let selectedSubstats: Map<string, string> = new Map();
	let relicTypesData: Awaited<(typeof filterData)['relicTypes']>;

	const allSortOptions: SortOption[] = ['Piece Type', 'Set', 'Character Count'];
	let sortOrder: 'asc' | 'desc' = 'desc';
	let selectedSortOptions: SortOption[] = [];
	const sortFunctions: {
		[key in SortOption]: (a: RelicWithUsableCharacters, b: RelicWithUsableCharacters) => number;
	} = {
		'Character Count': (a, b) => a.usableCharacters.length - b.usableCharacters.length,
		'Piece Type': (a, b) => {
			const aSortOrder = relicTypesData.find((t) => t.name === a.type)?.sortOrder ?? 0;
			const bSortOrder = relicTypesData.find((t) => t.name === b.type)?.sortOrder ?? 0;
			return aSortOrder - bSortOrder;
		},
		Set: (a, b) => a.setName.localeCompare(b.setName)
	};

	async function loadStreamedData() {
		const res = await Promise.all([
			filterData.relicSets,
			filterData.relicStats,
			filterData.relicTypes
		]);
		relicTypesData = res[2];
		return res;
	}

	function filterMainStat(
		types: Awaited<typeof filterData.relicTypes>,
		stats: Awaited<typeof filterData.relicStats>
	) {
		return stats.filter((stat) => {
			for (const type of types) {
				if (type.stats.find((typeStat) => typeStat.name === stat.name)) return true;
			}

			return false;
		});
	}

	function confirmFilter() {
		restoreFilteredData();

		$filteredBatchRelics = $filteredBatchRelics
			.filter((relic) => {
				let shouldExclude = false;

				if (selectedRelicSets.size > 0 && !selectedRelicSets.get(relic.setName))
					shouldExclude = true;
				else if (selectedRelicTypes.size > 0 && !selectedRelicTypes.get(relic.type))
					shouldExclude = true;
				else if (selectedMainStats.size > 0 && !selectedMainStats.get(relic.mainStat))
					shouldExclude = true;
				else if (selectedSubstats.size > 0) {
					for (const [stat] of selectedSubstats) {
						// loop through the substat that the relic has, if even one of the selected does not include in the list,
						// means this relic does not fulfill the requirement, if then, can return early
						if (!relic.substats.includes(stat)) return false;
					}
				}

				return !shouldExclude;
			})
			.sort((a, b) => {
				for (const sortOption of selectedSortOptions) {
					const smaller = sortOrder === 'asc' ? a : b;
					const bigger = sortOrder === 'asc' ? b : a;
					const res = sortFunctions[sortOption](smaller, bigger);

					if (res !== 0) return res;
				}

				return 0;
			});
	}

	function resetFilter() {
		restoreFilteredData();

		selectedRelicSets = new Map();
		selectedRelicTypes = new Map();
		selectedMainStats = new Map();
		selectedSubstats = new Map();
		selectedSortOptions = [];

		hidden = true;
	}
</script>

<Drawer
	transitionType="fly"
	bind:hidden
	transitionParams={{
		x: -320,
		duration: 200,
		easing: sineIn
	}}
	placement="left"
	class="w-[90vw] md:w-96"
>
	<div class="flex max-h-full min-h-full max-w-full flex-col">
		<h2 class="text-xl font-bold">Filter and Sort</h2>
		{#await loadStreamedData()}
			<div class="my-auto flex w-full justify-center">
				<Spinner />
			</div>
		{:then [sets, stats, types]}
			{@const relicSetsMap = sets.reduce((acc, set) => acc.set(set.name, set.thumbnail), new Map())}
			{@const relicTypesMap = types
				.sort((a, b) => a.sortOrder - b.sortOrder)
				.reduce((acc, type) => acc.set(type.name, type.thumbnail), new Map())}
			{@const relicMainStatsMap = filterMainStat(types, stats)
				.sort((a, b) => a.sortOrder - b.sortOrder)
				.reduce((acc, stat) => acc.set(stat.name, stat.thumbnail), new Map())}
			{@const relicSubstatsMap = stats
				.filter((r) => r.canBeSubstats)
				.sort((a, b) => a.sortOrder - b.sortOrder)
				.reduce((acc, stat) => acc.set(stat.name, stat.thumbnail), new Map())}
			<div class="mt-4 h-[100vh] max-h-full overflow-y-auto scrollbar-thin">
				<div class="mr-2">
					<FilterRelicSet relicSets={relicSetsMap} bind:selectedRelicSets />
					<FilterRelicType relicTypes={relicTypesMap} bind:selectedRelicTypes />
					<FilterRelicMainStat mainStats={relicMainStatsMap} bind:selectedMainStats />
					<FilterRelicSubStats substats={relicSubstatsMap} bind:selectedSubstats />
					<SortRelic {allSortOptions} bind:selectedSortOptions bind:sortOrder />
				</div>
			</div>
			<div class="mt-2 flex items-center justify-between gap-2">
				<Button
					class="dark:bg-red-500 dark:hover:bg-red-500 dark:hover:opacity-90"
					on:click={resetFilter}
				>
					Reset
				</Button>
				<Button
					class="flex-grow"
					on:click={() => {
						confirmFilter();
						hidden = true;
					}}
				>
					Confirm
				</Button>
			</div>
		{/await}
	</div>
</Drawer>
