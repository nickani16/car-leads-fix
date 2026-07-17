import 'server-only'

import { createHash } from 'node:crypto'
import { buildListingPath } from '@/lib/listing-url'
import { getFeaturedMarketplaceHomeListings } from '@/lib/marketplace-public-data'
import { createAdminClient } from '@/lib/supabase/admin'

export type PublicNewsCategory = {
  id: string
  key: string
  label: string
}

export type PublicNewsArticle = {
  id: string
  slug: string
  title: string
  excerpt: string
  body: Record<string, unknown>
  author: string
  publishedAt: string
  updatedAt: string
  readingTime: number
  category: PublicNewsCategory | null
  tags: string[]
  imageUrl: string | null
  imageAlt: string
  imageCaption: string | null
  seoTitle: string | null
  metaDescription: string | null
  canonicalUrl: string | null
  viewCount: number
  relatedPostIds: string[]
}

export type PublicNewsListing = {
  id: string
  title: string
  href: string
  imageUrl: string | null
  priceLabel: string
  location: string
  meta: string
}

export type PublicNewsBodyBlock = {
  type: 'paragraph' | 'heading'
  level: 1 | 2 | 3 | 4 | 5 | 6
  text: string
  bold: boolean
}

const fallbackCategories: PublicNewsCategory[] = [
  { id: 'cars', key: 'cars', label: 'Bilar' },
  { id: 'trucks', key: 'trucks', label: 'Lastbilar' },
  { id: 'agriculture', key: 'agriculture', label: 'Lantbruksmaskiner' },
]

const fallbackArticles: PublicNewsArticle[] = [
  {
    id: 'fallback-sell-trucks-on-autorell',
    slug: 'sell-trucks-on-autorell',
    title: 'Sälja lastbil på Autorell: så fungerar processen från annons till seriös kontakt',
    excerpt: 'En praktisk guide för åkerier, företag och privata säljare som vill nå fler köpare när de säljer lastbil online.',
    body: articleDoc([
      ['heading', 2, 'Varför sälja lastbil via en europeisk marknadsplats?'],
      ['paragraph', 1, 'Att sälja en lastbil handlar ofta om mer än att lägga upp några bilder och vänta på samtal. Köparen vill förstå skick, utrustning, användningsområde, historik och total kostnad. På Autorell byggs annonsflödet för att göra just den informationen tydlig, så att rätt köpare snabbare kan avgöra om fordonet passar deras verksamhet.'],
      ['paragraph', 1, 'För åkerier och företag kan marknaden dessutom vara större än den lokala regionen. En dragbil, skåplastbil, kylbil eller tippbil kan vara mer attraktiv i en annan del av Europa beroende på efterfrågan, säsong och användningsområde. Därför är det viktigt att annonsen är strukturerad, sökbar och lätt att jämföra.'],
      ['heading', 2, 'Så förbereder du en stark lastbilsannons'],
      ['paragraph', 1, 'Börja med tydliga bilder från flera vinklar: front, sidor, hytt, lastutrymme, chassi, däck, instrumentpanel och eventuella skador. En ärlig annons skapar bättre dialog och minskar risken för onödiga frågor. Lägg också till uppgifter som miltal, årsmodell, växellåda, drivmedel, axelkonfiguration, totalvikt, lastkapacitet och servicehistorik.'],
      ['paragraph', 1, 'På Autorell är målet att säljaren ska kunna presentera fordonet professionellt utan att behöva bygga en egen försäljningssida. För företag med abonnemang blir det extra viktigt att annonserna hålls uppdaterade, eftersom köpare ofta jämför flera objekt samtidigt.'],
      ['heading', 2, 'Vad händer när annonsen är publicerad?'],
      ['paragraph', 1, 'När lastbilen ligger ute kan köpare hitta den via sök, kategori, marknad och relevanta filter. En bra rubrik gör stor skillnad. Skriv hellre konkret, till exempel “Volvo FH dragbil 2020 med Euro 6 och servicehistorik”, än en allmän rubrik som bara säger “Fin lastbil säljes”.'],
      ['paragraph', 1, 'När en intressent hör av sig bör du ha dokumentation redo: registreringsuppgifter, serviceunderlag, besiktningsinformation och tydliga betalningsvillkor. Det ger ett seriöst intryck och gör att affären kan gå snabbare.'],
      ['heading', 2, 'Autorell gör försäljningen enklare'],
      ['paragraph', 1, 'Autorell samlar fordon från flera europeiska marknader på ett ställe. För dig som säljer lastbil betyder det att annonsen kan nå fler relevanta köpare, samtidigt som processen hålls enkel: skapa annons, fyll i uppgifter, ladda upp bilder och hantera kontakterna från ett och samma konto.'],
    ]),
    author: 'Autorell Redaktion',
    publishedAt: '2026-07-16T08:00:00.000Z',
    updatedAt: '2026-07-16T08:00:00.000Z',
    readingTime: 4,
    category: fallbackCategories[1],
    tags: ['Sälja lastbil', 'Lastbilar', 'Företag', 'Transport'],
    imageUrl: '/category-trucks-hero.jpg',
    imageAlt: 'Lastbil på väg genom skogsparti',
    imageCaption: null,
    seoTitle: 'Sälja lastbil på Autorell | Guide för företag och åkerier',
    metaDescription: 'Så säljer du lastbil på Autorell: bilder, annonstext, fordonsdata och processen från publicering till seriös köparkontakt.',
    canonicalUrl: null,
    viewCount: 0,
    relatedPostIds: [],
  },
  {
    id: 'fallback-sell-car-privately-online',
    slug: 'sell-car-privately-online',
    title: 'Sälja bil privat online: steg för steg till en tryggare och bättre annons',
    excerpt: 'Så gör du bilen mer lättsåld med rätt bilder, tydlig information och ett tryggt säljflöde på Autorell.',
    body: articleDoc([
      ['heading', 2, 'En bra bilannons börjar innan du skriver rubriken'],
      ['paragraph', 1, 'När du säljer bil privat är första intrycket avgörande. Köparen jämför ofta flera bilar i samma prisklass och bestämmer snabbt vilka annonser som känns seriösa. Därför behöver bilder, rubrik och beskrivning arbeta tillsammans. Tvätta bilen, ta bilder i dagsljus och visa både helhet och detaljer.'],
      ['paragraph', 1, 'Fotografera utsida, interiör, bagageutrymme, instrumentpanel, däck och eventuella märken eller skador. Det är bättre att vara tydlig från början än att låta köparen upptäcka saker senare. En transparent annons sparar tid och bygger förtroende.'],
      ['heading', 2, 'Vad ska finnas med i beskrivningen?'],
      ['paragraph', 1, 'Beskriv bilens skick, utrustning, servicehistorik och varför den säljs. Skriv konkret: årsmodell, miltal, drivmedel, växellåda, besiktning, vinterdäck, nyservad eller större reparationer. Om bilen har skador, säg det tydligt. Seriösa köpare uppskattar ärlighet.'],
      ['paragraph', 1, 'En bra rubrik kan exempelvis vara “Volkswagen Golf 1.5 TSI 2021 med låg miltal och servicebok”. Den hjälper både köpare och sökfunktionen att förstå bilen snabbare.'],
      ['heading', 2, 'Så hjälper Autorell privatpersoner'],
      ['paragraph', 1, 'Autorell är byggt för att göra fordonsannonser tydliga och jämförbara. Du kan skapa en annons, lägga in fordonets viktigaste uppgifter och göra bilen synlig för köpare som söker efter märke, modell, plats och kategori. Det gör processen enklare än att sprida samma information manuellt i flera kanaler.'],
      ['paragraph', 1, 'För privatpersoner är målet enkelt: en professionell annons utan krångel. Ju bättre information du lägger in, desto större chans att rätt köpare kontaktar dig från början.'],
      ['heading', 2, 'Tänk på säkerheten'],
      ['paragraph', 1, 'Bestäm hur provkörning ska ske, kontrollera identitet vid affär och använd säkra betalningsmetoder. Lämna inte ifrån dig bilen innan betalningen är bekräftad. En tydlig process skyddar både säljare och köpare.'],
    ]),
    author: 'Autorell Redaktion',
    publishedAt: '2026-07-16T07:30:00.000Z',
    updatedAt: '2026-07-16T07:30:00.000Z',
    readingTime: 4,
    category: fallbackCategories[0],
    tags: ['Sälja bil', 'Privatförsäljning', 'Bilannons', 'Trygg affär'],
    imageUrl: '/category-cars-hero-family.webp',
    imageAlt: 'Familj vid bil utanför ett hem',
    imageCaption: null,
    seoTitle: 'Sälja bil privat online | Guide till en bättre bilannons',
    metaDescription: 'Guide för dig som vill sälja bil privat online. Se hur bilder, rubrik, beskrivning och trygg process hjälper dig hitta rätt köpare.',
    canonicalUrl: null,
    viewCount: 0,
    relatedPostIds: [],
  },
  {
    id: 'fallback-sell-tractors-and-farm-machinery',
    slug: 'sell-tractors-and-farm-machinery',
    title: 'Sälja traktor och lantbruksmaskiner: så når du rätt köpare',
    excerpt: 'Lantbruksmaskiner kräver tydliga uppgifter, bra bilder och rätt kategori. Så bygger du en annons som fungerar.',
    body: articleDoc([
      ['heading', 2, 'Köpare av lantbruksmaskiner söker specifikt'],
      ['paragraph', 1, 'Den som letar efter traktor, spruta, balpress, plog eller lastare vet ofta exakt vilken kapacitet och utrustning som behövs. Därför måste annonsen vara konkret. Märke, modell, årsmodell, timmar, effekt, däck, hydraulik, frontlastare, redskap och servicehistorik är uppgifter som snabbt avgör om objektet är relevant.'],
      ['paragraph', 1, 'Autorells kategorier gör det enklare att placera maskinen rätt. En traktor ska inte försvinna bland vanliga bilar, och en lantbruksköpare ska kunna filtrera fram rätt typ av maskin utan onödigt arbete.'],
      ['heading', 2, 'Bilderna ska visa skick och funktion'],
      ['paragraph', 1, 'Ta bilder i god belysning och visa maskinen från alla sidor. Lägg extra fokus på däck, redskapsfästen, hytt, reglage, hydraulik, motorutrymme och slitagepunkter. Om maskinen har tillbehör eller redskap som ingår, fotografera även dem separat.'],
      ['paragraph', 1, 'För dyrare lantbruksmaskiner kan en tydlig annons minska antalet irrelevanta frågor. Köparen vill ofta veta om maskinen kan användas direkt, om service är dokumenterad och om transport kan ordnas.'],
      ['heading', 2, 'Sälj över en bredare marknad'],
      ['paragraph', 1, 'Efterfrågan på lantbruksmaskiner varierar mellan regioner och säsonger. En maskin som är svårsåld lokalt kan vara attraktiv i en annan marknad. Genom att strukturera annonsen på Autorell kan objektet bli lättare att hitta för köpare som söker efter rätt kategori, märke och användningsområde.'],
      ['paragraph', 1, 'Det gör Autorell särskilt relevant för lantbrukare, maskinhandlare och företag som vill sälja mer professionellt utan att bygga egna tekniska lösningar.'],
      ['heading', 2, 'En tydlig annons skapar bättre affärer'],
      ['paragraph', 1, 'Ju mer komplett annonsen är, desto snabbare kan en seriös köpare fatta beslut. Ange pris, skick, plats, transportmöjlighet och kontaktväg. Då blir processen enklare för båda parter och chansen ökar att maskinen hamnar hos rätt köpare.'],
    ]),
    author: 'Autorell Redaktion',
    publishedAt: '2026-07-16T07:00:00.000Z',
    updatedAt: '2026-07-16T07:00:00.000Z',
    readingTime: 4,
    category: fallbackCategories[2],
    tags: ['Sälja traktor', 'Lantbruksmaskiner', 'Traktor', 'Maskinhandel'],
    imageUrl: '/category-agriculture-hero.jpg',
    imageAlt: 'Lantbruksmaskin på fält i solnedgång',
    imageCaption: null,
    seoTitle: 'Sälja traktor och lantbruksmaskiner | Guide för bättre annonser',
    metaDescription: 'Så säljer du traktor och lantbruksmaskiner online med tydliga bilder, rätt kategori, maskindata och en seriös säljprocess.',
    canonicalUrl: null,
    viewCount: 0,
    relatedPostIds: [],
  },
]

