import { localizePublicHref, type PublicLocale } from './public-i18n'

export type AppDownloadCopy = {
  footerLabel: string
  pageEyebrow: string
  pageTitle: string
  pageDescription: string
  statusLabel: string
  statusText: string
  featureSearch: string
  featureSaved: string
  featureMessages: string
  appStoreAlt: string
  googlePlayAlt: string
  marketplaceCta: string
  homeCta: string
  metadataTitle: string
  metadataDescription: string
}

const appDownloadCopy: Record<PublicLocale, AppDownloadCopy> = {
  sv: {
    footerLabel: 'Ladda ned appen.',
    pageEyebrow: 'Autorell app',
    pageTitle: 'Appen utvecklas för ett snabbare Autorell.',
    pageDescription:
      'Vi bygger en mobilapp för fordonsköp, sparade annonser, meddelanden och enklare annonshantering. Lansering sker inom kort.',
    statusLabel: 'På väg',
    statusText: 'Sök, spara, följ och hantera fordon direkt i mobilen när appen öppnar.',
    featureSearch: 'Snabb fordonsökning',
    featureSaved: 'Sparade annonser',
    featureMessages: 'Meddelanden och notiser',
    appStoreAlt: 'Ladda ned i App Store',
    googlePlayAlt: 'Ladda ned på Google Play',
    marketplaceCta: 'Sök fordon',
    homeCta: 'Till startsidan',
    metadataTitle: 'Autorell appen kommer snart | Autorell',
    metadataDescription:
      'Autorell utvecklar appar för iOS och Android med fordonssök, sparade annonser, meddelanden och annonshantering.',
  },
  en: {
    footerLabel: 'Download the app.',
    pageEyebrow: 'Autorell app',
    pageTitle: 'The app is being built for a faster Autorell.',
    pageDescription:
      'We are building a mobile app for vehicle search, saved listings, messages and easier listing management. Launch is coming soon.',
    statusLabel: 'Coming soon',
    statusText: 'Search, save, follow and manage vehicles from your phone when the app opens.',
    featureSearch: 'Fast vehicle search',
    featureSaved: 'Saved listings',
    featureMessages: 'Messages and alerts',
    appStoreAlt: 'Download on the App Store',
    googlePlayAlt: 'Get it on Google Play',
    marketplaceCta: 'Search vehicles',
    homeCta: 'Go home',
    metadataTitle: 'Autorell app coming soon | Autorell',
    metadataDescription:
      'Autorell is building iOS and Android apps for vehicle search, saved listings, messages and listing management.',
  },
  de: {
    footerLabel: 'App herunterladen.',
    pageEyebrow: 'Autorell App',
    pageTitle: 'Die App wird für ein schnelleres Autorell entwickelt.',
    pageDescription:
      'Wir entwickeln eine mobile App für Fahrzeugsuche, gespeicherte Anzeigen, Nachrichten und einfachere Anzeigenverwaltung. Der Start folgt in Kürze.',
    statusLabel: 'Bald verfügbar',
    statusText: 'Fahrzeuge suchen, speichern, verfolgen und verwalten direkt auf dem Smartphone.',
    featureSearch: 'Schnelle Fahrzeugsuche',
    featureSaved: 'Gespeicherte Anzeigen',
    featureMessages: 'Nachrichten und Hinweise',
    appStoreAlt: 'Im App Store laden',
    googlePlayAlt: 'Bei Google Play laden',
    marketplaceCta: 'Fahrzeuge suchen',
    homeCta: 'Zur Startseite',
    metadataTitle: 'Autorell App kommt bald | Autorell',
    metadataDescription:
      'Autorell entwickelt Apps für iOS und Android mit Fahrzeugsuche, gespeicherten Anzeigen, Nachrichten und Anzeigenverwaltung.',
  },
  at: {
    footerLabel: 'App herunterladen.',
    pageEyebrow: 'Autorell App',
    pageTitle: 'Die App wird für ein schnelleres Autorell entwickelt.',
    pageDescription:
      'Wir entwickeln eine mobile App für Fahrzeugsuche, gespeicherte Anzeigen, Nachrichten und einfachere Anzeigenverwaltung. Der Start folgt in Kürze.',
    statusLabel: 'Bald verfügbar',
    statusText: 'Fahrzeuge suchen, speichern, verfolgen und verwalten direkt auf dem Smartphone.',
    featureSearch: 'Schnelle Fahrzeugsuche',
    featureSaved: 'Gespeicherte Anzeigen',
    featureMessages: 'Nachrichten und Hinweise',
    appStoreAlt: 'Im App Store laden',
    googlePlayAlt: 'Bei Google Play laden',
    marketplaceCta: 'Fahrzeuge suchen',
    homeCta: 'Zur Startseite',
    metadataTitle: 'Autorell App kommt bald | Autorell',
    metadataDescription:
      'Autorell entwickelt Apps für iOS und Android mit Fahrzeugsuche, gespeicherten Anzeigen, Nachrichten und Anzeigenverwaltung.',
  },
  be: {
    footerLabel: 'Download de app.',
    pageEyebrow: 'Autorell app',
    pageTitle: 'De app wordt gebouwd voor een sneller Autorell.',
    pageDescription:
      'We bouwen een mobiele app voor voertuigzoekopdrachten, opgeslagen advertenties, berichten en eenvoudiger advertentiebeheer. De lancering volgt binnenkort.',
    statusLabel: 'Binnenkort',
    statusText: 'Zoek, bewaar, volg en beheer voertuigen direct vanaf je telefoon.',
    featureSearch: 'Snel voertuigen zoeken',
    featureSaved: 'Opgeslagen advertenties',
    featureMessages: 'Berichten en meldingen',
    appStoreAlt: 'Download in de App Store',
    googlePlayAlt: 'Download via Google Play',
    marketplaceCta: 'Voertuigen zoeken',
    homeCta: 'Naar startpagina',
    metadataTitle: 'Autorell app komt binnenkort | Autorell',
    metadataDescription:
      'Autorell ontwikkelt apps voor iOS en Android met voertuigzoekopdrachten, opgeslagen advertenties, berichten en advertentiebeheer.',
  },
  fr: {
    footerLabel: "Télécharger l'application.",
    pageEyebrow: 'Application Autorell',
    pageTitle: 'L’application est en préparation pour un Autorell plus rapide.',
    pageDescription:
      'Nous développons une application mobile pour rechercher des véhicules, enregistrer des annonces, échanger des messages et gérer les annonces plus simplement. Lancement prochainement.',
    statusLabel: 'Bientôt disponible',
    statusText: 'Recherchez, enregistrez, suivez et gérez vos véhicules depuis votre téléphone.',
    featureSearch: 'Recherche rapide',
    featureSaved: 'Annonces enregistrées',
    featureMessages: 'Messages et alertes',
    appStoreAlt: "Télécharger dans l'App Store",
    googlePlayAlt: 'Disponible sur Google Play',
    marketplaceCta: 'Rechercher des véhicules',
    homeCta: "Aller à l'accueil",
    metadataTitle: 'Application Autorell bientôt disponible | Autorell',
    metadataDescription:
      'Autorell développe des applications iOS et Android avec recherche de véhicules, annonces enregistrées, messages et gestion des annonces.',
  },
  es: {
    footerLabel: 'Descarga la app.',
    pageEyebrow: 'App de Autorell',
    pageTitle: 'La app se está creando para un Autorell más rápido.',
    pageDescription:
      'Estamos desarrollando una app móvil para buscar vehículos, guardar anuncios, enviar mensajes y gestionar publicaciones con más facilidad. Lanzamiento próximamente.',
    statusLabel: 'Muy pronto',
    statusText: 'Busca, guarda, sigue y gestiona vehículos directamente desde el móvil.',
    featureSearch: 'Búsqueda rápida',
    featureSaved: 'Anuncios guardados',
    featureMessages: 'Mensajes y avisos',
    appStoreAlt: 'Descargar en App Store',
    googlePlayAlt: 'Disponible en Google Play',
    marketplaceCta: 'Buscar vehículos',
    homeCta: 'Ir al inicio',
    metadataTitle: 'La app de Autorell llega pronto | Autorell',
    metadataDescription:
      'Autorell está desarrollando apps para iOS y Android con búsqueda de vehículos, anuncios guardados, mensajes y gestión de anuncios.',
  },
  it: {
    footerLabel: "Scarica l'app.",
    pageEyebrow: 'App Autorell',
    pageTitle: 'L’app è in sviluppo per un Autorell più veloce.',
    pageDescription:
      'Stiamo sviluppando un’app mobile per cercare veicoli, salvare annunci, inviare messaggi e gestire le inserzioni con più semplicità. Lancio a breve.',
    statusLabel: 'In arrivo',
    statusText: 'Cerca, salva, segui e gestisci veicoli direttamente dal telefono.',
    featureSearch: 'Ricerca veicoli rapida',
    featureSaved: 'Annunci salvati',
    featureMessages: 'Messaggi e avvisi',
    appStoreAlt: 'Scarica su App Store',
    googlePlayAlt: 'Disponibile su Google Play',
    marketplaceCta: 'Cerca veicoli',
    homeCta: 'Vai alla home',
    metadataTitle: 'App Autorell in arrivo | Autorell',
    metadataDescription:
      'Autorell sta sviluppando app iOS e Android con ricerca veicoli, annunci salvati, messaggi e gestione delle inserzioni.',
  },
  pl: {
    footerLabel: 'Pobierz aplikację.',
    pageEyebrow: 'Aplikacja Autorell',
    pageTitle: 'Aplikacja powstaje, aby Autorell działał szybciej.',
    pageDescription:
      'Tworzymy aplikację mobilną do wyszukiwania pojazdów, zapisywania ogłoszeń, wiadomości i łatwiejszego zarządzania ofertami. Premiera już wkrótce.',
    statusLabel: 'Wkrótce',
    statusText: 'Szukaj, zapisuj, obserwuj i zarządzaj pojazdami bezpośrednio z telefonu.',
    featureSearch: 'Szybkie wyszukiwanie',
    featureSaved: 'Zapisane ogłoszenia',
    featureMessages: 'Wiadomości i alerty',
    appStoreAlt: 'Pobierz z App Store',
    googlePlayAlt: 'Pobierz z Google Play',
    marketplaceCta: 'Szukaj pojazdów',
    homeCta: 'Strona główna',
    metadataTitle: 'Aplikacja Autorell już wkrótce | Autorell',
    metadataDescription:
      'Autorell tworzy aplikacje na iOS i Android z wyszukiwaniem pojazdów, zapisanymi ogłoszeniami, wiadomościami i zarządzaniem ofertami.',
  },
  nl: {
    footerLabel: 'Download de app.',
    pageEyebrow: 'Autorell app',
    pageTitle: 'De app wordt gebouwd voor een sneller Autorell.',
    pageDescription:
      'We bouwen een mobiele app voor voertuigzoekopdrachten, opgeslagen advertenties, berichten en eenvoudiger advertentiebeheer. De lancering volgt binnenkort.',
    statusLabel: 'Binnenkort',
    statusText: 'Zoek, bewaar, volg en beheer voertuigen direct vanaf je telefoon.',
    featureSearch: 'Snel voertuigen zoeken',
    featureSaved: 'Opgeslagen advertenties',
    featureMessages: 'Berichten en meldingen',
    appStoreAlt: 'Download in de App Store',
    googlePlayAlt: 'Download via Google Play',
    marketplaceCta: 'Voertuigen zoeken',
    homeCta: 'Naar startpagina',
    metadataTitle: 'Autorell app komt binnenkort | Autorell',
    metadataDescription:
      'Autorell ontwikkelt apps voor iOS en Android met voertuigzoekopdrachten, opgeslagen advertenties, berichten en advertentiebeheer.',
  },
  fi: {
    footerLabel: 'Lataa sovellus.',
    pageEyebrow: 'Autorell-sovellus',
    pageTitle: 'Sovellusta kehitetään nopeampaa Autorellia varten.',
    pageDescription:
      'Rakennamme mobiilisovellusta ajoneuvohakuun, tallennettuihin ilmoituksiin, viesteihin ja helpompaan ilmoitusten hallintaan. Julkaisu on tulossa pian.',
    statusLabel: 'Tulossa pian',
    statusText: 'Etsi, tallenna, seuraa ja hallitse ajoneuvoja suoraan puhelimesta.',
    featureSearch: 'Nopea ajoneuvohaku',
    featureSaved: 'Tallennetut ilmoitukset',
    featureMessages: 'Viestit ja ilmoitukset',
    appStoreAlt: 'Lataa App Storesta',
    googlePlayAlt: 'Lataa Google Playsta',
    marketplaceCta: 'Etsi ajoneuvoja',
    homeCta: 'Etusivulle',
    metadataTitle: 'Autorell-sovellus tulossa pian | Autorell',
    metadataDescription:
      'Autorell kehittää iOS- ja Android-sovelluksia ajoneuvohakuun, tallennettuihin ilmoituksiin, viesteihin ja ilmoitusten hallintaan.',
  },
  da: {
    footerLabel: 'Hent appen.',
    pageEyebrow: 'Autorell app',
    pageTitle: 'Appen udvikles til et hurtigere Autorell.',
    pageDescription:
      'Vi bygger en mobilapp til køretøjssøgning, gemte annoncer, beskeder og enklere annoncehåndtering. Lancering kommer snart.',
    statusLabel: 'Kommer snart',
    statusText: 'Søg, gem, følg og administrer køretøjer direkte fra mobilen.',
    featureSearch: 'Hurtig køretøjssøgning',
    featureSaved: 'Gemte annoncer',
    featureMessages: 'Beskeder og notifikationer',
    appStoreAlt: 'Hent i App Store',
    googlePlayAlt: 'Hent på Google Play',
    marketplaceCta: 'Søg køretøjer',
    homeCta: 'Til forsiden',
    metadataTitle: 'Autorell app kommer snart | Autorell',
    metadataDescription:
      'Autorell udvikler apps til iOS og Android med køretøjssøgning, gemte annoncer, beskeder og annoncehåndtering.',
  },
}

export function getAppDownloadCopy(locale: PublicLocale) {
  return appDownloadCopy[locale] || appDownloadCopy.en
}

export function getAppDownloadHref(locale: PublicLocale) {
  return localizePublicHref(locale, '/app')
}
