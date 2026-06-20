import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  CarFront,
  Check,
  FileCheck2,
  Globe2,
  Gavel,
  ScanSearch,
  ShieldCheck,
  Truck,
  Users,
} from 'lucide-react'
import PublicFooter from './PublicFooter'
import PublicHeader from './PublicHeader'

type Locale = 'de' | 'en'

const copy = {
  en: {
    eyebrow: 'Built for professional vehicle buyers',
    title: 'A sharper way to source Swedish vehicles.',
    intro:
      'Autorell combines selected supply, comparable vehicle intelligence and controlled execution in one professional purchasing channel.',
    apply: 'Apply for dealer access',
    browse: 'Explore vehicles',
    browseHref: '/find-cars',
    live: 'Buyer workspace',
    signal: 'Current market signal',
    network: 'verified European markets',
    advantages: [
      ['Qualified before release', 'We focus on modern vehicles with relevant mileage, declared condition and genuine professional demand.', ScanSearch],
      ['Data your team can compare', 'Identity, equipment, history, images, known faults and costs are presented in a consistent structure.', FileCheck2],
      ['A controlled B2B room', 'Only approved automotive businesses receive full data and bidding access.', ShieldCheck],
    ],
    intelligenceEyebrow: 'Commercial clarity before commitment',
    intelligenceTitle: 'See the vehicle, the demand and the transaction before you decide.',
    intelligenceText:
      'The platform is designed to reduce unnecessary calls, incomplete listings and uncertain counterparties. Your team gets a clear purchasing basis and one accountable transaction partner.',
    intelligencePoints: [
      'Protected vehicle and seller information',
      'Transparent bidding or fixed-price conditions',
      'Estimated transport and export costs before commitment',
      'One recorded status from bid to delivery',
    ],
    flowEyebrow: 'The Autorell transaction',
    flowTitle: 'Five stages. One responsible counterparty.',
    flow: [
      ['Access', 'Company and VAT information are verified.', Users],
      ['Review', 'Assess structured vehicle data and disclosed condition.', CarFront],
      ['Bid', 'Participate under clear, documented conditions.', Gavel],
      ['Fund & inspect', 'Funds clear to Autorell before the vehicle is checked.', Banknote],
      ['Collect & export', 'Documents, release and agreed logistics are coordinated.', Truck],
    ],
    protectionTitle: 'If the vehicle differs, the transaction stops.',
    protectionText:
      'Autorell compares the vehicle with its declaration before release. A material discrepancy pauses completion for a documented decision, adjustment or cancellation under the agreement.',
    ctaTitle: 'Turn Swedish supply into a reliable buying channel.',
    ctaText:
      'Join approved dealers across Europe and source selected vehicles through a workflow built for professional trade.',
  },
  de: {
    eyebrow: 'Für den professionellen Fahrzeugeinkauf',
    title: 'Der klarere Weg zu schwedischen Fahrzeugen.',
    intro:
      'Autorell verbindet ausgewähltes Angebot, vergleichbare Fahrzeugdaten und kontrollierte Abwicklung in einem professionellen Einkaufskanal.',
    apply: 'Händlerzugang beantragen',
    browse: 'Fahrzeuge entdecken',
    browseHref: '/fahrzeuge-finden',
    live: 'Einkaufsübersicht',
    signal: 'Aktuelles Marktsignal',
    network: 'verifizierte europäische Märkte',
    advantages: [
      ['Vor Freigabe qualifiziert', 'Wir fokussieren moderne Fahrzeuge mit relevanter Laufleistung, deklariertem Zustand und echter professioneller Nachfrage.', ScanSearch],
      ['Vergleichbare Einkaufsdaten', 'Identität, Ausstattung, Historie, Bilder, bekannte Mängel und Kosten folgen einer einheitlichen Struktur.', FileCheck2],
      ['Kontrollierter B2B-Raum', 'Nur geprüfte Automobilunternehmen erhalten vollständige Daten und Gebotszugang.', ShieldCheck],
    ],
    intelligenceEyebrow: 'Kommerzielle Klarheit vor der Entscheidung',
    intelligenceTitle: 'Fahrzeug, Nachfrage und Transaktion prüfen, bevor Sie entscheiden.',
    intelligenceText:
      'Die Plattform reduziert unnötige Rückfragen, unvollständige Inserate und unbekannte Gegenparteien. Ihr Einkaufsteam erhält eine klare Grundlage und einen verantwortlichen Transaktionspartner.',
    intelligencePoints: [
      'Geschützte Fahrzeug- und Verkäuferdaten',
      'Transparente Gebots- oder Festpreisbedingungen',
      'Geschätzte Transport- und Exportkosten vor der Zusage',
      'Ein dokumentierter Status vom Gebot bis zur Lieferung',
    ],
    flowEyebrow: 'Die Autorell-Transaktion',
    flowTitle: 'Fünf Schritte. Eine verantwortliche Gegenpartei.',
    flow: [
      ['Zugang', 'Unternehmens- und Umsatzsteuerdaten werden geprüft.', Users],
      ['Prüfung', 'Strukturierte Fahrzeugdaten und Zustand bewerten.', CarFront],
      ['Gebot', 'Unter klaren, dokumentierten Bedingungen teilnehmen.', Gavel],
      ['Zahlung & Kontrolle', 'Zahlung an Autorell vor der Fahrzeugprüfung.', Banknote],
      ['Abholung & Export', 'Dokumente, Freigabe und Logistik werden koordiniert.', Truck],
    ],
    protectionTitle: 'Bei einer Abweichung stoppt die Transaktion.',
    protectionText:
      'Autorell gleicht das Fahrzeug vor der Freigabe mit der Deklaration ab. Eine wesentliche Abweichung pausiert den Abschluss für eine dokumentierte Entscheidung, Anpassung oder Stornierung.',
    ctaTitle: 'Machen Sie schwedisches Angebot zu einem verlässlichen Einkaufskanal.',
    ctaText:
      'Werden Sie Teil geprüfter Händler in Europa und beschaffen Sie ausgewählte Fahrzeuge über einen professionellen Prozess.',
  },
} as const

