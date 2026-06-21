'use client'

import { useEffect, useState } from 'react'

const DURATION_MS = 4800
const demandRows = [
  { label: 'El & hybrid', minimum: 71, maximum: 82 },
  { label: 'SUV & crossover', minimum: 61, maximum: 71 },
  { label: 'Nyare premium', minimum: 55, maximum: 64 },
]

export default function HomeMarketPulse({
  variant = 'card',
}: {
  variant?: 'card' | 'strip'
}) {
  const [values, setValues] = useState(() =>
    demandRows.map(({ maximum }) => maximum)
  )

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    )

    if (reducedMotion.matches) return

    let animationFrame = 0
    let startTime: number | null = null
    let previousValues = demandRows.map(({ maximum }) => maximum)

    const animate = (time: number) => {
      startTime ??= time
      const cycle = ((time - startTime) % DURATION_MS) / DURATION_MS
      const progress = (1 - Math.cos(cycle * Math.PI * 2)) / 2
      const nextValues = demandRows.map(({ minimum, maximum }) =>
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
  }, [])

  if (variant === 'strip') {
    return (
      <aside className="home-market-float w-full overflow-hidden rounded-[20px] border border-white/75 bg-white/82 p-4 shadow-[0_24px_65px_rgba(23,31,35,.15)] backdrop-blur-xl sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex min-w-[180px] items-center justify-between gap-4 sm:block">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#6d716e]">
                Autorell market pulse
              </p>
              <p className="mt-1 text-sm font-medium tracking-[-0.02em]">
                Efterfrågan i EU
              </p>
            </div>
            <span className="flex items-center gap-2 rounded-full bg-[#edf7f1] px-3 py-1.5 text-[10px] font-medium text-[#3c7252] sm:mt-3 sm:w-fit">
              <span className="home-live-dot h-2 w-2 rounded-full bg-[#76bb91]" />
              Aktiv
            </span>
          </div>
          <div className="grid flex-1 gap-2 sm:grid-cols-3">
            {demandRows.map(({ label, maximum }, index) => (
              <div
                key={label}
                className="home-market-row rounded-[13px] border border-[#e2e8e8] bg-white/80 px-3.5 py-3"
                style={{ animationDelay: `${index * 0.7}s` }}
              >
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="truncate text-[#606560]">{label}</span>
                  <strong className="font-medium tabular-nums">
                    {values[index]}%
                  </strong>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#e8edef]">
                  <span
                    className="home-demand-bar block h-full rounded-full bg-[#a9c8b1]"
                    style={{ width: `${maximum}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    )
  }

  return (
    <aside className="home-market-float relative z-10 w-full min-w-0 max-w-[390px] justify-self-center rounded-[26px] border border-white/70 bg-white/78 p-4 shadow-[0_28px_80px_rgba(23,31,35,.18)] backdrop-blur-xl sm:p-5 lg:justify-self-end">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#6d716e]">
            Autorell market pulse
          </p>
          <p className="mt-1.5 text-lg font-medium leading-6 tracking-[-0.03em]">
            Europeisk efterfrågan
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-2 rounded-full bg-[#edf7f1] px-3 py-1.5 text-[10px] font-medium text-[#3c7252]">
          <span className="home-live-dot h-2 w-2 rounded-full bg-[#76bb91]" />
          Aktiv
        </span>
      </div>

      <div className="mt-5 space-y-2.5">
        {demandRows.map(({ label, maximum }, index) => (
          <div
            key={label}
            className="home-market-row rounded-[15px] border border-[#e2e8e8] bg-white/74 p-3.5"
            style={{ animationDelay: `${index * 0.7}s` }}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#606560]">{label}</span>
              <strong className="min-w-8 text-right font-medium tabular-nums text-[#202124]">
                {values[index]}%
              </strong>
            </div>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#e8edef]">
              <span
                className="home-demand-bar block h-full rounded-full bg-[#a9c8b1]"
                style={{ width: `${maximum}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3.5 text-[9px] leading-4 text-[#7b7d78] sm:text-[10px]">
        Illustrativ marknadssignal för aktuella fordonskategorier.
      </p>
    </aside>
  )
}
