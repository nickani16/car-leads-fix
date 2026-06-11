import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  CircleHelp,
  FileCheck2,
  Globe2,
  LockKeyhole,
  Mail,
  Route,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import ContactForm from '@/app/components/ContactForm'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'
import VehicleLeadForm from '@/app/components/VehicleLeadForm'

type Locale = 'de' | 'en'

type PageContent = {
  title: string
  description: string
  eyebrow: string
  heading: string
  intro: string
  primary?: string
  primaryHref?: string
  sections: Array<{
    title: string
    text: string
    items?: string[]
  }>
}

const pages: Record<Locale, Record<string, PageContent>> = {
  de: {
    'salj-bil': {
      title: 'Fahrzeug über Autorell verkaufen',
      description:
        'Fahrzeugdaten kostenlos übermitteln und das Fahrzeug professionellen Käufern im europäischen Autorell-Netzwerk präsentieren.',
      eyebrow: 'Fahrzeug verkaufen',
      heading: 'Verkaufen Sie Ihr Fahrzeug an professionelle Käufer.',
      intro:
        'Übermitteln Sie die wichtigsten Fahrzeugdaten. Im Formular sehen Sie die Anforderungen an Modelljahr, Laufleistung, Standort und technischen Zustand.',
      sections: [],
    },
    'trygg-affar': {
      title: 'Sicherer Fahrzeugverkauf mit Autorell',
      description:
        'Erfahren Sie, wie Autorell Daten, Gebote, Fahrzeugprüfung, Vertrag, Zahlung und Übergabe bei einem Fahrzeugverkauf absichert.',
      eyebrow: 'Sicherheit in jedem Schritt',
      heading: 'Verstehen Sie den Ablauf, bevor Sie zustimmen.',
      intro:
        'Autorell trennt Fahrzeugdaten, personenbezogene Daten und Entscheidungen. So bleibt transparent, wer welche Informationen sieht und wann der Verkauf fortgesetzt wird.',
      primary: 'Händlerzugang beantragen',
      primaryHref: '/dealer-apply',
      sections: [
        {
          title: 'Kontaktdaten bleiben geschützt',
          text: 'Telefonnummer und E-Mail werden während der Gebotsphase nicht für Händler angezeigt.',
        },
        {
          title: 'Verifizierte professionelle Käufer',
          text: 'Nur geprüfte Unternehmen mit aktivem Händlerkonto können am Marktplatz teilnehmen.',
        },
        {
          title: 'Ein gemeinsamer Fahrzeugbericht',
          text: 'Bilder, Historie, Zustand und bekannte Mängel bilden die Grundlage für jedes Angebot.',
        },
        {
          title: 'Klare Entscheidungspunkte',
          text: 'Angebote, Bedingungen und die nächsten Schritte werden vor einer verbindlichen Entscheidung dargestellt.',
        },
        {
          title: 'Prüfung vor Abschluss',
          text: 'Das Fahrzeug wird vor dem endgültigen Abschluss mit der abgegebenen Erklärung verglichen.',
        },
        {
          title: 'Dokumentierte Übergabe',
          text: 'Vertrag, Zahlungsstatus, Abholung und Export werden nachvollziehbar koordiniert.',
        },
      ],
    },
    'vanliga-fragor': {
      title: 'Häufige Fragen zu Autorell',
      description:
        'Antworten zu schwedischen Fahrzeugen, Händlerzugang, Geboten, Prüfung, Zahlung, Abholung und Export über Autorell.',
      eyebrow: 'Hilfe und Antworten',
      heading: 'Was möchten Sie über Autorell wissen?',
      intro:
        'Hier finden professionelle Käufer und Partner klare Antworten zum Fahrzeugangebot und zum grenzüberschreitenden Ablauf.',
      sections: [
        {
          title: 'Woher stammen die Fahrzeuge?',
          text: 'Die Fahrzeuge werden zunächst in Schweden erfasst, qualifiziert und mit strukturierten Zustandsdaten veröffentlicht.',
        },
        {
          title: 'Wer darf Gebote abgeben?',
          text: 'Gebote sind zugelassenen professionellen Käufern mit geprüftem Händlerkonto vorbehalten.',
        },
        {
          title: 'Sind Angebote sofort verbindlich?',
          text: 'Der genaue Status hängt von den Auktionsbedingungen, der Verkäuferentscheidung und der anschließenden Fahrzeugprüfung ab.',
        },
        {
          title: 'Wie funktionieren Zahlung und Abholung?',
          text: 'Zahlungsstatus, Dokumente, Abholung und Transport werden nach Vertragsabschluss im Geschäftsablauf koordiniert.',
        },
        {
          title: 'Was geschieht bei Abweichungen?',
          text: 'Wesentliche Abweichungen zwischen Fahrzeug und Erklärung können das Angebot beeinflussen oder den Abschluss verhindern.',
        },
      ],
    },
    foretag: {
      title: 'Fahrzeugvermarktung für Unternehmen',
      description:
        'Autorell unterstützt Händler, Leasinggesellschaften und Flotten bei der strukturierten Vermarktung von Fahrzeugbeständen in Europa.',
      eyebrow: 'Für professionelle Verkäufer',
      heading: 'Mehr Käufer erreichen und die Kontrolle behalten.',
      intro:
        'Ein strukturierter Remarketing-Prozess für Unternehmen, die ausgewählte Fahrzeuge oder wiederkehrende Bestände professionell vermarkten möchten.',
      primary: 'Unternehmenskontakt',
      primaryHref: '/kontakt',
      sections: [
        {
          title: 'Fahrzeugbestand übermitteln',
          text: 'Teilen Sie Volumen, Fahrzeugtypen, Standorte und den gewünschten Zeitplan.',
        },
        {
          title: 'Portfolio qualifizieren',
          text: 'Autorell bewertet, welche Fahrzeuge zur aktuellen professionellen Nachfrage passen.',
        },
        {
          title: 'Relevante Käufer aktivieren',
          text: 'Ausgewählte Fahrzeuge werden mit vergleichbaren Daten für geeignete Märkte veröffentlicht.',
        },
        {
          title: 'Angebote vergleichen',
          text: 'Ihr Unternehmen behält die Entscheidung darüber, welche Angebote weitergeführt werden.',
        },
        {
          title: 'Mit einem Pilotprojekt starten',
          text: 'Beginnen Sie mit einer ausgewählten Fahrzeuggruppe und skalieren Sie anhand realer Ergebnisse.',
        },
      ],
    },
    'for-handlare': {
      title: 'Schwedische Fahrzeuge für Autohändler',
      description:
        'Zugang zu ausgewählten schwedischen Fahrzeugen, strukturierten Zustandsdaten und transparenten Gebotsprozessen für Händler.',
      eyebrow: 'Autorell Dealer Network',
      heading: 'Ausgewählte Fahrzeuge. Klarere Entscheidungen.',
      intro:
        'Professionelle Käufer erhalten Zugang zu qualifizierten Fahrzeugen aus Schweden und einem Ablauf für grenzüberschreitenden Handel.',
      primary: 'Händlerzugang beantragen',
      primaryHref: '/dealer-apply',
      sections: [
        {
          title: 'Ausgewählte schwedische Fahrzeuge',
          text: 'Ein fokussiertes Angebot aus Privatfahrzeugen, Inzahlungnahmen, Leasingrückläufern und Flotten.',
        },
        {
          title: 'Strukturierte Fahrzeugdaten',
          text: 'Zustand, Historie, Bilder, Ausstattung und bekannte Mängel werden einheitlich dargestellt.',
        },
        {
          title: 'Transparente Gebotsregeln',
          text: 'Aktive Zeitfenster, dokumentierte Gebote und klare Bedingungen vor der Teilnahme.',
        },
        {
          title: 'Verifizierte Parteien',
          text: 'Händlerkonten werden geprüft und Transaktionen folgen definierten Kontrollpunkten.',
        },
        {
          title: 'Transport und Export',
          text: 'Zahlung, Abholung, Dokumente und Lieferung werden in einem gemeinsamen Ablauf koordiniert.',
        },
      ],
    },
    'om-oss': {
      title: 'Über Autorell und unsere Plattform',
      description:
        'Lernen Sie Autorell und unsere Plattform für strukturierte Fahrzeugdaten, professionelle Gebote und europäischen Fahrzeughandel kennen.',
      eyebrow: 'Über Autorell',
      heading: 'Fahrzeughandel braucht bessere Daten und größere Reichweite.',
      intro:
        'Autorell entwickelt einen digitalen Prozess, der ausgewählte schwedische Fahrzeuge mit verifizierten professionellen Käufern in Europa verbindet.',
      sections: [
        {
          title: 'Qualifizierte Fahrzeuge',
          text: 'Klare Kriterien für Modelljahr, Laufleistung, Standort und technischen Zustand.',
        },
        {
          title: 'Korrekte Zustandsangaben',
          text: 'Strukturierte Fahrzeugdaten schaffen eine bessere Grundlage für Bewertung und Gebot.',
        },
        {
          title: 'Europäische Nachfrage',
          text: 'Schweden ist der erste Angebotsmarkt, professionelle Käufer können in mehreren Ländern aktiv sein.',
        },
        {
          title: 'Ein zusammenhängender Prozess',
          text: 'Qualifizierung, Gebot, Vertrag, Prüfung, Zahlung und Logistik erhalten einen gemeinsamen Status.',
        },
      ],
    },
    kontakt: {
      title: 'Autorell kontaktieren',
      description:
        'Kontaktieren Sie Autorell zu Händlerzugang, Fahrzeugen, laufenden Vorgängen, Unternehmenslösungen oder technischem Support.',
      eyebrow: 'Kontakt',
      heading: 'Wie können wir Ihnen helfen?',
      intro:
        'Ob Händlerzugang, ein laufender Vorgang oder eine Unternehmensanfrage: Unser Team hilft Ihnen beim nächsten Schritt.',
      sections: [],
    },
    integritet: {
      title: 'Datenschutzerklärung von Autorell',
      description:
        'Informationen zur Verarbeitung personenbezogener Daten, zu Empfängern, Rechtsgrundlagen, Speicherdauer und Ihren Rechten.',
      eyebrow: 'Rechtliche Informationen',
      heading: 'Datenschutzerklärung',
      intro:
        'Welche personenbezogenen Daten Autorell verarbeitet, warum sie benötigt werden und wann sie mit Dienstleistern oder Vertragspartnern geteilt werden.',
      sections: [
        {
          title: 'Verantwortlicher',
          text: 'Autorell AB in Schweden ist für die Verarbeitung verantwortlich. Datenschutzanfragen richten Sie an info@autorell.com.',
        },
        {
          title: 'Verarbeitete Daten',
          text: 'Kontakt-, Unternehmens-, Fahrzeug-, Kommunikations-, Vertrags-, Zahlungs- und Sicherheitsdaten, soweit sie für den Dienst erforderlich sind.',
        },
        {
          title: 'Zwecke und Rechtsgrundlagen',
          text: 'Die Daten werden zur Bereitstellung des Dienstes, zur Vertragsdurchführung, zur Erfüllung rechtlicher Pflichten und zum Schutz berechtigter Interessen verarbeitet.',
        },
        {
          title: 'Empfänger',
          text: 'Erforderliche Daten können mit zugelassenen Käufern, Hosting-, Zahlungs-, Signatur-, Sicherheits-, Transport- und Beratungsdienstleistern geteilt werden.',
        },
        {
          title: 'Ihre Rechte',
          text: 'Sie können Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit oder Widerspruch verlangen, soweit die gesetzlichen Voraussetzungen erfüllt sind.',
        },
      ],
    },
    villkor: {
      title: 'Nutzungsbedingungen für Autorell',
      description:
        'Bedingungen für Fahrzeugprofile, Händlergebote, Verkäuferentscheidungen, Fahrzeugprüfung, Verträge, Zahlung und Abholung.',
      eyebrow: 'Rechtliche Informationen',
      heading: 'Nutzungsbedingungen',
      intro:
        'Die wichtigsten Regeln für die Nutzung von Autorell und für die Teilnahme an einem Fahrzeuggeschäft.',
      sections: [
        {
          title: 'Dienst und Teilnahme',
          text: 'Autorell ermöglicht die strukturierte Präsentation von Fahrzeugen und Angebote zugelassener professioneller Käufer.',
        },
        {
          title: 'Richtigkeit der Angaben',
          text: 'Fahrzeugidentität, Laufleistung, Historie, Schäden, Finanzierung, Ausstattung und Zustand müssen vollständig und korrekt angegeben werden.',
        },
        {
          title: 'Gebote und Entscheidungen',
          text: 'Ein Gebot führt nicht automatisch zu einem Kaufvertrag. Verkäuferentscheidung, Prüfungen und gesonderte Transaktionsdokumente können erforderlich sein.',
        },
        {
          title: 'Prüfung und Abweichungen',
          text: 'Wesentliche Abweichungen bei Identität, Eigentum, Dokumenten, Laufleistung oder Zustand können ein Angebot ändern oder ungültig machen.',
        },
        {
          title: 'Zahlung und Übergabe',
          text: 'Parteien, Betrag, Risikoübergang, Zahlung, Abholung, Export und Gebühren werden in den endgültigen Vertragsunterlagen festgelegt.',
        },
      ],
    },
    cookies: {
      title: 'Cookie-Richtlinie von Autorell',
      description:
        'Informationen zu notwendigen Cookies, Sicherheit, Sitzungen, zukünftiger Analyse und Ihren Cookie-Einstellungen bei Autorell.',
      eyebrow: 'Rechtliche Informationen',
      heading: 'Cookie-Richtlinie',
      intro:
        'Autorell verwendet so wenige Cookies wie möglich und aktiviert nicht notwendige Technologien nur mit der gesetzlich erforderlichen Einwilligung.',
      sections: [
        {
          title: 'Was sind Cookies?',
          text: 'Cookies sind kleine Dateien, die eine Website auf Ihrem Gerät speichert oder ausliest.',
        },
        {
          title: 'Notwendige Cookies',
          text: 'Sie unterstützen Anmeldung, Sitzungsverwaltung, Sicherheit und ausdrücklich angeforderte Funktionen.',
        },
        {
          title: 'Analyse und Marketing',
          text: 'Nicht notwendige Analyse- oder Marketingtechnologien werden erst nach klarer Information und erforderlicher Einwilligung aktiviert.',
        },
        {
          title: 'Einstellungen verwalten',
          text: 'Sie können Cookies im Browser löschen oder blockieren. Dadurch können einzelne Funktionen eingeschränkt werden.',
        },
      ],
    },
  },
  en: {
    'salj-bil': {
      title: 'Sell your vehicle through Autorell',
      description:
        'Submit vehicle details free of charge and present the vehicle to professional buyers across the European Autorell network.',
      eyebrow: 'Sell a vehicle',
      heading: 'Sell your vehicle to professional buyers.',
      intro:
        'Submit the essential vehicle details. The form explains the requirements for model year, mileage, location and technical condition.',
      sections: [],
    },
    'trygg-affar': {
      title: 'A safer vehicle transaction with Autorell',
      description:
        'Learn how Autorell protects data and creates a clear process for bids, vehicle checks, contracts, payment and handover.',
      eyebrow: 'Safety at every stage',
      heading: 'Understand the transaction before you agree.',
      intro:
        'Autorell separates vehicle data, personal information and decisions, so every party knows what is visible and what must happen next.',
      primary: 'Apply for dealer access',
      primaryHref: '/dealer-apply',
      sections: [
        {
          title: 'Contact details stay private',
          text: 'Phone numbers and email addresses are not shown to dealers during bidding.',
        },
        {
          title: 'Verified professional buyers',
          text: 'Only approved businesses with an active dealer account can participate.',
        },
        {
          title: 'One shared vehicle declaration',
          text: 'Images, history, condition and known faults form the basis of each offer.',
        },
        {
          title: 'Clear decision points',
          text: 'Offers, conditions and next steps are presented before a binding decision.',
        },
        {
          title: 'Verification before completion',
          text: 'The vehicle is compared with its declaration before the transaction is completed.',
        },
        {
          title: 'Documented handover',
          text: 'Contract, payment status, collection and export are coordinated transparently.',
        },
      ],
    },
    'vanliga-fragor': {
      title: 'Frequently asked questions about Autorell',
      description:
        'Answers about Swedish vehicles, dealer access, bidding, inspection, payment, collection and European export through Autorell.',
      eyebrow: 'Help and answers',
      heading: 'What would you like to know?',
      intro:
        'Clear answers for professional buyers and partners using the Autorell marketplace.',
      sections: [
        {
          title: 'Where are the vehicles located?',
          text: 'Vehicles are initially submitted and qualified in Sweden before being released to approved buyers.',
        },
        {
          title: 'Who can place bids?',
          text: 'Bidding is reserved for approved professional buyers with a verified dealer account.',
        },
        {
          title: 'Are bids immediately binding?',
          text: 'The exact status depends on the auction terms, the seller decision and subsequent vehicle verification.',
        },
        {
          title: 'How do payment and collection work?',
          text: 'Payment status, documents, collection and transport are coordinated after the contractual stage.',
        },
        {
          title: 'What happens if information is inaccurate?',
          text: 'Material differences between the vehicle and its declaration may affect the offer or prevent completion.',
        },
      ],
    },
    foretag: {
      title: 'Vehicle remarketing solutions for businesses',
      description:
        'Autorell helps dealers, leasing companies and fleets market selected vehicle stock through structured data and European demand.',
      eyebrow: 'For professional sellers',
      heading: 'Reach more buyers while retaining control.',
      intro:
        'A structured remarketing workflow for businesses selling selected vehicles or recurring portfolio volume.',
      primary: 'Contact our business team',
      primaryHref: '/kontakt',
      sections: [
        {
          title: 'Share the vehicle portfolio',
          text: 'Provide volume, vehicle types, locations and the preferred timeline.',
        },
        {
          title: 'Qualify the portfolio',
          text: 'Autorell identifies vehicles that match current professional demand.',
        },
        {
          title: 'Activate relevant buyers',
          text: 'Selected vehicles are presented with comparable data in suitable markets.',
        },
        {
          title: 'Compare offers',
          text: 'Your business retains the decision over which offers move forward.',
        },
        {
          title: 'Start with a pilot',
          text: 'Begin with a selected group of vehicles and scale from actual results.',
        },
      ],
    },
    'for-handlare': {
      title: 'Swedish vehicles for professional dealers',
      description:
        'Access selected Swedish vehicles, structured condition data and transparent bidding workflows through the Autorell dealer network.',
      eyebrow: 'Autorell Dealer Network',
      heading: 'Selected vehicles. Clearer decisions.',
      intro:
        'Professional buyers gain access to qualified Swedish vehicles and a workflow designed for cross-border trade.',
      primary: 'Apply for dealer access',
      primaryHref: '/dealer-apply',
      sections: [
        {
          title: 'Selected Swedish vehicles',
          text: 'Focused supply from private vehicles, trade-ins, lease returns and fleets.',
        },
        {
          title: 'Structured vehicle data',
          text: 'Condition, history, images, equipment and known faults are presented consistently.',
        },
        {
          title: 'Transparent bidding rules',
          text: 'Active bidding windows, documented bids and clear conditions before participation.',
        },
        {
          title: 'Verified parties',
          text: 'Dealer accounts are reviewed and transactions follow defined verification stages.',
        },
        {
          title: 'Transport and export',
          text: 'Payment, collection, documents and delivery are coordinated in one workflow.',
        },
      ],
    },
    'om-oss': {
      title: 'About Autorell and our vehicle platform',
      description:
        'Learn about Autorell and our platform for structured vehicle data, professional bidding and European automotive trade.',
      eyebrow: 'About Autorell',
      heading: 'Vehicle trade needs better data and broader reach.',
      intro:
        'Autorell is building a digital workflow connecting selected Swedish vehicles with verified professional buyers across Europe.',
      sections: [
        {
          title: 'Qualified vehicles',
          text: 'Clear criteria for model year, mileage, location and technical condition.',
        },
        {
          title: 'Accurate declarations',
          text: 'Structured vehicle data provides a stronger basis for assessment and bidding.',
        },
        {
          title: 'European demand',
          text: 'Sweden is the initial supply market, while professional buyers may operate across several countries.',
        },
        {
          title: 'One connected workflow',
          text: 'Qualification, bidding, contract, inspection, payment and logistics share a clear status.',
        },
      ],
    },
    kontakt: {
      title: 'Contact the Autorell team',
      description:
        'Contact Autorell about dealer access, vehicles, an existing case, business remarketing solutions or technical support.',
      eyebrow: 'Contact',
      heading: 'How can we help?',
      intro:
        'Whether you need dealer access, assistance with an existing case or a business solution, our team will guide you.',
      sections: [],
    },
    integritet: {
      title: 'Autorell privacy policy',
      description:
        'How Autorell processes personal data, the purposes and legal bases, recipients, retention periods and your privacy rights.',
      eyebrow: 'Legal information',
      heading: 'Privacy policy',
      intro:
        'The personal data Autorell uses, why it is needed and when it may be shared with service providers or transaction parties.',
      sections: [
        {
          title: 'Data controller',
          text: 'Autorell AB in Sweden is the data controller. Privacy requests can be sent to info@autorell.com.',
        },
        {
          title: 'Data we process',
          text: 'Contact, company, vehicle, communication, contract, payment and security data where required for the service.',
        },
        {
          title: 'Purposes and legal bases',
          text: 'Data is processed to provide the service, perform contracts, meet legal obligations and protect legitimate interests.',
        },
        {
          title: 'Recipients',
          text: 'Required data may be shared with approved buyers and hosting, payment, signing, security, transport and advisory providers.',
        },
        {
          title: 'Your rights',
          text: 'You may request access, correction, deletion, restriction, portability or object where the applicable legal conditions are met.',
        },
      ],
    },
    villkor: {
      title: 'Autorell terms of use',
      description:
        'Terms for vehicle profiles, dealer bids, seller decisions, vehicle verification, contracts, payment, collection and export.',
      eyebrow: 'Legal information',
      heading: 'Terms of use',
      intro:
        'The main rules governing use of Autorell and participation in a vehicle transaction.',
      sections: [
        {
          title: 'Service and participation',
          text: 'Autorell enables structured vehicle presentation and offers from approved professional buyers.',
        },
        {
          title: 'Accurate information',
          text: 'Vehicle identity, mileage, history, damage, finance, equipment and condition must be complete and accurate.',
        },
        {
          title: 'Bids and decisions',
          text: 'A bid does not automatically create a purchase agreement. Seller decisions, checks and separate transaction documents may be required.',
        },
        {
          title: 'Verification and discrepancies',
          text: 'Material discrepancies involving identity, ownership, documents, mileage or condition may change or invalidate an offer.',
        },
        {
          title: 'Payment and handover',
          text: 'Parties, amount, risk transfer, payment, collection, export and fees are defined in the final transaction documents.',
        },
      ],
    },
    cookies: {
      title: 'Autorell cookie policy',
      description:
        'Information about essential cookies, security, sessions, future analytics and how to manage cookie settings on Autorell.',
      eyebrow: 'Legal information',
      heading: 'Cookie policy',
      intro:
        'Autorell uses as few cookies as possible and only activates non-essential technologies with legally required consent.',
      sections: [
        {
          title: 'What are cookies?',
          text: 'Cookies are small files that a website stores or reads on your device.',
        },
        {
          title: 'Essential cookies',
          text: 'They support authentication, session management, security and explicitly requested features.',
        },
        {
          title: 'Analytics and marketing',
          text: 'Non-essential analytics or marketing technologies are activated only after clear information and required consent.',
        },
        {
          title: 'Managing settings',
          text: 'You can delete or block cookies in your browser, although some functionality may then be limited.',
        },
      ],
    },
  },
}

