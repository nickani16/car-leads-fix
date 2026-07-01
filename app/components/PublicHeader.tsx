'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ArrowRight,
  Building2,
  ChevronDown,
  CircleHelp,
  FileText,
  FilePlus2,
  Heart,
  LogIn,
  Mail,
  Menu,
  MessageSquareText,
  Search,
  ShieldAlert,
  ShieldCheck,
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
import { FlagIcon, MarketSelectorModal } from './PublicFooter'
import SiteSearch from './SiteSearch'
import SocialIcons from './SocialIcons'
import { euBuyerMarkets } from '@/lib/eu-buyer-markets'
import {
  marketplaceCategories,
  marketplaceLanguage,
} from '@/lib/marketplace'
import {
  categoryLandingMenuHref,
  categoryLandingPath,
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

type DesktopMenuData = {
  variant?: 'mega'
  eyebrow: string
  title: string
  text: string
  cta: string
  ctaHref: string
  items: MenuItem[]
  features?: Array<{
    title: string
    text: string
    icon: LucideIcon
  }>
  allCategoriesLabel?: string
  allCategoriesText?: string
}

type HeaderAccount = {
  authenticated: boolean
  displayName?: string
  accountType?: 'private' | 'business' | null
  unreadMessages: number
  conversationCount: number
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
    hello: 'Hej',
    myAutorell: 'Mitt Konto',
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
    hello: 'Hi',
    myAutorell: 'My Account',
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
    hello: 'Hallo',
    myAutorell: 'Mein Konto',
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
    { href: '/salj-fordon#priser', label: 'Annonspriser', description: 'Jämför annonspaket och synlighet.', icon: Store },
    { href: '/salj-fordon#sa-fungerar-det', label: 'Så fungerar försäljning', description: 'Från annons till kontakt med köpare.', icon: CircleHelp },
  ],
  en: [
    { href: '/account/listings/new', label: 'Create listing', description: 'Publish a vehicle with images, price and structured data.', icon: FilePlus2 },
    { href: '/register', label: 'Create account', description: 'Choose a private or business account.', icon: UserPlus },
    { href: '/salj-fordon#priser', label: 'Listing prices', description: 'Compare packages and visibility.', icon: Store },
    { href: '/salj-fordon#sa-fungerar-det', label: 'How selling works', description: 'From listing to buyer enquiry.', icon: CircleHelp },
  ],
  de: [
    { href: '/account/listings/new', label: 'Anzeige erstellen', description: 'Fahrzeug mit Bildern, Preis und Daten veröffentlichen.', icon: FilePlus2 },
    { href: '/register', label: 'Konto erstellen', description: 'Privat- oder Unternehmenskonto wählen.', icon: UserPlus },
    { href: '/salj-fordon#priser', label: 'Anzeigenpreise', description: 'Pakete und Sichtbarkeit vergleichen.', icon: Store },
    { href: '/salj-fordon#sa-fungerar-det', label: 'So funktioniert der Verkauf', description: 'Von der Anzeige bis zur Käuferanfrage.', icon: CircleHelp },
  ],
}

