import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const companyPage = readFileSync(new URL('../lib/public-company-page.tsx', import.meta.url), 'utf8')
const rootRoute = readFileSync(new URL('../app/company/[id]/page.tsx', import.meta.url), 'utf8')
const localizedRoute = readFileSync(new URL('../app/[market]/company/[id]/page.tsx', import.meta.url), 'utf8')
const listingDetail = readFileSync(new URL('../app/listings/[slug]/ListingDetailPage.tsx', import.meta.url), 'utf8')
const listingBackButton = readFileSync(new URL('../app/components/ListingBackButton.tsx', import.meta.url), 'utf8')
const listingEquipmentSection = readFileSync(new URL('../app/components/ListingEquipmentSection.tsx', import.meta.url), 'utf8')
const listingLocationMap = readFileSync(new URL('../app/components/ListingLocationMap.tsx', import.meta.url), 'utf8')
const listingImageGallery = readFileSync(new URL('../app/components/ListingImageGallery.tsx', import.meta.url), 'utf8')
const newListingPage = readFileSync(new URL('../app/konto/annonser/ny/page.tsx', import.meta.url), 'utf8')
const profileApi = readFileSync(new URL('../app/api/account/profile/route.ts', import.meta.url), 'utf8')

test('public company pages are available on root and localized routes', () => {
  assert.match(rootRoute, /generateCompanyMetadata/)
  assert.match(rootRoute, /PublicCompanyPage/)
  assert.match(localizedRoute, /generateCompanyMetadata/)
  assert.match(localizedRoute, /PublicCompanyPage/)
})

test('public company page requires a paid business plan from starter and up', () => {
  assert.match(companyPage, /paidBusinessPlans = new Set\(\['starter', 'growth', 'professional', 'enterprise'\]\)/)
  assert.match(companyPage, /activeSubscriptionStatuses = new Set\(\['active', 'trialing'\]\)/)
  assert.match(companyPage, /manually_activated/)
  assert.match(companyPage, /free_period_ends_at/)
  assert.match(companyPage, /if \(!subscription\) return null/)
})

test('public company page gathers company listings and contact details', () => {
  assert.match(companyPage, /\.eq\('company_id', profile\.company_id\)/)
  assert.match(companyPage, /marketplace_companies/)
  assert.match(companyPage, /contact_email/)
  assert.match(companyPage, /contact_phone/)
  assert.match(companyPage, /resolveCompanyContactEmail/)
  assert.match(companyPage, /resolveCompanyContactPhone/)
  assert.match(companyPage, /\.in\('seller_user_id', companyUserIds\)/)
  assert.match(companyPage, /\.eq\('status', 'published'\)/)
  assert.match(companyPage, /address_line_1/)
  assert.match(companyPage, /logo_url/)
  assert.match(companyPage, /website_url/)
  assert.match(companyPage, /Open in Google Maps/)
  assert.match(companyPage, /bg-\[linear-gradient/)
  assert.match(companyPage, /company-listing-search/)
  assert.match(companyPage, /ListingCardImageCarousel/)
  assert.match(companyPage, /showControlsOnDesktop/)
  assert.match(companyPage, /showDotsOnDesktop/)
  assert.match(companyPage, /previousLabel=\{translatePublic\(locale, 'Previous photo'\)\}/)
  assert.match(companyPage, /color: #101828 !important/)
  assert.match(companyPage, /color: transparent !important/)
  assert.match(companyPage, /company-listing-search::placeholder/)
  assert.match(companyPage, /company-listing-search-placeholder/)
  assert.match(companyPage, /text-\[#98a2b3\]/)
  assert.match(companyPage, /placeholder=" "/)
  assert.match(companyPage, /company-listing-search:placeholder-shown \+ \.company-listing-search-placeholder/)
  assert.doesNotMatch(companyPage, /focus:text-\[#101828\]/)
  assert.doesNotMatch(companyPage, /<iframe/)
  assert.doesNotMatch(companyPage, /output=embed/)
  assert.match(companyPage, /uniqueValues/)
  assert.doesNotMatch(companyPage, /SummaryStat label=\{copy\.plan\}/)
  assert.doesNotMatch(companyPage, /data\.profile\.email \? <ContactLine/)
})

test('company profile saves public company contact separately from seller contact', () => {
  assert.match(profileApi, /companyContactEmail/)
  assert.match(profileApi, /companyContactPhone/)
  assert.match(profileApi, /contact_email: companyContactEmail/)
  assert.match(profileApi, /contact_phone: companyContactPhone/)
  assert.match(profileApi, /phone: companyContactPhone/)
})

test('business listing detail links to eligible public company page', () => {
  assert.match(listingDetail, /sellerHasPublicCompanyPage/)
  assert.match(listingDetail, /companyPageHref/)
  assert.match(listingDetail, /\/company\/\$\{listing\.seller_user_id\}/)
  assert.match(listingDetail, /Visa företagssida/)
  assert.doesNotMatch(listingDetail, /Kontakt sker via Autorell/)
  assert.doesNotMatch(listingDetail, /Contact happens through Autorell/)
  assert.doesNotMatch(listingDetail, /Kontakt erfolgt/)
})

test('listing detail top navigation uses a history-aware back link instead of visible breadcrumb pills', () => {
  assert.match(listingDetail, /ListingBackButton/)
  assert.match(listingDetail, /fallbackBackHref/)
  assert.match(listingDetail, /label=\{copy\.backToListings\}/)
  assert.match(listingBackButton, /window\.history\.back\(\)/)
  assert.match(listingBackButton, /document\.referrer/)
  assert.match(listingBackButton, /group-hover:-translate-x-1/)
  assert.match(listingBackButton, /text-\[14px\] font-\[500\]/)
  assert.doesNotMatch(listingDetail, /rounded-full border border-\[#d8e2f1\]/)
  assert.doesNotMatch(listingDetail, /item\.icon === 'home'/)
})

test('listing detail cards do not use card shadows', () => {
  assert.doesNotMatch(listingDetail, /listing-contact-card[^"]*shadow-/)
  assert.doesNotMatch(listingDetail, /rounded-\[12px\] border border-\[#dfe6f2\] bg-white p-4 shadow-sm/)
  assert.doesNotMatch(listingDetail, /rounded-\[16px\] border border-\[#dfe6f2\] bg-white p-4 shadow-sm/)
  assert.doesNotMatch(listingEquipmentSection, /bg-white p-4 shadow-sm/)
  assert.doesNotMatch(listingLocationMap, /bg-white shadow-sm/)
  assert.doesNotMatch(listingLocationMap, /bg-white p-5 shadow-sm/)
  assert.doesNotMatch(listingImageGallery, /aspect-\[16\/9\] overflow-hidden shadow-sm/)
})

test('listing detail desktop spec tabs stay compact and company flag is round', () => {
  assert.match(listingDetail, /sm:gap-2\.5 sm:rounded-\[11px\] sm:px-3 sm:py-2\.5/)
  assert.match(listingDetail, /sm:text-\[9px\] sm:tracking-\[0\.12em\]/)
  assert.match(listingDetail, /sm:text-\[13px\] sm:leading-4/)
  assert.match(listingDetail, /CountryFlag code=\{listing\.country_code \|\| 'eu'\} className="h-4 w-4 shrink-0 rounded-full shadow-sm ring-1 ring-black\/5"/)
})

test('new listing page uses a white page background', () => {
  assert.match(newListingPage, /min-h-screen bg-white/)
})
