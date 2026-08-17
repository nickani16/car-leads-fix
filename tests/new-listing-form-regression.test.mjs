import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const form = readFileSync(new URL('../app/konto/annonser/ny/NewListingForm.tsx', import.meta.url), 'utf8')
const localizedMarketRoute = readFileSync(new URL('../app/[market]/[...slug]/page.tsx', import.meta.url), 'utf8')
const newListingPage = readFileSync(new URL('../app/konto/annonser/ny/page.tsx', import.meta.url), 'utf8')
const createListingRoute = readFileSync(new URL('../app/api/account/listings/route.ts', import.meta.url), 'utf8')
const options = readFileSync(new URL('../lib/listing-form-options.ts', import.meta.url), 'utf8')
const accountSeo = readFileSync(new URL('../lib/account-seo.ts', import.meta.url), 'utf8')
const geoHelper = readFileSync(new URL('../lib/marketplace-geo.ts', import.meta.url), 'utf8')

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
  assert.match(form, /const listingCountryCode = countryCode\.toUpperCase\(\)/)
  assert.doesNotMatch(form, /name="sellerCountryCode"/)
})

test('phone number visibility defaults to public for new private listings', () => {
  assert.match(form, /phoneVisibility: 'public'/)
  assert.match(createListingRoute, /text\(form, 'phoneVisibility'\) === 'registered_only'[\s\S]*\? 'registered_only'[\s\S]*: 'public'/)
})

test('preview does not show package before package step', () => {
  assert.doesNotMatch(form, /copy\.package\}: \{packageCopy/)
})

