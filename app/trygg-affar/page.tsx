import Link from 'next/link'
import { createPublicMetadata } from '@/lib/public-seo'
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Check,
  FileCheck2,
  Fingerprint,
  KeyRound,
  LockKeyhole,
  Scale,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react'
import PublicBreadcrumbs from '../components/PublicBreadcrumbs'
import PublicFooter from '../components/PublicFooter'
import PublicHeader from '../components/PublicHeader'

export const metadata = createPublicMetadata({
  title: 'Trygg bilaffär med verifierade handlare | Autorell',
  description:
    'Se hur Autorell skyddar dina uppgifter och skapar en tydlig process för fordonsdata, bud, kontroll, avtal, betalning och överlämning.',
  path: '/trygg-affar',
})

const safeguards = [
  {
    icon: LockKeyhole,
    title: 'Kontaktuppgifterna är privata',
    text: 'Telefonnummer och e-post visas inte för bilhandlarna under budgivningen. De bedömer fordonsprofilen, inte din identitet.',
    label: 'Integritet',
  },
  {
    icon: BadgeCheck,
    title: 'Köparna är verifierade',
    text: 'Budgivningen är avsedd för godkända professionella köpare med aktivt handlarkonto.',
    label: 'Motpart',
  },
  {
    icon: FileCheck2,
    title: 'Samma underlag för båda',
    text: 'Bilder, historik, skick och kända fel samlas i en deklaration som erbjudandet baseras på.',
    label: 'Fordonsdata',
  },
  {
    icon: Scale,
    title: 'Beslutet är alltid ditt',
    text: 'Registreringen är kostnadsfri. Du väljer själv om ett erbjudande är tillräckligt bra för att gå vidare.',
    label: 'Kontroll',
  },
  {
    icon: ShieldCheck,
    title: 'Bilen kontrolleras',
    text: 'Efter accept jämförs bilen och dokumentationen med uppgifterna som låg till grund för erbjudandet.',
    label: 'Verifiering',
  },
  {
    icon: Banknote,
    title: 'Överlämningen är spårbar',
    text: 'Avtal, betalningsstatus, hämtning och eventuell export ska vara tydliga innan bilen lämnas över.',
    label: 'Affär',
  },
]

const dealSteps = [
  ['Du beskriver bilen', 'Du lämnar fordonsuppgifter, bilder och kända avvikelser.'],
  [
    'Handlare bedömer profilen',
    'Verifierade köpare ser relevant fordonsdata, inte dina privata kontaktuppgifter.',
  ],
  [
    'Du granskar erbjudandet',
    'Bud, villkor och nästa steg presenteras innan du fattar beslut.',
  ],
  [
    'Uppgifterna verifieras',
    'Bilen kontrolleras mot deklarationen innan affären slutförs.',
  ],
  [
    'Affären dokumenteras',
    'Avtal, betalningsstatus och överlämning får en tydlig händelsekedja.',
  ],
]

