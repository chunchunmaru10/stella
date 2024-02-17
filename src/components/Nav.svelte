<script lang="ts">
	import Icon from '@iconify/svelte';
	import Modal from './common/Modal.svelte';
	import { Button } from 'flowbite-svelte';
	import Settings from './Settings.svelte';
</script>

<nav class="flex h-28 w-full items-center justify-between p-8">
	<div class="flex items-center gap-6">
		<img src="./favicon.png" alt="logo" class="h-14 w-14" />
		<h1 class="hidden text-4xl font-bold text-white md:block">Stella</h1>
	</div>
	<div class="flex gap-2">
		<Modal>
			<Button class="h-10 w-10 p-0" let:dialog slot="button" on:click={dialog.open}>
				<Icon icon="fa6-solid:info" width={20} height={20} />
			</Button>
			<svelte:fragment let:dialog>
				<h3>Info</h3>
				<Button on:click={dialog.close}>Close</Button>
			</svelte:fragment>
		</Modal>
		<Modal>
			<Button class="h-10 w-10 p-0" let:dialog slot="button" on:click={dialog.open}>
				<Icon icon="fa6-solid:gear" width={20} height={20} />
			</Button>
			<svelte:fragment>
				<Settings />
			</svelte:fragment>
		</Modal>
	</div>
</nav>
