<script>
  import articleIndex from '$lib/article-index.json'
  import ArticlesList from '$lib/ArticlesList.svelte'
</script>

<h1>Articles</h1>

{#each articleIndex.unitsOfInquiry as unitOfInquiry}
  <h2>Unit {unitOfInquiry.id} - {unitOfInquiry.name}</h2>
  <p>{unitOfInquiry.centralIdea}</p>
  {#each unitOfInquiry.linesOfInquiry as lineOfInquiry}
    <h3>{lineOfInquiry.name}</h3>
    <ArticlesList articles={lineOfInquiry.articles} />
  {/each}
{/each}
