import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const form = readFileSync(new URL('../app/konto/annonser/ny/NewListingForm.tsx', import.meta.url), 'utf8')
const localizedMarketRoute = readFileSync(new URL('../app/[market]/[...slug]/page.tsx', import.meta.url), 'utf8')
const newListingPage = readFileSync(new URL('../app/konto/annonser/ny/page.tsx', import.meta.url), 'utf8')
const createListingRoute = readFileSync(new URL('../app/api/account/listings/route.ts', import.meta.url), 'utf8')
const options = readFileSync(new URL('../lib/listing-form-options.ts', import.meta.url), 'utf8')

test('new listing model year is constrained to dropdown values from 2027 to 1950+', () => {
  assert.match(form, /const maxModelYear = 2027/)
  assert.match(form, /const minModelYear = 1950/)
  assert.match(form, /<SelectNative name="modelYear"/)
  assert.match(form, /<option value="1950\+">1950\+<\/option>/)
  assert.match(form, /isAllowedModelYear\(values\.modelYear\)/)
  assert.match(createListingRoute, /modelYearInput === '1950\+' \? 1950/)
  assert.match(createListingRoute, /modelYear < 1950 \|\| modelYear > 2027/)
})

test('Swedish listing creation uses mil while other markets use kilometres', () => {
  assert.match(form, /const usesSwedishMileage = listingCountryCode\.toUpperCase\(\) === 'SE'/)
  assert.match(form, /mileageLabel: 'Mil'/)
  assert.match(form, /mileageLabel: 'Kilometres'/)
  assert.match(form, /mileageInputToKilometers\(value, usesSwedishMileage\)/)
  assert.doesNotMatch(form, /label=\{`\$\{copy\.kilometers\} \(\$\{mileageUnit\}\)`\}/)
})

test('market-prefixed create listing pages default to the active market country', () => {
  assert.match(localizedMarketRoute, /slugPath === 'account\/listings\/new'/)
  assert.match(localizedMarketRoute, /slugPath === 'konto\/annonser\/ny'/)
  assert.match(localizedMarketRoute, /marketCodeOverride: normalizedMarket\.toUpperCase\(\)/)
  assert.match(newListingPage, /marketCodeOverride \|\| requestHeaders\.get\('x-autorell-market'\)/)
  assert.match(form, /useState\(countryCode\.toUpperCase\(\)\)/)
})

test('phone number visibility defaults to public for new private listings', () => {
  assert.match(form, /phoneVisibility: 'public'/)
  assert.match(createListingRoute, /text\(form, 'phoneVisibility'\) === 'registered_only'[\s\S]*\? 'registered_only'[\s\S]*: 'public'/)
})

test('preview does not show package before package step', () => {
  assert.doesNotMatch(form, /copy\.package\}: \{packageCopy/)
})

test('publishing never leaves the form in an endless spinner and bulk UI is hidden', () => {
  assert.match(form, /const listingRequestTimeoutMs = 45_000/)
  assert.match(form, /fetchWithTimeout\('\/api\/account\/listings'/)
  assert.match(form, /fetchWithTimeout\('\/api\/account\/listing-checkout'/)
  assert.match(form, /parseCheckoutResponse\(checkout\)/)
  assert.match(form, /Betalningen kunde inte startas \(\$\{response\.status\}\)/)
  assert.match(form, /Publiceringen tog för lång tid och avbröts/)
  assert.doesNotMatch(form, /copy\.volumeOffers\.map/)
  assert.doesNotMatch(form, /onAddToBatch/)
})

test('technical max trailer weight remains optional and is placed last for common road vehicles', () => {
  assert.match(options, /numberField\('engineLiters', 'Motorvolym', 0\.1, 20, 'L'\)/)
  assert.doesNotMatch(options, /numberField\('maxTrailerWeightKg', 'Max trailervikt', 1, 10000, 'kg', true\)/)
  assert.match(options, /cars: \[[\s\S]*chips\('damageStatus'[\s\S]*numberField\('maxTrailerWeightKg', 'Max trailervikt', 1, 10000, 'kg'\)/)
  assert.match(options, /vans: \[[\s\S]*chips\('damageStatus'[\s\S]*numberField\('maxTrailerWeightKg', 'Max trailervikt', 1, 12000, 'kg'\)/)
  assert.match(options, /motorhomes: \[[\s\S]*chips\('damageStatus'[\s\S]*numberField\('maxTrailerWeightKg', 'Max trailervikt', 1, 12000, 'kg'\)/)
})
