#!/usr/bin/env node

import chalk from 'chalk'
import clipboard from 'clipboardy'
import inquirer from 'inquirer'
import { readFile, writeFile, readdir } from 'node:fs/promises'
import wordwrap from 'wordwrapjs'
import { marked } from 'marked'

const articlesPerLine = 10
const linesPerUnit = 3
const numberOfUnits = 6

const articleTopicsTemplate = `# Unit [N]

## Line 1

[ Insert list of topics]

## Line 2

[ Insert list of topics]

## Line 3

[ Insert list of topics]
`
const articlesDirectory = 'static/articles-md/'

const articleIndexFile = 'src/lib/article-index.json'
const articleIndexRaw = await readFile(articleIndexFile, 'utf8')
const articleIndex = JSON.parse(articleIndexRaw)

const storeFile = 'prompter/store.json'
const storeRaw = await readFile(storeFile, 'utf8')
const store = JSON.parse(storeRaw)

let linesWithWrongNumberOfArticles = []

async function parseArticleFileName(fileName) {
  const unitNumber = Number.parseInt(fileName.slice(0, 1))
  const lineNumber = Number.parseInt(fileName.slice(1, 2))
  const id = Number.parseInt(fileName.slice(2, 4))
  const level = fileName.slice(4, 5)

  // Read the file and get the title from the first line
  const text = await readFile(articlesDirectory + fileName, 'utf8')
  const lines = text.split('\n')
  const title = lines[0].slice(2)

  return {
    unitNumber,
    lineNumber,
    id,
    level,
    title,
  }
}

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
  return (
    !!store.articleTopicPrompt &&
    !!store.articleGenerationPrompt &&
    store.articleGenerationPromptB
  )
}

async function writeStore() {
  writeFile(storeFile, JSON.stringify(store), 'utf8')
}

function showTextBlock(text) {
  const wrappedText = wordwrap.wrap(text, { width: 72 })
  for (const line of wrappedText.split('\n')) {
    console.log('    ' + chalk.green(line))
  }
}

// first look at articles-index and compare it to the titles-list in prompter.json

function showHeadline(string) {
  console.log(
    '\n' +
      chalk.underline.magentaBright('   ' + string + '   ') +
      chalk.reset('\n'),
  )
}

// Check if the articleIndex has the numberOfUnits, linesPerUnit and articlesPerLine defined above
function statusCheck() {
  const unitsWithWrongNumberOfLines = []
  linesWithWrongNumberOfArticles = []
  console.log(
    `${
      articleIndex.unitsOfInquiry.length === numberOfUnits ? '✅' : '❌'
    } ${numberOfUnits} units in index`,
  )
  // check each unit for number of lines
  for (const unit of articleIndex.unitsOfInquiry) {
    const actualNumberOfLines = unit.linesOfInquiry.length
    if (actualNumberOfLines === linesPerUnit) {
      // check each line for number of articles
      for (const line of unit.linesOfInquiry) {
        if (line.articles.length < articlesPerLine) {
          linesWithWrongNumberOfArticles.push(
            `${unit.id}-${line.id}-${line.articles.length}`,
          )
        }
      }
    } else {
      unitsWithWrongNumberOfLines.push(unit.id)
    }
  }
  console.log(
    `${
      unitsWithWrongNumberOfLines.length > 0 ? '❌' : '✅'
    } ${linesPerUnit} lines in all units.`,
  )
  if (unitsWithWrongNumberOfLines.length > 0) {
    console.log(
      "    Units without all lines of inquiry: unitsWithWrongNumberOfLines.join(', ')}",
    )
  }
  console.log(
    `${
      linesWithWrongNumberOfArticles.length > 0 ? '❌' : '✅'
    } ${articlesPerLine} articles in each line.`,
  )
  console.log(
    `${store.articleTopicPrompt ? '✅' : '❌'} Article topics prompt stored.`,
  )
  console.log(`${store.articleTopics ? '✅' : '❌'} Article topics stored.`)
  console.log(
    `${
      store.articleGenerationPrompt ? '✅' : '❌'
    } Article generation prompt stored.`,
  )
  console.log(
    `${
      store.articleGenerationPromptB ? '✅' : '❌'
    } Alternate level article generation prompt stored.`,
  )
}

