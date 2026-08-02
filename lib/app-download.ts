import { localizePublicHref, type PublicLocale } from './public-i18n'

export type AppDownloadCopy = {
  footerLabel: string
  pageEyebrow: string
  pageTitle: string
  pageDescription: string
  statusLabel: string
  statusText: string
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
    pageTitle: 'Apparna utvecklas just nu.',
    pageDescription:
      'Vi bygger en snabb och tydlig Autorell-app för fordonssök, sparade annonser, meddelanden och publicering. Apparna öppnar inom kort.',
    statusLabel: 'På väg',
    statusText: 'Design, notiser och kontoflöden finputsas innan lansering.',
    appStoreAlt: 'Ladda ned i App Store',
    googlePlayAlt: 'Ladda ned på Google Play',
    marketplaceCta: 'Sök fordon',
    homeCta: 'Till startsidan',
    metadataTitle: 'Autorell appen kommer snart | Autorell',
    metadataDescription:
      'Autorell utvecklar appar för iOS och Android. Apparna öppnar inom kort med fordonssök, sparade annonser och meddelanden.',
  },
  en: {
    footerLabel: 'Download the app.',
    pageEyebrow: 'Autorell app',
    pageTitle: 'The apps are in development.',
    pageDescription:
      'We are building a fast and clear Autorell app for vehicle search, saved listings, messages and listing tools. The apps will be ready soon.',
    statusLabel: 'Coming soon',
    statusText: 'Design, notifications and account flows are being polished before launch.',
    appStoreAlt: 'Download on the App Store',
    googlePlayAlt: 'Get it on Google Play',
    marketplaceCta: 'Search vehicles',
    homeCta: 'Go home',
    metadataTitle: 'Autorell app coming soon | Autorell',
    metadataDescription:
      'Autorell is building iOS and Android apps. The apps will soon include vehicle search, saved listings and messages.',
  },
  de: {
    footerLabel: 'App herunterladen.',
    pageEyebrow: 'Autorell App',
    pageTitle: 'Die Apps werden gerade entwickelt.',
    pageDescription:
      'Wir entwickeln eine schnelle und klare Autorell App für Fahrzeugsuche, gespeicherte Anzeigen, Nachrichten und Inserat-Tools. Die Apps sind in Kürze verfügbar.',
    statusLabel: 'Bald verfügbar',
    statusText: 'Design, Benachrichtigungen und Kontoflüsse werden vor dem Start finalisiert.',
    appStoreAlt: 'Im App Store laden',
    googlePlayAlt: 'Bei Google Play laden',
    marketplaceCta: 'Fahrzeuge suchen',
    homeCta: 'Zur Startseite',
    metadataTitle: 'Autorell App kommt bald | Autorell',
    metadataDescription:
      'Autorell entwickelt Apps für iOS und Android. Die Apps bieten bald Fahrzeugsuche, gespeicherte Anzeigen und Nachrichten.',
  },
  at: {
    footerLabel: 'App herunterladen.',
    pageEyebrow: 'Autorell App',
    pageTitle: 'Die Apps werden gerade entwickelt.',
    pageDescription:
      'Wir entwickeln eine schnelle und klare Autorell App für Fahrzeugsuche, gespeicherte Anzeigen, Nachrichten und Inserat-Tools. Die Apps sind in Kürze verfügbar.',
    statusLabel: 'Bald verfügbar',
    statusText: 'Design, Benachrichtigungen und Kontoflüsse werden vor dem Start finalisiert.',
    appStoreAlt: 'Im App Store laden',
    googlePlayAlt: 'Bei Google Play laden',
    marketplaceCta: 'Fahrzeuge suchen',
    homeCta: 'Zur Startseite',
    metadataTitle: 'Autorell App kommt bald | Autorell',
    metadataDescription:
      'Autorell entwickelt Apps für iOS und Android. Die Apps bieten bald Fahrzeugsuche, gespeicherte Anzeigen und Nachrichten.',
  },
  be: {
    footerLabel: 'Download de app.',
    pageEyebrow: 'Autorell app',
    pageTitle: 'De apps zijn in ontwikkeling.',
    pageDescription:
      'We bouwen een snelle en duidelijke Autorell app voor voertuigzoekopdrachten, opgeslagen advertenties, berichten en advertentietools. De apps zijn binnenkort klaar.',
    statusLabel: 'Binnenkort',
    statusText: 'Design, meldingen en accountstromen worden voor de lancering verfijnd.',
    appStoreAlt: 'Download in de App Store',
    googlePlayAlt: 'Download via Google Play',
    marketplaceCta: 'Voertuigen zoeken',
    homeCta: 'Naar startpagina',
    metadataTitle: 'Autorell app komt binnenkort | Autorell',
    metadataDescription:
      'Autorell ontwikkelt apps voor iOS en Android. De apps bieden binnenkort voertuigzoekopdrachten, opgeslagen advertenties en berichten.',
  },
  fr: {
    footerLabel: "Télécharger l'application.",
    pageEyebrow: 'Application Autorell',
    pageTitle: 'Les applications sont en développement.',
    pageDescription:
      "Nous développons une application Autorell rapide et claire pour rechercher des véhicules, enregistrer des annonces, envoyer des messages et publier. Les applications seront bientôt prêtes.",
    statusLabel: 'Bientôt disponible',
    statusText: 'Le design, les notifications et les parcours de compte sont finalisés avant le lancement.',
    appStoreAlt: "Télécharger dans l'App Store",
    googlePlayAlt: 'Disponible sur Google Play',
    marketplaceCta: 'Rechercher des véhicules',
    homeCta: "Aller à l'accueil",
    metadataTitle: "Application Autorell bientôt disponible | Autorell",
    metadataDescription:
      "Autorell développe des applications iOS et Android avec recherche de véhicules, annonces enregistrées et messagerie.",
  },
  es: {
    footerLabel: 'Descarga la app.',
    pageEyebrow: 'App de Autorell',
    pageTitle: 'Las apps están en desarrollo.',
    pageDescription:
      'Estamos creando una app de Autorell rápida y clara para buscar vehículos, guardar anuncios, enviar mensajes y publicar. Las apps estarán listas muy pronto.',
    statusLabel: 'Muy pronto',
    statusText: 'Estamos afinando el diseño, las notificaciones y los flujos de cuenta antes del lanzamiento.',
    appStoreAlt: 'Descargar en App Store',
    googlePlayAlt: 'Disponible en Google Play',
    marketplaceCta: 'Buscar vehículos',
    homeCta: 'Ir al inicio',
    metadataTitle: 'La app de Autorell llega pronto | Autorell',
    metadataDescription:
      'Autorell está desarrollando apps para iOS y Android con búsqueda de vehículos, anuncios guardados y mensajes.',
  },
  it: {
    footerLabel: "Scarica l'app.",
    pageEyebrow: 'App Autorell',
    pageTitle: 'Le app sono in sviluppo.',
    pageDescription:
      'Stiamo creando una app Autorell veloce e chiara per cercare veicoli, salvare annunci, inviare messaggi e pubblicare. Le app saranno pronte a breve.',
    statusLabel: 'In arrivo',
    statusText: 'Design, notifiche e flussi account vengono rifiniti prima del lancio.',
    appStoreAlt: 'Scarica su App Store',
    googlePlayAlt: 'Disponibile su Google Play',
    marketplaceCta: 'Cerca veicoli',
    homeCta: 'Vai alla home',
    metadataTitle: 'App Autorell in arrivo | Autorell',
    metadataDescription:
      'Autorell sta sviluppando app iOS e Android con ricerca veicoli, annunci salvati e messaggi.',
  },
  pl: {
    footerLabel: 'Pobierz aplikację.',
    pageEyebrow: 'Aplikacja Autorell',
    pageTitle: 'Aplikacje są w trakcie tworzenia.',
    pageDescription:
      'Tworzymy szybką i przejrzystą aplikację Autorell do wyszukiwania pojazdów, zapisywania ogłoszeń, wiadomości i publikowania ofert. Aplikacje będą gotowe wkrótce.',
    statusLabel: 'Wkrótce',
    statusText: 'Dopracowujemy projekt, powiadomienia i przepływy kont przed uruchomieniem.',
    appStoreAlt: 'Pobierz z App Store',
    googlePlayAlt: 'Pobierz z Google Play',
    marketplaceCta: 'Szukaj pojazdów',
    homeCta: 'Strona główna',
    metadataTitle: 'Aplikacja Autorell już wkrótce | Autorell',
    metadataDescription:
      'Autorell tworzy aplikacje na iOS i Android z wyszukiwaniem pojazdów, zapisanymi ogłoszeniami i wiadomościami.',
  },
  nl: {
    footerLabel: 'Download de app.',
    pageEyebrow: 'Autorell app',
    pageTitle: 'De apps zijn in ontwikkeling.',
    pageDescription:
      'We bouwen een snelle en duidelijke Autorell app voor voertuigzoekopdrachten, opgeslagen advertenties, berichten en advertentietools. De apps zijn binnenkort klaar.',
    statusLabel: 'Binnenkort',
    statusText: 'Design, meldingen en accountstromen worden voor de lancering verfijnd.',
    appStoreAlt: 'Download in de App Store',
    googlePlayAlt: 'Download via Google Play',
    marketplaceCta: 'Voertuigen zoeken',
    homeCta: 'Naar startpagina',
    metadataTitle: 'Autorell app komt binnenkort | Autorell',
    metadataDescription:
      'Autorell ontwikkelt apps voor iOS en Android. De apps bieden binnenkort voertuigzoekopdrachten, opgeslagen advertenties en berichten.',
  },
  fi: {
    footerLabel: 'Lataa sovellus.',
    pageEyebrow: 'Autorell-sovellus',
    pageTitle: 'Sovelluksia kehitetään juuri nyt.',
    pageDescription:
      'Rakennamme nopeaa ja selkeää Autorell-sovellusta ajoneuvohakuun, tallennettuihin ilmoituksiin, viesteihin ja ilmoitusten julkaisuun. Sovellukset valmistuvat pian.',
    statusLabel: 'Tulossa pian',
    statusText: 'Viimeistelemme suunnittelua, ilmoituksia ja tilipolkuja ennen julkaisua.',
    appStoreAlt: 'Lataa App Storesta',
    googlePlayAlt: 'Lataa Google Playsta',
    marketplaceCta: 'Etsi ajoneuvoja',
    homeCta: 'Etusivulle',
    metadataTitle: 'Autorell-sovellus tulossa pian | Autorell',
    metadataDescription:
      'Autorell kehittää iOS- ja Android-sovelluksia ajoneuvohakuun, tallennettuihin ilmoituksiin ja viesteihin.',
  },
  da: {
    footerLabel: 'Hent appen.',
    pageEyebrow: 'Autorell app',
    pageTitle: 'Appsene er under udvikling.',
    pageDescription:
      'Vi bygger en hurtig og tydelig Autorell app til køretøjssøgning, gemte annoncer, beskeder og oprettelse af annoncer. Appsene bliver snart klar.',
    statusLabel: 'Kommer snart',
    statusText: 'Design, notifikationer og kontoflow finpudses inden lancering.',
    appStoreAlt: 'Hent i App Store',
    googlePlayAlt: 'Hent på Google Play',
    marketplaceCta: 'Søg køretøjer',
    homeCta: 'Til forsiden',
    metadataTitle: 'Autorell app kommer snart | Autorell',
    metadataDescription:
      'Autorell udvikler apps til iOS og Android med køretøjssøgning, gemte annoncer og beskeder.',
  },
}

export function getAppDownloadCopy(locale: PublicLocale) {
  return appDownloadCopy[locale] || appDownloadCopy.en
}

export function getAppDownloadHref(locale: PublicLocale) {
  return localizePublicHref(locale, '/app')
}
