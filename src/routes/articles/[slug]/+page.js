import { parseArticleFromText, getArticleInfoFromSlug } from '$lib/utils.js'

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
  const { slug } = params
  const level = 'A'
  const { articleInfo, unitNumber, lineNumber, lineName } =
    getArticleInfoFromSlug(slug)

  if (!articleInfo) {
    return {
      error: 'Article not found',
    }
  }
  articleInfo.unit = unitNumber
  articleInfo.lineNum = lineNumber
  articleInfo.lineName = lineName
  articleInfo.level = level

  const response = await fetch(
    `/articles-md/${unitNumber}${lineNumber}${articleInfo.id}${level}-${slug}.md`,
  )
  const text = await response.text()
  return {
    articleInfo,
    ...parseArticleFromText(text),
  }
}