const businessItems: Record<'sv' | 'en' | 'de', MenuItem[]> = {
  sv: [
    { href: '/foretag', label: 'För företag', description: 'Översikt över Autorells företagslösningar.', icon: Building2 },
    { href: '/register?account=business', label: 'Företagskonto', description: 'Skapa ett konto för organisationen.', icon: UserRound },
    { href: '/konto/annonser/ny', label: 'Annonsera fordon', description: 'Publicera enstaka fordon eller hela lagret.', icon: FilePlus2 },
    { href: '/konto/annonser', label: 'Hantera lager', description: 'Se och uppdatera företagets annonser.', icon: Warehouse },
    { href: '/contact', label: 'Kontakta oss', description: 'Prata med oss om större volymer.', icon: CircleHelp },
  ],
  en: [
    { href: '/foretag', label: 'For business', description: "Explore Autorell's business solutions.", icon: Building2 },
    { href: '/register?account=business', label: 'Business account', description: 'Create an account for your organisation.', icon: UserRound },
    { href: '/account/listings/new', label: 'Advertise vehicles', description: 'Publish one vehicle or your whole inventory.', icon: FilePlus2 },
    { href: '/account/listings', label: 'Manage inventory', description: 'Review and update company listings.', icon: Warehouse },
    { href: '/contact', label: 'Contact us', description: 'Talk to us about larger volumes.', icon: CircleHelp },
  ],
  de: [
    { href: '/foretag', label: 'Für Unternehmen', description: 'Autorells Unternehmenslösungen entdecken.', icon: Building2 },
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
  const [headerAccount, setHeaderAccount] = useState<HeaderAccount>({
    authenticated: false,
    unreadMessages: 0,
    conversationCount: 0,
  })
  const [savedListingCount, setSavedListingCount] = useState(0)
  const [moreOpen, setMoreOpen] = useState(false)
  const [desktopMenuOpen, setDesktopMenuOpen] = useState<string | null>(null)
  const [visible, setVisible] = useState(true)
  const lastScrollY = useRef(0)
  const moreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const difference = currentScrollY - lastScrollY.current

      if (currentScrollY < 80) setVisible(true)
      else if (difference > 7) {
        setVisible(false)
        setOpen(false)
        setMarketSelectorOpen(false)
        setMoreOpen(false)
        setDesktopMenuOpen(null)
      } else if (difference < -4) setVisible(true)

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
      window.__autorellHeaderAccount = data
      window.dispatchEvent(
        new CustomEvent('autorell:header-account', { detail: data }),
      )
    } catch {
      const fallback = {
        authenticated: false,
        unreadMessages: 0,
        conversationCount: 0,
      }
      setHeaderAccount(fallback)
      window.__autorellHeaderAccount = fallback
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
    if (!moreOpen) return
    const close = (event: PointerEvent) => {
      if (!moreRef.current?.contains(event.target as Node)) setMoreOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMoreOpen(false)
    }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [moreOpen])

  useEffect(() => {
    if (!desktopMenuOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDesktopMenuOpen(null)
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [desktopMenuOpen])

  const buyItems: MenuItem[] = marketplaceCategories.map((category) => {
    const label =
      locale === 'sv' || locale === 'de' || locale === 'en'
        ? category.labels[language]
        : translatePublic(locale, category.labels.en)
    return {
      href: localizePublicHref(locale, categoryLandingPath(category.slug)),
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
  const localizedSellerItems =
    locale === 'sv' || locale === 'de' || locale === 'en'
      ? sellerItems[language]
      : translatePublicObject(locale, sellerItems.en)
  const localizedBusinessItems =
    locale === 'sv' || locale === 'de' || locale === 'en'
      ? businessItems[language]
      : translatePublicObject(locale, businessItems.en)
  const activeCategorySlug =
    marketplaceCategories.find(
      (category) =>
        unprefixedPathname === categoryLandingPath(category.slug) ||
        unprefixedPathname === `/marketplace/${category.slug}`,
    )?.slug || null
  const activeMarketplaceChannel =
    marketplaceChannel ||
    (activeCategorySlug
      ? {
          slug: activeCategorySlug,
          label:
            buyItems.find((item) => item.href === localizePublicHref(locale, categoryLandingPath(activeCategorySlug)))
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
  const menus: Array<{
    label: string
    href: string
    icon: LucideIcon
    data: DesktopMenuData
  }> = [
    {
      label: t.buy,
      href: localizePublicHref(locale, '/cars'),
      icon: Search,
      data: {
        variant: 'mega',
        eyebrow: t.buy,
        title: t.buyTitle,
        text: t.buyText,
        cta: t.buyCta,
        ctaHref: localizePublicHref(locale, '/marketplace/cars'),
        items: buyItems,
        features: [
          { title: t.verifiedSellers, text: t.verifiedSellersText, icon: ShieldCheck },
          { title: t.securePayments, text: t.securePaymentsText, icon: ShieldCheck },
          { title: t.support24, text: t.support24Text, icon: CircleHelp },
        ],
        allCategoriesLabel: t.allCategoriesLabel,
        allCategoriesText: t.allCategoriesText,
      },
    },
    {
      label: t.sell,
      href: localizePublicHref(locale, '/salj-fordon'),
      icon: FilePlus2,
      data: {
        eyebrow: t.sell,
        title: t.sellTitle,
        text: t.sellText,
        cta: t.sellCta,
        ctaHref: localizePublicHref(locale, language === 'sv' ? '/konto/annonser/ny' : '/account/listings/new'),
        items: localizedSellerItems,
      },
    },
    {
      label: t.business,
      href: localizePublicHref(locale, '/foretag'),
      icon: Building2,
      data: {
        eyebrow: t.business,
        title: t.businessTitle,
        text: t.businessText,
        cta: t.businessCta,
        ctaHref: localizePublicHref(locale, '/foretag'),
        items: localizedBusinessItems,
      },
    },
  ]

  const categoryPrimaryLinks =
    activeCategoryConfig && activeCategoryCopy
      ? [
          [
            localizePublicHref(locale, activeCategoryConfig.path),
            activeCategoryCopy.label,
          ] as const,
          ...activeCategoryCopy.menu.map(
            (label) =>
              [
                localizePublicHref(
                  locale,
                  categoryLandingMenuHref(activeCategoryConfig, label),
                ),
                label,
              ] as const,
          ),
        ]
      : null
  const categoryLinkTextLength =
    categoryPrimaryLinks?.reduce((total, [, label]) => total + label.length, 0) ?? 0
  const shouldCollapseCategoryLinks =
    Boolean(categoryPrimaryLinks && categoryPrimaryLinks.length > 3 && categoryLinkTextLength > 82)
  const visibleCategoryLinks = shouldCollapseCategoryLinks
    ? categoryPrimaryLinks?.slice(0, 3) ?? []
    : categoryPrimaryLinks ?? []
  const overflowCategoryLinks = shouldCollapseCategoryLinks
    ? categoryPrimaryLinks?.slice(3) ?? []
    : []
  const moreLinks = [
    { href: localizePublicHref(locale, '/vanliga-fragor'), label: t.faq, icon: CircleHelp },
    { href: localizePublicHref(locale, '/contact'), label: t.contact, icon: UserRound },
    { href: localizePublicHref(locale, '/terms'), label: t.terms, icon: FileText },
    { href: localizePublicHref(locale, '/privacy'), label: t.privacy, icon: ShieldCheck },
    { href: localizePublicHref(locale, '/report'), label: t.reportAbuse, icon: ShieldAlert },
    { href: localizePublicHref(locale, '/om-oss'), label: t.about, icon: Building2 },
  ]

  const languageOptions: Array<readonly [string, string, string, string]> = [
    ['eu', 'EU', 'English', 'https://www.autorell.com/?market=en'] as const,
    ...([
    ['se', 'SE', 'Sverige', 'https://www.autorell.com/se'] as const,
    ['de', 'DE', 'Deutschland', 'https://www.autorell.com/de'] as const,
    ...euBuyerMarkets.map((market) =>
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
  const savedHref = `${marketPathPrefix}/sparade`
  const isMarketplaceResults = unprefixedPathname.startsWith('/marketplace/')
  const isListingDetail = unprefixedPathname.startsWith('/listings/')
  const showMobileCategoryNav =
    Boolean(categoryPrimaryLinks) && !isMarketplaceResults && !isListingDetail
  const mobileCategoryLinks = showMobileCategoryNav ? categoryPrimaryLinks : null
  const mobileMainLinks = [
    ...menus.map(({ href, label, icon }) => ({ href, label, icon })),
    { href: localizePublicHref(locale, '/help-center'), label: t.help, icon: CircleHelp },
    { href: localizePublicHref(locale, '/contact'), label: t.contact, icon: Mail },
  ]

  function closeMobile() {
    setOpen(false)
  }

  function openAuthModal(mode: 'login' | 'register', destination?: string) {
    setAuthInitialMode(mode)
    setAuthDestination(destination)
    setAuthModalOpen(true)
    setOpen(false)
    setMoreOpen(false)
    setDesktopMenuOpen(null)
  }

  useEffect(() => {
    if (!desktopMenuOpen) return

    function handlePointerDown(event: PointerEvent) {
      const target = event.target
      if (!(target instanceof Element)) return
      if (target.closest('[data-desktop-menu-root="true"]')) return
      setDesktopMenuOpen(null)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [desktopMenuOpen])

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
    closeMobile()
  }

  function handleCategoryNavigation(
    event: ReactMouseEvent<HTMLAnchorElement>,
    href: string,
  ) {
    const targetPath = stripLocalePrefix(new URL(href, window.location.origin).pathname)
    if (targetPath === '/salj-fordon') {
      event.preventDefault()
      openAuthModal('login', href)
      return
    }
    handleInternalNavigation(event, href)
  }

  return (
    <>
      <div
        className={
          showMobileCategoryNav
            ? 'h-[110px] min-[1120px]:h-[80px]'
            : 'h-[56px] min-[1120px]:h-[80px]'
        }
        aria-hidden="true"
      />
      <div
        className={`fixed inset-x-0 top-0 z-[100] transform-gpu transition-transform duration-300 ${
          visible || open ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <header className="relative border-b border-[#deddd8] bg-white text-[#202124]">
          <div className="hidden border-b border-[#e8e9eb] bg-[#fbfbfc] min-[1120px]:block">
            <div className="mx-auto flex h-[30px] max-w-[var(--autorell-page-max)] items-center justify-between gap-5 px-5 sm:px-8">
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

              <div className="flex h-full shrink-0 items-center">
                <Link
                  href={localizePublicHref(locale, '/contact')}
                  className="flex h-full items-center gap-1.5 border-l border-[#e6e7e9] px-3 text-[10px] font-medium hover:bg-white"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {t.contact}
                </Link>
                <div className="relative flex h-full">
                  <button
                    type="button"
                    onClick={() => setMarketSelectorOpen(true)}
                    aria-expanded={marketSelectorOpen}
                    aria-haspopup="dialog"
                    className="flex h-full items-center gap-2 border-l border-r border-[#e6e7e9] px-4 text-[10px] font-medium hover:bg-white"
                  >
                    <FlagIcon code={activeMarket[1]} size="sm" />
                    <span>{activeMarket[2]}</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="relative mx-auto flex h-[56px] max-w-[var(--autorell-page-max)] items-center px-4 sm:px-8 min-[1120px]:h-[50px]">
            <div className="absolute left-1/2 top-0 h-[56px] w-screen max-w-[100vw] -translate-x-1/2 px-4 min-[1120px]:hidden">
              <Link
                href={homeHref}
                aria-label="Autorell"
                className="absolute left-4 top-0 flex h-full min-w-0 max-w-[124px] flex-col items-center justify-center overflow-hidden"
                onClick={closeMobile}
              >
                <BrandLogo underline={false} />
                {activeMarketplaceChannel?.label ? (
                  <span className="mt-0.5 w-full max-w-28 truncate text-right text-[9px] font-semibold leading-none text-[#101828]">
                    {activeMarketplaceChannel.label}
                  </span>
                ) : null}
              </Link>

              <div className="absolute right-1 top-0 flex h-full w-36 items-center justify-end">
                {headerAccount.authenticated ? (
                  <Link href={savedHref} onClick={closeMobile} className="relative flex w-10 shrink-0 flex-col items-center justify-center">
                    <span className="relative">
                      <Heart className="h-[20px] w-[20px]" strokeWidth={1.7} />
                      {savedListingCount ? (
                        <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-[#0866ff] px-1 text-[9px] font-bold leading-none text-white">
                          {savedListingCount > 99 ? '99+' : savedListingCount}
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-0.5 text-[9px] font-normal leading-none">{t.saved}</span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => openAuthModal('login', savedHref)}
                    className="flex w-10 shrink-0 flex-col items-center justify-center"
                  >
                    <Heart className="h-[20px] w-[20px]" strokeWidth={1.7} />
                    <span className="mt-0.5 text-[9px] font-normal leading-none">{t.saved}</span>
                  </button>
                )}

                {headerAccount.authenticated ? (
                  <Link
                    href={accountHref}
                    onClick={closeMobile}
                    className="flex w-10 shrink-0 flex-col items-center justify-center"
                  >
                    <UserRound className="h-[20px] w-[20px]" strokeWidth={1.7} />
                    <span className="mt-0.5 text-[9px] font-normal leading-none">{t.myAutorell.split(' ')[0]}</span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => openAuthModal('login', accountHref)}
                    className="flex w-10 shrink-0 flex-col items-center justify-center"
                  >
                    <UserRound className="h-[20px] w-[20px]" strokeWidth={1.7} />
                    <span className="mt-0.5 text-[9px] font-normal leading-none">{t.signIn}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setOpen((current) => !current)}
                  aria-label={open ? t.closeMenu : t.openMenu}
                  aria-expanded={open}
                  className="flex w-10 shrink-0 flex-col items-center justify-center"
                >
                  {open ? <X className="h-[21px] w-[21px]" strokeWidth={1.8} /> : <Menu className="h-[22px] w-[22px]" strokeWidth={1.8} />}
                  <span className="mt-0.5 text-[9px] font-normal leading-none">{t.menu}</span>
                </button>
              </div>
            </div>

            <Link
              href={homeHref}
              aria-label="Autorell"
              className="hidden h-full shrink-0 flex-col items-center justify-center border-b-2 border-transparent transition hover:border-[#0866ff] min-[1120px]:inline-flex"
            >
              <BrandLogo underline={false} />
              {activeMarketplaceChannel?.label ? (
                <span className="mt-0.5 w-full max-w-[120px] truncate text-right text-[9px] font-semibold leading-none text-[#101828]">
                  {activeMarketplaceChannel.label}
                </span>
              ) : null}
            </Link>

            <nav className="ml-7 hidden h-full min-w-0 flex-1 items-center overflow-visible whitespace-nowrap min-[1120px]:flex xl:ml-9">
              {categoryPrimaryLinks
                ? (
                    <>
                      {visibleCategoryLinks.map(([href, label]) => (
                        <Link
                          key={href}
                          href={href}
                          aria-current={pathname === href ? 'page' : undefined}
                          onClick={(event) => handleCategoryNavigation(event, href)}
                          className={`flex h-full min-w-0 shrink items-center border-b-2 px-3 text-[13px] transition hover:border-[#0866ff] hover:text-[#0866ff] xl:px-4 ${
                            pathname === href
                              ? 'border-[#0866ff] font-bold text-[#101828]'
                              : 'border-transparent font-semibold text-[#344054]'
                          }`}
                        >
                          <span className="max-w-[250px] truncate xl:max-w-[320px]">
                            {label}
                          </span>
                        </Link>
                      ))}
                      {overflowCategoryLinks.length ? (
                        <details className="group/category-more relative flex h-full shrink-0">
                          <summary className="flex h-full cursor-pointer list-none items-center gap-1.5 border-b-2 border-transparent px-3 text-[13px] font-semibold text-[#344054] transition hover:border-[#0866ff] hover:text-[#0866ff] [&::-webkit-details-marker]:hidden">
                            {t.more}
                            <ChevronDown className="h-3.5 w-3.5 transition group-open/category-more:rotate-180" />
                          </summary>
                          <div className="absolute left-0 top-full z-50 w-[310px] pt-2">
                            <div role="menu" className="rounded-[16px] border border-[#d9e1e5] bg-white p-2 shadow-[0_22px_60px_rgba(32,33,36,.18)]">
                              {overflowCategoryLinks.map(([href, label]) => (
                                <Link
                                  key={href}
                                  href={href}
                                  aria-current={pathname === href ? 'page' : undefined}
                                  onClick={(event) => handleCategoryNavigation(event, href)}
                                  className={`block rounded-[11px] px-3 py-3 text-sm font-semibold transition hover:bg-[#f2f6f7] hover:text-[#0866ff] ${
                                    pathname === href ? 'bg-[#f2f6ff] text-[#0866ff]' : 'text-[#344054]'
                                  }`}
                                >
                                  {label}
                                </Link>
                              ))}
                            </div>
                          </div>
                        </details>
                      ) : null}
                    </>
                  )
                : menus.map((menu) => (
                    <DesktopMenu
                      key={menu.href}
                      label={menu.label}
                      menu={menu.data}
                      icon={menu.icon}
                      open={desktopMenuOpen === menu.href}
                      onToggle={() =>
                        setDesktopMenuOpen((current) =>
                          current === menu.href ? null : menu.href,
                        )
                      }
                      onClose={() => setDesktopMenuOpen(null)}
                      onNavigate={handleInternalNavigation}
                    />
                  ))}
            </nav>

            <div className="ml-auto hidden h-full items-stretch min-[1120px]:flex">
              {headerAccount.authenticated ? (
                <Link
                  href={accountMessagesHref}
                  className="relative flex min-w-[76px] flex-col items-center justify-center border-l border-[#ececea] px-2 transition hover:bg-[#f7f8f8] hover:text-[#0866ff]"
                >
                  <span className="relative">
                    <MessageSquareText className="h-[20px] w-[20px]" strokeWidth={1.75} />
                    {headerAccount.unreadMessages ? (
                      <span className="absolute -right-2.5 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-[#0866ff] px-1 text-[9px] font-bold leading-none text-white">
                        {headerAccount.unreadMessages > 99 ? '99+' : headerAccount.unreadMessages}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-[10px] font-medium">{t.messages}</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal('login', accountMessagesHref)}
                  className="relative flex min-w-[76px] flex-col items-center justify-center border-l border-[#ececea] px-2 transition hover:bg-[#f7f8f8] hover:text-[#0866ff]"
                >
                  <MessageSquareText className="h-[20px] w-[20px]" strokeWidth={1.75} />
                  <span className="text-[10px] font-medium">{t.messages}</span>
                </button>
              )}
              {headerAccount.authenticated ? (
                <Link
                  href={savedHref}
                  className="relative flex min-w-[66px] flex-col items-center justify-center border-l border-[#ececea] px-2 transition hover:bg-[#f7f8f8] hover:text-[#0866ff]"
                >
                  <span className="relative">
                    <Heart className="h-[20px] w-[20px]" strokeWidth={1.75} />
                    {savedListingCount ? (
                      <span className="absolute -right-2.5 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-[#0866ff] px-1 text-[9px] font-bold leading-none text-white">
                        {savedListingCount > 99 ? '99+' : savedListingCount}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-[10px] font-medium">{t.saved}</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal('login', savedHref)}
                  className="relative flex min-w-[66px] flex-col items-center justify-center border-l border-[#ececea] px-2 transition hover:bg-[#f7f8f8] hover:text-[#0866ff]"
                >
                  <Heart className="h-[20px] w-[20px]" strokeWidth={1.75} />
                  <span className="text-[10px] font-medium">{t.saved}</span>
                </button>
              )}
              <SiteSearch locale={locale} headerDesktop />
              {headerAccount.authenticated ? (
                <Link
                  href={accountHref}
                  className="flex min-w-[92px] max-w-[132px] flex-col items-center justify-center border-x border-[#ececea] px-2 transition hover:bg-[#f7f8f8] hover:text-[#0866ff]"
                >
                  <UserRound className="h-[20px] w-[20px]" strokeWidth={1.7} />
                  <span className="max-w-full truncate text-[10px] font-medium">
                    {t.myAutorell}
                  </span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="flex min-w-[66px] flex-col items-center justify-center border-x border-[#ececea] px-2 transition hover:bg-[#f7f8f8] hover:text-[#0866ff]"
                >
                  <UserRound className="h-[20px] w-[20px]" strokeWidth={1.7} />
                  <span className="text-[10px] font-medium">{t.signIn}</span>
                </button>
              )}
              <div ref={moreRef} className="relative flex h-full">
                <button
                  type="button"
                  onClick={() => setMoreOpen((current) => !current)}
                  aria-label={t.more}
                  aria-expanded={moreOpen}
                  aria-haspopup="menu"
                  className="flex min-w-[62px] flex-col items-center justify-center border-r border-[#ececea] px-2 transition hover:bg-[#f7f8f8] hover:text-[#0866ff]"
                >
                  <Menu className="h-[20px] w-[20px]" strokeWidth={1.8} />
                  <span className="text-[10px] font-medium">{t.more}</span>
                </button>
                <div
                  className={`absolute right-0 top-full z-50 w-[280px] pt-2 transition duration-150 ${
                    moreOpen
                      ? 'pointer-events-auto translate-y-0 opacity-100'
                      : 'pointer-events-none -translate-y-1 opacity-0'
                  }`}
                >
                  <div role="menu" className="rounded-[16px] border border-[#d9e1e5] bg-white p-2 shadow-[0_22px_60px_rgba(32,33,36,.18)]">
                    {moreLinks.map(({ href, label, icon: Icon }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMoreOpen(false)}
                        className="flex items-center gap-3 rounded-[11px] px-3 py-3 text-sm font-medium transition hover:bg-[#f2f6f7]"
                      >
                        <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-[#f2f6ff] text-[#0866ff]">
                          <Icon className="h-[17px] w-[17px]" />
                        </span>
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {mobileCategoryLinks ? (
            <nav
              aria-label={`${activeCategoryCopy?.label || ''} navigation`}
              className="flex h-[54px] items-stretch gap-7 overflow-x-auto border-t border-[#e7e9ee] bg-white px-6 text-[13px] font-semibold text-[#344054] [scrollbar-width:none] min-[1120px]:hidden [&::-webkit-scrollbar]:hidden"
            >
              {mobileCategoryLinks.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  aria-current={pathname === href ? 'page' : undefined}
                  onClick={(event) => handleCategoryNavigation(event, href)}
                  className={`flex shrink-0 items-center border-b-[3px] pt-px ${
                    pathname === href
                      ? 'border-[#0866ff] font-bold text-[#101828]'
                      : 'border-transparent'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>
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
                {buyItems.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={closeMobile}
                    className="flex min-h-12 items-center gap-2 rounded-[14px] border border-[#dfe4ec] bg-[#fbfcff] px-3 text-sm font-semibold text-[#344054] transition hover:border-[#bcd3ff] hover:bg-white"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-[#0866ff]" />
                    <span className="min-w-0 truncate">{label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <nav className="mt-6 grid gap-2">
              {mobileMainLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={(event) => handleInternalNavigation(event, href)}
                  className="group flex min-h-[58px] items-center justify-between rounded-[15px] border border-[#e0e7ef] bg-white px-4 text-[16px] font-extrabold text-[#101828] shadow-[0_10px_26px_rgba(16,24,40,.04)] transition hover:border-[#bcd3ff] hover:bg-[#f7fbff]"
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
              href={localizePublicHref(locale, '/salj-fordon')}
              onClick={closeMobile}
              className="mt-6 flex min-h-14 items-center justify-between rounded-[15px] bg-[#0866ff] px-5 text-base font-extrabold text-white shadow-[0_16px_36px_rgba(8,102,255,.24)]"
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
                      <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-[#0866ff] px-1.5 text-[10px] font-bold">
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

            <div className="mt-auto border-t border-[#e2e8f0] pt-5">
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  setMarketSelectorOpen(true)
                }}
                className="flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-[15px] border border-[#bcd3ff] bg-[#edf5ff] px-4 text-left text-sm"
              >
                  <FlagIcon code={activeMarket[1]} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#66808e]">
                      {t.chooseLanguage}
                    </span>
                    <strong className="mt-0.5 block font-medium">
                      {activeMarket[2]}
                    </strong>
                  </span>
                  <ChevronDown className="h-4 w-4" />
              </button>
              <div className="mt-5 flex items-center justify-between border-t border-[#e2e8f0] pt-5">
                <SocialIcons />
                <span className="text-sm font-medium text-[#62686c]">Autorell AB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
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

function DesktopMenu({
  label,
  menu,
  onNavigate,
  open,
  onToggle,
  onClose,
  icon: MenuIcon,
}: {
  label: string
  menu: DesktopMenuData
  onNavigate: (event: ReactMouseEvent<HTMLAnchorElement>, href: string) => void
  open: boolean
  onToggle: () => void
  onClose: () => void
  icon: LucideIcon
}) {
  const isMegaMenu = menu.variant === 'mega'

  return (
    <div className="relative" data-desktop-menu-root="true">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`flex h-[50px] shrink-0 items-center gap-1.5 border-b-2 px-3 text-[14px] font-semibold transition hover:border-[#0866ff] hover:text-[#111] xl:px-4 ${
          open
            ? 'border-[#0866ff] text-[#111]'
            : 'border-transparent text-[#303640]'
        }`}
      >
        {label}
        <ChevronDown className={`h-3.5 w-3.5 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className={`fixed inset-x-0 bottom-0 top-[80px] z-30 bg-[#0b1728]/8 backdrop-blur-[1px] transition ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <div
        className={`fixed left-1/2 top-[80px] z-40 w-[calc(100vw-32px)] -translate-x-1/2 transition duration-200 ${
          open
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-2 opacity-0'
        } ${isMegaMenu ? 'max-w-[1040px]' : 'max-w-[720px]'}`}
      >
        {isMegaMenu ? (
          <BuyDesktopMenuPanel
            menu={menu}
            icon={MenuIcon}
            onClose={onClose}
            onNavigate={onNavigate}
          />
        ) : (
          <div role="menu" className="relative grid max-h-[calc(100dvh-96px)] grid-cols-[290px_1fr] overflow-hidden rounded-[18px] border border-[#dce3ef] bg-white shadow-[0_28px_75px_rgba(16,24,40,.16)]">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full border border-[#dce3ef] bg-white text-[#344054] shadow-sm transition hover:bg-[#f5f7fa]"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="min-w-0 bg-[#f3f7ff] p-6">
              <span className="grid h-10 w-10 place-items-center rounded-[12px] bg-[#0866ff] text-white">
                <MenuIcon className="h-5 w-5" />
              </span>
              <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.19em] text-[#68808e]">
                {menu.eyebrow}
              </p>
              <h3 className="mt-2 whitespace-normal text-[22px] font-extrabold leading-[1.12] tracking-[-0.035em] text-[#101828]">
                {menu.title}
              </h3>
              <p className="mt-3 whitespace-normal text-sm leading-6 text-[#5c707b]">
                {menu.text}
              </p>
              <a href={menu.ctaHref} onClick={(event) => { onClose(); onNavigate(event, menu.ctaHref) }} className="mt-6 inline-flex items-center gap-2 rounded-[12px] border border-[#b7cdfb] bg-white px-4 py-3 text-sm font-extrabold text-[#075fff] transition hover:border-[#075fff] hover:bg-[#f7fbff]">
                {menu.cta}
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <div className="min-w-0 overflow-y-auto p-4 pr-5">
              {menu.items.map(({ href: itemHref, label: itemLabel, description, icon: Icon }) => (
                <a
                  key={`${itemHref}-${itemLabel}`}
                  href={itemHref}
                  onClick={(event) => { onClose(); onNavigate(event, itemHref) }}
                  className="group/item flex items-center gap-4 rounded-[14px] p-3.5 transition hover:bg-[#f5f6f4]"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-[#dce1e3] text-[#4e626c]">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="min-w-0">
                    <strong className="block whitespace-normal text-sm font-medium">{itemLabel}</strong>
                    <span className="mt-1 block whitespace-normal text-xs leading-5 text-[#78858b]">{description}</span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function BuyDesktopMenuPanel({
  menu,
  icon: MenuIcon,
  onNavigate,
  onClose,
}: {
  menu: DesktopMenuData
  icon: LucideIcon
  onNavigate: (event: ReactMouseEvent<HTMLAnchorElement>, href: string) => void
  onClose: () => void
}) {
  return (
    <div role="menu" className="relative grid h-[calc(100dvh-96px)] min-h-0 overflow-hidden rounded-[18px] border border-[#dce3ef] bg-white shadow-[0_28px_75px_rgba(16,24,40,.16)] lg:grid-cols-[300px_1fr]">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close menu"
        className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full border border-[#dce3ef] bg-white text-[#344054] shadow-sm transition hover:bg-[#f5f7fa]"
      >
        <X className="h-4 w-4" />
      </button>

      <aside className="flex min-h-0 min-w-0 flex-col overflow-y-auto overscroll-contain bg-[#f3f7ff] p-7">
        <span className="grid h-12 w-12 place-items-center rounded-[14px] bg-[#e8f1ff] text-[#075fff]">
          <MenuIcon className="h-6 w-6" />
        </span>
        <p className="mt-7 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#075fff]">
          {menu.eyebrow}
        </p>
        <h3 className="mt-3 max-w-[240px] whitespace-normal text-[26px] font-extrabold leading-[1.12] tracking-[-0.035em] text-[#101828]">
          {menu.title}
        </h3>
        <p className="mt-5 max-w-[250px] whitespace-normal text-sm leading-7 text-[#475467]">
          {menu.text}
        </p>

        <div className="mt-8 space-y-5">
          {menu.features?.map(({ title, text, icon: Icon }) => (
            <div key={title} className="flex gap-4">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-[#075fff] ring-1 ring-[#dce8ff]">
                <Icon className="h-4 w-4" />
              </span>
              <span>
                <strong className="block text-[13px] font-extrabold text-[#101828]">
                  {title}
                </strong>
                <span className="mt-1 block text-xs leading-5 text-[#667085]">
                  {text}
                </span>
              </span>
            </div>
          ))}
        </div>

        <a
          href={menu.ctaHref}
          onClick={(event) => { onClose(); onNavigate(event, menu.ctaHref) }}
          className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-[12px] border border-[#b7cdfb] bg-white px-5 text-sm font-extrabold text-[#075fff] transition hover:border-[#075fff] hover:bg-[#f7fbff]"
        >
          {menu.cta}
          <ArrowRight className="h-4 w-4" />
        </a>
      </aside>

      <div className="min-h-0 min-w-0 overflow-y-scroll overscroll-contain p-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {menu.items.map(({ href: itemHref, label: itemLabel, description, icon: Icon }) => (
            <a
              key={`${itemHref}-${itemLabel}`}
              href={itemHref}
              onClick={(event) => { onClose(); onNavigate(event, itemHref) }}
              className="group/item flex min-h-[138px] flex-col rounded-[14px] border border-[#dfe5ee] bg-white p-5 shadow-[0_12px_32px_rgba(16,24,40,.035)] transition hover:-translate-y-0.5 hover:border-[#b7cdfb] hover:shadow-[0_18px_42px_rgba(16,24,40,.08)]"
            >
              <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-[#edf5ff] text-[#075fff]">
                <Icon className="h-5 w-5" />
              </span>
              <span className="mt-5 flex items-start justify-between gap-3">
                <span>
                  <strong className="block whitespace-normal text-[15px] font-extrabold leading-5 text-[#101828]">
                    {itemLabel}
                  </strong>
                  <span className="mt-2 block whitespace-normal text-[13px] leading-6 text-[#475467]">
                    {description}
                  </span>
                </span>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#101828] transition group-hover/item:translate-x-0.5 group-hover/item:text-[#075fff]" />
              </span>
            </a>
          ))}

          {menu.allCategoriesLabel && menu.allCategoriesText ? (
            <a
              href={menu.ctaHref}
              onClick={(event) => { onClose(); onNavigate(event, menu.ctaHref) }}
              className="group/item flex min-h-[110px] flex-col rounded-[14px] border border-[#dfe5ee] bg-white p-5 shadow-[0_12px_32px_rgba(16,24,40,.035)] transition hover:-translate-y-0.5 hover:border-[#b7cdfb] hover:shadow-[0_18px_42px_rgba(16,24,40,.08)] sm:col-span-2"
            >
              <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-[#edf5ff] text-[#075fff]">
                <Store className="h-5 w-5" />
              </span>
              <span className="mt-4 flex items-start justify-between gap-3">
                <span>
                  <strong className="block text-[15px] font-extrabold text-[#101828]">
                    {menu.allCategoriesLabel}
                  </strong>
                  <span className="mt-1 block text-[13px] leading-6 text-[#475467]">
                    {menu.allCategoriesText}
                  </span>
                </span>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#101828] transition group-hover/item:translate-x-0.5 group-hover/item:text-[#075fff]" />
              </span>
            </a>
          ) : null}
        </div>
      </div>
    </div>
  )
}
