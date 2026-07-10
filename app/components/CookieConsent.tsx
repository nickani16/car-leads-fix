'use client'

import Link from 'next/link'
import { Check, Settings2, X } from 'lucide-react'
import { useEffect, useState, useSyncExternalStore } from 'react'
import BrandLogo from './BrandLogo'
import { euBuyerMarkets } from '@/lib/eu-buyer-markets'
import {
  isPublicLanguage,
  localizePublicHref,
  translatePublicObject,
} from '@/lib/public-i18n'

const CONSENT_COOKIE = 'autorell_cookie_consent'
const CONSENT_MAX_AGE = 60 * 60 * 24 * 180

type ConsentChoice = 'necessary' | 'all'
type CookieLocale = 'sv' | 'de' | 'en' | 'fr' | 'es' | 'it' | 'pl' | 'nl' | 'fi' | 'da'

const cookieCopy = {
  sv: {
    close: 'Stäng cookieinställningar',
    title: 'Vi vill ge dig en bättre upplevelse',
    intro:
      'Med ditt samtycke använder Autorell cookies och liknande tekniker för att lagra, läsa och behandla information från din enhet. Det kan omfatta cookie-id, IP-adress, webbläsar- och enhetsinformation, ungefärlig plats, besökta sidor och hur du använder marknadsplatsen.',
    detailsTitle: 'Vi använder cookies för följande ändamål:',
    details:
      'Nödvändiga cookies krävs för säkerhet, inloggning, språk, marknad och grundläggande funktioner. Med ditt godkännande kan vi även använda statistik och förbättringsmätning för att förstå användning, utveckla tjänsten och göra Autorell mer relevant. Icke-nödvändiga cookies aktiveras endast efter ditt val.',
    rights:
      'Du kan när som helst ändra eller återkalla ditt samtycke via cookieinställningarna. Läs mer i vår',
    policy: 'cookiepolicy',
    settings: 'Inställningar',
    acceptNecessary: 'Acceptera nödvändiga',
    acceptAll: 'Godkänn',
    hide: 'Dölj inställningar',
    necessaryTitle: 'Nödvändiga cookies',
    necessaryText:
      'Alltid aktiva. De behövs för säker drift, formulär, konto, språk och valda marknader.',
    optionalTitle: 'Statistik och förbättring',
    optionalText:
      'Aktiveras bara om du godkänner. Hjälper oss förstå användning och förbättra Autorell.',
    alwaysActive: 'Alltid aktiv',
    optionalInactive: 'Aktiveras med godkännande',
  },
  de: {
    close: 'Cookie-Einstellungen schließen',
    title: 'Wir möchten Ihr Erlebnis verbessern',
    intro:
      'Mit Ihrer Einwilligung verwendet Autorell Cookies und ähnliche Technologien, um Informationen auf Ihrem Gerät zu speichern, auszulesen und zu verarbeiten. Dazu können Cookie-IDs, IP-Adresse, Browser- und Geräteinformationen, ungefährer Standort, besuchte Seiten und Ihre Nutzung des Marktplatzes gehören.',
    detailsTitle: 'Wir verwenden Cookies für folgende Zwecke:',
    details:
      'Notwendige Cookies sind für Sicherheit, Anmeldung, Sprache, Markt und grundlegende Funktionen erforderlich. Mit Ihrer Zustimmung können wir außerdem Statistik- und Verbesserungsmessungen verwenden, um die Nutzung zu verstehen, den Dienst weiterzuentwickeln und Autorell relevanter zu machen. Nicht notwendige Cookies werden nur nach Ihrer Auswahl aktiviert.',
    rights:
      'Sie können Ihre Einwilligung jederzeit über die Cookie-Einstellungen ändern oder widerrufen. Mehr dazu in unserer',
    policy: 'Cookie-Richtlinie',
    settings: 'Einstellungen',
    acceptNecessary: 'Nur notwendige akzeptieren',
    acceptAll: 'Akzeptieren',
    hide: 'Einstellungen ausblenden',
    necessaryTitle: 'Notwendige Cookies',
    necessaryText:
      'Immer aktiv. Erforderlich für sicheren Betrieb, Formulare, Konto, Sprache und gewählte Märkte.',
    optionalTitle: 'Statistik und Verbesserung',
    optionalText:
      'Nur aktiv, wenn Sie zustimmen. Hilft uns, Nutzung zu verstehen und Autorell zu verbessern.',
    alwaysActive: 'Immer aktiv',
    optionalInactive: 'Aktiviert mit Zustimmung',
  },
  en: {
    close: 'Close cookie settings',
    title: 'We want to give you a better experience',
    intro:
      'With your consent, Autorell uses cookies and similar technologies to store, access and process information from your device. This may include cookie IDs, IP address, browser and device information, approximate location, visited pages and how you use the marketplace.',
    detailsTitle: 'We use cookies for the following purposes:',
    details:
      'Necessary cookies are required for security, sign-in, language, market and core functionality. With your approval, we may also use statistics and product-improvement measurement to understand usage, develop the service and make Autorell more relevant. Non-essential cookies are only activated after your choice.',
    rights:
      'You can change or withdraw your consent at any time through the cookie settings. Read more in our',
    policy: 'cookie policy',
    settings: 'Settings',
    acceptNecessary: 'Accept necessary',
    acceptAll: 'Accept',
    hide: 'Hide settings',
    necessaryTitle: 'Necessary cookies',
    necessaryText:
      'Always active. Needed for secure operation, forms, account, language and selected markets.',
    optionalTitle: 'Statistics and improvement',
    optionalText:
      'Only active if you approve. Helps us understand usage and improve Autorell.',
    alwaysActive: 'Always active',
    optionalInactive: 'Activated with approval',
  },
  pl: {
    close: 'Zamknij ustawienia plików cookie',
    title: 'Chcemy zapewnić lepsze doświadczenie',
    intro:
      'Za Twoją zgodą Autorell używa plików cookie i podobnych technologii do zapisywania, odczytywania i przetwarzania informacji z urządzenia. Może to obejmować identyfikatory cookie, adres IP, informacje o przeglądarce i urządzeniu, przybliżoną lokalizację, odwiedzone strony oraz sposób korzystania z platformy.',
    detailsTitle: 'Używamy plików cookie w następujących celach:',
    details:
      'Niezbędne pliki cookie są wymagane dla bezpieczeństwa, logowania, języka, rynku i podstawowych funkcji. Za Twoją zgodą możemy także używać statystyk i pomiarów usprawniających, aby zrozumieć korzystanie z serwisu, rozwijać usługę i zwiększać trafność Autorell. Nieistotne pliki cookie są aktywowane tylko po Twoim wyborze.',
    rights:
      'W każdej chwili możesz zmienić lub wycofać zgodę w ustawieniach plików cookie. Więcej w naszej',
    policy: 'polityce plików cookie',
    settings: 'Ustawienia',
    acceptNecessary: 'Akceptuj niezbędne',
    acceptAll: 'Akceptuj',
    hide: 'Ukryj ustawienia',
    necessaryTitle: 'Niezbędne pliki cookie',
    necessaryText:
      'Zawsze aktywne. Potrzebne do bezpiecznego działania, formularzy, konta, języka i wybranych rynków.',
    optionalTitle: 'Statystyka i ulepszanie',
    optionalText:
      'Aktywne tylko po Twojej zgodzie. Pomaga nam rozumieć użycie i ulepszać Autorell.',
    alwaysActive: 'Zawsze aktywne',
    optionalInactive: 'Aktywowane za zgodą',
  },
} as const