export default function DealerBenefitsPage({ locale }: { locale: Locale }) {
  const t = copy[locale]
  const accessHref = locale === 'de' ? '/haendlerzugang' : '/dealer-apply'

  return (
    <main className="overflow-hidden bg-[#f5f4ef] text-[#202124]">
      <PublicHeader locale={locale} />

      <section className="relative overflow-hidden bg-[#20272b] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_22%,rgba(180,217,239,.18),transparent_28%),linear-gradient(115deg,rgba(255,255,255,.035),transparent_42%)]" />
        <div className="absolute -right-40 -top-56 h-[620px] w-[620px] rounded-full border-[86px] border-white/[.045]" />
        <div className="relative mx-auto grid max-w-[1380px] gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.02fr_.98fr] lg:items-center lg:px-12 lg:py-28">
          <div>
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#B4D9EF]">
              <span className="h-px w-8 bg-[#B4D9EF]/65" />
              {t.eyebrow}
            </p>
            <h1 className="mt-7 max-w-4xl text-[46px] leading-[.96] tracking-[-0.06em] sm:text-7xl lg:text-[82px]">
              {t.title}
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/64 sm:text-xl">
              {t.intro}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href={accessHref}
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#B4D9EF] px-7 text-sm font-semibold text-[#20272b]"
              >
                {t.apply}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={t.browseHref}
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full border border-white/18 bg-white/[.06] px-7 text-sm font-semibold text-white"
              >
                {t.browse}
                <CarFront className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-8 rounded-[44px] bg-[#B4D9EF]/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-[28px] border border-white/12 bg-[#eef3f4] text-[#202124] shadow-[0_38px_100px_rgba(0,0,0,.32)]">
              <div className="flex items-center justify-between bg-[#181e21] px-5 py-4 text-white">
                <div className="flex items-center gap-3">
                  <span className="flex gap-1.5" aria-hidden="true">
                    <i className="h-2 w-2 rounded-full bg-[#ef8b7e]" />
                    <i className="h-2 w-2 rounded-full bg-[#e8cc78]" />
                    <i className="h-2 w-2 rounded-full bg-[#7fc195]" />
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                    {t.live}
                  </span>
                </div>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-[10px] text-emerald-300">
                  Live
                </span>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid gap-3 sm:grid-cols-[1.1fr_.9fr]">
                  <div className="rounded-[20px] bg-[#232a2e] p-5 text-white">
                    <div className="flex items-center justify-between text-[10px] text-white/45">
                      <span>{t.signal}</span>
                      <BadgeCheck className="h-4 w-4 text-[#B4D9EF]" />
                    </div>
                    <strong className="mt-6 block text-4xl tracking-[-0.055em]">
                      €31,400
                    </strong>
                    <div className="mt-7 flex h-24 items-end gap-2">
                      {[32, 45, 41, 58, 66, 61, 79, 92].map((height) => (
                        <i
                          key={height}
                          className="flex-1 rounded-t bg-[#B4D9EF]/80"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-3">
                    {[
                      ['DE', '€31,400'],
                      ['NL', '€30,800'],
                      ['FR', '€30,350'],
                    ].map(([country, amount], index) => (
                      <div
                        key={country}
                        className="flex items-center justify-between rounded-[16px] border border-white bg-white p-4 shadow-sm"
                      >
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-[#edf4f6] text-xs font-semibold text-[#527080]">
                          {country}
                        </span>
                        <span className="text-right">
                          <strong className="block">{amount}</strong>
                          <small className="text-[10px] text-emerald-700">
                            {index === 0 ? 'Highest' : 'Active'}
                          </small>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between rounded-[16px] border border-[#d5e3e8] bg-[#e2f1f7] p-4 text-sm text-[#456778]">
                  <span className="flex items-center gap-2">
                    <Globe2 className="h-4 w-4" />
                    25 {t.network}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#dce2e3] bg-white">
        <div className="mx-auto grid max-w-[1380px] md:grid-cols-3">
          {t.advantages.map(([title, text, Icon], index) => (
            <article
              key={title}
              className="border-b border-[#dce2e3] p-7 md:border-b-0 md:border-r md:p-10 md:last:border-r-0"
            >
              <div className="flex items-center justify-between">
                <Icon className="h-6 w-6 text-[#3d748b]" />
                <span className="font-mono text-xs text-[#a0a8aa]">0{index + 1}</span>
              </div>
              <h2 className="mt-9 text-2xl tracking-[-0.04em]">{title}</h2>
              <p className="mt-4 text-sm leading-7 text-[#68777d]">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="py-16 sm:py-28">
        <div className="mx-auto grid max-w-[1320px] gap-12 px-5 sm:px-8 lg:grid-cols-[.85fr_1.15fr] lg:items-start lg:gap-24 lg:px-12">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#52768a]">
              {t.intelligenceEyebrow}
            </p>
            <h2 className="mt-5 text-[38px] leading-[1.02] tracking-[-0.052em] sm:text-6xl">
              {t.intelligenceTitle}
            </h2>
            <p className="mt-6 text-base leading-8 text-[#60747d] sm:text-lg">
              {t.intelligenceText}
            </p>
          </div>
          <div className="overflow-hidden rounded-[28px] border border-[#dce2e3] bg-white shadow-[0_24px_70px_rgba(32,39,43,.07)]">
            {t.intelligencePoints.map((item, index) => (
              <div
                key={item}
                className="flex items-center gap-5 border-b border-[#e7ebec] px-6 py-6 last:border-0 sm:px-8"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#dff0f7] text-[#315f74]">
                  <Check className="h-4 w-4" />
                </span>
                <span className="flex-1 text-sm font-medium sm:text-base">{item}</span>
                <span className="font-mono text-xs text-[#a0a8aa]">0{index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#eaf3f6] py-16 sm:py-28">
        <div className="mx-auto max-w-[1380px] px-5 sm:px-8 lg:px-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#52768a]">
            {t.flowEyebrow}
          </p>
          <h2 className="mt-5 max-w-4xl text-[38px] leading-[1.02] tracking-[-0.052em] sm:text-6xl">
            {t.flowTitle}
          </h2>
          <div className="mt-12 grid gap-3 lg:grid-cols-5">
            {t.flow.map(([title, text, Icon], index) => (
              <article
                key={title}
                className="min-h-[260px] rounded-[24px] border border-white bg-white/85 p-6 shadow-[0_16px_45px_rgba(57,87,100,.055)]"
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-[#20272b] text-[#B4D9EF]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-xs text-[#96a2a6]">0{index + 1}</span>
                </div>
                <h3 className="mt-10 text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#68777d]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
        <div className="mx-auto grid max-w-[1180px] gap-8 rounded-[30px] border border-[#d5e1e5] bg-white p-8 shadow-[0_24px_70px_rgba(32,39,43,.07)] sm:p-12 lg:grid-cols-[auto_1fr] lg:items-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-[#dff0f7] text-[#315f74]">
            <ShieldCheck className="h-7 w-7" />
          </span>
          <div>
            <h2 className="text-3xl tracking-[-0.045em] sm:text-4xl">
              {t.protectionTitle}
            </h2>
            <p className="mt-4 leading-8 text-[#5c727c]">{t.protectionText}</p>
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-8 sm:pb-24 lg:px-12">
        <div className="relative mx-auto max-w-[1180px] overflow-hidden rounded-[30px] bg-[#20272b] px-7 py-14 text-center text-white sm:px-14 sm:py-20">
          <div className="absolute -right-28 -top-36 h-96 w-96 rounded-full border-[62px] border-[#B4D9EF]/10" />
          <h2 className="relative mx-auto max-w-3xl text-[38px] leading-[1.04] tracking-[-0.052em] sm:text-6xl">
            {t.ctaTitle}
          </h2>
          <p className="relative mx-auto mt-5 max-w-2xl leading-8 text-white/62">
            {t.ctaText}
          </p>
          <Link
            href={accessHref}
            className="relative mt-8 inline-flex min-h-14 items-center gap-3 rounded-full bg-[#B4D9EF] px-8 text-sm font-semibold text-[#20272b]"
          >
            {t.apply}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <PublicFooter locale={locale} />
    </main>
  )
}
