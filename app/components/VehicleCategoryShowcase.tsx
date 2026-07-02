import Link from 'next/link'
import type { ReactElement, SVGProps } from 'react'
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

type HomepageIconProps = SVGProps<SVGSVGElement>

function HomeCarIcon(props: HomepageIconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  )
}

function HomeVanIcon(props: HomepageIconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M13 6v5a1 1 0 0 0 1 1h6.102a1 1 0 0 1 .712.298l.898.91a1 1 0 0 1 .288.702V17a1 1 0 0 1-1 1h-3" />
      <path d="M5 18H3a1 1 0 0 1-1-1V8a2 2 0 0 1 2-2h12c1.1 0 2.1.8 2.4 1.8l1.176 4.2" />
      <path d="M9 18h5" />
      <circle cx="16" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </svg>
  )
}

function HomeCaravanIcon(props: HomepageIconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M18 19V9a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v8a2 2 0 0 0 2 2h2" />
      <path d="M2 9h3a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2" />
      <path d="M22 17v1a1 1 0 0 1-1 1H10v-9a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v9" />
      <circle cx="8" cy="19" r="2" />
    </svg>
  )
}

function HomeMotorbikeIcon(props: HomepageIconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="m18 14-1-3" />
      <path d="m3 9 6 2a2 2 0 0 1 2-2h2a2 2 0 0 1 1.99 1.81" />
      <path d="M8 17h3a1 1 0 0 0 1-1 6 6 0 0 1 6-6 1 1 0 0 0 1-1v-.75A5 5 0 0 0 17 5" />
      <circle cx="19" cy="17" r="3" />
      <circle cx="5" cy="17" r="3" />
    </svg>
  )
}

function HomeTruckIcon(props: HomepageIconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </svg>
  )
}

function HomeBikeIcon(props: HomepageIconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="18.5" cy="17.5" r="3.5" />
      <circle cx="5.5" cy="17.5" r="3.5" />
      <circle cx="15" cy="5" r="1" />
      <path d="M12 17.5V14l-3-3 4-3 2 3h2" />
    </svg>
  )
}

function HomeScooterIcon(props: HomepageIconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M21 4h-3.5l2 11.05" />
      <path d="M6.95 17h5.142c.523 0 .95-.406 1.063-.916a6.5 6.5 0 0 1 5.345-5.009" />
      <circle cx="19.5" cy="17.5" r="2.5" />
      <circle cx="4.5" cy="17.5" r="2.5" />
    </svg>
  )
}

const homepageIcons: Record<string, (props: HomepageIconProps) => ReactElement> = {
  cars: HomeCarIcon,
  vans: HomeVanIcon,
  motorcycles: HomeMotorbikeIcon,
  caravans: HomeCaravanIcon,
  trucks: HomeTruckIcon,
  'electric-bikes': HomeBikeIcon,
  'e-scooters': HomeScooterIcon,
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
          const Icon = homepageIcons[item.slug] || vehicleIcons[item.slug] || vehicleIcons.cars
          const countLabel = item.count === 1 ? listingLabel : listingsLabel

          return (
            <Link
              key={item.slug}
              href={item.href}
              className="group flex min-h-[112px] min-w-0 flex-col items-center justify-start rounded-[10px] px-2 py-3 text-center outline-none transition hover:bg-[#f8fbff] focus-visible:ring-3 focus-visible:ring-[#0866ff]/20"
            >
              <span className="grid h-14 w-14 place-items-center rounded-[14px] text-[#0866ff] transition group-hover:bg-[#eef4ff]">
                <Icon className="h-7 w-7" strokeWidth={1.9} />
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
