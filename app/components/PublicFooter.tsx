'use client'

import { useEffect, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Check,
  ChevronDown,
  Globe2,
  Search,
  X,
} from 'lucide-react'
import {
  localizePublicHref,
  translatePublicObject,
  type PublicLocale,
} from '@/lib/public-client-i18n'
import { activeMarketCountryCodes } from '@/lib/eu-countries'
import { euBuyerMarkets } from '@/lib/eu-buyer-markets'
import { marketForPathCode } from '@/lib/market-locale'
import { usePreferredHomeHref } from './preferred-home-category'
import BrandLogo from './BrandLogo'
import InstallAutorellButton from './InstallAutorellButton'

const footerCopy = {
  sv: {
    description:
      'Autorell är en europeisk marknadsplats för fordonsannonser. Köpare kan hitta annonser och säljare kan nå rätt kunder på ett tryggt och tydligt sätt.',
    columns: [
      {
        title: 'Marknadsplats',
        links: [
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
          ['Sälj bil', '/sell-car'],
          ['Sälj transportbil', '/sell-van'],
          ['Sälj maskin', '/sell-construction'],
          ['Priser', '/help-center/payment/private-listing-prices'],
          ['Återförsäljarlösningar', '/business'],
        ],
      },
      {
        title: 'Köp',
        links: [
          ['Sök fordon', '/marketplace'],
          ['Sparade annonser', '/saved'],
          ['Sparade sökningar', '/saved-searches'],
          ['Fordonsnyheter', '/vehicle-news'],
        ],
      },
      {
        title: 'Support',
        links: [
          ['Hjälpcenter', '/help-center'],
          ['Rapportera problem', '/report'],
          ['Om Autorell', '/about'],
          ['Kontakta oss', '/contact'],
        ],
      },
    ],
    newsletterTitle: 'Håll dig uppdaterad',
    newsletterText:
      'Få de senaste fordonen, marknadstrenderna och tipsen direkt till din inkorg.',
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
    withdrawal: 'Utöva ångerrätt',
    privacy: 'Integritetspolicy',
    cookies: 'Cookiepolicy',
    cookieSettings: 'Cookieinställningar',
    legalNotice:
      'Autorell \u00e4r en europeisk marknadsplats f\u00f6r fordonsannonser. Inneh\u00e5ll, fordonsdata, bilder och annonsinformation f\u00e5r inte kopieras, skrapas eller \u00e5teranv\u00e4ndas utan tillst\u00e5nd fr\u00e5n Autorell.',
  },
  de: {
    description:
      'Autorell ist ein europäischer Marktplatz für Fahrzeuganzeigen. Käufer finden Anzeigen und Verkäufer erreichen die richtigen Kunden auf sichere und klare Weise.',
    columns: [
      {
        title: 'Marktplatz',
        links: [
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
          ['Auto verkaufen', '/sell-car'],
          ['Transporter verkaufen', '/sell-van'],
          ['Baumaschine verkaufen', '/sell-construction'],
          ['Preise', '/help-center/payment/private-listing-prices'],
          ['Händlerlösungen', '/business'],
        ],
      },
      {
        title: 'Kaufen',
        links: [
          ['Fahrzeuge suchen', '/marketplace'],
          ['Gespeicherte Anzeigen', '/saved'],
          ['Gespeicherte Suchen', '/saved-searches'],
          ['Auto-News', '/vehicle-news'],
        ],
      },
      {
        title: 'Support',
        links: [
          ['Hilfe', '/help-center'],
          ['Problem melden', '/report'],
          ['Über Autorell', '/about'],
          ['Kontakt', '/contact'],
        ],
      },
    ],
    newsletterTitle: 'Auf dem Laufenden bleiben',
    newsletterText:
      'Erhalten Sie neue Fahrzeuge, Markttrends und Tipps direkt in Ihr Postfach.',
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
    withdrawal: 'Widerruf erklären',
    privacy: 'Datenschutz',
    cookies: 'Cookie-Richtlinie',
    cookieSettings: 'Cookie-Einstellungen',
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
          ['Sell a car', '/sell-car'],
          ['Sell a van', '/sell-van'],
          ['Sell machinery', '/sell-construction'],
          ['Pricing', '/help-center/payment/private-listing-prices'],
          ['Dealer solutions', '/business'],
        ],
      },
      {
        title: 'Buy',
        links: [
          ['Search vehicles', '/marketplace'],
          ['Saved listings', '/saved'],
          ['Saved searches', '/saved-searches'],
          ['Vehicle news', '/vehicle-news'],
        ],
      },
      {
        title: 'Support',
        links: [
          ['Help center', '/help-center'],
          ['Report a problem', '/report'],
          ['About Autorell', '/about'],
          ['Contact us', '/contact'],
        ],
      },
    ],
    newsletterTitle: 'Stay up to date',
    newsletterText:
      'Get the latest vehicles, market trends and tips straight to your inbox.',
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
    withdrawal: 'Exercise withdrawal right',
    privacy: 'Privacy Policy',
    cookies: 'Cookie Policy',
    cookieSettings: 'Cookie settings',
    legalNotice:
      'Autorell is a European marketplace for vehicle listings. Content, vehicle data, images and listing information may not be copied, scraped or reused without permission from Autorell.',
  },
} as const

