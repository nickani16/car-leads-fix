'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function ListingStickyContactBar({
  image,
  title,
  price,
  contactLabel,
}: {
  image?: string | null
  title: string
  price: string
  contactLabel: string
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
      className={`fixed inset-x-0 top-0 z-[400] hidden border-b border-[#dfe6f2] bg-white/96 shadow-[0_8px_24px_rgba(16,24,40,.1)] backdrop-blur transition duration-200 lg:block ${visible ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-full opacity-0'}`}
    >
      <div className="mx-auto flex h-[70px] max-w-[1260px] items-center gap-4 px-8">
        {image ? (
          <Image src={image} alt="" width={72} height={48} className="h-12 w-[72px] shrink-0 rounded-[8px] object-cover" />
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-[#101828]">{title}</p>
          <p className="mt-0.5 text-sm font-semibold text-[#0866ff]">{price}</p>
        </div>
        <a href="#listing-contact-card-desktop" className="inline-flex min-h-11 items-center justify-center rounded-[11px] bg-[#0866ff] px-5 text-sm font-semibold text-white transition hover:bg-[#0758dc]">
          {contactLabel}
        </a>
      </div>
    </div>
  )
}
