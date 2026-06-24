'use client'

import Link from 'next/link'
import { ArrowRight, Mail } from 'lucide-react'
import BrandLogo from './BrandLogo'
import SocialIcons from './SocialIcons'
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
    <footer className="border-t border-[#e4e7ec] bg-white text-[#101828]">
      <div className="mx-auto max-w-[1180px] px-5 py-12 sm:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[280px_1fr] lg:gap-16">
          <div className="lg:pt-1">
            <a href={homeHref} aria-label={homeLabel}>
              <BrandLogo />
            </a>
            <p className="mt-5 max-w-[270px] text-sm leading-6 text-[#667085]">
              {t.description}
            </p>
          </div>

          <div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
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
                <h3 className="text-sm font-bold text-[#101828]">
                  {t.contact}
                </h3>
                <div className="mt-4 flex flex-col gap-3 text-sm text-[#475467]">
                  <a href="mailto:info@autorell.com" className="inline-flex items-center gap-2 font-semibold text-[#101828] transition hover:text-[#0866ff]">
                    <Mail className="h-4 w-4 text-[#0866ff]" />
                    info@autorell.com
                  </a>
                  <Link href={contactHref} className="transition hover:text-[#0866ff]">
                    {t.contactLink}
                  </Link>
                  <p className="max-w-[240px] leading-6">
                    {t.support}
                  </p>
                  <SocialIcons className="pt-1" />
                </div>
              </div>
            </div>

            <div className="mt-10 rounded-[20px] border border-[#e4e7ec] bg-[#f9fafb] p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
              <p className="max-w-xl text-sm font-semibold leading-6 text-[#344054]">
                {t.question}
              </p>
              <Link
                href="/registrera"
                className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] bg-[#0866ff] px-5 text-sm font-bold text-white transition hover:bg-[#0057e6] sm:mt-0"
              >
                {t.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-5 border-t border-[#e4e7ec] pt-7 text-xs text-[#667085] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Autorell AB</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href={privacyHref} className="transition hover:text-[#0866ff]">
              {t.privacy}
            </Link>
            <Link href={localizePublicHref(locale, '/cookies')} className="transition hover:text-[#0866ff]">
              {t.cookies}
            </Link>
            <Link href={termsHref} className="transition hover:text-[#0866ff]">
              {t.terms}
            </Link>
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(
                  new Event('autorell-open-cookie-settings')
                )
              }
              className="transition hover:text-[#0866ff]"
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
      <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#0866ff]">
        {title}
      </h3>
      <nav className="mt-6 flex flex-col items-start gap-4 text-sm text-[#344054]">
        {links.map(([label, href]) => (
          <Link key={href} href={href} className="transition hover:text-[#0866ff]">
            {label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
