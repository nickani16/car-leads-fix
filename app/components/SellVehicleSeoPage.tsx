import Link from 'next/link'
import { headers } from 'next/headers'
import type { Metadata } from 'next'
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Camera,
  CarFront,
  CheckCircle2,
  FileText,
  Globe2,
  MessageSquareText,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'
import {
  isPublicLanguage,
  localizePublicHref,
  type PublicLocale,
} from '@/lib/public-i18n'
import { cleanSeoText } from '@/lib/market-seo'

type SellingCopy = {
  metaTitle: string
  metaDescription: string
  eyebrow: string
  title: string
  intro: string
  primaryCta: string
  businessCta: string
  proof: readonly string[]
  privateTitle: string
  privateIntro: string
  privatePoints: readonly { title: string; text: string }[]
  businessTitle: string
  businessIntro: string
  businessPoints: readonly { title: string; text: string }[]
  processTitle: string
  processIntro: string
  steps: readonly { title: string; text: string }[]
  seoTitle: string
  seoText: string
  faqTitle: string
  faqs: readonly { q: string; a: string }[]
  finalTitle: string
  finalText: string
}

const sellingCopy: Record<'en' | 'sv' | 'de' | 'fr' | 'es' | 'it' | 'nl' | 'pl' | 'da' | 'fi', SellingCopy> = {
  en: {
    metaTitle: 'Sell your car and vehicles online | Autorell',
    metaDescription: 'Sell a car, van, truck or business vehicle on Autorell. Built for private sellers, dealers and companies that want serious buyer enquiries.',
    eyebrow: 'Sell on Autorell',
    title: 'Sell your car or business vehicles with a listing built for serious buyers.',
    intro: 'Autorell helps private sellers and companies present vehicles clearly, reach buyers across Europe and keep every enquiry connected to the right listing.',
    primaryCta: 'Start selling',
    businessCta: 'Business sellers',
    proof: ['Private and business sellers', 'Listings built for search', 'European buyer reach'],
    privateTitle: 'Why private sellers choose Autorell',
    privateIntro: 'A private sale should feel clear from the first click. Autorell gives your vehicle a professional presentation without making the process complicated.',
    privatePoints: [
      { title: 'A clearer advert', text: 'Show photos, price, mileage, equipment, condition and location in a structure buyers can scan quickly.' },
      { title: 'More relevant buyers', text: 'Your car can be discovered through search, category pages and market pages instead of disappearing in a generic feed.' },
      { title: 'Less messy contact', text: 'Buyer questions stay connected to the listing, making it easier to answer and continue the conversation.' },
    ],
    businessTitle: 'Built for companies, dealers and recurring sellers',
    businessIntro: 'Companies need more than one advert. Autorell is designed to support inventory, brand trust and repeat selling flows.',
    businessPoints: [
      { title: 'Company presence', text: 'Present your company, stock and contact routes in a consistent way that feels credible to buyers.' },
      { title: 'Scalable listings', text: 'Publish cars, vans, trucks and specialist vehicles with a structure that can grow with your inventory.' },
      { title: 'Team-ready workflow', text: 'Business accounts can support multiple people working with the same company profile and listings.' },
    ],
    processTitle: 'How selling works',
    processIntro: 'The goal is simple: make the vehicle easy to understand, easy to find and easy to ask about.',
    steps: [
      { title: 'Create the listing', text: 'Add category, location, photos, vehicle data, description and seller information.' },
      { title: 'Publish with confidence', text: 'The listing is structured for marketplace search and relevant buyer intent.' },
      { title: 'Manage enquiries', text: 'Receive buyer questions with the listing context still attached.' },
      { title: 'Agree the sale', text: 'Buyer and seller agree payment, pickup, documents and handover directly.' },
    ],
    seoTitle: 'Sell cars, vans, trucks and machinery on Autorell',
    seoText: 'Autorell is made for people and companies that want a more organised way to sell vehicles online. Whether you are selling one used car, a van, a truck, a motorhome or a larger business inventory, the page is designed to help buyers understand the vehicle before they contact you. Clear information, relevant categories and European market context make the listing easier to compare and easier to trust.',
    faqTitle: 'Common questions',
    faqs: [
      { q: 'Can private sellers use Autorell?', a: 'Yes. Private sellers can create an account and publish a vehicle listing with photos, price, location and vehicle details.' },
      { q: 'Can companies sell several vehicles?', a: 'Yes. Business accounts are built for companies, dealers and teams that manage recurring listings.' },
      { q: 'Does Autorell handle the final sale?', a: 'Autorell provides the marketplace, listing and enquiry tools. Buyer and seller agree the final deal directly.' },
    ],
    finalTitle: 'Ready to sell on Autorell?',
    finalText: 'Start with one vehicle or set up a business account for recurring sales.',
  },
  sv: {
    metaTitle: 'Sälj bil och fordon online | Autorell',
    metaDescription: 'Sälj bil, transportbil, lastbil eller företagsfordon på Autorell. För privatpersoner, handlare och företag som vill nå seriösa köpare.',
    eyebrow: 'Sälj på Autorell',
    title: 'Sälj din bil eller företagets fordon med en annons byggd för seriösa köpare.',
    intro: 'Autorell hjälper privatpersoner och företag att presentera fordon tydligt, nå köpare i Europa och hålla varje förfrågan kopplad till rätt annons.',
    primaryCta: 'Börja sälja',
    businessCta: 'För företag',
    proof: ['Privat och företag', 'Byggt för sök', 'Europeisk räckvidd'],
    privateTitle: 'Därför säljer privatpersoner på Autorell',
    privateIntro: 'Att sälja bil privat ska kännas tydligt från första klicket. Autorell ger fordonet en seriös presentation utan att göra processen krånglig.',
    privatePoints: [
      { title: 'En tydligare annons', text: 'Visa bilder, pris, miltal, utrustning, skick och ort i ett format som köpare snabbt kan förstå.' },
      { title: 'Mer relevanta köpare', text: 'Bilen kan hittas via sök, kategorier och marknadssidor i stället för att försvinna i ett vanligt flöde.' },
      { title: 'Mindre rörig kontakt', text: 'Frågor från köpare kopplas till annonsen, så dialogen blir lättare att följa och besvara.' },
    ],
    businessTitle: 'Byggt för företag, handlare och återkommande säljare',
    businessIntro: 'Företag behöver mer än en enskild annons. Autorell är byggt för lager, förtroende och återkommande försäljning.',
    businessPoints: [
      { title: 'Företagspresentation', text: 'Visa företaget, lagret och kontaktvägarna på ett konsekvent sätt som känns seriöst för köpare.' },
      { title: 'Skalbara annonser', text: 'Publicera bilar, transportbilar, lastbilar och specialfordon med en struktur som klarar fler objekt.' },
      { title: 'Teamredo arbetsflöde', text: 'Företagskonton kan stödja flera personer som arbetar med samma profil och samma fordonslager.' },
    ],
    processTitle: 'Så fungerar försäljningen',
    processIntro: 'Målet är enkelt: fordonet ska vara lätt att förstå, lätt att hitta och lätt att fråga om.',
    steps: [
      { title: 'Skapa annonsen', text: 'Lägg in kategori, ort, bilder, fordonsdata, beskrivning och säljaruppgifter.' },
      { title: 'Publicera tryggt', text: 'Annonsen struktureras för marknadsplatsens sök och rätt köpintention.' },
      { title: 'Hantera förfrågningar', text: 'Ta emot frågor från köpare med annonsens sammanhang kvar.' },
      { title: 'Kom överens', text: 'Köpare och säljare gör upp om betalning, hämtning, dokument och överlämning direkt.' },
    ],
    seoTitle: 'Sälj bil, transportbil, lastbil och maskiner på Autorell',
    seoText: 'Autorell är byggt för privatpersoner och företag som vill sälja fordon online på ett mer ordnat sätt. Oavsett om du säljer en begagnad bil, en transportbil, en lastbil, en husbil eller ett större företagslager ska annonsen hjälpa köparen att förstå fordonet innan kontakt. Tydlig information, relevanta kategorier och europeisk marknadskontext gör annonsen enklare att jämföra och lättare att lita på.',
    faqTitle: 'Vanliga frågor',
    faqs: [
      { q: 'Kan privatpersoner sälja på Autorell?', a: 'Ja. Privatpersoner kan skapa konto och publicera en fordonsannons med bilder, pris, ort och fordonsuppgifter.' },
      { q: 'Kan företag sälja flera fordon?', a: 'Ja. Företagskonton är byggda för företag, handlare och team som hanterar återkommande annonser.' },
      { q: 'Sköter Autorell själva affären?', a: 'Autorell tillhandahåller marknadsplatsen, annonsen och förfrågningsflödet. Köpare och säljare gör upp den slutliga affären direkt.' },
    ],
    finalTitle: 'Redo att sälja på Autorell?',
    finalText: 'Börja med ett fordon eller skapa företagskonto för återkommande försäljning.',
  },
  de: {
    metaTitle: 'Auto und Fahrzeuge online verkaufen | Autorell',
    metaDescription: 'Verkaufen Sie Autos, Transporter, Lkw oder Firmenfahrzeuge auf Autorell. Für private Verkäufer, Händler und Unternehmen.',
    eyebrow: 'Auf Autorell verkaufen',
    title: 'Verkaufen Sie Ihr Auto oder Firmenfahrzeuge mit einer Anzeige für seriöse Käufer.',
    intro: 'Autorell hilft privaten Verkäufern und Unternehmen, Fahrzeuge klar zu präsentieren, Käufer in Europa zu erreichen und Anfragen geordnet zu verwalten.',
    primaryCta: 'Verkauf starten',
    businessCta: 'Für Unternehmen',
    proof: ['Privat und gewerblich', 'Für Suche aufgebaut', 'Europäische Reichweite'],
    privateTitle: 'Warum private Verkäufer Autorell nutzen',
    privateIntro: 'Ein privater Fahrzeugverkauf soll vom ersten Klick an klar wirken. Autorell gibt Ihrem Fahrzeug eine professionelle Präsentation ohne unnötige Komplexität.',
    privatePoints: [
      { title: 'Eine klarere Anzeige', text: 'Fotos, Preis, Kilometerstand, Ausstattung, Zustand und Standort werden so gezeigt, dass Käufer schnell vergleichen können.' },
      { title: 'Relevanteste Käufer', text: 'Ihr Fahrzeug kann über Suche, Kategorien und Marktseiten gefunden werden statt in einem allgemeinen Feed unterzugehen.' },
      { title: 'Bessere Kontaktqualität', text: 'Fragen bleiben mit der Anzeige verbunden, damit die Kommunikation leichter nachvollziehbar bleibt.' },
    ],
    businessTitle: 'Für Unternehmen, Händler und wiederkehrende Verkäufer',
    businessIntro: 'Unternehmen brauchen mehr als einzelne Anzeigen. Autorell unterstützt Bestand, Vertrauen und wiederkehrende Verkaufsprozesse.',
    businessPoints: [
      { title: 'Unternehmensprofil', text: 'Präsentieren Sie Unternehmen, Bestand und Kontaktwege konsistent und glaubwürdig.' },
      { title: 'Skalierbare Anzeigen', text: 'Veröffentlichen Sie Pkw, Transporter, Lkw und Spezialfahrzeuge in einer Struktur, die mitwächst.' },
      { title: 'Teamfähiger Ablauf', text: 'Geschäftskonten unterstützen mehrere Personen, die mit demselben Profil und Bestand arbeiten.' },
    ],
    processTitle: 'So funktioniert der Verkauf',
    processIntro: 'Das Ziel: Das Fahrzeug soll leicht verständlich, auffindbar und kontaktierbar sein.',
    steps: [
      { title: 'Anzeige erstellen', text: 'Kategorie, Standort, Fotos, Fahrzeugdaten, Beschreibung und Verkäuferangaben hinzufügen.' },
      { title: 'Sicher veröffentlichen', text: 'Die Anzeige wird für Marktplatzsuche und relevante Kaufabsicht strukturiert.' },
      { title: 'Anfragen verwalten', text: 'Käuferfragen bleiben mit dem Kontext der Anzeige verbunden.' },
      { title: 'Verkauf vereinbaren', text: 'Käufer und Verkäufer klären Zahlung, Abholung, Dokumente und Übergabe direkt.' },
    ],
    seoTitle: 'Autos, Transporter, Lkw und Maschinen auf Autorell verkaufen',
    seoText: 'Autorell ist für private Verkäufer und Unternehmen gemacht, die Fahrzeuge online strukturierter verkaufen möchten. Ob Gebrauchtwagen, Transporter, Lkw, Wohnmobil oder größerer Firmenbestand: Die Anzeige soll Käufern helfen, das Fahrzeug vor der Kontaktaufnahme zu verstehen. Klare Informationen, relevante Kategorien und europäischer Marktkontext machen die Anzeige vergleichbarer und vertrauenswürdiger.',
    faqTitle: 'Häufige Fragen',
    faqs: [
      { q: 'Können private Verkäufer Autorell nutzen?', a: 'Ja. Private Verkäufer können ein Konto erstellen und eine Fahrzeuganzeige mit Fotos, Preis, Standort und Daten veröffentlichen.' },
      { q: 'Können Unternehmen mehrere Fahrzeuge verkaufen?', a: 'Ja. Geschäftskonten sind für Unternehmen, Händler und Teams mit wiederkehrenden Anzeigen ausgelegt.' },
      { q: 'Wickelt Autorell den Verkauf ab?', a: 'Autorell stellt Marktplatz, Anzeige und Anfragefluss bereit. Käufer und Verkäufer vereinbaren den endgültigen Verkauf direkt.' },
    ],
    finalTitle: 'Bereit, auf Autorell zu verkaufen?',
    finalText: 'Starten Sie mit einem Fahrzeug oder richten Sie ein Geschäftskonto für wiederkehrende Verkäufe ein.',
  },
  fr: {
    metaTitle: 'Vendre une voiture et des véhicules en ligne | Autorell',
    metaDescription: 'Vendez voiture, utilitaire, camion ou véhicule professionnel sur Autorell. Pour particuliers, marchands et entreprises.',
    eyebrow: 'Vendre sur Autorell',
    title: 'Vendez votre voiture ou vos véhicules professionnels avec une annonce conçue pour des acheteurs sérieux.',
    intro: 'Autorell aide les particuliers et les entreprises à présenter clairement leurs véhicules, toucher des acheteurs en Europe et garder chaque demande liée à la bonne annonce.',
    primaryCta: 'Commencer à vendre',
    businessCta: 'Vendeurs pro',
    proof: ['Particuliers et pros', 'Conçu pour la recherche', 'Portée européenne'],
    privateTitle: 'Pourquoi les particuliers vendent sur Autorell',
    privateIntro: 'Une vente entre particuliers doit être claire dès le départ. Autorell donne au véhicule une présentation sérieuse sans compliquer le processus.',
    privatePoints: [
      { title: 'Une annonce plus claire', text: 'Photos, prix, kilométrage, équipements, état et ville sont présentés dans un format facile à comparer.' },
      { title: 'Des acheteurs plus pertinents', text: 'Votre voiture peut être trouvée via la recherche, les catégories et les pages marché.' },
      { title: 'Un contact plus simple', text: 'Les questions restent liées à l’annonce, ce qui rend les échanges plus faciles à suivre.' },
    ],
    businessTitle: 'Pensé pour entreprises, marchands et vendeurs réguliers',
    businessIntro: 'Les professionnels ont besoin de plus qu’une annonce isolée. Autorell soutient stock, crédibilité et ventes répétées.',
    businessPoints: [
      { title: 'Présence entreprise', text: 'Présentez votre société, votre stock et vos canaux de contact de manière cohérente.' },
      { title: 'Annonces évolutives', text: 'Publiez voitures, utilitaires, camions et véhicules spécialisés avec une structure prête à grandir.' },
      { title: 'Flux adapté aux équipes', text: 'Les comptes professionnels peuvent permettre à plusieurs personnes de travailler sur le même profil.' },
    ],
    processTitle: 'Comment se déroule la vente',
    processIntro: 'L’objectif est simple : rendre le véhicule compréhensible, trouvable et facile à contacter.',
    steps: [
      { title: 'Créer l’annonce', text: 'Ajoutez catégorie, lieu, photos, données véhicule, description et coordonnées vendeur.' },
      { title: 'Publier avec confiance', text: 'L’annonce est structurée pour la recherche et l’intention d’achat.' },
      { title: 'Gérer les demandes', text: 'Recevez les questions avec le contexte de l’annonce.' },
      { title: 'Conclure', text: 'Acheteur et vendeur conviennent directement du paiement, retrait, documents et remise.' },
    ],
    seoTitle: 'Vendre voitures, utilitaires, camions et machines sur Autorell',
    seoText: 'Autorell s’adresse aux particuliers et aux entreprises qui veulent vendre des véhicules en ligne de façon plus structurée. Qu’il s’agisse d’une voiture d’occasion, d’un utilitaire, d’un camion, d’un camping-car ou d’un stock professionnel, l’annonce aide l’acheteur à comprendre le véhicule avant le contact. Des informations claires, des catégories pertinentes et un contexte européen rendent l’annonce plus comparable et plus fiable.',
    faqTitle: 'Questions fréquentes',
    faqs: [
      { q: 'Les particuliers peuvent-ils vendre sur Autorell ?', a: 'Oui. Un particulier peut créer un compte et publier une annonce avec photos, prix, lieu et détails véhicule.' },
      { q: 'Les entreprises peuvent-elles vendre plusieurs véhicules ?', a: 'Oui. Les comptes professionnels sont conçus pour les entreprises, marchands et équipes.' },
      { q: 'Autorell finalise-t-il la vente ?', a: 'Autorell fournit la marketplace, l’annonce et les demandes. Acheteur et vendeur concluent directement.' },
    ],
    finalTitle: 'Prêt à vendre sur Autorell ?',
    finalText: 'Commencez avec un véhicule ou créez un compte professionnel pour vendre régulièrement.',
  },
  es: {
    metaTitle: 'Vender coche y vehículos online | Autorell',
    metaDescription: 'Vende coche, furgoneta, camión o vehículo de empresa en Autorell. Para particulares, concesionarios y empresas.',
    eyebrow: 'Vender en Autorell',
    title: 'Vende tu coche o vehículos de empresa con un anuncio pensado para compradores serios.',
    intro: 'Autorell ayuda a particulares y empresas a presentar vehículos con claridad, llegar a compradores en Europa y mantener cada consulta vinculada al anuncio correcto.',
    primaryCta: 'Empezar a vender',
    businessCta: 'Vendedores empresa',
    proof: ['Particulares y empresas', 'Pensado para búsqueda', 'Alcance europeo'],
    privateTitle: 'Por qué los particulares venden en Autorell',
    privateIntro: 'Una venta privada debe ser clara desde el primer clic. Autorell da a tu vehículo una presentación profesional sin complicar el proceso.',
    privatePoints: [
      { title: 'Un anuncio más claro', text: 'Muestra fotos, precio, kilometraje, equipamiento, estado y ubicación en un formato fácil de comparar.' },
      { title: 'Compradores más relevantes', text: 'Tu coche puede aparecer en búsquedas, categorías y páginas de mercado.' },
      { title: 'Contacto más ordenado', text: 'Las preguntas quedan vinculadas al anuncio, facilitando el seguimiento.' },
    ],
    businessTitle: 'Creado para empresas, concesionarios y vendedores recurrentes',
    businessIntro: 'Las empresas necesitan más que un anuncio. Autorell apoya inventario, confianza y ventas repetidas.',
    businessPoints: [
      { title: 'Presencia de empresa', text: 'Presenta empresa, stock y vías de contacto de forma coherente y creíble.' },
      { title: 'Anuncios escalables', text: 'Publica coches, furgonetas, camiones y vehículos especiales con una estructura preparada para crecer.' },
      { title: 'Flujo para equipos', text: 'Las cuentas de empresa pueden admitir varias personas trabajando con el mismo perfil.' },
    ],
    processTitle: 'Cómo funciona la venta',
    processIntro: 'El objetivo: que el vehículo sea fácil de entender, encontrar y consultar.',
    steps: [
      { title: 'Crear anuncio', text: 'Añade categoría, ubicación, fotos, datos, descripción e información del vendedor.' },
      { title: 'Publicar con confianza', text: 'El anuncio se estructura para búsqueda e intención de compra relevante.' },
      { title: 'Gestionar consultas', text: 'Recibe preguntas manteniendo el contexto del anuncio.' },
      { title: 'Cerrar acuerdo', text: 'Comprador y vendedor acuerdan pago, recogida, documentos y entrega directamente.' },
    ],
    seoTitle: 'Vender coches, furgonetas, camiones y maquinaria en Autorell',
    seoText: 'Autorell está hecho para particulares y empresas que quieren vender vehículos online de forma más organizada. Ya vendas un coche usado, una furgoneta, un camión, una autocaravana o un inventario empresarial, el anuncio ayuda al comprador a entender el vehículo antes de contactar. Información clara, categorías relevantes y contexto europeo hacen el anuncio más comparable y fiable.',
    faqTitle: 'Preguntas frecuentes',
    faqs: [
      { q: '¿Pueden vender particulares en Autorell?', a: 'Sí. Un particular puede crear cuenta y publicar un anuncio con fotos, precio, ubicación y datos del vehículo.' },
      { q: '¿Pueden las empresas vender varios vehículos?', a: 'Sí. Las cuentas de empresa están pensadas para empresas, concesionarios y equipos.' },
      { q: '¿Autorell gestiona la venta final?', a: 'Autorell ofrece marketplace, anuncio y consultas. Comprador y vendedor acuerdan la operación final directamente.' },
    ],
    finalTitle: '¿Listo para vender en Autorell?',
    finalText: 'Empieza con un vehículo o crea una cuenta de empresa para ventas recurrentes.',
  },
  it: {
    metaTitle: 'Vendere auto e veicoli online | Autorell',
    metaDescription: 'Vendi auto, furgoni, camion o veicoli aziendali su Autorell. Per privati, concessionari e aziende.',
    eyebrow: 'Vendere su Autorell',
    title: 'Vendi la tua auto o i veicoli aziendali con un annuncio pensato per acquirenti seri.',
    intro: 'Autorell aiuta privati e aziende a presentare i veicoli con chiarezza, raggiungere acquirenti in Europa e tenere ogni richiesta collegata all’annuncio giusto.',
    primaryCta: 'Inizia a vendere',
    businessCta: 'Venditori business',
    proof: ['Privati e aziende', 'Creato per la ricerca', 'Portata europea'],
    privateTitle: 'Perché i privati scelgono Autorell',
    privateIntro: 'Una vendita privata deve essere chiara dal primo clic. Autorell dà al veicolo una presentazione professionale senza complicare il processo.',
    privatePoints: [
      { title: 'Annuncio più chiaro', text: 'Foto, prezzo, chilometraggio, dotazioni, stato e località sono mostrati in modo facile da confrontare.' },
      { title: 'Acquirenti più pertinenti', text: 'L’auto può essere trovata tramite ricerca, categorie e pagine mercato.' },
      { title: 'Contatti più ordinati', text: 'Le domande restano collegate all’annuncio e la conversazione è più facile da seguire.' },
    ],
    businessTitle: 'Pensato per aziende, concessionari e venditori ricorrenti',
    businessIntro: 'Le aziende hanno bisogno di più di un singolo annuncio. Autorell supporta inventario, fiducia e vendite ripetute.',
    businessPoints: [
      { title: 'Presenza aziendale', text: 'Presenta azienda, stock e canali di contatto in modo coerente e credibile.' },
      { title: 'Annunci scalabili', text: 'Pubblica auto, furgoni, camion e veicoli speciali con una struttura pronta a crescere.' },
      { title: 'Flusso per team', text: 'Gli account business possono supportare più persone sullo stesso profilo aziendale.' },
    ],
    processTitle: 'Come funziona la vendita',
    processIntro: 'Obiettivo: rendere il veicolo facile da capire, trovare e contattare.',
    steps: [
      { title: 'Crea l’annuncio', text: 'Aggiungi categoria, luogo, foto, dati veicolo, descrizione e informazioni venditore.' },
      { title: 'Pubblica con fiducia', text: 'L’annuncio è strutturato per ricerca e intenzione d’acquisto.' },
      { title: 'Gestisci richieste', text: 'Ricevi domande mantenendo il contesto dell’annuncio.' },
      { title: 'Concludi accordo', text: 'Acquirente e venditore concordano pagamento, ritiro, documenti e consegna direttamente.' },
    ],
    seoTitle: 'Vendere auto, furgoni, camion e macchine su Autorell',
    seoText: 'Autorell è pensato per privati e aziende che vogliono vendere veicoli online in modo più organizzato. Che si tratti di un’auto usata, un furgone, un camion, un camper o uno stock aziendale, l’annuncio aiuta l’acquirente a capire il veicolo prima del contatto. Informazioni chiare, categorie rilevanti e contesto europeo rendono l’annuncio più confrontabile e affidabile.',
    faqTitle: 'Domande frequenti',
    faqs: [
      { q: 'I privati possono vendere su Autorell?', a: 'Sì. Un privato può creare un account e pubblicare un annuncio con foto, prezzo, località e dati veicolo.' },
      { q: 'Le aziende possono vendere più veicoli?', a: 'Sì. Gli account business sono pensati per aziende, concessionari e team.' },
      { q: 'Autorell gestisce la vendita finale?', a: 'Autorell fornisce marketplace, annuncio e richieste. Acquirente e venditore concordano direttamente.' },
    ],
    finalTitle: 'Pronto a vendere su Autorell?',
    finalText: 'Inizia con un veicolo o crea un account business per vendite ricorrenti.',
  },
  nl: {
    metaTitle: 'Auto en voertuigen online verkopen | Autorell',
    metaDescription: 'Verkoop auto, bestelwagen, vrachtwagen of bedrijfsvoertuig op Autorell. Voor particulieren, dealers en bedrijven.',
    eyebrow: 'Verkopen op Autorell',
    title: 'Verkoop je auto of bedrijfsvoertuigen met een advertentie voor serieuze kopers.',
    intro: 'Autorell helpt particulieren en bedrijven voertuigen duidelijk te presenteren, Europese kopers te bereiken en elke aanvraag aan de juiste advertentie te koppelen.',
    primaryCta: 'Start met verkopen',
    businessCta: 'Zakelijke verkopers',
    proof: ['Particulier en zakelijk', 'Gemaakt voor zoeken', 'Europees bereik'],
    privateTitle: 'Waarom particulieren Autorell gebruiken',
    privateIntro: 'Een particuliere verkoop moet vanaf de eerste klik duidelijk zijn. Autorell geeft je voertuig een professionele presentatie zonder onnodige complexiteit.',
    privatePoints: [
      { title: 'Duidelijkere advertentie', text: 'Toon foto’s, prijs, kilometerstand, uitrusting, staat en plaats in een makkelijk scanbaar format.' },
      { title: 'Relevantere kopers', text: 'Je auto kan gevonden worden via zoekopdracht, categorieën en marktpagina’s.' },
      { title: 'Netter contact', text: 'Vragen blijven gekoppeld aan de advertentie, waardoor opvolging eenvoudiger wordt.' },
    ],
    businessTitle: 'Gebouwd voor bedrijven, dealers en terugkerende verkopers',
    businessIntro: 'Bedrijven hebben meer nodig dan één advertentie. Autorell ondersteunt voorraad, vertrouwen en herhaalde verkoop.',
    businessPoints: [
      { title: 'Bedrijfspresentatie', text: 'Presenteer bedrijf, voorraad en contactroutes consistent en geloofwaardig.' },
      { title: 'Schaalbare advertenties', text: 'Publiceer auto’s, bestelwagens, vrachtwagens en specialistische voertuigen in een structuur die meegroeit.' },
      { title: 'Teamgeschikte workflow', text: 'Zakelijke accounts kunnen meerdere mensen ondersteunen binnen hetzelfde bedrijfsprofiel.' },
    ],
    processTitle: 'Hoe verkopen werkt',
    processIntro: 'Het doel: het voertuig makkelijk begrijpen, vinden en bevragen.',
    steps: [
      { title: 'Advertentie maken', text: 'Voeg categorie, plaats, foto’s, voertuigdata, beschrijving en verkopersinformatie toe.' },
      { title: 'Met vertrouwen publiceren', text: 'De advertentie is gestructureerd voor marketplace-zoekopdrachten en koopintentie.' },
      { title: 'Aanvragen beheren', text: 'Ontvang vragen met de context van de advertentie erbij.' },
      { title: 'Verkoop afspreken', text: 'Koper en verkoper spreken betaling, ophalen, documenten en overdracht direct af.' },
    ],
    seoTitle: 'Auto’s, bestelwagens, vrachtwagens en machines verkopen op Autorell',
    seoText: 'Autorell is gemaakt voor particulieren en bedrijven die voertuigen online georganiseerder willen verkopen. Of het gaat om een gebruikte auto, bestelwagen, vrachtwagen, camper of bedrijfsvoorraad: de advertentie helpt kopers het voertuig te begrijpen voordat ze contact opnemen. Duidelijke informatie, relevante categorieën en Europese marktcontext maken de advertentie beter vergelijkbaar en betrouwbaarder.',
    faqTitle: 'Veelgestelde vragen',
    faqs: [
      { q: 'Kunnen particulieren verkopen op Autorell?', a: 'Ja. Particulieren kunnen een account maken en een advertentie publiceren met foto’s, prijs, plaats en voertuigdetails.' },
      { q: 'Kunnen bedrijven meerdere voertuigen verkopen?', a: 'Ja. Zakelijke accounts zijn gebouwd voor bedrijven, dealers en teams.' },
      { q: 'Handelt Autorell de verkoop af?', a: 'Autorell biedt marketplace, advertentie en aanvraagflow. Koper en verkoper spreken de uiteindelijke deal direct af.' },
    ],
    finalTitle: 'Klaar om te verkopen op Autorell?',
    finalText: 'Begin met één voertuig of maak een zakelijk account voor terugkerende verkoop.',
  },
  pl: {
    metaTitle: 'Sprzedaj auto i pojazdy online | Autorell',
    metaDescription: 'Sprzedaj samochód, vana, ciężarówkę lub pojazd firmowy na Autorell. Dla osób prywatnych, dealerów i firm.',
    eyebrow: 'Sprzedaż na Autorell',
    title: 'Sprzedaj samochód lub pojazdy firmowe przez ogłoszenie stworzone dla poważnych kupujących.',
    intro: 'Autorell pomaga osobom prywatnym i firmom jasno prezentować pojazdy, docierać do kupujących w Europie i porządkować zapytania.',
    primaryCta: 'Zacznij sprzedaż',
    businessCta: 'Sprzedawcy firmowi',
    proof: ['Prywatnie i firmowo', 'Stworzone pod wyszukiwanie', 'Zasięg europejski'],
    privateTitle: 'Dlaczego osoby prywatne wybierają Autorell',
    privateIntro: 'Sprzedaż prywatna powinna być jasna od pierwszego kliknięcia. Autorell daje pojazdowi profesjonalną prezentację bez komplikowania procesu.',
    privatePoints: [
      { title: 'Czytelniejsze ogłoszenie', text: 'Pokaż zdjęcia, cenę, przebieg, wyposażenie, stan i lokalizację w formacie łatwym do porównania.' },
      { title: 'Bardziej trafni kupujący', text: 'Auto może być znalezione przez wyszukiwarkę, kategorie i strony rynkowe.' },
      { title: 'Uporządkowany kontakt', text: 'Pytania pozostają połączone z ogłoszeniem, co ułatwia odpowiedzi.' },
    ],
    businessTitle: 'Dla firm, dealerów i stałych sprzedawców',
    businessIntro: 'Firmy potrzebują więcej niż jednego ogłoszenia. Autorell wspiera zapasy, wiarygodność i powtarzalną sprzedaż.',
    businessPoints: [
      { title: 'Prezentacja firmy', text: 'Pokaż firmę, ofertę i kontakt w spójny, wiarygodny sposób.' },
      { title: 'Skalowalne ogłoszenia', text: 'Publikuj auta, vany, ciężarówki i pojazdy specjalne w strukturze gotowej na rozwój.' },
      { title: 'Praca zespołowa', text: 'Konta firmowe mogą wspierać wiele osób pracujących na tym samym profilu.' },
    ],
    processTitle: 'Jak działa sprzedaż',
    processIntro: 'Cel jest prosty: pojazd ma być łatwy do zrozumienia, znalezienia i zapytania.',
    steps: [
      { title: 'Utwórz ogłoszenie', text: 'Dodaj kategorię, lokalizację, zdjęcia, dane pojazdu, opis i informacje sprzedawcy.' },
      { title: 'Opublikuj pewnie', text: 'Ogłoszenie jest przygotowane pod wyszukiwanie i intencję zakupu.' },
      { title: 'Obsługuj zapytania', text: 'Otrzymuj pytania z kontekstem konkretnego ogłoszenia.' },
      { title: 'Uzgodnij sprzedaż', text: 'Kupujący i sprzedawca ustalają płatność, odbiór, dokumenty i przekazanie bezpośrednio.' },
    ],
    seoTitle: 'Sprzedaj samochody, vany, ciężarówki i maszyny na Autorell',
    seoText: 'Autorell jest dla osób prywatnych i firm, które chcą sprzedawać pojazdy online w bardziej uporządkowany sposób. Niezależnie od tego, czy sprzedajesz używany samochód, vana, ciężarówkę, kampera czy firmową flotę, ogłoszenie pomaga kupującemu zrozumieć pojazd przed kontaktem. Jasne informacje, trafne kategorie i europejski kontekst rynkowy zwiększają porównywalność i zaufanie.',
    faqTitle: 'Częste pytania',
    faqs: [
      { q: 'Czy osoby prywatne mogą sprzedawać na Autorell?', a: 'Tak. Osoba prywatna może utworzyć konto i opublikować ogłoszenie ze zdjęciami, ceną, lokalizacją i danymi pojazdu.' },
      { q: 'Czy firmy mogą sprzedawać wiele pojazdów?', a: 'Tak. Konta firmowe są stworzone dla firm, dealerów i zespołów.' },
      { q: 'Czy Autorell finalizuje sprzedaż?', a: 'Autorell zapewnia marketplace, ogłoszenie i zapytania. Kupujący i sprzedawca uzgadniają transakcję bezpośrednio.' },
    ],
    finalTitle: 'Gotowy sprzedawać na Autorell?',
    finalText: 'Zacznij od jednego pojazdu albo utwórz konto firmowe do regularnej sprzedaży.',
  },
  da: {
    metaTitle: 'Sælg bil og køretøjer online | Autorell',
    metaDescription: 'Sælg bil, varebil, lastbil eller firmakøretøj på Autorell. For private sælgere, forhandlere og virksomheder.',
    eyebrow: 'Sælg på Autorell',
    title: 'Sælg din bil eller virksomhedens køretøjer med en annonce bygget til seriøse købere.',
    intro: 'Autorell hjælper private og virksomheder med at præsentere køretøjer klart, nå købere i Europa og holde hver forespørgsel knyttet til den rigtige annonce.',
    primaryCta: 'Start salg',
    businessCta: 'Erhvervssælgere',
    proof: ['Privat og erhverv', 'Bygget til søgning', 'Europæisk rækkevidde'],
    privateTitle: 'Derfor vælger private Autorell',
    privateIntro: 'Et privat salg skal være tydeligt fra første klik. Autorell giver køretøjet en professionel præsentation uden at gøre processen kompliceret.',
    privatePoints: [
      { title: 'En tydeligere annonce', text: 'Vis billeder, pris, kilometerstand, udstyr, stand og by i et format købere hurtigt kan forstå.' },
      { title: 'Mere relevante købere', text: 'Bilen kan findes via søgning, kategorier og markedssider.' },
      { title: 'Mindre rodet kontakt', text: 'Spørgsmål forbliver knyttet til annoncen, så dialogen er lettere at følge.' },
    ],
    businessTitle: 'Bygget til virksomheder, forhandlere og gentagne sælgere',
    businessIntro: 'Virksomheder har brug for mere end en enkelt annonce. Autorell understøtter lager, tillid og gentagne salg.',
    businessPoints: [
      { title: 'Virksomhedsprofil', text: 'Præsenter virksomhed, lager og kontaktveje på en konsekvent og troværdig måde.' },
      { title: 'Skalerbare annoncer', text: 'Publicer biler, varebiler, lastbiler og specialkøretøjer i en struktur der kan vokse.' },
      { title: 'Klar til teams', text: 'Erhvervskonti kan understøtte flere personer på samme virksomhedsprofil.' },
    ],
    processTitle: 'Sådan fungerer salget',
    processIntro: 'Målet er enkelt: køretøjet skal være let at forstå, finde og spørge ind til.',
    steps: [
      { title: 'Opret annoncen', text: 'Tilføj kategori, placering, billeder, køretøjsdata, beskrivelse og sælgerinfo.' },
      { title: 'Publicer trygt', text: 'Annoncen struktureres til markedspladssøgning og relevant købsintention.' },
      { title: 'Håndter forespørgsler', text: 'Modtag spørgsmål med annoncens kontekst bevaret.' },
      { title: 'Aftal salget', text: 'Køber og sælger aftaler betaling, afhentning, dokumenter og overdragelse direkte.' },
    ],
    seoTitle: 'Sælg biler, varebiler, lastbiler og maskiner på Autorell',
    seoText: 'Autorell er skabt til private og virksomheder, der vil sælge køretøjer online på en mere organiseret måde. Uanset om du sælger en brugt bil, varebil, lastbil, autocamper eller større firmalager, hjælper annoncen køberen med at forstå køretøjet før kontakt. Klare oplysninger, relevante kategorier og europæisk markedskontekst gør annoncen lettere at sammenligne og stole på.',
    faqTitle: 'Ofte stillede spørgsmål',
    faqs: [
      { q: 'Kan private sælge på Autorell?', a: 'Ja. Private kan oprette konto og publicere en annonce med billeder, pris, placering og køretøjsdata.' },
      { q: 'Kan virksomheder sælge flere køretøjer?', a: 'Ja. Erhvervskonti er bygget til virksomheder, forhandlere og teams.' },
      { q: 'Håndterer Autorell selve salget?', a: 'Autorell leverer markedsplads, annonce og forespørgsler. Køber og sælger aftaler handlen direkte.' },
    ],
    finalTitle: 'Klar til at sælge på Autorell?',
    finalText: 'Start med ét køretøj eller opret en erhvervskonto til gentagne salg.',
  },
  fi: {
    metaTitle: 'Myy auto ja ajoneuvot verkossa | Autorell',
    metaDescription: 'Myy auto, pakettiauto, kuorma-auto tai yrityksen ajoneuvo Autorellissa. Yksityisille, jälleenmyyjille ja yrityksille.',
    eyebrow: 'Myy Autorellissa',
    title: 'Myy autosi tai yrityksen ajoneuvot ilmoituksella, joka on tehty vakaville ostajille.',
    intro: 'Autorell auttaa yksityisiä ja yrityksiä esittämään ajoneuvot selkeästi, tavoittamaan ostajia Euroopassa ja pitämään kyselyt oikean ilmoituksen yhteydessä.',
    primaryCta: 'Aloita myynti',
    businessCta: 'Yritysmyyjät',
    proof: ['Yksityiset ja yritykset', 'Rakennettu hakuun', 'Eurooppalainen näkyvyys'],
    privateTitle: 'Miksi yksityiset myyvät Autorellissa',
    privateIntro: 'Yksityisen myynnin pitää tuntua selkeältä heti alussa. Autorell antaa ajoneuvolle ammattimaisen esityksen ilman turhaa monimutkaisuutta.',
    privatePoints: [
      { title: 'Selkeämpi ilmoitus', text: 'Näytä kuvat, hinta, ajomäärä, varusteet, kunto ja sijainti ostajille helposti vertailtavassa muodossa.' },
      { title: 'Osuvammat ostajat', text: 'Auto voi löytyä haun, kategorioiden ja markkinasivujen kautta.' },
      { title: 'Järjestetympi yhteydenpito', text: 'Kysymykset pysyvät ilmoituksen yhteydessä, joten keskustelua on helpompi seurata.' },
    ],
    businessTitle: 'Yrityksille, jälleenmyyjille ja toistuvaan myyntiin',
    businessIntro: 'Yritykset tarvitsevat enemmän kuin yksittäisen ilmoituksen. Autorell tukee varastoa, luottamusta ja jatkuvaa myyntiä.',
    businessPoints: [
      { title: 'Yritysesittely', text: 'Esittele yritys, valikoima ja yhteystavat johdonmukaisesti ja uskottavasti.' },
      { title: 'Skaalautuvat ilmoitukset', text: 'Julkaise autoja, pakettiautoja, kuorma-autoja ja erikoisajoneuvoja kasvavassa rakenteessa.' },
      { title: 'Tiimille sopiva työnkulku', text: 'Yritystilit voivat tukea useita henkilöitä samalla yritysprofiililla.' },
    ],
    processTitle: 'Näin myynti toimii',
    processIntro: 'Tavoite on yksinkertainen: ajoneuvon pitää olla helppo ymmärtää, löytää ja kysyä.',
    steps: [
      { title: 'Luo ilmoitus', text: 'Lisää kategoria, sijainti, kuvat, ajoneuvotiedot, kuvaus ja myyjän tiedot.' },
      { title: 'Julkaise luottavaisin mielin', text: 'Ilmoitus rakennetaan markkinapaikan hakua ja ostoaikomusta varten.' },
      { title: 'Hallitse kyselyitä', text: 'Vastaanota ostajien kysymykset ilmoituksen kontekstissa.' },
      { title: 'Sovi kaupasta', text: 'Ostaja ja myyjä sopivat maksusta, noudosta, asiakirjoista ja luovutuksesta suoraan.' },
    ],
    seoTitle: 'Myy autot, pakettiautot, kuorma-autot ja koneet Autorellissa',
    seoText: 'Autorell on tehty yksityisille ja yrityksille, jotka haluavat myydä ajoneuvoja verkossa järjestelmällisemmin. Myyt sitten käytettyä autoa, pakettiautoa, kuorma-autoa, matkailuautoa tai yrityksen ajoneuvovarastoa, ilmoitus auttaa ostajaa ymmärtämään ajoneuvon ennen yhteydenottoa. Selkeät tiedot, osuvat kategoriat ja eurooppalainen markkinakonteksti tekevät ilmoituksesta vertailtavamman ja luotettavamman.',
    faqTitle: 'Usein kysytyt kysymykset',
    faqs: [
      { q: 'Voivatko yksityiset myydä Autorellissa?', a: 'Kyllä. Yksityinen myyjä voi luoda tilin ja julkaista ilmoituksen kuvilla, hinnalla, sijainnilla ja ajoneuvotiedoilla.' },
      { q: 'Voivatko yritykset myydä useita ajoneuvoja?', a: 'Kyllä. Yritystilit on tehty yrityksille, jälleenmyyjille ja tiimeille.' },
      { q: 'Hoitaako Autorell lopullisen kaupan?', a: 'Autorell tarjoaa markkinapaikan, ilmoituksen ja kyselyt. Ostaja ja myyjä sopivat kaupasta suoraan.' },
    ],
    finalTitle: 'Valmis myymään Autorellissa?',
    finalText: 'Aloita yhdellä ajoneuvolla tai luo yritystili jatkuvaa myyntiä varten.',
  },
}

