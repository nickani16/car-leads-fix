'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight, Mail } from 'lucide-react'

type QuickFact = {
  label: string
  value: string
}

export default function ListingQuickFactsRail({
  facts,
  requestLabel,
}: {
  facts: QuickFact[]
  requestLabel: string
}) {
  const railRef = useRef<HTMLDivElement>(null)

  function move(direction: -1 | 1) {
    railRef.current?.scrollBy({ left: direction * 320, behavior: 'smooth' })
  }

  return (
    <div className="hidden items-stretch gap-2 sm:flex">
      <a
        href="#listing-contact-card-desktop"
        className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-[10px] border border-[#aebbcf] bg-white px-4 text-sm font-semibold text-[#101828] transition hover:border-[#0866ff] hover:text-[#0866ff]"
      >
        <Mail className="h-4 w-4 text-[#0866ff]" aria-hidden="true" />
        {requestLabel}
      </a>
      <div className="grid min-w-0 flex-1 grid-cols-[36px_minmax(0,1fr)_36px] overflow-hidden rounded-[10px] border border-[#dfe6f2] bg-white">
        <button
          type="button"
          onClick={() => move(-1)}
          aria-label="Scroll left"
          className="grid place-items-center border-r border-[#e4eaf3] bg-white text-[#475467] transition hover:text-[#0866ff]"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div ref={railRef} className="flex h-full snap-x items-stretch overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {facts.map((fact) => (
            <div key={`${fact.label}-${fact.value}`} className="flex min-w-[150px] snap-start flex-col justify-center border-r border-[#edf1f6] px-4 py-2 last:border-r-0">
              <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#98a2b3]">{fact.label}</span>
              <span className="mt-0.5 truncate text-sm font-semibold text-[#101828]">{fact.value}</span>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => move(1)}
          aria-label="Scroll right"
          className="grid place-items-center border-l border-[#e4eaf3] bg-white text-[#475467] transition hover:text-[#0866ff]"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
