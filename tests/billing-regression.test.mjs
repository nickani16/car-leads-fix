import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const catalog = readFileSync(new URL('../lib/billing/product-catalog.ts', import.meta.url), 'utf8')
const checkout = readFileSync(new URL('../app/api/account/listing-checkout/route.ts', import.meta.url), 'utf8')
const webhook = readFileSync(new URL('../app/api/stripe/webhook/route.ts', import.meta.url), 'utf8')
const fulfillment = readFileSync(new URL('../lib/billing/fulfillment.ts', import.meta.url), 'utf8')
const search = readFileSync(new URL('../lib/marketplace-search-v2.ts', import.meta.url), 'utf8')
const publicData = readFileSync(new URL('../lib/marketplace-public-data.ts', import.meta.url), 'utf8')
const migration = readFileSync(new URL('../supabase/migrations/20260712153000_billing_catalog_orders_and_visibility.sql', import.meta.url), 'utf8')
const businessLimits = readFileSync(new URL('../lib/billing/business-limits.ts', import.meta.url), 'utf8')
const proxy = readFileSync(new URL('../proxy.ts', import.meta.url), 'utf8')
const home = readFileSync(new URL('../app/components/BusinessMarketplaceHome.tsx', import.meta.url), 'utf8')
const countryFlag = readFileSync(new URL('../app/components/CountryFlag.tsx', import.meta.url), 'utf8')
const publicHeader = readFileSync(new URL('../app/components/PublicHeader.tsx', import.meta.url), 'utf8')
const nextConfig = readFileSync(new URL('../next.config.ts', import.meta.url), 'utf8')
const businessPlanChooser = readFileSync(new URL('../app/konto/business/subscription/BusinessPlanChooser.tsx', import.meta.url), 'utf8')
const accountPage = readFileSync(new URL('../app/konto/page.tsx', import.meta.url), 'utf8')

test('market currencies follow URL market requirements', () => {
  for (const [market, currency] of Object.entries({
    se: 'sek',
    dk: 'dkk',
    pl: 'pln',
    de: 'eur',
    fr: 'eur',
    it: 'eur',
    es: 'eur',
    nl: 'eur',
    be: 'eur',
    at: 'eur',
    fi: 'eur',
  })) {
    assert.match(catalog, new RegExp(`${market}: '${currency}'`))
  }
})

test('catalog contains required private listing package prices', () => {
  assert.match(catalog, /cars:[\s\S]*standard: \{ sek: 9900, eur: 899, dkk: 6900, pln: 3900 \}/)
  assert.match(catalog, /cars:[\s\S]*premium: \{ sek: 19900, eur: 1799, dkk: 13900, pln: 7900 \}/)
  assert.match(catalog, /construction:[\s\S]*standard: \{ sek: 29900, eur: 2599, dkk: 19900, pln: 11900 \}/)
  assert.match(catalog, /construction:[\s\S]*premium: \{ sek: 69900, eur: 5999, dkk: 47900, pln: 27900 \}/)
})

test('checkout uses server-side catalog/database price lookup and rejects client pricing', () => {
  assert.match(checkout, /resolveBillingPrice\(product, market\)/)
  assert.doesNotMatch(checkout, /body\.amount|body\.currency/)
  assert.match(checkout, /Product does not match listing category/)
  assert.match(checkout, /Free listings do not use Stripe checkout/)
  assert.match(checkout, /price_data/)
  assert.match(checkout, /unit_amount: price\.amountMinor/)
})

test('checkout returns a JSON configuration error instead of a raw server crash', () => {
  assert.match(checkout, /Could not create Stripe checkout session/)
  assert.match(checkout, /Missing STRIPE_SECRET_KEY/)
  assert.match(checkout, /Stripe checkout is not configured for this environment/)
  assert.match(checkout, /\{ status: 503 \}/)
})

