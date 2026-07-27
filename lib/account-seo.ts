import { headers } from 'next/headers'
import type { Metadata } from 'next'
import { cleanSeoText } from './market-seo'
import { getRequestLocale } from './request-locale'
import { localePathPrefix, translatePublic, translationLocale, type PublicLocale } from './public-i18n'

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
  | 'payments'
  | 'business-subscription'
  | 'business-subscription-cancel'
  | 'business-status'
  | 'company-overview'
  | 'company-profile'
  | 'company-team'
  | 'company-team-accept'
  | 'company-import'
  | 'company-analytics'
  | 'company-listings'
  | 'company-listing-create'
  | 'company-settings'
  | 'company-support'

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
      description: 'Hantera kontoinställningar, notiser, språk och säkerhet på Autorell.',
    },
    support: {
      title: 'Support | Autorell',
      description: 'Få hjälp med annonser, betalningar, meddelanden och konto på Autorell.',
    },
    payments: {
      title: 'Betalningar | Autorell',
      description: 'Se betalningar, kvitton och orderstatus för dina annonser på Autorell.',
    },
    'business-subscription': {
      title: 'Företagsplaner | Autorell',
      description: 'Välj och hantera företagsplaner för annonser, team och lager på Autorell.',
    },
    'business-subscription-cancel': {
      title: 'Avsluta plan | Autorell',
      description: 'Granska och bekräfta avslut av företagets abonnemang på Autorell.',
    },
    'business-status': {
      title: 'Företagsstatus | Autorell',
      description: 'Följ företagets verifiering och nästa steg för att börja annonsera.',
    },
    'company-overview': {
      title: 'Företagsöversikt | Autorell',
      description: 'Se företagets annonser, plan, team och viktiga åtgärder på Autorell.',
    },
    'company-profile': {
      title: 'Företagsprofil | Autorell',
      description: 'Hantera företagets presentation, adress, logotyp och kontaktuppgifter.',
    },
    'company-team': {
      title: 'Team | Autorell',
      description: 'Bjud in säljare och hantera roller i företagets Autorell-konto.',
    },
    'company-team-accept': {
      title: 'Teaminbjudan | Autorell',
      description: 'Acceptera en inbjudan till ett företagskonto på Autorell.',
    },
    'company-import': {
      title: 'Importera annonser | Autorell',
      description: 'Förbered och kontrollera företagets fordonsimport innan publicering.',
    },
    'company-analytics': {
      title: 'Företagsanalys | Autorell',
      description: 'Följ visningar, sparade annonser och aktivitet för företagets lager.',
    },
    'company-listings': {
      title: 'Företagsannonser | Autorell',
      description: 'Hantera företagets publicerade annonser, utkast och granskningar.',
    },
    'company-listing-create': {
      title: 'Skapa företagsannons | Autorell',
      description: 'Skapa en fordonsannons åt företaget med säljarkontakt och bilder.',
    },
    'company-settings': {
      title: 'Företagsinställningar | Autorell',
      description: 'Hantera företagets konto, behörigheter, språk och inställningar.',
    },
    'company-support': {
      title: 'Företagssupport | Autorell',
      description: 'Få hjälp med företagskonto, import, team, annonser och betalningar.',
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
    payments: {
      title: 'Zahlungen | Autorell',
      description: 'Zahlungen, Belege und Bestellstatus Ihrer Anzeigen bei Autorell ansehen.',
    },
    'business-subscription': {
      title: 'Unternehmenspläne | Autorell',
      description: 'Pläne für Anzeigen, Team und Bestand Ihres Unternehmens verwalten.',
    },
    'business-subscription-cancel': {
      title: 'Plan kündigen | Autorell',
      description: 'Kündigung des Unternehmensabonnements bei Autorell prüfen.',
    },
    'business-status': {
      title: 'Unternehmensstatus | Autorell',
      description: 'Verifizierung und nächste Schritte Ihres Unternehmens verfolgen.',
    },
    'company-overview': {
      title: 'Unternehmensübersicht | Autorell',
      description: 'Anzeigen, Plan, Team und offene Aufgaben Ihres Unternehmens sehen.',
    },
    'company-profile': {
      title: 'Unternehmensprofil | Autorell',
      description: 'Unternehmensprofil, Adresse, Logo und Kontaktdaten verwalten.',
    },
    'company-team': {
      title: 'Team | Autorell',
      description: 'Verkäufer einladen und Rollen im Unternehmenskonto verwalten.',
    },
    'company-team-accept': {
      title: 'Teameinladung | Autorell',
      description: 'Einladung zu einem Unternehmenskonto bei Autorell annehmen.',
    },
    'company-import': {
      title: 'Anzeigen importieren | Autorell',
      description: 'Fahrzeugimporte vor der Veröffentlichung vorbereiten und prüfen.',
    },
    'company-analytics': {
      title: 'Unternehmensanalyse | Autorell',
      description: 'Aufrufe, gespeicherte Anzeigen und Aktivität Ihres Bestands verfolgen.',
    },
    'company-listings': {
      title: 'Unternehmensanzeigen | Autorell',
      description: 'Veröffentlichte Anzeigen, Entwürfe und Prüfungen des Unternehmens verwalten.',
    },
    'company-listing-create': {
      title: 'Unternehmensanzeige erstellen | Autorell',
      description: 'Fahrzeuganzeige mit Verkäuferkontakt und Bildern für das Unternehmen erstellen.',
    },
    'company-settings': {
      title: 'Unternehmenseinstellungen | Autorell',
      description: 'Konto, Berechtigungen, Sprache und Einstellungen des Unternehmens verwalten.',
    },
    'company-support': {
      title: 'Unternehmenssupport | Autorell',
      description: 'Hilfe zu Unternehmenskonto, Import, Team, Anzeigen und Zahlungen erhalten.',
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
    payments: {
      title: 'Payments | Autorell',
      description: 'View payments, receipts and order status for your Autorell listings.',
    },
    'business-subscription': {
      title: 'Business plans | Autorell',
      description: 'Choose and manage business plans for listings, teams and inventory.',
    },
    'business-subscription-cancel': {
      title: 'Cancel plan | Autorell',
      description: 'Review and confirm cancellation of the company subscription.',
    },
    'business-status': {
      title: 'Business status | Autorell',
      description: 'Track company verification and next steps before publishing listings.',
    },
    'company-overview': {
      title: 'Company overview | Autorell',
      description: 'View company listings, plan, team and important actions on Autorell.',
    },
    'company-profile': {
      title: 'Company profile | Autorell',
      description: 'Manage company presentation, address, logo and contact details.',
    },
    'company-team': {
      title: 'Team | Autorell',
      description: 'Invite sellers and manage roles in the company Autorell account.',
    },
    'company-team-accept': {
      title: 'Team invitation | Autorell',
      description: 'Accept an invitation to a company account on Autorell.',
    },
    'company-import': {
      title: 'Import listings | Autorell',
      description: 'Prepare and review company vehicle imports before publishing.',
    },
    'company-analytics': {
      title: 'Company analytics | Autorell',
      description: 'Track views, saved listings and activity for company inventory.',
    },
    'company-listings': {
      title: 'Company listings | Autorell',
      description: 'Manage company published listings, drafts and reviews.',
    },
    'company-listing-create': {
      title: 'Create company listing | Autorell',
      description: 'Create a vehicle listing for the company with seller contact and photos.',
    },
    'company-settings': {
      title: 'Company settings | Autorell',
      description: 'Manage company account, permissions, language and settings.',
    },
    'company-support': {
      title: 'Company support | Autorell',
      description: 'Get help with company account, import, team, listings and payments.',
    },
  },
}

