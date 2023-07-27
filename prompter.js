// An interactive prompt generator using some of the data we've collected
import inquirer from 'inquirer'
import chalk from 'chalk'
import clipboard from 'clipboardy'
import { spawn } from 'node:child_process'
import { readFile, writeFile, unlink } from 'node:fs/promises'

const articlesPerLine = 10
const linesPerUnit = 3
const numberOfUnits = 6

let hasRightNumberOfUnits = false
let hasRightNumberOfLines = false

console.log("Hi! Let's generate some articles")

async function writeStore() {
  writeFile('./prompter.json', JSON.stringify(store), 'utf8')
}
async function openEditor(filePath) {
  const editorPromise = new Promise((resolve, reject) => {
    const editor = spawn(process.env.EDITOR, [filePath], { stdio: 'inherit' })
    editor.on('close', resolve)
    editor.on('error', reject)
  })
  return editorPromise
}

// first look at articles-index and compare it to the titles-list in prompter.json

const articleIndexRaw = await readFile('./src/lib/article-index.json', 'utf8')
const articleIndex = JSON.parse(articleIndexRaw)
const storeRaw = await readFile('./prompter.json', 'utf8')
const store = JSON.parse(storeRaw)


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
} else {
  console.log('Looks like we have all the articles we need. Bye!')
  process.exit(0)
}

// in theory we could also check if the articles have the right number of versions but I'm too lazy to write it now
if (!hasRightNumberOfUnits || !hasRightNumberOfLines) {
  console.log(chalk.red('Please fix the Units of Inquiry outline in article-index.json before continuing.'))
  process.exit(1)
}

// at this point we can check out prompter.json to see if there is a set of 
// generated articles matching on of the units with missing articles.
// At that point we branch.
//
// if there is a set of article titles and that matches one of the 
// linesWithWrongNumberOfArticles then ask user if they want to use them to generate articles
// otherwise we ask them if they want to generate article titles for the next empty unit.
async function newPrompt() {
  if (store.articleTopicPrompt) {
    return
  }
  while (!store.articleTopicPrompt) {
    console.log('There is no article topics prompt stored.')
    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'AddPrompt',
        message: 'Add a new articles topic prompt?',
        default: true,
      }
    ])
    // if yes we open $EDITOR /tmp/topic-prompt
    if (answers.AddPrompt) {
      const tmpPromptFile = '/tmp/topic-prompt.txt'
      try {
        await openEditor(tmpPromptFile)
        const text = await readFile(tmpPromptFile, 'utf8')
        await unlink(tmpPromptFile)
        const newPrompt = text.split('\n').slice(1).join('\n').trim()
        console.log('Your new article topics prompt: ')
        for (const line of newPrompt.split('\n')) {
          console.log('    ' + chalk.green(line))
        }
        const answers = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'saveTopicsPrompt',
            message: 'Save the above prompt?',
            default: true,
          }
        ])
        if (answers.saveTopicsPrompt) {
          store.articleTopicPrompt = newPrompt
          await writeStore()
        }
      } catch (error) {
        console.error(error)
      }
    } else {
      console.log('Bye!')
      process.exit(0)
    }
  }
}

await newPrompt()

if (store.articleTopicPrompt) {
  console.log('We have the following prompt to generate article topics')
  for (const line of store.articleTopicPrompt.split('\n')) {
    console.log('    ' + chalk.green(line))
  }
  // ask if they want to use the prompt or edit it
  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'useTopicsPrompt',
      message: 'Use the above prompt?',
      default: true,
    }
  ])
  // if yes it to the clipboard with clipboardy
  if (answers.useTopicsPrompt) {
    console.log('Prompt has been copied to clipoard and is ready to use.')
    clipboard.writeSync(store.articleTopicPrompt)
    // ask them if they are ready. Then when they press enter open the editor again
    const answers = await inquirer.prompt([
      {
        type: "editor",
        name: "articleTopics",
        message: "Article topics"
      }
    ])
    if (answers.articleTopics) {
      store.articleTopics = answers.articleTopics
      await writeStore()
    }
  } else {
    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'deleteTopicsPrompt',
        message: 'Delete the above prompt and store a new one?',
        default: false,
      }
    ])
    if (answers.deleteTopicsPrompt) {
      console.log('Prompt has been deleted.')
      delete store.articleTopicPrompt
      await writeStore()
      await newPrompt()
    }
  }
}
// ask user if they want to add one.
// if no we say goodbye and exit
if (store?.articleTopics?.length) {
  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'useArticleTopics',
      message: 'Use article topics from prompter.json?',
      default: true,
    }
  ])
} else {
  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'generateArticleTopics',
      message: 'Generate article topics?',
      default: true,
    }
  ])
}
