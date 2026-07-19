'use client'

import { useState, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Check,
  ChevronDown,
  Globe2,
  X,
} from 'lucide-react'
import {
  localizePublicHref,
  translatePublicObject,
  type PublicLocale,
} from '@/lib/public-i18n'
import { activeMarketCountryCodes } from '@/lib/eu-countries'
import { euBuyerMarkets } from '@/lib/eu-buyer-markets'
import { marketForPathCode } from '@/lib/market-locale'
import BrandLogo from './BrandLogo'

const appStoreHref =
  process.env.NEXT_PUBLIC_APP_STORE_URL || 'https://apps.apple.com/search?term=autorell'
const playStoreHref =
  process.env.NEXT_PUBLIC_PLAY_STORE_URL ||
  'https://play.google.com/store/search?q=autorell&c=apps'

const footerCopy = {
  sv: {
    description:
      'Autorell är en europeisk marknadsplats för fordonsannonser. Köpare kan hitta annonser och säljare kan nå rätt kunder på ett tryggt och tydligt sätt.',
    columns: [
      {
        title: 'Marketplace',
        links: [
          ['Alla fordon', '/marketplace'],
          ['Bilar', '/marketplace/cars'],
          ['Transportbilar', '/marketplace/vans'],
          ['Lastbilar', '/marketplace/trucks'],
          ['Motorcyklar', '/marketplace/motorcycles'],
          ['Husbilar', '/marketplace/motorhomes'],
          ['Husvagnar', '/marketplace/caravans'],
        ],
      },
      {
        title: 'Sälj',
        links: [
          ['Sälj ditt fordon', '/sell-vehicle'],
          ['Så fungerar det', '/how-selling-works'],
          ['Priser', '/pricing'],
          ['För företag', '/business'],
          ['Dealer solutions', '/dealer-solutions'],
        ],
      },
      {
        title: 'Köp',
        links: [
          ['Sök fordon', '/marketplace'],
          ['Sparade sökningar', '/saved-searches'],
          ['Jämför fordon', '/compare-vehicles'],
          ['Fordonshistorik', '/vehicle-history'],
          ['Köpguide', '/buying-guide'],
        ],
      },
      {
        title: 'Företag',
        links: [
          ['Om Autorell', '/about'],
          ['Karriär', '/careers'],
          ['Press', '/press'],
          ['Partners', '/partners'],
          ['Kontakta oss', '/contact'],
        ],
      },
      {
        title: 'Support',
        links: [
          ['Hjälpcenter', '/help-center'],
          ['Säkerhetstips', '/safety-tips'],
          ['Betalningar', '/payments'],
          ['Frakt & leverans', '/shipping-delivery'],
          ['Rapportera problem', '/report'],
        ],
      },
    ],
    newsletterTitle: 'Håll dig uppdaterad',
    newsletterText:
      'Få de senaste fordonen, marknadstrenderna och tipsen direkt till din inkorg.',
    appDownloadTitle: 'Ladda ner Autorell',
    appDownloadText: 'Ha sökningar, sparade fordon och nya annonser nära till hands.',
    appStore: 'App Store',
    playStore: 'Google Play',
    downloadOn: 'Ladda ner i',
    getItOn: 'Hämta på',
    emailPlaceholder: 'Ange din e-post',
    subscribe: 'Prenumerera',
    trust: [
      ['Verifierade annonser', 'Alla annonser kontrolleras för kvalitet och äkthet.'],
      ['Säkra betalningar', 'Dina betalningar skyddas i varje steg.'],
      ['Europeiska marknader', 'Köp och sälj på utvalda marknader i Europa.'],
      ['Expertsupport', 'Vårt team hjälper dig hela vägen.'],
    ],
    country: 'Sverige',
    language: 'Svenska',
    marketCta: 'Välj språk och marknad',
    marketEyebrow: 'Välj språk och marknad',
    marketTitle: 'Välj ditt språk och marknad',
    marketText:
      'Välj din plats så visar vi relevanta fordon, priser och information för din marknad.',
    popularMarkets: 'Populära marknader',
    allMarkets: 'Alla marknader',
    missingMarketTitle: 'Hittar du inte din marknad?',
    missingMarketText:
      'Vi expanderar ständigt. Kontakta oss om du vill att vi ska lägga till din marknad.',
    close: 'Stäng',
    terms: 'Användarvillkor',
    purchaseTerms: 'Köpvillkor',
    refundPolicy: 'Återbetalningspolicy',
    privacy: 'Integritetspolicy',
    cookies: 'Cookiepolicy',
    legalNotice:
      'Autorell \u00e4r en europeisk marknadsplats f\u00f6r fordonsannonser. Inneh\u00e5ll, fordonsdata, bilder och annonsinformation f\u00e5r inte kopieras, skrapas eller \u00e5teranv\u00e4ndas utan tillst\u00e5nd fr\u00e5n Autorell.',
  },
  de: {
    description:
      'Autorell ist ein europäischer Marktplatz für Fahrzeuganzeigen. Käufer finden Anzeigen und Verkäufer erreichen die richtigen Kunden auf sichere und klare Weise.',
    columns: [
      {
        title: 'Marketplace',
        links: [
          ['Alle Fahrzeuge', '/marketplace'],
          ['Autos', '/marketplace/cars'],
          ['Transporter', '/marketplace/vans'],
          ['Lkw', '/marketplace/trucks'],
          ['Motorräder', '/marketplace/motorcycles'],
          ['Wohnmobile', '/marketplace/motorhomes'],
          ['Wohnwagen', '/marketplace/caravans'],
        ],
      },
      {
        title: 'Verkaufen',
        links: [
          ['Fahrzeug verkaufen', '/sell-vehicle'],
          ['So funktioniert es', '/how-selling-works'],
          ['Preise', '/pricing'],
          ['Für Unternehmen', '/business'],
          ['Dealer solutions', '/dealer-solutions'],
        ],
      },
      {
        title: 'Kaufen',
        links: [
          ['Fahrzeuge suchen', '/marketplace'],
          ['Gespeicherte Suchen', '/saved-searches'],
          ['Fahrzeuge vergleichen', '/compare-vehicles'],
          ['Fahrzeughistorie', '/vehicle-history'],
          ['Kaufberatung', '/buying-guide'],
        ],
      },
      {
        title: 'Unternehmen',
        links: [
          ['Über Autorell', '/about'],
          ['Karriere', '/careers'],
          ['Presse', '/press'],
          ['Partner', '/partners'],
          ['Kontakt', '/contact'],
        ],
      },
      {
        title: 'Support',
        links: [
          ['Hilfe', '/help-center'],
          ['Sicherheitstipps', '/safety-tips'],
          ['Zahlungen', '/payments'],
          ['Versand & Lieferung', '/shipping-delivery'],
          ['Problem melden', '/report'],
        ],
      },
    ],
    newsletterTitle: 'Auf dem Laufenden bleiben',
    newsletterText:
      'Erhalten Sie neue Fahrzeuge, Markttrends und Tipps direkt in Ihr Postfach.',
    appDownloadTitle: 'Autorell herunterladen',
    appDownloadText: 'Suchen, gespeicherte Fahrzeuge und neue Anzeigen immer griffbereit.',
    appStore: 'App Store',
    playStore: 'Google Play',
    downloadOn: 'Laden im',
    getItOn: 'Jetzt bei',
    emailPlaceholder: 'E-Mail-Adresse eingeben',
    subscribe: 'Abonnieren',
    trust: [
      ['Verifizierte Anzeigen', 'Alle Anzeigen werden auf Qualität und Echtheit geprüft.'],
      ['Sichere Zahlungen', 'Ihre Zahlungen sind in jedem Schritt geschützt.'],
      ['Europäische Märkte', 'Kaufen und verkaufen in ausgewählten Märkten Europas.'],
      ['Experten-Support', 'Unser Team hilft Ihnen jederzeit weiter.'],
    ],
    country: 'Deutschland',
    language: 'Deutsch',
    marketCta: 'Sprache und Markt wählen',
    marketEyebrow: 'Sprache und Markt wählen',
    marketTitle: 'Wählen Sie Sprache und Markt',
    marketText:
      'Wählen Sie Ihren Standort, damit wir passende Fahrzeuge, Preise und Informationen anzeigen.',
    popularMarkets: 'Beliebte Märkte',
    allMarkets: 'Alle Märkte',
    missingMarketTitle: 'Finden Sie Ihren Markt nicht?',
    missingMarketText:
      'Wir expandieren laufend. Kontaktieren Sie uns, wenn wir Ihren Markt hinzufügen sollen.',
    close: 'Schließen',
    terms: 'Nutzungsbedingungen',
    purchaseTerms: 'Kaufbedingungen',
    refundPolicy: 'Erstattungsrichtlinie',
    privacy: 'Datenschutz',
    cookies: 'Cookie-Richtlinie',
    legalNotice:
      'Autorell ist ein europ\u00e4ischer Marktplatz f\u00fcr Fahrzeuganzeigen. Inhalte, Fahrzeugdaten, Bilder und Anzeigeninformationen d\u00fcrfen ohne Genehmigung von Autorell nicht kopiert, ausgelesen oder wiederverwendet werden.',
  },
  en: {
    description:
      'Autorell is a European marketplace for vehicle listings. Buyers can find listings and sellers can reach the right customers in a safe and clear way.',
    columns: [
      {
        title: 'Marketplace',
        links: [
          ['All vehicles', '/marketplace'],
          ['Cars', '/marketplace/cars'],
          ['Vans', '/marketplace/vans'],
          ['Trucks', '/marketplace/trucks'],
          ['Motorcycles', '/marketplace/motorcycles'],
          ['Motorhomes', '/marketplace/motorhomes'],
          ['Caravans', '/marketplace/caravans'],
        ],
      },
      {
        title: 'Sell',
        links: [
          ['Sell your vehicle', '/sell-vehicle'],
          ['How it works', '/how-selling-works'],
          ['Pricing', '/pricing'],
          ['For businesses', '/business'],
          ['Dealer solutions', '/dealer-solutions'],
        ],
      },
      {
        title: 'Buy',
        links: [
          ['Search vehicles', '/marketplace'],
          ['Saved searches', '/saved-searches'],
          ['Compare vehicles', '/compare-vehicles'],
          ['Vehicle history', '/vehicle-history'],
          ['Buying guide', '/buying-guide'],
        ],
      },
      {
        title: 'Company',
        links: [
          ['About Autorell', '/about'],
          ['Careers', '/careers'],
          ['Press', '/press'],
          ['Partners', '/partners'],
          ['Contact us', '/contact'],
        ],
      },
      {
        title: 'Support',
        links: [
          ['Help center', '/help-center'],
          ['Safety tips', '/safety-tips'],
          ['Payments', '/payments'],
          ['Shipping & delivery', '/shipping-delivery'],
          ['Report a problem', '/report'],
        ],
      },
    ],
    newsletterTitle: 'Stay up to date',
    newsletterText:
      'Get the latest vehicles, market trends and tips straight to your inbox.',
    appDownloadTitle: 'Download Autorell',
    appDownloadText: 'Keep searches, saved vehicles and new listings close at hand.',
    appStore: 'App Store',
    playStore: 'Google Play',
    downloadOn: 'Download on the',
    getItOn: 'Get it on',
    emailPlaceholder: 'Enter your email',
    subscribe: 'Subscribe',
    trust: [
      ['Verified listings', 'All listings are checked for quality and authenticity.'],
      ['Secure payments', 'Your payments are protected every step of the way.'],
      ['European markets', 'Buy and sell across selected markets in Europe.'],
      ['Expert support', 'Our team is here to help you at every step.'],
    ],
    country: 'Sweden',
    language: 'English',
    marketCta: 'Choose language and market',
    marketEyebrow: 'Choose language and market',
    marketTitle: 'Choose your language and market',
    marketText:
      'Choose your location so we can show relevant vehicles, prices and information for your market.',
    popularMarkets: 'Popular markets',
    allMarkets: 'All markets',
    missingMarketTitle: 'Can’t find your market?',
    missingMarketText:
      'We are expanding constantly. Contact us if you want us to add your market.',
    close: 'Close',
    terms: 'Terms of Service',
    purchaseTerms: 'Purchase terms',
    refundPolicy: 'Refund policy',
    privacy: 'Privacy Policy',
    cookies: 'Cookie Policy',
    legalNotice:
      'Autorell is a European marketplace for vehicle listings. Content, vehicle data, images and listing information may not be copied, scraped or reused without permission from Autorell.',
  },
} as const

