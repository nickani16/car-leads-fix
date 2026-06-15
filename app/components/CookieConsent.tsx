'use client'

import Link from 'next/link'
import {
  Check,
  Cookie,
  LockKeyhole,
  Settings2,
  ShieldCheck,
  X,
} from 'lucide-react'
import { useEffect, useState, useSyncExternalStore } from 'react'
import BrandLogo from './BrandLogo'

const CONSENT_COOKIE = 'autorell_cookie_consent'
const CONSENT_MAX_AGE = 60 * 60 * 24 * 180

type ConsentChoice = 'necessary' | 'all'
type CookieLocale = 'sv' | 'de' | 'en'

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
    analyticsText: 'Mäter anonymt exempelvis WhatsApp-klick och vilka marknader som leder till kontakt.',
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
    analyticsText: 'Misst nach Zustimmung anonym zum Beispiel WhatsApp-Klicks und konvertierende Märkte.',
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
    analyticsText: 'Anonymously measures events such as WhatsApp clicks and the markets that convert.',
    policyStart: 'Learn more in our',
    policy: 'cookie policy',
    policyEnd: 'You can change your choice at any time in the footer.',
    accept: 'Accept all',
    necessary: 'Essential only',
    hide: 'Hide settings',
    customize: 'Customise',
  },
} as const

function getCookieLocale(): CookieLocale {
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
}: {
  initialLocale?: CookieLocale
}) {
  const [visible, setVisible] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const locale = useSyncExternalStore(
    subscribeToHostname,
    getCookieLocale,
    () => initialLocale,
  )
  const t = cookieCopy[locale]

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
    <div className="fixed inset-x-0 bottom-0 z-[200] p-3 sm:p-5 lg:p-7">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-title"
        className="mx-auto w-full max-w-[1120px] overflow-hidden rounded-[26px] border border-white/70 bg-white shadow-[0_30px_100px_rgba(19,35,43,.25)] ring-1 ring-[#d8e3e8]"
      >
        <div className="grid min-w-0 lg:grid-cols-[270px_1fr]">
          <div className="relative overflow-hidden bg-[#20272b] p-5 text-white sm:p-6 lg:p-7">
            <div className="absolute -right-14 -top-16 h-44 w-44 rounded-full border-[34px] border-[#B4D9EF]/15" />
            <div className="relative flex items-start justify-between gap-4 lg:block">
              <BrandLogo inverted />
              {readConsent() && (
                <button
                  type="button"
                  onClick={() => {
                    setVisible(false)
                    setSettingsOpen(false)
                  }}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white/70 transition hover:bg-white/10 hover:text-white lg:hidden"
                  aria-label={t.close}
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="relative mt-6 hidden lg:block">
              <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-[#B4D9EF] text-[#20272b] shadow-[0_12px_30px_rgba(0,0,0,.16)]">
                <ShieldCheck size={20} />
              </span>
              <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B4D9EF]">
                {t.trustTitle}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/65">
                {t.trustText}
              </p>
            </div>
          </div>

          <div className="relative min-w-0 bg-[linear-gradient(145deg,#ffffff_20%,#f1f8fb_100%)] p-5 sm:p-7 lg:p-8">
            {readConsent() && (
              <button
                type="button"
                onClick={() => {
                  setVisible(false)
                  setSettingsOpen(false)
                }}
                className="absolute right-5 top-5 hidden h-10 w-10 place-items-center rounded-full border border-[#d9e0e3] bg-white/80 text-[#69757a] transition hover:border-[#9fbfce] hover:text-[#20272b] lg:grid"
                aria-label={t.close}
              >
                <X size={17} />
              </button>
            )}

            <div className="max-w-3xl pr-0 lg:pr-10">
              <div className="flex items-center gap-3 text-[#315f74]">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-white shadow-[0_8px_24px_rgba(49,95,116,.1)] ring-1 ring-[#d7e6ed]">
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
              <p className="mt-3 text-sm leading-6 text-[#626d72]">
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
                    href="/cookies"
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
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#20272b] px-6 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(32,39,43,.18)] transition hover:-translate-y-0.5 hover:bg-[#111719]"
              >
                <Check size={16} />
                {t.accept}
              </button>
              <button
                type="button"
                onClick={() => choose('necessary')}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#cbd9df] bg-white px-6 text-sm font-semibold text-[#20272b] transition hover:border-[#88afc1] hover:bg-[#f8fcfd]"
              >
                <LockKeyhole size={15} />
                {t.necessary}
              </button>
              <button
                type="button"
                onClick={() => setSettingsOpen((open) => !open)}
                aria-expanded={settingsOpen}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold text-[#315f74] transition hover:bg-white/70"
              >
                <Settings2 size={16} />
                {settingsOpen ? t.hide : t.customize}
              </button>
            </div>
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
