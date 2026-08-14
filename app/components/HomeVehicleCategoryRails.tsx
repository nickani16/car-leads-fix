'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  Bike,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Gauge,
  Sparkles,
  Truck,
  Zap,
  type LucideIcon,
} from 'lucide-react'

export type PopularCarCategory = {
  id: string
  title: string
  href: string
  image: string
  tags: string[]
}

export type SelectedVehicleCategory = {
  id: string
  title: string
  subtitle: string
  href: string
  image: string
  icon: 'electric' | 'leasing' | 'newer' | 'ebike' | 'utility' | 'sport'
  highlighted?: boolean
}

export type VehicleBodyCategory = {
  id: string
  title: string
  subtitle: string
  href: string
  image: string
}

export type PopularVehicleBrand = {
  id: string
  title: string
  href: string
  logo: string
}

type HomeVehicleCategoryRailsProps = {
  selectedTitle: string
  selectedScrollLabel: string
  selectedCategories: SelectedVehicleCategory[]
  popularTitle: string
  popularScrollLabel: string
  popularCategories: PopularCarCategory[]
  vehicleTypesTitle: string
  vehicleTypesScrollLabel: string
  vehicleTypes: VehicleBodyCategory[]
  vehicleTypesAllLabel: string
  vehicleTypesAllHref: string
  popularBrandsTitle: string
  popularBrands: PopularVehicleBrand[]
  previousLabel: string
  nextLabel: string
}

const selectedIcons: Record<SelectedVehicleCategory['icon'], LucideIcon> = {
  electric: Zap,
  leasing: CreditCard,
  newer: Sparkles,
  ebike: Bike,
  utility: Truck,
  sport: Gauge,
}

