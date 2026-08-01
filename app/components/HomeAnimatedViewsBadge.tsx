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
    let frame = 0
    let animationFrame = 0
    const totalFrames = 64
    const target = 926

    const tick = () => {
      frame += 1
      const progress = Math.min(frame / totalFrames, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(1 + (target - 1) * eased))

      if (frame < totalFrames) {
        animationFrame = window.requestAnimationFrame(tick)
      }
    }

    animationFrame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(animationFrame)
  }, [])

  const formatted = useMemo(() => new Intl.NumberFormat('sv-SE').format(value), [value])

  return (
    <div className="relative z-10 mt-7 inline-flex max-w-full items-center gap-3 rounded-full border border-[#c9dcff] bg-white/90 px-3.5 py-3 text-[#101828] shadow-[0_14px_34px_rgba(8,102,255,.11)] backdrop-blur">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#0866ff] text-white">
        <Eye className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] font-medium uppercase tracking-[.18em] text-[#0866ff]">
          {caption}
        </span>
        <span className="mt-0.5 flex min-w-0 items-center text-[22px] font-semibold leading-none tracking-[-0.02em] sm:text-[25px]">
          <span className="tabular-nums">{formatted}</span>
          <span className="ml-1.5 truncate">{label}</span>
          <span className="ml-1.5 h-6 w-[2px] animate-pulse rounded-full bg-[#0866ff]" aria-hidden="true" />
        </span>
      </span>
    </div>
  )
}
