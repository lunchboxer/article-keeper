<script>
  import '../print.css'
  export let articleInfo
  export let article = ''
  export let questions = []
  export let answers = ''

  console.log(articleInfo)
</script>

{#if articleInfo}
  <p class="article-info">Article-a-day - Unit {articleInfo.unit}, {articleInfo.lineName} #{articleInfo.id}</p>
{/if}
{#if article}
  {@html article}
{/if}