async function continuePrompt() {
  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'continue',
      mesasge: 'Would you like to continue?',
      default: true,
    },
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
        choices,
      },
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
      filter: (prompt) => prompt.trim(),
    },
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
    newPage('Manage prompts')
    const answersMenu = await inquirer.prompt([
      {
        type: 'list',
        name: 'prompt',
        message: 'Which prompt would you like to manage?',
        choices: [
          'Article topics',
          'Article generation',
          'Alternate level article generation',
          'Back',
          'Exit',
        ],
      },
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
  let stayOnThisPage = true
  while (stayOnThisPage) {
    newPage('Generating articles')
    if (store.articleGenerationPrompt) {
      console.log(chalk.green('We have an article generation prompt stored'))

      const answersMenu = await inquirer.prompt([
        {
          type: 'list',
          message: 'What would you like to do?',
          name: 'whatToDo',
          choices: [
            'Generate an article',
            'View prompt',
            'Edit prompt',
            'Back to main menu',
            'Exit',
          ],
        },
      ])
      switch (answersMenu.whatToDo) {
        case 'View prompt': {
          showTextBlock(store.articleGenerationPrompt)
          await continuePrompt()
          break
        }
        case 'Edit prompt': {
          await promptEditMenu('articleGenerationPrompt', 'Article generation')
          break
        }
        case 'Generate an article': {
          await generateAnArticle()
          break
        }
        case 'Back to main menu': {
          stayOnThisPage = false
          break
        }
        case 'Exit': {
          exit()
          break
        }
      }
    } else {
      console.log(
        chalk.red("We don't have an article generation prompt stored"),
      )
      await promptMenu('articleGenerationPrompt', 'Article generation prompt')
    }
  }
}

async function generateAnArticle() {
  const topicsLexer = marked
    .lexer(store.articleTopics)
    .filter((item) => item.type !== 'space')
  const unit = topicsLexer[0].text.replace('Unit ', '')
  const topics = []

  topics.push(
    topicsLexer[2].items.map((item) => item.text),
    topicsLexer[4].items.map((item) => item.text),
    topicsLexer[6].items.map((item) => item.text),
  )

  const articleFiles = await readdir(articlesDirectory)
  const parsedFiles = []
  for (const articleFile of articleFiles) {
    parsedFiles.push(await parseArticleFileName(articleFile))
  }
  const lastArticle = parsedFiles.at(-1)
  console.log(
    `The last article in the articles directory is: \n"${chalk.blueBright(
      lastArticle.title,
    )}"`,
  )
  console.log(
    chalk.blueBright(
      `Unit ${lastArticle.unitNumber}, line ${lastArticle.lineNumber}, article #${lastArticle.id}`,
    ),
  )
  const defaultLine = linesWithWrongNumberOfArticles
    .find((line) => line.slice(0, 1) === unit)
    ?.slice(2, 3)

  const answersLine = await inquirer.prompt([
    {
      type: 'list',
      name: 'line',
      message: 'Which line of inquiry to generate an article for now?',
      choices: [
        {
          name:
            '1. ' +
            articleIndex.unitsOfInquiry[Number.parseInt(unit) - 1]
              .linesOfInquiry[0].name,
          value: '1',
        },
        {
          name:
            '2. ' +
            articleIndex.unitsOfInquiry[Number.parseInt(unit) - 1]
              .linesOfInquiry[1].name,
          value: '2',
        },
        {
          name:
            '3. ' +
            articleIndex.unitsOfInquiry[Number.parseInt(unit) - 1]
              .linesOfInquiry[2].name,
          value: '3',
        },
      ],
      default: defaultLine,
    },
  ])

  const choices = topics[answersLine.line - 1].map((topic, index) => {
    return { name: `#${index + 1} ${topic}`, value: topic }
  })
  const nextNumber =
    Number.parseInt(answersLine.line) ===
    Number.parseInt(lastArticle.lineNumber)
      ? Number.parseInt(lastArticle.id) + 1
      : '1'
  const nextTitle = choices[nextNumber - 1]
  const answersTitle = await inquirer.prompt([
    {
      type: 'list',
      name: 'title',
      message: 'Which article would you like to generate?',
      choices,
      default: nextTitle?.value,
    },
  ])
  const promptWithSubstitution = store.articleGenerationPrompt.replace(
    '%ARTICLE_TITLE%',
    answersTitle.title,
  )
  clipboard.writeSync(promptWithSubstitution)
  showTextBlock(promptWithSubstitution)
  console.log('Copied article generation prompt to clipboard')
  const answersJustWait = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'continue',
      message: 'Have you run the prompt?',
      default: true,
    },
  ])
  if (!answersJustWait.continue) {
    return
  }
  clipboard.writeSync(store.articleGenerationPromptB)
  showTextBlock(store.articleGenerationPromptB)
  console.log('Copied alternate prompt to Clipboard')
  console.log("We'll run this one before saving either to file.")
  const answersDone = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'continue',
      message: 'Have you run the alternate article prompt?',
      default: true,
    },
  ])
  if (!answersDone.continue) {
    return
  }
  await editArticle(undefined, unit, answersLine.line, nextNumber, 'A')
  await editArticle(undefined, unit, answersLine.line, nextNumber, 'B')
  continuePrompt()
}

