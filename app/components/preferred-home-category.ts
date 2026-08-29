'use client'

import { useEffect, useState } from 'react'
import type { MarketplaceCategorySlug } from '@/lib/marketplace'
import {
  homepageCategoryHref,
  homepageCategorySlugs,
} from '@/lib/homepage-category-routes'
import type { PublicLocale } from '@/lib/public-i18n'

export const PREFERRED_HOME_CATEGORY_KEY = 'autorell:preferred-home-category'
const preferredCategoryEvent = 'autorell:preferred-home-category'

function isHomepageCategory(value: string | null): value is MarketplaceCategorySlug {
  return Boolean(value && homepageCategorySlugs.includes(value as MarketplaceCategorySlug))
}

export function readPreferredHomeCategory() {
  if (typeof window === 'undefined') return null
  try {
    const value = window.localStorage.getItem(PREFERRED_HOME_CATEGORY_KEY)
    return isHomepageCategory(value) ? value : null
  } catch {
    return null
  }
}

export function rememberPreferredHomeCategory(category: MarketplaceCategorySlug) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(PREFERRED_HOME_CATEGORY_KEY, category)
  } catch {
    // Storage can be blocked; the current page still keeps the selected category.
  }
  window.dispatchEvent(new CustomEvent(preferredCategoryEvent, { detail: category }))
}

export function usePreferredHomeHref(locale: PublicLocale) {
  const [homeHref, setHomeHref] = useState(() => homepageCategoryHref(locale, 'cars'))

  useEffect(() => {
    const update = (category = readPreferredHomeCategory()) => {
      setHomeHref(homepageCategoryHref(locale, category || 'cars'))
    }
    const handlePreference = (event: Event) => {
      const category = (event as CustomEvent<MarketplaceCategorySlug>).detail
      update(isHomepageCategory(category) ? category : null)
    }
    const handleStorage = (event: StorageEvent) => {
      if (event.key === PREFERRED_HOME_CATEGORY_KEY) update()
    }

    update()
    window.addEventListener(preferredCategoryEvent, handlePreference)
    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener(preferredCategoryEvent, handlePreference)
      window.removeEventListener('storage', handleStorage)
    }
  }, [locale])

  return homeHref
}
