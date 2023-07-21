import { fetchArticleFromInfo } from '$lib/utils.js'

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
  const unitNumber = Number.parseInt(params.unit)
  const lineNumber = Number.parseInt(params.lineOfInquiry)
  const id = Number.parseInt(params.number)

  return fetchArticleFromInfo(unitNumber, lineNumber, id, params.level, fetch)
}
