import Link from 'next/link'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import BrandLogo from '@/app/components/BrandLogo'
import PrintContractButton from './PrintContractButton'

type ContractDocument = {
  id: string
  deal_id: string
  document_type: string
  version: number
  status: string
  template_version: string
  snapshot: Record<string, unknown>
  content_hash: string
  created_at: string
  final_approved_at?: string | null
}

type Party = {
  legal_name?: string | null
  email?: string | null
  phone?: string | null
  registration_number?: string | null
  vat_number?: string | null
  registered_address?: string | null
  country_code?: string | null
}

type Vehicle = {
  reg?: string | null
  make?: string | null
  model?: string | null
  model_year?: string | null
  miles?: string | null
  vin?: string | null
  fuel_type?: string | null
  gearbox?: string | null
  damage?: string | null
  damage_description?: string | null
  finance_status?: string | null
  finance_provider?: string | null
  finance_settlement_amount?: number | string | null
  finance_release_reference?: string | null
}

type Pricing = {
  pricing_model?: string
  currency?: string
  winning_bid_amount?: number | string
  seller_net_amount?: number | string
  commission_amount?: number | string
  inspection_fee?: number | string
  transport_fee?: number | string
  export_document_fee?: number | string
  buyer_total_amount?: number | string
}

type DealSnapshot = {
  origin_country?: string | null
  origin_city?: string | null
  origin_postal_code?: string | null
  destination_country?: string | null
  destination_city?: string | null
  destination_postal_code?: string | null
  inspection_fee?: number | string | null
  inspection_name?: string | null
}

type ContractTerm = {
  title?: string
  text?: string
}

const documentNames: Record<string, string> = {
  seller_purchase_agreement: 'Köpeavtal för fordon',
  buyer_resale_agreement: 'Vehicle Sale Agreement',
}

function objectValue<T>(snapshot: Record<string, unknown>, key: string): T {
  return (snapshot[key] || {}) as T
}

