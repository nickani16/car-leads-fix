'use client'

import { useLayoutEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function ListingPageTopReset() {
  const pathname = usePathname()

  useLayoutEffect(() => {
    if (window.location.hash) return

    const previousScrollRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'

    const resetToTop = () => {
      window.scrollTo(0, 0)
      window.dispatchEvent(new Event('scroll'))
    }

    resetToTop()
    const frame = window.requestAnimationFrame(resetToTop)
    const timers = [40, 120, 260, 520].map((delay) =>
      window.setTimeout(resetToTop, delay),
    )

    return () => {
      window.cancelAnimationFrame(frame)
      timers.forEach((timer) => window.clearTimeout(timer))
      window.history.scrollRestoration = previousScrollRestoration
    }
  }, [pathname])

  return null
}
