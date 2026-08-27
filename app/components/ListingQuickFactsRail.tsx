'use client'

import { type ReactNode, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type QuickFact = {
  label: string
  value: string
}

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
    <div className="hidden h-11 items-stretch gap-2 sm:flex">
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
          {facts.map((fact) => (
            <div key={`${fact.label}-${fact.value}`} className="flex min-w-[132px] snap-start flex-col justify-center border-r border-[#edf1f6] px-3 py-1.5 last:border-r-0">
              <span className="text-[9px] font-normal uppercase tracking-[0.1em] text-[#98a2b3]">{fact.label}</span>
              <span className="mt-0.5 truncate text-[13px] font-normal text-[#101828]">{fact.value}</span>
            </div>
          ))}
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