const footerDescriptions: Record<PublicLocale, string> = {
  sv: 'Autorell är en europeisk marknadsplats för fordonsannonser. Köpare kan hitta annonser och säljare kan nå rätt kunder på ett tryggt och tydligt sätt.',
  de: 'Autorell ist ein europäischer Marktplatz für Fahrzeuganzeigen. Käufer finden Anzeigen und Verkäufer erreichen die richtigen Kunden auf sichere und klare Weise.',
  en: 'Autorell is a European marketplace for vehicle listings. Buyers can find listings and sellers can reach the right customers in a safe and clear way.',
  at: 'Autorell ist ein europäischer Marktplatz für Fahrzeuganzeigen. Käufer finden Anzeigen und Verkäufer erreichen die richtigen Kunden auf sichere und klare Weise.',
  be: 'Autorell is een Europese marktplaats voor voertuigadvertenties. Kopers kunnen advertenties vinden en verkopers kunnen de juiste klanten op een veilige en duidelijke manier bereiken.',
  fr: 'Autorell est une place de marché européenne pour les annonces de véhicules. Les acheteurs peuvent trouver des annonces et les vendeurs peuvent atteindre les bons clients de manière sûre et claire.',
  es: 'Autorell es un mercado europeo de anuncios de vehículos. Los compradores pueden encontrar anuncios y los vendedores pueden llegar a los clientes adecuados de forma segura y clara.',
  it: 'Autorell è un marketplace europeo per annunci di veicoli. Gli acquirenti possono trovare annunci e i venditori possono raggiungere i clienti giusti in modo sicuro e chiaro.',
  pl: 'Autorell to europejska platforma ogłoszeń pojazdów. Kupujący mogą znaleźć ogłoszenia, a sprzedający mogą dotrzeć do właściwych klientów w bezpieczny i przejrzysty sposób.',
  nl: 'Autorell is een Europese marktplaats voor voertuigadvertenties. Kopers kunnen advertenties vinden en verkopers kunnen de juiste klanten op een veilige en duidelijke manier bereiken.',
  fi: 'Autorell on eurooppalainen ajoneuvoilmoitusten markkinapaikka. Ostajat voivat löytää ilmoituksia ja myyjät tavoittaa oikeat asiakkaat turvallisella ja selkeällä tavalla.',
  da: 'Autorell er en europæisk markedsplads for køretøjsannoncer. Købere kan finde annoncer, og sælgere kan nå de rette kunder på en sikker og tydelig måde.',
}

