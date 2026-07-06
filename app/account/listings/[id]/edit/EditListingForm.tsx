'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Search, X } from 'lucide-react'
import type { MarketplaceCategorySlug } from '@/lib/marketplace'
import {
  equipmentGroupsForCategory,
  equipmentLabel,
  equipmentOptionByKey,
} from '@/lib/listing-equipment'

type EditableListing = {
  id: string
  category: MarketplaceCategorySlug
  title: string
  price: number
  currency: string
  city: string
  country: string
  address: string
  latitude: number | null
  longitude: number | null
  description: string
  equipmentKeys: string[]
  sellerType: 'private' | 'business'
  phoneVisibility: 'public' | 'registered_only' | null
}

export default function EditListingForm({
  listing,
  backHref,
}: {
  listing: EditableListing
  backHref: string
}) {
  const router = useRouter()
  const [price, setPrice] = useState(String(listing.price))
  const [city, setCity] = useState(listing.city)
  const [address, setAddress] = useState(listing.address)
  const [description, setDescription] = useState(listing.description)
  const [equipmentKeys, setEquipmentKeys] = useState(listing.equipmentKeys)
  const [phoneVisibility, setPhoneVisibility] = useState(listing.phoneVisibility || 'public')
  const [equipmentSearch, setEquipmentSearch] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError('')
    const response = await fetch(`/api/account/listings/${listing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_listing',
        price,
        city,
        country: listing.country,
        address,
        latitude: listing.latitude,
        longitude: listing.longitude,
        description,
        equipmentKeys,
        phoneVisibility,
      }),
    })
    const result = (await response.json()) as { error?: string }
    if (!response.ok) {
      setError(result.error || 'Annonsen kunde inte sparas.')
      setSaving(false)
      return
    }
    router.push(backHref)
    router.refresh()
  }

  return (
    <form onSubmit={submit} className="space-y-7 p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-bold">Pris</span>
          <div className="flex overflow-hidden rounded-[14px] border border-[#d7deed] bg-white focus-within:border-[#0866ff] focus-within:ring-4 focus-within:ring-[#0866ff]/10">
            <input
              type="number"
              min="1"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              className="h-13 min-w-0 flex-1 px-4 outline-none"
              required
            />
            <span className="grid min-w-20 place-items-center border-l border-[#edf1f6] bg-[#f8faff] text-sm font-black text-[#667085]">
              {listing.currency}
            </span>
          </div>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold">Ort</span>
          <input
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className="h-13 w-full rounded-[14px] border border-[#d7deed] px-4 outline-none focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
            required
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold">Gatuadress</span>
          <input
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            className="h-13 w-full rounded-[14px] border border-[#d7deed] px-4 outline-none focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
            autoComplete="street-address"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-bold">Säljarens beskrivning</span>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={7}
          className="w-full rounded-[16px] border border-[#d7deed] p-4 outline-none focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
          placeholder="Skriv bara egen fritext här. Strukturerade uppgifter och utrustning väljs i fasta fält."
        />
      </label>

      <section className="rounded-[18px] border border-[#dfe6f1] p-4">
        <h2 className="text-lg font-black tracking-[-.03em]">Utrustning</h2>
        <EquipmentEditor
          category={listing.category}
          selectedKeys={equipmentKeys}
          search={equipmentSearch}
          onSearch={setEquipmentSearch}
          onSelectedKeys={setEquipmentKeys}
        />
      </section>

      {listing.sellerType === 'private' ? (
        <section className="rounded-[18px] border border-[#dfe6f1] bg-[#fbfcff] p-4">
          <h2 className="text-lg font-black tracking-[-.03em]">Telefonnummer</h2>
          <p className="mt-1 text-sm leading-6 text-[#667085]">
            Ett öppet telefonnummer kan ge fler kontakter. Om du kräver inloggning kan det minska antalet förfrågningar.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setPhoneVisibility('public')}
              className={`rounded-[14px] border px-4 py-3 text-left text-sm font-bold ${
                phoneVisibility === 'public'
                  ? 'border-[#0866ff] bg-[#eef5ff] text-[#0866ff]'
                  : 'border-[#d7deed] bg-white text-[#344054]'
              }`}
            >
              Visa för alla
            </button>
            <button
              type="button"
              onClick={() => setPhoneVisibility('registered_only')}
              className={`rounded-[14px] border px-4 py-3 text-left text-sm font-bold ${
                phoneVisibility === 'registered_only'
                  ? 'border-[#0866ff] bg-[#eef5ff] text-[#0866ff]'
                  : 'border-[#d7deed] bg-white text-[#344054]'
              }`}
            >
              Visa bara för inloggade
            </button>
          </div>
        </section>
      ) : null}

      {error ? (
        <p role="alert" className="rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </p>
      ) : null}

      <button
        disabled={saving}
        className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-[14px] bg-[#0866ff] px-6 text-sm font-black text-white shadow-[0_14px_34px_rgba(8,102,255,.24)] disabled:opacity-60 sm:w-auto"
      >
        <Check className="h-5 w-5" />
        {saving ? 'Sparar...' : 'Spara ändringar'}
      </button>
    </form>
  )
}

function EquipmentEditor({
  category,
  selectedKeys,
  search,
  onSearch,
  onSelectedKeys,
}: {
  category: MarketplaceCategorySlug
  selectedKeys: string[]
  search: string
  onSearch: (value: string) => void
  onSelectedKeys: (value: string[]) => void
}) {
  const groups = equipmentGroupsForCategory(category)
  const selected = new Set(selectedKeys)
  const normalizedSearch = search.trim().toLowerCase()
  const selectedOptions = selectedKeys
    .map((key) => equipmentOptionByKey.get(key))
    .filter((option): option is NonNullable<typeof option> => Boolean(option))

  function toggle(key: string) {
    onSelectedKeys(
      selected.has(key)
        ? selectedKeys.filter((item) => item !== key)
        : [...selectedKeys, key],
    )
  }

  return (
    <div className="mt-4 space-y-5">
      {selectedOptions.length ? (
        <div className="flex flex-wrap gap-2">
          {selectedOptions.map((option) => (
            <span key={option.key} className="inline-flex items-center gap-2 rounded-full bg-[#eef5ff] px-3 py-2 text-sm font-bold text-[#0866ff]">
              {equipmentLabel(option, 'sv')}
              <button type="button" onClick={() => toggle(option.key)} aria-label={`Ta bort ${equipmentLabel(option, 'sv')}`}>
                <X className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
      <label className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
        <input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Sök utrustning"
          className="h-12 w-full rounded-[14px] border border-[#d7deed] pl-10 pr-4 outline-none focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
        />
      </label>
      <div className="max-h-[470px] space-y-4 overflow-y-auto pr-1">
        {groups.map((group) => {
          const options = group.options.filter((option) => {
            if (!normalizedSearch) return true
            return `${option.sv} ${option.en} ${option.de} ${option.key}`.toLowerCase().includes(normalizedSearch)
          })
          if (!options.length) return null
          return (
            <section key={group.key} className="rounded-[16px] border border-[#edf1f6] bg-[#fbfcff] p-3">
              <h3 className="text-xs font-black uppercase tracking-[.14em] text-[#667085]">{group.sv}</h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {options.map((option) => (
                  <label key={option.key} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-[12px] border border-[#d7deed] bg-white px-3 py-2 text-sm font-bold">
                    <input
                      type="checkbox"
                      checked={selected.has(option.key)}
                      onChange={() => toggle(option.key)}
                      className="h-4 w-4 accent-[#0866ff]"
                    />
                    {option.sv}
                  </label>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
