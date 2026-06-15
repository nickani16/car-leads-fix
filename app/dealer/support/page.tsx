'use client'

import { FormEvent, useState } from 'react'
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileSearch,
  Headphones,
  HelpCircle,
  Mail,
  MessageSquareText,
  PackageCheck,
  Ship,
  Truck,
} from 'lucide-react'

const journey = [
  {
    step: '01',
    icon: BadgeCheck,
    title: 'Winning bid confirmed',
    text: 'Autorell confirms the seller decision, buyer total, documents and payment reference.',
    timing: 'Same business day',
  },
  {
    step: '02',
    icon: Banknote,
    title: 'Payment to Autorell',
    text: 'Transfer the complete confirmed amount to Autorell within three business days of the payment instruction.',
    timing: 'Within 3 business days',
  },
  {
    step: '03',
    icon: ClipboardCheck,
    title: 'Verified inspection',
    text: 'We compare identity, mileage, visible condition, warning indicators, keys and disclosed faults with the vehicle declaration.',
    timing: 'Before completion',
  },
  {
    step: '04',
    icon: FileSearch,
    title: 'Clear discrepancy decision',
    text: 'If something material differs, we pause the transaction, share the evidence and agree the next route with you.',
    timing: 'Buyer contacted directly',
  },
  {
    step: '05',
    icon: Truck,
    title: 'Export and delivery',
    text: 'After approval, Autorell coordinates documents, number plates and transport by truck or vessel through selected partners.',
    timing: 'Route confirmed separately',
  },
]

const faqs = [
  {
    question: 'When must I pay after winning an auction?',
    answer:
      'After seller acceptance and Autorell’s payment instruction, the complete confirmed buyer total must be transferred to Autorell within three business days. Always use the deal-specific payment reference.',
  },
  {
    question: 'What happens before the vehicle is released?',
    answer:
      'Autorell verifies cleared funds, required documents and the vehicle inspection. The vehicle is not released for transport until the transaction is ready to proceed.',
  },
  {
    question: 'What if the vehicle differs from the declaration?',
    answer:
      'We pause completion and contact you with the inspection evidence. Depending on the difference, the agreement may be cancelled or Autorell may propose a documented price adjustment for approval by the buyer and seller.',
  },
  {
    question: 'Can Autorell negotiate a revised price for me?',
    answer:
      'Yes. Where a discrepancy has a clear commercial impact, Autorell can coordinate the discussion and present a revised price or condition. Nothing changes without the required parties accepting it.',
  },
  {
    question: 'How are registration plates and export documents handled?',
    answer:
      'Autorell coordinates the agreed Swedish export documentation. Registration plates or documents can be sent through DHL or another suitable tracked export partner, depending on the transaction.',
  },
  {
    question: 'How will the vehicle reach me?',
    answer:
      'Delivery is arranged with selected logistics partners by vehicle transporter or vessel. The exact route, price and estimated timing are confirmed for the individual vehicle and destination.',
  },
]