export function generateAccountMetadata(page: AccountSeoKey) {
  return async function metadata(): Promise<Metadata> {
    const locale = await getRequestLocale()
    const headerStore = await headers()
    const canonicalPath = headerStore.get('x-autorell-pathname') || fallbackAccountPath(page, locale)
    const copy = getAccountSeoCopy(page, locale)
    const title = cleanSeoText(copy.title, 60)
    const description = cleanSeoText(copy.description, 155)

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
  const compact = getLocalizedAccountSeoCopy(page, locale)
  if (compact) return compact
  const localized = localizedAccountSeoCopy[locale]?.[page]
  if (localized) return localized
  const translatedLocale = translationLocale(locale)
  if (translatedLocale !== locale) {
    const translated = localizedAccountSeoCopy[translatedLocale]?.[page]
    if (translated) return translated
  }

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
  const prefix = localePathPrefix(locale)
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
    payments: '/account/payments',
    'business-subscription': '/account/business/subscription',
    'business-subscription-cancel': '/account/business/subscription/cancel',
    'business-status': '/account/business/status',
    'company-overview': '/account/company',
    'company-profile': '/account/company/profile',
    'company-team': '/account/company/team',
    'company-team-accept': '/account/company/team/accept',
    'company-import': '/account/company/import',
    'company-analytics': '/account/company/analytics',
    'company-listings': '/account/company/listings',
    'company-listing-create': '/account/company/listings/create',
    'company-settings': '/account/company/settings',
    'company-support': '/account/company/support',
  }

  return `${prefix}${paths[page]}`
}

