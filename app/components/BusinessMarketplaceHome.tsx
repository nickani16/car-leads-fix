import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Check, MapPin } from 'lucide-react'
import HomeHeroVehicleSearch from './HomeHeroVehicleSearch'
import HomeAnimatedViewsBadge from './HomeAnimatedViewsBadge'
import HomeMarketHeadingSlider from './HomeMarketHeadingSlider'
import HomeCategoryProvider from './HomeCategoryProvider'
import {
  HomeBrowseByTypeSwitcher,
  HomePopularBrandsSwitcher,
} from './HomeCategoryDiscovery'
import HomeVehicleLinkDirectory from './HomeVehicleLinkDirectory'
import HomeVehicleNewsScroller from './HomeVehicleNewsScroller'
import HomeLocationConsentPrompt from './HomeLocationConsentPrompt'
import HomeListingCategorySwitcher from './HomeListingCategorySwitcher'
import NewsletterSignup from './NewsletterSignup'
import PublicFooter from './PublicFooter'
import PublicHeader from './PublicHeader'
import ListingCardImageCarousel from './ListingCardImageCarousel'
import CountryFlag from './CountryFlag'
import SavedListingButton from './SavedListingButton'
import { displayCurrencyForMarket, formatMarketplacePriceDisplay } from '@/lib/currency-rates'
import { getEuCountryName } from '@/lib/eu-countries'
import { buildListingPath } from '@/lib/listing-url'
import {
  getMarketplaceSellerPublicProfiles,
  getPublishedMarketplaceListingCount,
  getPublishedMarketplaceHomeListings,
} from '@/lib/marketplace-public-data'
import { getVehicleNews, type PublicNewsArticle } from '@/lib/content/vehicle-news'
import {
  localizePublicHref,
  translatePublic,
  translatePublicObject,
  type PublicLocale,
} from '@/lib/public-i18n'
import { countryForLocale } from '@/lib/market-locale'
import { formatMileageAsMil, translateListingVehicleValue } from '@/lib/listing-display'
import type { MarketplaceCategorySlug } from '@/lib/marketplace'
import { getHomepageCategoryPresentations } from '@/lib/homepage-category-config'

const homeContentContainerClass =
  'mx-auto max-w-[390px] px-5 min-[430px]:max-w-[430px] sm:max-w-[var(--autorell-page-max)] sm:px-8'
const homeSearchContainerClass =
  'mx-0 w-full max-w-none px-0 sm:mx-auto sm:max-w-[var(--autorell-page-max)] sm:px-8'
const homeListingCategories: MarketplaceCategorySlug[] = [
  'cars',
  'vans',
  'trucks',
  'motorcycles',
  'construction',
  'motorhomes',
  'caravans',
  'agriculture',
  'electric-bikes',
]
const carHomepageCategories: MarketplaceCategorySlug[] = ['cars']

const homeCopy = {
  sv: {
    heroAlt: 'Person som söker fordon online på Autorell',
    heroHeading: 'Europas bästa fordonsmarknad',
    vehicleNewsTitle: 'Fordonsnyheter',
    allNews: 'Alla nyheter',
    newsScrollLabel: 'Bläddra bland fordonsnyheter',
    newsCategory: 'Fordonsmarknad',
    newsReadTime: '2 min läsning',
    selectedCategoriesTitle: 'Utvalda kategorier',
    selectedCategoriesScrollLabel: 'Bläddra bland utvalda fordonskategorier',
    popularCategoriesTitle: 'Populära kategorier',
    popularCategoriesScrollLabel: 'Bläddra bland populära bilkategorier',
    vehicleTypesTitle: 'Fordonstyper',
    vehicleTypesScrollLabel: 'Bläddra bland fordonstyper',
    vehicleTypesAll: 'Se alla fordonstyper',
    popularBrandsTitle: 'Populära bilmärken',
    carouselPreviousLabel: 'Föregående',
    carouselNextLabel: 'Nästa',
    sellerCtaTitle: 'Nå tusentals potentiella köpare med din fordonsannons.',
    sellerFlowCreated: 'Fordonsannons skapad',
    sellerFlowViews: 'fordonsvisningar',
    sellerFlowContact: 'Köpare tar kontakt',
    sellerFlowSold: 'Fordonsannons såld',
    privateTitle: 'Sälj som privatperson',
    privateText:
      'Skapa en gratis annons på några minuter. Betala bara när du vill annonsera längre eller få extra synlighet.',
    privateCta: 'Skapa gratis annons',
    businessTitle: 'Sälj som företag',
    businessText:
      'Publicera manuellt i Autorell eller importera lagret via CSV. Samla annonser, team och lagerkontroll i ett professionellt flöde.',
    businessCta: 'Kom igång som företag',
  },
  en: {
    heroAlt: 'Person searching for vehicles online on Autorell',
    heroHeading: "Europe's best vehicle market",
    vehicleNewsTitle: 'Vehicle news',
    allNews: 'All news',
    newsScrollLabel: 'Scroll vehicle news',
    newsCategory: 'Vehicle market',
    newsReadTime: '2 min read',
    selectedCategoriesTitle: 'Selected categories',
    selectedCategoriesScrollLabel: 'Scroll selected vehicle categories',
    popularCategoriesTitle: 'Popular categories',
    popularCategoriesScrollLabel: 'Scroll popular car categories',
    vehicleTypesTitle: 'Vehicle types',
    vehicleTypesScrollLabel: 'Scroll vehicle types',
    vehicleTypesAll: 'View all vehicle types',
    popularBrandsTitle: 'Popular car brands',
    carouselPreviousLabel: 'Previous',
    carouselNextLabel: 'Next',
    sellerCtaTitle: 'Reach thousands of potential buyers with your vehicle listing.',
    sellerFlowCreated: 'Vehicle listing created',
    sellerFlowViews: 'vehicle views',
    sellerFlowContact: 'Buyer makes contact',
    sellerFlowSold: 'Vehicle listing sold',
    privateTitle: 'Sell as a private seller',
    privateText:
      'Create a free listing in minutes. Pay only when you want a longer listing period or extra visibility.',
    privateCta: 'Create free listing',
    businessTitle: 'Sell as a business',
    businessText:
      'Publish manually in Autorell or import inventory via CSV. Keep listings, teams and stock control in one professional flow.',
    businessCta: 'Get started as a business',
  },
  de: {
    heroAlt: 'Person sucht online nach Fahrzeugen auf Autorell',
    heroHeading: 'Europas bester Fahrzeugmarkt',
    vehicleNewsTitle: 'Fahrzeugnews',
    allNews: 'Alle News',
    newsScrollLabel: 'Fahrzeugnews durchblättern',
    newsCategory: 'Fahrzeugmarkt',
    newsReadTime: '2 Min. Lesezeit',
    selectedCategoriesTitle: 'Ausgewählte Kategorien',
    selectedCategoriesScrollLabel: 'Ausgewählte Fahrzeugkategorien durchblättern',
    popularCategoriesTitle: 'Beliebte Kategorien',
    popularCategoriesScrollLabel: 'Beliebte Autokategorien durchblättern',
    vehicleTypesTitle: 'Fahrzeugtypen',
    vehicleTypesScrollLabel: 'Fahrzeugtypen durchblättern',
    vehicleTypesAll: 'Alle Fahrzeugtypen',
    popularBrandsTitle: 'Beliebte Automarken',
    carouselPreviousLabel: 'Zurück',
    carouselNextLabel: 'Weiter',
    sellerCtaTitle: 'Erreichen Sie tausende potenzielle Käufer mit Ihrer Fahrzeuganzeige.',
    sellerFlowCreated: 'Fahrzeuganzeige erstellt',
    sellerFlowViews: 'Fahrzeugaufrufe',
    sellerFlowContact: 'Käufer nimmt Kontakt auf',
    sellerFlowSold: 'Fahrzeuganzeige verkauft',
    privateTitle: 'Als Privatperson verkaufen',
    privateText:
      'Erstellen Sie in wenigen Minuten eine kostenlose Anzeige. Zahlen Sie nur für längere Laufzeit oder zusätzliche Sichtbarkeit.',
    privateCta: 'Kostenlose Anzeige erstellen',
    businessTitle: 'Als Unternehmen verkaufen',
    businessText:
      'Veröffentlichen Sie manuell in Autorell oder importieren Sie Ihren Bestand per CSV. Anzeigen, Team und Lagerkontrolle bleiben in einem professionellen Ablauf.',
    businessCta: 'Als Unternehmen starten',
  },
} as const

