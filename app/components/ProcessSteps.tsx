'use client'

import { Banknote, CarFront, Globe2, Plus } from 'lucide-react'
import { useState } from 'react'

const steps = [
  {
    number: '01',
    icon: CarFront,
    title: 'Beskriv din bil',
    text: 'Fyll i registreringsnummer och några enkla uppgifter. Det tar bara ett par minuter.',
    details:
      'Du skapar en tydlig fordonsprofil med miltal, utrustning, skick, servicehistorik och bilder. Ju bättre underlag du lämnar, desto enklare blir det för handlarna att bedöma bilen och lämna ett seriöst bud.',
  },
  {
    number: '02',
    icon: Globe2,
    title: 'Vi hittar rätt köpare',
    text: 'Din bil presenteras för vårt kvalitetssäkrade nätverk av bilhandlare i Europa.',
    details:
      'Autorell matchar bilen med professionella handlare som söker just den typen av fordon. Det ger bilen större räckvidd än en vanlig lokal försäljning och skapar konkurrens mellan relevanta köpare.',
  },
  {
    number: '03',
    icon: Banknote,
    title: 'Du väljer erbjudande',
    text: 'När rätt bud kommer bestämmer du själv om du vill gå vidare. Enkelt och utan press.',
    details:
      'Efter budgivningen får du ett tydligt erbjudande. Du är aldrig skyldig att acceptera. När du är nöjd hjälper vi till med nästa steg så att betalning, dokumentation och överlämning blir så smidig som möjligt.',
  },
]

export default function ProcessSteps() {
  const [openStep, setOpenStep] = useState<number | null>(null)

  return (
    <div className="mt-14 grid items-start gap-5 lg:grid-cols-3">
      {steps.map(({ number, icon: Icon, title, text, details }, index) => {
        const isOpen = openStep === index

        return (
          <article
            key={number}
            className={`group relative overflow-hidden rounded-[18px] border bg-white p-8 transition-all duration-300 sm:p-10 ${
              isOpen
                ? 'border-[#B4D9EF] shadow-[0_20px_55px_rgba(32,33,36,.11)]'
                : 'border-[#dce5ee] shadow-[0_12px_40px_rgba(9,33,61,.05)] hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(9,33,61,.1)]'
            }`}
          >
            <div className="flex items-start justify-between">
              <span className="flex h-14 w-14 items-center justify-center rounded-[12px] bg-[#242424] text-white">
                <Icon className="h-6 w-6" />
              </span>
              <span className="text-5xl font-semibold tracking-[-0.06em] text-[#e7e6e1]">
                {number}
              </span>
            </div>

            <h3 className="mt-10 text-2xl tracking-[-0.025em] text-[#202124]">
              {title}
            </h3>
            <p className="mt-4 leading-7 text-[#657485]">{text}</p>

            <div
              className={`grid transition-[grid-template-rows,opacity] duration-300 ${
                isOpen ? 'mt-6 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <div className="border-t border-[#dce5e9] pt-6">
                  <p className="text-sm leading-7 text-[#47596a]">{details}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => setOpenStep(isOpen ? null : index)}
                aria-expanded={isOpen}
                aria-label={isOpen ? `Stäng information om ${title}` : `Läs mer om ${title}`}
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-full transition-all duration-300 ${
                  isOpen
                    ? 'rotate-45 bg-[#242424] text-white'
                    : 'bg-[#B4D9EF] text-[#242424] hover:scale-105 hover:bg-[#C9E6F6]'
                }`}
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </article>
        )
      })}
    </div>
  )
}
