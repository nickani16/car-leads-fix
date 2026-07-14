'use client'

import {
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Maximize2,
  X,
} from 'lucide-react'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type TouchEvent,
} from 'react'
import SavedListingButton from '@/app/components/SavedListingButton'
import ShareListingButton from '@/app/components/ShareListingButton'

export default function ListingImageGallery({
  images,
  fullscreenImages,
  title,
  listingId,
  locale = 'en',
  shareUrl,
  shareLabel = 'Share listing',
  shareCopiedLabel = 'Link copied',
}: {
  images: string[]
  fullscreenImages?: string[]
  title: string
  listingId: string
  locale?: string
  shareUrl?: string
  shareLabel?: string
  shareCopiedLabel?: string
}) {
  const safeImages = images.filter(Boolean)
  const safeFullscreenImages = safeImages.map((image, index) =>
    fullscreenImages?.[index] || image,
  )
  const [active, setActive] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const suppressNextClick = useRef(false)
  const activeImage = safeImages[active]
  const imageCount = safeImages.length
  const fullscreenCopy = galleryCopy(locale)
  const imageCountText = imageCountLabel(locale, imageCount)

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
    <section className="-mx-4 block min-[430px]:-mx-5 sm:mx-0">
      <div className="group relative aspect-[3/2] overflow-hidden bg-white shadow-sm sm:aspect-[16/10] sm:rounded-[12px] lg:aspect-[4/3]">
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
            className="block h-full w-full touch-pan-y select-none"
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

        {activeImage ? (
          <button
            type="button"
            onClick={openFullscreen}
            className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/82 text-[#101828] shadow-[0_2px_10px_rgba(16,24,40,.13)] backdrop-blur transition hover:bg-white/94 sm:right-4 sm:top-4 sm:h-[38px] sm:w-[38px]"
            aria-label="Open fullscreen gallery"
          >
            <Maximize2 className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={1.9} />
          </button>
        ) : null}

        {safeImages.length > 1 ? (
          <>
            <button
              type="button"
              onClick={showPrevious}
              className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/82 text-[#101828] shadow-[0_2px_10px_rgba(16,24,40,.13)] backdrop-blur transition hover:bg-white/94 sm:left-4 sm:h-[38px] sm:w-[38px] lg:opacity-0 lg:group-hover:opacity-100"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-[19px] w-[19px]" strokeWidth={1.9} />
            </button>
            <button
              type="button"
              onClick={showNext}
              className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/82 text-[#101828] shadow-[0_2px_10px_rgba(16,24,40,.13)] backdrop-blur transition hover:bg-white/94 sm:right-4 sm:h-[38px] sm:w-[38px] lg:opacity-0 lg:group-hover:opacity-100"
              aria-label="Next photo"
            >
              <ChevronRight className="h-[19px] w-[19px]" strokeWidth={1.9} />
            </button>
            <button
              type="button"
              onClick={openFullscreen}
              style={{ fontWeight: 400 }}
              className="absolute bottom-3 right-3 inline-flex min-h-9 items-center rounded-[9px] bg-white/84 px-3 text-[16px] font-normal text-[#101828] shadow-[0_2px_10px_rgba(16,24,40,.13)] backdrop-blur"
              aria-label="Open photos"
            >
              {active + 1}/{safeImages.length}
            </button>
          </>
        ) : null}
      </div>
      {safeImages.length > 1 ? (
        <div className="mt-3 flex items-center justify-between gap-3 px-4 min-[430px]:px-5 sm:hidden">
          <SavedListingButton
            listingId={listingId}
            label={fullscreenCopy.save}
            savedLabel={fullscreenCopy.saved}
            variant="icon"
            className="h-12 w-12 rounded-[10px] border border-[#d0d5dd] shadow-sm text-[#101828] hover:text-[#0866ff]"
            iconClassName="h-6 w-6"
          />
          {shareUrl ? (
            <ShareListingButton
              title={title}
              url={shareUrl}
              label={shareLabel}
              copiedLabel={shareCopiedLabel}
              variant="button"
              className="h-12 w-12 rounded-[10px] !px-0 shadow-sm"
              labelClassName="sr-only"
              iconClassName="h-6 w-6 text-[#101828]"
            />
          ) : null}
          <button
            type="button"
            onClick={openFullscreen}
            className="ml-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] border border-[#d0d5dd] bg-white px-4 text-sm font-semibold text-[#101828] shadow-sm transition hover:border-[#0866ff] hover:text-[#0866ff]"
            aria-label={imageCountText}
          >
            {imageCountText}
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {safeImages.length > 1 ? (
        <div className="mt-2 hidden gap-3 overflow-x-auto pb-1 sm:flex lg:hidden">
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
          <div className="pointer-events-none fixed inset-x-0 top-0 z-[190] px-4 pt-[calc(env(safe-area-inset-top)+1rem)] sm:px-8">
            <div className="mx-auto flex max-w-[1120px] items-start justify-between gap-3">
              <div className="pointer-events-auto inline-flex min-h-12 items-center gap-2 rounded-[8px] bg-white px-4 text-base font-semibold text-[#101828] shadow-[0_10px_28px_rgba(0,0,0,.22)]">
                <ImageIcon className="h-5 w-5" />
                {fullscreenCopy.allImages}
              </div>
              <div className="pointer-events-auto flex items-center gap-2.5">
                <SavedListingButton
                  listingId={listingId}
                  label={fullscreenCopy.save}
                  savedLabel={fullscreenCopy.saved}
                  variant="icon"
                  className="h-12 w-12 rounded-[8px] text-[#101828] hover:text-[#101828]"
                  iconClassName="h-6 w-6"
                />
                <button
                  type="button"
                  onClick={() => setFullscreen(false)}
                  className="grid h-12 w-12 place-items-center rounded-[8px] bg-white text-[#101828] shadow-[0_10px_28px_rgba(0,0,0,.22)] transition hover:bg-[#f2f4f7]"
                  aria-label={fullscreenCopy.close}
                >
                  <X className="h-7 w-7" strokeWidth={2.3} />
                </button>
              </div>
            </div>
          </div>

          <div className="h-dvh overflow-y-auto px-4 pb-8 pt-[calc(env(safe-area-inset-top)+5.75rem)] sm:px-8 sm:pb-12">
            <div className="mx-auto grid max-w-[1120px] gap-5 sm:gap-7">
              {safeFullscreenImages.map((image, index) => (
                <div key={`fullscreen-${image}-${index}`} className="overflow-hidden bg-[#181818]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt={index === 0 ? title : ''}
                    className="h-auto w-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

function galleryCopy(locale: string) {
  const normalized = locale === 'at' ? 'de' : locale
  const labels: Record<string, { allImages: string; save: string; saved: string; close: string }> = {
    sv: { allImages: 'Alla bilder', save: 'Lägg till i favoriter', saved: 'Sparad i favoriter', close: 'Stäng galleri' },
    en: { allImages: 'All images', save: 'Save', saved: 'Saved', close: 'Close gallery' },
    de: { allImages: 'Alle Bilder', save: 'Speichern', saved: 'Gespeichert', close: 'Galerie schließen' },
    fr: { allImages: 'Toutes les images', save: 'Enregistrer', saved: 'Enregistré', close: 'Fermer la galerie' },
    es: { allImages: 'Todas las fotos', save: 'Guardar', saved: 'Guardado', close: 'Cerrar galería' },
    it: { allImages: 'Tutte le immagini', save: 'Salva', saved: 'Salvato', close: 'Chiudi galleria' },
    pl: { allImages: 'Wszystkie zdjęcia', save: 'Zapisz', saved: 'Zapisano', close: 'Zamknij galerię' },
    nl: { allImages: "Alle foto's", save: 'Opslaan', saved: 'Opgeslagen', close: 'Galerij sluiten' },
    be: { allImages: "Alle foto's", save: 'Opslaan', saved: 'Opgeslagen', close: 'Galerij sluiten' },
    fi: { allImages: 'Kaikki kuvat', save: 'Tallenna', saved: 'Tallennettu', close: 'Sulje galleria' },
    da: { allImages: 'Alle billeder', save: 'Gem', saved: 'Gemt', close: 'Luk galleri' },
  }

  return labels[normalized] || labels.en
}

function imageCountLabel(locale: string, count: number) {
  const normalized = locale === 'at' ? 'de' : locale
  if (normalized === 'sv') return `${count} bilder`
  if (normalized === 'de') return `${count} Bilder`
  if (normalized === 'fr') return `${count} images`
  if (normalized === 'es') return `${count} fotos`
  if (normalized === 'it') return `${count} immagini`
  if (normalized === 'pl') return `${count} zdjęć`
  if (normalized === 'nl' || normalized === 'be') return `${count} foto's`
  if (normalized === 'fi') return `${count} kuvaa`
  if (normalized === 'da') return `${count} billeder`
  return `${count} images`
}