const localizedSellerFlowCopy = {
  at: {
    sellerCtaTitle: 'Erreichen Sie tausende potenzielle Käufer mit Ihrer Fahrzeuganzeige.',
    sellerFlowCreated: 'Fahrzeuganzeige erstellt',
    sellerFlowViews: 'Fahrzeugaufrufe',
    sellerFlowContact: 'Käufer nimmt Kontakt auf',
    sellerFlowSold: 'Fahrzeuganzeige verkauft',
  },
  be: {
    sellerCtaTitle: 'Bereik duizenden potentiële kopers met uw voertuigadvertentie.',
    sellerFlowCreated: 'Voertuigadvertentie aangemaakt',
    sellerFlowViews: 'voertuigweergaven',
    sellerFlowContact: 'Koper neemt contact op',
    sellerFlowSold: 'Voertuigadvertentie verkocht',
  },
  fr: {
    sellerCtaTitle: 'Touchez des milliers d’acheteurs potentiels avec votre annonce de véhicule.',
    sellerFlowCreated: 'Annonce de véhicule créée',
    sellerFlowViews: 'vues de l’annonce',
    sellerFlowContact: 'Acheteur prend contact',
    sellerFlowSold: 'Annonce de véhicule vendue',
  },
  es: {
    sellerCtaTitle: 'Llega a miles de compradores potenciales con tu anuncio de vehículo.',
    sellerFlowCreated: 'Anuncio de vehículo creado',
    sellerFlowViews: 'visualizaciones del anuncio',
    sellerFlowContact: 'Comprador contacta',
    sellerFlowSold: 'Anuncio de vehículo vendido',
  },
  it: {
    sellerCtaTitle: 'Raggiungi migliaia di potenziali acquirenti con il tuo annuncio di veicolo.',
    sellerFlowCreated: 'Annuncio del veicolo creato',
    sellerFlowViews: 'visualizzazioni dell’annuncio',
    sellerFlowContact: 'Acquirente contatta',
    sellerFlowSold: 'Annuncio del veicolo venduto',
  },
  pl: {
    sellerCtaTitle: 'Dotrzyj do tysięcy potencjalnych kupujących dzięki ogłoszeniu pojazdu.',
    sellerFlowCreated: 'Ogłoszenie pojazdu utworzone',
    sellerFlowViews: 'wyświetleń ogłoszenia',
    sellerFlowContact: 'Kupujący nawiązuje kontakt',
    sellerFlowSold: 'Ogłoszenie pojazdu sprzedane',
  },
  nl: {
    sellerCtaTitle: 'Bereik duizenden potentiële kopers met uw voertuigadvertentie.',
    sellerFlowCreated: 'Voertuigadvertentie aangemaakt',
    sellerFlowViews: 'voertuigweergaven',
    sellerFlowContact: 'Koper neemt contact op',
    sellerFlowSold: 'Voertuigadvertentie verkocht',
  },
  fi: {
    sellerCtaTitle: 'Tavoita tuhansia potentiaalisia ostajia ajoneuvoilmoituksellasi.',
    sellerFlowCreated: 'Ajoneuvoilmoitus luotu',
    sellerFlowViews: 'ajoneuvon katselua',
    sellerFlowContact: 'Ostaja ottaa yhteyttä',
    sellerFlowSold: 'Ajoneuvoilmoitus myyty',
  },
  da: {
    sellerCtaTitle: 'Nå tusindvis af potentielle købere med din køretøjsannonce.',
    sellerFlowCreated: 'Køretøjsannonce oprettet',
    sellerFlowViews: 'visninger af køretøjet',
    sellerFlowContact: 'Køber tager kontakt',
    sellerFlowSold: 'Køretøjsannonce solgt',
  },
} as const

const localizedHeroHeadingCopy: Record<PublicLocale, string> = {
  sv: 'Europas bästa fordonsmarknad',
  en: "Europe's best vehicle marketplace",
  de: 'Europas bester Fahrzeugmarkt',
  at: 'Europas bester Fahrzeugmarkt',
  be: "Europa's beste voertuigmarkt",
  fr: "Le meilleur marché de véhicules d'Europe",
  es: 'El mejor mercado de vehículos de Europa',
  it: "Il miglior mercato di veicoli d'Europa",
  pl: 'Najlepszy rynek pojazdów w Europie',
  nl: "Europa's beste voertuigmarkt",
  fi: 'Euroopan paras ajoneuvomarkkina',
  da: 'Europas bedste køretøjsmarked',
}

const localizedHeroAltCopy: Record<PublicLocale, string> = {
  sv: 'Person som söker fordon online på Autorell',
  en: 'Person searching for vehicles online on Autorell',
  de: 'Person sucht online nach Fahrzeugen auf Autorell',
  at: 'Person sucht online nach Fahrzeugen auf Autorell',
  be: 'Persoon zoekt online naar voertuigen op Autorell',
  fr: 'Personne recherchant des véhicules en ligne sur Autorell',
  es: 'Persona buscando vehículos en línea en Autorell',
  it: 'Persona che cerca veicoli online su Autorell',
  pl: 'Osoba wyszukująca pojazdy online w Autorell',
  nl: 'Persoon zoekt online naar voertuigen op Autorell',
  fi: 'Henkilö etsii ajoneuvoja verkossa Autorellista',
  da: 'Person søger efter køretøjer online på Autorell',
}

const localizedLocalHeroHeadingCopy: Record<PublicLocale, string> = {
  sv: 'Sveriges bästa fordonsmarknad',
  en: "Europe's best vehicle marketplace",
  de: 'Deutschlands bester Fahrzeugmarkt',
  at: 'Österreichs bester Fahrzeugmarkt',
  be: 'Belgiës beste voertuigmarkt',
  fr: 'Le meilleur marché de véhicules de France',
  es: 'El mejor mercado de vehículos de España',
  it: 'Il miglior mercato di veicoli in Italia',
  pl: 'Najlepszy rynek pojazdów w Polsce',
  nl: 'De beste voertuigmarkt van Nederland',
  fi: 'Suomen paras ajoneuvomarkkina',
  da: 'Danmarks bedste køretøjsmarked',
}

const localizedHeroHeadingSliderCopy: Record<
  PublicLocale,
  { lead: string; localTerm: string; europeTerm: string; tail: string }
