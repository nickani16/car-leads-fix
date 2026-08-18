'use client'

import { useEffect, useState } from 'react'
import type { MarketplaceCategorySlug } from '@/lib/marketplace'

type CategoryLabels = Partial<Record<MarketplaceCategorySlug, string>>

type Templates = {
  latest: string
  top: string
}

function formatTitle(template: string, marketLabel: string, categoryLabel?: string) {
  if (!categoryLabel) return template.replace('{market}', marketLabel).replace('{category}', '')
  return template
    .replace('{market}', marketLabel)
    .replace('{category}', categoryLabel)
    .replace(/\s+/g, ' ')
    .trim()
}

export default function HomeListingSectionTitle({
  baseTitle,
  kind,
  marketLabel,
  categoryLabels,
  templates,
}: {
  baseTitle: string
  kind: 'latest' | 'top'
  marketLabel: string
  categoryLabels: CategoryLabels
  templates: Templates
}) {
  const [category, setCategory] = useState<MarketplaceCategorySlug>('cars')

  useEffect(() => {
    const handleCategoryChange = (event: Event) => {
      const detail = (event as CustomEvent<{ category?: MarketplaceCategorySlug }>).detail
      if (detail?.category) setCategory(detail.category)
    }
    window.addEventListener('autorell:home-category-change', handleCategoryChange)
    return () => window.removeEventListener('autorell:home-category-change', handleCategoryChange)
  }, [])

  const categoryLabel = category === 'cars' ? '' : categoryLabels[category]
  const title = categoryLabel ? formatTitle(templates[kind], marketLabel, categoryLabel) : baseTitle

  return <>{title}</>
}