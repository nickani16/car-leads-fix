import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const brandSuggestionSource = readFileSync(new URL('../lib/listing-brand-suggestions.ts', import.meta.url), 'utf8')
const newListingFormSource = readFileSync(new URL('../app/konto/annonser/ny/NewListingForm.tsx', import.meta.url), 'utf8')
const editListingFormSource = readFileSync(new URL('../app/account/listings/[id]/edit/EditListingForm.tsx', import.meta.url), 'utf8')

test('brand suggestions cover all marketplace listing categories', () => {
  for (const category of [
    'cars',
    'vans',
    'motorcycles',
    'motorhomes',
    'caravans',
    'trucks',
    'agriculture',
    'construction',
    'electric-bikes',
  ]) {
    assert.match(brandSuggestionSource, new RegExp(`['"]?${category}['"]?:`), `${category} should have brand suggestions`)
  }
})

test('brand suggestions include common vehicle, machine and caravan makers plus typo aliases', () => {
  for (const brand of [
    'BMW',
    'Bentley',
    'Volvo',
    'Audi',
    'Scania',
    'John Deere',
    'Caterpillar',
    'Kabe',
    'Hymer',
    'Harley-Davidson',
    'Trek',
  ]) {
    assert.ok(brandSuggestionSource.includes(`'${brand}'`), `${brand} should be suggested`)
  }

  assert.match(brandSuggestionSource, /vovlo: 'Volvo'/)
  assert.match(brandSuggestionSource, /vw: 'Volkswagen'/)
  assert.match(brandSuggestionSource, /cat: 'Caterpillar'/)
})

test('listing create and edit forms wire make suggestions into the make field', () => {
  assert.match(newListingFormSource, /matchingBrandSuggestions\(category, values\.make \|\| ''\)/)
  assert.match(newListingFormSource, /<Field name="make"[\s\S]*suggestions=\{makeSuggestions\}/)
  assert.match(newListingFormSource, /suggestionsOpen && visibleSuggestions\.length > 0/)
  assert.match(newListingFormSource, /max-h-\[252px\] overflow-y-auto/)
  assert.match(newListingFormSource, /const visibleSuggestions = suggestions\.filter\(\(suggestion\) => suggestion !== value\)/)
  assert.doesNotMatch(newListingFormSource, /const visibleSuggestions = suggestions\.filter\(\(suggestion\) => suggestion !== value\)\.slice\(0, 8\)/)
  assert.match(editListingFormSource, /matchingBrandSuggestions\(listing\.category, make\)/)
  assert.match(editListingFormSource, /makeSuggestionsOpen && visibleMakeSuggestions\.length/)
  assert.match(editListingFormSource, /max-h-\[252px\] overflow-y-auto/)
  assert.match(editListingFormSource, /const visibleMakeSuggestions = makeSuggestions\.filter\(\(suggestion\) => suggestion !== make\)/)
  assert.doesNotMatch(editListingFormSource, /const visibleMakeSuggestions = makeSuggestions\.filter\(\(suggestion\) => suggestion !== make\)\.slice\(0, 8\)/)
})
