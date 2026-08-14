import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

const homeSearchSource = readFileSync(
  new URL('../app/components/HomeHeroVehicleSearch.tsx', import.meta.url),
  'utf8',
)
const placeholderSource = readFileSync(
  new URL('../app/components/HomeSearchAnimatedPlaceholder.tsx', import.meta.url),
  'utf8',
)
const homeSource = readFileSync(
  new URL('../app/components/BusinessMarketplaceHome.tsx', import.meta.url),
  'utf8',
)
const publicHeaderSource = readFileSync(
  new URL('../app/components/PublicHeader.tsx', import.meta.url),
  'utf8',
)
const categoryRailsSource = readFileSync(
  new URL('../app/components/HomeVehicleCategoryRails.tsx', import.meta.url),
  'utf8',
)
const headingSliderSource = readFileSync(
  new URL('../app/components/HomeMarketHeadingSlider.tsx', import.meta.url),
  'utf8',
)
const globalCssSource = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8')
const proxySource = readFileSync(new URL('../proxy.ts', import.meta.url), 'utf8')
const translations = JSON.parse(
  readFileSync(new URL('../lib/generated-public-translations.json', import.meta.url), 'utf8'),
)
const manualTranslationsSource = readFileSync(
  new URL('../lib/manual-public-translations.ts', import.meta.url),
  'utf8',
)

test('homepage search keeps category-specific filters and the real count API', () => {
  for (const category of [
    'cars',
    'vans',
    'trucks',
    'motorcycles',
    'construction',
    'motorhomes',
    'caravans',
    'agriculture',
    'electric-bikes',
  ]) {
    assert.match(homeSearchSource, new RegExp(`(?:slug: |  )'${category}'`))
  }

  assert.match(homeSearchSource, /categoryLayouts/)
  assert.match(homeSearchSource, /isLeasingMarketplaceCategory/)
  assert.match(homeSearchSource, /\/api\/marketplace\/search-v2/)
  assert.match(homeSearchSource, /AbortController/)
  assert.match(homeSearchSource, /payload\.totalCount/)
  assert.match(homeSearchSource, /countError/)
  assert.match(homeSearchSource, /params\.set\('mode', intent\)/)
  assert.match(homeSearchSource, /setNonEmptyParam\(params, 'q', queryValue\)/)
  assert.match(homeSearchSource, /params\.set\('municipality', locationValue\)/)
})

test('homepage search panels and placeholder retain their accessibility behavior', () => {
  assert.match(homeSearchSource, /aria-controls="home-search-category-menu"/)
  assert.match(homeSearchSource, /aria-controls="home-search-more-filters"/)
  assert.match(homeSearchSource, /event\.key === 'Escape'/)
  assert.match(homeSearchSource, /aria-modal="true"/)
  assert.match(homeSearchSource, /moreFiltersCloseRef\.current\?\.focus\(\)/)
  assert.match(placeholderSource, /prefers-reduced-motion/)
  assert.match(placeholderSource, /const \[deleting, setDeleting\] = useState\(false\)/)
  assert.match(placeholderSource, /deleting \? DELETE_DELAY_MS : TYPE_DELAY_MS/)
  assert.match(placeholderSource, /setDeleting\(true\)/)
  assert.match(placeholderSource, /setDeleting\(false\)/)
  assert.match(homeSearchSource, /categoryExamples/)
  assert.match(homeSearchSource, /t\.categoryExamples[\s\S]*\[category\]/)
  assert.match(homeSearchSource, /category,\s*\n\s*active: searchFocused/)
  assert.doesNotMatch(homeSearchSource, /<HomeSearchAnimatedPlaceholder examples=\{t\.examples\}/)
  assert.doesNotMatch(homeSearchSource, /Sparkles/)
  assert.doesNotMatch(homeSearchSource, /Volvo V70 diesel/)
})

