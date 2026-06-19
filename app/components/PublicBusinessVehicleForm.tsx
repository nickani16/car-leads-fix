'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  LoaderCircle,
  ShieldCheck,
  Trash2,
} from 'lucide-react'

type Locale = 'sv' | 'de' | 'en'
type SelectedImage = { id: string; file: File; previewUrl: string }

const copy = {
  sv: {
    eyebrow: 'Sälj företagsfordon i Europa',
    title: 'Skicka in ett fordon. Vi testar efterfrågan i vårt EU-nätverk.',
    intro:
      'För bilföretag, leasingbolag, flottägare och handlare. Ni behöver inget konto för att börja. Autorell granskar underlaget, presenterar bilen anonymt och återkommer med ett eget villkorat inköpserbjudande när affären fungerar.',
    company: 'Företagsuppgifter',
    vehicle: 'Fordonsuppgifter',
    photos: 'Bilder',
    target: 'Önskat nettopris från Autorell (EUR)',
    submit: 'Skicka för exportbedömning',
    success: 'Tack. Fordonet är skickat till Autorell för granskning.',
    privacy: 'Säljarens identitet, exakt plats, registreringsnummer och VIN visas inte öppet för köparnätverket.',
  },
  en: {
    eyebrow: 'Sell business vehicles across Europe',
    title: 'Submit a vehicle. We test demand in our EU buyer network.',
    intro:
      'For dealers, leasing companies and fleet owners. No account is needed to start. Autorell reviews the vehicle, presents it anonymously and returns with its own conditional purchase offer when the transaction works.',
    company: 'Company details',
    vehicle: 'Vehicle details',
    photos: 'Photos',
    target: 'Expected net price from Autorell (EUR)',
    submit: 'Submit for export assessment',
    success: 'Thank you. The vehicle has been sent to Autorell for review.',
    privacy: 'Seller identity, exact location, registration and VIN are not shown to the buyer network.',
  },
  de: {
    eyebrow: 'Firmenfahrzeuge europaweit verkaufen',
    title: 'Fahrzeug einreichen. Wir testen die Nachfrage in unserem EU-Käufernetzwerk.',
    intro:
      'Für Händler, Leasinggesellschaften und Flottenbetreiber. Zum Start ist kein Konto nötig. Autorell prüft das Fahrzeug, präsentiert es anonym und unterbreitet bei tragfähiger Nachfrage ein eigenes bedingtes Kaufangebot.',
    company: 'Unternehmensdaten',
    vehicle: 'Fahrzeugdaten',
    photos: 'Bilder',
    target: 'Erwarteter Nettopreis von Autorell (EUR)',
    submit: 'Zur Exportbewertung einreichen',
    success: 'Vielen Dank. Das Fahrzeug wurde Autorell zur Prüfung übermittelt.',
    privacy: 'Verkäuferidentität, genauer Standort, Kennzeichen und VIN werden dem Käufernetzwerk nicht angezeigt.',
  },
} as const

const inputClass =
  'h-12 w-full rounded-[13px] border border-[#d8d7d1] bg-white px-4 text-sm outline-none transition focus:border-[#78b5d6] focus:ring-4 focus:ring-[#B4D9EF]/30'

