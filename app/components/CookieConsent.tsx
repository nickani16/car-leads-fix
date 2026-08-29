'use client'

import Link from 'next/link'
import { ChevronDown, MonitorSmartphone, UserRound, X } from 'lucide-react'
import { useEffect, useState, useSyncExternalStore } from 'react'
import { euBuyerMarkets } from '@/lib/eu-buyer-markets'
import {
  isPublicLanguage,
  localizePublicHref,
  translatePublicObject,
} from '@/lib/public-i18n'

const CONSENT_COOKIE = 'autorell_cookie_consent'
const CONSENT_MAX_AGE = 60 * 60 * 24 * 180

type ConsentChoice = 'necessary' | 'analytics' | 'advertising' | 'all'
type CookieLocale = 'sv' | 'de' | 'en' | 'fr' | 'es' | 'it' | 'pl' | 'nl' | 'fi' | 'da'

const cookieCopy = {
  sv: {
    close: 'Stäng cookieinställningar',
    title: 'Vi vill ge dig en bättre upplevelse',
    intro:
      'Med ditt samtycke använder Autorell cookies och liknande tekniker för att lagra, läsa och behandla information från din enhet. Det kan omfatta cookie-id, IP-adress, webbläsar- och enhetsinformation, ungefärlig plats, besökta sidor och hur du använder marknadsplatsen.',
    detailsTitle: 'Vi använder cookies för följande ändamål:',
    details:
      'Nödvändiga cookies krävs för säkerhet, inloggning, språk, marknad och grundläggande funktioner. Med ditt godkännande använder vi även Vercel Analytics och Speed Insights för statistik och prestandamätning samt Google AdSense för annonsering. Icke-nödvändiga tekniker aktiveras endast efter ditt val.',
    rights:
      'Du kan när som helst ändra eller återkalla ditt samtycke via cookieinställningarna. Läs mer i vår',
    policy: 'cookiepolicy',
    settings: 'Inställningar',
    acceptNecessary: 'Acceptera nödvändiga',
    acceptAll: 'Godkänn alla',
    hide: 'Dölj inställningar',
    necessaryTitle: 'Nödvändiga cookies',
    necessaryText:
      'Alltid aktiva. De behövs för säker drift, formulär, konto, språk och valda marknader.',
    optionalTitle: 'Statistik, prestanda och annonser',
    optionalText:
      'Aktiveras bara om du godkänner. Omfattar Vercel Analytics, Speed Insights och Google AdSense.',
    alwaysActive: 'Alltid aktiv',
    optionalInactive: 'Aktiveras med godkännande',
  },
  de: {
    close: 'Cookie-Einstellungen schließen',
    title: 'Wir möchten Ihr Erlebnis verbessern',
    intro:
      'Mit Ihrer Einwilligung verwendet Autorell Cookies und ähnliche Technologien, um Informationen auf Ihrem Gerät zu speichern, auszulesen und zu verarbeiten. Dazu können Cookie-IDs, IP-Adresse, Browser- und Geräteinformationen, ungefährer Standort, besuchte Seiten und Ihre Nutzung des Marktplatzes gehören.',
    detailsTitle: 'Wir verwenden Cookies für folgende Zwecke:',
    details:
      'Notwendige Cookies sind für Sicherheit, Anmeldung, Sprache, Markt und grundlegende Funktionen erforderlich. Mit Ihrer Zustimmung verwenden wir außerdem Vercel Analytics und Speed Insights für Statistik und Leistungsmessung sowie Google AdSense für Werbung. Nicht notwendige Technologien werden erst nach Ihrer Auswahl aktiviert.',
    rights:
      'Sie können Ihre Einwilligung jederzeit über die Cookie-Einstellungen ändern oder widerrufen. Mehr dazu in unserer',
    policy: 'Cookie-Richtlinie',
    settings: 'Einstellungen',
    acceptNecessary: 'Nur notwendige akzeptieren',
    acceptAll: 'Alle akzeptieren',
    hide: 'Einstellungen ausblenden',
    necessaryTitle: 'Notwendige Cookies',
    necessaryText:
      'Immer aktiv. Erforderlich für sicheren Betrieb, Formulare, Konto, Sprache und gewählte Märkte.',
    optionalTitle: 'Statistik, Leistung und Werbung',
    optionalText:
      'Nur aktiv, wenn Sie zustimmen. Umfasst Vercel Analytics, Speed Insights und Google AdSense.',
    alwaysActive: 'Immer aktiv',
    optionalInactive: 'Aktiviert mit Zustimmung',
  },
  en: {
    close: 'Close cookie settings',
    title: 'We want to give you a better experience',
    intro:
      'With your consent, Autorell uses cookies and similar technologies to store, access and process information from your device. This may include cookie IDs, IP address, browser and device information, approximate location, visited pages and how you use the marketplace.',
    detailsTitle: 'We use cookies for the following purposes:',
    details:
      'Necessary cookies are required for security, sign-in, language, market and core functionality. With your approval, we also use Vercel Analytics and Speed Insights for statistics and performance measurement and Google AdSense for advertising. Non-essential technologies are only activated after your choice.',
    rights:
      'You can change or withdraw your consent at any time through the cookie settings. Read more in our',
    policy: 'cookie policy',
    settings: 'Settings',
    acceptNecessary: 'Accept necessary',
    acceptAll: 'Accept all',
    hide: 'Hide settings',
    necessaryTitle: 'Necessary cookies',
    necessaryText:
      'Always active. Needed for secure operation, forms, account, language and selected markets.',
    optionalTitle: 'Statistics, performance and ads',
    optionalText:
      'Only active if you approve. Includes Vercel Analytics, Speed Insights and Google AdSense.',
    alwaysActive: 'Always active',
    optionalInactive: 'Activated with approval',
  },
  pl: {
    close: 'Zamknij ustawienia plików cookie',
    title: 'Chcemy zapewnić lepsze doświadczenie',
    intro:
      'Za Twoją zgodą Autorell używa plików cookie i podobnych technologii do zapisywania, odczytywania i przetwarzania informacji z urządzenia. Może to obejmować identyfikatory cookie, adres IP, informacje o przeglądarce i urządzeniu, przybliżoną lokalizację, odwiedzone strony oraz sposób korzystania z platformy.',
    detailsTitle: 'Używamy plików cookie w następujących celach:',
    details:
      'Niezbędne pliki cookie są wymagane dla bezpieczeństwa, logowania, języka, rynku i podstawowych funkcji. Za Twoją zgodą używamy także Vercel Analytics i Speed Insights do statystyk i pomiaru wydajności oraz Google AdSense do reklam. Technologie opcjonalne są aktywowane dopiero po Twoim wyborze.',
    rights:
      'W każdej chwili możesz zmienić lub wycofać zgodę w ustawieniach plików cookie. Więcej w naszej',
    policy: 'polityce plików cookie',
    settings: 'Ustawienia',
    acceptNecessary: 'Akceptuj niezbędne',
    acceptAll: 'Akceptuj wszystkie',
    hide: 'Ukryj ustawienia',
    necessaryTitle: 'Niezbędne pliki cookie',
    necessaryText:
      'Zawsze aktywne. Potrzebne do bezpiecznego działania, formularzy, konta, języka i wybranych rynków.',
    optionalTitle: 'Statystyka, wydajność i reklamy',
    optionalText:
      'Aktywne tylko po Twojej zgodzie. Obejmuje Vercel Analytics, Speed Insights i Google AdSense.',
    alwaysActive: 'Zawsze aktywne',
    optionalInactive: 'Aktywowane za zgodą',
  },
  fr: {
    close: 'Fermer les paramètres des cookies',
    title: 'Nous souhaitons améliorer votre expérience',
    intro:
      'Avec votre consentement, Autorell utilise des cookies et des technologies similaires pour stocker, consulter et traiter des informations provenant de votre appareil. Cela peut inclure des identifiants de cookies, l’adresse IP, des informations sur le navigateur et l’appareil, une localisation approximative, les pages consultées et votre utilisation de la place de marché.',
    detailsTitle: 'Nous utilisons des cookies aux fins suivantes :',
    details:
      'Les cookies nécessaires sont indispensables à la sécurité, à la connexion, à la langue, au marché et aux fonctions essentielles. Avec votre accord, nous utilisons également Vercel Analytics et Speed Insights pour les statistiques et les performances, ainsi que Google AdSense pour la publicité. Les technologies facultatives ne sont activées qu’après votre choix.',
    rights:
      'Vous pouvez modifier ou retirer votre consentement à tout moment dans les paramètres des cookies. En savoir plus dans notre',
    policy: 'politique relative aux cookies',
    settings: 'Paramètres',
    acceptNecessary: 'Accepter les cookies nécessaires',
    acceptAll: 'Tout accepter',
    hide: 'Masquer les paramètres',
    necessaryTitle: 'Cookies nécessaires',
    necessaryText:
      'Toujours actifs. Ils sont nécessaires à la sécurité, aux formulaires, au compte, à la langue et aux marchés choisis.',
    optionalTitle: 'Statistiques, performances et publicités',
    optionalText:
      'Actifs uniquement avec votre accord. Comprend Vercel Analytics, Speed Insights et Google AdSense.',
    alwaysActive: 'Toujours actif',
    optionalInactive: 'Activé avec votre accord',
  },
  es: {
    close: 'Cerrar la configuración de cookies',
    title: 'Queremos ofrecerte una mejor experiencia',
    intro:
      'Con tu consentimiento, Autorell utiliza cookies y tecnologías similares para almacenar, consultar y tratar información de tu dispositivo. Esto puede incluir identificadores de cookies, dirección IP, información del navegador y del dispositivo, ubicación aproximada, páginas visitadas y el uso del mercado.',
    detailsTitle: 'Utilizamos cookies para los siguientes fines:',
    details:
      'Las cookies necesarias son imprescindibles para la seguridad, el inicio de sesión, el idioma, el mercado y las funciones básicas. Con tu autorización, también utilizamos Vercel Analytics y Speed Insights para estadísticas y rendimiento, y Google AdSense para publicidad. Las tecnologías opcionales solo se activan después de tu elección.',
    rights:
      'Puedes cambiar o retirar tu consentimiento en cualquier momento desde la configuración de cookies. Más información en nuestra',
    policy: 'política de cookies',
    settings: 'Configuración',
    acceptNecessary: 'Aceptar las necesarias',
    acceptAll: 'Aceptar todas',
    hide: 'Ocultar configuración',
    necessaryTitle: 'Cookies necesarias',
    necessaryText:
      'Siempre activas. Son necesarias para la seguridad, los formularios, la cuenta, el idioma y los mercados seleccionados.',
    optionalTitle: 'Estadísticas, rendimiento y anuncios',
    optionalText:
      'Solo se activan con tu autorización. Incluye Vercel Analytics, Speed Insights y Google AdSense.',
    alwaysActive: 'Siempre activa',
    optionalInactive: 'Se activa con autorización',
  },
  it: {
    close: 'Chiudi le impostazioni dei cookie',
    title: 'Vogliamo offrirti un’esperienza migliore',
    intro:
      'Con il tuo consenso, Autorell utilizza cookie e tecnologie simili per memorizzare, leggere e trattare informazioni dal tuo dispositivo. Queste possono includere identificatori dei cookie, indirizzo IP, informazioni sul browser e sul dispositivo, posizione approssimativa, pagine visitate e modalità di utilizzo del marketplace.',
    detailsTitle: 'Utilizziamo i cookie per le seguenti finalità:',
    details:
      'I cookie necessari servono per sicurezza, accesso, lingua, mercato e funzioni essenziali. Con la tua autorizzazione utilizziamo anche Vercel Analytics e Speed Insights per statistiche e prestazioni e Google AdSense per la pubblicità. Le tecnologie facoltative vengono attivate solo dopo la tua scelta.',
    rights:
      'Puoi modificare o revocare il consenso in qualsiasi momento nelle impostazioni dei cookie. Maggiori informazioni nella nostra',
    policy: 'politica sui cookie',
    settings: 'Impostazioni',
    acceptNecessary: 'Accetta i necessari',
    acceptAll: 'Accetta tutti',
    hide: 'Nascondi impostazioni',
    necessaryTitle: 'Cookie necessari',
    necessaryText:
      'Sempre attivi. Sono necessari per sicurezza, moduli, account, lingua e mercati selezionati.',
    optionalTitle: 'Statistiche, prestazioni e annunci',
    optionalText:
      'Attivi solo con la tua autorizzazione. Include Vercel Analytics, Speed Insights e Google AdSense.',
    alwaysActive: 'Sempre attivo',
    optionalInactive: 'Attivato con autorizzazione',
  },
  nl: {
    close: 'Cookie-instellingen sluiten',
    title: 'We willen je een betere ervaring bieden',
    intro:
      'Met jouw toestemming gebruikt Autorell cookies en vergelijkbare technologieën om informatie van je apparaat op te slaan, uit te lezen en te verwerken. Dit kan cookie-ID’s, IP-adres, browser- en apparaatgegevens, globale locatie, bezochte pagina’s en je gebruik van de marktplaats omvatten.',
    detailsTitle: 'We gebruiken cookies voor de volgende doeleinden:',
    details:
      'Noodzakelijke cookies zijn vereist voor beveiliging, aanmelden, taal, markt en basisfuncties. Met jouw toestemming gebruiken we ook Vercel Analytics en Speed Insights voor statistieken en prestaties en Google AdSense voor advertenties. Optionele technologieën worden pas na jouw keuze geactiveerd.',
    rights:
      'Je kunt je toestemming op elk moment wijzigen of intrekken via de cookie-instellingen. Lees meer in ons',
    policy: 'cookiebeleid',
    settings: 'Instellingen',
    acceptNecessary: 'Noodzakelijke accepteren',
    acceptAll: 'Alles accepteren',
    hide: 'Instellingen verbergen',
    necessaryTitle: 'Noodzakelijke cookies',
    necessaryText:
      'Altijd actief. Nodig voor beveiliging, formulieren, account, taal en geselecteerde markten.',
    optionalTitle: 'Statistieken, prestaties en advertenties',
    optionalText:
      'Alleen actief met jouw toestemming. Omvat Vercel Analytics, Speed Insights en Google AdSense.',
    alwaysActive: 'Altijd actief',
    optionalInactive: 'Geactiveerd met toestemming',
  },
  fi: {
    close: 'Sulje evästeasetukset',
    title: 'Haluamme tarjota paremman käyttökokemuksen',
    intro:
      'Suostumuksellasi Autorell käyttää evästeitä ja vastaavia tekniikoita tallentaakseen, lukeakseen ja käsitelläkseen laitteeltasi saatavia tietoja. Näitä voivat olla evästetunnisteet, IP-osoite, selain- ja laitetiedot, likimääräinen sijainti, vieraillut sivut ja markkinapaikan käyttö.',
    detailsTitle: 'Käytämme evästeitä seuraaviin tarkoituksiin:',
    details:
      'Välttämättömiä evästeitä tarvitaan turvallisuuteen, kirjautumiseen, kieleen, markkinaan ja perustoimintoihin. Suostumuksellasi käytämme myös Vercel Analyticsia ja Speed Insightsia tilastoihin ja suorituskyvyn mittaamiseen sekä Google AdSensea mainontaan. Valinnaiset tekniikat aktivoidaan vasta valintasi jälkeen.',
    rights:
      'Voit muuttaa suostumustasi tai peruuttaa sen milloin tahansa evästeasetuksissa. Lue lisää',
    policy: 'evästekäytännöstämme',
    settings: 'Asetukset',
    acceptNecessary: 'Hyväksy välttämättömät',
    acceptAll: 'Hyväksy kaikki',
    hide: 'Piilota asetukset',
    necessaryTitle: 'Välttämättömät evästeet',
    necessaryText:
      'Aina käytössä. Tarvitaan turvallisuuteen, lomakkeisiin, tiliin, kieleen ja valittuihin markkinoihin.',
    optionalTitle: 'Tilastot, suorituskyky ja mainokset',
    optionalText:
      'Käytössä vain suostumuksellasi. Sisältää Vercel Analyticsin, Speed Insightsin ja Google AdSensen.',
    alwaysActive: 'Aina käytössä',
    optionalInactive: 'Aktivoidaan suostumuksella',
  },
  da: {
    close: 'Luk cookieindstillinger',
    title: 'Vi vil give dig en bedre oplevelse',
    intro:
      'Med dit samtykke bruger Autorell cookies og lignende teknologier til at gemme, læse og behandle oplysninger fra din enhed. Det kan omfatte cookie-id, IP-adresse, browser- og enhedsoplysninger, omtrentlig placering, besøgte sider og din brug af markedspladsen.',
    detailsTitle: 'Vi bruger cookies til følgende formål:',
    details:
      'Nødvendige cookies kræves til sikkerhed, login, sprog, marked og grundlæggende funktioner. Med dit samtykke bruger vi også Vercel Analytics og Speed Insights til statistik og ydeevne samt Google AdSense til annoncering. Valgfrie teknologier aktiveres først efter dit valg.',
    rights:
      'Du kan til enhver tid ændre eller trække dit samtykke tilbage via cookieindstillingerne. Læs mere i vores',
    policy: 'cookiepolitik',
    settings: 'Indstillinger',
    acceptNecessary: 'Accepter nødvendige',
    acceptAll: 'Accepter alle',
    hide: 'Skjul indstillinger',
    necessaryTitle: 'Nødvendige cookies',
    necessaryText:
      'Altid aktive. Nødvendige for sikkerhed, formularer, konto, sprog og valgte markeder.',
    optionalTitle: 'Statistik, ydeevne og annoncer',
    optionalText:
      'Kun aktive med dit samtykke. Omfatter Vercel Analytics, Speed Insights og Google AdSense.',
    alwaysActive: 'Altid aktiv',
    optionalInactive: 'Aktiveres med samtykke',
  },
} as const

