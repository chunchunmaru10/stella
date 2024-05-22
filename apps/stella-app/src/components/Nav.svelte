<script lang="ts">
	import { page } from '$app/stores';
	import { camelize } from '$lib';
	import Icon from '@iconify/svelte';
	import { createMenu } from 'svelte-headlessui';
	import Transition from 'svelte-transition';

	const menu = createMenu({ label: 'Nav Items' });

	function onSelect(e: Event) {
		window.location.href = '/' + camelize((e as CustomEvent).detail.selected);
	}
</script>

<nav class="flex h-28 w-full items-center justify-between p-8">
	<a href="/" class="flex items-center gap-6">
		<img src="./favicon.png" alt="logo" class="h-14 w-14" />
		<h1 class="hidden text-4xl font-bold text-white md:block">Stella</h1>
	</a>
	<div class="relative md:hidden">
		<button
			use:menu.button
			on:select={onSelect}
			class="flex h-9 w-9 items-center justify-center rounded-md bg-primary-600"
		>
			{#if $menu.expanded}
				<Icon icon="mingcute:close-fill" />
			{:else}
				<Icon icon="fa-solid:bars" />
			{/if}
		</button>
		<Transition
			show={$menu.expanded}
			enter="transition ease-out duration-100"
			enterFrom="transform opacity-0 scale-95"
			enterTo="transform opacity-100 scale-100"
			leave="transition ease-in duration-75"
			leaveFrom="transform opacity-100 scale-100"
			leaveTo="transform opacity-0 scale-95"
		>
			<div
				use:menu.items
				class="absolute right-0 z-20 mt-2 w-[calc(100vw-4rem)] rounded-md border border-gray-700 bg-gray-800 p-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
			>
				{#each ['Batch Import', 'Info', 'Settings'] as link}
					{@const path = '/' + camelize(link)}
					{@const active = $menu.active === link}
					{@const selected = $page.url.pathname === path}
					<button
						use:menu.item
						class="group my-1 flex w-full items-center rounded-md px-2 py-2 text-sm {selected
							? 'bg-primary-600 font-semibold text-white'
							: active
								? 'bg-primary-400 bg-opacity-30'
								: 'text-gray-400'}"
						role="link"
						aria-roledescription="link"
					>
						{link}
					</button>
				{/each}
			</div>
		</Transition>
	</div>
	<ul class="hidden gap-6 md:flex">
		{#each ['Batch Import', 'Info', 'Settings'] as link}
			{@const path = '/' + camelize(link)}
			<li class={`font-semibold ${$page.url.pathname === path ? 'text-white' : 'text-gray-400'}`}>
				<a href={path}>
					{link}
				</a>
			</li>
		{/each}
	</ul>
</nav>
