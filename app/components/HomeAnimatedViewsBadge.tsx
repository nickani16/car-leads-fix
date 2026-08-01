'use client'

import { useEffect, useMemo, useState } from 'react'
import { Eye } from 'lucide-react'

type HomeAnimatedViewsBadgeProps = {
  caption: string
  label: string
}

export default function HomeAnimatedViewsBadge({ caption, label }: HomeAnimatedViewsBadgeProps) {
  const [value, setValue] = useState(1)

  useEffect(() => {
    let animationFrame = 0
    let timeout = 0
    let index = 0
    const sequence = [18, 64, 118, 206, 341, 489, 657, 926, 801, 613, 402, 174]

    const animateToNext = (from: number) => {
      const target = sequence[index % sequence.length]
      index += 1
      const startedAt = performance.now()
      const duration = 3100

      const tick = (now: number) => {
        const progress = Math.min((now - startedAt) / duration, 1)
        const eased = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2
        const nextValue = Math.round(from + (target - from) * eased)
        setValue(nextValue)

        if (progress < 1) {
          animationFrame = window.requestAnimationFrame(tick)
          return
        }

        timeout = window.setTimeout(() => animateToNext(target), 840)
      }

      animationFrame = window.requestAnimationFrame(tick)
    }

    timeout = window.setTimeout(() => animateToNext(18), 340)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.clearTimeout(timeout)
    }
  }, [])

  const formatted = useMemo(() => new Intl.NumberFormat('sv-SE').format(value), [value])

  return (
    <div className="relative z-10 inline-flex max-w-full items-center gap-2.5 text-[12px] font-medium uppercase tracking-[.2em] text-[#0866ff]">
      <span className="relative grid h-6 w-6 shrink-0 place-items-center">
        <span className="absolute inset-0 rounded-full bg-[#0866ff]/10" aria-hidden="true" />
        <span className="absolute inset-0 rounded-full border border-[#0866ff]/25 opacity-70 [animation:pulse_2.8s_ease-in-out_infinite]" aria-hidden="true" />
        <span className="relative grid h-5 w-5 place-items-center rounded-full bg-white text-[#0866ff] shadow-[0_4px_14px_rgba(8,102,255,.16)]">
          <Eye className="h-[14px] w-[14px] stroke-[2]" aria-hidden="true" />
        </span>
      </span>
      <span className="min-w-0 truncate leading-none">
        <span className="align-middle">
          {caption}
        </span>
        <span className="ml-2 inline-flex min-w-0 items-center rounded-full bg-[#0866ff]/[0.055] px-2 py-1 tracking-[.12em]">
          <span className="tabular-nums transition-colors duration-300">{formatted}</span>
          <span className="ml-1 truncate">{label}</span>
          <span className="ml-1.5 h-3 w-px animate-pulse rounded-full bg-[#0866ff]/80" aria-hidden="true" />
        </span>
      </span>
    </div>
  )
}
