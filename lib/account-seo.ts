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
      description: 'Hantera profil, kontaktuppgifter, fÃ¶retag och kontoinstÃ¤llningar pÃ¥ Autorell.',
    },
    listings: {
      title: 'Mina annonser | Autorell',
      description: 'Se, hantera och fÃ¶lj upp dina fordonsannonser pÃ¥ Autorell.',
    },
    'new-listing': {
      title: 'Skapa annons | Autorell',
      description: 'Skapa en fordonsannons med pris, bilder, plats och fordonsdata.',
    },
    'edit-listing': {
      title: 'Redigera annons | Autorell',
      description: 'Uppdatera pris, bilder, fordonsdata och publicering fÃ¶r din annons.',
    },
    messages: {
      title: 'Meddelanden | Autorell',
      description: 'LÃ¤s och svara pÃ¥ meddelanden mellan kÃ¶pare och sÃ¤ljare pÃ¥ Autorell.',
    },
    reviews: {
      title: 'Recensioner | Autorell',
      description: 'Se och hantera recensioner kopplade till dina fordonsaffÃ¤rer.',
    },
    'saved-listings': {
      title: 'Sparade annonser | Autorell',
      description: 'Se dina sparade fordonsannonser och fortsÃ¤tt jÃ¤mfÃ¶ra nÃ¤r du Ã¤r redo.',
    },
    'saved-searches': {
      title: 'Sparade sÃ¶kningar | Autorell',
      description: 'Hitta tillbaka till dina sparade fordonssÃ¶kningar och filter pÃ¥ Autorell.',
    },
    settings: {
      title: 'InstÃ¤llningar | Autorell',
      description: 'Hantera privata kontoinstÃ¤llningar, notiser, sprÃ¥k och sÃ¤kerhet pÃ¥ Autorell.',
    },
    support: {
      title: 'Support | Autorell',
      description: 'FÃ¥ hjÃ¤lp med privata annonser, betalningar, meddelanden och konto pÃ¥ Autorell.',
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
      description: 'Aktualisieren Sie Preis, Bilder, Fahrzeugdaten und VerÃ¶ffentlichung Ihrer Anzeige.',
    },
    messages: {
      title: 'Nachrichten | Autorell',
      description: 'Nachrichten zwischen KÃ¤ufern und VerkÃ¤ufern bei Autorell lesen und beantworten.',
    },
    reviews: {
      title: 'Bewertungen | Autorell',
      description: 'Bewertungen zu Ihren FahrzeuggeschÃ¤ften ansehen und verwalten.',
    },
    'saved-listings': {
      title: 'Gespeicherte Anzeigen | Autorell',
      description: 'Gespeicherte Fahrzeuganzeigen ansehen und spÃ¤ter weiter vergleichen.',
    },
    'saved-searches': {
      title: 'Gespeicherte Suchen | Autorell',
      description: 'Gespeicherte Fahrzeugsuchen und Filter bei Autorell wieder Ã¶ffnen.',
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
  const localized = localizedAccountSeoCopy[locale]?.[page]
  if (localized) return localized

  const english = accountSeoCopy.en[page]
  return {
    title: translatePublic(locale, english.title),
    description: translatePublic(locale, english.description),
  }
}

