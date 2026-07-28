import { cleanSeoText } from './market-seo'
import { type MarketplaceCategorySlug } from './marketplace'
import {
  resolveMarketplaceGeoAreaBySlug,
  type MarketplaceGeoArea,
} from './marketplace-search-state'
import { getGeoRegions, searchGeoPlaces } from './marketplace-geo'
import type { PublicLocale } from './public-i18n'

type GeoCategoryRoute = {
  category: MarketplaceCategorySlug
  plural: string
  leasing?: boolean
}

type GeoMarketRouteConfig = {
  locale: PublicLocale
  countryCode: string
  categories: Record<string, GeoCategoryRoute>
  title: (subject: string, place: string) => string
  description: (subject: string, place: string) => string
  zeroResults: (subject: string, place: string) => string
}

export type GeoLandingRoute = {
  market: string
  locale: PublicLocale
  countryCode: string
  category: MarketplaceCategorySlug
  categorySlug: string
  categoryLabel: string
  leasing: boolean
  place: MarketplaceGeoArea
  makeSlug: string | null
  make: string | null
  canonicalPath: string
  h1: string
  title: string
  description: string
  zeroResultsText: string
}

const marketRouteConfigs: Record<string, GeoMarketRouteConfig> = {
  se: {
    locale: 'sv',
    countryCode: 'SE',
    categories: {
      bilar: category('cars', 'bilar'),
      transportbilar: category('vans', 'transportbilar'),
      motorcyklar: category('motorcycles', 'motorcyklar'),
      husbilar: category('motorhomes', 'husbilar'),
      husvagnar: category('caravans', 'husvagnar'),
      lastbilar: category('trucks', 'lastbilar'),
      lantbruksmaskiner: category('agriculture', 'lantbruksmaskiner'),
      entreprenadmaskiner: category('construction', 'entreprenadmaskiner'),
      cyklar: category('electric-bikes', 'cyklar'),
      leasingbilar: leasingCategory('cars', 'leasingbilar'),
      leasingtransportbilar: leasingCategory('vans', 'leasingtransportbilar'),
      leasinglastbilar: leasingCategory('trucks', 'leasinglastbilar'),
      leasinglantbruksmaskiner: leasingCategory('agriculture', 'leasinglantbruksmaskiner'),
      leasingentreprenadmaskiner: leasingCategory('construction', 'leasingentreprenadmaskiner'),
    },
    title: (subject, place) => `${subject} till salu i ${place}`,
    description: (subject, place) =>
      `Se ${lower(subject)} till salu i ${place}. J\u00e4mf\u00f6r fordon fr\u00e5n privata s\u00e4ljare och f\u00f6retag p\u00e5 Autorell.`,
    zeroResults: (subject, place) => `Inga ${lower(subject)} till salu i ${place} just nu`,
  },
  de: deMarket('de', 'DE'),
  at: deMarket('at', 'AT'),
  fr: {
    locale: 'fr',
    countryCode: 'FR',
    categories: {
      voitures: category('cars', 'voitures'),
      utilitaires: category('vans', 'utilitaires'),
      motos: category('motorcycles', 'motos'),
      'camping-cars': category('motorhomes', 'camping-cars'),
      caravanes: category('caravans', 'caravanes'),
      camions: category('trucks', 'camions'),
      'machines-agricoles': category('agriculture', 'machines agricoles'),
      'engins-chantier': category('construction', 'engins de chantier'),
      'velos-electriques': category('electric-bikes', 'v\u00e9los \u00e9lectriques'),
      'leasing-voitures': leasingCategory('cars', 'voitures en leasing'),
      'leasing-utilitaires': leasingCategory('vans', 'utilitaires en leasing'),
      'leasing-camions': leasingCategory('trucks', 'camions en leasing'),
      'leasing-machines-agricoles': leasingCategory('agriculture', 'machines agricoles en leasing'),
      'leasing-engins-chantier': leasingCategory('construction', 'engins de chantier en leasing'),
    },
    title: (subject, place) => `${subject} \u00e0 vendre \u00e0 ${place}`,
    description: (subject, place) =>
      `Voir ${lower(subject)} \u00e0 vendre \u00e0 ${place}. Comparez les v\u00e9hicules de particuliers et de professionnels sur Autorell.`,
    zeroResults: (subject, place) => `Aucune annonce pour ${lower(subject)} \u00e0 ${place} pour le moment`,
  },
  it: {
    locale: 'it',
    countryCode: 'IT',
    categories: {
      auto: category('cars', 'auto'),
      furgoni: category('vans', 'furgoni'),
      moto: category('motorcycles', 'moto'),
      camper: category('motorhomes', 'camper'),
      caravan: category('caravans', 'caravan'),
      autocarri: category('trucks', 'autocarri'),
      'macchine-agricole': category('agriculture', 'macchine agricole'),
      'macchine-edili': category('construction', 'macchine edili'),
      'bici-elettriche': category('electric-bikes', 'bici elettriche'),
      'leasing-auto': leasingCategory('cars', 'auto in leasing'),
      'leasing-furgoni': leasingCategory('vans', 'furgoni in leasing'),
      'leasing-autocarri': leasingCategory('trucks', 'autocarri in leasing'),
      'leasing-macchine-agricole': leasingCategory('agriculture', 'macchine agricole in leasing'),
      'leasing-macchine-edili': leasingCategory('construction', 'macchine edili in leasing'),
    },
    title: (subject, place) => `${subject} in vendita a ${place}`,
    description: (subject, place) =>
      `Scopri ${lower(subject)} in vendita a ${place}. Confronta veicoli da privati e aziende su Autorell.`,
    zeroResults: (subject, place) => `Nessun annuncio per ${lower(subject)} a ${place} al momento`,
  },
  es: {
    locale: 'es',
    countryCode: 'ES',
    categories: {
      coches: category('cars', 'coches'),
      furgonetas: category('vans', 'furgonetas'),
      motos: category('motorcycles', 'motos'),
      autocaravanas: category('motorhomes', 'autocaravanas'),
      caravanas: category('caravans', 'caravanas'),
      camiones: category('trucks', 'camiones'),
      'maquinaria-agricola': category('agriculture', 'maquinaria agr\u00edcola'),
      'maquinaria-construccion': category('construction', 'maquinaria de construcci\u00f3n'),
      'bicicletas-electricas': category('electric-bikes', 'bicicletas el\u00e9ctricas'),
      'leasing-coches': leasingCategory('cars', 'coches de leasing'),
      'leasing-furgonetas': leasingCategory('vans', 'furgonetas de leasing'),
      'leasing-camiones': leasingCategory('trucks', 'camiones de leasing'),
      'leasing-maquinaria-agricola': leasingCategory('agriculture', 'maquinaria agr\u00edcola de leasing'),
      'leasing-maquinaria-construccion': leasingCategory('construction', 'maquinaria de construcci\u00f3n de leasing'),
    },
    title: (subject, place) => `${subject} en venta en ${place}`,
    description: (subject, place) =>
      `Ver ${lower(subject)} en venta en ${place}. Compara veh\u00edculos de particulares y empresas en Autorell.`,
    zeroResults: (subject, place) => `No hay anuncios de ${lower(subject)} en ${place} ahora mismo`,
  },
  nl: nlMarket('nl', 'NL'),
  be: nlMarket('be', 'BE'),
  pl: {
    locale: 'pl',
    countryCode: 'PL',
    categories: {
      samochody: category('cars', 'samochody'),
      dostawcze: category('vans', 'samochody dostawcze'),
      motocykle: category('motorcycles', 'motocykle'),
      kampery: category('motorhomes', 'kampery'),
      przyczepy: category('caravans', 'przyczepy kempingowe'),
      ciezarowki: category('trucks', 'ci\u0119\u017car\u00f3wki'),
      'maszyny-rolnicze': category('agriculture', 'maszyny rolnicze'),
      'maszyny-budowlane': category('construction', 'maszyny budowlane'),
      'rowery-elektryczne': category('electric-bikes', 'rowery elektryczne'),
      'leasing-samochody': leasingCategory('cars', 'samochody w leasingu'),
      'leasing-dostawcze': leasingCategory('vans', 'samochody dostawcze w leasingu'),
      'leasing-ciezarowki': leasingCategory('trucks', 'ci\u0119\u017car\u00f3wki w leasingu'),
      'leasing-maszyny-rolnicze': leasingCategory('agriculture', 'maszyny rolnicze w leasingu'),
      'leasing-maszyny-budowlane': leasingCategory('construction', 'maszyny budowlane w leasingu'),
    },
    title: (subject, place) => `${subject} na sprzeda\u017c w ${place}`,
    description: (subject, place) =>
      `Zobacz ${lower(subject)} na sprzeda\u017c w ${place}. Por\u00f3wnaj pojazdy od os\u00f3b prywatnych i firm w Autorell.`,
    zeroResults: (subject, place) => `Brak og\u0142osze\u0144 dla ${lower(subject)} w ${place}`,
  },
  dk: {
    locale: 'da',
    countryCode: 'DK',
    categories: {
      biler: category('cars', 'biler'),
      varevogne: category('vans', 'varevogne'),
      motorcykler: category('motorcycles', 'motorcykler'),
      autocampere: category('motorhomes', 'autocampere'),
      campingvogne: category('caravans', 'campingvogne'),
      lastbiler: category('trucks', 'lastbiler'),
      landbrugsmaskiner: category('agriculture', 'landbrugsmaskiner'),
      entreprenormaskiner: category('construction', 'entrepren\u00f8rmaskiner'),
      elcykler: category('electric-bikes', 'elcykler'),
      leasingbiler: leasingCategory('cars', 'leasingbiler'),
      leasingvarevogne: leasingCategory('vans', 'leasingvarevogne'),
      leasinglastbiler: leasingCategory('trucks', 'leasinglastbiler'),
      leasinglandbrugsmaskiner: leasingCategory('agriculture', 'leasinglandbrugsmaskiner'),
      leasingentreprenormaskiner: leasingCategory('construction', 'leasingentrepren\u00f8rmaskiner'),
    },
    title: (subject, place) => `${subject} til salg i ${place}`,
    description: (subject, place) =>
      `Se ${lower(subject)} til salg i ${place}. Sammenlign k\u00f8ret\u00f8jer fra private og virksomheder p\u00e5 Autorell.`,
    zeroResults: (subject, place) => `Ingen annoncer for ${lower(subject)} i ${place} lige nu`,
  },
  fi: {
    locale: 'fi',
    countryCode: 'FI',
    categories: {
      autot: category('cars', 'autot'),
      pakettiautot: category('vans', 'pakettiautot'),
      moottoripyorat: category('motorcycles', 'moottoripy\u00f6r\u00e4t'),
      matkailuautot: category('motorhomes', 'matkailuautot'),
      asuntovaunut: category('caravans', 'asuntovaunut'),
      'kuorma-autot': category('trucks', 'kuorma-autot'),
      maatalouskoneet: category('agriculture', 'maatalouskoneet'),
      maanrakennuskoneet: category('construction', 'maanrakennuskoneet'),
      sahkopyorat: category('electric-bikes', 's\u00e4hk\u00f6py\u00f6r\u00e4t'),
      leasingautot: leasingCategory('cars', 'leasingautot'),
      leasingpakettiautot: leasingCategory('vans', 'leasingpakettiautot'),
      'leasing-kuorma-autot': leasingCategory('trucks', 'leasing-kuorma-autot'),
      leasingmaatalouskoneet: leasingCategory('agriculture', 'leasingmaatalouskoneet'),
      leasingmaanrakennuskoneet: leasingCategory('construction', 'leasingmaanrakennuskoneet'),
    },
    title: (subject, place) => `${subject} myyt\u00e4v\u00e4n\u00e4 kohteessa ${place}`,
    description: (subject, place) =>
      `Katso ${lower(subject)} myyt\u00e4v\u00e4n\u00e4 kohteessa ${place}. Vertaa yksityisten ja yritysten ajoneuvoja Autorellissa.`,
    zeroResults: (subject, place) => `Ei ilmoituksia haulle ${lower(subject)} kohteessa ${place}`,
  },
}