type VehicleNewsLanguage = 'sv' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'nl' | 'pl' | 'da' | 'fi'

type FallbackArticleTranslation = {
  title: string
  excerpt: string
  body: Array<['heading' | 'paragraph', number, string]>
  tags: string[]
  imageAlt: string
  seoTitle: string
  metaDescription: string
}

const fallbackCategoryLabels: Record<VehicleNewsLanguage, Record<string, string>> = {
  sv: { cars: 'Bilar', trucks: 'Lastbilar', agriculture: 'Lantbruksmaskiner' },
  en: { cars: 'Cars', trucks: 'Trucks', agriculture: 'Agricultural machinery' },
  de: { cars: 'Autos', trucks: 'Lastwagen', agriculture: 'Landmaschinen' },
  fr: { cars: 'Voitures', trucks: 'Camions', agriculture: 'Machines agricoles' },
  es: { cars: 'Coches', trucks: 'Camiones', agriculture: 'Maquinaria agrícola' },
  it: { cars: 'Auto', trucks: 'Camion', agriculture: 'Macchine agricole' },
  nl: { cars: 'Auto’s', trucks: 'Vrachtwagens', agriculture: 'Landbouwmachines' },
  pl: { cars: 'Samochody', trucks: 'Ciężarówki', agriculture: 'Maszyny rolnicze' },
  da: { cars: 'Biler', trucks: 'Lastbiler', agriculture: 'Landbrugsmaskiner' },
  fi: { cars: 'Autot', trucks: 'Kuorma-autot', agriculture: 'Maatalouskoneet' },
}

