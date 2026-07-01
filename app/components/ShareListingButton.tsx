'use client'

import { Share2 } from 'lucide-react'
import { useState } from 'react'

export default function ShareListingButton({
  title,
  url,
  label = 'Dela annons',
}: {
  title: string
  url: string
  label?: string
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

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[12px] border border-[#d9e1ec] bg-white px-4 text-sm font-bold text-[#101828] transition hover:border-[#0866ff] hover:text-[#0866ff]"
    >
      <Share2 className="h-4 w-4" />
      {copied ? 'Länk kopierad' : label}
    </button>
  )
}
