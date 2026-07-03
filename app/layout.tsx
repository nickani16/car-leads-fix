import type { Metadata, Viewport } from 'next'
import { DM_Sans } from 'next/font/google'
import CookieConsent from './components/CookieConsent'
import './globals.css'

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
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
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden">
        {children}
        <CookieConsent />
      </body>
    </html>
  )
}
