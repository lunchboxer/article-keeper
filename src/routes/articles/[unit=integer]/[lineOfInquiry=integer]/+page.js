import articleIndex from '$lib/article-index.json'

/** @type {import('./$types').PageLoad} */
export function load({ params }) {
  const unitNumber = Number.parseInt(params.unit)
  const unitOfInquiry = articleIndex.unitsOfInquiry.find(
    (u) => u.id === unitNumber,
  )
  if (!unitOfInquiry) {
    return {
      error: 'Unit not found',
    }
  }
  const lineNumber = Number.parseInt(params.lineOfInquiry)
  const lineOfInquiry = unitOfInquiry.linesOfInquiry.find(
    (l) => l.id === lineNumber,
  )
  if (!unitOfInquiry) {
    return {
      error: 'Line of inquiry not found',
    }
  }
  return {
    lineOfInquiry,
    unitId: unitOfInquiry.id,
  }
}
