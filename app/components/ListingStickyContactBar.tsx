'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import type { PublicLocale } from '@/lib/public-i18n'
import ListingContactFormButton from './ListingContactFormButton'

export default function ListingStickyContactBar({
  image,
  title,
  price,
  contactLabel,
  listingId,
  locale,
  defaultPhoneCountry,
}: {
  image?: string | null
  title: string
  price: string
  contactLabel: string
  listingId: string
  locale: PublicLocale
  defaultPhoneCountry?: string
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const update = () => setVisible(window.scrollY > 620)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <div
      aria-hidden={!visible}
      inert={!visible}
      data-listing-sticky-contact
      className={`fixed inset-x-0 top-0 z-[400] transform-gpu border-b border-[#dfe6f2] bg-white shadow-[0_8px_24px_rgba(16,24,40,.1)] transition duration-200 ${visible ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-full opacity-0'}`}
    >
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-full h-20 bg-white" />
      <div className="mx-auto flex h-[58px] max-w-[1260px] items-center gap-2 px-3 sm:h-[64px] sm:gap-3 sm:px-5 lg:h-[70px] lg:gap-4 lg:px-8">
        {image ? (
          <Image src={image} alt="" width={72} height={48} className="hidden h-12 w-[72px] shrink-0 rounded-[8px] object-cover lg:block" />
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="hidden truncate text-base font-semibold text-[#101828] lg:block">{title}</p>
          <p className="truncate text-lg font-semibold tracking-[-0.02em] text-[#0866ff] lg:mt-0.5 lg:text-sm lg:tracking-normal">{price}</p>
        </div>
        <ListingContactFormButton
          listingId={listingId}
          listingTitle={title}
          locale={locale}
          defaultPhoneCountry={defaultPhoneCountry}
          buttonLabel={contactLabel}
          iconClassName="hidden"
          buttonFontWeight={600}
          buttonClassName="inline-flex min-h-10 max-w-[58%] cursor-pointer items-center justify-center overflow-hidden text-ellipsis whitespace-nowrap rounded-[9px] bg-[#0866ff] px-4 text-[13px] font-semibold text-white transition hover:bg-[#0758dc] lg:min-h-11 lg:max-w-none lg:rounded-[11px] lg:px-5 lg:text-sm"
        />
      </div>
    </div>
  )
}
