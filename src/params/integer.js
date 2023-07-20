/** @type {import('@sveltejs/kit').ParamMatcher} */
export function match(parameter) {
  return /^\d+$/.test(parameter)
}