const localeConfig = {
  de: {
    host: 'https://www.autorell.de',
    language: 'de-DE',
    contactLabel: 'Direktkontakt',
    contactText: 'Schreiben Sie uns an info@autorell.com oder senden Sie Ihre Anfrage über das Formular.',
    emailLabel: 'E-Mail senden',
  },
  en: {
    host: 'https://www.autorell.com',
    language: 'en',
    contactLabel: 'Direct contact',
    contactText: 'Email info@autorell.com or send your enquiry through the form.',
    emailLabel: 'Send an email',
  },
} as const

export async function generateMetadata({
  params,
}: PageProps<'/intl-market/[locale]/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params
  if ((locale !== 'de' && locale !== 'en') || !pages[locale][slug]) return {}

  const page = pages[locale][slug]
  const config = localeConfig[locale]
  const path = `/${slug}`

  return {
    title: { absolute: page.title },
    description: page.description,
    alternates: {
      canonical: `${config.host}${path}`,
      languages: {
        'sv-SE': `https://www.autorell.se${path}`,
        'de-DE': `https://www.autorell.de${path}`,
        en: `https://www.autorell.com${path}`,
        'x-default': `https://www.autorell.com${path}`,
      },
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url: `${config.host}${path}`,
      siteName: 'Autorell',
      locale: locale === 'de' ? 'de_DE' : 'en_GB',
      type: 'website',
    },
  }
}

