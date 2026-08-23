import Image from 'next/image'
import type { Metadata } from 'next'
import { Heart, MessageSquare, Search, Share2 } from 'lucide-react'
import AppInstallAction from './AppInstallAction'
import PublicFooter from './PublicFooter'
import PublicHeader from './PublicHeader'
import type { PublicLocale } from '@/lib/public-i18n'
import { createPublicMetadata } from '@/lib/public-seo'

type AppDownloadCopy = {
  metaTitle: string
  metaDescription: string
  eyebrow: string
  title: string
  intro: string
  install: string
  installed: string
  featureTitle: string
  features: readonly [string, string, string]
  secondEyebrow: string
  secondTitle: string
  secondText: string
  browserNote: string
  iosTitle: string
  iosText: string
}

const copyByLocale: Record<PublicLocale, AppDownloadCopy> = {
  sv: {
    metaTitle: 'Installera Autorell på din enhet | Autorell',
    metaDescription: 'Installera Autorell på mobil eller dator och nå fordonssökningar, sparade annonser och meddelanden snabbare i hela Europa.',
    eyebrow: 'Autorell på din enhet',
    title: 'Hela fordonsmarknaden, direkt från hemskärmen.',
    intro: 'Installera Autorell som en webbapp och öppna sökningar, sparade fordon och meddelanden utan att först leta upp webbplatsen.',
    install: 'Installera Autorell',
    installed: 'Autorell är installerat',
    featureTitle: 'Allt viktigt finns nära till hands',
    features: ['Sök bland fordon snabbare', 'Följ sparade annonser', 'Återvänd direkt till meddelanden'],
    secondEyebrow: 'Enklare varje dag',
    secondTitle: 'Din fordonsmarknad är bara ett tryck bort.',
    secondText: 'Autorell fungerar som vanligt i webbläsaren men får en egen plats på enheten för snabbare åtkomst när du köper eller säljer fordon.',
    browserNote: 'Direktinstallation är tillgänglig i webbläsare som stöder webbappar.',
    iosTitle: 'Använder du Safari på iPhone eller iPad?',
    iosText: 'Öppna Dela-menyn och välj Lägg till på hemskärmen.',
  },
  en: {
    metaTitle: 'Install Autorell on your device | Autorell',
    metaDescription: 'Install Autorell on your phone or computer for faster access to vehicle searches, saved listings and messages across Europe.',
    eyebrow: 'Autorell on your device',
    title: 'The vehicle marketplace, directly from your home screen.',
    intro: 'Install Autorell as a web app and open searches, saved vehicles and messages without finding the website first.',
    install: 'Install Autorell',
    installed: 'Autorell is installed',
    featureTitle: 'Keep the essentials close',
    features: ['Search vehicles faster', 'Follow saved listings', 'Return directly to messages'],
    secondEyebrow: 'Easier every day',
    secondTitle: 'Your vehicle marketplace is one tap away.',
    secondText: 'Autorell still works in your browser, but installation gives it a dedicated place on your device for faster access when buying or selling vehicles.',
    browserNote: 'Direct installation is available in browsers that support web apps.',
    iosTitle: 'Using Safari on iPhone or iPad?',
    iosText: 'Open the Share menu and choose Add to Home Screen.',
  },
  de: {
    metaTitle: 'Autorell auf Ihrem Gerät installieren | Autorell',
    metaDescription: 'Installieren Sie Autorell auf Smartphone oder Computer und greifen Sie schneller auf Fahrzeugsuche, Favoriten und Nachrichten zu.',
    eyebrow: 'Autorell auf Ihrem Gerät',
    title: 'Der Fahrzeugmarkt direkt auf Ihrem Startbildschirm.',
    intro: 'Installieren Sie Autorell als Web-App und öffnen Sie Suchen, gespeicherte Fahrzeuge und Nachrichten ohne Umweg über den Browser.',
    install: 'Autorell installieren',
    installed: 'Autorell ist installiert',
    featureTitle: 'Alles Wichtige sofort erreichbar',
    features: ['Fahrzeuge schneller suchen', 'Gespeicherte Anzeigen verfolgen', 'Direkt zu Nachrichten zurückkehren'],
    secondEyebrow: 'Jeden Tag einfacher',
    secondTitle: 'Ihr Fahrzeugmarkt ist nur einen Tipp entfernt.',
    secondText: 'Autorell funktioniert weiterhin im Browser, erhält durch die Installation aber einen festen Platz auf Ihrem Gerät.',
    browserNote: 'Die direkte Installation ist in Browsern mit Web-App-Unterstützung verfügbar.',
    iosTitle: 'Nutzen Sie Safari auf iPhone oder iPad?',
    iosText: 'Öffnen Sie das Teilen-Menü und wählen Sie Zum Home-Bildschirm.',
  },
  at: {
    metaTitle: 'Autorell auf Ihrem Gerät installieren | Autorell',
    metaDescription: 'Installieren Sie Autorell auf Handy oder Computer und greifen Sie schneller auf Fahrzeugsuche, Favoriten und Nachrichten zu.',
    eyebrow: 'Autorell auf Ihrem Gerät',
    title: 'Der Fahrzeugmarkt direkt auf Ihrem Home-Bildschirm.',
    intro: 'Installieren Sie Autorell als Web-App und öffnen Sie Suchen, gespeicherte Fahrzeuge und Nachrichten ohne Umweg über den Browser.',
    install: 'Autorell installieren',
    installed: 'Autorell ist installiert',
    featureTitle: 'Alles Wichtige sofort erreichbar',
    features: ['Fahrzeuge schneller suchen', 'Gespeicherte Anzeigen verfolgen', 'Direkt zu Nachrichten zurückkehren'],
    secondEyebrow: 'Jeden Tag einfacher',
    secondTitle: 'Ihr Fahrzeugmarkt ist nur einen Tipp entfernt.',
    secondText: 'Autorell funktioniert weiterhin im Browser, erhält durch die Installation aber einen festen Platz auf Ihrem Gerät.',
    browserNote: 'Die direkte Installation ist in Browsern mit Web-App-Unterstützung verfügbar.',
    iosTitle: 'Nutzen Sie Safari auf iPhone oder iPad?',
    iosText: 'Öffnen Sie das Teilen-Menü und wählen Sie Zum Home-Bildschirm.',
  },
  be: {
    metaTitle: 'Autorell installeren op je toestel | Autorell',
    metaDescription: 'Installeer Autorell op mobiel of computer en bereik voertuigzoekopdrachten, bewaarde advertenties en berichten sneller.',
    eyebrow: 'Autorell op je toestel',
    title: 'De voertuigmarktplaats rechtstreeks op je startscherm.',
    intro: 'Installeer Autorell als webapp en open zoekopdrachten, bewaarde voertuigen en berichten zonder eerst de website te zoeken.',
    install: 'Autorell installeren',
    installed: 'Autorell is geïnstalleerd',
    featureTitle: 'Alles wat telt binnen handbereik',
    features: ['Zoek sneller naar voertuigen', 'Volg bewaarde advertenties', 'Ga direct terug naar berichten'],
    secondEyebrow: 'Elke dag eenvoudiger',
    secondTitle: 'Je voertuigmarktplaats is één tik verwijderd.',
    secondText: 'Autorell blijft werken in de browser, maar krijgt na installatie een vaste plek op je toestel voor snellere toegang.',
    browserNote: 'Directe installatie is beschikbaar in browsers die webapps ondersteunen.',
    iosTitle: 'Gebruik je Safari op iPhone of iPad?',
    iosText: 'Open het deelmenu en kies Zet op beginscherm.',
  },
  nl: {
    metaTitle: 'Autorell installeren op je apparaat | Autorell',
    metaDescription: 'Installeer Autorell op mobiel of computer en bereik voertuigzoekopdrachten, bewaarde advertenties en berichten sneller.',
    eyebrow: 'Autorell op je apparaat',
    title: 'De voertuigmarktplaats rechtstreeks op je startscherm.',
    intro: 'Installeer Autorell als webapp en open zoekopdrachten, bewaarde voertuigen en berichten zonder eerst de website te zoeken.',
    install: 'Autorell installeren',
    installed: 'Autorell is geïnstalleerd',
    featureTitle: 'Alles wat telt binnen handbereik',
    features: ['Zoek sneller naar voertuigen', 'Volg bewaarde advertenties', 'Ga direct terug naar berichten'],
    secondEyebrow: 'Elke dag eenvoudiger',
    secondTitle: 'Je voertuigmarktplaats is één tik verwijderd.',
    secondText: 'Autorell blijft werken in de browser, maar krijgt na installatie een vaste plek op je apparaat voor snellere toegang.',
    browserNote: 'Directe installatie is beschikbaar in browsers die webapps ondersteunen.',
    iosTitle: 'Gebruik je Safari op iPhone of iPad?',
    iosText: 'Open het deelmenu en kies Zet op beginscherm.',
  },
  fr: {
    metaTitle: 'Installer Autorell sur votre appareil | Autorell',
    metaDescription: 'Installez Autorell sur mobile ou ordinateur pour retrouver plus vite recherches, annonces sauvegardées et messages.',
    eyebrow: 'Autorell sur votre appareil',
    title: 'Le marché automobile directement sur votre écran d’accueil.',
    intro: 'Installez Autorell comme application web et ouvrez recherches, véhicules sauvegardés et messages sans rechercher le site.',
    install: 'Installer Autorell',
    installed: 'Autorell est installé',
    featureTitle: 'Gardez l’essentiel à portée de main',
    features: ['Recherchez plus vite', 'Suivez vos annonces sauvegardées', 'Revenez directement aux messages'],
    secondEyebrow: 'Plus simple au quotidien',
    secondTitle: 'Votre marché automobile est à portée de main.',
    secondText: 'Autorell reste accessible dans le navigateur, mais l’installation lui réserve une place sur votre appareil pour un accès plus rapide.',
    browserNote: 'L’installation directe est disponible dans les navigateurs compatibles avec les applications web.',
    iosTitle: 'Vous utilisez Safari sur iPhone ou iPad ?',
    iosText: 'Ouvrez le menu Partager puis choisissez Sur l’écran d’accueil.',
  },
  es: {
    metaTitle: 'Instala Autorell en tu dispositivo | Autorell',
    metaDescription: 'Instala Autorell en móvil u ordenador y accede más rápido a búsquedas, anuncios guardados y mensajes de vehículos.',
    eyebrow: 'Autorell en tu dispositivo',
    title: 'El marketplace de vehículos directamente en tu pantalla.',
    intro: 'Instala Autorell como aplicación web y abre búsquedas, vehículos guardados y mensajes sin buscar primero el sitio web.',
    install: 'Instalar Autorell',
    installed: 'Autorell está instalado',
    featureTitle: 'Todo lo importante a mano',
    features: ['Busca vehículos más rápido', 'Sigue anuncios guardados', 'Vuelve directamente a tus mensajes'],
    secondEyebrow: 'Más fácil cada día',
    secondTitle: 'Tu marketplace de vehículos está a un toque.',
    secondText: 'Autorell sigue funcionando en el navegador, pero al instalarlo obtiene un lugar propio en tu dispositivo para un acceso más rápido.',
    browserNote: 'La instalación directa está disponible en navegadores compatibles con aplicaciones web.',
    iosTitle: '¿Usas Safari en iPhone o iPad?',
    iosText: 'Abre el menú Compartir y elige Añadir a pantalla de inicio.',
  },
  it: {
    metaTitle: 'Installa Autorell sul tuo dispositivo | Autorell',
    metaDescription: 'Installa Autorell su telefono o computer e accedi più rapidamente a ricerche, annunci salvati e messaggi sui veicoli.',
    eyebrow: 'Autorell sul tuo dispositivo',
    title: 'Il marketplace dei veicoli direttamente sulla schermata Home.',
    intro: 'Installa Autorell come web app e apri ricerche, veicoli salvati e messaggi senza dover prima cercare il sito.',
    install: 'Installa Autorell',
    installed: 'Autorell è installato',
    featureTitle: 'Tutto ciò che conta a portata di mano',
    features: ['Cerca veicoli più velocemente', 'Segui gli annunci salvati', 'Torna direttamente ai messaggi'],
    secondEyebrow: 'Più semplice ogni giorno',
    secondTitle: 'Il tuo marketplace è a un solo tocco.',
    secondText: 'Autorell continua a funzionare nel browser, ma con l’installazione ottiene uno spazio dedicato sul tuo dispositivo.',
    browserNote: 'L’installazione diretta è disponibile nei browser che supportano le web app.',
    iosTitle: 'Usi Safari su iPhone o iPad?',
    iosText: 'Apri il menu Condividi e scegli Aggiungi alla schermata Home.',
  },
  pl: {
    metaTitle: 'Zainstaluj Autorell na urządzeniu | Autorell',
    metaDescription: 'Zainstaluj Autorell na telefonie lub komputerze i szybciej otwieraj wyszukiwania, zapisane ogłoszenia oraz wiadomości.',
    eyebrow: 'Autorell na Twoim urządzeniu',
    title: 'Giełda pojazdów bezpośrednio na ekranie głównym.',
    intro: 'Zainstaluj Autorell jako aplikację internetową i otwieraj wyszukiwania, zapisane pojazdy oraz wiadomości bez szukania strony.',
    install: 'Zainstaluj Autorell',
    installed: 'Autorell jest zainstalowany',
    featureTitle: 'Najważniejsze funkcje zawsze pod ręką',
    features: ['Szukaj pojazdów szybciej', 'Śledź zapisane ogłoszenia', 'Wracaj bezpośrednio do wiadomości'],
    secondEyebrow: 'Łatwiej każdego dnia',
    secondTitle: 'Twoja giełda pojazdów jest o jedno dotknięcie dalej.',
    secondText: 'Autorell nadal działa w przeglądarce, ale po instalacji zyskuje stałe miejsce na urządzeniu i szybszy dostęp.',
    browserNote: 'Bezpośrednia instalacja jest dostępna w przeglądarkach obsługujących aplikacje internetowe.',
    iosTitle: 'Używasz Safari na iPhonie lub iPadzie?',
    iosText: 'Otwórz menu Udostępnij i wybierz Do ekranu początkowego.',
  },
  fi: {
    metaTitle: 'Asenna Autorell laitteellesi | Autorell',
    metaDescription: 'Asenna Autorell puhelimeen tai tietokoneelle ja avaa ajoneuvohaut, tallennetut ilmoitukset ja viestit nopeammin.',
    eyebrow: 'Autorell laitteellasi',
    title: 'Ajoneuvomarkkinapaikka suoraan aloitusnäytöllä.',
    intro: 'Asenna Autorell verkkosovelluksena ja avaa haut, tallennetut ajoneuvot ja viestit ilman verkkosivun etsimistä.',
    install: 'Asenna Autorell',
    installed: 'Autorell on asennettu',
    featureTitle: 'Tärkeimmät asiat aina lähellä',
    features: ['Hae ajoneuvoja nopeammin', 'Seuraa tallennettuja ilmoituksia', 'Palaa suoraan viesteihin'],
    secondEyebrow: 'Helpompi joka päivä',
    secondTitle: 'Ajoneuvomarkkinasi on yhden napautuksen päässä.',
    secondText: 'Autorell toimii edelleen selaimessa, mutta asennettuna se saa oman paikan laitteeltasi ja avautuu nopeammin.',
    browserNote: 'Suora asennus on käytettävissä verkkosovelluksia tukevissa selaimissa.',
    iosTitle: 'Käytätkö Safaria iPhonella tai iPadilla?',
    iosText: 'Avaa Jaa-valikko ja valitse Lisää Koti-valikkoon.',
  },
  da: {
    metaTitle: 'Installer Autorell på din enhed | Autorell',
    metaDescription: 'Installer Autorell på mobil eller computer, og få hurtigere adgang til køretøjssøgninger, gemte annoncer og beskeder.',
    eyebrow: 'Autorell på din enhed',
    title: 'Køretøjsmarkedet direkte fra din hjemmeskærm.',
    intro: 'Installer Autorell som webapp, og åbn søgninger, gemte køretøjer og beskeder uden først at finde hjemmesiden.',
    install: 'Installer Autorell',
    installed: 'Autorell er installeret',
    featureTitle: 'Alt det vigtigste lige ved hånden',
    features: ['Søg hurtigere efter køretøjer', 'Følg gemte annoncer', 'Gå direkte tilbage til beskeder'],
    secondEyebrow: 'Nemmere hver dag',
    secondTitle: 'Dit køretøjsmarked er kun ét tryk væk.',
    secondText: 'Autorell fungerer stadig i browseren, men installationen giver tjenesten en fast plads på din enhed og hurtigere adgang.',
    browserNote: 'Direkte installation er tilgængelig i browsere, der understøtter webapps.',
    iosTitle: 'Bruger du Safari på iPhone eller iPad?',
    iosText: 'Åbn Del-menuen, og vælg Føj til hjemmeskærm.',
  },
}