const footerCopyright: Record<PublicLocale, string> = {
  sv: 'Alla rättigheter förbehållna.',
  de: 'Alle Rechte vorbehalten.',
  en: 'All rights reserved.',
  at: 'Alle Rechte vorbehalten.',
  be: 'Alle rechten voorbehouden.',
  fr: 'Tous droits réservés.',
  es: 'Todos los derechos reservados.',
  it: 'Tutti i diritti riservati.',
  pl: 'Wszelkie prawa zastrzeżone.',
  nl: 'Alle rechten voorbehouden.',
  fi: 'Kaikki oikeudet pidätetään.',
  da: 'Alle rettigheder forbeholdes.',
}

const footerLanguageNames: Record<PublicLocale, string> = {
  sv: 'Svenska',
  en: 'English',
  de: 'Deutsch',
  at: 'Deutsch',
  be: 'Nederlands',
  fr: 'Français',
  es: 'Español',
  it: 'Italiano',
  pl: 'Polski',
  nl: 'Nederlands',
  fi: 'Suomi',
  da: 'Dansk',
}

const footerCurrencyLabels: Record<PublicLocale, string> = {
  sv: 'Valuta',
  en: 'Currency',
  de: 'Währung',
  at: 'Währung',
  be: 'Valuta',
  fr: 'Devise',
  es: 'Moneda',
  it: 'Valuta',
  pl: 'Waluta',
  nl: 'Valuta',
  fi: 'Valuutta',
  da: 'Valuta',
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
  const withdrawalHref = localizePublicHref(locale, '/withdrawal')
  const homeHref = usePreferredHomeHref(locale)

  return (
    <footer className="border-t border-[#dbe3ee] bg-white px-0 pb-0 pt-10 text-[#101828] lg:pt-14">
      <div className="mx-auto max-w-[390px] px-5 min-[430px]:max-w-[430px] sm:max-w-[var(--autorell-page-max)] sm:px-8">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-[1.25fr_repeat(4,minmax(0,1fr))] lg:gap-x-12">
          <div className="col-span-2 flex max-w-[360px] flex-col items-start sm:col-span-3 lg:col-span-1">
            <Link
              href={homeHref}
              aria-label="Autorell"
              className="inline-flex w-[128px] sm:w-[138px]"
            >
              <BrandLogo underline={false} />
            </Link>
            <p className="mt-5 text-[14px] text-[#344f7a]">
              © 2026 Autorell. {footerCopyright[locale]}
            </p>
            <div className="mt-5">
              <SocialLinks />
            </div>
            <div className="mt-4">
              <InstallAutorellButton locale={locale} />
            </div>
          </div>
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

        <div className="my-9 h-px bg-[#d8e0eb]" />

        <div className="grid gap-5 pb-[calc(var(--autorell-mobile-footer-reserve,4.75rem)+env(safe-area-inset-bottom))] text-[13px] text-[#475467] min-[1120px]:pb-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <nav className="flex flex-wrap gap-x-5 gap-y-2 font-medium">
            <Link href={termsHref} className="transition hover:text-[#075fff]">
              {t.terms}
            </Link>
            <Link href={purchaseTermsHref} className="transition hover:text-[#075fff]">
              {t.purchaseTerms}
            </Link>
            <Link href={refundPolicyHref} className="transition hover:text-[#075fff]">
              {t.refundPolicy}
            </Link>
            <Link href={withdrawalHref} className="transition hover:text-[#075fff]">
              {t.withdrawal}
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
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('autorell-open-cookie-settings'))}
              className="text-left transition hover:text-[#075fff]"
            >
              {t.cookieSettings}
            </button>
          </nav>

          <FooterMarketCurrencyControls locale={locale} className="lg:justify-end" />
        </div>
      </div>
    </footer>
  )
}

