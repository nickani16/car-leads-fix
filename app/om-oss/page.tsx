import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Gavel,
  Globe2,
  Handshake,
  HeartHandshake,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react'
import PublicBreadcrumbs from '../components/PublicBreadcrumbs'
import PublicFooter from '../components/PublicFooter'
import PublicHeader from '../components/PublicHeader'

export const metadata: Metadata = {
  title: 'Om oss',
  description:
    'Lär känna Autorell och vår idé om en enklare, öppnare och mer relevant marknadsplats för bilägare och professionella handlare.',
}

const principles = [
  {
    icon: ScanSearch,
    title: 'Bättre information',
    text: 'En tydlig fordonsprofil gör det enklare för seriösa köpare att bedöma bilen och lämna relevanta bud.',
  },
  {
    icon: ShieldCheck,
    title: 'Kontroll hos säljaren',
    text: 'Bilägaren bestämmer alltid om ett erbjudande är rätt. Tekniken ska ge valmöjligheter, inte skapa press.',
  },
  {
    icon: Globe2,
    title: 'Rätt räckvidd',
    text: 'Efterfrågan stannar inte vid en kommungräns. Vi matchar bilen mot marknader där den faktiskt är relevant.',
  },
]

export default function AboutPage() {
  return (
    <main className="overflow-hidden bg-[#f8f7f3] text-[#202124]">
      <PublicHeader />

      <section className="relative overflow-hidden border-b border-[#dde5e7] bg-[linear-gradient(145deg,#fbf8f1_0%,#eef6f8_55%,#e2f0f5_100%)]">
        <div className="absolute -left-40 -top-44 h-[520px] w-[520px] rounded-full border-[68px] border-white/55" />
        <div className="absolute -bottom-44 right-[18%] h-[360px] w-[360px] rounded-full bg-[#b4d9ef]/35 blur-3xl" />

        <div className="relative mx-auto max-w-[1440px] px-5 pb-16 pt-5 sm:px-8 sm:pb-24 sm:pt-7 lg:px-12 xl:px-16">
          <PublicBreadcrumbs items={[{ label: 'Om oss' }]} />

          <div className="grid gap-12 pb-4 pt-14 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:gap-20 lg:pb-12 lg:pt-20">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#cbdde4] bg-white/65 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#526f7d] backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                Om Autorell
              </span>
              <h1 className="mt-7 max-w-3xl text-[44px] leading-[.99] tracking-[-0.055em] sm:text-6xl lg:text-[76px]">
                Bilmarknaden kan fungera bättre för båda sidor.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[#526a76] sm:text-xl">
                Autorell bygger en digital marknadsplats där bilägare får
                större räckvidd och professionella handlare får bättre
                beslutsunderlag. Enklare att sälja. Enklare att köpa rätt.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/salj-bil"
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#242424] px-7 text-sm font-medium text-white shadow-[0_16px_35px_rgba(32,33,36,.18)] transition hover:-translate-y-0.5 hover:bg-[#111]"
                >
                  Värdera din bil
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/dealer-apply"
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-[#bfd2da] bg-white/70 px-7 text-sm font-medium transition hover:bg-white"
                >
                  För bilhandlare
                </Link>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[620px]">
              <div className="absolute -inset-8 rounded-full bg-white/30 blur-3xl" />
              <div className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white/72 p-4 shadow-[0_35px_100px_rgba(43,75,88,.14)] backdrop-blur-xl sm:p-6">
                <div className="rounded-[22px] bg-[#22272a] p-5 text-white sm:p-7">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#b4d9ef]">
                        Autorell marketplace
                      </p>
                      <p className="mt-2 text-xl tracking-[-0.03em]">
                        Ett bättre beslutsflöde
                      </p>
                    </div>
                    <Gavel className="h-6 w-6 text-white/35" />
                  </div>

                  <div className="mt-7 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    <div className="rounded-[16px] border border-white/10 bg-white/[.06] p-4">
                      <UserRound className="h-5 w-5 text-[#b4d9ef]" />
                      <p className="mt-5 text-sm">Bilägare</p>
                      <p className="mt-1 text-xs leading-5 text-white/50">
                        En tydlig profil
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-white/35" />
                    <div className="rounded-[16px] border border-white/10 bg-white/[.06] p-4">
                      <Building2 className="h-5 w-5 text-[#d8c8a8]" />
                      <p className="mt-5 text-sm">Handlare</p>
                      <p className="mt-1 text-xs leading-5 text-white/50">
                        Relevanta objekt
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-[16px] border border-[#b4d9ef]/20 bg-[#b4d9ef]/10 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/60">Marknadsintresse</span>
                      <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] text-[#b4d9ef]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#8fd0ad]" />
                        Aktivt
                      </span>
                    </div>
                    <div className="mt-4 flex items-end gap-2">
                      {[30, 46, 38, 62, 53, 78, 68, 92].map((height, index) => (
                        <span
                          key={`${height}-${index}`}
                          className={`flex-1 rounded-t-sm ${
                            index === 7 ? 'bg-[#b4d9ef]' : 'bg-white/16'
                          }`}
                          style={{ height }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-4 sm:gap-3 sm:pt-6">
                  {[
                    ['Digitalt', 'Ett samlat flöde'],
                    ['Relevant', 'Rätt köpare'],
                    ['Personligt', 'Support vid behov'],
                  ].map(([value, label]) => (
                    <div
                      key={value}
                      className="rounded-[15px] border border-[#e0e7e8] bg-white px-3 py-4 text-center"
                    >
                      <strong className="block text-sm">{value}</strong>
                      <span className="mt-1 block text-[10px] leading-4 text-[#75858b]">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-28">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#718188]">
                Varför vi finns
              </p>
              <h2 className="mt-5 text-[36px] leading-[1.04] tracking-[-0.048em] sm:text-5xl">
                Mindre osäkerhet. Mer relevans.
              </h2>
              <p className="mt-5 text-base leading-8 text-[#64747a]">
                En bilaffär innehåller många beslut men informationen är ofta
                utspridd och kontakterna för många. Vår roll är att göra
                processen tydligare utan att ta beslutet från människorna i
                affären.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {principles.map(({ icon: Icon, title, text }, index) => (
                <article
                  key={title}
                  className="rounded-[22px] border border-[#e2e7e6] bg-[#fafbf9] p-6 sm:p-7"
                >
                  <div className="flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-[#e5f1f5] text-[#4d7b8f]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-[10px] tracking-[0.16em] text-[#a0aaad]">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-8 text-xl tracking-[-0.03em]">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#66767b]">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#202427] py-16 text-white sm:py-28">
        <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full border-[50px] border-[#b4d9ef]/10" />
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b4d9ef]">
              Två sidor. En marknadsplats.
            </p>
            <h2 className="mt-5 text-[38px] leading-[1.04] tracking-[-0.05em] sm:text-5xl">
              Innovation är värdefull först när vardagen blir enklare.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            <article className="rounded-[24px] border border-white/10 bg-white/[.045] p-6 sm:p-9">
              <UserRound className="h-6 w-6 text-[#b4d9ef]" />
              <h3 className="mt-8 text-2xl tracking-[-0.035em]">
                För dig som äger bilen
              </h3>
              <p className="mt-4 max-w-xl leading-7 text-white/60">
                Du beskriver bilen en gång och får tillgång till efterfrågan
                från professionella köpare. Du slipper jaga kontakter och
                behåller kontrollen över beslutet.
              </p>
            </article>
            <article className="rounded-[24px] border border-white/10 bg-white/[.045] p-6 sm:p-9">
              <Building2 className="h-6 w-6 text-[#d8c8a8]" />
              <h3 className="mt-8 text-2xl tracking-[-0.035em]">
                För professionella köpare
              </h3>
              <p className="mt-4 max-w-xl leading-7 text-white/60">
                Handlare får ett mer fokuserat fordonsflöde och strukturerad
                information som gör det snabbare att bedöma, prioritera och
                lämna bud.
              </p>
            </article>
          </div>

          <div className="mt-4 grid gap-4 rounded-[24px] border border-[#b4d9ef]/20 bg-[#b4d9ef]/10 p-6 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-8">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-[#b4d9ef] text-[#202427]">
              <Handshake className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-xl tracking-[-0.03em]">Autorell i mitten</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
                Vi bygger tekniken, kvalitetssäkrar flödet och finns nära när
                en digital process behöver mänskligt stöd.
              </p>
            </div>
            <HeartHandshake className="hidden h-8 w-8 text-[#b4d9ef]/55 sm:block" />
          </div>
        </div>
      </section>

      <section className="bg-[#f3efe6] py-16 sm:py-24">
        <div className="mx-auto max-w-[1120px] px-5 text-center sm:px-8">
          <BadgeCheck className="mx-auto h-7 w-7 text-[#4f7f94]" />
          <h2 className="mx-auto mt-6 max-w-3xl text-[36px] leading-[1.05] tracking-[-0.048em] sm:text-5xl">
            Vi vill förtjäna nästa bilaffär, inte ta den för given.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl leading-8 text-[#65747a]">
            Börja med bilen eller ansök till handlarnätverket. Resten av
            upplevelsen ska visa varför Autorell är värt ett försök.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/salj-bil"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#242424] px-7 text-sm font-medium text-white"
            >
              Värdera din bil
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/kontakt"
              className="inline-flex min-h-14 items-center justify-center rounded-full border border-[#cfcac0] bg-white/65 px-7 text-sm font-medium"
            >
              Kontakta Autorell
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  )
}
