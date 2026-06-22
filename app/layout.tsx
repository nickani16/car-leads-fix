import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import { headers } from 'next/headers'
import CookieConsent from './components/CookieConsent'
import './globals.css'

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.autorell.se'),
  title: {
    default: 'Autorell',
    template: '%s | Autorell',
  },
  description:
    'Autorell connects vehicle sellers with a verified European dealer network.',
  applicationName: 'Autorell',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/favicon-48.png?v=5', sizes: '48x48', type: 'image/png' },
      { url: '/icon-192.png?v=5', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png?v=5', sizes: '180x180', type: 'image/png' }],
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
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const requestHeaders = await headers()
  const hostname = (
    requestHeaders.get('host') ||
    requestHeaders.get('x-forwarded-host') ||
    ''
  )
    .split(',')[0]
    .trim()
    .split(':')[0]
    .toLowerCase()
  const requestedLanguage = requestHeaders.get('x-autorell-language')
  const requestedMarket = requestHeaders.get('x-autorell-market') || undefined
  const marketLanguage = hostname.endsWith('autorell.de')
    ? 'de'
    : hostname.endsWith('autorell.com')
      ? 'en'
      : 'sv'
  const documentLanguage = requestedLanguage || marketLanguage

  return (
    <html
      lang={documentLanguage}
      className={`${dmSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden">
        {children}
        <CookieConsent
          initialLocale={
            (requestedLanguage || marketLanguage) as Parameters<
              typeof CookieConsent
            >[0]['initialLocale']
          }
          initialMarketCode={requestedMarket}
        />
      </body>
    </html>
  )
}
