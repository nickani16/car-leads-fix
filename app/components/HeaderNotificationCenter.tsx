'use client'

import Link from 'next/link'
import { Bell, BellRing, Bookmark, ChevronRight, MessageSquareText, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { PublicLocale } from '@/lib/public-i18n'

type NotificationCopy = {
  label: string
  title: string
  messages: string
  messagesEmpty: string
  searches: string
  searchesEmpty: string
  searchesText: string
  browser: string
  browserText: string
  enabled: string
  enable: string
  unsupported: string
  signIn: string
  signInText: string
  close: string
}

const copyByLocale: Record<PublicLocale, NotificationCopy> = {
  sv: { label: 'Notiser', title: 'Notiser och påminnelser', messages: 'Olästa meddelanden', messagesEmpty: 'Inga olästa meddelanden', searches: 'Sparade sökningar', searchesEmpty: 'Inga sparade sökningar', searchesText: 'Hantera bevakningar och påminnelser', browser: 'Webbläsarnotiser', browserText: 'Tillåt notiser från Autorell på den här enheten.', enabled: 'Aktiverade', enable: 'Aktivera', unsupported: 'Hantera notiser i webbläsarens inställningar.', signIn: 'Logga in för notiser', signInText: 'Få meddelanden, bevakningar och påminnelser samlade på ett ställe.', close: 'Stäng notiser' },
  en: { label: 'Notifications', title: 'Notifications and reminders', messages: 'Unread messages', messagesEmpty: 'No unread messages', searches: 'Saved searches', searchesEmpty: 'No saved searches', searchesText: 'Manage alerts and reminders', browser: 'Browser notifications', browserText: 'Allow notifications from Autorell on this device.', enabled: 'Enabled', enable: 'Enable', unsupported: 'Manage notifications in your browser settings.', signIn: 'Log in for notifications', signInText: 'Keep messages, alerts and reminders together in one place.', close: 'Close notifications' },
  de: { label: 'Benachrichtigungen', title: 'Benachrichtigungen und Erinnerungen', messages: 'Ungelesene Nachrichten', messagesEmpty: 'Keine ungelesenen Nachrichten', searches: 'Gespeicherte Suchen', searchesEmpty: 'Keine gespeicherten Suchen', searchesText: 'Suchaufträge und Erinnerungen verwalten', browser: 'Browser-Benachrichtigungen', browserText: 'Benachrichtigungen von Autorell auf diesem Gerät erlauben.', enabled: 'Aktiviert', enable: 'Aktivieren', unsupported: 'Benachrichtigungen in den Browsereinstellungen verwalten.', signIn: 'Für Benachrichtigungen anmelden', signInText: 'Nachrichten, Suchaufträge und Erinnerungen an einem Ort verwalten.', close: 'Benachrichtigungen schließen' },
  at: { label: 'Benachrichtigungen', title: 'Benachrichtigungen und Erinnerungen', messages: 'Ungelesene Nachrichten', messagesEmpty: 'Keine ungelesenen Nachrichten', searches: 'Gespeicherte Suchen', searchesEmpty: 'Keine gespeicherten Suchen', searchesText: 'Suchaufträge und Erinnerungen verwalten', browser: 'Browser-Benachrichtigungen', browserText: 'Benachrichtigungen von Autorell auf diesem Gerät erlauben.', enabled: 'Aktiviert', enable: 'Aktivieren', unsupported: 'Benachrichtigungen in den Browsereinstellungen verwalten.', signIn: 'Für Benachrichtigungen anmelden', signInText: 'Nachrichten, Suchaufträge und Erinnerungen an einem Ort verwalten.', close: 'Benachrichtigungen schließen' },
  be: { label: 'Meldingen', title: 'Meldingen en herinneringen', messages: 'Ongelezen berichten', messagesEmpty: 'Geen ongelezen berichten', searches: 'Opgeslagen zoekopdrachten', searchesEmpty: 'Geen opgeslagen zoekopdrachten', searchesText: 'Meldingen en herinneringen beheren', browser: 'Browsermeldingen', browserText: 'Sta meldingen van Autorell toe op dit apparaat.', enabled: 'Ingeschakeld', enable: 'Inschakelen', unsupported: 'Beheer meldingen in je browserinstellingen.', signIn: 'Log in voor meldingen', signInText: 'Houd berichten, meldingen en herinneringen bij elkaar.', close: 'Meldingen sluiten' },
  fr: { label: 'Notifications', title: 'Notifications et rappels', messages: 'Messages non lus', messagesEmpty: 'Aucun message non lu', searches: 'Recherches enregistrées', searchesEmpty: 'Aucune recherche enregistrée', searchesText: 'Gérer les alertes et les rappels', browser: 'Notifications du navigateur', browserText: 'Autorisez les notifications Autorell sur cet appareil.', enabled: 'Activées', enable: 'Activer', unsupported: 'Gérez les notifications dans les réglages du navigateur.', signIn: 'Connectez-vous pour les notifications', signInText: 'Regroupez messages, alertes et rappels au même endroit.', close: 'Fermer les notifications' },
  es: { label: 'Notificaciones', title: 'Notificaciones y recordatorios', messages: 'Mensajes sin leer', messagesEmpty: 'No hay mensajes sin leer', searches: 'Búsquedas guardadas', searchesEmpty: 'No hay búsquedas guardadas', searchesText: 'Gestiona alertas y recordatorios', browser: 'Notificaciones del navegador', browserText: 'Permite notificaciones de Autorell en este dispositivo.', enabled: 'Activadas', enable: 'Activar', unsupported: 'Gestiona las notificaciones en los ajustes del navegador.', signIn: 'Inicia sesión para ver notificaciones', signInText: 'Reúne mensajes, alertas y recordatorios en un solo lugar.', close: 'Cerrar notificaciones' },
  it: { label: 'Notifiche', title: 'Notifiche e promemoria', messages: 'Messaggi non letti', messagesEmpty: 'Nessun messaggio non letto', searches: 'Ricerche salvate', searchesEmpty: 'Nessuna ricerca salvata', searchesText: 'Gestisci avvisi e promemoria', browser: 'Notifiche del browser', browserText: 'Consenti le notifiche di Autorell su questo dispositivo.', enabled: 'Attive', enable: 'Attiva', unsupported: 'Gestisci le notifiche nelle impostazioni del browser.', signIn: 'Accedi per le notifiche', signInText: 'Riunisci messaggi, avvisi e promemoria in un unico posto.', close: 'Chiudi notifiche' },
  pl: { label: 'Powiadomienia', title: 'Powiadomienia i przypomnienia', messages: 'Nieprzeczytane wiadomości', messagesEmpty: 'Brak nieprzeczytanych wiadomości', searches: 'Zapisane wyszukiwania', searchesEmpty: 'Brak zapisanych wyszukiwań', searchesText: 'Zarządzaj alertami i przypomnieniami', browser: 'Powiadomienia przeglądarki', browserText: 'Zezwól na powiadomienia Autorell na tym urządzeniu.', enabled: 'Włączone', enable: 'Włącz', unsupported: 'Zarządzaj powiadomieniami w ustawieniach przeglądarki.', signIn: 'Zaloguj się, aby otrzymywać powiadomienia', signInText: 'Wiadomości, alerty i przypomnienia w jednym miejscu.', close: 'Zamknij powiadomienia' },
  nl: { label: 'Meldingen', title: 'Meldingen en herinneringen', messages: 'Ongelezen berichten', messagesEmpty: 'Geen ongelezen berichten', searches: 'Opgeslagen zoekopdrachten', searchesEmpty: 'Geen opgeslagen zoekopdrachten', searchesText: 'Meldingen en herinneringen beheren', browser: 'Browsermeldingen', browserText: 'Sta meldingen van Autorell toe op dit apparaat.', enabled: 'Ingeschakeld', enable: 'Inschakelen', unsupported: 'Beheer meldingen in je browserinstellingen.', signIn: 'Log in voor meldingen', signInText: 'Houd berichten, meldingen en herinneringen bij elkaar.', close: 'Meldingen sluiten' },
  fi: { label: 'Ilmoitukset', title: 'Ilmoitukset ja muistutukset', messages: 'Lukemattomat viestit', messagesEmpty: 'Ei lukemattomia viestejä', searches: 'Tallennetut haut', searchesEmpty: 'Ei tallennettuja hakuja', searchesText: 'Hallitse ilmoituksia ja muistutuksia', browser: 'Selainilmoitukset', browserText: 'Salli Autorellin ilmoitukset tällä laitteella.', enabled: 'Käytössä', enable: 'Ota käyttöön', unsupported: 'Hallitse ilmoituksia selaimen asetuksissa.', signIn: 'Kirjaudu ilmoituksia varten', signInText: 'Pidä viestit, ilmoitukset ja muistutukset yhdessä paikassa.', close: 'Sulje ilmoitukset' },
  da: { label: 'Notifikationer', title: 'Notifikationer og påmindelser', messages: 'Ulæste beskeder', messagesEmpty: 'Ingen ulæste beskeder', searches: 'Gemte søgninger', searchesEmpty: 'Ingen gemte søgninger', searchesText: 'Administrer alarmer og påmindelser', browser: 'Browsernotifikationer', browserText: 'Tillad notifikationer fra Autorell på denne enhed.', enabled: 'Aktiveret', enable: 'Aktivér', unsupported: 'Administrer notifikationer i browserens indstillinger.', signIn: 'Log ind for notifikationer', signInText: 'Saml beskeder, alarmer og påmindelser ét sted.', close: 'Luk notifikationer' },
}

export default function HeaderNotificationCenter({
  locale,
  authenticated,
  unreadMessages,
  savedSearchCount,
  messagesHref,
  savedSearchesHref,
  onRequireAuth,
}: {
  locale: PublicLocale
  authenticated: boolean
  unreadMessages: number
  savedSearchCount: number
  messagesHref: string
  savedSearchesHref: string
  onRequireAuth: () => void
}) {
  const copy = copyByLocale[locale] || copyByLocale.en
  const [open, setOpen] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('unsupported')
  const rootRef = useRef<HTMLDivElement | null>(null)
  const badgeCount = unreadMessages + savedSearchCount
  const badge = badgeCount > 99 ? '99+' : badgeCount ? String(badgeCount) : ''

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPermission('Notification' in window ? Notification.permission : 'unsupported')
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!open) return
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  async function enableBrowserNotifications() {
    if (!('Notification' in window)) return
    const nextPermission = await Notification.requestPermission()
    setPermission(nextPermission)
    if (nextPermission !== 'granted') return

    const registration = await navigator.serviceWorker?.ready.catch(() => null)
    if (registration) {
      await registration.showNotification('Autorell', {
        body: copy.enabled,
        icon: '/icon-192.png',
        badge: '/favicon-96.png',
      })
    }
  }

  function handleGuestClick() {
    setOpen(false)
    onRequireAuth()
  }

  function closePanel() {
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative flex h-full items-center">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={copy.label}
        aria-expanded={open}
        className="inline-grid h-10 w-10 place-items-center rounded-full text-[#101828] transition hover:bg-[#f2f6ff] hover:text-[#0866ff]"
      >
        <span className="relative">
          <Bell className="h-5 w-5" strokeWidth={1.9} />
          {badge ? (
            <span className="absolute -right-2.5 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-[#0866ff] px-1 text-[9px] font-semibold leading-none text-white">{badge}</span>
          ) : null}
        </span>
      </button>

      <section className={`absolute right-0 top-full z-[170] mt-2 w-[min(360px,calc(100vw-24px))] rounded-[12px] border border-[#d9e1ec] bg-white p-4 text-[#101828] shadow-[0_20px_55px_rgba(16,24,40,.18)] transition ${open ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-1 opacity-0'}`}>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[15px] font-semibold">{copy.title}</h2>
          <button type="button" onClick={() => setOpen(false)} aria-label={copy.close} className="grid h-8 w-8 place-items-center rounded-full text-[#667085] transition hover:bg-[#f2f4f7] hover:text-[#101828]">
            <X className="h-4 w-4" />
          </button>
        </div>

        {authenticated ? (
          <div className="mt-3 grid gap-2">
            <Link href={messagesHref} onClick={closePanel} className="flex min-h-14 items-center gap-3 rounded-[9px] bg-[#f7f9fc] px-3 transition hover:bg-[#eef5ff]">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[9px] bg-white text-[#0866ff]"><MessageSquareText className="h-[18px] w-[18px]" /></span>
              <span className="min-w-0 flex-1"><strong className="block text-sm font-semibold">{unreadMessages ? `${unreadMessages} ${copy.messages.toLocaleLowerCase()}` : copy.messagesEmpty}</strong><span className="mt-0.5 block text-xs text-[#667085]">{copy.messages}</span></span>
              <ChevronRight className="h-4 w-4 text-[#98a2b3]" />
            </Link>
            <Link href={savedSearchesHref} onClick={closePanel} className="flex min-h-14 items-center gap-3 rounded-[9px] bg-[#f7f9fc] px-3 transition hover:bg-[#eef5ff]">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[9px] bg-white text-[#0866ff]"><Bookmark className="h-[18px] w-[18px]" /></span>
              <span className="min-w-0 flex-1"><strong className="block text-sm font-semibold">{savedSearchCount ? `${savedSearchCount} ${copy.searches.toLocaleLowerCase()}` : copy.searchesEmpty}</strong><span className="mt-0.5 block text-xs text-[#667085]">{copy.searchesText}</span></span>
              <ChevronRight className="h-4 w-4 text-[#98a2b3]" />
            </Link>
            <div className="flex min-h-14 items-center gap-3 border-t border-[#edf1f6] px-3 pt-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[9px] bg-[#edf5ff] text-[#0866ff]"><BellRing className="h-[18px] w-[18px]" /></span>
              <span className="min-w-0 flex-1"><strong className="block text-sm font-semibold">{copy.browser}</strong><span className="mt-0.5 block text-xs text-[#667085]">{permission === 'unsupported' || permission === 'denied' ? copy.unsupported : copy.browserText}</span></span>
              {permission === 'default' ? <button type="button" onClick={() => void enableBrowserNotifications()} className="rounded-[8px] bg-[#0866ff] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#0755d9]">{copy.enable}</button> : permission === 'granted' ? <span className="text-xs font-semibold text-[#087443]">{copy.enabled}</span> : null}
            </div>
          </div>
        ) : (
          <div className="mt-3 rounded-[10px] bg-[#f7f9fc] p-4">
            <p className="text-sm leading-6 text-[#526070]">{copy.signInText}</p>
            <button type="button" onClick={handleGuestClick} className="mt-4 h-10 w-full rounded-[9px] bg-[#0866ff] px-4 text-sm font-semibold text-white transition hover:bg-[#0755d9]">{copy.signIn}</button>
          </div>
        )}
      </section>
    </div>
  )
}