const purposeCopy: Record<CookieLocale, {
  analyticsTitle: string
  analyticsText: string
  advertisingTitle: string
  advertisingText: string
  save: string
}> = {
  sv: {
    analyticsTitle: 'Statistik och prestanda',
    analyticsText: 'Vercel Analytics och Speed Insights hjälper oss att förstå användning och laddningstider.',
    advertisingTitle: 'Annonsering',
    advertisingText: 'Google AdSense används för att visa och mäta annonser.',
    save: 'Spara mina val',
  },
  de: {
    analyticsTitle: 'Statistik und Leistung',
    analyticsText: 'Vercel Analytics und Speed Insights helfen uns, Nutzung und Ladezeiten zu verstehen.',
    advertisingTitle: 'Werbung',
    advertisingText: 'Google AdSense wird verwendet, um Werbung anzuzeigen und zu messen.',
    save: 'Auswahl speichern',
  },
  en: {
    analyticsTitle: 'Analytics and performance',
    analyticsText: 'Vercel Analytics and Speed Insights help us understand usage and loading performance.',
    advertisingTitle: 'Advertising',
    advertisingText: 'Google AdSense is used to display and measure ads.',
    save: 'Save my choices',
  },
  fr: {
    analyticsTitle: 'Statistiques et performances',
    analyticsText: 'Vercel Analytics et Speed Insights nous aident à comprendre l’utilisation et les temps de chargement.',
    advertisingTitle: 'Publicité',
    advertisingText: 'Google AdSense est utilisé pour afficher et mesurer les publicités.',
    save: 'Enregistrer mes choix',
  },
  es: {
    analyticsTitle: 'Estadísticas y rendimiento',
    analyticsText: 'Vercel Analytics y Speed Insights nos ayudan a comprender el uso y los tiempos de carga.',
    advertisingTitle: 'Publicidad',
    advertisingText: 'Google AdSense se utiliza para mostrar y medir anuncios.',
    save: 'Guardar mis elecciones',
  },
  it: {
    analyticsTitle: 'Statistiche e prestazioni',
    analyticsText: 'Vercel Analytics e Speed Insights ci aiutano a comprendere l’utilizzo e i tempi di caricamento.',
    advertisingTitle: 'Pubblicità',
    advertisingText: 'Google AdSense viene utilizzato per mostrare e misurare gli annunci.',
    save: 'Salva le mie scelte',
  },
  pl: {
    analyticsTitle: 'Statystyki i wydajność',
    analyticsText: 'Vercel Analytics i Speed Insights pomagają nam analizować korzystanie z serwisu i czas ładowania.',
    advertisingTitle: 'Reklamy',
    advertisingText: 'Google AdSense służy do wyświetlania i pomiaru reklam.',
    save: 'Zapisz moje wybory',
  },
  nl: {
    analyticsTitle: 'Statistieken en prestaties',
    analyticsText: 'Vercel Analytics en Speed Insights helpen ons gebruik en laadtijden te begrijpen.',
    advertisingTitle: 'Advertenties',
    advertisingText: 'Google AdSense wordt gebruikt om advertenties te tonen en te meten.',
    save: 'Mijn keuzes opslaan',
  },
  fi: {
    analyticsTitle: 'Tilastot ja suorituskyky',
    analyticsText: 'Vercel Analytics ja Speed Insights auttavat meitä ymmärtämään käyttöä ja latausaikoja.',
    advertisingTitle: 'Mainonta',
    advertisingText: 'Google AdSensea käytetään mainosten näyttämiseen ja mittaamiseen.',
    save: 'Tallenna valintani',
  },
  da: {
    analyticsTitle: 'Statistik og ydeevne',
    analyticsText: 'Vercel Analytics og Speed Insights hjælper os med at forstå brug og indlæsningstider.',
    advertisingTitle: 'Annoncering',
    advertisingText: 'Google AdSense bruges til at vise og måle annoncer.',
    save: 'Gem mine valg',
  },
}

