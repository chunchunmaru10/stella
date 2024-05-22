<script lang="ts">
	import { onMount } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { tweened } from 'svelte/motion';
	import { twMerge } from 'tailwind-merge';

	export let progress: number;
	export let label = '';
	export let className = '';
	export let height = '';

	const width = tweened(0, {
		duration: 400,
		easing: cubicOut
	});

	onMount(() => {
		width.set(progress / 100);
	});

	$: {
		width.set(progress / 100);
	}
</script>

<div class="relative h-4 w-full rounded-full bg-gray-700" style={height && `height:${height}`}>
	<div
		class={twMerge(
			'absolute left-0 top-0 h-4 rounded-full bg-primary-600 p-0.5 text-center text-xs font-medium leading-none text-primary-100',
			className
		)}
		style={`width:${$width * 100}%;${height && `height:${height}`}`}
	>
		{label}
	</div>
</div>