export default function ContractDocumentView({
  document,
  backHref,
}: {
  document: ContractDocument
  backHref: string
}) {
  const snapshot = document.snapshot || {}
  const isSellerAgreement =
    document.document_type === 'seller_purchase_agreement'
  const language = isSellerAgreement ? 'sv' : 'en'
  const copy = contractCopy[language]
  const money = new Intl.NumberFormat(language === 'sv' ? 'sv-SE' : 'en-IE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  })
  const vehicle = objectValue<Vehicle>(snapshot, 'vehicle')
  const pricing = objectValue<Pricing>(snapshot, 'pricing')
  const inferredTradeMargin =
    Math.abs(
      Number(pricing.buyer_total_amount || 0) -
        (Number(pricing.winning_bid_amount || 0) +
          Number(pricing.transport_fee || 0) +
          Number(pricing.export_document_fee || 0))
    ) < 0.01
  const isTradeMarginPricing =
    pricing.pricing_model === 'trade_margin_v1' || inferredTradeMargin
  const deal = objectValue<DealSnapshot>(snapshot, 'deal')
  const autorell = objectValue<Party>(snapshot, 'autorell')
  const seller = objectValue<Party>(snapshot, 'seller')
  const buyer = objectValue<Party>(snapshot, 'buyer')
  const snapshotTerms = Array.isArray(snapshot.terms)
    ? snapshot.terms.filter(
        (item): item is ContractTerm =>
          Boolean(item) &&
          typeof item === 'object' &&
          typeof (item as ContractTerm).title === 'string' &&
          typeof (item as ContractTerm).text === 'string'
      )
    : []
  const counterparty = isSellerAgreement ? seller : buyer
  const counterpartyTitle = isSellerAgreement ? copy.seller : copy.buyer
  const blockers = Array.isArray(snapshot.blockers)
    ? snapshot.blockers.filter((item): item is string => typeof item === 'string')
    : []
  const ready = document.status === 'ready'
  const finalApproved = Boolean(document.final_approved_at)
  const sentOrSigned = ['sent', 'signed'].includes(document.status)

  return (
    <main className="contract-review mx-auto max-w-[1100px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <div className="contract-toolbar mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm text-[#62686c]"
        >
          <ArrowLeft size={16} />
          {copy.back}
        </Link>
        <PrintContractButton locale={language} />
      </div>

      <article className="contract-sheet relative overflow-hidden bg-white">
        {!sentOrSigned && !finalApproved && (
          <div className="contract-watermark" aria-hidden="true">
            {copy.watermark}
          </div>
        )}

        <header className="contract-document-header">
          <BrandLogo />
          <div className="contract-reference">
            <p>{copy.documentReference}</p>
            <strong>{document.id.slice(0, 8).toUpperCase()}</strong>
            <span>
              {copy.version} {document.version}
            </span>
          </div>
        </header>

        <section className="contract-title-block">
          <p className="contract-kicker">{copy.kicker}</p>
          <h1>{documentNames[document.document_type] || 'Vehicle Agreement'}</h1>
          <p>
            {copy.dealReference} {document.deal_id} · {copy.generated}{' '}
            {new Date(document.created_at).toLocaleDateString(
              language === 'sv' ? 'sv-SE' : 'en-GB',
              {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              }
            )}
          </p>
        </section>

        {!sentOrSigned && (
          <section className={`contract-notice ${ready ? 'contract-notice-ready' : ''}`}>
            <strong>
              {finalApproved ? copy.finalVersion : copy.draft}
            </strong>
            <p>
              {finalApproved
                ? copy.finalNotice
                : ready
                ? copy.readyNotice
                : copy.incompleteNotice}
            </p>
          </section>
        )}

        <section className="contract-section">
          <SectionHeading number="01" title={copy.parties} />
          <div className="contract-party-grid">
            <PartyCard title="Autorell" party={autorell} copy={copy} />
            <PartyCard
              title={counterpartyTitle}
              party={counterparty}
              copy={copy}
            />
          </div>
        </section>

        <section className="contract-section">
          <SectionHeading number="02" title={copy.vehicle} />
          <dl className="contract-data-grid">
            <Data label={copy.registration} value={vehicle.reg} important />
            <Data
              label={copy.makeModel}
              value={[vehicle.make, vehicle.model].filter(Boolean).join(' ')}
              important
            />
            <Data label={copy.modelYear} value={vehicle.model_year} />
            <Data label={copy.mileage} value={vehicle.miles} />
            <Data label="VIN" value={vehicle.vin} />
            <Data label={copy.fuel} value={vehicle.fuel_type} />
            <Data label={copy.transmission} value={vehicle.gearbox} />
            <Data label={copy.declaredCondition} value={vehicle.damage} />
            <Data
              label={copy.financeStatus}
              value={formatFinanceStatus(vehicle.finance_status, language)}
            />
            {isSellerAgreement && (
              <Data
                label={copy.financeProvider}
                value={vehicle.finance_provider}
              />
            )}
          </dl>
          {vehicle.damage_description && (
            <div className="contract-note">
              <span>{copy.conditionNotes}</span>
              <p>{vehicle.damage_description}</p>
            </div>
          )}
        </section>

        <section className="contract-section">
          <SectionHeading number="03" title={copy.commercialTerms} />
          <div className="contract-price-box">
            {document.document_type === 'seller_purchase_agreement' ? (
              <>
                <PriceLine
                  label={copy.sellerPrice}
                  value={pricing.seller_net_amount}
                  primary
                  money={money}
                />
                {!isTradeMarginPricing && (
                  <PriceLine
                    label={copy.winningBid}
                    value={pricing.winning_bid_amount}
                    money={money}
                  />
                )}
              </>
            ) : (
              <>
                <PriceLine
                  label="Vehicle price"
                  value={pricing.winning_bid_amount}
                  money={money}
                />
                {!isTradeMarginPricing && (
                  <>
                    <PriceLine
                      label="Autorell buyer fee"
                      value={pricing.commission_amount}
                      money={money}
                    />
                    <PriceLine
                      label={
                        deal.inspection_name || 'Autorell Verified Inspection'
                      }
                      value={pricing.inspection_fee || deal.inspection_fee}
                      money={money}
                    />
                  </>
                )}
                <PriceLine
                  label="Transport"
                  value={pricing.transport_fee}
                  money={money}
                />
                <PriceLine
                  label="Export and documentation"
                  value={pricing.export_document_fee}
                  money={money}
                />
                <PriceLine
                  label="Total payable by buyer"
                  value={pricing.buyer_total_amount}
                  primary
                  money={money}
                />
              </>
            )}
            <p className="contract-currency">
              {copy.currency}: {pricing.currency || 'EUR'}
            </p>
            <p className="contract-currency">
              {copy.route}:{' '}
              {formatLocation(
                deal.origin_city,
                deal.origin_postal_code,
                deal.origin_country,
                copy.pending
              )}{' '}
              →{' '}
              {formatLocation(
                deal.destination_city,
                deal.destination_postal_code,
                deal.destination_country,
                copy.pending
              )}
            </p>
          </div>
        </section>

        <section className="contract-section">
          <SectionHeading number="04" title={copy.framework} />
          <div className="contract-clauses">
            {(snapshotTerms.length > 0
              ? snapshotTerms
              : legacyTerms[language]
            ).map((term) => (
              <Clause
                key={term.title}
                title={term.title || ''}
                text={term.text || ''}
              />
            ))}
          </div>
        </section>

        <section className="contract-section">
          <SectionHeading number="05" title={copy.signatures} />
          <p className="contract-signature-intro">{copy.signatureIntro}</p>
          <div className="contract-signature-grid">
            <SignatureBox
              title="Autorell"
              name={autorell.legal_name}
              copy={copy}
            />
            <SignatureBox
              title={counterpartyTitle}
              name={counterparty.legal_name}
              copy={copy}
            />
          </div>
        </section>

        {blockers.length > 0 && (
          <section className="contract-section contract-blockers">
            <SectionHeading number="06" title={copy.outstanding} />
            <ul>
              {blockers.map((blocker) => (
                <li key={blocker}>{blocker.replaceAll('_', ' ')}</li>
              ))}
            </ul>
          </section>
        )}

        <footer className="contract-integrity">
          <ShieldCheck size={19} />
          <div>
            <strong>{copy.integrity}</strong>
            <p>SHA-256 {document.content_hash}</p>
            <p>
              {copy.template} {document.template_version} · {copy.status}{' '}
              {copy.statusValues[document.status as keyof typeof copy.statusValues] ||
                document.status}
              {document.final_approved_at
                ? ` · ${copy.approved} ${new Date(document.final_approved_at).toLocaleString(language === 'sv' ? 'sv-SE' : 'en-GB')}`
                : ''}
            </p>
          </div>
        </footer>
      </article>
    </main>
  )
}

const contractCopy = {
  sv: {
    back: 'Tillbaka till avtal',
    documentReference: 'Dokumentreferens',
    version: 'Version',
    kicker: 'Autorell transaktionsavtal',
    dealReference: 'Affärsreferens',
    generated: 'Skapat',
    finalVersion: 'SLUTLIG VERSION - KLAR FÖR SIGNERING',
    draft: 'UTKAST - EJ FÖR SIGNERING',
    finalNotice: 'Autorells säljare har slutfört och låst denna dokumentversion för signering. Avtalet blir bindande när nödvändiga signaturer har slutförts.',
    readyNotice: 'Nödvändiga affärsuppgifter är kompletta. Autorells säljare kan nu slutföra versionen för signering.',
    incompleteNotice: 'Nödvändiga affärsuppgifter saknas. Dokumentet har ingen signeringsverkan.',
    parties: 'Avtalsparter',
    seller: 'Säljare',
    buyer: 'Köpare',
    vehicle: 'Fordon',
    registration: 'Registreringsnummer',
    makeModel: 'Märke och modell',
    modelYear: 'Årsmodell',
    mileage: 'Mätarställning',
    fuel: 'Bränsle',
    transmission: 'Växellåda',
    declaredCondition: 'Deklarerat skick',
    financeStatus: 'Ägande och finansiering',
    financeProvider: 'Finansbolag',
    conditionNotes: 'Anteckningar om skick',
    commercialTerms: 'Kommersiella villkor',
    sellerPrice: 'Köpeskilling till säljaren',
    winningBid: 'Vinnande bud från bilhandlare',
    currency: 'Valuta',
    route: 'Sträcka',
    framework: 'Avtalsvillkor',
    signatures: 'Signering',
    signatureIntro: 'Genom signering bekräftar parterna att de har läst avtalet och accepterar fordonet, priset och villkoren i denna låsta dokumentversion.',
    signature: 'Signatur',
    printedName: 'Namnförtydligande',
    datePlace: 'Ort och datum',
    outstanding: 'Uppgifter som saknas',
    integrity: 'Dokumentets integritet',
    template: 'Mall',
    status: 'Status',
    approved: 'Slutfört',
    watermark: 'UTKAST',
    statusValues: {
      draft: 'utkast',
      ready: 'klart för granskning',
      sent: 'skickat',
      signed: 'signerat',
      void: 'ersatt',
    },
    registrationNo: 'Organisations-/personnummer',
    vatNo: 'Momsnummer',
    pending: 'Uppgift saknas',
  },
  en: {
    back: 'Back to contracts',
    documentReference: 'Document reference',
    version: 'Version',
    kicker: 'Autorell transaction document',
    dealReference: 'Deal reference',
    generated: 'Generated',
    finalVersion: 'FINAL VERSION - READY FOR SIGNATURE',
    draft: 'DRAFT - NOT FOR SIGNATURE',
    finalNotice: 'Autorell sales has completed and locked this document version for signature. The agreement becomes binding when the required signatures are completed.',
    readyNotice: 'Required transaction data is complete. Autorell sales can now finalize this version for signature.',
    incompleteNotice: 'Required transaction information is incomplete. This document has no signing effect.',
    parties: 'Contracting parties',
    seller: 'Seller',
    buyer: 'Buyer',
    vehicle: 'Vehicle',
    registration: 'Registration',
    makeModel: 'Make and model',
    modelYear: 'Model year',
    mileage: 'Mileage',
    fuel: 'Fuel',
    transmission: 'Transmission',
    declaredCondition: 'Declared condition',
    financeStatus: 'Ownership and finance',
    financeProvider: 'Finance provider',
    conditionNotes: 'Condition notes',
    commercialTerms: 'Commercial terms',
    sellerPrice: 'Purchase price payable to seller',
    winningBid: 'Winning dealer bid',
    currency: 'Currency',
    route: 'Route',
    framework: 'Transaction framework',
    signatures: 'Signatures',
    signatureIntro: 'By signing, the parties confirm that they have reviewed and accept the vehicle, price and terms recorded in this locked document version.',
    signature: 'Signature',
    printedName: 'Printed name',
    datePlace: 'Place and date',
    outstanding: 'Outstanding information',
    integrity: 'Document integrity record',
    template: 'Template',
    status: 'Status',
    approved: 'Finalized',
    watermark: 'DRAFT',
    statusValues: {
      draft: 'draft',
      ready: 'ready',
      sent: 'sent',
      signed: 'signed',
      void: 'void',
    },
    registrationNo: 'Registration no.',
    vatNo: 'VAT no.',
    pending: 'Information pending',
  },
} as const

const legacyTerms: Record<'sv' | 'en', ContractTerm[]> = {
  sv: [
    {
      title: 'Fordon och uppgifter',
      text: 'Fordonets identitet, mätarställning, deklarerade skick och stödjande information i dokumentet ingår i affärens underlag.',
    },
    {
      title: 'Betalning och slutförande',
      text: 'Betalning, hämtning, utlämning av handlingar och slutförande följer Autorells slutligt godkända transaktionsvillkor och kontrollkrav.',
    },
  ],
  en: [
    {
      title: 'Vehicle and disclosures',
      text: 'The vehicle identity, mileage, declared condition and supporting information shown in this document form part of the transaction record.',
    },
    {
      title: 'Payment and completion',
      text: "Payment, collection, document release and completion are subject to Autorell's final approved transaction terms and verification requirements.",
    },
  ],
}

function formatLocation(
  city?: string | null,
  postalCode?: string | null,
  country?: string | null,
  fallback = 'Pending'
) {
  return [postalCode, city, country].filter(Boolean).join(' ') || fallback
}

function formatFinanceStatus(
  status?: string | null,
  language: 'sv' | 'en' = 'en'
) {
  if (!status) return null
  const labels = {
    sv: {
      owned_outright: 'Fullt betald',
      vehicle_finance: 'Fordonskredit eller avbetalning',
      unsecured_loan: 'Privatlån utan bilen som säkerhet',
      leasing: 'Leasing',
      unknown: 'Inte verifierat',
    },
    en: {
      owned_outright: 'Owned outright',
      vehicle_finance: 'Vehicle finance or hire purchase',
      unsecured_loan: 'Unsecured personal loan',
      leasing: 'Lease',
      unknown: 'Not verified',
    },
  } as const
  return labels[language][status as keyof (typeof labels)[typeof language]] || status
}

function SectionHeading({ number, title }: { number: string; title: string }) {
  return (
    <div className="contract-section-heading">
      <span>{number}</span>
      <h2>{title}</h2>
    </div>
  )
}

function PartyCard({
  title,
  party,
  copy,
}: {
  title: string
  party: Party
  copy: (typeof contractCopy)[keyof typeof contractCopy]
}) {
  return (
    <section className="contract-party-card">
      <p className="contract-party-label">{title}</p>
      <h3>{party.legal_name || copy.pending}</h3>
      {party.registration_number && (
        <p>
          {copy.registrationNo} {party.registration_number}
        </p>
      )}
      {party.vat_number && (
        <p>
          {copy.vatNo} {party.vat_number}
        </p>
      )}
      {party.registered_address && <p>{party.registered_address}</p>}
      {party.country_code && <p>{party.country_code}</p>}
      {party.email && <p>{party.email}</p>}
      {party.phone && <p>{party.phone}</p>}
    </section>
  )
}

function Data({ label, value, important = false }: { label: string; value?: string | number | null; important?: boolean }) {
  if (!value) return null
  return (
    <div className={important ? 'contract-data-important' : ''}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

function PriceLine({
  label,
  value,
  primary = false,
  money,
}: {
  label: string
  value?: string | number | null
  primary?: boolean
  money: Intl.NumberFormat
}) {
  return (
    <div className={primary ? 'contract-price-primary' : ''}>
      <span>{label}</span>
      <strong>{money.format(Number(value || 0))}</strong>
    </div>
  )
}

function Clause({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  )
}

function SignatureBox({
  title,
  name,
  copy,
}: {
  title: string
  name?: string | null
  copy: (typeof contractCopy)[keyof typeof contractCopy]
}) {
  return (
    <div className="contract-signature-box">
      <p className="contract-party-label">{title}</p>
      <p className="contract-signature-name">{name || copy.pending}</p>
      <div className="contract-signature-line">{copy.signature}</div>
      <div className="contract-signature-line">{copy.printedName}</div>
      <div className="contract-signature-line">{copy.datePlace}</div>
    </div>
  )
}
