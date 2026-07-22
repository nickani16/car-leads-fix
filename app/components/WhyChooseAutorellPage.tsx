import Link from 'next/link'
import Image from 'next/image'
import { headers } from 'next/headers'
import type { Metadata } from 'next'
import PublicFooter from '@/app/components/PublicFooter'
import BenefitsAuthCta from '@/app/components/BenefitsAuthCta'
import BenefitsFaqTestimonials from '@/app/components/BenefitsFaqTestimonials'
import { getVanBenefitsCopy } from '@/app/components/VanBenefitsCopy'
import { getConstructionBenefitsCopy } from '@/app/components/ConstructionBenefitsCopy'
import { getHomeCopy, HomeSellerAudienceSection } from '@/app/components/BusinessMarketplaceHome'
import PublicHeader from '@/app/components/PublicHeader'
import {
  isPublicLanguage,
  localizePublicHref,
  type PublicLocale,
} from '@/lib/public-i18n'
import { cleanSeoText } from '@/lib/market-seo'

export type BenefitsCopy = {
  metaTitle: string
  metaDescription: string
  eyebrow: string
  title: string
  intro: string
  primaryCta: string
  secondaryCta: string
  proof: string
  listingEyebrow: string
  freeBadge: string
  listingFields: readonly string[]
  listingStats: readonly string[]
  stepsTitle: string
  steps: readonly { title: string; text: string }[]
  comparisonEyebrow: string
  comparisonHeaders: readonly [string, string, string]
  compareTitle: string
  compareIntro: string
  comparison: readonly { label: string; autorell: string; old: string }[]
  valueTitle: string
  values: readonly { title: string; text: string }[]
  seoTitle: string
  seoText: string
  faqTitle: string
  faqs: readonly { question: string; answer: string }[]
  dealerTitle: string
  dealerText: string
  dealerCta: string
  supportTitle: string
  supportText: string
  supportCta: string
}

type VehicleKind = 'car' | 'van' | 'construction'

const copyByLocale: Record<'en' | 'sv', BenefitsCopy> = {
  sv: {
    metaTitle: 'Varför sälja på Autorell | Gratis fordonsannonser i Europa',
    metaDescription:
      'Sälj bil, husbil, motorcykel, lastbil och andra fordon på Autorell. Skapa gratis annons, nå köpare i Europa och betala bara för längre publicering eller extra synlighet.',
    eyebrow: 'Sälj på Autorell',
    title: 'Sälj ditt fordon gratis och nå köpare i flera europeiska marknader.',
    intro:
      'Autorell är byggt för privatpersoner och företag som vill publicera tydliga fordonsannonser utan krångliga steg, dolda avgifter eller onödig friktion.',
    primaryCta: 'Skapa gratis annons',
    secondaryCta: 'Se priser',
    proof: 'Gratis grundannons i 5 dagar. Betala bara när du vill annonsera längre eller få mer synlighet.',
    listingEyebrow: 'Autorell-annons',
    freeBadge: 'Gratis',
    listingFields: ['Märke eller tillverkare', 'Modell', 'Version / variant', 'Årsmodell', 'Pris'],
    listingStats: ['Bilder', 'Marknad', 'Publicera'],
    stepsTitle: 'Tre enkla steg till en publicerad annons',
    steps: [
      {
        title: 'Fyll i fordonet',
        text: 'Lägg in kategori, märke, modell, pris, plats och bilder i ett flöde som fungerar på både mobil och desktop.',
      },
      {
        title: 'Publicera gratis',
        text: 'Grundannonsen publiceras kostnadsfritt. Vill du ligga ute längre väljer du ett betalt paket innan publicering.',
      },
      {
        title: 'Få seriösa kontakter',
        text: 'Köpare kan hitta annonsen via sök, kategori och marknad. Du håller själv kontroll på pris, text och kontakt.',
      },
    ],
    compareTitle: 'Autorell jämfört med traditionella annonssajter',
    comparisonEyebrow: 'Jämförelse',
    comparisonHeaders: ['Område', 'Autorell', 'Traditionellt'],
    compareIntro:
      'Skillnaden ska kännas i själva flödet: tydligare annonser, lokala marknader, rätt valuta och en modernare väg från publicering till kontakt.',
    comparison: [
      { label: 'Privat annons', autorell: 'Gratis start i 5 dagar', old: 'Avgift ofta direkt' },
      { label: 'Synlighet', autorell: 'Betala bara vid behov', old: 'Svårare att förstå vad du får' },
      { label: 'Marknader', autorell: 'Byggt för Europa', old: 'Ofta en lokal marknad först' },
      { label: 'Företag', autorell: 'Manuellt flöde eller CSV-import', old: 'Mindre lagerkontroll' },
      { label: 'Mobil', autorell: 'Skapat för snabb publicering', old: 'Ofta längre gamla flöden' },
    ],
    valueTitle: 'Gör varje försäljning tydligare',
    values: [
      {
        title: 'Värt pengarna',
        text: 'Du kan börja gratis och välja extra exponering först när annonsen behöver mer räckvidd.',
      },
      {
        title: 'Värt tiden',
        text: 'Annonsflödet samlar det viktigaste först så att du snabbare kommer till en komplett annons.',
      },
      {
        title: 'Värt förtroendet',
        text: 'Verifieringar, moderering och rapportering hjälper marknadsplatsen att kännas tryggare för både köpare och säljare.',
      },
    ],
    seoTitle: 'Byggt för att säljare ska kunna hittas',
    seoText:
      'Autorells sidor är strukturerade för fordonskategorier, marknader och tydliga sökintentioner. Det gör att säljare kan möta köpare som söker efter bil, husbil, motorcykel, transportbil, lastbil, lantbruk och entreprenad på rätt språk och marknad.',
    faqTitle: 'Vanliga frågor om att sälja på Autorell',
    faqs: [
      {
        question: 'Är det gratis att sälja fordon på Autorell?',
        answer:
          'Ja. Grundannonsen är gratis i 5 dagar. Du betalar bara om du väljer längre publicering eller extra synlighet.',
      },
      {
        question: 'Vilka fordon kan jag annonsera?',
        answer:
          'Du kan annonsera bilar, transportbilar, motorcyklar, husbilar, husvagnar, lastbilar, lantbruksmaskiner och entreprenadmaskiner.',
      },
      {
        question: 'Kan företag använda Autorell?',
        answer:
          'Ja. Företag kan skapa annonser manuellt direkt i Autorell eller importera många fordon via CSV när lagret är större.',
      },
      {
        question: 'Måste jag välja ett betalt paket?',
        answer:
          'Nej. Betalda paket är frivilliga och används när du vill ha längre annonstid eller mer synlighet.',
      },
      {
        question: 'Fungerar sidan i flera länder?',
        answer:
          'Ja. Autorell är byggt för flera europeiska marknader med lokala språk, valutor och marknadssidor.',
      },
    ],
    dealerTitle: 'Säljer du fordon professionellt?',
    dealerText:
      'Samla annonser, team och lagerkontroll i ett företagskonto. Publicera manuellt när det passar, eller importera större lager via CSV.',
    dealerCta: 'Kom igång som företag',
    supportTitle: 'Har du en annan fråga?',
    supportText: 'Vi hjälper dig med konto, annonser, företagspaket och publicering.',
    supportCta: 'Besök hjälpcenter',
  },
  en: {
    metaTitle: 'Why sell on Autorell | Free vehicle listings in Europe',
    metaDescription:
      'Sell cars, motorhomes, motorcycles, trucks and other vehicles on Autorell. Create a free listing, reach European buyers and pay only for longer publishing or extra visibility.',
    eyebrow: 'Sell on Autorell',
    title: 'Sell your vehicle for free and reach buyers across European markets.',
    intro:
      'Autorell is built for private sellers and companies that want clear vehicle listings without confusing steps, hidden fees or unnecessary friction.',
    primaryCta: 'Create free listing',
    secondaryCta: 'View pricing',
    proof: 'Free core listing for 5 days. Pay only when you want a longer listing or more visibility.',
    listingEyebrow: 'Autorell listing',
    freeBadge: 'Free',
    listingFields: ['Make or manufacturer', 'Model', 'Version / variant', 'Model year', 'Price'],
    listingStats: ['Images', 'Market', 'Publish'],
    stepsTitle: 'Three simple steps to a published listing',
    steps: [
      {
        title: 'Enter the vehicle',
        text: 'Add category, make, model, price, location and images in a flow that works on mobile and desktop.',
      },
      {
        title: 'Publish for free',
        text: 'The core listing is free. Choose a paid package only if you want the listing to stay online longer.',
      },
      {
        title: 'Get serious contacts',
        text: 'Buyers can find the listing through search, category and market pages while you stay in control.',
      },
    ],
    compareTitle: 'Autorell compared with traditional listing sites',
    comparisonEyebrow: 'Comparison',
    comparisonHeaders: ['Signal', 'Autorell', 'Traditional'],
    compareIntro:
      'The difference should be visible in the product: clearer listings, local markets, correct currency and a modern route from publishing to contact.',
    comparison: [
      { label: 'Private listing', autorell: 'Free start for 5 days', old: 'Fees often start early' },
      { label: 'Visibility', autorell: 'Pay only when needed', old: 'Harder to see what you get' },
      { label: 'Markets', autorell: 'Built for Europe', old: 'Often local first' },
      { label: 'Business', autorell: 'Manual flow or CSV import', old: 'Less inventory control' },
      { label: 'Mobile', autorell: 'Made for fast publishing', old: 'Often longer old flows' },
    ],
    valueTitle: 'Make every sale clearer',
    values: [
      {
        title: 'Worth the money',
        text: 'Start for free and choose extra exposure only when the listing needs more reach.',
      },
      {
        title: 'Worth your time',
        text: 'The listing flow collects the most important information first so you can publish faster.',
      },
      {
        title: 'Worth the trust',
        text: 'Verification, moderation and reporting help the marketplace feel safer for buyers and sellers.',
      },
    ],
    seoTitle: 'Built so sellers can be found',
    seoText:
      'Autorell pages are structured around vehicle categories, markets and clear search intent. That helps sellers meet buyers searching for cars, motorhomes, motorcycles, vans, trucks, agricultural machinery and construction machinery in the right language and market.',
    faqTitle: 'Sell on Autorell FAQs',
    faqs: [
      {
        question: 'Is it free to sell a vehicle on Autorell?',
        answer:
          'Yes. The core listing is free for 5 days. You only pay if you choose longer publishing or extra visibility.',
      },
      {
        question: 'Which vehicles can I list?',
        answer:
          'You can list cars, vans, motorcycles, motorhomes, caravans, trucks, agricultural machinery and construction machinery.',
      },
      {
        question: 'Can companies use Autorell?',
        answer:
          'Yes. Companies can create listings manually in Autorell or import many vehicles by CSV when the inventory is larger.',
      },
      {
        question: 'Do I have to choose a paid package?',
        answer:
          'No. Paid packages are optional and used when you want a longer listing period or more visibility.',
      },
      {
        question: 'Does Autorell work in multiple countries?',
        answer:
          'Yes. Autorell is built for several European markets with local languages, currencies and market pages.',
      },
    ],
    dealerTitle: 'Do you sell vehicles professionally?',
    dealerText:
      'Bring listings, team access and inventory control into one business account. Publish manually when it fits, or import larger stock by CSV.',
    dealerCta: 'Start as a company',
    supportTitle: 'Got another question?',
    supportText: 'We can help with accounts, listings, business plans and publishing.',
    supportCta: 'Visit help center',
  },
}

