import { cleanSeoText } from './market-seo'
import type { MarketplaceCategorySlug } from './marketplace'
import type { PublicLocale } from './public-i18n'

export type MarketplaceSearchMode = 'all' | 'sale' | 'leasing'

type MarketplaceSearchModeInput = {
  mode?: string | null
  intent?: string | null
  offerType?: string | null
  leasingPossible?: string | boolean | null
}

type MarketplaceSearchSeoInput = {
  locale: PublicLocale
  category?: MarketplaceCategorySlug | 'vehicles'
  categoryLabel?: string
  allVehicles?: boolean
  mode: MarketplaceSearchMode
  make?: string | null
  model?: string | null
  freeText?: string | null
  place?: string | null
  condition?: string | null
}

type SeoCopy = {
  title: string
  description: string
}

export function resolveMarketplaceSearchMode({
  mode,
  intent,
  offerType,
  leasingPossible,
}: MarketplaceSearchModeInput): MarketplaceSearchMode {
  const requestedMode = cleanModeValue(mode) || cleanModeValue(intent)
  if (requestedMode === 'all' || requestedMode === 'sale' || requestedMode === 'leasing') {
    return requestedMode
  }

  const requestedOfferType = cleanModeValue(offerType)
  if (requestedOfferType === 'lease' || requestedOfferType === 'leasing') return 'leasing'
  if (requestedOfferType === 'sale') return 'sale'
  return isTruthyModeValue(leasingPossible) ? 'leasing' : 'all'
}

export function applyMarketplaceSearchModeParams(
  params: URLSearchParams,
  mode: MarketplaceSearchMode,
) {
  params.delete('mode')
  params.delete('intent')
  params.delete('offerType')

  if (mode === 'sale') {
    params.set('mode', 'sale')
    params.set('offerType', 'sale')
  } else if (mode === 'leasing') {
    params.set('mode', 'leasing')
    params.set('offerType', 'lease')
  }

  return params
}

export function getMarketplaceSearchSeo({
  locale,
  category,
  categoryLabel,
  allVehicles = false,
  mode,
  make,
  model,
  freeText,
  place,
  condition,
}: MarketplaceSearchSeoInput): SeoCopy {
  const effectiveLocale = locale === 'at' ? 'de' : locale === 'be' ? 'nl' : locale
  const fallbackSubject = allVehicles || category === 'vehicles'
    ? localizedVehicleName(effectiveLocale)
    : category
      ? localizedCategoryName(effectiveLocale, category)
      : cleanInput(categoryLabel)
  const selectedVehicle = cleanInput([make, model].filter(Boolean).join(' '))
  const subject = selectedVehicle || cleanInput(freeText) || fallbackSubject || localizedVehicleName(effectiveLocale)
  const qualifiedSubject = qualifySubject(effectiveLocale, subject, normalizeCondition(condition))
  const location = cleanInput(place)
  const copy = localizedSeoCopy(effectiveLocale, mode, qualifiedSubject, location)

  return {
    title: fitSeoTitle(copy.title),
    description: cleanSeoText(copy.description, 150),
  }
}

function fitSeoTitle(value: string) {
  const cleaned = cleanSeoText(value, Number.MAX_SAFE_INTEGER)
  if (cleaned.length <= 65) return cleaned

  const suffix = cleaned.endsWith(' | Autorell') ? ' | Autorell' : ''
  const available = 65 - suffix.length
  const candidate = cleaned.slice(0, available).trimEnd()
  const wordBoundary = candidate.lastIndexOf(' ')
  const title = wordBoundary >= Math.max(24, available - 18)
    ? candidate.slice(0, wordBoundary)
    : candidate
  const withoutDanglingConnector = title
    .replace(/[\s,;:.-]+$/g, '')
    .replace(/\s+(?:a|de|en|for|i|in|of|oder|eller|o|or|ou|til|w)$/i, '')
  return `${withoutDanglingConnector}${suffix}`
}

