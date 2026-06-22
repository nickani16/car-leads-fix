'use client'

import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CarFront,
  ChevronDown,
  CircleHelp,
  Handshake,
  Headphones,
  LogIn,
  Menu,
  Route,
  ScanSearch,
  ShieldCheck,
  Store,
  UserRound,
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
import CountryFlag from './CountryFlag'
import SocialIcons from './SocialIcons'
import { euBuyerMarkets } from '@/lib/eu-buyer-markets'
import {
  localizePublicHref,
  publicLanguages,
  translatePublic,
  translatePublicObject,
  type PublicLocale,
} from '@/lib/public-i18n'

type PublicHeaderProps = {
  transparentAtTop?: boolean
  locale?: PublicLocale
}

type MarketLocale = NonNullable<PublicHeaderProps['locale']>

const buyCarLabels: Record<PublicLocale, string> = {
  sv: 'Köp bil',
  de: 'Fahrzeuge kaufen',
  en: 'Buy cars',
  fr: 'Acheter des véhicules',
  es: 'Comprar vehículos',
  it: 'Acquista veicoli',
  pl: 'Kup pojazdy',
  nl: 'Voertuigen kopen',
  pt: 'Comprar veículos',
  fi: 'Osta ajoneuvoja',
  da: 'Køb køretøjer',
  cs: 'Koupit vozidla',
  ro: 'Cumpără vehicule',
  bg: 'Купи автомобили',
  hr: 'Kupi vozila',
  el: 'Αγορά οχημάτων',
  hu: 'Járművásárlás',
  sk: 'Kúpiť vozidlá',
  sl: 'Kupi vozila',
  et: 'Osta sõidukeid',
  lv: 'Pirkt transportlīdzekļus',
  lt: 'Pirkti automobilius',
}

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
  if (fallback !== 'sv' && fallback !== 'de' && fallback !== 'en') {
    return fallback
  }
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
  return (
    <CountryFlag
      code={locale === 'sv' ? 'se' : locale === 'en' ? 'eu' : locale}
      className={className}
    />
  )
}

