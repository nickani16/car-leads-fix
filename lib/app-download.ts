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
    footerLabel: 'Ladda ned',
    pageEyebrow: 'Autorell app',
    pageTitle: 'Autorell-apparna kommer snart.',
    pageDescription:
      'Vi färdigställer just nu Autorell för iPhone och Android. Apparna beräknas vara klara inom några veckor.',
    statusLabel: 'Arbetet pågår',
    statusText: 'Under tiden fungerar hela Autorell som vanligt i mobilens webbläsare.',
    featureSearch: 'Snabb fordonsökning',
    featureSaved: 'Sparade annonser',
    featureMessages: 'Meddelanden och notiser',
    appStoreAlt: 'Ladda ned i App Store',
    googlePlayAlt: 'Ladda ned på Google Play',
    marketplaceCta: 'Sök fordon',
    homeCta: 'Till startsidan',
    metadataTitle: 'Autorell-appen kommer snart | Autorell',
    metadataDescription:
      'Autorells appar för iPhone och Android färdigställs och beräknas vara klara inom några veckor.',
  },
  en: {
    footerLabel: 'Download',
    pageEyebrow: 'Autorell app',
    pageTitle: 'The Autorell apps are coming soon.',
    pageDescription:
      'We are putting the finishing touches on Autorell for iPhone and Android. The apps are expected to be ready within a few weeks.',
    statusLabel: 'Work in progress',
    statusText: 'In the meantime, all of Autorell works as usual in your mobile browser.',
    featureSearch: 'Fast vehicle search',
    featureSaved: 'Saved listings',
    featureMessages: 'Messages and alerts',
    appStoreAlt: 'Download on the App Store',
    googlePlayAlt: 'Get it on Google Play',
    marketplaceCta: 'Search vehicles',
    homeCta: 'Go home',
    metadataTitle: 'Autorell app coming soon | Autorell',
    metadataDescription:
      'Autorell for iPhone and Android is being finalized and is expected to be ready within a few weeks.',
  },
  de: {
    footerLabel: 'Herunterladen',
    pageEyebrow: 'Autorell App',
    pageTitle: 'Die Autorell Apps kommen bald.',
    pageDescription:
      'Wir stellen Autorell für iPhone und Android gerade fertig. Die Apps werden voraussichtlich in wenigen Wochen bereit sein.',
    statusLabel: 'In Arbeit',
    statusText: 'Bis dahin funktioniert Autorell wie gewohnt im mobilen Browser.',
    featureSearch: 'Schnelle Fahrzeugsuche',
    featureSaved: 'Gespeicherte Anzeigen',
    featureMessages: 'Nachrichten und Hinweise',
    appStoreAlt: 'Im App Store laden',
    googlePlayAlt: 'Bei Google Play laden',
    marketplaceCta: 'Fahrzeuge suchen',
    homeCta: 'Zur Startseite',
    metadataTitle: 'Autorell App kommt bald | Autorell',
    metadataDescription:
      'Autorell für iPhone und Android wird fertiggestellt und soll in wenigen Wochen verfügbar sein.',
  },
  at: {
    footerLabel: 'Herunterladen',
    pageEyebrow: 'Autorell App',
    pageTitle: 'Die Autorell Apps kommen bald.',
    pageDescription:
      'Wir stellen Autorell für iPhone und Android gerade fertig. Die Apps werden voraussichtlich in wenigen Wochen bereit sein.',
    statusLabel: 'In Arbeit',
    statusText: 'Bis dahin funktioniert Autorell wie gewohnt im mobilen Browser.',
    featureSearch: 'Schnelle Fahrzeugsuche',
    featureSaved: 'Gespeicherte Anzeigen',
    featureMessages: 'Nachrichten und Hinweise',
    appStoreAlt: 'Im App Store laden',
    googlePlayAlt: 'Bei Google Play laden',
    marketplaceCta: 'Fahrzeuge suchen',
    homeCta: 'Zur Startseite',
    metadataTitle: 'Autorell App kommt bald | Autorell',
    metadataDescription:
      'Autorell für iPhone und Android wird fertiggestellt und soll in wenigen Wochen verfügbar sein.',
  },
  be: {
    footerLabel: 'Downloaden',
    pageEyebrow: 'Autorell app',
    pageTitle: 'De Autorell-apps komen binnenkort.',
    pageDescription:
      'We leggen de laatste hand aan Autorell voor iPhone en Android. De apps zijn naar verwachting binnen enkele weken klaar.',
    statusLabel: 'In ontwikkeling',
    statusText: 'Tot die tijd werkt Autorell zoals gewoonlijk in de browser van je telefoon.',
    featureSearch: 'Snel voertuigen zoeken',
    featureSaved: 'Opgeslagen advertenties',
    featureMessages: 'Berichten en meldingen',
    appStoreAlt: 'Download in de App Store',
    googlePlayAlt: 'Download via Google Play',
    marketplaceCta: 'Voertuigen zoeken',
    homeCta: 'Naar startpagina',
    metadataTitle: 'Autorell app komt binnenkort | Autorell',
    metadataDescription:
      'Autorell voor iPhone en Android wordt afgerond en is naar verwachting binnen enkele weken klaar.',
  },
  fr: {
    footerLabel: 'Télécharger',
    pageEyebrow: 'Application Autorell',
    pageTitle: 'Les applications Autorell arrivent bientôt.',
    pageDescription:
      'Nous finalisons actuellement Autorell pour iPhone et Android. Les applications devraient être prêtes dans quelques semaines.',
    statusLabel: 'En cours de finalisation',
    statusText: 'En attendant, Autorell fonctionne normalement dans le navigateur de votre mobile.',
    featureSearch: 'Recherche rapide',
    featureSaved: 'Annonces enregistrées',
    featureMessages: 'Messages et alertes',
    appStoreAlt: "Télécharger dans l'App Store",
    googlePlayAlt: 'Disponible sur Google Play',
    marketplaceCta: 'Rechercher des véhicules',
    homeCta: "Aller à l'accueil",
    metadataTitle: 'Application Autorell bientôt disponible | Autorell',
    metadataDescription:
      'Autorell pour iPhone et Android est en cours de finalisation et devrait être prêt dans quelques semaines.',
  },
  es: {
    footerLabel: 'Descargar',
    pageEyebrow: 'App de Autorell',
    pageTitle: 'Las apps de Autorell llegarán pronto.',
    pageDescription:
      'Estamos ultimando Autorell para iPhone y Android. Se espera que las apps estén listas en unas semanas.',
    statusLabel: 'En desarrollo',
    statusText: 'Mientras tanto, Autorell funciona con normalidad en el navegador del móvil.',
    featureSearch: 'Búsqueda rápida',
    featureSaved: 'Anuncios guardados',
    featureMessages: 'Mensajes y avisos',
    appStoreAlt: 'Descargar en App Store',
    googlePlayAlt: 'Disponible en Google Play',
    marketplaceCta: 'Buscar vehículos',
    homeCta: 'Ir al inicio',
    metadataTitle: 'La app de Autorell llega pronto | Autorell',
    metadataDescription:
      'Autorell para iPhone y Android está en fase final y se espera que esté listo en unas semanas.',
  },
  it: {
    footerLabel: 'Scarica',
    pageEyebrow: 'App Autorell',
    pageTitle: 'Le app Autorell arriveranno presto.',
    pageDescription:
      'Stiamo ultimando Autorell per iPhone e Android. Le app dovrebbero essere pronte entro poche settimane.',
    statusLabel: 'Lavori in corso',
    statusText: 'Nel frattempo Autorell funziona normalmente nel browser del telefono.',
    featureSearch: 'Ricerca veicoli rapida',
    featureSaved: 'Annunci salvati',
    featureMessages: 'Messaggi e avvisi',
    appStoreAlt: 'Scarica su App Store',
    googlePlayAlt: 'Disponibile su Google Play',
    marketplaceCta: 'Cerca veicoli',
    homeCta: 'Vai alla home',
    metadataTitle: 'App Autorell in arrivo | Autorell',
    metadataDescription:
      'Autorell per iPhone e Android è in fase di completamento e dovrebbe essere pronto entro poche settimane.',
  },
  pl: {
    footerLabel: 'Pobierz',
    pageEyebrow: 'Aplikacja Autorell',
    pageTitle: 'Aplikacje Autorell już wkrótce.',
    pageDescription:
      'Kończymy prace nad Autorell na iPhone’a i Androida. Aplikacje powinny być gotowe w ciągu kilku tygodni.',
    statusLabel: 'Prace trwają',
    statusText: 'Do tego czasu Autorell działa normalnie w przeglądarce telefonu.',
    featureSearch: 'Szybkie wyszukiwanie',
    featureSaved: 'Zapisane ogłoszenia',
    featureMessages: 'Wiadomości i alerty',
    appStoreAlt: 'Pobierz z App Store',
    googlePlayAlt: 'Pobierz z Google Play',
    marketplaceCta: 'Szukaj pojazdów',
    homeCta: 'Strona główna',
    metadataTitle: 'Aplikacja Autorell już wkrótce | Autorell',
    metadataDescription:
      'Autorell na iPhone’a i Androida jest finalizowany i powinien być gotowy w ciągu kilku tygodni.',
  },
  nl: {
    footerLabel: 'Downloaden',
    pageEyebrow: 'Autorell app',
    pageTitle: 'De Autorell-apps komen binnenkort.',
    pageDescription:
      'We leggen de laatste hand aan Autorell voor iPhone en Android. De apps zijn naar verwachting binnen enkele weken klaar.',
    statusLabel: 'In ontwikkeling',
    statusText: 'Tot die tijd werkt Autorell zoals gewoonlijk in de browser van je telefoon.',
    featureSearch: 'Snel voertuigen zoeken',
    featureSaved: 'Opgeslagen advertenties',
    featureMessages: 'Berichten en meldingen',
    appStoreAlt: 'Download in de App Store',
    googlePlayAlt: 'Download via Google Play',
    marketplaceCta: 'Voertuigen zoeken',
    homeCta: 'Naar startpagina',
    metadataTitle: 'Autorell app komt binnenkort | Autorell',
    metadataDescription:
      'Autorell voor iPhone en Android wordt afgerond en is naar verwachting binnen enkele weken klaar.',
  },
  fi: {
    footerLabel: 'Lataa',
    pageEyebrow: 'Autorell-sovellus',
    pageTitle: 'Autorell-sovellukset ovat tulossa pian.',
    pageDescription:
      'Viimeistelemme parhaillaan Autorellia iPhonelle ja Androidille. Sovellusten odotetaan valmistuvan muutaman viikon kuluessa.',
    statusLabel: 'Työ on käynnissä',
    statusText: 'Siihen asti Autorell toimii normaalisti puhelimen selaimessa.',
    featureSearch: 'Nopea ajoneuvohaku',
    featureSaved: 'Tallennetut ilmoitukset',
    featureMessages: 'Viestit ja ilmoitukset',
    appStoreAlt: 'Lataa App Storesta',
    googlePlayAlt: 'Lataa Google Playsta',
    marketplaceCta: 'Etsi ajoneuvoja',
    homeCta: 'Etusivulle',
    metadataTitle: 'Autorell-sovellus tulossa pian | Autorell',
    metadataDescription:
      'Autorell iPhonelle ja Androidille viimeistellään, ja sen odotetaan valmistuvan muutaman viikon kuluessa.',
  },
  da: {
    footerLabel: 'Hent',
    pageEyebrow: 'Autorell app',
    pageTitle: 'Autorell-apps kommer snart.',
    pageDescription:
      'Vi lægger sidste hånd på Autorell til iPhone og Android. Appsene forventes at være klar inden for få uger.',
    statusLabel: 'Arbejdet er i gang',
    statusText: 'Indtil da fungerer hele Autorell som normalt i mobilens browser.',
    featureSearch: 'Hurtig køretøjssøgning',
    featureSaved: 'Gemte annoncer',
    featureMessages: 'Beskeder og notifikationer',
    appStoreAlt: 'Hent i App Store',
    googlePlayAlt: 'Hent på Google Play',
    marketplaceCta: 'Søg køretøjer',
    homeCta: 'Til forsiden',
    metadataTitle: 'Autorell app kommer snart | Autorell',
    metadataDescription:
      'Autorell til iPhone og Android færdiggøres og forventes klar inden for få uger.',
  },
}

export function getAppDownloadCopy(locale: PublicLocale) {
  return appDownloadCopy[locale] || appDownloadCopy.en
}

export function getAppDownloadHref(locale: PublicLocale) {
  return localizePublicHref(locale, '/app')
}
