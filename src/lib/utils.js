import { marked } from 'marked'

export const parseArticleFromText = (text) => {
  if (text === '') {
    return {
      error: "Article not found"
    }
  }
  const articleLexer = (marked.lexer(text))
  // get the list after the heading "Reading Comprehension Questions"
  // first identify the index of the right heading
  const questionHeadingIndex = articleLexer.findIndex(l => l.type === 'heading' && l.text === 'Reading Comprehension Questions')
  const questionsMarked = articleLexer[questionHeadingIndex + 1]?.items
  const questions = questionsMarked.map(question => {
    const text = question.text?.split('\n\n')
    const answers = text[1].split('\n').filter(string => string !== '')
    return { question: text[0], answers }

  })

  const article = marked.Parser.parse(articleLexer.slice(0, questionHeadingIndex))

  const answerHeadingIndex = articleLexer.findIndex(l => l.type === 'heading' && l.text === 'Answer Key')
  const answers = marked.Parser.parse(articleLexer.slice(answerHeadingIndex))

  return {
    article,
    questions,
    answers
  }
}
