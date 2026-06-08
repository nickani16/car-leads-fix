'use client'

import Link from 'next/link'
import { ChevronDown, Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import BrandLogo from './BrandLogo'

type PublicHeaderProps = {
  transparentAtTop?: boolean
  locale?: 'sv' | 'de' | 'en'
}

export default function PublicHeader({
  transparentAtTop = false,
  locale = 'sv',
}: PublicHeaderProps) {
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(true)
  const [atTop, setAtTop] = useState(true)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const difference = currentScrollY - lastScrollY.current
      setAtTop(currentScrollY < 24)

      if (currentScrollY < 80) {
        setVisible(true)
      } else if (difference > 7) {
        setVisible(false)
        setOpen(false)
      } else if (difference < -4) {
        setVisible(true)
      }

      lastScrollY.current = currentScrollY
    }

    lastScrollY.current = window.scrollY
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const transparent = transparentAtTop && atTop
  const language =
    locale === 'de'
      ? { label: 'Deutsch', flag: '🇩🇪' }
      : locale === 'en'
        ? { label: 'English', flag: '🇪🇺' }
        : { label: 'Svenska', flag: '🇸🇪' }
  const content =
    locale === 'de'
      ? {
          message: 'Sicherer und einfacher Fahrzeugverkauf in ganz Europa',
          links: [
            ['/de', 'Auto verkaufen'],
            ['/#sa-fungerar-det', 'So funktioniert es'],
            ['/vanliga-fragor', 'Häufige Fragen'],
            ['/dealer-apply', 'Für Händler'],
            ['/kontakt', 'Kontakt'],
          ],
          login: 'Anmelden',
          cta: 'Auto bewerten',
          ctaHref: '/de',
        }
      : locale === 'en'
        ? {
            message: 'Safe and simple vehicle sales across Europe',
            links: [
              ['/eu', 'Sell your car'],
              ['/#sa-fungerar-det', 'How it works'],
              ['/vanliga-fragor', 'FAQ'],
              ['/dealer-apply', 'For dealers'],
              ['/kontakt', 'Contact'],
            ],
            login: 'Log in',
            cta: 'Value your car',
            ctaHref: '/eu',
          }
        : {
            message: 'Trygg och enkel fordonsförsäljning i hela Europa',
            links: [
              ['/salj-bil', 'Sälj bil'],
              ['/#sa-fungerar-det', 'Så fungerar det'],
              ['/vanliga-fragor', 'Vanliga frågor'],
              ['/dealer-apply', 'För bilhandlare'],
              ['/kontakt', 'Kontakt'],
            ],
            login: 'Logga in',
            cta: 'Värdera din bil',
            ctaHref: '/salj-bil',
          }

  return (
    <>
      {!transparentAtTop && <div className="h-[88px] md:h-[124px]" aria-hidden="true" />}
      <div
        className={`fixed inset-x-0 top-0 z-[100] transition-transform duration-300 ease-out ${
          visible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="hidden h-9 bg-[#B4D9EF] text-[#242424] md:block">
          <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-8 text-xs lg:px-12 xl:px-16">
            <span>{content.message}</span>
            <div className="flex items-center gap-6">
              <Link href="/dealer-apply" className="hover:underline">Bli partner</Link>
              <Link href="/login" className="hover:underline">Dealer login</Link>
              <button type="button" className="flex items-center gap-2">
                <span className="text-sm leading-none" aria-hidden="true">{language.flag}</span>
                <span>{language.label}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        <header
          className={`relative transition-[background-color,border-color,box-shadow] duration-300 ${
            transparent
              ? 'border-b border-transparent bg-transparent shadow-none'
              : 'border-b border-[#deddd8]/80 bg-white/95 shadow-[0_8px_30px_rgba(32,33,36,.06)] backdrop-blur-xl'
          }`}
        >
          <div className="mx-auto flex h-[88px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12 xl:px-16">
            <Link
              href="/"
              aria-label="Autorell startsida"
              className="inline-flex shrink-0 items-center"
            >
              <BrandLogo />
            </Link>

            <nav className="hidden items-center gap-7 lg:flex xl:gap-9">
              {content.links.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="relative py-3 text-sm font-normal text-[#303030] transition after:absolute after:inset-x-0 after:bottom-1 after:h-0.5 after:origin-left after:scale-x-0 after:bg-[#B4D9EF] after:transition-transform hover:text-[#111111] hover:after:scale-x-100"
                >
                  {label}
                </Link>
              ))}
            </nav>

            <div className="hidden items-center gap-3 lg:flex">
              <Link href="/login" className="px-3 py-3 text-sm font-normal text-[#242424]">
                {content.login}
              </Link>
              <Link
                href={content.ctaHref}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#B4D9EF] px-6 text-sm font-normal text-[#242424] shadow-[0_8px_22px_rgba(94,154,190,.2)] transition hover:-translate-y-0.5 hover:bg-[#C9E6F6]"
              >
                {content.cta}
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? 'Stäng meny' : 'Öppna meny'}
              aria-expanded={open}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#deddd8] bg-[#f8f7f3] text-[#242424] lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {open && (
            <div className="absolute left-0 right-0 top-full border-t border-[#dfe6ed] bg-white px-5 pb-6 pt-3 shadow-xl lg:hidden">
              <nav className="mx-auto flex max-w-[1440px] flex-col">
                {content.links.map(([href, label]) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className="border-b border-[#ebeae6] py-4 font-normal text-[#303030]"
                  >
                    {label}
                  </Link>
                ))}
                <Link
                  href={content.ctaHref}
                  onClick={() => setOpen(false)}
                  className="mt-5 flex min-h-12 items-center justify-center rounded-full bg-[#B4D9EF] px-6 font-normal text-[#242424]"
                >
                  {content.cta}
                </Link>
              </nav>
            </div>
          )}
        </header>
      </div>
    </>
  )
}
