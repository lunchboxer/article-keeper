import puppeteer from 'puppeteer'
import dotenv from 'dotenv'
import { readdirSync, readFileSync } from 'node:fs'

dotenv.config()

const articlesDirectory = './static/articles-md/'
const answersDirectory = './static/answerkeys-pdf/'
const articlePDFsDirectory = './static/articles-pdf/'

function parseArticleFileName(fileName) {
  const unitNumber = Number.parseInt(fileName.slice(0, 1))
  const lineNumber = Number.parseInt(fileName.slice(1, 2))
  const id = Number.parseInt(fileName.slice(2, 4))
  const level = fileName.slice(4, 5)
  const slug = fileName.slice(6, -3)

  // Read the file and get the title from the first line
  const text = readFileSync(articlesDirectory + fileName, 'utf8')
  const lines = text.split('\n')
  const title = lines[0].slice(2)

  return {
    unitNumber,
    lineNumber,
    id,
    level,
    slug,
    title,
  }
}

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_EXECUTABLE_PATH,
  headless: 'new',
})

const page = await browser.newPage()

const footerTemplate = `<p 
  style="color: #444444; 
  width: 100%; 
  margin:0 2cm 0.5cm; 
  display: flex; 
  justify-content: space-between; 
  padding:0;">
  <span style="font-size: 7pt;" class="title"></span>
  <span style="font-size: 7pt;" class="pageNumber"></span>
</p>`

const articleFiles = readdirSync(articlesDirectory)

for (const articleFile of articleFiles) {
  const { title, unitNumber, lineNumber, id, level, slug } =
    parseArticleFileName(articleFile)
  console.log(`Processing "${title}" level ${level}`)
  const idString = String(id).padStart(2, '0')
  await page.goto(
    `http://localhost:5173/articles/${unitNumber}/${lineNumber}/${id}/${level}`,
  )
  // eventually this should skip the pdfs that already exist
  await page.pdf({
    preferCSSPageSize: true,
    format: 'A4',
    path: `${articlePDFsDirectory}/${unitNumber}${lineNumber}${idString}${level}-${slug}.pdf`,
    headerTemplate: '<p></p>',
    footerTemplate,
    displayHeaderFooter: true,
  })
  await page.goto(
    `http://localhost:5173/articles/${unitNumber}/${lineNumber}/${id}/${level}/answers`,
  )
  await page.pdf({
    preferCSSPageSize: true,
    format: 'A4',
    path: `${answersDirectory}/${unitNumber}${lineNumber}${idString}${level}-answers-${slug}.pdf`,
    headerTemplate: '<p></p>',
    footerTemplate,
    displayHeaderFooter: true,
  })
}

await browser.close()
