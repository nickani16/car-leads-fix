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
    <div className="relative z-10 max-w-[320px]">
      <div className="inline-flex max-w-full items-center gap-2 text-[12px] font-medium uppercase tracking-[.2em] text-[#0866ff]">
        <span className="relative grid h-6 w-6 shrink-0 place-items-center">
          <span className="absolute inset-0 rounded-full bg-[#0866ff]/10" aria-hidden="true" />
          <span className="absolute inset-0 rounded-full bg-[#0866ff]/10 [animation:pulse_2.9s_ease-in-out_infinite]" aria-hidden="true" />
          <span className="relative grid h-5 w-5 place-items-center rounded-full bg-white text-[#0866ff] shadow-[0_4px_12px_rgba(8,102,255,.14)]">
            <Eye className="h-[14px] w-[14px] stroke-[2]" aria-hidden="true" />
          </span>
          <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-[#12b76a] shadow-[0_0_0_3px_rgba(18,183,106,.14)]" aria-hidden="true" />
        </span>
        <span className="min-w-0 truncate">{caption}</span>
      </div>
      <div className="mt-2 flex max-w-full flex-wrap items-baseline gap-x-1.5 gap-y-1 text-[15px] font-medium leading-[1.25] tracking-normal text-[#475467]">
        <span className="text-[18px] font-semibold tabular-nums tracking-[-0.01em] text-[#0866ff] transition-colors duration-300">
          {formatted}
        </span>
        <span>{label}</span>
        <span className="text-[#667085]">{context}</span>
        <span className="h-4 w-px animate-pulse rounded-full bg-[#0866ff]/70" aria-hidden="true" />
      </div>
    </div>
  )
}
