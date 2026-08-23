'use client'

import { Download } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { PublicLocale } from '@/lib/public-i18n'

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type InstallCopy = {
  button: string
}

const copyByLocale: Record<PublicLocale, InstallCopy> = {
  sv: { button: 'Installera Autorell' },
  en: { button: 'Install Autorell' },
  de: { button: 'Autorell installieren' },
  at: { button: 'Autorell installieren' },
  be: { button: 'Autorell installeren' },
  fr: { button: 'Installer Autorell' },
  es: { button: 'Instalar Autorell' },
  it: { button: 'Installa Autorell' },
  pl: { button: 'Zainstaluj Autorell' },
  nl: { button: 'Autorell installeren' },
  fi: { button: 'Asenna Autorell' },
  da: { button: 'Installer Autorell' },
}

export default function InstallAutorellButton({ locale }: { locale: PublicLocale }) {
  const copy = copyByLocale[locale] || copyByLocale.en
  const [deferredPrompt, setDeferredPrompt] = useState<InstallPromptEvent | null>(null)
  const [available, setAvailable] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const userAgent = navigator.userAgent
    const isIos = /iPad|iPhone|iPod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    const timer = window.setTimeout(() => {
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
      const storedPrompt = (window as Window & { __autorellInstallPrompt?: InstallPromptEvent }).__autorellInstallPrompt || null
      setInstalled(isInstalled)
      setDeferredPrompt(storedPrompt)
      setAvailable(!isInstalled && Boolean(storedPrompt || (isIos && navigator.share)))
    }, 0)

    const handleInstalled = () => {
      setInstalled(true)
      setDeferredPrompt(null)
      setAvailable(false)
    }
    const handleAvailable = () => {
      const prompt = (window as Window & { __autorellInstallPrompt?: InstallPromptEvent }).__autorellInstallPrompt || null
      setDeferredPrompt(prompt)
      setAvailable(Boolean(prompt))
    }
    window.addEventListener('autorell:install-available', handleAvailable)
    window.addEventListener('autorell:app-installed', handleInstalled)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('autorell:install-available', handleAvailable)
      window.removeEventListener('autorell:app-installed', handleInstalled)
    }
  }, [])

  async function install() {
    const prompt = deferredPrompt || (window as Window & { __autorellInstallPrompt?: InstallPromptEvent }).__autorellInstallPrompt
    if (prompt) {
      await prompt.prompt()
      const choice = await prompt.userChoice
      if (choice.outcome === 'accepted') setInstalled(true)
      delete (window as Window & { __autorellInstallPrompt?: InstallPromptEvent }).__autorellInstallPrompt
      setDeferredPrompt(null)
      setAvailable(false)
      return
    }

    if (navigator.share) {
      await navigator.share({ title: 'Autorell', url: window.location.origin }).catch(() => undefined)
    }
  }

  if (installed || !available) return null

  return (
    <button
      type="button"
      onClick={() => void install()}
      className="inline-flex min-h-9 items-center gap-2 rounded-[8px] border border-[#cbd5e1] bg-white px-3 text-[13px] font-semibold text-[#253858] transition hover:border-[#0866ff] hover:bg-[#f4f8ff] hover:text-[#0866ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0866ff]"
    >
      <Download className="h-4 w-4" strokeWidth={2} />
      {copy.button}
    </button>
  )
}
