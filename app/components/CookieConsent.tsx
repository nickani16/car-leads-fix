'use client'

import Link from 'next/link'
import { Cookie, Settings2, X } from 'lucide-react'
import { useEffect, useState, useSyncExternalStore } from 'react'

const CONSENT_COOKIE = 'autorell_cookie_consent'
const CONSENT_MAX_AGE = 60 * 60 * 24 * 180

type ConsentChoice = 'necessary' | 'all'
type CookieLocale = 'sv' | 'de' | 'en'

const cookieCopy = {
  sv: {
    close: 'Stäng cookieinställningar',
    title: 'Dina cookieinställningar',
    text: 'Vi använder nödvändiga cookies för säkerhet, inloggning och webbplatsens funktioner. Med ditt val kan vi även tillåta framtida anonym statistik. Vi använder inte marknadsföringscookies idag.',
    necessaryTitle: 'Nödvändiga cookies',
    necessaryText: 'Krävs för säkerhet, formulär och inloggning. Kan inte stängas av.',
    analyticsTitle: 'Analyscookies',
    analyticsText: 'Används endast efter godkännande om Autorell inför anonym webbstatistik.',
    policyStart: 'Läs mer i vår',
    policy: 'cookiepolicy',
    policyEnd: 'Du kan ändra ditt val när som helst via footern.',
    accept: 'Acceptera alla',
    necessary: 'Endast nödvändiga',
    hide: 'Dölj inställningar',
    customize: 'Anpassa',
  },
  de: {
    close: 'Cookie-Einstellungen schließen',
    title: 'Ihre Cookie-Einstellungen',
    text: 'Wir verwenden notwendige Cookies für Sicherheit, Anmeldung und Website-Funktionen. Mit Ihrer Auswahl können Sie außerdem zukünftige anonyme Statistiken erlauben. Marketing-Cookies verwenden wir derzeit nicht.',
    necessaryTitle: 'Notwendige Cookies',
    necessaryText: 'Für Sicherheit, Formulare und Anmeldung erforderlich. Sie können nicht deaktiviert werden.',
    analyticsTitle: 'Analyse-Cookies',
    analyticsText: 'Werden nur nach Zustimmung verwendet, falls Autorell anonyme Webstatistiken einführt.',
    policyStart: 'Mehr erfahren Sie in unserer',
    policy: 'Cookie-Richtlinie',
    policyEnd: 'Sie können Ihre Auswahl jederzeit im Footer ändern.',
    accept: 'Alle akzeptieren',
    necessary: 'Nur notwendige',
    hide: 'Einstellungen ausblenden',
    customize: 'Anpassen',
  },
  en: {
    close: 'Close cookie settings',
    title: 'Your cookie settings',
    text: 'We use essential cookies for security, sign-in and website functionality. You may also allow future anonymous analytics. We do not currently use marketing cookies.',
    necessaryTitle: 'Essential cookies',
    necessaryText: 'Required for security, forms and sign-in. These cannot be disabled.',
    analyticsTitle: 'Analytics cookies',
    analyticsText: 'Used only with consent if Autorell introduces anonymous website analytics.',
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
    <div className="fixed inset-x-0 bottom-0 z-[200] p-3 sm:p-5">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-title"
        className="mx-auto w-full max-w-[1180px] overflow-hidden rounded-[22px] border border-[#d7d7d1] bg-white shadow-[0_30px_100px_rgba(32,33,36,.22)]"
      >
        <div className="grid min-w-0 gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="min-w-0 max-w-3xl">
            <div className="flex items-start justify-between gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-[#B4D9EF] text-[#242424]">
                <Cookie size={20} />
              </span>
              {readConsent() && (
                <button
                  type="button"
                  onClick={() => {
                    setVisible(false)
                    setSettingsOpen(false)
                  }}
                  className="grid h-10 w-10 place-items-center rounded-full border border-[#deddd7] text-[#62686c] lg:hidden"
                  aria-label={t.close}
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <h2
              id="cookie-title"
              className="mt-5 text-2xl tracking-[-0.03em] text-[#242424]"
            >
              {t.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#62686c]">
              {t.text}
            </p>

            {settingsOpen && (
              <div className="mt-5 grid gap-3">
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
                <p className="text-xs leading-5 text-[#7b8184]">
                  {t.policyStart}{' '}
                  <Link href="/cookies" className="underline underline-offset-2">
                    {t.policy}
                  </Link>
                  . {t.policyEnd}
                </p>
              </div>
            )}
          </div>

          <div className="flex min-w-0 w-full flex-col gap-2.5 sm:flex-row lg:w-[470px] lg:flex-wrap lg:justify-end">
            <button
              type="button"
              onClick={() => choose('all')}
              className="min-h-12 rounded-full bg-[#242424] px-6 text-sm text-white transition hover:bg-[#111111]"
            >
              {t.accept}
            </button>
            <button
              type="button"
              onClick={() => choose('necessary')}
              className="min-h-12 rounded-full border border-[#cfcfca] bg-white px-6 text-sm text-[#242424] transition hover:border-[#242424]"
            >
              {t.necessary}
            </button>
            <button
              type="button"
              onClick={() => setSettingsOpen((open) => !open)}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#eff8fd] px-6 text-sm text-[#242424]"
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
    <div className="flex items-center justify-between gap-5 rounded-[14px] border border-[#e1e1dc] bg-[#faf9f6] px-4 py-3">
      <div>
        <p className="text-sm font-medium text-[#242424]">{title}</p>
        <p className="mt-1 text-xs leading-5 text-[#73797c]">{description}</p>
      </div>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full ${
          active ? 'bg-[#242424]' : 'bg-[#d4d5d2]'
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
