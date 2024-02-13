<script>
	import '../app.css';
	import Nav from '../components/Nav.svelte';
</script>

<svelte:head>
	<title>Stella</title>
</svelte:head>
<Nav />
<main class="mb-8 md:h-[calc(100svh-7rem-2rem)]">
	<slot />
</main>