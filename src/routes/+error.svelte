<script lang="ts">
	import { page } from '$app/stores';
</script>

<section
	class="flex h-[calc(100svh-7rem-2rem)] w-full flex-col items-center justify-center gap-6 p-4 md:h-full"
>
	<h1 class="text-center text-4xl font-extrabold">Internal Server Error</h1>
	<h2 class="text-center text-2xl font-semibold">{$page.error?.message}</h2>
</section>