type SellCarSeo = {
  title: string
  description: string
  imageAlt: string
}

const sellCarSeoByLocale: Record<PublicLocale, SellCarSeo> = {
  sv: {
    title: 'Sälj bil gratis online',
    description: 'Skapa en gratis bilannons på några minuter och nå seriösa köpare online. Betala bara för längre publicering eller mer synlighet.',
    imageAlt: 'Sälj bil gratis online på Autorell',
  },
  en: {
    title: 'Sell your car online for free',
    description: 'Create a free car listing in minutes and reach buyers online. Pay only if you want a longer listing or extra visibility.',
    imageAlt: 'Sell your car free online on Autorell',
  },
  de: {
    title: 'Auto kostenlos online verkaufen',
    description: 'Erstelle in wenigen Minuten eine kostenlose Autoanzeige und erreiche Käufer online. Bezahle nur für längere Laufzeit oder mehr Sichtbarkeit.',
    imageAlt: 'Auto kostenlos online auf Autorell verkaufen',
  },
  at: {
    title: 'Auto kostenlos online verkaufen',
    description: 'Erstelle eine kostenlose Autoanzeige und erreiche Käufer in Österreich online. Bezahle nur für längere Laufzeit oder mehr Sichtbarkeit.',
    imageAlt: 'Auto in Österreich kostenlos auf Autorell verkaufen',
  },
  fr: {
    title: 'Vendre sa voiture gratuitement en ligne',
    description: 'Créez une annonce auto gratuite en quelques minutes et touchez des acheteurs en ligne. Payez seulement pour plus de durée ou de visibilité.',
    imageAlt: 'Vendre sa voiture gratuitement en ligne sur Autorell',
  },
  be: {
    title: 'Vendre sa voiture en ligne gratuitement',
    description: 'Créez une annonce auto gratuite et trouvez des acheteurs en Belgique. Payez seulement pour prolonger l’annonce ou gagner en visibilité.',
    imageAlt: 'Vendre sa voiture gratuitement en Belgique sur Autorell',
  },
  es: {
    title: 'Vende tu coche gratis online',
    description: 'Crea un anuncio de coche gratis en minutos y llega a compradores online. Paga solo si quieres más tiempo o visibilidad.',
    imageAlt: 'Vender coche gratis online en Autorell',
  },
  it: {
    title: 'Vendi auto gratis online',
    description: 'Crea un annuncio auto gratis in pochi minuti e raggiungi acquirenti online. Paghi solo per più durata o maggiore visibilità.',
    imageAlt: 'Vendere auto gratis online su Autorell',
  },
  nl: {
    title: 'Auto gratis online verkopen',
    description: 'Plaats gratis een auto online in enkele minuten en bereik serieuze kopers. Betaal alleen voor langere looptijd of extra zichtbaarheid.',
    imageAlt: 'Auto gratis online verkopen op Autorell',
  },
  pl: {
    title: 'Sprzedaj auto za darmo online',
    description: 'Dodaj darmowe ogłoszenie auta w kilka minut i dotrzyj do kupujących online. Płacisz tylko za dłuższą emisję lub większą widoczność.',
    imageAlt: 'Sprzedaj auto za darmo online w Autorell',
  },
  da: {
    title: 'Sælg bil gratis online',
    description: 'Opret en gratis bilannonce på få minutter og nå seriøse købere online. Betal kun for længere visning eller ekstra synlighed.',
    imageAlt: 'Sælg din bil gratis online på Autorell',
  },
  fi: {
    title: 'Myy auto ilmaiseksi verkossa',
    description: 'Luo ilmainen autoilmoitus muutamassa minuutissa ja tavoita ostajat verkossa. Maksa vain pidemmästä julkaisusta tai näkyvyydestä.',
    imageAlt: 'Myy auto ilmaiseksi verkossa Autorellissa',
  },
}

