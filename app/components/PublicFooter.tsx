'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import BrandLogo from './BrandLogo'
import SocialIcons from './SocialIcons'

type FooterLocale = 'sv' | 'de' | 'en'

const footerCopy = {
  sv: {
    description: 'En enklare och tryggare väg mellan svenska bilägare och professionella köpare i Europa.',
    question: 'Har du en bil som passar vårt exportnätverk?',
    cta: 'Kontrollera din bil',
    statement: 'Utvalda svenska bilar. Professionella köpare i Europa.',
    sellerTitle: 'Sälja bil',
    sellerLinks: [
      ['Kontrollera din bil', '/salj-bil'],
      ['Exportprocessen', '/#sa-fungerar-det'],
      ['Trygg affär', '/trygg-affar'],
      ['Vanliga frågor', '/vanliga-fragor'],
    ] as [string, string][],
    businessTitle: 'Företag',
    businessLinks: [
      ['Företagslösningar', '/foretag'],
      ['Varför välja Autorell', '/foretag#process'],
      ['Starta ett pilotflöde', '/foretag#foretagskontakt'],
      ['Om Autorell', '/om-oss'],
    ] as [string, string][],
    dealerTitle: 'Handlare',
    dealerLinks: [
      ['För bilhandlare', '/for-handlare'],
      ['Ansök som handlare', '/dealer-apply'],
      ['Handlarvillkor', '/dealer-terms'],
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
    description: 'Ein fokussierter Zugang zu ausgewählten schwedischen Fahrzeugen für professionelle Käufer.',
    question: 'Möchten Sie auf schwedische Fahrzeugauktionen zugreifen?',
    cta: 'Händlerzugang beantragen',
    statement: 'Schwedische Fahrzeuge. Professionelle Käufer in Europa.',
    sellerTitle: 'Fahrzeuge',
    sellerLinks: [
      ['Fahrzeuge aus Schweden', '/de#fahrzeuge'],
      ['So funktioniert der Einkauf', '/de#ablauf'],
      ['Über Autorell', '/om-oss'],
      ['FAQ', '/de#faq'],
    ] as [string, string][],
    businessTitle: 'Unternehmen',
    businessLinks: [
      ['Unternehmenslösungen', '/foretag'],
      ['Über Autorell', '/om-oss'],
    ] as [string, string][],
    dealerTitle: 'Händler',
    dealerLinks: [
      ['Händler werden', '/dealer-apply'],
      ['Händlerbedingungen', '/dealer-terms'],
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
    question: 'Want access to Swedish vehicle auctions?',
    cta: 'Apply for dealer access',
    statement: 'Swedish vehicles. Professional buyers across Europe.',
    sellerTitle: 'Vehicles',
    sellerLinks: [
      ['Vehicles from Sweden', '/eu#fahrzeuge'],
      ['How buying works', '/eu#ablauf'],
      ['About Autorell', '/om-oss'],
      ['FAQ', '/eu#faq'],
    ] as [string, string][],
    businessTitle: 'Business',
    businessLinks: [
      ['Business solutions', '/foretag'],
      ['About Autorell', '/om-oss'],
    ] as [string, string][],
    dealerTitle: 'Dealers',
    dealerLinks: [
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
  locale?: FooterLocale
}) {
  const t = footerCopy[locale]

  return (
    <footer className="relative overflow-hidden bg-[#f3f2ee] text-[#202124]">
      <div
        className="pointer-events-none absolute -bottom-36 -right-32 h-[360px] w-[360px] rounded-full border-[48px] border-[#242424]/[0.045] sm:-bottom-44 sm:-right-36 sm:h-[460px] sm:w-[460px] sm:border-[62px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-20 -right-16 h-[210px] w-[210px] rounded-full border-[24px] border-[#B4D9EF]/50 sm:-bottom-24 sm:-right-20 sm:h-[270px] sm:w-[270px] sm:border-[30px]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-16">
        <div className="flex flex-col gap-10 border-b border-[#d9d7d0] py-14 lg:flex-row lg:items-center lg:justify-between lg:py-16">
          <div>
            <BrandLogo />
            <p className="mt-5 max-w-lg text-[15px] leading-7 text-[#666864]">
              {t.description}
            </p>
          </div>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <p className="max-w-xs text-sm leading-6 text-[#666864]">
              {t.question}
            </p>
            <Link
              href={locale === 'sv' ? '/salj-bil' : '/dealer-apply'}
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
            links={t.sellerLinks}
          />
          <FooterColumn
            title={t.businessTitle}
            links={t.businessLinks}
          />
          <FooterColumn
            title={t.dealerTitle}
            links={t.dealerLinks}
          />

          <div>
            <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-[#898a85]">
              {t.contact}
            </h3>
            <div className="mt-6 flex flex-col gap-4 text-sm">
              <a href="mailto:info@autorell.com" className="transition hover:opacity-55">
                info@autorell.com
              </a>
              <Link href="/kontakt" className="transition hover:opacity-55">
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
            <Link href="/integritet" className="transition hover:text-[#242424]">
              {t.privacy}
            </Link>
            <Link href="/cookies" className="transition hover:text-[#242424]">
              {t.cookies}
            </Link>
            <Link href="/villkor" className="transition hover:text-[#242424]">
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
