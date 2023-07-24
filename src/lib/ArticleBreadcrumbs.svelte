<script>
  export let articleInfo
  export let unitName
  export let lineName
</script>

    <p class="no-print">
      <a href="/articles">Articles</a>
      &nbsp;/&nbsp;
      <a href="/articles/{articleInfo.unitNumber}">{unitName}</a>
      &nbsp;/&nbsp;
      <a href="/articles/{articleInfo.unitNumber}/{articleInfo.lineNumber}">{lineName}</a>
      &nbsp;/&nbsp;
      <a href="/articles/{articleInfo.unitNumber}/{articleInfo.lineNumber}/{articleInfo.id}">Article {articleInfo.id}</a>
    </p>