const sellVanSeoByLocale: Record<PublicLocale, SellCarSeo> = {
  sv: { title: 'Sälj transportbil gratis online', description: 'Annonsera din transportbil gratis online och nå köpare som söker arbetsfordon. Lägg upp bilder, pris och plats på några minuter.', imageAlt: 'Sälj transportbil gratis online på Autorell' },
  en: { title: 'Sell your van online for free', description: 'List your van for free online and reach buyers looking for work vehicles. Add photos, price and location in minutes.', imageAlt: 'Sell your van free online on Autorell' },
  de: { title: 'Transporter kostenlos online verkaufen', description: 'Inseriere deinen Transporter kostenlos online und erreiche Käufer für Nutzfahrzeuge. Fotos, Preis und Standort schnell hinzufügen.', imageAlt: 'Transporter kostenlos online auf Autorell verkaufen' },
  at: { title: 'Transporter kostenlos online verkaufen', description: 'Inseriere deinen Transporter kostenlos online und erreiche Käufer in Österreich. Fotos, Preis und Standort schnell hinzufügen.', imageAlt: 'Transporter in Österreich kostenlos verkaufen' },
  fr: { title: 'Vendre un utilitaire gratuitement en ligne', description: 'Publiez votre utilitaire gratuitement en ligne et trouvez des acheteurs de véhicules pro. Ajoutez photos, prix et lieu en quelques minutes.', imageAlt: 'Vendre son utilitaire gratuitement sur Autorell' },
  be: { title: 'Vendre un utilitaire en ligne gratuitement', description: 'Publiez votre utilitaire gratuitement en Belgique et trouvez des acheteurs pro. Ajoutez photos, prix et lieu en quelques minutes.', imageAlt: 'Vendre son utilitaire gratuitement en Belgique' },
  es: { title: 'Vende tu furgoneta gratis online', description: 'Anuncia tu furgoneta gratis online y llega a compradores de vehículos comerciales. Añade fotos, precio y ubicación en minutos.', imageAlt: 'Vender furgoneta gratis online en Autorell' },
  it: { title: 'Vendi furgone gratis online', description: 'Pubblica gratis il tuo furgone online e raggiungi acquirenti di veicoli commerciali. Aggiungi foto, prezzo e luogo in pochi minuti.', imageAlt: 'Vendere furgone gratis online su Autorell' },
  nl: { title: 'Bestelwagen gratis online verkopen', description: 'Plaats je bestelwagen gratis online en bereik kopers van bedrijfswagens. Voeg foto’s, prijs en locatie toe in enkele minuten.', imageAlt: 'Bestelwagen gratis online verkopen op Autorell' },
  pl: { title: 'Sprzedaj vana za darmo online', description: 'Wystaw vana za darmo online i dotrzyj do kupujących pojazdy użytkowe. Dodaj zdjęcia, cenę i lokalizację w kilka minut.', imageAlt: 'Sprzedaj vana za darmo online w Autorell' },
  da: { title: 'Sælg varebil gratis online', description: 'Sæt din varebil gratis til salg online og nå købere af erhvervskøretøjer. Tilføj billeder, pris og placering på få minutter.', imageAlt: 'Sælg varebil gratis online på Autorell' },
  fi: { title: 'Myy pakettiauto ilmaiseksi verkossa', description: 'Ilmoita pakettiauto ilmaiseksi verkossa ja tavoita hyötyajoneuvojen ostajat. Lisää kuvat, hinta ja sijainti muutamassa minuutissa.', imageAlt: 'Myy pakettiauto ilmaiseksi verkossa Autorellissa' },
}

const sellConstructionSeoByLocale: Record<PublicLocale, SellCarSeo> = {
  sv: { title: 'Sälj entreprenadmaskin gratis online', description: 'Sälj grävmaskiner, hjullastare och andra entreprenadmaskiner gratis online. Skapa annonsen snabbt och nå rätt köpare.', imageAlt: 'Sälj entreprenadmaskiner gratis online på Autorell' },
  en: { title: 'Sell construction machinery for free', description: 'Sell excavators, wheel loaders and other construction machinery online for free. Create a clear listing and reach the right buyers.', imageAlt: 'Sell construction machinery free online on Autorell' },
  de: { title: 'Baumaschine kostenlos online verkaufen', description: 'Verkaufe Bagger, Radlader und andere Baumaschinen kostenlos online. Erstelle schnell eine klare Anzeige und erreiche passende Käufer.', imageAlt: 'Baumaschinen kostenlos online auf Autorell verkaufen' },
  at: { title: 'Baumaschine kostenlos online verkaufen', description: 'Verkaufe Bagger, Radlader und andere Baumaschinen in Österreich online. Erstelle schnell eine klare Anzeige und erreiche Käufer.', imageAlt: 'Baumaschinen in Österreich kostenlos verkaufen' },
  fr: { title: 'Vendre une machine BTP en ligne', description: 'Vendez pelle, chargeuse et autres machines BTP gratuitement en ligne. Créez une annonce claire et touchez les bons acheteurs.', imageAlt: 'Vendre des engins de chantier gratuitement sur Autorell' },
  be: { title: 'Vendre une machine BTP en Belgique', description: 'Vendez pelle, chargeuse et machines BTP en Belgique. Créez une annonce claire en ligne et touchez les bons acheteurs.', imageAlt: 'Vendre des engins de chantier gratuitement sur Autorell' },
  es: { title: 'Vende maquinaria de obra online', description: 'Vende excavadoras, cargadoras y otra maquinaria de obra gratis online. Crea un anuncio claro y llega a los compradores adecuados.', imageAlt: 'Vender maquinaria de construcción gratis en Autorell' },
  it: { title: 'Vendi macchine edili online', description: 'Vendi escavatori, pale gommate e altre macchine edili gratis online. Crea un annuncio chiaro e trova gli acquirenti giusti.', imageAlt: 'Vendere macchine edili gratis su Autorell' },
  nl: { title: 'Bouwmachine gratis online verkopen', description: 'Verkoop graafmachines, wielladers en andere bouwmachines gratis online. Maak snel een duidelijke advertentie en bereik kopers.', imageAlt: 'Bouwmachines gratis online verkopen op Autorell' },
  pl: { title: 'Sprzedaj maszynę budowlaną online', description: 'Sprzedaj koparki, ładowarki i inne maszyny budowlane online za darmo. Szybko utwórz ogłoszenie i dotrzyj do kupujących.', imageAlt: 'Sprzedaj maszyny budowlane za darmo w Autorell' },
  da: { title: 'Sælg entreprenørmaskine gratis online', description: 'Sælg gravemaskiner, læssemaskiner og andre entreprenørmaskiner gratis online. Opret annoncen hurtigt og nå de rette købere.', imageAlt: 'Sælg entreprenørmaskiner gratis online på Autorell' },
  fi: { title: 'Myy rakennuskone ilmaiseksi verkossa', description: 'Myy kaivinkoneet, kuormaajat ja muut rakennuskoneet ilmaiseksi verkossa. Luo selkeä ilmoitus nopeasti ja tavoita ostajat.', imageAlt: 'Myy rakennuskoneet ilmaiseksi Autorellissa' },
}

