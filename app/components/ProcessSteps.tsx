'use client'

import {
  ArrowRight,
  Banknote,
  CarFront,
  Check,
  FileCheck2,
  Globe2,
  Plus,
  ShieldCheck,
  Truck,
} from 'lucide-react'
import { useState } from 'react'

const steps = [
  {
    number: '01',
    icon: CarFront,
    eyebrow: 'Kvalificering',
    title: 'Registrera bilen',
    text: 'Börja med bilens viktigaste uppgifter. Formuläret visar om den matchar vår aktuella köpbox och efterfrågan i nätverket.',
    details:
      'Den första kontrollen säkerställer att bilen finns i Sverige, är körbar och saknar allvarliga motor-, växellåds-, läckage- eller krockproblem.',
    highlights: ['Svenskt ursprung', 'Tydlig köpbox'],
    accent: 'bg-[#dceefa]',
    iconStyle: 'bg-[#b4d9ef] text-[#20333e]',
  },
  {
    number: '02',
    icon: FileCheck2,
    eyebrow: 'Fordonsdeklaration',
    title: 'Beskriv bilen korrekt',
    text: 'Utrustning, service, skick, kända fel och bilder samlas i en strukturerad fordonsprofil.',
    details:
      'Deklarationen blir underlaget för handlarnas bud och följer med i affären. Konkreta uppgifter minskar osäkerheten för både säljare och köpare.',
    highlights: ['Tydliga uppgifter', 'Obligatoriska bilder'],
    accent: 'bg-[#e8e3d8]',
    iconStyle: 'bg-[#242424] text-white',
  },
  {
    number: '03',
    icon: Globe2,
    eyebrow: 'Europeisk budgivning',
    title: 'Handlare budar i 24 timmar',
    text: 'Kvalificerade svenska och europeiska handlare bedömer bilen och konkurrerar om den.',
    details:
      'Bilen visas endast för verifierade professionella köpare. Buden baseras på fordonsprofilen och gäller under förutsättning att uppgifterna stämmer.',
    highlights: ['Verifierade handlare', 'Villkorade bud'],
    accent: 'bg-[#dfe9e3]',
    iconStyle: 'bg-[#d5e7dc] text-[#20372b]',
  },
  {
    number: '04',
    icon: Banknote,
    eyebrow: 'Ditt beslut',
    title: 'Acceptera eller avstå',
    text: 'Efter marknadsbedömningen väljer du själv om Autorells villkorade inköpserbjudande är tillräckligt bra.',
    details:
      'Du är aldrig skyldig att sälja. Om du accepterar skapas nästa del av affären med dokumentation, villkor och tydlig status för båda parter.',
    highlights: ['Ingen skyldighet', 'Tydligt nettopris'],
    accent: 'bg-[#efe6d6]',
    iconStyle: 'bg-[#eadcc2] text-[#574b38]',
  },
  {
    number: '05',
    icon: ShieldCheck,
    eyebrow: 'Kontroll och betalning',
    title: 'Bilen jämförs med deklarationen',
    text: 'Efter acceptans kontrolleras att bilen motsvarar uppgifterna som budet baserades på.',
    details:
      'Om bilen stämmer fortsätter affären enligt avtalet. Vid en väsentlig avvikelse kan affären pausas, justeras genom en ny överenskommelse eller avbrytas.',
    highlights: ['Villkorad kontroll', 'Dokumenterat underlag'],
    accent: 'bg-[#dceefa]',
    iconStyle: 'bg-[#b4d9ef] text-[#20333e]',
  },
  {
    number: '06',
    icon: Truck,
    eyebrow: 'Hämtning och export',
    title: 'Bilen lämnar Sverige',
    text: 'När affären är godkänd samordnas hämtning, dokumentation och transport till köparen.',
    details:
      'Autorell bygger flödet för gränsöverskridande affärer. Status för betalning, hämtning och dokument ska vara tydlig för säljare, köpare och administration.',
    highlights: ['Svenskt ursprung', 'Europeisk köpare'],
    accent: 'bg-[#e8e3d8]',
    iconStyle: 'bg-[#242424] text-white',
  },
]

