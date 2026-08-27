import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const source = await readFile(
  new URL('../app/components/VehicleSearchExperience.tsx', import.meta.url),
  'utf8',
)
const carouselSource = await readFile(
  new URL('../app/components/ListingCardImageCarousel.tsx', import.meta.url),
  'utf8',
)

test('both marketplace card layouts expose the whole card as a listing link', () => {
  const cardStart = source.indexOf('function VehicleResultCard(')
  const cardEnd = source.indexOf('\nfunction marketplaceCardHeadline', cardStart)
  const cardSource = source.slice(cardStart, cardEnd)
  const fullCardLinks = cardSource.match(/className="absolute inset-0 z-10"/g) || []

  assert.notEqual(cardStart, -1)
  assert.notEqual(cardEnd, -1)
  assert.equal(fullCardLinks.length, 2)
  assert.match(cardSource, /aria-label=\{`\$\{uiText\(locale, 'View listing', 'Visa annons', 'Anzeige ansehen'\)\}: \$\{listing\.title\}`\}/)
  assert.match(cardSource, /pointer-events-none relative z-20/)
})

test('the listing image link stays above the card navigation surface', () => {
  assert.match(carouselSource, /href=\{href\}[\s\S]*?className="absolute inset-0 z-10 block"/)
})