const fallbackTranslations: Record<string, Record<VehicleNewsLanguage, FallbackArticleTranslation>> = {
  'sell-trucks-on-autorell': {
    sv: {
      title: 'Sälja lastbil på Autorell: så fungerar processen från annons till seriös kontakt',
      excerpt: 'En praktisk guide för åkerier, företag och privata säljare som vill nå fler köpare när de säljer lastbil online.',
      body: [
        ['heading', 2, 'Varför sälja lastbil via en europeisk marknadsplats?'],
        ['paragraph', 1, 'Att sälja en lastbil handlar ofta om mer än att lägga upp några bilder och vänta på samtal. Köparen vill förstå skick, utrustning, användningsområde, historik och total kostnad. På Autorell byggs annonsflödet för att göra informationen tydlig, så att rätt köpare snabbare kan avgöra om fordonet passar deras verksamhet.'],
        ['paragraph', 1, 'För åkerier och företag kan marknaden vara större än den lokala regionen. En dragbil, skåplastbil, kylbil eller tippbil kan vara mer attraktiv i en annan del av Europa beroende på efterfrågan, säsong och användningsområde. Därför behöver annonsen vara strukturerad, sökbar och lätt att jämföra.'],
        ['heading', 2, 'Så förbereder du en stark lastbilsannons'],
        ['paragraph', 1, 'Börja med tydliga bilder från flera vinklar: front, sidor, hytt, lastutrymme, chassi, däck, instrumentpanel och eventuella skador. Lägg också till uppgifter som miltal, årsmodell, växellåda, drivmedel, axelkonfiguration, totalvikt, lastkapacitet och servicehistorik.'],
        ['heading', 2, 'Autorell gör försäljningen enklare'],
        ['paragraph', 1, 'Autorell samlar fordon från flera europeiska marknader på ett ställe. För dig som säljer lastbil betyder det att annonsen kan nå fler relevanta köpare, samtidigt som processen hålls enkel: skapa annons, fyll i uppgifter, ladda upp bilder och hantera kontakterna från ett och samma konto.'],
      ],
      tags: ['Sälja lastbil', 'Lastbilar', 'Företag', 'Transport'],
      imageAlt: 'Lastbil på väg genom skogsparti',
      seoTitle: 'Sälja lastbil på Autorell | Guide för företag och åkerier',
      metaDescription: 'Så säljer du lastbil på Autorell: bilder, annonstext, fordonsdata och processen från publicering till seriös köparkontakt.',
    },
    en: {
      title: 'Selling a truck on Autorell: from listing to serious buyer contact',
      excerpt: 'A practical guide for hauliers, companies and private sellers who want to reach more buyers when selling a truck online.',
      body: [
        ['heading', 2, 'Why sell a truck through a European marketplace?'],
        ['paragraph', 1, 'Selling a truck is often about more than uploading a few photos and waiting for calls. Buyers need to understand condition, equipment, use case, history and total cost. Autorell structures the listing flow so that the right information is easy to compare.'],
        ['paragraph', 1, 'For hauliers and companies, the buyer may be outside the local region. A tractor unit, box truck, refrigerated truck or tipper can be more attractive in another European market depending on demand and season.'],
        ['heading', 2, 'How to prepare a strong truck listing'],
        ['paragraph', 1, 'Use clear photos from several angles: front, sides, cab, load area, chassis, tyres, dashboard and visible damage. Add mileage, model year, gearbox, fuel type, axle configuration, gross weight, payload and service history.'],
        ['heading', 2, 'Autorell makes the process simpler'],
        ['paragraph', 1, 'Autorell gathers vehicles from several European markets in one place. You can create the listing, add the key details, upload images and manage buyer contacts from the same account.'],
      ],
      tags: ['Sell truck', 'Trucks', 'Business', 'Transport'],
      imageAlt: 'Truck driving through a forest road',
      seoTitle: 'Sell a truck on Autorell | Guide for companies and hauliers',
      metaDescription: 'How to sell a truck on Autorell with strong photos, listing text, vehicle data and a clear process for serious buyer enquiries.',
    },
    de: {
      title: 'Lkw auf Autorell verkaufen: vom Inserat bis zur seriösen Anfrage',
      excerpt: 'Ein praktischer Leitfaden für Speditionen, Unternehmen und private Verkäufer, die beim Online-Verkauf eines Lkw mehr passende Käufer erreichen möchten.',
      body: [
        ['heading', 2, 'Warum einen Lkw über einen europäischen Marktplatz verkaufen?'],
        ['paragraph', 1, 'Beim Verkauf eines Lkw geht es um mehr als ein paar Fotos. Käufer möchten Zustand, Ausstattung, Einsatzbereich, Historie und Gesamtkosten schnell verstehen. Autorell hilft dabei, diese Informationen klar zu strukturieren.'],
        ['paragraph', 1, 'Für Speditionen und Unternehmen kann der passende Käufer in einem anderen europäischen Markt sitzen. Je nach Nachfrage und Saison kann ein Zugfahrzeug, Kofferfahrzeug, Kühlfahrzeug oder Kipper dort attraktiver sein.'],
        ['heading', 2, 'So erstellen Sie ein starkes Lkw-Inserat'],
        ['paragraph', 1, 'Zeigen Sie Front, Seiten, Fahrerhaus, Laderaum, Fahrgestell, Reifen, Armaturen und sichtbare Schäden. Ergänzen Sie Kilometerstand, Baujahr, Getriebe, Kraftstoff, Achskonfiguration, Gesamtgewicht, Nutzlast und Servicehistorie.'],
        ['heading', 2, 'Autorell vereinfacht den Verkauf'],
        ['paragraph', 1, 'Autorell bündelt Fahrzeuge aus mehreren europäischen Märkten. Sie erstellen das Inserat, fügen Fahrzeugdaten und Bilder hinzu und verwalten Kontakte an einem Ort.'],
      ],
      tags: ['Lkw verkaufen', 'Lastwagen', 'Unternehmen', 'Transport'],
      imageAlt: 'Lastwagen auf einer Straße durch ein Waldgebiet',
      seoTitle: 'Lkw auf Autorell verkaufen | Leitfaden für Unternehmen',
      metaDescription: 'So verkaufen Sie einen Lkw auf Autorell: Fotos, Inseratstext, Fahrzeugdaten und ein klarer Prozess bis zur Käuferanfrage.',
    },
    fr: {
      title: 'Vendre un camion sur Autorell : de l’annonce au contact qualifié',
      excerpt: 'Un guide pratique pour transporteurs, entreprises et vendeurs particuliers qui veulent toucher plus d’acheteurs en ligne.',
      body: [
        ['heading', 2, 'Pourquoi vendre un camion sur une place de marché européenne ?'],
        ['paragraph', 1, 'Vendre un camion ne consiste pas seulement à publier quelques photos. L’acheteur doit comprendre l’état, l’équipement, l’usage, l’historique et le coût total. Autorell structure l’annonce pour rendre ces informations faciles à comparer.'],
        ['paragraph', 1, 'Pour une entreprise, le bon acheteur peut se trouver dans un autre marché européen. Un tracteur routier, porteur, camion frigorifique ou benne peut y être plus recherché selon la demande.'],
        ['heading', 2, 'Préparer une annonce camion efficace'],
        ['paragraph', 1, 'Ajoutez des photos nettes de l’avant, des côtés, de la cabine, de la caisse, du châssis, des pneus, du tableau de bord et des défauts visibles. Indiquez kilométrage, année, boîte, carburant, configuration d’essieux, poids total, charge utile et entretien.'],
        ['heading', 2, 'Autorell simplifie la vente'],
        ['paragraph', 1, 'Autorell rassemble des véhicules de plusieurs marchés européens. Vous créez l’annonce, ajoutez les informations clés, téléchargez les images et gérez les contacts depuis le même compte.'],
      ],
      tags: ['Vendre camion', 'Camions', 'Entreprise', 'Transport'],
      imageAlt: 'Camion sur une route traversant une forêt',
      seoTitle: 'Vendre un camion sur Autorell | Guide pour entreprises',
      metaDescription: 'Comment vendre un camion sur Autorell avec de bonnes photos, des données claires et un processus adapté aux acheteurs sérieux.',
    },
    es: {
      title: 'Vender un camión en Autorell: del anuncio al contacto serio',
      excerpt: 'Guía práctica para transportistas, empresas y vendedores particulares que quieren llegar a más compradores online.',
      body: [
        ['heading', 2, 'Por qué vender un camión en un marketplace europeo'],
        ['paragraph', 1, 'Vender un camión exige algo más que subir fotos. El comprador necesita entender estado, equipamiento, uso, historial y coste total. Autorell organiza el anuncio para que esa información sea clara.'],
        ['paragraph', 1, 'Para empresas de transporte, el comprador adecuado puede estar en otro mercado europeo. Una cabeza tractora, camión caja, frigorífico o volquete puede tener más demanda según región y temporada.'],
        ['heading', 2, 'Cómo preparar un buen anuncio'],
        ['paragraph', 1, 'Incluye fotos del frontal, laterales, cabina, zona de carga, chasis, neumáticos, cuadro y daños visibles. Añade kilometraje, año, caja de cambios, combustible, ejes, peso total, carga útil e historial de mantenimiento.'],
        ['heading', 2, 'Autorell simplifica el proceso'],
        ['paragraph', 1, 'Autorell reúne vehículos de varios mercados europeos. Puedes crear el anuncio, añadir datos, subir imágenes y gestionar contactos desde una sola cuenta.'],
      ],
      tags: ['Vender camión', 'Camiones', 'Empresa', 'Transporte'],
      imageAlt: 'Camión circulando por una carretera forestal',
      seoTitle: 'Vender un camión en Autorell | Guía para empresas',
      metaDescription: 'Cómo vender un camión en Autorell con fotos, texto, datos del vehículo y un proceso claro para compradores serios.',
    },
    it: {
      title: 'Vendere un camion su Autorell: dall’annuncio al contatto qualificato',
      excerpt: 'Una guida pratica per trasportatori, aziende e privati che vogliono raggiungere più acquirenti online.',
      body: [
        ['heading', 2, 'Perché vendere un camion su un marketplace europeo?'],
        ['paragraph', 1, 'Vendere un camion richiede più di qualche foto. L’acquirente vuole capire condizioni, dotazioni, utilizzo, storico e costo complessivo. Autorell organizza l’annuncio in modo chiaro e confrontabile.'],
        ['paragraph', 1, 'Per aziende e trasportatori, il compratore giusto può trovarsi in un altro mercato europeo. Trattori stradali, furgonati, frigoriferi o ribaltabili possono avere domanda diversa a seconda della zona.'],
        ['heading', 2, 'Come preparare un annuncio efficace'],
        ['paragraph', 1, 'Mostra fronte, lati, cabina, vano di carico, telaio, pneumatici, cruscotto e difetti visibili. Inserisci chilometraggio, anno, cambio, carburante, assi, peso totale, portata e cronologia manutenzione.'],
        ['heading', 2, 'Autorell rende la vendita più semplice'],
        ['paragraph', 1, 'Autorell raccoglie veicoli da più mercati europei. Crei l’annuncio, aggiungi i dati, carichi le immagini e gestisci i contatti da un unico account.'],
      ],
      tags: ['Vendere camion', 'Camion', 'Aziende', 'Trasporto'],
      imageAlt: 'Camion su una strada in mezzo al bosco',
      seoTitle: 'Vendere un camion su Autorell | Guida per aziende',
      metaDescription: 'Come vendere un camion su Autorell con foto, testo, dati del veicolo e un processo chiaro per contatti seri.',
    },
    nl: {
      title: 'Een vrachtwagen verkopen op Autorell: van advertentie tot serieuze aanvraag',
      excerpt: 'Een praktische gids voor transportbedrijven, ondernemingen en particuliere verkopers die online meer kopers willen bereiken.',
      body: [
        ['heading', 2, 'Waarom verkopen via een Europese marktplaats?'],
        ['paragraph', 1, 'Een vrachtwagen verkopen vraagt om meer dan enkele foto’s. Kopers willen staat, uitrusting, gebruik, historie en totale kosten snel begrijpen. Autorell structureert de advertentie zodat die informatie duidelijk is.'],
        ['paragraph', 1, 'Voor bedrijven kan de juiste koper buiten de eigen regio zitten. Een trekker, bakwagen, koelwagen of kipper kan in een andere Europese markt aantrekkelijker zijn.'],
        ['heading', 2, 'Zo maak je een sterke advertentie'],
        ['paragraph', 1, 'Gebruik duidelijke foto’s van voorkant, zijkanten, cabine, laadruimte, chassis, banden, dashboard en zichtbare schade. Voeg kilometerstand, bouwjaar, transmissie, brandstof, assen, totaalgewicht, laadvermogen en onderhoudshistorie toe.'],
        ['heading', 2, 'Autorell maakt verkopen eenvoudiger'],
        ['paragraph', 1, 'Autorell brengt voertuigen uit meerdere Europese markten samen. Je maakt de advertentie, vult gegevens in, uploadt beelden en beheert contacten vanuit één account.'],
      ],
      tags: ['Vrachtwagen verkopen', 'Vrachtwagens', 'Zakelijk', 'Transport'],
      imageAlt: 'Vrachtwagen op een weg door een bosgebied',
      seoTitle: 'Vrachtwagen verkopen op Autorell | Gids voor bedrijven',
      metaDescription: 'Zo verkoop je een vrachtwagen op Autorell met sterke foto’s, voertuigdata en een duidelijk proces voor serieuze kopers.',
    },
    pl: {
      title: 'Sprzedaż ciężarówki w Autorell: od ogłoszenia do kontaktu z kupującym',
      excerpt: 'Praktyczny poradnik dla firm transportowych, przedsiębiorstw i sprzedających prywatnie, którzy chcą dotrzeć do większej liczby kupujących.',
      body: [
        ['heading', 2, 'Dlaczego sprzedawać ciężarówkę na europejskiej platformie?'],
        ['paragraph', 1, 'Sprzedaż ciężarówki to coś więcej niż kilka zdjęć. Kupujący chce szybko poznać stan, wyposażenie, przeznaczenie, historię i całkowity koszt. Autorell porządkuje te informacje w czytelnym ogłoszeniu.'],
        ['paragraph', 1, 'Dla firm właściwy kupujący może znajdować się w innym kraju. Ciągnik siodłowy, chłodnia, wywrotka lub ciężarówka skrzyniowa może mieć większy popyt na innym rynku.'],
        ['heading', 2, 'Jak przygotować mocne ogłoszenie'],
        ['paragraph', 1, 'Pokaż przód, boki, kabinę, przestrzeń ładunkową, podwozie, opony, deskę rozdzielczą i widoczne uszkodzenia. Dodaj przebieg, rok, skrzynię biegów, paliwo, osie, masę całkowitą, ładowność i historię serwisu.'],
        ['heading', 2, 'Autorell upraszcza sprzedaż'],
        ['paragraph', 1, 'Autorell gromadzi pojazdy z wielu europejskich rynków. Tworzysz ogłoszenie, dodajesz dane i zdjęcia oraz obsługujesz kontakty z jednego konta.'],
      ],
      tags: ['Sprzedaż ciężarówki', 'Ciężarówki', 'Firma', 'Transport'],
      imageAlt: 'Ciężarówka jadąca drogą przez las',
      seoTitle: 'Sprzedaj ciężarówkę w Autorell | Poradnik dla firm',
      metaDescription: 'Jak sprzedać ciężarówkę w Autorell: zdjęcia, opis, dane pojazdu i jasny proces kontaktu z kupującymi.',
    },
    da: {
      title: 'Sælg lastbil på Autorell: fra annonce til seriøs køberkontakt',
      excerpt: 'En praktisk guide til vognmænd, virksomheder og private sælgere, der vil nå flere købere online.',
      body: [
        ['heading', 2, 'Hvorfor sælge en lastbil via en europæisk markedsplads?'],
        ['paragraph', 1, 'At sælge en lastbil handler om mere end et par billeder. Køberen vil forstå stand, udstyr, anvendelse, historik og samlede omkostninger. Autorell gør oplysningerne lette at sammenligne.'],
        ['paragraph', 1, 'For virksomheder kan den rette køber være i et andet europæisk marked. En trækker, kassebil, kølebil eller tipbil kan være mere attraktiv afhængigt af efterspørgsel og sæson.'],
        ['heading', 2, 'Sådan laver du en stærk annonce'],
        ['paragraph', 1, 'Vis front, sider, kabine, lastrum, chassis, dæk, instrumentbræt og synlige skader. Tilføj kilometerstand, årgang, gearkasse, brændstof, aksler, totalvægt, lasteevne og servicehistorik.'],
        ['heading', 2, 'Autorell gør salget enklere'],
        ['paragraph', 1, 'Autorell samler køretøjer fra flere europæiske markeder. Du opretter annoncen, tilføjer data, uploader billeder og håndterer kontakter fra samme konto.'],
      ],
      tags: ['Sælg lastbil', 'Lastbiler', 'Erhverv', 'Transport'],
      imageAlt: 'Lastbil på vej gennem skovområde',
      seoTitle: 'Sælg lastbil på Autorell | Guide til virksomheder',
      metaDescription: 'Sådan sælger du lastbil på Autorell med gode billeder, køretøjsdata og en klar proces for seriøse købere.',
    },
    fi: {
      title: 'Kuorma-auton myynti Autorellissä: ilmoituksesta ostajayhteyteen',
      excerpt: 'Käytännön opas kuljetusyrityksille, yrityksille ja yksityisille myyjille, jotka haluavat tavoittaa enemmän ostajia verkossa.',
      body: [
        ['heading', 2, 'Miksi myydä kuorma-auto eurooppalaisella markkinapaikalla?'],
        ['paragraph', 1, 'Kuorma-auton myynti on enemmän kuin muutaman kuvan julkaisemista. Ostaja haluaa ymmärtää kunnon, varusteet, käyttötarkoituksen, historian ja kokonaiskustannukset. Autorell tekee tiedoista selkeät ja vertailtavat.'],
        ['paragraph', 1, 'Yrityksille sopiva ostaja voi löytyä toiselta Euroopan markkinalta. Vetopöytäauto, kuorma-auto, kylmäkuljetusauto tai kippiauto voi olla kysytympi alueesta ja kaudesta riippuen.'],
        ['heading', 2, 'Näin teet vahvan ilmoituksen'],
        ['paragraph', 1, 'Näytä etuosa, sivut, ohjaamo, kuormatila, alusta, renkaat, kojelauta ja näkyvät vauriot. Lisää kilometrit, vuosimalli, vaihteisto, polttoaine, akselit, kokonaispaino, kantavuus ja huoltohistoria.'],
        ['heading', 2, 'Autorell tekee myynnistä helpompaa'],
        ['paragraph', 1, 'Autorell kokoaa ajoneuvoja useilta Euroopan markkinoilta. Voit luoda ilmoituksen, lisätä tiedot, ladata kuvat ja hoitaa yhteydenotot samalta tililtä.'],
      ],
      tags: ['Myy kuorma-auto', 'Kuorma-autot', 'Yritys', 'Kuljetus'],
      imageAlt: 'Kuorma-auto metsätiellä',
      seoTitle: 'Myy kuorma-auto Autorellissä | Opas yrityksille',
      metaDescription: 'Näin myyt kuorma-auton Autorellissä: kuvat, ilmoitusteksti, ajoneuvotiedot ja selkeä prosessi ostajille.',
    },
  },
  'sell-car-privately-online': {
    sv: {
      title: 'Sälja bil privat online: steg för steg till en tryggare och bättre annons',
      excerpt: 'Så gör du bilen mer lättsåld med rätt bilder, tydlig information och ett tryggt säljflöde på Autorell.',
      body: [
        ['heading', 2, 'En bra bilannons börjar innan du skriver rubriken'],
        ['paragraph', 1, 'När du säljer bil privat är första intrycket avgörande. Köparen jämför ofta flera bilar i samma prisklass och bestämmer snabbt vilka annonser som känns seriösa. Därför behöver bilder, rubrik och beskrivning arbeta tillsammans.'],
        ['paragraph', 1, 'Fotografera utsida, interiör, bagageutrymme, instrumentpanel, däck och eventuella märken eller skador. En transparent annons sparar tid och bygger förtroende.'],
        ['heading', 2, 'Vad ska finnas med i beskrivningen?'],
        ['paragraph', 1, 'Beskriv bilens skick, utrustning, servicehistorik och varför den säljs. Skriv konkret: årsmodell, miltal, drivmedel, växellåda, besiktning, vinterdäck och större reparationer.'],
        ['heading', 2, 'Så hjälper Autorell privatpersoner'],
        ['paragraph', 1, 'Autorell gör fordonsannonser tydliga och jämförbara. Du kan skapa en annons, lägga in fordonets viktigaste uppgifter och göra bilen synlig för köpare som söker efter märke, modell, plats och kategori.'],
      ],
      tags: ['Sälja bil', 'Privatförsäljning', 'Bilannons', 'Trygg affär'],
      imageAlt: 'Familj vid bil utanför ett hem',
      seoTitle: 'Sälja bil privat online | Guide till en bättre bilannons',
      metaDescription: 'Guide för dig som vill sälja bil privat online. Se hur bilder, rubrik, beskrivning och trygg process hjälper dig hitta rätt köpare.',
    },
    en: {
      title: 'Selling a car privately online: a better and safer listing step by step',
      excerpt: 'Make your car easier to sell with the right photos, clear information and a safer selling flow on Autorell.',
      body: [
        ['heading', 2, 'A good car listing starts before the headline'],
        ['paragraph', 1, 'When selling a car privately, first impressions matter. Buyers compare several cars in the same price range and quickly decide which listings feel trustworthy. Photos, headline and description need to work together.'],
        ['paragraph', 1, 'Photograph the exterior, interior, boot, dashboard, tyres and any marks or damage. A transparent listing saves time and builds trust.'],
        ['heading', 2, 'What should the description include?'],
        ['paragraph', 1, 'Describe condition, equipment, service history and why the car is being sold. Include model year, mileage, fuel type, gearbox, inspection status, winter tyres and major repairs.'],
        ['heading', 2, 'How Autorell helps private sellers'],
        ['paragraph', 1, 'Autorell makes vehicle listings clear and comparable. You can add the key details and make the car visible to buyers searching by make, model, location and category.'],
      ],
      tags: ['Sell car', 'Private sale', 'Car listing', 'Safe deal'],
      imageAlt: 'Family by a car outside a home',
      seoTitle: 'Sell a car privately online | Guide to a better car listing',
      metaDescription: 'A guide for selling a car privately online with better photos, a clear description and a safer process for finding the right buyer.',
    },
    de: {
      title: 'Auto privat online verkaufen: Schritt für Schritt zum besseren Inserat',
      excerpt: 'So wird Ihr Auto mit guten Fotos, klaren Informationen und einem sicheren Verkaufsprozess leichter verkäuflich.',
      body: [
        ['heading', 2, 'Ein gutes Auto-Inserat beginnt vor der Überschrift'],
        ['paragraph', 1, 'Beim privaten Autoverkauf zählt der erste Eindruck. Käufer vergleichen viele Fahrzeuge derselben Preisklasse und entscheiden schnell, welche Inserate seriös wirken.'],
        ['paragraph', 1, 'Fotografieren Sie Außenansicht, Innenraum, Kofferraum, Armaturen, Reifen sowie sichtbare Kratzer oder Schäden. Transparenz spart Zeit und schafft Vertrauen.'],
        ['heading', 2, 'Was gehört in die Beschreibung?'],
        ['paragraph', 1, 'Beschreiben Sie Zustand, Ausstattung, Servicehistorie und Verkaufsgrund. Nennen Sie Baujahr, Kilometerstand, Kraftstoff, Getriebe, Prüfung, Winterreifen und größere Reparaturen.'],
        ['heading', 2, 'So hilft Autorell privaten Verkäufern'],
        ['paragraph', 1, 'Autorell macht Fahrzeuganzeigen klar und vergleichbar. Ihr Auto wird für Käufer sichtbar, die nach Marke, Modell, Ort und Kategorie suchen.'],
      ],
      tags: ['Auto verkaufen', 'Privatverkauf', 'Autoanzeige', 'Sicherer Verkauf'],
      imageAlt: 'Familie neben einem Auto vor einem Haus',
      seoTitle: 'Auto privat online verkaufen | Leitfaden für bessere Inserate',
      metaDescription: 'Tipps für den privaten Autoverkauf online: bessere Fotos, klare Beschreibung und ein sicherer Prozess bis zum Käuferkontakt.',
    },
    fr: {
      title: 'Vendre sa voiture entre particuliers en ligne : créer une annonce plus sûre',
      excerpt: 'Rendez votre voiture plus facile à vendre avec de bonnes photos, des informations claires et un parcours fiable sur Autorell.',
      body: [
        ['heading', 2, 'Une bonne annonce commence avant le titre'],
        ['paragraph', 1, 'Lorsqu’un particulier vend une voiture, la première impression compte. Les acheteurs comparent plusieurs véhicules et repèrent vite les annonces sérieuses.'],
        ['paragraph', 1, 'Photographiez extérieur, intérieur, coffre, tableau de bord, pneus et défauts visibles. Une annonce transparente fait gagner du temps et inspire confiance.'],
        ['heading', 2, 'Que doit contenir la description ?'],
        ['paragraph', 1, 'Décrivez l’état, les équipements, l’historique d’entretien et la raison de la vente. Ajoutez année, kilométrage, carburant, boîte, contrôle, pneus hiver et réparations importantes.'],
        ['heading', 2, 'Comment Autorell aide les particuliers'],
        ['paragraph', 1, 'Autorell rend les annonces claires et comparables. Votre voiture peut être trouvée par marque, modèle, lieu et catégorie.'],
      ],
      tags: ['Vendre voiture', 'Particulier', 'Annonce auto', 'Vente sécurisée'],
      imageAlt: 'Famille près d’une voiture devant une maison',
      seoTitle: 'Vendre sa voiture en ligne | Guide pour une meilleure annonce',
      metaDescription: 'Guide pour vendre sa voiture entre particuliers avec de bonnes photos, une description claire et un processus plus sûr.',
    },
    es: {
      title: 'Vender un coche online entre particulares: una guía paso a paso',
      excerpt: 'Haz que tu coche sea más fácil de vender con buenas fotos, información clara y un proceso más seguro en Autorell.',
      body: [
        ['heading', 2, 'Un buen anuncio empieza antes del título'],
        ['paragraph', 1, 'Al vender un coche entre particulares, la primera impresión importa. Los compradores comparan varios vehículos y eligen rápidamente los anuncios que parecen serios.'],
        ['paragraph', 1, 'Fotografía exterior, interior, maletero, salpicadero, neumáticos y daños visibles. La transparencia ahorra tiempo y genera confianza.'],
        ['heading', 2, 'Qué incluir en la descripción'],
        ['paragraph', 1, 'Describe estado, equipamiento, historial de mantenimiento y motivo de venta. Incluye año, kilometraje, combustible, cambio, inspección, neumáticos de invierno y reparaciones relevantes.'],
        ['heading', 2, 'Cómo ayuda Autorell'],
        ['paragraph', 1, 'Autorell hace que los anuncios sean claros y comparables. Tu coche puede encontrarse por marca, modelo, ubicación y categoría.'],
      ],
      tags: ['Vender coche', 'Venta particular', 'Anuncio coche', 'Venta segura'],
      imageAlt: 'Familia junto a un coche fuera de una casa',
      seoTitle: 'Vender coche online | Guía para un mejor anuncio',
      metaDescription: 'Guía para vender un coche entre particulares online con mejores fotos, descripción clara y un proceso más seguro.',
    },
    it: {
      title: 'Vendere auto da privato online: guida per un annuncio migliore',
      excerpt: 'Rendi l’auto più facile da vendere con foto corrette, informazioni chiare e un flusso più sicuro su Autorell.',
      body: [
        ['heading', 2, 'Un buon annuncio inizia prima del titolo'],
        ['paragraph', 1, 'Quando vendi un’auto da privato, la prima impressione è decisiva. Gli acquirenti confrontano molte auto e scelgono gli annunci più credibili.'],
        ['paragraph', 1, 'Fotografa esterni, interni, bagagliaio, cruscotto, pneumatici e difetti visibili. Un annuncio trasparente fa risparmiare tempo e crea fiducia.'],
        ['heading', 2, 'Cosa inserire nella descrizione'],
        ['paragraph', 1, 'Descrivi condizioni, dotazioni, manutenzione e motivo della vendita. Indica anno, chilometri, carburante, cambio, revisione, gomme invernali e riparazioni importanti.'],
        ['heading', 2, 'Come aiuta Autorell'],
        ['paragraph', 1, 'Autorell rende gli annunci chiari e confrontabili. L’auto può essere trovata per marca, modello, località e categoria.'],
      ],
      tags: ['Vendere auto', 'Vendita privata', 'Annuncio auto', 'Vendita sicura'],
      imageAlt: 'Famiglia accanto a un’auto fuori casa',
      seoTitle: 'Vendere auto online | Guida per un annuncio migliore',
      metaDescription: 'Guida per vendere auto da privato online con foto migliori, descrizione chiara e processo più sicuro.',
    },
    nl: {
      title: 'Privé een auto online verkopen: stap voor stap naar een betere advertentie',
      excerpt: 'Maak je auto makkelijker verkoopbaar met goede foto’s, duidelijke informatie en een veiliger verkoopproces op Autorell.',
      body: [
        ['heading', 2, 'Een goede advertentie begint vóór de titel'],
        ['paragraph', 1, 'Bij particuliere autoverkoop telt de eerste indruk. Kopers vergelijken meerdere auto’s en kiezen snel welke advertenties betrouwbaar voelen.'],
        ['paragraph', 1, 'Fotografeer buitenkant, interieur, kofferbak, dashboard, banden en zichtbare schade. Transparantie bespaart tijd en wekt vertrouwen.'],
        ['heading', 2, 'Wat zet je in de beschrijving?'],
        ['paragraph', 1, 'Beschrijf staat, uitrusting, onderhoudshistorie en verkoopreden. Vermeld bouwjaar, kilometerstand, brandstof, transmissie, keuring, winterbanden en grote reparaties.'],
        ['heading', 2, 'Hoe Autorell helpt'],
        ['paragraph', 1, 'Autorell maakt voertuigadvertenties duidelijk en vergelijkbaar. Je auto is vindbaar op merk, model, plaats en categorie.'],
      ],
      tags: ['Auto verkopen', 'Particuliere verkoop', 'Auto advertentie', 'Veilige deal'],
      imageAlt: 'Gezin bij een auto voor een woning',
      seoTitle: 'Auto privé online verkopen | Gids voor een betere advertentie',
      metaDescription: 'Gids voor particuliere autoverkoop online met betere foto’s, duidelijke informatie en een veiliger proces.',
    },
    pl: {
      title: 'Sprzedaż auta prywatnie online: krok po kroku do lepszego ogłoszenia',
      excerpt: 'Spraw, aby samochód łatwiej się sprzedał dzięki dobrym zdjęciom, jasnym informacjom i bezpieczniejszemu procesowi w Autorell.',
      body: [
        ['heading', 2, 'Dobre ogłoszenie zaczyna się przed tytułem'],
        ['paragraph', 1, 'Przy prywatnej sprzedaży auta pierwsze wrażenie ma znaczenie. Kupujący porównują wiele pojazdów i szybko wybierają ogłoszenia, które wyglądają wiarygodnie.'],
        ['paragraph', 1, 'Pokaż nadwozie, wnętrze, bagażnik, deskę rozdzielczą, opony i widoczne uszkodzenia. Przejrzystość oszczędza czas i buduje zaufanie.'],
        ['heading', 2, 'Co zawrzeć w opisie?'],
        ['paragraph', 1, 'Opisz stan, wyposażenie, historię serwisową i powód sprzedaży. Dodaj rocznik, przebieg, paliwo, skrzynię, przegląd, opony zimowe i ważne naprawy.'],
        ['heading', 2, 'Jak pomaga Autorell'],
        ['paragraph', 1, 'Autorell sprawia, że ogłoszenia są jasne i porównywalne. Auto można znaleźć po marce, modelu, lokalizacji i kategorii.'],
      ],
      tags: ['Sprzedaż auta', 'Sprzedaż prywatna', 'Ogłoszenie samochodu', 'Bezpieczna sprzedaż'],
      imageAlt: 'Rodzina przy samochodzie przed domem',
      seoTitle: 'Sprzedaj auto prywatnie online | Poradnik lepszego ogłoszenia',
      metaDescription: 'Poradnik prywatnej sprzedaży auta online: lepsze zdjęcia, jasny opis i bezpieczniejszy proces kontaktu z kupującym.',
    },
    da: {
      title: 'Sælg bil privat online: trin for trin til en bedre annonce',
      excerpt: 'Gør bilen lettere at sælge med gode billeder, tydelige oplysninger og et tryggere salgsflow på Autorell.',
      body: [
        ['heading', 2, 'En god bilannonce starter før overskriften'],
        ['paragraph', 1, 'Når du sælger bil privat, er første indtryk afgørende. Købere sammenligner flere biler og vælger hurtigt de annoncer, der virker seriøse.'],
        ['paragraph', 1, 'Fotografér eksteriør, interiør, bagagerum, instrumentbræt, dæk og synlige skader. En transparent annonce sparer tid og skaber tillid.'],
        ['heading', 2, 'Hvad skal beskrivelsen indeholde?'],
        ['paragraph', 1, 'Beskriv stand, udstyr, servicehistorik og salgsårsag. Angiv årgang, kilometer, brændstof, gearkasse, syn, vinterdæk og større reparationer.'],
        ['heading', 2, 'Sådan hjælper Autorell'],
        ['paragraph', 1, 'Autorell gør køretøjsannoncer tydelige og sammenlignelige. Bilen kan findes via mærke, model, by og kategori.'],
      ],
      tags: ['Sælg bil', 'Privatsalg', 'Bilannonce', 'Tryg handel'],
      imageAlt: 'Familie ved en bil foran et hjem',
      seoTitle: 'Sælg bil privat online | Guide til bedre annonce',
      metaDescription: 'Guide til privat bilsalg online med bedre billeder, tydelig beskrivelse og en tryggere proces.',
    },
    fi: {
      title: 'Auton myynti yksityisesti verkossa: parempi ilmoitus vaihe vaiheelta',
      excerpt: 'Tee autosta helpommin myytävä hyvillä kuvilla, selkeillä tiedoilla ja turvallisemmalla myyntipolulla Autorellissä.',
      body: [
        ['heading', 2, 'Hyvä autoilmoitus alkaa ennen otsikkoa'],
        ['paragraph', 1, 'Yksityisessä autonmyynnissä ensivaikutelma ratkaisee. Ostajat vertaavat useita autoja ja valitsevat nopeasti ilmoitukset, jotka tuntuvat luotettavilta.'],
        ['paragraph', 1, 'Kuvaa ulkoa, sisältä, tavaratila, kojelauta, renkaat ja näkyvät vauriot. Läpinäkyvä ilmoitus säästää aikaa ja lisää luottamusta.'],
        ['heading', 2, 'Mitä kuvaukseen kannattaa lisätä?'],
        ['paragraph', 1, 'Kerro kunto, varusteet, huoltohistoria ja myynnin syy. Lisää vuosimalli, kilometrit, polttoaine, vaihteisto, katsastus, talvirenkaat ja suuret korjaukset.'],
        ['heading', 2, 'Miten Autorell auttaa'],
        ['paragraph', 1, 'Autorell tekee ajoneuvoilmoituksista selkeitä ja vertailtavia. Auto löytyy merkin, mallin, paikkakunnan ja kategorian perusteella.'],
      ],
      tags: ['Myy auto', 'Yksityismyynti', 'Autoilmoitus', 'Turvallinen kauppa'],
      imageAlt: 'Perhe auton vieressä kodin edessä',
      seoTitle: 'Myy auto yksityisesti verkossa | Opas parempaan ilmoitukseen',
      metaDescription: 'Opas yksityiseen autonmyyntiin verkossa: paremmat kuvat, selkeä kuvaus ja turvallisempi myyntiprosessi.',
    },
  },
  'sell-tractors-and-farm-machinery': {
    sv: {
      title: 'Sälja traktor och lantbruksmaskiner: så når du rätt köpare',
      excerpt: 'Lantbruksmaskiner kräver tydliga uppgifter, bra bilder och rätt kategori. Så bygger du en annons som fungerar.',
      body: [
        ['heading', 2, 'Köpare av lantbruksmaskiner söker specifikt'],
        ['paragraph', 1, 'Den som letar efter traktor, spruta, balpress, plog eller lastare vet ofta exakt vilken kapacitet och utrustning som behövs. Därför måste annonsen vara konkret.'],
        ['paragraph', 1, 'Märke, modell, årsmodell, timmar, effekt, däck, hydraulik, frontlastare, redskap och servicehistorik är uppgifter som snabbt avgör om objektet är relevant.'],
        ['heading', 2, 'Bilderna ska visa skick och funktion'],
        ['paragraph', 1, 'Ta bilder i god belysning och visa maskinen från alla sidor. Lägg extra fokus på däck, redskapsfästen, hytt, reglage, hydraulik, motorutrymme och slitagepunkter.'],
        ['heading', 2, 'Sälj över en bredare marknad'],
        ['paragraph', 1, 'Efterfrågan på lantbruksmaskiner varierar mellan regioner och säsonger. Med Autorell kan objektet bli lättare att hitta för köpare som söker rätt kategori, märke och användningsområde.'],
      ],
      tags: ['Sälja traktor', 'Lantbruksmaskiner', 'Traktor', 'Maskinhandel'],
      imageAlt: 'Lantbruksmaskin på fält i solnedgång',
      seoTitle: 'Sälja traktor och lantbruksmaskiner | Guide för bättre annonser',
      metaDescription: 'Så säljer du traktor och lantbruksmaskiner online med tydliga bilder, rätt kategori, maskindata och en seriös säljprocess.',
    },
    en: {
      title: 'Selling tractors and farm machinery: how to reach the right buyers',
      excerpt: 'Agricultural machinery needs clear data, strong photos and the right category. Here is how to build a listing that works.',
      body: [
        ['heading', 2, 'Farm machinery buyers search with precision'],
        ['paragraph', 1, 'A buyer looking for a tractor, sprayer, baler, plough or loader often knows exactly what capacity and equipment is needed. The listing must therefore be specific.'],
        ['paragraph', 1, 'Make, model, year, hours, power, tyres, hydraulics, front loader, attachments and service history quickly determine whether the machine is relevant.'],
        ['heading', 2, 'Photos should show condition and function'],
        ['paragraph', 1, 'Use good light and show the machine from all sides. Focus on tyres, attachments, cab, controls, hydraulics, engine bay and wear points.'],
        ['heading', 2, 'Sell across a wider market'],
        ['paragraph', 1, 'Demand for farm machinery varies by region and season. Autorell helps the machine become easier to find by category, make and use case.'],
      ],
      tags: ['Sell tractor', 'Farm machinery', 'Tractor', 'Machine trade'],
      imageAlt: 'Agricultural machine working in a field at sunset',
      seoTitle: 'Sell tractors and farm machinery | Guide to better listings',
      metaDescription: 'How to sell tractors and farm machinery online with clear photos, the right category, machine data and a serious process.',
    },
    de: {
      title: 'Traktor und Landmaschinen verkaufen: so erreichen Sie passende Käufer',
      excerpt: 'Landmaschinen brauchen klare Daten, gute Fotos und die richtige Kategorie. So entsteht ein Inserat, das funktioniert.',
      body: [
        ['heading', 2, 'Käufer von Landmaschinen suchen sehr gezielt'],
        ['paragraph', 1, 'Wer Traktor, Spritze, Presse, Pflug oder Lader sucht, kennt meist die benötigte Leistung und Ausstattung. Das Inserat muss deshalb konkret sein.'],
        ['paragraph', 1, 'Marke, Modell, Baujahr, Betriebsstunden, Leistung, Reifen, Hydraulik, Frontlader, Anbaugeräte und Servicehistorie entscheiden schnell über Relevanz.'],
        ['heading', 2, 'Fotos zeigen Zustand und Funktion'],
        ['paragraph', 1, 'Fotografieren Sie die Maschine bei gutem Licht von allen Seiten. Zeigen Sie Reifen, Anbaupunkte, Kabine, Bedienelemente, Hydraulik, Motorraum und Verschleißstellen.'],
        ['heading', 2, 'Über einen größeren Markt verkaufen'],
        ['paragraph', 1, 'Die Nachfrage nach Landmaschinen variiert nach Region und Saison. Autorell macht Maschinen nach Kategorie, Marke und Einsatzbereich leichter auffindbar.'],
      ],
      tags: ['Traktor verkaufen', 'Landmaschinen', 'Traktor', 'Maschinenhandel'],
      imageAlt: 'Landmaschine auf einem Feld bei Sonnenuntergang',
      seoTitle: 'Traktor und Landmaschinen verkaufen | Leitfaden für Inserate',
      metaDescription: 'So verkaufen Sie Traktoren und Landmaschinen online mit klaren Fotos, richtiger Kategorie und wichtigen Maschinendaten.',
    },
    fr: {
      title: 'Vendre un tracteur et des machines agricoles : trouver les bons acheteurs',
      excerpt: 'Les machines agricoles exigent des données précises, de bonnes photos et la bonne catégorie.',
      body: [
        ['heading', 2, 'Les acheteurs de machines agricoles recherchent précisément'],
        ['paragraph', 1, 'Un acheteur de tracteur, pulvérisateur, presse, charrue ou chargeur connaît souvent la capacité et l’équipement nécessaires. L’annonce doit donc être concrète.'],
        ['paragraph', 1, 'Marque, modèle, année, heures, puissance, pneus, hydraulique, chargeur frontal, outils et historique d’entretien déterminent vite la pertinence.'],
        ['heading', 2, 'Les photos doivent montrer l’état et la fonction'],
        ['paragraph', 1, 'Photographiez la machine sous une bonne lumière et de tous les côtés. Montrez pneus, attaches, cabine, commandes, hydraulique, moteur et zones d’usure.'],
        ['heading', 2, 'Vendre sur un marché plus large'],
        ['paragraph', 1, 'La demande varie selon les régions et les saisons. Autorell aide l’acheteur à trouver la machine par catégorie, marque et usage.'],
      ],
      tags: ['Vendre tracteur', 'Machines agricoles', 'Tracteur', 'Matériel agricole'],
      imageAlt: 'Machine agricole dans un champ au coucher du soleil',
      seoTitle: 'Vendre tracteur et machines agricoles | Guide annonce',
      metaDescription: 'Comment vendre un tracteur ou une machine agricole avec photos claires, bonne catégorie et données complètes.',
    },
    es: {
      title: 'Vender tractores y maquinaria agrícola: cómo llegar al comprador adecuado',
      excerpt: 'La maquinaria agrícola necesita datos claros, buenas fotos y la categoría correcta.',
      body: [
        ['heading', 2, 'Los compradores buscan con precisión'],
        ['paragraph', 1, 'Quien busca un tractor, pulverizador, empacadora, arado o cargador suele saber exactamente qué capacidad y equipamiento necesita.'],
        ['paragraph', 1, 'Marca, modelo, año, horas, potencia, neumáticos, hidráulica, pala, aperos e historial de mantenimiento determinan rápidamente si interesa.'],
        ['heading', 2, 'Las fotos deben mostrar estado y función'],
        ['paragraph', 1, 'Fotografía la máquina con buena luz desde todos los lados. Muestra neumáticos, enganches, cabina, mandos, hidráulica, motor y zonas de desgaste.'],
        ['heading', 2, 'Vende en un mercado más amplio'],
        ['paragraph', 1, 'La demanda varía por región y temporada. Autorell ayuda a que la máquina sea más fácil de encontrar por categoría, marca y uso.'],
      ],
      tags: ['Vender tractor', 'Maquinaria agrícola', 'Tractor', 'Maquinaria'],
      imageAlt: 'Máquina agrícola trabajando en un campo al atardecer',
      seoTitle: 'Vender tractores y maquinaria agrícola | Guía de anuncios',
      metaDescription: 'Cómo vender tractores y maquinaria agrícola online con fotos claras, categoría correcta y datos completos.',
    },
    it: {
      title: 'Vendere trattori e macchine agricole: raggiungere gli acquirenti giusti',
      excerpt: 'Le macchine agricole richiedono dati chiari, buone foto e la categoria corretta.',
      body: [
        ['heading', 2, 'Gli acquirenti cercano in modo preciso'],
        ['paragraph', 1, 'Chi cerca trattore, irroratrice, pressa, aratro o caricatore sa spesso quale capacità e dotazione servono. L’annuncio deve essere specifico.'],
        ['paragraph', 1, 'Marca, modello, anno, ore, potenza, pneumatici, idraulica, caricatore frontale, attrezzi e manutenzione determinano l’interesse.'],
        ['heading', 2, 'Le foto devono mostrare stato e funzione'],
        ['paragraph', 1, 'Fotografa la macchina con buona luce da tutti i lati. Mostra pneumatici, attacchi, cabina, comandi, idraulica, motore e punti di usura.'],
        ['heading', 2, 'Vendere su un mercato più ampio'],
        ['paragraph', 1, 'La domanda varia per regione e stagione. Autorell rende la macchina più facile da trovare per categoria, marca e utilizzo.'],
      ],
      tags: ['Vendere trattore', 'Macchine agricole', 'Trattore', 'Macchine'],
      imageAlt: 'Macchina agricola in un campo al tramonto',
      seoTitle: 'Vendere trattori e macchine agricole | Guida annunci',
      metaDescription: 'Come vendere trattori e macchine agricole online con foto chiare, categoria corretta e dati completi.',
    },
    nl: {
      title: 'Tractoren en landbouwmachines verkopen: bereik de juiste koper',
      excerpt: 'Landbouwmachines vragen om duidelijke gegevens, goede foto’s en de juiste categorie.',
      body: [
        ['heading', 2, 'Kopers zoeken heel gericht'],
        ['paragraph', 1, 'Wie een tractor, spuit, pers, ploeg of lader zoekt, weet vaak precies welke capaciteit en uitrusting nodig zijn. De advertentie moet concreet zijn.'],
        ['paragraph', 1, 'Merk, model, bouwjaar, uren, vermogen, banden, hydrauliek, voorlader, werktuigen en onderhoudshistorie bepalen snel of de machine relevant is.'],
        ['heading', 2, 'Foto’s tonen staat en functie'],
        ['paragraph', 1, 'Fotografeer de machine bij goed licht van alle kanten. Toon banden, koppelingen, cabine, bediening, hydrauliek, motorruimte en slijtagepunten.'],
        ['heading', 2, 'Verkoop op een bredere markt'],
        ['paragraph', 1, 'De vraag verschilt per regio en seizoen. Autorell maakt de machine vindbaar op categorie, merk en gebruik.'],
      ],
      tags: ['Tractor verkopen', 'Landbouwmachines', 'Tractor', 'Machinehandel'],
      imageAlt: 'Landbouwmachine op een veld bij zonsondergang',
      seoTitle: 'Tractoren en landbouwmachines verkopen | Gids',
      metaDescription: 'Verkoop tractoren en landbouwmachines online met duidelijke foto’s, juiste categorie en complete machinegegevens.',
    },
    pl: {
      title: 'Sprzedaż traktorów i maszyn rolniczych: jak dotrzeć do właściwych kupujących',
      excerpt: 'Maszyny rolnicze wymagają jasnych danych, dobrych zdjęć i odpowiedniej kategorii.',
      body: [
        ['heading', 2, 'Kupujący maszyny rolnicze szukają konkretnie'],
        ['paragraph', 1, 'Osoba szukająca traktora, opryskiwacza, prasy, pługa lub ładowacza zwykle zna potrzebną wydajność i wyposażenie. Ogłoszenie musi być konkretne.'],
        ['paragraph', 1, 'Marka, model, rok, motogodziny, moc, opony, hydraulika, ładowacz, osprzęt i historia serwisu szybko decydują o zainteresowaniu.'],
        ['heading', 2, 'Zdjęcia powinny pokazywać stan i funkcję'],
        ['paragraph', 1, 'Fotografuj maszynę w dobrym świetle z każdej strony. Pokaż opony, mocowania, kabinę, sterowanie, hydraulikę, silnik i miejsca zużycia.'],
        ['heading', 2, 'Sprzedawaj na szerszym rynku'],
        ['paragraph', 1, 'Popyt na maszyny rolnicze zależy od regionu i sezonu. Autorell pomaga znaleźć maszynę po kategorii, marce i zastosowaniu.'],
      ],
      tags: ['Sprzedaż traktora', 'Maszyny rolnicze', 'Traktor', 'Handel maszynami'],
      imageAlt: 'Maszyna rolnicza na polu o zachodzie słońca',
      seoTitle: 'Sprzedaj traktor i maszyny rolnicze | Poradnik ogłoszeń',
      metaDescription: 'Jak sprzedać traktor i maszyny rolnicze online dzięki zdjęciom, właściwej kategorii i pełnym danym maszyny.',
    },
    da: {
      title: 'Sælg traktor og landbrugsmaskiner: nå de rette købere',
      excerpt: 'Landbrugsmaskiner kræver tydelige data, gode billeder og den rigtige kategori.',
      body: [
        ['heading', 2, 'Købere søger meget specifikt'],
        ['paragraph', 1, 'Den der leder efter traktor, sprøjte, presser, plov eller læsser ved ofte præcis, hvilken kapacitet og hvilket udstyr der kræves.'],
        ['paragraph', 1, 'Mærke, model, årgang, timer, effekt, dæk, hydraulik, frontlæsser, redskaber og servicehistorik afgør hurtigt relevansen.'],
        ['heading', 2, 'Billeder skal vise stand og funktion'],
        ['paragraph', 1, 'Tag billeder i godt lys fra alle sider. Vis dæk, redskabsfæster, kabine, betjening, hydraulik, motor og slidpunkter.'],
        ['heading', 2, 'Sælg på et bredere marked'],
        ['paragraph', 1, 'Efterspørgslen varierer efter region og sæson. Autorell gør maskinen lettere at finde efter kategori, mærke og anvendelse.'],
      ],
      tags: ['Sælg traktor', 'Landbrugsmaskiner', 'Traktor', 'Maskinhandel'],
      imageAlt: 'Landbrugsmaskine på mark ved solnedgang',
      seoTitle: 'Sælg traktor og landbrugsmaskiner | Guide',
      metaDescription: 'Sådan sælger du traktor og landbrugsmaskiner online med tydelige billeder, rigtig kategori og gode maskindata.',
    },
    fi: {
      title: 'Traktorien ja maatalouskoneiden myynti: tavoita oikeat ostajat',
      excerpt: 'Maatalouskoneet tarvitsevat selkeät tiedot, hyvät kuvat ja oikean kategorian.',
      body: [
        ['heading', 2, 'Ostajat etsivät hyvin tarkasti'],
        ['paragraph', 1, 'Traktoria, ruiskua, paalainta, auraa tai kuormaajaa etsivä ostaja tietää usein tarkasti tarvittavan kapasiteetin ja varusteet. Ilmoituksen pitää olla konkreettinen.'],
        ['paragraph', 1, 'Merkki, malli, vuosimalli, tunnit, teho, renkaat, hydrauliikka, etukuormaaja, työvälineet ja huoltohistoria ratkaisevat kiinnostuksen nopeasti.'],
        ['heading', 2, 'Kuvien pitää näyttää kunto ja toiminta'],
        ['paragraph', 1, 'Kuvaa kone hyvässä valossa kaikilta sivuilta. Näytä renkaat, kiinnikkeet, ohjaamo, hallintalaitteet, hydrauliikka, moottori ja kulumakohdat.'],
        ['heading', 2, 'Myy laajemmalle markkinalle'],
        ['paragraph', 1, 'Maatalouskoneiden kysyntä vaihtelee alueen ja kauden mukaan. Autorell auttaa ostajia löytämään koneen kategorian, merkin ja käyttötarkoituksen perusteella.'],
      ],
      tags: ['Myy traktori', 'Maatalouskoneet', 'Traktori', 'Konekauppa'],
      imageAlt: 'Maatalouskone pellolla auringonlaskussa',
      seoTitle: 'Myy traktori ja maatalouskoneet | Opas ilmoituksiin',
      metaDescription: 'Näin myyt traktorin ja maatalouskoneet verkossa selkeillä kuvilla, oikealla kategorialla ja koneen tiedoilla.',
    },
  },
}