const cookieUiCopy: Record<CookieLocale, {
  welcome: string
  consentTitle: string
  learnMore: string
  showLess: string
  manageChoices: string
}> = {
  sv: { welcome: 'Välkommen till Autorell.se', consentTitle: 'Autorell behöver ditt samtycke för att använda personuppgifter till:', learnMore: 'Läs mer', showLess: 'Visa mindre', manageChoices: 'Hantera alternativ' },
  de: { welcome: 'Willkommen bei Autorell', consentTitle: 'Autorell benötigt Ihre Einwilligung, um personenbezogene Daten zu verwenden für:', learnMore: 'Mehr erfahren', showLess: 'Weniger anzeigen', manageChoices: 'Optionen verwalten' },
  en: { welcome: 'Welcome to Autorell', consentTitle: 'Autorell needs your consent to use personal data for:', learnMore: 'Read more', showLess: 'Show less', manageChoices: 'Manage choices' },
  fr: { welcome: 'Bienvenue sur Autorell', consentTitle: 'Autorell a besoin de votre consentement pour utiliser vos données personnelles afin de :', learnMore: 'En savoir plus', showLess: 'Afficher moins', manageChoices: 'Gérer les choix' },
  es: { welcome: 'Te damos la bienvenida a Autorell', consentTitle: 'Autorell necesita tu consentimiento para usar datos personales con el fin de:', learnMore: 'Más información', showLess: 'Mostrar menos', manageChoices: 'Gestionar opciones' },
  it: { welcome: 'Benvenuto su Autorell', consentTitle: 'Autorell richiede il tuo consenso per utilizzare i dati personali per:', learnMore: 'Scopri di più', showLess: 'Mostra meno', manageChoices: 'Gestisci le opzioni' },
  pl: { welcome: 'Witamy w Autorell', consentTitle: 'Autorell potrzebuje Twojej zgody na wykorzystywanie danych osobowych do:', learnMore: 'Dowiedz się więcej', showLess: 'Pokaż mniej', manageChoices: 'Zarządzaj opcjami' },
  nl: { welcome: 'Welkom bij Autorell', consentTitle: 'Autorell heeft je toestemming nodig om persoonsgegevens te gebruiken voor:', learnMore: 'Lees meer', showLess: 'Toon minder', manageChoices: 'Keuzes beheren' },
  fi: { welcome: 'Tervetuloa Autorelliin', consentTitle: 'Autorell tarvitsee suostumuksesi henkilötietojen käyttöön seuraaviin tarkoituksiin:', learnMore: 'Lue lisää', showLess: 'Näytä vähemmän', manageChoices: 'Hallitse valintoja' },
  da: { welcome: 'Velkommen til Autorell', consentTitle: 'Autorell har brug for dit samtykke til at bruge personoplysninger til:', learnMore: 'Læs mere', showLess: 'Vis mindre', manageChoices: 'Administrer valg' },
}

