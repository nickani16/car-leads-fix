'use client'

import { useEffect, useState } from 'react'

type BuyerLocale = 'de' | 'en'

const DURATION_MS = 4800

const pulseContent = {
  de: {
    eyebrow: 'Autorell Market Pulse',
    title: 'Nachfrage im Händlernetzwerk',
    live: 'Aktiv',
    rows: [
      { label: 'Elektro & Hybrid', minimum: 72, maximum: 84 },
      { label: 'SUV & Crossover', minimum: 63, maximum: 74 },
      { label: 'Jüngere Fahrzeuge', minimum: 57, maximum: 68 },
    ],
    note: 'Illustrative Marktsignale für aktuell gefragte Fahrzeugkategorien.',
  },
  en: {
    eyebrow: 'Autorell Market Pulse',
    title: 'Demand across the dealer network',
    live: 'Active',
    rows: [
      { label: 'Electric & hybrid', minimum: 72, maximum: 84 },
      { label: 'SUV & crossover', minimum: 63, maximum: 74 },
      { label: 'Newer vehicles', minimum: 57, maximum: 68 },
    ],
    note: 'Illustrative market signals for vehicle categories currently in demand.',
  },
} as const

export default function BuyerHeroMarketPulse({
  locale,
}: {
  locale: BuyerLocale
}) {
  const content = pulseContent[locale]
  const [values, setValues] = useState<number[]>(() =>
    content.rows.map(({ maximum }) => maximum)
  )

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    )

    if (reducedMotion.matches) return

    let animationFrame = 0
    let startTime: number | null = null
    let previousValues: number[] = content.rows.map(
      ({ maximum }) => maximum
    )

    const animate = (time: number) => {
      startTime ??= time
      const cycle = ((time - startTime) % DURATION_MS) / DURATION_MS
      const progress = (1 - Math.cos(cycle * Math.PI * 2)) / 2
      const nextValues = content.rows.map(({ minimum, maximum }) =>
        Math.round(minimum + (maximum - minimum) * progress)
      )

      if (nextValues.some((value, index) => value !== previousValues[index])) {
        previousValues = nextValues
        setValues(nextValues)
      }

      animationFrame = window.requestAnimationFrame(animate)
    }

    animationFrame = window.requestAnimationFrame(animate)
    return () => window.cancelAnimationFrame(animationFrame)
  }, [content.rows])

  return (
    <aside className="home-market-float relative z-10 w-full min-w-0 max-w-[390px] justify-self-center rounded-[26px] border border-white/70 bg-white/78 p-4 shadow-[0_28px_80px_rgba(23,31,35,.18)] backdrop-blur-xl sm:p-5 lg:justify-self-end">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#66808d]">
            {content.eyebrow}
          </p>
          <p className="mt-1.5 text-lg font-medium leading-6 tracking-[-0.03em] text-[#202124]">
            {content.title}
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-2 rounded-full bg-[#edf7f1] px-3 py-1.5 text-[10px] font-medium text-[#3c7252]">
          <span className="home-live-dot h-2 w-2 rounded-full bg-[#76bb91]" />
          {content.live}
        </span>
      </div>

      <div className="mt-5 space-y-2.5">
        {content.rows.map(({ label, maximum }, index) => (
          <div
            key={label}
            className="home-market-row rounded-[15px] border border-[#e2e8e8] bg-white/74 p-3.5"
            style={{ animationDelay: `${index * 0.7}s` }}
          >
            <div className="flex items-center justify-between gap-4 text-xs">
              <span className="text-[#53666f]">{label}</span>
              <strong className="min-w-9 text-right font-medium tabular-nums text-[#202124]">
                {values[index]}%
              </strong>
            </div>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#e8edef]">
              <span
                className="home-demand-bar block h-full rounded-full bg-[#8ec5df]"
                style={{ width: `${maximum}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3.5 text-[9px] leading-4 text-[#7a878c] sm:text-[10px]">
        {content.note}
      </p>
    </aside>
  )
}
