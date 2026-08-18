'use client'

import { Children, useEffect, useState, type ReactNode } from 'react'
import type { MarketplaceCategorySlug } from '@/lib/marketplace'

export default function HomeListingCategorySwitcher({
  categories,
  children,
}: {
  categories: MarketplaceCategorySlug[]
  children: ReactNode
}) {
  const [activeCategory, setActiveCategory] = useState<MarketplaceCategorySlug>('cars')
  const childArray = Children.toArray(children)

  useEffect(() => {
    const handleCategoryChange = (event: Event) => {
      const detail = (event as CustomEvent<{ category?: MarketplaceCategorySlug }>).detail
      if (detail?.category && categories.includes(detail.category)) {
        setActiveCategory(detail.category)
      }
    }

    window.addEventListener('autorell:home-category-change', handleCategoryChange)
    return () => window.removeEventListener('autorell:home-category-change', handleCategoryChange)
  }, [categories])

  return (
    <>
      {childArray.map((child, index) => {
        const category = categories[index]
        if (!category) return null
        return (
          <div key={category} hidden={category !== activeCategory}>
            {child}
          </div>
        )
      })}
    </>
  )
}
