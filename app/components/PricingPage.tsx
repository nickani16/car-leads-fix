'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Check, ChevronDown, Info, Mail, X } from 'lucide-react'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'
import PricingAnchorScroll from '@/app/components/PricingAnchorScroll'
import {
  currencyForMarket,
  formatMoneyMinor,
  type BillingMarket,
} from '@/lib/billing/product-catalog'
import {
  businessSubscriptionCopy,
  businessSubscriptionPlans,
  getBusinessPlanProduct,
  localeToIntl,
  type BillingPeriod,
  type BusinessSubscriptionPlan,
} from '@/lib/business-subscription-plans'
import { localizePublicHref, translationLocale, translatePublicObject, type PublicLocale } from '@/lib/public-i18n'

type PricingPageProps = {
  locale: PublicLocale
  market: BillingMarket
  marketCode?: string
}

type BusinessFaqCopy = {
  faqEyebrow: string
  faqTitle: string
  faqIntro: string
  faqs: Array<{ question: string; answer: string }>
  contactEyebrow: string
  contactTitle: string
  contactText: string
  contactCta: string
}

const businessFaqCopyByLocale: Record<string, BusinessFaqCopy> = {
  en: {
    faqEyebrow: 'Questions for businesses',
    faqTitle: 'FAQ for dealers and companies',
    faqIntro: 'Short answers about plans, inventory limits, users, imports and support.',
    faqs: [
      { question: 'Which plan should a smaller dealer choose?', answer: 'Starter is built for companies that want a professional company page and up to 25 active listings without a larger team setup.' },
      { question: 'When does Growth make sense?', answer: 'Growth fits teams that publish continuously, need up to 100 active listings and want several users working in the same company account.' },
      { question: 'Can Autorell handle larger inventories?', answer: 'Yes. Professional supports up to 500 active listings, more users, reports, export and stronger follow-up for larger stock.' },
      { question: 'Do you support inventory import?', answer: 'Import and more automated inventory flows are handled in the higher plans and can be tailored for Enterprise customers.' },
      { question: 'Can chains, importers or multi-location companies use Autorell?', answer: 'Yes. Enterprise is adapted for companies with several locations, custom integration needs, larger teams or a separate commercial agreement.' },
    ],
    contactEyebrow: 'Need help choosing?',
    contactTitle: 'Questions about business plans?',
    contactText: 'Tell us about your inventory, market and team. We will help you choose the right setup for your company.',
    contactCta: 'Contact us',
  },
  sv: {
    faqEyebrow: 'Frågor för företag',
    faqTitle: 'FAQ för handlare och företag',
    faqIntro: 'Korta svar om planer, annonsgränser, användare, import och support.',
    faqs: [
      { question: 'Vilken plan passar en mindre handlare?', answer: 'Starter passar företag som vill ha en professionell företagssida och upp till 25 aktiva annonser utan ett större teamupplägg.' },
      { question: 'När är Growth rätt val?', answer: 'Growth passar team som publicerar löpande, behöver upp till 100 aktiva annonser och vill att flera användare arbetar i samma företagskonto.' },
      { question: 'Kan Autorell hantera större lager?', answer: 'Ja. Professional stödjer upp till 500 aktiva annonser, fler användare, rapporter, export och bättre uppföljning för större lager.' },
      { question: 'Stödjer ni lagerimport?', answer: 'Import och mer automatiserade lagerflöden ingår i de högre planerna och kan anpassas för Enterprise-kunder.' },
      { question: 'Kan kedjor, importörer eller företag med flera anläggningar använda Autorell?', answer: 'Ja. Enterprise anpassas för företag med flera anläggningar, egna integrationsbehov, större team eller separat kommersiellt avtal.' },
    ],
    contactEyebrow: 'Behöver ni hjälp att välja?',
    contactTitle: 'Har ni frågor om företagsplaner?',
    contactText: 'Berätta om ert lager, er marknad och ert team. Vi hjälper er välja rätt upplägg för företaget.',
    contactCta: 'Kontakta oss',
  },
  de: {
    faqEyebrow: 'Fragen für Unternehmen',
    faqTitle: 'FAQ für Händler und Unternehmen',
    faqIntro: 'Kurze Antworten zu Tarifen, Anzeigenlimits, Nutzern, Importen und Support.',
    faqs: [
      { question: 'Welcher Tarif passt zu kleineren Händlern?', answer: 'Starter eignet sich für Unternehmen, die eine professionelle Unternehmensseite und bis zu 25 aktive Anzeigen ohne größeren Teamaufbau benötigen.' },
      { question: 'Wann ist Growth sinnvoll?', answer: 'Growth passt zu Teams, die laufend veröffentlichen, bis zu 100 aktive Anzeigen benötigen und mit mehreren Nutzern im selben Unternehmenskonto arbeiten.' },
      { question: 'Kann Autorell größere Bestände verwalten?', answer: 'Ja. Professional unterstützt bis zu 500 aktive Anzeigen, mehr Nutzer, Berichte, Export und bessere Nachverfolgung für größere Bestände.' },
      { question: 'Unterstützen Sie Bestandsimport?', answer: 'Importe und stärker automatisierte Bestandsabläufe sind in den höheren Tarifen enthalten und können für Enterprise-Kunden angepasst werden.' },
      { question: 'Können Ketten, Importeure oder Unternehmen mit mehreren Standorten Autorell nutzen?', answer: 'Ja. Enterprise wird für Unternehmen mit mehreren Standorten, eigenen Integrationsanforderungen, größeren Teams oder separater kommerzieller Vereinbarung angepasst.' },
    ],
    contactEyebrow: 'Hilfe bei der Auswahl?',
    contactTitle: 'Fragen zu Unternehmenstarifen?',
    contactText: 'Beschreiben Sie Bestand, Markt und Team. Wir helfen beim passenden Setup für Ihr Unternehmen.',
    contactCta: 'Kontakt aufnehmen',
  },
  fr: {
    faqEyebrow: 'Questions pour les entreprises',
    faqTitle: 'FAQ pour distributeurs et entreprises',
    faqIntro: 'Réponses courtes sur les offres, limites d’annonces, utilisateurs, imports et support.',
    faqs: [
      { question: 'Quelle offre convient à un petit distributeur ?', answer: 'Starter convient aux entreprises qui veulent une page professionnelle et jusqu’à 25 annonces actives sans organisation d’équipe complexe.' },
      { question: 'Quand choisir Growth ?', answer: 'Growth convient aux équipes qui publient régulièrement, ont besoin de 100 annonces actives maximum et travaillent à plusieurs dans le même compte entreprise.' },
      { question: 'Autorell peut-il gérer de grands stocks ?', answer: 'Oui. Professional prend en charge jusqu’à 500 annonces actives, plus d’utilisateurs, rapports, export et suivi renforcé.' },
      { question: 'L’import de stock est-il pris en charge ?', answer: 'Les imports et flux de stock plus automatisés sont inclus dans les offres supérieures et peuvent être adaptés pour Enterprise.' },
      { question: 'Les réseaux, importateurs ou sociétés multi-sites peuvent-ils utiliser Autorell ?', answer: 'Oui. Enterprise est adapté aux sociétés avec plusieurs sites, besoins d’intégration spécifiques, équipes plus larges ou accord commercial séparé.' },
    ],
    contactEyebrow: 'Besoin d’aide pour choisir ?',
    contactTitle: 'Des questions sur les offres entreprise ?',
    contactText: 'Parlez-nous de votre stock, de votre marché et de votre équipe. Nous vous aidons à choisir la bonne configuration.',
    contactCta: 'Nous contacter',
  },
  es: {
    faqEyebrow: 'Preguntas para empresas',
    faqTitle: 'FAQ para concesionarios y empresas',
    faqIntro: 'Respuestas breves sobre planes, límites de anuncios, usuarios, importaciones y soporte.',
    faqs: [
      { question: '¿Qué plan conviene a un concesionario pequeño?', answer: 'Starter está pensado para empresas que quieren una página profesional y hasta 25 anuncios activos sin una configuración amplia de equipo.' },
      { question: '¿Cuándo tiene sentido Growth?', answer: 'Growth encaja con equipos que publican de forma continua, necesitan hasta 100 anuncios activos y trabajan con varios usuarios en la misma cuenta de empresa.' },
      { question: '¿Autorell puede gestionar inventarios grandes?', answer: 'Sí. Professional admite hasta 500 anuncios activos, más usuarios, informes, exportación y mejor seguimiento para inventarios grandes.' },
      { question: '¿Admiten importación de inventario?', answer: 'La importación y los flujos de inventario más automatizados están incluidos en los planes superiores y pueden adaptarse para Enterprise.' },
      { question: '¿Pueden usar Autorell grupos, importadores o empresas con varias sedes?', answer: 'Sí. Enterprise se adapta a empresas con varias sedes, necesidades de integración propias, equipos grandes o un acuerdo comercial separado.' },
    ],
    contactEyebrow: '¿Necesitas ayuda para elegir?',
    contactTitle: '¿Tienes preguntas sobre planes de empresa?',
    contactText: 'Cuéntanos sobre tu inventario, mercado y equipo. Te ayudamos a elegir la configuración adecuada.',
    contactCta: 'Contactar',
  },
  it: {
    faqEyebrow: 'Domande per aziende',
    faqTitle: 'FAQ per rivenditori e aziende',
    faqIntro: 'Risposte brevi su piani, limiti annunci, utenti, importazioni e supporto.',
    faqs: [
      { question: 'Quale piano scegliere per un rivenditore piccolo?', answer: 'Starter è pensato per aziende che vogliono una pagina professionale e fino a 25 annunci attivi senza un’organizzazione ampia del team.' },
      { question: 'Quando ha senso Growth?', answer: 'Growth è adatto a team che pubblicano continuamente, hanno bisogno di fino a 100 annunci attivi e lavorano con più utenti nello stesso account aziendale.' },
      { question: 'Autorell può gestire inventari grandi?', answer: 'Sì. Professional supporta fino a 500 annunci attivi, più utenti, report, export e un follow-up più completo.' },
      { question: 'Supportate l’importazione dell’inventario?', answer: 'Importazioni e flussi inventario più automatizzati sono inclusi nei piani superiori e possono essere adattati per Enterprise.' },
      { question: 'Gruppi, importatori o aziende multi-sede possono usare Autorell?', answer: 'Sì. Enterprise viene adattato ad aziende con più sedi, esigenze di integrazione specifiche, team più grandi o accordo commerciale separato.' },
    ],
    contactEyebrow: 'Serve aiuto per scegliere?',
    contactTitle: 'Domande sui piani aziendali?',
    contactText: 'Raccontaci inventario, mercato e team. Ti aiutiamo a scegliere la configurazione giusta.',
    contactCta: 'Contattaci',
  },
  nl: {
    faqEyebrow: 'Vragen voor bedrijven',
    faqTitle: 'FAQ voor dealers en bedrijven',
    faqIntro: 'Korte antwoorden over plannen, advertentielimieten, gebruikers, import en support.',
    faqs: [
      { question: 'Welk plan past bij een kleinere dealer?', answer: 'Starter is bedoeld voor bedrijven die een professionele bedrijfspagina en tot 25 actieve advertenties willen zonder uitgebreide teaminrichting.' },
      { question: 'Wanneer is Growth logisch?', answer: 'Growth past bij teams die doorlopend publiceren, tot 100 actieve advertenties nodig hebben en met meerdere gebruikers in hetzelfde bedrijfsaccount werken.' },
      { question: 'Kan Autorell grotere voorraden beheren?', answer: 'Ja. Professional ondersteunt tot 500 actieve advertenties, meer gebruikers, rapporten, export en betere opvolging.' },
      { question: 'Ondersteunen jullie voorraadimport?', answer: 'Import en meer geautomatiseerde voorraadstromen zitten in de hogere plannen en kunnen voor Enterprise worden aangepast.' },
      { question: 'Kunnen ketens, importeurs of bedrijven met meerdere vestigingen Autorell gebruiken?', answer: 'Ja. Enterprise wordt aangepast voor bedrijven met meerdere vestigingen, eigen integratiebehoeften, grotere teams of een aparte commerciële overeenkomst.' },
    ],
    contactEyebrow: 'Hulp nodig bij kiezen?',
    contactTitle: 'Vragen over zakelijke plannen?',
    contactText: 'Vertel ons over je voorraad, markt en team. We helpen je de juiste inrichting kiezen.',
    contactCta: 'Contact opnemen',
  },
  fi: {
    faqEyebrow: 'Kysymyksiä yrityksille',
    faqTitle: 'FAQ jälleenmyyjille ja yrityksille',
    faqIntro: 'Lyhyet vastaukset paketeista, ilmoitusrajoista, käyttäjistä, tuonneista ja tuesta.',
    faqs: [
      { question: 'Mikä paketti sopii pienemmälle jälleenmyyjälle?', answer: 'Starter sopii yrityksille, jotka haluavat ammattimaisen yrityssivun ja enintään 25 aktiivista ilmoitusta ilman laajaa tiimirakennetta.' },
      { question: 'Milloin Growth on oikea valinta?', answer: 'Growth sopii tiimeille, jotka julkaisevat jatkuvasti, tarvitsevat enintään 100 aktiivista ilmoitusta ja työskentelevät samalla yritystilillä.' },
      { question: 'Voiko Autorell hallita suurempia varastoja?', answer: 'Kyllä. Professional tukee enintään 500 aktiivista ilmoitusta, useampia käyttäjiä, raportteja, vientiä ja parempaa seurantaa.' },
      { question: 'Tuetteko varaston tuontia?', answer: 'Tuonti ja automatisoidummat varastovirrat sisältyvät ylempiin paketteihin ja voidaan räätälöidä Enterprise-asiakkaille.' },
      { question: 'Voivatko ketjut, maahantuojat tai monen toimipisteen yritykset käyttää Autorellia?', answer: 'Kyllä. Enterprise räätälöidään yrityksille, joilla on useita toimipisteitä, omia integraatiotarpeita, suurempia tiimejä tai erillinen kaupallinen sopimus.' },
    ],
    contactEyebrow: 'Tarvitsetteko apua valintaan?',
    contactTitle: 'Kysymyksiä yrityspaketeista?',
    contactText: 'Kertokaa varastosta, markkinasta ja tiimistä. Autamme valitsemaan oikean kokonaisuuden.',
    contactCta: 'Ota yhteyttä',
  },
  da: {
    faqEyebrow: 'Spørgsmål for virksomheder',
    faqTitle: 'FAQ for forhandlere og virksomheder',
    faqIntro: 'Korte svar om planer, annoncegrænser, brugere, import og support.',
    faqs: [
      { question: 'Hvilken plan passer til en mindre forhandler?', answer: 'Starter passer til virksomheder, der ønsker en professionel virksomhedsside og op til 25 aktive annoncer uden et større teamsetup.' },
      { question: 'Hvornår giver Growth mening?', answer: 'Growth passer til teams, der publicerer løbende, har brug for op til 100 aktive annoncer og arbejder med flere brugere på samme virksomhedskonto.' },
      { question: 'Kan Autorell håndtere større lagre?', answer: 'Ja. Professional understøtter op til 500 aktive annoncer, flere brugere, rapporter, eksport og bedre opfølgning.' },
      { question: 'Understøtter I lagerimport?', answer: 'Import og mere automatiserede lagerflows indgår i de højere planer og kan tilpasses Enterprise-kunder.' },
      { question: 'Kan kæder, importører eller virksomheder med flere lokationer bruge Autorell?', answer: 'Ja. Enterprise tilpasses virksomheder med flere lokationer, egne integrationsbehov, større teams eller separat kommerciel aftale.' },
    ],
    contactEyebrow: 'Brug for hjælp til at vælge?',
    contactTitle: 'Spørgsmål om virksomhedsplaner?',
    contactText: 'Fortæl os om lager, marked og team. Vi hjælper jer med at vælge den rigtige opsætning.',
    contactCta: 'Kontakt os',
  },
  pl: {
    faqEyebrow: 'Pytania dla firm',
    faqTitle: 'FAQ dla dealerów i firm',
    faqIntro: 'Krótkie odpowiedzi o planach, limitach ogłoszeń, użytkownikach, imporcie i wsparciu.',
    faqs: [
      { question: 'Jaki plan wybrać dla mniejszego dealera?', answer: 'Starter jest dla firm, które chcą profesjonalnej strony firmowej i do 25 aktywnych ogłoszeń bez rozbudowanej konfiguracji zespołu.' },
      { question: 'Kiedy Growth ma sens?', answer: 'Growth pasuje do zespołów, które publikują regularnie, potrzebują do 100 aktywnych ogłoszeń i pracują z wieloma użytkownikami na jednym koncie firmowym.' },
      { question: 'Czy Autorell obsługuje większe zapasy?', answer: 'Tak. Professional obsługuje do 500 aktywnych ogłoszeń, więcej użytkowników, raporty, eksport i lepsze monitorowanie.' },
      { question: 'Czy wspieracie import zapasów?', answer: 'Import i bardziej zautomatyzowane przepływy zapasów są dostępne w wyższych planach i mogą być dostosowane dla klientów Enterprise.' },
      { question: 'Czy sieci, importerzy lub firmy z wieloma lokalizacjami mogą używać Autorell?', answer: 'Tak. Enterprise jest dostosowywany do firm z wieloma lokalizacjami, własnymi potrzebami integracji, większymi zespołami lub osobną umową handlową.' },
    ],
    contactEyebrow: 'Potrzebujesz pomocy w wyborze?',
    contactTitle: 'Pytania o plany firmowe?',
    contactText: 'Opowiedz nam o zapasach, rynku i zespole. Pomożemy wybrać właściwą konfigurację.',
    contactCta: 'Skontaktuj się',
  },
}

