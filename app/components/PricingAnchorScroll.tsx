'use client'

import { useEffect } from 'react'

export default function PricingAnchorScroll() {
  useEffect(() => {
    function scrollToHash() {
      const id = window.location.hash.slice(1)
      if (!id) return
      window.requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      })
    }

    scrollToHash()
    window.addEventListener('hashchange', scrollToHash)
    return () => window.removeEventListener('hashchange', scrollToHash)
  }, [])

  return null
}
