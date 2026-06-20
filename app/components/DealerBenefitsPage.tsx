import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  CarFront,
  FileCheck2,
  Globe2,
  Route,
  ShieldCheck,
  Sparkles,
  Truck,
  Users,
} from 'lucide-react'
import PublicFooter from './PublicFooter'
import PublicHeader from './PublicHeader'

type Locale = 'de' | 'en'

const copy = {
  en: {
    eyebrow: 'Autorell Dealer Network',
    title: 'Source better vehicles. Make clearer decisions.',
    intro:
      'Selected Swedish supply, structured vehicle intelligence and one coordinated route from bid to delivery.',
    primary: 'Apply for dealer access',
    secondary: 'View available vehicles',
    vehicleHref: '/find-cars',
    metrics: [
      ['2018+', 'Focused modern supply'],
      ['Verified', 'Professional dealer access'],
      ['One flow', 'Bid, fund, inspect and export'],
    ],
    valueEyebrow: 'Built for professional purchasing',
    valueTitle: 'Less noise between your buying team and the right vehicle.',
    values: [
      ['Selected supply', 'Vehicles are qualified for age, mileage, condition and commercial relevance before they enter the buyer network.', CarFront],
      ['Structured data', 'Identity, history, equipment, images, declared condition and known faults follow one comparable format.', FileCheck2],
      ['Protected transactions', 'Verified accounts, binding stages and controlled access create a professional B2B environment.', ShieldCheck],
      ['Cross-border execution', 'Autorell coordinates contracts, cleared funds, inspection, export documents, collection and logistics.', Globe2],
    ],
    processEyebrow: 'One connected workflow',
    processTitle: 'From opportunity to inventory without fragmented handovers.',
    process: [
      ['Discover', 'Review selected Swedish vehicles and complete profiles.', Sparkles],
      ['Decide', 'Compare data, costs and bidding conditions before committing.', BadgeCheck],
      ['Fund', 'Transfer the confirmed buyer total securely to Autorell.', Banknote],
      ['Verify', 'The vehicle is checked against its declaration before release.', ShieldCheck],
      ['Deliver', 'Collection, export documents and agreed transport are coordinated.', Truck],
    ],
    trustTitle: 'A buyer network, not an open classifieds site.',
    trustText:
      'Autorell is designed for approved automotive businesses. Sensitive seller information remains protected while professional buyers receive the vehicle data needed to make a commercial decision.',
    ctaTitle: 'Ready for a clearer Swedish sourcing channel?',
    ctaText:
      'Join the Autorell Dealer Network and access selected vehicles, focused bidding and coordinated cross-border transactions.',
    cta: 'Apply for dealer access',
  },
  de: {
    eyebrow: 'Autorell Dealer Network',
    title: 'Bessere Fahrzeuge beschaffen. Klarer entscheiden.',
    intro:
      'Ausgewähltes schwedisches Angebot, strukturierte Fahrzeugdaten und ein koordinierter Weg vom Gebot bis zur Übergabe.',
    primary: 'Händlerzugang beantragen',
    secondary: 'Fahrzeuge ansehen',
    vehicleHref: '/fahrzeuge-finden',
    metrics: [
      ['2018+', 'Fokus auf moderne Fahrzeuge'],
      ['Geprüft', 'Professioneller Händlerzugang'],
      ['Ein Ablauf', 'Gebot, Zahlung, Prüfung und Export'],
    ],
    valueEyebrow: 'Für den professionellen Einkauf',
    valueTitle: 'Weniger Umwege zwischen Ihrem Einkaufsteam und dem richtigen Fahrzeug.',
    values: [
      ['Ausgewähltes Angebot', 'Fahrzeuge werden vor der Freigabe nach Alter, Laufleistung, Zustand und Marktpotenzial qualifiziert.', CarFront],
      ['Strukturierte Daten', 'Identität, Historie, Ausstattung, Bilder, deklarierter Zustand und bekannte Mängel sind direkt vergleichbar.', FileCheck2],
      ['Geschützter Handel', 'Geprüfte Konten, verbindliche Schritte und kontrollierter Zugang schaffen einen professionellen B2B-Rahmen.', ShieldCheck],
      ['Grenzüberschreitende Abwicklung', 'Autorell koordiniert Verträge, Zahlungseingang, Prüfung, Exportdokumente, Abholung und Logistik.', Globe2],
    ],
    processEyebrow: 'Ein verbundener Ablauf',
    processTitle: 'Von der Möglichkeit bis zum Bestand – ohne fragmentierte Übergaben.',
    process: [
      ['Entdecken', 'Ausgewählte schwedische Fahrzeuge und vollständige Profile prüfen.', Sparkles],
      ['Entscheiden', 'Daten, Kosten und Gebotsbedingungen vorab vergleichen.', BadgeCheck],
      ['Bezahlen', 'Den bestätigten Käufergesamtbetrag sicher an Autorell überweisen.', Banknote],
      ['Prüfen', 'Das Fahrzeug wird vor Freigabe mit der Deklaration abgeglichen.', ShieldCheck],
      ['Übergeben', 'Abholung, Exportdokumente und vereinbarter Transport werden koordiniert.', Truck],
    ],
    trustTitle: 'Ein Käufernetzwerk – kein offenes Kleinanzeigenportal.',
    trustText:
      'Autorell richtet sich an geprüfte Automobilunternehmen. Sensible Verkäuferdaten bleiben geschützt, während professionelle Käufer die relevanten Fahrzeugdaten für ihre Einkaufsentscheidung erhalten.',
    ctaTitle: 'Bereit für einen klareren Beschaffungskanal aus Schweden?',
    ctaText:
      'Werden Sie Teil des Autorell Dealer Network und erhalten Sie Zugang zu ausgewählten Fahrzeugen, fokussierten Geboten und koordinierter Abwicklung.',
    cta: 'Händlerzugang beantragen',
  },
} as const

