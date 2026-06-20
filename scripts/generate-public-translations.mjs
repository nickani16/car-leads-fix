import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

const root = process.cwd()
const files = [
  'app/components/BuyerMarketPage.tsx',
  'app/components/BuyerHeroMarketPulse.tsx',
  'app/components/PublicHeader.tsx',
  'app/components/PublicFooter.tsx',
  'app/components/DealerBenefitsPage.tsx',
  'app/dealer-market/[locale]/[page]/page.tsx',
  'app/find-cars/page.tsx',
  'app/find-cars/PublicVehicleBrowser.tsx',
  'app/components/PublicContactPage.tsx',
  'app/components/ContactForm.tsx',
  'app/components/CookieConsent.tsx',
]

const locales = [
  'fr',
  'es',
  'it',
  'pl',
  'nl',
  'pt',
  'fi',
  'da',
  'cs',
  'ro',
  'bg',
  'hr',
  'el',
  'hu',
  'sk',
  'sl',
  'et',
  'lv',
  'lt',
]

const manualStrings = [
  'View the complete process',
  'Dealer login',
  'Highest',
  'Active',
  'Ready to access selected Swedish vehicle supply?',
  'Apply for dealer access',
  'Vehicle',
  'Close',
  'Autorell Dealer Network',
  'Public vehicle supply',
  'Find cars for sale right now.',
  'Contact',
  'Navigation',
  'Legal',
  'Cookie settings',
]

function propertyName(node) {
  if (ts.isIdentifier(node) || ts.isStringLiteral(node)) return node.text
  return ''
}

function collectStrings(node, output) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    const value = node.text.trim()
    if (
      value.length >= 2 &&
      /[A-Za-z]/.test(value) &&
      !value.startsWith('/') &&
      !value.startsWith('#')
    ) {
      output.add(value)
    }
  }

  ts.forEachChild(node, (child) => collectStrings(child, output))
}

function collectRenderableStrings(node, output) {
  if (
    ts.isJsxAttribute(node) &&
    ['className', 'href', 'src', 'id', 'name', 'type'].includes(
      propertyName(node.name),
    )
  ) {
    return
  }

  if (
    ts.isPropertyAssignment(node) &&
    ['href', 'src', 'path', 'className', 'code', 'locale'].includes(
      propertyName(node.name),
    )
  ) {
    return
  }

  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    const value = node.text.trim()
    if (
      value.length >= 2 &&
      /[A-Za-z]/.test(value) &&
      !value.startsWith('/') &&
      !value.startsWith('#') &&
      !value.startsWith('http') &&
      !/^[a-z0-9_-]+$/i.test(value)
    ) {
      output.add(value)
    }
  }

  ts.forEachChild(node, (child) => collectRenderableStrings(child, output))
}

function extractEnglishStrings() {
  const output = new Set(manualStrings)

  for (const file of files) {
    const source = fs.readFileSync(path.join(root, file), 'utf8')
    const ast = ts.createSourceFile(
      file,
      source,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    )

    function visit(node) {
      if (
        ts.isPropertyAssignment(node) &&
        propertyName(node.name) === 'en'
      ) {
        collectStrings(node.initializer, output)
      }
      ts.forEachChild(node, visit)
    }

    visit(ast)

    if (
      file.endsWith('PublicHeader.tsx') ||
      file.endsWith('BuyerMarketPage.tsx') ||
      file.endsWith('DealerBenefitsPage.tsx') ||
      file.endsWith('PublicContactPage.tsx') ||
      file.endsWith('ContactForm.tsx') ||
      file.includes('dealer-market')
    ) {
      collectRenderableStrings(ast, output)
    }
  }

  return [...output].sort((a, b) => a.localeCompare(b))
}

function chunks(values, maxCharacters = 4800) {
  const result = []
  let current = []
  let length = 0

  for (const value of values) {
    if (current.length && length + value.length > maxCharacters) {
      result.push(current)
      current = []
      length = 0
    }
    current.push(value)
    length += value.length
  }

  if (current.length) result.push(current)
  return result
}

const separator = ' ZXQ_SPLIT_987654321 '

async function translateChunk(locale, values) {
  const text = values.join(separator)
  const url = new URL('https://translate.googleapis.com/translate_a/single')
  url.searchParams.set('client', 'gtx')
  url.searchParams.set('sl', 'en')
  url.searchParams.set('tl', locale)
  url.searchParams.set('dt', 't')
  url.searchParams.set('q', text)

  const response = await fetch(url, {
    signal: AbortSignal.timeout(20_000),
  })
  if (!response.ok) {
    throw new Error(`Translation request failed: ${response.status}`)
  }

  const body = await response.json()
  const translated = body[0].map((part) => part[0]).join('')
  const parts = translated.split(separator).map((part) => part.trim())

  if (parts.length !== values.length) {
    if (values.length === 1) return [translated.trim()]

    const midpoint = Math.ceil(values.length / 2)
    const left = await translateChunk(locale, values.slice(0, midpoint))
    const right = await translateChunk(locale, values.slice(midpoint))
    return [...left, ...right]
  }

  return parts
}

async function main() {
  const strings = extractEnglishStrings()
  const outputPath = path.join(root, 'lib/generated-public-translations.json')
  const output = fs.existsSync(outputPath)
    ? JSON.parse(fs.readFileSync(outputPath, 'utf8'))
    : {}
  output.en = Object.fromEntries(strings.map((value) => [value, value]))
  const requestedLocales = process.argv.slice(2)
  const localesToGenerate = requestedLocales.length
    ? locales.filter((locale) => requestedLocales.includes(locale))
    : locales

  for (const locale of localesToGenerate) {
    if (
      output[locale] &&
      Object.keys(output[locale]).length === strings.length
    ) {
      console.log(`${locale}: already complete`)
      continue
    }

    const translated = []
    for (const group of chunks(strings)) {
      let result
      for (let attempt = 1; attempt <= 3; attempt += 1) {
        try {
          result = await translateChunk(locale, group)
          break
        } catch (error) {
          if (attempt === 3) throw error
          await new Promise((resolve) => setTimeout(resolve, attempt * 1500))
        }
      }
      translated.push(...result)
      await new Promise((resolve) => setTimeout(resolve, 150))
    }
    output[locale] = Object.fromEntries(
      strings.map((value, index) => [value, translated[index]]),
    )
    console.log(`${locale}: ${strings.length} strings`)
    fs.writeFileSync(
      outputPath,
      `${JSON.stringify(output, null, 2)}\n`,
      'utf8',
    )
  }

  fs.writeFileSync(
    outputPath,
    `${JSON.stringify(output, null, 2)}\n`,
    'utf8',
  )
}

await main()
