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
      style={{ fontWeight: 600 }}
      className="inline-flex cursor-pointer items-center gap-2 text-[17px] font-semibold text-[#101828] transition hover:text-[#0866ff] sm:text-[14px] sm:font-[500]"
    >
      <ArrowLeft className="h-5 w-5 sm:h-4 sm:w-4" />
      <span className="underline decoration-[1px] underline-offset-3">{label}</span>
    </button>
  )
}
