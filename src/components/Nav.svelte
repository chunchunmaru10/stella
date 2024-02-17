<script lang="ts">
	import { page } from '$app/stores';
</script>

<nav class="flex h-28 w-full items-center justify-between p-8">
	<a href="/" class="flex items-center gap-6">
		<img src="./favicon.png" alt="logo" class="h-14 w-14" />
		<h1 class="hidden text-4xl font-bold text-white md:block">Stella</h1>
	</a>
	<ul class="flex gap-6">
		{#each ['Info', 'Settings'] as link}
			{@const path = '/' + link.toLowerCase()}
			<li class={`font-semibold ${$page.url.pathname === path ? 'text-white' : 'text-gray-400'}`}>
				<a href={path}>
					{link}
				</a>
			</li>
		{/each}
	</ul>
</nav>
