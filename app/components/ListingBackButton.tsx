'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { MouseEvent } from 'react'

export default function ListingBackButton({
  href,
  label,
  className = '',
}: {
  href: string
  label: string
  className?: string
}) {
  function goBack(event: MouseEvent<HTMLAnchorElement>) {
    if (typeof window === 'undefined') return

    const referrer = document.referrer
    const sameSiteReferrer = (() => {
      if (!referrer) return false
      try {
        const referrerUrl = new URL(referrer)
        return referrerUrl.origin === window.location.origin && referrerUrl.href !== window.location.href
      } catch {
        return false
      }
    })()

    if (sameSiteReferrer && window.history.length > 1) {
      event.preventDefault()
      window.history.back()
    }
  }

  return (
    <Link
      href={href}
      onClick={goBack}
      className={`group inline-flex cursor-pointer items-center justify-center gap-2 text-[14px] font-[500] text-[#101828] transition hover:text-[#0866ff] ${className}`.trim()}
      style={{ fontWeight: 500 }}
    >
      <ArrowLeft className="h-4 w-4 shrink-0 transition-transform duration-200 ease-out group-hover:-translate-x-1" />
      <span>{label}</span>
    </Link>
  )
}
