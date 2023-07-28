import chalk from 'chalk'
import clipboard from 'clipboardy'
import inquirer from 'inquirer'
import { readFile, writeFile, readdir } from 'node:fs/promises'
import wordwrap from 'wordwrapjs'
import { marked } from 'marked'
import { parseArticleFileName } from '../make-index.js'

const articlesPerLine = 10
const linesPerUnit = 3
const numberOfUnits = 6

const articleTopicsTemplate = `# Unit [N]

let page = 'start'

## Line 1

[ Insert list of topics]

## Line 2

[ Insert list of topics]

## Line 3

[ Insert list of topics]
`
const storeFile = 'prompter/store.json'
const articleIndexFile = 'src/lib/article-index.json'
const articlesDirectory = 'static/articles-md/'

function exit() {
  console.log('👋 Bye!')
  process.exit()
}

function newPage(heading) {
  console.clear()
  showHeadline('Prompt Helper - ' + heading)
  statusCheck()
  console.log()
}

function promptsStored() {
  return !!store.articleTopicPrompt && !!store.articleGenerationPrompt && store.articleGenerationPromptB
}

async function writeStore() {
  writeFile(storeFile, JSON.stringify(store), 'utf8')
}

function showTextBlock(text) {
  const wrappedText = wordwrap.wrap(text, { width: 80 })
  for (const line of wrappedText.split('\n')) {
    console.log('    ' + chalk.green(line))
  }
}

// first look at articles-index and compare it to the titles-list in prompter.json

const articleIndexRaw = await readFile(articleIndexFile, 'utf8')
const articleIndex = JSON.parse(articleIndexRaw)
const storeRaw = await readFile(storeFile, 'utf8')
const store = JSON.parse(storeRaw)

let linesWithWrongNumberOfArticles = []

function showHeadline(string) {
  console.log('\n' + chalk.underline.magentaBright('   ' + string + '   ') + chalk.reset('\n'))
}

// Check if the articleIndex has the numberOfUnits, linesPerUnit and articlesPerLine defined above
function statusCheck() {
  const unitsWithWrongNumberOfLines = []
  linesWithWrongNumberOfArticles = []
  console.log(`${articleIndex.unitsOfInquiry.length === numberOfUnits ? '✅' : '❌'} ${numberOfUnits} units in index`)
  // check each unit for number of lines
  for (const unit of articleIndex.unitsOfInquiry) {
    const actualNumberOfLines = unit.linesOfInquiry.length
    if (actualNumberOfLines === linesPerUnit) {
      // check each line for number of articles
      for (const line of unit.linesOfInquiry) {
        const actualNumberOfArticles = line.articles.length
        if (actualNumberOfArticles !== articlesPerLine) {
          linesWithWrongNumberOfArticles.push(`${unit.id}-${line.id}-${actualNumberOfArticles}`)
        }
      }
    } else {
      unitsWithWrongNumberOfLines.push(unit.id)
    }
  }
  console.log(`${unitsWithWrongNumberOfLines.length ? '❌' : '✅'} ${linesPerUnit} lines in all units.`)
  if (unitsWithWrongNumberOfLines.length) {
    console.log(`    Units without all lines of inquiry: unitsWithWrongNumberOfLines.join(', ')}`)
  }
  console.log(`${linesWithWrongNumberOfArticles.length ? '❌' : '✅'} ${articlesPerLine} articles in each line.`)
  console.log(`${store.articleTopicPrompt ? '✅' : '❌'} Article topics prompt stored.`)
  console.log(`${store.articleTopics ? '✅' : '❌'} Article topics stored.`)
  console.log(`${store.articleGenerationPrompt ? '✅' : '❌'} Article generation prompt stored.`)
  console.log(`${store.articleGenerationPromptB ? '✅' : '❌'} Alternate level article generation prompt stored.`)
}

