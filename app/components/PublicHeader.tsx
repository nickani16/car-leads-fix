'use client'

import Link from 'next/link'
import {
  ArrowRight,
  ChevronDown,
  LogIn,
  Menu,
  Store,
  X,
} from 'lucide-react'
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

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const transparent = transparentAtTop && atTop && !open
  const language =
    locale === 'de'
      ? { label: 'Deutsch', flag: '🇩🇪' }
      : locale === 'en'
        ? { label: 'English', flag: '🇪🇺' }
        : { label: 'Svenska', flag: '🇸🇪' }
  const content =
    locale === 'de'
      ? {
          message: 'Sicherer Fahrzeugverkauf in ganz Europa',
          menuLabel: 'Navigation',
          privateLabel: 'Für Fahrzeughalter',
          dealerLabel: 'Für Händler',
          links: [
            ['/de', 'Auto verkaufen'],
            ['/#sa-fungerar-det', 'So funktioniert es'],
            ['/vanliga-fragor', 'Häufige Fragen'],
            ['/kontakt', 'Kontakt'],
          ],
          partner: 'Händler werden',
          login: 'Händler-Login',
          cta: 'Auto bewerten',
          ctaHref: '/de',
        }
      : locale === 'en'
        ? {
            message: 'Safe vehicle sales across Europe',
            menuLabel: 'Navigation',
            privateLabel: 'For vehicle owners',
            dealerLabel: 'For dealers',
            links: [
              ['/eu', 'Sell your car'],
              ['/#sa-fungerar-det', 'How it works'],
              ['/vanliga-fragor', 'FAQ'],
              ['/kontakt', 'Contact'],
            ],
            partner: 'Become a dealer',
            login: 'Dealer login',
            cta: 'Value your car',
            ctaHref: '/eu',
          }
        : {
            message: 'Trygg bilförsäljning i hela Europa',
            menuLabel: 'Meny',
            privateLabel: 'För dig som säljer bil',
            dealerLabel: 'För bilhandlare',
            links: [
              ['/salj-bil', 'Sälj din bil'],
              ['/#sa-fungerar-det', 'Så fungerar det'],
              ['/vanliga-fragor', 'Vanliga frågor'],
              ['/kontakt', 'Kontakt'],
            ],
            partner: 'Bli bilhandlare',
            login: 'Dealer login',
            cta: 'Värdera din bil',
            ctaHref: '/salj-bil',
          }

  return (
    <>
      {!transparentAtTop && (
        <div className="h-[104px] md:h-[124px]" aria-hidden="true" />
      )}
      <div
        className={`fixed inset-x-0 top-0 z-[100] transition-transform duration-300 ease-out ${
          visible || open ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="h-8 bg-[#B4D9EF] text-[#242424] md:h-9">
          <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-5 text-[10px] font-medium tracking-[0.02em] sm:px-8 md:text-xs lg:px-12 xl:px-16">
            <span>{content.message}</span>
            <div className="hidden items-center gap-6 md:flex">
              <Link href="/dealer-apply" className="hover:underline">
                {content.partner}
              </Link>
              <Link href="/login" className="hover:underline">
                {content.login}
              </Link>
              <button type="button" className="flex items-center gap-2">
                <span className="text-sm leading-none" aria-hidden="true">
                  {language.flag}
                </span>
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
          <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 md:h-[88px] lg:px-12 xl:px-16">
            <Link
              href="/"
              aria-label="Autorell startsida"
              className="inline-flex shrink-0 items-center"
              onClick={() => setOpen(false)}
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
              <Link
                href="/dealer-apply"
                className="relative py-3 text-sm font-normal text-[#303030] transition after:absolute after:inset-x-0 after:bottom-1 after:h-0.5 after:origin-left after:scale-x-0 after:bg-[#B4D9EF] after:transition-transform hover:text-[#111111] hover:after:scale-x-100"
              >
                {content.partner}
              </Link>
            </nav>

            <div className="hidden items-center gap-3 lg:flex">
              <Link
                href="/login"
                className="px-3 py-3 text-sm font-normal text-[#242424]"
              >
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
              className={`flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition lg:hidden ${
                open
                  ? 'border-[#242424] bg-[#242424] text-white'
                  : transparent
                    ? 'border-white/55 bg-white/75 text-[#242424] backdrop-blur-md'
                    : 'border-[#deddd8] bg-[#f8f7f3] text-[#242424]'
              }`}
            >
              <span>{content.menuLabel}</span>
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </header>

        <div
          className={`fixed inset-x-0 bottom-0 top-[104px] overflow-y-auto bg-[#f6f4ef] transition duration-300 md:top-[124px] lg:hidden ${
            open
              ? 'pointer-events-auto translate-y-0 opacity-100'
              : 'pointer-events-none -translate-y-3 opacity-0'
          }`}
        >
          <div className="mx-auto flex min-h-full max-w-2xl flex-col px-5 py-7 sm:px-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7a8082]">
              {content.privateLabel}
            </p>
            <nav className="mt-3">
              {content.links.map(([href, label], index) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="group flex items-center justify-between border-b border-[#dcdad3] py-4 text-[22px] font-medium tracking-[-0.025em] text-[#202124]"
                >
                  <span>
                    <span className="mr-3 text-xs font-medium text-[#9a9d9d]">
                      0{index + 1}
                    </span>
                    {label}
                  </span>
                  <ArrowRight className="h-5 w-5 text-[#71818b] transition group-hover:translate-x-1" />
                </Link>
              ))}
            </nav>

            <Link
              href={content.ctaHref}
              onClick={() => setOpen(false)}
              className="mt-6 flex min-h-14 items-center justify-between rounded-[14px] bg-[#B4D9EF] px-5 text-base font-medium text-[#242424]"
            >
              {content.cta}
              <ArrowRight className="h-5 w-5" />
            </Link>

            <div className="mt-9 rounded-[18px] border border-[#dddcd6] bg-white p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7a8082]">
                {content.dealerLabel}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Link
                  href="/dealer-apply"
                  onClick={() => setOpen(false)}
                  className="flex min-h-12 items-center gap-3 rounded-[12px] border border-[#dcdad3] px-4 text-sm text-[#242424]"
                >
                  <Store size={17} />
                  {content.partner}
                </Link>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex min-h-12 items-center gap-3 rounded-[12px] bg-[#242424] px-4 text-sm text-white"
                >
                  <LogIn size={17} />
                  {content.login}
                </Link>
              </div>
            </div>

            <div className="mt-auto flex items-center justify-between border-t border-[#dcdad3] pt-6 text-sm text-[#62686c]">
              <span className="flex items-center gap-2">
                <span aria-hidden="true">{language.flag}</span>
                {language.label}
              </span>
              <span>Autorell Europe</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
