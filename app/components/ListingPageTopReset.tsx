'use client'

import { useEffect } from 'react'

export default function ListingPageTopReset() {
  useEffect(() => {
    if (window.location.hash) return

    const resetToTop = () => {
      window.scrollTo(0, 0)
      window.dispatchEvent(new Event('scroll'))
    }

    resetToTop()
    const frame = window.requestAnimationFrame(resetToTop)
    const timer = window.setTimeout(resetToTop, 80)

    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(timer)
    }
  }, [])

  return null
}