test('publishing never leaves the form in an endless spinner and bulk UI is hidden', () => {
  assert.match(form, /const listingRequestTimeoutMs = 60_000/)
  assert.match(form, /const \[publishProgress, setPublishProgress\] = useState\(0\)/)
  assert.match(form, /<PublishingOverlay copy=\{copy\} progress=\{publishProgress\} \/>/)
  assert.match(form, /role="status"/)
  assert.match(form, /publishWaitingPercentLabel/)
  assert.match(form, /Loader2 className="h-4 w-4 animate-spin"/)
  assert.match(form, /\[autorell:create-listing\] submit started/)
  assert.match(form, /\[autorell:create-listing\] submit failed before response/)
  assert.match(form, /values\.listingTerms === 'on'[\s\S]*form\.set\('listingTerms', 'on'\)/)
  assert.match(form, /fetchWithTimeout\('\/api\/account\/listings'/)
  assert.match(form, /fetchWithTimeout\('\/api\/account\/listing-checkout'/)
  assert.match(form, /market: billingMarketCode \|\| listingCountryCode/)
  assert.match(form, /locale,/)
  assert.match(form, /window\.location\.assign\(checkout\.url\)/)
  assert.match(form, /createdListingHref\(locale, result\.listingId\)/)
  assert.match(form, /createdListingHref\(locale,\s*result\.listingId,\s*'checkout_failed'\)/)
  assert.match(form, /createdListingHref\([\s\S]*'checkout_timeout'/)
  assert.match(form, /Publiceringen tog f/)
  assert.match(form, /Vänta, vi publicerar din annons/)
  assert.match(form, /Bitte warten, wir veröffentlichen Ihre Anzeige/)
  for (const locale of ['fi', 'da', 'be', 'fr', 'es', 'it', 'nl', 'pl']) {
    assert.match(form, new RegExp(`${locale}: \\{[\\s\\S]*publishWaitingTitle:`))
  }
  assert.doesNotMatch(form, /router\.push\(`\/account\/listings\?choosePackage=1&listing=/)
  assert.doesNotMatch(form, /copy\.volumeOffers\.map/)
  assert.doesNotMatch(form, /onAddToBatch/)
})

test('stale or invalid package drafts fall back to the free listing package', () => {
  assert.match(form, /const listingPackageIds = new Set\(\['free_7d', 'standard_15d', 'premium_30d'\]\)/)
  assert.match(form, /packageId: normalizeListingPackageId\(draft\.values\?\.packageId\)/)
  assert.match(form, /const selectedPackageId = normalizeListingPackageId\(values\.packageId\)/)
  assert.match(form, /if \(key === 'packageId'\) return/)
  assert.match(createListingRoute, /function normalizeListingPackageId\(packageId: string\)/)
  assert.match(createListingRoute, /return packageId in listingPackageDetails \? packageId : 'free_7d'/)
  assert.doesNotMatch(createListingRoute, /Välj ett giltigt annonspaket\./)
})

test('listing insert falls back when production schema lacks geo columns', () => {
  assert.match(createListingRoute, /function isMissingGeoListingColumnError/)
  assert.match(createListingRoute, /PGRST204/)
  assert.match(createListingRoute, /delete \(listingInsert as Record<string, unknown>\)\.location_source/)
  assert.match(createListingRoute, /delete \(listingInsert as Record<string, unknown>\)\.geo_place_code/)
})

test('created listings still return success if optional metadata side effects fail', () => {
  assert.match(createListingRoute, /const optionalSideEffects = await Promise\.allSettled/)
  assert.match(createListingRoute, /logOptionalListingSideEffect/)
  assert.match(createListingRoute, /return NextResponse\.json\(\{\s*success: true,[\s\S]*listingId: listing\.id/)
  assert.doesNotMatch(createListingRoute, /await Promise\.all\(\[\s*admin\.from\('marketplace_listing_identifiers'\)/)
})

test('empty seller notes still satisfy the required listing description column', () => {
  assert.match(createListingRoute, /function buildDefaultListingDescription/)
  assert.match(createListingRoute, /const description = sellerNote \|\| buildDefaultListingDescription\(\{ title, city, offerType \}\)/)
  assert.match(createListingRoute, /Strukturerad Autorell-annons:/)
  assert.doesNotMatch(createListingRoute, /const description = sellerNote \|\| null/)
})

test('new listing location accepts verified picks and manual missing-place fallback', () => {
  assert.match(form, /city: current\.city \|\| place\.city \|\| place\.name/)
  assert.match(form, /city: current\.city \|\| value/)
  assert.match(form, /manualLabel=\{localizeFormText\(locale, 'Min ort saknas'/)
  assert.match(form, /allowManual/)
  assert.match(form, /onManual=\{changeManualMunicipality\}/)
  assert.doesNotMatch(form, /locationSource !== 'verified'/)
  assert.match(form, /values\.municipality \|\| values\.city[\s\S]*\? 'manual'/)
  assert.match(geoHelper, /locationSource: 'manual' as const/)
  assert.match(geoHelper, /valid: Boolean\(manualName\)/)
  assert.doesNotMatch(geoHelper, /verifiedMunicipalityCountries/)
})

test('create listing package copy and metadata are manually localized', () => {
  assert.match(form, /title: 'Inicio'/)
  assert.match(form, /title: 'Estándar'/)
  assert.match(form, /days: '5 días'/)
  assert.match(form, /days: '15 días'/)
  assert.match(form, /days: '30 días'/)
  assert.match(form, /periodo de anuncio/)
  assert.doesNotMatch(form, /período de cotización/)

  assert.match(accountSeo, /Crear anuncio \| Autorell/)
  assert.match(accountSeo, /Crea un anuncio de vehiculo/)
  assert.match(accountSeo, /Luo ilmoitus \| Autorell/)
  assert.match(accountSeo, /Utworz ogloszenie \| Autorell/)
})

test('technical max trailer weight remains optional and is placed last for common road vehicles', () => {
  assert.match(options, /numberField\('engineLiters', 'Motorvolym', 0\.1, 20, 'L'\)/)
  assert.doesNotMatch(options, /numberField\('maxTrailerWeightKg', 'Max trailervikt', 1, 10000, 'kg', true\)/)
  assert.match(options, /cars: \[[\s\S]*chips\('damageStatus'[\s\S]*numberField\('maxTrailerWeightKg', 'Max trailervikt', 1, 10000, 'kg'\)/)
  assert.match(options, /vans: \[[\s\S]*chips\('damageStatus'[\s\S]*numberField\('maxTrailerWeightKg', 'Max trailervikt', 1, 12000, 'kg'\)/)
  assert.match(options, /motorhomes: \[[\s\S]*chips\('damageStatus'[\s\S]*numberField\('maxTrailerWeightKg', 'Max trailervikt', 1, 12000, 'kg'\)/)
})

test('create listing customer-entered values use the intended weights and placeholder style', () => {
  assert.match(form, /function Field[\s\S]*className="h-12 w-full[\s\S]*font-medium/)
  assert.match(form, /function PriceField[\s\S]*className="h-12 w-full[\s\S]*font-medium/)
  assert.match(form, /function GeoPlaceCombobox[\s\S]*className="h-12 w-full[\s\S]*font-medium/)
  assert.match(form, /function SelectNative[\s\S]*className="h-12 w-full[\s\S]*font-medium/)
  assert.match(form, /<strong className="mt-1 block[\s\S]*text-sm font-medium/)
  assert.match(form, /<textarea[\s\S]*className="mt-3 min-h-28[\s\S]*text-sm font-normal[\s\S]*placeholder:text-\[#7b8494\][\s\S]*placeholder:font-normal/)
  assert.match(form, /placeholder:text-\[#7b8494\][\s\S]*placeholder:font-normal[\s\S]*focus:border-\[#0866ff\]/)
})

test('listing equipment and preview seller notes are easier to understand across locales', () => {
  assert.match(form, /equipmentAssistTitle/)
  assert.match(form, /equipmentAssistText/)
  assert.match(form, /selectedEquipmentCount\.replace\('\{count\}'/)
  assert.match(form, /sellerNoteIntro/)
  assert.match(form, /Beskriv extra information om objektet/)
  assert.match(form, /Hitta utrustning snabbare/)
  assert.match(form, /Use the fixed choices for specifications/)
  assert.match(form, /Använd de fasta valen för specifikationer/)
  for (const locale of ['fi', 'da', 'be', 'fr', 'es', 'it', 'nl', 'pl']) {
    assert.match(form, new RegExp(`${locale}: \\{[\\s\\S]*selectedEquipmentCount:[\\s\\S]*equipmentAssistTitle:[\\s\\S]*equipmentAssistText:[\\s\\S]*sellerNoteLabel:[\\s\\S]*sellerNoteIntro:[\\s\\S]*sellerNotePlaceholder:`))
  }
})

test('create listing first step does not render a disabled back button', () => {
  assert.match(form, /\{step > 0 \? \(/)
  assert.doesNotMatch(form, /disabled=\{step === 0 \|\| loading\}/)
})

test('image upload status and colour names are localized in create listing', () => {
  assert.match(form, /processingImages: 'Processing images\.\.\.'/)
  assert.match(form, /processingImages: 'Bearbetar bilder\.\.\.'/)
  assert.match(form, /processingImages \? copy\.processingImages : copy\.addImages/)
  assert.doesNotMatch(form, /processingImages \? 'Bearbetar bilder/)

  for (const locale of ['de', 'at', 'fi', 'da', 'fr', 'es', 'it', 'nl', 'pl']) {
    assert.match(form, new RegExp(`${locale}: \\{[\\s\\S]*White:`))
    assert.match(form, new RegExp(`${locale}: \\{[\\s\\S]*'Other colour':`))
  }
})