const knownMakeLabels: Record<string, string> = {
  audi: 'Audi',
  bmw: 'BMW',
  mercedes: 'Mercedes-Benz',
  'mercedes-benz': 'Mercedes-Benz',
  tesla: 'Tesla',
  toyota: 'Toyota',
  volkswagen: 'Volkswagen',
  volvo: 'Volvo',
}

export async function resolveGeoLandingRoute(
  market: string,
  categorySlug: string | undefined,
  segments: string[] | undefined,
): Promise<GeoLandingRoute | null> {
  const normalizedMarket = normalizeSegment(market)
  const config = marketRouteConfigs[normalizedMarket]
  if (!config || !categorySlug || !segments?.length) return null

  const normalizedCategorySlug = normalizeSegment(categorySlug)
  const categoryRoute = config.categories[normalizedCategorySlug]
  if (!categoryRoute) return null
  if (segments.length !== 1 && segments.length !== 2) return null

  const normalizedSegments = segments.map((segment) => normalizeSegment(segment))
  const makeSlug = normalizedSegments.length === 2 ? normalizedSegments[0] : null
  const placeSlug = normalizedSegments.length === 2 ? normalizedSegments[1] : normalizedSegments[0]
  if (!placeSlug) return null

  const place = await resolveGeoLandingPlace(config.countryCode, placeSlug)
  if (!place) return null

  const make = makeSlug ? knownMakeLabels[makeSlug] || toTitleCase(makeSlug) : null
  const subject = make || capitalize(categoryRoute.plural)
  const h1 = config.title(subject, place.name)
  const canonicalPath = makeSlug
    ? `/${normalizedMarket}/${normalizedCategorySlug}/${makeSlug}/${placeSlug}`
    : `/${normalizedMarket}/${normalizedCategorySlug}/${placeSlug}`

  return {
    market: normalizedMarket,
    locale: config.locale,
    countryCode: config.countryCode,
    category: categoryRoute.category,
    categorySlug: normalizedCategorySlug,
    categoryLabel: capitalize(categoryRoute.plural),
    leasing: Boolean(categoryRoute.leasing),
    place,
    makeSlug,
    make,
    canonicalPath,
    h1,
    title: cleanSeoText(`${h1} | Autorell`, 60),
    description: cleanSeoText(config.description(subject, place.name), 155),
    zeroResultsText: config.zeroResults(subject, place.name),
  }
}

