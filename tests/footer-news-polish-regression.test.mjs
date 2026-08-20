import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const footer = readFileSync(new URL('../app/components/PublicFooter.tsx', import.meta.url), 'utf8')
const vehicleNewsPage = readFileSync(new URL('../app/components/VehicleNewsPage.tsx', import.meta.url), 'utf8')
const vehicleNewsSearch = readFileSync(new URL('../app/components/VehicleNewsSearch.tsx', import.meta.url), 'utf8')
const publicI18n = readFileSync(new URL('../lib/public-i18n.ts', import.meta.url), 'utf8')
const sitemap = readFileSync(new URL('../app/sitemaps/[name]/route.ts', import.meta.url), 'utf8')

test('footer keeps localized copyright, language selector, currency selector and brand social layout', () => {
  assert.match(footer, /const footerLanguageNames: Record<PublicLocale, string>/)
  assert.match(footer, /const footerCurrencyLabels: Record<PublicLocale, string>/)
  for (const locale of ['sv', 'en', 'de', 'at', 'be', 'fr', 'es', 'it', 'pl', 'nl', 'fi', 'da']) {
    assert.match(footer, new RegExp(`\\n  ${locale}:`), `${locale} should have a language label`)
  }
  assert.match(footer, /© 2026 Autorell\. \{footerCopyright\[locale\]\}/)
  assert.match(footer, /bg-white px-0 pb-0 pt-10/)
  assert.doesNotMatch(footer, /<p className="mt-5[^>]*">\{t\.legalNotice\}<\/p>/)
  assert.match(footer, /© 2026 Autorell\. \{footerCopyright\[locale\]\}[\s\S]*?<SocialLinks \/>/)
  assert.equal(footer.match(/© 2026 Autorell\. \{footerCopyright\[locale\]\}/g)?.length, 1)
  assert.match(footer, /\{footerLanguageNames\[locale\]\}/)
  assert.match(footer, /ariaLabel=\{footerCurrencyLabels\[locale\]\}/)
  assert.match(footer, /defaultValue=\{footerMarket\.currency\}/)
  assert.match(footer, /<SocialLinks \/>/)
  assert.match(footer, /rounded-\[7px\] bg-\[#0866ff\] text-white/)
})

test('removed app page is absent from public paths and sitemap', () => {
  assert.doesNotMatch(publicI18n, /'\/app'/)
  assert.doesNotMatch(sitemap, /'\/app'/)
})

test('vehicle news navigation and search field use the requested typography', () => {
  assert.match(vehicleNewsPage, /text-\[14px\] font-medium/)
  assert.doesNotMatch(vehicleNewsPage, /text-\[15px\] font-normal/)
  assert.match(vehicleNewsSearch, /font-normal text-\[#101828\][^\n]*placeholder:font-normal placeholder:text-\[#7b8494\]/)
})
