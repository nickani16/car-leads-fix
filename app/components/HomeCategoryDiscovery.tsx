'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import type { MarketplaceCategorySlug } from '@/lib/marketplace'
import type { HomepageCategoryPresentation } from '@/lib/homepage-category-config'
import { useHomeCategory } from './HomeCategoryProvider'

type HomeCategoryDiscoveryProps = {
  presentations: Record<MarketplaceCategorySlug, HomepageCategoryPresentation>
  previousLabel: string
  nextLabel: string
}

export function HomeBrowseByTypeSwitcher(props: HomeCategoryDiscoveryProps) {
  const presentation = useActivePresentation(props.presentations)

  return (
    <DiscoveryPanel
      title={presentation.vehicleTypesTitle}
      action={{
        label: presentation.vehicleTypesAllLabel,
        href: presentation.vehicleTypesAllHref,
      }}
      compact
    >
      <HorizontalScroller
        label={presentation.vehicleTypesScrollLabel}
        previousLabel={props.previousLabel}
        nextLabel={props.nextLabel}
      >
        {presentation.vehicleTypes.map((vehicleType) => (
          <Link
            key={vehicleType.id}
            href={vehicleType.href}
            prefetch={false}
            data-discovery-item
            className="group flex w-[128px] flex-none snap-start flex-col items-center text-center sm:w-[154px] lg:w-[168px]"
          >
            <span className="flex h-[76px] w-full items-center justify-center sm:h-[88px] lg:h-[96px]">
              <Image
                src={vehicleType.image}
                alt=""
                width={480}
                height={280}
                sizes="(max-width: 640px) 128px, (max-width: 1024px) 154px, 168px"
                className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-[1.03]"
              />
            </span>
            <span className="mt-2 text-[14px] font-semibold leading-5 text-[#101828] sm:text-[15px]">
              {vehicleType.title}
            </span>
          </Link>
        ))}
      </HorizontalScroller>
    </DiscoveryPanel>
  )
}

export function HomePopularBrandsSwitcher(props: HomeCategoryDiscoveryProps) {
  const presentation = useActivePresentation(props.presentations)

  return (
    <DiscoveryPanel title={presentation.popularBrandsTitle}>
      <HorizontalScroller
        label={presentation.popularBrandsTitle}
        previousLabel={props.previousLabel}
        nextLabel={props.nextLabel}
      >
        {presentation.popularBrands.map((brand) => (
          <Link
            key={brand.id}
            href={brand.href}
            prefetch={false}
            data-discovery-item
            className="group flex w-[116px] flex-none snap-start flex-col items-center justify-center text-center sm:w-[138px] lg:w-[148px]"
          >
            <span className="flex h-[58px] w-full items-center justify-center">
              {brand.logo ? (
                <Image
                  src={brand.logo}
                  alt=""
                  width={112}
                  height={64}
                  sizes="112px"
                  className="max-h-[52px] w-auto max-w-[104px] object-contain transition-transform duration-200 group-hover:scale-[1.04]"
                />
              ) : (
                <span className="grid h-12 w-12 place-items-center rounded-full border border-[#cad5e2] bg-[#f5f8fc] text-[14px] font-semibold text-[#315a91] transition-transform duration-200 group-hover:scale-[1.04]">
                  {brandInitials(brand.title)}
                </span>
              )}
            </span>
            <span className="mt-2 max-w-full text-[13px] font-semibold leading-5 text-[#101828] sm:text-[14px]">
              {brand.title}
            </span>
          </Link>
        ))}
      </HorizontalScroller>
    </DiscoveryPanel>
  )
}

function useActivePresentation(
  presentations: Record<MarketplaceCategorySlug, HomepageCategoryPresentation>,
) {
  const { activeCategory } = useHomeCategory()
  return presentations[activeCategory] || presentations.cars
}

function DiscoveryPanel({
  title,
  action,
  compact = false,
  children,
}: {
  title: string
  action?: { label: string; href: string }
  compact?: boolean
  children: ReactNode
}) {
  return (
    <section
      className={`border border-[#d4dbe5] bg-white px-4 sm:rounded-[8px] sm:px-6 ${
        compact ? 'py-5 sm:py-6' : 'py-6 sm:py-7'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[22px] font-semibold leading-tight text-[#101828] sm:text-[26px]">
          {title}
        </h2>
        {action ? (
          <Link
            href={action.href}
            prefetch={false}
            className="group inline-flex flex-none items-center gap-1 text-[13px] font-semibold text-[#0866ff] transition-colors hover:text-[#075bd8] sm:text-[14px]"
          >
            {action.label}
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              strokeWidth={2}
              aria-hidden="true"
            />
          </Link>
        ) : null}
      </div>
      <div className={compact ? 'mt-4' : 'mt-5'}>{children}</div>
    </section>
  )
}

function HorizontalScroller({
  label,
  previousLabel,
  nextLabel,
  children,
}: {
  label: string
  previousLabel: string
  nextLabel: string
  children: ReactNode
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const [canScrollPrevious, setCanScrollPrevious] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const updateScrollState = useCallback(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const maximum = Math.max(0, scroller.scrollWidth - scroller.clientWidth)
    setCanScrollPrevious(scroller.scrollLeft > 2)
    setCanScrollNext(scroller.scrollLeft < maximum - 2)
  }, [])

  useEffect(() => {
    const scroller = scrollerRef.current
    updateScrollState()
    if (!scroller) return

    scroller.addEventListener('scroll', updateScrollState, { passive: true })
    const observer = new ResizeObserver(updateScrollState)
    observer.observe(scroller)

    return () => {
      scroller.removeEventListener('scroll', updateScrollState)
      observer.disconnect()
    }
  }, [updateScrollState])

  function move(direction: -1 | 1) {
    const scroller = scrollerRef.current
    if (!scroller) return
    const firstItem = scroller.querySelector<HTMLElement>('[data-discovery-item]')
    const styles = window.getComputedStyle(scroller)
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 16
    const step = (firstItem?.offsetWidth || scroller.clientWidth * 0.75) + gap
    scroller.scrollBy({ left: direction * step, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        role="region"
        aria-label={label}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      {canScrollPrevious ? (
        <ScrollButton
          direction="previous"
          label={`${previousLabel}: ${label}`}
          onClick={() => move(-1)}
        />
      ) : null}
      {canScrollNext ? (
        <ScrollButton
          direction="next"
          label={`${nextLabel}: ${label}`}
          onClick={() => move(1)}
        />
      ) : null}
    </div>
  )
}

function ScrollButton({
  direction,
  label,
  onClick,
}: {
  direction: 'previous' | 'next'
  label: string
  onClick: () => void
}) {
  const Icon = direction === 'previous' ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`absolute top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-[#d4dbe5] bg-white text-[#344054] shadow-[0_3px_10px_rgba(16,24,40,.12)] transition hover:border-[#aebdce] active:scale-95 sm:grid ${
        direction === 'previous' ? 'left-0' : 'right-0'
      }`}
    >
      <Icon className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
    </button>
  )
}

function brandInitials(title: string) {
  return title
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}
