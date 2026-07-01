import Link from 'next/link'
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

const homepageIconImages: Record<string, string> = {
  cars: '/home-category-icons/cars.png',
  vans: '/home-category-icons/vans.png',
  motorcycles: '/home-category-icons/motorcycles.png',
  motorhomes: '/home-category-icons/motorhomes.png',
  caravans: '/home-category-icons/caravans.png',
  trucks: '/home-category-icons/trucks.png',
  agriculture: '/home-category-icons/agriculture.png',
  construction: '/home-category-icons/construction.png',
  'electric-bikes': '/home-category-icons/electric-bikes.png',
  'e-scooters': '/home-category-icons/e-scooters.png',
}

export default function VehicleCategoryShowcase({
  items,
  listingLabel,
  listingsLabel,
}: {
  items: VehicleCategoryShowcaseItem[]
  listingLabel: string
  listingsLabel: string
}) {
  return (
    <nav aria-label="Vehicle categories" className="overflow-hidden rounded-[14px] border border-[#e4e9f2] bg-white shadow-[0_14px_42px_rgba(16,24,40,.05)]">
      <div className="grid auto-cols-[112px] grid-flow-col grid-rows-2 gap-x-3 gap-y-6 overflow-x-auto px-3 py-5 [scrollbar-width:thin] sm:auto-cols-[132px] sm:px-5 md:grid-flow-row md:grid-cols-5 md:grid-rows-none md:overflow-visible lg:px-6">
        {items.map((item) => {
          const iconImage = homepageIconImages[item.slug]
          const Icon =
            item.slug === 'electric-bikes'
              ? vehicleIcons.motorcycles
              : vehicleIcons[item.slug] || vehicleIcons.cars
          const countLabel = item.count === 1 ? listingLabel : listingsLabel

          return (
            <Link
              key={item.slug}
              href={item.href}
              className="group flex min-h-[112px] min-w-0 flex-col items-center justify-start rounded-[10px] px-2 py-3 text-center outline-none transition hover:bg-[#f8fbff] focus-visible:ring-3 focus-visible:ring-[#0866ff]/20"
            >
              <span className="grid h-14 w-14 place-items-center rounded-[14px] text-[#0866ff] transition group-hover:bg-[#eef4ff]">
                {iconImage ? (
                  // Homepage category icons are static brand assets in /public.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={iconImage} alt="" className="h-8 w-8 object-contain" />
                ) : (
                  <Icon className="h-8 w-8" strokeWidth={1.9} />
                )}
              </span>
              <span className="mt-2 line-clamp-2 min-h-[34px] max-w-full text-[13px] font-semibold leading-[17px] text-[#101828] [overflow-wrap:anywhere]">
                {item.label}
              </span>
              <span className="mt-1 text-[11px] font-semibold text-[#667085]">
                {item.count.toLocaleString('sv-SE')} {countLabel}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
