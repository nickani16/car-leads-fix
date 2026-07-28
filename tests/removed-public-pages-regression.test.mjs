import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const root = fileURLToPath(new URL('../', import.meta.url))
const removedPages = [
  'sell-vehicle',
  'safety-tips',
  'partners',
  'careers',
  'press',
  'how-selling-works',
  'compare-vehicles',
  'payments',
]

const localizedCatchAll = readFileSync(new URL('../app/[market]/[...slug]/page.tsx', import.meta.url), 'utf8')
const publicI18n = readFileSync(new URL('../lib/public-i18n.ts', import.meta.url), 'utf8')
const publicMarket = readFileSync(new URL('../lib/public-market.ts', import.meta.url), 'utf8')
const publicFooter = readFileSync(new URL('../app/components/PublicFooter.tsx', import.meta.url), 'utf8')
const publicHeader = readFileSync(new URL('../app/components/PublicHeader.tsx', import.meta.url), 'utf8')
const vehicleSearch = readFileSync(new URL('../app/components/VehicleSearchExperience.tsx', import.meta.url), 'utf8')

test('removed public pages no longer have route files', () => {
  for (const page of removedPages) {
    assert.equal(existsSync(`${root}app/${page}/page.tsx`), false, page)
  }
  assert.equal(existsSync(`${root}app/[market]/sell-vehicle/page.tsx`), false)
})

test('localized catch-all returns not found for removed public pages', () => {
  for (const page of removedPages) {
    assert.match(localizedCatchAll, new RegExp(`'${page}'`))
  }
  assert.match(localizedCatchAll, /removedPublicPages\.has\(slugPath\)[\s\S]*notFound\(\)/)
  assert.doesNotMatch(localizedCatchAll, /SellVehicleSeoPage/)
})

test('removed public pages are not advertised in sitemap or public navigation', () => {
  for (const page of removedPages) {
    assert.doesNotMatch(publicI18n, new RegExp(`'/${page}'`))
    assert.doesNotMatch(publicMarket, new RegExp(`'/${page}'`))
    assert.doesNotMatch(publicFooter, new RegExp(`'/${page}'`))
    assert.doesNotMatch(publicHeader, new RegExp(`'/${page}'`))
    assert.doesNotMatch(vehicleSearch, new RegExp(`'/${page}'`))
  }
})

test('public footers keep visible copyright and marketplace labels localized', () => {
  assert.match(publicFooter, /const footerCopyright: Record<PublicLocale, string>/)
  assert.match(publicFooter, /sv: 'Alla rättigheter förbehållna\.'/)
  assert.match(publicFooter, /fr: 'Tous droits réservés\.'/)
  assert.match(publicFooter, /pl: 'Wszelkie prawa zastrzeżone\.'/)
  assert.doesNotMatch(publicFooter, />© 2026 Autorell\. All rights reserved\.<\/p>/)
  assert.match(publicFooter, /\{footerCopyright\[locale\]\}/)
  assert.match(publicFooter, /title: 'Marknadsplats'/)
  assert.match(publicFooter, /\['Återförsäljarlösningar', '\/business'\]/)
  assert.match(vehicleSearch, /const marketplaceFooterCopyright: Record<PublicLocale, string>/)
  assert.match(vehicleSearch, /const marketplaceBrandSubtitle: Record<PublicLocale, string>/)
  assert.match(vehicleSearch, /fr: 'Place de marché'/)
  assert.match(vehicleSearch, /\{marketplaceFooterCopyright\[locale\]\}/)
  assert.doesNotMatch(vehicleSearch, />Marketplace<\/span>/)
  for (const removedAppDownloadSnippet of [
    'AppDownloadBadges',
    'MarketplaceAppBadges',
    'app-store-badge.svg',
    'google-play-badge.svg',
    'NEXT_PUBLIC_APP_STORE_URL',
    'NEXT_PUBLIC_PLAY_STORE_URL',
  ]) {
    assert.doesNotMatch(publicFooter, new RegExp(removedAppDownloadSnippet))
    assert.doesNotMatch(vehicleSearch, new RegExp(removedAppDownloadSnippet))
  }
})

test('header keeps menu entries while routing them to live destinations', () => {
  assert.match(publicHeader, /Annonsera fordon på Autorell/)
  assert.match(publicHeader, /requiresLogin: true/)
  assert.match(publicHeader, /openAuthModal\('login', sellHref\)/)
  assert.match(publicHeader, /Safety tips', 'Säkerhetstips', 'Sicherheitstipps'/)
  assert.match(publicHeader, /href: localizePublicHref\(locale, '\/help-center'\)[\s\S]*label: publicLabel\('Safety tips'/)
})
