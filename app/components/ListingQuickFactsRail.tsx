'use client'

import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'
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
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollControls = useCallback(() => {
    const rail = railRef.current
    if (!rail) return

    const maximumScrollLeft = Math.max(0, rail.scrollWidth - rail.clientWidth)
    const leadingInset = Number.parseFloat(window.getComputedStyle(rail).paddingLeft) || 0
    setCanScrollLeft(rail.scrollLeft > leadingInset + 1)
    setCanScrollRight(rail.scrollLeft < maximumScrollLeft - 1)
  }, [])

  useEffect(() => {
    const rail = railRef.current
    if (!rail) return

    const frame = window.requestAnimationFrame(updateScrollControls)
    rail.addEventListener('scroll', updateScrollControls, { passive: true })
    window.addEventListener('resize', updateScrollControls)
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateScrollControls)
    observer?.observe(rail)
    Array.from(rail.children).forEach((child) => observer?.observe(child))

    return () => {
      window.cancelAnimationFrame(frame)
      rail.removeEventListener('scroll', updateScrollControls)
      window.removeEventListener('resize', updateScrollControls)
      observer?.disconnect()
    }
  }, [facts, updateScrollControls])

  function move(direction: -1 | 1) {
    railRef.current?.scrollBy({ left: direction * 320, behavior: 'smooth' })
  }

  return (
    <div className="hidden h-12 overflow-hidden rounded-[9px] border border-[#d7dee9] bg-white sm:flex">
      <div className="shrink-0 border-r border-[#e4eaf3]">{children}</div>
      <div className="relative min-w-0 flex-1">
        {canScrollLeft ? (
          <button
            type="button"
            onClick={() => move(-1)}
            aria-label="Scroll left"
            className="absolute left-2 top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-[#d0d5dd] bg-white text-[#344054] shadow-[0_2px_8px_rgba(16,24,40,.12)] transition hover:border-[#b9d5ff] hover:text-[#0866ff]"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        ) : null}
        <div ref={railRef} className="flex h-full snap-x items-stretch overflow-x-auto px-11 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {facts.map((fact) => {
            const FactIcon = quickFactIcons[fact.icon]

            return (
              <div key={`${fact.label}-${fact.value}`} aria-label={`${fact.label}: ${fact.value}`} className="flex min-w-[145px] snap-start items-center gap-2 border-r border-[#edf1f6] px-3 last:border-r-0">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[5px] bg-[#e2e7ee] text-[#344054]">
                  <FactIcon aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                </span>
                <span className="min-w-0 truncate text-[13px] font-normal leading-5 text-[#101828]">{fact.value}</span>
              </div>
            )
          })}
        </div>
        {canScrollRight ? (
          <button
            type="button"
            onClick={() => move(1)}
            aria-label="Scroll right"
            className="absolute right-2 top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-[#d0d5dd] bg-white text-[#344054] shadow-[0_2px_8px_rgba(16,24,40,.12)] transition hover:border-[#b9d5ff] hover:text-[#0866ff]"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
    </div>
  )
}
