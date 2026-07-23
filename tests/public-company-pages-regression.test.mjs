import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const companyPage = readFileSync(new URL('../lib/public-company-page.tsx', import.meta.url), 'utf8')
const rootRoute = readFileSync(new URL('../app/company/[id]/page.tsx', import.meta.url), 'utf8')
const localizedRoute = readFileSync(new URL('../app/[market]/company/[id]/page.tsx', import.meta.url), 'utf8')
const listingDetail = readFileSync(new URL('../app/listings/[slug]/ListingDetailPage.tsx', import.meta.url), 'utf8')
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
})
