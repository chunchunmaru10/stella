<script lang="ts">
	import { Toast } from 'flowbite-svelte';
	import type { Toast as ToastType } from '$lib/stores/toast';
	import Icon from '@iconify/svelte';
	import { onMount, type ComponentProps } from 'svelte';
	import { fly, scale, slide } from 'svelte/transition';
	import { cubicOut, quintOut } from 'svelte/easing';

	export let option: ToastType;

	let color: ComponentProps<Toast>['color'];
	let icon: ComponentProps<Icon>['icon'];

	switch (option.type) {
		case 'success':
			color = 'green';
			icon = 'fa-solid:check-circle';
			break;
		case 'error':
			color = 'red';
			icon = 'fa-solid:times-circle';
			break;
		default:
			color = 'primary';
			icon = 'fa6-solid:circle-info';
			break;
	}
</script>

<div transition:scale={{ start: 0.3 }}>
	<Toast {color} dismissable={false} class="p-2 shadow-lg shadow-black/50">
		<Icon {icon} slot="icon" />
		{option.message}
	</Toast>
</div>