export function isGeoLandingCandidate(
  market: string,
  categorySlug: string | undefined,
  segments: string[] | undefined,
) {
  const config = marketRouteConfigs[normalizeSegment(market)]
  return Boolean(config && categorySlug && config.categories[normalizeSegment(categorySlug)] && segments?.length)
}

export function buildGeoMarketplaceHref(landing: GeoLandingRoute) {
  const params = new URLSearchParams()
  params.set('categories', landing.category)
  params.set('markets', landing.countryCode)
  params.set('geoAreaId', landing.place.id)
  params.set('geoFilterMode', 'strict')
  params.set('chips', landing.place.name)
  if (landing.leasing) {
    params.set('mode', 'leasing')
    params.set('leasingPossible', 'true')
  }
  if (landing.make) params.set('make', landing.make)
  return `/${landing.market}/marketplace/${landing.category}?${params.toString()}`
}

function category(categorySlug: MarketplaceCategorySlug, plural: string): GeoCategoryRoute {
  return { category: categorySlug, plural }
}

function leasingCategory(categorySlug: MarketplaceCategorySlug, plural: string): GeoCategoryRoute {
  return { category: categorySlug, plural, leasing: true }
}

async function resolveGeoLandingPlace(countryCode: string, placeSlug: string) {
  const staticPlace = resolveMarketplaceGeoAreaBySlug(countryCode, placeSlug)
  if (staticPlace) return staticPlace

  const [regions, places] = await Promise.all([
    getGeoRegions(countryCode),
    searchGeoPlaces({
      countryCode,
      query: placeSlug.replace(/-/g, ' '),
      limit: 50,
    }),
  ])
  const normalizedSlug = slugify(placeSlug)
  const region = regions.find((item) => slugify(item.code) === normalizedSlug || slugify(item.name) === normalizedSlug)
  if (region) {
    return {
      id: `${countryCode}:region:${region.code}`,
      countryCode,
      level: 'region',
      name: region.name,
      code: region.code,
      slug: normalizedSlug,
      region: region.name,
      centroid: countryCentroid(countryCode),
      bounds: countryBounds(countryCode),
      aliases: [region.code, region.name, normalizedSlug],
    } satisfies MarketplaceGeoArea
  }

  const place = places.find((item) => slugify(item.code.split(':').pop() || item.code) === normalizedSlug || slugify(item.name) === normalizedSlug || slugify(item.city) === normalizedSlug)
  if (!place) return null

  return {
    id: `${countryCode}:locality:${place.code}`,
    countryCode,
    level: 'locality',
    name: place.name,
    code: place.code,
    slug: normalizedSlug,
    region: place.regionName,
    municipality: place.name,
    locality: place.city || place.name,
    postalCode: place.postalCode || undefined,
    centroid: countryCentroid(countryCode),
    bounds: countryBounds(countryCode),
    aliases: [place.code, place.name, place.city, normalizedSlug].filter(Boolean),
  } satisfies MarketplaceGeoArea
}

