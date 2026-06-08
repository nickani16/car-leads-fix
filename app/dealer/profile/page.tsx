'use client'

import { Building2, CheckCircle2, Save, ShieldCheck } from 'lucide-react'
import { FormEvent, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

type Profile = {
  company_name: string
  vat_number: string
  country: string
  contact_person: string
  email: string
  phone: string
  status: string
}

const emptyProfile: Profile = {
  company_name: '',
  vat_number: '',
  country: '',
  contact_person: '',
  email: '',
  phone: '',
  status: '',
}

export default function DealerProfilePage() {
  const [profile, setProfile] = useState(emptyProfile)
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      setUserId(user.id)
      const { data } = await supabase
        .from('dealers')
        .select(
          'company_name,vat_number,country,contact_person,email,phone,status'
        )
        .eq('user_id', user.id)
        .single()

      if (data) {
        setProfile({
          company_name: data.company_name || '',
          vat_number: data.vat_number || '',
          country: data.country || '',
          contact_person: data.contact_person || '',
          email: data.email || user.email || '',
          phone: data.phone || '',
          status: data.status || '',
        })
      }
      setLoading(false)
    }, 0)

    return () => window.clearTimeout(timer)
  }, [])

  async function saveProfile(event: FormEvent) {
    event.preventDefault()
    if (!userId) return

    setSaving(true)
    setMessage('')

    const { error } = await supabase
      .from('dealers')
      .update({
        company_name: profile.company_name,
        vat_number: profile.vat_number,
        country: profile.country,
        contact_person: profile.contact_person,
        phone: profile.phone,
      })
      .eq('user_id', userId)

    setMessage(
      error
        ? 'The profile could not be updated.'
        : 'Company profile updated successfully.'
    )
    setSaving(false)
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <section className="mb-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#6f767a]">
          Dealer account
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Company profile
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Keep your business and contact information accurate for auction and
          transaction communication.
        </p>
      </section>

      {loading ? (
        <div className="rounded-[12px] border border-slate-200 bg-white p-8 text-sm text-slate-500">
          Loading company profile...
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <form
            onSubmit={saveProfile}
            className="rounded-[22px] border border-[#deddd7] bg-white p-6 shadow-[0_14px_40px_rgba(32,33,36,.05)] sm:p-8"
          >
            <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[#B4D9EF] text-[#242424]">
                <Building2 size={19} />
              </div>
              <div>
                <h2 className="font-semibold">Business information</h2>
                <p className="text-sm text-slate-500">
                  Visible to Autorell and used for dealer identification.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <ProfileField
                label="Company name"
                value={profile.company_name}
                onChange={(value) =>
                  setProfile((current) => ({
                    ...current,
                    company_name: value,
                  }))
                }
              />
              <ProfileField
                label="VAT number"
                value={profile.vat_number}
                onChange={(value) =>
                  setProfile((current) => ({
                    ...current,
                    vat_number: value,
                  }))
                }
              />
              <ProfileField
                label="Country"
                value={profile.country}
                onChange={(value) =>
                  setProfile((current) => ({ ...current, country: value }))
                }
              />
              <ProfileField
                label="Contact person"
                value={profile.contact_person}
                onChange={(value) =>
                  setProfile((current) => ({
                    ...current,
                    contact_person: value,
                  }))
                }
              />
              <ProfileField
                label="Phone number"
                value={profile.phone}
                onChange={(value) =>
                  setProfile((current) => ({ ...current, phone: value }))
                }
              />
              <ProfileField
                label="Login email"
                value={profile.email}
                onChange={() => undefined}
                disabled
              />
            </div>

            {message && (
              <p className="mt-5 rounded-[14px] border border-[#c9e3f2] bg-[#eff8fd] px-4 py-3 text-sm text-[#52616b]">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-[#242424] px-6 text-sm font-normal text-white hover:bg-[#111111] disabled:opacity-60"
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save profile'}
            </button>
          </form>

          <aside className="rounded-[22px] border border-[#b8dfc5] bg-[#eaf7ee] p-6 text-[#176b39] shadow-[0_14px_40px_rgba(23,107,57,.08)]">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-[#ccebd6]">
              <ShieldCheck size={24} className="text-[#176b39]" />
            </span>
            <p className="mt-5 text-[11px] font-medium uppercase tracking-[0.18em] text-[#4a8b61]">
              Account status
            </p>
            <p className="mt-2 text-2xl font-semibold capitalize text-[#176b39]">
              {profile.status || 'Approved'}
            </p>
            <div className="mt-6 flex items-start gap-2 border-t border-[#b8dfc5] pt-5 text-sm leading-6 text-[#397a51]">
              <CheckCircle2
                size={16}
                className="mt-1 shrink-0 text-[#176b39]"
              />
              This account can access active auctions and submit binding bids.
            </div>
          </aside>
        </div>
      )}
    </main>
  )
}

function ProfileField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-normal text-slate-700">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="h-12 w-full rounded-[14px] border border-[#d8d7d1] bg-white px-4 text-sm outline-none focus:border-[#8dbdd8] disabled:bg-slate-100 disabled:text-slate-400"
      />
    </label>
  )
}
