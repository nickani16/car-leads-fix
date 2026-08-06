import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const form = readFileSync(new URL('../app/components/SellToDealerLeadForm.tsx', import.meta.url), 'utf8')
const page = readFileSync(new URL('../app/components/SellToDealerPage.tsx', import.meta.url), 'utf8')
const requestApi = readFileSync(new URL('../app/api/dealer-offer-requests/route.ts', import.meta.url), 'utf8')
const portal = readFileSync(new URL('../app/account/company/dealer-offers/page.tsx', import.meta.url), 'utf8')
const preferences = readFileSync(new URL('../app/account/company/dealer-offers/DealerLeadPreferencesForm.tsx', import.meta.url), 'utf8')
const preferenceApi = readFileSync(new URL('../app/api/account/company/dealer-lead-preferences/route.ts', import.meta.url), 'utf8')
const companyPortal = readFileSync(new URL('../lib/company-portal.tsx', import.meta.url), 'utf8')
const access = readFileSync(new URL('../lib/dealer-leads/access.ts', import.meta.url), 'utf8')
const portalCopy = readFileSync(new URL('../lib/dealer-leads/i18n.ts', import.meta.url), 'utf8')
const email = readFileSync(new URL('../lib/email/dealer-vehicle-lead.ts', import.meta.url), 'utf8')
const seo = readFileSync(new URL('../lib/public-seo.ts', import.meta.url), 'utf8')
const baseMigration = readFileSync(new URL('../supabase/migrations/20260806103000_dealer_lead_country_notifications.sql', import.meta.url), 'utf8')
const teamMigration = readFileSync(new URL('../supabase/migrations/20260806111500_dealer_lead_team_access.sql', import.meta.url), 'utf8')

test('seller flow requires VIN and persists country and locale with every lead', () => {
  assert.match(form, /if \(!vin\) return t\('Enter VIN\/chassis number\.'\)/)
  assert.match(form, /body\.set\('sourceCountryCode', form\.countryCode\)/)
  assert.match(form, /body\.set\('sourceLocale', locale\)/)
  assert.match(form, /<CountrySelect/)
  assert.match(requestApi, /if \(!payload\.vin\) return 'VIN is required\.'/)
  assert.match(requestApi, /source_country_code: payload\.sourceCountryCode/)
  assert.match(requestApi, /source_locale: payload\.sourceLocale/)
})

test('localized dropdowns store stable values instead of translated labels', () => {
  assert.match(form, /type DealerFormOption = \{ value: string; label: string \}/)
  assert.match(form, /localizedOptions\(\['Petrol'/)
  assert.match(form, /<option key=\{value\} value=\{value\}>\{label\}<\/option>/)
  assert.match(portal, /localizedLeadValue\(locale, lead\.fuel_type\)/)
  assert.match(email, /translatePublic\(recipient\.locale, lead\.fuelType\)/)
})

test('Growth and higher receive country-scoped portal access and menu notifications', () => {
  assert.match(access, /'growth', 'professional', 'enterprise'/)
  assert.match(portal, /\.in\('source_country_code', countries\)/)
  assert.match(preferences, /scopeAll/)
  assert.match(preferences, /max-h-48[\s\S]*overflow-y-auto/)
  assert.match(preferenceApi, /resolveBusinessAccountScope\(user\.id, admin\)/)
  assert.match(companyPortal, /dealerOfferUnreadCount/)
  assert.match(companyPortal, /countUnreadDealerLeads/)
  assert.match(teamMigration, /coalesce\(company\.created_by, p\.user_id\)/)
})

test('new leads reserve idempotent localized emails and direct seller contact actions', () => {
  assert.match(requestApi, /after\(async \(\) =>/)
  assert.match(requestApi, /sendDealerVehicleLeadNotifications/)
  assert.match(email, /dealer_vehicle_lead_email_deliveries/)
  assert.match(email, /Idempotency-Key.*dealer-lead-/s)
  assert.match(email, /allCountries/)
  assert.match(email, /marketplace_companies/)
  assert.match(email, /Team members opt in/)
  assert.match(portal, /href=\{`tel:\$\{lead\.contact_phone\}`\}/)
  assert.match(portal, /href=\{`mailto:\$\{lead\.contact_email\}/)
  for (const locale of ['en', 'sv', 'de', 'fr', 'es', 'it', 'nl', 'fi', 'da', 'pl']) {
    assert.match(email, new RegExp(`\\n  ${locale}: copy\\(`))
    if (locale !== 'en') assert.match(portalCopy, new RegExp(`\\n  ${locale}: language\\(`))
  }
})

test('lead notification tables are protected and deliveries cannot duplicate', () => {
  assert.match(baseMigration, /enable row level security/)
  assert.match(baseMigration, /unique \(lead_id, user_id\)/)
  assert.match(baseMigration, /dealer_lead_preferences_select_own/)
  assert.match(baseMigration, /dealer_vehicle_lead_email_deliveries_select_own/)
  assert.match(teamMigration, /security definer/)
  assert.match(teamMigration, /set search_path = public, pg_temp/)
  assert.match(teamMigration, /revoke all on function private\./)
})

test('sell-to-dealer SEO stays within requested limits and publishes all language alternates', () => {
  const titles = [...page.matchAll(/metaTitle: '([^']+)'/g)].map((match) => match[1])
  const descriptions = [...page.matchAll(/metaDescription: '([^']+)'/g)].map((match) => match[1])
  assert.equal(titles.length, 10)
  assert.equal(descriptions.length, 10)
  for (const value of titles) assert.ok(value.length <= 55, `Title exceeds 55 characters: ${value}`)
  for (const value of descriptions) assert.ok(value.length <= 155, `Description exceeds 155 characters: ${value}`)
  assert.match(page, /cleanSeoText\(copy\.metaTitle, 55\)/)
  assert.match(page, /cleanSeoText\(copy\.metaDescription, 155\)/)
  assert.match(page, /getPublicLanguageAlternates\('\/sell-to-dealer'\)/)
  for (const hreflang of ['sv-SE', 'de-DE', 'de-AT', 'nl-BE', 'fr-FR', 'es-ES', 'it-IT', 'pl-PL', 'nl-NL', 'fi-FI', 'da-DK']) {
    assert.match(seo, new RegExp(`'${hreflang}'`))
  }
})
