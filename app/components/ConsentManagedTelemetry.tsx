'use client'

import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { useEffect, useState } from 'react'

const CONSENT_COOKIE = 'autorell_cookie_consent'
const ADSENSE_SCRIPT_ID = 'autorell-adsense'

type ConsentChoice = 'necessary' | 'analytics' | 'advertising' | 'all'

function readConsent(): ConsentChoice | undefined {
  return document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${CONSENT_COOKIE}=`))
    ?.split('=')[1] as ConsentChoice | undefined
}

export default function ConsentManagedTelemetry() {
  const [consent, setConsent] = useState<ConsentChoice>('necessary')

  useEffect(() => {
    const syncConsent = () => setConsent(readConsent() || 'necessary')
    const handleConsent = (event: Event) => {
      const choice = (event as CustomEvent<{ choice?: ConsentChoice }>).detail?.choice
      setConsent(choice || 'necessary')
    }

    syncConsent()
    window.addEventListener('autorell-cookie-consent-changed', handleConsent)
    return () => window.removeEventListener('autorell-cookie-consent-changed', handleConsent)
  }, [])

  const analyticsConsent = consent === 'analytics' || consent === 'all'
  const advertisingConsent = consent === 'advertising' || consent === 'all'

  useEffect(() => {
    if (!advertisingConsent || document.getElementById(ADSENSE_SCRIPT_ID)) return

    const script = document.createElement('script')
    script.id = ADSENSE_SCRIPT_ID
    script.async = true
    script.crossOrigin = 'anonymous'
    script.src =
      'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9346574351719564'
    document.head.appendChild(script)
  }, [advertisingConsent])

  if (!analyticsConsent) return null

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  )
}
