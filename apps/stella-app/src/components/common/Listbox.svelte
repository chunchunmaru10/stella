<script lang="ts">
	import Icon from '@iconify/svelte';
	import { createListbox } from 'svelte-headlessui';
	import Transition from 'svelte-transition';
	import { twMerge } from 'tailwind-merge';

	type Option = {
		name: string;
		value: string;
	};

	export let options: Option[];
	export let value: string;
	export let className = '';
	export let itemListClassName = '';

	const listbox = createListbox({ label: 'Rating Displayed As', selected: value });

	const onListboxSelect = (e: Event) => {
		value = (e as CustomEvent).detail.selected;
	};
</script>

<div class="relative mt-2">
	<button
		use:listbox.button
		on:select={onListboxSelect}
		class={twMerge(
			'inline-flex w-full max-w-full items-center justify-between rounded-lg px-5 py-2.5 text-start text-sm font-medium text-white dark:bg-primary-600 dark:hover:bg-primary-700 md:w-1/2',
			className
		)}
	>
		{options.find((o) => o.value === $listbox.selected)?.name}
		<Icon
			icon="fa6-solid:chevron-down"
			class={`${$listbox.expanded ? 'rotate-180' : ''} transition ease-out`}
		/>
	</button>
	<div class="-translate-y-4" />
	<Transition
		show={$listbox.expanded}
		enter="transition ease-in duration-100"
		enterFrom="translate-y-2 opacity-0"
		enterTo="translate-y-0 opacity-1"
	>
		<ul
			use:listbox.items
			class={twMerge(
				'absolute z-10 mt-1 w-full max-w-full rounded-md bg-primary-600 p-1 font-medium shadow-md shadow-black md:w-1/2',
				itemListClassName
			)}
		>
			{#each options as option}
				{@const active = $listbox.active === option.value}
				<li
					use:listbox.item={{ value: option.value }}
					class={`cursor-pointer p-2 ${active ? 'rounded-md bg-primary-700' : ''}`}
				>
					{option.name}
				</li>
			{/each}
		</ul>
	</Transition>
</div>
