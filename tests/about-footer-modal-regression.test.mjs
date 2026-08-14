import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const publicInfoPage = readFileSync(
  new URL('../app/components/PublicInfoPage.tsx', import.meta.url),
  'utf8',
)
const publicFooter = readFileSync(
  new URL('../app/components/PublicFooter.tsx', import.meta.url),
  'utf8',
)
const marketplace = readFileSync(
  new URL('../app/components/VehicleSearchExperience.tsx', import.meta.url),
  'utf8',
)

test('about page has dedicated localized copy for every Autorell language', () => {
  const copyBlock = publicInfoPage.slice(
    publicInfoPage.indexOf('const aboutPageCopy ='),
    publicInfoPage.indexOf('const ctaLinks ='),
  )

  for (const locale of ['en', 'sv', 'de', 'fr', 'es', 'it', 'pl', 'nl', 'fi', 'da']) {
    assert.match(copyBlock, new RegExp(`\\n  ${locale}: \\{`), `${locale} should have intentional About copy`)
  }

  assert.match(publicInfoPage, /if \(locale === 'at'\) return aboutPageCopy\.de/)
  assert.match(publicInfoPage, /if \(locale === 'be'\) return aboutPageCopy\.nl/)
  assert.match(publicInfoPage, /if \(page === 'about'\) return getAboutPageCopy\(locale\)/)
  assert.match(publicInfoPage, /Autorell har sitt säte i Stockholm, Sverige/)
  assert.match(publicInfoPage, /mailto:info@autorell\.se/)
})

test('about metadata stays concise in every intentional language', () => {
  const copyBlock = publicInfoPage.slice(
    publicInfoPage.indexOf('const aboutPageCopy ='),
    publicInfoPage.indexOf('const ctaLinks ='),
  )
  const titles = [...copyBlock.matchAll(/metaTitle:\s*'([^']+)'/g)].map((match) => match[1])
  const descriptions = [...copyBlock.matchAll(/metaDescription:\s*\n\s*'([^']+)'/g)].map((match) => match[1])

  assert.equal(titles.length, 10)
  assert.equal(descriptions.length, 10)
  titles.forEach((title) => assert.ok(title.length <= 55, `${title} exceeds 55 characters`))
  descriptions.forEach((description) => assert.ok(description.length <= 155, `${description} exceeds 155 characters`))
})

test('download headings match the other footer headings', () => {
  assert.match(publicFooter, /<h3 className="text-\[15px\] font-semibold text-\[#101828\]">\{copy\.footerLabel\}<\/h3>/)
  assert.match(marketplace, /<h3 className="text-\[15px\] font-semibold text-\[#101828\]">\{copy\.footerLabel\}<\/h3>/)
  assert.doesNotMatch(publicFooter, /<p className="text-\[13px\] font-semibold text-\[#101828\]">\{copy\.footerLabel\}<\/p>/)
})

test('marketplace filter popovers expose a visible close control and Escape handling', () => {
  for (const locale of ['en', 'sv', 'de', 'at', 'be', 'fr', 'es', 'it', 'pl', 'nl', 'fi', 'da']) {
    assert.match(marketplace, new RegExp(`\\n  ${locale}: \\{ close:`), `${locale} should have filter dialog copy`)
  }
  assert.match(marketplace, /title=\{filterDialogCopy\[locale\]\.close\}/)
  assert.match(marketplace, /aria-label=\{filterDialogCopy\[locale\]\.label\}/)
  assert.match(marketplace, /onClick=\{\(\) => setDesktopFilterMenu\(null\)\}/)
  assert.match(marketplace, /event: globalThis\.KeyboardEvent/)
  assert.match(marketplace, /if \(event\.key === 'Escape'\) setDesktopFilterMenu\(null\)/)
})

test('dismissible modal surfaces keep an explicit close affordance', () => {
  const appRoot = fileURLToPath(new URL('../app', import.meta.url))
  const modalFiles = collectFiles(appRoot)
    .filter((file) => file.endsWith('.tsx'))
    .map((file) => [file, readFileSync(file, 'utf8')])
    .filter(([, source]) => source.includes('aria-modal="true"'))

  for (const [file, source] of modalFiles) {
    if (file.endsWith('SellToDealerLeadForm.tsx')) continue
    assert.match(
      source,
      /<X\b|onClose|aria-label=.*(?:Close|Stäng|Schlie|close)/,
      `${file} should expose an explicit close affordance`,
    )
  }
})

function collectFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? collectFiles(path) : [path]
  })
}