function localizedSeoCopy(
  locale: Exclude<PublicLocale, 'at' | 'be'>,
  mode: MarketplaceSearchMode,
  subject: string,
  place: string,
): SeoCopy {
  switch (locale) {
    case 'sv': {
      const scope = place ? ` i ${place}` : ''
      if (mode === 'leasing') {
        return {
          title: `${subject} f\u00f6r leasing${scope} | Autorell`,
          description: `Hitta ${subject} f\u00f6r leasing${scope}. J\u00e4mf\u00f6r leasingannonser fr\u00e5n anslutna f\u00f6retag p\u00e5 Autorell.`,
        }
      }
      if (mode === 'sale') {
        return {
          title: `${subject} till salu${scope} | Autorell`,
          description: `Se ${subject} till salu${scope}. J\u00e4mf\u00f6r annonser fr\u00e5n privatpersoner och f\u00f6retag p\u00e5 Autorell.`,
        }
      }
      return {
        title: `${subject}${scope} | K\u00f6p eller leasa | Autorell`,
        description: `S\u00f6k och j\u00e4mf\u00f6r ${subject}${scope}. Hitta annonser f\u00f6r k\u00f6p och leasing fr\u00e5n privatpersoner och f\u00f6retag.`,
      }
    }
    case 'de': {
      const scope = place ? ` in ${place}` : ''
      if (mode === 'leasing') {
        return {
          title: `${subject}${scope} leasen | Autorell`,
          description: `${subject}${scope} leasen und Angebote von gewerblichen Anbietern auf Autorell vergleichen.`,
        }
      }
      if (mode === 'sale') {
        return {
          title: `${subject}${scope} kaufen | Autorell`,
          description: `${subject}${scope} suchen und vergleichen. Finden Sie Angebote von privaten und gewerblichen Verk\u00e4ufern auf Autorell.`,
        }
      }
      return {
        title: `${subject}${scope} kaufen oder leasen | Autorell`,
        description: `${subject}${scope} suchen und vergleichen. Finden Sie Angebote zum Kauf und Leasing auf Autorell.`,
      }
    }
    case 'fr': {
      const scope = place ? ` - ${place}` : ''
      if (mode === 'leasing') {
        return {
          title: `${subject} en leasing${scope} | Autorell`,
          description: `Recherchez ${subject} en leasing${place ? ` \u00e0 ${place}` : ''}. Comparez les offres de professionnels sur Autorell.`,
        }
      }
      if (mode === 'sale') {
        return {
          title: `${subject} \u00e0 vendre${scope} | Autorell`,
          description: `Recherchez ${subject} \u00e0 vendre${place ? ` \u00e0 ${place}` : ''}. Comparez les annonces de particuliers et professionnels sur Autorell.`,
        }
      }
      return {
        title: `${subject} \u00e0 vendre ou en leasing${scope} | Autorell`,
        description: `Recherchez et comparez ${subject}${place ? ` \u00e0 ${place}` : ''}. Retrouvez les offres de vente et de leasing sur Autorell.`,
      }
    }
    case 'es': {
      const scope = place ? ` en ${place}` : ''
      if (mode === 'leasing') {
        return {
          title: `${subject} en leasing${scope} | Autorell`,
          description: `Busca ${subject} en leasing${scope}. Compara ofertas de empresas en Autorell.`,
        }
      }
      if (mode === 'sale') {
        return {
          title: `${subject} en venta${scope} | Autorell`,
          description: `Busca ${subject} en venta${scope}. Compara anuncios de particulares y empresas en Autorell.`,
        }
      }
      return {
        title: `${subject} en venta o leasing${scope} | Autorell`,
        description: `Busca y compara ${subject}${scope}. Encuentra anuncios de venta y leasing en Autorell.`,
      }
    }
    case 'it': {
      const scope = place ? ` a ${place}` : ''
      if (mode === 'leasing') {
        return {
          title: `${subject} in leasing${scope} | Autorell`,
          description: `Cerca ${subject} in leasing${scope}. Confronta le offerte delle aziende su Autorell.`,
        }
      }
      if (mode === 'sale') {
        return {
          title: `${subject} in vendita${scope} | Autorell`,
          description: `Cerca ${subject} in vendita${scope}. Confronta annunci di privati e aziende su Autorell.`,
        }
      }
      return {
        title: `${subject} in vendita o leasing${scope} | Autorell`,
        description: `Cerca e confronta ${subject}${scope}. Trova annunci di vendita e leasing su Autorell.`,
      }
    }
    case 'pl': {
      const scope = place ? ` - ${place}` : ''
      if (mode === 'leasing') {
        return {
          title: `${subject} w leasingu${scope} | Autorell`,
          description: `Znajd\u017a ${subject} w leasingu${place ? ` w ${place}` : ''}. Por\u00f3wnaj oferty firm w Autorell.`,
        }
      }
      if (mode === 'sale') {
        return {
          title: `${subject} na sprzeda\u017c${scope} | Autorell`,
          description: `Szukaj ${subject} na sprzeda\u017c${place ? ` w ${place}` : ''}. Por\u00f3wnuj og\u0142oszenia prywatne i firmowe w Autorell.`,
        }
      }
      return {
        title: `${subject} na sprzeda\u017c lub leasing${scope} | Autorell`,
        description: `Szukaj i por\u00f3wnuj ${subject}${place ? ` w ${place}` : ''}. Znajd\u017a oferty sprzeda\u017cy i leasingu w Autorell.`,
      }
    }
    case 'nl': {
      const scope = place ? ` in ${place}` : ''
      if (mode === 'leasing') {
        return {
          title: `${subject}${scope} leasen | Autorell`,
          description: `Zoek ${subject} voor leasing${scope}. Vergelijk aanbiedingen van bedrijven op Autorell.`,
        }
      }
      if (mode === 'sale') {
        return {
          title: `${subject} te koop${scope} | Autorell`,
          description: `Zoek ${subject} te koop${scope}. Vergelijk advertenties van particuliere en zakelijke verkopers op Autorell.`,
        }
      }
      return {
        title: `${subject}${scope} kopen of leasen | Autorell`,
        description: `Zoek en vergelijk ${subject}${scope}. Vind advertenties voor koop en leasing op Autorell.`,
      }
    }
    case 'da': {
      const scope = place ? ` i ${place}` : ''
      if (mode === 'leasing') {
        return {
          title: `${subject} til leasing${scope} | Autorell`,
          description: `Find ${subject} til leasing${scope}. Sammenlign tilbud fra virksomheder p\u00e5 Autorell.`,
        }
      }
      if (mode === 'sale') {
        return {
          title: `${subject} til salg${scope} | Autorell`,
          description: `S\u00f8g ${subject} til salg${scope}. Sammenlign annoncer fra private og virksomheder p\u00e5 Autorell.`,
        }
      }
      return {
        title: `${subject}${scope} | K\u00f8b eller lease | Autorell`,
        description: `S\u00f8g og sammenlign ${subject}${scope}. Find annoncer til k\u00f8b og leasing p\u00e5 Autorell.`,
      }
    }
    case 'fi': {
      const scope = place ? ` - ${place}` : ''
      if (mode === 'leasing') {
        return {
          title: `${subject} leasingiin${scope} | Autorell`,
          description: `Etsi ${subject} leasingiin${place ? ` alueella ${place}` : ''}. Vertaile yritysten tarjouksia Autorellissa.`,
        }
      }
      if (mode === 'sale') {
        return {
          title: `${subject} myynniss\u00e4${scope} | Autorell`,
          description: `Etsi ${subject} myynniss\u00e4${place ? ` alueella ${place}` : ''}. Vertaa yksityisten ja yritysten ilmoituksia Autorellissa.`,
        }
      }
      return {
        title: `${subject} myyntiin tai leasingiin${scope} | Autorell`,
        description: `Etsi ja vertaile ${subject}${place ? ` alueella ${place}` : ''}. L\u00f6yd\u00e4 myynti- ja leasingilmoitukset Autorellista.`,
      }
    }
    default: {
      const scope = place ? ` in ${place}` : ''
      if (mode === 'leasing') {
        return {
          title: `${subject} for leasing${scope} | Autorell`,
          description: `Find ${subject} for leasing${scope}. Compare offers from business sellers on Autorell.`,
        }
      }
      if (mode === 'sale') {
        return {
          title: `${subject} for sale${scope} | Autorell`,
          description: `Search ${subject} for sale${scope}. Compare listings from private and business sellers on Autorell.`,
        }
      }
      return {
        title: `${subject}${scope} | Buy or lease | Autorell`,
        description: `Search and compare ${subject}${scope}. Find sale and leasing listings from private and business sellers on Autorell.`,
      }
    }
  }
}

