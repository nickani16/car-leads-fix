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
  Menu,
  MessageCircle,
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
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import BrandLogo from './BrandLogo'
import CountryFlag from './CountryFlag'
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
  translatePublic,
  translatePublicObject,
  type PublicLocale,
} from '@/lib/public-i18n'

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
  eyebrow: string
  title: string
  text: string
  cta: string
  ctaHref: string
  items: MenuItem[]
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
    { href: '/salj-fordon', label: 'Lägg upp annons', description: 'Publicera ett fordon med bilder, pris och fordonsdata.', icon: FilePlus2 },
    { href: '/registrera', label: 'Skapa konto', description: 'Välj privatkonto eller företagskonto.', icon: UserPlus },
    { href: '/salj-fordon#priser', label: 'Annonspriser', description: 'Jämför annonspaket och synlighet.', icon: Store },
    { href: '/salj-fordon#sa-fungerar-det', label: 'Så fungerar försäljning', description: 'Från annons till kontakt med köpare.', icon: CircleHelp },
    { href: '/foretag', label: 'Sälj som företag', description: 'För lager, flottor och återkommande publicering.', icon: Building2 },
  ],
  en: [
    { href: '/salj-fordon', label: 'Create listing', description: 'Publish a vehicle with images, price and structured data.', icon: FilePlus2 },
    { href: '/registrera', label: 'Create account', description: 'Choose a private or business account.', icon: UserPlus },
    { href: '/salj-fordon#priser', label: 'Listing prices', description: 'Compare packages and visibility.', icon: Store },
    { href: '/salj-fordon#sa-fungerar-det', label: 'How selling works', description: 'From listing to buyer enquiry.', icon: CircleHelp },
    { href: '/foretag', label: 'Sell as a business', description: 'For inventory, fleets and recurring listings.', icon: Building2 },
  ],
  de: [
    { href: '/salj-fordon', label: 'Anzeige erstellen', description: 'Fahrzeug mit Bildern, Preis und Daten veröffentlichen.', icon: FilePlus2 },
    { href: '/registrera', label: 'Konto erstellen', description: 'Privat- oder Unternehmenskonto wählen.', icon: UserPlus },
    { href: '/salj-fordon#priser', label: 'Anzeigenpreise', description: 'Pakete und Sichtbarkeit vergleichen.', icon: Store },
    { href: '/salj-fordon#sa-fungerar-det', label: 'So funktioniert der Verkauf', description: 'Von der Anzeige bis zur Käuferanfrage.', icon: CircleHelp },
    { href: '/foretag', label: 'Als Unternehmen verkaufen', description: 'Für Bestand, Flotten und regelmäßige Anzeigen.', icon: Building2 },
  ],
}

const businessItems: Record<'sv' | 'en' | 'de', MenuItem[]> = {
  sv: [
    { href: '/foretag', label: 'För företag', description: 'Översikt över Autorells företagslösningar.', icon: Building2 },
    { href: '/registrera', label: 'Företagskonto', description: 'Skapa ett konto för organisationen.', icon: UserRound },
    { href: '/salj-fordon', label: 'Annonsera fordon', description: 'Publicera enstaka fordon eller hela lagret.', icon: FilePlus2 },
    { href: '/konto/annonser', label: 'Hantera lager', description: 'Se och uppdatera företagets annonser.', icon: Warehouse },
    { href: '/kontakt', label: 'Kontakta oss', description: 'Prata med oss om större volymer.', icon: CircleHelp },
  ],
  en: [
    { href: '/foretag', label: 'For business', description: "Explore Autorell's business solutions.", icon: Building2 },
    { href: '/registrera', label: 'Business account', description: 'Create an account for your organisation.', icon: UserRound },
    { href: '/salj-fordon', label: 'Advertise vehicles', description: 'Publish one vehicle or your whole inventory.', icon: FilePlus2 },
    { href: '/konto/annonser', label: 'Manage inventory', description: 'Review and update company listings.', icon: Warehouse },
    { href: '/contact', label: 'Contact us', description: 'Talk to us about larger volumes.', icon: CircleHelp },
  ],
  de: [
    { href: '/foretag', label: 'Für Unternehmen', description: 'Autorells Unternehmenslösungen entdecken.', icon: Building2 },
    { href: '/registrera', label: 'Unternehmenskonto', description: 'Ein Konto für Ihr Unternehmen erstellen.', icon: UserRound },
    { href: '/salj-fordon', label: 'Fahrzeuge inserieren', description: 'Ein Fahrzeug oder den gesamten Bestand veröffentlichen.', icon: FilePlus2 },
    { href: '/konto/annonser', label: 'Bestand verwalten', description: 'Unternehmensanzeigen prüfen und aktualisieren.', icon: Warehouse },
    { href: '/kontakt', label: 'Kontakt', description: 'Sprechen Sie mit uns über größere Volumen.', icon: CircleHelp },
  ],
}

