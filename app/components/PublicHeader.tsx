'use client'

import Link from 'next/link'
import {
  ArrowRight,
  Building2,
  CarFront,
  ChevronDown,
  CircleHelp,
  FileCheck2,
  Gavel,
  Handshake,
  Headphones,
  LogIn,
  Menu,
  Route,
  ScanSearch,
  ShieldCheck,
  Store,
  X,
  type LucideIcon,
} from 'lucide-react'
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import BrandLogo from './BrandLogo'
import SocialIcons from './SocialIcons'

type PublicHeaderProps = {
  transparentAtTop?: boolean
  locale?: 'sv' | 'de' | 'en'
}

type MarketLocale = NonNullable<PublicHeaderProps['locale']>

const markets: Array<{
  locale: MarketLocale
  code: string
  label: string
  description: string
  href: string
}> = [
  {
    locale: 'sv',
    code: 'SE',
    label: 'Svenska',
    description: 'Sverige',
    href: 'https://www.autorell.se/?market=sv',
  },
  {
    locale: 'de',
    code: 'DE',
    label: 'Deutsch',
    description: 'Deutschland',
    href: 'https://www.autorell.de/?market=de',
  },
  {
    locale: 'en',
    code: 'EU',
    label: 'English',
    description: 'Europe',
    href: 'https://www.autorell.com/?market=en',
  },
]

const marketNames = {
  sv: {
    selector: 'Välj marknad',
    home: 'Autorell startsida',
    openMenu: 'Öppna meny',
    closeMenu: 'Stäng meny',
    activeMarket: 'Aktiv marknad',
    options: {
      sv: ['Svenska', 'Sverige'],
      de: ['Tyska', 'Tyskland'],
      en: ['Engelska', 'Europa'],
    },
  },
  de: {
    selector: 'Markt wählen',
    home: 'Autorell Startseite',
    openMenu: 'Navigation öffnen',
    closeMenu: 'Navigation schließen',
    activeMarket: 'Aktiver Markt',
    options: {
      sv: ['Schwedisch', 'Schweden'],
      de: ['Deutsch', 'Deutschland'],
      en: ['Englisch', 'Europa'],
    },
  },
  en: {
    selector: 'Choose market',
    home: 'Autorell home',
    openMenu: 'Open navigation',
    closeMenu: 'Close navigation',
    activeMarket: 'Active market',
    options: {
      sv: ['Swedish', 'Sweden'],
      de: ['German', 'Germany'],
      en: ['English', 'Europe'],
    },
  },
} as const

function getLocaleFromHostname(
  hostname: string,
  fallback: MarketLocale,
): MarketLocale {
  const normalizedHostname = hostname.toLowerCase()

  if (normalizedHostname.endsWith('autorell.de')) return 'de'
  if (normalizedHostname.endsWith('autorell.com')) return 'en'
  if (normalizedHostname.endsWith('autorell.se')) return 'sv'

  return fallback
}

function subscribeToHostname() {
  return () => {}
}

function MarketFlag({
  locale,
  className = '',
}: {
  locale: MarketLocale
  className?: string
}) {
  if (locale === 'sv') {
    return (
      <span
        className={`relative block overflow-hidden rounded-[3px] bg-[#1769aa] shadow-[inset_0_0_0_1px_rgba(0,0,0,.08)] ${className}`}
        aria-hidden="true"
      >
        <span className="absolute inset-y-0 left-[31%] w-[13%] bg-[#f7cf32]" />
        <span className="absolute inset-x-0 top-[42%] h-[17%] bg-[#f7cf32]" />
      </span>
    )
  }

  if (locale === 'de') {
    return (
      <span
        className={`grid overflow-hidden rounded-[3px] shadow-[inset_0_0_0_1px_rgba(0,0,0,.08)] ${className}`}
        aria-hidden="true"
      >
        <span className="bg-[#181818]" />
        <span className="bg-[#d52b1e]" />
        <span className="bg-[#f3c623]" />
      </span>
    )
  }

  return (
    <span
      className={`relative block overflow-hidden rounded-[3px] bg-[#1747a6] shadow-[inset_0_0_0_1px_rgba(0,0,0,.08)] ${className}`}
      aria-hidden="true"
    >
      {Array.from({ length: 8 }, (_, index) => {
        const angle = (index / 8) * Math.PI * 2

        return (
          <span
            key={index}
            className="absolute h-[2px] w-[2px] rounded-full bg-[#ffd83d]"
            style={{
              left: `${50 + Math.cos(angle) * 26}%`,
              top: `${50 + Math.sin(angle) * 29}%`,
            }}
          />
        )
      })}
    </span>
  )
}