export default function PublicHeader({
  locale = 'sv',
}: PublicHeaderProps) {
  const [open, setOpen] = useState(false)
  const [marketOpen, setMarketOpen] = useState(false)
  const [visible, setVisible] = useState(true)
  const lastScrollY = useRef(0)
  const marketMenuRef = useRef<HTMLDivElement>(null)
  const activeLocale = useSyncExternalStore(
    subscribeToHostname,
    () => getLocaleFromHostname(window.location.hostname, locale),
    () => locale,
  )

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const difference = currentScrollY - lastScrollY.current

      if (currentScrollY < 80) {
        setVisible(true)
      } else if (difference > 7) {
        setVisible(false)
        setOpen(false)
        setMarketOpen(false)
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

  useEffect(() => {
    if (!marketOpen) return

    const closeMarketMenu = (event: PointerEvent) => {
      if (!marketMenuRef.current?.contains(event.target as Node)) {
        setMarketOpen(false)
      }
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMarketOpen(false)
    }

    document.addEventListener('pointerdown', closeMarketMenu)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeMarketMenu)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [marketOpen])

  const marketCopy =
    activeLocale === 'sv'
      ? marketNames.sv
      : activeLocale === 'de'
        ? marketNames.de
        : translatePublicObject(activeLocale, marketNames.en)
  const languageNames: Record<string, string> = {
    en: 'English',
    fr: 'Français',
    es: 'Español',
    it: 'Italiano',
    pl: 'Polski',
    nl: 'Nederlands',
    pt: 'Português',
    fi: 'Suomi',
    da: 'Dansk',
    cs: 'Čeština',
    ro: 'Română',
    bg: 'Български',
    hr: 'Hrvatski',
    el: 'Ελληνικά',
    hu: 'Magyar',
    sk: 'Slovenčina',
    sl: 'Slovenščina',
    et: 'Eesti',
    lv: 'Latviešu',
    lt: 'Lietuvių',
  }
  const localizedMarkets = [
    ...markets.slice(0, 2),
    ...publicLanguages.map((language) => ({
      locale: language,
      code: language === 'en' ? 'EU' : language.toUpperCase(),
      label: languageNames[language],
      description: language === 'en' ? 'Europe' : languageNames[language],
      href: `https://www.autorell.com/${language}?language=${language}`,
    })),
  ]
  const localizedLanguage =
    localizedMarkets.find((market) => market.locale === activeLocale) ||
    localizedMarkets[0]
  const homeHref =
    activeLocale === 'de'
      ? 'https://www.autorell.de/'
      : activeLocale !== 'sv'
        ? `https://www.autorell.com/${activeLocale}`
        : 'https://www.autorell.se/'
  const marketRoutes =
    activeLocale === 'de'
      ? {
          vehicles: '/fahrzeuge-finden',
          dealerAccess: '/haendlerzugang',
          dealerTerms: '/haendlerbedingungen',
        }
      : activeLocale === 'sv'
        ? {
            vehicles: '/hitta-bilar',
            dealerAccess: '/bli-bilhandlare',
            dealerTerms: '/handlarvillkor',
          }
        : {
            vehicles: '/find-cars',
            dealerAccess: '/dealer-apply',
            dealerTerms: '/dealer-terms',
          }
  let content =
    activeLocale === 'de'
      ? {
          message: 'Schwedische Fahrzeuge. Europäische Nachfrage. Autorell als Handelspartner.',
          menuLabel: 'Navigation',
          privateLabel: 'Europäischer Fahrzeughandel',
          dealerLabel: 'Über Autorell',
          links: [
            [marketRoutes.vehicles, 'Fahrzeuge kaufen'],
            ['/so-funktionierts', 'So funktioniert es'],
            ['/vorteile', 'Vorteile'],
            ['/ueber-autorell', 'Über Autorell'],
            ['/faq', 'FAQ'],
            ['/kontakt', 'Kontakt'],
          ],
          partner: 'Händler werden',
          login: 'Händler-Login',
          cta: 'Händlerzugang',
          ctaHref: marketRoutes.dealerAccess,
        }
      : activeLocale !== 'sv'
        ? {
            message: 'Swedish vehicle supply. Buyer demand across Europe. Autorell as trading partner.',
            menuLabel: 'Navigation',
            privateLabel: 'Swedish vehicles',
            dealerLabel: 'About Autorell',
            links: [
              [marketRoutes.vehicles, 'Buy cars'],
              ['/how-it-works', 'How it works'],
              ['/dealer-benefits', 'Dealer benefits'],
              ['/about', 'About Autorell'],
              ['/faq', 'FAQ'],
              ['/contact', 'Contact'],
            ],
            partner: 'Become a dealer',
            login: 'Dealer login',
            cta: 'Dealer access',
            ctaHref: marketRoutes.dealerAccess,
          }
        : {
            message: 'Autorell söker det starkaste priset i sitt europeiska köparnätverk',
            menuLabel: 'Meny',
            privateLabel: 'För dig som säljer bil',
            dealerLabel: 'För bilhandlare',
            links: [
              ['/salj-bil', 'Sälj din bil'],
              ['/foretag', 'Företag'],
              [marketRoutes.vehicles, 'Köp bil'],
              ['/for-handlare', 'För bilhandlare'],
              ['/vanliga-fragor', 'Vanliga frågor'],
              ['/kontakt', 'Kontakta oss'],
            ],
            partner: 'Bli bilhandlare',
            login: 'Logga in',
            cta: 'Sälj din bil',
            ctaHref: '/salj-bil',
          }
  let sellerMenu =
    activeLocale === 'sv'
      ? {
          eyebrow: 'För privatpersoner',
          title: 'Sälj bilen. Vi hittar köparen och löser resten.',
          text: 'Autorell testar bilen hos verifierade EU-handlare och sköter kontroll, betalning, hämtning och export.',
          cta: 'Sälj din bil',
          ctaHref: '/salj-bil',
          items: [
            {
              href: '/salj-bil',
              label: 'Starta bilförsäljningen',
              text: 'Fyll i bilen och kontrollera om den passar vår köpbox.',
              icon: ScanSearch,
            },
            {
              href: '/#sa-fungerar-det',
              label: 'Så löser vi affären',
              text: 'Köparnätverk, erbjudande, kontroll, betalning och hämtning.',
              icon: Route,
            },
            {
              href: '/vanliga-fragor',
              label: 'Kriterier och frågor',
              text: 'Årsmodell 2018+, högst 10 000 mil och gott skick.',
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
          ctaHref: marketRoutes.vehicles,
          items: [
            {
              href: marketRoutes.vehicles,
              label: activeLocale === 'de' ? 'Fahrzeuge kaufen' : 'Buy cars',
              text:
                activeLocale === 'de'
                  ? 'Aktueller Zugang zu qualifiziertem Fahrzeugangebot.'
                  : 'Current access to selected Swedish supply.',
              icon: CarFront,
            },
            {
              href:
                activeLocale === 'de'
                  ? '/fahrzeugbestand-verkaufen'
                  : '/sell-stock',
              label:
                activeLocale === 'de'
                  ? 'Fahrzeugbestand verkaufen'
                  : 'Sell business vehicles',
              text:
                activeLocale === 'de'
                  ? 'Bestand, Leasingrückläufer oder Flottenfahrzeuge ohne Konto einreichen.'
                  : 'Submit stock, leasing returns or fleet vehicles without an account.',
              icon: Building2,
            },
            {
              href: marketRoutes.dealerAccess,
              label: activeLocale === 'de' ? 'Händlerzugang' : 'Dealer access',
              text:
                activeLocale === 'de'
                  ? 'Zugang zum professionellen Käufernetzwerk.'
                  : 'Join the professional buyer network.',
              icon: Store,
            },
          ],
        }
  let processMenu =
    activeLocale === 'sv'
      ? {
          eyebrow: 'För företag',
          title: 'Sälj stora och återkommande fordonsvolymer i Europa.',
          text: 'För lagerbilar, leasingreturer, företagsflottor och andra professionella fordonsägare.',
          cta: 'Se företagslösningen',
          ctaHref: '/foretag',
          items: [
            {
              href: '/foretag',
              label: 'Företagsförsäljning',
              text: 'EU-köpare och ett samordnat flöde för många fordon.',
              icon: Building2,
            },
            {
              href: '/salj-lagerbil',
              label: 'Skicka in ett fordon',
              text: 'Starta direkt utan att först skapa ett konto.',
              icon: CarFront,
            },
            {
              href: '/foretag#foretagskontakt',
              label: 'Diskutera större volymer',
              text: 'Leasingreturer, lager och återkommande flöden.',
              icon: Handshake,
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
  let companyMenu =
    activeLocale === 'sv'
      ? {
          eyebrow: 'För verifierade köpare',
          title: 'Utvalda svenska bilar för professionella handlare.',
          text: 'Se publikt utbud eller ansök om åtkomst till fullständig data och budgivning.',
          cta: 'Köp bil',
          ctaHref: marketRoutes.vehicles,
          items: [
            {
              href: marketRoutes.vehicles,
              label: 'Köp bil',
              text: 'Se aktuellt utbud från Autorell.',
              icon: CarFront,
            },
            {
              href: marketRoutes.dealerAccess,
              label: 'Ansök som bilhandlare',
              text: 'Få fullständiga fordonsdata och möjlighet att lägga bud.',
              icon: Store,
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
              href:
                activeLocale === 'de'
                  ? '/fahrzeugbestand-verkaufen'
                  : '/sell-stock',
              label:
                activeLocale === 'de'
                  ? 'Fahrzeuge verkaufen'
                  : 'Sell vehicles to Autorell',
              text:
                activeLocale === 'de'
                  ? 'Bestand oder Flottenfahrzeuge ohne Konto einreichen.'
                  : 'Submit stock or fleet vehicles without an account.',
              icon: CarFront,
            },
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
              href: marketRoutes.dealerAccess,
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
  let aboutMenu =
    activeLocale === 'de'
      ? {
          eyebrow: 'Über Autorell',
          title: 'Ein europäischer Fahrzeugmarkt mit klareren Daten.',
          text: 'Erfahren Sie mehr über Autorell, unser Käufernetzwerk und den strukturierten grenzüberschreitenden Prozess.',
          cta: 'Über Autorell',
          ctaHref: '/ueber-autorell',
          items: [
            {
              href: '/ueber-autorell',
              label: 'Unternehmen und Plattform',
              text: 'Unsere Rolle im europäischen Fahrzeughandel.',
              icon: Building2,
            },
            {
              href: '/vorteile',
              label: 'Vorteile für Händler',
              text: 'Ausgewählte Fahrzeuge, Daten und koordinierte Abwicklung.',
              icon: BadgeCheck,
            },
            {
              href: marketRoutes.dealerTerms,
              label: 'Händlerbedingungen',
              text: 'Gebote, Gebühren und Plattformregeln.',
              icon: ShieldCheck,
            },
            {
              href: '/kontakt',
              label: 'Autorell kontaktieren',
              text: 'Fragen zu Zugang, Fahrzeugen und Export.',
              icon: Headphones,
            },
          ],
        }
      : activeLocale !== 'sv'
        ? {
            eyebrow: 'About Autorell',
            title: 'A European vehicle market built on clearer data.',
            text: 'Learn about Autorell, our professional buyer network and the connected cross-border transaction process.',
            cta: 'About Autorell',
            ctaHref: '/about',
            items: [
              {
                href: '/about',
                label: 'Company and platform',
                text: 'Our role in professional European vehicle trade.',
                icon: Building2,
              },
              {
                href: '/dealer-benefits',
                label: 'Dealer benefits',
                text: 'Selected supply, structured data and coordinated delivery.',
                icon: BadgeCheck,
              },
              {
                href: marketRoutes.dealerTerms,
                label: 'Dealer terms',
                text: 'Bidding, fees and platform rules.',
                icon: ShieldCheck,
              },
              {
                href: '/contact',
                label: 'Contact Autorell',
                text: 'Questions about access, vehicles and export.',
                icon: Headphones,
              },
            ],
          }
        : {
            eyebrow: 'Om Autorell',
            title: 'Ett tydligare sätt att föra samman bilar och professionella köpare.',
            text: 'Läs om Autorell, tryggheten i processen och hur vi arbetar med det europeiska köparnätverket.',
            cta: 'Om Autorell',
            ctaHref: '/om-oss',
            items: [
              {
                href: '/om-oss',
                label: 'Om företaget',
                text: 'Vår plattform och roll i fordonsaffären.',
                icon: Building2,
              },
              {
                href: '/trygg-affar',
                label: 'En trygg affär',
                text: 'Skyddade uppgifter, kontroll och tydliga steg.',
                icon: ShieldCheck,
              },
              {
                href: marketRoutes.dealerTerms,
                label: 'Handlarvillkor',
                text: 'Regler för professionella köpare.',
                icon: BadgeCheck,
              },
              {
                href: '/kontakt',
                label: 'Kontakta Autorell',
                text: 'Frågor om försäljning, köp eller företag.',
                icon: Headphones,
              },
            ],
          }

  if (activeLocale !== 'sv' && activeLocale !== 'de') {
    content = {
      ...content,
      message: translatePublic(activeLocale, content.message),
      menuLabel: translatePublic(activeLocale, content.menuLabel),
      privateLabel: translatePublic(activeLocale, content.privateLabel),
      dealerLabel: translatePublic(activeLocale, content.dealerLabel),
      links: content.links.map(([href, label]) => [
        localizePublicHref(activeLocale, href),
        translatePublic(activeLocale, label),
      ]),
      partner: translatePublic(activeLocale, content.partner),
      login: translatePublic(activeLocale, content.login),
      cta: translatePublic(activeLocale, content.cta),
    }

    const localizeMenu = <T extends typeof sellerMenu>(menu: T): T => {
      const translated = translatePublicObject(activeLocale, menu)
      return {
        ...translated,
        ctaHref: localizePublicHref(activeLocale, translated.ctaHref),
        items: translated.items.map((item) => ({
          ...item,
          href: localizePublicHref(activeLocale, item.href),
        })),
      } as T
    }

    sellerMenu = localizeMenu(sellerMenu)
    processMenu = localizeMenu(processMenu)
    companyMenu = localizeMenu(companyMenu)
    aboutMenu = localizeMenu(aboutMenu)
  }

  const buyCarLabel = buyCarLabels[activeLocale]
  const desktopRegisterLabel =
    activeLocale === 'sv'
      ? 'Registrera dig'
      : activeLocale === 'de'
        ? 'Registrieren'
        : activeLocale === 'en'
          ? 'Register'
          : translatePublic(activeLocale, 'Register')
  const desktopLoginLabel =
    activeLocale === 'sv'
      ? 'Logga in'
      : activeLocale === 'de'
        ? 'Anmelden'
        : activeLocale === 'en'
          ? 'Log in'
          : translatePublic(activeLocale, 'Log in')
  const vehicleCategories =
    activeLocale === 'sv'
      ? [
          ['Bilar', marketRoutes.vehicles],
          ['Transportbilar', '/marketplace/vans'],
          ['Motorcyklar', '/marketplace/bikes'],
          ['Husbilar', '/marketplace/motorhomes'],
          ['Husvagnar', '/marketplace/caravans'],
          ['Lastbilar', '/marketplace/trucks'],
          ['Lantbruk', '/marketplace/farm'],
          ['Entreprenad', '/marketplace/plant'],
          ['Elcyklar', '/marketplace/electric-bikes'],
        ]
      : [
          ['Cars', marketRoutes.vehicles],
          ['Vans', '/marketplace/vans'],
          ['Bikes', '/marketplace/bikes'],
          ['Motorhomes', '/marketplace/motorhomes'],
          ['Caravans', '/marketplace/caravans'],
          ['Trucks', '/marketplace/trucks'],
          ['Farm', '/marketplace/farm'],
          ['Plant', '/marketplace/plant'],
          ['Electric bikes', '/marketplace/electric-bikes'],
        ]
  content = {
    ...content,
    links: content.links.map(([href, label]) => [
      href,
      href === marketRoutes.vehicles ? buyCarLabel : label,
    ]),
  }
  sellerMenu = {
    ...sellerMenu,
    items: sellerMenu.items.map((item) => ({
      ...item,
      label: item.href === marketRoutes.vehicles ? buyCarLabel : item.label,
    })),
  }
  companyMenu = {
    ...companyMenu,
    cta:
      companyMenu.ctaHref === marketRoutes.vehicles
        ? buyCarLabel
        : companyMenu.cta,
    items: companyMenu.items.map((item) => ({
      ...item,
      label: item.href === marketRoutes.vehicles ? buyCarLabel : item.label,
    })),
  }

  if (activeLocale === 'sv') {
    content = {
      ...content,
      dealerLabel: 'Om Autorell',
      partner: 'Bli företagssäljare',
      cta: 'Ansök om företagskonto',
      ctaHref: marketRoutes.dealerAccess,
      links: [
        ['/find-cars', 'Köp'],
        ['/dealer-apply', 'Sälj som företag'],
        ['/dealer', 'Företagskonto'],
        ['/om-oss', 'Om Autorell'],
        ['/vanliga-fragor', 'Hjälp'],
        ['/kontakt', 'Kontakta oss'],
      ],
    }
    sellerMenu = {
      ...sellerMenu,
      eyebrow: 'Autorell marketplace',
      title: 'Utforska professionellt utbud.',
      text: 'Fordon och maskiner listade av verifierade företag.',
      cta: 'Se Cars',
      ctaHref: '/find-cars',
    }
    processMenu = {
      ...processMenu,
      eyebrow: 'Endast för företag',
      title: 'Lista objekt som professionell säljare.',
      text: 'Ansök om företagskonto för att publicera ert lager på Autorell.',
      cta: 'Ansök om konto',
      ctaHref: '/dealer-apply',
    }
    companyMenu = {
      ...companyMenu,
      eyebrow: 'Företagsplattform',
      title: 'Hantera utbud och affärer.',
      text: 'Ett professionellt arbetsflöde för listningar, köpare och försäljning.',
      cta: 'Logga in',
      ctaHref: '/login',
    }
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
      <div className="h-[64px] min-[1120px]:h-[80px]" aria-hidden="true" />
      <div
        className={`fixed inset-x-0 top-0 z-[100] transition-transform duration-300 ease-out ${
          visible || open ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="hidden">
          <div className="mx-auto flex h-8 max-w-[1440px] items-center justify-between px-5 text-[10px] font-medium tracking-[0.02em] sm:px-8 md:h-9 md:text-xs lg:px-12 xl:px-16">
            <span />
            <div className="hidden items-center gap-6 md:flex">
              <Link
                href={content.links[5][0]}
                className="inline-flex items-center gap-1.5 hover:underline"
              >
                <Headphones className="h-3.5 w-3.5" />
                {content.links[5][1]}
              </Link>
              <Link href={marketRoutes.dealerAccess} className="hover:underline">
                {content.partner}
              </Link>
              <div ref={marketMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setMarketOpen((current) => !current)}
                  aria-expanded={marketOpen}
                  aria-haspopup="menu"
                  className="flex items-center gap-2 rounded-full px-2 py-1 transition hover:bg-white/35"
                >
                  <MarketFlag
                    locale={localizedLanguage.locale}
                    className="h-[14px] w-[21px]"
                  />
                  <span>{localizedLanguage.label}</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition ${
                      marketOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <div
                  className={`absolute right-0 top-full z-20 pt-3 transition duration-150 ${
                    activeLocale === 'en' ? 'w-[min(680px,calc(100vw-32px))]' : 'w-[238px]'
                  } ${
                    marketOpen
                      ? 'pointer-events-auto translate-y-0 opacity-100'
                      : 'pointer-events-none -translate-y-1 opacity-0'
                  }`}
                >
                  <div
                    role="menu"
                    className="max-h-[calc(100dvh-76px)] overflow-y-auto overscroll-contain rounded-[18px] border border-[#d9e1e5] bg-white p-2 text-[#202124] shadow-[0_22px_60px_rgba(32,33,36,.18)]"
                  >
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
                      </a>
                    ))}
                    {activeLocale === 'en' && (
                      <>
                        <div className="mx-3 my-2 border-t border-[#e4e8e9]" />
                        <p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7c898f]">
                          European dealer markets
                        </p>
                        <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
                          {euBuyerMarkets.map((market) => (
                            <a
                              key={market.code}
                              href={`https://www.autorell.com/${market.code}?market=${market.code}`}
                              className="flex items-center gap-3 rounded-[12px] px-3 py-2.5 transition hover:bg-[#f2f6f7]"
                            >
                              <CountryFlag
                                code={market.code}
                                className="h-[20px] w-[30px] shrink-0"
                              />
                              <span className="min-w-0">
                                <strong className="block truncate text-sm font-medium">
                                  {market.countryLocal}
                                </strong>
                                <span className="block text-[10px] text-[#7a878d]">
                                  {market.country}
                                </span>
                              </span>
                            </a>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <header className="relative border-b border-[#deddd8] bg-white">
          <div className="hidden border-b border-[#e8e9eb] bg-[#fbfbfc] min-[1120px]:block">
            <div className="mx-auto flex h-[30px] max-w-[1440px] items-center justify-between gap-5 px-10 xl:px-14">
              <nav className="flex min-w-0 items-center gap-4 overflow-hidden text-[10px] text-[#41474b] xl:gap-5 xl:text-[11px]">
                {vehicleCategories.map(([label, href], index) => (
                  <Link
                    key={`${label}-${index}`}
                    href={href}
                    className={`flex h-[30px] shrink-0 items-center border-b-2 transition hover:border-[#0866ff] hover:text-[#111] ${
                      index === 0
                        ? 'border-[#0866ff] font-semibold text-[#202124]'
                        : 'border-transparent'
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </nav>
              <div className="flex h-full shrink-0 items-center">
                <Link
                  href={content.links[5][0]}
                  className="flex h-full items-center gap-1.5 border-l border-[#e6e7e9] px-3 text-[10px] font-medium hover:bg-white"
                >
                  <Headphones className="h-3.5 w-3.5" />
                  {content.links[5][1]}
                </Link>
                <div ref={marketMenuRef} className="relative flex h-full">
                  <button
                    type="button"
                    onClick={() => setMarketOpen((current) => !current)}
                    aria-expanded={marketOpen}
                    aria-haspopup="menu"
                    className="flex h-full items-center gap-2 border-l border-[#e6e7e9] px-3 text-[10px] font-medium hover:bg-white"
                  >
                    <MarketFlag locale={localizedLanguage.locale} className="h-[14px] w-[21px]" />
                    <span>{localizedLanguage.label}</span>
                    <ChevronDown className={`h-3 w-3 transition ${marketOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <div
                    className={`absolute right-0 top-full z-30 w-[250px] pt-2 transition duration-150 ${
                      marketOpen
                        ? 'pointer-events-auto translate-y-0 opacity-100'
                        : 'pointer-events-none -translate-y-1 opacity-0'
                    }`}
                  >
                    <div role="menu" className="max-h-[calc(100dvh-90px)] overflow-y-auto rounded-[16px] border border-[#d9e1e5] bg-white p-2 shadow-[0_22px_60px_rgba(32,33,36,.18)]">
                      {localizedMarkets.map((market) => (
                        <a
                          key={market.locale}
                          href={market.href}
                          className={`flex items-center gap-3 rounded-[11px] px-3 py-2.5 text-sm transition hover:bg-[#f2f6f7] ${
                            market.locale === activeLocale ? 'bg-[#eef6fa]' : ''
                          }`}
                        >
                          <MarketFlag locale={market.locale} className="h-[20px] w-[30px] shrink-0" />
                          <span>
                            <strong className="block font-medium">{market.label}</strong>
                            <span className="text-[10px] text-[#7a878d]">{market.description}</span>
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative mx-auto flex h-[64px] max-w-[1440px] items-center px-5 sm:px-8 min-[1120px]:h-[50px] lg:px-10 xl:px-14">
            <a
              href={homeHref}
              aria-label={marketCopy.home}
              className="inline-flex shrink-0 items-center"
              onClick={() => setOpen(false)}
            >
              <span className="min-[1120px]:hidden">
                <BrandLogo iconOnly />
              </span>
              <span className="hidden min-[1120px]:inline-flex">
                <BrandLogo />
              </span>
            </a>

            <nav className="ml-7 hidden h-full items-center whitespace-nowrap min-[1120px]:flex xl:ml-9">
              <DesktopMenu
                label={content.links[0][1]}
                href={content.links[0][0]}
                menu={sellerMenu}
                onNavigate={handleSectionLink}
                align="start"
                icon={ScanSearch}
              />
              <DesktopMenu
                label={content.links[1][1]}
                href={content.links[1][0]}
                menu={processMenu}
                onNavigate={handleSectionLink}
                icon={activeLocale === 'sv' ? Building2 : Route}
              />

              <DesktopMenu
                label={content.links[2][1]}
                href={content.links[2][0]}
                menu={companyMenu}
                onNavigate={handleSectionLink}
                icon={activeLocale === 'sv' ? CarFront : Building2}
              />

              <DesktopMenu
                label={content.dealerLabel}
                href={activeLocale === 'sv' ? '/om-oss' : content.links[3][0]}
                menu={aboutMenu}
                onNavigate={handleSectionLink}
                icon={Building2}
              />

              <Link
                href={content.links[4][0]}
                className="flex h-full shrink-0 items-center border-b-2 border-transparent px-2.5 pt-0.5 text-[12px] font-semibold text-[#303640] transition hover:border-[#0866ff] hover:text-[#111111] xl:px-3.5 xl:text-[13px] 2xl:px-4"
              >
                {content.links[4][1]}
              </Link>
            </nav>

            <div className="ml-auto hidden h-full items-stretch min-[1120px]:flex">
              <Link
                href={marketRoutes.dealerAccess}
                className="flex items-center border-l border-[#ececea] px-3 text-[10px] font-medium text-[#202124] transition hover:bg-[#f7f8f8]"
              >
                <span className="hidden xl:inline">{content.partner}</span>
                <Store className="h-[18px] w-[18px] xl:hidden" strokeWidth={1.7} />
              </Link>
              <Link
                href={marketRoutes.dealerAccess}
                className="flex min-w-[66px] flex-col items-center justify-center border-l border-[#ececea] px-2 text-[#202124] transition hover:bg-[#f7f8f8] hover:text-[#0866ff]"
              >
                <Store className="h-[19px] w-[19px]" strokeWidth={1.7} />
                <span className="text-[10px] font-medium">
                  {desktopRegisterLabel}
                </span>
              </Link>
              <Link
                href="/login"
                className="flex min-w-[66px] flex-col items-center justify-center border-x border-[#ececea] px-2 text-[#202124] transition hover:bg-[#f7f8f8] hover:text-[#0866ff]"
              >
                <UserRound className="h-[20px] w-[20px]" strokeWidth={1.7} />
                <span className="text-[10px] font-medium">
                  {desktopLoginLabel}
                </span>
              </Link>
            </div>

            <div className="absolute right-5 flex items-center gap-2 sm:right-8 min-[1120px]:hidden">
              <Link
                href="/login"
                aria-label={content.login}
                title={content.login}
                className="grid h-10 w-10 place-items-center text-[#242424] transition hover:opacity-60"
              >
                <UserRound className="h-[23px] w-[23px]" strokeWidth={1.8} />
              </Link>
              <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-label={open ? marketCopy.closeMenu : marketCopy.openMenu}
                aria-expanded={open}
                className={`grid h-10 w-10 place-items-center transition ${
                  open
                    ? 'text-[#242424]'
                    : 'text-[#242424]'
                }`}
              >
                {open ? (
                  <X className="h-[23px] w-[23px]" strokeWidth={1.8} />
                ) : (
                  <Menu className="h-[24px] w-[24px]" strokeWidth={1.8} />
                )}
              </button>
            </div>
          </div>
        </header>

        <div
          className={`absolute inset-x-0 top-full h-[calc(100dvh-72px)] overflow-y-auto border-t border-[#deddd8] bg-[#f6f4ef] shadow-[0_24px_60px_rgba(32,33,36,.14)] transition duration-300 min-[1120px]:hidden ${
            open
              ? 'pointer-events-auto translate-y-0 opacity-100'
              : 'pointer-events-none -translate-y-3 opacity-0'
          }`}
        >
          <div className="mx-auto flex min-h-full max-w-2xl flex-col px-5 py-7 sm:px-8">
            <nav>
              {content.links.slice(0, 5).map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={(event) => {
                    setOpen(false)
                    handleSectionLink(event, href)
                  }}
                  className="group flex items-center justify-between border-b border-[#dcdad3] py-4 text-[22px] font-medium tracking-[-0.025em] text-[#202124]"
                >
                  <span>{label}</span>
                  <ArrowRight className="h-5 w-5 text-[#71818b] transition group-hover:translate-x-1" />
                </Link>
              ))}
            </nav>

            <Link
              href={content.ctaHref}
              onClick={() => setOpen(false)}
              className="mt-6 flex min-h-14 items-center justify-between rounded-[14px] bg-[#0866ff] px-5 text-base font-medium text-white"
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
                  href={marketRoutes.dealerAccess}
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
              <details className="group/markets">
                <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 rounded-[14px] border border-[#8ebdd8] bg-[#eaf5fb] px-4 text-sm text-[#202124] [&::-webkit-details-marker]:hidden">
                  <MarketFlag
                    locale={localizedLanguage.locale}
                    className="h-[20px] w-[30px]"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#66808e]">
                      {marketCopy.selector}
                    </span>
                    <strong className="mt-0.5 block font-medium">
                      {localizedLanguage.label}
                    </strong>
                  </span>
                  <ChevronDown className="h-4 w-4 transition group-open/markets:rotate-180" />
                </summary>
                <div className="mt-2 max-h-[310px] overflow-y-auto rounded-[14px] border border-[#dcdad3] bg-white p-2">
                  {localizedMarkets.map((market) => (
                    <a
                      key={market.locale}
                      href={market.href}
                      className={`flex min-h-12 items-center gap-3 rounded-[11px] px-3 text-sm transition hover:bg-[#f1f6f7] ${
                        market.locale === activeLocale ? 'bg-[#eef6fa]' : ''
                      }`}
                    >
                      <MarketFlag
                        locale={market.locale}
                        className="h-[18px] w-[27px]"
                      />
                      <span className="min-w-0 flex-1 truncate">
                        {market.label}
                      </span>
                    </a>
                  ))}
                  {activeLocale === 'en' && (
                    <>
                      <div className="mx-3 my-2 border-t border-[#e3e8e9]" />
                      {euBuyerMarkets.map((market) => (
                        <a
                          key={market.code}
                          href={`https://www.autorell.com/${market.code}?market=${market.code}`}
                          className="flex min-h-12 items-center gap-3 rounded-[11px] px-3 text-sm transition hover:bg-[#f1f6f7]"
                        >
                          <CountryFlag
                            code={market.code}
                            className="h-[18px] w-[27px] shrink-0"
                          />
                          <span className="min-w-0 flex-1 truncate">
                            {market.countryLocal}
                          </span>
                        </a>
                      ))}
                    </>
                  )}
                </div>
              </details>

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
  label,
  href,
  menu,
  onNavigate,
  align = 'center',
  icon: MenuIcon,
}: {
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
        className="flex h-[50px] shrink-0 items-center border-b-2 border-transparent px-2.5 text-[11px] font-semibold text-[#303640] transition hover:border-[#0866ff] hover:text-[#111111] group-focus-within:border-[#0866ff] xl:px-3 xl:text-[12px]"
      >
        {label}
      </a>

      <div
        className={`pointer-events-none absolute top-full w-[720px] translate-y-2 pt-[18px] opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100 2xl:w-[780px] ${
          align === 'start' ? 'left-0' : 'left-1/2 -translate-x-1/2'
        }`}
      >
        <div className="grid grid-cols-[1.08fr_.92fr] overflow-hidden rounded-[22px] border border-[#dfe5e8] bg-white shadow-[0_30px_80px_rgba(32,33,36,.16)]">
          <div className="min-w-0 bg-[#eef6fa] p-7">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#0866ff] text-white">
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
