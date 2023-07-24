<script>
  export let articleInfo
  export let article = ''
  export let questions = []
  export let answers = ''
  export let level = ''
  export let unitName = ''
  export let lineName = ''
</script>

<svelte:head>
  <title>Article-a-day - {unitName}, {lineName} #{articleInfo.id} text {level}</title>
</svelte:head>

{#if article && articleInfo}
  <div class="no-print">
    <p>
      <a href="/articles">Articles</a>
      &nbsp;/&nbsp;
      <a href="/articles/{articleInfo.unitNumber}">{unitName}</a>
      &nbsp;/&nbsp;
      <a href="/articles/{articleInfo.unitNumber}/{articleInfo.lineNumber}">{lineName}</a>
      &nbsp;/&nbsp;
      <a href="/articles/{articleInfo.unitNumber}/{articleInfo.lineNumber}/{articleInfo.id}">Article {articleInfo.id}</a>
    </p>
    <p>Reading level {level}
      {#if articleInfo.versions.length > 1}
        &nbsp;|
        {#each articleInfo.versions as version}
          {#if version !== level}
            <a class="level" href="/articles/{articleInfo.unitNumber}/{articleInfo.lineNumber}/{articleInfo.id}/{version}">View level {version} text</a>
          {/if}
        {/each}
      {/if}
    </p>
  </div>

  {@html article}
{/if}

{#if questions.length > 0}
  <div class="new-page">
    <div class="heading-wrapper">
  <h2 class="questions">Questions</h2>
    <div class="name-date">
  <p class="print-only form-line">Name: <span class="line">____________________</span>
  &nbsp;Date: <span class="line">______________</span></p>
</div>

  </div>
  <ol type="1">
{#each questions as question}
  <li>{question.question}</li>
<ol class="answers">
{#if question?.answers?.length > 0}
      {#each question.answers as answer}
      <li>{answer}</li>
{/each}
{/if}
    </ol>
{/each}
  </ol>
  </div>
{/if}

{#if answers}
  <div class="new-page">

  {@html answers}
</div>
{/if}

  <style>
  .level {
    margin: 0 0.5rem;
  }
  .heading-wrapper {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: baseline;
  }
  .name-date {
    text-align: right;
    padding: 0;
    margin: 0;
  }
  .answers {
    margin: 0;
    padding: 0;
    display: flex;
    margin-bottom: 1rem;
    list-style-type: none;
    flex-wrap: wrap;
  }
  .answers li {
    padding: 0 1rem;
  }
  .new-page {
    break-before: page;
  }
  .name-date p.form-line {
    line-height: 3;
      text-align: right;
    }
  @media print {
    .answers li {
      font-size: 11pt;
    }
    span.line {
      font-family: 'Arial', 'sans-serif';
    }
    h2.questions {
      margin: 0;
      padding: 0;
    }
  }
</style>
