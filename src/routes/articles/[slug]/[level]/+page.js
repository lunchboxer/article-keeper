import { fetchArticleFromSlug } from '$lib/utils.js'

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
  const { slug, level } = params

  return fetchArticleFromSlug(slug, level, fetch)
}
