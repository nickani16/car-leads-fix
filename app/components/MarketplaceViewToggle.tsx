'use client'

import { List, Map as MapIcon } from 'lucide-react'
import type { PublicLocale } from '@/lib/public-i18n'
import { translatePublic } from '@/lib/public-i18n'
import type { MarketplaceViewMode } from '@/lib/marketplace-view'

export default function MarketplaceViewToggle({
  locale,
  value,
  onChange,
  className = '',
}: {
  locale: PublicLocale
  value: MarketplaceViewMode
  onChange: (view: MarketplaceViewMode) => void
  className?: string
}) {
  const options = [
    {
      value: 'map' as const,
      label: translatePublic(locale, 'Map view'),
      icon: MapIcon,
    },
    {
      value: 'list' as const,
      label: translatePublic(locale, 'List view'),
      icon: List,
    },
  ]

  return (
    <div
      role="group"
      aria-label={translatePublic(locale, 'Display')}
      className={`inline-flex h-10 shrink-0 items-center rounded-[8px] border border-[#d0d5dd] bg-[#f2f4f7] p-1 ${className}`.trim()}
    >
      {options.map((option) => {
        const Icon = option.icon
        const active = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`inline-flex h-8 min-w-0 items-center justify-center gap-1.5 rounded-[6px] px-2.5 text-[12px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0866ff] focus-visible:ring-offset-1 motion-reduce:transition-none xl:px-3 xl:text-[13px] ${
              active
                ? 'bg-[#0866ff] text-white shadow-sm'
                : 'bg-transparent text-[#475467] hover:bg-white hover:text-[#101828]'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