function getCookieLocale(): CookieLocale {
  const marketCode = window.location.pathname.split('/').filter(Boolean)[0]
  if (marketCode === 'se') return 'sv'
  if (marketCode === 'de') return 'de'
  if (marketCode === 'at') return 'de'
  if (marketCode === 'be') return 'nl'
  if (isPublicLanguage(marketCode)) {
    return marketCode as CookieLocale
  }
  const market = euBuyerMarkets.find((item) => item.code === marketCode)
  if (market) {
    return market.language as CookieLocale
  }

  const hostname = window.location.hostname.toLowerCase()
  if (hostname.endsWith('autorell.de')) return 'de'
  if (hostname.endsWith('autorell.com')) return 'en'
  return 'sv'
}

function subscribeToHostname() {
  return () => {}
}

function readConsent() {
  return document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${CONSENT_COOKIE}=`))
    ?.split('=')[1] as ConsentChoice | undefined
}

function saveConsent(choice: ConsentChoice) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${CONSENT_COOKIE}=${choice}; Max-Age=${CONSENT_MAX_AGE}; Path=/; SameSite=Lax${secure}`
  window.dispatchEvent(
    new CustomEvent('autorell-cookie-consent-changed', {
      detail: { choice },
    })
  )
}

export default function CookieConsent({
  initialLocale = 'sv',
  initialMarketCode,
}: {
  initialLocale?: CookieLocale
  initialMarketCode?: string
}) {
  const [visible, setVisible] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const locale = useSyncExternalStore(
    subscribeToHostname,
    getCookieLocale,
    () => initialLocale,
  )
  const t =
    locale in cookieCopy
      ? cookieCopy[locale as keyof typeof cookieCopy]
      : translatePublicObject(locale, cookieCopy.en)
  const marketCode = initialMarketCode || ''
  const policyHref = euBuyerMarkets.some((market) => market.code === marketCode)
    ? `/${marketCode}/cookies`
    : localizePublicHref(locale, '/cookies')

  useEffect(() => {
    const initialCheck = window.setTimeout(() => {
      setVisible(!readConsent())
    }, 0)

    const openSettings = () => {
      setSettingsOpen(true)
      setVisible(true)
    }

    window.addEventListener('autorell-open-cookie-settings', openSettings)
    return () => {
      window.clearTimeout(initialCheck)
      window.removeEventListener('autorell-open-cookie-settings', openSettings)
    }
  }, [])

  function choose(choice: ConsentChoice) {
    saveConsent(choice)
    setVisible(false)
    setSettingsOpen(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-[#07111f]/15 p-0 backdrop-blur-[7px]">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-title"
        className="my-auto overflow-hidden rounded-[14px] border border-[#d6dde8] bg-white shadow-[0_28px_90px_rgba(9,24,50,.22)]"
        style={{ width: 'min(734px, calc(100vw - 32px))' }}
      >
        <div className="relative min-w-0 max-h-[calc(100dvh-32px)] overflow-y-auto px-6 py-7 sm:max-h-[calc(100dvh-48px)] sm:px-8 sm:py-9 lg:px-10">
          {readConsent() ? (
            <button
              type="button"
              onClick={() => {
                setVisible(false)
                setSettingsOpen(false)
              }}
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-[10px] text-[#667085] transition hover:bg-[#f1f4f9] hover:text-[#101828]"
              aria-label={t.close}
            >
              <X size={20} />
            </button>
          ) : null}

          <div className="flex justify-center">
            <BrandLogo compact underline={false} />
          </div>

          <div className="mt-7 min-w-0">
            <h2
              id="cookie-title"
              className="break-words text-[28px] font-medium leading-[1.12] tracking-[-0.035em] text-[#101828] sm:text-[30px]"
            >
              {t.title}
            </h2>
            <p className="mt-4 break-words text-[15px] leading-7 text-[#1f2937] [overflow-wrap:anywhere]">
              {t.intro}
            </p>

            <h3 className="mt-7 break-words text-[20px] font-medium leading-snug tracking-[-0.025em] text-[#101828]">
              {t.detailsTitle}
            </h3>
            <p className="mt-3 break-words text-[14px] leading-6 text-[#1f2937] [overflow-wrap:anywhere]">
              {t.details}
            </p>
            <p className="mt-3 break-words text-[14px] leading-6 text-[#475467] [overflow-wrap:anywhere]">
              {t.rights}{' '}
              <Link
                href={policyHref}
                className="font-medium text-[#0866ff] underline underline-offset-2"
              >
                {t.policy}
              </Link>
              .
            </p>
          </div>

          {settingsOpen ? (
            <div className="mt-6 grid gap-3 border-t border-[#e4e9f2] pt-5">
              <ConsentCategory
                title={t.necessaryTitle}
                description={t.necessaryText}
                status={t.alwaysActive}
                active
              />
              <ConsentCategory
                title={t.optionalTitle}
                description={t.optionalText}
                status={t.optionalInactive}
                active={false}
              />
            </div>
          ) : null}

          <div className="mt-7 grid min-w-0 gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => setSettingsOpen((open) => !open)}
              aria-expanded={settingsOpen}
              className="order-3 inline-flex min-h-11 min-w-0 items-center justify-center rounded-[14px] border border-[#1d2939] bg-white px-5 text-[14px] font-medium text-[#101828] transition hover:border-[#0866ff] hover:text-[#0866ff] sm:order-1"
            >
              <Settings2 className="mr-2 h-4 w-4 sm:hidden" />
              {settingsOpen ? t.hide : t.settings}
            </button>
            <button
              type="button"
              onClick={() => choose('necessary')}
              className="order-2 inline-flex min-h-11 min-w-0 items-center justify-center rounded-[14px] border border-[#1d2939] bg-white px-5 text-[14px] font-medium text-[#101828] transition hover:border-[#0866ff] hover:text-[#0866ff]"
            >
              {t.acceptNecessary}
            </button>
            <button
              type="button"
              onClick={() => choose('all')}
              className="order-1 inline-flex min-h-11 min-w-0 items-center justify-center rounded-[14px] bg-[#0866ff] px-5 text-[14px] font-medium text-white shadow-[0_14px_30px_rgba(8,102,255,.24)] transition hover:-translate-y-0.5 hover:bg-[#075be5] sm:order-3"
            >
              <Check className="mr-2 h-4 w-4" />
              {t.acceptAll}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

function ConsentCategory({
  title,
  description,
  status,
  active,
}: {
  title: string
  description: string
  status: string
  active: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[14px] border border-[#d8e1ee] bg-[#f8fbff] px-4 py-3.5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[#101828]">{title}</p>
        <p className="mt-1 text-xs leading-5 text-[#667085]">{description}</p>
      </div>
      <span
        className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-medium ${
          active
            ? 'bg-[#e9f0fd] text-[#0866ff]'
            : 'bg-white text-[#667085] ring-1 ring-[#d8e1ee]'
        }`}
      >
        {status}
      </span>
    </div>
  )
}
