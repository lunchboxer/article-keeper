<script>
  import '../app.css'
  import Footer from '$lib/Footer.svelte'
  import Header from '$lib/Header.svelte'
</script>

<svelte:head>
  <title>Article-a-day</title>
</svelte:head>

<Header />

<div class="container">
  <slot />
</div>

  <Footer />

<style>
  .container {
    margin: 0 auto;
    max-width: 960px;
    padding: 2rem;
  }
</style>
