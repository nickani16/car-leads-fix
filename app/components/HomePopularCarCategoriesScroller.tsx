'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export type PopularCarCategory = {
  id: string
  title: string
  href: string
  image: string
  tags: string[]
}

type HomePopularCarCategoriesScrollerProps = {
  title: string
  scrollLabel: string
  categories: PopularCarCategory[]
}

export default function HomePopularCarCategoriesScroller({
  title,
  scrollLabel,
  categories,
}: HomePopularCarCategoriesScrollerProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(true)

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
    window.addEventListener('resize', updateScrollState)

    return () => {
      scroller.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [updateScrollState])

  function scrollCategories(direction: -1 | 1) {
    const scroller = scrollerRef.current
    if (!scroller) return

    const firstCard = scroller.querySelector<HTMLElement>('[data-category-card]')
    const styles = window.getComputedStyle(scroller)
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 14
    const step = (firstCard?.offsetWidth ?? Math.round(scroller.clientWidth * 0.8)) + gap

    scroller.scrollBy({
      left: direction * step,
      behavior: 'smooth',
    })
  }

  return (
    <div className="overflow-hidden rounded-[12px] border border-[#cfd8e4] bg-white px-4 py-5 sm:px-5 sm:py-6">
      <h2 className="text-[22px] font-semibold leading-tight text-[#101828] sm:text-[26px]">
        {title}
      </h2>

      <div className="relative mt-4 sm:mt-5">
        <div
          ref={scrollerRef}
          role="region"
          aria-label={scrollLabel}
          className="flex snap-x snap-mandatory gap-3.5 overflow-x-auto scroll-smooth pb-1 pr-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              data-category-card
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
        </div>

        {canScrollPrev ? (
          <button
            type="button"
            onClick={() => scrollCategories(-1)}
            aria-label={`${scrollLabel}: previous`}
            title={`${scrollLabel}: previous`}
            className="absolute left-1 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-[#d8dee8] bg-white text-[#344054] shadow-[0_4px_12px_rgba(16,24,40,.16)] transition hover:border-[#b8c5d6] active:scale-95"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
          </button>
        ) : null}

        {canScrollNext ? (
          <button
            type="button"
            onClick={() => scrollCategories(1)}
            aria-label={`${scrollLabel}: next`}
            title={`${scrollLabel}: next`}
            className="absolute right-1 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-[#d8dee8] bg-white text-[#344054] shadow-[0_4px_12px_rgba(16,24,40,.16)] transition hover:border-[#b8c5d6] active:scale-95"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>
  )
}
