'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { MarketplaceCategorySlug } from '@/lib/marketplace'
import type { HomepageCategorySeo } from '@/lib/homepage-category-config'
import { rememberPreferredHomeCategory } from './preferred-home-category'

type HomeCategoryContextValue = {
  activeCategory: MarketplaceCategorySlug
  setActiveCategory: (category: MarketplaceCategorySlug) => void
}

const HomeCategoryContext = createContext<HomeCategoryContextValue | null>(null)

export default function HomeCategoryProvider({
  children,
  metadataByCategory,
  initialCategory = 'cars',
}: {
  children: ReactNode
  metadataByCategory: Record<MarketplaceCategorySlug, HomepageCategorySeo>
  initialCategory?: MarketplaceCategorySlug
}) {
  const [activeCategory, setActiveCategoryState] = useState<MarketplaceCategorySlug>(initialCategory)
  const setActiveCategory = useCallback((category: MarketplaceCategorySlug) => {
    rememberPreferredHomeCategory(category)
    setActiveCategoryState(category)
  }, [])
  const value = useMemo(
    () => ({ activeCategory, setActiveCategory }),
    [activeCategory, setActiveCategory],
  )

  useEffect(() => {
    rememberPreferredHomeCategory(activeCategory)
    const metadata = metadataByCategory[activeCategory]
    if (!metadata) return

    document.title = metadata.title
    let description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!description) {
      description = document.createElement('meta')
      description.name = 'description'
      document.head.append(description)
    }
    description.content = metadata.description
  }, [activeCategory, metadataByCategory])

  return <HomeCategoryContext.Provider value={value}>{children}</HomeCategoryContext.Provider>
}

export function useHomeCategory() {
  const context = useContext(HomeCategoryContext)
  if (!context) {
    throw new Error('useHomeCategory must be used within HomeCategoryProvider')
  }
  return context
}