function deMarket(locale: 'de' | 'at', countryCode: 'DE' | 'AT'): GeoMarketRouteConfig {
  return {
    locale,
    countryCode,
    categories: {
      autos: category('cars', 'Autos'),
      transporter: category('vans', 'Transporter'),
      motorraeder: category('motorcycles', 'Motorr\u00e4der'),
      wohnmobile: category('motorhomes', 'Wohnmobile'),
      wohnwagen: category('caravans', 'Wohnwagen'),
      lkw: category('trucks', 'Lkw'),
      landmaschinen: category('agriculture', 'Landmaschinen'),
      baumaschinen: category('construction', 'Baumaschinen'),
      fahrraeder: category('electric-bikes', 'Fahrr\u00e4der'),
      leasingautos: leasingCategory('cars', 'Leasingautos'),
      leasingtransporter: leasingCategory('vans', 'Leasingtransporter'),
      leasinglkw: leasingCategory('trucks', 'Leasing-Lkw'),
      leasinglandmaschinen: leasingCategory('agriculture', 'Leasing-Landmaschinen'),
      leasingbaumaschinen: leasingCategory('construction', 'Leasing-Baumaschinen'),
    },
    title: (subject, place) => `${subject} kaufen in ${place}`,
    description: (subject, place) =>
      `${subject} in ${place} kaufen. Vergleichen Sie Fahrzeuge von privaten Verk\u00e4ufern und Unternehmen auf Autorell.`,
    zeroResults: (subject, place) => `Keine Anzeigen f\u00fcr ${subject} in ${place} im Moment`,
  }
}

