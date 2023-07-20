import { parseArticleFromText, getArticleInfoFromSlug } from '$lib/utils.js'

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
  const { slug, level } = params

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

  const url = `/articles-md/${unitNumber}${lineNumber}${articleInfo.id}${level}-${slug}.md`
  const response = await fetch(url)
  const text = await response.text()

  return {
    articleInfo,
    ...parseArticleFromText(text),
  }
}
