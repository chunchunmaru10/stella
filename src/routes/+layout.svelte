<script>
	import '../app.css';
	import Nav from '../components/Nav.svelte';
</script>

<Nav />
<main class="h-[calc(100svh-7rem-2rem)]">
	<slot />
</main>