function languageForLocale(locale: PublicLocale): keyof typeof sellingCopy {
  if (locale === 'at') return 'de'
  if (locale === 'be') return 'nl'
  return locale
}

export function getSellVehicleCopy(locale: PublicLocale) {
  return sellingCopy[languageForLocale(locale)] ?? sellingCopy.en
}

export async function generateSellVehicleMetadata(localeOverride?: PublicLocale): Promise<Metadata> {
  const headerStore = await headers()
  const locale = localeOverride || getRequestedLocale(headerStore)
  const copy = getSellVehicleCopy(locale)
  const canonicalPath = headerStore.get('x-autorell-pathname') || localizePublicHref(locale, '/sell-vehicle')
  const canonical = `https://www.autorell.com${canonicalPath}`
  const title = cleanSeoText(copy.metaTitle, 65)
  const description = cleanSeoText(copy.metaDescription, 155)

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Autorell',
      type: 'website',
    },
  }
}

export default async function SellVehicleSeoPage({
  localeOverride,
  marketCodeOverride,
}: {
  localeOverride?: PublicLocale
  marketCodeOverride?: string
}) {
  const headerStore = await headers()
  const locale = localeOverride || getRequestedLocale(headerStore)
  const marketCode = marketCodeOverride || headerStore.get('x-autorell-market') || marketCodeForLocale(locale)
  const copy = getSellVehicleCopy(locale)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: copy.faqs.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }

  return (
    <main className="min-h-screen bg-[#f6f8fc] text-[#101828]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PublicHeader locale={locale} marketCode={marketCode} />
      <section className="overflow-hidden border-b border-[#dde6f2] bg-white">
        <div className="mx-auto grid max-w-[var(--autorell-page-max)] gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,1fr)_430px] lg:items-center lg:py-22">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#0866ff]">{copy.eyebrow}</p>
            <h1 className="mt-5 max-w-5xl text-[42px] font-semibold leading-[.98] tracking-[-.055em] sm:text-[68px] lg:text-[78px]">
              {copy.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[#526071]">
              {copy.intro}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={localizePublicHref(locale, '/account/listings/new')} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[12px] bg-[#0866ff] px-6 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(8,102,255,.24)] transition hover:-translate-y-0.5 hover:bg-[#075ce5]">
                {copy.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href={localizePublicHref(locale, '/business')} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[12px] border border-[#cbd7e8] bg-white px-6 text-sm font-semibold text-[#101828] transition hover:-translate-y-0.5 hover:border-[#0866ff] hover:text-[#0866ff]">
                {copy.businessCta}
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {copy.proof.map((item) => (
                <span key={item} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#dbe6f4] bg-[#f8fbff] px-4 text-sm font-medium text-[#344054]">
                  <CheckCircle2 className="h-4 w-4 text-[#0866ff]" />
                  {item}
                </span>
              ))}
            </div>
          </div>
          <aside className="rounded-[24px] border border-[#dce6f4] bg-[#f8fbff] p-4 shadow-[0_24px_80px_rgba(16,24,40,.09)]">
            <div className="rounded-[20px] bg-[#101828] p-5 text-white">
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-white/10 text-[#93c5fd]">
                  <CarFront className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-[#0866ff] px-3 py-1 text-xs font-semibold">Autorell</span>
              </div>
              <h2 className="mt-6 text-3xl font-semibold tracking-[-.045em]">Vehicle listing</h2>
              <div className="mt-5 grid gap-3">
                {[
                  [Camera, 'Photos'],
                  [Search, 'Search data'],
                  [MessageSquareText, 'Enquiries'],
                  [ShieldCheck, 'Trust signals'],
                ].map(([Icon, label]) => (
                  <div key={label as string} className="flex items-center justify-between rounded-[14px] bg-white/8 px-4 py-3 text-sm font-medium">
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-[#93c5fd]" />
                      {label as string}
                    </span>
                    <BadgeCheck className="h-4 w-4 text-[#60a5fa]" />
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto grid max-w-[var(--autorell-page-max)] gap-6 px-5 py-12 sm:px-8 lg:grid-cols-2 lg:py-16">
        <SellerPanel icon={Users} title={copy.privateTitle} intro={copy.privateIntro} points={copy.privatePoints} />
        <SellerPanel icon={Building2} title={copy.businessTitle} intro={copy.businessIntro} points={copy.businessPoints} />
      </section>

      <section className="border-y border-[#dfe7f2] bg-white py-14 sm:py-18">
        <div className="mx-auto max-w-[var(--autorell-page-max)] px-5 sm:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#0866ff]">{copy.processTitle}</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-.045em] sm:text-5xl">{copy.processIntro}</h2>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {copy.steps.map((step, index) => (
              <article key={step.title} className="rounded-[18px] border border-[#dce5f2] bg-[#f8fbff] p-5">
                <span className="text-sm font-semibold text-[#0866ff]">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="mt-5 text-xl font-semibold tracking-[-.03em]">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#667085]">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[var(--autorell-page-max)] gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:py-18">
        <article className="rounded-[24px] border border-[#dce5f2] bg-white p-7 shadow-[0_18px_55px_rgba(16,24,40,.06)] sm:p-9">
          <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#eef5ff] text-[#0866ff]">
            <Globe2 className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">{copy.seoTitle}</h2>
          <p className="mt-5 text-base leading-8 text-[#526071]">{copy.seoText}</p>
        </article>
        <aside className="rounded-[24px] border border-[#dce5f2] bg-[#101828] p-7 text-white shadow-[0_24px_70px_rgba(16,24,40,.16)] sm:p-8">
          <Sparkles className="h-7 w-7 text-[#93c5fd]" />
          <h2 className="mt-6 text-3xl font-semibold tracking-[-.04em]">{copy.finalTitle}</h2>
          <p className="mt-4 text-base leading-7 text-[#cbd5e1]">{copy.finalText}</p>
          <div className="mt-7 grid gap-3">
            <Link href={localizePublicHref(locale, '/account/listings/new')} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[12px] bg-[#0866ff] px-5 text-sm font-semibold text-white">
              {copy.primaryCta}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href={localizePublicHref(locale, '/business')} className="inline-flex min-h-12 items-center justify-center rounded-[12px] border border-white/18 px-5 text-sm font-semibold text-white">
              {copy.businessCta}
            </Link>
          </div>
        </aside>
      </section>

      <section className="border-t border-[#dfe7f2] bg-white py-14">
        <div className="mx-auto max-w-[var(--autorell-page-max)] px-5 sm:px-8">
          <h2 className="text-3xl font-semibold tracking-[-.04em]">{copy.faqTitle}</h2>
          <div className="mt-7 grid gap-4 lg:grid-cols-3">
            {copy.faqs.map((faq) => (
              <article key={faq.q} className="rounded-[18px] border border-[#dce5f2] bg-[#f8fbff] p-5">
                <h3 className="text-base font-semibold">{faq.q}</h3>
                <p className="mt-3 text-sm leading-6 text-[#667085]">{faq.a}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <PublicFooter locale={locale} />
    </main>
  )
}

function SellerPanel({
  icon: Icon,
  title,
  intro,
  points,
}: {
  icon: typeof Users
  title: string
  intro: string
  points: SellingCopy['privatePoints']
}) {
  return (
    <article className="rounded-[24px] border border-[#dce5f2] bg-white p-6 shadow-[0_18px_55px_rgba(16,24,40,.06)] sm:p-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#eef5ff] text-[#0866ff]">
        <Icon className="h-6 w-6" />
      </div>
      <h2 className="mt-6 text-3xl font-semibold tracking-[-.04em]">{title}</h2>
      <p className="mt-4 text-base leading-7 text-[#526071]">{intro}</p>
      <div className="mt-7 grid gap-4">
        {points.map((point) => (
          <div key={point.title} className="flex gap-4 rounded-[16px] border border-[#e1e8f3] bg-[#fbfdff] p-4">
            <FileText className="mt-1 h-5 w-5 shrink-0 text-[#0866ff]" />
            <div>
              <h3 className="font-semibold">{point.title}</h3>
              <p className="mt-1 text-sm leading-6 text-[#667085]">{point.text}</p>
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}

function getRequestedLocale(headerStore: Awaited<ReturnType<typeof headers>>): PublicLocale {
  const requested = headerStore.get('x-autorell-language') || 'en'
  return requested === 'sv' || requested === 'de' || isPublicLanguage(requested)
    ? requested
    : 'en'
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
