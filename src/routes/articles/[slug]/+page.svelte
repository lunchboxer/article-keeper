<script>
  import RenderArticle from '$lib/RenderArticle.svelte'
  export let data
</script>

{#if data.error}
  <p class="error">Error: {data.error}</p>
  <p><a href="/articles">&larr; Back to articles</a></p>
{/if}

<RenderArticle
  {...data}
/>
