// An interactive prompt generator using some of the data we've collected
import inquirer from 'inquirer'
import chalk from 'chalk'
import { readFile, writeFile } from 'node:fs/promises'

const articlesPerLine = 10
const linesPerUnit = 3
const numberOfUnits = 6

let hasRightNumberOfUnits = false
let hasRightNumberOfLines = false

console.log("Hi! Let's generate some articles")

// first look at articles-index and compare it to the titles-list in prompter.json

const articleIndexRaw = await readFile('./src/lib/article-index.json', 'utf8')
const articleIndex = JSON.parse(articleIndexRaw)
const storeRaw = await readFile('./prompter.json', 'utf8')
const store = JSON.parse(articleIndexRaw)

// Check if the articleIndex has the numberOfUnits, linesPerUnit and articlesPerLine defined above
const actualNumberOfUnits = articleIndex.unitsOfInquiry.length
hasRightNumberOfUnits = (actualNumberOfUnits === numberOfUnits)
console.log(`${hasRightNumberOfUnits ? '✅' : '❌'} - ${numberOfUnits} units in index`)
// check each unit for number of lines
const unitsWithRightNumberOfLines = []
const unitsWithWrongNumberOfLines = []
const linesWithWrongNumberOfArticles = []
for (const unit of articleIndex.unitsOfInquiry) {
  const actualNumberOfLines = unit.linesOfInquiry.length
  if (actualNumberOfLines === linesPerUnit) {
    unitsWithRightNumberOfLines.push(unit.id)
    // check each line for number of articles
    for (const line of unit.linesOfInquiry) {
      const actualNumberOfArticles = line.articles.length
      if (actualNumberOfArticles !== articlesPerLine) {
        linesWithWrongNumberOfArticles.push(`${unit.id}-${line.id} - ${actualNumberOfArticles} articles`)
      }
    }
  } else {
    unitsWithWrongNumberOfLines.push(unit.id)
  }
}
hasRightNumberOfLines = (unitsWithRightNumberOfLines.length === numberOfUnits)
console.log(`${hasRightNumberOfLines ? '✅' : '❌'} - ${linesPerUnit} lines in all units`)
if (unitsWithWrongNumberOfLines.length) {
  console.log(`    Units without all lines of inquiry: unitsWithWrongNumberOfLines.join(', ')}`)
}
console.log(`${linesWithWrongNumberOfArticles.length ? '❌' : '✅'} - ${articlesPerLine} articles in each line`)
if (linesWithWrongNumberOfArticles.length) {
  console.log('Lines with wrong number of articles:')
  for (const line of linesWithWrongNumberOfArticles) {
    console.log(`  ${line}`)
  }
}

