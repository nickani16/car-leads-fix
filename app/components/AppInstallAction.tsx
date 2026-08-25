'use client'

import { Check, MoreVertical, Share2, Smartphone, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { PublicLocale } from '@/lib/public-i18n'

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type MobileInstallCopy = {
  title: string
  intro: string
  iosSteps: readonly [string, string, string]
  androidSteps: readonly [string, string, string]
  share: string
  close: string
}

const mobileInstallCopy: Record<PublicLocale, MobileInstallCopy> = {
  sv: { title: 'Lägg Autorell på hemskärmen', intro: 'Följ stegen nedan så öppnas Autorell som en app nästa gång.', iosSteps: ['Tryck på Dela i Safari.', 'Välj Lägg till på hemskärmen.', 'Bekräfta genom att trycka på Lägg till.'], androidSteps: ['Öppna webbläsarens meny.', 'Välj Installera app eller Lägg till på startskärmen.', 'Bekräfta genom att trycka på Installera.'], share: 'Öppna Dela', close: 'Stäng' },
  en: { title: 'Add Autorell to your home screen', intro: 'Follow these steps to open Autorell like an app next time.', iosSteps: ['Tap Share in Safari.', 'Choose Add to Home Screen.', 'Confirm by tapping Add.'], androidSteps: ['Open the browser menu.', 'Choose Install app or Add to Home screen.', 'Confirm by tapping Install.'], share: 'Open Share', close: 'Close' },
  de: { title: 'Autorell zum Startbildschirm hinzufügen', intro: 'Folgen Sie diesen Schritten, um Autorell künftig wie eine App zu öffnen.', iosSteps: ['Tippen Sie in Safari auf Teilen.', 'Wählen Sie Zum Home-Bildschirm.', 'Bestätigen Sie mit Hinzufügen.'], androidSteps: ['Öffnen Sie das Browsermenü.', 'Wählen Sie App installieren oder Zum Startbildschirm hinzufügen.', 'Bestätigen Sie mit Installieren.'], share: 'Teilen öffnen', close: 'Schließen' },
  at: { title: 'Autorell zum Home-Bildschirm hinzufügen', intro: 'Folgen Sie diesen Schritten, um Autorell künftig wie eine App zu öffnen.', iosSteps: ['Tippen Sie in Safari auf Teilen.', 'Wählen Sie Zum Home-Bildschirm.', 'Bestätigen Sie mit Hinzufügen.'], androidSteps: ['Öffnen Sie das Browsermenü.', 'Wählen Sie App installieren oder Zum Startbildschirm hinzufügen.', 'Bestätigen Sie mit Installieren.'], share: 'Teilen öffnen', close: 'Schließen' },
  be: { title: 'Zet Autorell op je startscherm', intro: 'Volg deze stappen om Autorell voortaan als een app te openen.', iosSteps: ['Tik in Safari op Delen.', 'Kies Zet op beginscherm.', 'Bevestig met Voeg toe.'], androidSteps: ['Open het browsermenu.', 'Kies App installeren of Toevoegen aan startscherm.', 'Bevestig met Installeren.'], share: 'Open Delen', close: 'Sluiten' },
  nl: { title: 'Zet Autorell op je startscherm', intro: 'Volg deze stappen om Autorell voortaan als een app te openen.', iosSteps: ['Tik in Safari op Delen.', 'Kies Zet op beginscherm.', 'Bevestig met Voeg toe.'], androidSteps: ['Open het browsermenu.', 'Kies App installeren of Toevoegen aan startscherm.', 'Bevestig met Installeren.'], share: 'Open Delen', close: 'Sluiten' },
  fr: { title: 'Ajoutez Autorell à l’écran d’accueil', intro: 'Suivez ces étapes pour ouvrir ensuite Autorell comme une application.', iosSteps: ['Touchez Partager dans Safari.', 'Choisissez Sur l’écran d’accueil.', 'Confirmez avec Ajouter.'], androidSteps: ['Ouvrez le menu du navigateur.', 'Choisissez Installer l’application ou Ajouter à l’écran d’accueil.', 'Confirmez avec Installer.'], share: 'Ouvrir Partager', close: 'Fermer' },
  es: { title: 'Añade Autorell a la pantalla de inicio', intro: 'Sigue estos pasos para abrir Autorell como una aplicación la próxima vez.', iosSteps: ['Pulsa Compartir en Safari.', 'Elige Añadir a pantalla de inicio.', 'Confirma con Añadir.'], androidSteps: ['Abre el menú del navegador.', 'Elige Instalar aplicación o Añadir a pantalla de inicio.', 'Confirma con Instalar.'], share: 'Abrir Compartir', close: 'Cerrar' },
  it: { title: 'Aggiungi Autorell alla schermata Home', intro: 'Segui questi passaggi per aprire Autorell come un’app la prossima volta.', iosSteps: ['Tocca Condividi in Safari.', 'Scegli Aggiungi alla schermata Home.', 'Conferma con Aggiungi.'], androidSteps: ['Apri il menu del browser.', 'Scegli Installa app o Aggiungi alla schermata Home.', 'Conferma con Installa.'], share: 'Apri Condividi', close: 'Chiudi' },
  pl: { title: 'Dodaj Autorell do ekranu głównego', intro: 'Wykonaj te kroki, aby następnym razem otworzyć Autorell jak aplikację.', iosSteps: ['Stuknij Udostępnij w Safari.', 'Wybierz Do ekranu początkowego.', 'Potwierdź, wybierając Dodaj.'], androidSteps: ['Otwórz menu przeglądarki.', 'Wybierz Zainstaluj aplikację lub Dodaj do ekranu głównego.', 'Potwierdź, wybierając Zainstaluj.'], share: 'Otwórz Udostępnij', close: 'Zamknij' },
  fi: { title: 'Lisää Autorell Koti-valikkoon', intro: 'Seuraa ohjeita, niin voit avata Autorellin jatkossa sovelluksen tavoin.', iosSteps: ['Napauta Safarissa Jaa.', 'Valitse Lisää Koti-valikkoon.', 'Vahvista valitsemalla Lisää.'], androidSteps: ['Avaa selaimen valikko.', 'Valitse Asenna sovellus tai Lisää aloitusnäyttöön.', 'Vahvista valitsemalla Asenna.'], share: 'Avaa Jaa', close: 'Sulje' },
  da: { title: 'Føj Autorell til hjemmeskærmen', intro: 'Følg trinnene, så du fremover kan åbne Autorell som en app.', iosSteps: ['Tryk på Del i Safari.', 'Vælg Føj til hjemmeskærm.', 'Bekræft ved at trykke på Tilføj.'], androidSteps: ['Åbn browserens menu.', 'Vælg Installer app eller Føj til startskærm.', 'Bekræft ved at trykke på Installer.'], share: 'Åbn Del', close: 'Luk' },
}

export default function AppInstallAction({
  label,
  installedLabel,
  locale,
  className = '',
}: {
  label: string
  installedLabel: string
  locale: PublicLocale
  className?: string
}) {
  const [installed, setInstalled] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const [iosDevice, setIosDevice] = useState(false)
  const [canShare, setCanShare] = useState(false)
  const guideCopy = mobileInstallCopy[locale] || mobileInstallCopy.en

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setInstalled(
        window.matchMedia('(display-mode: standalone)').matches ||
          Boolean((navigator as Navigator & { standalone?: boolean }).standalone),
      )
      setCanShare(typeof navigator.share === 'function')
    }, 0)
    const handleInstalled = () => setInstalled(true)
    window.addEventListener('autorell:app-installed', handleInstalled)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('autorell:app-installed', handleInstalled)
    }
  }, [])

  useEffect(() => {
    if (!guideOpen) return
    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setGuideOpen(false)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [guideOpen])

  async function install() {
    const prompt = (window as Window & { __autorellInstallPrompt?: InstallPromptEvent }).__autorellInstallPrompt
    if (prompt) {
      await prompt.prompt()
      const choice = await prompt.userChoice
      delete (window as Window & { __autorellInstallPrompt?: InstallPromptEvent }).__autorellInstallPrompt
      if (choice.outcome === 'accepted') setInstalled(true)
      return
    }

    if (window.matchMedia('(max-width: 1119px)').matches) {
      setIosDevice(/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))
      setGuideOpen(true)
      return
    }

    if (navigator.share) {
      await navigator.share({ title: 'Autorell', url: window.location.origin }).catch(() => undefined)
    }
  }

  async function openShareMenu() {
    if (!navigator.share) return
    await navigator.share({ title: 'Autorell', url: window.location.href }).catch(() => undefined)
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
    <>
      <button
        type="button"
        onClick={() => void install()}
        className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-[8px] bg-[#0866ff] px-6 text-sm font-semibold text-white transition hover:bg-[#0755d9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0866ff] ${className}`}
      >
        <Smartphone className="h-[18px] w-[18px]" aria-hidden="true" />
        {label}
      </button>

      {guideOpen ? (
        <div className="fixed inset-0 z-[320] grid items-end bg-[#101828]/45 p-3 backdrop-blur-[2px] min-[1120px]:hidden" role="presentation">
          <button type="button" aria-label={guideCopy.close} onClick={() => setGuideOpen(false)} className="absolute inset-0 cursor-default" />
          <section role="dialog" aria-modal="true" aria-labelledby="autorell-install-guide-title" className="relative mx-auto w-full max-w-[520px] overflow-hidden rounded-[16px] bg-white shadow-[0_24px_70px_rgba(16,24,40,.25)]">
            <div className="flex items-start gap-4 border-b border-[#e4e7ec] px-5 py-5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[10px] bg-[#eaf3ff] text-[#0866ff]">
                <Smartphone className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 id="autorell-install-guide-title" className="text-[18px] font-semibold leading-6 text-[#101828]">{guideCopy.title}</h2>
                <p className="mt-1.5 text-[13px] leading-5 text-[#667085]">{guideCopy.intro}</p>
              </div>
              <button type="button" onClick={() => setGuideOpen(false)} aria-label={guideCopy.close} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#d0d5dd] bg-white text-[#344054]">
                <X className="h-4.5 w-4.5" aria-hidden="true" />
              </button>
            </div>

            <ol className="space-y-4 px-5 py-5">
              {(iosDevice ? guideCopy.iosSteps : guideCopy.androidSteps).map((step, index) => (
                <li key={step} className="flex items-center gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#eef5ff] text-[13px] font-semibold text-[#0866ff]">{index + 1}</span>
                  <span className="min-w-0 flex-1 text-[14px] font-medium leading-5 text-[#344054]">{step}</span>
                  {index === 0 ? (iosDevice ? <Share2 className="h-5 w-5 shrink-0 text-[#0866ff]" aria-hidden="true" /> : <MoreVertical className="h-5 w-5 shrink-0 text-[#0866ff]" aria-hidden="true" />) : null}
                </li>
              ))}
            </ol>

            <div className="grid gap-2 border-t border-[#edf1f6] px-5 py-4">
              {iosDevice && canShare ? (
                <button type="button" onClick={() => void openShareMenu()} className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-[#0866ff] px-5 text-sm font-semibold text-white">
                  <Share2 className="h-4.5 w-4.5" aria-hidden="true" />
                  {guideCopy.share}
                </button>
              ) : null}
              <button type="button" onClick={() => setGuideOpen(false)} className="h-11 rounded-[10px] border border-[#d0d5dd] bg-white text-sm font-semibold text-[#344054]">
                {guideCopy.close}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  )
}