function localizedFallbackCategories(language: string) {
  const labels = fallbackCategoryLabels[toFallbackLanguage(language)]
  return fallbackCategories.map((category) => ({
    ...category,
    label: labels[category.key] || category.label,
  }))
}

function localizedFallbackArticles(language: string) {
  const lang = toFallbackLanguage(language)
  const categories = localizedFallbackCategories(lang)
  const categoryByKey = new Map(categories.map((category) => [category.key, category]))
  return fallbackArticles.map((article) => {
    const translation = fallbackTranslations[article.slug]?.[lang] || fallbackTranslations[article.slug]?.en
    if (!translation) return article
    return {
      ...article,
      title: translation.title,
      excerpt: translation.excerpt,
      body: articleDoc(translation.body),
      category: article.category ? categoryByKey.get(article.category.key) || article.category : null,
      tags: translation.tags,
      imageAlt: translation.imageAlt,
      seoTitle: translation.seoTitle,
      metaDescription: translation.metaDescription,
    }
  })
}

function toFallbackLanguage(language: string): VehicleNewsLanguage {
  if (language === 'sv' || language === 'de' || language === 'fr' || language === 'es' || language === 'it' || language === 'nl' || language === 'pl' || language === 'da' || language === 'fi') return language
  return 'en'
}

