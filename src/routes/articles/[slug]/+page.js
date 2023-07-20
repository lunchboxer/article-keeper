import articleIndex from '$lib/article-index.json'
import { parseArticleFromText } from '$lib/utils.js'

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
  const { slug } = params
  let unitNumber
  let lineNumber
  let lineName
  let articleInfo

  for (const unit of articleIndex.unitsOfInquiry) {
    for (const lineOfInquiry of unit.linesOfInquiry) {
      for (const article of lineOfInquiry.articles) {
        if (article.slug === slug) {
          articleInfo = article
          unitNumber = unit.id
          lineNumber = lineOfInquiry.id
          lineName = lineOfInquiry.name
          break
        }
      }
    }
  }

  if (!articleInfo) {
    return {
      error: 'Article not found',
    }
  }
  articleInfo.unit = unitNumber
  articleInfo.lineNum = lineNumber
  articleInfo.lineName = lineName

  const response = await fetch(
    '/articles-md/' +
      unitNumber +
      lineNumber +
      articleInfo.id +
      'A-' +
      articleInfo.slug +
      '.md',
  )
  const text = await response.text()
  return {
    articleInfo,
    ...parseArticleFromText(text),
  }
}
