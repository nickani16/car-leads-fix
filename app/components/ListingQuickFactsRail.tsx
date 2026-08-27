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
    <div className="hidden h-[52px] items-stretch gap-2 sm:flex">
      <div className="shrink-0">{children}</div>
      <div className="grid min-w-0 flex-1 grid-cols-[32px_minmax(0,1fr)_32px] overflow-hidden rounded-[9px] border border-[#dfe6f2] bg-white">
        <button
          type="button"
          onClick={() => move(-1)}
          aria-label="Scroll left"
          className="grid place-items-center border-r border-[#e4eaf3] bg-white text-[#475467] transition hover:text-[#0866ff]"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <div ref={railRef} className="flex h-full snap-x items-stretch overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {facts.map((fact) => {
            const FactIcon = quickFactIcons[fact.icon]

            return (
              <div key={`${fact.label}-${fact.value}`} className="flex min-w-[160px] snap-start items-center gap-2.5 border-r border-[#edf1f6] px-3 py-1.5 last:border-r-0">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[6px] bg-[#eef1f5] text-[#475467]">
                  <FactIcon aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[9px] font-normal uppercase tracking-[0.1em] text-[#98a2b3]">{fact.label}</span>
                  <span className="mt-0.5 block truncate text-[13px] font-normal leading-4 text-[#101828]">{fact.value}</span>
                </span>
              </div>
            )
          })}
        </div>
        <button
          type="button"
          onClick={() => move(1)}
          aria-label="Scroll right"
          className="grid place-items-center border-l border-[#e4eaf3] bg-white text-[#475467] transition hover:text-[#0866ff]"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