function articleDoc(blocks: Array<['heading' | 'paragraph', number, string]>) {
  return {
    type: 'doc',
    content: blocks.map(([type, level, text]) => ({
      type,
      level,
      text,
      bold: false,
    })),
  }
}

function languageForMarket(market: string) {
  const normalized = market.toLowerCase()
  if (normalized === 'se') return 'sv'
  if (normalized === 'de' || normalized === 'at') return 'de'
  if (normalized === 'fr') return 'fr'
  if (normalized === 'es') return 'es'
  if (normalized === 'pl') return 'pl'
  if (normalized === 'it') return 'it'
  if (normalized === 'nl' || normalized === 'be') return 'nl'
  if (normalized === 'fi') return 'fi'
  if (normalized === 'dk') return 'da'
  return 'en'
}

function localizedCategory(translations: unknown, language: string, fallback: string) {
  if (!translations || typeof translations !== 'object') return fallback
  const values = translations as Record<string, unknown>
  return String(values[language] || values.en || fallback)
}

function createContentAdmin() {
  try {
    return createAdminClient()
  } catch {
    return null
  }
}

function mapArticle(row: Record<string, unknown>, media: Record<string, unknown> | null): PublicNewsArticle {
  const categoryRow = row.content_categories as Record<string, unknown> | null
  const category = categoryRow ? {
    id: String(categoryRow.id),
    key: String(categoryRow.category_key),
    label: localizedCategory(categoryRow.translations, String(row.language), String(categoryRow.category_key)),
  } : null
  const variants = media?.variants && typeof media.variants === 'object'
    ? media.variants as Record<string, { url?: string } | undefined>
    : {}
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    excerpt: String(row.excerpt || ''),
    body: row.body && typeof row.body === 'object' ? row.body as Record<string, unknown> : {},
    author: String(row.author_name || 'Autorell Redaktion'),
    publishedAt: String(row.published_at),
    updatedAt: String(row.updated_at),
    readingTime: Number(row.reading_time_minutes || 1),
    category,
    tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    imageUrl: variants.article?.url || variants.newsCard?.url || variants.thumbnail?.url || String(media?.public_url || '') || null,
    imageAlt: String(media?.alt_text || row.title),
    imageCaption: media?.caption ? String(media.caption) : null,
    seoTitle: row.seo_title ? String(row.seo_title) : null,
    metaDescription: row.meta_description ? String(row.meta_description) : null,
    canonicalUrl: row.canonical_url ? String(row.canonical_url) : null,
    viewCount: Number(row.view_count || 0),
    relatedPostIds: Array.isArray(row.related_post_ids) ? row.related_post_ids.map(String) : [],
  }
}

