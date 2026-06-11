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
    requestHeaders.get('x-forwarded-host') ||
    requestHeaders.get('host') ||
    ''
  )
    .split(':')[0]
    .toLowerCase()
  const language = hostname.endsWith('autorell.de')
    ? 'de'
    : hostname.endsWith('autorell.com')
      ? 'en'
      : 'sv'

  return (
    <html lang={language} className={`${dmSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {children}
        <CookieConsent initialLocale={language} />
      </body>
    </html>
  )
}
