import Link from 'next/link'
import { headers } from 'next/headers'
import type { Metadata } from 'next'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'
import {
  isPublicLanguage,
  localizePublicHref,
  type PublicLocale,
} from '@/lib/public-i18n'
import { cleanSeoText } from '@/lib/market-seo'

type WhyAutorellCopy = {
  metaTitle: string
  metaDescription: string
  eyebrow: string
  title: string
  intro: string
  primaryCta: string
  secondaryCta: string
  privateLabel: string
  privateTitle: string
  privateText: string
  businessLabel: string
  businessTitle: string
  businessText: string
  comparisonTitle: string
  comparisonText: string
  autorellColumn: string
  traditionalColumn: string
  comparisonRows: readonly { label: string; autorell: string; other: string }[]
  europeTitle: string
  europeText: string
  europeStats: readonly { value: string; label: string }[]
  principleTitle: string
  principleText: string
  principles: readonly { title: string; text: string }[]
  finalTitle: string
  finalText: string
}

const whyAutorellCopy: Record<'en' | 'sv' | 'de' | 'fr' | 'es' | 'it' | 'nl' | 'pl' | 'da' | 'fi', WhyAutorellCopy> = {
  en: {
    metaTitle: 'Why choose Autorell | A modern European vehicle marketplace',
    metaDescription: 'Why private sellers and companies choose Autorell: free listings, business tools, European reach, safer listings and a faster selling flow.',
    eyebrow: 'Why choose Autorell',
    title: 'A vehicle marketplace built for clarity, not noise.',
    intro: 'Autorell is designed for people and companies that want to sell and find vehicles without hidden costs, confusing flows or unnecessary friction.',
    primaryCta: 'Sell a vehicle',
    secondaryCta: 'View pricing',
    privateLabel: 'For private sellers',
    privateTitle: 'List for free. Pay only when you want more visibility.',
    privateText: 'Private sellers can publish vehicle ads without binding periods or hidden fees. The core listing is free because joining the marketplace should not be the barrier.',
    businessLabel: 'For companies',
    businessTitle: 'Companies pay for professional tools, not for permission to exist.',
    businessText: 'Business plans add capacity, statistics, analysis, exposure and team workflows for sellers that manage inventory and need a more controlled process.',
    comparisonTitle: 'Why choose Autorell instead of older marketplaces?',
    comparisonText: 'The difference is not a slogan. It is in the structure: clear listings, transparent pricing, European context and tools built for modern buying behavior.',
    autorellColumn: 'Autorell',
    traditionalColumn: 'Traditional',
    comparisonRows: [
      { label: 'Private selling', autorell: 'Free core ads', other: 'Fees often come early' },
      { label: 'Business selling', autorell: 'Pay for tools and scale', other: 'Pay mainly for presence' },
      { label: 'Reach', autorell: 'One ad with European context', other: 'Often local first' },
      { label: 'Workflow', autorell: 'Built for mobile and speed', other: 'Longer, older flows' },
    ],
    europeTitle: 'One listing should understand Europe.',
    europeText: 'Autorell is being built around local markets, languages and currencies so buyers can compare vehicles in a context they understand.',
    europeStats: [
      { value: '11', label: 'European markets' },
      { value: '10', label: 'Languages' },
      { value: '1', label: 'Listing flow' },
    ],
    principleTitle: 'The product should make the deal easier to trust.',
    principleText: 'Autorell focuses on the parts that matter before a buyer sends a message: verified signals, moderation, spam checks, fast search, responsive pages and optimized images.',
    principles: [
      { title: 'Safer listings', text: 'Verification signals, moderation and fraud controls help reduce low-quality ads and suspicious behavior.' },
      { title: 'Faster publishing', text: 'The selling flow is made to collect the important vehicle details first and avoid unnecessary steps.' },
      { title: 'Modern performance', text: 'Search, image handling and mobile pages are treated as product quality, not decoration.' },
    ],
    finalTitle: 'Autorell should feel serious before the first message is sent.',
    finalText: 'That is the promise: a calmer, clearer and more transparent way to sell and find vehicles across Europe.',
  },
  sv: {
    metaTitle: 'Varför välja Autorell | Modern europeisk fordonsmarknadsplats',
    metaDescription: 'Därför väljer privatpersoner och företag Autorell: gratis annonser, företagsverktyg, europeisk räckvidd, tryggare annonser och snabbare säljflöde.',
    eyebrow: 'Varför välja Autorell',
    title: 'Byggt för tydliga fordonsaffärer.',
    intro: 'Sälj och hitta fordon utan dolda avgifter, krångliga flöden eller onödiga steg.',
    primaryCta: 'Sälj fordon',
    secondaryCta: 'Se priser',
    privateLabel: 'För privatpersoner',
    privateTitle: 'Gratis annonser. Synlighet när du vill.',
    privateText: 'Grundannonsen är gratis för privatpersoner. Ingen bindningstid och inga dolda avgifter.',
    businessLabel: 'För företag',
    businessTitle: 'Företagsverktyg för löpande försäljning.',
    businessText: 'Få kapacitet, statistik, analys, exponering och teamflöden när lagret växer.',
    comparisonTitle: 'Varför välja Autorell framför äldre marknadsplatser?',
    comparisonText: 'Skillnaden är inte en slogan. Den sitter i strukturen: tydliga annonser, transparent prissättning, europeisk kontext och verktyg byggda för modernt köpbeteende.',
    autorellColumn: 'Autorell',
    traditionalColumn: 'Traditionellt',
    comparisonRows: [
      { label: 'Privat försäljning', autorell: 'Gratis grundannonser', other: 'Avgifter kommer ofta tidigt' },
      { label: 'Företagsförsäljning', autorell: 'Betala för verktyg och skala', other: 'Betala mest för närvaro' },
      { label: 'Räckvidd', autorell: 'En annons med europeisk kontext', other: 'Ofta lokalt först' },
      { label: 'Arbetsflöde', autorell: 'Byggt för mobil och hastighet', other: 'Längre, äldre flöden' },
    ],
    europeTitle: 'En annons ska förstå Europa.',
    europeText: 'Autorell byggs runt lokala marknader, språk och valutor så att köpare kan jämföra fordon i ett sammanhang de förstår.',
    europeStats: [
      { value: '11', label: 'Europeiska marknader' },
      { value: '10', label: 'Språk' },
      { value: '1', label: 'Annonsflöde' },
    ],
    principleTitle: 'Produkten ska göra affären lättare att lita på.',
    principleText: 'Autorell fokuserar på det som spelar roll innan köparen skickar ett meddelande: verifieringssignaler, moderering, spamkontroller, snabb sökning, responsiva sidor och optimerade bilder.',
    principles: [
      { title: 'Tryggare annonser', text: 'Verifieringssignaler, moderering och bedrägerikontroller hjälper till att minska lågkvalitativa annonser och misstänkt beteende.' },
      { title: 'Snabbare publicering', text: 'Säljflödet samlar in det viktigaste först och undviker onödiga steg.' },
      { title: 'Modern prestanda', text: 'Sökning, bildhantering och mobila sidor behandlas som produktkvalitet, inte dekoration.' },
    ],
    finalTitle: 'Autorell ska kännas seriöst innan första meddelandet skickas.',
    finalText: 'Det är löftet: ett lugnare, tydligare och mer transparent sätt att sälja och hitta fordon i Europa.',
  },
  de: {
    metaTitle: 'Warum Autorell wählen | Moderner europäischer Fahrzeugmarkt',
    metaDescription: 'Warum private Verkäufer und Unternehmen Autorell wählen: kostenlose Anzeigen, Business-Tools, europäische Reichweite und sicherere Inserate.',
    eyebrow: 'Warum Autorell',
    title: 'Ein Fahrzeugmarkt für Klarheit, nicht für Lärm.',
    intro: 'Autorell ist für Menschen und Unternehmen gemacht, die Fahrzeuge ohne versteckte Kosten, verwirrende Abläufe oder unnötige Hürden verkaufen und finden möchten.',
    primaryCta: 'Fahrzeug verkaufen',
    secondaryCta: 'Preise ansehen',
    privateLabel: 'Für Privatverkäufer',
    privateTitle: 'Kostenlos inserieren. Nur für mehr Sichtbarkeit zahlen.',
    privateText: 'Private Verkäufer können Fahrzeuganzeigen ohne Bindung und ohne versteckte Gebühren veröffentlichen. Die Basisanzeige ist kostenlos, weil Teilnahme nicht die Hürde sein sollte.',
    businessLabel: 'Für Unternehmen',
    businessTitle: 'Unternehmen zahlen für professionelle Werkzeuge, nicht für reine Präsenz.',
    businessText: 'Business-Pläne bieten Kapazität, Statistiken, Analysen, Reichweite und Teamabläufe für Verkäufer mit Bestand und professionellem Prozess.',
    comparisonTitle: 'Warum Autorell statt ältere Marktplätze?',
    comparisonText: 'Der Unterschied liegt in der Struktur: klare Anzeigen, transparente Preise, europäischer Kontext und Werkzeuge für modernes Kaufverhalten.',
    autorellColumn: 'Autorell',
    traditionalColumn: 'Traditionell',
    comparisonRows: [
      { label: 'Privatverkauf', autorell: 'Kostenlose Basisanzeigen', other: 'Gebühren oft früh im Ablauf' },
      { label: 'Gewerblicher Verkauf', autorell: 'Werkzeuge und Skalierung', other: 'Oft Präsenz im Vordergrund' },
      { label: 'Reichweite', autorell: 'Eine Anzeige mit Europa-Kontext', other: 'Meist lokal zuerst' },
      { label: 'Ablauf', autorell: 'Für Mobilgeräte und Tempo gebaut', other: 'Längere ältere Prozesse' },
    ],
    europeTitle: 'Eine Anzeige sollte Europa verstehen.',
    europeText: 'Autorell wird rund um lokale Märkte, Sprachen und Währungen gebaut, damit Käufer Fahrzeuge im passenden Kontext vergleichen können.',
    europeStats: [
      { value: '11', label: 'Europäische Märkte' },
      { value: '10', label: 'Sprachen' },
      { value: '1', label: 'Anzeigenfluss' },
    ],
    principleTitle: 'Das Produkt soll Vertrauen vor der Anfrage schaffen.',
    principleText: 'Autorell konzentriert sich auf das, was vor der ersten Nachricht zählt: Verifizierung, Moderation, Spam-Kontrollen, schnelle Suche, responsive Seiten und optimierte Bilder.',
    principles: [
      { title: 'Sicherere Anzeigen', text: 'Verifizierung, Moderation und Betrugsschutz helfen, schwache Anzeigen und verdächtiges Verhalten zu reduzieren.' },
      { title: 'Schneller veröffentlichen', text: 'Der Verkaufsfluss sammelt die wichtigsten Fahrzeugdaten zuerst und vermeidet unnötige Schritte.' },
      { title: 'Moderne Performance', text: 'Suche, Bildverarbeitung und mobile Seiten werden als Produktqualität behandelt.' },
    ],
    finalTitle: 'Autorell soll seriös wirken, bevor die erste Nachricht gesendet wird.',
    finalText: 'Das ist das Versprechen: ruhiger, klarer und transparenter Fahrzeuge in Europa verkaufen und finden.',
  },
  fr: {
    metaTitle: 'Pourquoi choisir Autorell | Marketplace automobile européenne moderne',
    metaDescription: 'Pourquoi particuliers et entreprises choisissent Autorell : annonces gratuites, outils professionnels, portée européenne et annonces plus sûres.',
    eyebrow: 'Pourquoi Autorell',
    title: 'Une marketplace automobile pensée pour la clarté, pas le bruit.',
    intro: 'Autorell s’adresse aux particuliers et aux entreprises qui veulent vendre et trouver des véhicules sans frais cachés, parcours confus ni friction inutile.',
    primaryCta: 'Vendre un véhicule',
    secondaryCta: 'Voir les tarifs',
    privateLabel: 'Pour les particuliers',
    privateTitle: 'Publiez gratuitement. Payez seulement pour plus de visibilité.',
    privateText: 'Les particuliers peuvent publier des annonces sans engagement ni frais cachés. L’annonce de base est gratuite, car l’accès au marché ne doit pas être l’obstacle.',
    businessLabel: 'Pour les entreprises',
    businessTitle: 'Les entreprises paient pour des outils professionnels, pas pour exister.',
    businessText: 'Les offres pro ajoutent capacité, statistiques, analyses, exposition et travail en équipe pour les vendeurs qui gèrent un stock.',
    comparisonTitle: 'Pourquoi Autorell plutôt que les anciennes plateformes ?',
    comparisonText: 'La différence se voit dans la structure : annonces claires, prix transparents, contexte européen et outils adaptés aux usages modernes.',
    autorellColumn: 'Autorell',
    traditionalColumn: 'Traditionnel',
    comparisonRows: [
      { label: 'Vente particulière', autorell: 'Annonces de base gratuites', other: 'Frais souvent très tôt' },
      { label: 'Vente professionnelle', autorell: 'Outils et montée en charge', other: 'Présence souvent prioritaire' },
      { label: 'Portée', autorell: 'Une annonce avec contexte européen', other: 'Souvent local d’abord' },
      { label: 'Parcours', autorell: 'Conçu pour mobile et rapidité', other: 'Parcours plus longs' },
    ],
    europeTitle: 'Une annonce doit comprendre l’Europe.',
    europeText: 'Autorell est conçu autour des marchés locaux, des langues et des devises pour permettre une comparaison plus naturelle.',
    europeStats: [
      { value: '11', label: 'Marchés européens' },
      { value: '10', label: 'Langues' },
      { value: '1', label: 'Parcours d’annonce' },
    ],
    principleTitle: 'Le produit doit rendre la transaction plus fiable.',
    principleText: 'Autorell se concentre sur ce qui compte avant le premier message : signaux de vérification, modération, contrôles anti-spam, recherche rapide, pages mobiles et images optimisées.',
    principles: [
      { title: 'Annonces plus sûres', text: 'Vérification, modération et contrôles anti-fraude réduisent les annonces faibles et les comportements suspects.' },
      { title: 'Publication plus rapide', text: 'Le parcours recueille d’abord les informations essentielles du véhicule et évite les étapes inutiles.' },
      { title: 'Performance moderne', text: 'Recherche, images et mobile sont traités comme une qualité produit, pas comme de la décoration.' },
    ],
    finalTitle: 'Autorell doit inspirer confiance avant le premier message.',
    finalText: 'C’est la promesse : une façon plus calme, claire et transparente de vendre et trouver des véhicules en Europe.',
  },
  es: {
    metaTitle: 'Por qué elegir Autorell | Marketplace europeo moderno de vehículos',
    metaDescription: 'Por qué particulares y empresas eligen Autorell: anuncios gratis, herramientas profesionales, alcance europeo y anuncios más seguros.',
    eyebrow: 'Por qué Autorell',
    title: 'Un marketplace de vehículos creado para la claridad, no para el ruido.',
    intro: 'Autorell está pensado para personas y empresas que quieren vender y encontrar vehículos sin costes ocultos, procesos confusos ni fricción innecesaria.',
    primaryCta: 'Vender vehículo',
    secondaryCta: 'Ver precios',
    privateLabel: 'Para particulares',
    privateTitle: 'Publica gratis. Paga solo si quieres más visibilidad.',
    privateText: 'Los particulares pueden publicar anuncios sin permanencia ni costes ocultos. El anuncio básico es gratuito porque participar no debe ser la barrera.',
    businessLabel: 'Para empresas',
    businessTitle: 'Las empresas pagan por herramientas profesionales, no por existir.',
    businessText: 'Los planes de empresa añaden capacidad, estadísticas, análisis, exposición y flujos de equipo para vendedores con inventario.',
    comparisonTitle: '¿Por qué Autorell frente a marketplaces antiguos?',
    comparisonText: 'La diferencia está en la estructura: anuncios claros, precios transparentes, contexto europeo y herramientas para el comprador moderno.',
    autorellColumn: 'Autorell',
    traditionalColumn: 'Tradicional',
    comparisonRows: [
      { label: 'Venta particular', autorell: 'Anuncios básicos gratis', other: 'Costes desde el inicio' },
      { label: 'Venta profesional', autorell: 'Herramientas y escala', other: 'Presencia como coste principal' },
      { label: 'Alcance', autorell: 'Un anuncio con contexto europeo', other: 'A menudo local primero' },
      { label: 'Flujo', autorell: 'Móvil y rápido', other: 'Procesos más largos' },
    ],
    europeTitle: 'Un anuncio debe entender Europa.',
    europeText: 'Autorell se construye alrededor de mercados locales, idiomas y divisas para que comparar vehículos sea más claro.',
    europeStats: [
      { value: '11', label: 'Mercados europeos' },
      { value: '10', label: 'Idiomas' },
      { value: '1', label: 'Flujo de anuncio' },
    ],
    principleTitle: 'El producto debe hacer que la operación sea más confiable.',
    principleText: 'Autorell se centra en lo importante antes del primer mensaje: verificación, moderación, controles de spam, búsqueda rápida, páginas móviles e imágenes optimizadas.',
    principles: [
      { title: 'Anuncios más seguros', text: 'Verificación, moderación y controles antifraude ayudan a reducir anuncios débiles y comportamientos sospechosos.' },
      { title: 'Publicación más rápida', text: 'El flujo recoge primero los datos importantes del vehículo y evita pasos innecesarios.' },
      { title: 'Rendimiento moderno', text: 'La búsqueda, las imágenes y el móvil se tratan como calidad del producto.' },
    ],
    finalTitle: 'Autorell debe sentirse serio antes del primer mensaje.',
    finalText: 'Esa es la promesa: una forma más clara, tranquila y transparente de vender y encontrar vehículos en Europa.',
  },
  it: {
    metaTitle: 'Perché scegliere Autorell | Marketplace europeo moderno di veicoli',
    metaDescription: 'Perché privati e aziende scelgono Autorell: annunci gratuiti, strumenti professionali, visibilità europea e annunci più sicuri.',
    eyebrow: 'Perché Autorell',
    title: 'Un marketplace di veicoli costruito per la chiarezza, non per il rumore.',
    intro: 'Autorell è pensato per privati e aziende che vogliono vendere e trovare veicoli senza costi nascosti, percorsi confusi o attriti inutili.',
    primaryCta: 'Vendi veicolo',
    secondaryCta: 'Vedi prezzi',
    privateLabel: 'Per privati',
    privateTitle: 'Pubblica gratis. Paga solo per più visibilità.',
    privateText: 'I privati possono pubblicare annunci senza vincoli o costi nascosti. L’annuncio base è gratuito perché entrare nel mercato non deve essere la barriera.',
    businessLabel: 'Per aziende',
    businessTitle: 'Le aziende pagano strumenti professionali, non il permesso di esserci.',
    businessText: 'I piani business aggiungono capacità, statistiche, analisi, esposizione e flussi per team che gestiscono inventario.',
    comparisonTitle: 'Perché Autorell invece dei marketplace tradizionali?',
    comparisonText: 'La differenza è nella struttura: annunci chiari, prezzi trasparenti, contesto europeo e strumenti per comportamenti d’acquisto moderni.',
    autorellColumn: 'Autorell',
    traditionalColumn: 'Tradizionale',
    comparisonRows: [
      { label: 'Vendita privata', autorell: 'Annunci base gratuiti', other: 'Costi spesso anticipati' },
      { label: 'Vendita aziendale', autorell: 'Strumenti e scala', other: 'Presenza come costo principale' },
      { label: 'Copertura', autorell: 'Un annuncio con contesto europeo', other: 'Spesso locale prima' },
      { label: 'Flusso', autorell: 'Mobile e veloce', other: 'Processi più lunghi' },
    ],
    europeTitle: 'Un annuncio deve capire l’Europa.',
    europeText: 'Autorell è costruito intorno a mercati locali, lingue e valute per rendere il confronto più naturale.',
    europeStats: [
      { value: '11', label: 'Mercati europei' },
      { value: '10', label: 'Lingue' },
      { value: '1', label: 'Flusso annuncio' },
    ],
    principleTitle: 'Il prodotto deve rendere la trattativa più affidabile.',
    principleText: 'Autorell si concentra su ciò che conta prima del primo messaggio: verifiche, moderazione, controlli spam, ricerca veloce, pagine responsive e immagini ottimizzate.',
    principles: [
      { title: 'Annunci più sicuri', text: 'Verifiche, moderazione e controlli antifrode aiutano a ridurre annunci deboli e comportamenti sospetti.' },
      { title: 'Pubblicazione più rapida', text: 'Il flusso raccoglie prima i dati importanti del veicolo ed evita passaggi inutili.' },
      { title: 'Prestazioni moderne', text: 'Ricerca, immagini e mobile sono trattati come qualità del prodotto.' },
    ],
    finalTitle: 'Autorell deve sembrare serio prima del primo messaggio.',
    finalText: 'Questa è la promessa: un modo più calmo, chiaro e trasparente per vendere e trovare veicoli in Europa.',
  },
  nl: {
    metaTitle: 'Waarom Autorell kiezen | Moderne Europese voertuigmarktplaats',
    metaDescription: 'Waarom particulieren en bedrijven Autorell kiezen: gratis advertenties, zakelijke tools, Europees bereik en veiligere advertenties.',
    eyebrow: 'Waarom Autorell',
    title: 'Een voertuigmarktplaats voor duidelijkheid, niet voor ruis.',
    intro: 'Autorell is gebouwd voor particulieren en bedrijven die voertuigen willen verkopen en vinden zonder verborgen kosten, verwarrende stappen of onnodige drempels.',
    primaryCta: 'Voertuig verkopen',
    secondaryCta: 'Bekijk prijzen',
    privateLabel: 'Voor particulieren',
    privateTitle: 'Plaats gratis. Betaal alleen voor extra zichtbaarheid.',
    privateText: 'Particulieren kunnen voertuigadvertenties plaatsen zonder binding of verborgen kosten. De basisadvertentie is gratis omdat toegang geen drempel moet zijn.',
    businessLabel: 'Voor bedrijven',
    businessTitle: 'Bedrijven betalen voor professionele tools, niet om aanwezig te mogen zijn.',
    businessText: 'Zakelijke plannen voegen capaciteit, statistieken, analyses, zichtbaarheid en teamflows toe voor verkopers met voorraad.',
    comparisonTitle: 'Waarom Autorell in plaats van oudere marktplaatsen?',
    comparisonText: 'Het verschil zit in de structuur: duidelijke advertenties, transparante prijzen, Europese context en tools voor modern koopgedrag.',
    autorellColumn: 'Autorell',
    traditionalColumn: 'Traditioneel',
    comparisonRows: [
      { label: 'Particuliere verkoop', autorell: 'Gratis basisadvertenties', other: 'Kosten vaak vroeg' },
      { label: 'Zakelijke verkoop', autorell: 'Tools en schaal', other: 'Aanwezigheid centraal' },
      { label: 'Bereik', autorell: 'Een advertentie met Europese context', other: 'Vaak lokaal eerst' },
      { label: 'Workflow', autorell: 'Mobiel en snel', other: 'Langere oude flows' },
    ],
    europeTitle: 'Een advertentie moet Europa begrijpen.',
    europeText: 'Autorell wordt gebouwd rond lokale markten, talen en valuta zodat kopers voertuigen in de juiste context vergelijken.',
    europeStats: [
      { value: '11', label: 'Europese markten' },
      { value: '10', label: 'Talen' },
      { value: '1', label: 'Advertentieflow' },
    ],
    principleTitle: 'Het product moet de deal betrouwbaarder maken.',
    principleText: 'Autorell richt zich op wat telt voor het eerste bericht: verificatiesignalen, moderatie, spamcontroles, snelle zoekfunctie, responsive pagina’s en geoptimaliseerde beelden.',
    principles: [
      { title: 'Veiligere advertenties', text: 'Verificatie, moderatie en fraudebescherming helpen zwakke advertenties en verdacht gedrag te verminderen.' },
      { title: 'Sneller publiceren', text: 'De verkoopflow verzamelt eerst de belangrijkste voertuiggegevens en vermijdt onnodige stappen.' },
      { title: 'Moderne prestaties', text: 'Zoeken, beeldverwerking en mobiel worden behandeld als productkwaliteit.' },
    ],
    finalTitle: 'Autorell moet betrouwbaar voelen voordat het eerste bericht wordt verstuurd.',
    finalText: 'Dat is de belofte: rustiger, duidelijker en transparanter voertuigen verkopen en vinden in Europa.',
  },
  pl: {
    metaTitle: 'Dlaczego wybrać Autorell | Nowoczesny europejski rynek pojazdów',
    metaDescription: 'Dlaczego osoby prywatne i firmy wybierają Autorell: darmowe ogłoszenia, narzędzia biznesowe, zasięg europejski i bezpieczniejsze ogłoszenia.',
    eyebrow: 'Dlaczego Autorell',
    title: 'Rynek pojazdów zbudowany dla przejrzystości, nie hałasu.',
    intro: 'Autorell jest dla osób prywatnych i firm, które chcą sprzedawać i znajdować pojazdy bez ukrytych opłat, niejasnych procesów i zbędnych kroków.',
    primaryCta: 'Sprzedaj pojazd',
    secondaryCta: 'Zobacz cennik',
    privateLabel: 'Dla osób prywatnych',
    privateTitle: 'Dodaj ogłoszenie za darmo. Płać tylko za większą widoczność.',
    privateText: 'Osoby prywatne mogą publikować ogłoszenia bez zobowiązań i ukrytych opłat. Podstawowe ogłoszenie jest darmowe, bo wejście na rynek nie powinno być barierą.',
    businessLabel: 'Dla firm',
    businessTitle: 'Firmy płacą za profesjonalne narzędzia, nie za samą obecność.',
    businessText: 'Plany firmowe dają większą pojemność, statystyki, analizy, ekspozycję i pracę zespołową dla sprzedawców z zapasami.',
    comparisonTitle: 'Dlaczego Autorell zamiast starszych portali?',
    comparisonText: 'Różnica jest w strukturze: jasne ogłoszenia, przejrzyste ceny, kontekst europejski i narzędzia dla współczesnych kupujących.',
    autorellColumn: 'Autorell',
    traditionalColumn: 'Tradycyjnie',
    comparisonRows: [
      { label: 'Sprzedaż prywatna', autorell: 'Darmowe ogłoszenia podstawowe', other: 'Opłaty często na początku' },
      { label: 'Sprzedaż firmowa', autorell: 'Narzędzia i skala', other: 'Głównie opłata za obecność' },
      { label: 'Zasięg', autorell: 'Jedno ogłoszenie w kontekście Europy', other: 'Często najpierw lokalnie' },
      { label: 'Proces', autorell: 'Mobilnie i szybko', other: 'Dłuższe starsze procesy' },
    ],
    europeTitle: 'Jedno ogłoszenie powinno rozumieć Europę.',
    europeText: 'Autorell powstaje wokół lokalnych rynków, języków i walut, aby porównywanie pojazdów było bardziej naturalne.',
    europeStats: [
      { value: '11', label: 'Rynków europejskich' },
      { value: '10', label: 'Języków' },
      { value: '1', label: 'Proces ogłoszenia' },
    ],
    principleTitle: 'Produkt powinien ułatwiać zaufanie do transakcji.',
    principleText: 'Autorell skupia się na tym, co ważne przed pierwszą wiadomością: sygnałach weryfikacji, moderacji, kontroli spamu, szybkim wyszukiwaniu, stronach mobilnych i zoptymalizowanych zdjęciach.',
    principles: [
      { title: 'Bezpieczniejsze ogłoszenia', text: 'Weryfikacja, moderacja i ochrona przed oszustwami pomagają ograniczać słabe ogłoszenia i podejrzane zachowania.' },
      { title: 'Szybsza publikacja', text: 'Proces zbiera najważniejsze dane pojazdu najpierw i unika zbędnych kroków.' },
      { title: 'Nowoczesna wydajność', text: 'Wyszukiwanie, obrazy i mobile są traktowane jako jakość produktu.' },
    ],
    finalTitle: 'Autorell powinien budzić zaufanie przed pierwszą wiadomością.',
    finalText: 'To jest obietnica: spokojniejszy, jaśniejszy i bardziej przejrzysty sposób sprzedaży i szukania pojazdów w Europie.',
  },
  da: {
    metaTitle: 'Hvorfor vælge Autorell | Moderne europæisk køretøjsmarked',
    metaDescription: 'Derfor vælger private og virksomheder Autorell: gratis annoncer, erhvervsværktøjer, europæisk rækkevidde og tryggere annoncer.',
    eyebrow: 'Hvorfor Autorell',
    title: 'Et køretøjsmarked bygget til klarhed, ikke støj.',
    intro: 'Autorell er bygget til private og virksomheder, der vil sælge og finde køretøjer uden skjulte gebyrer, uklare flows eller unødige trin.',
    primaryCta: 'Sælg køretøj',
    secondaryCta: 'Se priser',
    privateLabel: 'For private',
    privateTitle: 'Opret gratis. Betal kun for mere synlighed.',
    privateText: 'Private kan publicere køretøjsannoncer uden binding eller skjulte gebyrer. Basisannoncen er gratis, fordi adgang ikke skal være barrieren.',
    businessLabel: 'For virksomheder',
    businessTitle: 'Virksomheder betaler for professionelle værktøjer, ikke for at være med.',
    businessText: 'Erhvervsplaner giver kapacitet, statistik, analyser, eksponering og teamflows til sælgere med lager.',
    comparisonTitle: 'Hvorfor Autorell frem for ældre markedspladser?',
    comparisonText: 'Forskellen ligger i strukturen: tydelige annoncer, transparente priser, europæisk kontekst og værktøjer til moderne køb.',
    autorellColumn: 'Autorell',
    traditionalColumn: 'Traditionelt',
    comparisonRows: [
      { label: 'Privat salg', autorell: 'Gratis basisannoncer', other: 'Gebyrer kommer ofte tidligt' },
      { label: 'Erhvervssalg', autorell: 'Værktøjer og skala', other: 'Ofte mest betaling for tilstedeværelse' },
      { label: 'Rækkevidde', autorell: 'En annonce med europæisk kontekst', other: 'Ofte lokalt først' },
      { label: 'Flow', autorell: 'Mobil og hurtig', other: 'Længere ældre flows' },
    ],
    europeTitle: 'En annonce skal forstå Europa.',
    europeText: 'Autorell bygges omkring lokale markeder, sprog og valutaer, så købere kan sammenligne køretøjer i den rette kontekst.',
    europeStats: [
      { value: '11', label: 'Europæiske markeder' },
      { value: '10', label: 'Sprog' },
      { value: '1', label: 'Annonceflow' },
    ],
    principleTitle: 'Produktet skal gøre handlen lettere at stole på.',
    principleText: 'Autorell fokuserer på det, der betyder noget før første besked: verificering, moderation, spamkontrol, hurtig søgning, responsive sider og optimerede billeder.',
    principles: [
      { title: 'Tryggere annoncer', text: 'Verificering, moderation og svindelkontrol hjælper med at reducere svage annoncer og mistænkelig adfærd.' },
      { title: 'Hurtigere publicering', text: 'Salgsflowet samler de vigtigste køretøjsoplysninger først og undgår unødige trin.' },
      { title: 'Moderne performance', text: 'Søgning, billeder og mobil oplevelse behandles som produktkvalitet.' },
    ],
    finalTitle: 'Autorell skal føles seriøst før den første besked.',
    finalText: 'Det er løftet: en roligere, klarere og mere transparent måde at sælge og finde køretøjer i Europa.',
  },
  fi: {
    metaTitle: 'Miksi valita Autorell | Moderni eurooppalainen ajoneuvomarkkina',
    metaDescription: 'Miksi yksityiset myyjät ja yritykset valitsevat Autorellin: ilmaiset ilmoitukset, yritystyökalut, eurooppalainen näkyvyys ja turvallisemmat ilmoitukset.',
    eyebrow: 'Miksi Autorell',
    title: 'Ajoneuvomarkkina, joka on rakennettu selkeyttä varten.',
    intro: 'Autorell on yksityisille ja yrityksille, jotka haluavat myydä ja löytää ajoneuvoja ilman piilokuluja, epäselviä vaiheita tai turhaa kitkaa.',
    primaryCta: 'Myy ajoneuvo',
    secondaryCta: 'Katso hinnat',
    privateLabel: 'Yksityisille',
    privateTitle: 'Ilmoita ilmaiseksi. Maksa vain lisänäkyvyydestä.',
    privateText: 'Yksityiset myyjät voivat julkaista ajoneuvoilmoituksia ilman sitoutumista tai piilokuluja. Perusilmoitus on ilmainen, koska markkinalle pääsyn ei pidä olla este.',
    businessLabel: 'Yrityksille',
    businessTitle: 'Yritykset maksavat ammattilaistyökaluista, eivät pelkästä näkyvyydestä.',
    businessText: 'Yrityspaketit lisäävät kapasiteettia, tilastoja, analytiikkaa, näkyvyyttä ja tiimityöskentelyä varastoa hallitseville myyjille.',
    comparisonTitle: 'Miksi Autorell vanhojen markkinapaikkojen sijaan?',
    comparisonText: 'Ero on rakenteessa: selkeät ilmoitukset, läpinäkyvät hinnat, eurooppalainen konteksti ja moderniin ostamiseen tehdyt työkalut.',
    autorellColumn: 'Autorell',
    traditionalColumn: 'Perinteisesti',
    comparisonRows: [
      { label: 'Yksityinen myynti', autorell: 'Ilmaiset perusilmoitukset', other: 'Maksut usein aikaisin' },
      { label: 'Yritysmyynti', autorell: 'Työkalut ja skaalautuvuus', other: 'Usein maksu läsnäolosta' },
      { label: 'Näkyvyys', autorell: 'Yksi ilmoitus eurooppalaisessa kontekstissa', other: 'Usein ensin paikallinen' },
      { label: 'Työnkulku', autorell: 'Mobiili ja nopea', other: 'Pidemmät vanhat prosessit' },
    ],
    europeTitle: 'Yhden ilmoituksen pitää ymmärtää Eurooppaa.',
    europeText: 'Autorell rakentuu paikallisten markkinoiden, kielten ja valuuttojen ympärille, jotta ajoneuvoja on helpompi vertailla.',
    europeStats: [
      { value: '11', label: 'Euroopan markkinaa' },
      { value: '10', label: 'Kieltä' },
      { value: '1', label: 'Ilmoituspolku' },
    ],
    principleTitle: 'Tuotteen pitää tehdä kaupasta helpommin luotettava.',
    principleText: 'Autorell keskittyy siihen, mikä merkitsee ennen ensimmäistä viestiä: vahvistussignaalit, moderointi, roskapostitarkistukset, nopea haku, mobiilisivut ja optimoidut kuvat.',
    principles: [
      { title: 'Turvallisemmat ilmoitukset', text: 'Vahvistukset, moderointi ja petostarkistukset auttavat vähentämään heikkoja ilmoituksia ja epäilyttävää toimintaa.' },
      { title: 'Nopeampi julkaisu', text: 'Myyntipolku kerää tärkeimmät ajoneuvotiedot ensin ja välttää turhat vaiheet.' },
      { title: 'Moderni suorituskyky', text: 'Haku, kuvat ja mobiili käsitellään tuotteen laatuna.' },
    ],
    finalTitle: 'Autorellin pitää tuntua luotettavalta ennen ensimmäistä viestiä.',
    finalText: 'Se on lupaus: rauhallisempi, selkeämpi ja läpinäkyvämpi tapa myydä ja löytää ajoneuvoja Euroopassa.',
  },
}