export default function PublicBusinessVehicleForm({ locale }: { locale: Locale }) {
  const t = copy[locale]
  const [images, setImages] = useState<SelectedImage[]>([])
  const imageRef = useRef<SelectedImage[]>([])
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    imageRef.current = images
  }, [images])
  useEffect(
    () => () => imageRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl)),
    []
  )

  function selectImages(files: FileList | null) {
    if (!files?.length) return
    const valid = Array.from(files)
      .filter((file) => file.type.startsWith('image/') && file.size <= 12 * 1024 * 1024)
      .slice(0, Math.max(0, 20 - images.length))
    setImages((current) => [
      ...current,
      ...valid.map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ])
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSending(true)
    setError('')
    const data = new FormData(event.currentTarget)
    data.delete('images')
    data.set('locale', locale)
    images.forEach((image) => data.append('images', image.file))
    const response = await fetch('/api/business-vehicles', { method: 'POST', body: data })
    const result = (await response.json().catch(() => ({}))) as { error?: string }
    setSending(false)
    if (!response.ok) {
      setError(result.error || 'The vehicle could not be submitted.')
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="rounded-[24px] border border-[#cfe2eb] bg-white p-10 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-14 w-14 text-[#397b9f]" />
        <h2 className="mt-5 text-2xl tracking-[-0.03em]">{t.success}</h2>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="rounded-[24px] border border-[#dfe4e5] bg-white p-5 shadow-[0_24px_70px_rgba(32,33,36,.08)] sm:p-8">
      <div className="border-b border-[#e6e4de] pb-7">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#638093]">{t.eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-3xl leading-tight tracking-[-0.045em] sm:text-5xl">{t.title}</h1>
        <p className="mt-4 max-w-3xl leading-7 text-[#61717a]">{t.intro}</p>
      </div>

      <Section title={t.company}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="companyName" label={locale === 'de' ? 'Firmenname' : locale === 'en' ? 'Company name' : 'Företagsnamn'} />
          <Field name="registrationNumber" label={locale === 'de' ? 'Handelsregister-/USt-Nummer' : locale === 'en' ? 'Company / VAT number' : 'Organisations-/VAT-nummer'} />
          <Field name="contactName" label={locale === 'de' ? 'Ansprechpartner' : locale === 'en' ? 'Contact person' : 'Kontaktperson'} />
          <Field name="email" type="email" label="E-mail" />
          <Field name="phone" type="tel" label={locale === 'de' ? 'Telefon' : locale === 'en' ? 'Phone' : 'Telefon'} />
          <label>
            <span className="mb-2 block text-sm text-[#42484c]">{locale === 'de' ? 'Fahrzeugtyp' : locale === 'en' ? 'Supply type' : 'Typ av lager'}</span>
            <select name="vehicleCategory" required className={inputClass}>
              <option value="">—</option>
              <option value="dealer_stock">Dealer stock</option>
              <option value="leasing_return">Leasing returns</option>
              <option value="new_vehicle">New / pre-registered vehicles</option>
              <option value="fleet">Fleet vehicles</option>
            </select>
          </label>
        </div>
      </Section>

      <Section title={t.vehicle}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field name="reg" label={locale === 'de' ? 'Kennzeichen' : locale === 'en' ? 'Registration' : 'Registreringsnummer'} />
          <Field name="vin" label="VIN" required={false} />
          <Field name="make" label={locale === 'de' ? 'Marke' : locale === 'en' ? 'Brand' : 'Märke'} />
          <Field name="model" label="Model" />
          <Field name="variant" label={locale === 'de' ? 'Variante' : 'Variant'} required={false} />
          <Field name="modelYear" type="number" label={locale === 'de' ? 'Modelljahr' : locale === 'en' ? 'Model year' : 'Modellår'} />
          <Field name="mileageKm" type="number" label={locale === 'de' ? 'Kilometerstand' : locale === 'en' ? 'Mileage (km)' : 'Mätarställning (km)'} />
          <Field name="pickupCity" label={locale === 'de' ? 'Standort' : locale === 'en' ? 'Collection city' : 'Ort'} />
          <Field name="pickupPostalCode" label={locale === 'de' ? 'Postleitzahl' : locale === 'en' ? 'Postal code' : 'Postnummer'} />
          <Field name="sellerTargetPrice" type="number" label={t.target} />
          <label>
            <span className="mb-2 block text-sm text-[#42484c]">Fuel</span>
            <select name="fuelType" required className={inputClass}>
              <option value="">—</option>
              <option>Electric</option><option>Plug-in hybrid</option><option>Hybrid</option><option>Petrol</option><option>Diesel</option>
            </select>
          </label>
          <label>
            <span className="mb-2 block text-sm text-[#42484c]">Gearbox</span>
            <select name="gearbox" required className={inputClass}>
              <option value="">—</option><option>Automatic</option><option>Manual</option>
            </select>
          </label>
        </div>
        <label className="mt-4 block">
          <span className="mb-2 block text-sm text-[#42484c]">{locale === 'de' ? 'Zustand und bekannte Mängel' : locale === 'en' ? 'Condition and known faults' : 'Skick och kända fel'}</span>
          <textarea name="details" rows={4} className="contact-control resize-none" />
        </label>
      </Section>

      <Section title={t.photos}>
        <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-[16px] border border-dashed border-[#9fc7da] bg-[#f2f8fb] p-5 text-center">
          <Camera className="h-6 w-6 text-[#397b9f]" />
          <span className="mt-2 text-sm font-medium">{images.length ? `${images.length} / 20` : 'JPG, PNG or WebP · max 12 MB'}</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(event) => selectImages(event.target.files)} />
        </label>
        {images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((image, index) => (
              <div key={image.id} className="relative overflow-hidden rounded-[12px] border border-[#deddd7] bg-[#f5f4f0]">
                <Image src={image.previewUrl} alt={`Vehicle ${index + 1}`} width={320} height={220} unoptimized className="h-32 w-full object-cover" />
                <button type="button" aria-label="Remove image" onClick={() => {
                  URL.revokeObjectURL(image.previewUrl)
                  setImages((current) => current.filter((item) => item.id !== image.id))
                }} className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-red-700 shadow">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      <div className="mt-7 flex items-start gap-3 rounded-[15px] bg-[#eef7fb] p-4 text-sm leading-6 text-[#526b78]">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
        <p>{t.privacy}</p>
      </div>
      <label className="mt-5 flex items-start gap-3 text-xs leading-5 text-[#6b7377]">
        <input type="checkbox" required className="mt-1 accent-[#242424]" />
        <span>I accept Autorell&apos;s <Link href="/integritet" className="underline">privacy policy</Link> and may be contacted about this vehicle.</span>
      </label>
      {error && <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      <button disabled={sending} className="mt-6 inline-flex min-h-14 items-center gap-3 rounded-full bg-[#242424] px-7 text-sm font-medium text-white disabled:opacity-60">
        {sending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
        {t.submit}
      </button>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="border-b border-[#e6e4de] py-7 last:border-0"><h2 className="mb-5 text-xl tracking-[-0.025em]">{title}</h2>{children}</section>
}

function Field({ name, label, type = 'text', required = true }: { name: string; label: string; type?: string; required?: boolean }) {
  return <label><span className="mb-2 block text-sm text-[#42484c]">{label}</span><input name={name} type={type} required={required} className={inputClass} /></label>
}