const featureIcons = [Search, Heart, MessageSquare] as const

export function generateAppDownloadMetadata(locale: PublicLocale): Metadata {
  const copy = copyByLocale[locale] || copyByLocale.en
  return createPublicMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: '/app',
    locale,
  })
}

export default function AppDownloadPage({
  locale,
  marketCode,
}: {
  locale: PublicLocale
  marketCode?: string
}) {
  const copy = copyByLocale[locale] || copyByLocale.en

  return (
    <main className="overflow-x-hidden bg-white text-[#101828]">
      <PublicHeader locale={locale} marketCode={marketCode} />

      <section className="border-b border-[#dbe7f5] bg-[#eef6ff]">
        <div className="mx-auto grid min-h-[640px] max-w-[var(--autorell-page-max)] items-center gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-4 lg:py-16">
          <div className="relative z-10 max-w-[560px]">
            <p className="text-[13px] font-semibold uppercase text-[#0866ff]">{copy.eyebrow}</p>
            <h1 className="mt-4 text-[38px] font-semibold leading-[1.08] sm:text-[54px]">{copy.title}</h1>
            <p className="mt-5 max-w-[530px] text-[17px] leading-8 text-[#475467]">{copy.intro}</p>
            <div className="mt-7">
              <AppInstallAction label={copy.install} installedLabel={copy.installed} />
            </div>
          </div>

          <div className="relative min-h-[300px] lg:min-h-[500px]">
            <Image
              src="/autorell-app-phone.png"
              alt={copy.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-contain object-center lg:object-right"
            />
          </div>
        </div>
      </section>

      <section className="border-b border-[#e5ebf3] bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-[var(--autorell-page-max)] px-5 sm:px-8">
          <h2 className="max-w-[640px] text-[30px] font-semibold sm:text-[40px]">{copy.featureTitle}</h2>
          <div className="mt-9 grid gap-8 md:grid-cols-3 md:gap-12">
            {copy.features.map((feature, index) => {
              const Icon = featureIcons[index]
              return (
                <div key={feature} className="border-t border-[#d9e5f3] pt-6">
                  <span className="grid h-11 w-11 place-items-center rounded-[8px] bg-[#eaf3ff] text-[#0866ff]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-[18px] font-semibold">{feature}</h3>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-20">
        <div className="mx-auto grid max-w-[var(--autorell-page-max)] gap-10 px-5 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-16">
          <div className="relative aspect-[16/9] overflow-hidden rounded-[8px] bg-[#eef2f7]">
            <Image
              src="/autorell-app-everyday.webp"
              alt={copy.secondTitle}
              fill
              sizes="(max-width: 1024px) 100vw, 54vw"
              className="object-cover"
            />
          </div>

          <div>
            <p className="text-[13px] font-semibold uppercase text-[#0866ff]">{copy.secondEyebrow}</p>
            <h2 className="mt-4 text-[32px] font-semibold leading-[1.12] sm:text-[44px]">{copy.secondTitle}</h2>
            <p className="mt-5 text-[16px] leading-8 text-[#475467]">{copy.secondText}</p>
            <div className="mt-7">
              <AppInstallAction label={copy.install} installedLabel={copy.installed} />
            </div>
            <p className="mt-3 text-[12px] text-[#667085]">{copy.browserNote}</p>

            <div className="mt-8 flex gap-3 border-t border-[#dce6f2] pt-6">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[8px] bg-[#eaf3ff] text-[#0866ff]">
                <Share2 className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-sm font-semibold">{copy.iosTitle}</h3>
                <p className="mt-1 text-[13px] leading-6 text-[#667085]">{copy.iosText}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter locale={locale} />
    </main>
  )
}