export default function ProcessSteps() {
  const [openStep, setOpenStep] = useState<number | null>(null)

  return (
    <div className="relative mt-12 sm:mt-16">
      <div
        className="absolute left-[12%] right-[12%] top-[36px] hidden h-px bg-[#bdcdd4] lg:block"
        aria-hidden="true"
      />

      <div className="grid items-stretch gap-4 lg:grid-cols-3 lg:gap-5">
        {steps.map(
          (
            {
              number,
              icon: Icon,
              eyebrow,
              title,
              text,
              details,
              highlights,
              accent,
              iconStyle,
            },
            index,
          ) => {
            const isOpen = openStep === index

            return (
              <article
                key={number}
                className={`group relative h-full overflow-hidden rounded-[22px] border bg-white transition-all duration-300 sm:rounded-[26px] ${
                  isOpen
                    ? 'border-[#9fc8dc] shadow-[0_28px_80px_rgba(32,33,36,.13)]'
                    : 'border-white/80 shadow-[0_18px_55px_rgba(32,33,36,.075)] hover:-translate-y-1.5 hover:shadow-[0_28px_70px_rgba(32,33,36,.11)]'
                }`}
              >
                <div className={`h-2 w-full ${accent}`} />

                <div className="relative flex h-full flex-col p-6 sm:p-8 lg:min-h-[390px] lg:p-9">
                  <div className="flex items-center justify-between">
                    <span
                      className={`relative z-10 grid h-[72px] w-[72px] place-items-center rounded-full border-[7px] border-[#eef5f7] ${iconStyle}`}
                    >
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="text-[52px] font-semibold leading-none tracking-[-0.08em] text-[#e2e7e8] sm:text-[64px]">
                      {number}
                    </span>
                  </div>

                  <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#71828a]">
                    {eyebrow}
                  </p>
                  <h3 className="mt-3 text-[25px] leading-[1.12] tracking-[-0.035em] text-[#202124] sm:text-[28px]">
                    {title}
                  </h3>
                  <p className="mt-4 min-h-[84px] text-[15px] leading-7 text-[#5d6e76]">
                    {text}
                  </p>

                  <div className="mt-6 flex flex-wrap content-start gap-2 lg:min-h-[58px]">
                    {highlights.map((highlight) => (
                      <span
                        key={highlight}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#dce5e8] bg-[#f8faf9] px-3 py-1.5 text-[11px] font-medium text-[#51636b]"
                      >
                        <Check className="h-3 w-3 text-[#4d879f]" />
                        {highlight}
                      </span>
                    ))}
                  </div>

                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ${
                      isOpen
                        ? 'mt-7 grid-rows-[1fr] opacity-100'
                        : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="border-t border-[#e0e7e9] pt-6 text-sm leading-7 text-[#455a63]">
                        {details}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOpenStep(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="mt-auto flex w-full items-center justify-between border-t border-[#e2e8ea] pt-5 text-sm font-medium text-[#28373d]"
                  >
                    <span>{isOpen ? 'Visa mindre' : 'Läs mer om steget'}</span>
                    <span
                      className={`grid h-9 w-9 place-items-center rounded-[10px] transition-all duration-300 ${
                        isOpen
                          ? 'rotate-45 bg-[#242424] text-white'
                          : 'bg-[#e8f3f8] text-[#315d70] group-hover:translate-x-0.5'
                      }`}
                    >
                      <Plus className="h-4 w-4" />
                    </span>
                  </button>
                </div>
              </article>
            )
          },
        )}
      </div>

      <div className="mt-5 flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[#73848b] lg:hidden">
        <span>Kvalificera</span>
        <ArrowRight className="h-3.5 w-3.5" />
        <span>Bud</span>
        <ArrowRight className="h-3.5 w-3.5" />
        <span>Export</span>
      </div>
    </div>
  )
}
