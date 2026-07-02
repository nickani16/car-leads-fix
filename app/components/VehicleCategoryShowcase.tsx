import Link from 'next/link'
import { autorellCategoryIcons } from './AutorellCategoryIcons'
import { marketplaceCategories } from '@/lib/marketplace'

type VehicleCategoryShowcaseItem = {
  slug: string
  label: string
  href: string
  count: number
}

const vehicleIcons = Object.fromEntries(
  marketplaceCategories.map((category) => [category.slug, category.icon]),
)

export default function VehicleCategoryShowcase({
  items,
}: {
  items: VehicleCategoryShowcaseItem[]
  listingLabel: string
  listingsLabel: string
}) {
  return (
    <nav aria-label="Vehicle categories" className="-mx-5 overflow-x-auto bg-white px-5 py-5 [scrollbar-width:thin] min-[430px]:-mx-0 min-[430px]:px-0 sm:py-6">
      <div className="flex w-max min-w-full items-center gap-3 sm:justify-center sm:gap-4">
        {items.map((item) => {
          const Icon = autorellCategoryIcons[item.slug] || vehicleIcons[item.slug] || vehicleIcons.cars

          return (
            <Link
              key={item.slug}
              href={item.href}
              className="group inline-flex h-12 shrink-0 items-center gap-2.5 rounded-[12px] border border-[#dbe7ff] bg-[#f8fbff] px-4 text-[15px] font-semibold text-[#12213f] shadow-[0_8px_20px_rgba(16,24,40,.045)] outline-none transition hover:-translate-y-0.5 hover:border-[#bfd4ff] hover:bg-[#eef5ff] hover:shadow-[0_12px_26px_rgba(8,102,255,.09)] focus-visible:ring-3 focus-visible:ring-[#0866ff]/18 sm:h-[52px] sm:px-5 sm:text-base"
              aria-label={`${item.label}, ${item.count.toLocaleString('sv-SE')}`}
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center text-[#0866ff]">
                <Icon className="h-5 w-5" strokeWidth={2.25} />
              </span>
              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
