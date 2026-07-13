'use client'

import { useMemo, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'

type EquipmentGroup = {
  key: string
  label: string
  options: Array<{ key: string; label: string }>
}

export default function ListingEquipmentSection({
  title,
  groups,
  fallbackItems,
  showMoreLabel,
  showLessLabel,
}: {
  title: string
  groups: EquipmentGroup[]
  fallbackItems: string[]
  showMoreLabel: string
  showLessLabel: string
}) {
  const [expanded, setExpanded] = useState(false)
  const flatCount = groups.length
    ? groups.reduce((sum, group) => sum + group.options.length, 0)
    : fallbackItems.length
  const visibleLimit = expanded ? Number.POSITIVE_INFINITY : 12

  const visibleGroups = useMemo(() => {
    if (!groups.length) return []
    let remaining = visibleLimit
    return groups
      .map((group) => {
        const options = group.options.slice(0, remaining)
        remaining = Math.max(0, remaining - options.length)
        return { ...group, options }
      })
      .filter((group) => group.options.length)
  }, [groups, visibleLimit])

  const visibleFallback = groups.length ? [] : fallbackItems.slice(0, visibleLimit)
  const canToggle = flatCount > 12

  if (!flatCount) return null

  return (
    <section className="rounded-[12px] border border-[#dfe6f2] bg-white p-4 shadow-sm sm:rounded-[18px] sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        <h2 className="text-xl font-semibold tracking-[-0.025em] sm:text-2xl sm:tracking-[-0.04em]">{title}</h2>
        <span className="rounded-full bg-[#eef5ff] px-2.5 py-0.5 text-[11px] font-semibold text-[#0866ff] sm:px-3 sm:py-1 sm:text-xs">
          {flatCount}
        </span>
      </div>

      {visibleGroups.length ? (
        <div className="mt-3 grid gap-3 sm:mt-5 sm:gap-4 lg:grid-cols-2">
          {visibleGroups.map((group) => (
            <div key={group.key} className="rounded-[12px] border border-[#edf1f6] bg-[#fbfcff] p-3 sm:rounded-[16px] sm:p-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-[.12em] text-[#667085] sm:text-xs sm:tracking-[.14em]">
                {group.label}
              </h3>
              <div className="mt-2 flex flex-wrap gap-1.5 sm:mt-3 sm:gap-2">
                {group.options.map((item) => (
                  <EquipmentChip key={item.key} label={item.label} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-5 sm:gap-2">
          {visibleFallback.map((item) => (
            <EquipmentChip key={item} label={item} />
          ))}
        </div>
      )}

      {canToggle ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-3 inline-flex min-h-10 items-center justify-center rounded-[10px] border border-[#c9d7ec] bg-white px-3 text-xs font-semibold text-[#0866ff] transition hover:bg-[#f5f9ff] sm:mt-5 sm:min-h-11 sm:rounded-[14px] sm:px-4 sm:text-sm"
        >
          {expanded ? showLessLabel : showMoreLabel}
        </button>
      ) : null}
    </section>
  )
}

function EquipmentChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d8e6ff] bg-[#edf4ff] px-2.5 py-1.5 text-xs font-semibold text-[#174ea6] sm:gap-2 sm:px-3 sm:py-2 sm:text-sm">
      <CheckCircle2 className="h-3.5 w-3.5 text-[#0866ff] sm:h-4 sm:w-4" />
      {label}
    </span>
  )
}
