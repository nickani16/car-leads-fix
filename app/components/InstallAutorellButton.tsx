'use client'

import Link from 'next/link'
import { Smartphone } from 'lucide-react'
import { localizePublicHref, type PublicLocale } from '@/lib/public-i18n'

type InstallCopy = {
  button: string
}

const copyByLocale: Record<PublicLocale, InstallCopy> = {
  sv: { button: 'Ladda ner appen' },
  en: { button: 'Download the app' },
  de: { button: 'App herunterladen' },
  at: { button: 'App herunterladen' },
  be: { button: 'App downloaden' },
  fr: { button: 'Télécharger l’application' },
  es: { button: 'Descargar la aplicación' },
  it: { button: 'Scarica l’app' },
  pl: { button: 'Pobierz aplikację' },
  nl: { button: 'App downloaden' },
  fi: { button: 'Lataa sovellus' },
  da: { button: 'Download appen' },
}

export default function InstallAutorellButton({ locale }: { locale: PublicLocale }) {
  const copy = copyByLocale[locale] || copyByLocale.en

  return (
    <Link
      href={localizePublicHref(locale, '/app')}
      className="inline-flex min-h-10 items-center gap-2 rounded-[7px] border border-[#101828] bg-white px-3.5 text-[13px] font-medium text-[#101828] transition hover:bg-[#f2f4f7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0866ff]"
    >
      <Smartphone className="h-[17px] w-[17px]" strokeWidth={1.8} aria-hidden="true" />
      {copy.button}
    </Link>
  )
}
