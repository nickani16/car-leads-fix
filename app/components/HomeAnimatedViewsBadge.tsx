'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { CircleDollarSign, Eye, FileCheck2, MessageCircle } from 'lucide-react'

type HomeAnimatedViewsBadgeProps = {
  createdLabel: string
  viewsLabel: string
  contactLabel: string
  soldLabel: string
}

type FlowStep = 'created' | 'views' | 'contact' | 'sold'

const TYPE_SPEED_MS = 72
const ERASE_SPEED_MS = 28

export default function HomeAnimatedViewsBadge({
  createdLabel,
  viewsLabel,
  contactLabel,
  soldLabel,
}: HomeAnimatedViewsBadgeProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [isInView, setIsInView] = useState(false)
  const [step, setStep] = useState<FlowStep>('created')
  const [value, setValue] = useState(1)
  const [typedText, setTypedText] = useState('')

  useEffect(() => {
    const element = rootRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
      },
      {
        rootMargin: '0px 0px -12% 0px',
        threshold: 0.28,
      },
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isInView) return

    let animationFrame = 0
    let cancelled = false
    const timeouts = new Set<number>()

    const wait = (duration: number) =>
      new Promise<void>((resolve) => {
        const timeout = window.setTimeout(() => {
          timeouts.delete(timeout)
          resolve()
        }, duration)
        timeouts.add(timeout)
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
        const duration = 6200
        const target = 153

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
        await wait(1250)
        await eraseText(createdLabel)

        setStep('views')
        setValue(1)
        await typeText(viewsLabel)
        await countViews()
        await wait(1250)
        await eraseText(viewsLabel)

        setStep('contact')
        await typeText(contactLabel)
        await wait(1350)
        await eraseText(contactLabel)

        setStep('sold')
        await typeText(soldLabel)
        await wait(1500)
        await eraseText(soldLabel)
      }
    }

    void run()

    return () => {
      cancelled = true
      window.cancelAnimationFrame(animationFrame)
      timeouts.forEach((timeout) => window.clearTimeout(timeout))
      timeouts.clear()
    }
  }, [contactLabel, createdLabel, isInView, soldLabel, viewsLabel])

  const formatted = useMemo(() => new Intl.NumberFormat(undefined).format(value), [value])
  const Icon =
    step === 'created'
      ? FileCheck2
      : step === 'contact'
        ? MessageCircle
        : step === 'sold'
          ? CircleDollarSign
          : Eye

  return (
    <div
      ref={rootRef}
      className="relative z-10 inline-flex max-w-full items-center gap-2 text-[12px] font-medium uppercase leading-5 tracking-[.1em] text-[#0866ff] sm:tracking-[.14em]"
      aria-live="polite"
    >
      <span className="flex h-5 shrink-0 translate-y-px items-center" aria-hidden="true">
        <Icon className="h-4 w-4 stroke-[2]" />
      </span>
      <span className="min-w-0 break-words leading-5">
        {step === 'views' ? <span className="tabular-nums">{formatted} </span> : null}
        <span>{typedText}</span>
        <span className="hero-typing-caret ml-1 inline-block h-4 w-px translate-y-0.5 rounded-full bg-[#0866ff]" aria-hidden="true" />
      </span>
    </div>
  )
}
