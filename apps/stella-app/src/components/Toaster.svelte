<script lang="ts">
	import Toast from './common/Toast.svelte';
	import { toasts } from '$lib/stores/toast';
	import { flip } from 'svelte/animate';
</script>

{#if $toasts}
	<div class="fixed left-0 right-0 top-0 z-20 mt-4 flex flex-col items-center justify-center gap-3">
		{#each $toasts as toast (toast.id)}
			<div animate:flip={{ duration: 300 }}>
				<Toast option={toast} />
			</div>
		{/each}
	</div>
{/if}
