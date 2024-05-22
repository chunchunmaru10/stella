<script lang="ts">
	import { createMenu } from 'svelte-headlessui';
	import Transition from 'svelte-transition';

	const menu = createMenu({ label: 'Actions' });

	export let options: string[];
	export let onSelect: (selected: string) => void;

	function onMenuSelect(e: Event) {
		const selected = options.find((o) => o === (e as CustomEvent).detail.selected);

		onSelect(selected!);
	}
</script>

<div class="flex w-full flex-col items-center justify-center">
	<div class="relative">
		<button
			use:menu.button
			on:select={onMenuSelect}
			class="inline-flex w-full justify-center rounded-md bg-primary-600 p-3 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
		>
			<slot name="button" />
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
				class="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-primary-600 font-medium shadow-md shadow-black"
			>
				{#each options as option}
					{@const active = $menu.active === option}
					<div class="px-1 py-1">
						<button
							use:menu.item
							class="group flex w-full items-center rounded-md px-2 py-2 text-sm text-white {active
								? 'bg-primary-700'
								: ''}"
						>
							{option}
						</button>
					</div>
				{/each}
			</div>
		</Transition>
	</div>
</div>
