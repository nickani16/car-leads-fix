'use client'

import { useEffect, useMemo, useState } from 'react'
import { BadgeCheck, CheckCircle2, Eye } from 'lucide-react'

type HomeAnimatedViewsBadgeProps = {
  createdLabel: string
  viewsLabel: string
  soldLabel: string
}

type FlowStep = 'created' | 'views' | 'sold'

const TYPE_SPEED_MS = 46
const ERASE_SPEED_MS = 18

export default function HomeAnimatedViewsBadge({
  createdLabel,
  viewsLabel,
  soldLabel,
}: HomeAnimatedViewsBadgeProps) {
  const [step, setStep] = useState<FlowStep>('created')
  const [value, setValue] = useState(1)
  const [typedText, setTypedText] = useState('')

  useEffect(() => {
    let animationFrame = 0
    let timeout = 0
    let cancelled = false

    const wait = (duration: number) =>
      new Promise<void>((resolve) => {
        timeout = window.setTimeout(resolve, duration)
      })

    const typeText = async (text: string) => {
      setTypedText('')
      for (let index = 0; index < text.length; index += 1) {
        if (cancelled) return
        setTypedText(text.slice(0, index + 1))
        await wait(TYPE_SPEED_MS)
      }
    }

    const eraseText = async (text: string) => {
      for (let index = text.length; index >= 0; index -= 1) {
        if (cancelled) return
        setTypedText(text.slice(0, index))
        await wait(ERASE_SPEED_MS)
      }
    }

    const countViews = () =>
      new Promise<void>((resolve) => {
        const startedAt = performance.now()
        const duration = 2600
        const target = 900

        const tick = (now: number) => {
          if (cancelled) {
            resolve()
            return
          }
          const progress = Math.min((now - startedAt) / duration, 1)
          const eased = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2
          setValue(Math.round(1 + (target - 1) * eased))

          if (progress < 1) {
            animationFrame = window.requestAnimationFrame(tick)
            return
          }
          resolve()
        }

        animationFrame = window.requestAnimationFrame(tick)
      })

    const run = async () => {
      while (!cancelled) {
        setStep('created')
        setValue(1)
        await typeText(createdLabel)
        await wait(900)
        await eraseText(createdLabel)

        setStep('views')
        setValue(1)
        await typeText(viewsLabel)
        await countViews()
        await wait(900)
        await eraseText(viewsLabel)

        setStep('sold')
        await typeText(soldLabel)
        await wait(1100)
        await eraseText(soldLabel)
      }
    }

    void run()

    return () => {
      cancelled = true
      window.cancelAnimationFrame(animationFrame)
      window.clearTimeout(timeout)
    }
  }, [createdLabel, soldLabel, viewsLabel])

  const formatted = useMemo(() => new Intl.NumberFormat('sv-SE').format(value), [value])
  const Icon = step === 'created' ? CheckCircle2 : step === 'sold' ? BadgeCheck : Eye

  return (
    <div
      className="relative z-10 inline-flex max-w-full items-start gap-2 text-[12px] font-medium uppercase leading-5 tracking-[.1em] text-[#0866ff] sm:tracking-[.14em]"
      aria-live="polite"
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0 stroke-[2]" aria-hidden="true" />
      <span className="min-w-0 break-words">
        {step === 'views' ? <span className="tabular-nums">{formatted} </span> : null}
        <span>{typedText}</span>
        <span className="ml-1 inline-block h-4 w-px translate-y-0.5 animate-pulse rounded-full bg-[#0866ff]" aria-hidden="true" />
      </span>
    </div>
  )
}
