<script>
	import { toast } from '$lib/stores/toast';
	import '../app.css';
	import Nav from '../components/Nav.svelte';
	import Toaster from '../components/Toaster.svelte';
</script>

<svelte:head>
	<title>Stella</title>
</svelte:head>
<Toaster />
<Nav />
<main class="mb-8 md:h-[calc(100svh-7rem-2rem)]">
	<slot />
</main>
