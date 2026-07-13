'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef, useState, type ReactNode } from 'react'

type ListingCardImageCarouselProps = {
  images: string[]
  title: string
  sizes: string
  href?: string
  className?: string
  imageClassName?: string
  previousLabel?: string
  nextLabel?: string
  placeholder?: ReactNode
  onNavigate?: () => void
}

export default function ListingCardImageCarousel({
  images,
  title,
  sizes,
  href,
  className = '',
  imageClassName = '',
  previousLabel = 'Previous photo',
  nextLabel = 'Next photo',
  placeholder,
  onNavigate,
}: ListingCardImageCarouselProps) {
  const [imageIndex, setImageIndex] = useState(0)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const suppressClickRef = useRef(false)
  const visibleImages = images.filter(Boolean).slice(0, 5)
  const safeImageIndex = visibleImages.length
    ? Math.min(imageIndex, visibleImages.length - 1)
    : 0
  const dotCount = Math.min(visibleImages.length, 5)
  const activeDot =
    visibleImages.length > dotCount && dotCount > 1
      ? Math.round((safeImageIndex / (visibleImages.length - 1)) * (dotCount - 1))
      : safeImageIndex

  function showPrevious() {
    if (visibleImages.length < 2) return
    setImageIndex((current) => (current <= 0 ? visibleImages.length - 1 : current - 1))
  }

  function showNext() {
    if (visibleImages.length < 2) return
    setImageIndex((current) => (current >= visibleImages.length - 1 ? 0 : current + 1))
  }

  const imageContent = visibleImages.length ? (
    <div
      className="flex h-full w-full transition-transform duration-500 ease-[cubic-bezier(.22,.8,.24,1)]"
      style={{ transform: `translate3d(-${safeImageIndex * 100}%, 0, 0)` }}
    >
      {visibleImages.map((image, index) => (
        <div key={`${image}-${index}`} className="relative h-full w-full shrink-0">
          <Image
            src={image}
            alt={index === safeImageIndex ? title : ''}
            fill
            sizes={sizes}
            className={`object-cover ${imageClassName}`}
          />
        </div>
      ))}
    </div>
  ) : (
    placeholder || null
  )

  return (
    <div
      className={`group pointer-events-auto relative h-full w-full overflow-hidden ${className}`}
      onTouchStart={(event) => {
        if (visibleImages.length < 2) return
        const touch = event.touches[0]
        touchStartRef.current = { x: touch.clientX, y: touch.clientY }
      }}
      onTouchEnd={(event) => {
        const start = touchStartRef.current
        if (!start || visibleImages.length < 2) return
        touchStartRef.current = null
        const touch = event.changedTouches[0]
        const deltaX = touch.clientX - start.x
        const deltaY = touch.clientY - start.y
        if (Math.abs(deltaX) < 36 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) return
        suppressClickRef.current = true
        if (deltaX < 0) showNext()
        else showPrevious()
        window.setTimeout(() => {
          suppressClickRef.current = false
        }, 0)
      }}
    >
      {href ? (
        <Link
          href={href}
          onClick={(event) => {
            if (suppressClickRef.current) {
              event.preventDefault()
              suppressClickRef.current = false
              return
            }
            onNavigate?.()
          }}
          className="absolute inset-0 z-0 block"
        >
          {imageContent}
        </Link>
      ) : (
        <div className="absolute inset-0 z-0">{imageContent}</div>
      )}

      {visibleImages.length > 1 ? (
        <>
          <button
            type="button"
            aria-label={previousLabel}
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              showPrevious()
            }}
            className="absolute left-0 top-1/2 z-20 hidden h-10 w-8 -translate-y-1/2 place-items-center text-white opacity-0 transition md:grid md:group-hover:opacity-100"
          >
            <ChevronLeft className="h-7 w-7 drop-shadow-[0_1px_3px_rgba(16,24,40,.55)]" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            aria-label={nextLabel}
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              showNext()
            }}
            className="absolute right-0 top-1/2 z-20 hidden h-10 w-8 -translate-y-1/2 place-items-center text-white opacity-0 transition md:grid md:group-hover:opacity-100"
          >
            <ChevronRight className="h-7 w-7 drop-shadow-[0_1px_3px_rgba(16,24,40,.55)]" strokeWidth={2.5} />
          </button>
        </>
      ) : null}

      {dotCount > 1 ? (
        <div className="absolute bottom-0 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-t-[10px] bg-[#101828]/54 px-2 py-1 shadow-[0_-1px_10px_rgba(16,24,40,.14)] backdrop-blur-[2px] md:hidden">
          {Array.from({ length: dotCount }).map((_, dotIndex) => (
            <span
              key={`${title}-image-dot-${dotIndex}`}
              className={`h-1.5 rounded-full transition ${
                dotIndex === activeDot ? 'w-2.5 bg-white' : 'w-1.5 bg-white/55'
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
