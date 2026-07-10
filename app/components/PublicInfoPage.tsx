import Link from 'next/link'
import { headers } from 'next/headers'
import type { Metadata } from 'next'
import {
  ArrowRight,
  BadgeEuro,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  CreditCard,
  FileSearch,
  Handshake,
  Heart,
  Newspaper,
  Route,
  Scale,
  SearchCheck,
  ShieldCheck,
  Truck,
  Wrench,
} from 'lucide-react'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'
import {
  isPublicLanguage,
  localizePublicHref,
  translatePublicObject,
  type PublicLocale,
} from '@/lib/public-i18n'
import {
  formatListingPrice,
  marketplaceCategories as listingPriceCategories,
} from '@/lib/marketplace-pricing'
import { cleanSeoText } from '@/lib/market-seo'

export type PublicInfoPageKey =
  | 'sell-vehicle'
  | 'how-selling-works'
  | 'pricing'
  | 'dealer-solutions'
  | 'saved-searches'
  | 'compare-vehicles'
  | 'vehicle-history'
  | 'buying-guide'
  | 'about'
  | 'careers'
  | 'press'
  | 'partners'
  | 'safety-tips'
  | 'payments'
  | 'shipping-delivery'

type PublicInfoPageCopy = {
  metaTitle: string
  metaDescription: string
  eyebrow: string
  title: string
  intro: string
  primaryCta: string
  secondaryCta: string
  highlights: readonly string[]
  sections: readonly {
    title: string
    text: string
  }[]
  finalTitle: string
  finalText: string
}

const pageIcons = {
  'sell-vehicle': ArrowRight,
  'how-selling-works': Route,
  pricing: BadgeEuro,
  'dealer-solutions': BriefcaseBusiness,
  'saved-searches': Heart,
  'compare-vehicles': Scale,
  'vehicle-history': FileSearch,
  'buying-guide': SearchCheck,
  about: Building2,
  careers: Wrench,
  press: Newspaper,
  partners: Handshake,
  'safety-tips': ShieldCheck,
  payments: CreditCard,
  'shipping-delivery': Truck,
} satisfies Record<PublicInfoPageKey, typeof ArrowRight>