// at this point we can check out prompter.json to see if there is a set of 
// generated articles matching on of the units with missing articles.
// At that point we branch.
//
// if there is a set of article titles and that matches one of the 
// linesWithWrongNumberOfArticles then ask user if they want to use them to generate articles
// otherwise we ask them if they want to generate article titles for the next empty unit.

async function continuePrompt() {
  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'continue',
      mesasge: "Would you like to continue?",
      default: true
    }
  ])
  if (!answers.continue) {
    exit()
  }
}

async function promptMenu(promptKey, name) {
  while (true) {
    newPage(name)
    const choices = ['Go Back', 'Exit']
    if (store[promptKey]) {
      choices.push('Edit', 'View', 'Delete')
    } else {
      choices.push('Add')
    }
    const answersMenu = await inquirer.prompt([
      {
        type: 'list',
        name: 'prompt',
        message: `What would you like to do with the ${name} prompt?`,
        choices
      }
    ])
    if (answersMenu.prompt === 'Edit' || answersMenu.prompt === 'Add') {
      await promptEditMenu(promptKey, name)
    }
    if (answersMenu.prompt === 'View') {
      showTextBlock(store[promptKey])
      await continuePrompt()
    }
    if (answersMenu.prompt === 'Delete') {
      delete store[promptKey]
      await writeStore()
    }
    if (answersMenu.prompt === 'Go Back') {
      break
    }
    if (answersMenu.prompt === 'Exit') {
      exit()
    }
  }
}

async function promptEditMenu(promptKey, name) {
  const answers = await inquirer.prompt([
    {
      type: 'editor',
      name: 'editPrompt',
      message: `Edit ${name} prompt`,
      default: store[promptKey],
      filter: (prompt) => prompt.trim()
    }
  ])
  if (answers.editPrompt) {
    store[promptKey] = answers.editPrompt
    await writeStore()
    console.log(`${name} prompt saved`)
    await continuePrompt()
  }
}

async function allPromptsMenu() {
  while (true) {
    const answersMenu = await inquirer.prompt([
      {
        type: 'list',
        name: 'prompt',
        message: "Which prompt would you like to manage?",
        choices: ['Article topics', 'Article generation', 'Alternate level article generation', 'Back', 'Exit']
      }
    ])
    if (answersMenu.prompt === 'Article topics') {
      await promptMenu('articleTopicPrompt', answersMenu.prompt)
    }
    if (answersMenu.prompt === 'Article generation') {
      await promptMenu('articleGenerationPrompt', answersMenu.prompt)
    }
    if (answersMenu.prompt === 'Alternate level article generation') {
      await promptMenu('articleGenerationPromptB', answersMenu.prompt)
    }
    if (answersMenu.prompt === 'Back') {
      break
    }
    if (answersMenu.prompt === 'Exit') {
      exit()
    }
  }
}

async function generateArticlesMenu() {
  while (true) {
    newPage('Generating articles')
    if (store.articleGenerationPrompt) {
      console.log(chalk.green('We have an article generation prompt stored'))

      const answersMenu = await inquirer.prompt([
        {
          type: 'list',
          message: 'What would you like to do?',
          name: "whatToDo",
          choices: ['Use', 'View', 'Edit', 'Delete', 'Back to main menu', 'Exit'],
        }
      ])
      if (answersMenu.whatToDo === 'View') {
        showTextBlock(store.articleGenerationPrompt)
        await continuePrompt()
      } else if (answersMenu.whatToDo === 'Edit') {
        await editArticleTopics()
      } else if (answersMenu.whatToDo === 'Delete') {
        await deleteArticles()
      } else if (answersMenu.whatToDo === 'Back to main menu') {
        break
      } else if (answersMenu.whatToDo === 'Exit') {
        exit()
      } else if (answersMenu.whatToDo === 'Use') {
        await generateAnArticle()
      }
    } else {
      console.log(chalk.red('We don\'t have an article generation prompt stored'))
      await promptMenu('articleGenerationPrompt', 'Article generation prompt')
    }

  }
}

