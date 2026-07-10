'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function ListingBackLink({
  fallbackHref,
  label,
}: {
  fallbackHref: string
  label: string
}) {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) {
          router.back()
          return
        }
        router.push(fallbackHref)
      }}
      className="inline-flex items-center gap-2 text-base font-medium text-[#101828] transition hover:text-[#0866ff]"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  )
}
