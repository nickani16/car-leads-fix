'use client'

import { Share2 } from 'lucide-react'
import { useState } from 'react'

export default function ShareListingButton({
  title,
  url,
  label = 'Dela annons',
  variant = 'button',
  className: extraClassName = '',
}: {
  title: string
  url: string
  label?: string
  variant?: 'button' | 'plain'
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title, url })
      } else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1800)
      }
    } catch {
      // User cancelled native share sheet.
    }
  }

  const buttonClassName =
    variant === 'plain'
      ? 'inline-flex cursor-pointer items-center justify-center gap-2 text-sm font-semibold text-[#101828] transition hover:text-[#0866ff] sm:text-base sm:font-medium'
      : 'inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-[12px] border border-[#d9e1ec] bg-white px-4 text-sm font-semibold text-[#101828] transition hover:border-[#0866ff] hover:text-[#0866ff]'

  return (
    <button
      type="button"
      onClick={share}
      className={`${buttonClassName} ${extraClassName}`.trim()}
    >
      <Share2 className="h-4 w-4 text-[#0866ff]" />
      {copied ? 'Länk kopierad' : label}
    </button>
  )
}