const infoPageCopy = {
  en: {
    'sell-vehicle': {
      metaTitle: 'Sell your vehicle | Autorell',
      metaDescription:
        'Create a clear vehicle listing, reach buyers across Europe and manage enquiries through Autorell.',
      eyebrow: 'Sell on Autorell',
      title: 'Sell your vehicle with a listing built for European buyers.',
      intro:
        'Autorell helps private sellers and companies present vehicles clearly, collect serious enquiries and keep the selling process organised from the first listing.',
      primaryCta: 'Create listing',
      secondaryCta: 'View pricing',
      highlights: ['Cars, vans, trucks and specialist vehicles', 'Country, city and currency context', 'Clear buyer contact flow'],
      sections: [
        {
          title: 'A professional listing',
          text: 'Add photos, price, location, specifications and seller details so buyers understand the vehicle before they contact you.',
        },
        {
          title: 'More relevant reach',
          text: 'Your vehicle can be discovered through category pages and market pages built for buyers searching across Europe.',
        },
        {
          title: 'You stay in control',
          text: 'Autorell provides the marketplace, account and enquiry tools. The seller remains responsible for the vehicle and final agreement.',
        },
      ],
      finalTitle: 'Ready to publish?',
      finalText:
        'Create an account, prepare the vehicle details and publish when your listing is complete.',
    },
    'how-selling-works': {
      metaTitle: 'How selling works | Autorell',
      metaDescription:
        'Learn how sellers create listings, receive enquiries and complete vehicle deals through Autorell.',
      eyebrow: 'Selling process',
      title: 'From listing to buyer enquiry in a few clear steps.',
      intro:
        'The selling flow is designed to keep information structured and make every buyer conversation easier to follow.',
      primaryCta: 'Start selling',
      secondaryCta: 'Contact support',
      highlights: ['Create account', 'Publish listing', 'Manage enquiries'],
      sections: [
        {
          title: 'Prepare the listing',
          text: 'Gather photos, documents, mileage, condition, equipment and the price you want buyers to see.',
        },
        {
          title: 'Publish and follow interest',
          text: 'Once published, the listing can appear in search, categories and local market views.',
        },
        {
          title: 'Agree outside the listing',
          text: 'Buyer and seller agree payment, pickup, documents and transport directly before completing the transaction.',
        },
      ],
      finalTitle: 'A clearer selling path',
      finalText:
        'Good listings answer the most important questions before the first message arrives.',
    },
    pricing: {
      metaTitle: 'Listing pricing | Autorell',
      metaDescription:
        'Understand Autorell listing visibility, account options and pricing for private and business vehicle sellers.',
      eyebrow: 'Pricing',
      title: 'Simple listing options for private sellers and businesses.',
      intro:
        'Autorell keeps pricing straightforward: start with the listing path that matches how often you sell and the level of visibility you need.',
      primaryCta: 'Create listing',
      secondaryCta: 'Business solutions',
      highlights: ['Private listing options', 'Business account support', 'Visibility built around categories'],
      sections: [
        {
          title: 'Private sellers',
          text: 'Use a standard listing when you want to sell one vehicle with clear photos, description and contact options.',
        },
        {
          title: 'Recurring sellers',
          text: 'Companies and dealers can use business tools for inventory, profiles and more consistent enquiry handling.',
        },
        {
          title: 'No hidden buyer fee from Autorell',
          text: 'Buyers should always confirm final vehicle price, payment method and handover terms directly with the seller.',
        },
      ],
      finalTitle: 'Choose the right route',
      finalText:
        'Start with one listing or create a business account if you manage multiple vehicles.',
    },
    'dealer-solutions': {
      metaTitle: 'Dealer solutions | Autorell',
      metaDescription:
        'Autorell dealer solutions help professional vehicle sellers publish inventory and reach European buyers.',
      eyebrow: 'Dealer solutions',
      title: 'A cleaner way for dealers to present vehicle inventory.',
      intro:
        'Autorell gives professional sellers a marketplace presence, structured inventory pages and buyer enquiry tools without unnecessary complexity.',
      primaryCta: 'Create business account',
      secondaryCta: 'Contact sales',
      highlights: ['Business seller profile', 'Inventory listings', 'European buyer reach'],
      sections: [
        {
          title: 'Inventory presentation',
          text: 'Show cars, vans, trucks, machines and other categories with data buyers can scan quickly.',
        },
        {
          title: 'Enquiry management',
          text: 'Keep buyer messages tied to the listing so your team can respond with context.',
        },
        {
          title: 'Market-ready structure',
          text: 'Country, currency, category and seller information are presented consistently across the marketplace.',
        },
      ],
      finalTitle: 'Built for repeat sellers',
      finalText:
        'Dealers can start small and grow into a broader Autorell inventory presence.',
    },
    'saved-searches': {
      metaTitle: 'Saved searches | Autorell',
      metaDescription:
        'Save searches and listings on Autorell so you can return to interesting vehicles more easily.',
      eyebrow: 'Buyer tools',
      title: 'Keep track of the vehicles and searches that matter.',
      intro:
        'Saved searches help buyers return to relevant vehicles, compare options and continue conversations from the same account.',
      primaryCta: 'Search vehicles',
      secondaryCta: 'Create account',
      highlights: ['Save interesting vehicles', 'Return from any device', 'Keep searches organised'],
      sections: [
        {
          title: 'Shortlist vehicles',
          text: 'Use saved vehicles to collect cars or specialist vehicles you want to inspect again.',
        },
        {
          title: 'Follow a market',
          text: 'Save search combinations such as category, country, price range and keywords.',
        },
        {
          title: 'Sign in for continuity',
          text: 'Saved items work best when connected to your Autorell account.',
        },
      ],
      finalTitle: 'A calmer buying process',
      finalText:
        'Good search organisation makes it easier to compare vehicles before contacting a seller.',
    },
    'compare-vehicles': {
      metaTitle: 'Compare vehicles | Autorell',
      metaDescription:
        'Compare listings on Autorell by price, mileage, condition, location and seller information.',
      eyebrow: 'Compare',
      title: 'Compare vehicles with the details buyers need first.',
      intro:
        'Autorell listings are structured so you can review the practical differences between vehicles before deciding which seller to contact.',
      primaryCta: 'Browse listings',
      secondaryCta: 'Buying guide',
      highlights: ['Price and currency', 'Location and seller type', 'Mileage, year and equipment'],
      sections: [
        {
          title: 'Check the essentials',
          text: 'Review price, registration year, mileage, fuel type, gearbox, condition and location.',
        },
        {
          title: 'Look beyond price',
          text: 'Transport distance, documents, seller responsiveness and vehicle history can change the real value of a deal.',
        },
        {
          title: 'Ask consistent questions',
          text: 'Use the same checklist for each vehicle so your comparison stays fair.',
        },
      ],
      finalTitle: 'Compare before you commit',
      finalText:
        'A structured comparison makes every buyer conversation more focused.',
    },
    'vehicle-history': {
      metaTitle: 'Vehicle history checks | Autorell',
      metaDescription:
        'Understand what to check in vehicle history before buying a car, van, truck or other vehicle.',
      eyebrow: 'Vehicle history',
      title: 'Know what to ask before you buy.',
      intro:
        'Vehicle history is one of the most important parts of a cross-border purchase. Autorell helps buyers focus on the right questions.',
      primaryCta: 'Search vehicles',
      secondaryCta: 'Safety tips',
      highlights: ['Ownership and registration', 'Service and inspection records', 'Finance and damage checks'],
      sections: [
        {
          title: 'Ask for documents',
          text: 'Request registration documents, service records, inspection papers and proof that the seller can sell the vehicle.',
        },
        {
          title: 'Check external records',
          text: 'Use official or reputable third-party history services in the country where the vehicle is registered.',
        },
        {
          title: 'Be careful with urgency',
          text: 'Avoid sellers who refuse documentation, rush payment or move the conversation away from traceable channels too early.',
        },
      ],
      finalTitle: 'History protects both sides',
      finalText:
        'Clear documentation makes the deal easier for serious buyers and serious sellers.',
    },
    'buying-guide': {
      metaTitle: 'Buying guide | Autorell',
      metaDescription:
        'A practical Autorell guide for buying vehicles across Europe with clearer checks, payment and transport planning.',
      eyebrow: 'Buying guide',
      title: 'Buy across Europe with a better checklist.',
      intro:
        'Cross-border vehicle buying works best when price, documents, payment, transport and registration are agreed early.',
      primaryCta: 'Browse vehicles',
      secondaryCta: 'Safety tips',
      highlights: ['Check the seller', 'Confirm documents', 'Plan payment and pickup'],
      sections: [
        {
          title: 'Before contacting',
          text: 'Compare similar listings and prepare questions about ownership, condition, VAT, service history and availability.',
        },
        {
          title: 'Before paying',
          text: 'Confirm the seller identity, payment route, receipt, handover location and which documents you receive.',
        },
        {
          title: 'Before transport',
          text: 'Plan collection, insurance, export papers, transport company and registration rules in your country.',
        },
      ],
      finalTitle: 'Preparation creates confidence',
      finalText:
        'The best deals are usually the ones where both sides document the agreement clearly.',
    },
    about: {
      metaTitle: 'About Autorell | European vehicle marketplace',
      metaDescription:
        'Autorell is a European marketplace for buying and selling vehicles across countries and categories.',
      eyebrow: 'About Autorell',
      title: 'A European marketplace for serious vehicle listings.',
      intro:
        'Autorell connects buyers and sellers across vehicle categories with a clear marketplace built for local markets and cross-border discovery.',
      primaryCta: 'Explore vehicles',
      secondaryCta: 'Contact us',
      highlights: ['Marketplace technology', 'Multiple vehicle categories', 'Built for European markets'],
      sections: [
        {
          title: 'What Autorell does',
          text: 'We provide the marketplace, account tools and listing experience that help vehicles reach relevant buyers.',
        },
        {
          title: 'What Autorell is not',
          text: 'Autorell is not automatically the buyer, seller, dealer, exporter or financing party for ordinary marketplace listings.',
        },
        {
          title: 'Why it exists',
          text: 'Vehicle buying in Europe is fragmented. Autorell makes discovery, comparison and contact easier to understand.',
        },
      ],
      finalTitle: 'One place for the European market',
      finalText:
        'The goal is simple: clearer listings, more relevant buyers and better prepared conversations.',
    },
    careers: {
      metaTitle: 'Careers | Autorell',
      metaDescription:
        'Learn about careers at Autorell and the teams building a European vehicle marketplace.',
      eyebrow: 'Careers',
      title: 'Help build the next European vehicle marketplace.',
      intro:
        'Autorell is growing a product, operations and support organisation around a practical mission: make vehicle trade easier to navigate.',
      primaryCta: 'Contact us',
      secondaryCta: 'About Autorell',
      highlights: ['Product and engineering', 'Marketplace operations', 'Customer support'],
      sections: [
        {
          title: 'How we work',
          text: 'We value clear ownership, practical product decisions and careful attention to buyers and sellers.',
        },
        {
          title: 'Who fits well',
          text: 'People who enjoy marketplaces, vehicles, international products and high-trust customer workflows.',
        },
        {
          title: 'Open interest',
          text: 'If no role is listed, candidates can still contact Autorell with relevant experience and market knowledge.',
        },
      ],
      finalTitle: 'Build something useful',
      finalText:
        'The best marketplace work is detailed, steady and close to real customer needs.',
    },
    press: {
      metaTitle: 'Press | Autorell',
      metaDescription:
        'Press information for Autorell, including marketplace background and media contact routes.',
      eyebrow: 'Press',
      title: 'Information for media and industry partners.',
      intro:
        'Autorell can provide background on the marketplace, vehicle categories, European buyer behaviour and product launches.',
      primaryCta: 'Contact press',
      secondaryCta: 'About Autorell',
      highlights: ['Company background', 'Marketplace updates', 'Media enquiries'],
      sections: [
        {
          title: 'Media enquiries',
          text: 'Journalists can contact Autorell for company information, quotes and marketplace context.',
        },
        {
          title: 'Brand use',
          text: 'Autorell name, logo and screenshots should only be used in a way that accurately represents the marketplace.',
        },
        {
          title: 'Industry context',
          text: 'We can comment on digital vehicle marketplaces, buyer trust and cross-border discovery.',
        },
      ],
      finalTitle: 'Need a press contact?',
      finalText:
        'Send the topic, deadline and publication details so the right person can respond.',
    },
    partners: {
      metaTitle: 'Partners | Autorell',
      metaDescription:
        'Partner with Autorell around vehicle inventory, marketplace distribution, finance, payments, transport or data services.',
      eyebrow: 'Partners',
      title: 'Partner with Autorell around the vehicle marketplace.',
      intro:
        'Autorell works best with partners who help buyers and sellers make better decisions before, during and after a vehicle deal.',
      primaryCta: 'Contact partnerships',
      secondaryCta: 'Dealer solutions',
      highlights: ['Inventory partners', 'Transport and inspection', 'Payment and data services'],
      sections: [
        {
          title: 'Inventory partnerships',
          text: 'Professional sellers and platforms can explore ways to present vehicle inventory more clearly on Autorell.',
        },
        {
          title: 'Service partnerships',
          text: 'Transport, inspection, history and payment providers can support safer cross-border decisions.',
        },
        {
          title: 'Market expertise',
          text: 'Local partners help make country-specific buying and selling more useful for users.',
        },
      ],
      finalTitle: 'Good partnerships reduce friction',
      finalText:
        'The strongest partners make the vehicle journey clearer for both sides of the deal.',
    },
    'safety-tips': {
      metaTitle: 'Safety tips | Autorell',
      metaDescription:
        'Practical safety tips for buyers and sellers using Autorell vehicle listings.',
      eyebrow: 'Safety',
      title: 'Safer vehicle deals start with better checks.',
      intro:
        'Autorell encourages buyers and sellers to verify identity, documentation, payment details and handover terms before committing.',
      primaryCta: 'Report a problem',
      secondaryCta: 'Buying guide',
      highlights: ['Verify identity', 'Keep records', 'Avoid rushed payment'],
      sections: [
        {
          title: 'For buyers',
          text: 'Check seller details, vehicle documents, history, payment terms and collection arrangements before sending money.',
        },
        {
          title: 'For sellers',
          text: 'Confirm buyer identity, avoid suspicious overpayments and keep communication records tied to the listing.',
        },
        {
          title: 'When something feels wrong',
          text: 'Pause the deal, preserve messages and payment references, and report the issue to Autorell and local authorities if needed.',
        },
      ],
      finalTitle: 'Trust is built in details',
      finalText:
        'Careful documentation protects serious buyers, serious sellers and the marketplace.',
    },
    payments: {
      metaTitle: 'Payments | Autorell',
      metaDescription:
        'Understand payment planning, receipts and safer payment habits for Autorell vehicle transactions.',
      eyebrow: 'Payments',
      title: 'Plan payment before the vehicle changes hands.',
      intro:
        'Payment terms should be agreed clearly between buyer and seller, with enough documentation for both sides to prove what happened.',
      primaryCta: 'Safety tips',
      secondaryCta: 'Contact support',
      highlights: ['Confirm recipient details', 'Use traceable methods', 'Keep receipts'],
      sections: [
        {
          title: 'Agree the method',
          text: 'Choose a payment method both parties understand and confirm all account details before transferring funds.',
        },
        {
          title: 'Document the transaction',
          text: 'Keep invoices, receipts, bank references and written agreement terms connected to the vehicle.',
        },
        {
          title: 'Avoid pressure',
          text: 'Be careful with urgent requests, changed account details, unusual intermediaries or deals that avoid written records.',
        },
      ],
      finalTitle: 'Clarity protects the deal',
      finalText:
        'A documented payment process makes disputes easier to prevent and investigate.',
    },
    'shipping-delivery': {
      metaTitle: 'Shipping and delivery | Autorell',
      metaDescription:
        'Plan vehicle pickup, transport, insurance and delivery when buying or selling across Europe.',
      eyebrow: 'Shipping and delivery',
      title: 'Plan pickup and transport before agreeing the deal.',
      intro:
        'Cross-border vehicle logistics are easier when buyer and seller agree who handles pickup, transport, insurance and export documents.',
      primaryCta: 'Buying guide',
      secondaryCta: 'Contact support',
      highlights: ['Pickup location', 'Transport documents', 'Insurance and handover'],
      sections: [
        {
          title: 'Before pickup',
          text: 'Confirm address, vehicle condition, access, keys, documents and the person authorised to release the vehicle.',
        },
        {
          title: 'During transport',
          text: 'Use a reputable transport provider, confirm insurance and keep photos or inspection notes at loading.',
        },
        {
          title: 'At delivery',
          text: 'Check condition, mileage, documents and handover records before closing the logistics process.',
        },
      ],
      finalTitle: 'Good logistics are part of the purchase',
      finalText:
        'Transport planning should be handled with the same care as price and payment.',
    },
  },
  sv: {
    'sell-vehicle': {
      metaTitle: 'Sälj ditt fordon | Autorell',
      metaDescription:
        'Skapa en tydlig fordonsannons, nå köpare i Europa och hantera förfrågningar via Autorell.',
      eyebrow: 'Salj pa Autorell',
      title: 'Salj ditt fordon med en annons byggd for europeiska kopare.',
      intro:
        'Autorell hjalper privatpersoner och foretag att presentera fordon tydligt, samla seriÃ¶sa forfragningar och halla processen organiserad.',
      primaryCta: 'Skapa annons',
      secondaryCta: 'Se priser',
      highlights: ['Bilar, transport och specialfordon', 'Land, stad och valuta visas tydligt', 'Tydligt kontaktflode'],
      sections: [
        { title: 'En professionell annons', text: 'Lagg till bilder, pris, plats, specifikationer och saljaruppgifter sa kopare forstar fordonet innan de tar kontakt.' },
        { title: 'Mer relevant rackvidd', text: 'Fordonet kan hittas via sok, kategorier och lokala marknadssidor for kopare i Europa.' },
        { title: 'Du har kontrollen', text: 'Autorell tillhandahaller marknadsplatsen och verktygen. Saljaren ansvarar for fordonet och slutavtalet.' },
      ],
      finalTitle: 'Redo att publicera?',
      finalText: 'Skapa konto, forbered fordonsuppgifterna och publicera nar annonsen ar komplett.',
    },
    'how-selling-works': {
      metaTitle: 'Sa fungerar forsÃ¤ljning | Autorell',
      metaDescription: 'Se hur säljare skapar annonser, får förfrågningar och gör fordonsaffärer via Autorell.',
      eyebrow: 'Saljprocessen',
      title: 'Fran annons till koparforfragan i tydliga steg.',
      intro: 'Flodet ar byggt for strukturerad information och enklare dialog mellan kopare och saljare.',
      primaryCta: 'Borja salja',
      secondaryCta: 'Kontakta support',
      highlights: ['Skapa konto', 'Publicera annons', 'Hantera forfragningar'],
      sections: [
        { title: 'Forbered annonsen', text: 'Samla bilder, dokument, miltal, skick, utrustning och priset kopare ska se.' },
        { title: 'Publicera och folj intresse', text: 'Nar annonsen ar publicerad kan den visas i sok, kategorier och marknadsvyer.' },
        { title: 'Kom overens tydligt', text: 'Kopare och saljare kommer overens om betalning, hamtning, dokument och transport.' },
      ],
      finalTitle: 'En tydligare saljvag',
      finalText: 'Bra annonser svarar pa de viktigaste fragorna innan forsta meddelandet.',
    },
    pricing: {
      metaTitle: 'Annonspriser | Autorell',
      metaDescription: 'Förstå Autorells annonsalternativ för privatpersoner och företag.',
      eyebrow: 'Priser',
      title: 'Enkla annonsalternativ for privatpersoner och foretag.',
      intro: 'Valj den vag som passar hur ofta du saljer och vilken synlighet du behover.',
      primaryCta: 'Skapa annons',
      secondaryCta: 'Foretagslosningar',
      highlights: ['Privata annonser', 'Foretagskonto', 'Synlighet via kategorier'],
      sections: [
        { title: 'Privata saljare', text: 'Anvand en standardannons nar du vill salja ett fordon med bilder, beskrivning och kontaktvag.' },
        { title: 'Aterkommande saljare', text: 'Foretag kan anvanda verktyg for lager, profiler och mer konsekvent hantering av forfragningar.' },
        { title: 'Tydliga villkor', text: 'Kopare ska alltid bekrafta slutpris, betalning och overlamning direkt med saljaren.' },
      ],
      finalTitle: 'Valj ratt vag',
      finalText: 'Borja med en annons eller skapa foretagskonto om du hanterar flera fordon.',
    },
    'dealer-solutions': {
      metaTitle: 'Dealer solutions | Autorell',
      metaDescription: 'Autorell hjälper professionella säljare att publicera lager och nå köpare i Europa.',
      eyebrow: 'Dealer solutions',
      title: 'Ett renare satt for handlare att visa fordonslager.',
      intro: 'Autorell ger professionella saljare marknadsnarvaro, strukturerade lagersidor och verktyg for koparforfragningar.',
      primaryCta: 'Skapa foretagskonto',
      secondaryCta: 'Kontakta salj',
      highlights: ['Foretagsprofil', 'Lagerannonser', 'Europeisk rackvidd'],
      sections: [
        { title: 'Lagerpresentation', text: 'Visa bilar, transportbilar, lastbilar, maskiner och fler kategorier med data kopare snabbt kan skanna.' },
        { title: 'Forfragningar', text: 'Hall koparmeddelanden kopplade till ratt annons sa teamet kan svara med sammanhang.' },
        { title: 'Marknadsstruktur', text: 'Land, valuta, kategori och saljarinformation visas konsekvent pa marknadsplatsen.' },
      ],
      finalTitle: 'Byggt for aterkommande saljare',
      finalText: 'Handlare kan borja smalt och vaxa till en bredare narvaro pa Autorell.',
    },
    'saved-searches': {
      metaTitle: 'Sparade sökningar | Autorell',
      metaDescription: 'Spara sökningar och annonser på Autorell för att enklare hitta tillbaka till intressanta fordon.',
      eyebrow: 'Koparverktyg',
      title: 'Hall koll pa fordonen och sokningarna som betyder mest.',
      intro: 'Sparade sokningar hjalper kopare att atervanda till relevanta fordon, jamfora alternativ och fortsatta fran samma konto.',
      primaryCta: 'Sok fordon',
      secondaryCta: 'Skapa konto',
      highlights: ['Spara intressanta fordon', 'Atervanda fran olika enheter', 'Organisera sokningar'],
      sections: [
        { title: 'Skapa kortlista', text: 'Spara fordon som du vill granska igen innan du kontaktar saljaren.' },
        { title: 'Folj en marknad', text: 'Spara kombinationer av kategori, land, prisintervall och sokord.' },
        { title: 'Logga in for kontinuitet', text: 'Sparade objekt fungerar bast nar de ar kopplade till ditt konto.' },
      ],
      finalTitle: 'En lugnare kopprocess',
      finalText: 'Bra organisation gor det enklare att jamfora fordon innan kontakt.',
    },
    'compare-vehicles': {
      metaTitle: 'Jämför fordon | Autorell',
      metaDescription: 'Jämför Autorell-annonser efter pris, miltal, skick, plats och säljarinformation.',
      eyebrow: 'Jamfor',
      title: 'Jamfor fordon med de detaljer kopare behover forst.',
      intro: 'Strukturerade annonser gor det lattare att se skillnader innan du valjer vem du kontaktar.',
      primaryCta: 'Bladdra bland annonser',
      secondaryCta: 'Kopguide',
      highlights: ['Pris och valuta', 'Plats och saljartyp', 'Miltal, ar och utrustning'],
      sections: [
        { title: 'Kontrollera grunderna', text: 'Se pris, arsmodell, miltal, drivmedel, vaxellada, skick och plats.' },
        { title: 'Se bortom priset', text: 'Transport, dokument, svarstid och historik paverkar affarens verkliga varde.' },
        { title: 'Stall samma fragor', text: 'Anvand samma checklista for varje fordon sa jamforelsen blir rattvis.' },
      ],
      finalTitle: 'Jamfor innan du bestammer dig',
      finalText: 'En strukturerad jamforelse gor dialogen mer fokuserad.',
    },
    'vehicle-history': {
      metaTitle: 'Fordonshistorik | Autorell',
      metaDescription: 'Förstå vad du bör kontrollera i fordonshistoriken innan köp.',
      eyebrow: 'Fordonshistorik',
      title: 'Vet vad du ska fraga innan du koper.',
      intro: 'Historiken ar extra viktig vid gransoverskridande kop. Autorell hjalper kopare fokusera pa ratt fragor.',
      primaryCta: 'Sok fordon',
      secondaryCta: 'Sakerhetstips',
      highlights: ['Agande och registrering', 'Service och besiktning', 'Finans och skador'],
      sections: [
        { title: 'Be om dokument', text: 'BegÃ¤r registreringsbevis, servicehistorik, besiktningspapper och bevis pa att saljaren far salja fordonet.' },
        { title: 'Kontrollera externa register', text: 'Anvand officiella eller valrenommerade historiktjanster i registreringslandet.' },
        { title: 'Var vaksam pa stress', text: 'Undvik saljare som vagrar dokument, pressar betalning eller flyttar dialogen for tidigt.' },
      ],
      finalTitle: 'Historik skyddar bada parter',
      finalText: 'Tydliga dokument gor affaren enklare for seriÃ¶sa kopare och saljare.',
    },
    'buying-guide': {
      metaTitle: 'Köpguide | Autorell',
      metaDescription: 'Praktisk guide för att köpa fordon i Europa med bättre kontroller, betalning och transportplanering.',
      eyebrow: 'Kopguide',
      title: 'Kop i Europa med en battre checklista.',
      intro: 'Gransoverskridande fordonskop fungerar bast nar pris, dokument, betalning, transport och registrering ar tydliga tidigt.',
      primaryCta: 'Bladdra bland fordon',
      secondaryCta: 'Sakerhetstips',
      highlights: ['Kontrollera saljaren', 'Bekrafta dokument', 'Planera betalning och hamtning'],
      sections: [
        { title: 'Fore kontakt', text: 'Jamfor liknande annonser och forbered fragor om agande, skick, moms, servicehistorik och tillganglighet.' },
        { title: 'Fore betalning', text: 'Bekrafta saljarens identitet, betalningsvag, kvitto, overlamningsplats och dokument.' },
        { title: 'Fore transport', text: 'Planera hamtning, forsakring, exportpapper, transportbolag och registreringsregler.' },
      ],
      finalTitle: 'Forberedelse skapar trygghet',
      finalText: 'De basta affarerna ar ofta de dar bada sidor dokumenterar overenskommelsen tydligt.',
    },
    about: {
      metaTitle: 'Om Autorell | Europeisk fordonsmarknadsplats',
      metaDescription: 'Autorell är en europeisk marknadsplats för köp och sälj av fordon mellan länder och kategorier.',
      eyebrow: 'Om Autorell',
      title: 'En europeisk marknadsplats for seriÃ¶sa fordonsannonser.',
      intro: 'Autorell kopplar samman kopare och saljare med en tydlig marknadsplats byggd for lokala marknader och europeisk upptackt.',
      primaryCta: 'Utforska fordon',
      secondaryCta: 'Kontakta oss',
      highlights: ['Marknadsplatsteknik', 'Manga fordonskategorier', 'Byggd for europeiska marknader'],
      sections: [
        { title: 'Vad Autorell gor', text: 'Vi tillhandahaller marknadsplatsen, kontoverktygen och annonsupplevelsen.' },
        { title: 'Vad Autorell inte ar', text: 'Autorell ar inte automatiskt kopare, saljare, handlare, exportor eller finansieringspart.' },
        { title: 'Varfor det finns', text: 'Fordonskop i Europa ar splittrat. Autorell gor upptackt, jamforelse och kontakt tydligare.' },
      ],
      finalTitle: 'En plats for den europeiska marknaden',
      finalText: 'Malet ar tydligt: battre annonser, mer relevanta kopare och tydligare dialog.',
    },
    careers: {
      metaTitle: 'Karriär | Autorell',
      metaDescription: 'Läs om karriär på Autorell och teamen som bygger en europeisk fordonsmarknadsplats.',
      eyebrow: 'Karriar',
      title: 'Hjalp till att bygga nasta europeiska fordonsmarknadsplats.',
      intro: 'Autorell vaxer kring en praktisk mission: gora fordonsaffarer enklare att navigera.',
      primaryCta: 'Kontakta oss',
      secondaryCta: 'Om Autorell',
      highlights: ['Produkt och teknik', 'Marketplace operations', 'Kundsupport'],
      sections: [
        { title: 'Sa arbetar vi', text: 'Vi vardesatter tydligt agarskap, praktiska produktbeslut och narhet till kopare och saljare.' },
        { title: 'Vem passar bra', text: 'Personer som gillar marknadsplatser, fordon, internationella produkter och fortroendefloden.' },
        { title: 'Oppet intresse', text: 'Om ingen roll finns publicerad kan relevanta kandidater kontakta Autorell.' },
      ],
      finalTitle: 'Bygg nagot anvandbart',
      finalText: 'Bra marknadsplatsarbete ar detaljerat, stadigt och nara kundbehov.',
    },
    press: {
      metaTitle: 'Press | Autorell',
      metaDescription: 'Pressinformation för Autorell, inklusive bakgrund och mediakontakt.',
      eyebrow: 'Press',
      title: 'Information for media och branschpartners.',
      intro: 'Autorell kan ge bakgrund om marknadsplatsen, kategorier, koparbeteende och produktnyheter.',
      primaryCta: 'Kontakta press',
      secondaryCta: 'Om Autorell',
      highlights: ['Foretagsbakgrund', 'Marknadsplatsnyheter', 'Mediafragor'],
      sections: [
        { title: 'Mediafragor', text: 'Journalister kan kontakta Autorell for foretagsinformation, citat och marknadskontext.' },
        { title: 'Varumarkesanvandning', text: 'Namn, logotyp och skarmbilder ska anvandas pa ett korrekt satt.' },
        { title: 'Branschkontext', text: 'Vi kan kommentera digitala fordonsmarknader, koparfortroende och gransoverskridande sokning.' },
      ],
      finalTitle: 'Behover du presskontakt?',
      finalText: 'Skicka amne, deadline och publikationsuppgifter sa ratt person kan svara.',
    },
    partners: {
      metaTitle: 'Partners | Autorell',
      metaDescription: 'Samarbeta med Autorell kring fordonslager, distribution, finans, betalning, transport eller data.',
      eyebrow: 'Partners',
      title: 'Samarbeta med Autorell kring fordonsmarknaden.',
      intro: 'Autorell passar partners som hjalper kopare och saljare att fatta battre beslut fore, under och efter affaren.',
      primaryCta: 'Kontakta partnerskap',
      secondaryCta: 'Dealer solutions',
      highlights: ['Lagerpartners', 'Transport och kontroll', 'Betalning och data'],
      sections: [
        { title: 'Lagersamarbeten', text: 'Professionella saljare och plattformar kan utforska tydligare presentation pa Autorell.' },
        { title: 'Tjanstepartners', text: 'Transport, kontroll, historik och betalning kan stodja tryggare beslut.' },
        { title: 'Marknadsexpertis', text: 'Lokala partners gor landspecifika kop- och saljfloden mer anvandbara.' },
      ],
      finalTitle: 'Bra partners minskar friktion',
      finalText: 'Starka partners gor fordonsresan tydligare for bada sidor.',
    },
    'safety-tips': {
      metaTitle: 'Säkerhetstips | Autorell',
      metaDescription: 'Praktiska säkerhetstips för köpare och säljare på Autorell.',
      eyebrow: 'Sakerhet',
      title: 'Tryggare fordonsaffarer borjar med battre kontroller.',
      intro: 'Autorell uppmuntrar kopare och saljare att verifiera identitet, dokument, betalning och overlamning.',
      primaryCta: 'Rapportera problem',
      secondaryCta: 'Kopguide',
      highlights: ['Verifiera identitet', 'Spara underlag', 'Undvik stressad betalning'],
      sections: [
        { title: 'For kopare', text: 'Kontrollera saljare, fordonsdokument, historik, betalningsvillkor och hamtning innan du skickar pengar.' },
        { title: 'For saljare', text: 'Bekrafta koparens identitet, undvik misstankta overbetalningar och spara kommunikationen.' },
        { title: 'Nar nagot kanns fel', text: 'Pausa affaren, spara meddelanden och betalningsreferenser och rapportera vid behov.' },
      ],
      finalTitle: 'Fortroende byggs i detaljer',
      finalText: 'Noggrann dokumentation skyddar seriÃ¶sa kopare, saljare och marknadsplatsen.',
    },
    payments: {
      metaTitle: 'Betalningar | Autorell',
      metaDescription: 'Förstå betalningsplanering, kvitton och tryggare betalningsvanor för fordonsaffärer.',
      eyebrow: 'Betalningar',
      title: 'Planera betalningen innan fordonet byter hander.',
      intro: 'Betalningsvillkor ska vara tydliga mellan kopare och saljare med dokumentation for bada sidor.',
      primaryCta: 'Sakerhetstips',
      secondaryCta: 'Kontakta support',
      highlights: ['Bekrafta mottagare', 'Anvand sparbara metoder', 'Spara kvitton'],
      sections: [
        { title: 'Kom overens om metod', text: 'Valj en betalningsmetod bada forstar och bekrafta alla kontouppgifter.' },
        { title: 'Dokumentera transaktionen', text: 'Spara fakturor, kvitton, bankreferenser och skriftliga villkor.' },
        { title: 'Undvik press', text: 'Var forsiktig med bradska, andrade kontouppgifter och upplagg utan skriftliga spar.' },
      ],
      finalTitle: 'Tydlighet skyddar affaren',
      finalText: 'En dokumenterad betalningsprocess gor tvister enklare att forebygga och utreda.',
    },
    'shipping-delivery': {
      metaTitle: 'Frakt och leverans | Autorell',
      metaDescription: 'Planera hämtning, transport, försäkring och leverans vid fordonsköp i Europa.',
      eyebrow: 'Frakt och leverans',
      title: 'Planera hamtning och transport innan affaren sluts.',
      intro: 'Logistik over landsgranser blir enklare nar kopare och saljare ar overens om ansvar, forsakring och dokument.',
      primaryCta: 'Kopguide',
      secondaryCta: 'Kontakta support',
      highlights: ['Hamtningsplats', 'Transportdokument', 'Forsakring och overlamning'],
      sections: [
        { title: 'Fore hamtning', text: 'Bekrafta adress, skick, tillgang, nycklar, dokument och vem som far lamna ut fordonet.' },
        { title: 'Under transport', text: 'Anvand en serios transportor, bekrafta forsakring och spara bilder eller kontrollnoteringar.' },
        { title: 'Vid leverans', text: 'Kontrollera skick, miltal, dokument och overlamningsunderlag.' },
      ],
      finalTitle: 'Bra logistik ar en del av kopet',
      finalText: 'Transportplanering ska hanteras med samma noggrannhet som pris och betalning.',
    },
  },
  de: {
    'sell-vehicle': {
      metaTitle: 'Fahrzeug verkaufen | Autorell',
      metaDescription: 'Erstellen Sie eine klare Fahrzeuganzeige, erreichen Sie KÃ¤ufer in Europa und verwalten Sie Anfragen Ã¼ber Autorell.',
      eyebrow: 'Auf Autorell verkaufen',
      title: 'Verkaufen Sie Ihr Fahrzeug mit einer Anzeige fÃ¼r europÃ¤ische KÃ¤ufer.',
      intro: 'Autorell hilft privaten und professionellen VerkÃ¤ufern, Fahrzeuge klar zu prÃ¤sentieren und Anfragen geordnet zu bearbeiten.',
      primaryCta: 'Anzeige erstellen',
      secondaryCta: 'Preise ansehen',
      highlights: ['Autos, Transporter und Spezialfahrzeuge', 'Land, Stadt und WÃ¤hrung klar sichtbar', 'Klarer Kontaktprozess'],
      sections: [
        { title: 'Eine professionelle Anzeige', text: 'FÃ¼gen Sie Fotos, Preis, Standort, technische Daten und VerkÃ¤uferinformationen hinzu.' },
        { title: 'Relevantere Reichweite', text: 'Das Fahrzeug kann Ã¼ber Suche, Kategorien und lokale Marktseiten gefunden werden.' },
        { title: 'Sie behalten Kontrolle', text: 'Autorell stellt Marktplatz und Werkzeuge bereit. Der VerkÃ¤ufer verantwortet Fahrzeug und Abschluss.' },
      ],
      finalTitle: 'Bereit zur VerÃ¶ffentlichung?',
      finalText: 'Erstellen Sie ein Konto, bereiten Sie die Fahrzeugdaten vor und verÃ¶ffentlichen Sie die Anzeige.',
    },
    'how-selling-works': {
      metaTitle: 'So funktioniert Verkaufen | Autorell',
      metaDescription: 'So erstellen VerkÃ¤ufer Anzeigen, erhalten Anfragen und schlieÃŸen FahrzeuggeschÃ¤fte Ã¼ber Autorell ab.',
      eyebrow: 'Verkaufsprozess',
      title: 'Von der Anzeige zur KÃ¤uferanfrage in klaren Schritten.',
      intro: 'Der Prozess hÃ¤lt Informationen strukturiert und macht jede KÃ¤uferkommunikation leichter.',
      primaryCta: 'Verkauf starten',
      secondaryCta: 'Support kontaktieren',
      highlights: ['Konto erstellen', 'Anzeige verÃ¶ffentlichen', 'Anfragen verwalten'],
      sections: [
        { title: 'Anzeige vorbereiten', text: 'Sammeln Sie Fotos, Dokumente, Kilometerstand, Zustand, Ausstattung und Preis.' },
        { title: 'VerÃ¶ffentlichen', text: 'Nach der VerÃ¶ffentlichung kann die Anzeige in Suche, Kategorien und MÃ¤rkten erscheinen.' },
        { title: 'Klare Vereinbarung', text: 'KÃ¤ufer und VerkÃ¤ufer vereinbaren Zahlung, Abholung, Dokumente und Transport direkt.' },
      ],
      finalTitle: 'Ein klarerer Verkaufsweg',
      finalText: 'Gute Anzeigen beantworten die wichtigsten Fragen vor der ersten Nachricht.',
    },
    pricing: {
      metaTitle: 'Anzeigenpreise | Autorell',
      metaDescription: 'Verstehen Sie Autorells Optionen fÃ¼r private und geschÃ¤ftliche FahrzeugverkÃ¤ufer.',
      eyebrow: 'Preise',
      title: 'Einfache Anzeigenoptionen fÃ¼r private VerkÃ¤ufer und Unternehmen.',
      intro: 'WÃ¤hlen Sie den Weg, der zu VerkaufshÃ¤ufigkeit und gewÃ¼nschter Sichtbarkeit passt.',
      primaryCta: 'Anzeige erstellen',
      secondaryCta: 'UnternehmenslÃ¶sungen',
      highlights: ['Private Anzeigen', 'Unternehmenskonto', 'Sichtbarkeit Ã¼ber Kategorien'],
      sections: [
        { title: 'Private VerkÃ¤ufer', text: 'Nutzen Sie eine Standardanzeige fÃ¼r ein Fahrzeug mit Bildern, Beschreibung und Kontaktoptionen.' },
        { title: 'RegelmÃ¤ÃŸige VerkÃ¤ufer', text: 'Unternehmen kÃ¶nnen Werkzeuge fÃ¼r Bestand, Profile und strukturierte Anfragen nutzen.' },
        { title: 'Klare Bedingungen', text: 'KÃ¤ufer sollten Endpreis, Zahlungsmethode und Ãœbergabe direkt mit dem VerkÃ¤ufer bestÃ¤tigen.' },
      ],
      finalTitle: 'Den richtigen Weg wÃ¤hlen',
      finalText: 'Starten Sie mit einer Anzeige oder erstellen Sie ein Unternehmenskonto fÃ¼r mehrere Fahrzeuge.',
    },
    'dealer-solutions': {
      metaTitle: 'Dealer solutions | Autorell',
      metaDescription: 'Autorell hilft professionellen VerkÃ¤ufern, Bestand zu verÃ¶ffentlichen und KÃ¤ufer in Europa zu erreichen.',
      eyebrow: 'Dealer solutions',
      title: 'Eine klarere Art, Fahrzeugbestand zu prÃ¤sentieren.',
      intro: 'Autorell bietet professionellen VerkÃ¤ufern MarktplatzprÃ¤senz, strukturierte Bestandsseiten und Anfragewerkzeuge.',
      primaryCta: 'Unternehmenskonto erstellen',
      secondaryCta: 'Vertrieb kontaktieren',
      highlights: ['Unternehmensprofil', 'Bestandsanzeigen', 'EuropÃ¤ische Reichweite'],
      sections: [
        { title: 'BestandsprÃ¤sentation', text: 'Zeigen Sie Autos, Transporter, Lkw, Maschinen und weitere Kategorien mit schnell erfassbaren Daten.' },
        { title: 'Anfragen', text: 'Halten Sie KÃ¤ufernachrichten mit der richtigen Anzeige verbunden.' },
        { title: 'Marktstruktur', text: 'Land, WÃ¤hrung, Kategorie und VerkÃ¤uferinformationen erscheinen konsistent.' },
      ],
      finalTitle: 'FÃ¼r wiederkehrende VerkÃ¤ufer gebaut',
      finalText: 'HÃ¤ndler kÃ¶nnen klein starten und ihre PrÃ¤senz auf Autorell ausbauen.',
    },
    'saved-searches': {
      metaTitle: 'Gespeicherte Suchen | Autorell',
      metaDescription: 'Speichern Sie Suchen und Anzeigen auf Autorell, um interessante Fahrzeuge wiederzufinden.',
      eyebrow: 'KÃ¤uferwerkzeuge',
      title: 'Behalten Sie wichtige Fahrzeuge und Suchen im Blick.',
      intro: 'Gespeicherte Suchen helfen KÃ¤ufern, relevante Fahrzeuge erneut zu Ã¶ffnen und Optionen zu vergleichen.',
      primaryCta: 'Fahrzeuge suchen',
      secondaryCta: 'Konto erstellen',
      highlights: ['Interessante Fahrzeuge speichern', 'Von jedem GerÃ¤t zurÃ¼ckkehren', 'Suchen organisieren'],
      sections: [
        { title: 'Fahrzeuge vormerken', text: 'Sammeln Sie Fahrzeuge, die Sie spÃ¤ter erneut prÃ¼fen mÃ¶chten.' },
        { title: 'Markt folgen', text: 'Speichern Sie Kombinationen aus Kategorie, Land, Preisbereich und Suchbegriffen.' },
        { title: 'Anmelden fÃ¼r KontinuitÃ¤t', text: 'Gespeicherte Objekte funktionieren am besten mit einem Autorell-Konto.' },
      ],
      finalTitle: 'Ein ruhigerer Kaufprozess',
      finalText: 'Gute Organisation erleichtert den Vergleich vor der Kontaktaufnahme.',
    },
    'compare-vehicles': {
      metaTitle: 'Fahrzeuge vergleichen | Autorell',
      metaDescription: 'Vergleichen Sie Autorell-Anzeigen nach Preis, Kilometerstand, Zustand, Standort und VerkÃ¤uferinformationen.',
      eyebrow: 'Vergleichen',
      title: 'Vergleichen Sie Fahrzeuge mit den wichtigsten Details zuerst.',
      intro: 'Strukturierte Anzeigen zeigen praktische Unterschiede, bevor Sie einen VerkÃ¤ufer kontaktieren.',
      primaryCta: 'Anzeigen ansehen',
      secondaryCta: 'Kaufberatung',
      highlights: ['Preis und WÃ¤hrung', 'Standort und VerkÃ¤ufertyp', 'Kilometer, Jahr und Ausstattung'],
      sections: [
        { title: 'Grundlagen prÃ¼fen', text: 'PrÃ¼fen Sie Preis, Baujahr, Kilometerstand, Antrieb, Getriebe, Zustand und Standort.' },
        { title: 'Mehr als Preis', text: 'Transport, Dokumente, Reaktionszeit und Historie beeinflussen den echten Wert.' },
        { title: 'Gleiche Fragen stellen', text: 'Nutzen Sie dieselbe Checkliste fÃ¼r jedes Fahrzeug.' },
      ],
      finalTitle: 'Vergleichen vor der Entscheidung',
      finalText: 'Ein strukturierter Vergleich macht jede KÃ¤uferkommunikation fokussierter.',
    },
    'vehicle-history': {
      metaTitle: 'Fahrzeughistorie | Autorell',
      metaDescription: 'Was Sie vor dem Kauf zur Fahrzeughistorie prÃ¼fen sollten.',
      eyebrow: 'Fahrzeughistorie',
      title: 'Wissen, was Sie vor dem Kauf fragen sollten.',
      intro: 'Die Historie ist bei grenzÃ¼berschreitenden KÃ¤ufen besonders wichtig.',
      primaryCta: 'Fahrzeuge suchen',
      secondaryCta: 'Sicherheitstipps',
      highlights: ['Eigentum und Zulassung', 'Service und PrÃ¼fung', 'Finanzierung und SchÃ¤den'],
      sections: [
        { title: 'Dokumente anfordern', text: 'Bitten Sie um Zulassungspapiere, Serviceunterlagen, PrÃ¼fberichte und Verkaufsberechtigung.' },
        { title: 'Externe Register prÃ¼fen', text: 'Nutzen Sie offizielle oder seriÃ¶se Historienanbieter im Zulassungsland.' },
        { title: 'Bei Druck vorsichtig sein', text: 'Vermeiden Sie VerkÃ¤ufer, die Dokumente verweigern oder Zahlung Ã¼berstÃ¼rzen.' },
      ],
      finalTitle: 'Historie schÃ¼tzt beide Seiten',
      finalText: 'Klare Dokumentation erleichtert seriÃ¶sen KÃ¤ufern und VerkÃ¤ufern das GeschÃ¤ft.',
    },
    'buying-guide': {
      metaTitle: 'Kaufberatung | Autorell',
      metaDescription: 'Praktische Autorell-Kaufberatung fÃ¼r Fahrzeuge in Europa.',
      eyebrow: 'Kaufberatung',
      title: 'Mit besserer Checkliste in Europa kaufen.',
      intro: 'GrenzÃ¼berschreitender Fahrzeugkauf funktioniert am besten, wenn Preis, Dokumente, Zahlung und Transport frÃ¼h geklÃ¤rt sind.',
      primaryCta: 'Fahrzeuge ansehen',
      secondaryCta: 'Sicherheitstipps',
      highlights: ['VerkÃ¤ufer prÃ¼fen', 'Dokumente bestÃ¤tigen', 'Zahlung und Abholung planen'],
      sections: [
        { title: 'Vor der Kontaktaufnahme', text: 'Vergleichen Sie Ã¤hnliche Anzeigen und bereiten Sie Fragen zu Eigentum, Zustand, MwSt. und Service vor.' },
        { title: 'Vor der Zahlung', text: 'BestÃ¤tigen Sie IdentitÃ¤t, Zahlungsweg, Beleg, Ãœbergabeort und Dokumente.' },
        { title: 'Vor dem Transport', text: 'Planen Sie Abholung, Versicherung, Exportpapiere, Transportfirma und Zulassung.' },
      ],
      finalTitle: 'Vorbereitung schafft Vertrauen',
      finalText: 'Die besten GeschÃ¤fte sind klar dokumentiert.',
    },
    about: {
      metaTitle: 'Ãœber Autorell | EuropÃ¤ischer Fahrzeugmarktplatz',
      metaDescription: 'Autorell ist ein europÃ¤ischer Marktplatz fÃ¼r Kauf und Verkauf von Fahrzeugen.',
      eyebrow: 'Ãœber Autorell',
      title: 'Ein europÃ¤ischer Marktplatz fÃ¼r seriÃ¶se Fahrzeuganzeigen.',
      intro: 'Autorell verbindet KÃ¤ufer und VerkÃ¤ufer Ã¼ber Kategorien, lokale MÃ¤rkte und grenzÃ¼berschreitende Suche.',
      primaryCta: 'Fahrzeuge ansehen',
      secondaryCta: 'Kontakt',
      highlights: ['Marktplatztechnologie', 'Viele Fahrzeugkategorien', 'FÃ¼r europÃ¤ische MÃ¤rkte gebaut'],
      sections: [
        { title: 'Was Autorell tut', text: 'Wir stellen Marktplatz, Konto-Werkzeuge und Anzeigeerlebnis bereit.' },
        { title: 'Was Autorell nicht ist', text: 'Autorell ist bei normalen Anzeigen nicht automatisch KÃ¤ufer, VerkÃ¤ufer, HÃ¤ndler, Exporteur oder Finanzierer.' },
        { title: 'Warum es Autorell gibt', text: 'Fahrzeugkauf in Europa ist fragmentiert. Autorell macht Suche, Vergleich und Kontakt klarer.' },
      ],
      finalTitle: 'Ein Ort fÃ¼r den europÃ¤ischen Markt',
      finalText: 'Das Ziel: klarere Anzeigen, relevantere KÃ¤ufer und besser vorbereitete GesprÃ¤che.',
    },
    careers: {
      metaTitle: 'Karriere | Autorell',
      metaDescription: 'Karriere bei Autorell und den Teams hinter einem europÃ¤ischen Fahrzeugmarktplatz.',
      eyebrow: 'Karriere',
      title: 'Bauen Sie am nÃ¤chsten europÃ¤ischen Fahrzeugmarktplatz mit.',
      intro: 'Autorell wÃ¤chst mit einer praktischen Mission: Fahrzeughandel leichter verstÃ¤ndlich machen.',
      primaryCta: 'Kontakt',
      secondaryCta: 'Ãœber Autorell',
      highlights: ['Produkt und Technik', 'Marketplace Operations', 'Kundensupport'],
      sections: [
        { title: 'Wie wir arbeiten', text: 'Wir schÃ¤tzen klare Verantwortung, praktische Produktentscheidungen und NÃ¤he zu KÃ¤ufern und VerkÃ¤ufern.' },
        { title: 'Wer gut passt', text: 'Menschen mit Interesse an MarktplÃ¤tzen, Fahrzeugen, internationalen Produkten und Vertrauen.' },
        { title: 'Initiativkontakt', text: 'Auch ohne offene Rolle kÃ¶nnen relevante Kandidaten Autorell kontaktieren.' },
      ],
      finalTitle: 'Etwas NÃ¼tzliches bauen',
      finalText: 'Gute Marktplatzarbeit ist detailliert, bestÃ¤ndig und kundennah.',
    },
    press: {
      metaTitle: 'Presse | Autorell',
      metaDescription: 'Presseinformationen zu Autorell, Hintergrund und Medienkontakt.',
      eyebrow: 'Presse',
      title: 'Informationen fÃ¼r Medien und Branchenpartner.',
      intro: 'Autorell kann Hintergrund zum Marktplatz, Kategorien, KÃ¤uferverhalten und Produktupdates liefern.',
      primaryCta: 'Presse kontaktieren',
      secondaryCta: 'Ãœber Autorell',
      highlights: ['Unternehmenshintergrund', 'Marktplatz-Updates', 'Medienanfragen'],
      sections: [
        { title: 'Medienanfragen', text: 'Journalisten kÃ¶nnen Autorell fÃ¼r Unternehmensinformationen, Zitate und Kontext kontaktieren.' },
        { title: 'Markennutzung', text: 'Name, Logo und Screenshots sollten Autorell korrekt darstellen.' },
        { title: 'Branchenkontext', text: 'Wir kÃ¶nnen digitale FahrzeugmÃ¤rkte, Vertrauen und grenzÃ¼berschreitende Suche einordnen.' },
      ],
      finalTitle: 'Brauchen Sie Pressekontakt?',
      finalText: 'Senden Sie Thema, Frist und VerÃ¶ffentlichungsdetails.',
    },
    partners: {
      metaTitle: 'Partner | Autorell',
      metaDescription: 'Partnerschaften mit Autorell rund um Bestand, Distribution, Finanzierung, Zahlung, Transport oder Daten.',
      eyebrow: 'Partner',
      title: 'Partner von Autorell im Fahrzeugmarkt werden.',
      intro: 'Autorell arbeitet mit Partnern, die KÃ¤ufern und VerkÃ¤ufern bessere Entscheidungen ermÃ¶glichen.',
      primaryCta: 'Partnerschaft kontaktieren',
      secondaryCta: 'Dealer solutions',
      highlights: ['Bestandspartner', 'Transport und PrÃ¼fung', 'Zahlung und Daten'],
      sections: [
        { title: 'Bestandspartnerschaften', text: 'Professionelle VerkÃ¤ufer und Plattformen kÃ¶nnen Bestand klarer auf Autorell prÃ¤sentieren.' },
        { title: 'Servicepartner', text: 'Transport, PrÃ¼fung, Historie und Zahlung unterstÃ¼tzen sicherere Entscheidungen.' },
        { title: 'Marktexpertise', text: 'Lokale Partner machen landesspezifische AblÃ¤ufe nÃ¼tzlicher.' },
      ],
      finalTitle: 'Gute Partnerschaften verringern Reibung',
      finalText: 'Starke Partner machen den Fahrzeugweg fÃ¼r beide Seiten klarer.',
    },
    'safety-tips': {
      metaTitle: 'Sicherheitstipps | Autorell',
      metaDescription: 'Praktische Sicherheitstipps fÃ¼r KÃ¤ufer und VerkÃ¤ufer auf Autorell.',
      eyebrow: 'Sicherheit',
      title: 'Sichere FahrzeuggeschÃ¤fte beginnen mit besseren PrÃ¼fungen.',
      intro: 'Autorell empfiehlt IdentitÃ¤t, Dokumente, Zahlung und Ãœbergabe vor einer Zusage zu prÃ¼fen.',
      primaryCta: 'Problem melden',
      secondaryCta: 'Kaufberatung',
      highlights: ['IdentitÃ¤t prÃ¼fen', 'Unterlagen behalten', 'Keine Ã¼bereilte Zahlung'],
      sections: [
        { title: 'FÃ¼r KÃ¤ufer', text: 'PrÃ¼fen Sie VerkÃ¤ufer, Fahrzeugdokumente, Historie, Zahlung und Abholung vor einer Ãœberweisung.' },
        { title: 'FÃ¼r VerkÃ¤ufer', text: 'BestÃ¤tigen Sie KÃ¤uferidentitÃ¤t, vermeiden Sie verdÃ¤chtige Ãœberzahlungen und bewahren Sie Kommunikation auf.' },
        { title: 'Wenn etwas falsch wirkt', text: 'Pausieren Sie den Deal, sichern Sie Nachrichten und Zahlungsreferenzen und melden Sie den Fall.' },
      ],
      finalTitle: 'Vertrauen entsteht im Detail',
      finalText: 'SorgfÃ¤ltige Dokumentation schÃ¼tzt seriÃ¶se KÃ¤ufer, VerkÃ¤ufer und den Marktplatz.',
    },
    payments: {
      metaTitle: 'Zahlungen | Autorell',
      metaDescription: 'Zahlungsplanung, Belege und sicherere Zahlungsgewohnheiten fÃ¼r FahrzeuggeschÃ¤fte.',
      eyebrow: 'Zahlungen',
      title: 'Zahlung planen, bevor das Fahrzeug Ã¼bergeben wird.',
      intro: 'Zahlungsbedingungen sollten klar zwischen KÃ¤ufer und VerkÃ¤ufer vereinbart und dokumentiert sein.',
      primaryCta: 'Sicherheitstipps',
      secondaryCta: 'Support kontaktieren',
      highlights: ['EmpfÃ¤nger prÃ¼fen', 'Nachverfolgbare Methoden', 'Belege speichern'],
      sections: [
        { title: 'Methode vereinbaren', text: 'WÃ¤hlen Sie eine Methode, die beide Seiten verstehen, und bestÃ¤tigen Sie Kontodaten.' },
        { title: 'Transaktion dokumentieren', text: 'Bewahren Sie Rechnungen, Quittungen, Bankreferenzen und schriftliche Bedingungen auf.' },
        { title: 'Druck vermeiden', text: 'Seien Sie vorsichtig bei Eile, geÃ¤nderten Kontodaten und ungewÃ¶hnlichen Zwischenpersonen.' },
      ],
      finalTitle: 'Klarheit schÃ¼tzt das GeschÃ¤ft',
      finalText: 'Ein dokumentierter Zahlungsprozess hilft, Streit zu vermeiden und zu klÃ¤ren.',
    },
    'shipping-delivery': {
      metaTitle: 'Versand und Lieferung | Autorell',
      metaDescription: 'Planen Sie Abholung, Transport, Versicherung und Lieferung beim Fahrzeugkauf in Europa.',
      eyebrow: 'Versand und Lieferung',
      title: 'Abholung und Transport vor dem Abschluss planen.',
      intro: 'GrenzÃ¼berschreitende Logistik wird einfacher, wenn KÃ¤ufer und VerkÃ¤ufer ZustÃ¤ndigkeit, Versicherung und Dokumente klÃ¤ren.',
      primaryCta: 'Kaufberatung',
      secondaryCta: 'Support kontaktieren',
      highlights: ['Abholort', 'Transportdokumente', 'Versicherung und Ãœbergabe'],
      sections: [
        { title: 'Vor der Abholung', text: 'BestÃ¤tigen Sie Adresse, Zustand, Zugang, SchlÃ¼ssel, Dokumente und Abholberechtigung.' },
        { title: 'WÃ¤hrend des Transports', text: 'Nutzen Sie einen seriÃ¶sen Transporteur, prÃ¼fen Sie Versicherung und halten Sie Fotos fest.' },
        { title: 'Bei Lieferung', text: 'PrÃ¼fen Sie Zustand, Kilometerstand, Dokumente und Ãœbergabeunterlagen.' },
      ],
      finalTitle: 'Gute Logistik gehÃ¶rt zum Kauf',
      finalText: 'Transportplanung verdient dieselbe Sorgfalt wie Preis und Zahlung.',
    },
  },
} satisfies Record<'en' | 'sv' | 'de', Record<PublicInfoPageKey, PublicInfoPageCopy>>

