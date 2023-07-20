import articleIndex from '$lib/article-index.json'
import { parseArticleFromText } from '$lib/utils.js'

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
  const unitNumber = Number.parseInt(params.unit)
  const unitOfInquiry = articleIndex.unitsOfInquiry.find(
    (u) => u.id === unitNumber,
  )
  if (!unitOfInquiry) {
    return {
      error: 'Unit not found',
    }
  }
  const lineNumber = Number.parseInt(params.lineOfInquiry)
  const lineOfInquiry = unitOfInquiry.linesOfInquiry.find(
    (l) => l.id === lineNumber,
  )
  if (!unitOfInquiry) {
    return {
      error: 'Line of inquiry not found',
    }
  }
  const articleNumber = Number.parseInt(params.number)
  const articleInfo = lineOfInquiry.articles.find((a) => a.id === articleNumber)
  if (!articleInfo) {
    return {
      error: 'Article not found',
    }
  }

  const response = await fetch(
    '/articles-md/' +
      unitNumber +
      lineNumber +
      articleNumber +
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
