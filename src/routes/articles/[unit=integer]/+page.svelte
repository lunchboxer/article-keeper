<script>
  import ArticlesList from '$lib/ArticlesList.svelte'
  export let data
</script>

{#if data.error}
  <p class="error">Error: {data.error}</p>
  <p><a href="/articles">&larr; Back to articles</a></p>
{/if}

{#if data.unitOfInquiry}

  <div class="no-print">
    <p>
      <a href="/articles">Articles</a>
      &nbsp;/&nbsp;
      {data.unitOfInquiry.name}
    </p>
  </div>

  <h1>Unit {data.unitOfInquiry.id} - {data.unitOfInquiry.name}</h1>
  <p>{data.unitOfInquiry.centralIdea}</p>
  {#each data.unitOfInquiry.linesOfInquiry as lineOfInquiry}
    <h2>{lineOfInquiry.name}</h2>
    <ArticlesList articles={lineOfInquiry.articles} />
  {/each}
{/if}
