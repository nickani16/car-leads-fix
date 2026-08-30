'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  ArrowRight,
  Bookmark,
  Building2,
  CarFront,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  CircleUserRound,
  CreditCard,
  FilePlus2,
  Heart,
  Handshake,
  LogOut,
  Mail,
  MessageSquareText,
  Newspaper,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Store,
  UserRound,
  X,
  type LucideIcon,
} from 'lucide-react'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import { shouldUseDarkFloatingGlass } from '@/lib/floating-glass-tone'
import BrandLogo from './BrandLogo'
import { autorellCategoryIcons } from './AutorellCategoryIcons'
import { FlagIcon, MarketSelectorModal } from './PublicFooter'
import SiteSearch from './SiteSearch'
import { euBuyerMarkets } from '@/lib/eu-buyer-markets'
import {
  categorySearchPath,
  isLeasingMarketplaceCategory,
  marketplaceCategories,
  marketplaceLanguage,
  type MarketplaceCategorySlug,
} from '@/lib/marketplace'
import {
  applyMarketplaceSearchModeParams,
  type MarketplaceSearchMode,
} from '@/lib/marketplace-search-seo'
import {
  categoryLandingMenuHref,
  getCategoryLanding,
  localizeCategoryLanding,
} from '@/lib/category-landings'
import {
  localizePublicHref,
  stripLocalePrefix,
  translatePublic,
  translatePublicObject,
  type PublicLocale,
} from '@/lib/public-client-i18n'
import { fetchSavedListingIds, SAVED_LISTINGS_KEY } from '@/lib/saved-listings'
import { usePreferredHomeHref } from './preferred-home-category'
import {
  fetchSavedSearchCount,
  readSavedSearchCount,
  SAVED_SEARCHES_EVENT,
} from '@/lib/saved-searches'
import { createClient } from '@/lib/supabase/client'
import { translateListingVehicleValue } from '@/lib/listing-display'
import { marketplaceBodyTypeOptions } from '@/lib/marketplace-body-types'
import AuthModal from './AuthModal'
import HeaderNotificationCenter from './HeaderNotificationCenter'
import IncompleteProfilePrompt from './IncompleteProfilePrompt'

type AuthView = 'login' | 'register' | 'forgot' | 'reset'

type PublicHeaderProps = {
  transparentAtTop?: boolean
  locale?: PublicLocale
  marketplaceChannel?: {
    label: string
    slug: string
  }
  marketplaceResultsPage?: boolean
  marketplaceMode?: MarketplaceSearchMode
  marketCode?: string
  hideOnMobile?: boolean
  lockMobileBottomNav?: boolean
  hideMobileBottomNav?: boolean
}

type MenuItem = {
  href: string
  label: string
  description: string
  icon: LucideIcon
  slug?: MarketplaceCategorySlug
  requiresLogin?: boolean
}

type DesktopSearchMenuCopy = {
  title: string
  intro: string
  personal: string
  work: string
  viewAll: string
  back: string
  browseTypes: string
  viewCategory: string
}

const desktopSearchMenuCopy: Record<PublicLocale, DesktopSearchMenuCopy> = {
  sv: {
    title: 'Hitta fordon',
    intro: 'Gå direkt till våra mest populära fordonskategorier.',
    personal: 'Person & fritid',
    work: 'Transport & arbete',
    viewAll: 'Visa alla fordon',
    back: 'Tillbaka',
    browseTypes: 'Utforska efter typ',
    viewCategory: 'Visa alla i kategorin',
  },
  en: {
    title: 'Find vehicles',
    intro: 'Go straight to our most popular vehicle categories.',
    personal: 'Cars & leisure',
    work: 'Transport & work',
    viewAll: 'View all vehicles',
    back: 'Back',
    browseTypes: 'Browse by type',
    viewCategory: 'View all in this category',
  },
  de: {
    title: 'Fahrzeuge finden',
    intro: 'Direkt zu unseren beliebtesten Fahrzeugkategorien.',
    personal: 'Pkw & Freizeit',
    work: 'Transport & Gewerbe',
    viewAll: 'Alle Fahrzeuge anzeigen',
    back: 'Zurück',
    browseTypes: 'Nach Typ durchsuchen',
    viewCategory: 'Alle in dieser Kategorie anzeigen',
  },
  at: {
    title: 'Fahrzeuge finden',
    intro: 'Direkt zu unseren beliebtesten Fahrzeugkategorien.',
    personal: 'Pkw & Freizeit',
    work: 'Transport & Gewerbe',
    viewAll: 'Alle Fahrzeuge anzeigen',
    back: 'Zurück',
    browseTypes: 'Nach Typ durchsuchen',
    viewCategory: 'Alle in dieser Kategorie anzeigen',
  },
  fr: {
    title: 'Trouver un véhicule',
    intro: 'Accédez directement à nos catégories de véhicules les plus populaires.',
    personal: 'Auto & loisirs',
    work: 'Transport & activité',
    viewAll: 'Voir tous les véhicules',
    back: 'Retour',
    browseTypes: 'Parcourir par type',
    viewCategory: 'Voir tous les véhicules de cette catégorie',
  },
  es: {
    title: 'Encontrar vehículos',
    intro: 'Accede directamente a nuestras categorías de vehículos más populares.',
    personal: 'Coches y ocio',
    work: 'Transporte y trabajo',
    viewAll: 'Ver todos los vehículos',
    back: 'Volver',
    browseTypes: 'Explorar por tipo',
    viewCategory: 'Ver todos los vehículos de esta categoría',
  },
  it: {
    title: 'Trova veicoli',
    intro: 'Vai direttamente alle nostre categorie di veicoli più popolari.',
    personal: 'Auto e tempo libero',
    work: 'Trasporto e lavoro',
    viewAll: 'Vedi tutti i veicoli',
    back: 'Indietro',
    browseTypes: 'Sfoglia per tipo',
    viewCategory: 'Vedi tutti i veicoli della categoria',
  },
  nl: {
    title: 'Voertuigen vinden',
    intro: 'Ga direct naar onze populairste voertuigcategorieën.',
    personal: 'Auto & vrije tijd',
    work: 'Transport & werk',
    viewAll: 'Alle voertuigen bekijken',
    back: 'Terug',
    browseTypes: 'Bekijk per type',
    viewCategory: 'Bekijk alle voertuigen in deze categorie',
  },
  be: {
    title: 'Voertuigen vinden',
    intro: 'Ga direct naar onze populairste voertuigcategorieën.',
    personal: 'Auto & vrije tijd',
    work: 'Transport & werk',
    viewAll: 'Alle voertuigen bekijken',
    back: 'Terug',
    browseTypes: 'Bekijk per type',
    viewCategory: 'Bekijk alle voertuigen in deze categorie',
  },
  pl: {
    title: 'Znajdź pojazd',
    intro: 'Przejdź bezpośrednio do najpopularniejszych kategorii pojazdów.',
    personal: 'Samochody i rekreacja',
    work: 'Transport i praca',
    viewAll: 'Zobacz wszystkie pojazdy',
    back: 'Wróć',
    browseTypes: 'Przeglądaj według typu',
    viewCategory: 'Zobacz wszystkie pojazdy w tej kategorii',
  },
  da: {
    title: 'Find køretøjer',
    intro: 'Gå direkte til vores mest populære køretøjskategorier.',
    personal: 'Bil & fritid',
    work: 'Transport & arbejde',
    viewAll: 'Se alle køretøjer',
    back: 'Tilbage',
    browseTypes: 'Se efter type',
    viewCategory: 'Se alle køretøjer i kategorien',
  },
  fi: {
    title: 'Löydä ajoneuvo',
    intro: 'Siirry suoraan suosituimpiin ajoneuvoluokkiimme.',
    personal: 'Autot ja vapaa-aika',
    work: 'Kuljetus ja työ',
    viewAll: 'Näytä kaikki ajoneuvot',
    back: 'Takaisin',
    browseTypes: 'Selaa tyypin mukaan',
    viewCategory: 'Näytä kaikki kategorian ajoneuvot',
  },
}

type HeaderAccount = {
  authenticated: boolean
  displayName?: string
  accountType?: 'private' | 'business' | null
  isAdmin?: boolean
  profileComplete?: boolean
  unreadMessages: number
  conversationCount: number
}

const HEADER_ACCOUNT_CACHE_KEY = 'autorell-header-account'

const emptyHeaderAccount: HeaderAccount = {
  authenticated: false,
  unreadMessages: 0,
  conversationCount: 0,
}

function readCachedHeaderAccount(): HeaderAccount {
  if (typeof window === 'undefined') return emptyHeaderAccount
  const globalAccount = window.__autorellHeaderAccount
  if (globalAccount) {
    return {
      ...emptyHeaderAccount,
      ...globalAccount,
      accountType:
        globalAccount.accountType === 'private' || globalAccount.accountType === 'business'
          ? globalAccount.accountType
          : null,
    }
  }
  try {
    const cached = window.sessionStorage.getItem(HEADER_ACCOUNT_CACHE_KEY)
    if (!cached) return emptyHeaderAccount
    const parsed = JSON.parse(cached) as Partial<HeaderAccount>
    return {
      ...emptyHeaderAccount,
      ...parsed,
      accountType:
        parsed.accountType === 'private' || parsed.accountType === 'business'
          ? parsed.accountType
          : null,
    }
  } catch {
    return emptyHeaderAccount
  }
}

function cacheHeaderAccount(account: HeaderAccount) {
  if (typeof window === 'undefined') return
  window.__autorellHeaderAccount = account
  try {
    window.sessionStorage.setItem(HEADER_ACCOUNT_CACHE_KEY, JSON.stringify(account))
  } catch {
    // Session storage can be blocked in strict browser modes; the in-memory cache still works.
  }
}

function localeFromPathname(pathname: string): PublicLocale {
  const first = pathname.split('/').filter(Boolean)[0]
  if (first === 'se') return 'sv'
  if (first === 'de') return 'de'
  if (first === 'at') return 'at'
  if (first === 'be') return 'be'
  const market = euBuyerMarkets.find((item) => item.code === first)
  if (market) return market.language as PublicLocale
  if (
    [
      'en',
      'at',
      'be',
      'fr',
      'es',
      'it',
      'pl',
      'nl',
      'fi',
      'da',
    ].includes(first)
  ) {
    return first as PublicLocale
  }
  return 'en'
}

const copy = {
  sv: {
    home: 'Start',
    buy: 'Köp',
    sell: 'Sälj',
    business: 'Företag',
    about: 'Om Autorell',
    help: 'Hjälp',
    contact: 'Kontakt',
    reportAbuse: 'Rapportera missbruk',
    more: 'Mer',
    faq: 'Vanliga frågor',
    terms: 'Användarvillkor',
    privacy: 'Integritet',
    saved: 'Sparade',
    search: 'Sök',
    messages: 'Meddelanden',
    notificationsShort: 'Notis',
    hello: 'Hej',
    myAutorell: 'Mitt Konto',
    profileNav: 'Min profil',
    menu: 'Meny',
    register: 'Registrera',
    signIn: 'Logga in',
    createAccount: 'Skapa konto',
    closeMenu: 'Stäng meny',
    openMenu: 'Öppna meny',
    chooseLanguage: 'Välj marknad',
    shopByCategory: 'Köp efter kategori',
    buyTitle: 'Hitta rätt fordon i hela Europa.',
    buyText: 'Sök bland annonser från privatpersoner och företag på en samlad europeisk marknadsplats.',
    allCategoriesLabel: 'Visa alla kategorier',
    allCategoriesText: 'Utforska alla fordonskategorier på ett ställe.',
    verifiedSellers: 'Verifierade säljare',
    verifiedSellersText: 'Alla säljare kontrolleras för din trygghet.',
    securePayments: 'Tryggare betalningar',
    securePaymentsText: 'Dina betalningar är skyddade.',
    support24: 'Support när du behöver det',
    support24Text: 'Vi hjälper dig i varje steg.',
    sellTitle: 'Publicera på Europas fordonsmarknad.',
    sellText: 'Skapa en tydlig annons och nå köpare i flera europeiska länder.',
    businessTitle: 'Verktyg för professionella säljare.',
    businessText: 'Publicera lager, hantera annonser och samla förfrågningar på ett ställe.',
    buyCta: 'Utforska alla fordon',
    sellCta: 'Lägg upp annons',
    businessCta: 'Se företagslösningar',
    mobileCta: 'Lägg upp ett fordon',
  },
  en: {
    home: 'Home',
    buy: 'Buy',
    sell: 'Sell',
    business: 'Business',
    about: 'About Autorell',
    help: 'Help',
    contact: 'Contact',
    reportAbuse: 'Report abuse',
    more: 'More',
    faq: 'Frequently asked questions',
    terms: 'Terms of use',
    privacy: 'Privacy',
    saved: 'Saved',
    search: 'Search',
    messages: 'Messages',
    notificationsShort: 'Alerts',
    hello: 'Hi',
    myAutorell: 'My Account',
    profileNav: 'My profile',
    menu: 'Menu',
    register: 'Register',
    signIn: 'Log in',
    createAccount: 'Create account',
    closeMenu: 'Close menu',
    openMenu: 'Open menu',
    chooseLanguage: 'Choose market',
    shopByCategory: 'Shop by category',
    buyTitle: 'Find the right vehicle across Europe.',
    buyText: 'Browse listings from private and business sellers in one European marketplace.',
    allCategoriesLabel: 'View all categories',
    allCategoriesText: 'Explore all vehicle categories in one place.',
    verifiedSellers: 'Verified sellers',
    verifiedSellersText: 'All sellers are verified for your safety.',
    securePayments: 'Secure payments',
    securePaymentsText: 'Your payments are protected.',
    support24: '24/7 support',
    support24Text: 'We are here to help at every step.',
    sellTitle: "List on Europe's vehicle marketplace.",
    sellText: 'Create a clear listing and reach buyers across multiple European countries.',
    businessTitle: 'Tools for professional sellers.',
    businessText: 'Publish inventory, manage listings and collect enquiries in one place.',
    buyCta: 'Explore all vehicles',
    sellCta: 'Create a listing',
    businessCta: 'Explore business solutions',
    mobileCta: 'List a vehicle',
  },
  de: {
    home: 'Start',
    buy: 'Kaufen',
    sell: 'Verkaufen',
    business: 'Firmen',
    about: 'Über Autorell',
    help: 'Hilfe',
    contact: 'Kontakt',
    reportAbuse: 'Missbrauch melden',
    more: 'Mehr',
    faq: 'Häufige Fragen',
    terms: 'Nutzungsbedingungen',
    privacy: 'Datenschutz',
    saved: 'Gespeichert',
    search: 'Suche',
    messages: 'Nachrichten',
    notificationsShort: 'Notiz',
    hello: 'Hallo',
    myAutorell: 'Mein Konto',
    profileNav: 'Mein Profil',
    menu: 'Menü',
    register: 'Registrieren',
    signIn: 'Anmelden',
    createAccount: 'Konto erstellen',
    closeMenu: 'Menü schließen',
    openMenu: 'Menü öffnen',
    chooseLanguage: 'Markt wählen',
    shopByCategory: 'Nach Kategorie kaufen',
    buyTitle: 'Das passende Fahrzeug in Europa finden.',
    buyText: 'Anzeigen von privaten und gewerblichen Verkäufern auf einem europäischen Marktplatz durchsuchen.',
    allCategoriesLabel: 'Alle Kategorien anzeigen',
    allCategoriesText: 'Alle Fahrzeugkategorien an einem Ort entdecken.',
    verifiedSellers: 'Verifizierte Verkäufer',
    verifiedSellersText: 'Alle Verkäufer werden zu Ihrer Sicherheit geprüft.',
    securePayments: 'Sichere Zahlungen',
    securePaymentsText: 'Ihre Zahlungen sind geschützt.',
    support24: 'Support bei jedem Schritt',
    support24Text: 'Wir helfen Ihnen jederzeit weiter.',
    sellTitle: 'Auf Europas Fahrzeugmarktplatz inserieren.',
    sellText: 'Eine klare Anzeige erstellen und Käufer in mehreren europäischen Ländern erreichen.',
    businessTitle: 'Werkzeuge für professionelle Verkäufer.',
    businessText: 'Bestand veröffentlichen, Anzeigen verwalten und Anfragen an einem Ort bündeln.',
    buyCta: 'Alle Fahrzeuge entdecken',
    sellCta: 'Anzeige erstellen',
    businessCta: 'Unternehmenslösungen ansehen',
    mobileCta: 'Fahrzeug inserieren',
  },
} as const