function nlMarket(locale: 'nl' | 'be', countryCode: 'NL' | 'BE'): GeoMarketRouteConfig {
  return {
    locale,
    countryCode,
    categories: {
      autos: category('cars', "auto's"),
      bestelwagens: category('vans', 'bestelwagens'),
      motoren: category('motorcycles', 'motoren'),
      campers: category('motorhomes', 'campers'),
      caravans: category('caravans', 'caravans'),
      vrachtwagens: category('trucks', 'vrachtwagens'),
      landbouwmachines: category('agriculture', 'landbouwmachines'),
      bouwmachines: category('construction', 'bouwmachines'),
      'elektrische-fietsen': category('electric-bikes', 'elektrische fietsen'),
      leaseautos: leasingCategory('cars', "leaseauto's"),
      leasebestelwagens: leasingCategory('vans', 'leasebestelwagens'),
      leasevrachtwagens: leasingCategory('trucks', 'leasevrachtwagens'),
      leaselandbouwmachines: leasingCategory('agriculture', 'leaselandbouwmachines'),
      leasebouwmachines: leasingCategory('construction', 'leasebouwmachines'),
    },
    title: (subject, place) => `${subject} te koop in ${place}`,
    description: (subject, place) =>
      `Bekijk ${lower(subject)} te koop in ${place}. Vergelijk voertuigen van particulieren en bedrijven op Autorell.`,
    zeroResults: (subject, place) => `Geen advertenties voor ${lower(subject)} in ${place} op dit moment`,
  }
}

