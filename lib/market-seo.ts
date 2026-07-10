import type { Metadata } from 'next'

type MarketSeo = {
  title: string
  description: string
  locale: string
}

export const SEO_TITLE_MAX = 65
export const SEO_DESCRIPTION_MAX = 150

const marketHomeSeo: Record<string, MarketSeo> = {
  se: {
    title: 'Fordon till salu | Köp begagnade eller nya fordon | Autorell',
    description:
      'Köp och sälj bilar, transportbilar, motorcyklar, husbilar och andra fordon på Autorells europeiska marknadsplats.',
    locale: 'sv_SE',
  },
  de: {
    title: 'Fahrzeuge kaufen | Neu und gebraucht | Autorell',
    description:
      'Finden Sie Autos, Transporter, Motorräder und weitere Fahrzeuge in Deutschland und Europa. Kaufen und verkaufen über Autorell.',
    locale: 'de_DE',
  },
  at: {
    title: 'Fahrzeuge in Österreich kaufen | Autorell',
    description:
      'Suchen Sie neue und gebrauchte Fahrzeuge in Österreich. Autos, Transporter, Motorräder und mehr auf Autorell finden.',
    locale: 'de_AT',
  },
  fr: {
    title: "Véhicules à vendre | Neufs et d'occasion | Autorell",
    description:
      "Achetez voitures, utilitaires, motos et autres véhicules en France. Comparez annonces neuves et d'occasion sur Autorell.",
    locale: 'fr_FR',
  },
  be: {
    title: 'Voertuigen kopen in België | Autorell',
    description:
      'Vind nieuwe en gebruikte voertuigen in België. Zoek auto’s, bestelwagens, motoren en meer op Autorell.',
    locale: 'nl_BE',
  },
  dk: {
    title: 'Køretøjer til salg | Nye og brugte | Autorell',
    description:
      'Find nye og brugte køretøjer i Danmark. Søg biler, varevogne, motorcykler og flere køretøjstyper på Autorell.',
    locale: 'da_DK',
  },
  fi: {
    title: 'Ajoneuvot myynnissä | Uudet ja käytetyt | Autorell',
    description:
      'Etsi uusia ja käytettyjä ajoneuvoja Suomessa. Autot, pakettiautot, moottoripyörät ja muut ajoneuvot Autorellissa.',
    locale: 'fi_FI',
  },
  it: {
    title: 'Veicoli in vendita | Nuovi e usati | Autorell',
    description:
      'Trova auto, furgoni, moto e altri veicoli in Italia. Confronta annunci nuovi e usati su Autorell.',
    locale: 'it_IT',
  },
  nl: {
    title: 'Voertuigen te koop | Nieuw en gebruikt | Autorell',
    description:
      'Zoek nieuwe en gebruikte voertuigen in Nederland. Vind auto’s, bestelwagens, motoren en meer op Autorell.',
    locale: 'nl_NL',
  },
  pl: {
    title: 'Pojazdy na sprzedaż | Nowe i używane | Autorell',
    description:
      'Znajdź nowe i używane pojazdy w Polsce. Samochody, busy, motocykle i inne kategorie pojazdów na Autorell.',
    locale: 'pl_PL',
  },
  es: {
    title: 'Vehículos en venta | Nuevos y usados | Autorell',
    description:
      'Compra coches, furgonetas, motos y otros vehículos en España. Compara anuncios nuevos y usados en Autorell.',
    locale: 'es_ES',
  },
  eu: {
    title: 'Vehicles for sale | Buy used or new vehicles | Autorell',
    description:
      'Buy and sell cars, vans, motorcycles, motorhomes and other vehicles across Europe on Autorell.',
    locale: 'en_GB',
  },
} satisfies Record<string, MarketSeo>

export function getMarketHomeSeo(marketCode?: string | null) {
  const normalized = (marketCode || 'eu').toLowerCase()
  return marketHomeSeo[normalized] || marketHomeSeo.eu
}

export function createSeoMetadata({
  seo,
  canonical,
  alternates,
}: {
  seo: MarketSeo
  canonical: string
  alternates?: Metadata['alternates']
}): Metadata {
  const title = cleanSeoText(seo.title, SEO_TITLE_MAX)
  const description = cleanSeoText(seo.description, SEO_DESCRIPTION_MAX)

  return {
    title: { absolute: title },
    description,
    alternates: {
      ...alternates,
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Autorell',
      locale: seo.locale,
      type: 'website',
    },
  }
}

export function cleanSeoText(value: string, maxLength: number) {
  const cleaned = repairMojibake(value)
    .replace(/[·•]/g, '|')
    .replace(/\s+\|\s+/g, ' | ')
    .replace(/\s+/g, ' ')
    .trim()

  if (cleaned.length <= maxLength) return cleaned
  return cleaned.slice(0, maxLength - 1).trimEnd()
}

function repairMojibake(value: string) {
  return value
    .replace(/Ã„/g, 'Ä')
    .replace(/Ã–/g, 'Ö')
    .replace(/Ãœ/g, 'Ü')
    .replace(/Ã¤/g, 'ä')
    .replace(/Ã¶/g, 'ö')
    .replace(/Ã¼/g, 'ü')
    .replace(/ÃŸ/g, 'ß')
    .replace(/Ã©/g, 'é')
    .replace(/Ã¨/g, 'è')
    .replace(/Ãª/g, 'ê')
    .replace(/Ã¡/g, 'á')
    .replace(/Ã /g, 'à')
    .replace(/Ã³/g, 'ó')
    .replace(/Ã±/g, 'ñ')
    .replace(/Ã¥/g, 'å')
    .replace(/Ã…/g, 'Å')
    .replace(/Ã¦/g, 'æ')
    .replace(/Ã¸/g, 'ø')
    .replace(/â€”/g, '-')
    .replace(/â€™/g, "'")
}