const sellerItems: Record<'sv' | 'en' | 'de', MenuItem[]> = {
  sv: [
    { href: '/account/listings/new', label: 'Annonsera fordon på Autorell', description: 'Gratis att komma igång för privatpersoner och företag.', icon: CarFront, requiresLogin: true },
    { href: '/help-center/payment/private-listing-prices', label: 'Pris för att annonsera fordon', description: 'Du betalar bara för längre annonstid och extra synlighet.', icon: Store },
    { href: '/help-center', label: 'Hur det fungerar', description: 'Skapa annons, ta emot kontakt och sälj tryggt.', icon: CircleHelp },
  ],
  en: [
    { href: '/account/listings/new', label: 'Advertise vehicles on Autorell', description: 'Free to start for private and business sellers.', icon: CarFront, requiresLogin: true },
    { href: '/help-center/payment/private-listing-prices', label: 'Pricing', description: 'Pay only for longer listing time and extra visibility.', icon: Store },
    { href: '/help-center', label: 'How it works', description: 'Create a listing, receive enquiries and sell safely.', icon: CircleHelp },
  ],
  de: [
    { href: '/account/listings/new', label: 'Fahrzeug auf Autorell inserieren', description: 'Kostenlos starten für private und gewerbliche Verkäufer.', icon: CarFront, requiresLogin: true },
    { href: '/help-center/payment/private-listing-prices', label: 'Preise', description: 'Nur längere Laufzeit und mehr Sichtbarkeit kosten extra.', icon: Store },
    { href: '/help-center', label: 'So geht’s', description: 'Anzeige erstellen, Anfragen erhalten und sicher verkaufen.', icon: CircleHelp },
  ],
}

const sellToDealerMenuCopy: Record<PublicLocale, { label: string; description: string }> = {
  sv: { label: 'Sälj till en handlare', description: 'Skicka fordonsuppgifter och få bud från anslutna handlare.' },
  en: { label: 'Sell to a dealer', description: 'Share your vehicle details and receive offers from connected dealers.' },
  de: { label: 'An einen Händler verkaufen', description: 'Fahrzeugdaten senden und Angebote von angeschlossenen Händlern erhalten.' },
  at: { label: 'An einen Händler verkaufen', description: 'Fahrzeugdaten senden und Angebote von angeschlossenen Händlern erhalten.' },
  be: { label: 'Verkopen aan een dealer', description: 'Deel je voertuiggegevens en ontvang biedingen van aangesloten dealers.' },
  fr: { label: 'Vendre à un professionnel', description: 'Envoyez les informations du véhicule et recevez des offres de professionnels partenaires.' },
  es: { label: 'Vender a un concesionario', description: 'Envía los datos del vehículo y recibe ofertas de concesionarios asociados.' },
  it: { label: 'Vendi a un concessionario', description: 'Invia i dati del veicolo e ricevi offerte dai concessionari aderenti.' },
  pl: { label: 'Sprzedaj dealerowi', description: 'Prześlij dane pojazdu i otrzymuj oferty od współpracujących dealerów.' },
  nl: { label: 'Verkopen aan een dealer', description: 'Deel je voertuiggegevens en ontvang biedingen van aangesloten dealers.' },
  fi: { label: 'Myy autoliikkeelle', description: 'Lähetä ajoneuvon tiedot ja vastaanota tarjouksia mukana olevilta autoliikkeiltä.' },
  da: { label: 'Sælg til en forhandler', description: 'Send køretøjets oplysninger og modtag bud fra tilknyttede forhandlere.' },
}

const businessMenuCopy: Record<
  PublicLocale,
  {
    solutionsLabel: string
    solutionsDescription: string
    plansLabel: string
    plansDescription: string
    inventoryLabel: string
    inventoryDescription: string
    dealerOffersLabel: string
    dealerOffersDescription: string
    integrationsLabel: string
    integrationsDescription: string
    businessHelpLabel: string
    businessHelpDescription: string
  }
> = {
  sv: {
    solutionsLabel: 'Handlarlösningar',
    solutionsDescription: 'Verktyg för handlare och återkommande professionella säljare.',
    plansLabel: 'Planer',
    plansDescription: 'Jämför företagsplaner och vad som ingår.',
    inventoryLabel: 'Lager & annonser',
    inventoryDescription: 'Svar om lager, aktiva annonser, status och uppföljning.',
    dealerOffersLabel: 'Köp bilar / Dealer Offers',
    dealerOffersDescription: 'Så hittar företag fordon och hanterar dealerförfrågningar.',
    integrationsLabel: 'Integrationer',
    integrationsDescription: 'Import, lagerflöden och tekniska kopplingar till Autorell.',
    businessHelpLabel: 'Företagshjälp',
    businessHelpDescription: 'Hjälp med konto, planer, annonser och företagsärenden.',
  },
  en: {
    solutionsLabel: 'Dealer solutions',
    solutionsDescription: 'Tools for dealers and recurring professional sellers.',
    plansLabel: 'Plans',
    plansDescription: 'Compare business plans and what is included.',
    inventoryLabel: 'Inventory & listings',
    inventoryDescription: 'Answers about stock, active listings, status and follow-up.',
    dealerOffersLabel: 'Buy cars / Dealer Offers',
    dealerOffersDescription: 'How companies find vehicles and handle dealer enquiries.',
    integrationsLabel: 'Integrations',
    integrationsDescription: 'Imports, inventory feeds and technical connections to Autorell.',
    businessHelpLabel: 'Business help',
    businessHelpDescription: 'Help with accounts, plans, listings and business cases.',
  },
  de: {
    solutionsLabel: 'Händlerlösungen',
    solutionsDescription: 'Werkzeuge für Händler und regelmäßig aktive gewerbliche Verkäufer.',
    plansLabel: 'Tarife',
    plansDescription: 'Unternehmenstarife und enthaltene Leistungen vergleichen.',
    inventoryLabel: 'Bestand & Anzeigen',
    inventoryDescription: 'Antworten zu Bestand, aktiven Anzeigen, Status und Nachverfolgung.',
    dealerOffersLabel: 'Autos kaufen / Dealer Offers',
    dealerOffersDescription: 'Wie Unternehmen Fahrzeuge finden und Händleranfragen bearbeiten.',
    integrationsLabel: 'Integrationen',
    integrationsDescription: 'Importe, Bestandsfeeds und technische Anbindungen an Autorell.',
    businessHelpLabel: 'Unternehmenshilfe',
    businessHelpDescription: 'Hilfe zu Konto, Tarifen, Anzeigen und Unternehmensfällen.',
  },
  at: {
    solutionsLabel: 'Händlerlösungen',
    solutionsDescription: 'Werkzeuge für Händler und regelmäßig aktive gewerbliche Verkäufer.',
    plansLabel: 'Tarife',
    plansDescription: 'Unternehmenstarife und enthaltene Leistungen vergleichen.',
    inventoryLabel: 'Bestand & Anzeigen',
    inventoryDescription: 'Antworten zu Bestand, aktiven Anzeigen, Status und Nachverfolgung.',
    dealerOffersLabel: 'Autos kaufen / Dealer Offers',
    dealerOffersDescription: 'Wie Unternehmen Fahrzeuge finden und Händleranfragen bearbeiten.',
    integrationsLabel: 'Integrationen',
    integrationsDescription: 'Importe, Bestandsfeeds und technische Anbindungen an Autorell.',
    businessHelpLabel: 'Unternehmenshilfe',
    businessHelpDescription: 'Hilfe zu Konto, Tarifen, Anzeigen und Unternehmensfällen.',
  },
  be: {
    solutionsLabel: 'Dealeroplossingen',
    solutionsDescription: 'Tools voor dealers en professionele verkopers met een terugkerend aanbod.',
    plansLabel: 'Abonnementen',
    plansDescription: 'Vergelijk zakelijke abonnementen en wat inbegrepen is.',
    inventoryLabel: 'Voorraad & advertenties',
    inventoryDescription: 'Antwoorden over voorraad, actieve advertenties, status en opvolging.',
    dealerOffersLabel: 'Auto’s kopen / Dealer Offers',
    dealerOffersDescription: 'Hoe bedrijven voertuigen vinden en dealerreacties behandelen.',
    integrationsLabel: 'Integraties',
    integrationsDescription: 'Import, voorraadfeeds en technische koppelingen met Autorell.',
    businessHelpLabel: 'Hulp voor bedrijven',
    businessHelpDescription: 'Hulp bij accounts, plannen, advertenties en zakelijke vragen.',
  },
  fr: {
    solutionsLabel: 'Solutions pour professionnels',
    solutionsDescription: 'Outils pour les professionnels de l’automobile et les vendeurs réguliers.',
    plansLabel: 'Formules',
    plansDescription: 'Comparez les formules professionnelles et leurs services inclus.',
    inventoryLabel: 'Stock et annonces',
    inventoryDescription: 'Réponses sur stock, annonces actives, statuts et suivi.',
    dealerOffersLabel: 'Acheter / Dealer Offers',
    dealerOffersDescription: 'Comment les entreprises trouvent des véhicules et traitent les demandes.',
    integrationsLabel: 'Intégrations',
    integrationsDescription: 'Imports, flux de stock et connexions techniques à Autorell.',
    businessHelpLabel: 'Aide aux entreprises',
    businessHelpDescription: 'Aide pour comptes, offres, annonces et dossiers professionnels.',
  },
  es: {
    solutionsLabel: 'Soluciones para concesionarios',
    solutionsDescription: 'Herramientas para concesionarios y vendedores profesionales habituales.',
    plansLabel: 'Planes',
    plansDescription: 'Compara los planes para empresas y todo lo que incluyen.',
    inventoryLabel: 'Inventario y anuncios',
    inventoryDescription: 'Respuestas sobre inventario, anuncios activos, estados y seguimiento.',
    dealerOffersLabel: 'Comprar coches / Dealer Offers',
    dealerOffersDescription: 'Cómo las empresas encuentran vehículos y gestionan consultas.',
    integrationsLabel: 'Integraciones',
    integrationsDescription: 'Importaciones, feeds e integraciones técnicas con Autorell.',
    businessHelpLabel: 'Ayuda para empresas',
    businessHelpDescription: 'Ayuda con cuentas, planes, anuncios y casos de empresa.',
  },
  it: {
    solutionsLabel: 'Soluzioni per concessionari',
    solutionsDescription: 'Strumenti per concessionari e venditori professionali abituali.',
    plansLabel: 'Piani',
    plansDescription: 'Confronta i piani aziendali e i servizi inclusi.',
    inventoryLabel: 'Inventario e annunci',
    inventoryDescription: 'Risposte su inventario, annunci attivi, stati e follow-up.',
    dealerOffersLabel: 'Acquisto auto / Dealer Offers',
    dealerOffersDescription: 'Come le aziende trovano veicoli e gestiscono richieste dealer.',
    integrationsLabel: 'Integrazioni',
    integrationsDescription: 'Import, feed inventario e collegamenti tecnici con Autorell.',
    businessHelpLabel: 'Aiuto per aziende',
    businessHelpDescription: 'Aiuto con account, piani, annunci e casi aziendali.',
  },
  pl: {
    solutionsLabel: 'Rozwiązania dla dealerów',
    solutionsDescription: 'Narzędzia dla dealerów i regularnych sprzedawców profesjonalnych.',
    plansLabel: 'Plany',
    plansDescription: 'Porównaj plany firmowe i ich zakres.',
    inventoryLabel: 'Zapasy i ogłoszenia',
    inventoryDescription: 'Odpowiedzi o zapasach, aktywnych ogłoszeniach, statusie i kontroli.',
    dealerOffersLabel: 'Zakup aut / Dealer Offers',
    dealerOffersDescription: 'Jak firmy znajdują pojazdy i obsługują zapytania dealerów.',
    integrationsLabel: 'Integracje',
    integrationsDescription: 'Import, feedy zapasów i połączenia techniczne z Autorell.',
    businessHelpLabel: 'Pomoc dla firm',
    businessHelpDescription: 'Pomoc przy kontach, planach, ogłoszeniach i sprawach firmowych.',
  },
  nl: {
    solutionsLabel: 'Dealeroplossingen',
    solutionsDescription: 'Tools voor dealers en professionele verkopers met een terugkerend aanbod.',
    plansLabel: 'Abonnementen',
    plansDescription: 'Vergelijk zakelijke abonnementen en wat inbegrepen is.',
    inventoryLabel: 'Voorraad & advertenties',
    inventoryDescription: 'Antwoorden over voorraad, actieve advertenties, status en opvolging.',
    dealerOffersLabel: 'Auto’s kopen / Dealer Offers',
    dealerOffersDescription: 'Hoe bedrijven voertuigen vinden en dealerreacties behandelen.',
    integrationsLabel: 'Integraties',
    integrationsDescription: 'Import, voorraadfeeds en technische koppelingen met Autorell.',
    businessHelpLabel: 'Hulp voor bedrijven',
    businessHelpDescription: 'Hulp bij accounts, plannen, advertenties en zakelijke vragen.',
  },
  fi: {
    solutionsLabel: 'Ratkaisut autoliikkeille',
    solutionsDescription: 'Työkalut autoliikkeille ja säännöllisesti myyville ammattilaisille.',
    plansLabel: 'Paketit',
    plansDescription: 'Vertaa yrityspaketteja ja niihin sisältyviä palveluja.',
    inventoryLabel: 'Varasto ja ilmoitukset',
    inventoryDescription: 'Vastauksia varastosta, aktiivisista ilmoituksista, tilasta ja seurannasta.',
    dealerOffersLabel: 'Autojen osto / Dealer Offers',
    dealerOffersDescription: 'Näin yritykset löytävät ajoneuvoja ja käsittelevät liikkeiden kyselyjä.',
    integrationsLabel: 'Integraatiot',
    integrationsDescription: 'Tuonnit, varastosyötteet ja tekniset yhteydet Autorelliin.',
    businessHelpLabel: 'Yritysapu',
    businessHelpDescription: 'Apua tileihin, paketteihin, ilmoituksiin ja yritysasioihin.',
  },
  da: {
    solutionsLabel: 'Forhandlerløsninger',
    solutionsDescription: 'Værktøjer til forhandlere og professionelle sælgere med løbende salg.',
    plansLabel: 'Abonnementer',
    plansDescription: 'Sammenlign virksomhedsabonnementer og deres indhold.',
    inventoryLabel: 'Lager og annoncer',
    inventoryDescription: 'Svar om lager, aktive annoncer, status og opfølgning.',
    dealerOffersLabel: 'Køb biler / Dealer Offers',
    dealerOffersDescription: 'Sådan finder virksomheder køretøjer og håndterer forhandlerforespørgsler.',
    integrationsLabel: 'Integrationer',
    integrationsDescription: 'Import, lagerfeeds og tekniske forbindelser til Autorell.',
    businessHelpLabel: 'Virksomhedshjælp',
    businessHelpDescription: 'Hjælp til konto, planer, annoncer og virksomhedssager.',
  },
}

