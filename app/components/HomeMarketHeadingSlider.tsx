'use client'

import { useEffect, useMemo, useState } from 'react'

type HomeMarketHeadingSliderProps = {
  headings: string[]
  className?: string
}

const SLIDE_INTERVAL_MS = 2600

export default function HomeMarketHeadingSlider({
  headings,
  className = '',
}: HomeMarketHeadingSliderProps) {
  const items = useMemo(
    () => Array.from(new Set(headings.map((heading) => heading.trim()).filter(Boolean))),
    [headings],
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

  const activeHeading = items[index] || headings[0] || ''

  return (
    <h2
      className={`home-market-heading min-h-[2.18em] overflow-hidden text-[20px] font-semibold leading-[1.09] tracking-normal text-white min-[390px]:text-[21px] sm:text-[38px] lg:text-[48px] xl:text-[54px] ${className}`}
      aria-label={activeHeading}
    >
      <span key={activeHeading} className="home-market-heading-slide block">
        {activeHeading}
      </span>
    </h2>
  )
}