> = {
  sv: {
    lead: '',
    localTerm: 'Sveriges',
    europeTerm: 'Europas',
    tail: ' bästa fordonsmarknad',
  },
  en: {
    lead: '',
    localTerm: "Europe's",
    europeTerm: "Europe's",
    tail: ' best vehicle marketplace',
  },
  de: {
    lead: '',
    localTerm: 'Deutschlands',
    europeTerm: 'Europas',
    tail: ' bester Fahrzeugmarkt',
  },
  at: {
    lead: '',
    localTerm: 'Österreichs',
    europeTerm: 'Europas',
    tail: ' bester Fahrzeugmarkt',
  },
  be: {
    lead: '',
    localTerm: 'Belgiës',
    europeTerm: "Europa's",
    tail: ' beste voertuigmarkt',
  },
  fr: {
    lead: 'Le meilleur marché de véhicules ',
    localTerm: 'de France',
    europeTerm: "d'Europe",
    tail: '',
  },
  es: {
    lead: 'El mejor mercado de vehículos de ',
    localTerm: 'España',
    europeTerm: 'Europa',
    tail: '',
  },
  it: {
    lead: 'Il miglior mercato di veicoli ',
    localTerm: 'in Italia',
    europeTerm: "d'Europa",
    tail: '',
  },
  pl: {
    lead: 'Najlepszy rynek pojazdów ',
    localTerm: 'w Polsce',
    europeTerm: 'w Europie',
    tail: '',
  },
  nl: {
    lead: 'De beste voertuigmarkt van ',
    localTerm: 'Nederland',
    europeTerm: 'Europa',
    tail: '',
  },
  fi: {
    lead: '',
    localTerm: 'Suomen',
    europeTerm: 'Euroopan',
    tail: ' paras ajoneuvomarkkina',
  },
  da: {
    lead: '',
    localTerm: 'Danmarks',
    europeTerm: 'Europas',
    tail: ' bedste køretøjsmarked',
  },
}

const localizedSellOptionsCopy: Record<
  PublicLocale,
  {
    title: string
    offerLabel: string
    fastestOption: string
    dealerTitle: string
    dealerBenefits: string[]
    dealerCta: string
    privateTitle: string
    privateBenefits: string[]
    privateCta: string
  }
> = {
  sv: {
    title: 'Funderar du på att sälja ditt fordon?',
    offerLabel: 'Bud',
    fastestOption: 'Snabbaste valet',
    dealerTitle: 'Sälj till en handlare',
    dealerBenefits: ['Sälj redan i dag', 'Få flera bud', 'Trygg inbytesprocess', 'Smidig överlämning'],
    dealerCta: 'Få bud nu',
    privateTitle: 'Sälj privat',
    privateBenefits: ['Gratis att annonsera', 'Nå rätt köpare i Europa', 'Publicera på några minuter', 'Sälj till ditt pris'],
    privateCta: 'Lägg upp annons',
  },
  en: {
    title: 'Looking to sell your vehicle?',
    offerLabel: 'Offer',
    fastestOption: 'Fastest option',
    dealerTitle: 'Sell to a dealership',
    dealerBenefits: ['Sell as early as today', 'Get multiple offers', 'Secure trade-in process', 'Convenient handover'],
    dealerCta: 'Get your offer now',
    privateTitle: 'Sell privately',
    privateBenefits: ['Free to list', 'Reach the right buyers in Europe', 'List it in minutes', 'Sell at your price'],
    privateCta: 'List your ad',
  },
  de: {
    title: 'Möchten Sie Ihr Fahrzeug verkaufen?',
    offerLabel: 'Angebot',
    fastestOption: 'Schnellste Option',
    dealerTitle: 'An einen Händler verkaufen',
    dealerBenefits: ['Schon heute verkaufen', 'Mehrere Angebote erhalten', 'Sicherer Inzahlungnahme-Prozess', 'Bequeme Übergabe'],
    dealerCta: 'Jetzt Angebot erhalten',
    privateTitle: 'Privat verkaufen',
    privateBenefits: ['Kostenlos inserieren', 'Passende Käufer in Europa erreichen', 'In Minuten online', 'Zum eigenen Preis verkaufen'],
    privateCta: 'Anzeige aufgeben',
  },
  at: {
    title: 'Möchten Sie Ihr Fahrzeug verkaufen?',
    offerLabel: 'Angebot',
    fastestOption: 'Schnellste Option',
    dealerTitle: 'An einen Händler verkaufen',
    dealerBenefits: ['Schon heute verkaufen', 'Mehrere Angebote erhalten', 'Sicherer Eintauschprozess', 'Bequeme Übergabe'],
    dealerCta: 'Jetzt Angebot erhalten',
    privateTitle: 'Privat verkaufen',
    privateBenefits: ['Kostenlos inserieren', 'Passende Käufer in Europa erreichen', 'In Minuten online', 'Zum eigenen Preis verkaufen'],
    privateCta: 'Anzeige aufgeben',
  },
  be: {
    title: 'Wilt u uw voertuig verkopen?',
    offerLabel: 'Bod',
    fastestOption: 'Snelste optie',
    dealerTitle: 'Verkoop aan een dealer',
    dealerBenefits: ['Vandaag nog verkopen', 'Meerdere biedingen ontvangen', 'Veilig inruilproces', 'Gemakkelijke overdracht'],
    dealerCta: 'Ontvang nu een bod',
    privateTitle: 'Particulier verkopen',
    privateBenefits: ['Gratis plaatsen', 'Bereik de juiste kopers in Europa', 'Binnen enkele minuten online', 'Verkoop tegen uw prijs'],
    privateCta: 'Advertentie plaatsen',
  },
  fr: {
    title: 'Vous souhaitez vendre votre véhicule ?',
    offerLabel: 'Offre',
    fastestOption: 'Option la plus rapide',
    dealerTitle: 'Vendre à un professionnel',
    dealerBenefits: ['Vendez dès aujourd’hui', 'Recevez plusieurs offres', 'Processus de reprise sécurisé', 'Remise simple du véhicule'],
    dealerCta: 'Obtenir une offre',
    privateTitle: 'Vendre entre particuliers',
    privateBenefits: ['Annonce gratuite', 'Touchez les bons acheteurs en Europe', 'Annonce en ligne en quelques minutes', 'Vendez à votre prix'],
    privateCta: 'Publier une annonce',
  },
  es: {
    title: '¿Quieres vender tu vehículo?',
    offerLabel: 'Oferta',
    fastestOption: 'Opción más rápida',
    dealerTitle: 'Vende a un concesionario',
    dealerBenefits: ['Vende incluso hoy', 'Recibe varias ofertas', 'Proceso de entrega seguro', 'Entrega cómoda'],
    dealerCta: 'Recibe tu oferta',
    privateTitle: 'Vende de forma privada',
    privateBenefits: ['Publicar es gratis', 'Llega a compradores en Europa', 'Anuncio listo en minutos', 'Vende al precio que quieras'],
    privateCta: 'Publicar anuncio',
  },
  it: {
    title: 'Vuoi vendere il tuo veicolo?',
    offerLabel: 'Offerta',
    fastestOption: 'Opzione più rapida',
    dealerTitle: 'Vendi a un concessionario',
    dealerBenefits: ['Vendi già oggi', 'Ricevi più offerte', 'Processo di permuta sicuro', 'Consegna comoda'],
    dealerCta: 'Ricevi un’offerta',
    privateTitle: 'Vendi privatamente',
    privateBenefits: ['Inserzione gratuita', 'Raggiungi acquirenti in Europa', 'Pubblica in pochi minuti', 'Vendi al tuo prezzo'],
    privateCta: 'Pubblica annuncio',
  },
  pl: {
    title: 'Chcesz sprzedać swój pojazd?',
    offerLabel: 'Oferta',
    fastestOption: 'Najszybsza opcja',
    dealerTitle: 'Sprzedaj dealerowi',
    dealerBenefits: ['Sprzedaj nawet dziś', 'Otrzymaj kilka ofert', 'Bezpieczny proces odkupu', 'Wygodne przekazanie'],
    dealerCta: 'Odbierz ofertę',
    privateTitle: 'Sprzedaj prywatnie',
    privateBenefits: ['Dodanie ogłoszenia za darmo', 'Dotrzyj do kupujących w Europie', 'Wystaw w kilka minut', 'Sprzedaj w swojej cenie'],
    privateCta: 'Dodaj ogłoszenie',
  },
  nl: {
    title: 'Wilt u uw voertuig verkopen?',
    offerLabel: 'Bod',
    fastestOption: 'Snelste optie',
    dealerTitle: 'Verkoop aan een dealer',
    dealerBenefits: ['Vandaag nog verkopen', 'Meerdere biedingen ontvangen', 'Veilig inruilproces', 'Gemakkelijke overdracht'],
    dealerCta: 'Ontvang nu een bod',
    privateTitle: 'Particulier verkopen',
    privateBenefits: ['Gratis plaatsen', 'Bereik de juiste kopers in Europa', 'Binnen enkele minuten online', 'Verkoop tegen uw prijs'],
    privateCta: 'Advertentie plaatsen',
  },
  fi: {
    title: 'Haluatko myydä ajoneuvosi?',
    offerLabel: 'Tarjous',
    fastestOption: 'Nopein vaihtoehto',
    dealerTitle: 'Myy liikkeelle',
    dealerBenefits: ['Myy jo tänään', 'Saat useita tarjouksia', 'Turvallinen vaihtoprosessi', 'Vaivaton luovutus'],
    dealerCta: 'Pyydä tarjous nyt',
    privateTitle: 'Myy yksityisesti',
    privateBenefits: ['Ilmainen ilmoitus', 'Tavoita oikeat ostajat Euroopassa', 'Julkaise minuuteissa', 'Myy omalla hinnallasi'],
    privateCta: 'Jätä ilmoitus',
  },
  da: {
    title: 'Vil du sælge dit køretøj?',
    offerLabel: 'Bud',
    fastestOption: 'Hurtigste valg',
    dealerTitle: 'Sælg til en forhandler',
    dealerBenefits: ['Sælg allerede i dag', 'Få flere bud', 'Tryg bytteproces', 'Nem overdragelse'],
    dealerCta: 'Få dit bud nu',
    privateTitle: 'Sælg privat',
    privateBenefits: ['Gratis at annoncere', 'Nå de rette købere i Europa', 'Opret på få minutter', 'Sælg til din pris'],
    privateCta: 'Opret annonce',
  },
}

