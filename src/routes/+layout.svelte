<script>
	import '../app.css';
	import Nav from '../components/Nav.svelte';
</script>

<svelte:head>
	<title>Stella</title>
</svelte:head>
<Nav />
<main class="h-[calc(100svh-7rem-2rem)]">
	<slot />
</main>