export default function HomeVehicleCategoryRails({
  selectedTitle,
  selectedScrollLabel,
  selectedCategories,
  popularTitle,
  popularScrollLabel,
  popularCategories,
  vehicleTypesTitle,
  vehicleTypesScrollLabel,
  vehicleTypes,
  vehicleTypesAllLabel,
  vehicleTypesAllHref,
  popularBrandsTitle,
  popularBrands,
  previousLabel,
  nextLabel,
}: HomeVehicleCategoryRailsProps) {
  return (
    <div className="space-y-4 sm:space-y-5">
      <CategoryPanel title={selectedTitle}>
        <CategoryScroller
          scrollLabel={selectedScrollLabel}
          previousLabel={previousLabel}
          nextLabel={nextLabel}
        >
          {selectedCategories.map((category) => {
            const Icon = selectedIcons[category.icon]

            return (
              <Link
                key={category.id}
                href={category.href}
                prefetch={false}
                data-rail-card
                className={`group flex h-[150px] w-[164px] flex-none snap-start flex-col overflow-hidden rounded-[8px] transition sm:h-[158px] sm:w-[176px] ${
                  category.highlighted
                    ? 'bg-[#b8d3ff] hover:bg-[#adcbfc]'
                    : 'border border-[#d4dbe5] bg-white hover:border-[#b8c6d8] hover:bg-[#f8fbff]'
                }`}
              >
                <div className="flex h-[88px] items-center justify-center px-2 pt-2 sm:h-[94px]">
                  <Image
                    src={category.image}
                    alt=""
                    width={720}
                    height={420}
                    sizes="(max-width: 640px) 164px, 176px"
                    className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex min-h-0 flex-1 items-center gap-2.5 px-3 pb-3">
                  <span
                    className={`grid h-10 w-10 flex-none place-items-center rounded-[8px] ${
                      category.highlighted
                        ? 'bg-[#5269b0] text-white'
                        : 'bg-[#edf4ff] text-[#5269b0]'
                    }`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold leading-[1.15] text-[#101828] sm:text-[16px]">
                      {category.title}
                    </span>
                    <span className="mt-1 block text-[12px] font-medium leading-[1.2] text-[#475467]">
                      {category.subtitle}
                    </span>
                  </span>
                </div>
              </Link>
            )
          })}
        </CategoryScroller>
      </CategoryPanel>

      <CategoryPanel title={popularTitle}>
        <CategoryScroller
          scrollLabel={popularScrollLabel}
          previousLabel={previousLabel}
          nextLabel={nextLabel}
        >
          {popularCategories.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              prefetch={false}
              data-rail-card
              className="group w-[280px] flex-none snap-start overflow-hidden rounded-[8px] border border-[#d4dbe5] bg-white transition hover:border-[#b8c6d8] hover:bg-[#f8fbff] sm:w-[320px] lg:w-[336px]"
            >
              <div className="relative h-[187px] overflow-hidden bg-white sm:h-[196px]">
                <Image
                  src={category.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 280px, (max-width: 1024px) 320px, 336px"
                  className="object-cover transition duration-300 group-hover:scale-[1.02]"
                />
              </div>
              <div className="min-h-[104px] px-3.5 pb-3.5 pt-3">
                <h3 className="text-[19px] font-semibold leading-tight text-[#101828] sm:text-[20px]">
                  {category.title}
                </h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {category.tags.map((tag) => (
                    <span
                      key={`${category.id}-${tag}`}
                      className="inline-flex min-h-[22px] max-w-full items-center rounded-[4px] bg-[#edf4ff] px-2 text-[12px] font-medium leading-[1.15] text-[#101828] [overflow-wrap:anywhere]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </CategoryScroller>
      </CategoryPanel>

      <CategoryPanel
        title={vehicleTypesTitle}
        action={{ label: vehicleTypesAllLabel, href: vehicleTypesAllHref }}
      >
        <CategoryScroller
          scrollLabel={vehicleTypesScrollLabel}
          previousLabel={previousLabel}
          nextLabel={nextLabel}
        >
          {vehicleTypes.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              prefetch={false}
              data-rail-card
              className="group flex h-[162px] w-[164px] flex-none snap-start flex-col overflow-hidden rounded-[8px] border border-[#d4dbe5] bg-white transition hover:border-[#b8c6d8] hover:bg-[#f8fbff] sm:h-[174px] sm:w-[176px]"
            >
              <div className="flex h-[108px] items-center justify-center px-2 pt-2 sm:h-[116px]">
                <Image
                  src={category.image}
                  alt=""
                  width={720}
                  height={420}
                  sizes="(max-width: 640px) 164px, 176px"
                  className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-2 pb-2 text-center">
                <h3 className="text-[15px] font-semibold leading-[1.2] text-[#101828] sm:text-[16px]">
                  {category.title}
                </h3>
                <p className="mt-1.5 text-[11px] font-medium leading-[1.2] text-[#475467] sm:text-[12px]">
                  {category.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </CategoryScroller>
      </CategoryPanel>

      <CategoryPanel title={popularBrandsTitle}>
        <div className="grid grid-cols-3 gap-px overflow-hidden rounded-[8px] border border-[#d4dbe5] bg-[#d4dbe5] sm:grid-cols-4 lg:grid-cols-6">
          {popularBrands.map((brand) => (
            <Link
              key={brand.id}
              href={brand.href}
              prefetch={false}
              className="group flex min-h-[108px] min-w-0 flex-col items-center justify-center bg-white px-2 py-4 text-center transition hover:bg-[#f3f7fc] sm:min-h-[112px]"
            >
              <span className="flex h-12 w-full items-center justify-center">
                <Image
                  src={brand.logo}
                  alt=""
                  width={80}
                  height={52}
                  sizes="80px"
                  className="max-h-11 w-auto max-w-[72px] object-contain transition duration-300 group-hover:scale-[1.06]"
                />
              </span>
              <span className="mt-2 block max-w-full text-[13px] font-semibold leading-[1.2] text-[#101828] sm:text-[14px]">
                {brand.title}
              </span>
            </Link>
          ))}
        </div>
      </CategoryPanel>
    </div>
  )
}

function CategoryPanel({
  title,
  action,
  children,
}: {
  title: string
  action?: { label: string; href: string }
  children: ReactNode
}) {
  return (
    <section className="overflow-hidden border-y border-[#cfd8e4] bg-white px-4 py-7 sm:rounded-[8px] sm:border sm:px-6 sm:py-7">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h2 className="text-[24px] font-semibold leading-tight text-[#101828] sm:text-[28px]">
          {title}
        </h2>
        {action ? (
          <Link
            href={action.href}
            prefetch={false}
            className="group inline-flex flex-none items-center gap-1.5 text-[13px] font-semibold text-[#0866ff] transition hover:text-[#075bd8] sm:text-[14px]"
          >
            {action.label}
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
              strokeWidth={2}
              aria-hidden="true"
            />
          </Link>
        ) : null}
      </div>
      <div className="mt-5 sm:mt-6">{children}</div>
    </section>
  )
}

function CategoryScroller({
  scrollLabel,
  previousLabel,
  nextLabel,
  children,
}: {
  scrollLabel: string
  previousLabel: string
  nextLabel: string
  children: ReactNode
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const updateScrollState = useCallback(() => {
    const scroller = scrollerRef.current
    if (!scroller) return

    const maxScrollLeft = Math.max(0, scroller.scrollWidth - scroller.clientWidth)
    setCanScrollPrev(scroller.scrollLeft > 2)
    setCanScrollNext(scroller.scrollLeft < maxScrollLeft - 2)
  }, [])

  useEffect(() => {
    const scroller = scrollerRef.current
    updateScrollState()
    if (!scroller) return

    scroller.addEventListener('scroll', updateScrollState, { passive: true })
    const resizeObserver = new ResizeObserver(updateScrollState)
    resizeObserver.observe(scroller)

    return () => {
      scroller.removeEventListener('scroll', updateScrollState)
      resizeObserver.disconnect()
    }
  }, [updateScrollState])

  function scrollCategories(direction: -1 | 1) {
    const scroller = scrollerRef.current
    if (!scroller) return

    const firstCard = scroller.querySelector<HTMLElement>('[data-rail-card]')
    const styles = window.getComputedStyle(scroller)
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 14
    const step = (firstCard?.offsetWidth ?? Math.round(scroller.clientWidth * 0.8)) + gap

    scroller.scrollBy({
      left: direction * step,
      behavior: 'smooth',
    })
  }

  const previousAriaLabel = `${previousLabel}: ${scrollLabel}`
  const nextAriaLabel = `${nextLabel}: ${scrollLabel}`

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        role="region"
        aria-label={scrollLabel}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-1 pr-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      {canScrollPrev ? (
        <button
          type="button"
          onClick={() => scrollCategories(-1)}
          aria-label={previousAriaLabel}
          title={previousAriaLabel}
          className="absolute left-1 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-[#d8dee8] bg-white text-[#344054] shadow-[0_4px_12px_rgba(16,24,40,.16)] transition hover:border-[#b8c5d6] active:scale-95"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
        </button>
      ) : null}

      {canScrollNext ? (
        <button
          type="button"
          onClick={() => scrollCategories(1)}
          aria-label={nextAriaLabel}
          title={nextAriaLabel}
          className="absolute right-1 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-[#d8dee8] bg-white text-[#344054] shadow-[0_4px_12px_rgba(16,24,40,.16)] transition hover:border-[#b8c5d6] active:scale-95"
        >
          <ChevronRight className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  )
}