export function FooterMarketCurrencyControls({
  locale,
  className = '',
}: {
  locale: PublicLocale
  className?: string
}) {
  const pathname = usePathname()
  const activePathMarket = pathname.split('/').filter(Boolean)[0]
  const footerMarket = getFooterMarket(activePathMarket, locale)
  const [isMarketOpen, setIsMarketOpen] = useState(
    () => typeof window !== 'undefined' && window.location.hash === '#market-selector',
  )

  return (
    <>
      <div className={`flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] font-medium ${className}`}>
        <button
          type="button"
          onClick={() => setIsMarketOpen(true)}
          className="inline-flex min-h-8 items-center justify-between gap-2 px-0 py-1 text-left text-[13px] font-medium text-[#344054] transition hover:text-[#075fff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075fff]"
        >
          <span className="inline-flex items-center gap-2">
            <FlagIcon code={footerMarket.flagCode} size="sm" />
            {footerLanguageNames[locale]}
          </span>
          <ChevronDown className="h-4 w-4" />
        </button>
        <FooterSelect
          ariaLabel={footerCurrencyLabels[locale]}
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
      <MarketSelectorModal
        isOpen={isMarketOpen}
        onClose={() => setIsMarketOpen(false)}
        locale={locale}
      />
    </>
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

  if (pathMarket === 'se' || locale === 'sv') {
    return { flagCode: 'SE', label: 'Sverige', currency: 'sek' }
  }
  if (pathMarket === 'de' || locale === 'de') {
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

  const localeMarket = euBuyerMarkets.find((item) => item.language === locale)
  if (localeMarket) {
    return {
      flagCode: localeMarket.code.toUpperCase(),
      label: localeMarket.countryLocal,
      currency: currencyByMarketCode(localeMarket.code),
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
      <h3 className="text-[16px] font-semibold text-[#2a2a37]">{title}</h3>
      <nav className="mt-4 flex flex-col items-start gap-3 text-[14px] leading-5 text-[#2a2a37]">
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
      'M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.762 0 2.077.149 2.612.298v3.325a15.39 15.39 0 0 0-1.55-.075c-1.969 0-2.731.745-2.731 2.683v1.327h3.922l-.674 3.667H13.29v7.98H9.101Z',
    ],
    [
      'Instagram',
      'https://www.instagram.com/autorell',
      'M7.8 2h8.4A5.806 5.806 0 0 1 22 7.8v8.4a5.806 5.806 0 0 1-5.8 5.8H7.8A5.806 5.806 0 0 1 2 16.2V7.8A5.806 5.806 0 0 1 7.8 2Zm-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6Zm9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7.25A4.75 4.75 0 1 1 12 16.75 4.75 4.75 0 0 1 12 7.25Zm0 2A2.75 2.75 0 1 0 12 14.75 2.75 2.75 0 0 0 12 9.25Z',
    ],
    [
      'LinkedIn',
      'https://www.linkedin.com/company/autorell',
      'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124ZM7.119 20.452H3.554V9h3.565v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.226.792 24 1.771 24h20.451C23.2 24 24 23.226 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z',
    ],
  ] as const

  return (
    <div className="flex items-center gap-2.5">
      {links.map(([label, href, path]) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="grid h-9 w-9 place-items-center rounded-full border border-[#d6e5fb] bg-[#f4f8ff] text-[#075fff] transition hover:-translate-y-0.5 hover:border-[#075fff] hover:bg-[#075fff] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075fff]"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-4 w-4 fill-current"
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
  const [query, setQuery] = useState('')
  const copy =
    locale === 'sv'
      ? footerCopy.sv
      : locale === 'de'
        ? footerCopy.de
        : translatePublicObject(locale, footerCopy.en)
  const dialogCopy = getMarketDialogCopy(locale)
  const markets = allMarkets.filter(([code]) => code === 'EU' || activeMarketCountryCodes.has(code))
  const filteredMarkets = markets.filter(([code, market, language]) =>
    `${code} ${market} ${language}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  )

  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      window.removeEventListener('keydown', closeOnEscape)
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  function handleMarketNavigate(href: string) {
    onClose()
    window.location.assign(href)
  }

  return (
    <div
      className="fixed inset-0 z-[500] flex items-start justify-center overflow-y-auto bg-[#101828]/45 px-3 py-4 text-[#101828] backdrop-blur-[2px] sm:px-6 sm:py-8"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}
    >
      <section role="dialog" aria-modal="true" aria-labelledby="market-selector-title" className="my-auto flex max-h-[calc(100dvh-2rem)] w-full max-w-[980px] flex-col overflow-hidden rounded-[20px] border border-[#dfe6f2] bg-white shadow-[0_28px_80px_rgba(16,24,40,.28)] sm:max-h-[calc(100dvh-4rem)] sm:rounded-[24px]">
        <header className="flex items-start justify-between gap-5 border-b border-[#e7ecf3] px-5 py-5 sm:px-7 sm:py-6">
          <div>
            <h2 id="market-selector-title" className="text-2xl font-semibold tracking-[-0.035em] sm:text-[30px]">{copy.marketTitle}</h2>
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[#667085]">{copy.marketText}</p>
          </div>
          <button type="button" onClick={onClose} aria-label={copy.close} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#d9e1ec] bg-white text-[#344054] transition hover:border-[#98a2b3] hover:bg-[#f8fafc]">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <div className="overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          <label className="relative block max-w-[520px]">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98a2b3]" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={dialogCopy.search} className="market-selector-search h-11 w-full rounded-[10px] border border-[#cfd8e6] bg-white pl-10 pr-4 outline-none transition focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10" autoFocus />
          </label>

          <div className="mt-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#667085]">{dialogCopy.available}</h3>
            {filteredMarkets.length ? (
              <div className="mt-3 grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
                {filteredMarkets.map(([code, market, language], index) => (
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
            ) : <p className="mt-4 rounded-[12px] bg-[#f8fafc] px-4 py-5 text-sm text-[#667085]">{dialogCopy.empty}</p>}
          </div>

          <div className="mt-6 flex items-center gap-3 border-t border-[#edf1f6] pt-5 text-[#475467]">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#edf5ff] text-[#075fff]">
            <Globe2 className="h-5 w-5" />
          </span>
          <span>
            <strong className="block text-sm font-semibold text-[#101828]">
              {copy.missingMarketTitle}
            </strong>
            <span className="mt-0.5 block text-xs leading-5 sm:text-sm">
              {copy.missingMarketText}
            </span>
          </span>
        </div>
        </div>
      </section>
    </div>
  )
}

function getMarketDialogCopy(locale: PublicLocale) {
  const labels: Partial<Record<PublicLocale, { search: string; available: string; empty: string }>> = {
    sv: { search: 'Sök land eller språk', available: 'Tillgängliga marknader', empty: 'Ingen marknad matchar din sökning.' },
    de: { search: 'Land oder Sprache suchen', available: 'Verfügbare Märkte', empty: 'Kein Markt entspricht Ihrer Suche.' },
    at: { search: 'Land oder Sprache suchen', available: 'Verfügbare Märkte', empty: 'Kein Markt entspricht Ihrer Suche.' },
    fr: { search: 'Rechercher un pays ou une langue', available: 'Marchés disponibles', empty: 'Aucun marché ne correspond à votre recherche.' },
    es: { search: 'Buscar país o idioma', available: 'Mercados disponibles', empty: 'Ningún mercado coincide con tu búsqueda.' },
    it: { search: 'Cerca paese o lingua', available: 'Mercati disponibili', empty: 'Nessun mercato corrisponde alla ricerca.' },
    pl: { search: 'Szukaj kraju lub języka', available: 'Dostępne rynki', empty: 'Brak rynku pasującego do wyszukiwania.' },
    nl: { search: 'Zoek land of taal', available: 'Beschikbare markten', empty: 'Geen markt komt overeen met je zoekopdracht.' },
    be: { search: 'Zoek land of taal', available: 'Beschikbare markten', empty: 'Geen markt komt overeen met je zoekopdracht.' },
    fi: { search: 'Hae maata tai kieltä', available: 'Saatavilla olevat markkinat', empty: 'Hakua vastaavaa markkinaa ei löytynyt.' },
    da: { search: 'Søg efter land eller sprog', available: 'Tilgængelige markeder', empty: 'Ingen markeder matcher din søgning.' },
  }
  return labels[locale] || { search: 'Search country or language', available: 'Available markets', empty: 'No market matches your search.' }
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
      className={`flex min-h-[62px] items-center gap-3 rounded-[10px] border px-3.5 text-left transition hover:border-[#a9c8ff] hover:bg-[#f8fbff] ${
        selected ? 'border-[#8bb7ff] bg-[#f3f8ff] ring-1 ring-[#0866ff]/10' : 'border-transparent bg-white'
      }`}
    >
      <FlagIcon code={countryCode} />
      <span className="min-w-0 flex-1">
        <strong className="block truncate text-sm font-semibold text-[#101828]">
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
  if (normalizedCode === 'EU') return 'https://www.autorell.com/?market=en'
  if (normalizedCode === 'SE') return 'https://www.autorell.se/'
  if (normalizedCode === 'DE') return 'https://www.autorell.de/'
  return `https://www.autorell.com/${normalizedCode.toLowerCase()}`
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
      className={`grid shrink-0 place-items-center overflow-hidden rounded-full bg-white shadow-sm ${
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
