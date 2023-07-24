<script>
  import '../app.css'
  import { page } from '$app/stores'
  import Footer from '$lib/Footer.svelte'
  import Header from '$lib/Header.svelte'
</script>

<svelte:head>
  <title>{$page?.data?.title || 'Article-a-day'}</title>
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
  @media print {
  .container {
    margin: 0;
    padding: 0;
    max-width: unset !important;
  }
    }
</style>
