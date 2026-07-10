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
}: ListingCardImageCarouselProps) {
  const [imageIndex, setImageIndex] = useState(0)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const suppressClickRef = useRef(false)
  const visibleImages = images.filter(Boolean)
  const safeImageIndex = visibleImages.length
    ? Math.min(imageIndex, visibleImages.length - 1)
    : 0
  const activeImage = visibleImages[safeImageIndex]
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

  const imageContent = activeImage ? (
    <Image
      src={activeImage}
      alt={title}
      fill
      sizes={sizes}
      className={`object-cover transition duration-500 group-hover:scale-[1.03] ${imageClassName}`}
    />
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
            if (!suppressClickRef.current) return
            event.preventDefault()
            suppressClickRef.current = false
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
            className="absolute left-3 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-[#101828] opacity-0 shadow-[0_8px_22px_rgba(16,24,40,.22)] transition hover:bg-white hover:text-[#0866ff] group-hover:opacity-100 md:grid"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label={nextLabel}
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              showNext()
            }}
            className="absolute right-3 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-[#101828] opacity-0 shadow-[0_8px_22px_rgba(16,24,40,.22)] transition hover:bg-white hover:text-[#0866ff] group-hover:opacity-100 md:grid"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      ) : null}

      {dotCount > 1 ? (
        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full bg-white/95 px-2 py-1 shadow-[0_5px_16px_rgba(16,24,40,.18)] md:hidden">
          {Array.from({ length: dotCount }).map((_, dotIndex) => (
            <span
              key={`${title}-image-dot-${dotIndex}`}
              className={`h-1.5 rounded-full transition ${
                dotIndex === activeDot ? 'w-3 bg-[#0866ff]' : 'w-1.5 bg-[#d2d8e3]'
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