const sellSeoOverridesByVehicleKind: Record<VehicleKind, Record<PublicLocale, SellCarSeo>> = {
  car: {
    sv: { title: 'Sälj bil gratis online och hitta rätt köpare', description: 'Skapa en gratis bilannons på några minuter och nå seriösa köpare online. Betala bara för längre publicering eller mer synlighet.', imageAlt: 'Sälj bil gratis online på Autorell' },
    en: { title: 'Sell your car online for free and find buyers', description: 'Create a free car listing in minutes and reach buyers online. Pay only if you want a longer listing or extra visibility.', imageAlt: 'Sell your car free online on Autorell' },
    de: { title: 'Auto kostenlos online verkaufen und Käufer finden', description: 'Erstelle eine kostenlose Autoanzeige in wenigen Minuten und erreiche Käufer online. Bezahle nur für längere Laufzeit oder mehr Sichtbarkeit.', imageAlt: 'Auto kostenlos online auf Autorell verkaufen' },
    at: { title: 'Auto kostenlos online verkaufen in Österreich', description: 'Erstelle eine kostenlose Autoanzeige und erreiche Käufer in Österreich online. Bezahle nur für längere Laufzeit oder mehr Sichtbarkeit.', imageAlt: 'Auto in Österreich kostenlos auf Autorell verkaufen' },
    fr: { title: 'Vendre sa voiture en ligne gratuitement', description: 'Créez une annonce auto gratuite en quelques minutes et touchez des acheteurs en ligne. Payez seulement pour plus de durée ou de visibilité.', imageAlt: 'Vendre sa voiture gratuitement en ligne sur Autorell' },
    be: { title: 'Vendre sa voiture en Belgique gratuitement', description: 'Créez une annonce auto gratuite et trouvez des acheteurs en Belgique. Payez seulement pour prolonger l’annonce ou gagner en visibilité.', imageAlt: 'Vendre sa voiture gratuitement en Belgique sur Autorell' },
    es: { title: 'Vende tu coche gratis online y encuentra comprador', description: 'Crea un anuncio de coche gratis en minutos y llega a compradores online. Paga solo si quieres más tiempo o visibilidad.', imageAlt: 'Vender coche gratis online en Autorell' },
    it: { title: 'Vendi auto gratis online e trova acquirenti', description: 'Crea un annuncio auto gratis in pochi minuti e raggiungi acquirenti online. Paghi solo per più durata o maggiore visibilità.', imageAlt: 'Vendere auto gratis online su Autorell' },
    nl: { title: 'Auto gratis online verkopen en kopers vinden', description: 'Plaats gratis een auto online in enkele minuten en bereik serieuze kopers. Betaal alleen voor langere looptijd of extra zichtbaarheid.', imageAlt: 'Auto gratis online verkopen op Autorell' },
    pl: { title: 'Sprzedaj auto za darmo online i znajdź kupca', description: 'Dodaj darmowe ogłoszenie auta w kilka minut i dotrzyj do kupujących online. Płacisz tylko za dłuższą emisję lub większą widoczność.', imageAlt: 'Sprzedaj auto za darmo online w Autorell' },
    da: { title: 'Sælg bil gratis online og find købere', description: 'Opret en gratis bilannonce på få minutter og nå seriøse købere online. Betal kun for længere visning eller ekstra synlighed.', imageAlt: 'Sælg din bil gratis online på Autorell' },
    fi: { title: 'Myy auto ilmaiseksi verkossa ja löydä ostaja', description: 'Luo ilmainen autoilmoitus muutamassa minuutissa ja tavoita ostajat verkossa. Maksa vain pidemmästä julkaisusta tai näkyvyydestä.', imageAlt: 'Myy auto ilmaiseksi verkossa Autorellissa' },
  },
  van: {
    sv: { title: 'Sälj transportbil gratis online och hitta köpare', description: 'Annonsera din transportbil gratis online och nå köpare som söker arbetsfordon. Lägg upp bilder, pris och plats på några minuter.', imageAlt: 'Sälj transportbil gratis online på Autorell' },
    en: { title: 'Sell your van online for free and find buyers', description: 'List your van for free online and reach buyers looking for work vehicles. Add photos, price and location in minutes.', imageAlt: 'Sell your van free online on Autorell' },
    de: { title: 'Transporter kostenlos online verkaufen', description: 'Inseriere deinen Transporter kostenlos online und erreiche Käufer für Nutzfahrzeuge. Fotos, Preis und Standort schnell hinzufügen.', imageAlt: 'Transporter kostenlos online auf Autorell verkaufen' },
    at: { title: 'Transporter kostenlos verkaufen in Österreich', description: 'Inseriere deinen Transporter kostenlos online und erreiche Käufer in Österreich. Fotos, Preis und Standort schnell hinzufügen.', imageAlt: 'Transporter in Österreich kostenlos verkaufen' },
    fr: { title: 'Vendre un utilitaire gratuitement en ligne', description: 'Publiez votre utilitaire gratuitement en ligne et trouvez des acheteurs de véhicules pro. Ajoutez photos, prix et lieu en quelques minutes.', imageAlt: 'Vendre son utilitaire gratuitement sur Autorell' },
    be: { title: 'Vendre un utilitaire en Belgique', description: 'Publiez votre utilitaire gratuitement en Belgique et trouvez des acheteurs pro. Ajoutez photos, prix et lieu en quelques minutes.', imageAlt: 'Vendre son utilitaire gratuitement en Belgique' },
    es: { title: 'Vende tu furgoneta gratis online', description: 'Anuncia tu furgoneta gratis online y llega a compradores de vehículos comerciales. Añade fotos, precio y ubicación en minutos.', imageAlt: 'Vender furgoneta gratis online en Autorell' },
    it: { title: 'Vendi furgone gratis online', description: 'Pubblica gratis il tuo furgone online e raggiungi acquirenti di veicoli commerciali. Aggiungi foto, prezzo e luogo in pochi minuti.', imageAlt: 'Vendere furgone gratis online su Autorell' },
    nl: { title: 'Bestelwagen gratis online verkopen', description: 'Plaats je bestelwagen gratis online en bereik kopers van bedrijfswagens. Voeg foto’s, prijs en locatie toe in enkele minuten.', imageAlt: 'Bestelwagen gratis online verkopen op Autorell' },
    pl: { title: 'Sprzedaj vana za darmo online', description: 'Wystaw vana za darmo online i dotrzyj do kupujących pojazdy użytkowe. Dodaj zdjęcia, cenę i lokalizację w kilka minut.', imageAlt: 'Sprzedaj vana za darmo online w Autorell' },
    da: { title: 'Sælg varebil gratis online', description: 'Sæt din varebil gratis til salg online og nå købere af erhvervskøretøjer. Tilføj billeder, pris og placering på få minutter.', imageAlt: 'Sælg varebil gratis online på Autorell' },
    fi: { title: 'Myy pakettiauto ilmaiseksi verkossa', description: 'Ilmoita pakettiauto ilmaiseksi verkossa ja tavoita hyötyajoneuvojen ostajat. Lisää kuvat, hinta ja sijainti muutamassa minuutissa.', imageAlt: 'Myy pakettiauto ilmaiseksi Autorellissa' },
  },
  construction: {
    sv: { title: 'Sälj entreprenadmaskin gratis online', description: 'Sälj grävmaskiner, hjullastare och andra entreprenadmaskiner gratis online. Skapa annonsen snabbt och nå rätt köpare.', imageAlt: 'Sälj entreprenadmaskin gratis online på Autorell' },
    en: { title: 'Sell construction machinery online for free', description: 'Sell excavators, wheel loaders and other construction machinery online for free. Create a clear listing and reach the right buyers.', imageAlt: 'Sell construction machinery free online on Autorell' },
    de: { title: 'Baumaschine kostenlos online verkaufen', description: 'Verkaufe Bagger, Radlader und andere Baumaschinen kostenlos online. Erstelle schnell eine klare Anzeige und erreiche passende Käufer.', imageAlt: 'Baumaschine kostenlos online auf Autorell verkaufen' },
    at: { title: 'Baumaschine kostenlos verkaufen in Österreich', description: 'Verkaufe Bagger, Radlader und andere Baumaschinen in Österreich online. Erstelle schnell eine klare Anzeige und erreiche Käufer.', imageAlt: 'Baumaschine kostenlos in Österreich verkaufen' },
    fr: { title: 'Vendre une machine BTP gratuitement en ligne', description: 'Vendez pelle, chargeuse et autres machines BTP gratuitement en ligne. Créez une annonce claire et touchez les bons acheteurs.', imageAlt: 'Vendre machine BTP gratuitement sur Autorell' },
    be: { title: 'Vendre une machine BTP en Belgique', description: 'Vendez pelle, chargeuse et machines BTP en Belgique. Créez une annonce claire en ligne et touchez les bons acheteurs.', imageAlt: 'Vendre machine BTP gratuitement en Belgique' },
    es: { title: 'Vende maquinaria de obra gratis online', description: 'Vende excavadoras, cargadoras y otra maquinaria de obra gratis online. Crea un anuncio claro y llega a los compradores adecuados.', imageAlt: 'Vender maquinaria de obra gratis en Autorell' },
    it: { title: 'Vendi macchine edili gratis online', description: 'Vendi escavatori, pale gommate e altre macchine edili gratis online. Crea un annuncio chiaro e trova gli acquirenti giusti.', imageAlt: 'Vendere macchine edili gratis su Autorell' },
    nl: { title: 'Bouwmachine gratis online verkopen', description: 'Verkoop graafmachines, wielladers en andere bouwmachines gratis online. Maak snel een duidelijke advertentie en bereik kopers.', imageAlt: 'Bouwmachine gratis online verkopen op Autorell' },
    pl: { title: 'Sprzedaj maszynę budowlaną online', description: 'Sprzedaj koparki, ładowarki i inne maszyny budowlane online za darmo. Szybko utwórz ogłoszenie i dotrzyj do kupujących.', imageAlt: 'Sprzedaj maszynę budowlaną w Autorell' },
    da: { title: 'Sælg entreprenørmaskine gratis online', description: 'Sælg gravemaskiner, læssemaskiner og andre entreprenørmaskiner gratis online. Opret annoncen hurtigt og nå de rette købere.', imageAlt: 'Sælg entreprenørmaskine gratis på Autorell' },
    fi: { title: 'Myy rakennuskone ilmaiseksi verkossa', description: 'Myy kaivinkoneet, kuormaajat ja muut rakennuskoneet ilmaiseksi verkossa. Luo selkeä ilmoitus nopeasti ja tavoita ostajat.', imageAlt: 'Myy rakennuskone ilmaiseksi Autorellissa' },
  },
}

export async function generateWhyChooseAutorellMetadata(
  localeOrProps?: PublicLocale | unknown,
  vehicleKindOrParent?: VehicleKind | unknown,
): Promise<Metadata> {
  const localeOverride = typeof localeOrProps === 'string' ? localeOrProps as PublicLocale : undefined
  const vehicleKind = vehicleKindOrParent === 'van' || vehicleKindOrParent === 'construction' ? vehicleKindOrParent : 'car'
  return buildWhyChooseAutorellMetadata(localeOverride, undefined, vehicleKind)
}

export async function generateWhyChooseAutorellMetadataForMarket(
  locale: PublicLocale,
  marketCode: string,
  vehicleKind: VehicleKind = 'car',
): Promise<Metadata> {
  return buildWhyChooseAutorellMetadata(locale, marketCode, vehicleKind)
}

