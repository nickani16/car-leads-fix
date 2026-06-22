'use client'

import Link from 'next/link'
import {
  Check,
  Cookie,
  LockKeyhole,
  Settings2,
  X,
} from 'lucide-react'
import { useEffect, useState, useSyncExternalStore } from 'react'
import { euBuyerMarkets, type EuBuyerLanguage } from '@/lib/eu-buyer-markets'
import {
  isPublicLanguage,
  localizePublicHref,
  translatePublicObject,
} from '@/lib/public-i18n'

const CONSENT_COOKIE = 'autorell_cookie_consent'
const CONSENT_MAX_AGE = 60 * 60 * 24 * 180

type ConsentChoice = 'necessary' | 'all'
type CookieLocale = 'sv' | EuBuyerLanguage

const cookieCopy = {
  sv: {
    eyebrow: 'Cookieval',
    trustTitle: 'Integritet från grunden',
    trustText: 'Säker åtkomst. Tydliga val. Inga marknadsföringscookies.',
    close: 'Stäng cookieinställningar',
    title: 'Dina cookieinställningar',
    text: 'Vi använder nödvändiga cookies för säkerhet, inloggning och webbplatsens funktioner. Med ditt godkännande mäter vi anonymt hur webbplatsen leder till kontakt och affär. Vi använder inte marknadsföringscookies idag.',
    necessaryTitle: 'Nödvändiga cookies',
    necessaryText: 'Krävs för säkerhet, formulär och inloggning. Kan inte stängas av.',
    analyticsTitle: 'Analyscookies',
    analyticsText: 'Mäter anonymt vilka sidor och marknader som leder till kontakt.',
    policyStart: 'Läs mer i vår',
    policy: 'cookiepolicy',
    policyEnd: 'Du kan ändra ditt val när som helst via footern.',
    accept: 'Acceptera alla',
    necessary: 'Endast nödvändiga',
    hide: 'Dölj inställningar',
    customize: 'Anpassa',
  },
  de: {
    eyebrow: 'Cookie-Einstellungen',
    trustTitle: 'Datenschutz von Anfang an',
    trustText: 'Sicherer Zugang. Klare Auswahl. Keine Marketing-Cookies.',
    close: 'Cookie-Einstellungen schließen',
    title: 'Ihre Cookie-Einstellungen',
    text: 'Wir verwenden notwendige Cookies für Sicherheit, Anmeldung und Website-Funktionen. Mit Ihrer Zustimmung messen wir anonym, wie die Website zu Kontakt und Geschäft führt. Marketing-Cookies verwenden wir derzeit nicht.',
    necessaryTitle: 'Notwendige Cookies',
    necessaryText: 'Für Sicherheit, Formulare und Anmeldung erforderlich. Sie können nicht deaktiviert werden.',
    analyticsTitle: 'Analyse-Cookies',
    analyticsText: 'Misst anonym, welche Seiten und Märkte zu Kontakten führen.',
    policyStart: 'Mehr erfahren Sie in unserer',
    policy: 'Cookie-Richtlinie',
    policyEnd: 'Sie können Ihre Auswahl jederzeit im Footer ändern.',
    accept: 'Alle akzeptieren',
    necessary: 'Nur notwendige',
    hide: 'Einstellungen ausblenden',
    customize: 'Anpassen',
  },
  en: {
    eyebrow: 'Cookie preferences',
    trustTitle: 'Privacy by design',
    trustText: 'Secure access. Clear choices. No marketing cookies.',
    close: 'Close cookie settings',
    title: 'Your cookie settings',
    text: 'We use essential cookies for security, sign-in and website functionality. With your consent, we anonymously measure how the website leads to contact and business. We do not currently use marketing cookies.',
    necessaryTitle: 'Essential cookies',
    necessaryText: 'Required for security, forms and sign-in. These cannot be disabled.',
    analyticsTitle: 'Analytics cookies',
    analyticsText: 'Anonymously measures which pages and markets lead to contact.',
    policyStart: 'Learn more in our',
    policy: 'cookie policy',
    policyEnd: 'You can change your choice at any time in the footer.',
    accept: 'Accept all',
    necessary: 'Essential only',
    hide: 'Hide settings',
    customize: 'Customise',
  },
  pl: {
    eyebrow: 'Ustawienia plików cookie',
    trustTitle: 'Prywatność od podstaw',
    trustText: 'Bezpieczny dostęp. Jasne wybory. Bez marketingowych plików cookie.',
    close: 'Zamknij ustawienia plików cookie',
    title: 'Twoje ustawienia plików cookie',
    text: 'Używamy niezbędnych plików cookie do zapewnienia bezpieczeństwa, logowania i działania witryny. Za Twoją zgodą anonimowo mierzymy, w jaki sposób witryna prowadzi do kontaktu i transakcji. Obecnie nie używamy marketingowych plików cookie.',
    necessaryTitle: 'Niezbędne pliki cookie',
    necessaryText: 'Wymagane do bezpieczeństwa, formularzy i logowania. Nie można ich wyłączyć.',
    analyticsTitle: 'Analityczne pliki cookie',
    analyticsText: 'Anonimowo mierzą zdarzenia, takie jak kliknięcia i rynki prowadzące do kontaktu.',
    policyStart: 'Więcej informacji znajdziesz w naszej',
    policy: 'polityce plików cookie',
    policyEnd: 'W każdej chwili możesz zmienić wybór w stopce.',
    accept: 'Zaakceptuj wszystkie',
    necessary: 'Tylko niezbędne',
    hide: 'Ukryj ustawienia',
    customize: 'Dostosuj',
  },
} as const

