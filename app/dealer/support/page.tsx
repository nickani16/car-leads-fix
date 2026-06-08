'use client'

import {
  ArrowRight,
  Clock3,
  HelpCircle,
  Mail,
  MessageSquareText,
  ShieldCheck,
} from 'lucide-react'
import { FormEvent, useState } from 'react'

const faqs = [
  {
    question: 'How does the 24-hour auction work?',
    answer:
      'Each auction remains open for 24 hours from the time the vehicle is published. The highest valid bid at closing is recorded as the winning bid.',
  },
  {
    question: 'Can I change or withdraw a bid?',
    answer:
      'Bids are binding. Contact Autorell support immediately if you have submitted an incorrect amount.',
  },
  {
    question: 'Why can I not see customer contact details?',
    answer:
      'Customer phone numbers and email addresses are protected. Autorell coordinates communication and the next steps after an accepted offer.',
  },
  {
    question: 'When will I receive information after winning?',
    answer:
      'Autorell reviews the auction result and contacts the winning dealer with the next steps and available documentation.',
  },
  {
    question: 'How do I update my company information?',
    answer:
      'Open Profile from the dealer navigation. You can update your company and contact details there.',
  },
]

export default function DealerSupportPage() {
  const [subject, setSubject] = useState('Auction question')
  const [message, setMessage] = useState('')

  function sendRequest(event: FormEvent) {
    event.preventDefault()
    const mailSubject = encodeURIComponent(`[Dealer Portal] ${subject}`)
    const body = encodeURIComponent(message)
    window.location.href = `mailto:info@autorell.com?subject=${mailSubject}&body=${body}`
  }

  return (
    <main className="mx-auto max-w-[1280px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <section className="mb-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#6f767a]">
          Dealer assistance
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          How can we help?
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Contact Autorell regarding auctions, bids, vehicle information or
          your dealer account.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <SupportCard
          icon={<Mail size={20} />}
          title="Email support"
          text="For account, vehicle and auction enquiries."
          action="info@autorell.com"
          href="mailto:info@autorell.com"
        />
        <SupportCard
          icon={<Clock3 size={20} />}
          title="Response time"
          text="Dealer enquiries are normally answered within one business day."
          action="Monday–Friday"
        />
        <SupportCard
          icon={<ShieldCheck size={20} />}
          title="Urgent bid issue"
          text="Contact us immediately if an incorrect binding bid was submitted."
          action="Contact support"
          href="mailto:info@autorell.com?subject=Urgent%20bid%20issue"
        />
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <form
          onSubmit={sendRequest}
          className="rounded-[22px] border border-[#deddd7] bg-white p-6 shadow-[0_14px_40px_rgba(32,33,36,.05)] sm:p-8"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#B4D9EF] text-[#242424]">
              <MessageSquareText size={19} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Contact Autorell</h2>
              <p className="text-sm text-slate-500">
                Tell us what you need help with.
              </p>
            </div>
          </div>

          <label className="mt-6 block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Subject
            </span>
            <select
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="h-12 w-full rounded-[14px] border border-[#d8d7d1] bg-white px-4 text-sm outline-none focus:border-[#8dbdd8]"
            >
              <option>Auction question</option>
              <option>Bid issue</option>
              <option>Vehicle information</option>
              <option>Account and login</option>
              <option>Company profile</option>
              <option>Other</option>
            </select>
          </label>

          <label className="mt-5 block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Message
            </span>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={7}
              required
              placeholder="Describe your question..."
              className="w-full resize-none rounded-[14px] border border-[#d8d7d1] bg-white p-4 text-sm outline-none focus:border-[#8dbdd8]"
            />
          </label>

          <button
            type="submit"
            className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#242424] px-5 text-sm font-normal text-white hover:bg-[#111111]"
          >
            Open email request
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="rounded-[22px] border border-[#deddd7] bg-white p-6 shadow-[0_14px_40px_rgba(32,33,36,.05)] sm:p-8">
          <div className="flex items-center gap-3">
            <HelpCircle size={21} className="text-[#242424]" />
            <h2 className="text-lg font-semibold">Frequently asked questions</h2>
          </div>

          <div className="mt-5 divide-y divide-slate-100">
            {faqs.map((item) => (
              <details key={item.question} className="group py-4">
                <summary className="cursor-pointer list-none pr-6 text-sm font-semibold text-slate-800">
                  {item.question}
                </summary>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

function SupportCard({
  icon,
  title,
  text,
  action,
  href,
}: {
  icon: React.ReactNode
  title: string
  text: string
  action: string
  href?: string
}) {
  return (
    <div className="rounded-[18px] border border-[#deddd7] bg-white p-5 shadow-[0_10px_30px_rgba(32,33,36,.04)]">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-[#B4D9EF] text-[#242424]">
        {icon}
      </div>
      <h2 className="mt-4 font-semibold">{title}</h2>
      <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">{text}</p>
      {href ? (
        <a
          href={href}
          className="mt-4 inline-flex text-sm font-medium text-[#242424] underline underline-offset-4"
        >
          {action}
        </a>
      ) : (
        <p className="mt-4 text-sm font-semibold text-slate-700">{action}</p>
      )}
    </div>
  )
}
