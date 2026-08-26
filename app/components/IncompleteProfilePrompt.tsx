'use client'

import Link from 'next/link'
import { CircleAlert, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export type IncompleteProfilePromptCopy = {
  title: string
  description: string
  action: string
}

export default function IncompleteProfilePrompt({
  open,
  href,
  copy,
  closeLabel,
}: {
  open: boolean
  href: string
  copy: IncompleteProfilePromptCopy
  closeLabel: string
}) {
  const [dismissed, setDismissed] = useState(false)
  const visible = open && !dismissed

  useEffect(() => {
    if (!visible) return

    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDismissed(true)
    }
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [visible])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[190] grid place-items-center bg-[#101828]/45 px-4 py-8 backdrop-blur-[2px]" role="presentation">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="incomplete-profile-prompt-title"
        aria-describedby="incomplete-profile-prompt-description"
        className="relative w-full max-w-[460px] rounded-[18px] border border-[#d9e2ef] bg-white p-6 text-[#2a2a37] shadow-[0_28px_80px_rgba(16,24,40,.24)] sm:p-7"
      >
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label={closeLabel}
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-[#667085] transition hover:bg-[#f2f4f7] hover:text-[#2a2a37] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0866ff]"
        >
          <X className="h-[18px] w-[18px]" />
        </button>

        <span className="grid h-11 w-11 place-items-center rounded-full bg-[#eef5ff] text-[#0866ff]">
          <CircleAlert className="h-5 w-5" />
        </span>
        <h2 id="incomplete-profile-prompt-title" className="mt-5 pr-8 text-[22px] font-semibold tracking-[-0.025em]">
          {copy.title}
        </h2>
        <p id="incomplete-profile-prompt-description" className="mt-2 text-sm leading-6 text-[#475467]">
          {copy.description}
        </p>
        <Link
          href={href}
          onClick={() => setDismissed(true)}
          className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-[9px] bg-[#0866ff] px-4 text-sm font-semibold text-white transition hover:bg-[#0755d9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0866ff]"
        >
          {copy.action}
        </Link>
      </section>
    </div>
  )
}
