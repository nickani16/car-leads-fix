'use client'

import { useEffect, useState } from 'react'

const TYPE_DELAY_MS = 48
const DELETE_DELAY_MS = 26
const PAUSE_DELAY_MS = 1500
const NEXT_EXAMPLE_DELAY_MS = 320

export default function HomeSearchAnimatedPlaceholder({
  examples,
  paused = false,
}: {
  examples: readonly string[]
  paused?: boolean
}) {
  const [exampleIndex, setExampleIndex] = useState(0)
  const [displayText, setDisplayText] = useState(examples[0] || '')
  const [deleting, setDeleting] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateMotionPreference = () => setReducedMotion(mediaQuery.matches)
    updateMotionPreference()
    mediaQuery.addEventListener('change', updateMotionPreference)
    return () => mediaQuery.removeEventListener('change', updateMotionPreference)
  }, [])

  useEffect(() => {
    if (!examples.length) return
    if (reducedMotion || paused) return

    const example = examples[exampleIndex] || examples[0]
    let delay = deleting ? DELETE_DELAY_MS : TYPE_DELAY_MS

    if (!deleting && displayText === example) delay = PAUSE_DELAY_MS
    if (deleting && !displayText) delay = NEXT_EXAMPLE_DELAY_MS

    const timer = window.setTimeout(() => {
      if (!deleting && displayText === example) {
        setDeleting(true)
        return
      }
      if (deleting && !displayText) {
        setDeleting(false)
        setExampleIndex((current) => (current + 1) % examples.length)
        return
      }

      setDisplayText(
        deleting
          ? example.slice(0, Math.max(0, displayText.length - 1))
          : example.slice(0, displayText.length + 1),
      )
    }, delay)

    return () => window.clearTimeout(timer)
  }, [deleting, displayText, exampleIndex, examples, paused, reducedMotion])

  return <>{reducedMotion || paused ? examples[0] || '\u00a0' : displayText || '\u00a0'}</>
}
