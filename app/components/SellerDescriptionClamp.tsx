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
  const continuationHint =
    shouldClamp && !expanded
      ? characters.slice(DESCRIPTION_LIMIT, DESCRIPTION_LIMIT + 180).join('')
      : ''

  return (
    <div className="mt-4">
      <div>
        <p className="whitespace-pre-line text-[14px] leading-7 text-[#475467]">
          {visibleText}
        </p>
        {shouldClamp && !expanded ? (
          <div className="relative -mt-1 max-h-10 overflow-hidden" aria-hidden="true">
            <p className="select-none whitespace-pre-line text-[14px] leading-7 text-[#475467]/45 blur-[1.4px]">
              {continuationHint}
            </p>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-white/72 to-white" />
          </div>
        ) : null}
      </div>
      {shouldClamp ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-1 inline-flex items-center text-[14px] font-semibold text-[#075fff] transition hover:text-[#004fd6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#075fff]"
          aria-expanded={expanded}
        >
          {expanded ? showLessLabel : readMoreLabel}
        </button>
      ) : null}
    </div>
  )
}
