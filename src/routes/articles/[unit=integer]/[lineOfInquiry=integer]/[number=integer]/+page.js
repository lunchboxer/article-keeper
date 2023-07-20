import articleIndex from '$lib/article-index.json';
import { parseArticleFromText } from '$lib/utils.js';

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
  const unitNum = parseInt(params.unit);
  const unitOfInquiry = articleIndex.unitsOfInquiry.find(u => u.id === unitNum)
  if (!unitOfInquiry) {
    return {
      error: "Unit not found"
    }
  }
  const lineNum = parseInt(params.lineOfInquiry)
  const lineOfInquiry = unitOfInquiry.linesOfInquiry.find(l => l.id === lineNum)
  if (!unitOfInquiry) {
    return {
      error: "Line of inquiry not found"
    }
  }
  const articleNum = parseInt(params.number)
  const articleInfo = lineOfInquiry.articles.find(a => a.id === articleNum)
  if (!articleInfo) {
    return {
      error: "Article not found"
    }
  }

  const response = await fetch('/articles-md/' + unitNum + lineNum + articleNum + 'A-' + articleInfo.slug + '.md')
  const text = await response.text()
  return {
    articleInfo,
    ...parseArticleFromText(text)

  }

}