async function editArticle(text, unit, line, articleNumber, level) {
  if (!text) {
    const answerCopy = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'copy',
        messsage: 'Insert text from clipboard automatically?',
        default: true,
      },
    ])
    if (answerCopy.copy) {
      text = clipboard.readSync()
    }
  }
  const answersWriteArticle = await inquirer.prompt([
    {
      type: 'editor',
      name: 'writeArticle',
      message: "Let's edit the text and save it to file",
      postfix: '.md',
      default: text,
    },
  ])
  if (answersWriteArticle.writeArticle) {
    await writeArticle(
      answersWriteArticle.writeArticle,
      unit,
      line,
      articleNumber,
      level,
    )
  }
}

async function writeArticle(text, unit, line, articleNumber, level) {
  const id = String(articleNumber).padStart(2, '0')
  const path = `${articlesDirectory}${unit}${line}${id}${level}.md`
  const answersSave = await inquirer.prompt([
    {
      type: 'list',
      name: 'save',
      message: `Save article to ${path}?`,
      choices: ['Save', 'Exit', 'Continue without saving', 'Edit again'],
      default: 'Save',
    },
  ])

  switch (answersSave.save) {
    case 'Exit': {
      exit()
      break
    }
    case 'Continue without saving': {
      return
    }
    case 'Edit again': {
      await editArticle(text, unit, line, articleNumber, level)
      break
    }
    case 'Save': {
      try {
        await writeFile(path, text)
        console.log(chalk.green(`Article saved to ${path}`))
      } catch (error) {
        console.error(error)
      }
      break
    }
  }
}

async function editArticleTopics() {
  try {
    const answers = await inquirer.prompt([
      {
        type: 'editor',
        postfix: '.md',
        default: store.articleTopics || articleTopicsTemplate,
        name: 'articleTopics',
        message: 'Edit article topics',
      },
    ])
    if (answers.articleTopics) {
      store.articleTopics = answers.articleTopics
      await writeStore()
      console.log('Article topics saved')
      await continuePrompt()
    }
  } catch (error) {
    console.error(error)
  }
}

async function topicsMenu() {
  let keepGoing = true
  while (keepGoing) {
    newPage('Article Topics')
    const choices = ['Generate new topics', 'View prompt', 'Edit prompt']
    if (store.articleTopics) choices.push('View topics', 'Edit topics')
    choices.push('Go back', 'Exit')
    const answersMenu = await inquirer.prompt([
      {
        type: 'list',
        name: 'whatToDo',
        message: 'What would you like to do?',
        choices,
      },
    ])
    switch (answersMenu.whatToDo) {
      case 'Generate new topics': {
        clipboard.writeSync(store.articleTopicPrompt)
        console.log('Prompt has been copied to clipoard and is ready to use.')
        await editArticleTopics()
        break
      }
      case 'View prompt': {
        showTextBlock(store.articleTopicPrompt)
        await continuePrompt()
        break
      }
      case 'View topics': {
        showTextBlock(store.articleTopics)
        await continuePrompt()
        break
      }
      case 'Edit topics': {
        await editArticleTopics()
        break
      }
      case 'Edit prompt': {
        await promptEditMenu('articleTopicPrompt', 'Article topics')
        break
      }
      case 'Go back': {
        keepGoing = false
        break
      }
      case 'Exit': {
        exit()
      }
    }
  }
}

async function mainMenu() {
  newPage('Main Menu')
  console.log("Looks like you're all set to start generating articles. 🚀")
  const answersMenu = await inquirer.prompt([
    {
      type: 'list',
      name: 'mainMenu',
      message: 'What would you like to do?',
      choices: ['Generate articles', 'Article topics', 'Prompts', 'Exit'],
    },
  ])
  switch (answersMenu.mainMenu) {
    case 'Article topics': {
      await topicsMenu()
      break
    }
    case 'Generate articles': {
      await generateArticlesMenu()
      break
    }
    case 'Prompts': {
      await allPromptsMenu()
      break
    }
    case 'Exit': {
      exit()
    }
  }
}

// ---------------------
// Main loop starts here
// ---------------------
while (true) {
  newPage('Start')
  // if we don't have all the prompts then we should take care of that first
  if (!promptsStored()) {
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