function normalizeSegment(value: string | undefined) {
  return String(value || '').trim().toLowerCase()
}

const routeCountryBounds: Record<string, { centroid: MarketplaceGeoArea['centroid']; bounds: MarketplaceGeoArea['bounds'] }> = {
  AT: { centroid: { latitude: 47.6, longitude: 14.1 }, bounds: { north: 49.1, east: 17.2, south: 46.3, west: 9.5 } },
  BE: { centroid: { latitude: 50.6, longitude: 4.7 }, bounds: { north: 51.5, east: 6.4, south: 49.5, west: 2.5 } },
  DE: { centroid: { latitude: 51.2, longitude: 10.4 }, bounds: { north: 55.1, east: 15.1, south: 47.2, west: 5.8 } },
  DK: { centroid: { latitude: 56.1, longitude: 10 }, bounds: { north: 57.8, east: 15.2, south: 54.5, west: 8 } },
  ES: { centroid: { latitude: 40.4, longitude: -3.7 }, bounds: { north: 43.8, east: 4.4, south: 36, west: -9.4 } },
  FI: { centroid: { latitude: 64.5, longitude: 26 }, bounds: { north: 70.1, east: 31.6, south: 59.7, west: 19.1 } },
  FR: { centroid: { latitude: 46.6, longitude: 2.3 }, bounds: { north: 51.2, east: 8.3, south: 41.3, west: -5.2 } },
  IT: { centroid: { latitude: 42.8, longitude: 12.5 }, bounds: { north: 47.1, east: 18.8, south: 36.6, west: 6.6 } },
  NL: { centroid: { latitude: 52.1, longitude: 5.3 }, bounds: { north: 53.7, east: 7.3, south: 50.7, west: 3.3 } },
  PL: { centroid: { latitude: 52.1, longitude: 19.4 }, bounds: { north: 54.9, east: 24.2, south: 49, west: 14.1 } },
  SE: { centroid: { latitude: 62, longitude: 15 }, bounds: { north: 69.1, east: 24.2, south: 55.2, west: 10.6 } },
}

function countryCentroid(countryCode: string) {
  return routeCountryBounds[countryCode]?.centroid || { latitude: 50, longitude: 10 }
}

function countryBounds(countryCode: string) {
  return routeCountryBounds[countryCode]?.bounds || { north: 72, east: 32, south: 35, west: -10 }
}

function slugify(value: string) {
  return String(value || '')
    .trim()
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function capitalize(value: string) {
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value
}

function lower(value: string) {
  return value.toLocaleLowerCase()
}

function toTitleCase(value: string) {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => capitalize(part))
    .join(' ')
}
