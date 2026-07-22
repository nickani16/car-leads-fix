import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const schema = readFileSync(new URL('../lib/listing-schema.ts', import.meta.url), 'utf8')
const migration = readFileSync(new URL('../supabase/migrations/20260720120000_listing_offer_and_structured_data.sql', import.meta.url), 'utf8')
const createRoute = readFileSync(new URL('../app/api/account/listings/route.ts', import.meta.url), 'utf8')
const options = readFileSync(new URL('../lib/listing-form-options.ts', import.meta.url), 'utf8')
const search = readFileSync(new URL('../lib/marketplace-search-v2.ts', import.meta.url), 'utf8')
const createForm = readFileSync(new URL('../app/konto/annonser/ny/NewListingForm.tsx', import.meta.url), 'utf8')
const editForm = readFileSync(new URL('../app/account/listings/[id]/edit/EditListingForm.tsx', import.meta.url), 'utf8')
const searchUi = readFileSync(new URL('../app/components/VehicleSearchExperience.tsx', import.meta.url), 'utf8')

test('listing schema persists offer type, lease data and structured search data', () => {
  assert.match(schema, /export type OfferType = 'sale' \| 'lease' \| 'sale_and_lease'/)
  assert.match(schema, /export type LeaseData = \{/)
  assert.match(schema, /marketplaceCategoryFieldDefinitions/)
  assert.match(createRoute, /offer_type: offerType/)
  assert.match(createRoute, /lease_data: leaseData/)
  assert.match(createRoute, /structured_data: structuredData/)
  assert.match(createRoute, /search_document: searchDocument/)
})

test('database search contract supports sale, lease and structured attributes', () => {
  assert.match(migration, /add column if not exists offer_type text/)
  assert.match(migration, /add column if not exists lease_data jsonb/)
  assert.match(migration, /add column if not exists structured_data jsonb/)
  assert.match(migration, /add column if not exists search_document text/)
  assert.match(migration, /offer_type in \('sale', 'lease', 'sale_and_lease'\)/)
  assert.match(migration, /marketplace_listings_structured_data_gin_idx/)
  assert.match(migration, /marketplace_listings_search_document_idx/)
  assert.match(search, /query\.in\('offer_type', \['lease', 'sale_and_lease'\]\)/)
  assert.match(search, /search_document\.ilike/)
})

test('active marketplace category model excludes scooters and keeps category-owned fields', () => {
  const marketplace = readFileSync(new URL('../lib/marketplace.ts', import.meta.url), 'utf8')
  assert.doesNotMatch(marketplace, /slug: 'scooters'/)
  assert.match(options, /caravans: \[/)
  assert.match(options, /construction: \[/)
  assert.match(options, /agriculture: \[/)
  assert.match(options, /numberField\('operatingHours', 'Drifttimmar'/)
  assert.match(options, /diggingDepth/)
})

test('every active category has an explicit technical field set without shared mileage fallback', () => {
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
    assert.match(options, new RegExp(`['"]?${category}['"]?: \\[`))
  }
  assert.match(createForm, /const mileageCategories = new Set/) 
  assert.match(createForm, /const machineCategories = new Set<MarketplaceCategorySlug>\(\['agriculture', 'construction'\]\)/)
  assert.match(createForm, /\) : machineCategories\.has\(category\) \? \(/)
  assert.match(createForm, /\) : null\}/)
  const categoryBlock = (name) => {
    const marker = `${name}: [`
    const start = options.indexOf(marker)
    const end = start < 0 ? -1 : options.indexOf('\n  ],', start)
    return start >= 0 && end > start ? options.slice(start, end) : ''
  }
  assert.doesNotMatch(categoryBlock('caravans'), /mileage|operatingHours/)
  assert.match(options, /'electric-bikes'/)
  assert.match(categoryBlock('agriculture'), /operatingHours/)
  assert.match(categoryBlock('construction'), /operatingHours/)
  assert.match(editForm, /const mileageCategories = new Set<MarketplaceCategorySlug>\(\[/)
  assert.doesNotMatch(editForm, /'caravans',\s*\n\s*'trucks'/)
})

test('create and edit use subcategory-specific technical fields', () => {
  assert.match(options, /categorySubcategoryFields/)
  for (const field of ['pto', 'hydraulics', 'frontLoader', 'gps', 'isobus', 'baleType', 'baleSize', 'chamberType', 'knives', 'wrapper', 'quickCoupler', 'tiltrotator', 'buckets', 'workingHeightM', 'outreachM', 'platformCapacityKg']) {
    assert.match(options, new RegExp(`['"]?${field}['"]?`))
  }
  assert.match(createForm, /fieldsForCategoryAndSubcategory\(category, values\)/)
  assert.match(editForm, /fieldsForCategoryAndSubcategory\(listing\.category/)
  assert.match(createForm, /const isMachine = category === 'agriculture' \|\| category === 'construction'/)
  assert.match(createForm, /!isMachine \? <Field name="leaseAnnualMileageKm"/)
  assert.match(options, /text\.includes\('excav'\)/)
})

test('marketplace facets are derived from active listings and include counts', () => {
  assert.match(search, /getDynamicMarketplaceFacets/)
  assert.match(search, /status', 'published'/)
  assert.match(search, /sold_at', null/)
  assert.match(search, /structured_data/)
  assert.match(search, /count: number/)
  assert.match(searchUi, /label: `\$\{item\.value\} \(\$\{item\.count\}\)`/)
})
