import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  CarFront,
  Check,
  CircleHelp,
  FileCheck2,
  Globe2,
  Gavel,
  LockKeyhole,
  Mail,
  Route,
  ShieldCheck,
  Store,
  Truck,
} from 'lucide-react'
import ContactForm from '@/app/components/ContactForm'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'

type Locale = 'de' | 'en'
type PageKey =
  | 'vehicles'
  | 'process'
  | 'benefits'
  | 'about'
  | 'faq'
  | 'contact'
  | 'privacy'
  | 'terms'
  | 'cookies'

type MarketPage = {
  path: string
  title: string
  description: string
  eyebrow: string
  heading: string
  intro: string
  primary?: string
  primaryHref?: string
  facts?: string[]
  sections: Array<{ title: string; text: string }>
}

const marketPages: Record<Locale, Record<PageKey, MarketPage>> = {
  de: {
    vehicles: {
      path: '/fahrzeuge',
      title: 'Fahrzeugbörse für Autohändler | Autorell Deutschland',
      description:
        'Digitale Fahrzeugbörse für Autohändler mit qualifiziertem Angebot, strukturierten Fahrzeugdaten, B2B-Auktionen und europaweiter Beschaffung.',
      eyebrow: 'Fahrzeugangebot für Händler',
      heading: 'Neue Beschaffungsmöglichkeiten für Ihren Fahrzeugbestand.',
      intro:
        'Autorell baut für deutsche Händler einen fokussierten Zugang zu qualifiziertem europäischem Fahrzeugangebot auf. Klare Daten helfen Ihnen, schneller zu prüfen, zu priorisieren und zu bieten.',
      primary: 'Händlerzugang beantragen',
      primaryHref: '/dealer-apply',
      facts: ['Standort Schweden', 'Geprüfte Händlerkonten', 'Strukturierte Zustandsdaten'],
      sections: [
        {
          title: 'Relevantes Fahrzeugangebot',
          text: 'Fahrzeuge werden nach Alter, Laufleistung, Zustand und professioneller Nachfrage qualifiziert, bevor sie in die Gebotsphase gelangen.',
        },
        {
          title: 'Vergleichbare Fahrzeugprofile',
          text: 'Technische Daten, Bilder, Servicehistorie, Schäden und bekannte Abweichungen werden in einem einheitlichen Format dargestellt.',
        },
        {
          title: 'Für den deutschen Bestand',
          text: 'Das Angebot richtet sich an Händler, die ihr lokales Sourcing um gefragte Fahrzeuge aus europäischen Märkten ergänzen möchten.',
        },
        {
          title: 'Entscheiden mit besserer Datengrundlage',
          text: 'Jedes Fahrzeug soll vor dem Gebot genügend Informationen liefern, damit Einkaufsteams effizient und nachvollziehbar entscheiden können.',
        },
      ],
    },
    process: {
      path: '/so-funktionierts',
      title: 'Online-Fahrzeugauktionen für Händler: Ablauf | Autorell',
      description:
        'So kaufen Autohändler Fahrzeuge über Autorell: Händlerprüfung, Fahrzeugdaten, Online-Gebot, Entscheidung, Zahlung, Abholung und Logistik.',
      eyebrow: 'Der Einkaufsprozess',
      heading: 'Vom digitalen Gebot in Ihren Fahrzeugbestand.',
      intro:
        'Ein klarer B2B-Prozess verbindet Händlerprüfung, Gebot, Vorabzahlung an Autorell, Fahrzeugprüfung in Schweden und grenzüberschreitende Übergabe.',
      primary: 'Als Händler registrieren',
      primaryHref: '/dealer-apply',
      facts: ['Digitaler Einkauf', 'Klare Entscheidungspunkte', 'Exportfähiger Ablauf'],
      sections: [
        {
          title: 'Händlerkonto prüfen lassen',
          text: 'Unternehmens-, Umsatzsteuer- und Kontaktdaten werden vor der Freischaltung des Käuferkontos geprüft.',
        },
        {
          title: 'Fahrzeug vollständig bewerten',
          text: 'Prüfen Sie Profil, Bilder, Zustand, bekannte Mängel und die für den Einkauf relevanten Dokumente.',
        },
        {
          title: 'Gebot im aktiven Zeitfenster',
          text: 'Sie bieten nach den angezeigten Regeln und sehen den Status Ihrer Teilnahme im Dealer Portal.',
        },
        {
          title: 'Vertrag und Zahlung an Autorell',
          text: 'Nach Annahme werden die Transaktionsdokumente unterzeichnet. Der Käufer überweist den bestätigten Gesamtbetrag vor Abholung an Autorell.',
        },
        {
          title: 'Autorell Verified Inspection',
          text: 'Nach bestätigtem Geldeingang prüft Autorell das Fahrzeug vor Ort gegen Identität, Laufleistung, Funktion, sichtbaren Zustand und Verkäuferdeklaration.',
        },
        {
          title: 'Freigabe, Abholung und Export',
          text: 'Bei Übereinstimmung wird die Transaktion abgeschlossen. Bei wesentlichen Abweichungen wird sie pausiert, schriftlich neu vereinbart oder nach Vertrag abgebrochen.',
        },
      ],
    },
    benefits: {
      path: '/vorteile',
      title: 'Vorteile für deutsche Autohändler | Autorell',
      description:
        'Warum deutsche Autohändler Autorell nutzen: schwedisches Fahrzeugangebot, strukturierte Daten, transparente Gebote und koordinierter Export.',
      eyebrow: 'Warum Autorell?',
      heading: 'Mehr Beschaffungsreichweite. Weniger unnötige Prüfung.',
      intro:
        'Autorell ist kein offenes Kleinanzeigenportal. Die Plattform konzentriert sich auf professionelle Käufer, ausgewählte Fahrzeuge und Informationen, die Einkaufsentscheidungen erleichtern.',
      primary: 'Zugang zum Dealer Network',
      primaryHref: '/dealer-apply',
      facts: ['B2B-Zugang', 'Schwedische Angebotsquelle', 'Einheitlicher Prozess'],
      sections: [
        {
          title: 'Neue Angebotsquelle',
          text: 'Erweitern Sie Ihre Beschaffung um Fahrzeuge aus einem digitalisierten, transparenten nordischen Markt.',
        },
        {
          title: 'Weniger unstrukturierte Anfragen',
          text: 'Statt verstreuter Inserate erhalten Sie Fahrzeugprofile mit konsistenten Daten und klarer Gebotslogik.',
        },
        {
          title: 'Kontrollierte Gegenparteien',
          text: 'Händlerzugang, Kontoinformationen und Transaktionsschritte folgen einem professionellen B2B-Rahmen.',
        },
        {
          title: 'Grenzüberschreitend gedacht',
          text: 'Autorell koordiniert Vertrag, Zahlungseingang, Vor-Ort-Prüfung, schwedische Exportdokumente, Abholung und vereinbarte Logistik.',
        },
      ],
    },
    about: {
      path: '/ueber-autorell',
      title: 'Über Autorell Deutschland | Fahrzeughandel in Europa',
      description:
        'Autorell verbindet ausgewählte schwedische Fahrzeuge mit geprüften Autohändlern in Deutschland und Europa durch Daten, Gebote und digitale Prozesse.',
      eyebrow: 'Über Autorell',
      heading: 'Ein europäischer Fahrzeugmarkt beginnt mit besseren Daten.',
      intro:
        'Autorell AB entwickelt in Schweden eine digitale B2B-Infrastruktur für Fahrzeugqualifizierung, Händlergebote und grenzüberschreitende Transaktionen.',
      primary: 'Händler werden',
      primaryHref: '/dealer-apply',
      sections: [
        {
          title: 'Schweden als Angebotsmarkt',
          text: 'Der erste Fahrzeugbestand wird in Schweden aufgebaut und für professionelle europäische Nachfrage qualifiziert.',
        },
        {
          title: 'Deutschland als wichtiger Käufermarkt',
          text: 'Deutsche Händler erhalten einen eigenen Marktzugang mit relevantem Inhalt, klaren Regeln und lokal verständlicher Kommunikation.',
        },
        {
          title: 'Digital statt fragmentiert',
          text: 'Fahrzeugdaten, Gebote, Entscheidungen und Transaktionsstatus werden in einem zusammenhängenden System organisiert.',
        },
      ],
    },
    faq: {
      path: '/faq',
      title: 'FAQ zur B2B-Fahrzeugbörse für Autohändler | Autorell',
      description:
        'Antworten für Autohändler zu Fahrzeugangebot, Händlerprüfung, Online-Auktionen, Gebühren, Zahlung, Abholung und europäischer Logistik.',
      eyebrow: 'Häufige Fragen',
      heading: 'Antworten für Ihren Einkauf über Autorell.',
      intro:
        'Die wichtigsten Informationen für deutsche Autohändler vor der Registrierung und dem ersten Gebot.',
      sections: [
        {
          title: 'Wo befinden sich die Fahrzeuge?',
          text: 'Zum Start befinden sich die angebotenen Fahrzeuge in Schweden. Standort und Abholinformationen werden im Fahrzeugprofil angegeben.',
        },
        {
          title: 'Wer kann bieten?',
          text: 'Nur geprüfte professionelle Händler mit freigeschaltetem Autorell-Konto können an Gebotsphasen teilnehmen.',
        },
        {
          title: 'Welche Informationen sehe ich?',
          text: 'Fahrzeugdaten, Bilder, deklarierter Zustand, bekannte Mängel und verfügbare Dokumentation werden vor dem Gebot dargestellt.',
        },
        {
          title: 'Wie funktionieren Gebühren?',
          text: 'Anwendbare Käufergebühren und Bedingungen werden vor einer Teilnahme transparent in den Händlerbedingungen oder am Fahrzeug ausgewiesen.',
        },
        {
          title: 'Wie erfolgen Zahlung und Transport?',
          text: 'Der Käufer überweist den bestätigten Gesamtbetrag vor Abholung an Autorell. Nach Geldeingang und erfolgreicher Fahrzeugprüfung werden Abschluss, Exportdokumente, Abholung und Transport koordiniert.',
        },
        {
          title: 'Was passiert bei einer Abweichung?',
          text: 'Autorell pausiert die Transaktion. Käufer und Verkäufer können einer dokumentierten Preisanpassung zustimmen. Bei einer wesentlichen oder nicht akzeptierten Abweichung kann Autorell abbrechen und erhaltene Käufergelder zurückzahlen.',
        },
      ],
    },
    contact: {
      path: '/kontakt',
      title: 'Autorell Deutschland kontaktieren',
      description:
        'Kontaktieren Sie Autorell zu Händlerzugang, schwedischen Fahrzeugen, Geboten, Export, Unternehmensprüfung oder technischem Support.',
      eyebrow: 'Kontakt für Händler',
      heading: 'Sprechen Sie mit Autorell über Ihren Fahrzeugeinkauf.',
      intro:
        'Sie möchten das Angebot verstehen, Ihr Händlerkonto einrichten oder einen laufenden Vorgang klären? Senden Sie uns Ihre Anfrage.',
      sections: [],
    },
    privacy: {
      path: '/datenschutz',
      title: 'Datenschutzerklärung | Autorell Deutschland',
      description:
        'Informationen zur Verarbeitung personenbezogener Daten deutscher Händler und Websitebesucher durch Autorell AB.',
      eyebrow: 'Rechtliche Informationen',
      heading: 'Datenschutzerklärung',
      intro:
        'Autorell AB verarbeitet Kontakt-, Unternehmens-, Konto-, Fahrzeug- und Transaktionsdaten nur für definierte geschäftliche, rechtliche und sicherheitsbezogene Zwecke.',
      sections: [
        { title: 'Verantwortlicher', text: 'Autorell AB in Schweden ist für die Verarbeitung verantwortlich. Anfragen richten Sie an info@autorell.com.' },
        { title: 'Verarbeitete Daten', text: 'Dazu gehören Kontakt-, Unternehmens-, Konto-, Kommunikations-, Fahrzeug-, Vertrags-, Zahlungs- und Sicherheitsdaten.' },
        { title: 'Zwecke und Rechtsgrundlagen', text: 'Die Verarbeitung erfolgt zur Vertragsanbahnung und -durchführung, für rechtliche Pflichten, Sicherheit und berechtigte Geschäftsinteressen.' },
        { title: 'Empfänger und Dienstleister', text: 'Erforderliche Daten können mit Zahlungs-, Signatur-, Hosting-, Sicherheits-, Transport- und Beratungsdienstleistern geteilt werden.' },
        { title: 'Ihre Rechte', text: 'Sie können je nach Rechtslage Auskunft, Berichtigung, Löschung, Einschränkung, Übertragbarkeit oder Widerspruch verlangen.' },
      ],
    },
    terms: {
      path: '/nutzungsbedingungen',
      title: 'Nutzungsbedingungen | Autorell Deutschland',
      description:
        'Nutzungsbedingungen für Händlerkonten, Fahrzeugdaten, Gebote, Prüfung, Zahlung, Abholung und grenzüberschreitende Fahrzeuggeschäfte.',
      eyebrow: 'Rechtliche Informationen',
      heading: 'Nutzungsbedingungen',
      intro:
        'Für Gebote, Gebühren und Transaktionen gelten die jeweils veröffentlichten Händlerbedingungen und fahrzeugspezifischen Informationen.',
      sections: [
        { title: 'Händlerkonto', text: 'Unternehmensdaten müssen vollständig und korrekt sein. Der Zugang kann von einer Prüfung und Freigabe abhängig gemacht werden.' },
        { title: 'Fahrzeuginformationen', text: 'Fahrzeugprofile basieren auf verfügbaren Angaben, Erklärungen und Prüfungen. Händler müssen alle offengelegten Informationen vor einem Gebot bewerten.' },
        { title: 'Gebote und Gebühren', text: 'Verbindlichkeit, Gebotsregeln und anwendbare Gebühren ergeben sich aus den aktuellen Händlerbedingungen und dem jeweiligen Angebot.' },
        { title: 'Zahlung vor Ausführung', text: 'Der bestätigte Käufergesamtbetrag ist vor Abholung an Autorell zu zahlen. Verkäuferauszahlung und Fahrzeugfreigabe erfolgen erst nach den vereinbarten Prüf- und Abschlussbedingungen.' },
        { title: 'Prüfung und Abweichungen', text: 'Autorell gleicht das Fahrzeug mit der Deklaration ab. Abweichungen können zu einer Pause, schriftlichen Preisanpassung oder zum Abbruch mit Rückzahlung erhaltener Käufergelder führen.' },
      ],
    },
    cookies: {
      path: '/cookies',
      title: 'Cookie-Richtlinie | Autorell Deutschland',
      description:
        'Informationen zu notwendigen Cookies, Händleranmeldung, Sicherheit, Sitzungen und Cookie-Einstellungen auf autorell.de.',
      eyebrow: 'Rechtliche Informationen',
      heading: 'Cookie-Richtlinie',
      intro:
        'Autorell verwendet notwendige Technologien für Sicherheit, Anmeldung und angeforderte Funktionen. Nicht notwendige Technologien erfordern eine entsprechende Auswahl.',
      sections: [
        { title: 'Notwendige Cookies', text: 'Diese Cookies unterstützen Sicherheit, Anmeldung, Sitzungen und ausdrücklich angeforderte Funktionen.' },
        { title: 'Analyse', text: 'Anonyme Analyse wird nur eingesetzt, wenn sie eingeführt und nach geltendem Recht freigegeben wurde.' },
        { title: 'Einstellungen', text: 'Sie können Ihre Auswahl im Footer ändern oder Cookies über Ihren Browser verwalten.' },
      ],
    },
  },
  en: {
    vehicles: {
      path: '/vehicles',
      title: 'Swedish vehicles for European dealers | Autorell',
      description:
        'Source selected Swedish vehicles with structured condition data, professional bidding and access for verified European automotive dealers.',
      eyebrow: 'Vehicle sourcing from Sweden',
      heading: 'A focused Swedish supply channel for European dealers.',
      intro:
        'Autorell gives professional buyers access to selected Swedish vehicles, consistent vehicle data and a workflow designed for cross-border purchasing.',
      primary: 'Apply for dealer access',
      primaryHref: '/dealer-apply',
      facts: ['Vehicles in Sweden', 'Verified dealer access', 'Structured condition data'],
      sections: [
        { title: 'Selected Swedish supply', text: 'Vehicles are qualified for age, mileage, condition and professional demand before bidding opens.' },
        { title: 'Comparable profiles', text: 'Technical data, images, service history, damage and known discrepancies follow a consistent format.' },
        { title: 'Built for professional stock', text: 'The supply is intended for dealerships and automotive businesses sourcing vehicles for resale.' },
        { title: 'Better purchasing decisions', text: 'Each listing is designed to reduce unnecessary review and help buying teams prioritise efficiently.' },
      ],
    },
    process: {
      path: '/how-it-works',
      title: 'How to buy Swedish vehicles through Autorell',
      description:
        'Learn the Autorell dealer process: company verification, vehicle review, bidding, seller decision, inspection, payment, collection and export.',
      eyebrow: 'How buying works',
      heading: 'From Swedish vehicle supply to your inventory.',
      intro:
        'A clear B2B workflow connects dealer verification, bidding, advance funding to Autorell, inspection in Sweden and cross-border handover.',
      primary: 'Create a dealer account',
      primaryHref: '/dealer-apply',
      facts: ['Digital sourcing', 'Clear decision stages', 'Cross-border workflow'],
      sections: [
        { title: 'Verify your dealership', text: 'Company, VAT and contact information are reviewed before buyer access is activated.' },
        { title: 'Review the complete vehicle profile', text: 'Assess images, technical data, declared condition, known faults and available documents.' },
        { title: 'Bid during the active window', text: 'Place bids under the displayed rules and follow your activity through the Dealer Portal.' },
        { title: 'Contract and payment to Autorell', text: 'After acceptance, the transaction documents are signed and the buyer transfers the confirmed total to Autorell before collection.' },
        { title: 'Autorell Verified Inspection', text: 'After cleared funds, Autorell checks the vehicle on site against its identity, mileage, operation, visible condition and seller declaration.' },
        { title: 'Release, collection and export', text: 'If the vehicle matches, the transaction completes. A material discrepancy pauses the deal for written adjustment or cancellation under the contract.' },
      ],
    },
    benefits: {
      path: '/dealer-benefits',
      title: 'Dealer benefits: source vehicles from Sweden | Autorell',
      description:
        'Why European dealers use Autorell: selected Swedish supply, structured data, transparent bidding and a coordinated cross-border process.',
      eyebrow: 'Why Autorell?',
      heading: 'Broader sourcing reach. Less unstructured work.',
      intro:
        'Autorell is not an open classifieds site. It is designed around professional buyers, selected vehicles and information that supports commercial decisions.',
      primary: 'Join the Dealer Network',
      primaryHref: '/dealer-apply',
      facts: ['Professional B2B access', 'Swedish sourcing channel', 'One purchasing workflow'],
      sections: [
        { title: 'A new sourcing market', text: 'Add selected vehicles from a highly digitalised Nordic automotive market to your purchasing mix.' },
        { title: 'Less fragmented information', text: 'Review consistent vehicle profiles instead of chasing incomplete listings and disconnected sellers.' },
        { title: 'Verified counterparties', text: 'Dealer access and transaction stages operate within a professional B2B framework.' },
        { title: 'Cross-border by design', text: 'Autorell coordinates contracts, receipt of funds, on-site inspection, Swedish export documents, collection and agreed logistics.' },
      ],
    },
    about: {
      path: '/about',
      title: 'About Autorell | European vehicle sourcing platform',
      description:
        'Autorell connects selected Swedish vehicles with verified automotive dealers across Europe through structured data and digital workflows.',
      eyebrow: 'About Autorell',
      heading: 'European vehicle sourcing starts with better data.',
      intro:
        'Autorell AB is building B2B infrastructure in Sweden for vehicle qualification, professional bidding and cross-border automotive transactions.',
      primary: 'Become an Autorell dealer',
      primaryHref: '/dealer-apply',
      sections: [
        { title: 'Sweden as the supply market', text: 'The initial vehicle supply is sourced and qualified in Sweden for professional European demand.' },
        { title: 'Europe as the buyer network', text: 'Approved dealerships can access a market experience designed around professional sourcing.' },
        { title: 'Digital instead of fragmented', text: 'Vehicle data, bids, decisions and transaction status are organised in one connected system.' },
      ],
    },
    faq: {
      path: '/faq',
      title: 'FAQ for European automotive dealers | Autorell',
      description:
        'Answers for dealers about Swedish vehicles, account approval, bidding, buyer fees, payment, collection, documents and export.',
      eyebrow: 'Frequently asked questions',
      heading: 'Answers before you source your first vehicle.',
      intro:
        'The essential information for European automotive dealers joining the Autorell marketplace.',
      sections: [
        { title: 'Where are the vehicles located?', text: 'At launch, listed vehicles are located in Sweden. Location and collection information are shown in the profile.' },
        { title: 'Who can bid?', text: 'Only approved professional buyers with an active Autorell dealer account can participate.' },
        { title: 'What vehicle information is provided?', text: 'Profiles include available technical data, images, declared condition, known faults and documentation.' },
        { title: 'How are fees communicated?', text: 'Applicable buyer fees and rules are displayed in the dealer terms or before participation in a vehicle opportunity.' },
        { title: 'How do payment and transport work?', text: 'The buyer transfers the confirmed total to Autorell before collection. After cleared funds and a successful inspection, Autorell coordinates completion, export documents, collection and transport.' },
        { title: 'What happens if the vehicle differs from its declaration?', text: 'Autorell pauses the transaction. Buyer and seller may accept a documented price adjustment. For a material or unresolved discrepancy, Autorell may cancel and return buyer funds received.' },
      ],
    },
    contact: {
      path: '/contact',
      title: 'Contact Autorell for European dealer access',
      description:
        'Contact Autorell about dealer access, Swedish vehicle sourcing, bidding, export, company verification or Dealer Portal support.',
      eyebrow: 'Dealer contact',
      heading: 'Talk to Autorell about sourcing vehicles from Sweden.',
      intro:
        'Need help understanding the supply, setting up your dealer account or resolving an active transaction? Send us your enquiry.',
      sections: [],
    },
    privacy: {
      path: '/privacy',
      title: 'Privacy policy for European dealers | Autorell',
      description:
        'How Autorell AB processes personal data relating to European dealers, business contacts, accounts and vehicle transactions.',
      eyebrow: 'Legal information',
      heading: 'Privacy policy',
      intro:
        'Autorell AB processes contact, company, account, vehicle and transaction data for defined business, legal and security purposes.',
      sections: [
        { title: 'Data controller', text: 'Autorell AB in Sweden is the data controller. Privacy requests can be sent to info@autorell.com.' },
        { title: 'Data processed', text: 'This may include contact, company, account, communication, vehicle, contract, payment and security information.' },
        { title: 'Purposes and legal bases', text: 'Processing supports account approval, contracts, legal obligations, platform security and legitimate business interests.' },
        { title: 'Recipients and providers', text: 'Required information may be shared with payment, signing, hosting, security, transport and advisory providers.' },
        { title: 'Your rights', text: 'Depending on applicable law, you may request access, correction, deletion, restriction, portability or object to processing.' },
      ],
    },
    terms: {
      path: '/terms',
      title: 'Terms of use for European dealers | Autorell',
      description:
        'Terms for dealer accounts, vehicle information, bidding, fees, inspection, payment, collection and cross-border vehicle transactions.',
      eyebrow: 'Legal information',
      heading: 'Terms of use',
      intro:
        'Bids, fees and transactions are governed by the published Dealer Terms and the information presented for each vehicle opportunity.',
      sections: [
        { title: 'Dealer accounts', text: 'Company information must be complete and accurate. Access may require review and approval.' },
        { title: 'Vehicle information', text: 'Profiles rely on available declarations, records and inspections. Dealers must review disclosed information before bidding.' },
        { title: 'Bids and fees', text: 'Binding status, bidding rules and applicable fees follow the current Dealer Terms and vehicle opportunity.' },
        { title: 'Funding before execution', text: 'The confirmed buyer total is paid to Autorell before collection. Seller payout and vehicle release remain subject to the agreed inspection and completion conditions.' },
        { title: 'Inspection and discrepancies', text: 'Autorell compares the vehicle with its declaration. A discrepancy may pause the transaction, require a written price adjustment or result in cancellation and return of buyer funds received.' },
      ],
    },
    cookies: {
      path: '/cookies',
      title: 'Cookie policy for Autorell dealers',
      description:
        'Information about essential cookies, Dealer Portal sign-in, security, sessions, analytics and cookie settings on autorell.com.',
      eyebrow: 'Legal information',
      heading: 'Cookie policy',
      intro:
        'Autorell uses essential technologies for security, sign-in and requested functionality. Non-essential technologies require an appropriate choice.',
      sections: [
        { title: 'Essential cookies', text: 'These support security, authentication, sessions and explicitly requested features.' },
        { title: 'Analytics', text: 'Anonymous analytics is used only if introduced and enabled in accordance with applicable requirements.' },
        { title: 'Managing settings', text: 'You can change your choice in the footer or manage cookies through your browser.' },
      ],
    },
  },
}

