'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

type FaqItem = readonly [string, string]

export default function BusinessFaqClient({
  title,
  items,
}: {
  title: string
  items: readonly FaqItem[]
}) {
  const [expanded, setExpanded] = useState(false)
  const toggleLabel = expanded ? 'Stäng alla' : 'Expandera alla'

  return (
    <div className="min-w-0" style={{ width: 'min(100%, calc(100vw - 40px))' }}>
      <div className="flex w-full min-w-0 flex-col justify-between gap-8 sm:flex-row sm:items-end sm:gap-6">
        <h2 className="min-w-0 text-4xl font-semibold tracking-[-.02em] text-[#101828] sm:text-5xl">{title}</h2>
        <div className="flex w-full justify-end sm:w-auto">
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            className="inline-flex min-h-9 max-w-full items-center gap-px rounded-full px-0 text-[17px] font-normal leading-none text-[#0866ff] transition hover:text-[#0057df] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0866ff]"
          >
            {toggleLabel}
            <ChevronDown className={`h-4 w-4 transition ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
      <div className="mt-10 divide-y divide-[#d0d5dd] sm:mt-14">
        {items.map(([question, answer]) => (
          <details key={question} className="group" open={expanded ? true : undefined}>
            <summary className="grid cursor-pointer list-none grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-7 text-xl font-semibold tracking-[-.012em] text-[#1d1d1f] sm:flex sm:justify-between sm:gap-6 sm:text-2xl">
              <span className="min-w-0">{question}</span>
              <ChevronDown className="h-7 w-7 shrink-0 text-[#86868b] transition group-open:rotate-180" />
            </summary>
            <p className="max-w-[920px] pb-8 text-base leading-8 text-[#515966] sm:text-lg">{answer}</p>
          </details>
        ))}
      </div>
    </div>
  )
}
