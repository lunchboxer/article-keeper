import { readdir, readFile, writeFile, rename } from 'node:fs/promises'
import sluggo from 'sluggo'

// make a list of the file names in the articles directory at /static/articles-md/
// For each item in the list parse the title for the following:
// - first character = unittNumber (integer)
// - second characer = lineNumber (integer)
// - third and fourth character = articleNumber (integer)
// - fifth character = level (string)
// - everything from sixth character to '.md' is the slug
function removeBlankLines(string) {
  const regex = /^[ \w.)]+\s/;
  return string.replace(/\n\s*?\n/g, "\n", regex);
}

export async function parseArticleFileName(fileName) {
  const unitNumber = Number.parseInt(fileName.slice(0, 1))
  const lineNumber = Number.parseInt(fileName.slice(1, 2))
  const id = Number.parseInt(fileName.slice(2, 4))
  const level = fileName.slice(4, 5)
  let slug = fileName.slice(6, -3)

  // Read the file and get the title from the first line
  const text = await readFile(articlesDirectory + fileName, 'utf8')
  const lines = text.split('\n')
  const title = lines[0].slice(2)

  if (!slug) {
    slug = sluggo(title)
    console.log(`${fileName} is missing a slug`)
    const newFileName = `${fileName.slice(0, -3)}-${slug}.md`
    console.log('new filename', newFileName)
    await rename(articlesDirectory + fileName, articlesDirectory + newFileName)
  }

  return {
    unitNumber,
    lineNumber,
    id,
    level,
    slug,
    title,
  }
}

const articlesDirectory = './static/articles-md/'

// get and parse the article file names from the articles directory
const articleFiles = await readdir(articlesDirectory)
const parsedFiles = []

console.log(`Found ${articleFiles.length} files in ${articlesDirectory}`)
console.log('Parsing files for article metadata')
for (const articleFile of articleFiles) {
  parsedFiles.push(await parseArticleFileName(articleFile))
}

console.log('Make an index of the articles by slug')
// make an index of the files listed in parsedFiles indexed by slug
const articleIndexBySlug = {}

for (const article of parsedFiles) {
  const { slug, level, ...newArticle } = article
  // If the slug doesn't already exist then add it
  if (!articleIndexBySlug[slug]) {
    newArticle.versions = [level]
    articleIndexBySlug[slug] = newArticle
    continue
  }
  // otherwise update the index by adding to versions
  // also check that title is correct
  articleIndexBySlug[slug].title = article.title
  const currentVersions = articleIndexBySlug[slug].versions
  if (!currentVersions.includes(level)) {
    articleIndexBySlug[slug].versions.push(level)
  }
}

// write the index to a file
const slugIndexFilePath = './src/lib/article-index-by-slug.json'
console.log(`Writing index to ${slugIndexFilePath}`)
await writeFile(slugIndexFilePath, JSON.stringify(articleIndexBySlug, undefined, 2))

console.log('Get existing article index')
// grab the article index
const articleIndexRaw = await readFile('./src/lib/article-index.json', 'utf8')
const articleIndex = JSON.parse(articleIndexRaw)

// For each of the articles in parsedFiles find the unit and line number in the existing articleIndex.
// Then, add the article to the articles list for that line number
for (const article of parsedFiles) {
  const { unitNumber, lineNumber, id, level, slug, title } = article
  const unitOfInquiry = articleIndex.unitsOfInquiry.find(
    (u) => u.id === unitNumber,
  )
  const unitIndex = articleIndex.unitsOfInquiry.findIndex(
    (u) => u.id === unitNumber,
  )

  if (!unitOfInquiry) {
    console.log(`Unit not found: ${unitNumber}`)
    continue
  }
  const lineOfInquiry = unitOfInquiry.linesOfInquiry.find(
    (l) => l.id === lineNumber,
  )
  const lineIndex = unitOfInquiry.linesOfInquiry.findIndex(
    (l) => l.id === lineNumber,
  )

  if (!lineOfInquiry) {
    console.log(`Line of inquiry not found: ${lineNumber}`)
    continue
  }
  const articleInfo = lineOfInquiry.articles?.find((a) => a?.id === id)

  // if the article exists in the index then check if we need to add to the versions array, otherwise skip
  if (articleInfo) {
    // also make sure that title and slug are updated if they are different
    articleInfo.title = title
    articleInfo.slug = slug
    // why doesn't this seem like it would ever get written to the new index?
    if (!articleInfo.versions.includes(level)) {
      articleInfo.versions.push(level)
    }
    continue
  }
  // if the article doesn't exist in the index then add it
  if (!articleInfo) {
    const newArticle = {
      versions: [level],
      id,
      title,
      slug,
    }
    articleIndex.unitsOfInquiry[unitIndex].linesOfInquiry[
      lineIndex
    ].articles.push(newArticle)
  }
}
const indexFilePath = './src/lib/article-index.json'
console.log(`Overwriting article index to ${indexFilePath}`)
await writeFile(indexFilePath, JSON.stringify(articleIndex, undefined, 2))
console.log('Done!')
