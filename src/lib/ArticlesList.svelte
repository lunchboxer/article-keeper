<script>
  export let articles = []
</script>

{#if articles.length === 0}
  <p>No articles found.</p>
{:else}
  <ul>
    {#each articles as article}
      <li>
        Article #{article.id} -
        <a href="/articles/{article.slug}">
          {article.title}
        </a>
          (
      {#each article.versions as version}
          <a href="/articles/{article.slug}/{version}">{version}</a>
{/each}
        )
      </li>
    {/each}
  </ul>
{/if}
