'use client'

import { useState } from 'react'

const DESCRIPTION_LIMIT = 350

export default function SellerDescriptionClamp({
  text,
  readMoreLabel,
  showLessLabel,
}: {
  text: string
  readMoreLabel: string
  showLessLabel: string
}) {
  const [expanded, setExpanded] = useState(false)
  const characters = Array.from(text)
  const shouldClamp = characters.length > DESCRIPTION_LIMIT
  const visibleText =
    shouldClamp && !expanded
      ? characters.slice(0, DESCRIPTION_LIMIT).join('')
      : text

  return (
    <div className="mt-4">
      <div className="relative">
        <p className="whitespace-pre-line text-[14px] leading-7 text-[#475467]">
          {visibleText}
        </p>
        {shouldClamp && !expanded ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-b from-white/0 via-white/92 to-white" />
        ) : null}
      </div>
      {shouldClamp ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-3 inline-flex items-center text-[14px] font-semibold text-[#075fff] transition hover:text-[#004fd6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#075fff]"
          aria-expanded={expanded}
        >
          {expanded ? showLessLabel : readMoreLabel}
        </button>
      ) : null}
    </div>
  )
}
