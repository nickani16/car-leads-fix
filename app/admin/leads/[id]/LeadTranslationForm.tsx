'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Languages, Save } from 'lucide-react'

export default function LeadTranslationForm({
  leadId,
  originalDamage,
  originalEquipment,
  initialDamageEnglish,
  initialEquipmentEnglish,
  reviewedAt,
}: {
  leadId: string
  originalDamage?: string | null
  originalEquipment?: string | null
  initialDamageEnglish?: string | null
  initialEquipmentEnglish?: string | null
  reviewedAt?: string | null
}) {
  const router = useRouter()
  const [damageEnglish, setDamageEnglish] = useState(initialDamageEnglish || '')
  const [equipmentEnglish, setEquipmentEnglish] = useState(
    initialEquipmentEnglish || ''
  )
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const requiresDamage = Boolean(originalDamage?.trim())
  const requiresEquipment = Boolean(originalEquipment?.trim())
  const complete =
    (!requiresDamage || Boolean(damageEnglish.trim())) &&
    (!requiresEquipment || Boolean(equipmentEnglish.trim()))

  async function save(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setMessage('')

    const response = await fetch(`/api/admin/leads/${leadId}/translation`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ damageEnglish, equipmentEnglish }),
    })
    const result = (await response.json()) as { error?: string }

    setMessage(
      response.ok
        ? 'English dealer text saved and approved.'
        : result.error || 'The translation could not be saved.'
    )
    setSaving(false)
    if (response.ok) router.refresh()
  }

  if (!requiresDamage && !requiresEquipment) return null

  return (
    <form
      onSubmit={save}
      className="mb-6 rounded-[20px] border border-[#deddd7] bg-white p-6 shadow-[0_10px_30px_rgba(32,33,36,.045)]"
    >
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div className="flex items-start gap-3">
          <Languages className="mt-0.5 text-[#52768a]" size={20} />
          <div>
            <h2 className="font-semibold">Dealer English translation</h2>
            <p className="mt-1 text-sm text-[#62686c]">
              Dealers only receive the approved English text below. Review
              technical meaning carefully before saving.
            </p>
          </div>
        </div>
        <span
          className={`inline-flex self-start rounded-full border px-3 py-1 text-xs ${
            complete && reviewedAt
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-amber-200 bg-amber-50 text-amber-800'
          }`}
        >
          {complete && reviewedAt ? 'Translation approved' : 'Translation required'}
        </span>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {requiresDamage && (
          <TranslationField
            label="Damage description"
            original={originalDamage || ''}
            english={damageEnglish}
            setEnglish={setDamageEnglish}
          />
        )}
        {requiresEquipment && (
          <TranslationField
            label="Equipment"
            original={originalEquipment || ''}
            english={equipmentEnglish}
            setEnglish={setEquipmentEnglish}
          />
        )}
      </div>

      {message && <p className="mt-4 text-sm text-[#52616b]">{message}</p>}
      <button
        disabled={saving || !complete}
        className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-[#242424] px-5 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {complete && reviewedAt ? <CheckCircle2 size={15} /> : <Save size={15} />}
        {saving ? 'Saving...' : 'Save and approve English text'}
      </button>
    </form>
  )
}

function TranslationField({
  label,
  original,
  english,
  setEnglish,
}: {
  label: string
  original: string
  english: string
  setEnglish: (value: string) => void
}) {
  return (
    <section className="rounded-[16px] border border-[#e4e2dc] bg-[#faf9f6] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#73797c]">
        {label}
      </p>
      <div className="mt-4">
        <p className="text-[10px] uppercase tracking-[0.12em] text-[#858a8c]">
          Customer original
        </p>
        <p className="mt-2 min-h-16 rounded-[10px] bg-white p-3 text-sm leading-6 text-[#4d5559]">
          {original}
        </p>
      </div>
      <label className="mt-4 block">
        <span className="text-[10px] uppercase tracking-[0.12em] text-[#858a8c]">
          Approved English
        </span>
        <textarea
          value={english}
          onChange={(event) => setEnglish(event.target.value)}
          rows={4}
          className="mt-2 w-full rounded-[10px] border border-[#d8d7d1] bg-white p-3 text-sm leading-6 outline-none focus:border-[#8dbdd8]"
          required
        />
      </label>
    </section>
  )
}