async function buildWhyChooseAutorellMetadata(
  localeOverride?: PublicLocale,
  marketCodeOverride?: string,
  vehicleKind: VehicleKind = 'car',
): Promise<Metadata> {
  const headerStore = await headers()
  const locale = localeOverride || getRequestedLocale(headerStore)
  const marketCode = marketCodeOverride || headerStore.get('x-autorell-market') || marketCodeForLocale(locale)
  const seoLocale = marketCode === 'AT' ? 'at' : marketCode === 'BE' ? 'be' : locale
  const seoMap = vehicleKind === 'van' ? sellVanSeoByLocale : vehicleKind === 'construction' ? sellConstructionSeoByLocale : sellCarSeoByLocale
  const pagePath = vehicleKind === 'van' ? '/sell-van' : vehicleKind === 'construction' ? '/sell-construction' : '/sell-car'
  const productionSeoByKind: Record<VehicleKind, Partial<Record<PublicLocale, SellCarSeo>>> = {
    car: {
      sv: {
        title: 'Sälj bil gratis online | Autorells fordonsmarknad',
        description: 'Annonsera din bil gratis i 5 dagar på Autorell. Nå köpare i Sverige och Europa med en tydlig bilannons på rätt språk och marknad.',
        imageAlt: 'Sälj bil gratis online på Autorell',
      },
    },
    van: {
      sv: {
        title: 'Sälj transportbil gratis online | Autorell',
        description: 'Annonsera din transportbil gratis i 5 dagar på Autorell och nå köpare i Sverige och Europa med en tydlig annons.',
        imageAlt: 'Sälj transportbil gratis online på Autorell',
      },
    },
    construction: {
      sv: {
        title: getConstructionBenefitsCopy('sv').metaTitle,
        description: 'Annonsera grävmaskin, hjullastare eller annan entreprenadmaskin gratis i 5 dagar på Autorell och nå rätt köpare.',
        imageAlt: 'Sälj entreprenadmaskiner gratis online på Autorell',
      },
    },
  }
  const seo = productionSeoByKind[vehicleKind][seoLocale] || sellSeoOverridesByVehicleKind[vehicleKind][seoLocale] || seoMap[seoLocale] || seoMap.en
  const canonical = `https://www.autorell.com${localizePublicHref(locale, pagePath)}`
  const title = cleanSeoText(seo.title, 67)
  const description = cleanSeoText(seo.description, 155)
  const imageUrl = 'https://www.autorell.com/sell-car-og.jpg'

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: seo.imageAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  }
}