export function getHomeCopy(locale: PublicLocale) {
  const base = locale === 'sv'
    ? homeCopy.sv
    : locale === 'de'
      ? homeCopy.de
      : locale === 'en'
        ? homeCopy.en
        : {
            ...translatePublicObject(locale, homeCopy.en),
            ...(localizedSellerFlowCopy[locale as keyof typeof localizedSellerFlowCopy] || {}),
          }

  return {
    ...base,
    heroAlt: localizedHeroAltCopy[locale],
    heroHeading: localizedHeroHeadingCopy[locale],
    localHeroHeading: localizedLocalHeroHeadingCopy[locale],
    heroHeadingSlider: localizedHeroHeadingSliderCopy[locale],
  }
}

type HomeListingCardItem = {
  id: string
  title: string
  href: string
  imageUrl: string | null
  imageUrls: string[]
  priceLabel: string
  location: string
  countryCode: string
  countryLabel: string
  showCountryChip: boolean
  headline: string
  versionLabel: string | null
  detailItems: string[]
  sellerTypeLabel: string
  sellerDetailLabel: string | null
  sellerTrust: 'verified' | 'unverified'
  isFeatured: boolean
  isTopPlacement: boolean
}

type HomeListingSectionData = {
  id: string
  title: string
  emptyText: string
  emptyCta: string
  emptyHref: string
  marketplaceHref: string
  items: HomeListingCardItem[]
  kind: 'top' | 'latest'
  marketLabel: string
}

