import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const detail = read('app/listings/[slug]/ListingDetailPage.tsx')
const gallery = read('app/components/ListingImageGallery.tsx')
const cardGallery = read('app/components/ListingCardImageCarousel.tsx')
const contact = read('app/components/ListingContactFormButton.tsx')
const sticky = read('app/components/ListingStickyContactBar.tsx')
const routes = read('app/[market]/[...slug]/page.tsx')
const safetyPage = read('app/safety-tips/page.tsx')

test('listing image controls stay visible on touch layouts', () => {
  assert.match(gallery, /left-3 top-1\/2 z-10 grid/)
  assert.match(gallery, /right-3 top-1\/2 z-10 grid/)
  assert.doesNotMatch(gallery, /lg:group-hover:opacity-100/)
  assert.match(cardGallery, /left-2 top-1\/2 z-20 grid/)
  assert.match(cardGallery, /right-2 top-1\/2 z-20 grid/)
})

test('desktop detail keeps a compact width and inline sticky contact flow', () => {
  assert.match(detail, /sm:max-w-\[1260px\]/)
  assert.match(detail, /presentation="inline"/)
  assert.match(detail, /<ListingStickyContactBar/)
  assert.match(contact, /presentation\?: 'button' \| 'inline'/)
  assert.match(sticky, /window\.scrollY > 620/)
})

test('safety advice is a live localized route linked from listings', () => {
  assert.match(routes, /slugPath === 'safety-tips'/)
  assert.match(safetyPage, /generatePublicInfoMetadata\('safety-tips'\)/)
  assert.match(detail, /localizePublicHref\(locale, '\/safety-tips'\)/)
})
