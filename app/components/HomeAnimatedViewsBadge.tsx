'use client'

import { useEffect, useMemo, useState } from 'react'
import { Eye } from 'lucide-react'

type HomeAnimatedViewsBadgeProps = {
  caption: string
  label: string
  context: string
}

export default function HomeAnimatedViewsBadge({ caption, label, context }: HomeAnimatedViewsBadgeProps) {
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
    <div
      className="relative z-10 flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-medium uppercase leading-5 tracking-[.16em] text-[#0866ff]"
      aria-label={`${caption}: ${formatted} ${label} ${context}`}
    >
      <Eye className="h-4 w-4 shrink-0 stroke-[2]" aria-hidden="true" />
      <span className="tabular-nums">{formatted}</span>
      <span>{label}</span>
      <span>{context}</span>
    </div>
  )
}
