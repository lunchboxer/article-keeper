<script>
  import ArticlesList from '$lib/ArticlesList.svelte'
  export let data
</script>

{#if data.error}
  <p class="error">Error: {data.error}</p>
  <p><a href="/articles">&larr; Back to articles</a></p>
{/if}

{#if data.lineOfInquiry}
  <div class="no-print">
    <p>
      <a href="/articles">Articles</a>
      &nbsp;/&nbsp;
      <a href="/articles/{data.unitOfInquiry.id}">{data.unitOfInquiry.name}</a>
      &nbsp;/&nbsp;
      {data.lineOfInquiry.name}
    </p>
  </div>

  <h1>
    Unit {data.unitId} Inquiry {data.lineOfInquiry.id}
  </h1>
  <p>{data.lineOfInquiry.name}</p>
  <ArticlesList articles={data.lineOfInquiry.articles} />
{/if}
