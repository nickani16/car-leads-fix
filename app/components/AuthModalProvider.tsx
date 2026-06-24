'use client'

import { MouseEvent, useEffect, useState } from 'react'
import { X } from 'lucide-react'
import EmailCodeAuth from './EmailCodeAuth'
import type { PublicLocale } from '@/lib/public-i18n'

type AuthMode = 'login' | 'register'

export default function AuthModalProvider({
  locale,
}: {
  locale: PublicLocale
}) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onClick(event: globalThis.MouseEvent) {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const target = event.target as HTMLElement | null
      const link = target?.closest('a[href]') as HTMLAnchorElement | null
      if (!link || link.target) return
      const href = link.getAttribute('href') || ''
      const url = new URL(href, window.location.origin)
      if (url.origin !== window.location.origin) return
      if (url.pathname !== '/login' && url.pathname !== '/registrera') return
      event.preventDefault()
      setMode(url.pathname === '/registrera' ? 'register' : 'login')
      setOpen(true)
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', close)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', close)
    }
  }, [open])

  if (!open) return null

  function closeModal(event?: MouseEvent) {
    event?.preventDefault()
    setOpen(false)
  }

  return (
    <div className="fixed inset-0 z-[300] grid place-items-center bg-[#101828]/45 px-4 py-6 backdrop-blur-[3px]">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 cursor-default"
        onClick={closeModal}
      />
      <div className="relative max-h-[calc(100dvh-32px)] w-full max-w-[430px] overflow-y-auto rounded-[28px] bg-white shadow-[0_32px_90px_rgba(16,24,40,.28)]">
        <button
          type="button"
          onClick={closeModal}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full border border-[#dce3ef] bg-white text-[#344054] shadow-sm transition hover:bg-[#f5f7fa]"
        >
          <X className="h-4 w-4" />
        </button>
        <EmailCodeAuth
          locale={locale}
          mode={mode}
          variant="modal"
          onModeChange={setMode}
        />
      </div>
    </div>
  )
}