const icons = [CarFront, FileCheck2, Gavel, ShieldCheck, Route, Truck, Store]

export async function generateMetadata({
  params,
}: PageProps<'/dealer-market/[locale]/[page]'>): Promise<Metadata> {
  const { locale, page } = await params
  if ((locale !== 'de' && locale !== 'en') || !(page in marketPages[locale])) {
    return {}
  }

  const content = marketPages[locale][page as PageKey]
  const host = locale === 'de' ? 'https://www.autorell.de' : 'https://www.autorell.com'

  return {
    title: { absolute: content.title },
    description: content.description,
    alternates: { canonical: `${host}${content.path}` },
    openGraph: {
      title: content.title,
      description: content.description,
      url: `${host}${content.path}`,
      siteName: 'Autorell',
      locale: locale === 'de' ? 'de_DE' : 'en_GB',
      type: 'website',
    },
  }
}

export default async function DealerMarketPage({
  params,
}: PageProps<'/dealer-market/[locale]/[page]'>) {
  const { locale, page } = await params
  if ((locale !== 'de' && locale !== 'en') || !(page in marketPages[locale])) {
    notFound()
  }

  const content = marketPages[locale][page as PageKey]
  const isContact = page === 'contact'
  const isFaq = page === 'faq'
  const isLegal = page === 'privacy' || page === 'terms' || page === 'cookies'

  return (
    <main className="overflow-hidden bg-[#f8f7f3] text-[#202124]">
      <PublicHeader locale={locale} />

      <section className="relative overflow-hidden border-b border-[#dce5e8] bg-[linear-gradient(145deg,#fbf8f1_0%,#eef6f8_52%,#dcecf3_100%)]">
        <div className="absolute -right-36 -top-52 h-[540px] w-[540px] rounded-full border-[70px] border-white/55" />
        <div className="absolute -bottom-36 left-[28%] h-72 w-72 rounded-full bg-[#b4d9ef]/30 blur-3xl" />
        <div className="relative mx-auto max-w-[1320px] px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#c7dce5] bg-white/75 px-4 py-2 text-xs font-medium text-[#4d6d7c]">
            <Globe2 className="h-4 w-4" />
            {content.eyebrow}
          </span>
          <h1 className="mt-7 max-w-5xl text-[42px] leading-[1] tracking-[-0.055em] sm:text-6xl lg:text-[72px]">
            {content.heading}
          </h1>
          <p className="mt-7 max-w-3xl text-[17px] leading-8 text-[#58707c] sm:text-xl">
            {content.intro}
          </p>
          {content.primary && content.primaryHref && (
            <Link
              href={content.primaryHref}
              className="mt-9 inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#242424] px-7 text-sm font-medium text-white shadow-[0_16px_35px_rgba(32,33,36,.18)] transition hover:-translate-y-0.5"
            >
              {content.primary}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          {content.facts && (
            <div className="mt-9 flex flex-wrap gap-2">
              {content.facts.map((fact) => (
                <span key={fact} className="inline-flex items-center gap-2 rounded-full border border-white bg-white/75 px-4 py-2 text-xs text-[#506671]">
                  <Check className="h-3.5 w-3.5 text-[#4f8298]" />
                  {fact}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {isContact ? (
        <section className="py-16 sm:py-24">
          <div className="mx-auto grid max-w-[1180px] gap-5 px-5 sm:px-8 lg:grid-cols-[.7fr_1.3fr] lg:px-12">
            <aside className="rounded-[24px] bg-[#242424] p-8 text-white">
              <Mail className="h-6 w-6 text-[#B4D9EF]" />
              <p className="mt-8 text-xs uppercase tracking-[0.18em] text-[#B4D9EF]">
                {locale === 'de' ? 'Direkter Kontakt' : 'Direct contact'}
              </p>
              <h2 className="mt-3 text-2xl">info@autorell.com</h2>
              <p className="mt-4 text-sm leading-7 text-white/60">
                {locale === 'de'
                  ? 'Für Händlerzugang, Fahrzeuge, Export und laufende Vorgänge.'
                  : 'For dealer access, vehicles, export and active transactions.'}
              </p>
            </aside>
            <div className="overflow-hidden rounded-[24px] border border-[#e0ded7] shadow-[0_24px_70px_rgba(32,33,36,.08)]">
              <ContactForm locale={locale} />
            </div>
          </div>
        </section>
      ) : (
        <section className="py-16 sm:py-24">
          <div className={`mx-auto grid max-w-[1320px] gap-4 px-5 sm:px-8 lg:px-12 ${isLegal ? 'lg:grid-cols-1' : 'md:grid-cols-2'}`}>
            {content.sections.map((section, index) => {
              const Icon = isLegal
                ? [LockKeyhole, FileCheck2, ShieldCheck, Banknote][index % 4]
                : icons[index % icons.length]

              if (isFaq) {
                return (
                  <details key={section.title} className="group rounded-[20px] border border-[#deddd7] bg-white p-6 open:shadow-[0_18px_50px_rgba(32,33,36,.06)] md:col-span-2">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-xl font-semibold tracking-[-0.03em]">
                      {section.title}
                      <CircleHelp className="h-5 w-5 shrink-0 text-[#66899a]" />
                    </summary>
                    <p className="mt-5 max-w-4xl text-sm leading-7 text-[#68767c]">{section.text}</p>
                  </details>
                )
              }

              return (
                <article key={section.title} className={`rounded-[22px] border border-[#deddd7] bg-white p-7 shadow-[0_18px_55px_rgba(32,33,36,.045)] ${isLegal ? 'mx-auto w-full max-w-[980px]' : 'min-h-[270px]'}`}>
                  <div className="flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-[#dceefa] text-[#294b5c]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-[10px] tracking-[0.16em] text-[#9aa3a6]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h2 className="mt-8 text-2xl tracking-[-0.035em]">{section.title}</h2>
                  <p className="mt-4 text-sm leading-7 text-[#68767c]">{section.text}</p>
                </article>
              )
            })}
          </div>
        </section>
      )}

      {!isContact && !isLegal && (
        <section className="px-5 pb-16 sm:px-8 sm:pb-24 lg:px-12">
          <div className="mx-auto max-w-[1120px] rounded-[26px] bg-[#B4D9EF] px-6 py-12 text-center sm:px-12 sm:py-16">
            <BadgeCheck className="mx-auto h-7 w-7" />
            <h2 className="mx-auto mt-5 max-w-3xl text-[34px] leading-[1.06] tracking-[-0.05em] sm:text-5xl">
              {locale === 'de'
                ? 'Bereit für Ihren Zugang zum schwedischen Fahrzeugmarkt?'
                : 'Ready to access selected Swedish vehicle supply?'}
            </h2>
            <Link href="/dealer-apply" className="mt-8 inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#242424] px-8 text-sm font-medium text-white">
              {locale === 'de' ? 'Händlerzugang beantragen' : 'Apply for dealer access'}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      <PublicFooter locale={locale} />
    </main>
  )
}
