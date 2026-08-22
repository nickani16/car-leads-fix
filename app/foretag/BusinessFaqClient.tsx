'use client'

import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'

type FaqItem = readonly [string, string]

export default function BusinessFaqClient({
  title,
  items,
  labels,
}: {
  title: string
  items: readonly FaqItem[]
  labels: {
    expandAll: string
    collapseAll: string
  }
}) {
  const [openItems, setOpenItems] = useState<ReadonlySet<string>>(() => new Set([items[0]?.[0]].filter(Boolean)))
  const allExpanded = openItems.size === items.length

  function toggleItem(question: string) {
    setOpenItems((current) => {
      const next = new Set(current)
      if (next.has(question)) {
        next.delete(question)
      } else {
        next.add(question)
      }
      return next
    })
  }

  function toggleAll() {
    setOpenItems(allExpanded ? new Set() : new Set(items.map(([question]) => question)))
  }

  return (
    <div className="min-w-0">
      <div className="flex w-full min-w-0 flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div className="min-w-0">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[10px] border border-[#d8e3f2] bg-white text-[#0866ff]">
            <HelpCircle className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <h2 className="min-w-0 text-4xl font-semibold tracking-[-.02em] text-[#101828] sm:text-5xl">{title}</h2>
        </div>
        <div className="flex w-full justify-start sm:w-auto sm:justify-end">
          <button
            type="button"
            onClick={toggleAll}
            className="inline-flex min-h-10 max-w-full items-center justify-center rounded-[10px] border border-[#c9d5e6] bg-white px-4 text-sm font-semibold text-[#0866ff] transition hover:border-[#0866ff] hover:bg-[#f7fbff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0866ff]"
          >
            {allExpanded ? labels.collapseAll : labels.expandAll}
          </button>
        </div>
      </div>
      <div className="mt-9 grid gap-3 sm:mt-12">
        {items.map(([question, answer]) => (
          <article key={question} className="rounded-[10px] border border-[#d8e3f2] bg-white">
            <button
              type="button"
              aria-expanded={openItems.has(question)}
              onClick={() => toggleItem(question)}
              className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-5 text-left text-lg font-semibold tracking-[-.012em] text-[#101828] transition hover:bg-[#f7fbff] sm:px-6 sm:py-6 sm:text-xl"
            >
              <span className="min-w-0">{question}</span>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d8e3f2] bg-white text-[#667085]">
                <ChevronDown className={`h-5 w-5 transition ${openItems.has(question) ? 'rotate-180 text-[#0866ff]' : ''}`} />
              </span>
            </button>
            {openItems.has(question) ? (
              <p className="max-w-[920px] px-5 pb-6 text-base leading-7 text-[#515966] sm:px-6 sm:pb-7">{answer}</p>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  )
}