const ctaLinks = {
  primary: {
    'sell-vehicle': '/account/listings/new',
    'how-selling-works': '/sell-vehicle',
    pricing: '/sell-vehicle',
    'dealer-solutions': '/register?account=business',
    'saved-searches': '/marketplace',
    'compare-vehicles': '/marketplace',
    'vehicle-history': '/marketplace',
    'buying-guide': '/marketplace',
    about: '/marketplace',
    careers: '/contact',
    press: '/contact',
    partners: '/contact',
    'safety-tips': '/report',
    payments: '/safety-tips',
    'shipping-delivery': '/buying-guide',
  },
  secondary: {
    'sell-vehicle': '/pricing',
    'how-selling-works': '/contact',
    pricing: '/business',
    'dealer-solutions': '/contact',
    'saved-searches': '/register',
    'compare-vehicles': '/buying-guide',
    'vehicle-history': '/safety-tips',
    'buying-guide': '/safety-tips',
    about: '/contact',
    careers: '/about',
    press: '/about',
    partners: '/dealer-solutions',
    'safety-tips': '/buying-guide',
    payments: '/contact',
    'shipping-delivery': '/contact',
  },
} satisfies Record<'primary' | 'secondary', Record<PublicInfoPageKey, string>>

export function generatePublicInfoMetadata(page: PublicInfoPageKey) {
  return async function metadata(): Promise<Metadata> {
    const headerStore = await headers()
    const locale = getRequestedLocale(headerStore)
    const copy = getInfoPageCopy(page, locale)
    const canonicalPath =
      headerStore.get('x-autorell-pathname') ||
      `${locale === 'sv' ? '/se' : locale === 'de' ? '/de' : ''}/${page}`
    const canonical = `https://www.autorell.com${canonicalPath}`
    const title = cleanSeoText(copy.metaTitle, 65)
    const description = cleanSeoText(copy.metaDescription, 150)
    return {
      title: { absolute: title },
      description,
      alternates: {
        canonical,
      },
      openGraph: {
        title,
        description,
        url: canonical,
        siteName: 'Autorell',
        type: 'website',
      },
    }
  }
}