export default async function BusinessMarketplaceHome({
  locale = 'sv',
  marketCode,
}: {
  locale?: PublicLocale
  marketCode?: string
}) {
  const t = getHomeCopy(locale)
  const localMarketCode =
    marketCode || countryForLocale(locale)
  const localMarketLabel =
    localMarketCode === 'EU'
      ? 'Europe'
      : getEuCountryName(localMarketCode, locale)
  const displayCurrency = displayCurrencyForMarket(localMarketCode)
  const categoryPresentations = getHomepageCategoryPresentations(locale, localMarketLabel)
  const metadataByCategory = Object.fromEntries(
    homeListingCategories.map((category) => [category, categoryPresentations[category].seo]),
  ) as Record<MarketplaceCategorySlug, (typeof categoryPresentations)[MarketplaceCategorySlug]['seo']>
  const [
    categoryListingGroups,
    localListingCount,
    europeListingCount,
    vehicleNews,
  ] = await Promise.all([
    Promise.all(
      homeListingCategories.map(async (category) => {
        const [top, latest] = await Promise.all([
          getPublishedMarketplaceHomeListings(localMarketCode, 'top', 17, category),
          getPublishedMarketplaceHomeListings(localMarketCode, 'latest', 17, category),
        ])
        return { category, top, latest }
      }),
    ),
    getPublishedMarketplaceListingCount(localMarketCode),
    getPublishedMarketplaceListingCount('EU'),
    getVehicleNews((localMarketCode || 'SE').toLowerCase(), 1, 3),
  ])
  const newsCards = vehicleNews.articles.slice(0, 3)
  const allHomeListings = categoryListingGroups.flatMap(({ top, latest }) => [
    ...top,
    ...latest,
  ])
  const sellerProfiles = await getMarketplaceSellerPublicProfiles(
    allHomeListings
      .map((listing) => listing.seller_user_id)
      .filter((id): id is string => typeof id === 'string' && Boolean(id)),
  )
  const toHomeCard = (listing: HomeListingSource) =>
    mapHomeListingCard(listing, locale, displayCurrency, sellerProfiles.get(listing.seller_user_id || '')?.trust || 'unverified', localMarketCode)
  const localListingSectionsByCategory = new Map(
    await Promise.all(
      categoryListingGroups.map(async ({ category, top, latest }) => [
        category,
        {
          top: {
            id: `${category}-top`,
            title: categoryPresentations[category].topTitle,
            emptyText: categoryPresentations[category].emptyText,
            emptyCta: categoryPresentations[category].emptyCta,
            emptyHref: categoryPresentations[category].sell.privateHref,
            marketplaceHref: categoryPresentations[category].marketplaceHref,
            kind: 'top' as const,
            marketLabel: localMarketLabel,
            items: await Promise.all(top.map(toHomeCard)),
          },
          latest: {
            id: `${category}-latest`,
            title: categoryPresentations[category].latestTitle,
            emptyText: categoryPresentations[category].emptyText,
            emptyCta: categoryPresentations[category].emptyCta,
            emptyHref: categoryPresentations[category].sell.privateHref,
            marketplaceHref: categoryPresentations[category].marketplaceHref,
            kind: 'latest' as const,
            marketLabel: localMarketLabel,
            items: await Promise.all(latest.map(toHomeCard)),
          },
        },
      ] as const),
    ),
  )

  return (
    <main className="min-h-screen max-w-full overflow-x-hidden bg-white text-[#101828]">
      <PublicHeader locale={locale} marketCode={marketCode} />
      <HomeLocationConsentPrompt locale={locale} />

      <HomeCategoryProvider metadataByCategory={metadataByCategory}>
        <section className="-mt-[2px] bg-white pt-0">
        <div className="relative aspect-[750/400] overflow-hidden bg-[#0866ff] sm:aspect-auto sm:h-[340px] lg:h-[330px]">
          <Image
            src="/autorell-home-mobile-market-hero.png"
            alt={t.heroAlt}
            fill
            priority
            unoptimized
            className="object-fill lg:hidden"
            sizes="100vw"
          />
          <Image
            src="/autorell-home-desktop-market-hero.png"
            alt={t.heroAlt}
            fill
            priority
            unoptimized
            className="hidden object-cover object-center lg:block"
            sizes="100vw"
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 flex w-[55%] items-center justify-center px-3 pb-8 text-center sm:w-[60%] sm:pb-10 lg:w-[52%] lg:items-start lg:justify-start lg:px-0 lg:pb-0 lg:pt-14 lg:text-left">
            <div className="max-w-[215px] sm:max-w-[430px] lg:ml-[max(48px,calc((100vw-1120px)/2))] lg:max-w-[570px] lg:pr-12">
              <HomeMarketHeadingSlider
                lead={t.heroHeadingSlider.lead}
                terms={[
                  t.heroHeadingSlider.localTerm,
                  t.heroHeadingSlider.europeTerm,
                ]}
                tail={t.heroHeadingSlider.tail}
              />
            </div>
          </div>
        </div>
        <div className="relative z-20 -mt-16 pb-8 sm:-mt-16 sm:pb-11 lg:-mt-[76px] lg:pb-14">
          <div className={homeSearchContainerClass}>
            <HomeHeroVehicleSearch
              locale={locale}
              localListingCount={localListingCount}
              europeListingCount={europeListingCount}
              browseByType={
                <HomeBrowseByTypeSwitcher
                  integrated
                  presentations={categoryPresentations}
                  previousLabel={t.carouselPreviousLabel}
                  nextLabel={t.carouselNextLabel}
                />
              }
            />
          </div>
        </div>
        </section>

        <section className="bg-white py-7 sm:py-10">
        <div className={homeContentContainerClass}>
          <HomePopularBrandsSwitcher
            presentations={categoryPresentations}
            previousLabel={t.carouselPreviousLabel}
            nextLabel={t.carouselNextLabel}
          />
        </div>
        </section>

        <HomeListingCategorySwitcher categories={homeListingCategories}>
          {homeListingCategories.map((category) => {
            const sell = categoryPresentations[category].sell
            return (
              <HomeSellOptionsSection
                key={`${category}-sell`}
                copy={localizedSellOptionsCopy[locale]}
                currency={displayCurrency}
                locale={locale}
                title={sell.title}
                image={sell.image}
                imageAlt={sell.imageAlt}
                dealerCta={sell.dealerCta}
                privateCta={sell.privateCta}
                dealerHref={sell.dealerHref}
                privateHref={sell.privateHref}
              />
            )
          })}
        </HomeListingCategorySwitcher>

        <section className="bg-white py-10 sm:py-14">
        <div className={`${homeContentContainerClass} max-sm:mx-0 max-sm:w-screen max-sm:max-w-none max-sm:px-4`}>
          <HomeListingCategorySwitcher categories={homeListingCategories}>
            {homeListingCategories.map((category) => {
              const section = localListingSectionsByCategory.get(category)?.latest
              return section ? <HomeListingSection key={section.id} section={section} locale={locale} /> : <div key={category} />
            })}
          </HomeListingCategorySwitcher>
        </div>
        </section>

        <section className="bg-white py-10 sm:py-16">
        <div className={`${homeContentContainerClass} max-sm:mx-0 max-sm:w-screen max-sm:max-w-none max-sm:px-4`}>
          <HomeListingCategorySwitcher categories={homeListingCategories}>
            {homeListingCategories.map((category) => {
              const section = localListingSectionsByCategory.get(category)?.top
              return section ? <HomeListingSection key={section.id} section={section} locale={locale} /> : <div key={category} />
            })}
          </HomeListingCategorySwitcher>
        </div>
        </section>

      <section className="bg-white py-9 sm:py-16">
        <div className={homeContentContainerClass}>
          <HomeVehicleNewsScroller
            title={t.vehicleNewsTitle}
            allNewsHref={localizePublicHref(locale, '/vehicle-news')}
            allNewsLabel={t.allNews}
            scrollLabel={t.newsScrollLabel}
          >
            {newsCards.map((item) => (
              <VehicleNewsCard
                key={item.id}
                item={item}
                category={t.newsCategory}
                readTime={t.newsReadTime}
                locale={locale}
              />
            ))}
          </HomeVehicleNewsScroller>
        </div>
      </section>

      <section className="border-y border-[#d8e0ea] bg-white py-4 sm:py-10">
        <div className={`${homeContentContainerClass} max-sm:max-w-none max-sm:px-0`}>
          <NewsletterSignup locale={locale} category="home" variant="home" />
        </div>
      </section>

      <section className="bg-white pb-5 pt-0 sm:pb-12">
        <div className={`${homeContentContainerClass} max-sm:max-w-none max-sm:px-0`}>
          <HomeListingCategorySwitcher categories={carHomepageCategories}>
            <HomeVehicleLinkDirectory locale={locale} />
          </HomeListingCategorySwitcher>
        </div>
      </section>
      </HomeCategoryProvider>

      <PublicFooter locale={locale} />
    </main>
  )
}

