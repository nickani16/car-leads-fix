import {
  translatePublicObject,
  type PublicLocale,
} from '@/lib/public-i18n'

export type NotFoundLanguage = PublicLocale

const english = {
  eyebrow: 'Page not found',
  heading: 'We could not find that page.',
  description:
    'The listing, account page or link may have moved. Search the marketplace, return home or contact Autorell if you expected something to be here.',
  home: 'Back to homepage',
  marketplace: 'Search vehicles',
  account: 'My account',
  support: 'Contact support',
  popularTitle: 'Popular places to continue',
  cars: 'Cars',
  vans: 'Vans',
  motorcycles: 'Motorcycles',
  companies: 'For companies',
  sell: 'Sell a vehicle',
  label: 'Page not found',
  homeAria: 'Autorell homepage',
}

export function getNotFoundCopy(locale: PublicLocale) {
  if (locale === 'sv') {
    return {
      eyebrow: 'Sidan hittades inte',
      heading: 'Vi hittar inte sidan.',
      description:
        'Annonsen, kontosidan eller länken kan ha flyttats. Sök bland fordon, gå tillbaka till startsidan eller kontakta Autorell om du förväntade dig att sidan skulle finnas här.',
      home: 'Till startsidan',
      marketplace: 'Sök fordon',
      account: 'Mitt konto',
      support: 'Kontakta support',
      popularTitle: 'Vanliga vägar vidare',
      cars: 'Bilar',
      vans: 'Transportbilar',
      motorcycles: 'Motorcyklar',
      companies: 'För företag',
      sell: 'Sälj fordon',
      label: 'Sidan hittades inte',
      homeAria: 'Autorell startsida',
    }
  }

  if (locale === 'de') {
    return {
      eyebrow: 'Seite nicht gefunden',
      heading: 'Wir finden diese Seite nicht.',
      description:
        'Die Anzeige, Kontoseite oder der Link wurde möglicherweise verschoben. Suchen Sie Fahrzeuge, gehen Sie zur Startseite zurück oder kontaktieren Sie Autorell, wenn Sie diese Seite erwartet haben.',
      home: 'Zur Startseite',
      marketplace: 'Fahrzeuge suchen',
      account: 'Mein Konto',
      support: 'Support kontaktieren',
      popularTitle: 'Beliebte Wege weiter',
      cars: 'Autos',
      vans: 'Transporter',
      motorcycles: 'Motorräder',
      companies: 'Für Unternehmen',
      sell: 'Fahrzeug verkaufen',
      label: 'Seite nicht gefunden',
      homeAria: 'Autorell Startseite',
    }
  }

  return locale === 'en' ? english : translatePublicObject(locale, english)
}
