'use client'

import { useEffect, useMemo, useState } from 'react'

type HomeMarketHeadingSliderProps = {
  lead?: string
  terms: string[]
  tail?: string
  className?: string
}

const SLIDE_INTERVAL_MS = 2600

export default function HomeMarketHeadingSlider({
  lead = '',
  terms,
  tail = '',
  className = '',
}: HomeMarketHeadingSliderProps) {
  const items = useMemo(
    () => Array.from(new Set(terms.map((term) => term.trim()).filter(Boolean))),
    [terms],
  )
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (items.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const interval = window.setInterval(() => {
      setIndex((current) => (current + 1) % items.length)
    }, SLIDE_INTERVAL_MS)

    return () => window.clearInterval(interval)
  }, [items.length])

  const activeTerm = items[index] || terms[0] || ''
  const accessibleHeading = `${lead}${activeTerm}${tail}`.trim()

  return (
    <h2
      className={`home-market-heading min-h-[2.18em] text-[20px] font-semibold leading-[1.09] tracking-normal text-white min-[390px]:text-[21px] sm:text-[38px] lg:text-[48px] xl:text-[54px] ${className}`}
      aria-label={accessibleHeading}
    >
      {lead ? <span>{lead}</span> : null}
      <span className="home-market-heading-term inline-block overflow-hidden align-bottom">
        <span key={activeTerm} className="home-market-heading-slide inline-block">
          {activeTerm}
        </span>
      </span>
      {tail ? <span>{tail}</span> : null}
    </h2>
  )
}