test('homepage search keeps compact rounded filter controls', () => {
  assert.match(homeSearchSource, /font-medium leading-4 text-\[#344054\]/)
  assert.match(homeSearchSource, /home-hero-filter-select h-9 min-h-9 w-full appearance-none rounded-\[14px\]/)
  assert.match(homeSearchSource, /grid h-9 grid-cols-2 gap-0\.5 rounded-\[16px\]/)
  assert.match(homeSearchSource, /inline-flex h-full min-h-0 items-center justify-center rounded-\[13px\]/)
  assert.doesNotMatch(homeSearchSource, /className=\{`min-h-8 rounded-\[14px\]/)
  assert.match(homeSearchSource, /h-10 w-full rounded-\[14px\].*lg:h-9/)
  assert.match(homeSearchSource, /min-h-10 self-end items-center justify-center gap-2 rounded-full/)
  assert.doesNotMatch(homeSearchSource, /grid min-h-10 grid-cols-2 overflow-hidden rounded-\[12px\]/)
})

test('public header business links are explicit in every public locale', () => {
  assert.match(publicHeaderSource, /const businessMenuCopy: Record</)
  for (const locale of ['sv', 'en', 'de', 'at', 'be', 'fr', 'es', 'it', 'pl', 'nl', 'fi', 'da']) {
    assert.match(publicHeaderSource, new RegExp(`\\n  ${locale}: \\{`))
  }
  assert.match(publicHeaderSource, /sv: \{[\s\S]*solutionsLabel: 'Handlarlösningar'/)
  assert.match(publicHeaderSource, /fi: \{[\s\S]*solutionsLabel: 'Ratkaisut autoliikkeille'/)
  assert.doesNotMatch(publicHeaderSource, /publicLabel\('Dealer solutions', 'Dealer solutions'/)
})

test('homepage popular brands keep an even logo grid', () => {
  assert.match(homeSource, /\['skoda', 'Skoda', '\/vehicle-brand-logos\/skoda\.svg'\]/)
  assert.equal(
    existsSync(new URL('../public/vehicle-brand-logos/skoda.svg', import.meta.url)),
    true,
  )
  assert.doesNotMatch(categoryRailsSource, /last:col-span-2/)
})

test('homepage vehicle rails use white bordered cards while preserving highlighted blue cards', () => {
  assert.match(categoryRailsSource, /\? 'bg-\[#b8d3ff\] hover:bg-\[#adcbfc\]'/)
  assert.match(
    categoryRailsSource,
    /border border-\[#d4dbe5\] bg-white hover:border-\[#b8c6d8\] hover:bg-\[#f8fbff\]/,
  )
  assert.match(categoryRailsSource, /bg-\[#edf4ff\] text-\[#5269b0\]/)
  assert.doesNotMatch(categoryRailsSource, /bg-\[#e4e9f0\]/)
})

test('homepage search overrides broken generated Finnish reset copy', () => {
  assert.match(manualTranslationsSource, /fi:\s*\{[\s\S]*Reset: 'Tyhjennä'/)
  assert.ok(translations.fi?.Reset)
  assert.doesNotMatch(translations.fi.Reset, /ZXQ|_9Q_|SPLIT_/)
  assert.doesNotMatch(manualTranslationsSource, /Reset: 'Korjaus/)
})

test('homepage search uses the supplied hero image and translated public copy', () => {
  assert.match(homeSource, /\/autorell-home-desktop-market-hero\.png/)
  assert.match(homeSource, /\/autorell-home-mobile-market-hero\.png/)
  assert.match(homeSource, /aspect-\[750\/400\]/)
  assert.match(homeSource, /object-fill lg:hidden/)
  assert.match(homeSource, /items-center justify-center/)
  assert.match(homeSource, /w-\[55%\]/)
  assert.match(homeSource, /max-w-\[215px\]/)
  assert.match(headingSliderSource, /text-\[20px\]/)
  assert.doesNotMatch(homeSource, /w-\[68%\]/)
  assert.match(homeSource, /heroHeading: 'Europas bästa fordonsmarknad'/)
  assert.match(homeSource, /<HomeMarketHeadingSlider/)
  assert.match(homeSource, /lead=\{t\.heroHeadingSlider\.lead\}/)
  assert.match(homeSource, /t\.heroHeadingSlider\.localTerm/)
  assert.match(homeSource, /t\.heroHeadingSlider\.europeTerm/)
  assert.match(homeSource, /tail=\{t\.heroHeadingSlider\.tail\}/)
  assert.match(headingSliderSource, /prefers-reduced-motion: reduce/)
  assert.match(headingSliderSource, /home-market-heading-term/)
  assert.doesNotMatch(headingSliderSource, /measure-\$\{term\}/)
  assert.doesNotMatch(headingSliderSource, /invisible col-start-1 row-start-1/)
  assert.match(globalCssSource, /@keyframes home-market-heading-slide/)
  assert.match(homeSource, /unoptimized/)
  assert.doesNotMatch(homeSource, /\/autorell-home-search-hero\.webp/)
  assert.doesNotMatch(homeSource, /\/autorell-home-hero-street-cars\.jpg/)
  assert.equal(
    existsSync(new URL('../public/autorell-home-desktop-market-hero.png', import.meta.url)),
    true,
  )
  assert.equal(
    existsSync(new URL('../public/autorell-home-mobile-market-hero.png', import.meta.url)),
    true,
  )

  for (const locale of ['fr', 'es', 'it', 'pl', 'nl', 'fi', 'da']) {
    assert.ok(translations[locale]?.['Find the right vehicle. One simpler search.'])
    assert.ok(translations[locale]?.['More search filters'])
  }
  assert.match(homeSource, /const localizedHeroAltCopy: Record<PublicLocale, string>/)
  assert.match(homeSource, /heroAlt: localizedHeroAltCopy\[locale\]/)
})

test('homepage hero heading is explicitly localized for every public locale', () => {
  assert.match(homeSource, /const localizedHeroHeadingCopy: Record<PublicLocale, string>/)
  assert.match(homeSource, /const localizedLocalHeroHeadingCopy: Record<PublicLocale, string>/)
  assert.match(homeSource, /const localizedHeroHeadingSliderCopy: Record</)
  assert.match(homeSource, /heroHeading: localizedHeroHeadingCopy\[locale\]/)
  assert.match(homeSource, /localHeroHeading: localizedLocalHeroHeadingCopy\[locale\]/)
  assert.match(homeSource, /heroHeadingSlider: localizedHeroHeadingSliderCopy\[locale\]/)

  const expectedHeadings = [
    "sv: 'Europas bästa fordonsmarknad'",
    `en: "Europe's best vehicle marketplace"`,
    "de: 'Europas bester Fahrzeugmarkt'",
    "at: 'Europas bester Fahrzeugmarkt'",
    `be: "Europa's beste voertuigmarkt"`,
    `fr: "Le meilleur marché de véhicules d'Europe"`,
    "es: 'El mejor mercado de vehículos de Europa'",
    `it: "Il miglior mercato di veicoli d'Europa"`,
    "pl: 'Najlepszy rynek pojazdów w Europie'",
    `nl: "Europa's beste voertuigmarkt"`,
    "fi: 'Euroopan paras ajoneuvomarkkina'",
    "da: 'Europas bedste køretøjsmarked'",
  ]

  for (const heading of expectedHeadings) {
    assert.ok(homeSource.includes(heading), `Missing localized hero heading: ${heading}`)
  }

  const expectedLocalHeadings = [
    "sv: 'Sveriges bästa fordonsmarknad'",
    `en: "Europe's best vehicle marketplace"`,
    "de: 'Deutschlands bester Fahrzeugmarkt'",
    "at: 'Österreichs bester Fahrzeugmarkt'",
    "be: 'Belgiës beste voertuigmarkt'",
    "fr: 'Le meilleur marché de véhicules de France'",
    "es: 'El mejor mercado de vehículos de España'",
    "it: 'Il miglior mercato di veicoli in Italia'",
    "pl: 'Najlepszy rynek pojazdów w Polsce'",
    "nl: 'De beste voertuigmarkt van Nederland'",
    "fi: 'Suomen paras ajoneuvomarkkina'",
    "da: 'Danmarks bedste køretøjsmarked'",
  ]

  for (const heading of expectedLocalHeadings) {
    assert.ok(homeSource.includes(heading), `Missing localized local hero heading: ${heading}`)
  }

  for (const term of [
    "localTerm: 'Sveriges'",
    "europeTerm: 'Europas'",
    "localTerm: 'Deutschlands'",
    "localTerm: 'Österreichs'",
    "localTerm: 'Belgiës'",
    "localTerm: 'de France'",
    "localTerm: 'España'",
    "localTerm: 'in Italia'",
    "localTerm: 'w Polsce'",
    "localTerm: 'Nederland'",
    "localTerm: 'Suomen'",
    "localTerm: 'Danmarks'",
  ]) {
    assert.ok(homeSource.includes(term), `Missing localized rotating term: ${term}`)
  }
})

test('explicit public locale paths are not geo-redirected back to another language', () => {
  assert.doesNotMatch(proxySource, /const geoRedirectMarket = shouldGeoRedirectLocalizedPath/)
  assert.doesNotMatch(proxySource, /return buildGeoMarketRedirect\(/)
  assert.match(proxySource, /requestHeaders\.set\('x-autorell-language', localeContext\.language\)/)
  assert.match(proxySource, /requestHeaders\.set\('x-autorell-market', localeContext\.marketHeader\)/)
})