function getCookieLocale(): CookieLocale {
  const marketCode = window.location.pathname.split('/').filter(Boolean)[0]
  if (marketCode === 'se') return 'sv'
  if (marketCode === 'de') return 'de'
  if (marketCode === 'at') return 'de'
  if (marketCode === 'be') return 'nl'
  if (isPublicLanguage(marketCode)) {
    return marketCode as CookieLocale
  }
  const market = euBuyerMarkets.find((item) => item.code === marketCode)
  if (market) {
    return market.language as CookieLocale
  }

  const hostname = window.location.hostname.toLowerCase()
  if (hostname.endsWith('autorell.de')) return 'de'
  if (hostname.endsWith('autorell.com')) return 'en'
  return 'sv'
}

function subscribeToHostname() {
  return () => {}
}

function readConsent() {
  return document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${CONSENT_COOKIE}=`))
    ?.split('=')[1] as ConsentChoice | undefined
}

function saveConsent(choice: ConsentChoice) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${CONSENT_COOKIE}=${choice}; Max-Age=${CONSENT_MAX_AGE}; Path=/; SameSite=Lax${secure}`
  window.dispatchEvent(
    new CustomEvent('autorell-cookie-consent-changed', {
      detail: { choice },
    })
  )
}

function allowsAnalytics(choice?: ConsentChoice) {
  return choice === 'analytics' || choice === 'all'
}

