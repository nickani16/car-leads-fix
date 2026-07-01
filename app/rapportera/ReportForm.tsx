'use client'

import { FormEvent, useState } from 'react'

const currencies = [
  'EUR',
  'SEK',
  'DKK',
  'PLN',
  'CZK',
  'HUF',
  'RON',
  'BGN',
  'NOK',
  'CHF',
  'GBP',
  'USD',
] as const

export default function ReportForm() {
  const [message, setMessage] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const response = await fetch('/api/account/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(form)),
    })
    const result = (await response.json()) as { error?: string }
    setMessage(
      response.ok
        ? 'Your report has been received and queued for review.'
        : result.error || 'Please sign in and try again.',
    )
    if (response.ok) event.currentTarget.reset()
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-[22px] border border-[#dfe6f2] bg-white p-6 shadow-sm sm:p-8"
    >
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">
          What does the report concern?
        </span>
        <select
          name="category"
          className="h-12 w-full rounded-[14px] border border-[#dfe6f2] bg-white px-4"
        >
          <option value="suspected_fraud">Suspected fraud</option>
          <option value="payment_request">Payment request outside Autorell</option>
          <option value="misleading_listing">Misleading listing</option>
          <option value="unsafe_product">Unsafe or illegal vehicle</option>
          <option value="harassment">Harassment in messages</option>
          <option value="identity_misuse">Identity misuse</option>
          <option value="other">Other</option>
        </select>
      </label>

      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-semibold">
          Listing ID or reference number (optional)
        </span>
        <input
          name="listingId"
          className="h-12 w-full rounded-[14px] border border-[#dfe6f2] px-4"
        />
      </label>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">
            Transaction or payment reference
          </span>
          <input
            name="transactionReference"
            className="h-12 w-full rounded-[14px] border border-[#dfe6f2] px-4"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">
            Counterparty name
          </span>
          <input
            name="counterpartyName"
            className="h-12 w-full rounded-[14px] border border-[#dfe6f2] px-4"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">
            When did it happen?
          </span>
          <input
            name="occurredAt"
            type="datetime-local"
            className="h-12 w-full rounded-[14px] border border-[#dfe6f2] px-4"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Amount</span>
          <input
            name="amount"
            type="number"
            min="0"
            step="0.01"
            className="h-12 w-full rounded-[14px] border border-[#dfe6f2] px-4"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Currency</span>
          <select
            name="currency"
            defaultValue="EUR"
            className="h-12 w-full rounded-[14px] border border-[#dfe6f2] bg-white px-4"
          >
            {currencies.map((currency) => (
              <option key={currency}>{currency}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">
            Phone for follow-up
          </span>
          <input
            name="contactPhone"
            type="tel"
            className="h-12 w-full rounded-[14px] border border-[#dfe6f2] px-4"
          />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-semibold">
          Describe what happened
        </span>
        <textarea
          name="details"
          minLength={10}
          required
          className="min-h-36 w-full rounded-[14px] border border-[#dfe6f2] p-4"
        />
      </label>

      {message ? <p className="mt-4 text-sm text-[#475467]">{message}</p> : null}

      <button className="mt-5 min-h-12 rounded-[14px] bg-[#0866ff] px-6 font-bold text-white">
        Submit report
      </button>
    </form>
  )
}
