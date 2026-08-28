import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const detail = readFileSync(new URL('../app/listings/[slug]/ListingDetailPage.tsx', import.meta.url), 'utf8')
const breadcrumbs = readFileSync(new URL('../app/components/ListingBreadcrumbs.tsx', import.meta.url), 'utf8')
const factsRail = readFileSync(new URL('../app/components/ListingQuickFactsRail.tsx', import.meta.url), 'utf8')
const contact = readFileSync(new URL('../app/components/ListingContactFormButton.tsx', import.meta.url), 'utf8')
const contactApi = readFileSync(new URL('../app/api/listing-contact/route.ts', import.meta.url), 'utf8')
const backToTop = readFileSync(new URL('../app/components/ListingBackToTopButton.tsx', import.meta.url), 'utf8')
const globalStyles = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8')

test('listing breadcrumbs are visible, data-driven and link category, make and model filters', () => {
  assert.match(detail, /<ListingBreadcrumbs items=\{breadcrumbItems\}/)
  assert.match(detail, /new URLSearchParams\(\{ bodyType:/)
  assert.match(detail, /new URLSearchParams\(\{ make \}\)/)
  assert.match(detail, /modelParams\.set\('model', model\)/)
  assert.match(breadcrumbs, /<House/)
  assert.match(breadcrumbs, /aria-current="page"/)
})

test('desktop listing has a compact request-information rail and a non-sticky contact form', () => {
  assert.match(detail, /<ListingQuickFactsRail/)
  assert.match(factsRail, /children: ReactNode/)
  assert.match(detail, /<ListingQuickFactsRail facts=\{quickFacts\}>[\s\S]*<ListingContactFormButton/)
  assert.match(factsRail, /scrollBy\(\{ left: direction \* 320/)
  assert.match(factsRail, /quickFactIcons/)
  assert.match(factsRail, /<FactIcon aria-hidden="true"/)
  assert.match(factsRail, /text-\[13px\]/)
  assert.match(factsRail, /h-8 w-8[^\"]*rounded-full/)
  assert.match(detail, /buttonFontWeight=\{600\}/)
  assert.doesNotMatch(detail, /order-4 grid gap-3 self-start lg:sticky/)
  assert.doesNotMatch(detail, /listing-contact-card-desktop[^\n]+overflow-y-auto/)
})

test('contact form distinguishes professional and private buyers with calm placeholders', () => {
  assert.match(contact, /setIsProfessional/)
  assert.match(contact, /name="professional"/)
  assert.match(contact, /name="company"/)
  assert.match(contact, /name="firstName"/)
  assert.match(contact, /name="lastName"/)
  assert.match(contact, /autorell-contact-placeholder/)
  assert.match(globalStyles, /\.autorell-contact-placeholder:placeholder-shown[\s\S]*color: #98a2b3 !important/)
  assert.match(globalStyles, /\.autorell-contact-placeholder:not\(:placeholder-shown\)[\s\S]*color: #101828 !important/)
  assert.match(contact, /name="callingCode"/)
  assert.match(contact, /<CountryFlag code=\{selected\.code\}/)
  assert.match(contact, /style=\{\{ fontWeight: 400 \}\}/)
  assert.doesNotMatch(contact, /CompactOfferField/)
  assert.doesNotMatch(contact, /name="offer"/)
  assert.match(detail, /initialCount=\{favoriteCount\}/)
  assert.match(detail, /variant="icon"/)
  assert.match(contactApi, /Buyer type: Professional/)
  assert.match(contactApi, /Company: \$\{company\}/)
})

test('listing detail has an accessible localized back-to-top action', () => {
  assert.match(detail, /<ListingBackToTopButton locale=\{locale\}/)
  assert.match(backToTop, /window\.scrollY > 520/)
  assert.match(backToTop, /window\.scrollTo\(\{ top: 0/)
  assert.match(backToTop, /sm:hover:w-\[150px\]/)
  for (const locale of ['sv', 'en', 'de', 'at', 'be', 'fr', 'es', 'it', 'pl', 'nl', 'fi', 'da']) {
    assert.match(backToTop, new RegExp(`\\b${locale}:`))
  }
})
