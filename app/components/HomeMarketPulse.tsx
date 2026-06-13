'use client'

import { useEffect, useState } from 'react'

const DURATION_MS = 4800
const demandRows = [
  { label: 'El & hybrid', minimum: 71, maximum: 82 },
  { label: 'SUV & crossover', minimum: 61, maximum: 71 },
  { label: 'Nyare premium', minimum: 55, maximum: 64 },
]

export default function HomeMarketPulse() {
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

  return (
    <div className="home-market-float absolute right-[3%] top-[31%] hidden w-[280px] rounded-[24px] border border-white/65 bg-white/72 p-4 shadow-[0_28px_80px_rgba(32,33,36,.13)] backdrop-blur-xl min-[1120px]:block xl:right-[6%] xl:w-[310px] xl:p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#66808d]">
            Autorell market pulse
          </p>
          <p className="mt-1.5 text-lg font-medium tracking-[-0.03em]">
            Europeisk efterfrågan
          </p>
        </div>
        <span className="flex items-center gap-2 rounded-full bg-[#edf7f1] px-3 py-1.5 text-[10px] font-medium text-[#3c7252]">
          <span className="home-live-dot h-2 w-2 rounded-full bg-[#76bb91]" />
          Aktiv
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {demandRows.map(({ label, maximum }, index) => (
          <div
            key={label}
            className="home-market-row rounded-[14px] border border-[#e2e8e8] bg-white/70 p-3.5"
            style={{ animationDelay: `${index * 0.7}s` }}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#53666f]">{label}</span>
              <strong className="min-w-8 text-right font-medium tabular-nums text-[#202124]">
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

      <p className="mt-4 text-[10px] leading-4 text-[#7a878c]">
        Illustrativ marknadssignal för aktuella fordonskategorier.
      </p>
    </div>
  )
}
