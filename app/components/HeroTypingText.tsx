'use client'

import { useEffect, useMemo, useState } from 'react'

type HeroTypingTextProps = {
  prefix: string
  items: string[]
  variant?: 'typing' | 'rotate'
}

const TYPE_MS = 70
const DELETE_MS = 38
const HOLD_MS = 1250
const ROTATE_MS = 1900

export default function HeroTypingText({ prefix, items, variant = 'typing' }: HeroTypingTextProps) {
  const words = useMemo(() => items.filter(Boolean), [items])
  const [index, setIndex] = useState(0)
  const [visibleLetters, setVisibleLetters] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!words.length) return

    if (variant === 'rotate') {
      const interval = window.setInterval(() => {
        setIndex((current) => (current + 1) % words.length)
      }, ROTATE_MS)

      return () => window.clearInterval(interval)
    }

    const activeWord = words[index % words.length] || ''

    const timeout = window.setTimeout(
      () => {
        if (!deleting && visibleLetters < activeWord.length) {
          setVisibleLetters((current) => current + 1)
          return
        }

        if (!deleting && visibleLetters >= activeWord.length) {
          setDeleting(true)
          return
        }

        if (deleting && visibleLetters > 0) {
          setVisibleLetters((current) => current - 1)
          return
        }

        setDeleting(false)
        setIndex((current) => (current + 1) % words.length)
      },
      !deleting && visibleLetters >= activeWord.length
        ? HOLD_MS
        : deleting
          ? DELETE_MS
          : TYPE_MS,
    )

    return () => window.clearTimeout(timeout)
  }, [deleting, index, variant, visibleLetters, words])

  const activeWord = words[index % words.length] || ''
  const typedWord = activeWord.slice(0, visibleLetters)

  return (
    <p
      className={`mt-5 flex max-w-[340px] items-center text-[15px] font-normal leading-7 text-white/90 [text-shadow:0_2px_18px_rgba(0,0,0,.32)] sm:max-w-[560px] sm:leading-8 ${variant === 'rotate' ? 'sm:text-[18px]' : 'sm:text-[17px]'}`}
      aria-label={`${prefix} ${activeWord}`}
    >
      <span className="shrink-0">{prefix}&nbsp;</span>
      {variant === 'rotate' ? (
        <span className="inline-flex h-7 items-center overflow-hidden leading-7 sm:h-8 sm:leading-8">
          <span key={activeWord} className="hero-word-rotate block font-semibold leading-7 text-white sm:leading-8">
            {activeWord}
          </span>
        </span>
      ) : (
      <span className="inline-flex h-7 min-w-0 items-center leading-7 sm:h-8 sm:leading-8">
        <span className="block font-semibold leading-7 text-white sm:leading-8">
          {typedWord}
        </span>
        <span aria-hidden="true" className="hero-typing-caret ml-0.5 h-5 w-[2px] rounded-full bg-white/90 sm:h-6" />
      </span>
      )}
    </p>
  )
}
