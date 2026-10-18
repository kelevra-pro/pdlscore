<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>pdlscore — Americano</title>
</svelte:head>

<header>
	<a href="/">pdlscore</a>
</header>

<main>
	{@render children()}
</main>

<style>
	header {
		max-width: 560px;
		margin: 0 auto;
		padding: 12px 16px 0;
	}

	header a {
		font-weight: 700;
		text-decoration: none;
		letter-spacing: 0.02em;
	}

	main {
		max-width: 560px;
		margin: 0 auto;
		padding: 12px 16px 32px;
	}
</style>
