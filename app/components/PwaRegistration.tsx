'use client'

import { useEffect } from 'react'

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PwaRegistration() {
  useEffect(() => {
    const handleInstallPrompt = (event: Event) => {
      event.preventDefault()
      ;(window as Window & { __autorellInstallPrompt?: InstallPromptEvent }).__autorellInstallPrompt = event as InstallPromptEvent
      window.dispatchEvent(new CustomEvent('autorell:install-available'))
    }
    const handleInstalled = () => {
      delete (window as Window & { __autorellInstallPrompt?: InstallPromptEvent }).__autorellInstallPrompt
      window.dispatchEvent(new CustomEvent('autorell:app-installed'))
    }

    window.addEventListener('beforeinstallprompt', handleInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)

    if (!('serviceWorker' in navigator)) {
      return () => {
        window.removeEventListener('beforeinstallprompt', handleInstallPrompt)
        window.removeEventListener('appinstalled', handleInstalled)
      }
    }

    const register = () => {
      void navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => undefined)
    }

    if (document.readyState === 'complete') register()
    else window.addEventListener('load', register, { once: true })

    return () => {
      window.removeEventListener('load', register)
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  return null
}