export default function SafeDealPage() {
  return (
    <main className="overflow-hidden bg-[#f7f5f0] text-[#202124]">
      <PublicHeader />

      <section className="relative isolate overflow-hidden border-b border-[#dfe6e8] bg-[linear-gradient(145deg,#fbf8f1_0%,#edf6f9_58%,#e3f0f5_100%)]">
        <div className="trust-orbit absolute -left-44 -top-52 h-[560px] w-[560px] rounded-full border-[72px] border-white/55" />
        <div className="trust-orbit-reverse absolute -bottom-52 right-[-120px] h-[460px] w-[460px] rounded-full border-[62px] border-[#B4D9EF]/35" />
        <div className="absolute left-[46%] top-[12%] h-72 w-72 rounded-full bg-white/60 blur-3xl" />

        <div className="relative mx-auto max-w-[1320px] px-5 pb-16 pt-6 sm:px-8 sm:pb-24 lg:px-12 lg:pb-28">
          <PublicBreadcrumbs items={[{ label: 'Trygg affär' }]} />

          <div className="mt-14 grid min-w-0 gap-12 lg:mt-20 lg:grid-cols-[1.02fr_.98fr] lg:items-center lg:gap-20">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#c6dbe4] bg-white/75 px-4 py-2 text-xs font-medium text-[#496878] shadow-[0_10px_28px_rgba(60,84,96,.06)] backdrop-blur">
                <Sparkles className="h-4 w-4" />
                Trygghet byggd in i varje steg
              </span>
              <h1 className="mt-6 max-w-[760px] text-[39px] leading-[1.02] tracking-[-0.052em] [overflow-wrap:anywhere] min-[390px]:text-[41px] sm:text-6xl lg:text-[72px]">
                Du ska förstå affären innan du säger ja.
              </h1>
              <p className="mt-6 max-w-2xl break-words text-[16px] leading-8 text-[#58707c] sm:text-xl">
                Autorell skiljer på fordonsdata, personuppgifter och beslut.
                Därför vet du vem som ser vad, vad erbjudandet bygger på och
                vad som måste vara klart innan bilen lämnas över.
              </p>

              <div className="mt-8 flex min-w-0 flex-col gap-3 sm:flex-row">
                <Link
                  href="/salj-bil"
                  className="group inline-flex min-h-14 w-full items-center justify-between gap-4 rounded-[16px] bg-[#242424] pl-6 pr-3 text-sm font-medium text-white shadow-[0_16px_35px_rgba(32,33,36,.2)] transition hover:-translate-y-0.5 hover:bg-[#111] sm:w-auto sm:justify-center sm:rounded-full sm:px-7"
                >
                  Sälj din bil
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </Link>
                <a
                  href="#trygghetsflode"
                  className="inline-flex min-h-14 w-full items-center justify-center rounded-[16px] border border-[#bdcfd7] bg-white/75 px-7 text-sm font-medium backdrop-blur transition hover:bg-white sm:w-auto sm:rounded-full"
                >
                  Se trygghetsflödet
                </a>
              </div>

              <div className="mt-8 grid gap-3 border-t border-[#cad8df] pt-6 text-sm text-[#52646e] sm:grid-cols-3">
                {['Privata kontaktuppgifter', 'Verifierade handlare', 'Ditt beslut'].map(
                  (item) => (
                    <span key={item} className="flex items-center gap-2">
                      <Check className="h-4 w-4 shrink-0 text-[#4f8298]" />
                      {item}
                    </span>
                  ),
                )}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[560px]">
              <div className="absolute -inset-8 rounded-full bg-[#B4D9EF]/25 blur-3xl" />
              <div className="relative aspect-square rounded-full border border-white/90 bg-white/42 p-[9%] shadow-[0_34px_100px_rgba(61,91,104,.16)] backdrop-blur-md">
                <div className="trust-ring absolute inset-[7%] rounded-full border border-[#a8cfdf]/55" />
                <div className="trust-ring-delayed absolute inset-[19%] rounded-full border border-[#a8cfdf]/65" />

                <div className="relative grid h-full w-full place-items-center rounded-full border border-white bg-[radial-gradient(circle,#ffffff_0%,#f3f8fa_70%,#e5f1f6_100%)] shadow-[inset_0_0_55px_rgba(125,174,197,.12)]">
                  <div className="text-center">
                    <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#242424] text-[#B4D9EF] shadow-[0_18px_40px_rgba(32,33,36,.2)]">
                      <ShieldCheck className="h-9 w-9" />
                    </span>
                    <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#71818a]">
                      Autorell trygghetsflöde
                    </p>
                    <p className="mt-2 text-2xl tracking-[-0.04em]">
                      Data. Beslut. Affär.
                    </p>
                  </div>
                </div>

                <span className="trust-float absolute left-[3%] top-[18%] grid h-12 w-12 place-items-center rounded-full border border-white bg-white text-[#4f8298] shadow-[0_14px_35px_rgba(50,78,91,.13)]">
                  <Fingerprint className="h-5 w-5" />
                </span>
                <span className="trust-float-delayed absolute right-[1%] top-[35%] grid h-12 w-12 place-items-center rounded-full border border-white bg-white text-[#4f8298] shadow-[0_14px_35px_rgba(50,78,91,.13)]">
                  <UserCheck className="h-5 w-5" />
                </span>
                <span className="trust-float absolute bottom-[9%] left-[18%] grid h-12 w-12 place-items-center rounded-full border border-white bg-white text-[#4f8298] shadow-[0_14px_35px_rgba(50,78,91,.13)]">
                  <KeyRound className="h-5 w-5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-28">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <div className="grid gap-8 lg:grid-cols-[.76fr_1.24fr] lg:gap-20">
            <div className="lg:sticky lg:top-36 lg:self-start">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#71818a]">
                Sex lager av trygghet
              </p>
              <h2 className="mt-5 text-[36px] leading-[1.06] tracking-[-0.05em] sm:text-5xl">
                Det viktiga ska aldrig döljas i det finstilta.
              </h2>
              <p className="mt-6 text-base leading-8 text-[#65737b] sm:text-lg">
                Varje del svarar på en enkel fråga: vem ser uppgifterna, vad
                bygger budet på och när är det säkert att gå vidare?
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {safeguards.map(({ icon: Icon, title, text, label }, index) => (
                <article
                  key={title}
                  className="group relative min-h-[290px] overflow-hidden rounded-[22px] border border-[#e0e6e8] bg-[#fbfaf7] p-7 shadow-[0_18px_55px_rgba(32,33,36,.045)] transition duration-500 hover:-translate-y-1 hover:border-[#b9d6e2] hover:bg-white hover:shadow-[0_24px_65px_rgba(62,94,108,.1)]"
                >
                  <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#dceefa]/45 blur-2xl transition duration-500 group-hover:scale-125" />
                  <div className="relative flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-[#dceefa] text-[#294b5c] transition duration-500 group-hover:rotate-6 group-hover:bg-[#B4D9EF]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-[10px] font-medium tracking-[0.18em] text-[#9aa3a6]">
                      0{index + 1}
                    </span>
                  </div>
                  <p className="relative mt-9 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4f8298]">
                    {label}
                  </p>
                  <h3 className="relative mt-2 text-[23px] leading-tight tracking-[-0.04em]">
                    {title}
                  </h3>
                  <p className="relative mt-4 text-sm leading-7 text-[#68767c]">
                    {text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="trygghetsflode"
        className="scroll-mt-[124px] overflow-hidden bg-[#202124] py-16 text-white sm:py-28"
      >
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#B4D9EF]">
              Från biluppgifter till överlämning
            </p>
            <h2 className="mt-5 text-[36px] leading-[1.05] tracking-[-0.05em] sm:text-5xl">
              Fem tydliga kontrollpunkter.
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/60 sm:text-lg">
              Affären går vidare stegvis. Varje punkt måste ha rätt underlag
              innan nästa del börjar.
            </p>
          </div>

          <div className="relative mt-12">
            <div className="absolute bottom-0 left-[19px] top-0 w-px bg-white/10 lg:left-0 lg:right-0 lg:top-[19px] lg:h-px lg:w-auto">
              <span className="trust-line block h-full w-full origin-top bg-[linear-gradient(180deg,#B4D9EF,rgba(180,217,239,.05))] lg:origin-left lg:bg-[linear-gradient(90deg,#B4D9EF,rgba(180,217,239,.05))]" />
            </div>
            <div className="grid gap-8 lg:grid-cols-5 lg:gap-4">
              {dealSteps.map(([title, text], index) => (
                <article
                  key={title}
                  className="relative grid grid-cols-[40px_1fr] gap-5 lg:block"
                >
                  <span className="relative z-10 grid h-10 w-10 place-items-center rounded-full border border-[#B4D9EF]/40 bg-[#202124] text-xs font-medium text-[#B4D9EF] shadow-[0_0_0_7px_#202124]">
                    0{index + 1}
                  </span>
                  <div className="lg:mt-8 lg:pr-5">
                    <h3 className="text-xl tracking-[-0.035em]">{title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/55">{text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(135deg,#edf5f8_0%,#f7f2e8_100%)] py-16 sm:py-24">
        <div className="mx-auto max-w-[1120px] px-5 sm:px-8 lg:px-12">
          <div className="relative overflow-hidden rounded-[26px] border border-white bg-white/70 px-6 py-10 text-center shadow-[0_30px_85px_rgba(55,84,98,.1)] backdrop-blur sm:px-12 sm:py-16">
            <div className="absolute -left-20 -top-24 h-64 w-64 rounded-full border-[40px] border-[#B4D9EF]/25" />
            <div className="relative">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#242424] text-[#B4D9EF]">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <p className="mt-7 text-xs font-medium uppercase tracking-[0.2em] text-[#71818a]">
                Kostnadsfritt och utan bindning
              </p>
              <h2 className="mx-auto mt-4 max-w-3xl text-[36px] leading-[1.06] tracking-[-0.05em] sm:text-5xl">
                Se marknadens intresse utan att lämna ifrån dig beslutet.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#65737b]">
                Börja med bilens viktigaste uppgifter. Du väljer själv om och
                när ett erbjudande ska gå vidare.
              </p>
              <Link
                href="/salj-bil"
                className="group mt-8 inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#242424] px-7 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-[#111]"
              >
                Sälj din bil
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  )
}