const localizedAccountSeoCopy: Partial<Record<PublicLocale, Partial<Record<AccountSeoKey, AccountSeoCopy>>>> = {
  fi: {
    messages: {
      title: 'Viestit | Autorell',
      description: 'Lue ja vastaa ostajien ja myyjien viesteihin Autorellissa.',
    },
    'new-listing': {
      title: 'Luo ilmoitus | Autorell',
      description: 'Luo ajoneuvoilmoitus hinnalla, kuvilla, sijainnilla ja ajoneuvon tiedoilla.',
    },
    'saved-listings': {
      title: 'Tallennetut ilmoitukset | Autorell',
      description: 'Katso tallennetut ajoneuvoilmoitukset ja jatka vertailua, kun olet valmis.',
    },
    'saved-searches': {
      title: 'Tallennetut haut | Autorell',
      description: 'Palaa tallennettuihin ajoneuvohakuihin ja suodattimiin Autorellissa.',
    },
  },
  da: {
    messages: {
      title: 'Beskeder | Autorell',
      description: 'Laes og svar paa beskeder mellem koebere og saelgere paa Autorell.',
    },
    'new-listing': {
      title: 'Opret annonce | Autorell',
      description: 'Opret en koeretoejsannonce med pris, billeder, placering og koeretoejsdata.',
    },
    'saved-listings': {
      title: 'Gemte annoncer | Autorell',
      description: 'Se dine gemte koeretoejsannoncer, og fortsaet sammenligningen, naar du er klar.',
    },
    'saved-searches': {
      title: 'Gemte soegninger | Autorell',
      description: 'Find tilbage til dine gemte koeretoejssoegninger og filtre paa Autorell.',
    },
  },
  fr: {
    messages: {
      title: 'Messages | Autorell',
      description: 'Lisez et repondez aux messages entre acheteurs et vendeurs sur Autorell.',
    },
    'new-listing': {
      title: 'Creer une annonce | Autorell',
      description: 'Creez une annonce de vehicule avec prix, photos, localisation et donnees du vehicule.',
    },
    'saved-listings': {
      title: 'Annonces enregistrees | Autorell',
      description: 'Consultez vos annonces de vehicules enregistrees et continuez la comparaison lorsque vous etes pret.',
    },
    'saved-searches': {
      title: 'Recherches enregistrees | Autorell',
      description: 'Retrouvez vos recherches et filtres de vehicules enregistres sur Autorell.',
    },
  },
  es: {
    messages: {
      title: 'Mensajes | Autorell',
      description: 'Lee y responde mensajes entre compradores y vendedores en Autorell.',
    },
    'new-listing': {
      title: 'Crear anuncio | Autorell',
      description: 'Crea un anuncio de vehiculo con precio, fotos, ubicacion y datos del vehiculo.',
    },
    'saved-listings': {
      title: 'Anuncios guardados | Autorell',
      description: 'Consulta tus anuncios de vehiculos guardados y sigue comparando cuando estes listo.',
    },
    'saved-searches': {
      title: 'Busquedas guardadas | Autorell',
      description: 'Vuelve a tus busquedas y filtros de vehiculos guardados en Autorell.',
    },
  },
  it: {
    messages: {
      title: 'Messaggi | Autorell',
      description: 'Leggi e rispondi ai messaggi tra acquirenti e venditori su Autorell.',
    },
    'new-listing': {
      title: 'Crea annuncio | Autorell',
      description: 'Crea un annuncio per un veicolo con prezzo, foto, posizione e dati del veicolo.',
    },
    'saved-listings': {
      title: 'Annunci salvati | Autorell',
      description: 'Visualizza gli annunci di veicoli salvati e continua a confrontare quando sei pronto.',
    },
    'saved-searches': {
      title: 'Ricerche salvate | Autorell',
      description: 'Torna alle ricerche e ai filtri veicolo salvati su Autorell.',
    },
  },
  nl: {
    messages: {
      title: 'Berichten | Autorell',
      description: 'Lees en beantwoord berichten tussen kopers en verkopers op Autorell.',
    },
    'new-listing': {
      title: 'Advertentie maken | Autorell',
      description: 'Maak een voertuigadvertentie met prijs, fotos, locatie en voertuiggegevens.',
    },
    'saved-listings': {
      title: 'Opgeslagen advertenties | Autorell',
      description: 'Bekijk uw opgeslagen voertuigadvertenties en vergelijk verder wanneer u klaar bent.',
    },
    'saved-searches': {
      title: 'Opgeslagen zoekopdrachten | Autorell',
      description: 'Ga terug naar uw opgeslagen voertuigzoekopdrachten en filters op Autorell.',
    },
  },
  pl: {
    messages: {
      title: 'Wiadomosci | Autorell',
      description: 'Czytaj i odpowiadaj na wiadomosci miedzy kupujacymi i sprzedajacymi w Autorell.',
    },
    'new-listing': {
      title: 'Utworz ogloszenie | Autorell',
      description: 'Utworz ogloszenie pojazdu z cena, zdjeciami, lokalizacja i danymi pojazdu.',
    },
    'saved-listings': {
      title: 'Zapisane ogloszenia | Autorell',
      description: 'Zobacz zapisane ogloszenia pojazdow i kontynuuj porownywanie, gdy bedziesz gotowy.',
    },
    'saved-searches': {
      title: 'Zapisane wyszukiwania | Autorell',
      description: 'Wroc do zapisanych wyszukiwan pojazdow i filtrow w Autorell.',
    },
  },
  at: {
    messages: {
      title: 'Nachrichten | Autorell',
      description: 'Nachrichten zwischen Kaeufern und Verkaeufern bei Autorell lesen und beantworten.',
    },
    'saved-listings': {
      title: 'Gespeicherte Anzeigen | Autorell',
      description: 'Gespeicherte Fahrzeuganzeigen ansehen und spaeter weiter vergleichen.',
    },
    'saved-searches': {
      title: 'Gespeicherte Suchen | Autorell',
      description: 'Gespeicherte Fahrzeugsuchen und Filter bei Autorell wieder oeffnen.',
    },
  },
  be: {
    messages: {
      title: 'Berichten | Autorell',
      description: 'Lees en beantwoord berichten tussen kopers en verkopers op Autorell.',
    },
    'saved-listings': {
      title: 'Opgeslagen advertenties | Autorell',
      description: 'Bekijk uw opgeslagen voertuigadvertenties en vergelijk verder wanneer u klaar bent.',
    },
    'saved-searches': {
      title: 'Opgeslagen zoekopdrachten | Autorell',
      description: 'Ga terug naar uw opgeslagen voertuigzoekopdrachten en filters op Autorell.',
    },
  },
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

