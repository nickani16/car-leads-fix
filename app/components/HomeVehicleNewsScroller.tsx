'use client'

import { useRef, type ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'

type HomeVehicleNewsScrollerProps = {
  title: string
  allNewsHref: string
  allNewsLabel: string
  scrollLabel: string
  children: ReactNode
}

export default function HomeVehicleNewsScroller({
  title,
  allNewsHref,
  allNewsLabel,
  scrollLabel,
  children,
}: HomeVehicleNewsScrollerProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null)

  function scrollNews(direction: -1 | 1) {
    const scroller = scrollerRef.current
    if (!scroller) return

    scroller.scrollBy({
      left: direction * Math.max(280, Math.round(scroller.clientWidth * 0.86)),
      behavior: 'smooth',
    })
  }

  return (
    <>
      <div className="flex items-end justify-between gap-5">
        <div className="flex items-center gap-3">
          <h2 className="text-[24px] font-semibold leading-tight tracking-[-0.02em] sm:text-[32px] sm:tracking-[-0.03em]">
            {title}
          </h2>
          <div className="flex items-center gap-2 sm:hidden" aria-label={scrollLabel}>
            <button
              type="button"
              onClick={() => scrollNews(-1)}
              aria-label={`${scrollLabel}: previous`}
              className="grid h-8 w-8 place-items-center rounded-full border border-[#d7e5ff] bg-white text-[#0866ff] transition active:scale-95"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2.2} />
            </button>
            <button
              type="button"
              onClick={() => scrollNews(1)}
              aria-label={`${scrollLabel}: next`}
              className="grid h-8 w-8 place-items-center rounded-full border border-[#d7e5ff] bg-white text-[#0866ff] transition active:scale-95"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
            </button>
          </div>
        </div>
        <Link
          href={allNewsHref}
          className="hidden items-center gap-2 text-sm font-semibold text-[#0866ff] sm:inline-flex"
        >
          {allNewsLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div
        ref={scrollerRef}
        className="mt-5 flex snap-x gap-4 overflow-x-auto scroll-smooth pb-2 sm:mt-7 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0"
      >
        {children}
      </div>
    </>
  )
}