export function HomeSellerAudienceSection({
  copy,
  locale,
}: {
  copy: Record<keyof typeof homeCopy.en, string>
  locale: PublicLocale
}) {
  const cards = [
    {
      id: '01',
      title: copy.privateTitle,
      text: copy.privateText,
      cta: copy.privateCta,
      href: localizePublicHref(locale, '/account/listings/new'),
      variant: 'primary',
    },
    {
      id: '02',
      title: copy.businessTitle,
      text: copy.businessText,
      cta: copy.businessCta,
      href: localizePublicHref(locale, '/register?onboarding=1&account=business'),
      variant: 'secondary',
    },
  ] as const

  return (
    <section className="border-t border-[#dfe6f1] bg-[#f7faff] py-12 sm:py-[72px]">
      <div className={homeContentContainerClass}>
        <div className="overflow-hidden rounded-[22px] border border-[#cfe0f5] bg-white shadow-[0_22px_70px_rgba(16,24,40,.07)]">
          <div className="grid gap-0 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="relative overflow-hidden border-b border-[#e2eaf5] bg-[#f5f9ff] px-6 py-8 sm:px-10 sm:py-10 lg:border-b-0 lg:border-r">
              <div className="absolute inset-x-0 top-0 h-1 bg-[#0866ff]" />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full border-[26px] border-[#0866ff]/10 bg-[#0866ff]/[0.025] sm:-bottom-28 sm:-left-24 sm:h-72 sm:w-72 sm:border-[34px]"
              />
              <HomeAnimatedViewsBadge
                createdLabel={copy.sellerFlowCreated}
                viewsLabel={copy.sellerFlowViews}
                contactLabel={copy.sellerFlowContact}
                soldLabel={copy.sellerFlowSold}
              />
              <h2 className="relative z-10 mt-4 max-w-[620px] text-[30px] font-semibold leading-[1.08] tracking-[-0.035em] text-[#101828] sm:text-[44px] lg:text-[48px]">
                {copy.sellerCtaTitle}
              </h2>
            </div>

            <div className="grid divide-y divide-[#e6edf7] md:grid-cols-2 md:divide-x md:divide-y-0">
              {cards.map((card) => (
                <article key={card.id} className="flex min-h-[300px] flex-col px-6 py-7 sm:px-8 sm:py-9">
                  <div className="flex items-start justify-between gap-5">
                    <span className="text-[12px] font-semibold uppercase tracking-[.18em] text-[#0866ff]">
                      {card.id}
                    </span>
                    <span className="h-px w-16 bg-[#0866ff]" />
                  </div>
                  <h3 className="mt-9 text-[23px] font-semibold leading-[1.18] tracking-[-0.025em] text-[#101828] sm:text-[27px] md:min-h-[64px]">
                    {card.title}
                  </h3>
                  <p className="mt-4 max-w-[420px] text-[15px] leading-6 text-[#475467] md:min-h-[120px] lg:min-h-[144px] xl:min-h-[120px]">
                    {card.text}
                  </p>
                  <Link
                    href={card.href}
                    className={`group mt-8 inline-flex min-h-11 w-fit items-center gap-2 rounded-[8px] px-4 text-sm font-semibold transition md:mt-auto ${
                      card.variant === 'primary'
                        ? 'bg-[#0866ff] text-white hover:bg-[#075ce5]'
                        : 'border border-[#0866ff] bg-white text-[#0866ff] hover:bg-[#eef5ff]'
                    }`}
                  >
                    {card.cta}
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function HomeSellOptionsSection({
  copy,
  currency,
  locale,
  title,
  image,
  imageAlt,
  dealerCta,
  privateCta,
  dealerHref,
  privateHref,
}: {
  copy: (typeof localizedSellOptionsCopy)[PublicLocale]
  currency: string
  locale: PublicLocale
  title: string
  image: string
  imageAlt: string
  dealerCta: string
  privateCta: string
  dealerHref: string
  privateHref: string
}) {
  const offerAmounts = sellOptionOfferAmounts(currency)
  const offerLabels = offerAmounts.map((amount) => ({
    amount,
    label: formatSellOptionPrice(amount, currency, locale),
  }))
  return (
    <section className="bg-white py-9 sm:py-12">
      <div className={homeContentContainerClass}>
        <div className="grid items-center gap-5 lg:grid-cols-[0.95fr_1.75fr] xl:gap-6">
          <div className="relative min-h-[280px] overflow-hidden rounded-[10px] bg-white px-1 pb-2 pt-1 sm:min-h-[330px] lg:rounded-none">
            <h2 className="relative z-10 max-w-[500px] text-[32px] font-semibold leading-[1.05] tracking-[-0.04em] text-[#20242d] sm:text-[40px] lg:text-[44px]">
              {title}
            </h2>
            <div className="relative mt-4 h-[210px] sm:mt-4 sm:h-[255px]">
              <Image
                src={image}
                alt={imageAlt}
                fill
                sizes="(max-width: 1024px) 90vw, 520px"
                className="object-contain object-bottom"
              />
              <OfferBubble
                className="left-0 top-[18%]"
                label={copy.offerLabel}
                value={offerLabels[0]?.label || ''}
                currency={currency}
              />
              <OfferBubble
                className="left-2 top-[66%] sm:left-0"
                label={copy.offerLabel}
                value={offerLabels[1]?.label || ''}
                currency={currency}
              />
              <OfferBubble
                className="right-0 top-[46%]"
                label={copy.offerLabel}
                value={offerLabels[2]?.label || ''}
                currency={currency}
              />
            </div>
          </div>

          <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 pt-7 [scrollbar-width:none] xl:mx-0 xl:grid xl:grid-cols-2 xl:overflow-visible xl:px-0 xl:pb-0 xl:pt-7 [&::-webkit-scrollbar]:hidden">
            <SellOptionCard
              title={copy.dealerTitle}
              benefits={copy.dealerBenefits}
              cta={dealerCta}
              href={dealerHref}
              variant="primary"
              badge={copy.fastestOption}
            />
            <SellOptionCard
              title={copy.privateTitle}
              benefits={copy.privateBenefits}
              cta={privateCta}
              href={privateHref}
              variant="secondary"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function OfferBubble({
  label,
  value,
  currency,
  className,
}: {
  label: string
  value: string
  currency: string
  className: string
}) {
  return (
    <div className={`absolute z-10 flex items-center gap-2 rounded-full border border-[#c7ccd5] bg-white/95 py-1.5 pl-1.5 pr-3 shadow-[0_10px_24px_rgba(16,24,40,.12)] ${className}`}>
      <span className="grid h-8 w-8 place-items-center rounded-full bg-[#0866ff] text-[11px] font-bold text-white">
        {currencyBubbleMark(currency)}
      </span>
      <span className="leading-none">
        <span className="block text-[11px] font-semibold text-[#303744]">{label}</span>
        <span className="mt-0.5 block text-[12px] font-bold text-[#101828]">{value}</span>
      </span>
    </div>
  )
}

function SellOptionCard({
  title,
  benefits,
  cta,
  href,
  variant,
  badge,
}: {
  title: string
  benefits: string[]
  cta: string
  href: string
  variant: 'primary' | 'secondary'
  badge?: string
}) {
  return (
    <article className={`relative flex min-h-[292px] w-[82vw] max-w-[390px] flex-none snap-start flex-col overflow-visible rounded-[10px] border border-[#dedfe4] bg-white px-5 py-6 shadow-sm sm:min-h-[312px] sm:w-[520px] sm:max-w-none sm:px-7 sm:py-7 md:w-[560px] lg:w-[600px] xl:w-auto xl:max-w-none ${variant === 'primary' ? 'border-t-[5px] border-t-[#0866ff]' : ''}`}>
      {badge ? (
        <span className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#24272d] px-5 py-1.5 text-[12px] font-bold text-white shadow-[0_10px_24px_rgba(16,24,40,.18)]">
          {badge}
        </span>
      ) : null}
      <h3 className="text-[20px] font-semibold leading-tight tracking-[-0.02em] text-[#20242d] sm:text-[21px]">
        {title}
      </h3>
      <ul className="mt-5 space-y-3">
        {benefits.map((benefit) => (
          <li key={benefit} className="flex items-start gap-3 text-[15px] leading-5 text-[#242b36] sm:text-[16px]">
            <span className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full bg-[#087a18] text-white">
              <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
            </span>
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`mt-7 inline-flex min-h-[48px] w-full items-center justify-center rounded-full px-5 text-center text-[16px] font-bold transition sm:mt-auto ${
          variant === 'primary'
            ? 'bg-[#1479e6] text-white hover:bg-[#0866ff]'
            : 'border-2 border-[#0866ff] bg-white text-[#0866ff] hover:bg-[#eef5ff]'
        }`}
      >
        {cta}
      </Link>
    </article>
  )
}

function sellOptionOfferAmounts(currency: string) {
  const amounts: Record<string, [number, number, number]> = {
    SEK: [295000, 319900, 321500],
    DKK: [189500, 205000, 206500],
    PLN: [109900, 119500, 120900],
    EUR: [25900, 27900, 28500],
  }
  return amounts[currency] || amounts.EUR
}

function formatSellOptionPrice(value: number, currency: string, locale: PublicLocale) {
  if (currency === 'SEK') return `${formatSellOptionNumber(value, locale)} SEK`
  if (currency === 'DKK') return `${formatSellOptionNumber(value, locale)} DKK`
  if (currency === 'PLN') return `${formatSellOptionNumber(value, locale)} PLN`

  const localeMap: Record<PublicLocale, string> = {
    sv: 'sv-SE',
    en: 'en-GB',
    de: 'de-DE',
    at: 'de-AT',
    be: 'nl-BE',
    fr: 'fr-FR',
    es: 'es-ES',
    it: 'it-IT',
    pl: 'pl-PL',
    nl: 'nl-NL',
    fi: 'fi-FI',
    da: 'da-DK',
  }

  return new Intl.NumberFormat(localeMap[locale] || 'en-GB', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatSellOptionNumber(value: number, locale: PublicLocale) {
  const localeMap: Record<PublicLocale, string> = {
    sv: 'sv-SE',
    en: 'en-GB',
    de: 'de-DE',
    at: 'de-AT',
    be: 'nl-BE',
    fr: 'fr-FR',
    es: 'es-ES',
    it: 'it-IT',
    pl: 'pl-PL',
    nl: 'nl-NL',
    fi: 'fi-FI',
    da: 'da-DK',
  }

  return new Intl.NumberFormat(localeMap[locale] || 'en-GB', {
    maximumFractionDigits: 0,
  }).format(value)
}

function currencyBubbleMark(currency: string) {
  if (currency === 'SEK') return 'SEK'
  if (currency === 'DKK') return 'DKK'
  if (currency === 'PLN') return 'PLN'
  if (currency === 'EUR') return '€'
  return currency
}

function VehicleNewsCard({
  item,
  category,
  readTime,
  locale,
}: {
  item: PublicNewsArticle
  category: string
  readTime: string
  locale: PublicLocale
}) {
  const href = localizePublicHref(locale, `/vehicle-news/${item.slug}`)
  return (
    <Link
      href={href}
      className="group w-full flex-none snap-start overflow-hidden rounded-[10px] border border-[#d8e0ec] bg-white shadow-sm sm:w-auto sm:rounded-[12px]"
    >
      <div className="relative aspect-[16/9] overflow-hidden rounded-t-[10px] bg-[#eef3f8] sm:aspect-[16/10] sm:rounded-none">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.imageAlt}
            fill
            sizes="(max-width: 640px) 86vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-[1.025]"
          />
        ) : (
          <NoPhotoFrame className="h-full w-full border-0" compact locale={locale} />
        )}
      </div>
      <div className="px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4">
        <div className="text-[11px] font-medium text-[#667085]">
          {item.category?.label || category} | {item.readingTime ? `${item.readingTime} min` : readTime}
        </div>
        <h3 className="mt-1 line-clamp-2 text-[15px] font-semibold leading-[1.35] text-[#101828] transition group-hover:text-[#0866ff] sm:text-[16px] sm:leading-[1.35]">
          {item.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-[#667085]">{item.excerpt}</p>
        <span className="mt-3 inline-flex items-center gap-2 text-[14px] font-semibold text-[#0866ff] sm:mt-4">
          {readMoreLabel(locale)}
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}

function readMoreLabel(locale: PublicLocale) {
  if (locale === 'sv') return 'Läs mer'
  if (locale === 'de') return 'Mehr lesen'
  if (locale === 'en') return 'Read more'
  return translatePublic(locale, 'Read more')
}

function NoPhotoFrame({
  className = '',
  compact = false,
  locale = 'en',
}: {
  className?: string
  compact?: boolean
  locale?: PublicLocale
}) {
  const label = locale === 'de'
    ? 'Kein Foto verfügbar'
    : locale === 'sv'
      ? 'Ingen bild tillgänglig'
      : translatePublic(locale, 'No photo available')
  const [first, ...rest] = label.split(' ')
  return (
    <div
      className={`grid place-items-center border border-[#e3e8f0] bg-[#f6f7f9] text-center text-[#9b9ca0] ${className}`}
      aria-label={label}
    >
      <span className={`${compact ? 'text-[15px]' : 'text-[22px]'} font-light uppercase leading-[1.35] tracking-[0.04em]`}>
        {first || label}
        <br />
        {rest.join(' ')}
      </span>
    </div>
  )
}

function HomeListingSection({
  section,
  locale,
}: {
  section: HomeListingSectionData
  locale: PublicLocale
}) {
  const visibleItems = section.items.slice(0, 16)
  const hasMoreListings = section.items.length > visibleItems.length

  return (
    <section>
      <div className="flex items-end justify-between gap-5">
        <h2 className="text-[24px] font-medium leading-tight tracking-[-0.035em] text-[#101828] sm:text-[30px]">
          {section.title}
        </h2>
        <Link
          href={section.marketplaceHref}
          className="hidden items-center gap-2 text-sm font-semibold text-[#0866ff] sm:inline-flex"
        >
          {homeViewListingsLabel(locale)}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      {visibleItems.length ? (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
            {visibleItems.map((item, index) => (
              <HomeListingCard
                key={`${section.title}-${item.id}`}
                item={item}
                locale={locale}
                className={index >= 8 ? 'max-sm:hidden' : ''}
              />
            ))}
          </div>
          {hasMoreListings ? (
            <div className="mt-7 flex justify-center">
              <Link
                href={section.marketplaceHref}
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#cbd5e1] bg-white px-5 text-sm font-semibold text-[#101828] shadow-sm transition hover:border-[#0866ff] hover:text-[#0866ff]"
              >
                {homeLoadMoreListingsLabel(locale)}
              </Link>
            </div>
          ) : null}
        </>
      ) : (
        <div className="mt-5 flex flex-col items-start gap-4 rounded-[8px] border border-[#d8e0ec] bg-[#f8fbff] px-5 py-7 text-sm font-medium text-[#667085] sm:flex-row sm:items-center sm:justify-between">
          <p>{section.emptyText}</p>
          <Link
            href={section.emptyHref}
            className="inline-flex min-h-10 flex-none items-center justify-center rounded-full bg-[#0866ff] px-5 text-sm font-semibold text-white transition hover:bg-[#075bd8]"
          >
            {section.emptyCta}
          </Link>
        </div>
      )}
    </section>
  )
}

function HomeListingCard({
  item,
  locale,
  className = '',
}: {
  item: HomeListingCardItem
  locale: PublicLocale
  className?: string
}) {
  const saveLabels = homeSaveListingLabels(locale)

  return (
    <article className={`group relative flex min-w-0 flex-col overflow-hidden rounded-[8px] border border-[#d7dee8] bg-white shadow-[0_1px_3px_rgba(16,24,40,.10)] ${className}`}>
      <div className="relative aspect-[4/3] overflow-hidden bg-[#eef3f8]">
        {item.imageUrls.length ? (
          <ListingCardImageCarousel
            images={item.imageUrls}
            title={item.title}
            href={item.href}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            showDotsOnMobile
            previousLabel={locale === 'sv' ? 'Föregående bild' : translatePublic(locale, 'Previous photo')}
            nextLabel={locale === 'sv' ? 'Nästa bild' : translatePublic(locale, 'Next photo')}
          />
        ) : (
          <NoPhotoFrame className="h-full w-full border-0" compact locale={locale} />
        )}
        {item.isFeatured ? (
          <span className="absolute right-3 top-3 rounded-full bg-[#0866ff] px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
            {featuredListingLabel(locale)}
          </span>
        ) : item.isTopPlacement ? (
          <span className="absolute right-3 top-3 rounded-full bg-[#101828] px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
            {topListingLabel(locale)}
          </span>
        ) : null}
      </div>
      <div className="flex min-h-[190px] flex-1 flex-col px-3 py-3 sm:min-h-[205px] sm:px-3.5">
        <Link href={item.href} className="block">
          <h3 className="line-clamp-2 text-[16px] font-semibold leading-5 text-[#050b18] transition hover:text-[#0866ff] sm:text-[17px] sm:leading-6">
            {item.headline}
          </h3>
        </Link>
        {item.versionLabel ? (
          <p className="mt-1 line-clamp-1 text-[13px] font-normal leading-5 text-[#101828] sm:text-[14px]">
            {item.versionLabel}
          </p>
        ) : null}
        <p className="mt-2 text-[17px] font-semibold leading-6 text-[#050b18] no-underline [text-decoration:none] sm:text-[18px]">
          {item.priceLabel}
        </p>
        {item.location ? (
          <p className="mt-1 flex min-w-0 items-center gap-1 text-[12px] font-normal leading-5 text-[#667085] sm:text-[13px]">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#0866ff]" />
            <span className="truncate">{item.location}</span>
          </p>
        ) : null}
        {item.detailItems.length ? (
          <p className="mt-2 line-clamp-1 text-[12px] font-normal leading-5 text-[#344054] sm:text-[13px]">
            {item.detailItems.join(' | ')}
          </p>
        ) : null}
        <div className="mt-2 border-t border-[#e4e7ec]" />
        <div className="mt-auto grid grid-cols-[minmax(0,1fr)_44px] items-end gap-2 pt-2">
          <div className="min-w-0 text-[12px] font-normal leading-4 text-[#050b18]">
            <p className="truncate">{item.sellerTypeLabel}</p>
            {item.sellerDetailLabel || item.showCountryChip ? (
              <p className="mt-0.5 flex min-w-0 items-center gap-1.5">
                {item.showCountryChip ? (
                  <CountryFlag code={item.countryCode || 'eu'} className="h-3.5 w-3.5 shrink-0 rounded-full shadow-sm" />
                ) : null}
                {item.sellerDetailLabel ? <span className="truncate">{item.sellerDetailLabel}</span> : null}
              </p>
            ) : null}
          </div>
          <SavedListingButton
            listingId={item.id}
            label={saveLabels.label}
            savedLabel={saveLabels.savedLabel}
            removeLabel={saveLabels.removeLabel}
            className="h-9 w-9 rounded-[8px] border border-[#cfd7e6] shadow-none"
            iconClassName="h-5 w-5"
          />
        </div>
      </div>
    </article>
  )
}

function featuredListingLabel(locale: PublicLocale) {
  if (locale === 'sv') return 'Utvald'
  if (locale === 'de') return 'Ausgewählt'
  if (locale === 'en') return 'Featured'
  return translatePublic(locale, 'Featured')
}

function topListingLabel(locale: PublicLocale) {
  if (locale === 'sv') return 'Toppannons'
  if (locale === 'de') return 'Top-Anzeige'
  if (locale === 'en') return 'Sponsored'
  return translatePublic(locale, 'Sponsored')
}

function homeViewListingsLabel(locale: PublicLocale) {
  if (locale === 'sv') return 'Visa annonser'
  if (locale === 'de') return 'Anzeigen ansehen'
  if (locale === 'en') return 'View listings'
  return translatePublic(locale, 'View listings')
}

function homeLoadMoreListingsLabel(locale: PublicLocale) {
  if (locale === 'sv') return 'Ladda fler annonser'
  if (locale === 'de') return 'Mehr Anzeigen laden'
  if (locale === 'en') return 'Load more listings'
  return translatePublic(locale, 'Load more listings')
}

type HomeListingSource = {
  id: string
  title: string
  make: string | null
  model: string | null
  variant?: string | null
  model_year: number | string | null
  mileage_km: number | string | null
  fuel_type?: string | null
  gearbox?: string | null
  city: string | null
  municipality?: string | null
  country_code: string
  price: number | string | null
  currency: string | null
  images?: string[] | null
  seller_user_id?: string | null
  featured_status?: string | null
  featured_started_at?: string | null
  featured_expires_at?: string | null
  boost_status?: string | null
  boost_started_at?: string | null
  boost_expires_at?: string | null
  offer_type?: string | null
  seller_type?: string | null
  seller_name?: string | null
  insurance_offers?: unknown
}

async function mapHomeListingCard(
  listing: HomeListingSource,
  locale: PublicLocale,
  displayCurrency: string,
  sellerTrust: 'verified' | 'unverified',
  marketCountryCode?: string | null,
): Promise<HomeListingCardItem> {
  const countryName = getEuCountryName(listing.country_code, locale)
  const location = Array.from(new Set([listing.city, listing.municipality, countryName].filter(Boolean)))
    .filter(Boolean)
    .join(', ')
  const price = Number(listing.price)
  const mileage = Number(listing.mileage_km)
  const headline = buildHomeListingHeadline(listing)
  const versionLabel = buildHomeListingVersionLabel(listing, headline)
  const detailItems = [
    Number.isFinite(mileage) ? formatMileageAsMil(mileage, locale) : null,
    listing.gearbox ? translateListingVehicleValue(locale, listing.gearbox) : null,
    listing.fuel_type ? translateListingVehicleValue(locale, listing.fuel_type) : null,
  ]
    .filter(Boolean)
    .filter((item): item is string => typeof item === 'string' && Boolean(item))
  const sellerIsBusiness = listing.seller_type === 'business'
  const sellerDetailLabel = sellerIsBusiness ? String(listing.seller_name || '').trim() || null : null

  return {
    id: listing.id,
    title: listing.title,
    href: buildListingPath(listing, locale),
    imageUrl: listing.images?.[0] || null,
    imageUrls: (listing.images || []).filter((image: unknown): image is string => typeof image === 'string' && Boolean(image)),
    priceLabel: Number.isFinite(price)
      ? (await formatMarketplacePriceDisplay({
          amount: price,
          currency: listing.currency || 'EUR',
          locale,
          targetCurrency: displayCurrency,
        })).label
      : translatePublic(locale, 'Price on request'),
    location: location || countryName,
    countryCode: listing.country_code,
    countryLabel: countryName,
    showCountryChip: shouldShowListingCountryChip(listing.country_code, marketCountryCode),
    headline,
    versionLabel,
    detailItems,
    sellerTypeLabel: homeSellerTypeLabel(locale, listing.seller_type),
    sellerDetailLabel,
    sellerTrust,
    isFeatured: isActiveWindow(listing.featured_status, listing.featured_started_at, listing.featured_expires_at),
    isTopPlacement: isActiveWindow(listing.boost_status, listing.boost_started_at, listing.boost_expires_at),
  }
}

function buildHomeListingHeadline(listing: HomeListingSource) {
  const generated = [listing.model_year, listing.make, listing.model]
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .join(' ')
  return generated || listing.title
}

function buildHomeListingVersionLabel(listing: HomeListingSource, headline: string) {
  const variant = String(listing.variant || '').trim()
  if (variant) return variant
  const title = String(listing.title || '').trim()
  if (!title || title.toLowerCase() === headline.toLowerCase()) return null
  return title
}

function shouldShowListingCountryChip(listingCountryCode?: string | null, marketCountryCode?: string | null) {
  const listingCountry = (listingCountryCode || '').toUpperCase()
  const marketCountry = (marketCountryCode || '').toUpperCase()
  return Boolean(listingCountry && (!marketCountry || marketCountry === 'EU' || listingCountry !== marketCountry))
}

function homeSellerTypeLabel(locale: PublicLocale, sellerType?: string | null) {
  const isBusiness = sellerType === 'business'
  if (locale === 'sv') return isBusiness ? 'Företag' : 'Privat säljare'
  if (locale === 'de' || locale === 'at') return isBusiness ? 'Unternehmen' : 'Privatverkäufer'
  if (locale === 'en') return isBusiness ? 'Business' : 'Private seller'
  return translatePublic(locale, isBusiness ? 'Business' : 'Private seller')
}

function homeSaveListingLabels(locale: PublicLocale) {
  if (locale === 'sv') {
    return {
      label: 'Spara annons',
      savedLabel: 'Sparad',
      removeLabel: 'Ta bort sparad annons',
    }
  }
  if (locale === 'de' || locale === 'at') {
    return {
      label: 'Anzeige speichern',
      savedLabel: 'Gespeichert',
      removeLabel: 'Gespeicherte Anzeige entfernen',
    }
  }
  if (locale === 'en') {
    return {
      label: 'Save listing',
      savedLabel: 'Saved',
      removeLabel: 'Remove saved listing',
    }
  }
  return {
    label: translatePublic(locale, 'Save listing'),
    savedLabel: translatePublic(locale, 'Saved'),
    removeLabel: translatePublic(locale, 'Remove saved listing'),
  }
}

function isActiveWindow(status?: string | null, startedAt?: string | null, expiresAt?: string | null) {
  const now = Date.now()
  return status === 'active' &&
    Boolean(startedAt) &&
    Boolean(expiresAt) &&
    new Date(String(startedAt)).getTime() <= now &&
    new Date(String(expiresAt)).getTime() > now
}



