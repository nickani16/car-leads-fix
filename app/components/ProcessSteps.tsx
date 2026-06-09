'use client'

import {
  ArrowRight,
  Banknote,
  CarFront,
  Check,
  Globe2,
  Plus,
} from 'lucide-react'
import { useState } from 'react'

const steps = [
  {
    number: '01',
    icon: CarFront,
    eyebrow: 'Fordonsprofil',
    title: 'Beskriv din bil',
    text: 'Fyll i registreringsnummer och några enkla uppgifter. Det tar bara ett par minuter.',
    details:
      'Du skapar en tydlig fordonsprofil med miltal, utrustning, skick, servicehistorik och bilder. Ju bättre underlag du lämnar, desto enklare blir det för handlarna att bedöma bilen och lämna ett seriöst bud.',
    highlights: ['Cirka 3 minuter', 'Kostnadsfritt'],
    accent: 'bg-[#dceefa]',
    iconStyle: 'bg-[#b4d9ef] text-[#20333e]',
  },
  {
    number: '02',
    icon: Globe2,
    eyebrow: 'Europeisk räckvidd',
    title: 'Vi hittar rätt köpare',
    text: 'Din bil presenteras för vårt kvalitetssäkrade nätverk av bilhandlare i Europa.',
    details:
      'Autorell matchar bilen med professionella handlare som söker just den typen av fordon. Det ger bilen större räckvidd än en vanlig lokal försäljning och skapar konkurrens mellan relevanta köpare.',
    highlights: ['Verifierade handlare', '24 timmars budgivning'],
    accent: 'bg-[#e8e3d8]',
    iconStyle: 'bg-[#242424] text-white',
  },
  {
    number: '03',
    icon: Banknote,
    eyebrow: 'Ditt beslut',
    title: 'Du väljer erbjudande',
    text: 'När rätt bud kommer bestämmer du själv om du vill gå vidare. Enkelt och utan press.',
    details:
      'Efter budgivningen får du ett tydligt erbjudande. Du är aldrig skyldig att acceptera. När du är nöjd hjälper vi till med nästa steg så att betalning, dokumentation och överlämning blir så smidig som möjligt.',
    highlights: ['Ingen bindning', 'Personlig support'],
    accent: 'bg-[#dfe9e3]',
    iconStyle: 'bg-[#d5e7dc] text-[#20372b]',
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

      <div className="grid items-start gap-4 lg:grid-cols-3 lg:gap-5">
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
                className={`group relative overflow-hidden rounded-[22px] border bg-white transition-all duration-300 sm:rounded-[26px] ${
                  isOpen
                    ? 'border-[#9fc8dc] shadow-[0_28px_80px_rgba(32,33,36,.13)]'
                    : 'border-white/80 shadow-[0_18px_55px_rgba(32,33,36,.075)] hover:-translate-y-1.5 hover:shadow-[0_28px_70px_rgba(32,33,36,.11)]'
                }`}
              >
                <div className={`h-2 w-full ${accent}`} />

                <div className="relative p-6 sm:p-8 lg:min-h-[390px] lg:p-9">
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

                  <div className="mt-6 flex flex-wrap gap-2">
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
                    className="mt-7 flex w-full items-center justify-between border-t border-[#e2e8ea] pt-5 text-sm font-medium text-[#28373d]"
                  >
                    <span>{isOpen ? 'Visa mindre' : 'Läs mer om steget'}</span>
                    <span
                      className={`grid h-9 w-9 place-items-center rounded-full transition-all duration-300 ${
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
        <span>Beskriv</span>
        <ArrowRight className="h-3.5 w-3.5" />
        <span>Matcha</span>
        <ArrowRight className="h-3.5 w-3.5" />
        <span>Välj</span>
      </div>
    </div>
  )
}
