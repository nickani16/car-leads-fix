import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  FileCheck2,
  LockKeyhole,
  Scale,
  ShieldCheck,
} from 'lucide-react'
import PublicBreadcrumbs from '../components/PublicBreadcrumbs'
import PublicFooter from '../components/PublicFooter'
import PublicHeader from '../components/PublicHeader'

export const metadata: Metadata = {
  title: 'Trygg affär för dig som säljer bil | Autorell',
  description:
    'Så skyddar Autorell dina uppgifter och skapar en tydlig process för bud, kontroll, avtal, betalning och hämtning.',
}

const safeguards = [
  {
    icon: LockKeyhole,
    title: 'Dina kontaktuppgifter skyddas',
    text: 'Telefonnummer och e-post visas inte för bilhandlarna under budgivningen. De bedömer bilen utifrån fordonsprofilen.',
  },
  {
    icon: BadgeCheck,
    title: 'Endast verifierade handlare',
    text: 'Budgivningen är avsedd för godkända professionella köpare med ett aktivt handlarkonto.',
  },
  {
    icon: FileCheck2,
    title: 'Samma deklaration för båda parter',
    text: 'Bilder, historik, skick och kända fel samlas i ett tydligt underlag som budet baseras på.',
  },
  {
    icon: Scale,
    title: 'Du bestämmer om du säljer',
    text: 'Registreringen är kostnadsfri och du är inte skyldig att acceptera ett bud som inte känns rätt.',
  },
  {
    icon: ShieldCheck,
    title: 'Kontroll före slutförd affär',
    text: 'Efter accept jämförs bilen och dokumentationen med uppgifterna som låg till grund för erbjudandet.',
  },
  {
    icon: Banknote,
    title: 'Tydlig betalningsstatus',
    text: 'Avtal, betalning, hämtning och eventuell export ska ha dokumenterad status innan bilen lämnas över.',
  },
]

export default function SafeDealPage() {
  return (
    <main className="overflow-hidden bg-[#f7f5f0] text-[#202124]">
      <PublicHeader />

      <section className="relative overflow-hidden border-b border-[#dfe6e8] bg-[linear-gradient(145deg,#fbf8f1_0%,#edf6f9_58%,#e3f0f5_100%)]">
        <div className="absolute -left-40 -top-48 h-[520px] w-[520px] rounded-full border-[68px] border-white/55" />
        <div className="relative mx-auto max-w-[1320px] px-5 pb-20 pt-6 sm:px-8 sm:pb-28 lg:px-12">
          <PublicBreadcrumbs items={[{ label: 'Trygg affär' }]} />
          <div className="max-w-4xl pt-14 sm:pt-20">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#647b86]">
              För dig som säljer bil
            </p>
            <h1 className="mt-5 text-[44px] leading-[1.01] tracking-[-0.055em] sm:text-6xl lg:text-[76px]">
              En trygg affär börjar med tydliga spelregler.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#58707c]">
              Autorell bygger processen så att du vet vem som ser uppgifterna,
              vad budet baseras på och vad som händer innan bilen lämnas över.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-28">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {safeguards.map(({ icon: Icon, title, text }, index) => (
              <article
                key={title}
                className="rounded-[22px] border border-[#deddd7] bg-white p-6 shadow-[0_18px_55px_rgba(32,33,36,.05)] sm:p-8"
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-[#dceefa] text-[#294b5c]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-xs text-[#9aa3a6]">0{index + 1}</span>
                </div>
                <h2 className="mt-7 text-2xl tracking-[-0.035em]">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-[#68767c]">{text}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 flex flex-col justify-between gap-6 rounded-[24px] bg-[#242424] px-7 py-8 text-white sm:flex-row sm:items-center sm:px-10">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#b4d9ef]">
                Kontrollera bilen kostnadsfritt
              </p>
              <p className="mt-2 text-2xl tracking-[-0.03em]">
                Du behåller beslutet hela vägen.
              </p>
            </div>
            <Link
              href="/salj-bil"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#b4d9ef] px-6 text-sm font-medium text-[#242424]"
            >
              Starta bilkontrollen
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  )
}
