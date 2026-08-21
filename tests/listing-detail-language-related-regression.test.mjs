import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const footerSource = readFileSync(
  new URL('../app/components/PublicFooter.tsx', import.meta.url),
  'utf8',
)
const translationSource = readFileSync(
  new URL('../app/components/SellerDescriptionTranslationButton.tsx', import.meta.url),
  'utf8',
)
const detailSource = readFileSync(
  new URL('../app/listings/[slug]/ListingDetailPage.tsx', import.meta.url),
  'utf8',
)
const insightsSource = readFileSync(
  new URL('../lib/marketplace-insights.ts', import.meta.url),
  'utf8',
)

test('footer market controls keep compact typography and modal controls above the fixed header', () => {
  assert.match(footerSource, /gap-y-2 text-\[13px\] font-medium/)
  assert.match(footerSource, /fixed inset-0 z-\[500\]/)
  assert.match(footerSource, /top-\[calc\(env\(safe-area-inset-top\)\+1rem\)\] z-\[510\]/)
  assert.doesNotMatch(footerSource, /safe-area-inset-top\)\+4\.75rem/)
})

test('listing description uses a localized description heading without seller-language helper copy', () => {
  assert.match(detailSource, /sellerDescription: 'Beskrivning'/)
  assert.match(detailSource, /sellerDescription: 'Description'/)
  assert.match(detailSource, /sellerDescription: 'Beschreibung'/)
  assert.match(detailSource, /const localizedDescriptionHeading: Record<PublicLocale, string>/)
  assert.doesNotMatch(detailSource, /\{copy\.originalLanguage\}/)
})

test('seller translation action requires evidence that source and page languages differ', () => {
  assert.match(detailSource, /sourceLanguage=\{listingLanguageFromCountryCode\(listing\.country_code\)\}/)
  assert.match(translationSource, /detectedLanguage \|\| normalizeComparableLanguage\(sourceLanguage\)/)
  assert.match(translationSource, /!pageLanguage \|\| !originalLanguage \|\| originalLanguage === pageLanguage/)
  assert.match(translationSource, /if \(locale === 'at'\) return 'de'/)
  assert.match(translationSource, /if \(locale === 'be'\) return 'nl'/)
})

test('similar listings require exact make and model within five model years', () => {
  assert.match(insightsSource, /\.eq\('make', sourceMake\)/)
  assert.match(insightsSource, /\.eq\('model', sourceModel\)/)
  assert.match(insightsSource, /\.gte\('model_year', sourceYear - 5\)/)
  assert.match(insightsSource, /\.lte\('model_year', sourceYear \+ 5\)/)
  assert.match(insightsSource, /\.filter\(\(candidate\) => isStrictlySimilarListing\(listing, candidate\)\)/)
  assert.match(insightsSource, /Math\.abs\(sourceYear - candidateYear\) <= 5/)
  assert.match(detailSource, /samma märke och modell med högst fem års skillnad i modellår/)
})
