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
  showControlsOnDesktop?: boolean
  showControlsOnMobile?: boolean
  showDotsOnDesktop?: boolean
  showDotsOnMobile?: boolean
  enableTouchSwipe?: boolean
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
  showControlsOnDesktop = false,
  showControlsOnMobile = false,
  showDotsOnDesktop = false,
  showDotsOnMobile = true,
  enableTouchSwipe = true,
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
            quality={78}
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
        if (!enableTouchSwipe || visibleImages.length < 2) return
        const touch = event.touches[0]
        touchStartRef.current = { x: touch.clientX, y: touch.clientY }
      }}
      onTouchEnd={(event) => {
        if (!enableTouchSwipe) return
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
            className={`absolute left-2 top-1/2 z-20 h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-transparent text-white shadow-none backdrop-blur-0 transition hover:bg-white hover:text-[#0866ff] md:left-0 md:h-10 md:w-8 ${
              showControlsOnMobile ? 'grid' : 'hidden'
            } ${showControlsOnDesktop ? 'md:grid md:opacity-100' : 'md:grid md:opacity-0 md:group-hover:opacity-100'}`}
          >
            <ChevronLeft className="h-5 w-5 drop-shadow-[0_1px_3px_rgba(16,24,40,.55)] md:h-7 md:w-7" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            aria-label={nextLabel}
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              showNext()
            }}
            className={`absolute right-2 top-1/2 z-20 h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-transparent text-white shadow-none backdrop-blur-0 transition hover:bg-white hover:text-[#0866ff] md:right-0 md:h-10 md:w-8 ${
              showControlsOnMobile ? 'grid' : 'hidden'
            } ${showControlsOnDesktop ? 'md:grid md:opacity-100' : 'md:grid md:opacity-0 md:group-hover:opacity-100'}`}
          >
            <ChevronRight className="h-5 w-5 drop-shadow-[0_1px_3px_rgba(16,24,40,.55)] md:h-7 md:w-7" strokeWidth={2.5} />
          </button>
        </>
      ) : null}

      {dotCount > 1 ? (
        <div className={`absolute bottom-2 left-1/2 z-20 -translate-x-1/2 items-center gap-1.5 rounded-full bg-white px-2.5 py-1 shadow-sm ring-1 ring-black/5 ${
          showDotsOnMobile ? 'flex' : 'hidden'
        } ${showDotsOnDesktop ? 'md:flex' : 'md:hidden'}`}>
          {Array.from({ length: dotCount }).map((_, dotIndex) => (
            <span
              key={`${title}-image-dot-${dotIndex}`}
              className={`h-1.5 rounded-full transition ${
                dotIndex === activeDot ? 'w-2.5 bg-[#0866ff]' : 'w-1.5 bg-[#0866ff]/35'
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
