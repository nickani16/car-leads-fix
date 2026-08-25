import type { Metadata, Viewport } from 'next'
import { headers } from 'next/headers'
import { Geist } from 'next/font/google'
import CookieConsent from './components/CookieConsent'
import ConsentManagedTelemetry from './components/ConsentManagedTelemetry'
import PwaRegistration from './components/PwaRegistration'
import './globals.css'

const geist = Geist({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0866ff',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://www.autorell.com'),
  title: {
    default: 'Autorell',
    template: '%s | Autorell',
  },
  description:
    'Autorell is a European marketplace where private sellers and businesses can list and find vehicles across the EU.',
  applicationName: 'Autorell',
  manifest: '/manifest.webmanifest',
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico?v=8', sizes: 'any' },
      { url: '/favicon.svg?v=8', sizes: 'any', type: 'image/svg+xml' },
      { url: '/favicon-16.png?v=8', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32.png?v=8', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48.png?v=8', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-96.png?v=8', sizes: '96x96', type: 'image/png' },
      { url: '/icon-192.png?v=8', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png?v=8', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: ['/favicon.ico?v=8'],
    apple: [{ url: '/apple-touch-icon.png?v=8', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    title: 'Autorell',
    statusBarStyle: 'default',
  },
  openGraph: {
    siteName: 'Autorell',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  verification: buildSiteVerification(),
}

function buildSiteVerification(): Metadata['verification'] {
  const google = process.env.GOOGLE_SITE_VERIFICATION?.trim()
  const bing = process.env.BING_SITE_VERIFICATION?.trim()
  if (!google && !bing) return undefined

  return {
    google: google || undefined,
    other: bing ? { 'msvalidate.01': bing } : undefined,
  }
}

async function getDocumentLanguage() {
  const requestHeaders = await headers()
  const market = requestHeaders.get('x-autorell-market')?.toUpperCase()
  const language = requestHeaders.get('x-autorell-language')?.toLowerCase()
  const marketLanguages: Record<string, string> = {
    SE: 'sv-SE',
    DE: 'de-DE',
    AT: 'de-AT',
    BE: 'nl-BE',
    FR: 'fr-FR',
    ES: 'es-ES',
    IT: 'it-IT',
    PL: 'pl-PL',
    NL: 'nl-NL',
    FI: 'fi-FI',
    DK: 'da-DK',
  }
  const languageFallbacks: Record<string, string> = {
    sv: 'sv-SE',
    de: 'de-DE',
    fr: 'fr-FR',
    es: 'es-ES',
    it: 'it-IT',
    pl: 'pl-PL',
    nl: 'nl-NL',
    fi: 'fi-FI',
    da: 'da-DK',
    en: 'en',
  }

  return (market && marketLanguages[market]) || (language && languageFallbacks[language]) || 'en'
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const documentLanguage = await getDocumentLanguage()

  return (
    <html
      lang={documentLanguage}
      className={`${geist.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden">
        {children}
        <PwaRegistration />
        <CookieConsent />
        <ConsentManagedTelemetry />
      </body>
    </html>
  )
}
