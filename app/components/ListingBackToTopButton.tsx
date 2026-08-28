'use client'

import { useEffect, useState } from 'react'
import { ChevronUp } from 'lucide-react'
import type { PublicLocale } from '@/lib/public-i18n'

const labels: Record<PublicLocale, string> = {
  sv: 'Till toppen',
  en: 'Top of the page',
  de: 'Zum Seitenanfang',
  at: 'Zum Seitenanfang',
  be: 'Naar boven',
  fr: 'Haut de page',
  es: 'Ir al inicio',
  it: 'Torna in alto',
  pl: 'Na górę strony',
  nl: 'Naar boven',
  fi: 'Sivun alkuun',
  da: 'Til toppen',
}

export default function ListingBackToTopButton({ locale }: { locale: PublicLocale }) {
  const [visible, setVisible] = useState(false)
  const label = labels[locale]

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY > 520)

    updateVisibility()
    window.addEventListener('scroll', updateVisibility, { passive: true })
    return () => window.removeEventListener('scroll', updateVisibility)
  }, [])

  function scrollToTop() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' })
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label={label}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`group fixed bottom-[calc(82px+env(safe-area-inset-bottom))] right-4 z-[110] inline-flex h-10 items-center justify-center overflow-hidden rounded-full bg-[#0866ff] text-white transition-[width,opacity,transform,background-color] duration-300 hover:bg-[#0057e6] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0866ff]/25 sm:bottom-6 sm:right-6 ${
        visible ? 'w-10 translate-y-0 opacity-100 sm:hover:w-[150px]' : 'pointer-events-none w-10 translate-y-3 opacity-0'
      }`}
    >
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-[13px] font-semibold opacity-0 transition-[max-width,opacity,margin] duration-300 sm:group-hover:mr-2 sm:group-hover:max-w-[108px] sm:group-hover:opacity-100">
        {label}
      </span>
      <ChevronUp aria-hidden="true" className="h-4 w-4 shrink-0" strokeWidth={2.5} />
    </button>
  )
}
