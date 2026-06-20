'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import BrandLogo from './BrandLogo'
import SocialIcons from './SocialIcons'
import {
  localizePublicHref,
  translatePublicObject,
  type PublicLocale,
} from '@/lib/public-i18n'

const footerCopy = {
  sv: {
    description: 'En enklare och tryggare väg mellan svenska bilägare och professionella köpare i Europa.',
    question: 'Har du en bil som passar vårt exportnätverk?',
    cta: 'Sälj din bil',
    statement: 'Utvalda svenska bilar. Professionella köpare i Europa.',
    sellerTitle: 'Sälja bil',
    sellerLinks: [
      ['Hitta bilar', '/hitta-bilar'],
      ['Sälj din bil', '/salj-bil'],
      ['Hur det fungerar', '/#sa-fungerar-det'],
      ['Trygg affär', '/trygg-affar'],
    ] as [string, string][],
    businessTitle: 'Företag',
    businessLinks: [
      ['Företagslösningar', '/foretag'],
      ['Skicka in företagsfordon', '/salj-lagerbil'],
      ['Varför välja Autorell', '/foretag#process'],
      ['Starta ett pilotflöde', '/foretag#foretagskontakt'],
      ['Om Autorell', '/om-oss'],
    ] as [string, string][],
    dealerTitle: 'Handlare',
    dealerLinks: [
      ['För bilhandlare', '/for-handlare'],
      ['Ansök som handlare', '/bli-bilhandlare'],
      ['Handlarvillkor', '/handlarvillkor'],
      ['Logga in', '/login'],
    ] as [string, string][],
    contact: 'Kontakt',
    support: 'Personlig support för svenska säljare och europeiska handlare.',
    contactLink: 'Kontakta oss',
    privacy: 'Integritetspolicy',
    cookies: 'Cookies',
    terms: 'Användarvillkor',
    cookieSettings: 'Cookieinställningar',
  },
  de: {
    description: 'Der digitale B2B-Fahrzeugmarkt für verifizierte Autohändler in Deutschland und Europa.',
    question: 'Möchten Sie neue europäische Beschaffungsmärkte erschließen?',
    cta: 'Händlerzugang beantragen',
    statement: 'Fahrzeuge handeln. Europa verbinden.',
    sellerTitle: 'Fahrzeuge & Einkauf',
    sellerLinks: [
      ['Fahrzeuge finden', '/fahrzeuge-finden'],
      ['Fahrzeugbestand verkaufen', '/fahrzeugbestand-verkaufen'],
      ['So funktioniert der Einkauf', '/so-funktionierts'],
      ['Vorteile für Händler', '/vorteile'],
      ['Häufige Fragen', '/faq'],
    ] as [string, string][],
    businessTitle: 'Autorell',
    businessLinks: [
      ['Über Autorell', '/ueber-autorell'],
      ['Kontakt', '/kontakt'],
      ['Datenschutz', '/datenschutz'],
      ['Cookies', '/cookies'],
    ] as [string, string][],
    dealerTitle: 'Dealer Network',
    dealerLinks: [
      ['Händlerstandorte', '/haendler'],
      ['Händler werden', '/haendlerzugang'],
      ['Händlerbedingungen', '/haendlerbedingungen'],
      ['Händler-Login', '/login'],
    ] as [string, string][],
    contact: 'Kontakt',
    support: 'Persönlicher Support für professionelle europäische Käufer.',
    contactLink: 'Kontakt aufnehmen',
    privacy: 'Datenschutz',
    cookies: 'Cookies',
    terms: 'Nutzungsbedingungen',
    cookieSettings: 'Cookie-Einstellungen',
  },
  en: {
    description: 'Focused access to selected Swedish vehicles for professional European buyers.',
    question: 'Looking to source Swedish vehicles for your inventory?',
    cta: 'Apply for dealer access',
    statement: 'Selected Swedish supply. Built for professional European dealers.',
    sellerTitle: 'Vehicles & buying',
    sellerLinks: [
      ['Find cars', '/find-cars'],
      ['Sell business vehicles', '/sell-stock'],
      ['How buying works', '/how-it-works'],
      ['Dealer benefits', '/dealer-benefits'],
      ['Frequently asked questions', '/faq'],
    ] as [string, string][],
    businessTitle: 'Autorell',
    businessLinks: [
      ['About Autorell', '/about'],
      ['Contact', '/contact'],
      ['Privacy policy', '/privacy'],
      ['Cookies', '/cookies'],
    ] as [string, string][],
    dealerTitle: 'Dealer Network',
    dealerLinks: [
      ['Dealer markets', '/dealers'],
      ['Become a partner', '/dealer-apply'],
      ['Dealer terms', '/dealer-terms'],
      ['Dealer login', '/login'],
    ] as [string, string][],
    contact: 'Contact',
    support: 'Personal support for professional European buyers.',
    contactLink: 'Contact us',
    privacy: 'Privacy policy',
    cookies: 'Cookies',
    terms: 'Terms of use',
    cookieSettings: 'Cookie settings',
  },
} as const

