import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { localizePublicHref, translationLocale, type PublicLocale } from '@/lib/public-i18n'

export type AccountCrumbKey =
  | 'account'
  | 'companyAccount'
  | 'profile'
  | 'listings'
  | 'createListing'
  | 'editListing'
  | 'savedListings'
  | 'savedSearches'
  | 'messages'
  | 'payments'
  | 'reviews'
  | 'settings'
  | 'support'
  | 'companyProfile'
  | 'companyListings'
  | 'companyListingCreate'
  | 'companyImport'
  | 'companyTeam'
  | 'companyAnalytics'
  | 'companySubscription'

export type AccountBreadcrumbItem = {
  key: AccountCrumbKey
  href?: string
}

type BreadcrumbCopy = Record<AccountCrumbKey | 'breadcrumbs', string>
type BreadcrumbLocale = Exclude<PublicLocale, 'at' | 'be'>

const englishBreadcrumbs: BreadcrumbCopy = {
  breadcrumbs: 'Breadcrumbs',
  account: 'My account',
  companyAccount: 'Company account',
  profile: 'Profile',
  listings: 'Listings',
  createListing: 'Create listing',
  editListing: 'Edit listing',
  savedListings: 'Saved listings',
  savedSearches: 'Saved searches',
  messages: 'Messages',
  payments: 'Payments',
  reviews: 'Reviews',
  settings: 'Settings',
  support: 'Help',
  companyProfile: 'Company profile',
  companyListings: 'Inventory',
  companyListingCreate: 'New listing',
  companyImport: 'Import',
  companyTeam: 'Team',
  companyAnalytics: 'Analytics',
  companySubscription: 'Plans',
}