export default async function LocalizedPublicPage({
  params,
}: PageProps<'/intl-market/[locale]/[slug]'>) {
  const { locale, slug } = await params
  if ((locale !== 'de' && locale !== 'en') || !pages[locale][slug]) notFound()

  if (slug === 'salj-bil') {
    return <VehicleLeadForm locale={locale} />
  }

  const page = pages[locale][slug]
  const config = localeConfig[locale]
  const isContact = slug === 'kontakt'
  const isFaq = slug === 'vanliga-fragor'
  const isLegal = slug === 'integritet' || slug === 'villkor' || slug === 'cookies'
  const icons = [
    ShieldCheck,
    BadgeCheck,
    FileCheck2,
    Route,
    Globe2,
    Building2,
    LockKeyhole,
    CircleHelp,
  ]

  return (
    <main className="overflow-hidden bg-[#f8f7f3] text-[#202124]">
      <PublicHeader locale={locale} />

      <section className="relative overflow-hidden border-b border-[#dce5e8] bg-[linear-gradient(145deg,#fbf8f1_0%,#eef6f8_58%,#e2f0f5_100%)]">
        <div className="absolute -right-40 -top-52 h-[540px] w-[540px] rounded-full border-[68px] border-white/50" />
        <div className="absolute -bottom-40 left-[20%] h-72 w-72 rounded-full bg-[#b4d9ef]/28 blur-3xl" />
        <div className="relative mx-auto max-w-[1320px] px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#c8dce5] bg-white/70 px-4 py-2 text-xs font-medium text-[#526f7d]">
            <Sparkles className="h-4 w-4" />
            {page.eyebrow}
          </span>
          <h1 className="mt-7 max-w-4xl text-[42px] leading-[1.01] tracking-[-0.052em] sm:text-6xl lg:text-[72px]">
            {page.heading}
          </h1>
          <p className="mt-7 max-w-3xl text-[17px] leading-8 text-[#58707c] sm:text-xl">
            {page.intro}
          </p>
          {page.primary && page.primaryHref && (
            <Link
              href={page.primaryHref}
              className="mt-9 inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#242424] px-7 text-sm font-medium text-white shadow-[0_16px_35px_rgba(32,33,36,.18)]"
            >
              {page.primary}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </section>

      {isContact ? (
        <section className="py-16 sm:py-24">
          <div className="mx-auto grid max-w-[1180px] gap-6 px-5 sm:px-8 lg:grid-cols-[.7fr_1.3fr] lg:px-12">
            <aside className="rounded-[24px] bg-[#242424] p-7 text-white sm:p-9">
              <Mail className="h-6 w-6 text-[#B4D9EF]" />
              <p className="mt-8 text-xs uppercase tracking-[0.18em] text-[#B4D9EF]">
                {config.contactLabel}
              </p>
              <h2 className="mt-3 text-2xl tracking-[-0.035em]">
                info@autorell.com
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/60">
                {config.contactText}
              </p>
              <a
                href="mailto:info@autorell.com"
                className="mt-7 inline-flex items-center gap-2 text-sm"
              >
                {config.emailLabel}
                <ArrowRight className="h-4 w-4" />
              </a>
            </aside>
            <div className="overflow-hidden rounded-[24px] border border-[#e0ded7] shadow-[0_24px_70px_rgba(32,33,36,.08)]">
              <ContactForm locale={locale} />
            </div>
          </div>
        </section>
      ) : (
        <section className="py-16 sm:py-24">
          <div
            className={`mx-auto grid max-w-[1320px] gap-4 px-5 sm:px-8 lg:px-12 ${
              isLegal ? 'lg:grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {page.sections.map((section, index) => {
              const Icon = icons[index % icons.length]
              return isFaq ? (
                <details
                  key={section.title}
                  className="group rounded-[20px] border border-[#deddd7] bg-white p-6 open:shadow-[0_18px_50px_rgba(32,33,36,.06)] md:col-span-2 lg:col-span-3"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-xl font-semibold tracking-[-0.03em]">
                    {section.title}
                    <span className="text-[#7394a3] transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-5 max-w-4xl text-sm leading-7 text-[#68767c]">
                    {section.text}
                  </p>
                </details>
              ) : (
                <article
                  key={section.title}
                  className={`rounded-[22px] border border-[#deddd7] bg-white p-7 shadow-[0_18px_55px_rgba(32,33,36,.045)] ${
                    isLegal ? 'mx-auto w-full max-w-[980px]' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-[#dceefa] text-[#294b5c]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-[10px] tracking-[0.16em] text-[#9aa3a6]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h2 className="mt-7 text-2xl tracking-[-0.035em]">
                    {section.title}
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-[#68767c]">
                    {section.text}
                  </p>
                  {section.items && (
                    <ul className="mt-5 space-y-3">
                      {section.items.map((item) => (
                        <li key={item} className="flex gap-3 text-sm text-[#59666c]">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#4f8298]" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              )
            })}
          </div>
        </section>
      )}

      <PublicFooter locale={locale} />
    </main>
  )
}
