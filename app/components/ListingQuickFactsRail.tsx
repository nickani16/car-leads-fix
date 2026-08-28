'use client'

import { type ReactNode, useRef } from 'react'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Fuel,
  Gauge,
  MapPin,
  Settings2,
} from 'lucide-react'

export type QuickFactIcon = 'calendar' | 'fuel' | 'gauge' | 'location' | 'settings'

type QuickFact = {
  label: string
  value: string
  icon: QuickFactIcon
}

const quickFactIcons = {
  calendar: CalendarDays,
  fuel: Fuel,
  gauge: Gauge,
  location: MapPin,
  settings: Settings2,
} satisfies Record<QuickFactIcon, typeof CalendarDays>

export default function ListingQuickFactsRail({
  facts,
  children,
}: {
  facts: QuickFact[]
  children: ReactNode
}) {
  const railRef = useRef<HTMLDivElement>(null)

  function move(direction: -1 | 1) {
    railRef.current?.scrollBy({ left: direction * 320, behavior: 'smooth' })
  }

  return (
    <div className="hidden h-12 overflow-hidden rounded-[9px] border border-[#d7dee9] bg-white sm:flex">
      <div className="shrink-0 border-r border-[#e4eaf3]">{children}</div>
      <div className="grid min-w-0 flex-1 grid-cols-[34px_minmax(0,1fr)_34px]">
        <button
          type="button"
          onClick={() => move(-1)}
          aria-label="Scroll left"
          className="grid place-items-center border-r border-[#edf1f6] bg-white text-[#475467] transition hover:bg-[#f8fafc] hover:text-[#0866ff]"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <div ref={railRef} className="flex h-full snap-x items-stretch overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {facts.map((fact) => {
            const FactIcon = quickFactIcons[fact.icon]

            return (
              <div key={`${fact.label}-${fact.value}`} aria-label={`${fact.label}: ${fact.value}`} className="flex min-w-[145px] snap-start items-center gap-2 border-r border-[#edf1f6] px-3 last:border-r-0">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[5px] bg-[#eef1f5] text-[#475467]">
                  <FactIcon aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                </span>
                <span className="min-w-0 truncate text-[14px] font-normal leading-5 text-[#101828]">{fact.value}</span>
              </div>
            )
          })}
        </div>
        <button
          type="button"
          onClick={() => move(1)}
          aria-label="Scroll right"
          className="grid place-items-center border-l border-[#edf1f6] bg-white text-[#475467] transition hover:bg-[#f8fafc] hover:text-[#0866ff]"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