function allowsAdvertising(choice?: ConsentChoice) {
  return choice === 'advertising' || choice === 'all'
}

function choiceFromPurposes(analytics: boolean, advertising: boolean): ConsentChoice {
  if (analytics && advertising) return 'all'
  if (analytics) return 'analytics'
  if (advertising) return 'advertising'
  return 'necessary'
}

export default function CookieConsent({
  initialLocale = 'sv',
  initialMarketCode,
}: {
  initialLocale?: CookieLocale
  initialMarketCode?: string
}) {
  const [visible, setVisible] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [detailsExpanded, setDetailsExpanded] = useState(false)
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false)
  const [advertisingAllowed, setAdvertisingAllowed] = useState(false)
  const locale = useSyncExternalStore(
    subscribeToHostname,
    getCookieLocale,
    () => initialLocale,
  )
  const t =
    locale in cookieCopy
      ? cookieCopy[locale as keyof typeof cookieCopy]
      : translatePublicObject(locale, cookieCopy.en)
  const purposes = purposeCopy[locale]
  const ui = cookieUiCopy[locale]
  const marketCode = initialMarketCode || ''
  const policyHref = euBuyerMarkets.some((market) => market.code === marketCode)
    ? `/${marketCode}/cookies`
    : localizePublicHref(locale, '/cookies')

  useEffect(() => {
    const initialCheck = window.setTimeout(() => {
      setVisible(!readConsent())
    }, 0)

    const openSettings = () => {
      const current = readConsent()
      setAnalyticsAllowed(allowsAnalytics(current))
      setAdvertisingAllowed(allowsAdvertising(current))
      setSettingsOpen(true)
      setVisible(true)
    }

    window.addEventListener('autorell-open-cookie-settings', openSettings)
    return () => {
      window.clearTimeout(initialCheck)
      window.removeEventListener('autorell-open-cookie-settings', openSettings)
    }
  }, [])

  function choose(choice: ConsentChoice) {
    const previous = readConsent()
    saveConsent(choice)
    const revokedPurpose =
      (allowsAnalytics(previous) && !allowsAnalytics(choice)) ||
      (allowsAdvertising(previous) && !allowsAdvertising(choice))
    if (revokedPurpose) {
      window.location.reload()
      return
    }
    setVisible(false)
    setSettingsOpen(false)
    setDetailsExpanded(false)
  }

  function toggleSettings() {
    setSettingsOpen((open) => {
      if (!open) {
        const current = readConsent()
        setAnalyticsAllowed(allowsAnalytics(current))
        setAdvertisingAllowed(allowsAdvertising(current))
      }
      return !open
    })
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-[#111827]/60 p-3 sm:p-5">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-title"
        className="my-auto w-full max-w-[520px] overflow-hidden rounded-[6px] border border-[#d0d5dd] bg-white shadow-[0_16px_45px_rgba(16,24,40,.3)]"
      >
        <div className="relative min-w-0 max-h-[calc(100dvh-24px)] overflow-y-auto px-5 py-6 sm:max-h-[calc(100dvh-40px)] sm:px-11 sm:py-8">
          {readConsent() ? (
            <button
              type="button"
              onClick={() => {
                setVisible(false)
                setSettingsOpen(false)
                setDetailsExpanded(false)
              }}
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-[#667085] transition hover:bg-[#f2f4f7] hover:text-[#101828]"
              aria-label={t.close}
            >
              <X size={18} />
            </button>
          ) : null}

          <div className="min-w-0 text-center">
            <h2
              id="cookie-title"
              className="break-words text-[14px] font-medium leading-5 text-[#667085]"
            >
              {ui.welcome}
            </h2>
            <h3 className="mx-auto mt-2 max-w-[390px] break-words text-[18px] font-semibold leading-[1.35] text-[#101828]">
              {ui.consentTitle}
            </h3>
          </div>

          <div className="mt-6 grid gap-5">
            <div className="grid grid-cols-[32px_1fr] items-start gap-3.5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#e8f2ff] text-[#0866ff]">
                <UserRound className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <p className="pt-0.5 text-[13px] leading-[1.45] text-[#344054]">{t.optionalText}</p>
            </div>
            <div className="grid grid-cols-[32px_1fr] items-start gap-3.5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#e8f2ff] text-[#0866ff]">
                <MonitorSmartphone className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <p className="pt-0.5 text-[13px] leading-[1.45] text-[#344054]">{t.necessaryText}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setDetailsExpanded((expanded) => !expanded)}
            aria-expanded={detailsExpanded}
            className="mt-5 inline-flex items-center gap-2.5 text-[13px] font-medium text-[#344054] transition hover:text-[#0866ff]"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full border border-[#d0d5dd]">
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${detailsExpanded ? 'rotate-180' : ''}`} />
            </span>
            {detailsExpanded ? ui.showLess : ui.learnMore}
          </button>

          <p className="mt-4 break-words text-[12px] leading-[1.5] text-[#667085] [overflow-wrap:anywhere]">
            {t.intro}
          </p>

          {detailsExpanded ? (
            <p className="mt-3 break-words text-[12px] leading-[1.5] text-[#667085] [overflow-wrap:anywhere]">
              {t.details}
            </p>
          ) : null}

          <div className="mt-4 min-w-0">
            <p className="break-words text-[12px] leading-[1.5] text-[#667085] [overflow-wrap:anywhere]">
              {t.rights}{' '}
              <Link
                href={policyHref}
                className="font-medium text-[#344054] underline underline-offset-2"
              >
                {t.policy}
              </Link>
              .
            </p>
          </div>

          {settingsOpen ? (
            <div className="mt-4 grid gap-2.5 border-t border-[#e4e7ec] pt-4">
              <ConsentCategory
                title={t.necessaryTitle}
                description={t.necessaryText}
                status={t.alwaysActive}
                active
              />
              <ConsentPurposeToggle
                title={purposes.analyticsTitle}
                description={purposes.analyticsText}
                checked={analyticsAllowed}
                onChange={setAnalyticsAllowed}
              />
              <ConsentPurposeToggle
                title={purposes.advertisingTitle}
                description={purposes.advertisingText}
                checked={advertisingAllowed}
                onChange={setAdvertisingAllowed}
              />
              <button
                type="button"
                onClick={() => choose(choiceFromPurposes(analyticsAllowed, advertisingAllowed))}
                className="mt-1 inline-flex min-h-9 items-center justify-center rounded-full bg-[#0866ff] px-5 text-[12px] font-semibold text-white transition hover:bg-[#075be5]"
              >
                {purposes.save}
              </button>
            </div>
          ) : null}

          <div className="mt-5 grid min-w-0 grid-cols-2 gap-4 border-t border-[#d0d5dd] pt-5">
            <button
              type="button"
              onClick={toggleSettings}
              aria-expanded={settingsOpen}
              className="inline-flex min-h-10 min-w-0 items-center justify-center rounded-full bg-[#0866ff] px-4 text-center text-[13px] font-semibold text-white transition hover:bg-[#075be5]"
            >
              {settingsOpen ? t.hide : ui.manageChoices}
            </button>
            <button
              type="button"
              onClick={() => choose('all')}
              className="inline-flex min-h-10 min-w-0 items-center justify-center rounded-full bg-[#0866ff] px-4 text-center text-[13px] font-semibold text-white transition hover:bg-[#075be5]"
            >
              {t.acceptAll}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

function ConsentCategory({
  title,
  description,
  status,
  active,
}: {
  title: string
  description: string
  status: string
  active: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[14px] border border-[#d8e1ee] bg-[#f8fbff] px-4 py-3.5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[#101828]">{title}</p>
        <p className="mt-1 text-xs leading-5 text-[#667085]">{description}</p>
      </div>
      <span
        className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-medium ${
          active
            ? 'bg-[#e9f0fd] text-[#0866ff]'
            : 'bg-white text-[#667085] ring-1 ring-[#d8e1ee]'
        }`}
      >
        {status}
      </span>
    </div>
  )
}

function ConsentPurposeToggle({
  title,
  description,
  checked,
  onChange,
}: {
  title: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[14px] border border-[#d8e1ee] bg-[#f8fbff] px-4 py-3.5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[#101828]">{title}</p>
        <p className="mt-1 text-xs leading-5 text-[#667085]">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full border transition ${
          checked
            ? 'border-[#0866ff] bg-[#0866ff]'
            : 'border-[#a8b3c4] bg-white'
        }`}
      >
        <span
          className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full shadow-sm transition ${
            checked ? 'left-[25px] bg-white' : 'left-[3px] bg-[#667085]'
          }`}
        />
      </button>
    </div>
  )
}
