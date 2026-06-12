import Link from 'next/link'
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  CarFront,
  CheckCircle2,
  Cookie,
  FileCheck2,
  Gavel,
  LockKeyhole,
  Scale,
  ShieldCheck,
  Truck,
} from 'lucide-react'
import {
  DEALER_TERMS_EFFECTIVE_DATE,
  DEALER_TERMS_VERSION,
} from '@/lib/legal'

const sections = [
  { href: '#dealer-terms', label: 'Dealer Terms' },
  { href: '#binding-bids', label: 'Binding Bids' },
  { href: '#fees', label: 'Fees & Pricing' },
  { href: '#payments', label: 'Payments' },
  { href: '#transport', label: 'Transport & Export' },
  { href: '#cancellations', label: 'Cancellations' },
  { href: '#privacy', label: 'Privacy' },
  { href: '#cookies', label: 'Cookies' },
  { href: '#complaints', label: 'Complaints' },
]

export default function DealerLegalPage() {
  return (
    <main className="bg-[#f5f4f0] text-[#242424]">
      <section className="border-b border-[#deddd7] bg-white">
        <div className="mx-auto max-w-[1180px] px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#687176]">
                Autorell Dealer Portal
              </p>
              <h1 className="text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
                Legal Center
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[#62686c]">
                The commercial and operational rules governing dealer accounts,
                auctions, binding bids, fees, payments and cross-border vehicle
                transactions on Autorell.
              </p>
            </div>
            <div className="rounded-[18px] border border-[#c9e3f2] bg-[#eff8fd] px-5 py-4 text-sm">
              <p className="font-semibold">{DEALER_TERMS_VERSION}</p>
              <p className="mt-1 text-[#62686c]">
                Effective {DEALER_TERMS_EFFECTIVE_DATE}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1180px] gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-12 lg:py-14">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <nav className="rounded-[20px] border border-[#deddd7] bg-white p-3 shadow-[0_12px_40px_rgba(32,33,36,.05)]">
            {sections.map((section) => (
              <a
                key={section.href}
                href={section.href}
                className="flex items-center justify-between rounded-[12px] px-4 py-3 text-sm text-[#62686c] transition hover:bg-[#eff8fd] hover:text-[#242424]"
              >
                {section.label}
                <ArrowRight size={14} />
              </a>
            ))}
          </nav>
        </aside>

        <div className="space-y-7">
          <div className="flex gap-3 rounded-[18px] border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
            <AlertTriangle className="mt-0.5 shrink-0" size={20} />
            <p>
              <strong>Launch requirement:</strong> this is Autorell&apos;s
              operational legal draft. A qualified Swedish/EU commercial
              lawyer must approve the final wording, company registration
              number, registered address, governing law and payment-provider
              setup before commercial launch.
            </p>
          </div>

          <LegalSection
            id="dealer-terms"
            eyebrow="01"
            title="Dealer Terms & Conditions"
            icon={<FileCheck2 size={22} />}
          >
            <p>
              These terms apply to professional vehicle dealers and authorised
              representatives using the Autorell Dealer Portal. The service is
              provided by Autorell AB, Sweden (&quot;Autorell&quot;).
            </p>
            <RuleList
              items={[
                'The account may only be used for professional business purposes by authorised representatives.',
                'Registration details, VAT number, contact information and beneficial ownership information must be accurate and kept current.',
                'Accounts are personal to the approved dealer organisation and may not be transferred or shared with unauthorised persons.',
                'Autorell may request identity, company, sanctions, VAT and source-of-funds checks before allowing bids or completing a transaction.',
                'After seller acceptance, Autorell may use separate transaction agreements with the seller and the winning buyer. The signed documents determine the contracting parties, transfer structure, fees, ownership and risk.',
                'Vehicle information is based on seller declarations, available records and inspections. Dealers must review all disclosed information before bidding.',
                'English is the controlling platform language unless a signed transaction document expressly provides otherwise.',
              ]}
            />
          </LegalSection>

          <LegalSection
            id="binding-bids"
            eyebrow="02"
            title="Binding Bid Rules"
            icon={<Gavel size={22} />}
          >
            <p>
              A submitted bid is a binding purchase offer from the dealer. The
              auction normally remains open for 24 hours from the vehicle
              profile&apos;s recorded creation time.
            </p>
            <RuleList
              items={[
                'Bids cannot be edited, reduced or deleted after submission.',
                'The highest valid bid at closing becomes the provisional winning bid. If equal bids exist, the earliest valid bid takes priority.',
                'The seller may accept or reject the provisional winning bid. No sale is completed merely because an auction closes.',
                'The winning bid remains binding for 48 hours after auction closing unless a different period is shown before bidding.',
                'After seller acceptance, the dealer must complete requested verification, sign the transaction documents and transfer the complete confirmed buyer total to Autorell within the stated deadline.',
                'A dealer may dispute its obligation only where vehicle information was materially incorrect, the vehicle cannot lawfully be transferred, or Autorell confirms another contractual exception.',
                'Autorell may invalidate bids affected by technical errors, fraud, collusion, sanctions restrictions or an unauthorised account.',
              ]}
            />
          </LegalSection>

          <LegalSection
            id="fees"
            eyebrow="03"
            title="Buyer Fee & Pricing Policy"
            icon={<Banknote size={22} />}
          >
            <p>
              All auction amounts and platform charges are denominated and
              settled in EUR unless Autorell expressly confirms otherwise.
            </p>
            <div className="my-6 overflow-hidden rounded-[16px] border border-[#d7e8f2]">
              <PriceRow label="Winning bid" value="Example: €20,000" />
              <PriceRow label="Autorell buyer fee" value="3%, minimum €750" />
              <PriceRow label="Autorell Verified Inspection" value="€249" />
              <PriceRow label="Transport estimate" value="From €850" />
              <PriceRow label="Export & documentation" value="€250" />
            </div>
            <RuleList
              items={[
                'The buyer fee is calculated as the greater of 3% of the winning bid or €750.',
                'The bidding interface displays an estimated buyer total before submission.',
                'Transport is initially estimated from €850 and is confirmed according to the exact collection city, delivery city, vehicle dimensions, accessibility and carrier availability.',
                'The €250 documentation charge covers standard transaction and Swedish export administration. Government, customs, tax, registration or exceptional third-party charges may be additional.',
                'VAT and other taxes depend on the parties, vehicle tax status, route and applicable law. The final invoice and transaction documents control.',
              ]}
            />
          </LegalSection>

          <LegalSection
            id="payments"
            eyebrow="04"
            title="Payments & Funding"
            icon={<ShieldCheck size={22} />}
          >
            <RuleList
              items={[
                'The buyer must pay the complete confirmed total by the deadline shown in the transaction workspace or invoice.',
                'Vehicle-sized payments should normally be made by verified SEPA bank transfer through Autorell or its regulated payment partner.',
                'Cleared buyer funds are required before Autorell collects or inspects the vehicle for completion. Receipt of funds does not by itself complete the vehicle sale.',
                'Autorell may delay collection, document release, completion or seller payout until cleared funds, identity checks, required documents and the vehicle inspection are confirmed.',
                'Dealers are responsible for bank charges, currency conversion costs, taxes and payment-provider fees attributable to their payment.',
                'A payment reference must match the relevant deal. Payments from unverified third parties may be rejected or returned.',
                'Refunds, where due, are made to the verified originating payment account after permitted deductions.',
              ]}
            />
          </LegalSection>

          <LegalSection
            id="transport"
            eyebrow="05"
            title="Transport, Inspection & Export"
            icon={<Truck size={22} />}
          >
            <RuleList
              items={[
                'Transport prices are estimates until the exact route and collection conditions are confirmed.',
                'The Autorell Verified Inspection compares the vehicle with the seller declaration and normally covers identity, VIN, mileage, warning indicators, drivability, principal functions, visible condition, tyres, brakes where reasonably assessable, keys and disclosed faults.',
                'The inspection is non-destructive, reflects the vehicle at the time of inspection and does not constitute an unlimited mechanical warranty or guarantee against latent defects.',
                'The seller must make the vehicle, keys, registration documents and disclosed accessories available at the agreed collection time.',
                'Vehicle condition, mileage and visible damage may be recorded at collection through photographs and a handover report.',
                'If a discrepancy is found, Autorell may pause completion while the evidence and commercial impact are assessed.',
                'A revised price or other adjustment is effective only when documented and accepted by the required parties. Autorell is not required to complete a materially different transaction.',
                'Risk and responsibility transfer at the point stated in the signed purchase and logistics documents.',
                'The buyer remains responsible for destination-country registration, local taxes, technical approval and compliance unless expressly included in writing.',
                'Delays caused by authorities, carriers, weather, incomplete documents or incorrect party information do not automatically create liability for Autorell.',
              ]}
            />
          </LegalSection>

          <LegalSection
            id="cancellations"
            eyebrow="06"
            title="Cancellation, Default & Suspension"
            icon={<Scale size={22} />}
          >
            <RuleList
              items={[
                'A binding bid cannot be cancelled merely because the dealer changes its mind, finds another vehicle or cannot arrange onward resale.',
                'Failure to sign, pay or collect on time may constitute dealer default.',
                'Autorell may recover documented losses, third-party costs and unpaid fees caused by a default, subject to the final approved terms and applicable law.',
                'Autorell may suspend bidding privileges while a payment, compliance, fraud or contractual issue is investigated.',
                'A transaction may be cancelled where the seller rejects the bid, ownership cannot be verified, the vehicle differs materially from its description, payment fails, or completion would be unlawful.',
                'Where Autorell cancels because of a material or unresolved vehicle discrepancy, buyer funds received for that transaction are returned to the verified originating account, subject only to deductions expressly permitted by the signed agreement and applicable law.',
              ]}
            />
          </LegalSection>

          <LegalSection
            id="privacy"
            eyebrow="07"
            title="Dealer Privacy Notice"
            icon={<LockKeyhole size={22} />}
          >
            <p>
              Autorell processes dealer account and transaction information to
              operate the marketplace, verify participants, prevent fraud,
              conclude transactions and comply with legal obligations.
            </p>
            <RuleList
              items={[
                'Data may include identity and company details, contact data, VAT information, bids, transaction history, device and security logs, signatures, payment references and support communications.',
                'Processing is based on contract performance, legitimate interests, legal obligations and consent where applicable.',
                'Information may be shared with sellers, payment and identity providers, signing providers, carriers, professional advisers, authorities and infrastructure suppliers where necessary.',
                'Customer contact details are not disclosed to dealers during public bidding. Required party details may be released after acceptance where necessary to complete the transaction.',
                'Data is retained only as long as required for accounts, transactions, accounting, disputes, fraud prevention and legal compliance.',
                'Eligible persons may request access, correction, deletion, restriction, portability or objection, subject to legal limitations.',
              ]}
            />
            <ContactBox />
          </LegalSection>

          <LegalSection
            id="cookies"
            eyebrow="08"
            title="Cookie Policy"
            icon={<Cookie size={22} />}
          >
            <RuleList
              items={[
                'Essential authentication and security cookies are required to keep dealer sessions secure and do not depend on optional analytics consent.',
                'Preference cookies may remember language, interface and consent choices.',
                'Analytics, marketing or other non-essential cookies must not be activated before the required consent has been collected.',
                'Dealers can remove stored cookies through their browser. Blocking essential cookies may prevent login and portal functionality.',
                'The production cookie inventory must list each cookie, provider, purpose and retention period before non-essential tracking is enabled.',
              ]}
            />
          </LegalSection>

          <LegalSection
            id="complaints"
            eyebrow="09"
            title="Complaints & Disputes"
            icon={<CarFront size={22} />}
          >
            <RuleList
              items={[
                'Dealers should report transaction complaints promptly through Dealer Support and include the deal ID, evidence and requested outcome.',
                'Vehicle-condition complaints must be documented before repair, resale, dismantling or material alteration wherever reasonably possible.',
                'The parties must first attempt good-faith commercial resolution through Autorell.',
                'The final approved terms must specify governing law, competent courts and any agreed arbitration or alternative dispute process.',
                'The former EU Online Dispute Resolution platform is not referenced because it was discontinued in 2025.',
              ]}
            />
            <ContactBox />
          </LegalSection>

          <div className="rounded-[20px] bg-[#242424] p-7 text-white sm:p-9">
            <CheckCircle2 className="text-[#B4D9EF]" size={28} />
            <h2 className="mt-5 text-2xl font-semibold">
              Questions about these rules?
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">
              Contact Autorell before placing a bid if any fee, vehicle detail
              or transaction requirement is unclear.
            </p>
            <Link
              href="mailto:info@autorell.com"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#B4D9EF] px-5 py-3 text-sm font-medium text-[#242424]"
            >
              Contact Dealer Support
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

function LegalSection({
  id,
  eyebrow,
  title,
  icon,
  children,
}: {
  id: string
  eyebrow: string
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      className="scroll-mt-28 rounded-[22px] border border-[#deddd7] bg-white p-6 shadow-[0_12px_40px_rgba(32,33,36,.045)] sm:p-8"
    >
      <div className="mb-6 flex items-start gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-[#B4D9EF]">
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7b8285]">
            Section {eyebrow}
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.025em]">
            {title}
          </h2>
        </div>
      </div>
      <div className="space-y-5 text-sm leading-7 text-[#555d61]">
        {children}
      </div>
    </section>
  )
}

function RuleList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#7fb8d8]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function PriceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-5 border-b border-[#e6ecef] px-4 py-3.5 text-sm last:border-0">
      <span className="text-[#62686c]">{label}</span>
      <strong className="text-right font-semibold text-[#242424]">
        {value}
      </strong>
    </div>
  )
}

function ContactBox() {
  return (
    <div className="rounded-[14px] border border-[#d7e8f2] bg-[#eff8fd] px-5 py-4">
      <p className="font-semibold text-[#242424]">Legal and privacy contact</p>
      <p className="mt-1">
        Autorell AB, Sweden ·{' '}
        <a className="underline" href="mailto:info@autorell.com">
          info@autorell.com
        </a>
      </p>
    </div>
  )
}
