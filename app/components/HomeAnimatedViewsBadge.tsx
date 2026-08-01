'use client'

import { useEffect, useMemo, useState } from 'react'
import { BadgeCheck, CheckCircle2, Eye } from 'lucide-react'

type HomeAnimatedViewsBadgeProps = {
  createdLabel: string
  viewsLabel: string
  soldLabel: string
}

type FlowStep = 'created' | 'views' | 'sold'

export default function HomeAnimatedViewsBadge({
  createdLabel,
  viewsLabel,
  soldLabel,
}: HomeAnimatedViewsBadgeProps) {
  const [step, setStep] = useState<FlowStep>('created')
  const [value, setValue] = useState(1)

  useEffect(() => {
    let animationFrame = 0
    let timeout = 0

    const showCreated = () => {
      setStep('created')
      setValue(1)
      timeout = window.setTimeout(showViews, 1250)
    }

    const showViews = () => {
      setStep('views')
      const startedAt = performance.now()
      const duration = 2800
      const target = 900

      const tick = (now: number) => {
        const progress = Math.min((now - startedAt) / duration, 1)
        const eased = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2
        const nextValue = Math.round(1 + (target - 1) * eased)
        setValue(nextValue)

        if (progress < 1) {
          animationFrame = window.requestAnimationFrame(tick)
          return
        }

        timeout = window.setTimeout(showSold, 450)
      }

      animationFrame = window.requestAnimationFrame(tick)
    }

    const showSold = () => {
      setStep('sold')
      timeout = window.setTimeout(showCreated, 1500)
    }

    timeout = window.setTimeout(showCreated, 240)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.clearTimeout(timeout)
    }
  }, [])

  const formatted = useMemo(() => new Intl.NumberFormat('sv-SE').format(value), [value])
  const Icon = step === 'created' ? CheckCircle2 : step === 'sold' ? BadgeCheck : Eye
  const text =
    step === 'created'
      ? createdLabel
      : step === 'sold'
        ? soldLabel
        : `${formatted} ${viewsLabel}`

  return (
    <div
      className="relative z-10 inline-flex max-w-full items-center gap-2 text-[12px] font-medium uppercase leading-5 tracking-[.16em] text-[#0866ff]"
      aria-live="polite"
    >
      <Icon className="h-4 w-4 shrink-0 stroke-[2]" aria-hidden="true" />
      <span className="min-w-0 truncate tabular-nums">{text}</span>
    </div>
  )
}