function getLocalizedAccountSeoCopy(page: AccountSeoKey, locale: PublicLocale): AccountSeoCopy | null {
  const normalized = translationLocale(locale)
  if (normalized === 'sv' || normalized === 'de' || normalized === 'en') {
    return accountSeoCopy[normalized][page]
  }
  const titles = localizedAccountTitles[normalized as keyof typeof localizedAccountTitles]
  const descriptions = localizedAccountDescriptions[normalized as keyof typeof localizedAccountDescriptions]
  if (!titles || !descriptions) return null
  return {
    title: titles[page],
    description: descriptions[page],
  }
}

const localizedAccountTitles: Record<'fi' | 'da' | 'fr' | 'es' | 'it' | 'nl' | 'pl', Record<AccountSeoKey, string>> = {
  fi: {
    profile: 'Oma profiili | Autorell',
    listings: 'Omat ilmoitukset | Autorell',
    'new-listing': 'Luo ilmoitus | Autorell',
    'edit-listing': 'Muokkaa ilmoitusta | Autorell',
    messages: 'Viestit | Autorell',
    reviews: 'Arvostelut | Autorell',
    'saved-listings': 'Tallennetut ilmoitukset | Autorell',
    'saved-searches': 'Tallennetut haut | Autorell',
    settings: 'Asetukset | Autorell',
    support: 'Tuki | Autorell',
    payments: 'Maksut | Autorell',
    'business-subscription': 'Yrityspaketit | Autorell',
    'business-subscription-cancel': 'Peru paketti | Autorell',
    'business-status': 'Yrityksen tila | Autorell',
    'company-overview': 'Yrityksen yhteenveto | Autorell',
    'company-profile': 'Yritysprofiili | Autorell',
    'company-team': 'Tiimi | Autorell',
    'company-team-accept': 'Tiimikutsu | Autorell',
    'company-import': 'Tuo ilmoituksia | Autorell',
    'company-analytics': 'Yritysanalytiikka | Autorell',
    'company-listings': 'Yritysilmoitukset | Autorell',
    'company-listing-create': 'Luo yritysilmoitus | Autorell',
    'company-settings': 'Yritysasetukset | Autorell',
    'company-support': 'Yritystuki | Autorell',
  },
  da: {
    profile: 'Min profil | Autorell',
    listings: 'Mine annoncer | Autorell',
    'new-listing': 'Opret annonce | Autorell',
    'edit-listing': 'Rediger annonce | Autorell',
    messages: 'Beskeder | Autorell',
    reviews: 'Anmeldelser | Autorell',
    'saved-listings': 'Gemte annoncer | Autorell',
    'saved-searches': 'Gemte søgninger | Autorell',
    settings: 'Indstillinger | Autorell',
    support: 'Support | Autorell',
    payments: 'Betalinger | Autorell',
    'business-subscription': 'Firmaplaner | Autorell',
    'business-subscription-cancel': 'Opsig plan | Autorell',
    'business-status': 'Firmastatus | Autorell',
    'company-overview': 'Firmaoversigt | Autorell',
    'company-profile': 'Firmaprofil | Autorell',
    'company-team': 'Team | Autorell',
    'company-team-accept': 'Teaminvitation | Autorell',
    'company-import': 'Importer annoncer | Autorell',
    'company-analytics': 'Firmaanalyse | Autorell',
    'company-listings': 'Firmaannoncer | Autorell',
    'company-listing-create': 'Opret firmaannonce | Autorell',
    'company-settings': 'Firmaindstillinger | Autorell',
    'company-support': 'Firmasupport | Autorell',
  },
  fr: {
    profile: 'Mon profil | Autorell',
    listings: 'Mes annonces | Autorell',
    'new-listing': 'Créer une annonce | Autorell',
    'edit-listing': 'Modifier annonce | Autorell',
    messages: 'Messages | Autorell',
    reviews: 'Avis | Autorell',
    'saved-listings': 'Annonces enregistrées | Autorell',
    'saved-searches': 'Recherches enregistrées | Autorell',
    settings: 'Paramètres | Autorell',
    support: 'Support | Autorell',
    payments: 'Paiements | Autorell',
    'business-subscription': 'Offres entreprise | Autorell',
    'business-subscription-cancel': 'Résilier offre | Autorell',
    'business-status': 'Statut entreprise | Autorell',
    'company-overview': 'Aperçu entreprise | Autorell',
    'company-profile': 'Profil entreprise | Autorell',
    'company-team': 'Équipe | Autorell',
    'company-team-accept': 'Invitation équipe | Autorell',
    'company-import': 'Importer annonces | Autorell',
    'company-analytics': 'Analyse entreprise | Autorell',
    'company-listings': 'Annonces entreprise | Autorell',
    'company-listing-create': 'Créer annonce entreprise | Autorell',
    'company-settings': 'Paramètres entreprise | Autorell',
    'company-support': 'Support entreprise | Autorell',
  },
  es: {
    profile: 'Mi perfil | Autorell',
    listings: 'Mis anuncios | Autorell',
    'new-listing': 'Crear anuncio | Autorell',
    'edit-listing': 'Editar anuncio | Autorell',
    messages: 'Mensajes | Autorell',
    reviews: 'Reseñas | Autorell',
    'saved-listings': 'Anuncios guardados | Autorell',
    'saved-searches': 'Búsquedas guardadas | Autorell',
    settings: 'Ajustes | Autorell',
    support: 'Soporte | Autorell',
    payments: 'Pagos | Autorell',
    'business-subscription': 'Planes empresa | Autorell',
    'business-subscription-cancel': 'Cancelar plan | Autorell',
    'business-status': 'Estado empresa | Autorell',
    'company-overview': 'Resumen empresa | Autorell',
    'company-profile': 'Perfil empresa | Autorell',
    'company-team': 'Equipo | Autorell',
    'company-team-accept': 'Invitación equipo | Autorell',
    'company-import': 'Importar anuncios | Autorell',
    'company-analytics': 'Analítica empresa | Autorell',
    'company-listings': 'Anuncios empresa | Autorell',
    'company-listing-create': 'Crear anuncio empresa | Autorell',
    'company-settings': 'Ajustes empresa | Autorell',
    'company-support': 'Soporte empresa | Autorell',
  },
  it: {
    profile: 'Il mio profilo | Autorell',
    listings: 'I miei annunci | Autorell',
    'new-listing': 'Crea annuncio | Autorell',
    'edit-listing': 'Modifica annuncio | Autorell',
    messages: 'Messaggi | Autorell',
    reviews: 'Recensioni | Autorell',
    'saved-listings': 'Annunci salvati | Autorell',
    'saved-searches': 'Ricerche salvate | Autorell',
    settings: 'Impostazioni | Autorell',
    support: 'Supporto | Autorell',
    payments: 'Pagamenti | Autorell',
    'business-subscription': 'Piani azienda | Autorell',
    'business-subscription-cancel': 'Annulla piano | Autorell',
    'business-status': 'Stato azienda | Autorell',
    'company-overview': 'Panoramica azienda | Autorell',
    'company-profile': 'Profilo azienda | Autorell',
    'company-team': 'Team | Autorell',
    'company-team-accept': 'Invito team | Autorell',
    'company-import': 'Importa annunci | Autorell',
    'company-analytics': 'Analisi azienda | Autorell',
    'company-listings': 'Annunci azienda | Autorell',
    'company-listing-create': 'Crea annuncio azienda | Autorell',
    'company-settings': 'Impostazioni azienda | Autorell',
    'company-support': 'Supporto azienda | Autorell',
  },
  nl: {
    profile: 'Mijn profiel | Autorell',
    listings: 'Mijn advertenties | Autorell',
    'new-listing': 'Advertentie maken | Autorell',
    'edit-listing': 'Advertentie bewerken | Autorell',
    messages: 'Berichten | Autorell',
    reviews: 'Beoordelingen | Autorell',
    'saved-listings': 'Opgeslagen advertenties | Autorell',
    'saved-searches': 'Opgeslagen zoekopdrachten | Autorell',
    settings: 'Instellingen | Autorell',
    support: 'Support | Autorell',
    payments: 'Betalingen | Autorell',
    'business-subscription': 'Bedrijfsplannen | Autorell',
    'business-subscription-cancel': 'Plan annuleren | Autorell',
    'business-status': 'Bedrijfsstatus | Autorell',
    'company-overview': 'Bedrijfsoverzicht | Autorell',
    'company-profile': 'Bedrijfsprofiel | Autorell',
    'company-team': 'Team | Autorell',
    'company-team-accept': 'Teamuitnodiging | Autorell',
    'company-import': 'Advertenties importeren | Autorell',
    'company-analytics': 'Bedrijfsanalyse | Autorell',
    'company-listings': 'Bedrijfsadvertenties | Autorell',
    'company-listing-create': 'Bedrijfsadvertentie maken | Autorell',
    'company-settings': 'Bedrijfsinstellingen | Autorell',
    'company-support': 'Bedrijfssupport | Autorell',
  },
  pl: {
    profile: 'Mój profil | Autorell',
    listings: 'Moje ogłoszenia | Autorell',
    'new-listing': 'Dodaj ogłoszenie | Autorell',
    'edit-listing': 'Edytuj ogłoszenie | Autorell',
    messages: 'Wiadomości | Autorell',
    reviews: 'Opinie | Autorell',
    'saved-listings': 'Zapisane ogłoszenia | Autorell',
    'saved-searches': 'Zapisane wyszukiwania | Autorell',
    settings: 'Ustawienia | Autorell',
    support: 'Pomoc | Autorell',
    payments: 'Płatności | Autorell',
    'business-subscription': 'Plany firmowe | Autorell',
    'business-subscription-cancel': 'Anuluj plan | Autorell',
    'business-status': 'Status firmy | Autorell',
    'company-overview': 'Panel firmy | Autorell',
    'company-profile': 'Profil firmy | Autorell',
    'company-team': 'Zespół | Autorell',
    'company-team-accept': 'Zaproszenie do zespołu | Autorell',
    'company-import': 'Import ogłoszeń | Autorell',
    'company-analytics': 'Analityka firmy | Autorell',
    'company-listings': 'Ogłoszenia firmy | Autorell',
    'company-listing-create': 'Dodaj ogłoszenie firmy | Autorell',
    'company-settings': 'Ustawienia firmy | Autorell',
    'company-support': 'Pomoc dla firm | Autorell',
  },
}