async function generateAnArticle() {
  const topicsLexer = marked.lexer(store.articleTopics).filter(item => item.type !== 'space')
  const unit = topicsLexer[0].text.replace('Unit ', '')
  const topics = []

  topics.push(topicsLexer[2].items.map(item => item.text))
  topics.push(topicsLexer[4].items.map(item => item.text))
  topics.push(topicsLexer[6].items.map(item => item.text))
  // Take it one line at a time. Look at the first item of list type. Then look for the preceding item of heading type
  // It might be nice to autoselect the next line and then default to the next article
  // console.log(linesWithWrongNumberOfArticles.filter(line => line.startsWith(unit)))
  // the number of articles this script will think exists wont be up to date unless we look at the actuall directory
  const articleFiles = await readdir(articlesDirectory)
  const parsedFiles = []
  for (const articleFile of articleFiles) {
    parsedFiles.push(await parseArticleFileName(articleFile))
  }
  const lastArticle = parsedFiles[parsedFiles.length - 1]
  // console.log(parsedFiles)
  console.log(`The last article in the articles directory is: \n"${chalk.blueBright(lastArticle.title)}"`)
  console.log(chalk.blueBright(`Unit ${lastArticle.unitNumber}, line ${lastArticle.lineNumber}, article #${lastArticle.id}`))

  const answersLine = await inquirer.prompt([
    {
      type: "list",
      name: "line",
      message: "Which line of inquiry to generate an article for now?",
      choices: [
        { name: '1. ' + articleIndex.unitsOfInquiry[parseInt(unit) - 1].linesOfInquiry[0].name, value: '1' },
        { name: '2. ' + articleIndex.unitsOfInquiry[parseInt(unit) - 1].linesOfInquiry[1].name, value: '2' },
        { name: '3. ' + articleIndex.unitsOfInquiry[parseInt(unit) - 1].linesOfInquiry[2].name, value: '3' },
      ]
    }
  ])

  const choices = topics[answersLine.line - 1].map((topic, index) => {
    return { name: `#${index + 1} ${topic}`, value: topic }
  })
  const nextNumber = (answersLine.line === lastArticle.lineNumber) ? lastArticle.id + 1 : '1'
  const nextTitle = choices[nextNumber - 1]
  const answersTitle = await inquirer.prompt([
    {
      type: 'list',
      name: 'title',
      message: "Which article would you like to generate?",
      choices,
      default: nextTitle,
    }
  ])
  const promptWithSubstitution = store.articleGenerationPrompt.replace('%ARTICLE_TITLE%', answersTitle.title)
  clipboard.writeSync(promptWithSubstitution)
  showTextBlock(promptWithSubstitution)
  console.log("Copied article generation prompt to clipboard")
  const answersJustWait = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'continue',
      message: "Have you run the prompt?",
      default: true
    }
  ])
  if (!answersJustWait.continue) {
    return
  }
  clipboard.writeSync(store.articleGenerationPromptB)
  showTextBlock(store.articleGenerationPromptB)
  console.log("Copied alternate prompt to Clipboard")
  console.log("We'll run this one before saving either to file.")
  const answersDone = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'continue',
      message: "Have you run the alternate article prompt?",
      default: true
    }
  ])
  if (!answersDone.continue) {
    return
  }
  await editArticle(undefined, unit, line, nextNumber, 'A')

  const answersNext = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'continue',
      message: "Ready to do the same thing with the alternate text?",
      default: true
    }
  ])
  if (!answersNext.continue) {
    return
  }
  await editArticle(undefined, unit, line, nextNumber, 'B')
  console.log('🥳 Another article fully generated and saved.')
  console.log(`Run ${chalk.redBright('npm run index')} to complete processing of your new article.`)

  continuePrompt()
}