function getCookieLocale(): CookieLocale {
  const marketCode = window.location.pathname.split('/').filter(Boolean)[0]
  if (isPublicLanguage(marketCode)) return marketCode
  const market = euBuyerMarkets.find((item) => item.code === marketCode)
  if (market && market.language in cookieCopy) {
    return market.language as keyof typeof cookieCopy
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
    <div className="fixed inset-x-0 bottom-0 z-[200] p-3 sm:p-5">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-title"
        className="mx-auto w-[calc(100vw-24px)] max-w-[760px] overflow-hidden rounded-[20px] border border-[#dfe4ec] bg-white shadow-[0_22px_70px_rgba(16,24,40,.18)]"
      >
        <div className="relative min-w-0 p-5 sm:p-7">
            {readConsent() && (
              <button
                type="button"
                onClick={() => {
                  setVisible(false)
                  setSettingsOpen(false)
                }}
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-[11px] border border-[#d9e0e3] bg-white text-[#69757a]"
                aria-label={t.close}
              >
                <X size={17} />
              </button>
            )}

            <div className="max-w-3xl pr-0 lg:pr-10">
              <div className="flex items-center gap-3 text-[#0866ff]">
                <span className="grid h-9 w-9 place-items-center rounded-[11px] bg-[#edf3ff]">
                  <Cookie size={17} />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">
                  {t.eyebrow}
                </span>
              </div>

              <h2
                id="cookie-title"
                className="mt-4 text-2xl font-semibold tracking-[-0.035em] text-[#20272b] sm:text-[28px]"
              >
                {t.title}
              </h2>
              <p className="mt-3 break-words text-sm leading-6 text-[#626d72] [overflow-wrap:anywhere]">
                {t.text}
              </p>
            </div>

            {settingsOpen && (
              <div className="mt-6 grid gap-3 border-t border-[#dce7eb] pt-5">
                <ConsentCategory
                  title={t.necessaryTitle}
                  description={t.necessaryText}
                  active
                  locked
                />
                <ConsentCategory
                  title={t.analyticsTitle}
                  description={t.analyticsText}
                  active={false}
                />
                <p className="px-1 text-xs leading-5 text-[#748087]">
                  {t.policyStart}{' '}
                  <Link
                    href={policyHref}
                    className="font-semibold text-[#315f74] underline underline-offset-2"
                  >
                    {t.policy}
                  </Link>
                  . {t.policyEnd}
                </p>
              </div>
            )}

            <div className="mt-6 flex min-w-0 w-full flex-col gap-2.5 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={() => choose('all')}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[15px] bg-[#0866ff] px-6 text-sm font-semibold text-white"
              >
                <Check size={16} />
                {t.accept}
              </button>
              <button
                type="button"
                onClick={() => choose('necessary')}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[15px] border border-[#cbd9df] bg-white px-6 text-sm font-semibold text-[#20272b]"
              >
                <LockKeyhole size={15} />
                {t.necessary}
              </button>
              <button
                type="button"
                onClick={() => setSettingsOpen((open) => !open)}
                aria-expanded={settingsOpen}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[15px] px-5 text-sm font-semibold text-[#0866ff] transition hover:bg-[#f4f7fb]"
              >
                <Settings2 size={16} />
                {settingsOpen ? t.hide : t.customize}
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
  active,
  locked = false,
}: {
  title: string
  description: string
  active: boolean
  locked?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-5 rounded-[16px] border border-[#dbe5e9] bg-white/80 px-4 py-3.5 shadow-[0_8px_24px_rgba(49,95,116,.05)]">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#20272b]">{title}</p>
        <p className="mt-1 text-xs leading-5 text-[#6d787d]">{description}</p>
      </div>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full ${
          active ? 'bg-[#315f74]' : 'bg-[#cfd8dc]'
        }`}
        aria-label={locked ? 'Alltid aktiv' : 'Inaktiv tills godkännande'}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            active ? 'left-6' : 'left-1'
          }`}
        />
      </span>
    </div>
  )
}