export default function PublicHeader({
  locale: providedLocale,
  marketplaceChannel,
  marketplaceResultsPage = false,
  marketplaceMode = 'all',
  marketCode,
  hideOnMobile = false,
  lockMobileBottomNav = false,
  hideMobileBottomNav = false,
}: PublicHeaderProps) {
  const pathname = usePathname()
  const locale = providedLocale || localeFromPathname(pathname)
  const unprefixedPathname = stripLocalePrefix(pathname)
  const isMarketplaceRoute =
    pathname === '/marketplace' ||
    pathname.includes('/marketplace/') ||
    pathname.endsWith('/marketplace') ||
    unprefixedPathname === '/marketplace' ||
    unprefixedPathname.startsWith('/marketplace/')
  const keepMobileBottomNavVisible = lockMobileBottomNav || marketplaceResultsPage || isMarketplaceRoute
  const language = marketplaceLanguage(locale)
  const t =
    locale === 'sv' || locale === 'de' || locale === 'en'
      ? copy[language]
      : translatePublicObject(locale, copy.en)
  const publicLabel = (en: string, sv: string, de?: string) => {
    if (locale === 'sv') return sv
    if (locale === 'de') return de || en
    return locale === 'en' ? en : translatePublic(locale, en)
  }
  const mobileSavedSearchesLabel = (() => {
    const labels: Partial<Record<PublicLocale, string>> = {
      sv: 'Sökningar',
      en: 'Searches',
      de: 'Suchen',
      at: 'Suchen',
      fr: 'Recherches',
      es: 'Búsquedas',
      it: 'Ricerche',
      nl: 'Zoeken',
      be: 'Zoeken',
      pl: 'Wyszuk.',
      da: 'Søgninger',
      fi: 'Haut',
    }
    return labels[locale] || 'Searches'
  })()
  const [open, setOpen] = useState(false)
  const [marketSelectorOpen, setMarketSelectorOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login')
  const [authInitialView, setAuthInitialView] = useState<AuthView>('login')
  const [authDestination, setAuthDestination] = useState<string | undefined>()
  const [authBusinessRegistration, setAuthBusinessRegistration] = useState(false)
  const [headerAccount, setHeaderAccount] = useState<HeaderAccount>(emptyHeaderAccount)
  const [headerAccountResolved, setHeaderAccountResolved] = useState(false)
  const [activePathname, setActivePathname] = useState('')
  const [savedListingCount, setSavedListingCount] = useState(0)
  const [savedSearchCount, setSavedSearchCount] = useState(0)
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(false)
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [searchMenuOpen, setSearchMenuOpen] = useState(false)
  const [desktopSearchCategory, setDesktopSearchCategory] = useState<MarketplaceCategorySlug | null>(null)
  const [desktopSearchMotion, setDesktopSearchMotion] = useState<'idle' | 'forward' | 'back'>('idle')
  const [searchMenuIntent, setSearchMenuIntent] = useState<MarketplaceSearchMode>(marketplaceMode)
  const [sellMenuOpen, setSellMenuOpen] = useState(false)
  const [businessMenuOpen, setBusinessMenuOpen] = useState(false)
  const [helpMenuOpen, setHelpMenuOpen] = useState(false)
  const [mobileSellMenuOpen, setMobileSellMenuOpen] = useState(false)
  const [mobileBusinessMenuOpen, setMobileBusinessMenuOpen] = useState(false)
  const [mobileHelpMenuOpen, setMobileHelpMenuOpen] = useState(false)
  const [visible, setVisible] = useState(true)
  const [atPageTop, setAtPageTop] = useState(true)
  const [mobileNavOverMedia, setMobileNavOverMedia] = useState(false)
  const lastScrollY = useRef(0)
  const profileMenuRef = useRef<HTMLDivElement | null>(null)
  const searchMenuRef = useRef<HTMLDivElement | null>(null)
  const sellMenuRef = useRef<HTMLDivElement | null>(null)
  const businessMenuRef = useRef<HTMLDivElement | null>(null)
  const helpMenuRef = useRef<HTMLDivElement | null>(null)
  const mobileBottomNavRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const difference = currentScrollY - lastScrollY.current
      const nearPageBottom =
        currentScrollY + window.innerHeight >= document.documentElement.scrollHeight - 160
      setAtPageTop(currentScrollY < 8)

      if (isMarketplaceRoute) {
        if (currentScrollY < 10) {
          setVisible(true)
        } else {
          setVisible(false)
          setOpen(false)
          setMarketSelectorOpen(false)
          setMobileCategoryOpen(false)
          setMobileMoreOpen(false)
          setSearchMenuOpen(false)
          setSellMenuOpen(false)
          setBusinessMenuOpen(false)
          setHelpMenuOpen(false)
          setMobileSellMenuOpen(false)
          setMobileBusinessMenuOpen(false)
          setMobileHelpMenuOpen(false)
        }
        lastScrollY.current = currentScrollY
        return
      }

      if (currentScrollY < 10 || nearPageBottom) setVisible(true)
      else if (difference > 1) {
        setVisible(false)
        setOpen(false)
        setMarketSelectorOpen(false)
        setMobileCategoryOpen(false)
        setMobileMoreOpen(false)
        setSearchMenuOpen(false)
        setSellMenuOpen(false)
        setBusinessMenuOpen(false)
        setHelpMenuOpen(false)
        setMobileSellMenuOpen(false)
        setMobileBusinessMenuOpen(false)
        setMobileHelpMenuOpen(false)
      } else if (difference < -1) setVisible(true)

      lastScrollY.current = currentScrollY
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isMarketplaceRoute])

  useEffect(() => {
    if (typeof document === 'undefined') return

    const root = document.documentElement
    const mobileNavVisible =
      !hideMobileBottomNav &&
      (keepMobileBottomNavVisible || visible || open || mobileCategoryOpen || mobileMoreOpen)

    root.style.setProperty('--autorell-mobile-footer-reserve', mobileNavVisible ? '5.5rem' : '4.75rem')
    return () => {
      root.style.removeProperty('--autorell-mobile-footer-reserve')
    }
  }, [hideMobileBottomNav, keepMobileBottomNavVisible, mobileCategoryOpen, mobileMoreOpen, open, visible])

  useEffect(() => {
    if (typeof window === 'undefined') return

    let frame = 0
    const updateNavContrast = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => {
        setMobileNavOverMedia((current) => shouldUseDarkFloatingGlass(mobileBottomNavRef.current, current))
      })
    }

    updateNavContrast()
    window.addEventListener('scroll', updateNavContrast, { passive: true })
    document.addEventListener('scroll', updateNavContrast, { passive: true, capture: true })
    window.addEventListener('resize', updateNavContrast)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', updateNavContrast)
      document.removeEventListener('scroll', updateNavContrast, { capture: true })
      window.removeEventListener('resize', updateNavContrast)
    }
  }, [activePathname, isMarketplaceRoute])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const root = document.documentElement
    let largestViewportHeight = 0
    const updateMobileBottomInset = () => {
      const viewport = window.visualViewport
      const viewportHeight = Math.round(viewport?.height || window.innerHeight)
      largestViewportHeight = Math.max(largestViewportHeight, viewportHeight)
      const screenHeight = Math.max(window.screen?.height || 0, window.screen?.availHeight || 0)
      const browserToolbarInset = viewport
        ? Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
        : 0
      const roundedBrowserToolbarInset = Math.round(browserToolbarInset)
      const viewportShortByScreen = screenHeight > 0 && viewportHeight < screenHeight - 120
      const viewportShortBySession = largestViewportHeight > 0 && viewportHeight < largestViewportHeight - 48
      const browserChromeVisible = roundedBrowserToolbarInset > 24 || viewportShortByScreen || viewportShortBySession
      root.style.setProperty('--autorell-mobile-browser-inset', `${roundedBrowserToolbarInset}px`)
      root.style.setProperty('--autorell-mobile-bottom-gap', browserChromeVisible ? '12px' : '20px')
    }

    updateMobileBottomInset()
    window.visualViewport?.addEventListener('resize', updateMobileBottomInset)
    window.visualViewport?.addEventListener('scroll', updateMobileBottomInset)
    window.addEventListener('resize', updateMobileBottomInset)
    window.addEventListener('orientationchange', updateMobileBottomInset)
    return () => {
      window.visualViewport?.removeEventListener('resize', updateMobileBottomInset)
      window.visualViewport?.removeEventListener('scroll', updateMobileBottomInset)
      window.removeEventListener('resize', updateMobileBottomInset)
      window.removeEventListener('orientationchange', updateMobileBottomInset)
      root.style.removeProperty('--autorell-mobile-browser-inset')
      root.style.removeProperty('--autorell-mobile-bottom-gap')
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setHeaderAccount(readCachedHeaderAccount())
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setActivePathname(unprefixedPathname)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [unprefixedPathname])

  useEffect(() => {
    const timer = window.setTimeout(() => setSearchMenuIntent(marketplaceMode), 0)
    return () => window.clearTimeout(timer)
  }, [marketplaceMode])

  const refreshHeaderAccount = useCallback(async () => {
    setHeaderAccountResolved(false)
    try {
      const response = await fetch('/api/account/header', {
        credentials: 'same-origin',
        cache: 'no-store',
      })
      if (!response.ok) return
      const data = (await response.json()) as HeaderAccount
      setHeaderAccount(data)
      cacheHeaderAccount(data)
      window.dispatchEvent(
        new CustomEvent('autorell:header-account', { detail: data }),
      )
    } catch {
      const fallback = emptyHeaderAccount
      setHeaderAccount((current) => (current.authenticated ? current : fallback))
      if (!window.__autorellHeaderAccount?.authenticated) {
        cacheHeaderAccount(fallback)
      }
      window.dispatchEvent(
        new CustomEvent('autorell:header-account', { detail: fallback }),
      )
    } finally {
      setHeaderAccountResolved(true)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshHeaderAccount()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [refreshHeaderAccount])

  useEffect(() => {
    const syncSaved = () => {
      try {
        const value = JSON.parse(window.localStorage.getItem(SAVED_LISTINGS_KEY) || '[]')
        setSavedListingCount(Array.isArray(value) ? value.length : 0)
      } catch {
        setSavedListingCount(0)
      }
      setSavedSearchCount(readSavedSearchCount())
      if (headerAccount.authenticated) {
        void fetchSavedSearchCount().then((result) => setSavedSearchCount(result.count)).catch(() => undefined)
      }
    }
    const openAuth = (event: Event) => {
      const detail = (event as CustomEvent<{ mode?: AuthView; destination?: string }>).detail
      openAuthModal(detail?.mode || 'login', detail?.destination)
    }
    const openMarket = () => {
      setAuthModalOpen(false)
      setMarketSelectorOpen(true)
    }
    const timer = window.setTimeout(() => {
      syncSaved()
      void fetchSavedListingIds()
        .then((result) => {
          if (result.authenticated) setSavedListingCount(result.ids.length)
        })
        .catch(() => undefined)
    }, 0)
    window.addEventListener('autorell:saved-listings', syncSaved)
    window.addEventListener(SAVED_SEARCHES_EVENT, syncSaved)
    window.addEventListener('storage', syncSaved)
    window.addEventListener('autorell:open-auth', openAuth)
    window.addEventListener('autorell:open-market', openMarket)
    window.addEventListener('autorell:auth-changed', refreshHeaderAccount)
    return () => {
      window.removeEventListener('autorell:saved-listings', syncSaved)
      window.removeEventListener(SAVED_SEARCHES_EVENT, syncSaved)
      window.removeEventListener('storage', syncSaved)
      window.removeEventListener('autorell:open-auth', openAuth)
      window.removeEventListener('autorell:open-market', openMarket)
      window.removeEventListener('autorell:auth-changed', refreshHeaderAccount)
      window.clearTimeout(timer)
    }
  }, [headerAccount.authenticated, refreshHeaderAccount])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!profileMenuOpen && !searchMenuOpen && !sellMenuOpen && !businessMenuOpen && !helpMenuOpen) return

    function handlePointerDown(event: PointerEvent) {
      const target = event.target
      if (!(target instanceof Node)) return
      if (profileMenuRef.current?.contains(target)) return
      if (searchMenuRef.current?.contains(target)) return
      if (sellMenuRef.current?.contains(target)) return
      if (businessMenuRef.current?.contains(target)) return
      if (helpMenuRef.current?.contains(target)) return
      setProfileMenuOpen(false)
      setSearchMenuOpen(false)
      setSellMenuOpen(false)
      setBusinessMenuOpen(false)
      setHelpMenuOpen(false)
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setProfileMenuOpen(false)
        setSearchMenuOpen(false)
        setSellMenuOpen(false)
        setBusinessMenuOpen(false)
        setHelpMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [profileMenuOpen, searchMenuOpen, sellMenuOpen, businessMenuOpen, helpMenuOpen])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const auth = params.get('auth')
    if (!auth) return
    const next = params.get('next')
    const destination =
      next && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/api/')
        ? next
        : undefined
    if (auth === 'login') openAuthModal('login', destination)
    if (auth === 'register' || auth === 'registrera') {
      openAuthModal('register', destination, params.get('account') === 'business')
    }
    if (auth === 'forgot-password') openAuthModal('forgot')
    if (auth === 'reset-password') openAuthModal('reset')
  }, [pathname])

  const buyItems: MenuItem[] = marketplaceCategories.map((category) => {
    const label =
      locale === 'sv' || locale === 'de' || locale === 'en'
        ? category.labels[language]
        : translatePublic(locale, category.labels.en)
    return {
      href: localizePublicHref(locale, categorySearchPath(category.slug)),
      label,
      slug: category.slug,
      description:
        locale === 'sv'
          ? 'Se annonser från privatpersoner och företag i hela Europa.'
          : locale === 'de'
            ? 'Anzeigen von privaten und gewerblichen Verkäufern in ganz Europa.'
            : locale === 'en'
              ? 'Browse listings from private and business sellers across Europe.'
              : translatePublic(locale, 'Vehicles from private and business sellers across Europe.'),
      icon: category.icon,
    }
  })
  const desktopSearchCopy = desktopSearchMenuCopy[locale]
  const desktopSearchItemsBySlug = new Map(
    buyItems.flatMap((item) => item.slug ? [[item.slug, item] as const] : []),
  )
  const desktopSearchGroups = [
    {
      key: 'personal',
      label: desktopSearchCopy.personal,
      slugs: ['cars', 'motorcycles', 'motorhomes', 'caravans'] as const,
    },
    {
      key: 'work',
      label: desktopSearchCopy.work,
      slugs: ['vans', 'trucks', 'agriculture', 'construction'] as const,
    },
  ].map((group) => ({
    ...group,
    items: group.slugs
      .map((slug) => desktopSearchItemsBySlug.get(slug))
      .filter((item): item is MenuItem => Boolean(item)),
  }))
  const desktopBikesItem = desktopSearchItemsBySlug.get('electric-bikes')
  const desktopSearchCategoryItem = desktopSearchCategory
    ? desktopSearchItemsBySlug.get(desktopSearchCategory)
    : undefined
  const desktopSearchBodyTypes = desktopSearchCategory
    ? marketplaceBodyTypeOptions[desktopSearchCategory]
    : []
  const desktopSearchTypeHref = (categoryHref: string, bodyType: string) => {
    const [categoryPathname, categorySearch = ''] = categoryHref.split('?')
    const params = new URLSearchParams(categorySearch)
    params.set('bodyType', bodyType)
    return `${categoryPathname}?${params.toString()}`
  }
  const searchCategoryHref = (href: string) => {
    const [pathname, search = ''] = href.split('?')
    const params = new URLSearchParams(search)
    applyMarketplaceSearchModeParams(params, searchMenuIntent)
    const query = params.toString()
    return query ? `${pathname}?${query}` : pathname
  }
  const visibleSearchCategoryItems =
    searchMenuIntent === 'leasing'
      ? buyItems.filter((item) => item.slug && isLeasingMarketplaceCategory(item.slug))
      : buyItems
  const topCategoryLabels: Partial<Record<(typeof marketplaceCategories)[number]['slug'], Record<'sv' | 'en' | 'de', string>>> = {
    agriculture: { sv: 'Lantbruk', en: 'Farm', de: 'Landwirtschaft' },
    construction: { sv: 'Entreprenad', en: 'Construction', de: 'Baumaschinen' },
  }
  const activeCategorySlug =
    marketplaceCategories.find(
      (category) =>
        unprefixedPathname === `/marketplace/${category.slug}`,
    )?.slug || null
  const activeMarketplaceChannel =
    marketplaceChannel ||
    (activeCategorySlug
      ? {
          slug: activeCategorySlug,
          label:
            buyItems.find((item) => item.href === localizePublicHref(locale, categorySearchPath(activeCategorySlug)))
              ?.label || '',
        }
      : null)
  const activeCategoryConfig = activeMarketplaceChannel
    ? getCategoryLanding(
        activeMarketplaceChannel.slug as (typeof marketplaceCategories)[number]['slug'],
      )
    : null
  const activeCategoryCopy = activeCategoryConfig
    ? localizeCategoryLanding(activeCategoryConfig, locale)
    : null
  const mobileMenuActiveSlug = activeCategoryConfig?.slug || null

  const categoryPrimaryLinks =
    activeCategoryConfig && activeCategoryCopy
      ? activeCategoryCopy.menu.map(
            (label) =>
              [
                localizePublicHref(
                  locale,
                  categoryLandingMenuHref(activeCategoryConfig, label),
                ),
                label,
              ] as const,
          )
      : null
  const highlightedMarketCodes = new Set(['se', 'de'])
  const languageOptions: Array<readonly [string, string, string, string]> = [
    ['eu', 'EU', 'English', 'https://www.autorell.com/?market=en'] as const,
    ...([
      ['se', 'SE', 'Sverige', 'https://www.autorell.se/'] as const,
      ['de', 'DE', 'Deutschland', 'https://www.autorell.de/'] as const,
      ...euBuyerMarkets
        .filter((market) => !highlightedMarketCodes.has(market.code))
        .map(
          (market) =>
            [
              market.code,
              market.code.toUpperCase(),
              market.countryLocal,
              `https://www.autorell.com/${market.code}`,
            ] as const,
        ),
    ] as Array<readonly [string, string, string, string]>).sort(
      (left, right) => left[2].localeCompare(right[2], locale),
    ),
  ]
  const pathMarketCode = pathname.split('/').filter(Boolean)[0]
  const activeMarketCode =
    locale === 'sv'
      ? 'se'
      : locale === 'de'
        ? 'de'
        : marketCode && euBuyerMarkets.some((market) => market.code === marketCode)
          ? marketCode
        : euBuyerMarkets.some((market) => market.code === pathMarketCode)
          ? pathMarketCode
          : locale === 'en'
            ? 'eu'
            : euBuyerMarkets.find((market) => market.language === locale)?.code || 'eu'
  const activeMarket =
    languageOptions.find(([code]) => code === activeMarketCode) ||
    (['eu', 'EU', 'Europe', 'https://www.autorell.com/'] as const)

  const homeHref = usePreferredHomeHref(locale)
  const marketPathPrefix =
    activeMarketCode === 'eu' || activeMarketCode === 'se' || activeMarketCode === 'de'
      ? ''
      : `/${activeMarketCode}`
  const accountHref = `${marketPathPrefix}/account`
  const accountMessagesHref = `${marketPathPrefix}/account/messages`
  const savedHref = `${marketPathPrefix}/saved`
  const savedSearchesHref = `${marketPathPrefix}/saved-searches`
  const vehicleSearchHref = localizePublicHref(locale, '/marketplace')
  const isFindCarsPage = activePathname === '/find-cars'
  const isMarketplaceResults =
    marketplaceResultsPage ||
    activePathname === '/marketplace' ||
    activePathname.startsWith('/marketplace/')
  const firstPathSegment = unprefixedPathname.split('/').filter(Boolean)[0] || ''
  const isListingDetail = new Set([
    'listings',
    'annons',
    'anzeige',
    'anuncio',
    'annuncio',
    'annonce',
    'advertentie',
    'ogloszenie',
    'ilmoitus',
  ]).has(firstPathSegment)
  const showTopCategoryNav = false
  const renderTopCategoryNav = showTopCategoryNav && atPageTop
  const showMobileCategoryNav =
    Boolean(categoryPrimaryLinks) && !isMarketplaceResults && !isListingDetail
  const mobileCategoryLinks = showMobileCategoryNav ? categoryPrimaryLinks : null
  const headerSpacerClass = showMobileCategoryNav
    ? showTopCategoryNav
      ? 'h-[110px] min-[1120px]:h-[80px]'
      : 'h-[110px] min-[1120px]:h-[62px]'
    : hideOnMobile
      ? 'h-0 min-[1120px]:h-[62px]'
      : showTopCategoryNav
      ? 'h-[56px] min-[1120px]:h-[80px]'
      : 'h-[56px] min-[1120px]:h-[62px]'
  const desktopMainRowHeightClass = showTopCategoryNav
    ? 'min-[1120px]:h-[52px]'
    : 'min-[1120px]:h-[62px]'
  const isBusinessAccount = headerAccount.accountType === 'business'
  const isAdminAccount = Boolean(headerAccount.isAdmin)
  const baseSellMenuLinks = sellerItems[language].map((item) => {
    const translatedItem =
      locale === 'sv' || locale === 'de' || locale === 'en'
        ? item
        : translatePublicObject(locale, item)
    return {
      ...translatedItem,
      requiresLogin: item.requiresLogin,
      href: localizePublicHref(locale, item.href),
    }
  })
  const localizedDealerSell = sellToDealerMenuCopy[locale]
  const sellMenuLinks = [
    {
      href: localizePublicHref(locale, '/sell-to-dealer'),
      label: localizedDealerSell.label,
      description: localizedDealerSell.description,
      icon: Handshake,
    },
    ...baseSellMenuLinks.slice(1),
  ].filter((item): item is MenuItem => Boolean(item))
  const localizedBusinessMenu = businessMenuCopy[locale]
  const businessMenuLinks = [
    {
      href: localizePublicHref(locale, '/business'),
      label: localizedBusinessMenu.solutionsLabel,
      description: localizedBusinessMenu.solutionsDescription,
      icon: Store,
    },
    {
      href: localizePublicHref(locale, '/pricing#business'),
      label: localizedBusinessMenu.plansLabel,
      description: localizedBusinessMenu.plansDescription,
      icon: CreditCard,
    },
    {
      href: localizePublicHref(locale, '/help-center/business/inventory-listings'),
      label: localizedBusinessMenu.inventoryLabel,
      description: localizedBusinessMenu.inventoryDescription,
      icon: FilePlus2,
    },
    {
      href: localizePublicHref(locale, '/help-center/business/dealer-offers-buying'),
      label: localizedBusinessMenu.dealerOffersLabel,
      description: localizedBusinessMenu.dealerOffersDescription,
      icon: Handshake,
    },
    {
      href: localizePublicHref(locale, '/help-center/business/business-integrations'),
      label: localizedBusinessMenu.integrationsLabel,
      description: localizedBusinessMenu.integrationsDescription,
      icon: Settings,
    },
    {
      href: localizePublicHref(locale, '/help-center/business/business-help'),
      label: localizedBusinessMenu.businessHelpLabel,
      description: localizedBusinessMenu.businessHelpDescription,
      icon: CircleHelp,
    },
  ]
  const contactMenuCopy: Record<PublicLocale, { label: string; description: string }> = {
    sv: { label: 'Kontakta oss', description: 'Allmän kontakt för frågor, support och Autorell-ärenden.' },
    de: { label: 'Kontakt', description: 'Allgemeiner Kontakt für Fragen, Support und Autorell-Anliegen.' },
    en: { label: 'Contact us', description: 'General contact for questions, support and Autorell cases.' },
    at: { label: 'Kontakt', description: 'Allgemeiner Kontakt für Fragen, Support und Autorell-Anliegen.' },
    be: { label: 'Contact opnemen', description: 'Algemeen contact voor vragen, support en Autorell-zaken.' },
    fr: { label: 'Nous contacter', description: 'Contact général pour questions, support et demandes Autorell.' },
    es: { label: 'Contactar', description: 'Contacto general para preguntas, soporte y casos de Autorell.' },
    it: { label: 'Contattaci', description: 'Contatto generale per domande, supporto e richieste Autorell.' },
    pl: { label: 'Kontakt', description: 'Kontakt ogólny w sprawie pytań, wsparcia i spraw Autorell.' },
    nl: { label: 'Contact opnemen', description: 'Algemeen contact voor vragen, support en Autorell-zaken.' },
    fi: { label: 'Ota yhteyttä', description: 'Yleinen yhteys kysymyksiin, tukeen ja Autorell-asioihin.' },
    da: { label: 'Kontakt os', description: 'Generel kontakt til spørgsmål, support og Autorell-sager.' },
  }
  const contactMenuItem = contactMenuCopy[locale] || contactMenuCopy.en
  const helpMenuLinks = [
    {
      href: localizePublicHref(locale, '/safety-tips'),
      label: publicLabel('Help center', 'Hjälpcenter', 'Hilfe'),
      description: publicLabel('Answers, account help and marketplace support.', 'Svar, kontohjälp och support för marknadsplatsen.', 'Antworten, Kontohilfe und Marktplatz-Support.'),
      icon: CircleHelp,
    },
    {
      href: localizePublicHref(locale, '/vehicle-news'),
      label: publicLabel('Vehicle news', 'Fordonsnyheter', 'Auto-News'),
      description: publicLabel('Guides, updates and articles about vehicle markets.', 'Guider, uppdateringar och artiklar om fordonsmarknaden.', 'Ratgeber, Updates und Artikel zum Fahrzeugmarkt.'),
      icon: Newspaper,
    },
    {
      href: localizePublicHref(locale, '/help-center'),
      label: publicLabel('Safety tips', 'Säkerhetstips', 'Sicherheitstipps'),
      description: publicLabel('Practical checks before you buy or sell.', 'Praktiska kontroller innan du köper eller säljer.', 'Praktische Checks vor Kauf oder Verkauf.'),
      icon: ShieldCheck,
    },
    {
      href: localizePublicHref(locale, '/report'),
      label: publicLabel('Report a problem', 'Rapportera problem', 'Melden'),
      description: publicLabel('Tell Autorell if something does not look right.', 'Meddela Autorell om något inte ser rätt ut.', 'Melden Sie Autorell, wenn etwas nicht stimmt.'),
      icon: MessageSquareText,
    },
    {
      href: localizePublicHref(locale, '/contact'),
      label: contactMenuItem.label,
      description: contactMenuItem.description,
      icon: Mail,
    },
  ]

  const mobileMainLinks = [
    {
      href: localizePublicHref(locale, '/marketplace'),
      label: publicLabel('Search vehicles', 'Sök fordon', 'Fahrzeuge suchen'),
      icon: Search,
    },
    {
      href: sellMenuLinks[0]?.href || localizePublicHref(locale, '/sell-to-dealer'),
      label: publicLabel(t.sell, 'Sälja', t.sell),
      icon: Plus,
      children: sellMenuLinks,
      menu: 'sell' as const,
    },
    {
      href: localizePublicHref(locale, '/business'),
      label: t.business,
      icon: Building2,
      children: businessMenuLinks,
      menu: 'business' as const,
    },
    {
      href: localizePublicHref(locale, '/help-center'),
      label: publicLabel('Help center', 'Hjälpcenter', 'Hilfe'),
      icon: CircleHelp,
      children: helpMenuLinks,
      menu: 'help' as const,
    },
  ]
  const accountListingsHref = isBusinessAccount
    ? `${marketPathPrefix}/account/company/listings`
    : `${marketPathPrefix}/account/listings`
  const desktopNavLinks = [
    { kind: 'search' as const, href: localizePublicHref(locale, '/marketplace'), label: publicLabel('Search vehicles', 'Sök fordon', 'Fahrzeuge suchen') },
    { kind: 'sell' as const, href: sellMenuLinks[0]?.href || localizePublicHref(locale, '/sell-to-dealer'), label: publicLabel(t.sell, 'Sälja', t.sell) },
    { kind: 'business' as const, href: localizePublicHref(locale, '/business'), label: t.business },
    { kind: 'help' as const, href: localizePublicHref(locale, '/help-center'), label: publicLabel('Help center', 'Hjälpcenter', 'Hilfe') },
  ]
  const desktopAccountLinks = [
    { href: savedHref, label: publicLabel(t.saved, 'Sparade annonser', t.saved), icon: Heart },
    { href: savedSearchesHref, label: translatePublic(locale, 'Saved searches'), icon: Bookmark },
    { href: accountMessagesHref, label: t.messages, icon: MessageSquareText },
  ]
  const savedListingBadge = savedListingCount > 99 ? '99+' : savedListingCount ? String(savedListingCount) : ''
  const savedSearchBadge = savedSearchCount > 99 ? '99+' : savedSearchCount ? String(savedSearchCount) : ''
  const accountMenuCopyByLocale: Record<
    PublicLocale,
    { pages: string; create: string; listings: string; settings: string; signOut: string; privateAccount: string; businessAccount: string; newHere: string; startHere: string }
  > = {
    sv: { pages: 'Mina sidor', create: 'Skapa annons', listings: 'Mina annonser', settings: 'Inställningar', signOut: 'Logga ut', privateAccount: 'Privatkonto', businessAccount: 'Företagskonto', newHere: 'Ny på webbplatsen?', startHere: 'Börja här' },
    de: { pages: 'Meine Seiten', create: 'Anzeige erstellen', listings: 'Meine Anzeigen', settings: 'Einstellungen', signOut: 'Abmelden', privateAccount: 'Privatkonto', businessAccount: 'Firmenkonto', newHere: 'Neu auf der Website?', startHere: 'Hier starten' },
    en: { pages: 'My pages', create: 'Create listing', listings: 'My listings', settings: 'Settings', signOut: 'Sign out', privateAccount: 'Private account', businessAccount: 'Business account', newHere: 'New on the website?', startHere: 'Start here' },
    at: { pages: 'Meine Seiten', create: 'Anzeige erstellen', listings: 'Meine Anzeigen', settings: 'Einstellungen', signOut: 'Abmelden', privateAccount: 'Privatkonto', businessAccount: 'Firmenkonto', newHere: 'Neu auf der Website?', startHere: 'Hier starten' },
    be: { pages: 'Mijn pagina’s', create: 'Advertentie maken', listings: 'Mijn advertenties', settings: 'Instellingen', signOut: 'Uitloggen', privateAccount: 'Privéaccount', businessAccount: 'Bedrijfsaccount', newHere: 'Nieuw op de website?', startHere: 'Begin hier' },
    fr: { pages: 'Mes pages', create: 'Créer une annonce', listings: 'Mes annonces', settings: 'Paramètres', signOut: 'Déconnexion', privateAccount: 'Compte particulier', businessAccount: 'Compte professionnel', newHere: 'Nouveau sur le site ?', startHere: 'Commencer ici' },
    es: { pages: 'Mis páginas', create: 'Crear anuncio', listings: 'Mis anuncios', settings: 'Ajustes', signOut: 'Cerrar sesión', privateAccount: 'Cuenta particular', businessAccount: 'Cuenta de empresa', newHere: '¿Nuevo en el sitio?', startHere: 'Empieza aquí' },
    it: { pages: 'Le mie pagine', create: 'Crea annuncio', listings: 'I miei annunci', settings: 'Impostazioni', signOut: 'Esci', privateAccount: 'Account privato', businessAccount: 'Account aziendale', newHere: 'Nuovo sul sito?', startHere: 'Inizia qui' },
    pl: { pages: 'Moje strony', create: 'Dodaj ogłoszenie', listings: 'Moje ogłoszenia', settings: 'Ustawienia', signOut: 'Wyloguj', privateAccount: 'Konto prywatne', businessAccount: 'Konto firmowe', newHere: 'Nowy na stronie?', startHere: 'Zacznij tutaj' },
    nl: { pages: 'Mijn pagina’s', create: 'Advertentie maken', listings: 'Mijn advertenties', settings: 'Instellingen', signOut: 'Uitloggen', privateAccount: 'Privéaccount', businessAccount: 'Bedrijfsaccount', newHere: 'Nieuw op de website?', startHere: 'Begin hier' },
    fi: { pages: 'Omat sivut', create: 'Luo ilmoitus', listings: 'Omat ilmoitukset', settings: 'Asetukset', signOut: 'Kirjaudu ulos', privateAccount: 'Yksityistili', businessAccount: 'Yritystili', newHere: 'Uusi sivustolla?', startHere: 'Aloita tästä' },
    da: { pages: 'Mine sider', create: 'Opret annonce', listings: 'Mine annoncer', settings: 'Indstillinger', signOut: 'Log ud', privateAccount: 'Privatkonto', businessAccount: 'Firmakonto', newHere: 'Ny på websitet?', startHere: 'Start her' },
  }
  const accountMenuCopy = accountMenuCopyByLocale[locale] || accountMenuCopyByLocale.en
  const incompleteProfileCopy = getIncompleteProfileCopy(locale)
  const completeProfileHref = localizePublicHref(
    locale,
    headerAccount.accountType === 'business' ? '/account/company/profile' : '/account/profile',
  )
  const incompletePrivateProfile =
    headerAccountResolved &&
    headerAccount.authenticated &&
    headerAccount.accountType === 'private' &&
    headerAccount.profileComplete === false
  const profileReminder = incompletePrivateProfile
    ? { ...incompleteProfileCopy, href: completeProfileHref }
    : null
  const isPrivateProfilePage =
    unprefixedPathname === '/account/profile' ||
    unprefixedPathname === '/konto/profil'
  const accountProfileHref = isBusinessAccount ? `${marketPathPrefix}/account/company/profile` : `${marketPathPrefix}/account/profile`
  const accountSettingsHref = isBusinessAccount ? `${marketPathPrefix}/account/company/settings` : `${marketPathPrefix}/account/settings`
  const profileMenuLinks = isAdminAccount
    ? [
        { href: '/admin', label: 'Admin', icon: ShieldCheck },
      ]
    : isBusinessAccount
    ? [
        { href: `${marketPathPrefix}/account/company`, label: publicLabel('Company portal', 'Företagsportal', 'Unternehmensportal'), icon: Building2 },
        { href: accountProfileHref, label: accountMenuCopy.pages, icon: UserRound },
        { href: accountListingsHref, label: accountMenuCopy.listings, icon: CarFront },
        { href: accountSettingsHref, label: accountMenuCopy.settings, icon: Settings },
        { href: `${marketPathPrefix}/account/company/subscription`, label: publicLabel('Plan', 'Plan', 'Tarif'), icon: CreditCard },
      ]
    : [
        { href: accountHref, label: accountMenuCopy.pages, icon: UserRound },
        { href: accountListingsHref, label: accountMenuCopy.listings, icon: CarFront },
        { href: accountSettingsHref, label: accountMenuCopy.settings, icon: Settings },
      ]
  const mobileAccountName =
    headerAccount.displayName?.trim().split(/\s+/)[0] ||
    (headerAccount.authenticated ? t.myAutorell : t.signIn)
  const mobileProfileLabel = isAdminAccount ? 'Admin' : accountMenuCopy.pages
  const mobileAccountTypeLabel = isAdminAccount
    ? 'Admin'
    : headerAccount.accountType === 'business'
      ? accountMenuCopy.businessAccount
      : headerAccount.accountType === 'private'
        ? accountMenuCopy.privateAccount
        : accountMenuCopy.pages
  const mobileAccountInitials =
    headerAccount.displayName
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'A'

  function closeMobile() {
    setOpen(false)
    setMobileCategoryOpen(false)
    setMobileMoreOpen(false)
    setSearchMenuOpen(false)
    setMobileSellMenuOpen(false)
    setMobileBusinessMenuOpen(false)
    setMobileHelpMenuOpen(false)
    setSellMenuOpen(false)
    setBusinessMenuOpen(false)
    setHelpMenuOpen(false)
  }

  function toggleDesktopMenu(menu: 'search' | 'sell' | 'business' | 'help' | 'profile') {
    setDesktopSearchCategory(null)
    setDesktopSearchMotion('idle')
    setSearchMenuOpen((current) => (menu === 'search' ? !current : false))
    setSellMenuOpen((current) => (menu === 'sell' ? !current : false))
    setBusinessMenuOpen((current) => (menu === 'business' ? !current : false))
    setHelpMenuOpen((current) => (menu === 'help' ? !current : false))
    setProfileMenuOpen((current) => (menu === 'profile' ? !current : false))
  }

  function openAuthModal(mode: AuthView, destination?: string, businessRegistration = false) {
    const nextMode = mode === 'register' ? 'register' : 'login'
    setAuthInitialMode(nextMode)
    setAuthInitialView(mode)
    setAuthDestination(destination)
    setAuthBusinessRegistration(mode === 'register' && businessRegistration)
    setAuthModalOpen(true)
    setOpen(false)
    setMobileCategoryOpen(false)
    setMobileMoreOpen(false)
    setMobileSellMenuOpen(false)
    setMobileBusinessMenuOpen(false)
    setMobileHelpMenuOpen(false)
    setProfileMenuOpen(false)
    setSearchMenuOpen(false)
    setSellMenuOpen(false)
    setBusinessMenuOpen(false)
    setHelpMenuOpen(false)
  }

  async function signOut() {
    await createClient().auth.signOut()
    const signedOutHeaderState = {
      authenticated: false,
      unreadMessages: 0,
      conversationCount: 0,
    }
    window.__autorellHeaderAccount = signedOutHeaderState
    try {
      window.sessionStorage.setItem(HEADER_ACCOUNT_CACHE_KEY, JSON.stringify(signedOutHeaderState))
    } catch {
      // Session storage can be blocked; the in-memory event still updates the header.
    }
    setHeaderAccount(signedOutHeaderState)
    setProfileMenuOpen(false)
    window.dispatchEvent(new CustomEvent('autorell:header-account', { detail: signedOutHeaderState }))
    window.dispatchEvent(new CustomEvent('autorell:auth-changed'))
    window.location.assign(homeHref)
  }

  function handleInternalNavigation(
    event: ReactMouseEvent<HTMLAnchorElement>,
    href: string,
  ) {
    const targetPath = stripLocalePrefix(new URL(href, window.location.origin).pathname)
    if (targetPath === '/login' || targetPath === '/register' || targetPath === '/registrera') {
      event.preventDefault()
      openAuthModal(targetPath === '/login' ? 'login' : 'register', href)
      return
    }
    if (!headerAccount.authenticated && (targetPath.startsWith('/konto') || targetPath.startsWith('/account'))) {
      event.preventDefault()
      openAuthModal('login', href)
      return
    }
    if (href.includes('#') && pathname === href.split('#')[0]) {
      event.preventDefault()
      document.getElementById(href.split('#')[1])?.scrollIntoView({ behavior: 'smooth' })
    }
    setProfileMenuOpen(false)
    setSearchMenuOpen(false)
    setSellMenuOpen(false)
    setBusinessMenuOpen(false)
    setHelpMenuOpen(false)
    setMobileSellMenuOpen(false)
    setMobileBusinessMenuOpen(false)
    setMobileHelpMenuOpen(false)
    closeMobile()
  }

  function handleHomeLogoClick() {
    setProfileMenuOpen(false)
    setSearchMenuOpen(false)
    setSellMenuOpen(false)
    setBusinessMenuOpen(false)
    setHelpMenuOpen(false)
    setMobileSellMenuOpen(false)
    setMobileBusinessMenuOpen(false)
    setMobileHelpMenuOpen(false)
    closeMobile()
  }

  function handleCategoryNavigation(
    event: ReactMouseEvent<HTMLAnchorElement>,
    href: string,
  ) {
    handleInternalNavigation(event, href)
  }

  return (
    <>
      <div
        className={headerSpacerClass}
        aria-hidden="true"
      />
      <div
        className={`fixed inset-x-0 top-0 z-[120] transform-gpu transition-transform duration-300 ${
          hideOnMobile ? 'listing-mobile-hidden-header hidden min-[1120px]:block' : ''
        } ${
          visible || open ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <header className="relative bg-white text-[#202124] shadow-[inset_0_-1px_0_#deddd8]">
          {renderTopCategoryNav ? (
            <div className="hidden border-b border-[#deddd8] bg-white min-[1120px]:block">
              <div className="mx-auto flex h-[30px] max-w-[1920px] items-center justify-between px-4 sm:px-8 min-[1120px]:px-4 2xl:px-4">
                <nav className="flex min-w-0 items-center gap-4 overflow-hidden text-[10px] text-[#41474b] xl:gap-5 xl:text-[11px]">
                  {buyItems.map(({ href, label }, index) => {
                    const category = marketplaceCategories[index]
                    const isActive =
                      activePathname === stripLocalePrefix(href) ||
                      (category && activePathname === `/marketplace/${category.slug}`)
                    const topLabel =
                      category && topCategoryLabels[category.slug]
                        ? topCategoryLabels[category.slug]![language]
                        : label
                    return (
                      <Link
                        key={`${label}:${href}`}
                        href={href}
                        aria-current={isActive ? 'page' : undefined}
                        className={`flex h-[30px] shrink-0 items-center border-b-2 transition hover:border-[#0866ff] hover:text-[#111] ${
                          isActive
                            ? 'border-[#0866ff] font-semibold text-[#202124]'
                            : 'border-transparent'
                        }`}
                      >
                        {topLabel}
                      </Link>
                    )
                  })}
                </nav>
                <div className="ml-5 flex h-[30px] shrink-0 items-center text-[11px] font-semibold text-[#202124]">
                  <button
                    type="button"
                    onClick={() => setMarketSelectorOpen(true)}
                    className="flex h-full shrink-0 items-center gap-1.5 transition hover:text-[#0866ff]"
                    aria-label={t.chooseLanguage}
                  >
                    <FlagIcon code={activeMarket[1]} size="xs" />
                    <span>{activeMarket[2]}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <div className={`relative mx-auto h-[56px] max-w-[var(--autorell-page-max)] items-center px-4 sm:px-8 ${hideOnMobile ? 'hidden min-[1120px]:flex' : 'flex'} ${desktopMainRowHeightClass} min-[1120px]:max-w-[1920px] min-[1120px]:px-4 2xl:px-4`}>
            <Link
              href={homeHref}
              aria-label="Autorell"
              onClick={handleHomeLogoClick}
              className="hidden h-full shrink-0 flex-col items-center justify-center border-b-2 border-transparent pt-1 transition hover:border-[#0866ff] min-[1120px]:inline-flex"
            >
              <BrandLogo underline={false} />
            </Link>

            <nav className="ml-8 hidden h-full shrink-0 items-center gap-5 overflow-visible whitespace-nowrap min-[1120px]:flex xl:ml-10 xl:gap-6">
              {desktopNavLinks.map((item) => {
                const { href, label } = item
                const targetPath = stripLocalePrefix(href.split('?')[0] || href)
                const isActive =
                  activePathname === targetPath ||
                  (targetPath === '/marketplace' && (isMarketplaceResults || isFindCarsPage)) ||
                  (item.kind === 'sell' &&
                    [
                      '/account/listings/new',
                      '/account/company/listings/create',
                      '/sell-car',
                      '/sell-to-dealer',
                      '/sell-van',
                      '/sell-construction',
                    ].includes(activePathname)) ||
                  (item.kind === 'business' &&
                    businessMenuLinks.some((businessItem) => stripLocalePrefix((businessItem.href.split('#')[0] || businessItem.href).split('?')[0] || businessItem.href) === activePathname)) ||
                  (item.kind === 'help' &&
                    helpMenuLinks.some((helpItem) => stripLocalePrefix(helpItem.href.split('?')[0] || helpItem.href) === activePathname))

                if (item.kind === 'search') {
                  return (
                    <div
                      key={`${item.kind}:${label}:${href}`}
                      ref={searchMenuRef}
                      className="relative flex h-full items-center"
                    >
                      <button
                        type="button"
                        aria-expanded={searchMenuOpen}
                        onClick={() => toggleDesktopMenu('search')}
                        style={{ fontWeight: 500 }}
                        className={`flex h-full items-center gap-1.5 border-b-2 text-[14px] !font-medium transition hover:border-[#0866ff] hover:text-[#0866ff] ${
                          isActive
                            ? 'border-transparent text-[#0866ff]'
                            : 'border-transparent text-[#101828]'
                        }`}
                      >
                        <span className="font-medium" style={{ fontWeight: 500 }}>
                          {label}
                        </span>
                        <ChevronDown className={`h-4 w-4 transition ${searchMenuOpen ? 'rotate-180' : ''}`} strokeWidth={2} />
                      </button>
                      <div
                        className={`absolute left-0 top-full z-[150] mt-2 overflow-hidden rounded-[12px] border border-[#d9e1ec] bg-white shadow-[0_20px_55px_rgba(16,24,40,.14)] transition ${
                          desktopSearchCategory
                            ? 'w-[min(600px,calc(100vw-2rem))]'
                            : 'w-[min(880px,calc(100vw-2rem))]'
                        } ${
                          searchMenuOpen
                            ? 'pointer-events-auto translate-y-0 opacity-100'
                            : 'pointer-events-none -translate-y-1 opacity-0'
                        }`}
                      >
                        {desktopSearchCategoryItem && desktopSearchCategory ? (
                          <div
                            key={desktopSearchCategory}
                            className={desktopSearchMotion === 'forward' ? 'autorell-desktop-search-forward' : undefined}
                          >
                            <div className="border-b border-[#e4e7ec] px-6 py-5">
                              <button
                                type="button"
                                onClick={() => {
                                  setDesktopSearchMotion('back')
                                  setDesktopSearchCategory(null)
                                }}
                                className="-ml-1 inline-flex items-center gap-1 rounded-[6px] px-1 py-1 text-[12px] font-medium text-[#667085] transition hover:bg-[#f5f7fa] hover:text-[#101828] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0866ff]"
                              >
                                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                                {desktopSearchCopy.back}
                              </button>
                              <p className="mt-2 text-[17px] font-semibold leading-6 text-[#0866ff]">
                                {desktopSearchCategoryItem.label}
                              </p>
                              <p className="mt-1 text-[13px] font-normal leading-5 text-[#667085]">
                                {desktopSearchCopy.browseTypes}
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-x-3 px-6 py-4">
                              {desktopSearchBodyTypes.map((bodyType) => {
                                const typeHref = desktopSearchTypeHref(desktopSearchCategoryItem.href, bodyType)
                                return (
                                  <Link
                                    key={bodyType}
                                    href={typeHref}
                                    onClick={(event) => handleInternalNavigation(event, typeHref)}
                                    className="rounded-[6px] px-2 py-2.5 text-[14px] font-medium leading-5 text-[#101828] transition hover:bg-[#f5f7fa] hover:text-[#0866ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0866ff] focus-visible:ring-offset-1"
                                  >
                                    {translateListingVehicleValue(locale, bodyType)}
                                  </Link>
                                )
                              })}
                            </div>
                            <Link
                              href={desktopSearchCategoryItem.href}
                              onClick={(event) => handleInternalNavigation(event, desktopSearchCategoryItem.href)}
                              className="block border-t border-[#e4e7ec] bg-[#f8fafc] px-6 py-4 text-[14px] font-semibold text-[#0866ff] transition hover:bg-[#f1f5f9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0866ff]"
                            >
                              {desktopSearchCopy.viewCategory}
                            </Link>
                          </div>
                        ) : (
                          <div
                            key="categories"
                            className={desktopSearchMotion === 'back' ? 'autorell-desktop-search-back' : undefined}
                          >
                            <div className="border-b border-[#e4e7ec] px-6 py-5">
                              <p className="text-[17px] font-semibold leading-6 text-[#0866ff]">
                                {desktopSearchCopy.title}
                              </p>
                              <p className="mt-1 text-[13px] font-normal leading-5 text-[#667085]">
                                {desktopSearchCopy.intro}
                              </p>
                            </div>
                            <div className="grid grid-cols-[minmax(0,1fr)_260px]">
                              <div className="min-w-0 border-r border-[#e4e7ec]">
                                <div>
                                  <div className="grid grid-cols-2 divide-x divide-[#e4e7ec]">
                                    {desktopSearchGroups.map((group) => (
                                      <div key={group.key} className="px-6 py-5">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#667085]">
                                          {group.label}
                                        </p>
                                        <div className="mt-2">
                                          {group.items.map(({ label: categoryLabel, slug: categorySlug, href: categoryHref }) => {
                                            const categoryPath = stripLocalePrefix(categoryHref.split('?')[0] || categoryHref)
                                            const isCategoryActive =
                                              unprefixedPathname === categoryPath ||
                                              marketplaceChannel?.slug === categorySlug
                                            return (
                                              <div
                                                key={categorySlug}
                                                className={`group flex w-full items-center rounded-[6px] transition ${
                                                  isCategoryActive ? 'bg-[#f5f7fa]' : 'hover:bg-[#f5f7fa]'
                                                }`}
                                              >
                                                <Link
                                                  href={categoryHref}
                                                  aria-current={isCategoryActive ? 'page' : undefined}
                                                  onClick={(event) => handleInternalNavigation(event, categoryHref)}
                                                  className={`min-w-0 flex-1 rounded-[6px] px-2 py-2.5 text-[14px] font-medium leading-5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0866ff] focus-visible:ring-offset-1 ${
                                                    isCategoryActive
                                                      ? 'text-[#0866ff]'
                                                      : 'text-[#101828] group-hover:text-[#0866ff]'
                                                  }`}
                                                >
                                                  {categoryLabel}
                                                </Link>
                                                <button
                                                  type="button"
                                                  aria-label={`${categoryLabel}: ${desktopSearchCopy.browseTypes}`}
                                                  onClick={() => {
                                                    setDesktopSearchMotion('forward')
                                                    setDesktopSearchCategory(categorySlug || null)
                                                  }}
                                                  className={`mr-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-[6px] transition hover:bg-white hover:text-[#0866ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0866ff] ${
                                                    isCategoryActive ? 'text-[#0866ff]' : 'text-[#98a2b3]'
                                                  }`}
                                                >
                                                  <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
                                                </button>
                                              </div>
                                            )
                                          })}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              {desktopBikesItem ? (
                                <Link
                                  href={desktopBikesItem.href}
                                  onClick={(event) => handleInternalNavigation(event, desktopBikesItem.href)}
                                  className="group relative m-4 min-h-[192px] overflow-hidden rounded-[10px] bg-[#101828] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0866ff] focus-visible:ring-offset-2"
                                >
                                  <Image
                                    src="/vehicle-menu-bikes.webp"
                                    alt={`${desktopBikesItem.label} – ${desktopSearchCopy.title}`}
                                    fill
                                    sizes="260px"
                                    className="object-cover object-[64%_center] brightness-[1.1] transition duration-500 group-hover:scale-[1.035]"
                                  />
                                  <span className="absolute inset-0 bg-gradient-to-t from-[#101828]/58 via-transparent to-transparent" aria-hidden="true" />
                                  <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-white">
                                    <span>
                                      <span className="block text-[11px] font-semibold uppercase tracking-[0.13em] text-white/75">
                                        {publicLabel('Sustainable mobility', 'Hållbar mobilitet', 'Nachhaltige Mobilität')}
                                      </span>
                                      <span className="mt-1 block text-[18px] font-semibold leading-6">
                                        {desktopBikesItem.label}
                                      </span>
                                    </span>
                                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-[#0866ff] shadow-[0_8px_22px_rgba(16,24,40,.2)] transition group-hover:translate-x-0.5">
                                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                    </span>
                                  </span>
                                </Link>
                              ) : null}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                }

                if (item.kind === 'sell') {
                  return (
                    <div
                      key={`${item.kind}:${label}:${href}`}
                      ref={sellMenuRef}
                      className="relative flex h-full items-center"
                    >
                      <button
                        type="button"
                        aria-expanded={sellMenuOpen}
                        onClick={() => toggleDesktopMenu('sell')}
                        style={{ fontWeight: 500 }}
                        className={`flex h-full items-center gap-1.5 border-b-2 text-[14px] !font-medium transition hover:border-[#0866ff] hover:text-[#0866ff] ${
                          isActive
                            ? 'border-transparent text-[#0866ff]'
                            : 'border-transparent text-[#101828]'
                        }`}
                      >
                        <span className="font-medium" style={{ fontWeight: 500 }}>
                          {label}
                        </span>
                        <ChevronDown className={`h-4 w-4 transition ${sellMenuOpen ? 'rotate-180' : ''}`} strokeWidth={2} />
                      </button>
                      <div
                        className={`absolute left-0 top-full z-[150] mt-2 w-max min-w-[18rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[8px] border border-[#d9e1ec] bg-white py-2 shadow-[0_18px_45px_rgba(16,24,40,.16)] transition ${
                          sellMenuOpen
                            ? 'pointer-events-auto translate-y-0 opacity-100'
                            : 'pointer-events-none -translate-y-1 opacity-0'
                        }`}
                      >
                        {sellMenuLinks.map(({ href: sellHref, label: sellLabel, description, icon: Icon, requiresLogin }) => (
                          <Link
                            key={sellHref}
                            href={sellHref}
                            onClick={(event) => {
                              setSellMenuOpen(false)
                              if (requiresLogin) {
                                event.preventDefault()
                                openAuthModal('login', sellHref)
                                return
                              }
                              handleInternalNavigation(event, sellHref)
                            }}
                            className="group grid min-h-[58px] w-max max-w-full grid-cols-[36px_max-content] items-start gap-3 px-4 py-2.5 pr-7 text-[#101828] transition hover:bg-[#f5f9ff] hover:text-[#0866ff]"
                          >
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-[#edf5ff] text-[#0866ff]">
                              <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                            </span>
                            <span className="min-w-0 max-w-[min(34rem,calc(100vw-8rem))]">
                              <span className="block w-max max-w-full whitespace-normal text-[14px] font-[500] leading-snug">{sellLabel}</span>
                              <span className="mt-0.5 block w-max max-w-full whitespace-normal text-[12px] font-[400] leading-5 text-[#667085] group-hover:text-[#475467]">
                                {description}
                              </span>
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )
                }

                if (item.kind === 'business') {
                  return (
                    <div
                      key={`${item.kind}:${label}:${href}`}
                      ref={businessMenuRef}
                      className="relative flex h-full items-center"
                    >
                      <button
                        type="button"
                        aria-expanded={businessMenuOpen}
                        onClick={() => toggleDesktopMenu('business')}
                        style={{ fontWeight: 500 }}
                        className={`flex h-full items-center gap-1.5 border-b-2 text-[14px] !font-medium transition hover:border-[#0866ff] hover:text-[#0866ff] ${
                          isActive
                            ? 'border-transparent text-[#0866ff]'
                            : 'border-transparent text-[#101828]'
                        }`}
                      >
                        <span className="font-medium" style={{ fontWeight: 500 }}>
                          {label}
                        </span>
                        <ChevronDown className={`h-4 w-4 transition ${businessMenuOpen ? 'rotate-180' : ''}`} strokeWidth={2} />
                      </button>
                      <div
                        className={`absolute left-0 top-full z-[150] mt-2 w-max min-w-[18rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[8px] border border-[#d9e1ec] bg-white py-2 shadow-[0_18px_45px_rgba(16,24,40,.16)] transition ${
                          businessMenuOpen
                            ? 'pointer-events-auto translate-y-0 opacity-100'
                            : 'pointer-events-none -translate-y-1 opacity-0'
                        }`}
                      >
                        {businessMenuLinks.map(({ href: businessHref, label: businessLabel, description, icon: Icon }) => (
                          <Link
                            key={businessHref}
                            href={businessHref}
                            onClick={(event) => {
                              setBusinessMenuOpen(false)
                              handleInternalNavigation(event, businessHref)
                            }}
                            className="group grid min-h-[58px] w-max max-w-full grid-cols-[36px_max-content] items-start gap-3 px-4 py-2.5 pr-7 text-[#101828] transition hover:bg-[#f5f9ff] hover:text-[#0866ff]"
                          >
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-[#edf5ff] text-[#0866ff]">
                              <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                            </span>
                            <span className="min-w-0 max-w-[min(34rem,calc(100vw-8rem))]">
                              <span className="block w-max max-w-full whitespace-normal text-[14px] font-[500] leading-snug">{businessLabel}</span>
                              <span className="mt-0.5 block w-max max-w-full whitespace-normal break-words text-[12px] font-[400] leading-5 text-[#667085] group-hover:text-[#475467]">
                                {description}
                              </span>
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )
                }

                if (item.kind === 'help') {
                  return (
                    <div
                      key={`${item.kind}:${label}:${href}`}
                      ref={helpMenuRef}
                      className="relative flex h-full items-center"
                    >
                      <button
                        type="button"
                        aria-expanded={helpMenuOpen}
                        onClick={() => toggleDesktopMenu('help')}
                        style={{ fontWeight: 500 }}
                        className={`flex h-full items-center gap-1.5 border-b-2 text-[14px] !font-medium transition hover:border-[#0866ff] hover:text-[#0866ff] ${
                          isActive
                            ? 'border-transparent text-[#0866ff]'
                            : 'border-transparent text-[#101828]'
                        }`}
                      >
                        <span className="font-medium" style={{ fontWeight: 500 }}>
                          {label}
                        </span>
                        <ChevronDown className={`h-4 w-4 transition ${helpMenuOpen ? 'rotate-180' : ''}`} strokeWidth={2} />
                      </button>
                      <div
                        className={`absolute left-0 top-full z-[150] mt-2 w-max min-w-[18rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[8px] border border-[#d9e1ec] bg-white py-2 shadow-[0_18px_45px_rgba(16,24,40,.16)] transition ${
                          helpMenuOpen
                            ? 'pointer-events-auto translate-y-0 opacity-100'
                            : 'pointer-events-none -translate-y-1 opacity-0'
                        }`}
                      >
                        {helpMenuLinks.map(({ href: helpHref, label: helpLabel, description, icon: Icon }) => (
                          <Link
                            key={`${helpHref}:${helpLabel}`}
                            href={helpHref}
                            onClick={(event) => {
                              setHelpMenuOpen(false)
                              handleInternalNavigation(event, helpHref)
                            }}
                            className="group grid min-h-[58px] w-max max-w-full grid-cols-[36px_max-content] items-start gap-3 px-4 py-2.5 pr-7 text-[#101828] transition hover:bg-[#f5f9ff] hover:text-[#0866ff]"
                          >
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-[#edf5ff] text-[#0866ff]">
                              <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                            </span>
                            <span className="min-w-0 max-w-[min(34rem,calc(100vw-8rem))]">
                              <span className="block w-max max-w-full whitespace-normal text-[14px] font-[500] leading-snug">{helpLabel}</span>
                              <span className="mt-0.5 block w-max max-w-full whitespace-normal break-words text-[12px] font-[400] leading-5 text-[#667085] group-hover:text-[#475467]">
                                {description}
                              </span>
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )
                }

                return (
                  <Link
                    key={`${label}:${href}`}
                    href={href}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={(event) => handleInternalNavigation(event, href)}
                    className={`flex h-full items-center border-b-2 text-[14px] font-medium transition hover:border-[#0866ff] hover:text-[#0866ff] ${
                      isActive
                        ? 'border-transparent text-[#0866ff]'
                        : 'border-transparent text-[#101828]'
                    }`}
                  >
                    {label}
                  </Link>
                )
              })}
            </nav>

            <div className="ml-auto hidden h-full shrink-0 items-center gap-3 min-[1120px]:flex xl:gap-4">
              {headerAccount.authenticated ? (
                <>
                  {desktopAccountLinks.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={(event) => handleInternalNavigation(event, href)}
                      className="inline-flex h-full items-center gap-1.5 text-[13px] font-medium text-[#101828] transition hover:text-[#0866ff]"
                    >
                      <span className="relative">
                        <Icon className="h-5 w-5" strokeWidth={1.9} />
                        {href === savedHref && savedListingBadge ? (
                          <span className="absolute -right-2.5 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-[#0866ff] px-1 text-[9px] font-semibold leading-none text-white">
                            {savedListingBadge}
                          </span>
                        ) : null}
                        {href === savedSearchesHref && savedSearchBadge ? (
                          <span className="absolute -right-2.5 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-[#0866ff] px-1 text-[9px] font-semibold leading-none text-white">
                            {savedSearchBadge}
                          </span>
                        ) : null}
                      </span>
                      <span>{label}</span>
                    </Link>
                  ))}
                  <HeaderNotificationCenter
                    locale={locale}
                    authenticated
                    unreadMessages={headerAccount.unreadMessages}
                    savedSearchCount={savedSearchCount}
                    messagesHref={accountMessagesHref}
                    savedSearchesHref={savedSearchesHref}
                    profileReminder={profileReminder}
                    onRequireAuth={() => openAuthModal('login')}
                  />
                  <div ref={profileMenuRef} className="relative flex h-full items-center">
                    <button
                      type="button"
                      onClick={() => toggleDesktopMenu('profile')}
                      aria-expanded={profileMenuOpen}
                      className="inline-flex h-full items-center gap-1.5 text-[13px] font-medium text-[#101828] transition hover:text-[#0866ff]"
                    >
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-[#00887a] text-[10px] font-semibold text-white">
                        {mobileAccountInitials}
                      </span>
                      <span>{accountMenuCopy.pages}</span>
                      <ChevronDown className={`h-4 w-4 transition ${profileMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <div
                      className={`absolute right-0 top-full z-[150] mt-2 w-72 overflow-hidden rounded-[8px] border border-[#d9e1ec] bg-white py-2 shadow-[0_18px_45px_rgba(16,24,40,.16)] transition ${
                        profileMenuOpen
                          ? 'pointer-events-auto translate-y-0 opacity-100'
                          : 'pointer-events-none -translate-y-1 opacity-0'
                      }`}
                    >
                      {headerAccount.profileComplete === false ? (
                        <div className="mx-2 mb-2 rounded-[8px] border border-[#cfe0ff] bg-[#eef5ff] p-3">
                          <strong className="block text-sm font-[600] text-[#101828]">
                            {incompleteProfileCopy.title}
                          </strong>
                          <p className="mt-1 text-xs font-[400] leading-5 text-[#475467]">
                            {incompleteProfileCopy.description}
                          </p>
                          <Link
                            href={completeProfileHref}
                            onClick={(event) => handleInternalNavigation(event, completeProfileHref)}
                            className="mt-2.5 inline-flex min-h-9 w-full items-center justify-center rounded-[7px] border border-[#0866ff] bg-white px-3 text-xs font-[600] text-[#0866ff] transition hover:bg-[#e5efff]"
                          >
                            {incompleteProfileCopy.action}
                          </Link>
                        </div>
                      ) : null}
                      {profileMenuLinks.map(({ href, label, icon: Icon }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={(event) => handleInternalNavigation(event, href)}
                          className="flex min-h-11 items-center gap-3 px-4 text-sm font-medium text-[#101828] transition hover:bg-[#f5f9ff] hover:text-[#0866ff]"
                        >
                          <Icon className="h-4.5 w-4.5" strokeWidth={1.9} />
                          {label}
                        </Link>
                      ))}
                      <button
                        type="button"
                        onClick={() => void signOut()}
                        className="flex min-h-11 w-full items-center gap-3 border-t border-[#edf1f6] px-4 pt-2 text-left text-sm font-medium text-[#b42318] transition hover:bg-[#fff5f5]"
                      >
                        <LogOut className="h-4.5 w-4.5" strokeWidth={1.9} />
                        {accountMenuCopy.signOut}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href={savedHref}
                    onClick={(event) => handleInternalNavigation(event, savedHref)}
                    aria-label={publicLabel(t.saved, 'Sparade annonser', t.saved)}
                    className="inline-grid h-10 w-10 place-items-center rounded-full text-[#101828] transition hover:bg-[#f2f6ff] hover:text-[#0866ff]"
                  >
                    <span className="relative">
                      <Heart className="h-5 w-5" strokeWidth={1.9} />
                      {savedListingBadge ? (
                        <span className="absolute -right-2.5 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-[#0866ff] px-1 text-[9px] font-semibold leading-none text-white">
                          {savedListingBadge}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                  <HeaderNotificationCenter
                    locale={locale}
                    authenticated={false}
                    unreadMessages={0}
                    savedSearchCount={savedSearchCount}
                    messagesHref={accountMessagesHref}
                    savedSearchesHref={savedSearchesHref}
                    onRequireAuth={() => openAuthModal('login', savedSearchesHref)}
                  />
                  <button
                    type="button"
                    onClick={() => openAuthModal('login')}
                    className="inline-flex h-full items-center gap-2.5 px-2 text-[14px] font-medium text-[#101828] transition hover:text-[#0866ff]"
                  >
                    <CircleUserRound className="h-[23px] w-[23px]" strokeWidth={1.55} />
                    <span>{t.signIn}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          <span
            data-mobile-header-divider
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-[55px] h-px bg-[#d0d5dd] min-[1120px]:hidden"
          />

          {mobileCategoryLinks ? (
            <div className="relative border-t border-[#e7e9ee] bg-white min-[1120px]:hidden">
              <nav
                aria-label={`${activeCategoryCopy?.label || ''} navigation`}
                className="flex h-[54px] items-stretch gap-7 overflow-x-auto px-6 pr-12 text-[13px] font-semibold text-[#344054] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {mobileCategoryLinks.map(([href, label]) => (
                  <Link
                    key={href}
                    href={href}
                    aria-current={pathname === href ? 'page' : undefined}
                    onClick={(event) => handleCategoryNavigation(event, href)}
                    className={`flex shrink-0 items-center border-b-[3px] pt-px ${
                      pathname === href
                        ? 'border-[#0866ff] font-semibold text-[#101828]'
                        : 'border-transparent'
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </nav>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-white via-white/95 to-white/0"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#0866ff]/55 shadow-[8px_0_0_rgba(8,102,255,.28),16px_0_0_rgba(8,102,255,.14)]"
              />
            </div>
          ) : null}
        </header>

        <div
          className={`absolute inset-x-0 top-full h-[calc(100dvh-56px)] overflow-y-auto border-t border-[#e6edf5] bg-white shadow-[0_24px_60px_rgba(32,33,36,.14)] transition duration-300 min-[1120px]:hidden ${
            open
              ? 'pointer-events-auto translate-y-0 opacity-100'
              : 'pointer-events-none -translate-y-3 opacity-0'
          }`}
        >
          <div className="mx-auto flex min-h-full max-w-2xl flex-col px-4 py-5 sm:px-8">
            <div className="mb-4 rounded-[18px] border border-[#dfe8f3] bg-[#f7faff] p-3 shadow-[0_12px_32px_rgba(16,24,40,.05)]">
              <SiteSearch locale={locale} mobile onNavigate={closeMobile} />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7a8082]">
                {t.shopByCategory}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                {visibleSearchCategoryItems.map(({ href, label, icon: Icon, slug: categorySlug }) => {
                  const CategoryIcon =
                    (categorySlug && autorellCategoryIcons[categorySlug]) || Icon
                  const itemHref = searchCategoryHref(href)
                  const isActive = categorySlug === mobileMenuActiveSlug

                  return (
                    <Link
                      key={`${searchMenuIntent}-${itemHref}`}
                      href={itemHref}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={closeMobile}
                      className={`flex min-h-12 items-center gap-2 rounded-[14px] border px-3 text-sm font-semibold transition ${
                        isActive
                          ? 'border-[#bcd3ff] bg-[#f5f7fa] text-[#0866ff]'
                          : 'border-[#dfe4ec] bg-[#fbfcff] text-[#344054] hover:border-[#bcd3ff] hover:bg-white'
                      }`}
                    >
                      <CategoryIcon className="h-4 w-4 shrink-0 text-[#0866ff]" />
                      <span className="min-w-0 truncate">{label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>

            <nav className="mt-6 grid gap-2">
              {mobileMainLinks.map(({ href, label, icon: Icon, children, menu }) => {
                const expanded =
                  menu === 'help'
                    ? mobileHelpMenuOpen
                    : menu === 'business'
                      ? mobileBusinessMenuOpen
                      : mobileSellMenuOpen
                const toggleExpanded = () => {
                  if (menu === 'help') {
                    setMobileHelpMenuOpen((current) => !current)
                    setMobileBusinessMenuOpen(false)
                    setMobileSellMenuOpen(false)
                  } else if (menu === 'business') {
                    setMobileBusinessMenuOpen((current) => !current)
                    setMobileSellMenuOpen(false)
                    setMobileHelpMenuOpen(false)
                  } else {
                    setMobileSellMenuOpen((current) => !current)
                    setMobileBusinessMenuOpen(false)
                    setMobileHelpMenuOpen(false)
                  }
                }

                return (
                <div key={`${menu || 'link'}:${label}:${href}`}>
                  {children ? (
                    <>
                      <button
                        type="button"
                        aria-expanded={expanded}
                        onClick={toggleExpanded}
                        className="group flex min-h-[58px] w-full items-center justify-between rounded-[15px] border border-[#e0e7ef] bg-white px-4 text-left text-[16px] font-semibold text-[#101828] shadow-[0_10px_26px_rgba(16,24,40,.04)] transition hover:border-[#bcd3ff] hover:bg-[#f7fbff]"
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[13px] bg-[#edf5ff] text-[#0866ff]">
                            <Icon className="h-[18px] w-[18px]" />
                          </span>
                          <span className="min-w-0 truncate">{label}</span>
                        </span>
                        <ChevronDown className={`h-5 w-5 shrink-0 text-[#667085] transition ${expanded ? 'rotate-180 text-[#0866ff]' : ''}`} />
                      </button>
                      <div
                        className={`grid transition-all duration-200 ${
                          expanded ? 'mt-2 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="grid gap-2 rounded-[15px] border border-[#dbe6f4] bg-[#f7fbff] p-2">
                            {children.map((child) => {
                              const { href: childHref, label: childLabel, icon: ChildIcon } = child
                              const requiresLogin = 'requiresLogin' in child && child.requiresLogin
                              return (
                                <Link
                                  key={`${childHref}:${childLabel}`}
                                  href={childHref}
                                  onClick={(event) => {
                                    if (requiresLogin) {
                                      event.preventDefault()
                                      closeMobile()
                                      openAuthModal('login', childHref)
                                      return
                                    }
                                    handleInternalNavigation(event, childHref)
                                  }}
                                  className="flex min-h-12 items-center justify-between rounded-[12px] bg-white px-3 text-[15px] font-semibold text-[#101828] shadow-[0_6px_16px_rgba(16,24,40,.035)] transition active:bg-[#f2f7ff]"
                                >
                                  <span className="flex min-w-0 items-center gap-3">
                                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-[#edf5ff] text-[#0866ff]">
                                      <ChildIcon className="h-4 w-4" />
                                    </span>
                                    <span className="min-w-0 truncate">{childLabel}</span>
                                  </span>
                                  <ArrowRight className="h-4 w-4 shrink-0 text-[#98a2b3]" />
                                </Link>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <Link
                      href={href}
                      onClick={(event) => handleInternalNavigation(event, href)}
                      className="group flex min-h-[58px] items-center justify-between rounded-[15px] border border-[#e0e7ef] bg-white px-4 text-[16px] font-semibold text-[#101828] shadow-[0_10px_26px_rgba(16,24,40,.04)] transition hover:border-[#bcd3ff] hover:bg-[#f7fbff]"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[13px] bg-[#edf5ff] text-[#0866ff]">
                          <Icon className="h-[18px] w-[18px]" />
                        </span>
                        <span className="min-w-0 truncate">{label}</span>
                      </span>
                      <ArrowRight className="h-5 w-5 shrink-0 text-[#667085] transition group-hover:translate-x-1 group-hover:text-[#0866ff]" />
                    </Link>
                  )}
                </div>
              )})}
            </nav>

            <Link
              href={localizePublicHref(locale, '/contact')}
              onClick={closeMobile}
              className="mt-3 flex min-h-14 items-center justify-between rounded-[15px] border border-[#d9e2f0] bg-white px-5 text-base font-semibold text-[#101828] shadow-[0_12px_28px_rgba(32,33,36,.08)]"
            >
              <span className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-[#0866ff]" />
                {t.contact}
              </span>
              <ArrowRight className="h-5 w-5" />
            </Link>

            <div className="mt-6 rounded-[18px] border border-[#dfe8f3] bg-[#fbfcff] p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7a8082]">
                {headerAccount.authenticated ? t.myAutorell : t.createAccount}
              </p>
              {headerAccount.authenticated ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Link href={accountHref} onClick={closeMobile} className="flex min-h-12 items-center gap-3 rounded-[12px] bg-[#0866ff] px-4 text-sm font-medium text-white">
                    <UserRound size={17} />
                    {accountMenuCopy.pages}
                  </Link>
                  <Link href={accountMessagesHref} onClick={closeMobile} className="relative flex min-h-12 items-center gap-3 rounded-[12px] bg-[#242424] px-4 text-sm text-white">
                    <MessageSquareText size={17} />
                    {t.messages}
                    {headerAccount.unreadMessages ? (
                      <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-[#0866ff] px-1.5 text-[10px] font-semibold">
                        {headerAccount.unreadMessages > 99 ? '99+' : headerAccount.unreadMessages}
                      </span>
                    ) : null}
                  </Link>
                </div>
              ) : (
                <div className="mt-4 flex items-center gap-4">
                  <CircleUserRound className="h-11 w-11 shrink-0 text-[#101828]" strokeWidth={1.55} />
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => openAuthModal('login')}
                      className="block text-left text-base font-semibold text-[#101828]"
                    >
                      {t.signIn}
                    </button>
                    <p className="mt-0.5 text-sm leading-5 text-[#475467]">
                      {accountMenuCopy.newHere}{' '}
                      <button
                        type="button"
                        onClick={() => openAuthModal('register')}
                        className="font-semibold text-[#0866ff]"
                      >
                        {accountMenuCopy.startHere}
                      </button>
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
      <div
        className={`fixed left-0 right-auto top-0 z-[130] h-[56px] w-[100dvw] max-w-[100dvw] transform-gpu grid-cols-[minmax(0,1fr)_auto] items-center overflow-hidden bg-white pl-3 pr-3 transition-transform duration-300 min-[1120px]:hidden ${hideOnMobile ? 'hidden' : 'grid'} ${
          visible || mobileCategoryOpen || mobileMoreOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="flex min-w-0 items-center gap-2 self-center">
          <button
            type="button"
            onClick={() => {
              setMobileMoreOpen((current) => !current)
              setMobileCategoryOpen(false)
              setOpen(false)
            }}
            aria-label={mobileMoreOpen ? t.closeMenu : t.openMenu}
            aria-expanded={mobileMoreOpen}
            className="relative grid h-11 w-8 shrink-0 place-items-center text-[#101828]"
          >
            <span
              className={`absolute h-[1.6px] w-[20px] rounded-full bg-current transition-transform duration-200 ease-out ${
                mobileMoreOpen ? 'translate-y-0 rotate-45' : '-translate-y-[6px] rotate-0'
              }`}
            />
            <span
              className={`absolute h-[1.6px] w-[20px] rounded-full bg-current transition-opacity duration-150 ease-out ${
                mobileMoreOpen ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <span
              className={`absolute h-[1.6px] w-[20px] rounded-full bg-current transition-transform duration-200 ease-out ${
                mobileMoreOpen ? 'translate-y-0 -rotate-45' : 'translate-y-[6px] rotate-0'
              }`}
            />
          </button>
          <Link
            href={homeHref}
            aria-label="Autorell"
            className="flex h-11 w-[116px] min-w-0 -translate-y-[2px] items-center justify-start overflow-hidden"
            onClick={handleHomeLogoClick}
          >
            <BrandLogo underline={false} />
          </Link>
        </div>
        <div
          className={`shrink-0 items-center justify-end justify-self-end gap-1 self-center ${
            mobileMoreOpen ? 'hidden' : 'flex'
          }`}
        >
          {headerAccount.authenticated ? (
            <Link
              href={savedSearchesHref}
              onClick={closeMobile}
              aria-label={translatePublic(locale, 'Saved searches')}
              className="hidden h-11 w-11 shrink-0 place-items-center text-[#101828] transition hover:text-[#0866ff]"
            >
              <span className="relative">
                <Bookmark className="h-[22px] w-[22px]" strokeWidth={1.7} />
                {savedSearchBadge ? (
                  <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#0866ff] px-1 text-[9px] font-semibold leading-none text-white">
                    {savedSearchBadge}
                  </span>
                ) : null}
              </span>
            </Link>
          ) : null}
          {headerAccount.authenticated ? (
            <Link
              href={accountHref}
              onClick={closeMobile}
              className="flex h-11 shrink-0 items-center gap-2 rounded-full px-1.5 text-[13px] font-semibold text-[#101828]"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#00887a] text-[12px] font-semibold text-white">
                {mobileAccountInitials}
              </span>
              <span className="whitespace-nowrap">{mobileProfileLabel}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal('login', accountHref)}
              className="flex h-11 shrink-0 items-center gap-1.5 rounded-full px-1.5 text-[13px] font-semibold text-[#101828]"
            >
              <CircleUserRound className="h-[23px] w-[23px]" strokeWidth={1.55} />
              <span>{t.signIn}</span>
            </button>
          )}
        </div>
      </div>
      {mobileCategoryOpen ? (
        <>
          <button
            type="button"
            aria-label={t.closeMenu}
            onClick={() => setMobileCategoryOpen(false)}
            className="fixed inset-0 z-[125] bg-transparent min-[1120px]:hidden"
          />
          <div className="fixed inset-x-3 top-[64px] z-[131] max-h-[calc(100dvh-88px)] overflow-y-auto rounded-[22px] border border-[#dfe8f3] bg-white p-3 shadow-[0_24px_70px_rgba(16,24,40,.18)] min-[1120px]:hidden">
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#667085]">
                {t.shopByCategory}
              </p>
              <button
                type="button"
                onClick={() => setMobileCategoryOpen(false)}
                aria-label={t.closeMenu}
                className="grid h-8 w-8 place-items-center rounded-full bg-[#f4f7fb] text-[#101828]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {visibleSearchCategoryItems.map(({ href, label, icon: Icon, slug: categorySlug }) => {
                const CategoryIcon =
                  (categorySlug && autorellCategoryIcons[categorySlug]) || Icon
                const itemHref = searchCategoryHref(href)

                return (
                  <Link
                    key={`${searchMenuIntent}-${itemHref}`}
                    href={itemHref}
                    onClick={closeMobile}
                    className="flex min-h-12 items-center gap-2 rounded-[14px] border border-[#dfe4ec] bg-[#fbfcff] px-3 text-sm font-semibold text-[#101828] transition active:scale-[.99]"
                  >
                    <CategoryIcon className="h-4 w-4 shrink-0 text-[#0866ff]" />
                    <span className="min-w-0 truncate">{label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </>
      ) : null}
      {mobileMoreOpen ? (
        <>
          <button
            type="button"
            aria-label={t.closeMenu}
            onClick={() => setMobileMoreOpen(false)}
            className="fixed inset-x-0 bottom-0 top-[56px] z-[118] bg-[#101828]/18 backdrop-blur-[1px] min-[1120px]:hidden"
          />
          <div className="fixed bottom-0 left-0 top-[56px] z-[126] w-[100dvw] max-w-[100dvw] animate-[autorell-mobile-menu-slide-in_240ms_cubic-bezier(.2,.7,.2,1)_both] overflow-y-auto bg-white px-4 pb-[calc(98px+env(safe-area-inset-bottom))] pt-5 shadow-[20px_0_70px_rgba(16,24,40,.18)] min-[1120px]:hidden">
            <div data-mobile-menu-divider aria-hidden="true" className="-mx-4 -mt-5 mb-4 h-px bg-[#e4e7ec]" />
            <section className={headerAccount.authenticated ? 'mb-5 rounded-[24px] bg-[#f6f6f4] p-5' : 'mb-4 px-1'}>
              {headerAccount.authenticated ? (
                <div>
                  <Link
                    href={accountHref}
                    onClick={closeMobile}
                    className="flex items-center gap-3 text-[#101828]"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#00887a] text-sm font-semibold text-white ring-1 ring-[#00766a]">
                      {mobileAccountInitials}
                    </span>
                    <span className="min-w-0 flex-1">
                      <strong className="block truncate text-[19px] font-semibold tracking-[-0.02em]">
                        {mobileAccountName}
                      </strong>
                      <span className="mt-0.5 block text-sm font-medium text-[#667085]">
                        {mobileAccountTypeLabel}
                      </span>
                    </span>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#eaf1ff] text-[#0866ff]">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                  {headerAccount.profileComplete === false ? (
                    <div className="mt-4 rounded-[10px] border border-[#cfe0ff] bg-[#eef5ff] p-3">
                      <strong className="block text-sm font-[600] text-[#101828]">
                        {incompleteProfileCopy.title}
                      </strong>
                      <p className="mt-1 text-xs font-[400] leading-5 text-[#475467]">
                        {incompleteProfileCopy.description}
                      </p>
                      <Link
                        href={completeProfileHref}
                        onClick={closeMobile}
                        className="mt-2.5 inline-flex min-h-9 w-full items-center justify-center rounded-[7px] border border-[#0866ff] bg-white px-3 text-xs font-[600] text-[#0866ff]"
                      >
                        {incompleteProfileCopy.action}
                      </Link>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="flex items-center gap-3 py-1">
                  <CircleUserRound className="h-11 w-11 shrink-0 text-[#202124]" strokeWidth={1.55} />
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => openAuthModal('login', accountHref)}
                      className="block text-left text-[16px] font-semibold leading-6 text-[#202124] transition-colors hover:text-[#0866ff]"
                    >
                      {t.signIn}
                    </button>
                    <p className="text-[14px] leading-5 text-[#475467]">
                      {accountMenuCopy.newHere}{' '}
                      <button
                        type="button"
                        onClick={() => openAuthModal('register')}
                        className="font-semibold text-[#0866ff] transition-colors hover:text-[#005bd8]"
                      >
                        {accountMenuCopy.startHere}
                      </button>
                    </p>
                  </div>
                </div>
              )}
            </section>
            <div data-mobile-menu-divider aria-hidden="true" className="-mx-4 mb-5 h-px bg-[#e4e7ec]" />

            <section className="mb-5">
              <div className="-mx-1 flex flex-wrap gap-2">
                {visibleSearchCategoryItems.map(({ href, label, slug: categorySlug }) => {
                  const isActive = categorySlug === mobileMenuActiveSlug
                  const itemHref = searchCategoryHref(href)
                  return (
                    <Link
                      key={`${searchMenuIntent}-${itemHref}`}
                      href={itemHref}
                      onClick={closeMobile}
                      className={`min-h-8 rounded-full px-3 py-1.5 text-[13px] font-semibold shadow-[0_4px_14px_rgba(16,24,40,.09)] ring-1 transition active:scale-[.99] ${
                        isActive
                          ? 'bg-[#0866ff] text-white ring-[#0866ff] shadow-[0_8px_18px_rgba(8,102,255,.18)]'
                          : 'bg-white text-[#344054] ring-[#eef0f3]'
                      }`}
                    >
                      {label}
                    </Link>
                  )
                })}
              </div>
            </section>
            <div data-mobile-menu-divider aria-hidden="true" className="-mx-4 mb-5 h-px bg-[#e4e7ec]" />

            <section className="mb-7">
              <div className="grid gap-2">
                {mobileMainLinks.map(({ href, label, icon: Icon, children, menu }) => {
                  const expanded =
                    menu === 'help'
                      ? mobileHelpMenuOpen
                      : menu === 'business'
                        ? mobileBusinessMenuOpen
                        : mobileSellMenuOpen
                  const toggleExpanded = () => {
                    if (menu === 'help') {
                      setMobileHelpMenuOpen((current) => !current)
                      setMobileBusinessMenuOpen(false)
                      setMobileSellMenuOpen(false)
                    } else if (menu === 'business') {
                      setMobileBusinessMenuOpen((current) => !current)
                      setMobileSellMenuOpen(false)
                      setMobileHelpMenuOpen(false)
                    } else {
                      setMobileSellMenuOpen((current) => !current)
                      setMobileBusinessMenuOpen(false)
                      setMobileHelpMenuOpen(false)
                    }
                  }

                  return (
                  <div key={`${menu || 'link'}:${label}:${href}`}>
                    {children ? (
                      <>
                        <button
                          type="button"
                          aria-expanded={expanded}
                          onClick={toggleExpanded}
                          className="group flex min-h-[56px] w-full items-center justify-between rounded-[16px] border border-[#e0e7ef] bg-white px-3 text-left text-[17px] font-semibold tracking-[-0.01em] text-[#101828] shadow-[0_8px_24px_rgba(16,24,40,.045)] transition active:bg-[#f7fbff]"
                        >
                          <span className="flex min-w-0 items-center gap-3">
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[13px] bg-[#edf5ff] text-[#0866ff]">
                              <Icon className="h-[18px] w-[18px]" />
                            </span>
                            <span className="min-w-0 truncate">{label}</span>
                          </span>
                          <ChevronDown className={`h-4 w-4 shrink-0 text-[#98a2b3] transition ${expanded ? 'rotate-180 text-[#0866ff]' : ''}`} />
                        </button>
                        <div
                          className={`grid transition-all duration-200 ${
                            expanded ? 'mt-2 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                          }`}
                        >
                          <div className="overflow-hidden">
                            <div className="grid gap-2 rounded-[16px] border border-[#dbe6f4] bg-[#f7fbff] p-2">
                              {children.map((child) => {
                                const { href: childHref, label: childLabel, icon: ChildIcon } = child
                                const requiresLogin = 'requiresLogin' in child && child.requiresLogin
                                return (
                                  <Link
                                    key={`${childHref}:${childLabel}`}
                                    href={childHref}
                                    onClick={(event) => {
                                      if (requiresLogin) {
                                        event.preventDefault()
                                        closeMobile()
                                        openAuthModal('login', childHref)
                                        return
                                      }
                                      handleInternalNavigation(event, childHref)
                                    }}
                                    className="flex min-h-12 items-center justify-between rounded-[12px] bg-white px-3 text-[15px] font-semibold text-[#101828] shadow-[0_6px_16px_rgba(16,24,40,.035)] transition active:bg-[#f2f7ff]"
                                  >
                                    <span className="flex min-w-0 items-center gap-3">
                                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-[#edf5ff] text-[#0866ff]">
                                        <ChildIcon className="h-4 w-4" />
                                      </span>
                                      <span className="min-w-0 truncate">{childLabel}</span>
                                    </span>
                                    <ArrowRight className="h-4 w-4 shrink-0 text-[#98a2b3]" />
                                  </Link>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <Link
                        href={href}
                        onClick={(event) => handleInternalNavigation(event, href)}
                        className="group flex min-h-[56px] items-center justify-between rounded-[16px] border border-[#e0e7ef] bg-white px-3 text-[17px] font-semibold tracking-[-0.01em] text-[#101828] shadow-[0_8px_24px_rgba(16,24,40,.045)] transition active:bg-[#f7fbff]"
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[13px] bg-[#edf5ff] text-[#0866ff]">
                            <Icon className="h-[18px] w-[18px]" />
                          </span>
                          <span className="min-w-0 truncate">{label}</span>
                        </span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-[#98a2b3] transition group-active:translate-x-0.5" />
                      </Link>
                    )}
                  </div>
                )})}
              </div>
            </section>

            <div data-mobile-menu-divider aria-hidden="true" className="-mx-4 mb-4 h-px bg-[#e4e7ec]" />
            <section className="pb-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMoreOpen(false)
                  setMarketSelectorOpen(true)
                }}
                aria-label={t.chooseLanguage}
                className="flex min-h-12 w-full items-center justify-between px-1 text-left text-[15px] font-semibold text-[#101828] transition-colors hover:text-[#0866ff]"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <FlagIcon code={activeMarket[1]} size="sm" />
                  <span className="truncate">{activeMarket[2]}</span>
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 text-[#667085]" />
              </button>
            </section>

          </div>
        </>
      ) : null}
      <nav
        ref={mobileBottomNavRef}
        className={`pointer-events-none fixed bottom-0 left-1/2 z-[120] -translate-x-1/2 transform-gpu pb-[var(--autorell-mobile-bottom-gap,20px)] transition-transform duration-300 min-[1120px]:hidden ${hideMobileBottomNav || authModalOpen ? 'hidden' : ''} ${
          keepMobileBottomNavVisible || visible || open || mobileCategoryOpen || mobileMoreOpen ? 'translate-y-0' : 'translate-y-[115%]'
        }`}
        aria-label={publicLabel('Mobile navigation', 'Mobil navigering', 'Mobile Navigation')}
        data-autorell-mobile-nav-tone={mobileNavOverMedia ? 'light' : 'dark'}
        style={{ width: 'min(960px, calc(100vw - 32px))' }}
      >
        <div
          className={`pointer-events-auto grid h-[56px] w-full grid-cols-4 items-center rounded-[28px] px-1.5 backdrop-blur-[28px] backdrop-saturate-[165%] transition-[background-color,color] duration-300 ${
            mobileNavOverMedia
              ? 'bg-[#111827]/70 supports-[backdrop-filter]:bg-[#111827]/58'
              : 'bg-white/78 supports-[backdrop-filter]:bg-white/58'
          }`}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}
        >
          <Link
            href={vehicleSearchHref}
            onClick={closeMobile}
            className={`flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-[22px] px-0.5 py-1.5 transition active:scale-[.98] ${
              isMarketplaceResults || isFindCarsPage ? 'bg-[#eef5ff] text-[#0866ff]' : mobileNavOverMedia ? 'text-white' : 'text-[#101828]'
            }`}
          >
            <Search className="h-[21px] w-[21px]" strokeWidth={1.8} />
            <span className="max-w-full truncate text-[9px] font-normal leading-none min-[380px]:text-[10px]">
              {publicLabel('Search', 'Sök', 'Suche')}
            </span>
          </Link>
          {headerAccount.authenticated ? (
            <Link
              href={accountMessagesHref}
              onClick={closeMobile}
              className={`flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-[22px] px-0.5 py-1.5 transition active:scale-[.98] ${
                unprefixedPathname.startsWith('/account/messages') ? 'bg-[#eef5ff] text-[#0866ff]' : mobileNavOverMedia ? 'text-white' : 'text-[#101828]'
              }`}
            >
              <span className="relative">
                <MessageSquareText className="h-[21px] w-[21px]" strokeWidth={1.7} />
                {headerAccount.unreadMessages ? (
                  <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#0866ff] px-1 text-[9px] font-semibold leading-none text-white">
                    {headerAccount.unreadMessages > 99 ? '99+' : headerAccount.unreadMessages}
                  </span>
                ) : null}
              </span>
              <span className="max-w-full truncate text-[9px] font-normal leading-none min-[380px]:text-[10px]">{t.messages}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal('login', accountMessagesHref)}
              className={`flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-[22px] px-0.5 py-1.5 transition active:scale-[.98] ${mobileNavOverMedia ? 'text-white' : 'text-[#101828]'}`}
            >
              <MessageSquareText className="h-[21px] w-[21px]" strokeWidth={1.7} />
              <span className="max-w-full truncate text-[9px] font-normal leading-none min-[380px]:text-[10px]">{t.messages}</span>
            </button>
          )}
          {headerAccount.authenticated ? (
            <Link
              href={savedHref}
              onClick={closeMobile}
              className={`flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-[22px] px-0.5 py-1.5 transition active:scale-[.98] ${mobileNavOverMedia ? 'text-white' : 'text-[#101828]'}`}
            >
              <span className="relative">
                <Heart className="h-[21px] w-[21px]" strokeWidth={1.7} />
                {savedListingCount ? (
                  <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#0866ff] px-1 text-[9px] font-semibold leading-none text-white">
                    {savedListingBadge}
                  </span>
                ) : null}
              </span>
              <span className="max-w-full truncate text-[9px] font-normal leading-none min-[380px]:text-[10px]">{t.saved}</span>
            </Link>
          ) : (
            <Link
              href={savedHref}
              onClick={closeMobile}
              className={`flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-[22px] px-0.5 py-1.5 transition active:scale-[.98] ${mobileNavOverMedia ? 'text-white' : 'text-[#101828]'}`}
            >
              <span className="relative">
                <Heart className="h-[21px] w-[21px]" strokeWidth={1.7} />
                {savedListingCount ? (
                  <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#0866ff] px-1 text-[9px] font-semibold leading-none text-white">
                    {savedListingBadge}
                  </span>
                ) : null}
              </span>
              <span className="max-w-full truncate text-[9px] font-normal leading-none min-[380px]:text-[10px]">{t.saved}</span>
            </Link>
          )}
          {headerAccount.authenticated ? (
            <Link
              href={savedSearchesHref}
              onClick={closeMobile}
              className={`flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-[22px] px-0.5 py-1.5 transition active:scale-[.98] ${mobileNavOverMedia ? 'text-white' : 'text-[#101828]'}`}
            >
              <span className="relative">
                <Bookmark className="h-[21px] w-[21px]" strokeWidth={1.7} />
                {savedSearchBadge ? (
                  <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#0866ff] px-1 text-[9px] font-semibold leading-none text-white">
                    {savedSearchBadge}
                  </span>
                ) : null}
              </span>
              <span className="max-w-full truncate text-[9px] font-normal leading-none min-[380px]:text-[10px]">
                {mobileSavedSearchesLabel}
              </span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal('login', savedSearchesHref)}
              className={`flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-[22px] px-0.5 py-1.5 transition active:scale-[.98] ${mobileNavOverMedia ? 'text-white' : 'text-[#101828]'}`}
            >
              <Bookmark className="h-[21px] w-[21px]" strokeWidth={1.7} />
              <span className="max-w-full truncate text-[9px] font-normal leading-none min-[380px]:text-[10px]">
                {mobileSavedSearchesLabel}
              </span>
            </button>
          )}
        </div>
      </nav>
      <MarketSelectorModal
        isOpen={marketSelectorOpen}
        onClose={() => setMarketSelectorOpen(false)}
        locale={locale}
      />
      <IncompleteProfilePrompt
        key={incompletePrivateProfile ? `${headerAccount.displayName || 'private'}:incomplete` : 'complete'}
        open={incompletePrivateProfile && !isPrivateProfilePage}
        href={completeProfileHref}
        copy={incompleteProfileCopy}
        closeLabel={t.closeMenu}
      />
      {authModalOpen ? (
        <AuthModal
          key={`${authInitialView}:${authDestination || ''}:${authBusinessRegistration ? 'business' : 'private'}`}
          isOpen={authModalOpen}
          initialMode={authInitialMode}
          initialView={authInitialView}
          initialBusinessRegistration={authBusinessRegistration}
          postLoginDestination={authDestination}
          locale={locale}
          onClose={() => setAuthModalOpen(false)}
          onAuthenticated={refreshHeaderAccount}
        />
      ) : null}
    </>
  )
}

function getIncompleteProfileCopy(locale: PublicLocale) {
  const copy: Record<PublicLocale, { title: string; description: string; action: string }> = {
    sv: { title: 'Din profil är inte komplett', description: 'Fyll i de viktigaste uppgifterna innan du skapar en annons.', action: 'Komplettera din profil' },
    en: { title: 'Your profile is incomplete', description: 'Add the essential details before creating a listing.', action: 'Complete your profile' },
    de: { title: 'Ihr Profil ist unvollständig', description: 'Ergänzen Sie die wichtigsten Angaben, bevor Sie eine Anzeige erstellen.', action: 'Profil vervollständigen' },
    at: { title: 'Ihr Profil ist unvollständig', description: 'Ergänzen Sie die wichtigsten Angaben, bevor Sie eine Anzeige erstellen.', action: 'Profil vervollständigen' },
    be: { title: 'Je profiel is niet compleet', description: 'Vul de belangrijkste gegevens in voordat je een advertentie plaatst.', action: 'Profiel voltooien' },
    fr: { title: 'Votre profil est incomplet', description: 'Ajoutez les informations essentielles avant de créer une annonce.', action: 'Compléter votre profil' },
    es: { title: 'Tu perfil está incompleto', description: 'Añade los datos esenciales antes de crear un anuncio.', action: 'Completar el perfil' },
    it: { title: 'Il tuo profilo è incompleto', description: 'Aggiungi i dati essenziali prima di creare un annuncio.', action: 'Completa il profilo' },
    pl: { title: 'Twój profil jest niekompletny', description: 'Uzupełnij najważniejsze dane przed utworzeniem ogłoszenia.', action: 'Uzupełnij profil' },
    nl: { title: 'Je profiel is niet compleet', description: 'Vul de belangrijkste gegevens in voordat je een advertentie plaatst.', action: 'Profiel voltooien' },
    fi: { title: 'Profiilisi on puutteellinen', description: 'Täydennä tärkeimmät tiedot ennen ilmoituksen luomista.', action: 'Täydennä profiili' },
    da: { title: 'Din profil er ikke komplet', description: 'Tilføj de vigtigste oplysninger, før du opretter en annonce.', action: 'Udfyld din profil' },
  }
  return copy[locale]
}