export default function DealerSupportPage() {
  const [subject, setSubject] = useState('Transaction and payment')
  const [message, setMessage] = useState('')

  function sendRequest(event: FormEvent) {
    event.preventDefault()
    const mailSubject = encodeURIComponent(`[Dealer Portal] ${subject}`)
    const body = encodeURIComponent(message)
    window.location.href = `mailto:info@autorell.com?subject=${mailSubject}&body=${body}`
  }

  return (
    <main className="mx-auto max-w-[1360px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <section className="relative overflow-hidden rounded-[28px] border border-[#cfe4ef] bg-[#eff8fd] px-6 py-8 sm:px-9 lg:px-11 lg:py-11">
        <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full border-[44px] border-white/70" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#52616b]">
              Buyer support from bid to delivery
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
              A clear process. A direct contact. No surprises.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5c6870] sm:text-base">
              Autorell coordinates payment, inspection, discrepancies,
              documents and logistics so you always know what is happening and
              what decision is required next.
            </p>
          </div>
          <a
            href="mailto:info@autorell.com?subject=Dealer%20transaction%20support"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#242424] px-6 text-sm text-white transition hover:bg-black"
          >
            <Headphones size={17} />
            Contact transaction support
          </a>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <SupportMetric
          icon={<Clock3 size={20} />}
          value="3 business days"
          label="Payment deadline after instruction"
        />
        <SupportMetric
          icon={<CheckCircle2 size={20} />}
          value="1 coordinated process"
          label="Payment, inspection and logistics"
        />
        <SupportMetric
          icon={<MessageSquareText size={20} />}
          value="Direct updates"
          label="Immediate contact on material differences"
        />
      </section>

      <section className="mt-10">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7b8285]">
            After you win
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            From accepted bid to delivered vehicle
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Each step is confirmed before the transaction moves forward.
          </p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-5">
          {journey.map((item) => {
            const Icon = item.icon
            return (
              <article
                key={item.step}
                className="relative rounded-[22px] border border-[#deddd7] bg-white p-5 shadow-[0_10px_30px_rgba(32,33,36,.045)]"
              >
                <div className="flex items-center justify-between">
                  <div className="grid h-11 w-11 place-items-center rounded-[13px] bg-[#B4D9EF] text-[#242424]">
                    <Icon size={20} />
                  </div>
                  <span className="text-xs font-semibold text-slate-300">
                    {item.step}
                  </span>
                </div>
                <h3 className="mt-5 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {item.text}
                </p>
                <p className="mt-5 border-t border-slate-100 pt-4 text-xs font-semibold text-[#52616b]">
                  {item.timing}
                </p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <article className="rounded-[24px] bg-[#242424] p-6 text-white shadow-[0_18px_50px_rgba(32,33,36,.14)] sm:p-8">
          <div className="grid h-12 w-12 place-items-center rounded-[14px] bg-[#B4D9EF] text-[#242424]">
            <ClipboardCheck size={23} />
          </div>
          <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#B4D9EF]">
            Autorell Verified Inspection
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            The declaration is checked before completion.
          </h2>
          <p className="mt-4 text-sm leading-7 text-white/60">
            We compare the vehicle with the information used for your bid,
            including VIN, mileage, warning indicators, drivability, visible
            condition, keys and disclosed faults.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              'Identity and VIN',
              'Mileage and warnings',
              'Visible condition',
              'Keys and disclosed faults',
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 rounded-[12px] bg-white/7 px-3 py-3 text-sm text-white/75"
              >
                <CheckCircle2 size={15} className="text-[#B4D9EF]" />
                {item}
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[24px] border border-[#deddd7] bg-white p-6 shadow-[0_14px_40px_rgba(32,33,36,.05)] sm:p-8">
          <div className="grid h-12 w-12 place-items-center rounded-[14px] bg-amber-50 text-amber-700">
            <FileSearch size={23} />
          </div>
          <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7b8285]">
            If something differs
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            You receive evidence and a clear choice.
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-500">
            Autorell pauses the transaction and contacts you directly. We
            explain the difference and its expected commercial impact before
            anything continues.
          </p>
          <div className="mt-6 space-y-3">
            <DecisionRow
              number="A"
              title="Cancel the transaction"
              text="For a material or unresolved deviation, the agreement may be cancelled under the transaction terms."
            />
            <DecisionRow
              number="B"
              title="Agree a documented adjustment"
              text="Autorell can coordinate a revised price or condition with the seller for your approval."
            />
          </div>
        </article>
      </section>

      <section className="mt-8 overflow-hidden rounded-[24px] border border-[#deddd7] bg-white shadow-[0_14px_40px_rgba(32,33,36,.05)]">
        <div className="grid lg:grid-cols-[0.82fr_1.18fr]">
          <div className="border-b border-[#deddd7] bg-[#f8f7f3] p-6 sm:p-8 lg:border-b-0 lg:border-r">
            <div className="flex gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] bg-[#B4D9EF]">
                <PackageCheck size={21} />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Export and delivery</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Coordinated after inspection approval.
                </p>
              </div>
            </div>
            <div className="mt-7 space-y-4">
              <LogisticsRow
                icon={<Mail size={18} />}
                title="Plates and documents"
                text="Tracked delivery through DHL or another suitable export partner."
              />
              <LogisticsRow
                icon={<Truck size={18} />}
                title="Vehicle transporter"
                text="Road delivery through selected European carrier partners."
              />
              <LogisticsRow
                icon={<Ship size={18} />}
                title="Vessel transport"
                text="Sea route where it is commercially or geographically suitable."
              />
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <HelpCircle size={21} />
              <h2 className="text-xl font-semibold">Buyer questions</h2>
            </div>
            <div className="mt-5 divide-y divide-slate-100">
              {faqs.map((item) => (
                <details key={item.question} className="group py-4">
                  <summary className="cursor-pointer list-none pr-6 text-sm font-semibold text-slate-800">
                    {item.question}
                  </summary>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.55fr]">
        <form
          onSubmit={sendRequest}
          className="rounded-[24px] border border-[#deddd7] bg-white p-6 shadow-[0_14px_40px_rgba(32,33,36,.05)] sm:p-8"
        >
          <h2 className="text-xl font-semibold">Contact Autorell</h2>
          <p className="mt-2 text-sm text-slate-500">
            Include the vehicle or deal reference for faster assistance.
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Subject
              </span>
              <select
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="h-12 w-full rounded-[14px] border border-[#d8d7d1] bg-white px-4 text-sm outline-none focus:border-[#8dbdd8]"
              >
                <option>Transaction and payment</option>
                <option>Inspection discrepancy</option>
                <option>Export and documents</option>
                <option>Transport and delivery</option>
                <option>Bid issue</option>
                <option>Account support</option>
              </select>
            </label>
            <label className="block sm:row-span-2">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Message
              </span>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={6}
                required
                placeholder="Vehicle, deal reference and your question..."
                className="w-full resize-none rounded-[14px] border border-[#d8d7d1] bg-white p-4 text-sm outline-none focus:border-[#8dbdd8]"
              />
            </label>
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#242424] px-5 text-sm text-white hover:bg-black"
            >
              Open email request
              <ArrowRight size={16} />
            </button>
          </div>
        </form>

        <aside className="rounded-[24px] border border-[#cfe4ef] bg-[#eff8fd] p-6 sm:p-8">
          <Headphones size={25} />
          <h2 className="mt-5 text-xl font-semibold">Need a quick answer?</h2>
          <p className="mt-3 text-sm leading-6 text-[#5c6870]">
            Dealer enquiries are normally answered within one business day.
            Urgent payment or inspection matters are prioritised.
          </p>
          <a
            href="mailto:info@autorell.com"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4"
          >
            info@autorell.com
            <ArrowRight size={15} />
          </a>
        </aside>
      </section>
    </main>
  )
}

function SupportMetric({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: string
  label: string
}) {
  return (
    <article className="rounded-[20px] border border-[#deddd7] bg-white p-5">
      <div className="flex items-center gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] bg-[#B4D9EF]">
          {icon}
        </div>
        <div>
          <p className="font-semibold">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{label}</p>
        </div>
      </div>
    </article>
  )
}

function DecisionRow({
  number,
  title,
  text,
}: {
  number: string
  title: string
  text: string
}) {
  return (
    <div className="flex gap-4 rounded-[15px] border border-slate-100 bg-[#fbfbf9] p-4">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#242424] text-xs font-semibold text-white">
        {number}
      </span>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
      </div>
    </div>
  )
}

function LogisticsRow({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode
  title: string
  text: string
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 text-[#52616b]">{icon}</div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
      </div>
    </div>
  )
}
