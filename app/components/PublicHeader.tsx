'use client'

import Link from 'next/link'
import {
  ArrowRight,
  Building2,
  ChevronDown,
  Headphones,
  LogIn,
  Menu,
  ShieldCheck,
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
            ['/foretag', 'Unternehmen'],
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
              ['/foretag', 'Business'],
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
              ['/foretag', 'Företag'],
              ['/vanliga-fragor', 'Vanliga frågor'],
              ['/kontakt', 'Kontakt'],
            ],
            partner: 'Bli bilhandlare',
            login: 'Logga in',
            cta: 'Värdera din bil',
            ctaHref: '/salj-bil',
          }

  return (
    <>
      <div
        className={`h-[104px] ${
          transparentAtTop ? 'md:hidden' : 'md:h-[124px]'
        }`}
        aria-hidden="true"
      />
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
              ? 'border-b border-[#deddd8]/80 bg-white shadow-[0_8px_30px_rgba(32,33,36,.06)] lg:border-transparent lg:bg-transparent lg:shadow-none'
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

            <nav className="absolute left-1/2 hidden w-max -translate-x-1/2 items-center whitespace-nowrap rounded-full border border-white/70 bg-white/72 p-1.5 shadow-[0_12px_35px_rgba(32,33,36,.08)] backdrop-blur-xl xl:flex">
              {content.links.slice(0, 2).map(([href, label], index) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[13px] font-normal text-[#303030] transition hover:bg-[#f1f5f6] hover:text-[#111111] 2xl:px-5"
                >
                  <span className="text-[9px] font-medium tracking-[0.12em] text-[#8d989d] transition group-hover:text-[#54788d]">
                    0{index + 1}
                  </span>
                  {label}
                </Link>
              ))}

              <Link
                href={content.links[2][0]}
                className="group flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[13px] font-normal text-[#303030] transition hover:bg-[#f1f5f6] hover:text-[#111111] 2xl:px-5"
              >
                <span className="text-[9px] font-medium tracking-[0.12em] text-[#8d989d] transition group-hover:text-[#54788d]">
                  03
                </span>
                {content.links[2][1]}
              </Link>

              <div className="group relative">
                <button
                  type="button"
                  className="flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[13px] font-normal text-[#303030] transition hover:bg-[#f1f5f6] group-focus-within:bg-[#f1f5f6] 2xl:px-5"
                >
                  <span className="text-[9px] font-medium tracking-[0.12em] text-[#8d989d]">
                    04
                  </span>
                  {content.dealerLabel}
                  <ChevronDown className="h-3.5 w-3.5 transition duration-200 group-hover:rotate-180 group-focus-within:rotate-180" />
                </button>

                <div className="pointer-events-none absolute left-1/2 top-full w-[620px] -translate-x-1/2 translate-y-2 pt-[18px] opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
                  <div className="overflow-hidden rounded-[22px] border border-[#dfe5e8] bg-white shadow-[0_30px_80px_rgba(32,33,36,.16)]">
                    <div className="grid grid-cols-[1.05fr_.95fr]">
                      <div className="bg-[#eef6fa] p-7">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#B4D9EF] text-[#242424]">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.18em] text-[#68808e]">
                          Autorell Dealer Network
                        </p>
                        <h3 className="mt-2 max-w-[260px] text-[25px] leading-[1.08] tracking-[-0.035em] text-[#202124]">
                          Better vehicles. Clearer decisions.
                        </h3>
                        <p className="mt-3 max-w-[290px] text-sm leading-6 text-[#5c707b]">
                          Verified vehicle profiles and efficient European
                          bidding for professional buyers.
                        </p>
                        <Link
                          href="/dealer-apply"
                          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#202124]"
                        >
                          {content.partner}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>

                      <div className="p-5">
                        <Link
                          href="/login"
                          className="group/item flex items-center gap-4 rounded-[14px] p-4 transition hover:bg-[#f5f6f4]"
                        >
                          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dce1e3] text-[#4e626c]">
                            <LogIn className="h-4.5 w-4.5" />
                          </span>
                          <span>
                            <strong className="block text-sm font-medium text-[#202124]">
                              {content.login}
                            </strong>
                            <span className="mt-1 block text-xs text-[#78858b]">
                              Access auctions and your account
                            </span>
                          </span>
                        </Link>
                        <Link
                          href="/dealer/legal"
                          className="group/item flex items-center gap-4 rounded-[14px] p-4 transition hover:bg-[#f5f6f4]"
                        >
                          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dce1e3] text-[#4e626c]">
                            <ShieldCheck className="h-4.5 w-4.5" />
                          </span>
                          <span>
                            <strong className="block text-sm font-medium text-[#202124]">
                              Dealer terms
                            </strong>
                            <span className="mt-1 block text-xs text-[#78858b]">
                              Bidding, fees and platform rules
                            </span>
                          </span>
                        </Link>
                        <Link
                          href="/kontakt"
                          className="group/item flex items-center gap-4 rounded-[14px] p-4 transition hover:bg-[#f5f6f4]"
                        >
                          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dce1e3] text-[#4e626c]">
                            <Headphones className="h-4.5 w-4.5" />
                          </span>
                          <span>
                            <strong className="block text-sm font-medium text-[#202124]">
                              Personal support
                            </strong>
                            <span className="mt-1 block text-xs text-[#78858b]">
                              Speak with the Autorell team
                            </span>
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Link
                href={content.links[3][0]}
                className="flex min-h-10 shrink-0 items-center rounded-full px-4 text-[13px] font-normal text-[#303030] transition hover:bg-[#f1f5f6] hover:text-[#111111] 2xl:px-5"
              >
                {content.links[3][1]}
              </Link>
            </nav>

            <div className="hidden items-center gap-3 xl:flex">
              <Link
                href={content.ctaHref}
                className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#242424] pl-6 pr-2 text-sm font-normal text-white shadow-[0_12px_28px_rgba(32,33,36,.18)] transition hover:-translate-y-0.5 hover:bg-[#111111]"
              >
                {content.cta}
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#B4D9EF] text-[#242424] transition group-hover:translate-x-0.5">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? 'Stäng meny' : 'Öppna meny'}
              aria-expanded={open}
              className={`flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition xl:hidden ${
                open
                  ? 'border-[#242424] bg-[#242424] text-white'
                  : 'border-[#deddd8] bg-[#f8f7f3] text-[#242424]'
              }`}
            >
              <span>{content.menuLabel}</span>
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </header>

        <div
          className={`absolute inset-x-0 top-full h-[calc(100dvh-104px)] overflow-y-auto border-t border-[#deddd8] bg-[#f6f4ef] shadow-[0_24px_60px_rgba(32,33,36,.14)] transition duration-300 md:h-[calc(100dvh-124px)] xl:hidden ${
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