export default function PricingPage({ locale, market, marketCode }: PricingPageProps) {
  const businessCopy = useMemo(() => translatePublicObject(locale, {
    ...businessSubscriptionCopy,
    eyebrow: 'Business plans',
    heading: 'Choose a plan for your company',
    intro: 'Compare the company plans and choose monthly or annual billing. All prices are shown in the local currency for the selected market.',
    noCheckout: 'Create a business account to activate a plan.',
  }), [locale])
  const faqCopy = businessFaqCopyByLocale[translationLocale(locale)] || businessFaqCopyByLocale.en
  const businessPlans = useMemo(() => translatePublicObject(locale, businessSubscriptionPlans), [locale])
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly')
  const businessLocaleTag = localeToIntl(locale)

  return (
    <main className="overflow-x-hidden bg-white text-[#101828] [&_*]:min-w-0">
      <PublicHeader locale={locale} marketCode={marketCode} />
      <PricingAnchorScroll />

      <section id="business" className="scroll-mt-28 overflow-hidden bg-[#f5f7fb] px-5 py-10 sm:px-8 sm:py-14">
        <div className="mx-auto w-full max-w-[1380px]">
          <div className="grid gap-6 border-b border-[#dde6f2] pb-7 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="w-full max-w-full">
              <p className="text-xs font-bold uppercase tracking-[.2em] text-[#0866ff]">{businessCopy.eyebrow}</p>
              <h1 className="mt-3 max-w-full break-words text-[34px] font-semibold leading-tight tracking-[-.04em] text-[#101828] sm:text-[48px]">
                {businessCopy.heading}
              </h1>
              <p className="mt-4 max-w-[330px] text-base leading-7 text-[#5f6b7a] sm:max-w-3xl">{businessCopy.intro}</p>
            </div>
            <div className="w-full max-w-full overflow-hidden rounded-[14px] border border-[#d8e2f0] bg-white p-2 shadow-[0_18px_46px_rgba(16,24,40,.06)] lg:w-[430px]">
              <div className="grid grid-cols-2 rounded-[10px] bg-[#eef3f9] p-1">
                <button
                  type="button"
                  onClick={() => setBillingPeriod('monthly')}
                  className={`min-h-11 min-w-0 rounded-[8px] px-2 text-[11px] font-bold leading-tight transition sm:text-sm ${
                    billingPeriod === 'monthly' ? 'bg-white text-[#101828] shadow-sm' : 'text-[#667085] hover:text-[#101828]'
                  }`}
                >
                  {businessCopy.monthly}
                </button>
                <button
                  type="button"
                  onClick={() => setBillingPeriod('annual')}
                  className={`min-h-11 min-w-0 rounded-[8px] px-2 text-[11px] font-bold leading-tight transition sm:text-sm ${
                    billingPeriod === 'annual' ? 'bg-white text-[#101828] shadow-sm' : 'text-[#667085] hover:text-[#101828]'
                  }`}
                >
                  {businessCopy.annual}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 xl:grid-cols-5">
            {businessPlans.map((plan) => (
              <PublicBusinessPlanCard
                key={plan.key}
                plan={plan}
                billingPeriod={billingPeriod}
                market={market}
                localeTag={businessLocaleTag}
                copy={businessCopy}
              />
            ))}
          </div>
          <p className="mt-6 text-sm font-medium text-[#667085]">{businessCopy.noCheckout}</p>
        </div>
      </section>

      <section className="bg-white px-5 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto grid max-w-[1120px] gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[#0866ff]">{faqCopy.faqEyebrow}</p>
            <h2 className="mt-3 text-[30px] font-semibold leading-tight tracking-[-.04em] text-[#101828] sm:text-[40px]">
              {faqCopy.faqTitle}
            </h2>
            <p className="mt-4 text-base leading-7 text-[#667085]">{faqCopy.faqIntro}</p>
          </div>
          <div className="space-y-3">
            {faqCopy.faqs.map((item, index) => (
              <details
                key={item.question}
                className="group rounded-[12px] border border-[#d9e2ef] bg-[#f8fafc] shadow-[0_14px_34px_rgba(16,24,40,.035)] open:bg-white"
                open={index === 0}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-[#101828] marker:hidden">
                  <span>{item.question}</span>
                  <ChevronDown className="h-5 w-5 shrink-0 text-[#667085] transition group-open:rotate-180 group-open:text-[#0866ff]" />
                </summary>
                <div className="border-t border-[#e4ebf5] px-5 pb-5 pt-4 text-sm leading-7 text-[#667085]">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-14 sm:px-8 sm:pb-20">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-5 rounded-[14px] border border-[#d8e2f0] bg-[#f5f9ff] p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[#0866ff]">{faqCopy.contactEyebrow}</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-.035em] text-[#101828]">{faqCopy.contactTitle}</h2>
            <p className="mt-3 text-sm leading-6 text-[#667085]">{faqCopy.contactText}</p>
          </div>
          <Link
            href={localizePublicHref(locale, '/contact')}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] bg-[#0866ff] px-5 text-sm font-bold text-white transition hover:bg-[#075ce5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0866ff]/20"
          >
            <Mail className="h-4 w-4" />
            {faqCopy.contactCta}
          </Link>
        </div>
      </section>

      <PublicFooter locale={locale} />
    </main>
  )
}

function PublicBusinessPlanCard({
  plan,
  billingPeriod,
  market,
  localeTag,
  copy,
}: {
  plan: BusinessSubscriptionPlan
  billingPeriod: BillingPeriod
  market: BillingMarket
  localeTag: string
  copy: typeof businessSubscriptionCopy & {
    noCheckout: string
    eyebrow: string
    heading: string
    intro: string
  }
}) {
  const product = getBusinessPlanProduct(plan.key, billingPeriod)
  const annualProduct = getBusinessPlanProduct(plan.key, 'annual')
  const currency = currencyForMarket(market)
  const price = product?.amountMinor[currency] ?? null
  const annualPrice = annualProduct?.amountMinor[currency] ?? null
  const monthlyEquivalent = annualPrice ? Math.round(annualPrice / 12) : null
  const showAnnualBadge = billingPeriod === 'annual' && !plan.enterprise && plan.key !== 'free'

  return (
    <article
      className={`relative flex min-h-[590px] flex-col rounded-[12px] border bg-white shadow-[0_18px_50px_rgba(16,24,40,.055)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(16,24,40,.08)] ${
        plan.recommended ? 'border-[#0866ff] ring-2 ring-[#0866ff]/10' : 'border-[#d9e2ef]'
      }`}
    >
      <div className="flex min-h-[250px] flex-col border-b border-[#edf1f7] p-5">
        <div className="flex min-h-12 flex-col items-start gap-2">
          <p className="min-w-0 text-[11px] font-bold uppercase leading-4 tracking-[.14em] text-[#667085]">{plan.audience}</p>
          {plan.recommended ? (
            <span className="shrink-0 whitespace-nowrap rounded-full border border-[#0866ff] px-2.5 py-1 text-[10px] font-black uppercase tracking-[.06em] text-[#0866ff]">
              {copy.recommended}
            </span>
          ) : showAnnualBadge ? (
            <span className="shrink-0 whitespace-nowrap rounded-full bg-[#eef5ff] px-2.5 py-1 text-[10px] font-black uppercase tracking-[.06em] text-[#0866ff]">
              {copy.annualBadge}
            </span>
          ) : null}
        </div>

        <h3 className="mt-4 text-2xl font-semibold tracking-[-.035em] text-[#101828]">{plan.name}</h3>
        <div className="mt-5">
          {plan.enterprise ? (
            <p className="text-[28px] font-semibold tracking-[-.045em] text-[#101828]">{copy.contactUs}</p>
          ) : (
            <>
              <p className="text-[30px] font-semibold tracking-[-.05em] text-[#101828]">
                {formatBusinessPrice(price || 0, currency, localeTag)}
                <span className="text-sm font-semibold tracking-normal text-[#667085]">
                  {billingPeriod === 'annual' && plan.key !== 'free' ? copy.perYear : copy.perMonth}
                </span>
              </p>
              {billingPeriod === 'annual' && plan.key !== 'free' && monthlyEquivalent ? (
                <p className="mt-1 text-xs font-semibold text-[#667085]">
                  {copy.annualEquivalent} {formatBusinessPrice(monthlyEquivalent, currency, localeTag)}{copy.perMonth}
                </p>
              ) : (
                <p className="mt-1 text-xs text-[#667085]">{copy.exclVat}</p>
              )}
            </>
          )}
        </div>
        <p className="mt-4 rounded-[8px] border border-[#dfe6f1] bg-[#f8fafc] px-3 py-2 text-sm font-bold text-[#344054]">
          {plan.limit}
        </p>
        <p className="mt-4 text-sm leading-6 text-[#5f6b7a]">{plan.summary}</p>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-black uppercase tracking-[.14em] text-[#101828]">{copy.included}</p>
        <ul className="mt-4 space-y-3">
          {plan.features.map((feature) => (
            <li key={feature.label} className="flex items-start gap-2 text-sm">
              <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${feature.included ? 'bg-[#eef5ff] text-[#0866ff]' : 'bg-[#f2f4f7] text-[#98a2b3]'}`}>
                {feature.included ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
              </span>
              <span className={feature.included ? 'text-[#344054]' : 'text-[#98a2b3]'}>
                {feature.label}
                <span className="group relative ml-1 inline-flex align-middle">
                  <button
                    type="button"
                    aria-label={feature.description}
                    className="inline-grid h-4 w-4 place-items-center rounded-full text-[#98a2b3] outline-none transition hover:bg-[#eef5ff] hover:text-[#0866ff] focus:bg-[#eef5ff] focus:text-[#0866ff]"
                  >
                    <Info className="h-3.5 w-3.5" />
                  </button>
                  <span className="pointer-events-none fixed bottom-6 left-4 right-4 z-50 hidden rounded-[8px] border border-[#dbe4f0] bg-white p-3 text-left text-xs leading-5 text-[#475467] shadow-[0_18px_44px_rgba(16,24,40,.16)] group-focus-within:block group-hover:block sm:absolute sm:bottom-full sm:left-auto sm:right-0 sm:mb-2 sm:w-64 sm:translate-x-0">
                    {feature.description}
                  </span>
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}

function formatBusinessPrice(amountMinor: number, currency: ReturnType<typeof currencyForMarket>, locale: string) {
  return formatMoneyMinor(amountMinor, currency, locale).replace(/\s+/g, ' ')
}
