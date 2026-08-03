'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
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
  previousLabel,
  nextLabel,
}: HomeVehicleCategoryRailsProps) {
  return (
    <div className="space-y-3">
      <CategoryPanel title={selectedTitle} compact>
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
                data-rail-card
                className={`group flex h-[136px] w-[154px] flex-none snap-start flex-col overflow-hidden rounded-[8px] transition ${
                  category.highlighted
                    ? 'bg-[#b8d3ff] hover:bg-[#adcbfc]'
                    : 'bg-[#e4e9f0] hover:bg-[#dce4ed]'
                }`}
              >
                <div className="flex h-[84px] items-center justify-center px-2 pt-2">
                  <Image
                    src={category.image}
                    alt=""
                    width={720}
                    height={420}
                    sizes="154px"
                    className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex min-h-0 flex-1 items-center gap-2 px-3 pb-2.5">
                  <span
                    className={`grid h-8 w-8 flex-none place-items-center rounded-[6px] ${
                      category.highlighted
                        ? 'bg-[#5269b0] text-white'
                        : 'bg-[#d4dbe4] text-[#667085]'
                    }`}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[12px] font-semibold leading-[1.15] text-[#101828]">
                      {category.title}
                    </span>
                    <span className="mt-0.5 block text-[9px] font-medium leading-[1.2] text-[#475467]">
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
              data-rail-card
              className="group w-[252px] flex-none snap-start overflow-hidden rounded-[8px] bg-[#e4e9f0] transition hover:bg-[#dde5ee] sm:w-[282px] lg:w-[292px]"
            >
              <div className="relative h-[126px] overflow-hidden bg-[#dce3eb] sm:h-[138px]">
                <Image
                  src={category.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 252px, (max-width: 1024px) 282px, 292px"
                  className="object-cover transition duration-300 group-hover:scale-[1.02]"
                />
              </div>
              <div className="min-h-[112px] px-3 pb-3 pt-3">
                <h3 className="text-[16px] font-semibold leading-tight text-[#101828] sm:text-[17px]">
                  {category.title}
                </h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {category.tags.map((tag) => (
                    <span
                      key={`${category.id}-${tag}`}
                      className="inline-flex min-h-5 max-w-full items-center rounded-[4px] bg-[#f5f7fa] px-1.5 text-[11px] font-medium leading-[1.15] text-[#101828] [overflow-wrap:anywhere]"
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

      <CategoryPanel title={vehicleTypesTitle} compact>
        <CategoryScroller
          scrollLabel={vehicleTypesScrollLabel}
          previousLabel={previousLabel}
          nextLabel={nextLabel}
        >
          {vehicleTypes.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              data-rail-card
              className="group flex h-[146px] w-[154px] flex-none snap-start flex-col overflow-hidden rounded-[8px] bg-[#e4e9f0] transition hover:bg-[#dce4ed]"
            >
              <div className="flex h-[96px] items-center justify-center px-2 pt-2">
                <Image
                  src={category.image}
                  alt=""
                  width={720}
                  height={420}
                  sizes="154px"
                  className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-2 pb-2 text-center">
                <h3 className="text-[12px] font-semibold leading-[1.2] text-[#101828]">
                  {category.title}
                </h3>
                <p className="mt-1 text-[9px] font-medium leading-[1.2] text-[#475467]">
                  {category.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </CategoryScroller>
      </CategoryPanel>
    </div>
  )
}

function CategoryPanel({
  title,
  compact = false,
  children,
}: {
  title: string
  compact?: boolean
  children: ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-[12px] border border-[#cfd8e4] bg-white px-4 py-5 sm:px-5 sm:py-6">
      <h2
        className={`${compact ? 'text-[20px] sm:text-[22px]' : 'text-[22px] sm:text-[26px]'} font-semibold leading-tight text-[#101828]`}
      >
        {title}
      </h2>
      <div className="mt-4 sm:mt-5">{children}</div>
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
        className="flex snap-x snap-mandatory gap-3.5 overflow-x-auto scroll-smooth pb-1 pr-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      {canScrollPrev ? (
        <button
          type="button"
          onClick={() => scrollCategories(-1)}
          aria-label={previousAriaLabel}
          title={previousAriaLabel}
          className="absolute left-1 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-[#d8dee8] bg-white text-[#344054] shadow-[0_4px_12px_rgba(16,24,40,.16)] transition hover:border-[#b8c5d6] active:scale-95"
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
          className="absolute right-1 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-[#d8dee8] bg-white text-[#344054] shadow-[0_4px_12px_rgba(16,24,40,.16)] transition hover:border-[#b8c5d6] active:scale-95"
        >
          <ChevronRight className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  )
}