const publicSelect = 'id,slug,title,excerpt,body,language,market,author_name,published_at,updated_at,reading_time_minutes,tags,seo_title,meta_description,canonical_url,view_count,related_post_ids,hero_media_id,content_categories(id,category_key,translations)'

export async function getVehicleNews(market: string, page = 1, pageSize = 12) {
  const language = languageForMarket(market)
  const admin = createContentAdmin()
  if (!admin) return { articles: fallbackNewsPage(language, page, pageSize), categories: localizedFallbackCategories(language), count: fallbackArticles.length, unavailable: false }
  const from = Math.max(0, page - 1) * pageSize
  const { data, count, error } = await admin
    .from('content_posts')
    .select(publicSelect, { count: 'exact' })
    .eq('post_type', 'news')
    .eq('status', 'published')
    .eq('market', market.toUpperCase())
    .eq('language', language)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .range(from, from + pageSize - 1)

  if (error) return { articles: fallbackNewsPage(language, page, pageSize), categories: localizedFallbackCategories(language), count: fallbackArticles.length, unavailable: false }
  const rows = (data || []) as unknown as Record<string, unknown>[]
  const mediaIds = rows.map((row) => String(row.hero_media_id || '')).filter(Boolean)
  const { data: mediaRows } = mediaIds.length
    ? await admin.from('media_assets').select('id,public_url,variants,alt_text,caption').in('id', mediaIds)
    : { data: [] }
  const mediaById = new Map((mediaRows || []).map((item) => [String(item.id), item as Record<string, unknown>]))
  const { data: categoryRows } = await admin
    .from('content_categories')
    .select('id,category_key,translations')
    .eq('is_active', true)
    .order('sort_order')

  return {
    articles: rows.length ? rows.map((row) => mapArticle(row, mediaById.get(String(row.hero_media_id)) || null)) : fallbackNewsPage(language, page, pageSize),
    categories: rows.length && categoryRows?.length ? ((categoryRows || []) as Record<string, unknown>[]).map((row) => ({
      id: String(row.id),
      key: String(row.category_key),
      label: localizedCategory(row.translations, language, String(row.category_key)),
    })) : localizedFallbackCategories(language),
    count: rows.length ? count || 0 : fallbackArticles.length,
    unavailable: false,
  }
}