async function editArticle(text, unit, line, articleNumber, level) {
  const answersWriteArticle = await inquirer.prompt([
    {
      type: 'editor',
      name: 'writeArticle',
      message: "Copy the article you generated into a (temporary) markdown file to save it.",
      postfix: '.md',
      default: text
    },
  ])
  if (answersWriteArticle.writeArticle && answersWriteArticle.save) {
    await writeArticle(answersWriteArticle.writeArticle, unit, line, nextNumber, level)
  }

}

async function writeArticle(text, unit, line, articleNumber, level) {
  const id = parseInt(articleNumber).padLeft(2, '0')
  const path = `${articlesDirectory}/${unit}${line}${id}${level}.md`
  const answersSave = await inquirer.prompt([
    {
      type: 'list',
      name: 'save',
      message: `Save article to ${path}?`,
      choices: ["Save", "Exit", "Continue without saving", "Edit again"],
      default: "Save"
    }
  ])
  if (answersSave.save === 'Exit') {
    exit()
  }
  if (answersSave.save === "Continue without saving") {
    return
  }
  if (answersSave.save === "Edit again") {
    await editArticle(text, unit, line, articleNumber, level)
  }
  if (answersSave.save === "Save") {
    try {
      await writeFile(path, text)
      console.log(chalk.green(`Article saved to ${path}`))
      return
    } catch (error) {
      console.error(error)
    }
  }
}

async function editArticleTopics() {
  try {
    const answers = await inquirer.prompt([
      {
        type: "editor",
        postfix: ".md",
        default: store.articleTopics || articleTopicsTemplate,
        name: "articleTopics",
        message: "Edit article topics"
      }
    ])
    if (answers.articleTopics) {
      store.articleTopics = answers.articleTopics
      await writeStore()
      console.log("Article topics saved")
    }
  } catch (error) {
    console.error(error)
  }
}

async function topicsMenu() {
  newPage('Article Topics')
  while (true) {
    console.log('We have the following prompt to generate article topics')
    showTextBlock(store.articleTopicPrompt)
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
      await editArticleTopics()
    } else {
      const answersMenu = await inquirer.prompt([
        {
          type: 'list',
          name: 'whatToDo',
          message: 'What would you like to do?',
          choices: ['Go Back', 'Exit', 'Edit', 'Delete']
        }
      ])
      if (answersMenu.whatToDo === 'Go Back') {
        break
      }
      if (answersMenu.whatToDo === 'Exit') {
        exit()
      }
      if (answersMenu.whatToDo === 'Edit') {
        await promptEditMenu('articleTopicPrompt', 'Article topics')
      }
      if (answersMenu.whatToDo === 'Delete') {
        console.log('Prompt has been deleted.')
        delete store.articleTopicPrompt
        await writeStore()
      }
    }
  }
}

async function mainMenu() {
  newPage('Main Menu')
  console.log('Looks like you\'re all set to start generating articles. 🚀')
  const answersMenu = await inquirer.prompt([
    {
      type: 'list',
      name: 'mainMenu',
      message: 'What would you like to do?',
      choices: ['Article topics', 'Generate Articles', 'Prompts', 'Exit']
    }
  ])
  if (answersMenu.mainMenu === 'Article topics') {
    await topicsMenu()
  }
  if (answersMenu.mainMenu === 'Generate Articles') {
    await generateArticlesMenu()
  }
  if (answersMenu.mainMenu === 'Prompts') {
    await allPromptsMenu()
  }
  if (answersMenu.mainMenu === 'Exit') {
    exit()
  }
}

// ---------------------
// Main loop starts here
// ---------------------
while (true) {
  newPage("Start")
  // some of this actually very sequential
  // if we don't have all the prompts then we should take care of that first
  if (!promptsStored()) {
    console.log('Let\'s get those prompts stored first.')
    // This point we can go through them one by one. Each one has the same menu loop
    await allPromptsMenu()
    continue
  } else if (store.articleTopics?.length === 0) {
    console.log('We have prompts. Now we need article topics.')
    await topicsMenu()
    continue
  } else {
    await mainMenu()
  }
}
