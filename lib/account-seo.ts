import { headers } from 'next/headers'
import type { Metadata } from 'next'
import { cleanSeoText } from './market-seo'
import { getRequestLocale } from './request-locale'
import { translatePublic, type PublicLocale } from './public-i18n'

type AccountSeoKey =
  | 'profile'
  | 'listings'
  | 'new-listing'
  | 'edit-listing'
  | 'messages'
  | 'reviews'
  | 'saved-listings'
  | 'saved-searches'
  | 'settings'
  | 'support'

type AccountSeoCopy = {
  title: string
  description: string
}

const accountSeoCopy: Record<'sv' | 'de' | 'en', Record<AccountSeoKey, AccountSeoCopy>> = {
  sv: {
    profile: {
      title: 'Min profil | Autorell',
      description: 'Hantera profil, kontaktuppgifter, företag och kontoinställningar på Autorell.',
    },
    listings: {
      title: 'Mina annonser | Autorell',
      description: 'Se, hantera och följ upp dina fordonsannonser på Autorell.',
    },
    'new-listing': {
      title: 'Skapa annons | Autorell',
      description: 'Skapa en fordonsannons med pris, bilder, plats och fordonsdata.',
    },
    'edit-listing': {
      title: 'Redigera annons | Autorell',
      description: 'Uppdatera pris, bilder, fordonsdata och publicering för din annons.',
    },
    messages: {
      title: 'Meddelanden | Autorell',
      description: 'Läs och svara på meddelanden mellan köpare och säljare på Autorell.',
    },
    reviews: {
      title: 'Recensioner | Autorell',
      description: 'Se och hantera recensioner kopplade till dina fordonsaffärer.',
    },
    'saved-listings': {
      title: 'Sparade annonser | Autorell',
      description: 'Se dina sparade fordonsannonser och fortsätt jämföra när du är redo.',
    },
    'saved-searches': {
      title: 'Sparade sökningar | Autorell',
      description: 'Hitta tillbaka till dina sparade fordonssökningar och filter på Autorell.',
    },
    settings: {
      title: 'Inställningar | Autorell',
      description: 'Hantera privata kontoinställningar, notiser, språk och säkerhet på Autorell.',
    },
    support: {
      title: 'Support | Autorell',
      description: 'Få hjälp med privata annonser, betalningar, meddelanden och konto på Autorell.',
    },
  },
  de: {
    profile: {
      title: 'Mein Profil | Autorell',
      description: 'Verwalten Sie Profil, Kontaktdaten, Unternehmen und Kontoeinstellungen bei Autorell.',
    },
    listings: {
      title: 'Meine Anzeigen | Autorell',
      description: 'Anzeigen ansehen, verwalten und Fahrzeuganfragen bei Autorell verfolgen.',
    },
    'new-listing': {
      title: 'Anzeige erstellen | Autorell',
      description: 'Erstellen Sie eine Fahrzeuganzeige mit Preis, Bildern, Standort und Fahrzeugdaten.',
    },
    'edit-listing': {
      title: 'Anzeige bearbeiten | Autorell',
      description: 'Aktualisieren Sie Preis, Bilder, Fahrzeugdaten und Veröffentlichung Ihrer Anzeige.',
    },
    messages: {
      title: 'Nachrichten | Autorell',
      description: 'Nachrichten zwischen Käufern und Verkäufern bei Autorell lesen und beantworten.',
    },
    reviews: {
      title: 'Bewertungen | Autorell',
      description: 'Bewertungen zu Ihren Fahrzeuggeschäften ansehen und verwalten.',
    },
    'saved-listings': {
      title: 'Gespeicherte Anzeigen | Autorell',
      description: 'Gespeicherte Fahrzeuganzeigen ansehen und später weiter vergleichen.',
    },
    'saved-searches': {
      title: 'Gespeicherte Suchen | Autorell',
      description: 'Gespeicherte Fahrzeugsuchen und Filter bei Autorell wieder öffnen.',
    },
    settings: {
      title: 'Einstellungen | Autorell',
      description: 'Private Kontoeinstellungen, Benachrichtigungen, Sprache und Sicherheit bei Autorell verwalten.',
    },
    support: {
      title: 'Support | Autorell',
      description: 'Hilfe zu privaten Anzeigen, Zahlungen, Nachrichten und Konto bei Autorell erhalten.',
    },
  },
  en: {
    profile: {
      title: 'My profile | Autorell',
      description: 'Manage your profile, contact details, company and account settings on Autorell.',
    },
    listings: {
      title: 'My listings | Autorell',
      description: 'View, manage and follow up your vehicle listings on Autorell.',
    },
    'new-listing': {
      title: 'Create listing | Autorell',
      description: 'Create a vehicle listing with price, photos, location and vehicle details.',
    },
    'edit-listing': {
      title: 'Edit listing | Autorell',
      description: 'Update price, photos, vehicle data and publishing settings for your listing.',
    },
    messages: {
      title: 'Messages | Autorell',
      description: 'Read and reply to messages between buyers and sellers on Autorell.',
    },
    reviews: {
      title: 'Reviews | Autorell',
      description: 'View and manage reviews connected to your vehicle deals.',
    },
    'saved-listings': {
      title: 'Saved listings | Autorell',
      description: 'View saved vehicle listings and keep comparing when you are ready.',
    },
    'saved-searches': {
      title: 'Saved searches | Autorell',
      description: 'Return to saved vehicle searches and filters on Autorell.',
    },
    settings: {
      title: 'Settings | Autorell',
      description: 'Manage private account settings, notifications, language and security on Autorell.',
    },
    support: {
      title: 'Support | Autorell',
      description: 'Get help with private listings, payments, messages and your Autorell account.',
    },
  },
}

export function generateAccountMetadata(page: AccountSeoKey) {
  return async function metadata(): Promise<Metadata> {
    const locale = await getRequestLocale()
    const headerStore = await headers()
    const canonicalPath = headerStore.get('x-autorell-pathname') || fallbackAccountPath(page, locale)
    const copy = getAccountSeoCopy(page, locale)
    const title = cleanSeoText(copy.title, 65)
    const description = cleanSeoText(copy.description, 150)

    return {
      title: { absolute: title },
      description,
      alternates: {
        canonical: `https://www.autorell.com${canonicalPath}`,
      },
      robots: {
        index: false,
        follow: false,
      },
    }
  }
}

function getAccountSeoCopy(page: AccountSeoKey, locale: PublicLocale) {
  if (locale === 'sv' || locale === 'de' || locale === 'en') {
    return accountSeoCopy[locale][page]
  }

  const english = accountSeoCopy.en[page]
  return {
    title: translatePublic(locale, english.title),
    description: translatePublic(locale, english.description),
  }
}

function fallbackAccountPath(page: AccountSeoKey, locale: PublicLocale) {
  const prefix = locale === 'sv' ? '/se' : locale === 'de' ? '/de' : ''
  const paths: Record<AccountSeoKey, string> = {
    profile: '/account',
    listings: '/account/listings',
    'new-listing': '/account/listings/new',
    'edit-listing': '/account/listings/edit',
    messages: '/account/messages',
    reviews: '/account/reviews',
    'saved-listings': '/saved',
    'saved-searches': '/saved-searches',
    settings: '/account/settings',
    support: '/account/support',
  }

  return `${prefix}${paths[page]}`
}
