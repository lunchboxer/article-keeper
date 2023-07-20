import articleIndex from '$lib/article-index.json';
import { parseArticleFromText } from '$lib/utils.js';

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
  const { slug } = params
  let unitNum
  let lineNum
  let articleInfo = ''
  for (const unit of articleIndex.unitsOfInquiry) {
    unitNum = unit.id
    for (const lineOfInquiry of unit.linesOfInquiry) {
      lineNum = lineOfInquiry.id
      for (const article of lineOfInquiry.articles) {
        if (article.slug === slug) {
          articleInfo = article;
        }
      }
    }
  }

  if (!articleInfo) {
    return {
      error: "Article not found"
    }
  }

  console.log(articleInfo)
  const response = await fetch('/articles-md/' + unitNum + lineNum + articleInfo.id + 'A-' + articleInfo.slug + '.md')
  const text = await response.text()
  return {
    articleInfo,
    ...parseArticleFromText(text)

  }
}
