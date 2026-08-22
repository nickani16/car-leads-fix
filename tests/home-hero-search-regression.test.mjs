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
const homepageCategoryConfigSource = readFileSync(
  new URL('../lib/homepage-category-config.ts', import.meta.url),
  'utf8',
)
const publicHeaderSource = readFileSync(
  new URL('../app/components/PublicHeader.tsx', import.meta.url),
  'utf8',
)
const categoryProviderSource = readFileSync(
  new URL('../app/components/HomeCategoryProvider.tsx', import.meta.url),
  'utf8',
)
const categoryDiscoverySource = readFileSync(
  new URL('../app/components/HomeCategoryDiscovery.tsx', import.meta.url),
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
  assert.match(homeSearchSource, /const moreFilterKeys = useMemo/)
  assert.match(homeSearchSource, /\.\.\.categoryLayout\.top/)
  assert.match(homeSearchSource, /\.\.\.categoryLayout\.bottom\.filter/)
  assert.match(homeSearchSource, /\.\.\.categoryLayout\.advanced/)
})

test('homepage filter keeps a compact primary row and advanced controls in the dialog', () => {
  assert.match(homeSearchSource, /browseByType\?: ReactNode/)
  assert.doesNotMatch(homeSearchSource, /home-search-quick-filters/)
  assert.doesNotMatch(homeSearchSource, /quickFiltersOpen/)
  assert.match(homeSearchSource, /sm:max-w-\[var\(--autorell-page-max\)\]/)
  assert.match(homeSearchSource, /lg:px-7 lg:pb-3 lg:pt-5/)
  assert.match(homeSearchSource, /lg:grid-cols-\[minmax\(180px,1fr\)_minmax\(180px,1fr\)_minmax\(220px,\.95fr\)_minmax\(220px,\.9fr\)\]/)
  assert.match(homeSearchSource, /disabled=\{key === 'model' && !filters\.make\}[\s\S]*hideLabel/)
  assert.match(homeSearchSource, /placeholder=\{hideLabel \? label : allLabel\}/)
  assert.match(homeSearchSource, /order-2 col-span-2 lg:order-0 lg:col-span-1 lg:col-start-3 lg:row-start-1/)
  assert.match(homeSearchSource, /order-3 col-span-2 flex w-full lg:order-0 lg:col-span-1 lg:col-start-4 lg:row-start-1/)
  assert.match(homeSearchSource, /<PurchaseTypeControl[\s\S]*moreFilterKeys\.map/)
  assert.match(homeSearchSource, /home-hero-filter-select h-10 min-h-10/)
  assert.match(homeSource, /browseByType=\{/)
  assert.doesNotMatch(homeSource, /<div className="mt-3">\s*<HomeBrowseByTypeSwitcher/)
})

test('direct homepage loads default to cars without persisted category state', () => {
  assert.match(categoryProviderSource, /initialCategory = 'cars'/)
  assert.match(categoryProviderSource, /useState<MarketplaceCategorySlug>\(initialCategory\)/)
  assert.doesNotMatch(categoryProviderSource, /localStorage|sessionStorage/)
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

test('homepage search uses compact rounded primary controls', () => {
  assert.match(homeSearchSource, /font-medium leading-4 text-\[#344054\]/)
  assert.match(homeSearchSource, /home-hero-filter-select h-10 min-h-10 w-full appearance-none rounded-\[12px\]/)
  assert.match(homeSearchSource, /grid h-10 grid-cols-2 gap-0\.5 rounded-\[12px\]/)
  assert.match(homeSearchSource, /inline-flex h-full min-h-0 items-center justify-center rounded-\[9px\]/)
  assert.doesNotMatch(homeSearchSource, /className=\{`min-h-8 rounded-\[14px\]/)
  assert.match(homeSearchSource, /placeholder=\{label\}/)
  assert.match(homeSearchSource, /home-hero-location-input h-10 w-full rounded-\[12px\]/)
  assert.match(homeSearchSource, /min-h-10 self-end items-center justify-center gap-2 rounded-full/)
  assert.match(homeSearchSource, /right-3[\s\S]*text-\[#0866ff\]/)
  assert.doesNotMatch(homeSearchSource, /grid min-h-10 grid-cols-2 overflow-hidden rounded-\[12px\]/)
})

test('homepage location placeholder keeps the mobile filter text size', () => {
  assert.match(
    globalCssSource,
    /@media \(max-width: 767px\)[\s\S]*\.home-hero-location-input::placeholder[\s\S]*font-size: 14px !important/,
  )
})

test('homepage discovery uses matching regenerated pickup and electric cutouts on white sections', () => {
  assert.match(homepageCategoryConfigSource, /cars-pickup-v2\.webp/)
  assert.match(homepageCategoryConfigSource, /cars-electric-v2\.webp/)
  assert.ok(existsSync(new URL('../public/homepage-discovery/types/cars-pickup-v2.webp', import.meta.url)))
  assert.ok(existsSync(new URL('../public/homepage-discovery/types/cars-electric-v2.webp', import.meta.url)))
  assert.doesNotMatch(homeSource, /bg-\[#e9eef4\]/)
  assert.doesNotMatch(homeSource, /bg-\[#fbfcfe\]/)
  assert.doesNotMatch(homeSource, /bg-\[#f4f4f5\]/)
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
  assert.match(homepageCategoryConfigSource, /\['skoda', 'Skoda', '\/vehicle-brand-logos\/skoda\.svg'\]/)
  assert.equal(
    existsSync(new URL('../public/vehicle-brand-logos/skoda.svg', import.meta.url)),
    true,
  )
  assert.doesNotMatch(categoryDiscoverySource, /last:col-span-2/)
  assert.match(categoryDiscoverySource, /titleSize="large"/)
  assert.match(categoryDiscoverySource, /text-\[28px\][\s\S]*sm:text-\[30px\]/)
  assert.match(categoryDiscoverySource, /w-\[134px\][\s\S]*lg:w-\[180px\]/)
  assert.match(categoryDiscoverySource, /h-\[96px\][\s\S]*max-h-\[88px\]/)
})

test('homepage sell cards scroll on mobile and iPad while remaining a desktop grid', () => {
  assert.match(homeSource, /flex snap-x snap-mandatory[\s\S]*overflow-x-auto[\s\S]*xl:grid xl:grid-cols-2/)
  assert.match(homeSource, /w-\[82vw\][\s\S]*flex-none snap-start[\s\S]*sm:w-\[520px\][\s\S]*md:w-\[560px\][\s\S]*lg:w-\[600px\][\s\S]*xl:w-auto/)
})

test('homepage category discovery uses a compact white panel and touch scrolling', () => {
  assert.match(categoryDiscoverySource, /border border-\[#d4dbe5\] bg-white/)
  assert.match(categoryDiscoverySource, /overflow-x-auto/)
  assert.match(categoryDiscoverySource, /sm:hidden|hidden.*sm:grid/)
  assert.doesNotMatch(categoryDiscoverySource, /bg-\[#b8d3ff\]/)
  assert.match(categoryDiscoverySource, /plain=\{props\.integrated\}/)
  assert.match(categoryDiscoverySource, /w-\[106px\]/)
  assert.match(categoryDiscoverySource, /pr-10.*sm:pr-0/)
  assert.match(categoryDiscoverySource, /bg-gradient-to-l from-white to-transparent sm:hidden/)
  assert.doesNotMatch(homeSource, /border-y border-\[#e4e9f0\] bg-white/)
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