test('checkout sessions use Autorell branding and product copy', () => {
  assert.match(checkout, /branding_settings: checkoutBranding/)
  assert.match(checkout, /submit_type: product\.billingType === 'payment' \? 'pay' : undefined/)
  assert.doesNotMatch(checkout, /submit_type: 'pay'/)
  assert.match(checkout, /display_name: 'Autorell'/)
  assert.match(checkout, /button_color: '#0866ff'/)
  assert.match(checkout, /url: 'https:\/\/www\.autorell\.com\/autorell-logo-primary\.png'/)
  assert.doesNotMatch(checkout, /autorell-brand-logo-color\.png/)
  assert.doesNotMatch(checkout, /images: \[checkoutBranding\.logo\.url\]/)
  assert.match(checkout, /name: checkoutProduct\.name/)
  assert.match(checkout, /description: checkoutProduct\.description/)
  assert.match(checkout, /packageLabel = packageName === 'premium' \? 'Premiumannons' : 'Standardannons'/)
  assert.match(checkout, /name: `\$\{packageLabel\} · \$\{categoryLabel\}`/)
  assert.match(checkout, /name: `Topplacering · \$\{days\}`/)
  assert.match(checkout, /name: `Företag · \$\{capitalize\(plan\)\}`/)
  assert.match(checkout, /custom_text: \{[\s\S]*submitText/)
  assert.match(checkout, /after_submit: \{[\s\S]*Säker betalning via Stripe/)
  assert.match(checkout, /locale: stripeLocaleForMarket\(market\)/)
})

test('business subscriptions support Stripe invoice terms for B2B customers', () => {
  assert.match(businessPlanChooser, /billingMethod: BillingMethod = 'card'/)
  assert.match(businessPlanChooser, /Faktura 30 dagar/)
  assert.match(businessPlanChooser, /invoiceUrl/)
  assert.match(checkout, /billingMethod = body\.billingMethod === 'invoice' \? 'invoice' : 'card'/)
  assert.match(checkout, /collection_method: 'send_invoice'/)
  assert.match(checkout, /days_until_due: 30/)
  assert.match(checkout, /finalizeInvoice/)
  assert.match(checkout, /sendInvoice/)
  assert.match(checkout, /invoiceEmail/)
  assert.match(checkout, /price\.stripePriceId/)
  assert.match(checkout, /business_onboarding_status: 'active'/)
  assert.match(webhook, /case 'invoice\.sent':/)
  assert.match(webhook, /upsertBusinessInvoice/)
  assert.match(webhook, /!isInvoiceEvent && object\.status/)
  assert.match(fulfillment, /payment_status: 'paid'/)
})

test('business subscription cards expose five tiered plans with Free kept listing-only', () => {
  assert.match(businessPlanChooser, /key: 'free'/)
  assert.match(businessPlanChooser, /key: 'starter'/)
  assert.match(businessPlanChooser, /key: 'growth'/)
  assert.match(businessPlanChooser, /key: 'professional'/)
  assert.match(businessPlanChooser, /key: 'enterprise'/)
  assert.match(businessPlanChooser, /Ingen fÃ¶retagsprofil|Ingen företagssida|Publik företagssida/)
  assert.match(businessPlanChooser, /Företagssida Basic/)
  assert.match(businessPlanChooser, /Företagssida Plus/)
  assert.match(businessPlanChooser, /Företagssida Pro/)
  assert.match(businessPlanChooser, /Teamkonto/)
  assert.match(businessPlanChooser, /10 teamkonton/)
  assert.match(businessPlanChooser, /50\+ teamkonton/)
  assert.match(businessPlanChooser, /Rapporter och export/)
  assert.match(businessPlanChooser, /Faktura 30 dagar/)
  assert.match(businessPlanChooser, /Fakturan är skapad och skickad/)
  assert.doesNotMatch(businessPlanChooser, /Sparkles/)
  assert.doesNotMatch(businessPlanChooser, /#10b981|#15803d|text-\[#15803d\]|bg-\[#10b981\]/)
  assert.match(publicHeader, /accountType === 'business'[\s\S]*account\/business\/subscription/)
  assert.match(accountPage, /title: copy\.plan/)
})

test('webhook handling is signature verified and idempotent', () => {
  assert.match(webhook, /request\.headers\.get\('stripe-signature'\)/)
  assert.match(webhook, /process\.env\.STRIPE_WEBHOOK_SECRET/)
  assert.match(webhook, /constructEvent\(/)
  assert.match(webhook, /stripe_webhook_events/)
  assert.match(webhook, /duplicate/)
  assert.match(migration, /stripe_event_id text primary key/)
  assert.match(fulfillment, /Stripe session metadata mismatch/)
  assert.match(fulfillment, /session\.amount_total !== order\.amount_minor/)
  assert.match(fulfillment, /session\.currency[\s\S]*order\.currency/)
})

test('premium fulfillment starts 30-day listing and 7-day boost only when publishable', () => {
  assert.match(fulfillment, /product\.package === 'premium'/)
  assert.match(fulfillment, /product\.includedBoostDays/)
  assert.match(fulfillment, /pending_review/)
  assert.match(catalog, /listingProduct\(typedCategory, 'premium', 30, prices\.premium, 7\)/)
})

test('top placement sorting uses active boost window before normal listings', () => {
  assert.match(search, /searchPublishedWithSponsoredBlock/)
  assert.match(search, /applyActiveTopPlacementFilter/)
  assert.match(search, /\.eq\('boost_status', 'active'\)/)
  assert.match(search, /\.gt\('boost_expires_at', now\)/)
  assert.match(search, /applyNotActiveTopPlacementFilter/)
})

test('featured listings have active-window queries for home and category UI', () => {
  assert.match(publicData, /getFeaturedMarketplaceHomeListings/)
  assert.match(publicData, /getFeaturedMarketplaceCategoryListings/)
  assert.match(publicData, /\.eq\('featured_status', 'active'\)/)
  assert.match(publicData, /\.gt\('featured_expires_at', now\)/)
})

test('refresh credits are protected by RPC atomic locks and cooldown', () => {
  assert.match(migration, /for update;/)
  assert.match(migration, /last_refreshed_at > now\(\) - p_cooldown/)
  assert.match(migration, /refresh_credits = refresh_credits - 1/)
  assert.match(migration, /sort_refreshed_at = now\(\)/)
  assert.doesNotMatch(migration, /created_at = now\(\)/)
})

test('client cannot update payment-controlled fields through normal authenticated grants', () => {
  assert.match(migration, /revoke update \([\s\S]*boost_status[\s\S]*featured_status[\s\S]*premium_badge_expires_at[\s\S]*\) on public\.marketplace_listings from authenticated/)
  assert.match(migration, /revoke all on function public\.increment_refresh_credits/)
  assert.match(migration, /grant execute on function public\.increment_refresh_credits[\s\S]*to service_role/)
})

test('business listing limits are enforced at 25, 100 and 500 active listings', () => {
  assert.match(businessLimits, /starter: 25/)
  assert.match(businessLimits, /growth: 100/)
  assert.match(businessLimits, /professional: 500/)
  assert.match(businessLimits, /\.eq\('status', 'published'\)/)
  assert.match(businessLimits, /active_listing_limit_reached/)
})

test('canonical English pricing routes do not redirect to themselves', () => {
  assert.match(proxy, /isPublicLanguage\(targetMarket \|\| ''\) &&\s*targetMarket !== 'en'/)
  assert.match(proxy, /targetMarket === 'sv' \? 'se' : targetMarket/)
  assert.doesNotMatch(proxy, /targetMarket === 'en' \? pathname/)
})

test('EU home sections and browser-only header state hydrate deterministically', () => {
  assert.match(home, /localMarketCode === 'EU'[\s\S]*\? localListingSections/)
  assert.match(home, /key=\{section\.id\}/)
  assert.match(countryFlag, /\.toFixed\(4\)/)
  assert.match(publicHeader, /useState<HeaderAccount>\(emptyHeaderAccount\)/)
  assert.match(publicHeader, /useState\(true\)/)
})

test('content security policy allows the MapLibre blob worker', () => {
  assert.match(nextConfig, /worker-src 'self' blob:/)
})
