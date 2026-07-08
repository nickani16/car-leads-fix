'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ArrowRight,
  Bookmark,
  Building2,
  CarFront,
  ChevronDown,
  CircleHelp,
  FilePlus2,
  Heart,
  Home,
  LogIn,
  LogOut,
  Mail,
  MessageSquareText,
  Plus,
  Search,
  Settings,
  Store,
  UserPlus,
  UserRound,
  Warehouse,
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
import BrandLogo from './BrandLogo'
import { autorellCategoryIcons } from './AutorellCategoryIcons'
import { FlagIcon, MarketSelectorModal } from './PublicFooter'
import SiteSearch from './SiteSearch'
import { euBuyerMarkets } from '@/lib/eu-buyer-markets'
import {
  categorySearchPath,
  marketplaceCategories,
  marketplaceLanguage,
} from '@/lib/marketplace'
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
} from '@/lib/public-i18n'
import { createClient } from '@/lib/supabase/client'
import AuthModal from './AuthModal'

type PublicHeaderProps = {
  transparentAtTop?: boolean
  locale?: PublicLocale
  marketplaceChannel?: {
    label: string
    slug: string
  }
  marketCode?: string
}

type MenuItem = {
  href: string
  label: string
  description: string
  icon: LucideIcon
}

type HeaderAccount = {
  authenticated: boolean
  displayName?: string
  accountType?: 'private' | 'business' | null
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
  const market = euBuyerMarkets.find((item) => item.code === first)
  if (market) return market.language as PublicLocale
  if (
    [
      'en',
      'fr',
      'es',
      'it',
      'pl',
      'nl',
      'pt',
      'fi',
      'da',
      'cs',
      'ro',
      'bg',
      'hr',
      'el',
      'hu',
      'sk',
      'sl',
      'et',
      'lv',
      'lt',
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
    sell: 'Sell vehicle',
    business: 'Business account',
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
    sell: 'Fahrzeug verkaufen',
    business: 'Unternehmenskonto',
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
    { href: '/konto/annonser/ny', label: 'Lägg upp annons', description: 'Publicera ett fordon med bilder, pris och fordonsdata.', icon: FilePlus2 },
    { href: '/register', label: 'Skapa konto', description: 'Välj privatkonto eller företagskonto.', icon: UserPlus },
    { href: '/pricing', label: 'Annonspriser', description: 'Jämför annonspaket och synlighet.', icon: Store },
    { href: '/how-selling-works', label: 'Så fungerar försäljning', description: 'Från annons till kontakt med köpare.', icon: CircleHelp },
  ],
  en: [
    { href: '/account/listings/new', label: 'Create listing', description: 'Publish a vehicle with images, price and structured data.', icon: FilePlus2 },
    { href: '/register', label: 'Create account', description: 'Choose a private or business account.', icon: UserPlus },
    { href: '/pricing', label: 'Listing prices', description: 'Compare packages and visibility.', icon: Store },
    { href: '/how-selling-works', label: 'How selling works', description: 'From listing to buyer enquiry.', icon: CircleHelp },
  ],
  de: [
    { href: '/account/listings/new', label: 'Anzeige erstellen', description: 'Fahrzeug mit Bildern, Preis und Daten veröffentlichen.', icon: FilePlus2 },
    { href: '/register', label: 'Konto erstellen', description: 'Privat- oder Unternehmenskonto wählen.', icon: UserPlus },
    { href: '/pricing', label: 'Anzeigenpreise', description: 'Pakete und Sichtbarkeit vergleichen.', icon: Store },
    { href: '/how-selling-works', label: 'So funktioniert der Verkauf', description: 'Von der Anzeige bis zur Käuferanfrage.', icon: CircleHelp },
  ],
}

const businessItems: Record<'sv' | 'en' | 'de', MenuItem[]> = {
  sv: [
    { href: '/business', label: 'För företag', description: 'Översikt över Autorells företagslösningar.', icon: Building2 },
    { href: '/register?account=business', label: 'Företagskonto', description: 'Skapa ett konto för organisationen.', icon: UserRound },
    { href: '/konto/annonser/ny', label: 'Annonsera fordon', description: 'Publicera enstaka fordon eller hela lagret.', icon: FilePlus2 },
    { href: '/konto/annonser', label: 'Hantera lager', description: 'Se och uppdatera företagets annonser.', icon: Warehouse },
    { href: '/contact', label: 'Kontakta oss', description: 'Prata med oss om större volymer.', icon: CircleHelp },
  ],
  en: [
    { href: '/business', label: 'For business', description: "Explore Autorell's business solutions.", icon: Building2 },
    { href: '/register?account=business', label: 'Business account', description: 'Create an account for your organisation.', icon: UserRound },
    { href: '/account/listings/new', label: 'Advertise vehicles', description: 'Publish one vehicle or your whole inventory.', icon: FilePlus2 },
    { href: '/account/listings', label: 'Manage inventory', description: 'Review and update company listings.', icon: Warehouse },
    { href: '/contact', label: 'Contact us', description: 'Talk to us about larger volumes.', icon: CircleHelp },
  ],
  de: [
    { href: '/business', label: 'Für Unternehmen', description: 'Autorells Unternehmenslösungen entdecken.', icon: Building2 },
    { href: '/register?account=business', label: 'Unternehmenskonto', description: 'Ein Konto für Ihr Unternehmen erstellen.', icon: UserRound },
    { href: '/account/listings/new', label: 'Fahrzeuge inserieren', description: 'Ein Fahrzeug oder den gesamten Bestand veröffentlichen.', icon: FilePlus2 },
    { href: '/account/listings', label: 'Bestand verwalten', description: 'Unternehmensanzeigen prüfen und aktualisieren.', icon: Warehouse },
    { href: '/contact', label: 'Kontakt', description: 'Sprechen Sie mit uns über größere Volumen.', icon: CircleHelp },
  ],
}

export default function PublicHeader({
  locale: providedLocale,
  marketplaceChannel,
  marketCode,
}: PublicHeaderProps) {
  const pathname = usePathname()
  const locale = providedLocale || localeFromPathname(pathname)
  const unprefixedPathname = stripLocalePrefix(pathname)
  const language = marketplaceLanguage(locale)
  const t =
    locale === 'sv' || locale === 'de' || locale === 'en'
      ? copy[language]
      : translatePublicObject(locale, copy.en)
  const [open, setOpen] = useState(false)
  const [marketSelectorOpen, setMarketSelectorOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login')
  const [authDestination, setAuthDestination] = useState<string | undefined>()
  const [headerAccount, setHeaderAccount] = useState<HeaderAccount>(() => readCachedHeaderAccount())
  const [savedListingCount, setSavedListingCount] = useState(0)
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(false)
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [visible, setVisible] = useState(true)
  const [atPageTop, setAtPageTop] = useState(() => typeof window === 'undefined' || window.scrollY < 8)
  const lastScrollY = useRef(0)
  const profileMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const difference = currentScrollY - lastScrollY.current
      setAtPageTop(currentScrollY < 8)

      if (currentScrollY < 10) setVisible(true)
      else if (difference > 1) {
        setVisible(false)
        setOpen(false)
        setMarketSelectorOpen(false)
        setMobileCategoryOpen(false)
        setMobileMoreOpen(false)
      } else if (difference < -1) setVisible(true)

      lastScrollY.current = currentScrollY
    }

    lastScrollY.current = window.scrollY
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const refreshHeaderAccount = useCallback(async () => {
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
        const value = JSON.parse(window.localStorage.getItem('autorell-saved-listings') || '[]')
        setSavedListingCount(Array.isArray(value) ? value.length : 0)
      } catch {
        setSavedListingCount(0)
      }
    }
    const openAuth = (event: Event) => {
      const detail = (event as CustomEvent<{ mode?: 'login' | 'register'; destination?: string }>).detail
      openAuthModal(detail?.mode || 'login', detail?.destination)
    }
    const openMarket = () => {
      setAuthModalOpen(false)
      setMarketSelectorOpen(true)
    }
    const timer = window.setTimeout(syncSaved, 0)
    window.addEventListener('autorell:saved-listings', syncSaved)
    window.addEventListener('storage', syncSaved)
    window.addEventListener('autorell:open-auth', openAuth)
    window.addEventListener('autorell:open-market', openMarket)
    window.addEventListener('autorell:auth-changed', refreshHeaderAccount)
    return () => {
      window.removeEventListener('autorell:saved-listings', syncSaved)
      window.removeEventListener('storage', syncSaved)
      window.removeEventListener('autorell:open-auth', openAuth)
      window.removeEventListener('autorell:open-market', openMarket)
      window.removeEventListener('autorell:auth-changed', refreshHeaderAccount)
      window.clearTimeout(timer)
    }
  }, [refreshHeaderAccount])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!profileMenuOpen) return

    function handlePointerDown(event: PointerEvent) {
      const target = event.target
      if (!(target instanceof Node)) return
      if (profileMenuRef.current?.contains(target)) return
      setProfileMenuOpen(false)
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setProfileMenuOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [profileMenuOpen])

  const buyItems: MenuItem[] = marketplaceCategories.map((category) => {
    const label =
      locale === 'sv' || locale === 'de' || locale === 'en'
        ? category.labels[language]
        : translatePublic(locale, category.labels.en)
    return {
      href: localizePublicHref(locale, categorySearchPath(category.slug)),
      label,
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
      ['se', 'SE', 'Sverige', 'https://www.autorell.com/se'] as const,
      ['de', 'DE', 'Deutschland', 'https://www.autorell.com/de'] as const,
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

  const homeHref = localizePublicHref(locale, '/')
  const marketPathPrefix = activeMarketCode === 'eu' ? '' : `/${activeMarketCode}`
  const accountHref = `${marketPathPrefix}/account`
  const accountMessagesHref = `${marketPathPrefix}/account/messages`
  const savedHref = `${marketPathPrefix}/saved`
  const savedSearchesHref = `${marketPathPrefix}/saved-searches`
  const vehicleSearchHref = localizePublicHref(locale, '/marketplace')
  const isHomePage = unprefixedPathname === '/'
  const isFindCarsPage = unprefixedPathname === '/find-cars'
  const isMarketplaceResults =
    unprefixedPathname === '/marketplace' || unprefixedPathname.startsWith('/marketplace/')
  const isListingDetail = unprefixedPathname.startsWith('/listings/')
  const showTopCategoryNav = false
  const renderTopCategoryNav = showTopCategoryNav && atPageTop
  const showMobileCategoryNav =
    Boolean(categoryPrimaryLinks) && !isMarketplaceResults && !isListingDetail
  const mobileCategoryLinks = showMobileCategoryNav ? categoryPrimaryLinks : null
  const headerSpacerClass = showMobileCategoryNav
    ? showTopCategoryNav
      ? 'h-[110px] min-[1120px]:h-[80px]'
      : 'h-[110px] min-[1120px]:h-[58px]'
    : showTopCategoryNav
      ? 'h-[56px] min-[1120px]:h-[80px]'
      : 'h-[56px] min-[1120px]:h-[58px]'
  const desktopMainRowHeightClass = showTopCategoryNav
    ? 'min-[1120px]:h-[52px]'
    : 'min-[1120px]:h-[58px]'
  const createListingHref = localizePublicHref(locale, '/account/listings/new')
  const mobileMainLinks = [
    {
      href: localizePublicHref(locale, '/marketplace'),
      label: language === 'sv' ? 'Sök fordon' : 'Search vehicles',
      icon: Search,
    },
    { href: createListingHref, label: language === 'sv' ? 'Sälja' : t.sell, icon: Plus },
    { href: localizePublicHref(locale, '/business'), label: t.business, icon: Building2 },
    {
      href: localizePublicHref(locale, '/help-center'),
      label: language === 'sv' ? 'Hjälpcenter' : t.help,
      icon: CircleHelp,
    },
  ]
  const accountListingsHref = `${marketPathPrefix}/account/listings`
  const desktopNavLinks = [
    { href: localizePublicHref(locale, '/marketplace'), label: language === 'sv' ? 'Sök fordon' : 'Search vehicles' },
    { href: createListingHref, label: language === 'sv' ? 'Sälja' : t.sell },
    { href: localizePublicHref(locale, '/business'), label: t.business },
    { href: localizePublicHref(locale, '/help-center'), label: language === 'sv' ? 'Hjälpcenter' : t.help },
  ]
  const desktopAccountLinks = [
    { href: savedHref, label: language === 'sv' ? 'Sparade annonser' : t.saved, icon: Heart },
    { href: savedSearchesHref, label: language === 'sv' ? 'Sparade sökningar' : 'Saved searches', icon: Bookmark },
    { href: accountMessagesHref, label: t.messages, icon: MessageSquareText },
  ]
  const profileMenuLinks = [
    { href: createListingHref, label: language === 'sv' ? 'Skapa annons' : 'Create listing', icon: FilePlus2 },
    { href: accountHref, label: language === 'sv' ? 'Inställningar' : 'Settings', icon: Settings },
    { href: accountListingsHref, label: language === 'sv' ? 'Mina annonser' : 'My listings', icon: CarFront },
  ]
  const mobileAccountName =
    headerAccount.displayName?.trim().split(/\s+/)[0] ||
    (headerAccount.authenticated ? t.myAutorell : t.signIn)
  const mobileProfileLabel = locale === 'sv' ? 'Min profil' : locale === 'en' ? 'My profile' : t.profileNav
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
  }

  function openAuthModal(mode: 'login' | 'register', destination?: string) {
    setAuthInitialMode(mode)
    setAuthDestination(destination)
    setAuthModalOpen(true)
    setOpen(false)
    setMobileCategoryOpen(false)
    setMobileMoreOpen(false)
    setProfileMenuOpen(false)
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
    closeMobile()
  }

  function handleHomeLogoClick(event: ReactMouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    setProfileMenuOpen(false)
    closeMobile()
    window.location.assign(homeHref)
  }

  function handleCategoryNavigation(
    event: ReactMouseEvent<HTMLAnchorElement>,
    href: string,
  ) {
    const targetPath = stripLocalePrefix(new URL(href, window.location.origin).pathname)
    if (targetPath === '/sell-vehicle') {
      event.preventDefault()
      openAuthModal('login', href)
      return
    }
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
          visible || open ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <header className="relative border-b border-[#deddd8] bg-white text-[#202124]">
          {renderTopCategoryNav ? (
            <div className="hidden border-b border-[#deddd8] bg-white min-[1120px]:block">
              <div className="mx-auto flex h-[30px] max-w-[1920px] items-center justify-between px-4 sm:px-8 min-[1120px]:px-4 2xl:px-4">
                <nav className="flex min-w-0 items-center gap-4 overflow-hidden text-[10px] text-[#41474b] xl:gap-5 xl:text-[11px]">
                  {buyItems.map(({ href, label }, index) => {
                    const category = marketplaceCategories[index]
                    const isActive =
                      pathname === href ||
                      (category && unprefixedPathname === `/marketplace/${category.slug}`)
                    const topLabel =
                      category && topCategoryLabels[category.slug]
                        ? topCategoryLabels[category.slug]![language]
                        : label
                    return (
                      <Link
                        key={href}
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

          <div className={`relative mx-auto flex h-[56px] max-w-[var(--autorell-page-max)] items-center px-4 sm:px-8 ${desktopMainRowHeightClass} min-[1120px]:max-w-[1920px] min-[1120px]:px-4 2xl:px-4`}>
            <Link
              href={homeHref}
              aria-label="Autorell"
              onClick={handleHomeLogoClick}
              className="hidden h-full shrink-0 flex-col items-center justify-center border-b-2 border-transparent pt-1 transition hover:border-[#0866ff] min-[1120px]:inline-flex"
            >
              <BrandLogo underline={false} />
            </Link>

            <nav className="ml-14 hidden h-full shrink-0 items-center gap-7 overflow-visible whitespace-nowrap min-[1120px]:flex xl:ml-16 xl:gap-8">
              {desktopNavLinks.map(({ href, label }) => {
                const targetPath = stripLocalePrefix(href.split('?')[0] || href)
                const isActive =
                  unprefixedPathname === targetPath ||
                  (targetPath === '/marketplace' && (isMarketplaceResults || isFindCarsPage))

                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={(event) => handleInternalNavigation(event, href)}
                    className={`flex h-full items-center border-b-2 text-[14px] font-medium transition hover:border-[#0866ff] hover:text-[#0866ff] ${
                      isActive
                        ? 'border-[#0866ff] text-[#0866ff]'
                        : 'border-transparent text-[#101828]'
                    }`}
                  >
                    {label}
                  </Link>
                )
              })}
            </nav>

            <div className="ml-auto hidden h-full shrink-0 items-center gap-4 min-[1120px]:flex xl:gap-6">
              {headerAccount.authenticated ? (
                <>
                  {desktopAccountLinks.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={(event) => handleInternalNavigation(event, href)}
                      className="inline-flex h-full items-center gap-2 text-[14px] font-medium text-[#101828] transition hover:text-[#0866ff]"
                    >
                      <Icon className="h-[22px] w-[22px]" strokeWidth={1.9} />
                      <span>{label}</span>
                    </Link>
                  ))}
                  <div ref={profileMenuRef} className="relative flex h-full items-center">
                    <button
                      type="button"
                      onClick={() => setProfileMenuOpen((current) => !current)}
                      aria-expanded={profileMenuOpen}
                      className="inline-flex h-full items-center gap-2 text-[14px] font-medium text-[#101828] transition hover:text-[#0866ff]"
                    >
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-[#e9f0fd] text-[11px] font-semibold text-[#0866ff]">
                        {mobileAccountInitials}
                      </span>
                      <span>{language === 'sv' ? 'Min profil' : t.myAutorell}</span>
                      <ChevronDown className={`h-4 w-4 transition ${profileMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <div
                      className={`absolute right-0 top-full z-[150] mt-2 w-56 overflow-hidden rounded-[8px] border border-[#d9e1ec] bg-white py-2 shadow-[0_18px_45px_rgba(16,24,40,.16)] transition ${
                        profileMenuOpen
                          ? 'pointer-events-auto translate-y-0 opacity-100'
                          : 'pointer-events-none -translate-y-1 opacity-0'
                      }`}
                    >
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
                        {language === 'sv' ? 'Logga ut' : 'Sign out'}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="inline-flex h-full items-center gap-2.5 px-2 text-[14px] font-medium text-[#101828] transition hover:text-[#0866ff]"
                >
                  <UserRound className="h-[21px] w-[21px]" strokeWidth={2} />
                  <span>{t.signIn}</span>
                </button>
              )}
            </div>
          </div>

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
                {buyItems.map(({ href, label, icon: Icon }, index) => {
                  const categorySlug = marketplaceCategories[index]?.slug
                  const CategoryIcon =
                    (categorySlug && autorellCategoryIcons[categorySlug]) || Icon

                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={closeMobile}
                      className="flex min-h-12 items-center gap-2 rounded-[14px] border border-[#dfe4ec] bg-[#fbfcff] px-3 text-sm font-semibold text-[#344054] transition hover:border-[#bcd3ff] hover:bg-white"
                    >
                      <CategoryIcon className="h-4 w-4 shrink-0 text-[#0866ff]" />
                      <span className="min-w-0 truncate">{label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>

            <nav className="mt-6 grid gap-2">
              {mobileMainLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
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
              ))}
            </nav>

            <Link
              href={localizePublicHref(locale, '/sell-vehicle')}
              onClick={closeMobile}
              className="mt-6 flex min-h-14 items-center justify-between rounded-[15px] bg-[#0866ff] px-5 text-base font-semibold text-white shadow-[0_16px_36px_rgba(8,102,255,.24)]"
            >
              {t.mobileCta}
              <ArrowRight className="h-5 w-5" />
            </Link>

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
                    {t.myAutorell}
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
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button type="button" onClick={() => openAuthModal('register')} className="flex min-h-12 items-center gap-3 rounded-[12px] bg-[#0866ff] px-4 text-left text-sm font-medium text-white">
                    <UserPlus size={17} />
                    {t.createAccount}
                  </button>
                  <button type="button" onClick={() => openAuthModal('login')} className="flex min-h-12 items-center gap-3 rounded-[12px] bg-[#242424] px-4 text-left text-sm text-white">
                    <LogIn size={17} />
                    {t.signIn}
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
      <div
        className={`fixed left-0 right-auto top-0 z-[130] grid h-[56px] w-[100dvw] max-w-[100dvw] transform-gpu grid-cols-[minmax(0,1fr)_auto] items-center overflow-hidden bg-white pl-3 pr-3 transition-transform duration-300 min-[1120px]:hidden ${
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
            className="relative grid h-11 w-9 shrink-0 place-items-center text-[#101828]"
          >
            <span
              className={`absolute h-[1.7px] w-[22px] rounded-full bg-current transition-transform duration-200 ease-out ${
                mobileMoreOpen ? 'translate-y-0 rotate-45' : '-translate-y-[6.5px] rotate-0'
              }`}
            />
            <span
              className={`absolute h-[1.7px] w-[22px] rounded-full bg-current transition-opacity duration-150 ease-out ${
                mobileMoreOpen ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <span
              className={`absolute h-[1.7px] w-[22px] rounded-full bg-current transition-transform duration-200 ease-out ${
                mobileMoreOpen ? 'translate-y-0 -rotate-45' : 'translate-y-[6.5px] rotate-0'
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
              aria-label={language === 'sv' ? 'Sparade sökningar' : 'Saved searches'}
              className="hidden h-11 w-11 shrink-0 place-items-center text-[#101828] transition hover:text-[#0866ff]"
            >
              <Bookmark className="h-[22px] w-[22px]" strokeWidth={1.7} />
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal('login', savedSearchesHref)}
              aria-label={language === 'sv' ? 'Sparade sökningar' : 'Saved searches'}
              className="hidden h-11 w-11 shrink-0 place-items-center text-[#101828] transition hover:text-[#0866ff]"
            >
              <Bookmark className="h-[22px] w-[22px]" strokeWidth={1.7} />
            </button>
          )}
          {headerAccount.authenticated ? (
            <Link
              href={accountHref}
              onClick={closeMobile}
              className="flex h-11 shrink-0 items-center gap-2 rounded-full px-1.5 text-[13px] font-semibold text-[#101828]"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#e9f0fd] text-[12px] font-semibold text-[#0866ff]">
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
              <UserRound className="h-[21px] w-[21px]" strokeWidth={1.8} />
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
              {buyItems.map(({ href, label, icon: Icon }, index) => {
                const categorySlug = marketplaceCategories[index]?.slug
                const CategoryIcon =
                  (categorySlug && autorellCategoryIcons[categorySlug]) || Icon

                return (
                  <Link
                    key={href}
                    href={href}
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
            <section className="mb-6 rounded-[24px] bg-[#f6f6f4] p-5">
              {headerAccount.authenticated ? (
                <Link
                  href={accountHref}
                  onClick={closeMobile}
                  className="flex items-center gap-3 text-[#101828]"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#e9f0fd] text-sm font-semibold text-[#0866ff] ring-1 ring-[#d6e4ff]">
                    {mobileAccountInitials}
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-[19px] font-semibold tracking-[-0.02em]">
                      {mobileAccountName}
                    </strong>
                    <span className="mt-0.5 block text-sm font-medium text-[#667085]">
                      {t.myAutorell}
                    </span>
                  </span>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#eaf1ff] text-[#0866ff]">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              ) : (
                <div>
                  <div className="flex items-start gap-3">
                    <UserRound className="mt-0.5 h-7 w-7 shrink-0 text-[#202124]" strokeWidth={1.7} />
                    <div>
                      <h2 className="text-[19px] font-semibold tracking-[-0.02em] text-[#202124]">
                        {t.signIn}
                      </h2>
                      <p className="mt-1 max-w-[28rem] text-[15px] font-medium leading-6 text-[#344054]">
                        {locale === 'sv'
                          ? 'Spara fordon, s\u00f6kningar och f\u00e5 enklare kontakt med s\u00e4ljare.'
                          : locale === 'de'
                            ? 'Fahrzeuge und Suchen speichern und Verk\u00e4ufer einfacher kontaktieren.'
                            : 'Save vehicles, searches and contact sellers faster.'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => openAuthModal('login', accountHref)}
                    className="mt-5 flex min-h-12 w-full items-center justify-center rounded-full border border-[#0866ff] bg-white px-5 text-[15px] font-semibold text-[#0866ff]"
                  >
                    {locale === 'sv'
                      ? 'Logga in eller skapa konto'
                      : locale === 'de'
                        ? 'Anmelden oder Konto erstellen'
                        : 'Sign in or create an account'}
                  </button>
                </div>
              )}
            </section>

            <section className="mb-7">
              <div className="-mx-1 flex flex-wrap gap-2">
                {buyItems.map(({ href, label }, index) => {
                  const categorySlug = marketplaceCategories[index]?.slug
                  const isActive = categorySlug === mobileMenuActiveSlug
                  return (
                    <Link
                      key={href}
                      href={href}
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

            <section className="mb-7">
              <div className="grid gap-2">
                {mobileMainLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
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
                ))}
              </div>
            </section>

          </div>
        </>
      ) : null}
      <nav
        className={`fixed bottom-0 left-0 right-auto z-[120] w-[100dvw] max-w-[100dvw] transform-gpu overflow-hidden border-t border-[#e6ebf2] bg-white/96 shadow-[0_-10px_30px_rgba(16,24,40,.08)] backdrop-blur transition-transform duration-300 min-[1120px]:hidden ${
          visible || open || mobileCategoryOpen || mobileMoreOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="grid h-[54px] w-[100dvw] max-w-[100dvw] grid-cols-5 px-1 pt-1">
          <Link
            href={homeHref}
            onClick={closeMobile}
            className={`hidden min-w-0 flex-col items-center justify-center gap-0.5 ${
              isHomePage ? 'text-[#0866ff]' : 'text-[#202124]'
            }`}
          >
            <Home className="h-[22px] w-[22px]" strokeWidth={1.7} />
            <span className="max-w-full truncate text-[10px] font-medium leading-none">{t.home}</span>
          </Link>
          <Link
            href={vehicleSearchHref}
            onClick={closeMobile}
            className={`order-1 flex min-w-0 flex-col items-center justify-center gap-0.5 ${
              isMarketplaceResults || isFindCarsPage ? 'text-[#0866ff]' : 'text-[#202124]'
            }`}
          >
            <Search className="h-[22px] w-[22px]" strokeWidth={1.8} />
            <span className="max-w-full truncate text-[10px] font-medium leading-none">
              {language === 'sv' ? 'Sök' : 'Search'}
            </span>
          </Link>
          {headerAccount.authenticated ? (
            <Link
              href={createListingHref}
              onClick={closeMobile}
              className="order-2 flex min-w-0 flex-col items-center justify-center gap-0.5 text-[#202124]"
            >
              <Plus className="h-[22px] w-[22px]" strokeWidth={1.8} />
              <span className="max-w-full truncate text-[10px] font-medium leading-none">{t.sell}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal('login', createListingHref)}
              className="order-2 flex min-w-0 flex-col items-center justify-center gap-0.5 text-[#202124]"
            >
              <Plus className="h-[22px] w-[22px]" strokeWidth={1.8} />
              <span className="max-w-full truncate text-[10px] font-medium leading-none">{t.sell}</span>
            </button>
          )}
          {headerAccount.authenticated ? (
            <Link
              href={accountMessagesHref}
              onClick={closeMobile}
              className="order-3 flex min-w-0 flex-col items-center justify-center gap-0.5 text-[#202124]"
            >
              <span className="relative">
                <MessageSquareText className="h-[22px] w-[22px]" strokeWidth={1.7} />
                {headerAccount.unreadMessages ? (
                  <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#0866ff] px-1 text-[9px] font-semibold leading-none text-white">
                    {headerAccount.unreadMessages > 99 ? '99+' : headerAccount.unreadMessages}
                  </span>
                ) : null}
              </span>
              <span className="max-w-full truncate text-[10px] font-medium leading-none">{t.messages}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal('login', accountMessagesHref)}
              className="order-3 flex min-w-0 flex-col items-center justify-center gap-0.5 text-[#202124]"
            >
              <MessageSquareText className="h-[22px] w-[22px]" strokeWidth={1.7} />
              <span className="max-w-full truncate text-[10px] font-medium leading-none">{t.messages}</span>
            </button>
          )}
          {headerAccount.authenticated ? (
            <Link
              href={savedHref}
              onClick={closeMobile}
              className="order-4 flex min-w-0 flex-col items-center justify-center gap-0.5 text-[#202124]"
            >
              <span className="relative">
                <Heart className="h-[22px] w-[22px]" strokeWidth={1.7} />
                {savedListingCount ? (
                  <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#0866ff] px-1 text-[9px] font-semibold leading-none text-white">
                    {savedListingCount > 99 ? '99+' : savedListingCount}
                  </span>
                ) : null}
              </span>
              <span className="max-w-full truncate text-[10px] font-medium leading-none">{t.saved}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal('login', savedHref)}
              className="order-4 flex min-w-0 flex-col items-center justify-center gap-0.5 text-[#202124]"
            >
              <Heart className="h-[22px] w-[22px]" strokeWidth={1.7} />
              <span className="max-w-full truncate text-[10px] font-medium leading-none">{t.saved}</span>
            </button>
          )}
          {headerAccount.authenticated ? (
            <Link
              href={savedSearchesHref}
              onClick={closeMobile}
              className="order-5 flex min-w-0 flex-col items-center justify-center gap-0.5 text-[#202124]"
            >
              <Bookmark className="h-[22px] w-[22px]" strokeWidth={1.7} />
              <span className="max-w-full truncate text-[10px] font-medium leading-none">
                {language === 'sv' ? 'Sparade sökningar' : 'Saved searches'}
              </span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal('login', savedSearchesHref)}
              className="order-5 flex min-w-0 flex-col items-center justify-center gap-0.5 text-[#202124]"
            >
              <Bookmark className="h-[22px] w-[22px]" strokeWidth={1.7} />
              <span className="max-w-full truncate text-[10px] font-medium leading-none">
                {language === 'sv' ? 'Sparade sökningar' : 'Saved searches'}
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
      {authModalOpen ? (
        <AuthModal
          key={`${authInitialMode}:${authDestination || ''}`}
          isOpen={authModalOpen}
          initialMode={authInitialMode}
          postLoginDestination={authDestination}
          locale={locale}
          onClose={() => setAuthModalOpen(false)}
          onAuthenticated={refreshHeaderAccount}
        />
      ) : null}
    </>
  )
}

