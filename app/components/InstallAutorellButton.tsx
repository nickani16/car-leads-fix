'use client'

import { Download, MonitorDown, Share, Smartphone, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { PublicLocale } from '@/lib/public-i18n'

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type InstallCopy = {
  button: string
  title: string
  android: string
  ios: string
  desktop: string
  prompt: string
  installed: string
  close: string
}

const copyByLocale: Record<PublicLocale, InstallCopy> = {
  sv: { button: 'Installera Autorell', title: 'Ha Autorell nära till hands', android: 'Installera Autorell direkt från webbläsaren och öppna marknadsplatsen från hemskärmen.', ios: 'Tryck på Dela i webbläsaren och välj Lägg till på hemskärmen.', desktop: 'Öppna webbläsarens meny och välj Installera Autorell eller Skapa genväg.', prompt: 'Installera', installed: 'Autorell är redan installerat på den här enheten.', close: 'Stäng' },
  en: { button: 'Install Autorell', title: 'Keep Autorell close at hand', android: 'Install Autorell from your browser and open the marketplace from your home screen.', ios: 'Tap Share in your browser, then choose Add to Home Screen.', desktop: 'Open your browser menu and choose Install Autorell or Create shortcut.', prompt: 'Install', installed: 'Autorell is already installed on this device.', close: 'Close' },
  de: { button: 'Autorell installieren', title: 'Autorell immer griffbereit', android: 'Installieren Sie Autorell über Ihren Browser und öffnen Sie den Marktplatz vom Startbildschirm.', ios: 'Tippen Sie im Browser auf Teilen und wählen Sie Zum Home-Bildschirm.', desktop: 'Öffnen Sie das Browsermenü und wählen Sie Autorell installieren oder Verknüpfung erstellen.', prompt: 'Installieren', installed: 'Autorell ist auf diesem Gerät bereits installiert.', close: 'Schließen' },
  at: { button: 'Autorell installieren', title: 'Autorell immer griffbereit', android: 'Installieren Sie Autorell über Ihren Browser und öffnen Sie den Marktplatz vom Startbildschirm.', ios: 'Tippen Sie im Browser auf Teilen und wählen Sie Zum Home-Bildschirm.', desktop: 'Öffnen Sie das Browsermenü und wählen Sie Autorell installieren oder Verknüpfung erstellen.', prompt: 'Installieren', installed: 'Autorell ist auf diesem Gerät bereits installiert.', close: 'Schließen' },
  be: { button: 'Autorell installeren', title: 'Autorell altijd bij de hand', android: 'Installeer Autorell via je browser en open de marktplaats vanaf je startscherm.', ios: 'Tik in je browser op Delen en kies Zet op beginscherm.', desktop: 'Open het browsermenu en kies Autorell installeren of Snelkoppeling maken.', prompt: 'Installeren', installed: 'Autorell is al op dit apparaat geïnstalleerd.', close: 'Sluiten' },
  fr: { button: 'Installer Autorell', title: 'Gardez Autorell à portée de main', android: 'Installez Autorell depuis votre navigateur et ouvrez la marketplace depuis votre écran d’accueil.', ios: 'Touchez Partager dans le navigateur, puis choisissez Sur l’écran d’accueil.', desktop: 'Ouvrez le menu du navigateur et choisissez Installer Autorell ou Créer un raccourci.', prompt: 'Installer', installed: 'Autorell est déjà installé sur cet appareil.', close: 'Fermer' },
  es: { button: 'Instalar Autorell', title: 'Ten Autorell siempre a mano', android: 'Instala Autorell desde el navegador y abre el marketplace desde la pantalla de inicio.', ios: 'Pulsa Compartir en el navegador y elige Añadir a pantalla de inicio.', desktop: 'Abre el menú del navegador y elige Instalar Autorell o Crear acceso directo.', prompt: 'Instalar', installed: 'Autorell ya está instalado en este dispositivo.', close: 'Cerrar' },
  it: { button: 'Installa Autorell', title: 'Tieni Autorell a portata di mano', android: 'Installa Autorell dal browser e apri il marketplace dalla schermata Home.', ios: 'Tocca Condividi nel browser, quindi scegli Aggiungi alla schermata Home.', desktop: 'Apri il menu del browser e scegli Installa Autorell o Crea scorciatoia.', prompt: 'Installa', installed: 'Autorell è già installato su questo dispositivo.', close: 'Chiudi' },
  pl: { button: 'Zainstaluj Autorell', title: 'Miej Autorell zawsze pod ręką', android: 'Zainstaluj Autorell z przeglądarki i otwieraj marketplace z ekranu głównego.', ios: 'Stuknij Udostępnij w przeglądarce, a następnie wybierz Do ekranu początkowego.', desktop: 'Otwórz menu przeglądarki i wybierz Zainstaluj Autorell lub Utwórz skrót.', prompt: 'Zainstaluj', installed: 'Autorell jest już zainstalowany na tym urządzeniu.', close: 'Zamknij' },
  nl: { button: 'Autorell installeren', title: 'Autorell altijd bij de hand', android: 'Installeer Autorell via je browser en open de marktplaats vanaf je startscherm.', ios: 'Tik in je browser op Delen en kies Zet op beginscherm.', desktop: 'Open het browsermenu en kies Autorell installeren of Snelkoppeling maken.', prompt: 'Installeren', installed: 'Autorell is al op dit apparaat geïnstalleerd.', close: 'Sluiten' },
  fi: { button: 'Asenna Autorell', title: 'Pidä Autorell aina saatavilla', android: 'Asenna Autorell selaimesta ja avaa markkinapaikka aloitusnäytöltä.', ios: 'Napauta selaimen Jaa-painiketta ja valitse Lisää Koti-valikkoon.', desktop: 'Avaa selaimen valikko ja valitse Asenna Autorell tai Luo pikakuvake.', prompt: 'Asenna', installed: 'Autorell on jo asennettu tälle laitteelle.', close: 'Sulje' },
  da: { button: 'Installer Autorell', title: 'Hav Autorell lige ved hånden', android: 'Installer Autorell fra browseren, og åbn markedspladsen fra startskærmen.', ios: 'Tryk på Del i browseren, og vælg Føj til hjemmeskærm.', desktop: 'Åbn browsermenuen, og vælg Installer Autorell eller Opret genvej.', prompt: 'Installer', installed: 'Autorell er allerede installeret på denne enhed.', close: 'Luk' },
}

export default function InstallAutorellButton({ locale }: { locale: PublicLocale }) {
  const copy = copyByLocale[locale] || copyByLocale.en
  const [open, setOpen] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<InstallPromptEvent | null>(null)
  const [device, setDevice] = useState<'ios' | 'android' | 'desktop'>('desktop')
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const userAgent = navigator.userAgent
    const isIos = /iPad|iPhone|iPod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    const timer = window.setTimeout(() => {
      setDevice(isIos ? 'ios' : /Android/i.test(userAgent) ? 'android' : 'desktop')
      setInstalled(window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
    }, 0)

    const handlePrompt = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as InstallPromptEvent)
    }
    const handleInstalled = () => {
      setInstalled(true)
      setDeferredPrompt(null)
    }
    window.addEventListener('beforeinstallprompt', handlePrompt)
    window.addEventListener('appinstalled', handleInstalled)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('beforeinstallprompt', handlePrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  async function install() {
    if (!deferredPrompt) {
      setOpen(true)
      return
    }
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome === 'accepted') setInstalled(true)
    setDeferredPrompt(null)
  }

  const instruction = installed ? copy.installed : device === 'ios' ? copy.ios : device === 'android' ? copy.android : copy.desktop
  const InstructionIcon = device === 'ios' ? Share : device === 'android' ? Smartphone : MonitorDown

  return (
    <>
      <button
        type="button"
        onClick={() => void install()}
        className="inline-flex min-h-9 items-center gap-2 rounded-[8px] border border-[#cbd5e1] bg-white px-3 text-[13px] font-semibold text-[#253858] transition hover:border-[#0866ff] hover:bg-[#f4f8ff] hover:text-[#0866ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0866ff]"
      >
        <Download className="h-4 w-4" strokeWidth={2} />
        {copy.button}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[520] flex items-end justify-center bg-[#101828]/45 p-0 sm:items-center sm:p-6" role="presentation" onMouseDown={() => setOpen(false)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="autorell-install-title"
            onMouseDown={(event) => event.stopPropagation()}
            className="w-full max-w-md rounded-t-[20px] bg-white p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-[#101828] shadow-[0_24px_70px_rgba(16,24,40,.24)] sm:rounded-[16px] sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[#edf5ff] text-[#0866ff]">
                <InstructionIcon className="h-5 w-5" />
              </span>
              <button type="button" onClick={() => setOpen(false)} aria-label={copy.close} className="grid h-9 w-9 place-items-center rounded-full text-[#667085] transition hover:bg-[#f2f4f7] hover:text-[#101828]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <h2 id="autorell-install-title" className="mt-5 text-xl font-semibold">{copy.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[#526070]">{instruction}</p>
            {!installed && deferredPrompt ? (
              <button type="button" onClick={() => void install()} className="mt-6 h-11 w-full rounded-[10px] bg-[#0866ff] px-4 text-sm font-semibold text-white transition hover:bg-[#0755d9]">
                {copy.prompt}
              </button>
            ) : null}
          </section>
        </div>
      ) : null}
    </>
  )
}
