'use client'

import { Check, Smartphone } from 'lucide-react'
import { useEffect, useState } from 'react'

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function AppInstallAction({
  label,
  installedLabel,
  className = '',
}: {
  label: string
  installedLabel: string
  className?: string
}) {
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setInstalled(
        window.matchMedia('(display-mode: standalone)').matches ||
          Boolean((navigator as Navigator & { standalone?: boolean }).standalone),
      )
    }, 0)
    const handleInstalled = () => setInstalled(true)
    window.addEventListener('autorell:app-installed', handleInstalled)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('autorell:app-installed', handleInstalled)
    }
  }, [])

  async function install() {
    const prompt = (window as Window & { __autorellInstallPrompt?: InstallPromptEvent }).__autorellInstallPrompt
    if (prompt) {
      await prompt.prompt()
      const choice = await prompt.userChoice
      delete (window as Window & { __autorellInstallPrompt?: InstallPromptEvent }).__autorellInstallPrompt
      if (choice.outcome === 'accepted') setInstalled(true)
      return
    }

    if (navigator.share) {
      await navigator.share({ title: 'Autorell', url: window.location.origin }).catch(() => undefined)
    }
  }

  if (installed) {
    return (
      <span className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-[8px] bg-[#e9f8f0] px-5 text-sm font-semibold text-[#087443] ${className}`}>
        <Check className="h-4 w-4" aria-hidden="true" />
        {installedLabel}
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={() => void install()}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-[8px] bg-[#0866ff] px-6 text-sm font-semibold text-white transition hover:bg-[#0755d9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0866ff] ${className}`}
    >
      <Smartphone className="h-[18px] w-[18px]" aria-hidden="true" />
      {label}
    </button>
  )
}
