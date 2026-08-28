import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const detail = readFileSync(new URL('../app/listings/[slug]/ListingDetailPage.tsx', import.meta.url), 'utf8')
const breadcrumbs = readFileSync(new URL('../app/components/ListingBreadcrumbs.tsx', import.meta.url), 'utf8')
const stickyContact = readFileSync(new URL('../app/components/ListingStickyContactBar.tsx', import.meta.url), 'utf8')
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

test('listing removes the quick facts rail and mobile bottom contact menu', () => {
  assert.doesNotMatch(detail, /<ListingQuickFactsRail/)
  assert.doesNotMatch(detail, /<ListingMobileContactBar/)
  assert.doesNotMatch(detail, /const quickFacts =/)
  assert.match(detail, /<ListingStickyContactBar/)
  assert.match(stickyContact, /href="#listing-contact-card"/)
  assert.match(stickyContact, /href="#listing-contact-card-desktop"/)
  assert.doesNotMatch(stickyContact, /z-\[400\] hidden/)
  assert.match(detail, /id="listing-contact-card" className="scroll-mt-20/)
  assert.doesNotMatch(detail, /<ShareListingButton(?:(?!\/>)[\s\S])*variant="plain"/)
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
  assert.match(contact, /compact \? 'h-10 text-\[13px\]'/)
})

test('listing detail has an accessible localized back-to-top action', () => {
  assert.match(detail, /<ListingBackToTopButton locale=\{locale\}/)
  assert.match(backToTop, /window\.scrollY > 520/)
  assert.match(backToTop, /window\.scrollTo\(\{ top: 0/)
  assert.match(backToTop, /bottom-\[calc\(16px\+env\(safe-area-inset-bottom\)\)\]/)
  assert.doesNotMatch(backToTop, /bottom-\[calc\(82px\+env\(safe-area-inset-bottom\)\)\]/)
  assert.match(backToTop, /sm:hover:w-\[150px\]/)
  for (const locale of ['sv', 'en', 'de', 'at', 'be', 'fr', 'es', 'it', 'pl', 'nl', 'fi', 'da']) {
    assert.match(backToTop, new RegExp(`\\b${locale}:`))
  }
})
