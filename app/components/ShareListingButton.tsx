'use client'

import { Share2 } from 'lucide-react'
import { useState } from 'react'

export default function ShareListingButton({
  title,
  url,
  label = 'Dela annons',
  copiedLabel = 'Länk kopierad',
  variant = 'button',
  className: extraClassName = '',
  labelClassName = '',
  iconClassName = 'h-4 w-4',
}: {
  title: string
  url: string
  label?: string
  copiedLabel?: string
  variant?: 'button' | 'plain'
  className?: string
  labelClassName?: string
  iconClassName?: string
}) {
  const [copied, setCopied] = useState(false)

  function markCopied() {
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  async function copyFallback(shareUrl: string) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareUrl)
      markCopied()
      return
    }

    const textArea = document.createElement('textarea')
    textArea.value = shareUrl
    textArea.setAttribute('readonly', '')
    textArea.style.position = 'fixed'
    textArea.style.left = '-9999px'
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    markCopied()
  }

  async function share() {
    const shareUrl = url || window.location.href
    const shareData: ShareData = { title, url: shareUrl }
    let attemptedNativeShare = false

    try {
      if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
        attemptedNativeShare = true
        await navigator.share(shareData)
        return
      }

      await copyFallback(shareUrl)
    } catch (error) {
      const name = error instanceof DOMException ? error.name : ''
      if (name === 'AbortError' || !attemptedNativeShare) return
      await copyFallback(shareUrl)
    }
  }
  const buttonClassName =
    variant === 'plain'
      ? 'inline-flex cursor-pointer items-center justify-center gap-2 text-[14px] font-[500] text-[#101828] transition hover:text-[#0866ff]'
      : 'inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-[12px] border border-[#d9e1ec] bg-white px-4 text-sm font-semibold text-[#101828] transition hover:border-[#0866ff] hover:text-[#0866ff]'

  return (
    <button
      type="button"
      onClick={share}
      style={variant === 'plain' ? { fontWeight: 500 } : undefined}
      className={`${buttonClassName} ${extraClassName}`.trim()}
    >
      <Share2 className={iconClassName} />
      <span className={labelClassName}>{copied ? copiedLabel : label}</span>
    </button>
  )
}


