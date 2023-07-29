import { readdir, readFile, writeFile } from 'node:fs/promises'
// import wordwrap from 'wordwrapjs'

const articlesDirectory = './static/articles-md/'
const articles = await readdir(articlesDirectory)

// function wrapLines(text) {
//  wordwrap.wrap(text, { width: 80 })
// }
//
function addLineBeforeAnswerKey(text) {
  const lines = text.split('\n')
  const AnswerKeyHeadingIndex = lines.findIndex((line) =>
    line.startsWith('## Answer Key'),
  )
  // is it preceded by a blank line?
  if (lines[AnswerKeyHeadingIndex - 1]?.trim()) {
    lines.splice(AnswerKeyHeadingIndex, 0, '')
  }
  return lines.join('\n')
}

function eliminateSpacesBetweenAnswerKeyItems(text) {
  const lines = text.split('\n').map((line) => line)
  const AnswerKeyHeadingIndex = lines.findIndex((line) =>
    line.startsWith('## Answer Key'),
  )
  const cleanedLines = lines.filter((line, index) => {
    if (index > AnswerKeyHeadingIndex + 1 && !line) {
      return false
    }
    return true
  })
  return cleanedLines.join('\n')
}

function fixWrongLevelHeadings(text) {
  let newText = text.replaceAll('# Glossary', '## Glossary')
  newText = newText.replaceAll('### Glossary', '## Glossary')
  newText = newText.replaceAll(
    '# Reading Comprehension Questions',
    '## Reading Comprehension Questions',
  )
  newText = newText.replaceAll(
    '### Reading Comprehension Questions',
    '## Reading Comprehension Questions',
  )
  newText = newText.replaceAll('# Answer Key', '## Answer Key')
  return newText.replaceAll('### Answer Key', '## Answer Key')
}

// replace '- A. dog' with 'A. dog'
function noLIanswers(text) {
  const lines = text.split('\n')
  for (const line in lines) {
    const answersRegex = /^\s*-\s[A-Da-d]\.|\)\s/
    if (answersRegex.test(lines[line])) {
      lines[line] = lines[line].replace('-', '')
    }
  }
  return lines.join('\n')
}
// replace a) with a.
function dotsNotParentheses(text) {
  const lines = text.split('\n')
  for (const line in lines) {
    const answersRegex = /^\s*[A-Da-d]\.|\)\s/
    if (answersRegex.test(lines[line])) {
      const regex = /^(\s*[A-Da-d]\))|(\s*[A-Da-d]\.\s*)/
      const replacement = (match, p1) => {
        if (p1) {
          return p1.replace(')', '.')
        }
        return match
      }
      lines[line] = lines[line].replace(regex, replacement)
    }
  }
  return lines.join('\n')
}

// exactly three spaces before answers
function replaceWhitespace(line) {
  const answersRegex = /^\s*[A-Da-d]\.\s/
  if (answersRegex.test(line)) {
    return line.replace(/^\s*/, '   ')
  }
  return line
}

function lowercaseAnswersInAnswerKey(text) {
  const lines = text.split('\n')
  const AnswerKeyHeadingIndex = lines.findIndex((line) =>
    line.startsWith('## Answer Key'),
  )
  const cleanedLines = lines.map((line, index) => {
    if (index > AnswerKeyHeadingIndex + 1 && line) {
      return line.toLowerCase()
    }
    return line
  })
  return cleanedLines.join('\n')
}

// replace A. with a.
function lowercaseAnswerLabels(string_) {
  return string_.replaceAll(/^\s*[A-D]\./gm, function(match) {
    return match.toLowerCase()
  })
}

function deleteBeforeFirstHeading(markdownText) {
  const lines = markdownText.split('\n')
  const firstHeadingIndex = lines.findIndex((line) => line.startsWith('# '))
  if (firstHeadingIndex !== -1) {
    return lines.slice(firstHeadingIndex).join('\n')
  }
  // If no first-level heading is found, return the original text
  return markdownText
}

function removeExtraBlankLinesBetweenAnswers(text) {
  const regexAnswerBlanks = /(?<=\n\s*[a-d]\.\s*.*$)(\n\s*\n)(?!\d)/gm
  const substAnswerBlanks = '\n'
  return text.replaceAll(regexAnswerBlanks, substAnswerBlanks)
}

for (const article of articles) {
  const text = await readFile(articlesDirectory + article, 'utf8')

  let cleanText = deleteBeforeFirstHeading(text)
  // hard wrap is nice but it breaks our answers.
  // consider just skipping answers when running it
  // cleanText = wordwrap.wrap(cleanText, { width: 80 })
  cleanText = dotsNotParentheses(cleanText)
  cleanText = noLIanswers(cleanText)
  cleanText = lowercaseAnswerLabels(cleanText)
  cleanText = removeExtraBlankLinesBetweenAnswers(cleanText)
  cleanText = fixWrongLevelHeadings(cleanText)
  cleanText = cleanText
    .split('\n')
    .map((line) => replaceWhitespace(line))
    .join('\n')
  cleanText = eliminateSpacesBetweenAnswerKeyItems(cleanText)
  cleanText = addLineBeforeAnswerKey(cleanText)
  cleanText = lowercaseAnswersInAnswerKey(cleanText)
  await writeFile(articlesDirectory + article, cleanText)
}
