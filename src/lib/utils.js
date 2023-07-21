import { marked } from 'marked'
import articleIndex from '$lib/article-index.json'

export const getArticleInfoFromSlug = (slug) => {
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
  return { articleInfo, unitNumber, lineNumber, lineName }
}

export async function fetchArticleFromSlug(slug, level, fetch) {
  const { articleInfo, unitNumber, lineNumber, lineName } =
    getArticleInfoFromSlug(slug)

  if (!articleInfo) {
    return {
      error: 'Article not found',
    }
  }

  if (!articleInfo?.versions?.includes(level)) {
    return {
      error: 'Level not found',
    }
  }
  articleInfo.unit = unitNumber
  articleInfo.lineNum = lineNumber
  articleInfo.lineName = lineName
  articleInfo.level = level

  // in case we have more than 9 articles
  const id = String(articleInfo.id).padStart(2, '0')
  const response = await fetch(
    `/articles-md/${unitNumber}${lineNumber}${id}${level}-${slug}.md`,
  )
  const text = await response.text()
  return {
    articleInfo,
    ...parseArticleFromText(text),
  }
}

// Fetch Article From Info
export async function fetchArticleFromInfo(unit, line, number, level, fetch) {
  const unitOfInquiry = articleIndex.unitsOfInquiry.find((u) => u.id === unit)
  if (!unitOfInquiry) {
    return {
      error: 'Unit not found',
    }
  }
  const lineOfInquiry = unitOfInquiry.linesOfInquiry.find((l) => l.id === line)
  if (!lineOfInquiry) {
    return {
      error: 'Line of inquiry not found',
    }
  }
  const articleInfo = lineOfInquiry.articles.find((a) => a.id === number)
  if (!articleInfo) {
    return {
      error: 'Article not found',
    }
  }
  if (!articleInfo?.versions?.includes(level)) {
    return {
      error: 'Level not found',
    }
  }

  // in case we have more than 9 articles
  const id = String(articleInfo.id).padStart(2, '0')
  const response = await fetch(
    `/articles-md/${unit}${line}${id}${level}-${articleInfo.slug}.md`,
  )
  const text = await response.text()
  return {
    articleInfo,
    ...parseArticleFromText(text),
  }
}

export const parseArticleFromText = (text) => {
  if (text === '') {
    return {
      error: 'Article not found',
    }
  }
  const articleLexer = marked.lexer(text)
  // get the list after the heading "Reading Comprehension Questions"
  // first identify the index of the right heading
  const questionHeadingIndex = articleLexer.findIndex(
    (l) => l.type === 'heading' && l.text === 'Reading Comprehension Questions',
  )
  const questionsMarked = articleLexer[questionHeadingIndex + 1]?.items
  const questions = questionsMarked.map((question) => {
    const text = question.text?.split('\n\n')
    const answers = text[1].split('\n').filter((string) => string !== '')
    return { question: text[0], answers }
  })

  const article = marked.Parser.parse(
    articleLexer.slice(0, questionHeadingIndex),
  )

  const answerHeadingIndex = articleLexer.findIndex(
    (l) => l.type === 'heading' && l.text === 'Answer Key',
  )
  const answers = marked.Parser.parse(articleLexer.slice(answerHeadingIndex))

  return {
    article,
    questions,
    answers,
  }
}