const allMarkets = [
  ['EU', 'Europe', 'English'],
  ['AT', 'Austria', 'Deutsch'],
  ['BE', 'Belgique', 'Français'],
  ['BE', 'Belgie', 'Nederlands'],
  ['DK', 'Danmark', 'Dansk'],
  ['FI', 'Suomi', 'Suomi'],
  ['FR', 'France', 'Français'],
  ['DE', 'Deutschland', 'Deutsch'],
  ['IT', 'Italia', 'Italiano'],
  ['NL', 'Nederland', 'Nederlands'],
  ['PL', 'Polska', 'Polski'],
  ['ES', 'España', 'Español'],
  ['SE', 'Sverige', 'Svenska'],
] as const

export default function PublicFooter({
  locale: providedLocale,
}: {
  locale?: PublicLocale
}) {
  const pathname = usePathname()
  const locale = providedLocale || localeFromPathname(pathname)
  const activePathMarket = pathname.split('/').filter(Boolean)[0]
  const footerMarket = getFooterMarket(activePathMarket, locale)
  const [isMarketOpen, setIsMarketOpen] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.location.hash === '#market-selector',
  )
  const t =
    locale === 'sv'
      ? footerCopy.sv
      : locale === 'de'
        ? footerCopy.de
        : translatePublicObject(locale, footerCopy.en)

  const privacyHref = localizePublicHref(locale, '/privacy')
  const termsHref = localizePublicHref(locale, '/terms')
  const purchaseTermsHref = `${termsHref}#purchase-terms`
  const refundPolicyHref = localizePublicHref(locale, '/refund-policy')
  const homeHref = localizePublicHref(locale, '/')

  function handleHomeLogoClick(event: ReactMouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    window.location.assign(homeHref)
  }

  return (
    <footer className="border-t border-[#dfe5ee] bg-white px-0 pb-0 pt-10 text-[#101828] lg:pt-16">
      <div className="mx-auto max-w-[390px] bg-white px-5 min-[430px]:max-w-[430px] sm:max-w-[var(--autorell-page-max)] sm:px-8">
        <div className="grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-12">
          {t.columns.map((column) => (
            <FooterColumn
              key={column.title}
              title={column.title}
              links={column.links.map(([label, href]) => [
                label,
                localizePublicHref(locale, href),
              ])}
            />
          ))}
        </div>

        <div className="my-9 h-px bg-[#dfe5ee]" />

        <div className="flex flex-col gap-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex max-w-[430px] flex-col gap-5">
              <div className="inline-flex w-[108px] flex-col items-start sm:w-[112px] lg:w-[122px]">
                <Link href={homeHref} aria-label="Autorell" onClick={handleHomeLogoClick}>
                  <BrandLogo underline={false} />
                </Link>
              </div>
              <AppDownloadBadges
                title={t.appDownloadTitle}
                downloadOn={t.downloadOn}
                getItOn={t.getItOn}
                appStore={t.appStore}
                playStore={t.playStore}
              />
            </div>
            <SocialLinks />
          </div>
          <div className="max-w-[820px] text-[14px] leading-7 text-[#101828]">
            <p>{footerDescriptions[locale]}</p>
            <p className="mt-5 text-[13px] text-[#344054]">{t.legalNotice}</p>
          </div>
        </div>

        <div className="my-7 h-px bg-[#dfe5ee]" />

        <div className="flex flex-col gap-4 bg-white pb-7 text-[13px] text-[#475467]">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-medium lg:justify-end">
            <button
              type="button"
              onClick={() => setIsMarketOpen(true)}
              className="inline-flex min-h-8 items-center justify-between gap-2 rounded-[12px] px-0 py-1 text-left font-medium text-[#344054] transition hover:text-[#075fff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075fff] sm:px-2"
            >
              <span className="inline-flex items-center gap-2">
                <FlagIcon code={footerMarket.flagCode} size="sm" />
                {footerMarket.label}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>
            <FooterSelect
              ariaLabel="Currency"
              defaultValue={footerMarket.currency}
              options={[
                ['eur', 'EUR'],
                ['sek', 'SEK'],
                ['dkk', 'DKK'],
                ['pln', 'PLN'],
                ['czk', 'CZK'],
                ['huf', 'HUF'],
                ['ron', 'RON'],
                ['bgn', 'BGN'],
                ['nok', 'NOK'],
                ['chf', 'CHF'],
                ['gbp', 'GBP'],
                ['usd', 'USD'],
              ]}
            />
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <p className="order-2 shrink-0 lg:order-1">© 2026 Autorell. All rights reserved.</p>

            <nav className="order-1 flex flex-wrap gap-x-5 gap-y-2 font-medium lg:order-2 lg:justify-end">
              <Link href={termsHref} className="transition hover:text-[#075fff]">
                {t.terms}
              </Link>
              <Link href={purchaseTermsHref} className="transition hover:text-[#075fff]">
                {t.purchaseTerms}
              </Link>
              <Link href={refundPolicyHref} className="transition hover:text-[#075fff]">
                {t.refundPolicy}
              </Link>
              <Link href={privacyHref} className="transition hover:text-[#075fff]">
                {t.privacy}
              </Link>
              <Link
                href={localizePublicHref(locale, '/cookies')}
                className="transition hover:text-[#075fff]"
              >
                {t.cookies}
              </Link>
            </nav>
          </div>
        </div>
      </div>
      <MarketSelectorModal
        isOpen={isMarketOpen}
        onClose={() => setIsMarketOpen(false)}
        locale={locale}
      />
    </footer>
  )
}

