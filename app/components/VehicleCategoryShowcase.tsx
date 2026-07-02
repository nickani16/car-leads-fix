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
    <nav aria-label="Vehicle categories" className="-mx-5 overflow-x-auto bg-white px-5 py-4 [scrollbar-width:thin] min-[430px]:-mx-0 min-[430px]:px-0 sm:py-5">
      <div className="flex w-max min-w-full items-center gap-2 sm:justify-center sm:gap-2.5">
        {items.map((item) => {
          const Icon = autorellCategoryIcons[item.slug] || vehicleIcons[item.slug] || vehicleIcons.cars

          return (
            <Link
              key={item.slug}
              href={item.href}
              className="group inline-flex h-10 shrink-0 items-center gap-2 rounded-[11px] border border-[#dbe7ff] bg-[#f8fbff] px-3 text-[13px] font-medium text-[#12213f] shadow-[0_8px_18px_rgba(16,24,40,.04)] outline-none transition hover:-translate-y-0.5 hover:border-[#bfd4ff] hover:bg-[#eef5ff] hover:shadow-[0_12px_24px_rgba(8,102,255,.08)] focus-visible:ring-3 focus-visible:ring-[#0866ff]/18 sm:h-11 sm:px-3.5 sm:text-sm"
              aria-label={`${item.label}, ${item.count.toLocaleString('sv-SE')}`}
            >
              <span className="grid h-5 w-5 shrink-0 place-items-center text-[#0866ff]">
                <Icon className="h-4 w-4" strokeWidth={2.1} />
              </span>
              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
