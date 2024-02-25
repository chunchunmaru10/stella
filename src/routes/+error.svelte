<script lang="ts">
	import { page } from '$app/stores';
</script>

<section
	class="flex h-[var(--main-height)] w-full flex-col items-center justify-center gap-6 p-4 md:h-full"
>
	{#if $page.status === 404}
		<img
			src="./ruan_mei_question_mark.webp"
			alt="Not Found"
			class="aspect-square max-h-full w-72 max-w-full"
		/>
		<h2 class="text-center text-2xl font-semibold">Page Not Found</h2>
	{:else}
		<img src="./pom_pom_cross.webp" alt="Error" class="aspect-square max-h-full w-72 max-w-full" />
		<h2 class="text-center text-2xl font-semibold">{$page.error?.message}</h2>
	{/if}
</section>
