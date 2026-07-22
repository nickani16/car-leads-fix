export function normalizePlaceName(value: unknown) {
  const clean = String(value || '').trim().replace(/\s+/g, ' ')
  if (!clean) return ''

  const lower = clean.toLocaleLowerCase('sv-SE')
  let nextUpper = true
  let output = ''

  for (const char of lower) {
    if (/[a-zåäöæøéèêáàâíìîóòôúùûüñç]/i.test(char)) {
      output += nextUpper ? char.toLocaleUpperCase('sv-SE') : char
      nextUpper = false
      continue
    }
    output += char
    nextUpper = char === ' ' || char === '-' || char === '/'
  }

  return output
}
