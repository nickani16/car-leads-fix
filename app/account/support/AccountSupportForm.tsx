'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { localizePublicHref, type PublicLocale } from '@/lib/public-i18n'

export type AccountSupportFormCopy = {
  eyebrow: string
  title: string
  text: string
  name: string
  email: string
  phone: string
  topic: string
  topicPlaceholder: string
  priority: string
  priorityPlaceholder: string
  reference: string
  referencePlaceholder: string
  subject: string
  subjectPlaceholder: string
  message: string
  messagePlaceholder: string
  privacyStart: string
  privacyLink: string
  privacyEnd: string
  submit: string
  sending: string
  successTitle: string
  successText: string
  sendAnother: string
  error: string
  footnote: string
  topics: string[]
  priorities: string[]
}

export function AccountSupportForm({
  locale,
  copy,
  defaultName,
  defaultEmail,
  defaultPhone,
}: {
  locale: PublicLocale
  copy: AccountSupportFormCopy
  defaultName: string
  defaultEmail: string
  defaultPhone: string
}) {
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const privacyHref = localizePublicHref(locale, '/privacy')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSending(true)
    setError('')

    const form = event.currentTarget
    const data = new FormData(form)
    const topic = String(data.get('support_topic') || '').trim()
    const priority = String(data.get('support_priority') || '').trim()
    const reference = String(data.get('support_reference') || '').trim()
    const subject = String(data.get('subject') || '').trim()
    const message = String(data.get('message') || '').trim()

    data.set(
      'subject',
      [topic, priority, subject].filter(Boolean).join(' - ') || subject,
    )
    data.set(
      'message',
      [
        reference ? `${copy.reference}: ${reference}` : '',
        topic ? `${copy.topic}: ${topic}` : '',
        priority ? `${copy.priority}: ${priority}` : '',
        '',
        message,
      ]
        .filter((line, index, lines) => line || lines[index + 1])
        .join('\n'),
    )

    const response = await fetch('/api/contact', {
      method: 'POST',
      body: data,
    })

    setSending(false)

    if (!response.ok) {
      setError(copy.error)
      return
    }

    form.reset()
    setSent(true)
  }

  if (sent) {
    return (
      <div className="flex min-h-[520px] flex-col items-center justify-center rounded-[22px] border border-[#dfe7f2] bg-white p-8 text-center shadow-[0_18px_50px_rgba(16,24,40,.05)]">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-[#e8f8ef] text-[#168754]">
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <h2 className="mt-6 text-2xl font-semibold tracking-[-0.035em] text-[#101828]">
          {copy.successTitle}
        </h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-[#667085]">
          {copy.successText}
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full border border-[#cfd8e6] px-6 text-sm font-bold text-[#101828] transition hover:border-[#0866ff] hover:text-[#0866ff]"
        >
          {copy.sendAnother}
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[22px] border border-[#dfe7f2] bg-white p-5 shadow-[0_18px_50px_rgba(16,24,40,.05)] sm:p-7 lg:p-8"
    >
      <input type="hidden" name="locale" value={locale} />
      <label className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>

      <div className="border-b border-[#e4eaf3] pb-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0866ff]">
          {copy.eyebrow}
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#101828] sm:text-3xl">
          {copy.title}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#667085]">
          {copy.text}
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label={copy.name} name="name" defaultValue={defaultName} autoComplete="name" required />
        <Field label={copy.email} name="email" type="email" defaultValue={defaultEmail} autoComplete="email" required />
        <Field label={copy.phone} name="phone" type="tel" defaultValue={defaultPhone} autoComplete="tel" />
        <SelectField label={copy.topic} name="support_topic" placeholder={copy.topicPlaceholder} options={copy.topics} required />
        <SelectField label={copy.priority} name="support_priority" placeholder={copy.priorityPlaceholder} options={copy.priorities} required />
        <Field label={copy.reference} name="support_reference" placeholder={copy.referencePlaceholder} />
      </div>

      <Field
        className="mt-4"
        label={copy.subject}
        name="subject"
        placeholder={copy.subjectPlaceholder}
        required
      />

      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-semibold text-[#344054]">{copy.message}</span>
        <textarea
          name="message"
          required
          rows={7}
          placeholder={copy.messagePlaceholder}
          className="contact-control min-h-[170px] resize-y"
        />
      </label>

      <label className="mt-5 flex items-start gap-3 rounded-[16px] bg-[#f8fbff] p-4 text-xs leading-5 text-[#667085]">
        <input type="checkbox" name="privacy" required className="mt-1 h-4 w-4 shrink-0 accent-[#0866ff]" />
        <span>
          {copy.privacyStart}{' '}
          <Link href={privacyHref} target="_blank" className="font-semibold text-[#0866ff] underline">
            {copy.privacyLink}
          </Link>{' '}
          {copy.privacyEnd}
        </span>
      </label>

      {error && (
        <p className="mt-5 rounded-[14px] bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-4 border-t border-[#e4eaf3] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-[#667085] sm:max-w-md">
          {copy.footnote}
        </p>
        <button
          type="submit"
          disabled={sending}
          className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#0866ff] px-6 text-sm font-bold text-white shadow-[0_16px_35px_rgba(8,102,255,.22)] transition hover:bg-[#0053d8] disabled:cursor-wait disabled:opacity-70 sm:w-auto"
        >
          {sending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {copy.sending}
            </>
          ) : (
            <>
              {copy.submit}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </form>
  )
}

function Field({
  label,
  name,
  type = 'text',
  autoComplete,
  defaultValue,
  placeholder,
  required = false,
  className = '',
}: {
  label: string
  name: string
  type?: string
  autoComplete?: string
  defaultValue?: string
  placeholder?: string
  required?: boolean
  className?: string
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-semibold text-[#344054]">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="contact-control"
      />
    </label>
  )
}

function SelectField({
  label,
  name,
  placeholder,
  options,
  required = false,
}: {
  label: string
  name: string
  placeholder: string
  options: string[]
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[#344054]">{label}</span>
      <select name={name} required={required} className="contact-control">
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}
