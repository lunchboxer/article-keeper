<script>
  import ArticleBreadcrumbs from './ArticleBreadcrumbs.svelte'
  export let articleInfo
  export let article = ''
  export let questions = []
  export let answers = ''
  export let level = ''
  export let unitName = ''
  export let lineName = ''

  const id = String(articleInfo.id).padStart(2, '0')
  let showAnswers = false
</script>

{#if article && articleInfo}
  <div class="no-print">
    <ArticleBreadcrumbs {articleInfo} {unitName} {lineName}/>

    <div class="options">
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
      <a href="/articles-pdf/{articleInfo.unitNumber}{articleInfo.lineNumber}{id}{level}-{articleInfo.slug}.pdf"
        download
        class="button button-outline"
      >
        Download article and questions pdf
      </a>
      <a href="/answerkeys-pdf/{articleInfo.unitNumber}{articleInfo.lineNumber}{id}{level}-answers-{articleInfo.slug}.pdf"
        download
        class="button button-outline"
      >
        Download answer key pdf
      </a>
      </div>
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

<div class="no-print">

{#if !showAnswers}
  <button on:click={() => (showAnswers = true)}>Show answers</button>
{:else}
  <button on:click={() => (showAnswers = false)}>Hide answers</button>
{/if}
    <a class="button button-clear" href="/articles/{articleInfo.unitNumber}/{articleInfo.lineNumber}/{articleInfo.id}/{level}/answers">Answers</a>

{#if answers && answers.length > 0 && showAnswers}
  {@html answers}
{/if}

</div>

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
