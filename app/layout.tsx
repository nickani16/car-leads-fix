import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import CookieConsent from './components/CookieConsent'
import './globals.css'

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Autorell',
    template: '%s | Autorell',
  },
  description:
    'Autorell connects vehicle sellers with a verified European dealer network.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="sv" className={`${dmSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {children}
        <CookieConsent />
      </body>
    </html>
  )
}
