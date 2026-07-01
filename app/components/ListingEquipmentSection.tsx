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
    <section className="rounded-[18px] border border-[#dfe6f2] bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-black tracking-[-0.04em]">{title}</h2>
        <span className="rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-black text-[#0866ff]">
          {flatCount}
        </span>
      </div>

      {visibleGroups.length ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {visibleGroups.map((group) => (
            <div key={group.key} className="rounded-[16px] border border-[#edf1f6] bg-[#fbfcff] p-4">
              <h3 className="text-xs font-black uppercase tracking-[.14em] text-[#667085]">
                {group.label}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {group.options.map((item) => (
                  <EquipmentChip key={item.key} label={item.label} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap gap-2">
          {visibleFallback.map((item) => (
            <EquipmentChip key={item} label={item} />
          ))}
        </div>
      )}

      {canToggle ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-[14px] border border-[#c9d7ec] bg-white px-4 text-sm font-black text-[#0866ff] transition hover:bg-[#f5f9ff]"
        >
          {expanded ? showLessLabel : showMoreLabel}
        </button>
      ) : null}
    </section>
  )
}

function EquipmentChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#d8e6ff] bg-[#edf4ff] px-3 py-2 text-sm font-bold text-[#174ea6]">
      <CheckCircle2 className="h-4 w-4 text-[#0866ff]" />
      {label}
    </span>
  )
}
