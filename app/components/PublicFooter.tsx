'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import BrandLogo from './BrandLogo'
import SocialIcons from './SocialIcons'
import NewsletterSignup from './NewsletterSignup'
import {
  localizePublicHref,
  translatePublicObject,
  type PublicLocale,
} from '@/lib/public-i18n'

const buyCarLabels: Record<PublicLocale, string> = {
  sv: 'Köp bil', de: 'Fahrzeuge kaufen', en: 'Buy cars',
  fr: 'Acheter des véhicules', es: 'Comprar vehículos',
  it: 'Acquista veicoli', pl: 'Kup pojazdy', nl: 'Voertuigen kopen',
  pt: 'Comprar veículos', fi: 'Osta ajoneuvoja', da: 'Køb køretøjer',
  cs: 'Koupit vozidla', ro: 'Cumpără vehicule', bg: 'Купи автомобили',
  hr: 'Kupi vozila', el: 'Αγορά οχημάτων', hu: 'Járművásárlás',
  sk: 'Kúpiť vozidlá', sl: 'Kupi vozila', et: 'Osta sõidukeid',
  lv: 'Pirkt transportlīdzekļus', lt: 'Pirkti automobilius',
}

const footerCopy = {
  sv: {
    description: 'Europas marknadsplats för fordon — skapad för privatpersoner och företag.',
    question: 'Vill du köpa, sälja eller nå en större europeisk marknad?',
    cta: 'Utforska marknaden',
    statement: 'Fordon, köpare och säljare. Samlade över hela Europa.',
    sellerTitle: 'Marketplace',
    sellerLinks: [
      ['Bilar', '/cars'],
      ['Transportbilar', '/vans'],
      ['Motorcyklar', '/motorcycles'],
      ['Lastbilar', '/trucks'],
    ] as [string, string][],
    businessTitle: 'Företag',
    businessLinks: [
      ['Skapa privat- eller företagskonto', '/registrera'],
      ['Logga in', '/login'],
      ['Priser', '/salj-fordon#priser'],
      ['Hjälpcenter', '/hjalpcenter'],
    ] as [string, string][],
    dealerTitle: 'Fler kategorier',
    dealerLinks: [
      ['Husbilar', '/motorhomes'],
      ['Husvagnar', '/caravans'],
      ['Lantbruk & entreprenad', '/farm'],
      ['Elcyklar', '/electric-bikes'],
      ['Elsparkcyklar', '/e-scooters'],
    ] as [string, string][],
    contact: 'Kontakt',
    support: 'Support för privatpersoner, företag, köpare och säljare i hela EU.',
    contactLink: 'Kontakta oss',
    privacy: 'Integritetspolicy',
    cookies: 'Cookies',
    terms: 'Användarvillkor',
    cookieSettings: 'Cookieinställningar',
  },
  de: {
    description: 'Europas Fahrzeugmarktplatz für Privatpersonen und Unternehmen.',
    question: 'Möchten Sie Fahrzeuge in ganz Europa kaufen oder verkaufen?',
    cta: 'Konto erstellen',
    statement: 'Fahrzeuge handeln. Europa verbinden.',
    sellerTitle: 'Fahrzeuge & Einkauf',
    sellerLinks: [
      ['Fahrzeuge kaufen', '/cars'],
      ['Fahrzeug verkaufen', '/salj-fordon'],
      ['Preise', '/salj-fordon#priser'],
      ['Hilfe', '/hjalpcenter'],
      ['Problem melden', '/rapportera'],
    ] as [string, string][],
    businessTitle: 'Autorell',
    businessLinks: [
      ['Über Autorell', '/ueber-autorell'],
      ['Kontakt', '/kontakt'],
      ['Datenschutz', '/datenschutz'],
      ['Cookies', '/cookies'],
    ] as [string, string][],
    dealerTitle: 'Konto & Verkauf',
    dealerLinks: [
      ['Konto erstellen', '/registrera'],
      ['Unternehmenslösungen', '/foretag'],
      ['Nachrichten', '/konto/meddelanden'],
      ['Anmelden', '/login'],
    ] as [string, string][],
    contact: 'Kontakt',
    support: 'Support für private und gewerbliche Käufer und Verkäufer in der EU.',
    contactLink: 'Kontakt aufnehmen',
    privacy: 'Datenschutz',
    cookies: 'Cookies',
    terms: 'Nutzungsbedingungen',
    cookieSettings: 'Cookie-Einstellungen',
  },
  en: {
    description: "Europe's vehicle marketplace for private sellers and businesses.",
    question: 'Ready to buy or sell vehicles across Europe?',
    cta: 'Create account',
    statement: 'Vehicles, buyers and sellers connected across Europe.',
    sellerTitle: 'Vehicles & buying',
    sellerLinks: [
      ['Buy cars', '/cars'],
      ['Sell a vehicle', '/salj-fordon'],
      ['Pricing', '/salj-fordon#priser'],
      ['Help centre', '/hjalpcenter'],
      ['Report a problem', '/rapportera'],
    ] as [string, string][],
    businessTitle: 'Autorell',
    businessLinks: [
      ['About Autorell', '/about'],
      ['Contact', '/contact'],
      ['Privacy policy', '/privacy'],
      ['Cookies', '/cookies'],
    ] as [string, string][],
    dealerTitle: 'Account & selling',
    dealerLinks: [
      ['Create account', '/registrera'],
      ['Business solutions', '/foretag'],
      ['Messages', '/konto/meddelanden'],
      ['Log in', '/login'],
    ] as [string, string][],
    contact: 'Contact',
    support: 'Support for private and business buyers and sellers across the EU.',
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
      : locale === 'en'
        ? 'https://www.autorell.com/'
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
    <footer className="relative overflow-hidden bg-[#f5f5f5] text-[#202124]">
      <div
        className="market-blob pointer-events-none absolute -bottom-20 -right-16 h-[210px] w-[210px] bg-[#dce9ff] sm:-bottom-24 sm:-right-20 sm:h-[270px] sm:w-[270px]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-16">
        <div className="pt-10 sm:pt-12">
          <NewsletterSignup locale={locale} variant="footer" />
        </div>
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
                  ? '/registrera'
                  : locale === 'de'
                    ? '/registrera'
                    : '/registrera'
              }
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] bg-[#0866ff] px-6 text-sm font-semibold text-white transition hover:bg-[#0057e6]"
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
              href === '/find-cars' ||
              href === '/hitta-bilar' ||
              href === '/fahrzeuge-finden'
                ? buyCarLabels[locale]
                : label,
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