function qualifySubject(
  locale: Exclude<PublicLocale, 'at' | 'be'>,
  subject: string,
  condition: 'new' | 'used' | '',
) {
  if (!condition) return subject
  const lowerSubject = subject.toLocaleLowerCase(locale)
  const qualifiers = {
    sv: condition === 'new' ? `Nya ${lowerSubject}` : `Begagnade ${lowerSubject}`,
    de: condition === 'new' ? `Neue ${lowerSubject}` : `Gebrauchte ${lowerSubject}`,
    en: condition === 'new' ? `New ${lowerSubject}` : `Used ${lowerSubject}`,
    fr: condition === 'new' ? `${subject} neufs` : `${subject} d'occasion`,
    es: condition === 'new' ? `${subject} nuevos` : `${subject} usados`,
    it: condition === 'new' ? `${subject} nuovi` : `${subject} usati`,
    pl: condition === 'new' ? `Nowe ${lowerSubject}` : `U\u017cywane ${lowerSubject}`,
    nl: condition === 'new' ? `Nieuwe ${lowerSubject}` : `Gebruikte ${lowerSubject}`,
    da: condition === 'new' ? `Nye ${lowerSubject}` : `Brugte ${lowerSubject}`,
    fi: condition === 'new' ? `Uudet ${lowerSubject}` : `K\u00e4ytetyt ${lowerSubject}`,
  } satisfies Record<Exclude<PublicLocale, 'at' | 'be'>, string>
  return qualifiers[locale]
}

