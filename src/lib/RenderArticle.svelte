<script>
  import '../print.css'
  export let articleInfo
  export let article = ''
  export let questions = []
  export let answers = ''
  export let level = ''
  export let unitName = ''
  export let lineName = ''
</script>

{#if article && articleInfo}
  <p class="article-info">Article-a-day - Unit {unitName}, {lineName} #{articleInfo.id} text {level}</p>
  {@html article}
{/if}

{#if questions.length > 0}
  <div class="new-page">
  <p class="article-info print-only">Article-a-day - Unit {unitName}, {lineName} #{articleInfo.id} text {level}</p>
    <div class="heading-wrapper">
  <h2>Questions</h2>
    <div class="name-date">
  <p class="print-only">Name:<span class="line">__________________</span></p>
        <br/>
  <p class="print-only">Date:<span class="line">__________________</span></p>
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
  <p class="article-info print-only">Article-a-day - Unit {unitName}, {lineName} #{articleInfo.id} text {level}</p>

  {@html answers}
</div>
{/if}

  <style>
  .heading-wrapper {
    display: flex;
  width: 100%;
  justify-content: space-between;
  }
  .name-date {
  text-align: right;
  }
.answers {
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
</style>
