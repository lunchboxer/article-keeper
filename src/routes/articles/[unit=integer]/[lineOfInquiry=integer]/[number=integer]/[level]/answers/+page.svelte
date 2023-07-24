<script>
  import ArticleBreadcrumbs from '$lib/ArticleBreadcrumbs.svelte'
  export let data
  const { answers, articleInfo, level, unitName, lineName, error } = data
  const id = String(articleInfo.id).padStart(2, '0')
</script>

{#if error}
  <p class="error">Error: {error}</p>
  <p><a href="/articles">&larr; Back to articles</a></p>
{:else}

  <ArticleBreadcrumbs {articleInfo} {unitName} {lineName}/>

  <div class="options no-print">
    <p>Reading level {level}</p>
    <a href="/answerkeys-pdf/{articleInfo.unitNumber}{articleInfo.lineNumber}{id}{level}-answers-{articleInfo.slug}.pdf" download class="button button-outline">Download answer key pdf</a>
  </div>

  {@html answers}

{/if}