export default async function WhyChooseAutorellPage({
  localeOverride,
  marketCodeOverride,
  vehicleKind = 'car',
}: {
  localeOverride?: PublicLocale
  marketCodeOverride?: string
  vehicleKind?: VehicleKind
}) {
  const headerStore = await headers()
  const locale = localeOverride || getRequestedLocale(headerStore)
  const marketCode = marketCodeOverride || headerStore.get('x-autorell-market') || marketCodeForLocale(locale)
  const copy = (vehicleKind === 'van'
    ? { ...getBenefitsCopy(locale), ...getVanBenefitsCopy(locale) }
    : vehicleKind === 'construction'
      ? { ...getBenefitsCopy(locale), ...getConstructionBenefitsCopy(locale) }
      : getBenefitsCopy(locale)) as BenefitsCopy
  const stepImages = vehicleKind === 'van'
    ? ['/sell-van-step-1.png', '/sell-van-step-2.png', '/sell-van-step-3.png']
    : vehicleKind === 'construction'
      ? ['/sell-construction-step-create-v2.png', '/sell-construction-step-photo-v2.png', '/sell-construction-step-contact-v2.png']
      : ['/sell-car-step-listing-real.png', '/sell-car-step-photo-real.png', '/sell-car-step-contact.png']
  const heroLeftImage = vehicleKind === 'van' ? '/sell-van-black.webp' : vehicleKind === 'construction' ? '/sell-construction-hero-excavator-cropped.png' : '/sell-car-light.webp'
  const heroRightImage = vehicleKind === 'van' ? '/sell-van-yellow.webp' : vehicleKind === 'construction' ? '/sell-construction-hero-loader-cropped.png' : '/sell-car-red.webp'
  const mediaLabels: Record<VehicleKind, Record<string, { eyebrow: string; title: string }>> = {
    car: {
      sv: { eyebrow: 'Skapa din annons', title: 'Lägg in fordonsuppgifterna och nå köpare' }, en: { eyebrow: 'Create your listing', title: 'Add vehicle details and reach buyers' }, de: { eyebrow: 'Anzeige erstellen', title: 'Fahrzeugdaten eintragen und Käufer erreichen' }, fr: { eyebrow: 'Créer votre annonce', title: 'Ajoutez les données du véhicule et touchez des acheteurs' }, es: { eyebrow: 'Crea tu anuncio', title: 'Añade los datos del vehículo y llega a compradores' }, it: { eyebrow: 'Crea il tuo annuncio', title: 'Inserisci i dati dell’auto e raggiungi gli acquirenti' }, nl: { eyebrow: 'Maak je advertentie', title: 'Voeg voertuiggegevens toe en bereik kopers' }, pl: { eyebrow: 'Utwórz ogłoszenie', title: 'Dodaj dane pojazdu i dotrzyj do kupujących' }, da: { eyebrow: 'Opret din annonce', title: 'Tilføj bildata og nå købere' }, fi: { eyebrow: 'Luo ilmoitus', title: 'Lisää ajoneuvon tiedot ja tavoita ostajat' }, at: { eyebrow: 'Anzeige erstellen', title: 'Fahrzeugdaten eintragen und Käufer erreichen' }, be: { eyebrow: 'Maak je advertentie', title: 'Voeg voertuiggegevens toe en bereik kopers' },
    },
    van: {
      sv: { eyebrow: 'Skapa transportbilsannonsen', title: 'Lägg in transportbilens uppgifter och nå rätt köpare' }, en: { eyebrow: 'Create your van listing', title: 'Add van details and reach the right buyers' }, de: { eyebrow: 'Transporter inserieren', title: 'Daten ergänzen und passende Käufer erreichen' }, fr: { eyebrow: 'Créer votre annonce utilitaire', title: 'Ajoutez les données et touchez les bons acheteurs' }, es: { eyebrow: 'Crea tu anuncio de furgoneta', title: 'Añade los datos y llega a los compradores adecuados' }, it: { eyebrow: 'Crea l’annuncio del furgone', title: 'Inserisci i dati e raggiungi gli acquirenti giusti' }, nl: { eyebrow: 'Maak je bestelwagenadvertentie', title: 'Voeg gegevens toe en bereik de juiste kopers' }, pl: { eyebrow: 'Utwórz ogłoszenie dostawczaka', title: 'Dodaj dane i dotrzyj do właściwych kupujących' }, da: { eyebrow: 'Opret varebilsannonce', title: 'Tilføj data og nå de rigtige købere' }, fi: { eyebrow: 'Luo pakettiautoilmoitus', title: 'Lisää tiedot ja tavoita oikeat ostajat' }, at: { eyebrow: 'Transporter inserieren', title: 'Daten ergänzen und passende Käufer erreichen' }, be: { eyebrow: 'Maak je bestelwagenadvertentie', title: 'Voeg gegevens toe en bereik de juiste kopers' },
    },
    construction: {
      sv: { eyebrow: 'Skapa maskinannonsen', title: 'Lägg in maskinens uppgifter och nå rätt köpare' }, en: { eyebrow: 'Create your machinery listing', title: 'Add machine details and reach the right buyers' }, de: { eyebrow: 'Maschine inserieren', title: 'Maschinendaten ergänzen und Käufer erreichen' }, fr: { eyebrow: 'Créer votre annonce de machine', title: 'Ajoutez les données et touchez les bons acheteurs' }, es: { eyebrow: 'Crea tu anuncio de maquinaria', title: 'Añade los datos y llega a los compradores adecuados' }, it: { eyebrow: 'Crea l’annuncio della macchina', title: 'Inserisci i dati e raggiungi gli acquirenti giusti' }, nl: { eyebrow: 'Maak je machineadvertentie', title: 'Voeg machinegegevens toe en bereik kopers' }, pl: { eyebrow: 'Utwórz ogłoszenie maszyny', title: 'Dodaj dane i dotrzyj do kupujących' }, da: { eyebrow: 'Opret maskinannonce', title: 'Tilføj maskindata og nå købere' }, fi: { eyebrow: 'Luo koneilmoitus', title: 'Lisää konetiedot ja tavoita ostajat' }, at: { eyebrow: 'Maschine inserieren', title: 'Maschinendaten ergänzen und Käufer erreichen' }, be: { eyebrow: 'Maak je machineadvertentie', title: 'Voeg machinegegevens toe en bereik kopers' },
    },
  }
  const mediaLabel = mediaLabels[vehicleKind]?.[locale] ?? mediaLabels[vehicleKind].en

  return (
    <main className="w-full overflow-x-hidden bg-[#f5f7fb] text-[#101828]">
      <PublicHeader locale={locale} marketCode={marketCode} />

      <section className="relative overflow-hidden bg-[#dcecf8]">
        <div className="relative mx-auto flex min-h-[520px] max-w-[var(--autorell-page-max)] items-center justify-center px-5 py-12 sm:min-h-[590px] sm:px-8 sm:py-14 lg:min-h-[600px] lg:py-12">
            <Image
              src={heroLeftImage}
              alt=""
              width={vehicleKind === 'construction' ? 889 : 1200}
              height={vehicleKind === 'construction' ? 776 : 600}
              priority
              aria-hidden="true"
              className={`pointer-events-none absolute z-0 hidden max-w-none object-contain sm:block ${
                vehicleKind === 'construction'
                  ? 'bottom-0 left-[-35px] lg:left-[-25px] lg:w-[min(25vw,380px)] 2xl:left-[-190px]'
                  : 'bottom-0 left-[-70px] lg:left-[-45px] lg:w-[min(30vw,500px)] 2xl:left-[-215px]'
              }`}
            />
            <Image
              src={heroRightImage}
              alt=""
              width={vehicleKind === 'construction' ? 1332 : 1200}
              height={vehicleKind === 'construction' ? 640 : 600}
              priority
              aria-hidden="true"
              className={`pointer-events-none absolute z-0 hidden max-w-none object-contain sm:block ${
                vehicleKind === 'construction'
                  ? 'bottom-0 right-[-55px] lg:right-[-35px] lg:w-[min(32vw,500px)] 2xl:right-[-190px]'
                  : 'bottom-0 right-[-100px] lg:right-[-55px] lg:w-[min(36vw,580px)] 2xl:right-[-215px]'
              }`}
            />
          <div className="relative z-10 mx-auto flex w-full max-w-[760px] flex-col items-center text-center">
            <p className="text-xs font-semibold uppercase tracking-[.22em] text-[#0866ff]">{copy.eyebrow}</p>
            <h1 className="mt-5 max-w-[16ch] text-[clamp(2.6rem,6vw,4.5rem)] font-semibold leading-[.98] tracking-[-.05em] text-[#101828]">
              {copy.title}
            </h1>
            <p className="mt-6 max-w-[46ch] text-base leading-7 text-[#526071] sm:mt-7">
              {copy.intro}
            </p>
            <div className="mt-7 sm:mt-9">
              <BenefitsAuthCta label={copy.primaryCta} destination={localizePublicHref(locale, '/account/listings/new')} />
            </div>
            <p className="relative z-10 mt-5 max-w-[46ch] px-3 text-center text-sm leading-6 text-[#667085]">{copy.proof}</p>
          </div>
        </div>
      </section>

      <section className="hidden">
        <div className="mx-auto grid min-h-[620px] max-w-[var(--autorell-page-max)] items-center gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,.78fr)] lg:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.22em] text-[#0866ff]">{locale === 'sv' ? 'Sälj på Autorell' : 'Sell on Autorell'}</p>
            <h1 className="mt-7 max-w-4xl text-[52px] font-semibold leading-[.94] tracking-[-.055em] text-[#101828] sm:text-[78px] lg:text-[96px]">
              {locale === 'sv' ? 'Sälj din bil gratis' : 'Sell my car for free'}
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-[#526071]">
              {locale === 'sv'
                ? 'Skapa en tydlig annons på några minuter och visa bilen för köpare på Autorells europeiska marknader.'
                : 'Create a clear listing in a few minutes and show your car to buyers across Autorell’s European markets.'}
            </p>
            <div className="mt-9">
              <BenefitsAuthCta
                label={locale === 'sv' ? 'Kom igång gratis' : 'Get started for free'}
                destination={localizePublicHref(locale, '/account/listings/new')}
              />
            </div>
            <p className="mt-5 max-w-xl text-sm leading-6 text-[#667085]">
              {locale === 'sv' ? 'Grundannonsen är gratis i 5 dagar. Betala bara om du vill ligga ute längre eller få extra synlighet.' : 'Your core listing is free for 5 days. Pay only if you want to stay online longer or add visibility.'}
            </p>
          </div>
          <div className="overflow-hidden rounded-[10px] border border-[#cbd8ea] bg-white shadow-[0_24px_80px_rgba(16,24,40,.08)]">
            <div className="border-b border-[#dce6f3] bg-[#f8fbff] px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#0866ff]">{locale === 'sv' ? 'En enkel start' : 'A simple start'}</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-.04em]">{locale === 'sv' ? 'Från annons till kontakt' : 'From listing to contact'}</h2>
            </div>
            {[
              locale === 'sv' ? 'Skapa din annons' : 'Create your listing',
              locale === 'sv' ? 'Visa bilen i Europa' : 'Show your car across Europe',
              locale === 'sv' ? 'Betala bara vid behov' : 'Pay only when needed',
            ].map((label, index) => (
              <div key={label} className="flex items-center gap-4 border-b border-[#edf2f7] px-6 py-5 last:border-b-0">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#0866ff] text-sm font-semibold text-white">{index + 1}</span>
                <span className="text-base font-medium text-[#101828]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-[#cddcf2]" />
        <div className="mx-auto grid min-h-[680px] max-w-[var(--autorell-page-max)] items-center gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,.78fr)] lg:py-20">
          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-[.22em] text-[#0866ff]">{copy.eyebrow}</p>
            <h1 className="mt-7 max-w-5xl text-[44px] font-semibold leading-[.94] tracking-[-.055em] text-[#101828] sm:text-[78px] lg:text-[92px]">
              {copy.title}
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-[#526071]">{copy.intro}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={localizePublicHref(locale, '/account/listings/new')}
                className="group inline-flex min-h-12 items-center justify-center rounded-[7px] bg-[#0866ff] px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#075ce5]"
              >
                {copy.primaryCta}
                <span className="ml-3 transition group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href={localizePublicHref(locale, '/pricing')}
                className="inline-flex min-h-12 items-center justify-center rounded-[7px] border border-[#cbd8ea] bg-white px-5 text-sm font-semibold text-[#101828] transition hover:-translate-y-0.5 hover:border-[#0866ff] hover:text-[#0866ff]"
              >
                {copy.secondaryCta}
              </Link>
            </div>
            <p className="mt-5 max-w-xl text-sm leading-6 text-[#667085]">{copy.proof}</p>
          </div>

          <div className="relative z-10 rounded-[10px] border border-[#cbd8ea] bg-white p-4 shadow-[0_24px_80px_rgba(16,24,40,.08)] sm:p-5">
            <div className="rounded-[8px] border border-[#dce6f3] bg-[#f8fbff] p-4">
              <div className="flex items-center justify-between border-b border-[#dce6f3] pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#0866ff]">{copy.listingEyebrow}</p>
                  <p className="mt-2 text-2xl font-semibold tracking-[-.04em]">Audi A5 Avant</p>
                </div>
                <p className="rounded-full bg-[#e9f2ff] px-3 py-1 text-xs font-semibold text-[#0866ff]">{copy.freeBadge}</p>
              </div>
              <div className="grid gap-3 py-4">
                {copy.listingFields.map((label, index) => (
                  <div key={label} className="rounded-[7px] border border-[#d8e2ef] bg-white px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#7a8797]">{label}</p>
                    <p className="mt-1 text-sm font-medium text-[#101828]">
                      {['Audi', 'A5', 'Avant', '2024', '68 000'][index]}
                    </p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 border-t border-[#dce6f3] pt-4">
                {copy.listingStats.map((label, index) => (
                  <div key={label} className="rounded-[6px] bg-white p-3 text-center">
                    <p className="text-2xl font-semibold text-[#0866ff]">{index + 1}</p>
                    <p className="mt-1 text-[11px] font-medium text-[#667085]">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-[var(--autorell-page-max)] px-5 sm:px-8">
          <h2 className="mx-auto max-w-4xl text-center text-[40px] font-semibold leading-[1.02] tracking-[-.05em] sm:text-6xl">
            {copy.stepsTitle}
          </h2>
          <div className="mx-auto mt-10 grid max-w-6xl gap-5 lg:grid-cols-3">
            {copy.steps.map((step, index) => (
              <article key={step.title} className="overflow-hidden rounded-[8px] border border-[#dce6f3] bg-white shadow-[0_18px_55px_rgba(16,24,40,.055)]">
                <div className="relative aspect-[1.55] overflow-hidden bg-[#eaf2ff]">
                  <Image src={stepImages[index]} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
                  <span className="absolute bottom-3 left-3 grid h-9 w-9 place-items-center rounded-[7px] bg-[#0866ff] text-sm font-semibold text-white">{index + 1}</span>
                </div>
                <div className="p-5 sm:p-6">
                  <h3 className="text-2xl font-semibold tracking-[-.035em]">{step.title}</h3>
                  <p className="mt-4 text-base leading-7 text-[#526071]">{step.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="bg-white">
        <section
          className="relative overflow-hidden bg-[#0866ff] py-14 text-white sm:py-20"
          style={{ clipPath: 'polygon(0 clamp(14px, 2vw, 28px), 100% 0, 100% calc(100% - clamp(14px, 2vw, 28px)), 0 100%)' }}
        >
          <div className="mx-auto grid max-w-[var(--autorell-page-max)] gap-8 px-5 sm:px-8 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] lg:items-center">
            <h2 className="max-w-[18ch] text-4xl font-semibold leading-[1.03] tracking-[-.05em] sm:text-5xl lg:text-[clamp(2.75rem,4vw,4.25rem)]">
              {copy.seoTitle}
            </h2>
            <p className="max-w-[46ch] text-base leading-7 text-white/84">{copy.seoText}</p>
          </div>
        </section>
      </div>

      <BenefitsFaqTestimonials locale={locale} faqTitle={copy.faqTitle} faqs={copy.faqs} vehicleKind={vehicleKind} />

      <section className="bg-white py-12 sm:py-20">
        <div className="mx-auto grid max-w-[var(--autorell-page-max)] grid-cols-1 items-center gap-8 px-5 sm:px-8 lg:grid-cols-[1.02fr_.98fr] lg:gap-16">
          <div className="order-1 overflow-hidden rounded-[10px] bg-[#ddecf7] lg:order-none">
            <Image
              src="/sell-car-phone-media.jpg"
              alt={locale === 'sv' ? 'Skapa en fordonsannons direkt i mobilen' : 'Create a vehicle listing from your phone'}
              width={1080}
              height={720}
              className="h-auto w-full object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
          <div className="order-2 max-w-xl lg:order-none">
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#0866ff]">
              {mediaLabel.eyebrow}
            </p>
            <h2 className="mt-4 text-4xl font-semibold leading-[1.04] tracking-[-.05em] sm:text-5xl">
              {mediaLabel.title}
            </h2>
            <p className="mt-5 text-base leading-7 text-[#526071]">
              {copy.steps[0].text}
            </p>
            <Link
              href={localizePublicHref(locale, '/account/listings/new')}
              className="mt-7 inline-flex min-h-12 items-center rounded-[8px] bg-[#0866ff] px-5 text-sm font-semibold text-white transition hover:bg-[#075ce5]"
            >
              {copy.primaryCta}
            </Link>
          </div>
        </div>
      </section>

      <HomeSellerAudienceSection copy={getHomeCopy(locale)} locale={locale} />

      <PublicFooter locale={locale} />
    </main>
  )
}

const localizedBenefitsCopy: Partial<Record<PublicLocale, Partial<BenefitsCopy>>> = {
  de: { eyebrow: 'Auf Autorell verkaufen', title: 'Auto kostenlos verkaufen', intro: 'Erstellen Sie in wenigen Minuten eine Anzeige und erreichen Sie Käufer in Europa.', primaryCta: 'Kostenlos starten', proof: '5 Tage kostenlos. Zahlen Sie nur für eine längere Laufzeit oder mehr Sichtbarkeit.', stepsTitle: 'Drei einfache Schritte', steps: [{ title: 'Anzeige erstellen', text: 'Fügen Sie Fahrzeugdaten, Bilder und Kontaktdaten in einem klaren Ablauf hinzu.' }, { title: 'Kostenlos veröffentlichen', text: 'Die Basisanzeige ist 5 Tage kostenlos. Optionen sind freiwillig.' }, { title: 'Käufer erreichen', text: 'Käufer finden Ihre Anzeige über Suche, Kategorie und Markt.' }], seoTitle: 'Damit Verkäufer gefunden werden', seoText: 'Autorell verbindet Fahrzeugkategorien, Märkte und Suchanfragen, damit Käufer passende Fahrzeuge finden.' },
  at: { eyebrow: 'Auf Autorell verkaufen', title: 'Auto in Österreich kostenlos verkaufen', intro: 'Erstellen Sie schnell eine Anzeige und erreichen Sie Käufer in Österreich und Europa.', primaryCta: 'Kostenlos starten', proof: '5 Tage kostenlos. Zahlen Sie nur für längere Laufzeit oder mehr Sichtbarkeit.', stepsTitle: 'Drei einfache Schritte', steps: [{ title: 'Fahrzeug eintragen', text: 'Ergänzen Sie Daten, Bilder und Kontaktdaten einfach in einem Ablauf.' }, { title: 'Kostenlos veröffentlichen', text: 'Die Basisanzeige ist 5 Tage kostenlos. Erweiterungen sind optional.' }, { title: 'Käufer erreichen', text: 'Ihre Anzeige wird über Suche, Kategorie und Markt gefunden.' }], seoTitle: 'Damit Verkäufer gefunden werden', seoText: 'Autorell verbindet Kategorien, Märkte und Suchanfragen, damit Käufer passende Fahrzeuge finden.' },
  fr: { eyebrow: 'Vendre sur Autorell', title: 'Vendez votre voiture gratuitement', intro: 'Créez une annonce en quelques minutes et touchez des acheteurs en Europe.', primaryCta: 'Commencer gratuitement', proof: 'Gratuit pendant 5 jours. Payez seulement pour une durée plus longue ou plus de visibilité.', stepsTitle: 'Trois étapes simples', steps: [{ title: 'Créer votre annonce', text: 'Ajoutez les données du véhicule, les photos et vos coordonnées dans un parcours clair.' }, { title: 'Publier gratuitement', text: 'L’annonce de base est gratuite pendant 5 jours. Les options sont facultatives.' }, { title: 'Recevoir des contacts', text: 'Les acheteurs trouvent votre annonce par recherche, catégorie et marché.' }], seoTitle: 'Pour être trouvé par les acheteurs', seoText: 'Autorell relie catégories, marchés et recherches afin de présenter chaque véhicule au bon endroit.' },
  be: { eyebrow: 'Vendre sur Autorell', title: 'Vendez votre voiture gratuitement', intro: 'Créez une annonce en quelques minutes et atteignez des acheteurs en Belgique et en Europe.', primaryCta: 'Commencer gratuitement', proof: 'Gratuit pendant 5 jours. Payez uniquement pour prolonger l’annonce ou augmenter sa visibilité.', stepsTitle: 'Trois étapes simples', steps: [{ title: 'Créer l’annonce', text: 'Ajoutez les données, les photos et vos coordonnées dans un parcours simple.' }, { title: 'Publier gratuitement', text: 'L’annonce de base est gratuite pendant 5 jours. Les options sont facultatives.' }, { title: 'Trouver des acheteurs', text: 'Les acheteurs trouvent l’annonce par recherche, catégorie et marché.' }], seoTitle: 'Pour que les vendeurs soient trouvés', seoText: 'Autorell relie catégories, marchés et recherches pour aider les acheteurs à trouver le bon véhicule.' },
  es: { eyebrow: 'Vende en Autorell', title: 'Vende tu coche gratis', intro: 'Crea un anuncio en pocos minutos y llega a compradores en Europa.', primaryCta: 'Empezar gratis', proof: 'Gratis durante 5 días. Paga solo por más tiempo o visibilidad adicional.', stepsTitle: 'Tres pasos sencillos', steps: [{ title: 'Crea tu anuncio', text: 'Añade los datos del vehículo, las fotos y tus datos de contacto en un proceso claro.' }, { title: 'Publica gratis', text: 'El anuncio básico es gratis durante 5 días. Las opciones son voluntarias.' }, { title: 'Encuentra compradores', text: 'Los compradores encuentran tu anuncio por búsqueda, categoría y mercado.' }], seoTitle: 'Diseñado para que te encuentren', seoText: 'Autorell conecta categorías, mercados y búsquedas para que cada vehículo aparezca en el lugar adecuado.' },
  it: { eyebrow: 'Vendi su Autorell', title: 'Vendi la tua auto gratis', intro: 'Crea un annuncio in pochi minuti e raggiungi acquirenti in Europa.', primaryCta: 'Inizia gratis', proof: 'Gratis per 5 giorni. Paghi solo per più tempo o maggiore visibilità.', stepsTitle: 'Tre semplici passaggi', steps: [{ title: 'Crea l’annuncio', text: 'Inserisci dati, foto e contatti del veicolo in un percorso chiaro.' }, { title: 'Pubblica gratis', text: 'L’annuncio base è gratuito per 5 giorni. Le opzioni sono facoltative.' }, { title: 'Raggiungi gli acquirenti', text: 'Gli acquirenti trovano l’annuncio tramite ricerca, categoria e mercato.' }], seoTitle: 'Per farti trovare dagli acquirenti', seoText: 'Autorell collega categorie, mercati e ricerche per mostrare ogni veicolo nel posto giusto.' },
  nl: { eyebrow: 'Verkoop op Autorell', title: 'Verkoop je auto gratis', intro: 'Maak in enkele minuten een advertentie en bereik kopers in Europa.', primaryCta: 'Gratis beginnen', proof: '5 dagen gratis. Betaal alleen voor een langere looptijd of extra zichtbaarheid.', stepsTitle: 'Drie eenvoudige stappen', steps: [{ title: 'Maak je advertentie', text: 'Voeg voertuiggegevens, foto’s en contactgegevens toe in één duidelijk proces.' }, { title: 'Gratis publiceren', text: 'De basisadvertentie is 5 dagen gratis. Extra opties zijn vrijwillig.' }, { title: 'Bereik kopers', text: 'Kopers vinden je advertentie via zoeken, categorie en markt.' }], seoTitle: 'Zodat verkopers gevonden worden', seoText: 'Autorell koppelt categorieën, markten en zoekopdrachten zodat kopers het juiste voertuig vinden.' },
  pl: { eyebrow: 'Sprzedawaj na Autorell', title: 'Sprzedaj samochód za darmo', intro: 'Utwórz ogłoszenie w kilka minut i dotrzyj do kupujących w Europie.', primaryCta: 'Zacznij za darmo', proof: 'Za darmo przez 5 dni. Płacisz tylko za dłuższą publikację lub większą widoczność.', stepsTitle: 'Trzy proste kroki', steps: [{ title: 'Utwórz ogłoszenie', text: 'Dodaj dane pojazdu, zdjęcia i kontakt w jednym przejrzystym procesie.' }, { title: 'Opublikuj za darmo', text: 'Podstawowe ogłoszenie jest bezpłatne przez 5 dni. Opcje dodatkowe są dobrowolne.' }, { title: 'Dotrzyj do kupujących', text: 'Kupujący znajdą ogłoszenie przez wyszukiwarkę, kategorię i rynek.' }], seoTitle: 'Stworzone, aby Cię znaleziono', seoText: 'Autorell łączy kategorie pojazdów, rynki i wyszukiwanie, aby kupujący znaleźli właściwy pojazd.' },
  da: { eyebrow: 'Sælg på Autorell', title: 'Sælg din bil gratis', intro: 'Opret en annonce på få minutter og nå købere i Europa.', primaryCta: 'Kom gratis i gang', proof: 'Gratis i 5 dage. Betal kun for længere annoncering eller ekstra synlighed.', stepsTitle: 'Tre enkle trin', steps: [{ title: 'Opret annoncen', text: 'Tilføj køretøjsdata, billeder og kontaktoplysninger i ét tydeligt flow.' }, { title: 'Udgiv gratis', text: 'Grundannoncen er gratis i 5 dage. Ekstra muligheder er frivillige.' }, { title: 'Nå købere', text: 'Købere finder annoncen via søgning, kategori og marked.' }], seoTitle: 'Bygget til at blive fundet', seoText: 'Autorell samler kategorier, markeder og søgninger, så købere finder det rigtige køretøj.' },
  fi: { eyebrow: 'Myy Autorellissa', title: 'Myy autosi ilmaiseksi', intro: 'Luo ilmoitus muutamassa minuutissa ja tavoita ostajat Euroopassa.', primaryCta: 'Aloita ilmaiseksi', proof: 'Ilmainen 5 päivää. Maksat vain pidemmästä ilmoitusajasta tai lisänäkyvyydestä.', stepsTitle: 'Kolme helppoa vaihetta', steps: [{ title: 'Luo ilmoitus', text: 'Lisää ajoneuvon tiedot, kuvat ja yhteystiedot selkeässä vaiheessa.' }, { title: 'Julkaise ilmaiseksi', text: 'Perusilmoitus on ilmainen 5 päivää. Lisävalinnat ovat vapaaehtoisia.' }, { title: 'Tavoita ostajat', text: 'Ostajat löytävät ilmoituksen haun, kategorian ja markkinan kautta.' }], seoTitle: 'Rakennettu löydettäväksi', seoText: 'Autorell yhdistää ajoneuvoluokat, markkinat ja haut, jotta ostajat löytävät oikean ajoneuvon.' },
}

const heroCopyByLocale: Record<PublicLocale, Pick<BenefitsCopy, 'title' | 'intro'>> = {
  en: { title: 'Advertise your vehicle and reach buyers', intro: 'Create a clear listing in minutes and connect with interested buyers.' },
  sv: { title: 'Annonsera ditt fordon och nå köpare', intro: 'Skapa en tydlig annons på några minuter och nå intresserade köpare.' },
  de: { title: 'Fahrzeug inserieren und Käufer erreichen', intro: 'Erstellen Sie in wenigen Minuten eine klare Anzeige und erreichen Sie interessierte Käufer.' },
  at: { title: 'Fahrzeug inserieren und Käufer erreichen', intro: 'Erstellen Sie schnell eine klare Anzeige und erreichen Sie interessierte Käufer.' },
  fr: { title: 'Publiez votre véhicule et trouvez des acheteurs', intro: 'Créez une annonce claire en quelques minutes et touchez des acheteurs intéressés.' },
  be: { title: 'Publiez votre véhicule et trouvez des acheteurs', intro: 'Créez une annonce claire en quelques minutes et touchez des acheteurs intéressés.' },
  es: { title: 'Anuncia tu vehículo y llega a compradores', intro: 'Crea un anuncio claro en pocos minutos y llega a compradores interesados.' },
  it: { title: 'Pubblica il tuo veicolo e trova acquirenti', intro: 'Crea un annuncio chiaro in pochi minuti e raggiungi acquirenti interessati.' },
  nl: { title: 'Adverteer je voertuig en bereik kopers', intro: 'Maak in enkele minuten een duidelijke advertentie en bereik geïnteresseerde kopers.' },
  pl: { title: 'Ogłoś pojazd i dotrzyj do kupujących', intro: 'Utwórz przejrzyste ogłoszenie w kilka minut i dotrzyj do zainteresowanych kupujących.' },
  da: { title: 'Annoncér dit køretøj og nå købere', intro: 'Opret en tydelig annonce på få minutter og nå interesserede købere.' },
  fi: { title: 'Ilmoita ajoneuvosi ja tavoita ostajat', intro: 'Luo selkeä ilmoitus muutamassa minuutissa ja tavoita kiinnostuneet ostajat.' },
}

function getBenefitsCopy(locale: PublicLocale): BenefitsCopy {
  const base = locale === 'sv' ? copyByLocale.sv : copyByLocale.en
  return { ...base, ...(localizedBenefitsCopy[locale] || {}), ...heroCopyByLocale[locale] } as BenefitsCopy
}

function getRequestedLocale(headerStore: Awaited<ReturnType<typeof headers>>): PublicLocale {
  const requested = headerStore.get('x-autorell-language') || 'en'
  if (requested === 'sv' || requested === 'de' || isPublicLanguage(requested)) {
    return requested
  }
  const pathname = headerStore.get('x-autorell-pathname') || ''
  const prefix = pathname.split('/').filter(Boolean)[0]
  const localeByPrefix: Record<string, PublicLocale> = {
    se: 'sv',
    de: 'de',
    at: 'at',
    be: 'be',
    fr: 'fr',
    es: 'es',
    it: 'it',
    pl: 'pl',
    nl: 'nl',
    fi: 'fi',
    dk: 'da',
  }
  return localeByPrefix[prefix] || 'en'
}

function marketCodeForLocale(locale: PublicLocale) {
  const codes: Record<PublicLocale, string> = {
    en: 'EU',
    sv: 'SE',
    de: 'DE',
    at: 'AT',
    be: 'BE',
    fr: 'FR',
    es: 'ES',
    it: 'IT',
    pl: 'PL',
    nl: 'NL',
    fi: 'FI',
    da: 'DK',
  }
  return codes[locale] || 'EU'
}