export async function getVehicleNewsFeaturedListings(market: string, limit = 3): Promise<PublicNewsListing[]> {
  try {
    const countryCode = market.toLowerCase() === 'en' ? null : market.toUpperCase()
    const locale = listingLocaleForMarket(market)
    const listings = await getFeaturedMarketplaceHomeListings(countryCode, limit)
    return listings.map((listing) => {
      const row = listing as Record<string, unknown>
      const price = Number(row.price)
      const currency = String(row.currency || 'EUR').toUpperCase()
      const title = String(row.title || '')
      const city = String(row.city || row.municipality || '').trim()
      const country = String(row.country_code || '').toUpperCase()
      const meta = [
        row.model_year ? String(row.model_year) : null,
        row.make ? String(row.make) : null,
        row.model ? String(row.model) : null,
      ].filter(Boolean).join(' | ')
      return {
        id: String(row.id),
        title,
        href: buildListingPath({
          id: String(row.id),
          title,
          make: row.make ? String(row.make) : null,
          model: row.model ? String(row.model) : null,
          model_year: row.model_year ? String(row.model_year) : null,
          city: city || null,
          country_code: country || null,
        }, locale),
        imageUrl: Array.isArray(row.images) && typeof row.images[0] === 'string' ? row.images[0] : null,
        priceLabel: Number.isFinite(price) && price > 0
          ? `${price.toLocaleString(localeNumberTag(locale), { maximumFractionDigits: 0 })} ${currency}`
          : vehicleNewsListingPriceOnRequest(market),
        location: [city, country].filter(Boolean).join(', '),
        meta,
      }
    })
  } catch {
    return []
  }
}

