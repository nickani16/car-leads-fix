import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

const layout = read('app/layout.tsx')
const telemetry = read('app/components/ConsentManagedTelemetry.tsx')
const cookieConsent = read('app/components/CookieConsent.tsx')
const listingForm = read('app/konto/annonser/ny/NewListingForm.tsx')
const listingApi = read('app/api/account/listings/route.ts')
const security = read('lib/marketplace-security.ts')
const withdrawalApi = read('app/api/withdrawal/route.ts')
const withdrawalForm = read('app/withdrawal/WithdrawalForm.tsx')
const withdrawalEmail = read('lib/email/withdrawal-request.ts')
const withdrawalMigration = read('supabase/migrations/20260806193000_marketplace_withdrawal_requests.sql')
const termsPage = read('app/terms/page.tsx')
const swedishTermsPage = read('app/villkor/page.tsx')
const publicLegalPage = read('app/components/PublicLegalPage.tsx')
const translations = JSON.parse(read('lib/generated-public-translations.json'))

test('paid Vercel telemetry stays disabled while advertising still requires consent', () => {
  assert.doesNotMatch(layout, /pagead2\.googlesyndication\.com/)
  assert.doesNotMatch(layout, /<Analytics\s*\/>/)
  assert.match(layout, /<ConsentManagedTelemetry \/>/)
  assert.match(telemetry, /consent === 'advertising' \|\| consent === 'all'/)
  assert.match(telemetry, /pagead2\.googlesyndication\.com/)
  assert.doesNotMatch(telemetry, /@vercel\/analytics|<Analytics/)
  assert.doesNotMatch(telemetry, /@vercel\/speed-insights|<SpeedInsights/)
  assert.match(cookieConsent, /autorell-cookie-consent-changed/)
  assert.match(cookieConsent, /role="switch"/)
  assert.match(cookieConsent, /setAnalyticsAllowed/)
  assert.match(cookieConsent, /setAdvertisingAllowed/)
  assert.match(cookieConsent, /choiceFromPurposes\(analyticsAllowed, advertisingAllowed\)/)
  assert.match(cookieConsent, /\{purposes\.save\}/)
  assert.match(cookieConsent, /max-w-\[520px\]/)
  assert.match(cookieConsent, /\{t\.intro\}/)
  assert.match(cookieConsent, /bg-\[#111827\]\/60/)
  assert.match(cookieConsent, /grid-cols-2 gap-4/)
  assert.match(cookieConsent, /detailsExpanded/)
  assert.match(cookieConsent, /manageChoices/)
  assert.doesNotMatch(cookieConsent, /<BrandLogo/)
  for (const locale of ['en', 'sv', 'de', 'fr', 'es', 'it', 'pl', 'nl', 'fi', 'da']) {
    assert.match(cookieConsent, new RegExp(`\\n  ${locale}: \\{`))
  }
})

test('paid private listings require and record immediate digital service consent', () => {
  assert.match(listingForm, /packageId !== 'free_7d'/)
  assert.match(listingForm, /digitalServiceConsent/)
  assert.match(listingApi, /profile\.account_type === 'private' && packageId !== 'free_7d'/)
  assert.match(listingApi, /acceptance_key: 'immediate_digital_service'/)
  assert.match(security, /marketplace-terms-v1\.3-2026-08-06/)
  assert.match(security, /purchase-terms-v1\.1-2026-08-06/)
  assert.match(security, /marketplace-privacy-v1\.3-2026-08-06/)
})

test('withdrawal requests are saved before localized confirmation emails are sent', () => {
  const savePosition = withdrawalApi.indexOf(".from('marketplace_withdrawal_requests')")
  const emailPosition = withdrawalApi.indexOf('const delivery = await sendWithdrawalRequestEmails')
  assert.ok(savePosition > 0)
  assert.ok(emailPosition > savePosition)
  assert.match(withdrawalApi, /status: 201/)
  assert.match(withdrawalForm, /placeholder:font-normal placeholder:text-\[#7c8799\]/)
  assert.match(withdrawalEmail, /Idempotency-Key.*withdrawal-customer-/s)
  assert.match(withdrawalMigration, /enable row level security/)
  assert.match(withdrawalMigration, /revoke all[\s\S]*anon, authenticated/)
  assert.match(withdrawalMigration, /grant all[\s\S]*service_role/)
  assert.match(withdrawalMigration, /marketplace_withdrawal_user_idx/)
})

test('active public translation catalogs are complete and contain no separator artifacts', () => {
  const active = ['fr', 'es', 'it', 'pl', 'nl', 'fi', 'da']
  const englishKeys = Object.keys(translations.en)
  for (const locale of active) {
    assert.equal(Object.keys(translations[locale]).length, englishKeys.length, `${locale} key count differs`)
    for (const key of englishKeys) {
      const value = translations[locale][key]
      assert.equal(typeof value, 'string', `${locale} is missing ${key}`)
      assert.doesNotMatch(value, /ZXQ|_9Q_|SPLIT_\d|_\d+SPLIT|987654321/i, `${locale}: ${key}`)
    }
  }
})

test('the Swedish market route renders the complete Swedish marketplace terms', () => {
  assert.match(termsPage, /import SwedishTermsPage from '\.\.\/villkor\/page'/)
  assert.match(termsPage, /if \(locale === 'sv'\)/)
  assert.match(termsPage, /return <SwedishTermsPage \/>/)
})

test('private free-listing terms consistently state five days in every active market', () => {
  assert.match(publicLegalPage, /const freeListingTermByLocale: Record<PublicLocale, string>/)
  for (const locale of ['sv', 'en', 'de', 'at', 'be', 'fr', 'es', 'it', 'pl', 'nl', 'fi', 'da']) {
    assert.match(publicLegalPage, new RegExp(`\\n  ${locale}:`))
  }
  assert.match(swedishTermsPage, /Fem dagars grundpublicering är gratis/)
  assert.doesNotMatch(publicLegalPage, /free listing period is seven days|kostenlose Anzeigenlaufzeit beträgt derzeit sieben Tage/i)
  assert.doesNotMatch(swedishTermsPage, /Sju dagars grundpublicering/i)
})