function normalizeCondition(value?: string | null): 'new' | 'used' | '' {
  const normalized = String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
  if (/\b(ny|new|neu|neuf|nuevo|nuovo|nowe?|nieuw|uusi|uudet)\b/.test(normalized)) return 'new'
  if (/\b(begagnad|begagnat|used|gebraucht|occasion|usado|usato|uzywan|gebruikt|brugt|kaytetty)\b/.test(normalized)) return 'used'
  return ''
}

function localizedVehicleName(locale: Exclude<PublicLocale, 'at' | 'be'>) {
  return ({
    sv: 'Fordon',
    de: 'Fahrzeuge',
    en: 'Vehicles',
    fr: 'V\u00e9hicules',
    es: 'Veh\u00edculos',
    it: 'Veicoli',
    pl: 'Pojazdy',
    nl: 'Voertuigen',
    fi: 'Ajoneuvot',
    da: 'K\u00f8ret\u00f8jer',
  } satisfies Record<Exclude<PublicLocale, 'at' | 'be'>, string>)[locale]
}

function localizedCategoryName(
  locale: Exclude<PublicLocale, 'at' | 'be'>,
  category: MarketplaceCategorySlug,
) {
  const labels = {
    sv: {
      cars: 'Bilar',
      vans: 'Transportbilar',
      motorcycles: 'Motorcyklar',
      motorhomes: 'Husbilar',
      caravans: 'Husvagnar',
      trucks: 'Lastbilar',
      agriculture: 'Lantbruksmaskiner',
      construction: 'Entreprenadmaskiner',
      'electric-bikes': 'Cyklar',
    },
    de: {
      cars: 'Autos',
      vans: 'Transporter',
      motorcycles: 'Motorr\u00e4der',
      motorhomes: 'Wohnmobile',
      caravans: 'Wohnwagen',
      trucks: 'Lkw',
      agriculture: 'Landmaschinen',
      construction: 'Baumaschinen',
      'electric-bikes': 'Fahrr\u00e4der',
    },
    en: {
      cars: 'Cars',
      vans: 'Vans',
      motorcycles: 'Motorcycles',
      motorhomes: 'Motorhomes',
      caravans: 'Caravans',
      trucks: 'Trucks',
      agriculture: 'Agricultural machinery',
      construction: 'Construction machinery',
      'electric-bikes': 'Bikes',
    },
    fr: {
      cars: 'Voitures',
      vans: 'Utilitaires',
      motorcycles: 'Motos',
      motorhomes: 'Camping-cars',
      caravans: 'Caravanes',
      trucks: 'Camions',
      agriculture: 'Machines agricoles',
      construction: 'Engins de chantier',
      'electric-bikes': 'V\u00e9los',
    },
    es: {
      cars: 'Coches',
      vans: 'Furgonetas',
      motorcycles: 'Motos',
      motorhomes: 'Autocaravanas',
      caravans: 'Caravanas',
      trucks: 'Camiones',
      agriculture: 'Maquinaria agr\u00edcola',
      construction: 'Maquinaria de construcci\u00f3n',
      'electric-bikes': 'Bicicletas',
    },
    it: {
      cars: 'Auto',
      vans: 'Furgoni',
      motorcycles: 'Moto',
      motorhomes: 'Camper',
      caravans: 'Caravan',
      trucks: 'Autocarri',
      agriculture: 'Macchine agricole',
      construction: 'Macchine edili',
      'electric-bikes': 'Biciclette',
    },
    pl: {
      cars: 'Samochody',
      vans: 'Samochody dostawcze',
      motorcycles: 'Motocykle',
      motorhomes: 'Kampery',
      caravans: 'Przyczepy kempingowe',
      trucks: 'Ci\u0119\u017car\u00f3wki',
      agriculture: 'Maszyny rolnicze',
      construction: 'Maszyny budowlane',
      'electric-bikes': 'Rowery',
    },
    nl: {
      cars: "Auto's",
      vans: 'Bestelwagens',
      motorcycles: 'Motoren',
      motorhomes: 'Campers',
      caravans: 'Caravans',
      trucks: 'Vrachtwagens',
      agriculture: 'Landbouwmachines',
      construction: 'Bouwmachines',
      'electric-bikes': 'Fietsen',
    },
    da: {
      cars: 'Biler',
      vans: 'Varevogne',
      motorcycles: 'Motorcykler',
      motorhomes: 'Autocampere',
      caravans: 'Campingvogne',
      trucks: 'Lastbiler',
      agriculture: 'Landbrugsmaskiner',
      construction: 'Entrepren\u00f8rmaskiner',
      'electric-bikes': 'Cykler',
    },
    fi: {
      cars: 'Autot',
      vans: 'Pakettiautot',
      motorcycles: 'Moottoripy\u00f6r\u00e4t',
      motorhomes: 'Matkailuautot',
      caravans: 'Asuntovaunut',
      trucks: 'Kuorma-autot',
      agriculture: 'Maatalouskoneet',
      construction: 'Maanrakennuskoneet',
      'electric-bikes': 'Polkupy\u00f6r\u00e4t',
    },
  } satisfies Record<
    Exclude<PublicLocale, 'at' | 'be'>,
    Record<MarketplaceCategorySlug, string>
  >
  return labels[locale][category]
}

function cleanInput(value?: string | null) {
  return String(value || '')
    .replace(/[<>"']/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80)
}

function cleanModeValue(value?: string | null) {
  return String(value || '').trim().toLowerCase()
}

function isTruthyModeValue(value?: string | boolean | null) {
  if (typeof value === 'boolean') return value
  return ['1', 'true', 'yes'].includes(cleanModeValue(value))
}