export async function getVehicleNewsArticle(market: string, slug: string, previewToken?: string) {
  const language = languageForMarket(market)
  const admin = createContentAdmin()
  if (!admin) {
    const fallback = localizedFallbackArticles(language).find((article) => article.slug === slug)
    return fallback ? { article: fallback, preview: false } : null
  }
  let previewPostId = ''
  if (previewToken) {
    const tokenHash = createHash('sha256').update(previewToken).digest('hex')
    const { data: token } = await admin
      .from('content_preview_tokens')
      .select('post_id')
      .eq('token_hash', tokenHash)
      .is('revoked_at', null)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle()
    previewPostId = String(token?.post_id || '')
  }

  let query = admin.from('content_posts').select(publicSelect).eq('slug', slug).eq('market', market.toUpperCase()).eq('language', language)
  query = previewPostId
    ? query.eq('id', previewPostId)
    : query.eq('status', 'published').lte('published_at', new Date().toISOString())
  const { data: row, error } = await query.maybeSingle()
  if (error || !row) {
    const fallback = localizedFallbackArticles(language).find((article) => article.slug === slug)
    return fallback ? { article: fallback, preview: false } : null
  }
  const typedRow = row as unknown as Record<string, unknown>
  const { data: media } = typedRow.hero_media_id
    ? await admin.from('media_assets').select('id,public_url,variants,alt_text,caption').eq('id', String(typedRow.hero_media_id)).maybeSingle()
    : { data: null }
  return { article: mapArticle(typedRow, media as Record<string, unknown> | null), preview: Boolean(previewPostId) }
}

function listingLocaleForMarket(market: string): 'sv' | 'de' | 'en' | 'at' | 'be' | 'fr' | 'es' | 'it' | 'pl' | 'nl' | 'fi' | 'da' {
  const normalized = market.toLowerCase()
  if (normalized === 'se') return 'sv'
  if (normalized === 'dk') return 'da'
  if (normalized === 'de' || normalized === 'at' || normalized === 'be' || normalized === 'fr' || normalized === 'es' || normalized === 'it' || normalized === 'pl' || normalized === 'nl' || normalized === 'fi') return normalized
  return 'en'
}

function localeNumberTag(locale: ReturnType<typeof listingLocaleForMarket>) {
  const tags: Record<string, string> = {
    sv: 'sv-SE',
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
    en: 'en-GB',
  }
  return tags[locale] || 'en-GB'
}

function vehicleNewsListingPriceOnRequest(market: string) {
  const language = languageForMarket(market)
  const labels = {
    sv: 'Pris på begäran',
    en: 'Price on request',
    de: 'Preis auf Anfrage',
    fr: 'Prix sur demande',
    es: 'Precio a consultar',
    it: 'Prezzo su richiesta',
    nl: 'Prijs op aanvraag',
    pl: 'Cena na zapytanie',
    da: 'Pris efter aftale',
    fi: 'Hinta pyynnöstä',
  }
  return labels[language]
}

function fallbackNewsPage(language: string, page: number, pageSize: number) {
  const from = Math.max(0, page - 1) * pageSize
  return localizedFallbackArticles(language).slice(from, from + pageSize)
}

export function articleBodyText(body: Record<string, unknown>) {
  return articleBodyBlocks(body).map((block) => block.text)
}

export function articleBodyBlocks(body: Record<string, unknown>): PublicNewsBodyBlock[] {
  const content = Array.isArray(body.content) ? body.content : []
  return content.map((block): PublicNewsBodyBlock | null => {
    if (!block || typeof block !== 'object') return null
    const value = block as Record<string, unknown>
    const text = typeof value.text === 'string' ? value.text.trim() : ''
    if (!text) return null
    const type = value.type === 'heading' ? 'heading' : 'paragraph'
    const level = Number(value.level)
    return {
      type,
      level: type === 'heading' && level >= 1 && level <= 6 ? level as PublicNewsBodyBlock['level'] : 1,
      text,
      bold: Boolean(value.bold),
    }
  }).filter((block): block is PublicNewsBodyBlock => Boolean(block))
}