export default function PublicHeader({
  transparentAtTop = false,
  locale = 'sv',
}: PublicHeaderProps) {
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(true)
  const [atTop, setAtTop] = useState(true)
  const lastScrollY = useRef(0)
  const activeLocale = useSyncExternalStore(
    subscribeToHostname,
    () => getLocaleFromHostname(window.location.hostname, locale),
    () => locale,
  )

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const difference = currentScrollY - lastScrollY.current
      setAtTop(currentScrollY < 24)

      if (currentScrollY < 80) {
        setVisible(true)
      } else if (difference > 7) {
        setVisible(false)
        setOpen(false)
      } else if (difference < -4) {
        setVisible(true)
      }

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

  const transparent = transparentAtTop && atTop && !open
  const marketCopy = marketNames[activeLocale]
  const localizedMarkets = markets.map((market) => {
    const [label, description] = marketCopy.options[market.locale]
    return { ...market, label, description }
  })
  const localizedLanguage =
    localizedMarkets.find((market) => market.locale === activeLocale) ||
    localizedMarkets[0]
  const homeHref =
    activeLocale === 'de'
      ? 'https://www.autorell.de/'
      : activeLocale === 'en'
        ? 'https://www.autorell.com/'
        : 'https://www.autorell.se/'
  const content =
    activeLocale === 'de'
      ? {
          message: 'Digitaler B2B-Fahrzeugmarkt für professionelle Händler',
          menuLabel: 'Navigation',
          privateLabel: 'Europäischer Fahrzeughandel',
          dealerLabel: 'Über Autorell',
          links: [
            ['/fahrzeuge', 'Fahrzeuge'],
            ['/so-funktionierts', 'So funktioniert es'],
            ['/vorteile', 'Vorteile'],
            ['/ueber-autorell', 'Über Autorell'],
            ['/faq', 'FAQ'],
            ['/kontakt', 'Kontakt'],
          ],
          partner: 'Händler werden',
          login: 'Händler-Login',
          cta: 'Händlerzugang',
          ctaHref: '/dealer-apply',
        }
      : activeLocale === 'en'
        ? {
            message: 'Selected Swedish vehicles for professional European buyers',
            menuLabel: 'Navigation',
            privateLabel: 'Swedish vehicles',
            dealerLabel: 'About Autorell',
            links: [
              ['/vehicles', 'Vehicles'],
              ['/how-it-works', 'How it works'],
              ['/dealer-benefits', 'Dealer benefits'],
              ['/about', 'About Autorell'],
              ['/faq', 'FAQ'],
              ['/contact', 'Contact'],
            ],
            partner: 'Become a dealer',
            login: 'Dealer login',
            cta: 'Dealer access',
            ctaHref: '/dealer-apply',
          }
        : {
            message: 'Utvalda svenska bilar för professionella köpare i Europa',
            menuLabel: 'Meny',
            privateLabel: 'För dig som säljer bil',
            dealerLabel: 'För bilhandlare',
            links: [
              ['/salj-bil', 'Sälj din bil'],
              ['/#sa-fungerar-det', 'Hur det funkar'],
              ['/foretag', 'Företag'],
              ['/for-handlare', 'För bilhandlare'],
              ['/vanliga-fragor', 'Vanliga frågor'],
              ['/kontakt', 'Kontakta oss'],
            ],
            partner: 'Bli bilhandlare',
            login: 'Logga in',
            cta: 'Sälj din bil',
            ctaHref: '/salj-bil',
          }
  const sellerMenu =
    activeLocale === 'sv'
      ? {
          eyebrow: 'För dig som säljer',
          title: 'Från biluppgifter till professionella bud.',
          text: 'Registrera bilen kostnadsfritt och se om den passar aktuell efterfrågan.',
          cta: 'Börja sälja din bil',
          ctaHref: '/salj-bil',
          items: [
            {
              href: '/salj-bil',
              label: 'Sälj din bil',
              text: 'Börja med bilens viktigaste uppgifter och se aktuella kriterier.',
              icon: ScanSearch,
            },
            {
              href: '/trygg-affar',
              label: 'Trygg affär',
              text: 'Så skyddas uppgifter, beslut och betalning.',
              icon: ShieldCheck,
            },
            {
              href: '/vanliga-fragor',
              label: 'Vanliga frågor',
              text: 'Kriterier, budgivning och trygghet.',
              icon: CircleHelp,
            },
          ],
        }
      : {
          eyebrow: activeLocale === 'de' ? 'Europäischer Fahrzeugmarkt' : 'Swedish vehicles',
          title:
            activeLocale === 'de'
              ? 'Fahrzeuge, Daten und digitale Auktionen für Händler.'
              : 'Selected vehicles for professional buyers.',
          text:
            activeLocale === 'de'
              ? 'Professioneller B2B-Zugang zu wachsendem europäischem Angebot.'
              : 'Structured vehicle data and focused bidding windows.',
          cta: activeLocale === 'de' ? 'Fahrzeuge ansehen' : 'View vehicles',
          ctaHref: activeLocale === 'de' ? '/fahrzeuge' : '/vehicles',
          items: [
            {
              href: activeLocale === 'de' ? '/fahrzeuge' : '/vehicles',
              label: activeLocale === 'de' ? 'Fahrzeuge' : 'Vehicles',
              text:
                activeLocale === 'de'
                  ? 'Aktueller Zugang zu qualifiziertem Fahrzeugangebot.'
                  : 'Current access to selected Swedish supply.',
              icon: CarFront,
            },
            {
              href: '/dealer-apply',
              label: activeLocale === 'de' ? 'Händlerzugang' : 'Dealer access',
              text:
                activeLocale === 'de'
                  ? 'Zugang zum professionellen Käufernetzwerk.'
                  : 'Join the professional buyer network.',
              icon: Store,
            },
          ],
        }
  const processMenu =
    activeLocale === 'sv'
      ? {
          eyebrow: 'Så fungerar Autorell',
          title: 'Ett tydligt flöde från kontroll till export.',
          text: 'Följ kvalificering, deklaration, budgivning och affär i sex tydliga steg.',
          cta: 'Se hur det funkar',
          ctaHref: '/#sa-fungerar-det',
          items: [
            {
              href: '/#sa-fungerar-det',
              label: 'Steg för steg',
              text: 'Se samtliga steg från bil till köpare.',
              icon: Route,
            },
            {
              href: '/vanliga-fragor',
              label: 'Budgivning & villkor',
              text: 'Svar om 24 timmar, kontroll och acceptans.',
              icon: Gavel,
            },
            {
              href: '/om-oss',
              label: 'Varför Autorell?',
              text: 'Idén bakom den europeiska marknadsplatsen.',
              icon: FileCheck2,
            },
          ],
        }
      : {
          eyebrow: activeLocale === 'de' ? 'Der Einkaufsprozess' : 'Buying process',
          title:
            activeLocale === 'de'
              ? 'Von der Fahrzeugprüfung bis zum Export.'
              : 'From vehicle review to export.',
          text:
            activeLocale === 'de'
              ? 'Ein strukturierter Ablauf für professionelle Käufer.'
              : 'A structured workflow for professional buyers.',
          cta: activeLocale === 'de' ? 'Ablauf ansehen' : 'View the process',
          ctaHref: activeLocale === 'de' ? '/so-funktionierts' : '/how-it-works',
          items: [
            {
              href: activeLocale === 'de' ? '/so-funktionierts' : '/how-it-works',
              label: activeLocale === 'de' ? 'So funktioniert es' : 'How buying works',
              text:
                activeLocale === 'de'
                  ? 'Gebot, Prüfung, Zahlung und Export.'
                  : 'Bidding, review, payment and export.',
              icon: Route,
            },
            {
              href: '/faq',
              label: 'FAQ',
              text:
                activeLocale === 'de'
                  ? 'Antworten für professionelle Käufer.'
                  : 'Answers for professional buyers.',
              icon: CircleHelp,
            },
          ],
        }
  const companyMenu =
    activeLocale === 'sv'
      ? {
          eyebrow: 'För professionella säljare',
          title: 'Europeisk avsättning för svenska fordonsportföljer.',
          text: 'För inbyten, leasingreturer, hyrbilsflottor och återkommande fordonsvolym.',
          cta: 'Se företagslösningen',
          ctaHref: '/foretag',
          items: [
            {
              href: '/foretag',
              label: 'Varför företag väljer Autorell',
              text: 'Räckvidd, fordonsdata och ett samordnat flöde.',
              icon: Building2,
            },
            {
              href: '/foretag#process',
              label: 'B2B-processen',
              text: 'Från fordonslista till transport och export.',
              icon: Route,
            },
            {
              href: '/foretag#foretagskontakt',
              label: 'Starta ett pilotflöde',
              text: 'Beskriv volym, fordonstyper och tidsplan.',
              icon: Handshake,
            },
          ],
        }
      : {
          eyebrow: activeLocale === 'de' ? 'Für professionelle Händler' : 'For professional dealers',
          title:
            activeLocale === 'de'
              ? 'Mehr Klarheit im europäischen Fahrzeugeinkauf.'
              : 'A clearer way to source Swedish vehicles.',
          text:
            activeLocale === 'de'
              ? 'Strukturierte Daten, fokussierte Gebote und ein professioneller Geschäftsraum.'
              : 'Structured data, focused bidding and a professional deal room.',
          cta: activeLocale === 'de' ? 'Vorteile entdecken' : 'Explore dealer benefits',
          ctaHref: activeLocale === 'de' ? '/vorteile' : '/dealer-benefits',
          items: [
            {
              href: activeLocale === 'de' ? '/vorteile' : '/dealer-benefits',
              label: activeLocale === 'de' ? 'Vorteile für Händler' : 'Dealer benefits',
              text:
                activeLocale === 'de'
                  ? 'Warum professionelle Käufer Autorell nutzen.'
                  : 'Why professional buyers use Autorell.',
              icon: Building2,
            },
            {
              href: '/dealer-apply',
              label: activeLocale === 'de' ? 'Händlerzugang' : 'Dealer access',
              text:
                activeLocale === 'de'
                  ? 'Unternehmen verifizieren und Zugang beantragen.'
                  : 'Verify your business and apply for access.',
              icon: Handshake,
            },
            {
              href: activeLocale === 'de' ? '/kontakt' : '/contact',
              label: activeLocale === 'de' ? 'Einkauf besprechen' : 'Talk to our team',
              text:
                activeLocale === 'de'
                  ? 'Fragen zu Fahrzeugen, Export und Zugang.'
                  : 'Questions about vehicles, export and access.',
              icon: Headphones,
            },
          ],
        }

  function handleSectionLink(
    event: ReactMouseEvent<HTMLAnchorElement>,
    href: string,
  ) {
    if (!href.startsWith('/#') || window.location.pathname !== '/') return

    const target = document.getElementById(href.slice(2))
    if (!target) return

    event.preventDefault()
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.history.replaceState(null, '', href)
  }

  return (
    <>
      <div
        className={`h-[104px] ${
          transparentAtTop ? 'md:hidden' : 'md:h-[124px]'
        }`}
        aria-hidden="true"
      />
      <div
        className={`fixed inset-x-0 top-0 z-[100] transition-transform duration-300 ease-out ${
          visible || open ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="h-8 bg-[#B4D9EF] text-[#242424] md:h-9">
          <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-5 text-[10px] font-medium tracking-[0.02em] sm:px-8 md:text-xs lg:px-12 xl:px-16">
            <span>{content.message}</span>
            <div className="hidden items-center gap-6 md:flex">
              <Link
                href={content.links[5][0]}
                className="inline-flex items-center gap-1.5 hover:underline"
              >
                <Headphones className="h-3.5 w-3.5" />
                {content.links[5][1]}
              </Link>
              <Link href="/dealer-apply" className="hover:underline">
                {content.partner}
              </Link>
              <Link href="/login" className="hover:underline">
                {content.login}
              </Link>
              <details className="group/language relative">
                <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full px-2 py-1 transition hover:bg-white/35 [&::-webkit-details-marker]:hidden">
                  <MarketFlag
                    locale={localizedLanguage.locale}
                    className="h-[14px] w-[21px]"
                  />
                  <span className="font-semibold tracking-[0.01em]">
                    {localizedLanguage.code}
                  </span>
                  <span>{localizedLanguage.label}</span>
                  <ChevronDown className="h-3.5 w-3.5 transition group-open/language:rotate-180" />
                </summary>

                <div className="absolute right-0 top-full z-20 w-[238px] pt-3">
                  <div className="overflow-hidden rounded-[18px] border border-[#d9e1e5] bg-white p-2 text-[#202124] shadow-[0_22px_60px_rgba(32,33,36,.18)]">
                    <p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7c898f]">
                      {marketCopy.selector}
                    </p>
                    {localizedMarkets.map((market) => (
                      <a
                        key={market.locale}
                        href={market.href}
                        className={`flex items-center gap-3 rounded-[12px] px-3 py-2.5 transition hover:bg-[#f2f6f7] ${
                          market.locale === activeLocale ? 'bg-[#eef6fa]' : ''
                        }`}
                      >
                        <MarketFlag
                          locale={market.locale}
                          className="h-[20px] w-[30px] shrink-0"
                        />
                        <span className="min-w-0 flex-1">
                          <strong className="block text-sm font-medium">
                            {market.label}
                          </strong>
                          <span className="block text-[11px] text-[#7a878d]">
                            {market.description}
                          </span>
                        </span>
                        <span className="text-[10px] font-semibold tracking-[0.08em] text-[#70818a]">
                          {market.code}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>

        <header
          className={`relative transition-[background-color,border-color,box-shadow] duration-300 ${
            transparent
              ? 'border-b border-[#deddd8]/80 bg-white shadow-[0_8px_30px_rgba(32,33,36,.06)] lg:border-transparent lg:bg-transparent lg:shadow-none'
              : 'border-b border-[#deddd8]/80 bg-white/95 shadow-[0_8px_30px_rgba(32,33,36,.06)] backdrop-blur-xl'
          }`}
        >
          <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 md:h-[88px] lg:px-12 xl:px-16">
            <a
              href={homeHref}
              aria-label={marketCopy.home}
              className="inline-flex shrink-0 items-center"
              onClick={() => setOpen(false)}
            >
              <BrandLogo />
            </a>

            <nav
              className={`absolute left-1/2 hidden w-max -translate-x-1/2 items-center whitespace-nowrap p-1.5 transition-[background-color,border-color,box-shadow,border-radius] duration-300 xl:flex ${
                transparent
                  ? 'rounded-full border border-white/70 bg-white/72 shadow-[0_12px_35px_rgba(32,33,36,.08)] backdrop-blur-xl'
                  : 'border border-transparent bg-transparent shadow-none'
              }`}
            >
              <DesktopMenu
                number="01"
                label={content.links[0][1]}
                href={content.links[0][0]}
                menu={sellerMenu}
                onNavigate={handleSectionLink}
                align="start"
                icon={ScanSearch}
              />
              <DesktopMenu
                number="02"
                label={content.links[1][1]}
                href={content.links[1][0]}
                menu={processMenu}
                onNavigate={handleSectionLink}
                icon={Route}
              />

              <DesktopMenu
                number="03"
                label={content.links[2][1]}
                href={content.links[2][0]}
                menu={companyMenu}
                onNavigate={handleSectionLink}
                icon={Building2}
              />

              <div className="group relative">
                <Link
                  href={activeLocale === 'sv' ? '/for-handlare' : content.links[3][0]}
                  className="flex min-h-10 shrink-0 appearance-none items-center gap-2 rounded-full px-4 text-[13px] font-normal text-[#303030] transition hover:bg-[#f1f5f6] group-focus-within:bg-[#f1f5f6] 2xl:px-5"
                >
                  <span className="text-[9px] font-medium tracking-[0.12em] text-[#8d989d]">
                    04
                  </span>
                  {content.dealerLabel}
                  <ChevronDown className="h-3.5 w-3.5 transition duration-200 group-hover:rotate-180 group-focus-within:rotate-180" />
                </Link>

                <div className="pointer-events-none absolute left-1/2 top-full w-[760px] -translate-x-1/2 translate-y-2 pt-[18px] opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100 2xl:w-[820px]">
                  <div className="overflow-hidden rounded-[22px] border border-[#dfe5e8] bg-white shadow-[0_30px_80px_rgba(32,33,36,.16)]">
                    <div className="grid grid-cols-[1.12fr_.88fr]">
                      <div className="min-w-0 bg-[#eef6fa] p-7 2xl:p-8">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#B4D9EF] text-[#242424]">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.18em] text-[#68808e]">
                          Autorell Dealer Network
                        </p>
                        <h3 className="mt-2 max-w-[360px] whitespace-normal text-[25px] leading-[1.08] tracking-[-0.035em] text-[#202124] 2xl:text-[27px]">
                          {activeLocale === 'de'
                            ? 'Europäischer Handel. Klarere Entscheidungen.'
                            : 'Swedish vehicles. Clearer decisions.'}
                        </h3>
                        <p className="mt-3 max-w-[390px] whitespace-normal text-sm leading-6 text-[#5c707b]">
                          {activeLocale === 'de'
                            ? 'Strukturierte Fahrzeugprofile und ein fokussierter Einkaufsprozess für professionelle Händler.'
                            : 'Structured vehicle profiles and focused European bidding for professional buyers.'}
                        </p>
                        <Link
                          href="/dealer-apply"
                          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#202124]"
                        >
                          {content.partner}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>

                      <div className="min-w-0 p-5">
                        <Link
                          href="/login"
                          className="group/item flex items-center gap-4 rounded-[14px] p-4 transition hover:bg-[#f5f6f4]"
                        >
                          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dce1e3] text-[#4e626c]">
                            <LogIn className="h-4.5 w-4.5" />
                          </span>
                          <span className="min-w-0">
                            <strong className="block text-sm font-medium text-[#202124]">
                              {content.login}
                            </strong>
                            <span className="mt-1 block whitespace-normal text-xs leading-5 text-[#78858b]">
                              {activeLocale === 'de'
                                ? 'Auktionen und Konto öffnen'
                                : 'Access auctions and your account'}
                            </span>
                          </span>
                        </Link>
                        <Link
                          href="/dealer-terms"
                          className="group/item flex items-center gap-4 rounded-[14px] p-4 transition hover:bg-[#f5f6f4]"
                        >
                          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dce1e3] text-[#4e626c]">
                            <ShieldCheck className="h-4.5 w-4.5" />
                          </span>
                          <span className="min-w-0">
                            <strong className="block text-sm font-medium text-[#202124]">
                              {activeLocale === 'de' ? 'Händlerbedingungen' : 'Dealer terms'}
                            </strong>
                            <span className="mt-1 block whitespace-normal text-xs leading-5 text-[#78858b]">
                              {activeLocale === 'de'
                                ? 'Gebote, Gebühren und Plattformregeln'
                                : 'Bidding, fees and platform rules'}
                            </span>
                          </span>
                        </Link>
                        <Link
                          href={content.links[5][0]}
                          className="group/item flex items-center gap-4 rounded-[14px] p-4 transition hover:bg-[#f5f6f4]"
                        >
                          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dce1e3] text-[#4e626c]">
                            <Headphones className="h-4.5 w-4.5" />
                          </span>
                          <span className="min-w-0">
                            <strong className="block text-sm font-medium text-[#202124]">
                              {activeLocale === 'de' ? 'Persönlicher Support' : 'Personal support'}
                            </strong>
                            <span className="mt-1 block whitespace-normal text-xs leading-5 text-[#78858b]">
                              {activeLocale === 'de'
                                ? 'Sprechen Sie mit dem Autorell-Team'
                                : 'Speak with the Autorell team'}
                            </span>
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Link
                href={content.links[4][0]}
                className="flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[13px] font-normal text-[#303030] transition hover:bg-[#f1f5f6] hover:text-[#111111] 2xl:px-5"
              >
                <span className="text-[9px] font-medium tracking-[0.12em] text-[#8d989d]">
                  05
                </span>
                {content.links[4][1]}
              </Link>
            </nav>

            <div className="hidden items-center gap-2 xl:flex">
              <Link
                href={content.ctaHref}
                className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#242424] pl-5 pr-2 text-sm font-normal text-white shadow-[0_12px_28px_rgba(32,33,36,.18)] transition hover:-translate-y-0.5 hover:bg-[#111111]"
              >
                {content.cta}
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#B4D9EF] text-[#242424] transition group-hover:translate-x-0.5">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? marketCopy.closeMenu : marketCopy.openMenu}
              aria-expanded={open}
              className={`flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition xl:hidden ${
                open
                  ? 'border-[#242424] bg-[#242424] text-white'
                  : 'border-[#deddd8] bg-[#f8f7f3] text-[#242424]'
              }`}
            >
              <span>{content.menuLabel}</span>
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </header>

        <div
          className={`absolute inset-x-0 top-full h-[calc(100dvh-104px)] overflow-y-auto border-t border-[#deddd8] bg-[#f6f4ef] shadow-[0_24px_60px_rgba(32,33,36,.14)] transition duration-300 md:h-[calc(100dvh-124px)] xl:hidden ${
            open
              ? 'pointer-events-auto translate-y-0 opacity-100'
              : 'pointer-events-none -translate-y-3 opacity-0'
          }`}
        >
          <div className="mx-auto flex min-h-full max-w-2xl flex-col px-5 py-7 sm:px-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7a8082]">
              {content.privateLabel}
            </p>
            <nav className="mt-3">
              {content.links.slice(0, 5).map(([href, label], index) => (
                <Link
                  key={href}
                  href={href}
                  onClick={(event) => {
                    setOpen(false)
                    handleSectionLink(event, href)
                  }}
                  className="group flex items-center justify-between border-b border-[#dcdad3] py-4 text-[22px] font-medium tracking-[-0.025em] text-[#202124]"
                >
                  <span>
                    <span className="mr-3 text-xs font-medium text-[#9a9d9d]">
                      0{index + 1}
                    </span>
                    {label}
                  </span>
                  <ArrowRight className="h-5 w-5 text-[#71818b] transition group-hover:translate-x-1" />
                </Link>
              ))}
            </nav>

            <Link
              href={content.ctaHref}
              onClick={() => setOpen(false)}
              className="mt-6 flex min-h-14 items-center justify-between rounded-[14px] bg-[#B4D9EF] px-5 text-base font-medium text-[#242424]"
            >
              {content.cta}
              <ArrowRight className="h-5 w-5" />
            </Link>

            <Link
              href={content.links[5][0]}
              onClick={() => setOpen(false)}
              className="mt-3 flex min-h-14 items-center justify-between rounded-[14px] border border-[#242424] bg-[#242424] px-5 text-base font-medium text-white shadow-[0_12px_28px_rgba(32,33,36,.16)]"
            >
              <span className="flex items-center gap-3">
                <Headphones className="h-5 w-5" />
                {content.links[5][1]}
              </span>
              <ArrowRight className="h-5 w-5" />
            </Link>

            <div className="mt-9 rounded-[18px] border border-[#dddcd6] bg-white p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7a8082]">
                {content.dealerLabel}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Link
                  href="/dealer-apply"
                  onClick={() => setOpen(false)}
                  className="flex min-h-12 items-center gap-3 rounded-[12px] border border-[#dcdad3] px-4 text-sm text-[#242424]"
                >
                  <Store size={17} />
                  {content.partner}
                </Link>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex min-h-12 items-center gap-3 rounded-[12px] bg-[#242424] px-4 text-sm text-white"
                >
                  <LogIn size={17} />
                  {content.login}
                </Link>
              </div>
            </div>

            <div className="mt-auto border-t border-[#dcdad3] pt-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7a8082]">
                {marketCopy.selector}
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {localizedMarkets.map((market) => (
                  <a
                    key={market.locale}
                    href={market.href}
                    className={`flex min-h-14 items-center gap-3 rounded-[12px] border px-3.5 text-sm transition ${
                      market.locale === activeLocale
                        ? 'border-[#8ebdd8] bg-[#eaf5fb] text-[#202124]'
                        : 'border-[#dcdad3] bg-white text-[#62686c]'
                    }`}
                  >
                    <MarketFlag
                      locale={market.locale}
                      className="h-[20px] w-[30px]"
                    />
                    <span className="min-w-0 flex-1">
                      <strong className="block font-medium leading-4">
                        {market.label}
                      </strong>
                      <span className="mt-0.5 block text-[10px] uppercase tracking-[0.12em] text-[#7b878c]">
                        {market.code}
                      </span>
                    </span>
                    {market.locale === activeLocale && (
                      <span
                        className="h-2 w-2 rounded-full bg-[#5f9fbe]"
                        aria-label={marketCopy.activeMarket}
                      />
                    )}
                  </a>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-[#dcdad3] pt-5">
                <SocialIcons />
                <span className="text-sm font-medium text-[#62686c]">
                  Autorell AB
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

type DesktopMenuData = {
  eyebrow: string
  title: string
  text: string
  cta: string
  ctaHref: string
  items: Array<{
    href: string
    label: string
    text: string
    icon: LucideIcon
  }>
}

function DesktopMenu({
  number,
  label,
  href,
  menu,
  onNavigate,
  align = 'center',
  icon: MenuIcon,
}: {
  number: string
  label: string
  href: string
  menu: DesktopMenuData
  onNavigate: (event: ReactMouseEvent<HTMLAnchorElement>, href: string) => void
  align?: 'start' | 'center'
  icon: LucideIcon
}) {
  return (
    <div className="group relative">
      <a
        href={href}
        onClick={(event) => onNavigate(event, href)}
        className="flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[13px] font-normal text-[#303030] transition hover:bg-[#f1f5f6] group-focus-within:bg-[#f1f5f6] 2xl:px-5"
      >
        <span className="text-[9px] font-medium tracking-[0.12em] text-[#8d989d] transition group-hover:text-[#54788d]">
          {number}
        </span>
        {label}
        <ChevronDown className="h-3.5 w-3.5 transition duration-200 group-hover:rotate-180 group-focus-within:rotate-180" />
      </a>

      <div
        className={`pointer-events-none absolute top-full w-[720px] translate-y-2 pt-[18px] opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100 2xl:w-[780px] ${
          align === 'start' ? 'left-0' : 'left-1/2 -translate-x-1/2'
        }`}
      >
        <div className="grid grid-cols-[1.08fr_.92fr] overflow-hidden rounded-[22px] border border-[#dfe5e8] bg-white shadow-[0_30px_80px_rgba(32,33,36,.16)]">
          <div className="min-w-0 bg-[#eef6fa] p-7">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#B4D9EF] text-[#242424]">
              <MenuIcon className="h-5 w-5" />
            </span>
            <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.19em] text-[#68808e]">
              {menu.eyebrow}
            </p>
            <h3 className="mt-2 whitespace-normal text-[25px] leading-[1.08] tracking-[-0.035em] text-[#202124]">
              {menu.title}
            </h3>
            <p className="mt-3 whitespace-normal text-sm leading-6 text-[#5c707b]">
              {menu.text}
            </p>
            <a
              href={menu.ctaHref}
              onClick={(event) => onNavigate(event, menu.ctaHref)}
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#202124]"
            >
              {menu.cta}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="min-w-0 p-4">
            {menu.items.map(({ href: itemHref, label: itemLabel, text, icon: Icon }) => (
              <a
                key={`${itemHref}-${itemLabel}`}
                href={itemHref}
                onClick={(event) => onNavigate(event, itemHref)}
                className="group/item flex items-center gap-4 rounded-[14px] p-4 transition hover:bg-[#f5f6f4]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#dce1e3] text-[#4e626c]">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <span className="min-w-0">
                  <strong className="block whitespace-normal text-sm font-medium text-[#202124]">
                    {itemLabel}
                  </strong>
                  <span className="mt-1 block whitespace-normal text-xs leading-5 text-[#78858b]">
                    {text}
                  </span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