export async function generateWhyChooseAutorellMetadata(localeOverride?: PublicLocale): Promise<Metadata> {
  const headerStore = await headers()
  const locale = localeOverride || getRequestedLocale(headerStore)
  const copy = getWhyAutorellCopy(locale)
  const canonical = `https://www.autorell.com${localizePublicHref(locale, '/benefits')}`

  return {
    title: cleanSeoText(copy.metaTitle, 62),
    description: cleanSeoText(copy.metaDescription, 158),
    alternates: { canonical },
    openGraph: {
      title: cleanSeoText(copy.metaTitle, 62),
      description: cleanSeoText(copy.metaDescription, 158),
      url: canonical,
      type: 'website',
    },
  }
}

export default async function WhyChooseAutorellPage({
  localeOverride,
  marketCodeOverride,
}: {
  localeOverride?: PublicLocale
  marketCodeOverride?: string
}) {
  const headerStore = await headers()
  const locale = localeOverride || getRequestedLocale(headerStore)
  const marketCode = marketCodeOverride || headerStore.get('x-autorell-market') || marketCodeForLocale(locale)
  const copy = getWhyAutorellCopy(locale)

  return (
    <main className="w-full overflow-x-hidden bg-white text-[#101828]">
      <PublicHeader locale={locale} marketCode={marketCode} />

      <section className="relative w-full max-w-full overflow-hidden bg-[#0866ff] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_-12%,rgba(173,255,111,.45),rgba(173,255,111,0)_18%),linear-gradient(132deg,#074bd6_0%,#0866ff_48%,#347dff_100%)]" />
        <div className="absolute inset-y-0 right-0 hidden w-[54%] bg-[linear-gradient(135deg,rgba(255,255,255,.18),rgba(255,255,255,0)_48%)] lg:block" />
        <div className="absolute -right-24 top-16 h-[560px] w-[560px] rotate-45 bg-white/9" />
        <div className="absolute left-1/2 top-0 hidden h-full w-px bg-white/12 lg:block" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(180deg,rgba(8,102,255,0),rgba(3,34,91,.18))]" />
        <div className="mx-auto grid min-h-[720px] w-full max-w-[var(--autorell-page-max)] gap-10 px-5 pb-0 pt-14 sm:px-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(360px,.88fr)] lg:items-center lg:pt-20">
          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-[.24em] text-white/68">{copy.eyebrow}</p>
            <h1 className="mt-8 max-w-[350px] text-[46px] font-semibold leading-[.93] tracking-[-.06em] sm:max-w-[760px] sm:text-[78px] lg:text-[94px] xl:text-[104px]">
              {copy.title}
            </h1>
          </div>
          <div className="relative z-10 min-w-0 max-w-xl lg:pt-20">
            <p className="max-w-[360px] text-[21px] font-medium leading-8 tracking-[-.02em] text-white/92 sm:max-w-xl sm:text-[28px] sm:leading-[1.25]">{copy.intro}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href={localizePublicHref(locale, '/sell-vehicle')} className="inline-flex min-h-14 items-center overflow-hidden rounded-[7px] bg-white text-xs font-semibold uppercase tracking-[.12em] text-[#101828] shadow-[0_24px_60px_rgba(0,0,0,.18)] transition hover:-translate-y-0.5">
                <span className="px-6">{copy.primaryCta}</span>
                <span className="grid h-9 w-9 place-items-center border-l border-[#dbe4f0] text-[#0866ff]">›</span>
              </Link>
              <Link href={localizePublicHref(locale, '/pricing')} className="inline-flex min-h-14 items-center justify-center rounded-[7px] border border-white/35 px-6 text-xs font-semibold uppercase tracking-[.12em] text-white transition hover:-translate-y-0.5 hover:bg-white/10">
                {copy.secondaryCta}
              </Link>
            </div>
            <div className="mt-12 grid w-[calc(100vw-40px)] max-w-md grid-cols-3 overflow-hidden rounded-[8px] border border-white/16 bg-white/10 backdrop-blur sm:w-full">
              {copy.europeStats.map((stat) => (
                <div key={stat.label} className="min-w-0 border-r border-white/14 p-3 last:border-r-0 sm:p-4">
                  <p className="text-3xl font-semibold tracking-[-.05em]">{stat.value}</p>
                  <p className="mt-1 text-[10px] font-medium leading-4 text-white/68 sm:text-[11px]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <HeroMarquee locale={locale} />
        </div>
      </section>

      <section className="w-full max-w-full overflow-hidden bg-[linear-gradient(180deg,#eef5ff_0%,#ffffff_46%)] py-16 sm:py-24">
        <div className="mx-auto grid max-w-[var(--autorell-page-max)] gap-10 px-5 sm:px-8 lg:grid-cols-[230px_minmax(0,1fr)]">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#7a8797]">Why Autorell</p>
          <div>
            <h2 className="max-w-[360px] break-words text-[36px] font-semibold leading-[1.02] tracking-[-.05em] sm:max-w-5xl sm:text-7xl">
              {copy.comparisonTitle}
            </h2>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-[#526071]">{copy.comparisonText}</p>
          </div>
        </div>
      </section>

      <section className="w-full max-w-full overflow-hidden bg-white pb-10">
        <div className="mx-auto max-w-[var(--autorell-page-max)] px-5 sm:px-8">
          <PlatformSystem locale={locale} />
          <WorkflowRow
            number="01"
            title={copy.privateTitle}
            text={copy.privateText}
            cta={copy.privateLabel}
            href={localizePublicHref(locale, '/sell-vehicle')}
            visual="listing"
          />
          <WorkflowRow
            number="02"
            title={copy.businessTitle}
            text={copy.businessText}
            cta={copy.businessLabel}
            href={localizePublicHref(locale, '/business')}
            visual="business"
          />
          <WorkflowRow
            number="03"
            title={copy.europeTitle}
            text={copy.europeText}
            cta={copy.secondaryCta}
            href={localizePublicHref(locale, '/pricing')}
            visual="europe"
            stats={copy.europeStats}
          />
        </div>
      </section>

      <section className="w-full max-w-full overflow-hidden border-y border-[#dfe7f2] bg-[#f5f8fd] py-16 sm:py-24">
        <div className="mx-auto grid max-w-[var(--autorell-page-max)] gap-10 px-5 sm:px-8 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#7a8797]">Product quality</p>
            <h2 className="mt-5 max-w-2xl text-4xl font-semibold leading-[1.05] tracking-[-.045em] sm:text-5xl">
              {copy.principleTitle}
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#526071] [overflow-wrap:anywhere]">{copy.principleText}</p>
          </div>
          <div className="grid gap-0 overflow-hidden rounded-[8px] border border-[#d8e2ef] bg-white shadow-[0_24px_80px_rgba(16,24,40,.06)]">
            {copy.principles.map((principle, index) => (
              <article key={principle.title} className="grid gap-5 border-b border-[#e7eef7] p-6 last:border-b-0 sm:grid-cols-[64px_minmax(0,1fr)]">
                <p className="text-xs font-semibold text-[#0866ff]">{String(index + 1).padStart(2, '0')}</p>
                <div>
                  <h3 className="text-2xl font-semibold tracking-[-.035em]">{principle.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#667085]">{principle.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full max-w-full overflow-hidden bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-[var(--autorell-page-max)] px-5 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#7a8797]">Autorell vs traditional</p>
              <h2 className="mt-5 max-w-2xl text-4xl font-semibold leading-[1.05] tracking-[-.045em] sm:text-6xl">
                {copy.comparisonTitle}
              </h2>
              <p className="mt-6 max-w-xl text-base leading-8 text-[#526071]">{copy.comparisonText}</p>
            </div>
            <div className="overflow-hidden rounded-[8px] border border-[#dce5f2] bg-white shadow-[0_22px_70px_rgba(16,24,40,.07)]">
              <div className="grid grid-cols-[minmax(0,.8fr)_minmax(0,1fr)] border-b border-[#edf2f7] bg-[#f7faff] p-5 text-xs font-semibold uppercase tracking-[.16em] text-[#7a8797]">
                <p>Signal</p>
                <div className="grid grid-cols-2 gap-3">
                  <p>{copy.autorellColumn}</p>
                  <p>{copy.traditionalColumn}</p>
                </div>
              </div>
              {copy.comparisonRows.map((row) => (
                <div key={row.label} className="grid gap-4 border-b border-[#edf2f7] p-5 last:border-b-0 sm:grid-cols-[minmax(0,.8fr)_minmax(0,1fr)]">
                  <p className="text-sm font-semibold text-[#101828]">{row.label}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <p className="text-sm leading-6 text-[#0866ff]">{row.autorell}</p>
                    <p className="text-sm leading-6 text-[#667085]">{row.other}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative w-full max-w-full overflow-hidden bg-[#0866ff] py-16 text-white sm:py-24">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,.13),rgba(255,255,255,0)_42%)]" />
        <div className="relative mx-auto grid max-w-[var(--autorell-page-max)] gap-10 px-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-white/65">Autorell</p>
            <h2 className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.03] tracking-[-.05em] sm:text-6xl">
              {copy.finalTitle}
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78">{copy.finalText}</p>
          </div>
          <div className="grid gap-3">
            <Link href={localizePublicHref(locale, '/sell-vehicle')} className="inline-flex min-h-12 items-center justify-center rounded-[8px] bg-white px-6 text-xs font-semibold uppercase tracking-[.12em] text-[#075ce5]">
              {copy.primaryCta}
            </Link>
            <Link href={localizePublicHref(locale, '/pricing')} className="inline-flex min-h-12 items-center justify-center rounded-[8px] border border-white/35 px-6 text-xs font-semibold uppercase tracking-[.12em] text-white">
              {copy.secondaryCta}
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter locale={locale} />
    </main>
  )
}

function PlatformSystem({ locale }: { locale: PublicLocale }) {
  const labels = getSystemLabels(locale)

  return (
    <div className="relative mb-6 overflow-hidden rounded-[10px] border border-[#dce6f3] bg-[#f7faff] shadow-[0_28px_90px_rgba(16,24,40,.07)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_0%,rgba(8,102,255,.16),rgba(8,102,255,0)_34%)]" />
      <div className="relative grid gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] lg:p-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#0866ff]">{labels.eyebrow}</p>
          <h3 className="mt-5 max-w-2xl text-[34px] font-semibold leading-[1.04] tracking-[-.045em] text-[#101828] sm:text-5xl">
            {labels.title}
          </h3>
          <p className="mt-5 max-w-xl text-base leading-8 text-[#526071]">{labels.text}</p>
        </div>
        <div className="relative min-h-[360px] overflow-hidden rounded-[8px] border border-[#d8e2ef] bg-white p-4 shadow-[0_20px_70px_rgba(16,24,40,.06)] sm:p-6">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(8,102,255,.07),rgba(255,255,255,0)_48%)]" />
          <div className="relative grid h-full min-h-[310px] grid-cols-2 gap-3 sm:grid-cols-3">
            {labels.nodes.map((node, index) => (
              <div
                key={node}
                className={`rounded-[7px] border border-[#dce6f3] bg-white p-4 shadow-[0_12px_34px_rgba(16,24,40,.055)] ${index === 4 ? 'sm:scale-[1.07] sm:border-[#0866ff] sm:shadow-[0_22px_60px_rgba(8,102,255,.16)]' : ''}`}
              >
                <div className="mb-5 h-1.5 w-8 rounded-full bg-[#0866ff]" />
                <p className="text-sm font-semibold leading-5 text-[#101828]">{node}</p>
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[72%] w-px -translate-y-1/2 bg-[#c8d7eb] sm:block" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-px w-[76%] -translate-x-1/2 bg-[#c8d7eb] sm:block" />
        </div>
      </div>
    </div>
  )
}

function HeroMarquee({ locale }: { locale: PublicLocale }) {
  const labels = getTrustLabels(locale)
  const repeated = [...labels, ...labels]
  return (
    <div className="relative z-10 col-span-full -mx-5 mt-2 overflow-hidden border-t border-white/18 pt-8 sm:-mx-8 lg:mt-10">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-[linear-gradient(90deg,#0866ff,rgba(8,102,255,0))] sm:w-16" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-[linear-gradient(270deg,#1d74ff,rgba(29,116,255,0))] sm:w-20" />
      <div className="autorell-hero-marquee flex w-max items-center gap-12 pl-12 pr-5 pb-3 sm:gap-16 sm:pl-20 sm:pr-8">
        {repeated.map((label, index) => (
          <span
            key={`${label}-${index}`}
            className="whitespace-nowrap text-[24px] font-semibold tracking-[-.055em] text-[#04275f]/58 sm:text-[34px] lg:text-[42px]"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

function getTrustLabels(locale: PublicLocale) {
  if (locale === 'sv') return ['Privatpersoner', 'Handlare', 'Fordonslager', 'Importörer', 'Sverige', 'Europa', 'Bilar', 'Lastbilar']
  if (locale === 'de' || locale === 'at') return ['Privatverkäufer', 'Händler', 'Fuhrparks', 'Importeure', 'Deutschland', 'Europa', 'Autos', 'Lkw']
  if (locale === 'fr') return ['Particuliers', 'Marchands', 'Flottes', 'Importateurs', 'France', 'Europe', 'Voitures', 'Camions']
  if (locale === 'es') return ['Particulares', 'Vendedores', 'Flotas', 'Importadores', 'España', 'Europa', 'Coches', 'Camiones']
  if (locale === 'it') return ['Privati', 'Rivenditori', 'Flotte', 'Importatori', 'Italia', 'Europa', 'Auto', 'Camion']
  if (locale === 'nl' || locale === 'be') return ['Particulieren', 'Handelaars', 'Voorraden', 'Importeurs', 'Nederland', 'Europa', 'Auto’s', 'Trucks']
  if (locale === 'pl') return ['Prywatni', 'Dealerzy', 'Floty', 'Importerzy', 'Polska', 'Europa', 'Samochody', 'Ciężarówki']
  if (locale === 'da') return ['Private', 'Forhandlere', 'Flåder', 'Importører', 'Danmark', 'Europa', 'Biler', 'Lastbiler']
  if (locale === 'fi') return ['Yksityiset', 'Liikkeet', 'Kalustot', 'Maahantuojat', 'Suomi', 'Eurooppa', 'Autot', 'Kuorma-autot']
  return ['Private sellers', 'Dealers', 'Fleets', 'Importers', 'Europe', 'Cars', 'Trucks', 'Local markets']
}

function getSystemLabels(locale: PublicLocale) {
  if (locale === 'sv') {
    return {
      eyebrow: 'Marknadsplatsens operativsystem',
      title: 'Allt viktigt samlas i ett tydligare säljflöde.',
      text: 'Autorell kopplar ihop annons, sökning, marknad, trygghet och företagets arbetsflöde så att varje fordon blir enklare att publicera, hitta och följa upp.',
      nodes: ['Annonsdata', 'Bilder', 'Pris', 'Plats', 'Sökning', 'Verifiering', 'Meddelanden', 'Statistik', 'Europa'],
    }
  }
  if (locale === 'de' || locale === 'at') {
    return {
      eyebrow: 'Betriebssystem für den Markt',
      title: 'Alles Wichtige läuft in einem klareren Verkaufsfluss zusammen.',
      text: 'Autorell verbindet Anzeige, Suche, Markt, Vertrauen und Teamabläufe, damit jedes Fahrzeug einfacher veröffentlicht, gefunden und verfolgt werden kann.',
      nodes: ['Anzeigendaten', 'Bilder', 'Preis', 'Ort', 'Suche', 'Verifizierung', 'Nachrichten', 'Statistik', 'Europa'],
    }
  }
  if (locale === 'fr') {
    return {
      eyebrow: 'Système du marché',
      title: 'L’essentiel est réuni dans un parcours de vente plus clair.',
      text: 'Autorell relie annonce, recherche, marché, confiance et travail d’équipe pour rendre chaque véhicule plus simple à publier, trouver et suivre.',
      nodes: ['Données', 'Images', 'Prix', 'Lieu', 'Recherche', 'Vérification', 'Messages', 'Statistiques', 'Europe'],
    }
  }
  if (locale === 'es') {
    return {
      eyebrow: 'Sistema del marketplace',
      title: 'Todo lo importante se une en un flujo de venta más claro.',
      text: 'Autorell conecta anuncio, búsqueda, mercado, confianza y trabajo en equipo para que cada vehículo sea más fácil de publicar, encontrar y seguir.',
      nodes: ['Datos', 'Imágenes', 'Precio', 'Ubicación', 'Búsqueda', 'Verificación', 'Mensajes', 'Estadísticas', 'Europa'],
    }
  }
  if (locale === 'it') {
    return {
      eyebrow: 'Sistema del marketplace',
      title: 'Tutto ciò che conta entra in un flusso di vendita più chiaro.',
      text: 'Autorell collega annuncio, ricerca, mercato, fiducia e lavoro di squadra per rendere ogni veicolo più semplice da pubblicare, trovare e seguire.',
      nodes: ['Dati', 'Immagini', 'Prezzo', 'Località', 'Ricerca', 'Verifica', 'Messaggi', 'Statistiche', 'Europa'],
    }
  }
  if (locale === 'nl' || locale === 'be') {
    return {
      eyebrow: 'Besturingssysteem voor de markt',
      title: 'Alles wat telt komt samen in een duidelijker verkoopproces.',
      text: 'Autorell verbindt advertentie, zoeken, markt, vertrouwen en teamwerk zodat elk voertuig eenvoudiger te publiceren, vinden en volgen is.',
      nodes: ['Advertentiedata', 'Afbeeldingen', 'Prijs', 'Plaats', 'Zoeken', 'Verificatie', 'Berichten', 'Statistiek', 'Europa'],
    }
  }
  if (locale === 'pl') {
    return {
      eyebrow: 'System marketplace',
      title: 'Wszystko, co ważne, łączy się w jaśniejszy proces sprzedaży.',
      text: 'Autorell łączy ogłoszenie, wyszukiwanie, rynek, zaufanie i pracę zespołu, aby każdy pojazd łatwiej opublikować, znaleźć i monitorować.',
      nodes: ['Dane', 'Zdjęcia', 'Cena', 'Lokalizacja', 'Wyszukiwanie', 'Weryfikacja', 'Wiadomości', 'Statystyki', 'Europa'],
    }
  }
  if (locale === 'da') {
    return {
      eyebrow: 'Markedspladsens styresystem',
      title: 'Alt det vigtige samles i et klarere salgsflow.',
      text: 'Autorell forbinder annonce, søgning, marked, tillid og teamarbejde, så hvert køretøj bliver lettere at udgive, finde og følge.',
      nodes: ['Annoncedata', 'Billeder', 'Pris', 'Placering', 'Søgning', 'Verificering', 'Beskeder', 'Statistik', 'Europa'],
    }
  }
  if (locale === 'fi') {
    return {
      eyebrow: 'Markkinapaikan käyttöjärjestelmä',
      title: 'Tärkeimmät asiat yhdistyvät selkeämpään myyntipolkuun.',
      text: 'Autorell yhdistää ilmoituksen, haun, markkinan, luottamuksen ja tiimityön, jotta jokainen ajoneuvo on helpompi julkaista, löytää ja seurata.',
      nodes: ['Ilmoitustiedot', 'Kuvat', 'Hinta', 'Sijainti', 'Haku', 'Varmennus', 'Viestit', 'Tilastot', 'Eurooppa'],
    }
  }

  return {
    eyebrow: 'Marketplace operating system',
    title: 'Everything important moves through one clearer selling flow.',
    text: 'Autorell connects listing data, search, market context, trust signals and business workflows so every vehicle becomes easier to publish, find and follow up.',
    nodes: ['Listing data', 'Images', 'Price', 'Location', 'Search', 'Verification', 'Messages', 'Analytics', 'Europe'],
  }
}

function WorkflowRow({
  number,
  title,
  text,
  cta,
  href,
  visual,
  stats,
}: {
  number: string
  title: string
  text: string
  cta: string
  href: string
  visual: 'listing' | 'business' | 'europe'
  stats?: readonly { value: string; label: string }[]
}) {
  return (
    <article className="grid w-full min-w-0 max-w-full gap-8 border-t border-[#d8e2ef] py-12 sm:py-16 lg:grid-cols-[230px_minmax(0,.85fr)_minmax(380px,1fr)] lg:items-center">
      <p className="text-xs font-semibold text-[#8a96a6]">{number}</p>
      <div className="min-w-0">
        <h3 className="max-w-[340px] break-words text-[31px] font-semibold leading-[1.08] tracking-[-.035em] sm:max-w-xl sm:text-5xl">{title}</h3>
        <p className="mt-6 max-w-[330px] text-base leading-8 text-[#526071] [overflow-wrap:anywhere] sm:max-w-xl">{text}</p>
        <Link href={href} className="mt-8 inline-flex min-h-11 items-center justify-center rounded-[8px] border border-[#d6e1ee] px-5 text-xs font-semibold uppercase tracking-[.12em] text-[#101828] transition hover:border-[#0866ff] hover:text-[#0866ff]">
          {cta}
        </Link>
      </div>
      <div className="min-w-0">
        <PlatformVisual variant={visual} stats={stats} />
      </div>
    </article>
  )
}

function PlatformVisual({
  variant,
  stats,
}: {
  variant: 'listing' | 'business' | 'europe'
  stats?: readonly { value: string; label: string }[]
}) {
  const sideLabels =
    variant === 'listing'
      ? ['Photos', 'Price', 'Location', 'Details']
      : variant === 'business'
        ? ['Inventory', 'Team', 'Stats', 'Leads']
        : ['Markets', 'Languages', 'Currency', 'Search']

  return (
    <div className="relative w-full max-w-full min-h-[320px] overflow-hidden rounded-[6px] bg-[#0866ff] p-6 shadow-[0_24px_70px_rgba(8,102,255,.22)] sm:min-h-[420px] sm:p-8">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,.14),rgba(255,255,255,0)_56%)]" />
      <div className="relative grid h-full min-h-[270px] place-items-center">
        <div className="grid h-20 w-20 place-items-center rounded-[18px] bg-white text-3xl font-semibold tracking-[-.05em] text-[#0866ff] shadow-[0_18px_40px_rgba(5,48,122,.22)]">
          A
        </div>
        {sideLabels.map((label, index) => {
          const positions = [
            'left-0 top-8',
            'right-0 top-16',
            'left-4 bottom-14',
            'right-3 bottom-8',
          ]
          return (
            <div key={label} className={`absolute ${positions[index]} rounded-[5px] bg-white/18 px-4 py-3 text-[11px] font-semibold uppercase tracking-[.12em] text-white/78`}>
              {label}
            </div>
          )
        })}
        <div className="absolute left-1/2 top-1/2 h-px w-[76%] -translate-x-1/2 bg-white/18" />
        <div className="absolute left-1/2 top-1/2 h-[76%] w-px -translate-y-1/2 bg-white/18" />
        {stats ? (
          <div className="absolute inset-x-4 bottom-4 grid grid-cols-3 gap-2">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-[5px] bg-white/14 p-3">
                <p className="text-2xl font-semibold text-white">{stat.value}</p>
                <p className="mt-1 text-[10px] font-medium leading-4 text-white/68">{stat.label}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function getWhyAutorellCopy(locale: PublicLocale) {
  if (locale === 'sv') return whyAutorellCopy.sv
  if (locale === 'de' || locale === 'at') return whyAutorellCopy.de
  if (locale === 'be' || locale === 'nl') return whyAutorellCopy.nl
  if (locale === 'fr') return whyAutorellCopy.fr
  if (locale === 'es') return whyAutorellCopy.es
  if (locale === 'it') return whyAutorellCopy.it
  if (locale === 'pl') return whyAutorellCopy.pl
  if (locale === 'da') return whyAutorellCopy.da
  if (locale === 'fi') return whyAutorellCopy.fi
  return whyAutorellCopy.en
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