export default function PublicFooter({
  locale = 'sv',
}: {
  locale?: PublicLocale
}) {
  const t =
    locale === 'sv'
      ? footerCopy.sv
      : locale === 'de'
        ? footerCopy.de
        : translatePublicObject(locale, footerCopy.en)
  const homeHref =
    locale === 'de'
      ? 'https://www.autorell.de/'
      : locale !== 'sv'
        ? `https://www.autorell.com/${locale}`
        : 'https://www.autorell.se/'
  const contactHref = localizePublicHref(
    locale,
    locale === 'sv' || locale === 'de' ? '/kontakt' : '/contact',
  )
  const homeLabel =
    locale === 'de'
      ? 'Autorell Startseite'
      : locale !== 'sv'
        ? 'Autorell home'
        : 'Autorell startsida'
  const privacyHref = localizePublicHref(
    locale,
    locale === 'de' ? '/datenschutz' : locale === 'sv' ? '/integritet' : '/privacy',
  )
  const termsHref =
    locale === 'de'
      ? '/nutzungsbedingungen'
      : locale !== 'sv'
        ? localizePublicHref(locale, '/terms')
        : '/villkor'

  return (
    <footer className="relative overflow-hidden bg-[#f3f2ee] text-[#202124]">
      <div
        className="pointer-events-none absolute -bottom-20 -right-16 h-[210px] w-[210px] rounded-full border-[24px] border-[#B4D9EF]/50 sm:-bottom-24 sm:-right-20 sm:h-[270px] sm:w-[270px] sm:border-[30px]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-16">
        <div className="flex flex-col gap-10 border-b border-[#d9d7d0] py-14 lg:flex-row lg:items-center lg:justify-between lg:py-16">
          <div>
            <a href={homeHref} aria-label={homeLabel}>
              <BrandLogo />
            </a>
            <p className="mt-5 max-w-lg text-[15px] leading-7 text-[#666864]">
              {t.description}
            </p>
          </div>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <p className="max-w-xs text-sm leading-6 text-[#666864]">
              {t.question}
            </p>
            <Link
              href={
                locale === 'sv'
                  ? '/salj-bil'
                  : locale === 'de'
                    ? '/haendlerzugang'
                    : '/dealer-apply'
              }
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#242424] px-6 text-sm font-normal text-white transition hover:bg-[#111111]"
            >
              {t.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[1.15fr_.72fr_.72fr_.72fr_.9fr] lg:gap-10">
          <p className="max-w-sm text-2xl leading-9 tracking-[-0.025em] text-[#2b2b2a]">
            {t.statement}
          </p>

          <FooterColumn
            title={t.sellerTitle}
            links={t.sellerLinks.map(([label, href]) => [
              label,
              localizePublicHref(locale, href),
            ])}
          />
          <FooterColumn
            title={t.businessTitle}
            links={t.businessLinks.map(([label, href]) => [
              label,
              localizePublicHref(locale, href),
            ])}
          />
          <FooterColumn
            title={t.dealerTitle}
            links={t.dealerLinks.map(([label, href]) => [
              label,
              localizePublicHref(locale, href),
            ])}
          />

          <div>
            <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-[#898a85]">
              {t.contact}
            </h3>
            <div className="mt-6 flex flex-col gap-4 text-sm">
              <a href="mailto:info@autorell.com" className="transition hover:opacity-55">
                info@autorell.com
              </a>
              <Link href={contactHref} className="transition hover:opacity-55">
                {t.contactLink}
              </Link>
              <p className="max-w-[240px] leading-6 text-[#72736f]">
                {t.support}
              </p>
              <SocialIcons className="pt-2" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-[#d9d7d0] py-7 text-xs text-[#858681] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Autorell AB</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href={privacyHref} className="transition hover:text-[#242424]">
              {t.privacy}
            </Link>
            <Link href={localizePublicHref(locale, '/cookies')} className="transition hover:text-[#242424]">
              {t.cookies}
            </Link>
            <Link href={termsHref} className="transition hover:text-[#242424]">
              {t.terms}
            </Link>
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(
                  new Event('autorell-open-cookie-settings')
                )
              }
              className="transition hover:text-[#242424]"
            >
              {t.cookieSettings}
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: [string, string][]
}) {
  return (
    <div>
      <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-[#898a85]">
        {title}
      </h3>
      <nav className="mt-6 flex flex-col items-start gap-4 text-sm">
        {links.map(([label, href]) => (
          <Link key={href} href={href} className="transition hover:opacity-55">
            {label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
