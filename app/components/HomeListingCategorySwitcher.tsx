'use client'

import { Children, type ReactNode } from 'react'
import type { MarketplaceCategorySlug } from '@/lib/marketplace'
import { useHomeCategory } from './HomeCategoryProvider'

export default function HomeListingCategorySwitcher({
  categories,
  children,
}: {
  categories: MarketplaceCategorySlug[]
  children: ReactNode
}) {
  const { activeCategory } = useHomeCategory()
  const childArray = Children.toArray(children)
  const activeIndex = categories.indexOf(activeCategory)

  return activeIndex >= 0 ? childArray[activeIndex] ?? null : null
}
