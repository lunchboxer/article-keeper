import articleIndex from '$lib/article-index.json';

/** @type {import('./$types').PageLoad} */
export function load({ params }) {
  const unitNum = parseInt(params.unit);
  const unitOfInquiry = articleIndex.unitsOfInquiry.find(u => u.id === unitNum)
  if (!unitOfInquiry) {
    return {
      error: "Unit not found"
    }
  }
  return {
    unitOfInquiry
  }

}
