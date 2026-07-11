'use client'

import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Grid2X2,
  ImageIcon,
  X,
} from 'lucide-react'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type TouchEvent,
} from 'react'

export default function ListingImageGallery({
  images,
  title,
}: {
  images: string[]
  title: string
}) {
  const safeImages = images.filter(Boolean)
  const [active, setActive] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [showGrid, setShowGrid] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const suppressNextClick = useRef(false)
  const activeImage = safeImages[active]
  const imageCount = safeImages.length

  const showPrevious = useCallback(() => {
    if (!imageCount) return
    setActive((current) =>
      current === 0 ? imageCount - 1 : current - 1,
    )
  }, [imageCount])

  const openFullscreen = useCallback(() => {
    if (suppressNextClick.current) {
      suppressNextClick.current = false
      return
    }
    setFullscreen(true)
  }, [])

  function handleMainTouchStart(event: TouchEvent<HTMLButtonElement>) {
    if (imageCount < 2) return
    const touch = event.touches[0]
    touchStartX.current = touch.clientX
    touchStartY.current = touch.clientY
  }

  function handleMainTouchEnd(event: TouchEvent<HTMLButtonElement>) {
    if (
      imageCount < 2 ||
      touchStartX.current === null ||
      touchStartY.current === null
    ) {
      return
    }

    const touch = event.changedTouches[0]
    const deltaX = touch.clientX - touchStartX.current
    const deltaY = touch.clientY - touchStartY.current
    touchStartX.current = null
    touchStartY.current = null

    if (Math.abs(deltaX) < 44 || Math.abs(deltaX) < Math.abs(deltaY) * 1.15) {
      return
    }

    suppressNextClick.current = true
    window.setTimeout(() => {
      suppressNextClick.current = false
    }, 0)

    if (deltaX > 0) showPrevious()
    else showNext()
  }

  const showNext = useCallback(() => {
    if (!imageCount) return
    setActive((current) =>
      current === imageCount - 1 ? 0 : current + 1,
    )
  }, [imageCount])

  useEffect(() => {
    if (!fullscreen) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setFullscreen(false)
      if (event.key === 'ArrowLeft') showPrevious()
      if (event.key === 'ArrowRight') showNext()
    }

    window.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [fullscreen, imageCount, showNext, showPrevious])

  return (
    <section className="block">
      <div className="group relative aspect-[16/10] overflow-hidden rounded-[12px] bg-[#edf4ff] shadow-sm lg:aspect-[4/3]">
        {activeImage ? (
          <button
            type="button"
            onClick={openFullscreen}
            onTouchStart={handleMainTouchStart}
            onTouchEnd={handleMainTouchEnd}
            onTouchCancel={() => {
              touchStartX.current = null
              touchStartY.current = null
            }}
            className="block h-full w-full touch-pan-y"
            aria-label="Open photos"
          >
            <div
              className="flex h-full w-full transition-transform duration-500 ease-[cubic-bezier(.22,.8,.24,1)]"
              style={{ transform: `translate3d(-${active * 100}%, 0, 0)` }}
            >
              {safeImages.map((image, index) => (
                <div key={`${image}-${index}`} className="h-full w-full shrink-0">
                  {/* Public listing images can come from storage/CDN URLs outside Next image config. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt={index === active ? title : ''}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </button>
        ) : (
          <div className="grid h-full place-items-center text-[#0866ff]">
            <span className="grid h-20 w-20 place-items-center rounded-[24px] bg-white/80 shadow-sm">
              <ImageIcon className="h-9 w-9" />
            </span>
          </div>
        )}

        {safeImages.length > 1 ? (
          <>
            <button
              type="button"
              onClick={showPrevious}
              className="absolute left-0 top-1/2 grid h-12 w-8 -translate-y-1/2 place-items-center text-white opacity-100 transition lg:opacity-0 lg:group-hover:opacity-100"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-8 w-8 drop-shadow-[0_1px_4px_rgba(16,24,40,.65)]" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={showNext}
              className="absolute right-0 top-1/2 grid h-12 w-8 -translate-y-1/2 place-items-center text-white opacity-100 transition lg:opacity-0 lg:group-hover:opacity-100"
              aria-label="Next photo"
            >
              <ChevronRight className="h-8 w-8 drop-shadow-[0_1px_4px_rgba(16,24,40,.65)]" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={openFullscreen}
              className="absolute bottom-3 right-3 inline-flex min-h-8 items-center rounded-[8px] bg-white/92 px-3 text-[14px] font-[500] text-[#101828] shadow-[0_4px_14px_rgba(16,24,40,.18)] backdrop-blur"
              aria-label="Open photos"
            >
              {active + 1}/{safeImages.length}
            </button>
          </>
        ) : null}
      </div>
      {safeImages.length > 1 ? (
        <div className="mt-2 flex gap-3 overflow-x-auto pb-1 lg:hidden">
          {safeImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-[8px] border bg-[#edf4ff] transition lg:h-[92px] lg:w-full ${
                active === index
                  ? 'border-[#0866ff] ring-2 ring-[#0866ff]/20'
                  : 'border-[#d9e1ec] hover:border-[#9bbcff]'
              }`}
              aria-label={`Show photo ${index + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="" className="h-full w-full object-cover" />
              <span className="absolute bottom-1.5 right-1.5 rounded-full bg-black/65 px-1.5 py-0.5 text-[10px] font-black text-white">
                {index + 1}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {fullscreen && activeImage ? (
        <div
          className="fixed inset-0 z-[180] bg-[#101214]/96 text-white"
          role="dialog"
          aria-modal="true"
          aria-label="Photo gallery"
        >
          <div className="flex min-h-16 items-center justify-between border-b border-white/10 px-4 pt-[env(safe-area-inset-top)] sm:px-6">
            <button
              type="button"
              onClick={() => setShowGrid((current) => !current)}
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-white/8 px-4 text-sm font-black text-white transition hover:bg-white/14"
            >
              {showGrid ? (
                <Camera className="h-4 w-4" />
              ) : (
                <Grid2X2 className="h-4 w-4" />
              )}
              {showGrid ? 'View photo' : 'All photos'}
            </button>
            <button
              type="button"
              onClick={() => setFullscreen(false)}
              className="grid h-11 w-11 place-items-center rounded-full bg-white/12 text-white shadow-[0_12px_32px_rgba(0,0,0,.28)] transition hover:bg-white/18"
              aria-label="Close gallery"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {showGrid ? (
            <div className="h-[calc(100vh-64px)] overflow-y-auto p-3 sm:p-5">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                {safeImages.map((image, index) => (
                  <button
                    key={`full-${image}-${index}`}
                    type="button"
                    onClick={() => {
                      setActive(index)
                      setShowGrid(false)
                    }}
                    className={`relative aspect-[4/3] overflow-hidden rounded-[8px] border bg-white/5 transition ${
                      active === index
                        ? 'border-[#0866ff] ring-2 ring-[#0866ff]/50'
                        : 'border-white/10 hover:border-white/40'
                    }`}
                    aria-label={`Open photo ${index + 1}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute bottom-2 left-2 rounded-full bg-black/70 px-2 py-1 text-xs font-black">
                      {index + 1}/{safeImages.length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="relative flex h-[calc(100dvh-64px)] items-center justify-center px-3 py-4 sm:px-16">
              {safeImages.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={showPrevious}
                    className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white transition hover:bg-black sm:left-5"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="h-7 w-7" />
                  </button>
                  <button
                    type="button"
                    onClick={showNext}
                    className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white transition hover:bg-black sm:right-5"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="h-7 w-7" />
                  </button>
                </>
              ) : null}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeImage}
                alt={title}
                className="h-full w-full rounded-[10px] object-contain"
              />
              <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/72 px-3 py-1.5 text-sm font-black">
                {active + 1}/{safeImages.length}
              </span>
            </div>
          )}
        </div>
      ) : null}
    </section>
  )
}