export default function PublicHeader({
  locale = 'sv',
  marketplaceChannel,
  marketCode,
}: PublicHeaderProps) {
  const pathname = usePathname()
  const language = marketplaceLanguage(locale)
  const t =
    locale === 'sv' || locale === 'de' || locale === 'en'
      ? copy[language]
      : translatePublicObject(locale, copy.en)
  const [open, setOpen] = useState(false)
  const [languageOpen, setLanguageOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [visible, setVisible] = useState(true)
  const lastScrollY = useRef(0)
  const languageRef = useRef<HTMLDivElement>(null)
  const moreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const difference = currentScrollY - lastScrollY.current

      if (currentScrollY < 80) setVisible(true)
      else if (difference > 7) {
        setVisible(false)
        setOpen(false)
        setLanguageOpen(false)
        setMoreOpen(false)
      } else if (difference < -4) setVisible(true)

      lastScrollY.current = currentScrollY
    }

    lastScrollY.current = window.scrollY
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!languageOpen) return
    const close = (event: PointerEvent) => {
      if (!languageRef.current?.contains(event.target as Node)) setLanguageOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLanguageOpen(false)
    }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [languageOpen])

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

  const buyItems: MenuItem[] = marketplaceCategories.map((category) => {
    const label =
      locale === 'sv' || locale === 'de' || locale === 'en'
        ? category.labels[language]
        : translatePublic(locale, category.labels.en)
    return {
      href: categoryLandingPath(category.slug),
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
        pathname === categoryLandingPath(category.slug) ||
        pathname === `/marketplace/${category.slug}`,
    )?.slug || null
  const activeMarketplaceChannel =
    marketplaceChannel ||
    (activeCategorySlug
      ? {
          slug: activeCategorySlug,
          label:
            buyItems.find((item) => item.href === categoryLandingPath(activeCategorySlug))
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
  const contextualBuyItems: MenuItem[] =
    activeCategoryConfig && activeCategoryCopy
      ? activeCategoryCopy.menu.map((label, index) => ({
          label,
          href: categoryLandingMenuHref(activeCategoryConfig, label),
          description:
            locale === 'sv'
              ? `Utforska ${activeCategoryCopy.label.toLowerCase()} på Autorell.`
              : locale === 'de'
                ? `${activeCategoryCopy.label} auf Autorell entdecken.`
                : `Explore ${activeCategoryCopy.label.toLowerCase()} on Autorell.`,
          icon:
            index === 2
              ? FilePlus2
              : index >= 3
                ? CircleHelp
                : Search,
        }))
      : buyItems

  const menus: Array<{
    label: string
    href: string
    icon: LucideIcon
    data: DesktopMenuData
  }> = [
    {
      label: t.buy,
      href: '/cars',
      icon: Search,
      data: {
        eyebrow: t.buy,
        title: activeCategoryCopy?.label || t.buyTitle,
        text: activeCategoryCopy?.intro || t.buyText,
        cta: activeCategoryCopy
          ? `${t.buy} ${activeCategoryCopy.label.toLowerCase()}`
          : t.buyCta,
        ctaHref: activeCategoryConfig?.path || '/cars',
        items: contextualBuyItems,
      },
    },
    {
      label: t.sell,
      href: '/salj-fordon',
      icon: FilePlus2,
      data: {
        eyebrow: t.sell,
        title: t.sellTitle,
        text: t.sellText,
        cta: t.sellCta,
        ctaHref: '/salj-fordon',
        items: localizedSellerItems,
      },
    },
    {
      label: t.business,
      href: '/foretag',
      icon: Building2,
      data: {
        eyebrow: t.business,
        title: t.businessTitle,
        text: t.businessText,
        cta: t.businessCta,
        ctaHref: '/foretag',
        items: localizedBusinessItems,
      },
    },
  ]

  const categoryPrimaryLinks =
    activeCategoryConfig && activeCategoryCopy
      ? [
          [activeCategoryConfig.path, activeCategoryCopy.label] as const,
          ...activeCategoryCopy.menu.map(
            (label) =>
              [categoryLandingMenuHref(activeCategoryConfig, label), label] as const,
          ),
        ]
      : null
  const navLinks = categoryPrimaryLinks ?? [
      ...menus.map(({ href, label }) => [href, label] as const),
      [localizePublicHref(locale, '/om-oss'), t.about] as const,
      [localizePublicHref(locale, '/hjalpcenter'), t.help] as const,
    ]
  const moreLinks = [
    { href: localizePublicHref(locale, '/vanliga-fragor'), label: t.faq, icon: CircleHelp },
    { href: localizePublicHref(locale, '/kontakt'), label: t.contact, icon: UserRound },
    { href: localizePublicHref(locale, '/villkor'), label: t.terms, icon: FileText },
    { href: localizePublicHref(locale, '/integritet'), label: t.privacy, icon: ShieldCheck },
    { href: localizePublicHref(locale, '/rapportera'), label: t.reportAbuse, icon: ShieldAlert },
    { href: localizePublicHref(locale, '/om-oss'), label: t.about, icon: Building2 },
  ]

  const languageOptions: Array<readonly [string, string, string, string]> = [
    ['eu', 'EU', 'EU / English', 'https://www.autorell.com/?market=en'] as const,
    ...([
    ['se', 'SE', 'Sverige', 'https://www.autorell.se/'] as const,
    ['de', 'DE', 'Deutschland', 'https://www.autorell.de/'] as const,
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
  function closeMobile() {
    setOpen(false)
  }

  function handleInternalNavigation(
    event: ReactMouseEvent<HTMLAnchorElement>,
    href: string,
  ) {
    if (href.includes('#') && pathname === href.split('#')[0]) {
      event.preventDefault()
      document.getElementById(href.split('#')[1])?.scrollIntoView({ behavior: 'smooth' })
    }
    closeMobile()
  }

  return (
    <>
      <div
        className={
          categoryPrimaryLinks
            ? 'h-[118px] min-[1120px]:h-[80px]'
            : 'h-[64px] min-[1120px]:h-[80px]'
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
            <div className="mx-auto flex h-[30px] max-w-[1600px] items-center justify-between gap-5 px-6">
              <nav className="flex min-w-0 items-center gap-4 overflow-hidden text-[10px] text-[#41474b] xl:gap-5 xl:text-[11px]">
                {buyItems.map(({ href, label }, index) => {
                  const category = marketplaceCategories[index]
                  const isActive =
                    pathname === href ||
                    (category && pathname === `/marketplace/${category.slug}`)
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
                  href={localizePublicHref(locale, '/rapportera')}
                  className="flex h-full items-center gap-1.5 border-l border-[#e6e7e9] px-3 text-[10px] font-medium hover:bg-white"
                >
                  <ShieldAlert className="h-3.5 w-3.5" />
                  {t.reportAbuse}
                </Link>
                <div ref={languageRef} className="relative flex h-full">
                  <button
                    type="button"
                    onClick={() => setLanguageOpen((current) => !current)}
                    aria-expanded={languageOpen}
                    aria-haspopup="menu"
                    className="flex h-full items-center gap-2 border-l border-r border-[#e6e7e9] px-4 text-[10px] font-medium hover:bg-white"
                  >
                    <CountryFlag
                      code={activeMarket[1].toLowerCase()}
                      className="h-[14px] w-[21px]"
                    />
                    <span>{activeMarket[2]}</span>
                    <ChevronDown className={`h-3 w-3 transition ${languageOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <LanguageMenu
                    open={languageOpen}
                    options={languageOptions}
                    activeLocale={activeMarketCode}
                    title={t.chooseLanguage}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="relative mx-auto flex h-[64px] max-w-[1600px] items-center px-6 min-[1120px]:h-[50px]">
            <div className="absolute inset-x-0 top-0 h-[64px] min-[1120px]:hidden">
              <div className="absolute inset-y-0 left-2 flex items-center">
                <button
                  type="button"
                  onClick={() => setOpen((current) => !current)}
                  aria-label={open ? t.closeMenu : t.openMenu}
                  aria-expanded={open}
                  className="flex w-11 shrink-0 flex-col items-center justify-center"
                >
                  {open ? <X className="h-[22px] w-[22px]" strokeWidth={1.8} /> : <Menu className="h-[23px] w-[23px]" strokeWidth={1.8} />}
                  <span className="mt-0.5 text-[10px] leading-none">{t.menu}</span>
                </button>
                <Link
                  href={`/salj-fordon${activeMarketplaceChannel ? `?category=${activeMarketplaceChannel.slug}` : ''}`}
                  onClick={closeMobile}
                  className="flex w-11 shrink-0 flex-col items-center justify-center"
                >
                  <Store className="h-[21px] w-[21px]" strokeWidth={1.7} />
                  <span className="mt-0.5 text-[10px] leading-none">{t.sell}</span>
                </Link>
              </div>

              <Link
                href={homeHref}
                aria-label="Autorell"
                className="absolute left-1/2 top-1/2 flex max-w-[120px] -translate-x-1/2 -translate-y-1/2 flex-col items-center overflow-hidden"
                onClick={closeMobile}
              >
                <BrandLogo />
                {activeMarketplaceChannel?.label ? (
                  <span className="mt-0.5 max-w-28 truncate text-[9px] font-semibold leading-none text-[#344054]">
                    {activeMarketplaceChannel.label}
                  </span>
                ) : null}
              </Link>

              <div className="absolute inset-y-0 right-2 flex items-center">
                <Link href="/sparade" onClick={closeMobile} className="flex w-11 shrink-0 flex-col items-center justify-center">
                  <Heart className="h-[21px] w-[21px]" strokeWidth={1.7} />
                  <span className="mt-0.5 text-[10px] leading-none">{t.saved}</span>
                </Link>
                <div className="flex w-11 shrink-0 items-center justify-center">
                  <SiteSearch
                    locale={locale}
                    headerMobile
                    onNavigate={closeMobile}
                  />
                </div>
              </div>
            </div>

            <Link
              href={homeHref}
              aria-label="Autorell"
              className="hidden shrink-0 flex-col items-center justify-center min-[1120px]:inline-flex"
            >
              <BrandLogo />
              {activeMarketplaceChannel?.label ? (
                <span className="mt-0.5 max-w-[120px] truncate text-[9px] font-semibold leading-none text-[#344054]">
                  {activeMarketplaceChannel.label}
                </span>
              ) : null}
            </Link>

            <nav className="ml-7 hidden h-full items-center whitespace-nowrap min-[1120px]:flex xl:ml-9">
              {categoryPrimaryLinks
                ? categoryPrimaryLinks.map(([href, label]) => (
                    <Link
                      key={href}
                      href={href}
                      aria-current={pathname === href ? 'page' : undefined}
                      className={`flex h-full items-center border-b-2 px-4 text-[13px] transition hover:border-[#0866ff] hover:text-[#0866ff] xl:px-5 ${
                        pathname === href
                          ? 'border-[#0866ff] font-bold text-[#101828]'
                          : 'border-transparent font-semibold text-[#344054]'
                      }`}
                    >
                      {label}
                    </Link>
                  ))
                : menus.map((menu) => (
                    <DesktopMenu
                      key={menu.href}
                      label={menu.label}
                      href={menu.href}
                      menu={menu.data}
                      icon={menu.icon}
                      onNavigate={handleInternalNavigation}
                    />
                  ))}
            </nav>

            <div className="ml-auto hidden h-full items-stretch min-[1120px]:flex">
              <Link
                href="/inkorg"
                className="flex min-w-[76px] flex-col items-center justify-center border-l border-[#ececea] px-2 transition hover:bg-[#f7f8f8] hover:text-[#0866ff]"
              >
                <MessageCircle className="h-[19px] w-[19px]" strokeWidth={1.7} />
                <span className="text-[10px] font-medium">{t.messages}</span>
              </Link>
              <SiteSearch locale={locale} headerDesktop />
              <Link
                href="/registrera"
                className="flex min-w-[66px] flex-col items-center justify-center border-l border-[#ececea] px-2 transition hover:bg-[#f7f8f8] hover:text-[#0866ff]"
              >
                <Store className="h-[19px] w-[19px]" strokeWidth={1.7} />
                <span className="text-[10px] font-medium">{t.register}</span>
              </Link>
              <Link
                href="/login"
                className="flex min-w-[66px] flex-col items-center justify-center border-x border-[#ececea] px-2 transition hover:bg-[#f7f8f8] hover:text-[#0866ff]"
              >
                <UserRound className="h-[20px] w-[20px]" strokeWidth={1.7} />
                <span className="text-[10px] font-medium">{t.signIn}</span>
              </Link>
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

          {categoryPrimaryLinks ? (
            <nav
              aria-label={`${activeCategoryCopy?.label || ''} navigation`}
              className="flex h-[54px] items-stretch gap-7 overflow-x-auto border-t border-[#e7e9ee] bg-white px-6 text-[13px] font-semibold text-[#344054] [scrollbar-width:none] min-[1120px]:hidden [&::-webkit-scrollbar]:hidden"
            >
              {categoryPrimaryLinks.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  aria-current={pathname === href ? 'page' : undefined}
                  onClick={closeMobile}
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
          className={`absolute inset-x-0 top-full h-[calc(100dvh-64px)] overflow-y-auto border-t border-[#deddd8] bg-[#f6f4ef] shadow-[0_24px_60px_rgba(32,33,36,.14)] transition duration-300 min-[1120px]:hidden ${
            open
              ? 'pointer-events-auto translate-y-0 opacity-100'
              : 'pointer-events-none -translate-y-3 opacity-0'
          }`}
        >
          <div className="mx-auto flex min-h-full max-w-2xl flex-col px-5 py-7 sm:px-8">
            <nav>
              {navLinks.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={(event) => handleInternalNavigation(event, href)}
                  className="group flex items-center justify-between border-b border-[#dcdad3] py-4 text-[22px] font-medium tracking-[-0.025em]"
                >
                  <span>{label}</span>
                  <ArrowRight className="h-5 w-5 text-[#71818b] transition group-hover:translate-x-1" />
                </Link>
              ))}
            </nav>

            <div className="mt-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7a8082]">
                {t.shopByCategory}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {buyItems.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={closeMobile}
                    className="flex min-h-11 items-center gap-2 rounded-[13px] border border-[#dfe4ec] bg-white px-3 text-sm font-semibold text-[#344054]"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-[#0866ff]" />
                    <span className="min-w-0 truncate">{label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/salj-fordon"
              onClick={closeMobile}
              className="mt-6 flex min-h-14 items-center justify-between rounded-[14px] bg-[#0866ff] px-5 text-base font-medium text-white"
            >
              {t.mobileCta}
              <ArrowRight className="h-5 w-5" />
            </Link>

            <Link
              href={localizePublicHref(locale, '/rapportera')}
              onClick={closeMobile}
              className="mt-3 flex min-h-14 items-center justify-between rounded-[14px] bg-[#242424] px-5 text-base font-medium text-white shadow-[0_12px_28px_rgba(32,33,36,.16)]"
            >
              <span className="flex items-center gap-3">
                <ShieldAlert className="h-5 w-5" />
                {t.reportAbuse}
              </span>
              <ArrowRight className="h-5 w-5" />
            </Link>

            <div className="mt-9 rounded-[18px] border border-[#dddcd6] bg-white p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7a8082]">
                {t.createAccount}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Link href="/registrera" onClick={closeMobile} className="flex min-h-12 items-center gap-3 rounded-[12px] bg-[#0866ff] px-4 text-sm font-medium text-white">
                  <UserPlus size={17} />
                  {t.register}
                </Link>
                <Link href="/login" onClick={closeMobile} className="flex min-h-12 items-center gap-3 rounded-[12px] bg-[#242424] px-4 text-sm text-white">
                  <LogIn size={17} />
                  {t.signIn}
                </Link>
              </div>
            </div>

            <div className="mt-auto border-t border-[#dcdad3] pt-6">
              <details className="group/markets">
                <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 rounded-[14px] border border-[#8ebdd8] bg-[#eaf5fb] px-4 text-sm [&::-webkit-details-marker]:hidden">
                  <CountryFlag code={activeMarket[1].toLowerCase()} className="h-[20px] w-[30px]" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#66808e]">
                      {t.chooseLanguage}
                    </span>
                    <strong className="mt-0.5 block font-medium">
                      {activeMarket[2]}
                    </strong>
                  </span>
                  <ChevronDown className="h-4 w-4 transition group-open/markets:rotate-180" />
                </summary>
                <div className="mt-2 max-h-[310px] overflow-y-auto rounded-[14px] border border-[#dcdad3] bg-white p-2">
                  {languageOptions.map(([code, flag, label, href]) => (
                    <a key={code} href={href} className="flex min-h-12 items-center gap-3 rounded-[11px] px-3 text-sm transition hover:bg-[#f1f6f7]">
                      <CountryFlag code={flag.toLowerCase()} className="h-[18px] w-[27px]" />
                      <span className="min-w-0 flex-1 truncate">{label}</span>
                    </a>
                  ))}
                </div>
              </details>
              <div className="mt-5 flex items-center justify-between border-t border-[#dcdad3] pt-5">
                <SocialIcons />
                <span className="text-sm font-medium text-[#62686c]">Autorell AB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function LanguageMenu({
  open,
  options,
  activeLocale,
  title,
}: {
  open: boolean
  options: ReadonlyArray<readonly [string, string, string, string]>
  activeLocale: string
  title: string
}) {
  return (
    <div
      className={`absolute right-0 top-full z-30 w-[300px] pt-2 transition duration-150 ${
        open
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none -translate-y-1 opacity-0'
      }`}
    >
      <div role="menu" className="max-h-[calc(100dvh-90px)] overflow-y-auto rounded-[16px] border border-[#d9e1e5] bg-white p-2 shadow-[0_22px_60px_rgba(32,33,36,.18)]">
        <p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7c898f]">
          {title}
        </p>
        {options.map(([code, flag, label, href]) => (
          <a
            key={code}
            href={href}
            className={`flex items-center gap-3 rounded-[11px] px-3 py-2.5 text-sm transition hover:bg-[#f2f6f7] ${
              code === activeLocale ? 'bg-[#eef6fa]' : ''
            }`}
          >
            <CountryFlag code={flag.toLowerCase()} className="h-[20px] w-[30px] shrink-0" />
            <span className="font-medium">{label}</span>
          </a>
        ))}
      </div>
    </div>
  )
}

function DesktopMenu({
  label,
  href,
  menu,
  onNavigate,
  icon: MenuIcon,
}: {
  label: string
  href: string
  menu: DesktopMenuData
  onNavigate: (event: ReactMouseEvent<HTMLAnchorElement>, href: string) => void
  icon: LucideIcon
}) {
  return (
    <div className="group relative">
      <a
        href={href}
        onClick={(event) => onNavigate(event, href)}
        className="flex h-[50px] shrink-0 items-center border-b-2 border-transparent px-3 text-[14px] font-semibold text-[#303640] transition hover:border-[#0866ff] hover:text-[#111] group-focus-within:border-[#0866ff] xl:px-4"
      >
        {label}
      </a>

      <div
        className={`pointer-events-none fixed left-1/2 top-[68px] z-40 w-[calc(100vw-32px)] -translate-x-1/2 translate-y-2 pt-[12px] opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100 ${
          menu.items.length > 5 ? 'max-w-[900px]' : 'max-w-[780px]'
        }`}
      >
        <div className="grid grid-cols-[1.08fr_.92fr] overflow-hidden rounded-[18px] border border-[#dce3ef] bg-white shadow-[0_28px_75px_rgba(16,24,40,.16)]">
          <div className="min-w-0 bg-[#f3f7ff] p-7">
            <span className="grid h-10 w-10 place-items-center rounded-[12px] bg-[#0866ff] text-white">
              <MenuIcon className="h-5 w-5" />
            </span>
            <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.19em] text-[#68808e]">
              {menu.eyebrow}
            </p>
            <h3 className="mt-2 whitespace-normal text-[25px] leading-[1.08] tracking-[-0.035em]">
              {menu.title}
            </h3>
            <p className="mt-3 whitespace-normal text-sm leading-6 text-[#5c707b]">
              {menu.text}
            </p>
            <a href={menu.ctaHref} onClick={(event) => onNavigate(event, menu.ctaHref)} className="mt-6 inline-flex items-center gap-2 text-sm font-medium">
              {menu.cta}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className={`min-w-0 p-4 ${menu.items.length > 5 ? 'grid max-h-[460px] grid-cols-2 content-start overflow-x-hidden overflow-y-auto' : ''}`}>
            {menu.items.map(({ href: itemHref, label: itemLabel, description, icon: Icon }) => (
              <a
                key={`${itemHref}-${itemLabel}`}
                href={itemHref}
                onClick={(event) => onNavigate(event, itemHref)}
                className="group/item flex items-center gap-4 rounded-[14px] p-4 transition hover:bg-[#f5f6f4]"
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
      </div>
    </div>
  )
}
