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
    const sequence = [1, 82, 148, 226, 354, 517, 689, 926, 744, 566, 319, 126]

    const animateToNext = (from: number) => {
      const target = sequence[index % sequence.length]
      index += 1
      const startedAt = performance.now()
      const duration = 2600

      const tick = (now: number) => {
        const progress = Math.min((now - startedAt) / duration, 1)
        const eased = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2
        const nextValue = Math.round(from + (target - from) * eased)
        setValue(nextValue)

        if (progress < 1) {
          animationFrame = window.requestAnimationFrame(tick)
          return
        }

        timeout = window.setTimeout(() => animateToNext(target), 720)
      }

      animationFrame = window.requestAnimationFrame(tick)
    }

    timeout = window.setTimeout(() => animateToNext(1), 260)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.clearTimeout(timeout)
    }
  }, [])

  const formatted = useMemo(() => new Intl.NumberFormat('sv-SE').format(value), [value])

  return (
    <div className="relative z-10 inline-flex max-w-full items-center gap-2 text-[12px] font-medium uppercase tracking-[.2em] text-[#0866ff]">
      <span className="grid h-5 w-5 shrink-0 place-items-center text-[#0866ff]">
        <Eye className="h-[16px] w-[16px] stroke-[2]" aria-hidden="true" />
      </span>
      <span className="min-w-0 truncate">
        <span>
          {caption}
        </span>
        <span className="ml-2 inline-flex min-w-0 items-center tracking-[.14em]">
          <span className="tabular-nums">{formatted}</span>
          <span className="ml-1 truncate">{label}</span>
          <span className="ml-1.5 h-3.5 w-px animate-pulse rounded-full bg-[#0866ff]" aria-hidden="true" />
        </span>
      </span>
    </div>
  )
}
