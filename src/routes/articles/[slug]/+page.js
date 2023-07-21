import { fetchArticleFromSlug } from '$lib/utils.js'

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
  const { slug } = params
  const level = 'A'

  return fetchArticleFromSlug(slug, level, fetch)
}
