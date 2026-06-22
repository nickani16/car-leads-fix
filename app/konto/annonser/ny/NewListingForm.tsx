'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { marketplaceCategories, formatListingPrice } from '@/lib/marketplace-pricing'
import { euCurrencies } from '@/lib/marketplace'

export default function NewListingForm({ accountType, defaultCategory }: { accountType: 'private' | 'business'; defaultCategory: string }) {
  void accountType
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true); setError('')
    const response = await fetch('/api/account/listings', { method: 'POST', body: new FormData(event.currentTarget) })
    const result = (await response.json()) as { error?: string; listingId?: string; requiresPayment?: boolean; packageId?: string }
    if (!response.ok || !result.listingId) { setError(result.error || 'Kunde inte skapa annonsen.'); setLoading(false); return }
    if (result.requiresPayment) {
      const checkout = await fetch('/api/account/listing-checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ listingId: result.listingId, packageId: result.packageId }) })
      const checkoutResult = (await checkout.json()) as { url?: string; error?: string }
      if (checkoutResult.url) { window.location.assign(checkoutResult.url); return }
      setError(checkoutResult.error || 'Betalningen kunde inte startas.'); setLoading(false); return
    }
    router.push('/konto/annonser')
  }
  return <form onSubmit={submit} className="grid gap-5 rounded-[26px] border bg-white p-6 shadow-sm sm:grid-cols-2 sm:p-9">
    <Select name="category" label="Kategori" defaultValue={defaultCategory}>{marketplaceCategories.map((item) => <option key={item.slug} value={item.slug}>{item.label}</option>)}</Select>
    <Select name="packageId" label="Annonspaket"><option value="free_7d">7 dagar – Gratis</option><option value="standard_15d">15 dagar – fast kategoripris</option><option value="premium_30d">Premium 30 dagar – prioriterad</option></Select>
    <Field name="make" label="Märke eller tillverkare" required />
    <Field name="model" label="Modell" required />
    <Field name="variant" label="Variant" />
    <Field name="registration" label="Registreringsnummer / serienummer" />
    <Field name="modelYear" label="Årsmodell" type="number" />
    <Field name="mileage" label="Kilometer" type="number" min="0" />
    <Field name="operatingHours" label="Drifttimmar" type="number" min="0" />
    <Field name="price" label="Pris" type="number" min="1" required />
    <Select name="currency" label="Valuta" defaultValue="EUR">{euCurrencies.map((currency) => <option key={currency} value={currency}>{currency}</option>)}</Select>
    <Field name="city" label="Ort" required />
    <Field name="postalCode" label="Postnummer" />
    <Field name="bodyType" label="Typ / kaross" />
    <Field name="fuelType" label="Drivmedel / energikälla" />
    <Field name="gearbox" label="Växellåda" />
    <Field name="color" label="Färg" />
    <Field name="condition" label="Skick" required />
    <Field name="serviceHistory" label="Servicehistorik" />
    <Field name="equipment" label="Utrustning" />
    <label className="sm:col-span-2"><span className="mb-2 block text-sm font-semibold">Kända fel och skador</span><textarea name="knownFaults" className="min-h-24 w-full rounded-[14px] border p-4" /></label>
    <label className="sm:col-span-2"><span className="mb-2 block text-sm font-semibold">Beskrivning</span><textarea name="description" required minLength={20} className="min-h-32 w-full rounded-[14px] border p-4" /></label>
    <label className="sm:col-span-2"><span className="mb-2 block text-sm font-semibold">Bilder (1–20)</span><input name="images" type="file" accept="image/*" multiple required className="block w-full rounded-[14px] border p-4" /></label>
    <label className="sm:col-span-2 flex gap-3 rounded-[16px] border border-[#d7deed] p-4 text-sm leading-6 text-[#475467]"><input name="listingTerms" type="checkbox" required className="mt-1 h-4 w-4" /><span>Jag godkänner annonsvillkoren och begär att det valda annonspaketet börjar levereras när annonsen har godkänts. Slutpris visas innan Stripe-betalningen genomförs.</span></label>
    <div className="sm:col-span-2 rounded-[18px] bg-[#f3f6ff] p-5 text-sm leading-6 text-[#475467]">
      <strong>Fasta priser:</strong> samma pris gäller för privatpersoner och företag.
      <div className="mt-3 grid gap-1 sm:grid-cols-2">{marketplaceCategories.map((item) => <span key={item.slug}>{item.label}: {formatListingPrice(item.standard)} / Premium {formatListingPrice(item.premium)}</span>)}</div>
    </div>
    {error && <p className="sm:col-span-2 text-sm text-red-700">{error}</p>}
    <button disabled={loading} className="min-h-13 rounded-[15px] bg-[#0866ff] px-6 font-bold text-white sm:col-span-2">{loading ? 'Arbetar…' : 'Fortsätt och publicera'}</button>
  </form>
}
function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) { const { label, ...rest } = props; return <label><span className="mb-2 block text-sm font-semibold">{label}</span><input {...rest} className="h-12 w-full rounded-[14px] border px-4 outline-none focus:border-[#0866ff]" /></label> }
function Select({ label, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: React.ReactNode }) { return <label><span className="mb-2 block text-sm font-semibold">{label}</span><select {...props} className="h-12 w-full rounded-[14px] border bg-white px-4">{children}</select></label> }
