'use client'

import Link from 'next/link'
import {
  ArrowRight,
  Building2,
  ChevronDown,
  CircleHelp,
  FilePlus2,
  Heart,
  LogIn,
  Menu,
  Store,
  UserPlus,
  UserRound,
  Warehouse,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import BrandLogo from './BrandLogo'
import CountryFlag from './CountryFlag'
import SiteSearch from './SiteSearch'
import {
  marketplaceCategories,
  marketplaceLanguage,
} from '@/lib/marketplace'
import {
  localizePublicHref,
  publicLanguages,
  translatePublic,
  translatePublicObject,
  type PublicLocale,
} from '@/lib/public-i18n'

type MenuItem = {
  href: string
  label: string
  description: string
  icon: LucideIcon
}

const copy = {
  sv: {
    buy: 'Köp',
    sell: 'Sälj',
    business: 'Företag',
    account: 'Konto',
    saved: 'Sparade',
    search: 'Sök',
    buyTitle: 'Hitta rätt fordon i hela Europa',
    buyText: 'Sök bland annonser från privatpersoner och företag.',
    sellTitle: 'Publicera på Europas fordonsmarknad',
    sellText: 'Skapa en tydlig annons och nå köpare i flera länder.',
    businessTitle: 'Verktyg för professionella säljare',
    businessText: 'Publicera lager, hantera annonser och samla förfrågningar.',
    signIn: 'Logga in',
    createAccount: 'Skapa konto',
  },
  en: {
    buy: 'Buy',
    sell: 'Sell',
    business: 'Business',
    account: 'Account',
    saved: 'Saved',
    search: 'Search',
    buyTitle: 'Find the right vehicle across Europe',
    buyText: 'Browse listings from private and business sellers.',
    sellTitle: "List on Europe's vehicle marketplace",
    sellText: 'Create a clear listing and reach buyers in multiple countries.',
    businessTitle: 'Tools for professional sellers',
    businessText: 'Publish inventory, manage listings and collect enquiries.',
    signIn: 'Sign in',
    createAccount: 'Create account',
  },
  de: {
    buy: 'Kaufen',
    sell: 'Verkaufen',
    business: 'Unternehmen',
    account: 'Konto',
    saved: 'Gespeichert',
    search: 'Suche',
    buyTitle: 'Das passende Fahrzeug in Europa finden',
    buyText: 'Anzeigen von privaten und gewerblichen Verkäufern durchsuchen.',
    sellTitle: 'Auf Europas Fahrzeugmarktplatz inserieren',
    sellText: 'Eine klare Anzeige erstellen und Käufer in mehreren Ländern erreichen.',
    businessTitle: 'Werkzeuge für professionelle Verkäufer',
    businessText: 'Bestand veröffentlichen, Anzeigen verwalten und Anfragen bündeln.',
    signIn: 'Anmelden',
    createAccount: 'Konto erstellen',
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
}: {
  transparentAtTop?: boolean
  locale?: PublicLocale
  marketplaceChannel?: { label: string; slug: string }
}) {
  const language = marketplaceLanguage(locale)
  const t =
    locale === 'sv' || locale === 'de' || locale === 'en'
      ? copy[language]
      : translatePublicObject(locale, copy.en)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState<'buy' | 'sell' | 'business' | null>(null)
  const [languageOpen, setLanguageOpen] = useState(false)
  const languageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!languageOpen) return
    const close = (event: PointerEvent) => {
      if (!languageRef.current?.contains(event.target as Node)) setLanguageOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [languageOpen])

  const languageOptions = [
    ['sv', 'SE', 'Svenska', 'https://www.autorell.se/'],
    ['de', 'DE', 'Deutsch', 'https://www.autorell.de/'],
    ...publicLanguages.map((languageCode) => [
      languageCode,
      languageCode === 'en' ? 'EU' : languageCode.toUpperCase(),
      new Intl.DisplayNames([languageCode], { type: 'language' }).of(languageCode) || languageCode,
      `https://www.autorell.com/${languageCode}`,
    ]),
  ] as const

  return (
    <header className="sticky top-0 z-[100] border-b border-[#e4e7ec] bg-white/95 text-[#101828] shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center gap-4 px-5 sm:px-8 lg:px-12">
        <Link href={localizePublicHref(locale, '/')} aria-label="Autorell">
          <BrandLogo />
        </Link>

        <nav className="ml-6 hidden h-full items-center gap-1 min-[1100px]:flex">
          <DesktopMenuButton label={t.buy} active={openMenu === 'buy'} onClick={() => setOpenMenu(openMenu === 'buy' ? null : 'buy')} />
          <DesktopMenuButton label={t.sell} active={openMenu === 'sell'} onClick={() => setOpenMenu(openMenu === 'sell' ? null : 'sell')} />
          <DesktopMenuButton label={t.business} active={openMenu === 'business'} onClick={() => setOpenMenu(openMenu === 'business' ? null : 'business')} />
        </nav>

        <div className="ml-auto hidden items-center gap-2 min-[1100px]:flex">
          <SiteSearch locale={locale} />
          <Link href="/sparade" className="grid h-11 w-11 place-items-center rounded-full border border-[#d0d5dd]" aria-label={t.saved}>
            <Heart className="h-[18px] w-[18px]" />
          </Link>
          <Link href="/login" className="inline-flex h-11 items-center gap-2 rounded-[13px] border border-[#d0d5dd] px-4 text-sm font-semibold">
            <LogIn className="h-4 w-4" /> {t.signIn}
          </Link>
          <Link href="/registrera" className="inline-flex h-11 items-center gap-2 rounded-[13px] bg-[#0866ff] px-5 text-sm font-bold text-white">
            {t.createAccount} <ArrowRight className="h-4 w-4" />
          </Link>
          <div ref={languageRef} className="relative">
            <button type="button" onClick={() => setLanguageOpen(!languageOpen)} className="inline-flex h-11 items-center gap-2 rounded-[13px] px-3 text-sm font-semibold">
              <CountryFlag code={locale === 'en' ? 'eu' : locale} className="h-4 w-6" />
              <ChevronDown className="h-4 w-4" />
            </button>
            {languageOpen && (
              <div className="absolute right-0 top-full mt-2 max-h-[70vh] w-64 overflow-y-auto rounded-[18px] border border-[#e4e7ec] bg-white p-2 shadow-2xl">
                {languageOptions.map(([code, flag, label, href]) => (
                  <a key={code} href={href} className="flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-sm hover:bg-[#f2f6ff]">
                    <CountryFlag code={flag.toLowerCase()} className="h-4 w-6" />
                    {label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <button type="button" onClick={() => setMobileOpen(!mobileOpen)} className="ml-auto grid h-11 w-11 place-items-center rounded-full border border-[#d0d5dd] min-[1100px]:hidden" aria-label="Menu">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {openMenu && (
        <div className="hidden border-t border-[#e4e7ec] bg-white min-[1100px]:block">
          <MegaMenu
            title={openMenu === 'buy' ? t.buyTitle : openMenu === 'sell' ? t.sellTitle : t.businessTitle}
            text={openMenu === 'buy' ? t.buyText : openMenu === 'sell' ? t.sellText : t.businessText}
            items={
              openMenu === 'buy'
                ? marketplaceCategories.map((category) => ({
                    href: `/marketplace/${category.slug}`,
                    label:
                      locale === 'sv' || locale === 'de' || locale === 'en'
                        ? category.labels[language]
                        : translatePublic(locale, category.labels.en),
                    description: `${t.search} ${
                      locale === 'sv' || locale === 'de' || locale === 'en'
                        ? category.labels[language].toLowerCase()
                        : translatePublic(locale, category.labels.en).toLowerCase()
                    }`,
                    icon: category.icon,
                  }))
                : openMenu === 'sell'
                  ? locale === 'sv' || locale === 'de' || locale === 'en'
                    ? sellerItems[language]
                    : translatePublicObject(locale, sellerItems.en)
                  : locale === 'sv' || locale === 'de' || locale === 'en'
                    ? businessItems[language]
                    : translatePublicObject(locale, businessItems.en)
            }
          />
        </div>
      )}

      {mobileOpen && (
        <div className="max-h-[calc(100vh-72px)] overflow-y-auto border-t border-[#e4e7ec] bg-white p-5 min-[1100px]:hidden">
          <SiteSearch locale={locale} mobile />
          <MobileSection title={t.buy} items={marketplaceCategories.map((category) => ({ href: `/marketplace/${category.slug}`, label: locale === 'sv' || locale === 'de' || locale === 'en' ? category.labels[language] : translatePublic(locale, category.labels.en), icon: category.icon }))} />
          <MobileSection title={t.sell} items={locale === 'sv' || locale === 'de' || locale === 'en' ? sellerItems[language] : translatePublicObject(locale, sellerItems.en)} />
          <MobileSection title={t.business} items={locale === 'sv' || locale === 'de' || locale === 'en' ? businessItems[language] : translatePublicObject(locale, businessItems.en)} />
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Link href="/login" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] border border-[#d0d5dd] font-semibold"><LogIn className="h-4 w-4" />{t.signIn}</Link>
            <Link href="/registrera" className="inline-flex min-h-12 items-center justify-center rounded-[14px] bg-[#0866ff] font-bold text-white">{t.createAccount}</Link>
          </div>
        </div>
      )}
    </header>
  )
}

function DesktopMenuButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`inline-flex h-full items-center gap-1.5 border-b-2 px-4 text-sm font-semibold ${active ? 'border-[#0866ff] text-[#0866ff]' : 'border-transparent'}`}>
      {label}<ChevronDown className={`h-4 w-4 transition ${active ? 'rotate-180' : ''}`} />
    </button>
  )
}

function MegaMenu({ title, text, items }: { title: string; text: string; items: MenuItem[] }) {
  return (
    <div className="mx-auto grid max-w-[1440px] grid-cols-[280px_1fr] gap-10 px-12 py-8">
      <div>
        <h2 className="text-2xl tracking-[-.035em]">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-[#667085]">{text}</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {items.map(({ href, label, description, icon: Icon }) => (
          <Link key={href + label} href={href} className="group flex gap-3 rounded-[16px] p-3 transition hover:bg-[#f2f6ff]">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[#eaf1ff] text-[#0866ff]"><Icon className="h-5 w-5" /></span>
            <span><strong className="block text-sm">{label}</strong><span className="mt-1 block text-xs leading-5 text-[#667085]">{description}</span></span>
          </Link>
        ))}
      </div>
    </div>
  )
}

function MobileSection({ title, items }: { title: string; items: Array<{ href: string; label: string; icon: LucideIcon }> }) {
  return (
    <section className="mt-6 border-t border-[#eaecf0] pt-5">
      <h2 className="text-xs font-bold uppercase tracking-[.16em] text-[#667085]">{title}</h2>
      <div className="mt-3 grid gap-1 sm:grid-cols-2">
        {items.map(({ href, label, icon: Icon }) => (
          <Link key={href + label} href={href} className="flex items-center gap-3 rounded-[13px] px-3 py-3 hover:bg-[#f2f6ff]">
            <Icon className="h-5 w-5 text-[#0866ff]" /><span className="font-semibold">{label}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
