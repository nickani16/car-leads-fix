'use client'

import Link from 'next/link'
import { ArrowRight, BadgeCheck, Globe2, Mail, ShieldCheck } from 'lucide-react'
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
  const trustBadges =
    locale === 'sv'
      ? ['EU-marknadsplats', 'Trygga konton', 'Verifierat flÃ¶de']
      : locale === 'de'
        ? ['EU-Marktplatz', 'Sichere Konten', 'Verifizierter Ablauf']
        : ['EU marketplace', 'Secure accounts', 'Verified flow']

  return (
    <footer className="relative overflow-hidden border-t border-[#d9e6f8] bg-[linear-gradient(180deg,#ffffff_0%,#f4f9ff_42%,#eef6ff_100%)] text-[#101828]">
      <div
        className="market-blob pointer-events-none absolute -bottom-20 -right-16 h-[240px] w-[240px] bg-[#0866ff]/12 sm:-bottom-28 sm:-right-24 sm:h-[330px] sm:w-[330px]"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute -left-28 top-10 h-72 w-72 rounded-full bg-[#0866ff]/8 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(1120px,80vw)] -translate-x-1/2 bg-[linear-gradient(90deg,transparent,#86b7ff,transparent)]" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid gap-8 rounded-[32px] border border-white/90 bg-white/82 p-6 shadow-[0_28px_80px_rgba(8,34,78,.10)] ring-1 ring-[#0866ff]/8 backdrop-blur-xl sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:p-10">
          <div>
            <a href={homeHref} aria-label={homeLabel}>
              <BrandLogo />
            </a>
            <p className="mt-5 max-w-xl text-[15px] leading-7 text-[#475467]">
              {t.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs font-bold text-[#344054]">
              {[
                [Globe2, trustBadges[0]],
                [ShieldCheck, trustBadges[1]],
                [BadgeCheck, trustBadges[2]],
              ].map(([Icon, label]) => {
                const FooterIcon = Icon as typeof Globe2
                return (
                  <span key={label as string} className="inline-flex items-center gap-2 rounded-full border border-[#d7e7ff] bg-[#f5f9ff] px-3 py-2 shadow-[0_8px_22px_rgba(8,102,255,.08)]">
                    <FooterIcon className="h-4 w-4 text-[#0866ff]" />
                    {label as string}
                  </span>
                )
              })}
            </div>
          </div>
          <div className="rounded-[28px] border border-[#cfe2ff] bg-[linear-gradient(145deg,#ffffff_0%,#f2f7ff_100%)] p-5 shadow-[0_22px_55px_rgba(8,102,255,.13)] sm:min-w-[360px]">
            <p className="max-w-xs text-sm font-semibold leading-6 text-[#243044]">
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
              className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-[18px] bg-[#0866ff] px-6 text-sm font-bold text-white shadow-[0_14px_30px_rgba(8,102,255,.26)] transition hover:bg-[#0057e6]"
            >
              {t.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="grid gap-10 py-10 sm:grid-cols-2 lg:grid-cols-[1.15fr_.72fr_.72fr_.72fr_.9fr] lg:gap-8 lg:py-12">
          <p className="max-w-sm text-2xl font-semibold leading-9 tracking-[-0.035em] text-[#101828]">
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

          <div className="rounded-[28px] border border-[#d7e7ff] bg-white/88 p-5 shadow-[0_16px_42px_rgba(8,34,78,.08)] ring-1 ring-white/80">
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#0866ff]">
              {t.contact}
            </h3>
            <div className="mt-6 flex flex-col gap-4 text-sm">
              <a href="mailto:info@autorell.com" className="inline-flex items-center gap-2 font-semibold transition hover:text-[#0866ff]">
                <Mail className="h-4 w-4 text-[#0866ff]" />
                info@autorell.com
              </a>
              <Link href={contactHref} className="font-semibold text-[#0866ff] transition hover:text-[#0057e6]">
                {t.contactLink}
              </Link>
              <p className="max-w-[240px] leading-6 text-[#667085]">
                {t.support}
              </p>
              <SocialIcons className="pt-2" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-[#d9e6f8] py-7 text-xs text-[#667085] sm:flex-row sm:items-center sm:justify-between">
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