function AppDownloadBadges({
  title,
  downloadOn,
  getItOn,
  appStore,
  playStore,
}: {
  title: string
  downloadOn: string
  getItOn: string
  appStore: string
  playStore: string
}) {
  return (
    <div className="flex flex-col items-start gap-2.5">
      <p className="text-[13px] font-semibold text-[#344054]">{title}</p>
      <div className="flex flex-wrap items-center gap-2.5">
        <StoreBadge
          href={appStoreHref}
          imageSrc="/app-store-badge.svg"
          alt={`${downloadOn} ${appStore}`}
          width={96}
        />
        <StoreBadge
          href={playStoreHref}
          imageSrc="/google-play-badge.svg"
          alt={`${getItOn} ${playStore}`}
          width={108}
        />
      </div>
    </div>
  )
}

function StoreBadge({
  href,
  imageSrc,
  alt,
  width,
}: {
  href: string
  imageSrc: string
  alt: string
  width: number
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-8 shrink-0 rounded-[5px] transition hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075fff] sm:h-9"
    >
      <Image src={imageSrc} alt={alt} width={width} height={32} className="h-full w-auto" />
    </a>
  )
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

function getFooterMarket(pathMarket: string, locale: PublicLocale) {
  const mappedMarket = marketForPathCode(pathMarket)
  if (mappedMarket && mappedMarket.countryCode !== 'EU') {
    return {
      flagCode: mappedMarket.countryCode,
      label: mappedMarket.countryName,
      currency: mappedMarket.currency.toLowerCase(),
    }
  }

  if (pathMarket === 'se' || (!pathMarket && locale === 'sv')) {
    return { flagCode: 'SE', label: 'Sverige', currency: 'sek' }
  }
  if (pathMarket === 'de' || (!pathMarket && locale === 'de')) {
    return { flagCode: 'DE', label: 'Deutschland', currency: 'eur' }
  }

  const market = euBuyerMarkets.find((item) => item.code === pathMarket)
  if (market) {
    return {
      flagCode: market.code.toUpperCase(),
      label: market.countryLocal,
      currency: currencyByMarketCode(market.code),
    }
  }

  return { flagCode: 'EU', label: 'Europe', currency: 'eur' }
}