const localizedAccountDescriptions: Record<'fi' | 'da' | 'fr' | 'es' | 'it' | 'nl' | 'pl', Record<AccountSeoKey, string>> = {
  fi: localizedDescriptions('Hallitse profiilia, yhteystietoja ja Autorell-tiliä.', 'Luo ja hallitse ilmoituksia, maksuja, viestejä ja yritystyökaluja Autorellissa.'),
  da: localizedDescriptions('Administrer profil, kontaktoplysninger og konto på Autorell.', 'Opret og administrer annoncer, betalinger, beskeder og firmaværktøjer på Autorell.'),
  fr: localizedDescriptions('Gérez votre profil, vos coordonnées et votre compte Autorell.', 'Créez et gérez annonces, paiements, messages et outils entreprise sur Autorell.'),
  es: localizedDescriptions('Gestiona tu perfil, contacto y cuenta de Autorell.', 'Crea y gestiona anuncios, pagos, mensajes y herramientas de empresa en Autorell.'),
  it: localizedDescriptions('Gestisci profilo, contatti e account Autorell.', 'Crea e gestisci annunci, pagamenti, messaggi e strumenti aziendali su Autorell.'),
  nl: localizedDescriptions('Beheer profiel, contactgegevens en Autorell-account.', 'Maak en beheer advertenties, betalingen, berichten en bedrijfstools op Autorell.'),
  pl: localizedDescriptions('Zarządzaj profilem, kontaktem i kontem Autorell.', 'Twórz i zarządzaj ogłoszeniami, płatnościami, wiadomościami i narzędziami firmowymi.'),
}

function localizedDescriptions(profile: string, general: string): Record<AccountSeoKey, string> {
  return {
    profile,
    listings: general,
    'new-listing': general,
    'edit-listing': general,
    messages: general,
    reviews: general,
    'saved-listings': general,
    'saved-searches': general,
    settings: profile,
    support: general,
    payments: general,
    'business-subscription': general,
    'business-subscription-cancel': general,
    'business-status': general,
    'company-overview': general,
    'company-profile': general,
    'company-team': general,
    'company-team-accept': general,
    'company-import': general,
    'company-analytics': general,
    'company-listings': general,
    'company-listing-create': general,
    'company-settings': profile,
    'company-support': general,
  }
}