export default function DealerBenefitsPage({ locale }: { locale: Locale }) {
  const t = copy[locale]
  const accessHref = locale === 'de' ? '/haendlerzugang' : '/dealer-apply'

  return (
    <main className="overflow-hidden bg-[#f7f6f2] text-[#202124]">
      <PublicHeader locale={locale} />

      <section className="relative overflow-hidden border-b border-[#dbe4e7] bg-[linear-gradient(135deg,#fffdf8_0%,#eef7fa_54%,#dbeef6_100%)]">
        <div className="absolute -right-44 -top-56 h-[680px] w-[680px] rounded-full border-[92px] border-white/55" />
        <div className="absolute bottom-0 left-[12%] h-72 w-72 rounded-full bg-[#B4D9EF]/35 blur-3xl" />
        <div className="relative mx-auto grid max-w-[1360px] gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.08fr_.92fr] lg:items-end lg:px-12 lg:py-28">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#c3dbe6] bg-white/75 px-4 py-2 text-xs font-semibold text-[#476b7b]">
              <Users className="h-4 w-4" />
              {t.eyebrow}
            </p>
            <h1 className="mt-7 max-w-4xl text-[46px] leading-[.98] tracking-[-0.06em] sm:text-7xl lg:text-[82px]">
              {t.title}
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#58707c] sm:text-xl">
              {t.intro}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href={accessHref}
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#20272b] px-7 text-sm font-semibold text-white shadow-[0_18px_42px_rgba(32,39,43,.18)]"
              >
                {t.primary}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={t.vehicleHref}
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full border border-[#b9cdd6] bg-white/75 px-7 text-sm font-semibold"
              >
                {t.secondary}
                <CarFront className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid gap-px overflow-hidden rounded-[28px] border border-white bg-white/65 shadow-[0_30px_90px_rgba(52,85,99,.12)] backdrop-blur md:grid-cols-3 lg:grid-cols-1">
            {t.metrics.map(([value, label]) => (
              <div key={label} className="bg-white/82 p-7 lg:p-8">
                <p className="text-3xl font-semibold tracking-[-0.04em]">{value}</p>
                <p className="mt-2 text-sm text-[#68777d]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#52768a]">
            {t.valueEyebrow}
          </p>
          <h2 className="mt-4 max-w-4xl text-[38px] leading-[1.02] tracking-[-0.052em] sm:text-6xl">
            {t.valueTitle}
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {t.values.map(([title, text, Icon], index) => (
              <article
                key={title}
                className="min-h-[280px] rounded-[26px] border border-[#dce2e3] bg-white p-7 shadow-[0_18px_55px_rgba(32,33,36,.045)] sm:p-9"
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-[#e5f2f8] text-[#315f74]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-xs text-[#9aa4a8]">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-10 text-2xl tracking-[-0.04em]">{title}</h3>
                <p className="mt-4 max-w-xl text-sm leading-7 text-[#68777d]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#dbe3e5] bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#52768a]">
            {t.processEyebrow}
          </p>
          <h2 className="mt-4 max-w-4xl text-[38px] leading-[1.02] tracking-[-0.052em] sm:text-6xl">
            {t.processTitle}
          </h2>
          <div className="mt-11 grid gap-3 lg:grid-cols-5">
            {t.process.map(([title, text, Icon], index) => (
              <article key={title} className="rounded-[22px] bg-[#f5f7f6] p-6">
                <div className="flex items-center justify-between">
                  <Icon className="h-5 w-5 text-[#3e7188]" />
                  <span className="text-xs text-[#9aa4a8]">0{index + 1}</span>
                </div>
                <h3 className="mt-10 text-lg font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#69777d]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
        <div className="mx-auto grid max-w-[1180px] gap-8 rounded-[30px] bg-[#dff0f7] p-8 sm:p-12 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-white text-[#315f74]">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-3xl leading-tight tracking-[-0.045em] sm:text-4xl">
              {t.trustTitle}
            </h2>
            <p className="mt-4 leading-8 text-[#536c78]">{t.trustText}</p>
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-8 sm:pb-24 lg:px-12">
        <div className="relative mx-auto max-w-[1180px] overflow-hidden rounded-[30px] bg-[#20272b] px-7 py-14 text-center text-white sm:px-14 sm:py-20">
          <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full border-[54px] border-[#B4D9EF]/10" />
          <Route className="relative mx-auto h-7 w-7 text-[#B4D9EF]" />
          <h2 className="relative mx-auto mt-6 max-w-3xl text-[36px] leading-[1.05] tracking-[-0.05em] sm:text-5xl">
            {t.ctaTitle}
          </h2>
          <p className="relative mx-auto mt-5 max-w-2xl leading-7 text-white/62">
            {t.ctaText}
          </p>
          <Link
            href={accessHref}
            className="relative mt-8 inline-flex min-h-14 items-center gap-3 rounded-full bg-[#B4D9EF] px-8 text-sm font-semibold text-[#20272b]"
          >
            {t.cta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <PublicFooter locale={locale} />
    </main>
  )
}
