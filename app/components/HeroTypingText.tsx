'use client'

import { useEffect, useMemo, useState } from 'react'

type HeroTypingTextProps = {
  prefix: string
  items: string[]
}

const ROTATE_MS = 1900

export default function HeroTypingText({ prefix, items }: HeroTypingTextProps) {
  const words = useMemo(() => items.filter(Boolean), [items])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!words.length) return

    const interval = window.setInterval(() => {
      setIndex((current) => (current + 1) % words.length)
    }, ROTATE_MS)

    return () => window.clearInterval(interval)
  }, [words])

  const activeWord = words[index % words.length] || ''

  return (
    <p
      className="mt-5 flex max-w-[340px] items-center text-[15px] font-normal leading-7 text-white/90 [text-shadow:0_2px_18px_rgba(0,0,0,.32)] sm:max-w-[560px] sm:text-[17px] sm:leading-8"
      aria-label={`${prefix} ${activeWord}`}
    >
      <span className="shrink-0">{prefix}&nbsp;</span>
      <span className="inline-flex h-7 items-center overflow-hidden leading-7 sm:h-8 sm:leading-8">
        <span key={activeWord} className="hero-word-rotate block font-semibold leading-7 text-white sm:leading-8">
          {activeWord}
        </span>
      </span>
    </p>
  )
}