const localizedBreadcrumbs: Partial<Record<BreadcrumbLocale, Partial<BreadcrumbCopy>>> = {
  sv: {
    breadcrumbs: 'Brödsmulor',
    account: 'Mina sidor',
    companyAccount: 'Företagskonto',
    profile: 'Profil',
    listings: 'Annonser',
    createListing: 'Skapa annons',
    editListing: 'Redigera annons',
    savedListings: 'Sparade annonser',
    savedSearches: 'Sparade sökningar',
    messages: 'Meddelanden',
    payments: 'Betalningar',
    reviews: 'Recensioner',
    settings: 'Inställningar',
    support: 'Hjälp',
    companyProfile: 'Företagsprofil',
    companyListings: 'Lager',
    companyListingCreate: 'Ny annons',
    companyImport: 'Import',
    companyTeam: 'Team',
    companyAnalytics: 'Analys',
    companySubscription: 'Abonnemang',
  },
  de: {
    breadcrumbs: 'Navigation',
    account: 'Mein Konto',
    companyAccount: 'Firmenkonto',
    listings: 'Anzeigen',
    createListing: 'Anzeige erstellen',
    editListing: 'Anzeige bearbeiten',
    savedListings: 'Gespeicherte Anzeigen',
    savedSearches: 'Gespeicherte Suchen',
    messages: 'Nachrichten',
    payments: 'Zahlungen',
    reviews: 'Bewertungen',
    settings: 'Einstellungen',
    support: 'Hilfe',
    companyProfile: 'Firmenprofil',
    companyListings: 'Bestand',
    companyListingCreate: 'Neue Anzeige',
    companyAnalytics: 'Analyse',
    companySubscription: 'Tarife',
  },
  nl: {
    breadcrumbs: 'Navigatie',
    account: 'Mijn account',
    companyAccount: 'Bedrijfsaccount',
    profile: 'Profiel',
    listings: 'Advertenties',
    createListing: 'Advertentie maken',
    editListing: 'Advertentie bewerken',
    savedListings: 'Bewaarde advertenties',
    savedSearches: 'Bewaarde zoekopdrachten',
    messages: 'Berichten',
    payments: 'Betalingen',
    reviews: 'Beoordelingen',
    settings: 'Instellingen',
    companyProfile: 'Bedrijfsprofiel',
    companyListings: 'Voorraad',
    companyListingCreate: 'Nieuwe advertentie',
    companyAnalytics: 'Analyse',
    companySubscription: 'Abonnementen',
  },
  fr: {
    breadcrumbs: 'Fil d’Ariane',
    account: 'Mon compte',
    companyAccount: 'Compte entreprise',
    profile: 'Profil',
    listings: 'Annonces',
    createListing: 'Créer une annonce',
    editListing: 'Modifier l’annonce',
    savedListings: 'Annonces enregistrées',
    savedSearches: 'Recherches enregistrées',
    payments: 'Paiements',
    reviews: 'Avis',
    settings: 'Paramètres',
    support: 'Aide',
    companyProfile: 'Profil d’entreprise',
    companyListings: 'Stock',
    companyListingCreate: 'Nouvelle annonce',
    companyAnalytics: 'Analyse',
    companySubscription: 'Abonnements',
  },
  es: {
    breadcrumbs: 'Ruta de navegación',
    account: 'Mi cuenta',
    companyAccount: 'Cuenta de empresa',
    profile: 'Perfil',
    listings: 'Anuncios',
    createListing: 'Crear anuncio',
    editListing: 'Editar anuncio',
    savedListings: 'Anuncios guardados',
    savedSearches: 'Búsquedas guardadas',
    messages: 'Mensajes',
    payments: 'Pagos',
    reviews: 'Reseñas',
    settings: 'Ajustes',
    support: 'Ayuda',
    companyProfile: 'Perfil de empresa',
    companyListings: 'Inventario',
    companyListingCreate: 'Nuevo anuncio',
    companyImport: 'Importación',
    companyTeam: 'Equipo',
    companyAnalytics: 'Analítica',
    companySubscription: 'Planes',
  },
  it: {
    breadcrumbs: 'Percorso',
    account: 'Il mio account',
    companyAccount: 'Account aziendale',
    profile: 'Profilo',
    listings: 'Annunci',
    createListing: 'Crea annuncio',
    editListing: 'Modifica annuncio',
    savedListings: 'Annunci salvati',
    savedSearches: 'Ricerche salvate',
    messages: 'Messaggi',
    payments: 'Pagamenti',
    reviews: 'Recensioni',
    settings: 'Impostazioni',
    support: 'Aiuto',
    companyProfile: 'Profilo aziendale',
    companyListings: 'Inventario',
    companyListingCreate: 'Nuovo annuncio',
    companyImport: 'Importazione',
    companyAnalytics: 'Analisi',
    companySubscription: 'Piani',
  },
  pl: {
    breadcrumbs: 'Nawigacja',
    account: 'Moje konto',
    companyAccount: 'Konto firmowe',
    profile: 'Profil',
    listings: 'Ogłoszenia',
    createListing: 'Dodaj ogłoszenie',
    editListing: 'Edytuj ogłoszenie',
    savedListings: 'Zapisane ogłoszenia',
    savedSearches: 'Zapisane wyszukiwania',
    messages: 'Wiadomości',
    payments: 'Płatności',
    reviews: 'Opinie',
    settings: 'Ustawienia',
    support: 'Pomoc',
    companyProfile: 'Profil firmy',
    companyListings: 'Magazyn',
    companyListingCreate: 'Nowe ogłoszenie',
    companyTeam: 'Zespół',
    companyAnalytics: 'Analityka',
    companySubscription: 'Plany',
  },
  fi: {
    breadcrumbs: 'Navigointi',
    account: 'Oma tili',
    companyAccount: 'Yritystili',
    profile: 'Profiili',
    listings: 'Ilmoitukset',
    createListing: 'Luo ilmoitus',
    editListing: 'Muokkaa ilmoitusta',
    savedListings: 'Tallennetut ilmoitukset',
    savedSearches: 'Tallennetut haut',
    messages: 'Viestit',
    payments: 'Maksut',
    reviews: 'Arvostelut',
    settings: 'Asetukset',
    support: 'Ohje',
    companyProfile: 'Yritysprofiili',
    companyListings: 'Varasto',
    companyListingCreate: 'Uusi ilmoitus',
    companyImport: 'Tuonti',
    companyAnalytics: 'Analytiikka',
    companySubscription: 'Tilaukset',
  },
  da: {
    breadcrumbs: 'Navigation',
    account: 'Min konto',
    companyAccount: 'Firmakonto',
    profile: 'Profil',
    listings: 'Annoncer',
    createListing: 'Opret annonce',
    editListing: 'Rediger annonce',
    savedListings: 'Gemte annoncer',
    savedSearches: 'Gemte søgninger',
    messages: 'Beskeder',
    payments: 'Betalinger',
    reviews: 'Anmeldelser',
    settings: 'Indstillinger',
    support: 'Hjælp',
    companyProfile: 'Firmaprofil',
    companyListings: 'Lager',
    companyListingCreate: 'Ny annonce',
    companyTeam: 'Team',
    companyAnalytics: 'Analyse',
    companySubscription: 'Abonnementer',
  },
}

function accountBreadcrumbCopy(locale: PublicLocale): BreadcrumbCopy {
  const normalized = translationLocale(locale) as BreadcrumbLocale
  return { ...englishBreadcrumbs, ...localizedBreadcrumbs[normalized] }
}

export function AccountBreadcrumbs({
  locale,
  items,
  className = '',
}: {
  locale: PublicLocale
  items: AccountBreadcrumbItem[]
  className?: string
}) {
  const copy = accountBreadcrumbCopy(locale)

  return (
    <nav aria-label={copy.breadcrumbs} className={className}>
      <ol className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#667085]">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          const label = copy[item.key]

          return (
            <li key={`${item.key}-${index}`} className="flex min-w-0 items-center gap-2">
              {index > 0 ? <ChevronRight className="h-4 w-4 shrink-0 text-[#98a2b3]" aria-hidden="true" /> : null}
              {item.href && !isLast ? (
                <Link
                  href={localizePublicHref(locale, item.href)}
                  className="min-w-0 truncate font-semibold text-[#475467] transition hover:text-[#0866ff]"
                >
                  {label}
                </Link>
              ) : (
                <span
                  className={isLast ? 'min-w-0 truncate font-semibold text-[#101828]' : 'min-w-0 truncate font-semibold text-[#475467]'}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
