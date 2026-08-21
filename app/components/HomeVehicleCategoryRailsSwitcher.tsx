'use client'

import type { MarketplaceCategorySlug } from '@/lib/marketplace'
import type { HomepageCategoryPresentation } from '@/lib/homepage-category-config'
import { useHomeCategory } from './HomeCategoryProvider'
import HomeVehicleCategoryRails from './HomeVehicleCategoryRails'

export default function HomeVehicleCategoryRailsSwitcher({
  presentations,
  previousLabel,
  nextLabel,
}: {
  presentations: Record<MarketplaceCategorySlug, HomepageCategoryPresentation>
  previousLabel: string
  nextLabel: string
}) {
  const { activeCategory } = useHomeCategory()
  const presentation = presentations[activeCategory] || presentations.cars

  return (
    <HomeVehicleCategoryRails
      selectedTitle={presentation.selectedTitle}
      selectedScrollLabel={presentation.selectedScrollLabel}
      selectedCategories={presentation.selectedCategories}
      popularTitle={presentation.popularTitle}
      popularScrollLabel={presentation.popularScrollLabel}
      popularCategories={presentation.popularCategories}
      vehicleTypesTitle={presentation.vehicleTypesTitle}
      vehicleTypesScrollLabel={presentation.vehicleTypesScrollLabel}
      vehicleTypes={presentation.vehicleTypes}
      vehicleTypesAllLabel={presentation.vehicleTypesAllLabel}
      vehicleTypesAllHref={presentation.vehicleTypesAllHref}
      popularBrandsTitle={presentation.popularBrandsTitle}
      popularBrands={presentation.popularBrands}
      previousLabel={previousLabel}
      nextLabel={nextLabel}
    />
  )
}
