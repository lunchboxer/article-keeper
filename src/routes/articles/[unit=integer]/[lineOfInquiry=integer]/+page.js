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
  const lineNum = parseInt(params.lineOfInquiry)
  const lineOfInquiry = unitOfInquiry.linesOfInquiry.find(l => l.id === lineNum)
  if (!unitOfInquiry) {
    return {
      error: "Line of inquiry not found"
    }
  }
  return {
    lineOfInquiry,
    unitId: unitOfInquiry.id
  }

}