export default async function PublicInfoPage({
  page,
}: {
  page: PublicInfoPageKey
}) {
  const headerStore = await headers()
  const locale = getRequestedLocale(headerStore)
  const marketCode = headerStore.get('x-autorell-market') || undefined
  const copy = getInfoPageCopy(page, locale)
  const Icon = pageIcons[page]
  const isSellerPage = page === 'sell-vehicle' || page === 'how-selling-works' || page === 'pricing'

  if (isSellerPage) {
    const isSv = locale === 'sv'
    const primaryHref = localizePublicHref(locale, ctaLinks.primary[page])
    const secondaryHref = localizePublicHref(locale, ctaLinks.secondary[page])
    const pageShellClass = 'bg-[#f5f8fc] text-[#101828]'

    if (page === 'sell-vehicle') {
      const pillars = isSv
        ? [
            ['01', 'Datadriven presentation', 'Kategori, marknad, valuta, skick och tekniska uppgifter byggs in i annonsen sÃ¥ att kÃ¶paren kan jÃ¤mfÃ¶ra utan friktion.'],
            ['02', 'FÃ¶rtroende fÃ¶re kontakt', 'Verifierade sÃ¤ljare, tydliga kontaktvÃ¤gar och konsekvent fordonsdata hÃ¶jer kvaliteten pÃ¥ varje dialog.'],
            ['03', 'Synlighet i rÃ¤tt marknad', 'Annonsen Ã¤r skapad fÃ¶r en europeisk kÃ¶pintention, inte bara en lokal listning som rÃ¥kar ligga online.'],
          ]
        : [
            ['01', 'Data-led presentation', 'Category, market, currency, condition and technical details are structured for fast comparison.'],
            ['02', 'Trust before contact', 'Verified sellers, clear routes and consistent vehicle data raise the quality of each enquiry.'],
            ['03', 'Visibility in the right market', 'Listings are built for European buyer intent, not just a local post online.'],
          ]
      const signals = isSv
        ? ['Fordonsdata', 'Marknad', 'SÃ¤ljarprofil', 'KontaktflÃ¶de']
        : ['Vehicle data', 'Market', 'Seller profile', 'Contact flow']

      return (
        <main className={pageShellClass}>
          <PublicHeader locale={locale} marketCode={marketCode} />
          <section className="overflow-hidden border-b border-[#dce5f2] bg-[radial-gradient(circle_at_12%_0%,#e9f2ff_0,#ffffff_38%,#f7fbff_100%)]">
            <div className="mx-auto grid max-w-[var(--autorell-page-max)] gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-center lg:py-24">
              <div>
                <p className="text-xs font-medium uppercase tracking-[.2em] text-[#0866ff]">
                  {isSv ? 'Annonsera fordon' : 'Vehicle advertising'}
                </p>
                <h1 className="mt-5 max-w-4xl text-[42px] font-medium leading-[1.03] tracking-[-.05em] sm:text-[70px]">
                  {isSv ? 'Annonsera fordon pÃ¥ Autorell' : 'Advertise vehicles on Autorell'}
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-[#526071]">
                  {isSv
                    ? 'En annons pÃ¥ Autorell ska kÃ¤nnas som ett professionellt beslutsunderlag: tydlig data, seriÃ¶s presentation och kontakt frÃ¥n kÃ¶pare som fÃ¶rstÃ¥r vad de tittar pÃ¥.'
                    : 'An Autorell listing should feel like a professional decision layer: clear data, serious presentation and buyer contact with context.'}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href={primaryHref} className="inline-flex min-h-12 items-center gap-2 rounded-[12px] bg-[#0866ff] px-6 text-sm font-medium text-white shadow-[0_18px_40px_rgba(8,102,255,.24)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#075ce5]">
                    {isSv ? 'Skapa annons' : copy.primaryCta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href={secondaryHref} className="inline-flex min-h-12 items-center rounded-[12px] border border-[#c6d3e7] bg-white px-6 text-sm font-medium text-[#101828] transition duration-200 hover:-translate-y-0.5 hover:border-[#0866ff] hover:text-[#0866ff]">
                    {isSv ? 'Se annonspriser' : copy.secondaryCta}
                  </Link>
                </div>
              </div>
              <aside className="rounded-[24px] border border-[#d8e4f4] bg-white/90 p-5 shadow-[0_28px_90px_rgba(16,24,40,.10)] backdrop-blur">
                <div className="rounded-[20px] bg-[#101828] p-5 text-white">
                  <p className="text-xs font-medium uppercase tracking-[.18em] text-[#93c5fd]">Autorell listing layer</p>
                  <div className="mt-6 grid gap-3">
                    {signals.map((signal) => (
                      <div key={signal} className="flex items-center justify-between rounded-[14px] bg-white/8 px-4 py-3 text-sm font-medium">
                        {signal}
                        <CheckCircle2 className="h-4 w-4 text-[#60a5fa]" />
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </section>
          <section className="mx-auto max-w-[1180px] px-5 py-14 sm:px-8">
            <div className="grid gap-4 md:grid-cols-3">
              {pillars.map(([number, title, text]) => (
                <article key={title} className="rounded-[20px] border border-[#dce5f2] bg-white p-6 shadow-[0_16px_42px_rgba(16,24,40,.05)] transition duration-200 hover:-translate-y-1 hover:border-[#b7ceff] hover:shadow-[0_24px_60px_rgba(16,24,40,.09)]">
                  <span className="text-sm font-medium text-[#0866ff]">{number}</span>
                  <h2 className="mt-5 text-2xl font-medium tracking-[-.04em]">{title}</h2>
                  <p className="mt-3 text-[15px] leading-7 text-[#667085]">{text}</p>
                </article>
              ))}
            </div>
          </section>
          <PublicFooter locale={locale} />
        </main>
      )
    }

    if (page === 'how-selling-works') {
      const flow = isSv
        ? [
            ['01', 'Strukturera', 'Fordonstyp, plats, pris, valuta och skick sÃ¤tts i ett format som gÃ¥r att sÃ¶ka, filtrera och fÃ¶rstÃ¥.'],
            ['02', 'Publicera', 'Annonsen gÃ¥r live med rÃ¤tt kategori och blir en del av Autorells marknadsplatsflÃ¶de.'],
            ['03', 'Kvalificera', 'Intresse samlas kring annonsen, sÃ¥ att frÃ¥gor och svar fÃ¥r sammanhang i stÃ¤llet fÃ¶r att bli lÃ¶s dialog.'],
            ['04', 'Avsluta affÃ¤ren', 'SÃ¤ljare och kÃ¶pare kommer Ã¶verens om dokument, betalning, upphÃ¤mtning och leverans direkt.'],
          ]
        : [
            ['01', 'Structure', 'Vehicle type, location, price, currency and condition are prepared for search and filtering.'],
            ['02', 'Publish', 'The listing goes live in the right category and joins the Autorell marketplace flow.'],
            ['03', 'Qualify', 'Interest stays connected to the listing, keeping questions and replies in context.'],
            ['04', 'Close', 'Seller and buyer agree documents, payment, pickup and delivery directly.'],
          ]

      return (
        <main className="bg-white text-[#101828]">
          <PublicHeader locale={locale} marketCode={marketCode} />
          <section className="bg-[#0b1220] text-white">
            <div className="mx-auto max-w-[var(--autorell-page-max)] px-5 py-16 sm:px-8 lg:py-24">
              <p className="text-xs font-medium uppercase tracking-[.2em] text-[#93c5fd]">
                {isSv ? 'SÃ¥ fungerar Autorell' : 'How Autorell works'}
              </p>
              <h1 className="mt-5 max-w-5xl text-[42px] font-medium leading-[1.03] tracking-[-.05em] sm:text-[68px]">
                {isSv ? 'FrÃ¥n fordonsdata till kvalificerad kÃ¶parkontakt.' : 'From vehicle data to qualified buyer contact.'}
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-[#cbd5e1]">
                {isSv
                  ? 'Autorell Ã¤r byggt fÃ¶r att skala fÃ¶rtroende. Varje steg i flÃ¶det gÃ¶r annonsen tydligare, sÃ¶kningen mer relevant och kontakten mer professionell.'
                  : 'Autorell is built to scale trust. Every step makes the listing clearer, search more relevant and contact more professional.'}
              </p>
            </div>
          </section>
          <section className="mx-auto max-w-[1120px] px-5 py-14 sm:px-8">
            <div className="grid gap-4">
              {flow.map(([number, title, text]) => (
                <article key={title} className="grid gap-4 rounded-[20px] border border-[#dce5f2] bg-[#f8fbff] p-5 transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_18px_48px_rgba(16,24,40,.08)] sm:grid-cols-[96px_1fr_auto] sm:items-center sm:p-6">
                  <span className="text-4xl font-medium tracking-[-.05em] text-[#0866ff]">{number}</span>
                  <div>
                    <h2 className="text-2xl font-medium tracking-[-.04em]">{title}</h2>
                    <p className="mt-2 max-w-3xl text-[15px] leading-7 text-[#667085]">{text}</p>
                  </div>
                  <ArrowRight className="hidden h-5 w-5 text-[#98a2b3] sm:block" />
                </article>
              ))}
            </div>
            <div className="mt-8 rounded-[24px] border border-[#dce5f2] bg-white p-7 shadow-[0_20px_60px_rgba(16,24,40,.07)] sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[.18em] text-[#0866ff]">Marketplace operating model</p>
                <h2 className="mt-3 max-w-2xl text-3xl font-medium tracking-[-.04em]">
                  {isSv ? 'Ett flÃ¶de som kan vÃ¤xa frÃ¥n en annons till en europeisk fordonsmarknad.' : 'A flow that can grow from one listing to a European vehicle market.'}
                </h2>
              </div>
              <Link href={primaryHref} className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-[12px] bg-[#0866ff] px-6 text-sm font-medium text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#075ce5] sm:mt-0">
                {isSv ? 'Annonsera fordon' : copy.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
          <PublicFooter locale={locale} />
        </main>
      )
    }

    const freeLabel = isSv ? 'Gratis' : 'Free'
    const packageCards = isSv
      ? [
          ['Start', '7 dagar', 'Publicera och kontrollera annonsens kvalitet utan startkostnad.'],
          ['Standard', '15 dagar', 'FÃ¶r fordon som behÃ¶ver stabil synlighet Ã¶ver flera kÃ¶pbeslut.'],
          ['Premium', '30 dagar', 'FÃ¶r annonser dÃ¤r exponering och prioritet ska kÃ¤nnas tydligt.'],
        ]
      : [
          ['Start', '7 days', 'Publish and check listing quality without starting cost.'],
          ['Standard', '15 days', 'For vehicles that need steady visibility across buyer decisions.'],
          ['Premium', '30 days', 'For listings where exposure and priority should be clear.'],
        ]

    return (
      <main className={pageShellClass}>
        <PublicHeader locale={locale} marketCode={marketCode} />
        <section className="border-b border-[#dce3ef] bg-white">
          <div className="mx-auto grid max-w-[var(--autorell-page-max)] gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end lg:py-24">
            <div>
              <p className="text-xs font-medium uppercase tracking-[.2em] text-[#0866ff]">
                {isSv ? 'Pris och synlighet' : 'Pricing and visibility'}
              </p>
              <h1 className="mt-5 max-w-4xl text-[42px] font-medium leading-[1.03] tracking-[-.05em] sm:text-[68px]">
                {isSv ? 'Pris fÃ¶r att annonsera fordon' : 'Pricing for vehicle advertising'}
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-[#667085]">
                {isSv
                  ? 'PrissÃ¤ttningen ska vara enkel att granska innan publicering. Varje kategori har en gratis start, en standardperiod och premiumsynlighet fÃ¶r annonser som ska lyftas.'
                  : 'Pricing should be easy to review before publishing. Each category has a free start, a standard period and premium visibility.'}
              </p>
            </div>
            <aside className="rounded-[24px] bg-[#101828] p-6 text-white shadow-[0_26px_80px_rgba(16,24,40,.18)]">
              <p className="text-xs font-medium uppercase tracking-[.18em] text-[#93c5fd]">
                {isSv ? 'Exempel' : 'Example'}
              </p>
              <div className="mt-5 grid gap-3">
                <div className="flex items-center justify-between rounded-[14px] bg-white/8 px-4 py-3">
                  <span>Bilar</span>
                  <span className="font-medium">{formatListingPrice(249)}</span>
                </div>
                <div className="flex items-center justify-between rounded-[14px] bg-white/8 px-4 py-3">
                  <span>Entreprenadmaskiner</span>
                  <span className="font-medium">{formatListingPrice(1190)}</span>
                </div>
              </div>
            </aside>
          </div>
        </section>
        <section className="mx-auto max-w-[1180px] px-5 py-12 sm:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {packageCards.map(([title, period, text]) => (
              <article key={title} className="rounded-[20px] border border-[#dce5f2] bg-white p-6 shadow-[0_16px_42px_rgba(16,24,40,.05)] transition duration-200 hover:-translate-y-1 hover:border-[#b7ceff]">
                <p className="text-sm font-medium text-[#0866ff]">{period}</p>
                <h2 className="mt-3 text-3xl font-medium tracking-[-.04em]">{title}</h2>
                <p className="mt-3 text-[15px] leading-7 text-[#667085]">{text}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 overflow-hidden rounded-[22px] border border-[#dce5f2] bg-white shadow-[0_20px_60px_rgba(16,24,40,.07)]">
            <div className="grid grid-cols-[1.35fr_.85fr_.85fr_.85fr] gap-3 border-b border-[#e4ebf5] bg-[#f8fbff] px-5 py-4 text-xs font-medium uppercase tracking-[.12em] text-[#667085]">
              <span>{isSv ? 'Kategori' : 'Category'}</span>
              <span>Start</span>
              <span>Standard</span>
              <span>Premium</span>
            </div>
            {listingPriceCategories.map((category) => (
              <div key={category.slug} className="grid grid-cols-[1.35fr_.85fr_.85fr_.85fr] gap-3 border-b border-[#edf1f7] px-5 py-4 text-sm last:border-b-0">
                <span className="font-medium">{category.label}</span>
                <span className="text-[#667085]">{freeLabel}</span>
                <span>{formatListingPrice(category.standard)}</span>
                <span>{formatListingPrice(category.premium)}</span>
              </div>
            ))}
          </div>
        </section>
        <PublicFooter locale={locale} />
      </main>
    )
  }

  if ((false as boolean) && isSellerPage) {
    const isSv = locale === 'sv'
    const primaryHref = localizePublicHref(locale, ctaLinks.primary[page])
    const secondaryHref = localizePublicHref(locale, ctaLinks.secondary[page])

    if (page === 'sell-vehicle') {
      const steps = isSv
        ? [
            ['01', 'Fordonskortet', 'Visa rÃ¤tt kategori, utrustning, miltal, skick, plats och valuta redan frÃ¥n fÃ¶rsta vyn.'],
            ['02', 'FÃ¶rtroendet', 'Verifierad sÃ¤ljare, tydliga kontaktvÃ¤gar och ordnad information gÃ¶r kÃ¶paren tryggare.'],
            ['03', 'Dialogen', 'Meddelanden samlas kring annonsen sÃ¥ att intresse, frÃ¥gor och nÃ¤sta steg hÃ¤nger ihop.'],
          ]
        : [
            ['01', 'Vehicle card', 'Show category, equipment, mileage, condition, location and currency from the first view.'],
            ['02', 'Trust', 'Verified sellers, clear contact routes and structured details make buyers more confident.'],
            ['03', 'Dialogue', 'Messages stay connected to the listing so interest and next steps remain organised.'],
          ]
      const checklist = isSv
        ? ['Bilder och dokument', 'Pris och marknad', 'Tekniska uppgifter', 'Kontakt och svar']
        : ['Photos and documents', 'Price and market', 'Technical details', 'Contact and replies']

      return (
        <main className="bg-[#f5f7fb] text-[#101828]">
          <PublicHeader locale={locale} marketCode={marketCode} />
          <section className="border-b border-[#dce3ef] bg-white">
            <div className="mx-auto grid max-w-[var(--autorell-page-max)] gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center lg:py-20">
              <div>
                <p className="text-xs font-medium uppercase tracking-[.18em] text-[#0866ff]">
                  {isSv ? 'SÃ¤lja pÃ¥ Autorell' : copy.eyebrow}
                </p>
                <h1 className="mt-5 max-w-4xl text-[40px] font-medium leading-[1.05] tracking-[-.045em] sm:text-[62px]">
                  {isSv ? 'SÃ¤lj fordon med rÃ¤tt information frÃ¥n fÃ¶rsta klicket.' : copy.title}
                </h1>
                <p className="mt-6 max-w-2xl text-lg font-normal leading-8 text-[#5f6b7a]">
                  {isSv
                    ? 'Autorell hjÃ¤lper dig presentera fordonet tydligt, oavsett om det gÃ¤ller bil, transportbil, husbil eller maskin. KÃ¶paren ser det viktigaste direkt och kontakten blir enklare att fÃ¶lja.'
                    : copy.intro}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href={primaryHref} className="inline-flex min-h-12 items-center gap-2 rounded-[12px] bg-[#0866ff] px-6 text-sm font-medium text-white shadow-[0_14px_34px_rgba(8,102,255,.22)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#075ce5]">
                    {copy.primaryCta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href={secondaryHref} className="inline-flex min-h-12 items-center rounded-[12px] border border-[#c9d4e5] bg-white px-6 text-sm font-medium text-[#101828] transition duration-200 hover:-translate-y-0.5 hover:border-[#0866ff] hover:text-[#0866ff]">
                    {copy.secondaryCta}
                  </Link>
                </div>
              </div>
              <aside className="rounded-[22px] border border-[#dce6f4] bg-[#f8fbff] p-5 shadow-[0_24px_70px_rgba(16,24,40,.08)]">
                <div className="rounded-[18px] bg-white p-5 shadow-[0_12px_30px_rgba(16,24,40,.06)]">
                  <p className="text-xs font-medium uppercase tracking-[.16em] text-[#667085]">Audi A5 E-hybrid</p>
                  <div className="mt-4 grid gap-3">
                    {checklist.map((item) => (
                      <div key={item} className="flex items-center justify-between rounded-[12px] border border-[#dce6f4] px-4 py-3 text-sm font-medium">
                        {item}
                        <CheckCircle2 className="h-4.5 w-4.5 text-[#0866ff]" />
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </section>
          <section className="mx-auto max-w-[1180px] px-5 py-14 sm:px-8">
            <div className="grid gap-4 md:grid-cols-3">
              {steps.map(([kicker, title, text]) => (
                <article key={title} className="rounded-[18px] border border-[#dde5ef] bg-white p-6 shadow-[0_14px_36px_rgba(16,24,40,.045)] transition duration-200 hover:-translate-y-1 hover:border-[#bcd3ff]">
                  <span className="text-sm font-medium text-[#0866ff]">{kicker}</span>
                  <h2 className="mt-4 text-2xl font-medium tracking-[-.035em]">{title}</h2>
                  <p className="mt-3 text-[15px] leading-7 text-[#667085]">{text}</p>
                </article>
              ))}
            </div>
          </section>
          <PublicFooter locale={locale} />
        </main>
      )
    }

    if (page === 'how-selling-works') {
      const steps = isSv
        ? [
            ['01', 'FÃ¶rbered', 'Samla bilder, servicehistorik, skick, utrustning och det kÃ¶paren behÃ¶ver veta innan kontakt.'],
            ['02', 'Publicera', 'VÃ¤lj kategori, marknad och pris. Annonsen byggs sÃ¥ att jÃ¤mfÃ¶relse blir enkel.'],
            ['03', 'FÃ¶lj dialogen', 'Spara svar, frÃ¥gor och intresse runt samma annons i stÃ¤llet fÃ¶r utspridda trÃ¥dar.'],
            ['04', 'Kom Ã¶verens', 'KÃ¶pare och sÃ¤ljare gÃ¶r upp om dokument, betalning, leverans och hÃ¤mtning direkt.'],
          ]
        : [
            ['01', 'Prepare', 'Collect photos, service history, condition, equipment and details buyers need.'],
            ['02', 'Publish', 'Choose category, market and price. The listing is built for easy comparison.'],
            ['03', 'Follow dialogue', 'Keep replies, questions and interest connected to the listing.'],
            ['04', 'Agree', 'Buyer and seller agree documents, payment, delivery and pickup directly.'],
          ]

      return (
        <main className="bg-white text-[#101828]">
          <PublicHeader locale={locale} marketCode={marketCode} />
          <section className="bg-[#101828] text-white">
            <div className="mx-auto max-w-[var(--autorell-page-max)] px-5 py-14 sm:px-8 lg:py-20">
              <p className="text-xs font-medium uppercase tracking-[.18em] text-[#93c5fd]">
                {isSv ? 'SÃ¥ fungerar det' : copy.eyebrow}
              </p>
              <h1 className="mt-5 max-w-4xl text-[40px] font-medium leading-[1.05] tracking-[-.045em] sm:text-[60px]">
                {isSv ? 'Ett tydligt flÃ¶de frÃ¥n annons till seriÃ¶s kontakt.' : copy.title}
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-[#cbd5e1]">
                {isSv
                  ? 'SÃ¤ljprocessen ska kÃ¤nnas kontrollerad. Autorell delar upp arbetet i logiska steg sÃ¥ att annonsen, kontakten och nÃ¤sta beslut blir lÃ¤ttare att hantera.'
                  : copy.intro}
              </p>
            </div>
          </section>
          <section className="mx-auto max-w-[1080px] px-5 py-14 sm:px-8">
            <div className="grid gap-5">
              {steps.map(([number, title, text]) => (
                <article key={title} className="group grid gap-4 rounded-[18px] border border-[#dce5f2] bg-[#f8fbff] p-5 transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_18px_44px_rgba(16,24,40,.08)] sm:grid-cols-[90px_1fr] sm:p-6">
                  <span className="text-3xl font-medium tracking-[-.04em] text-[#0866ff]">{number}</span>
                  <div>
                    <h2 className="text-2xl font-medium tracking-[-.035em]">{title}</h2>
                    <p className="mt-2 max-w-3xl text-[15px] leading-7 text-[#667085]">{text}</p>
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-8 rounded-[20px] border border-[#dce5f2] bg-white p-7 shadow-[0_18px_50px_rgba(16,24,40,.06)] sm:flex sm:items-center sm:justify-between">
              <div>
                <h2 className="text-3xl font-medium tracking-[-.04em]">
                  {isSv ? 'BÃ¶rja med rÃ¤tt kategori och tydliga uppgifter.' : 'Start with the right category and clear details.'}
                </h2>
                <p className="mt-3 max-w-2xl text-[#667085]">
                  {isSv ? 'DÃ¥ blir sÃ¶kningen, kartan och kontakten mer relevant frÃ¥n bÃ¶rjan.' : 'That makes search, map and contact more relevant from the start.'}
                </p>
              </div>
              <Link href={primaryHref} className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-[12px] bg-[#0866ff] px-6 text-sm font-medium text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#075ce5] sm:mt-0">
                {copy.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
          <PublicFooter locale={locale} />
        </main>
      )
    }

    const freeLabel = isSv ? 'Gratis' : 'Free'
    const packageCards = isSv
      ? [
          ['Start', '7 dagar', 'FÃ¶rsta publicering utan kostnad.'],
          ['Standard', '15 dagar', 'Mer tid i marknaden fÃ¶r vanliga annonser.'],
          ['Premium', '30 dagar', 'Extra synlighet fÃ¶r fordon som ska lyftas.'],
        ]
      : [
          ['Start', '7 days', 'First publishing without cost.'],
          ['Standard', '15 days', 'More time in market for regular listings.'],
          ['Premium', '30 days', 'Extra visibility for vehicles that need a lift.'],
        ]

    return (
      <main className="bg-[#f6f8fb] text-[#101828]">
        <PublicHeader locale={locale} marketCode={marketCode} />
        <section className="border-b border-[#dce3ef] bg-white">
          <div className="mx-auto max-w-[var(--autorell-page-max)] px-5 py-14 sm:px-8 lg:py-20">
            <p className="text-xs font-medium uppercase tracking-[.18em] text-[#0866ff]">
              {isSv ? 'Priser' : copy.eyebrow}
            </p>
            <h1 className="mt-5 max-w-4xl text-[40px] font-medium leading-[1.05] tracking-[-.045em] sm:text-[60px]">
              {isSv ? 'Annonspriser fÃ¶r varje fordonskategori.' : copy.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[#667085]">
              {isSv
                ? 'HÃ¤r redovisas priserna som gÃ¤ller per kategori. Start Ã¤r gratis, Standard ger lÃ¤ngre publicering och Premium ger mer synlighet.'
                : copy.intro}
            </p>
          </div>
        </section>
        <section className="mx-auto max-w-[1180px] px-5 py-12 sm:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {packageCards.map(([title, period, text]) => (
              <article key={title} className="rounded-[18px] border border-[#dce5f2] bg-white p-6 shadow-[0_14px_36px_rgba(16,24,40,.045)] transition duration-200 hover:-translate-y-1 hover:border-[#bcd3ff]">
                <p className="text-sm font-medium text-[#0866ff]">{period}</p>
                <h2 className="mt-3 text-3xl font-medium tracking-[-.04em]">{title}</h2>
                <p className="mt-3 text-[15px] leading-7 text-[#667085]">{text}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 overflow-hidden rounded-[20px] border border-[#dce5f2] bg-white shadow-[0_18px_50px_rgba(16,24,40,.06)]">
            <div className="grid grid-cols-[1.35fr_.85fr_.85fr_.85fr] gap-3 border-b border-[#e4ebf5] bg-[#f8fbff] px-5 py-4 text-xs font-medium uppercase tracking-[.12em] text-[#667085]">
              <span>{isSv ? 'Kategori' : 'Category'}</span>
              <span>Start</span>
              <span>Standard</span>
              <span>Premium</span>
            </div>
            {listingPriceCategories.map((category) => (
              <div key={category.slug} className="grid grid-cols-[1.35fr_.85fr_.85fr_.85fr] gap-3 border-b border-[#edf1f7] px-5 py-4 text-sm last:border-b-0">
                <span className="font-medium">{category.label}</span>
                <span className="text-[#667085]">{freeLabel}</span>
                <span>{formatListingPrice(category.standard)}</span>
                <span>{formatListingPrice(category.premium)}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-[20px] bg-[#101828] p-7 text-white sm:flex sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl font-medium tracking-[-.04em]">
                {isSv ? 'VÃ¤lj paket nÃ¤r annonsen Ã¤r redo.' : 'Choose a package when the listing is ready.'}
              </h2>
              <p className="mt-3 max-w-2xl text-[#cbd5e1]">
                {isSv ? 'Priser visas innan publicering sÃ¥ att valet Ã¤r tydligt.' : 'Prices are shown before publishing so the choice is clear.'}
              </p>
            </div>
            <Link href={primaryHref} className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-[12px] bg-white px-6 text-sm font-medium text-[#101828] transition duration-200 hover:-translate-y-0.5 hover:bg-[#edf5ff] sm:mt-0">
              {copy.primaryCta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
        <PublicFooter locale={locale} />
      </main>
    )
  }

  if (false as boolean) {
    const isSv = locale === 'sv'
    const sellerPage = {
      'sell-vehicle': {
        eyebrow: isSv ? 'SÃ¤lja pÃ¥ Autorell' : copy.eyebrow,
        title: isSv ? 'SÃ¤lj fordon med bÃ¤ttre presentation och rÃ¤tt kÃ¶pare.' : copy.title,
        intro: isSv
          ? 'En tydlig annons gÃ¶r bilen, transportbilen eller maskinen enklare att fÃ¶rstÃ¥ innan fÃ¶rsta kontakten. Autorell samlar fordonsdata, plats, pris och sÃ¤ljartyp i ett lugnt flÃ¶de.'
          : copy.intro,
        sideTitle: isSv ? 'Bygg annonsen runt det kÃ¶paren faktiskt vill se.' : 'Build the listing around what buyers need first.',
        sideItems: isSv
          ? ['Bilder, skick och utrustning', 'Pris, valuta och plats', 'SÃ¤ljartyp och kontaktvÃ¤g']
          : ['Photos, condition and equipment', 'Price, currency and location', 'Seller type and contact route'],
        cards: isSv
          ? [
              ['1', 'FÃ¶rbered material', 'Samla bilder, servicehistorik, utrustning, miltal och eventuella kÃ¤nda fel.'],
              ['2', 'Publicera tydligt', 'VÃ¤lj kategori, skriv sakligt och lÃ¥t kÃ¶paren se rÃ¤tt information direkt.'],
              ['3', 'FÃ¶lj intresse', 'Spara dialogen, svara med sammanhang och hÃ¥ll affÃ¤ren organiserad.'],
            ]
          : [
              ['1', 'Prepare details', 'Collect photos, service history, equipment, mileage and known issues.'],
              ['2', 'Publish clearly', 'Choose category, write plainly and show buyers the right context.'],
              ['3', 'Follow interest', 'Keep conversations organised and respond with listing context.'],
            ],
        lowerTitle: isSv ? 'Passar bÃ¥de privata sÃ¤ljare och fÃ¶retag.' : 'Made for private sellers and businesses.',
      },
      'how-selling-works': {
        eyebrow: isSv ? 'SÃ¥ fungerar det' : copy.eyebrow,
        title: isSv ? 'Ett lugnt sÃ¤ljflÃ¶de frÃ¥n annons till seriÃ¶s kontakt.' : copy.title,
        intro: isSv
          ? 'Processen Ã¤r byggd fÃ¶r att varje steg ska kÃ¤nnas tydligt: skapa annons, fÃ¥ kontakt, kontrollera kÃ¶paren och komma Ã¶verens utanfÃ¶r annonsen.'
          : copy.intro,
        sideTitle: isSv ? 'Inga onÃ¶diga steg. Bara rÃ¤tt ordning.' : 'No noisy steps. Just the right order.',
        sideItems: isSv
          ? ['Skapa konto', 'Publicera annons', 'Hantera meddelanden', 'Kom Ã¶verens om betalning och hÃ¤mtning']
          : ['Create account', 'Publish listing', 'Manage messages', 'Agree payment and pickup'],
        cards: isSv
          ? [
              ['01', 'Annonsen', 'Fyll i kategori, pris, plats och detaljer sÃ¥ kÃ¶paren kan jÃ¤mfÃ¶ra snabbt.'],
              ['02', 'Kontakten', 'Meddelanden kopplas till annonsen sÃ¥ dialogen behÃ¥ller sammanhang.'],
              ['03', 'AffÃ¤ren', 'KÃ¶pare och sÃ¤ljare bekrÃ¤ftar dokument, betalning och Ã¶verlÃ¤mning direkt.'],
            ]
          : [
              ['01', 'Listing', 'Add category, price, location and details so buyers can compare quickly.'],
              ['02', 'Contact', 'Messages stay tied to the listing for cleaner context.'],
              ['03', 'Deal', 'Buyer and seller confirm documents, payment and handover directly.'],
            ],
        lowerTitle: isSv ? 'Byggt fÃ¶r tydligare dialog, inte stressade affÃ¤rer.' : 'Built for clearer dialogue, not rushed deals.',
      },
      pricing: {
        eyebrow: isSv ? 'Pris' : copy.eyebrow,
        title: isSv ? 'VÃ¤lj synlighet efter hur fordonet ska sÃ¤ljas.' : copy.title,
        intro: isSv
          ? 'Autorell ska vara enkelt att fÃ¶rstÃ¥ innan du publicerar. VÃ¤lj en enkel start eller mer synlighet nÃ¤r annonsen behÃ¶ver lyftas.'
          : copy.intro,
        sideTitle: isSv ? 'Tydlig publicering utan Ã¶verraskningar.' : 'Clear publishing without surprises.',
        sideItems: isSv
          ? ['Gratis start', 'Standardperiod', 'Premiumsynlighet']
          : ['Free start', 'Standard period', 'Premium visibility'],
        cards: isSv
          ? [
              ['Start', '7 dagar', 'Testa annonsen och se att allt ser rÃ¤tt ut innan du vÃ¤ljer mer synlighet.'],
              ['Standard', '15 dagar', 'FÃ¶r vanliga annonser dÃ¤r du vill ligga ute lÃ¤ngre och fÃ¥ stabil exponering.'],
              ['Premium', '30 dagar', 'FÃ¶r fordon som ska synas mer i rÃ¤tt kategori och marknad.'],
            ]
          : [
              ['Start', '7 days', 'Test the listing and make sure everything looks right.'],
              ['Standard', '15 days', 'For normal listings that need longer steady exposure.'],
              ['Premium', '30 days', 'For vehicles that need stronger category and market visibility.'],
            ],
        lowerTitle: isSv ? 'Priset ska kÃ¤nnas tydligt innan publicering.' : 'Pricing should feel clear before publishing.',
      },
    }[page as 'sell-vehicle' | 'how-selling-works' | 'pricing']

    return (
      <main className="bg-[#f6f8fb] text-[#101828]">
        <PublicHeader locale={locale} marketCode={marketCode} />
        <section className="overflow-hidden border-b border-[#dce3ef] bg-white">
          <div className="mx-auto grid max-w-[var(--autorell-page-max)] gap-8 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-center">
            <div>
              <p className="text-xs font-medium uppercase tracking-[.18em] text-[#0866ff]">
                {sellerPage.eyebrow}
              </p>
              <h1 className="mt-5 max-w-4xl text-[42px] font-medium leading-[1.04] tracking-[-.045em] sm:text-[64px]">
                {sellerPage.title}
              </h1>
              <p className="mt-6 max-w-2xl text-lg font-normal leading-8 text-[#5f6b7a]">
                {sellerPage.intro}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={localizePublicHref(locale, ctaLinks.primary[page])}
                  className="inline-flex min-h-12 items-center gap-2 rounded-[12px] bg-[#0866ff] px-6 text-sm font-medium text-white shadow-[0_14px_34px_rgba(8,102,255,.22)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#075ce5]"
                >
                  {copy.primaryCta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={localizePublicHref(locale, ctaLinks.secondary[page])}
                  className="inline-flex min-h-12 items-center rounded-[12px] border border-[#c9d4e5] bg-white px-6 text-sm font-medium text-[#101828] transition duration-200 hover:-translate-y-0.5 hover:border-[#0866ff] hover:text-[#0866ff]"
                >
                  {copy.secondaryCta}
                </Link>
              </div>
            </div>

            <aside className="relative rounded-[18px] border border-[#dce6f4] bg-[#f8fbff] p-6 shadow-[0_24px_70px_rgba(16,24,40,.08)]">
              <span className="grid h-12 w-12 place-items-center rounded-[14px] bg-[#e9f0fd] text-[#0866ff]">
                <Icon className="h-6 w-6" strokeWidth={1.8} />
              </span>
              <h2 className="mt-5 text-2xl font-medium tracking-[-.035em]">{sellerPage.sideTitle}</h2>
              <ul className="mt-5 grid gap-3">
                {sellerPage.sideItems.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm font-medium text-[#344054]">
                    <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-[#0866ff]" strokeWidth={1.9} />
                    {item}
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        <section className="mx-auto max-w-[1180px] px-5 py-14 sm:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {sellerPage.cards.map(([kicker, title, text]) => (
              <article
                key={title}
                className="group rounded-[18px] border border-[#dde5ef] bg-white p-6 shadow-[0_14px_36px_rgba(16,24,40,.045)] transition duration-200 hover:-translate-y-1 hover:border-[#bcd3ff] hover:shadow-[0_20px_48px_rgba(16,24,40,.08)]"
              >
                <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-[#e9f0fd] px-3 text-sm font-medium text-[#0866ff]">
                  {kicker}
                </span>
                <h2 className="mt-5 text-2xl font-medium tracking-[-.035em]">{title}</h2>
                <p className="mt-3 text-[15px] leading-7 text-[#667085]">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1180px] px-5 pb-16 sm:px-8">
          <div className="overflow-hidden rounded-[20px] border border-[#dbe5f3] bg-[#101828] text-white shadow-[0_24px_70px_rgba(16,24,40,.10)]">
            <div className="grid gap-6 p-7 sm:p-9 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-xs font-medium uppercase tracking-[.18em] text-[#93c5fd]">Autorell</p>
                <h2 className="mt-3 max-w-2xl text-3xl font-medium tracking-[-.04em] sm:text-5xl">
                  {sellerPage.lowerTitle}
                </h2>
              </div>
              <Link
                href={localizePublicHref(locale, ctaLinks.primary[page])}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[12px] bg-white px-6 text-sm font-medium text-[#101828] transition duration-200 hover:-translate-y-0.5 hover:bg-[#edf5ff]"
              >
                {copy.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
        <PublicFooter locale={locale} />
      </main>
    )
  }

  return (
    <main className="bg-[#f7f8fb] text-[#101828]">
      <PublicHeader locale={locale} marketCode={marketCode} />
      <section className="border-b border-[#dce3ef] bg-[linear-gradient(135deg,#f8fbff,#eef5ff)]">
        <div className="mx-auto grid max-w-[var(--autorell-page-max)] gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-end">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#0866ff]">
              {copy.eyebrow}
            </p>
            <h1 className="mt-5 max-w-5xl text-5xl font-black leading-[1] tracking-[-.055em] sm:text-7xl">
              {copy.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[#667085]">
              {copy.intro}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={localizePublicHref(locale, ctaLinks.primary[page])}
                className="inline-flex min-h-13 items-center gap-2 rounded-[14px] bg-[#0866ff] px-6 font-extrabold text-white transition hover:bg-[#075ce5]"
              >
                {copy.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={localizePublicHref(locale, ctaLinks.secondary[page])}
                className="inline-flex min-h-13 items-center rounded-[14px] border border-[#b8c5da] bg-white px-6 font-extrabold transition hover:border-[#0866ff] hover:text-[#0866ff]"
              >
                {copy.secondaryCta}
              </Link>
            </div>
          </div>

          <aside className="rounded-[22px] border border-[#dce6f4] bg-white p-6 shadow-[0_24px_70px_rgba(16,24,40,.10)]">
            <span className="grid h-12 w-12 place-items-center rounded-[14px] bg-[#edf5ff] text-[#0866ff]">
              <Icon className="h-6 w-6" />
            </span>
            <ul className="mt-6 space-y-4">
              {copy.highlights.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm font-bold text-[#344054]">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#0866ff]" />
                  {item}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-5 py-16 sm:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {copy.sections.map((section) => (
            <article
              key={section.title}
              className="rounded-[20px] border border-[#e1e5ec] bg-white p-6 shadow-[0_14px_36px_rgba(16,24,40,.045)]"
            >
              <h2 className="text-xl font-black tracking-[-.035em]">{section.title}</h2>
              <p className="mt-3 leading-7 text-[#667085]">{section.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-5 pb-16 sm:px-8">
        <div className="rounded-[24px] bg-[#101828] p-7 text-white sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div>
            <h2 className="max-w-2xl text-3xl font-black tracking-[-.045em] sm:text-5xl">
              {copy.finalTitle}
            </h2>
            <p className="mt-4 max-w-2xl leading-7 text-[#cbd5e1]">{copy.finalText}</p>
          </div>
          <Link
            href={localizePublicHref(locale, ctaLinks.primary[page])}
            className="mt-7 inline-flex min-h-13 shrink-0 items-center gap-2 rounded-[14px] bg-white px-6 font-extrabold text-[#101828] transition hover:bg-[#edf5ff] lg:mt-0"
          >
            {copy.primaryCta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
      <PublicFooter locale={locale} />
    </main>
  )
}

function getInfoPageCopy(
  page: PublicInfoPageKey,
  locale: PublicLocale,
): PublicInfoPageCopy {
  if (locale === 'sv' || locale === 'de' || locale === 'en') {
    return infoPageCopy[locale][page]
  }

  return translatePublicObject(locale, infoPageCopy.en[page])
}

function getRequestedLocale(headerStore: Awaited<ReturnType<typeof headers>>): PublicLocale {
  const requested = headerStore.get('x-autorell-language') || 'en'
  return requested === 'sv' || requested === 'de' || isPublicLanguage(requested)
    ? requested
    : 'en'
}

