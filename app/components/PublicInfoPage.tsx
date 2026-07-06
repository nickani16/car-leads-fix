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
      metaTitle: 'Salj ditt fordon | Autorell',
      metaDescription:
        'Skapa en tydlig fordonsannons, na kopare i Europa och hantera forfragningar via Autorell.',
      eyebrow: 'Salj pa Autorell',
      title: 'Salj ditt fordon med en annons byggd for europeiska kopare.',
      intro:
        'Autorell hjalper privatpersoner och foretag att presentera fordon tydligt, samla seriösa forfragningar och halla processen organiserad.',
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
      metaTitle: 'Sa fungerar forsäljning | Autorell',
      metaDescription: 'Se hur saljare skapar annonser, far forfragningar och gor fordonsaffarer via Autorell.',
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
      metaDescription: 'Forsta Autorells annonsalternativ for privatpersoner och foretag.',
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
      metaDescription: 'Autorell hjalper professionella saljare att publicera lager och na kopare i Europa.',
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
      metaTitle: 'Sparade sokningar | Autorell',
      metaDescription: 'Spara sokningar och annonser pa Autorell for att enklare hitta tillbaka till intressanta fordon.',
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
      metaTitle: 'Jamfor fordon | Autorell',
      metaDescription: 'Jamfor Autorell-annonser efter pris, miltal, skick, plats och saljarinformation.',
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
      metaDescription: 'Forsta vad du bor kontrollera i fordonshistoriken innan kop.',
      eyebrow: 'Fordonshistorik',
      title: 'Vet vad du ska fraga innan du koper.',
      intro: 'Historiken ar extra viktig vid gransoverskridande kop. Autorell hjalper kopare fokusera pa ratt fragor.',
      primaryCta: 'Sok fordon',
      secondaryCta: 'Sakerhetstips',
      highlights: ['Agande och registrering', 'Service och besiktning', 'Finans och skador'],
      sections: [
        { title: 'Be om dokument', text: 'Begär registreringsbevis, servicehistorik, besiktningspapper och bevis pa att saljaren far salja fordonet.' },
        { title: 'Kontrollera externa register', text: 'Anvand officiella eller valrenommerade historiktjanster i registreringslandet.' },
        { title: 'Var vaksam pa stress', text: 'Undvik saljare som vagrar dokument, pressar betalning eller flyttar dialogen for tidigt.' },
      ],
      finalTitle: 'Historik skyddar bada parter',
      finalText: 'Tydliga dokument gor affaren enklare for seriösa kopare och saljare.',
    },
    'buying-guide': {
      metaTitle: 'Kopguide | Autorell',
      metaDescription: 'Praktisk guide for att kopa fordon i Europa med battre kontroller, betalning och transportplanering.',
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
      metaDescription: 'Autorell ar en europeisk marknadsplats for kop och salj av fordon mellan lander och kategorier.',
      eyebrow: 'Om Autorell',
      title: 'En europeisk marknadsplats for seriösa fordonsannonser.',
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
      metaTitle: 'Karriar | Autorell',
      metaDescription: 'Las om karriar pa Autorell och teamen som bygger en europeisk fordonsmarknadsplats.',
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
      metaDescription: 'Pressinformation for Autorell, inklusive bakgrund och mediakontakt.',
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
      metaTitle: 'Sakerhetstips | Autorell',
      metaDescription: 'Praktiska sakerhetstips for kopare och saljare pa Autorell.',
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
      finalText: 'Noggrann dokumentation skyddar seriösa kopare, saljare och marknadsplatsen.',
    },
    payments: {
      metaTitle: 'Betalningar | Autorell',
      metaDescription: 'Forsta betalningsplanering, kvitton och tryggare betalningsvanor for fordonsaffarer.',
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
      metaDescription: 'Planera hamtning, transport, forsakring och leverans vid fordonskop i Europa.',
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
      metaDescription: 'Erstellen Sie eine klare Fahrzeuganzeige, erreichen Sie Käufer in Europa und verwalten Sie Anfragen über Autorell.',
      eyebrow: 'Auf Autorell verkaufen',
      title: 'Verkaufen Sie Ihr Fahrzeug mit einer Anzeige für europäische Käufer.',
      intro: 'Autorell hilft privaten und professionellen Verkäufern, Fahrzeuge klar zu präsentieren und Anfragen geordnet zu bearbeiten.',
      primaryCta: 'Anzeige erstellen',
      secondaryCta: 'Preise ansehen',
      highlights: ['Autos, Transporter und Spezialfahrzeuge', 'Land, Stadt und Währung klar sichtbar', 'Klarer Kontaktprozess'],
      sections: [
        { title: 'Eine professionelle Anzeige', text: 'Fügen Sie Fotos, Preis, Standort, technische Daten und Verkäuferinformationen hinzu.' },
        { title: 'Relevantere Reichweite', text: 'Das Fahrzeug kann über Suche, Kategorien und lokale Marktseiten gefunden werden.' },
        { title: 'Sie behalten Kontrolle', text: 'Autorell stellt Marktplatz und Werkzeuge bereit. Der Verkäufer verantwortet Fahrzeug und Abschluss.' },
      ],
      finalTitle: 'Bereit zur Veröffentlichung?',
      finalText: 'Erstellen Sie ein Konto, bereiten Sie die Fahrzeugdaten vor und veröffentlichen Sie die Anzeige.',
    },
    'how-selling-works': {
      metaTitle: 'So funktioniert Verkaufen | Autorell',
      metaDescription: 'So erstellen Verkäufer Anzeigen, erhalten Anfragen und schließen Fahrzeuggeschäfte über Autorell ab.',
      eyebrow: 'Verkaufsprozess',
      title: 'Von der Anzeige zur Käuferanfrage in klaren Schritten.',
      intro: 'Der Prozess hält Informationen strukturiert und macht jede Käuferkommunikation leichter.',
      primaryCta: 'Verkauf starten',
      secondaryCta: 'Support kontaktieren',
      highlights: ['Konto erstellen', 'Anzeige veröffentlichen', 'Anfragen verwalten'],
      sections: [
        { title: 'Anzeige vorbereiten', text: 'Sammeln Sie Fotos, Dokumente, Kilometerstand, Zustand, Ausstattung und Preis.' },
        { title: 'Veröffentlichen', text: 'Nach der Veröffentlichung kann die Anzeige in Suche, Kategorien und Märkten erscheinen.' },
        { title: 'Klare Vereinbarung', text: 'Käufer und Verkäufer vereinbaren Zahlung, Abholung, Dokumente und Transport direkt.' },
      ],
      finalTitle: 'Ein klarerer Verkaufsweg',
      finalText: 'Gute Anzeigen beantworten die wichtigsten Fragen vor der ersten Nachricht.',
    },
    pricing: {
      metaTitle: 'Anzeigenpreise | Autorell',
      metaDescription: 'Verstehen Sie Autorells Optionen für private und geschäftliche Fahrzeugverkäufer.',
      eyebrow: 'Preise',
      title: 'Einfache Anzeigenoptionen für private Verkäufer und Unternehmen.',
      intro: 'Wählen Sie den Weg, der zu Verkaufshäufigkeit und gewünschter Sichtbarkeit passt.',
      primaryCta: 'Anzeige erstellen',
      secondaryCta: 'Unternehmenslösungen',
      highlights: ['Private Anzeigen', 'Unternehmenskonto', 'Sichtbarkeit über Kategorien'],
      sections: [
        { title: 'Private Verkäufer', text: 'Nutzen Sie eine Standardanzeige für ein Fahrzeug mit Bildern, Beschreibung und Kontaktoptionen.' },
        { title: 'Regelmäßige Verkäufer', text: 'Unternehmen können Werkzeuge für Bestand, Profile und strukturierte Anfragen nutzen.' },
        { title: 'Klare Bedingungen', text: 'Käufer sollten Endpreis, Zahlungsmethode und Übergabe direkt mit dem Verkäufer bestätigen.' },
      ],
      finalTitle: 'Den richtigen Weg wählen',
      finalText: 'Starten Sie mit einer Anzeige oder erstellen Sie ein Unternehmenskonto für mehrere Fahrzeuge.',
    },
    'dealer-solutions': {
      metaTitle: 'Dealer solutions | Autorell',
      metaDescription: 'Autorell hilft professionellen Verkäufern, Bestand zu veröffentlichen und Käufer in Europa zu erreichen.',
      eyebrow: 'Dealer solutions',
      title: 'Eine klarere Art, Fahrzeugbestand zu präsentieren.',
      intro: 'Autorell bietet professionellen Verkäufern Marktplatzpräsenz, strukturierte Bestandsseiten und Anfragewerkzeuge.',
      primaryCta: 'Unternehmenskonto erstellen',
      secondaryCta: 'Vertrieb kontaktieren',
      highlights: ['Unternehmensprofil', 'Bestandsanzeigen', 'Europäische Reichweite'],
      sections: [
        { title: 'Bestandspräsentation', text: 'Zeigen Sie Autos, Transporter, Lkw, Maschinen und weitere Kategorien mit schnell erfassbaren Daten.' },
        { title: 'Anfragen', text: 'Halten Sie Käufernachrichten mit der richtigen Anzeige verbunden.' },
        { title: 'Marktstruktur', text: 'Land, Währung, Kategorie und Verkäuferinformationen erscheinen konsistent.' },
      ],
      finalTitle: 'Für wiederkehrende Verkäufer gebaut',
      finalText: 'Händler können klein starten und ihre Präsenz auf Autorell ausbauen.',
    },
    'saved-searches': {
      metaTitle: 'Gespeicherte Suchen | Autorell',
      metaDescription: 'Speichern Sie Suchen und Anzeigen auf Autorell, um interessante Fahrzeuge wiederzufinden.',
      eyebrow: 'Käuferwerkzeuge',
      title: 'Behalten Sie wichtige Fahrzeuge und Suchen im Blick.',
      intro: 'Gespeicherte Suchen helfen Käufern, relevante Fahrzeuge erneut zu öffnen und Optionen zu vergleichen.',
      primaryCta: 'Fahrzeuge suchen',
      secondaryCta: 'Konto erstellen',
      highlights: ['Interessante Fahrzeuge speichern', 'Von jedem Gerät zurückkehren', 'Suchen organisieren'],
      sections: [
        { title: 'Fahrzeuge vormerken', text: 'Sammeln Sie Fahrzeuge, die Sie später erneut prüfen möchten.' },
        { title: 'Markt folgen', text: 'Speichern Sie Kombinationen aus Kategorie, Land, Preisbereich und Suchbegriffen.' },
        { title: 'Anmelden für Kontinuität', text: 'Gespeicherte Objekte funktionieren am besten mit einem Autorell-Konto.' },
      ],
      finalTitle: 'Ein ruhigerer Kaufprozess',
      finalText: 'Gute Organisation erleichtert den Vergleich vor der Kontaktaufnahme.',
    },
    'compare-vehicles': {
      metaTitle: 'Fahrzeuge vergleichen | Autorell',
      metaDescription: 'Vergleichen Sie Autorell-Anzeigen nach Preis, Kilometerstand, Zustand, Standort und Verkäuferinformationen.',
      eyebrow: 'Vergleichen',
      title: 'Vergleichen Sie Fahrzeuge mit den wichtigsten Details zuerst.',
      intro: 'Strukturierte Anzeigen zeigen praktische Unterschiede, bevor Sie einen Verkäufer kontaktieren.',
      primaryCta: 'Anzeigen ansehen',
      secondaryCta: 'Kaufberatung',
      highlights: ['Preis und Währung', 'Standort und Verkäufertyp', 'Kilometer, Jahr und Ausstattung'],
      sections: [
        { title: 'Grundlagen prüfen', text: 'Prüfen Sie Preis, Baujahr, Kilometerstand, Antrieb, Getriebe, Zustand und Standort.' },
        { title: 'Mehr als Preis', text: 'Transport, Dokumente, Reaktionszeit und Historie beeinflussen den echten Wert.' },
        { title: 'Gleiche Fragen stellen', text: 'Nutzen Sie dieselbe Checkliste für jedes Fahrzeug.' },
      ],
      finalTitle: 'Vergleichen vor der Entscheidung',
      finalText: 'Ein strukturierter Vergleich macht jede Käuferkommunikation fokussierter.',
    },
    'vehicle-history': {
      metaTitle: 'Fahrzeughistorie | Autorell',
      metaDescription: 'Was Sie vor dem Kauf zur Fahrzeughistorie prüfen sollten.',
      eyebrow: 'Fahrzeughistorie',
      title: 'Wissen, was Sie vor dem Kauf fragen sollten.',
      intro: 'Die Historie ist bei grenzüberschreitenden Käufen besonders wichtig.',
      primaryCta: 'Fahrzeuge suchen',
      secondaryCta: 'Sicherheitstipps',
      highlights: ['Eigentum und Zulassung', 'Service und Prüfung', 'Finanzierung und Schäden'],
      sections: [
        { title: 'Dokumente anfordern', text: 'Bitten Sie um Zulassungspapiere, Serviceunterlagen, Prüfberichte und Verkaufsberechtigung.' },
        { title: 'Externe Register prüfen', text: 'Nutzen Sie offizielle oder seriöse Historienanbieter im Zulassungsland.' },
        { title: 'Bei Druck vorsichtig sein', text: 'Vermeiden Sie Verkäufer, die Dokumente verweigern oder Zahlung überstürzen.' },
      ],
      finalTitle: 'Historie schützt beide Seiten',
      finalText: 'Klare Dokumentation erleichtert seriösen Käufern und Verkäufern das Geschäft.',
    },
    'buying-guide': {
      metaTitle: 'Kaufberatung | Autorell',
      metaDescription: 'Praktische Autorell-Kaufberatung für Fahrzeuge in Europa.',
      eyebrow: 'Kaufberatung',
      title: 'Mit besserer Checkliste in Europa kaufen.',
      intro: 'Grenzüberschreitender Fahrzeugkauf funktioniert am besten, wenn Preis, Dokumente, Zahlung und Transport früh geklärt sind.',
      primaryCta: 'Fahrzeuge ansehen',
      secondaryCta: 'Sicherheitstipps',
      highlights: ['Verkäufer prüfen', 'Dokumente bestätigen', 'Zahlung und Abholung planen'],
      sections: [
        { title: 'Vor der Kontaktaufnahme', text: 'Vergleichen Sie ähnliche Anzeigen und bereiten Sie Fragen zu Eigentum, Zustand, MwSt. und Service vor.' },
        { title: 'Vor der Zahlung', text: 'Bestätigen Sie Identität, Zahlungsweg, Beleg, Übergabeort und Dokumente.' },
        { title: 'Vor dem Transport', text: 'Planen Sie Abholung, Versicherung, Exportpapiere, Transportfirma und Zulassung.' },
      ],
      finalTitle: 'Vorbereitung schafft Vertrauen',
      finalText: 'Die besten Geschäfte sind klar dokumentiert.',
    },
    about: {
      metaTitle: 'Über Autorell | Europäischer Fahrzeugmarktplatz',
      metaDescription: 'Autorell ist ein europäischer Marktplatz für Kauf und Verkauf von Fahrzeugen.',
      eyebrow: 'Über Autorell',
      title: 'Ein europäischer Marktplatz für seriöse Fahrzeuganzeigen.',
      intro: 'Autorell verbindet Käufer und Verkäufer über Kategorien, lokale Märkte und grenzüberschreitende Suche.',
      primaryCta: 'Fahrzeuge ansehen',
      secondaryCta: 'Kontakt',
      highlights: ['Marktplatztechnologie', 'Viele Fahrzeugkategorien', 'Für europäische Märkte gebaut'],
      sections: [
        { title: 'Was Autorell tut', text: 'Wir stellen Marktplatz, Konto-Werkzeuge und Anzeigeerlebnis bereit.' },
        { title: 'Was Autorell nicht ist', text: 'Autorell ist bei normalen Anzeigen nicht automatisch Käufer, Verkäufer, Händler, Exporteur oder Finanzierer.' },
        { title: 'Warum es Autorell gibt', text: 'Fahrzeugkauf in Europa ist fragmentiert. Autorell macht Suche, Vergleich und Kontakt klarer.' },
      ],
      finalTitle: 'Ein Ort für den europäischen Markt',
      finalText: 'Das Ziel: klarere Anzeigen, relevantere Käufer und besser vorbereitete Gespräche.',
    },
    careers: {
      metaTitle: 'Karriere | Autorell',
      metaDescription: 'Karriere bei Autorell und den Teams hinter einem europäischen Fahrzeugmarktplatz.',
      eyebrow: 'Karriere',
      title: 'Bauen Sie am nächsten europäischen Fahrzeugmarktplatz mit.',
      intro: 'Autorell wächst mit einer praktischen Mission: Fahrzeughandel leichter verständlich machen.',
      primaryCta: 'Kontakt',
      secondaryCta: 'Über Autorell',
      highlights: ['Produkt und Technik', 'Marketplace Operations', 'Kundensupport'],
      sections: [
        { title: 'Wie wir arbeiten', text: 'Wir schätzen klare Verantwortung, praktische Produktentscheidungen und Nähe zu Käufern und Verkäufern.' },
        { title: 'Wer gut passt', text: 'Menschen mit Interesse an Marktplätzen, Fahrzeugen, internationalen Produkten und Vertrauen.' },
        { title: 'Initiativkontakt', text: 'Auch ohne offene Rolle können relevante Kandidaten Autorell kontaktieren.' },
      ],
      finalTitle: 'Etwas Nützliches bauen',
      finalText: 'Gute Marktplatzarbeit ist detailliert, beständig und kundennah.',
    },
    press: {
      metaTitle: 'Presse | Autorell',
      metaDescription: 'Presseinformationen zu Autorell, Hintergrund und Medienkontakt.',
      eyebrow: 'Presse',
      title: 'Informationen für Medien und Branchenpartner.',
      intro: 'Autorell kann Hintergrund zum Marktplatz, Kategorien, Käuferverhalten und Produktupdates liefern.',
      primaryCta: 'Presse kontaktieren',
      secondaryCta: 'Über Autorell',
      highlights: ['Unternehmenshintergrund', 'Marktplatz-Updates', 'Medienanfragen'],
      sections: [
        { title: 'Medienanfragen', text: 'Journalisten können Autorell für Unternehmensinformationen, Zitate und Kontext kontaktieren.' },
        { title: 'Markennutzung', text: 'Name, Logo und Screenshots sollten Autorell korrekt darstellen.' },
        { title: 'Branchenkontext', text: 'Wir können digitale Fahrzeugmärkte, Vertrauen und grenzüberschreitende Suche einordnen.' },
      ],
      finalTitle: 'Brauchen Sie Pressekontakt?',
      finalText: 'Senden Sie Thema, Frist und Veröffentlichungsdetails.',
    },
    partners: {
      metaTitle: 'Partner | Autorell',
      metaDescription: 'Partnerschaften mit Autorell rund um Bestand, Distribution, Finanzierung, Zahlung, Transport oder Daten.',
      eyebrow: 'Partner',
      title: 'Partner von Autorell im Fahrzeugmarkt werden.',
      intro: 'Autorell arbeitet mit Partnern, die Käufern und Verkäufern bessere Entscheidungen ermöglichen.',
      primaryCta: 'Partnerschaft kontaktieren',
      secondaryCta: 'Dealer solutions',
      highlights: ['Bestandspartner', 'Transport und Prüfung', 'Zahlung und Daten'],
      sections: [
        { title: 'Bestandspartnerschaften', text: 'Professionelle Verkäufer und Plattformen können Bestand klarer auf Autorell präsentieren.' },
        { title: 'Servicepartner', text: 'Transport, Prüfung, Historie und Zahlung unterstützen sicherere Entscheidungen.' },
        { title: 'Marktexpertise', text: 'Lokale Partner machen landesspezifische Abläufe nützlicher.' },
      ],
      finalTitle: 'Gute Partnerschaften verringern Reibung',
      finalText: 'Starke Partner machen den Fahrzeugweg für beide Seiten klarer.',
    },
    'safety-tips': {
      metaTitle: 'Sicherheitstipps | Autorell',
      metaDescription: 'Praktische Sicherheitstipps für Käufer und Verkäufer auf Autorell.',
      eyebrow: 'Sicherheit',
      title: 'Sichere Fahrzeuggeschäfte beginnen mit besseren Prüfungen.',
      intro: 'Autorell empfiehlt Identität, Dokumente, Zahlung und Übergabe vor einer Zusage zu prüfen.',
      primaryCta: 'Problem melden',
      secondaryCta: 'Kaufberatung',
      highlights: ['Identität prüfen', 'Unterlagen behalten', 'Keine übereilte Zahlung'],
      sections: [
        { title: 'Für Käufer', text: 'Prüfen Sie Verkäufer, Fahrzeugdokumente, Historie, Zahlung und Abholung vor einer Überweisung.' },
        { title: 'Für Verkäufer', text: 'Bestätigen Sie Käuferidentität, vermeiden Sie verdächtige Überzahlungen und bewahren Sie Kommunikation auf.' },
        { title: 'Wenn etwas falsch wirkt', text: 'Pausieren Sie den Deal, sichern Sie Nachrichten und Zahlungsreferenzen und melden Sie den Fall.' },
      ],
      finalTitle: 'Vertrauen entsteht im Detail',
      finalText: 'Sorgfältige Dokumentation schützt seriöse Käufer, Verkäufer und den Marktplatz.',
    },
    payments: {
      metaTitle: 'Zahlungen | Autorell',
      metaDescription: 'Zahlungsplanung, Belege und sicherere Zahlungsgewohnheiten für Fahrzeuggeschäfte.',
      eyebrow: 'Zahlungen',
      title: 'Zahlung planen, bevor das Fahrzeug übergeben wird.',
      intro: 'Zahlungsbedingungen sollten klar zwischen Käufer und Verkäufer vereinbart und dokumentiert sein.',
      primaryCta: 'Sicherheitstipps',
      secondaryCta: 'Support kontaktieren',
      highlights: ['Empfänger prüfen', 'Nachverfolgbare Methoden', 'Belege speichern'],
      sections: [
        { title: 'Methode vereinbaren', text: 'Wählen Sie eine Methode, die beide Seiten verstehen, und bestätigen Sie Kontodaten.' },
        { title: 'Transaktion dokumentieren', text: 'Bewahren Sie Rechnungen, Quittungen, Bankreferenzen und schriftliche Bedingungen auf.' },
        { title: 'Druck vermeiden', text: 'Seien Sie vorsichtig bei Eile, geänderten Kontodaten und ungewöhnlichen Zwischenpersonen.' },
      ],
      finalTitle: 'Klarheit schützt das Geschäft',
      finalText: 'Ein dokumentierter Zahlungsprozess hilft, Streit zu vermeiden und zu klären.',
    },
    'shipping-delivery': {
      metaTitle: 'Versand und Lieferung | Autorell',
      metaDescription: 'Planen Sie Abholung, Transport, Versicherung und Lieferung beim Fahrzeugkauf in Europa.',
      eyebrow: 'Versand und Lieferung',
      title: 'Abholung und Transport vor dem Abschluss planen.',
      intro: 'Grenzüberschreitende Logistik wird einfacher, wenn Käufer und Verkäufer Zuständigkeit, Versicherung und Dokumente klären.',
      primaryCta: 'Kaufberatung',
      secondaryCta: 'Support kontaktieren',
      highlights: ['Abholort', 'Transportdokumente', 'Versicherung und Übergabe'],
      sections: [
        { title: 'Vor der Abholung', text: 'Bestätigen Sie Adresse, Zustand, Zugang, Schlüssel, Dokumente und Abholberechtigung.' },
        { title: 'Während des Transports', text: 'Nutzen Sie einen seriösen Transporteur, prüfen Sie Versicherung und halten Sie Fotos fest.' },
        { title: 'Bei Lieferung', text: 'Prüfen Sie Zustand, Kilometerstand, Dokumente und Übergabeunterlagen.' },
      ],
      finalTitle: 'Gute Logistik gehört zum Kauf',
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
    'saved-searches': '/marketplace/vehicles',
    'compare-vehicles': '/marketplace/vehicles',
    'vehicle-history': '/marketplace/vehicles',
    'buying-guide': '/marketplace/vehicles',
    about: '/marketplace/vehicles',
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
    const prefix = locale === 'sv' ? '/se' : locale === 'de' ? '/de' : ''
    return {
      title: { absolute: copy.metaTitle },
      description: copy.metaDescription,
      alternates: {
        canonical: `https://www.autorell.com${prefix}/${page}`,
      },
      openGraph: {
        title: copy.metaTitle,
        description: copy.metaDescription,
        url: `https://www.autorell.com${prefix}/${page}`,
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
