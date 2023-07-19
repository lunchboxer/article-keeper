<script>
	import '../app.css';
</script>

<svelte:head>
	<title>Article-a-day</title>
</svelte:head>
<div class="container">
	<slot />
</div>

<style>
	.container {
		margin: 0 auto;
		max-width: 960px;
		padding: 2rem;
	}
</style>
