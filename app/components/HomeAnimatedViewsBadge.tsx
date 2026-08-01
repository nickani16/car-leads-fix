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
    const sequence = [1, 96, 184, 327, 612, 926, 774, 485, 206, 63]

    const animateToNext = (from: number) => {
      const target = sequence[index % sequence.length]
      index += 1
      const startedAt = performance.now()
      const duration = 1200

      const tick = (now: number) => {
        const progress = Math.min((now - startedAt) / duration, 1)
        const eased = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2
        const nextValue = Math.round(from + (target - from) * eased)
        setValue(nextValue)

        if (progress < 1) {
          animationFrame = window.requestAnimationFrame(tick)
          return
        }

        timeout = window.setTimeout(() => animateToNext(target), 260)
      }

      animationFrame = window.requestAnimationFrame(tick)
    }

    timeout = window.setTimeout(() => animateToNext(1), 180)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.clearTimeout(timeout)
    }
  }, [])

  const formatted = useMemo(() => new Intl.NumberFormat('sv-SE').format(value), [value])

  return (
    <div className="relative z-10 inline-flex max-w-full items-center gap-2.5 rounded-full border border-[#c9dcff] bg-white/90 px-3 py-2 text-[#101828] shadow-[0_12px_26px_rgba(8,102,255,.09)] backdrop-blur">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#0866ff] text-white">
        <Eye className="h-[18px] w-[18px]" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] font-medium uppercase tracking-[.16em] text-[#0866ff]">
          {caption}
        </span>
        <span className="mt-0.5 flex min-w-0 items-center text-[18px] font-semibold leading-none tracking-[-0.01em] sm:text-[20px]">
          <span className="tabular-nums">{formatted}</span>
          <span className="ml-1.5 truncate">{label}</span>
          <span className="ml-1.5 h-5 w-[2px] animate-pulse rounded-full bg-[#0866ff]" aria-hidden="true" />
        </span>
      </span>
    </div>
  )
}