function currencyByMarketCode(code: string) {
  switch (code) {
    case 'se':
      return 'sek'
    case 'dk':
      return 'dkk'
    case 'pl':
      return 'pln'
    case 'cz':
      return 'czk'
    case 'hu':
      return 'huf'
    case 'ro':
      return 'ron'
    case 'bg':
      return 'bgn'
    case 'no':
      return 'nok'
    case 'ch':
      return 'chf'
    case 'gb':
    case 'uk':
      return 'gbp'
    case 'us':
      return 'usd'
    default:
      return 'eur'
  }
}

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: readonly (readonly [string, string])[]
}) {
  return (
    <div>
      <h3 className="text-[15px] font-semibold text-[#101828]">{title}</h3>
      <nav className="mt-4 flex flex-col items-start gap-3 text-[14px] leading-5 text-[#101828]">
        {links.map(([label, href]) => (
          <Link key={`${label}-${href}`} href={href} className="transition hover:text-[#075fff]">
            {label}
          </Link>
        ))}
      </nav>
    </div>
  )
}

function FooterSelect({
  ariaLabel,
  defaultValue,
  icon,
  options,
}: {
  ariaLabel: string
  defaultValue: string
  icon?: ReactNode
  options: readonly (readonly [string, string])[]
}) {
  const [selected, setSelected] = useState(defaultValue)
  const [open, setOpen] = useState(false)
  const selectedLabel =
    options.find(([value]) => value === selected)?.[1] ||
    options.find(([value]) => value === defaultValue)?.[1] ||
    defaultValue.toUpperCase()

  return (
    <div className="relative inline-flex items-center gap-2 text-[13px] text-[#344054]">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex min-h-8 items-center gap-2 rounded-[12px] bg-white py-1 pl-2 pr-8 text-[13px] font-medium text-[#344054] transition hover:text-[#075fff] focus:outline-none focus:ring-4 focus:ring-[#075fff]/10"
      >
        {icon}
        <span>{selectedLabel}</span>
      </button>
      <ChevronDown className="pointer-events-none absolute right-1 h-3.5 w-3.5 text-[#344054]" />
      {open ? (
        <div
          role="listbox"
          aria-label={ariaLabel}
          className="absolute bottom-full left-0 z-20 mb-2 min-w-[104px] overflow-hidden rounded-[12px] border border-[#dfe5ee] bg-white py-1 text-[13px] text-[#344054] shadow-[0_16px_40px_rgba(16,24,40,0.14)]"
        >
          {options.map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="option"
              aria-selected={value === selected}
              onClick={() => {
                setSelected(value)
                setOpen(false)
              }}
              className={`block w-full px-3 py-2 text-left transition hover:bg-[#f4f7fb] hover:text-[#075fff] ${
                value === selected ? 'font-semibold text-[#075fff]' : 'font-medium'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function SocialLinks() {
  const links = [
    [
      'Facebook',
      'https://www.facebook.com/autorell',
      'M14 8.5h3V5h-3c-3.4 0-5.5 2.1-5.5 5.7V13H6v3.5h2.5V23h4v-6.5h3.2l.6-3.5h-3.8v-2c0-1.7.5-2.5 1.5-2.5Z',
    ],
    [
      'Instagram',
      'https://www.instagram.com/autorellgroup/',
      'M12 7.8A4.2 4.2 0 1 0 12 16.2 4.2 4.2 0 0 0 12 7.8Zm0 6.9a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4Zm5.4-7.1a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM20.2 8c-.1-1.5-.4-2.7-1.5-3.7S16.5 2.9 15 2.8c-1.5-.1-6.5-.1-8 0-1.5.1-2.7.4-3.7 1.5S1.9 6.5 1.8 8c-.1 1.5-.1 6.5 0 8 .1 1.5.4 2.7 1.5 3.7s2.2 1.4 3.7 1.5c1.5.1 6.5.1 8 0 1.5-.1 2.7-.4 3.7-1.5s1.4-2.2 1.5-3.7c.1-1.5.1-6.5 0-8Zm-1.9 9.6c-.3.8-.9 1.4-1.7 1.7-1.2.5-4 .4-4.6.4s-3.4.1-4.6-.4a3 3 0 0 1-1.7-1.7c-.5-1.2-.4-4-.4-4.6s-.1-3.4.4-4.6A3 3 0 0 1 7.4 6.7c1.2-.5 4-.4 4.6-.4s3.4-.1 4.6.4a3 3 0 0 1 1.7 1.7c.5 1.2.4 4 .4 4.6s.1 3.4-.4 4.6Z',
    ],
    [
      'LinkedIn',
      'https://www.linkedin.com/company/autorell',
      'M5.3 7.6A2.3 2.3 0 1 0 5.3 3a2.3 2.3 0 0 0 0 4.6ZM3.4 9.3h3.8V21H3.4V9.3Zm6.1 0h3.6v1.6h.1c.5-1 1.8-2 3.6-2 3.9 0 4.6 2.5 4.6 5.9V21h-3.8v-5.5c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9V21H9.5V9.3Z',
    ],
  ] as const

  return (
    <div className="flex items-center gap-5">
      {links.map(([label, href, path]) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="grid h-8 w-8 place-items-center text-[#101828] transition hover:-translate-y-0.5 hover:text-[#075fff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075fff]"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-[22px] w-[22px] fill-current"
          >
            <path d={path} />
          </svg>
        </a>
      ))}
    </div>
  )
}

export function MarketSelectorModal({
  isOpen,
  onClose,
  locale = 'sv',
}: {
  isOpen: boolean
  onClose: () => void
  locale?: PublicLocale
}) {
  const pathname = usePathname()
  if (!isOpen) return null
  const copy =
    locale === 'sv'
      ? footerCopy.sv
      : locale === 'de'
        ? footerCopy.de
        : translatePublicObject(locale, footerCopy.en)

  function handleMarketNavigate(href: string) {
    onClose()
    window.location.assign(href)
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#f8fbff] text-[#101828]">
      <button
        type="button"
        onClick={onClose}
        aria-label={copy.close}
        className="fixed right-4 top-[calc(env(safe-area-inset-top)+4.75rem)] z-[250] inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#d9e1ec] bg-white text-[#101828] shadow-[0_14px_34px_rgba(16,24,40,0.14)] transition hover:border-[#b7cdfb] hover:bg-[#f5f9ff] hover:text-[#075fff] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#075fff] focus-visible:ring-offset-2 sm:right-6 md:top-6"
      >
        <X className="h-5 w-5" strokeWidth={2.4} aria-hidden="true" />
      </button>

      <div className="mx-auto max-w-[var(--autorell-page-max)] px-5 pb-16 pt-20 sm:px-8 sm:py-16 lg:py-[72px]">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.25fr] lg:items-start">
          <div>
            <h2 className="max-w-[560px] text-[34px] font-semibold leading-[1.05] tracking-[-0.04em] text-[#101828] sm:text-[56px]">
              {copy.marketTitle}
            </h2>
            <p className="mt-6 max-w-[430px] text-[16px] leading-8 text-[#344054]">
              {copy.marketText}
            </p>
          </div>

          <WorldMapGraphic />
        </div>

        <section className="mt-10">
          <h3 className="text-base font-semibold">{copy.allMarkets}</h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {allMarkets
              .filter(([code]) => code === 'EU' || activeMarketCountryCodes.has(code))
              .map(([code, market, language], index) => (
                <MarketCard
                  key={`${code}-${market}-${index}`}
                  countryCode={code}
                  market={market}
                  language={language}
                  href={marketHref(code)}
                  selected={isActiveMarket(code, pathname, locale)}
                  onNavigate={handleMarketNavigate}
                />
              ))}
          </div>
        </section>

        <div className="mx-auto mt-10 flex max-w-[560px] items-center gap-4 rounded-[18px] border border-[#d9e7ff] bg-[#edf5ff] p-5 text-[#18315f]">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-[#075fff]">
            <Globe2 className="h-5 w-5" />
          </span>
          <span>
            <strong className="block text-sm font-semibold">
              {copy.missingMarketTitle}
            </strong>
            <span className="mt-1 block text-sm leading-6">
              {copy.missingMarketText}
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}

function MarketCard({
  countryCode,
  market,
  language,
  href,
  onNavigate,
  selected = false,
}: {
  countryCode: string
  market: string
  language: string
  href: string
  onNavigate?: (href: string) => void
  selected?: boolean
}) {
  function handleClick(event: ReactMouseEvent<HTMLAnchorElement>) {
    if (!onNavigate) return
    event.preventDefault()
    onNavigate(href)
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`flex min-h-[78px] items-center gap-4 rounded-[14px] border bg-white px-5 text-left shadow-[0_12px_34px_rgba(16,24,40,0.045)] transition hover:-translate-y-0.5 hover:border-[#075fff] ${
        selected ? 'border-[#075fff] ring-2 ring-[#075fff]/10' : 'border-[#dfe5ee]'
      }`}
    >
      <FlagIcon code={countryCode} />
      <span className="min-w-0 flex-1">
        <strong className="block truncate text-[15px] font-semibold text-[#101828]">
          {market}
        </strong>
        <span className="mt-0.5 block truncate text-[13px] text-[#667085]">
          {language}
        </span>
      </span>
      {selected ? (
        <span className="grid h-6 w-6 place-items-center rounded-full bg-[#075fff] text-white">
          <Check className="h-4 w-4" />
        </span>
      ) : (
        <ChevronDown className="-rotate-90 h-4 w-4 text-[#344054]" />
      )}
    </Link>
  )
}

function marketHref(countryCode: string) {
  const normalizedCode = countryCode.toUpperCase()
  if (normalizedCode === 'EU') return '/?market=en'
  return `/${normalizedCode.toLowerCase()}`
}

function isActiveMarket(
  countryCode: string,
  pathname: string,
  locale: PublicLocale,
) {
  const current = pathname.split('/').filter(Boolean)[0]
  if (countryCode === 'EU') return current === '' || current === 'eu' || locale === 'en'
  if (countryCode === 'SE') return current === 'se' || (!current && locale === 'sv')
  if (countryCode === 'DE') return current === 'de' || (!current && locale === 'de')
  return current === countryCode.toLowerCase()
}

export function FlagIcon({
  code,
  size = 'md',
}: {
  code: string
  size?: 'xs' | 'sm' | 'md'
}) {
  return (
    <span
      className={`grid shrink-0 place-items-center overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-[#d7e2f2] ${
        size === 'xs' ? 'h-4 w-4' : size === 'sm' ? 'h-5 w-5' : 'h-10 w-10'
      }`}
      aria-label={`${code} flagga`}
      title={code}
    >
      <svg viewBox="0 0 36 36" aria-hidden="true" className="h-full w-full">
        <circle cx="18" cy="18" r="18" fill="#fff" />
        <g clipPath="url(#flag-circle)">
          <FlagArtwork code={code} />
        </g>
        <defs>
          <clipPath id="flag-circle">
            <circle cx="18" cy="18" r="18" />
          </clipPath>
        </defs>
      </svg>
    </span>
  )
}

function FlagArtwork({ code }: { code: string }) {
  switch (code) {
    case 'AT':
      return <HorizontalFlag colors={['#ed2939', '#ffffff', '#ed2939']} />
    case 'BE':
      return <VerticalFlag colors={['#111111', '#ffd90c', '#ef3340']} />
    case 'BG':
      return <HorizontalFlag colors={['#ffffff', '#00966e', '#d62612']} />
    case 'HR':
      return (
        <>
          <HorizontalFlag colors={['#ff0000', '#ffffff', '#171796']} />
          <rect x="15" y="13" width="6" height="8" rx="1" fill="#d00000" />
        </>
      )
    case 'CY':
      return (
        <>
          <rect width="36" height="36" fill="#ffffff" />
          <ellipse cx="19" cy="17" rx="7" ry="4" fill="#d57800" />
          <path d="M13 24c4 2 7 2 11 0" stroke="#4e8f45" strokeWidth="2" fill="none" />
        </>
      )
    case 'CZ':
      return (
        <>
          <rect width="36" height="18" fill="#ffffff" />
          <rect y="18" width="36" height="18" fill="#d7141a" />
          <path d="M0 0 20 18 0 36Z" fill="#11457e" />
        </>
      )
    case 'DK':
      return <NordicFlag base="#c60c30" cross="#ffffff" />
    case 'EE':
      return <HorizontalFlag colors={['#4891d9', '#111111', '#ffffff']} />
    case 'FI':
      return <NordicFlag base="#ffffff" cross="#002f6c" />
    case 'FR':
      return <VerticalFlag colors={['#0055a4', '#ffffff', '#ef4135']} />
    case 'DE':
      return <HorizontalFlag colors={['#000000', '#dd0000', '#ffce00']} />
    case 'GR':
      return (
        <>
          {Array.from({ length: 9 }).map((_, index) => (
            <rect
              key={index}
              y={index * 4}
              width="36"
              height="4"
              fill={index % 2 === 0 ? '#0d5eaf' : '#ffffff'}
            />
          ))}
          <rect width="16" height="16" fill="#0d5eaf" />
          <rect x="6" width="4" height="16" fill="#ffffff" />
          <rect y="6" width="16" height="4" fill="#ffffff" />
        </>
      )
    case 'HU':
      return <HorizontalFlag colors={['#ce2939', '#ffffff', '#477050']} />
    case 'IE':
      return <VerticalFlag colors={['#169b62', '#ffffff', '#ff883e']} />
    case 'IT':
      return <VerticalFlag colors={['#009246', '#ffffff', '#ce2b37']} />
    case 'LV':
      return (
        <>
          <rect width="36" height="36" fill="#9e3039" />
          <rect y="15" width="36" height="6" fill="#ffffff" />
        </>
      )
    case 'LT':
      return <HorizontalFlag colors={['#fdb913', '#006a44', '#c1272d']} />
    case 'LU':
      return <HorizontalFlag colors={['#ef3340', '#ffffff', '#00a3e0']} />
    case 'MT':
      return (
        <>
          <rect width="18" height="36" fill="#ffffff" />
          <rect x="18" width="18" height="36" fill="#cf142b" />
          <path d="M8 7h4v3h3v4h-3v3H8v-3H5v-4h3Z" fill="#9aa6b2" />
        </>
      )
    case 'NL':
      return <HorizontalFlag colors={['#ae1c28', '#ffffff', '#21468b']} />
    case 'PL':
      return (
        <>
          <rect width="36" height="18" fill="#ffffff" />
          <rect y="18" width="36" height="18" fill="#dc143c" />
        </>
      )
    case 'PT':
      return (
        <>
          <rect width="14" height="36" fill="#006600" />
          <rect x="14" width="22" height="36" fill="#ff0000" />
          <circle cx="14" cy="18" r="4" fill="#ffcc00" />
        </>
      )
    case 'RO':
      return <VerticalFlag colors={['#002b7f', '#fcd116', '#ce1126']} />
    case 'SK':
      return (
        <>
          <HorizontalFlag colors={['#ffffff', '#0b4ea2', '#ee1c25']} />
          <rect x="9" y="13" width="7" height="9" rx="1" fill="#ee1c25" />
        </>
      )
    case 'SI':
      return (
        <>
          <HorizontalFlag colors={['#ffffff', '#005da4', '#ed1c24']} />
          <path d="M9 12h7v8l-3.5 2L9 20Z" fill="#005da4" />
        </>
      )
    case 'ES':
      return (
        <>
          <rect width="36" height="9" fill="#aa151b" />
          <rect y="9" width="36" height="18" fill="#f1bf00" />
          <rect y="27" width="36" height="9" fill="#aa151b" />
        </>
      )
    case 'SE':
      return <NordicFlag base="#006aa7" cross="#fecc00" />
    case 'EU':
      return (
        <>
          <rect width="36" height="36" fill="#075fff" />
          {Array.from({ length: 12 }).map((_, index) => {
            const angle = (index / 12) * Math.PI * 2
            const x = 18 + Math.cos(angle) * 8
            const y = 18 + Math.sin(angle) * 8
            return <circle key={index} cx={x} cy={y} r="1.2" fill="#ffcc00" />
          })}
        </>
      )
    default:
      return <rect width="36" height="36" fill="#f3f7ff" />
  }
}

function HorizontalFlag({ colors }: { colors: [string, string, string] }) {
  return (
    <>
      {colors.map((color, index) => (
        <rect key={color} y={index * 12} width="36" height="12" fill={color} />
      ))}
    </>
  )
}

function VerticalFlag({ colors }: { colors: [string, string, string] }) {
  return (
    <>
      {colors.map((color, index) => (
        <rect key={color} x={index * 12} width="12" height="36" fill={color} />
      ))}
    </>
  )
}

function NordicFlag({ base, cross }: { base: string; cross: string }) {
  return (
    <>
      <rect width="36" height="36" fill={base} />
      <rect x="11" width="5" height="36" fill={cross} />
      <rect y="15" width="36" height="5" fill={cross} />
    </>
  )
}

function WorldMapGraphic() {
  const markers = [
    [517, 112],
    [530, 126],
    [542, 145],
    [555, 130],
    [569, 150],
    [586, 136],
    [600, 156],
    [615, 142],
    [632, 164],
  ] as const

  return (
    <div className="relative min-h-[230px] rounded-[28px] bg-white/45 lg:min-h-[330px]">
      <svg
        viewBox="0 0 900 360"
        role="img"
        aria-label="Världskarta med europeiska marknader"
        className="h-full min-h-[230px] w-full lg:min-h-[330px]"
      >
        <defs>
          <pattern id="footer-map-dots" width="7" height="7" patternUnits="userSpaceOnUse">
            <circle cx="1.6" cy="1.6" r="1.65" fill="#7db3ff" />
          </pattern>
          <filter id="footer-map-marker-shadow" x="-80%" y="-80%" width="260%" height="260%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#075fff" floodOpacity="0.38" />
          </filter>
        </defs>
        <g fill="url(#footer-map-dots)" opacity="0.95">
          <path d="M95 78 128 46l64-16 68 15 37 34-13 45-47 24-28 47 18 45-29 31-48-19-39-56-56-27-23-51 33-40Z" />
          <path d="m257 203 37 23 28 56-19 53-37 4-25-37-19-58 35-41Z" />
          <path d="m441 86 69-31 73 14 41 35-22 41-55 13-54-9-52 23-39-36 39-50Z" />
          <path d="m507 161 76-10 51 30 23 64-31 64-68 22-54-45-29-73 32-52Z" />
          <path d="m611 71 96-26 82 22 59 52-25 54-75 13-45 44-65-18-51-55 24-86Z" />
          <path d="m727 232 58 7 46 39-21 45-57 7-42-32 16-66Z" />
        </g>
        {markers.map(([cx, cy]) => (
          <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r="7"
            fill="#075fff"
            filter="url(#footer-map-marker-shadow)"
          />
        ))}
      </svg>
    </div>
  )
}
