'use client'

import { useMemo, useState } from 'react'

export type SellToDealerFormCopy = {
  formTitle: string
  formText: string
  vinLabel: string
  vinPlaceholder: string
  makeLabel: string
  makePlaceholder: string
  modelLabel: string
  modelPlaceholder: string
  yearLabel: string
  yearPlaceholder: string
  detailsLabel: string
  detailsPlaceholder: string
  continue: string
  noVin: string
  noVinLink: string
  vinError: string
  manualHelp: string
  requiredError: string
  contactTitle: string
  contactNameLabel: string
  contactNamePlaceholder: string
  contactEmailLabel: string
  contactEmailPlaceholder: string
  contactPhoneLabel: string
  contactPhonePlaceholder: string
  contactHelp: string
  detailsHelp: string
  submitError: string
  successTitle: string
  successText: string
  sending: string
}

type FormState = {
  vin: string
  make: string
  otherMake: string
  model: string
  modelYear: string
  mileageKm: string
  fuelType: string
  transmission: string
  bodyType: string
  color: string
  enginePower: string
  previousOwners: string
  keyCount: string
  serviceBook: string
  lastService: string
  summerTires: string
  winterTires: string
  inspected: string
  drivable: string
  financeStatus: string
  visibleDamage: string
  damageDescription: string
  cosmeticDamage: string
  accidentHistory: string
  warningLights: string
  technicalProblems: string
  engineTransmissionProblems: string
  rust: string
  servicedBySchedule: string
  smokeFree: string
  interiorDamage: string
  otherNotes: string
  firstName: string
  lastName: string
  email: string
  phone: string
  postalCode: string
  city: string
  preferredContact: string
  privacyAccepted: boolean
}

const initialState: FormState = {
  vin: '',
  make: '',
  otherMake: '',
  model: '',
  modelYear: '',
  mileageKm: '',
  fuelType: '',
  transmission: '',
  bodyType: '',
  color: '',
  enginePower: '',
  previousOwners: '',
  keyCount: '',
  serviceBook: '',
  lastService: '',
  summerTires: '',
  winterTires: '',
  inspected: '',
  drivable: '',
  financeStatus: '',
  visibleDamage: '',
  damageDescription: '',
  cosmeticDamage: '',
  accidentHistory: '',
  warningLights: '',
  technicalProblems: '',
  engineTransmissionProblems: '',
  rust: '',
  servicedBySchedule: '',
  smokeFree: '',
  interiorDamage: '',
  otherNotes: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  postalCode: '',
  city: '',
  preferredContact: '',
  privacyAccepted: false,
}

const years = Array.from({ length: 2027 - 1950 + 1 }, (_, index) => String(2027 - index))

const imageFields = [
  ['front', 'Framifrån'],
  ['rear', 'Bakifrån'],
  ['leftSide', 'Vänster sida'],
  ['rightSide', 'Höger sida'],
  ['interior', 'Interiör'],
  ['odometer', 'Mätarställning'],
  ['damage', 'Eventuella skador'],
] as const

export default function SellToDealerLeadForm({ copy }: { copy: SellToDealerFormCopy }) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>(initialState)
  const [images, setImages] = useState<Record<string, File | null>>({})
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submittedReference, setSubmittedReference] = useState('')

  const selectedMake = form.make.trim()
  const imageCount = useMemo(() => Object.values(images).filter(Boolean).length, [images])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setError('')
  }

  function validate(targetStep = step) {
    if (targetStep === 0) {
      const vin = normalizeVin(form.vin)
      if (!vin) return 'Ange VIN/chassinummer.'
      if (!isValidVin(vin)) return 'VIN ska vara exakt 17 tecken och får inte innehålla I, O eller Q.'
    }
    if (targetStep === 1) {
      if (!selectedMake) return 'Ange märke.'
      if (!form.model.trim()) return 'Ange modell.'
      if (!form.modelYear) return 'Välj årsmodell.'
    }
    if (targetStep === 2) {
      if (!positiveInteger(form.mileageKm)) return 'Ange mätarställning i kilometer.'
      if (!form.fuelType || !form.transmission || !form.bodyType || !form.color) return 'Fyll i drivmedel, växellåda, karosstyp och färg.'
      if (!form.keyCount || !form.serviceBook || !form.summerTires || !form.winterTires || !form.inspected || !form.drivable || !form.financeStatus) return 'Fyll i alla obligatoriska uppgifter om bilen.'
    }
    if (targetStep === 3) {
      if (!form.visibleDamage || !form.cosmeticDamage || !form.accidentHistory || !form.warningLights || !form.technicalProblems || !form.engineTransmissionProblems || !form.rust || !form.servicedBySchedule || !form.smokeFree || !form.interiorDamage) return 'Fyll i bilens skick och historik.'
      if (form.visibleDamage === 'Ja' && form.damageDescription.trim().length < 3) return 'Beskriv skadorna.'
    }
    if (targetStep === 4) {
      if (!form.firstName.trim() || !form.lastName.trim()) return 'Fyll i förnamn och efternamn.'
      if (!isValidEmail(form.email)) return 'Ange en giltig e-postadress.'
      if (form.phone.trim().length < 6) return 'Ange telefonnummer.'
      if (!form.postalCode.trim() || !form.city.trim() || !form.preferredContact) return 'Fyll i postnummer, ort och föredragen kontaktväg.'
      if (!form.privacyAccepted) return 'Godkänn integritetspolicy och villkor.'
    }
    return ''
  }

  function next() {
    const message = validate(step)
    if (message) {
      setError(message)
      return
    }
    setStep((current) => Math.min(current + 1, 4))
  }

  async function submit() {
    const message = validate(4)
    if (message) {
      setError(message)
      return
    }
    setSubmitting(true)
    setError('')
    const body = new FormData()
    for (const [key, value] of Object.entries(form)) {
      body.append(key, typeof value === 'boolean' ? String(value) : value)
    }
    body.set('vin', normalizeVin(form.vin))
    body.set('make', selectedMake)
    body.set('makeSource', 'manual')
    for (const [key] of imageFields) {
      const file = images[key]
      if (file) body.append(`image_${key}`, file)
    }

    try {
      const response = await fetch('/api/dealer-offer-requests', { method: 'POST', body })
      const result = await response.json().catch(() => null)
      if (!response.ok) throw new Error(result?.error || copy.submitError)
      setSubmittedReference(result.reference || '')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : copy.submitError)
    } finally {
      setSubmitting(false)
    }
  }

  if (submittedReference) {
    return (
      <div className="min-w-0 w-full max-w-[calc(100vw-72px)] rounded-[18px] bg-white p-5 shadow-[0_18px_50px_rgba(16,24,40,.14)] sm:max-w-none">
        <h2 className="text-2xl font-semibold tracking-[-.04em]">Din bilförfrågan är skickad</h2>
        <p className="mt-3 text-sm leading-6 text-[#475467]">
          Referensnummer: <strong className="text-[#101828]">{submittedReference}</strong>
        </p>
        <p className="mt-2 text-sm leading-6 text-[#475467]">
          Anslutna bilhandlare kan nu granska uppgifterna, bilderna och dina kontaktuppgifter och återkomma med bud.
        </p>
      </div>
    )
  }

  return (
    <>
    {step > 0 ? <div className="fixed inset-0 z-[70] bg-[#f4f7fb]" /> : null}
    <div className={`min-w-0 w-full bg-white shadow-[0_18px_50px_rgba(16,24,40,.14)] ${step === 0 ? 'max-w-[calc(100vw-72px)] rounded-[18px] p-4 sm:max-w-none sm:p-5' : 'fixed inset-x-0 bottom-0 top-[72px] z-[80] overflow-y-auto rounded-t-[24px] border border-[#d9e2ef] p-5 sm:bottom-auto sm:left-1/2 sm:top-[90px] sm:max-h-[calc(100vh-118px)] sm:w-[min(1120px,calc(100vw-48px))] sm:-translate-x-1/2 sm:rounded-[22px] sm:p-7'}`}>
      <h2 className="max-w-full text-lg font-semibold leading-tight tracking-[-.025em] [overflow-wrap:anywhere] sm:text-xl sm:tracking-[-.035em]">{copy.formTitle}</h2>
      <p className="mt-2 text-xs leading-5 text-[#667085]">{copy.formText}</p>

      <div className="mt-5">
        {step === 0 ? <VinStep form={form} update={update} /> : null}
        {step === 1 ? <VehicleIdentityStep form={form} update={update} selectedMake={selectedMake} /> : null}
        {step === 2 ? <DetailsStep form={form} update={update} /> : null}
        {step === 3 ? <ConditionStep form={form} update={update} images={images} setImages={setImages} /> : null}
        {step === 4 ? <ContactStep form={form} update={update} selectedMake={selectedMake} imageCount={imageCount} /> : null}
      </div>

      {error ? <p className="mt-4 rounded-[12px] bg-[#fff4ed] px-3 py-2 text-xs font-semibold text-[#b42318]">{error}</p> : null}

      <div className="mt-5 flex gap-3">
        {step > 0 ? (
          <button type="button" className="min-h-11 flex-1 rounded-full border border-[#b9c3d1] px-4 text-sm font-bold text-[#344054]" onClick={() => setStep((current) => current - 1)}>
            Tillbaka
          </button>
        ) : null}
        {step < 4 ? (
          <button type="button" className="min-h-11 flex-1 rounded-full bg-[#0866ff] px-4 text-sm font-bold text-white" onClick={next}>
            {step === 0 ? 'Nästa: Märke och modell' : step === 1 ? 'Nästa: Bilens uppgifter' : step === 2 ? 'Nästa: Skick och historik' : 'Nästa: Kontaktuppgifter'}
          </button>
        ) : (
          <button type="button" disabled={submitting} className="min-h-11 flex-1 rounded-full bg-[#0866ff] px-4 text-sm font-bold text-white disabled:bg-[#98a2b3]" onClick={submit}>
            {submitting ? copy.sending : 'Skicka förfrågan till bilhandlare'}
          </button>
        )}
      </div>
    </div>
    </>
  )
}

function VinStep({ form, update }: StepProps) {
  return (
    <section>
      <h3 className="text-lg font-semibold tracking-[-.025em]">VIN/chassinummer</h3>
      <p className="mt-2 text-xs leading-5 text-[#667085]">Skriv VIN/chassinummer för att gå vidare till nästa steg.</p>
      <div className="mt-4">
        <Field label="VIN/chassinummer" value={form.vin} placeholder="Ange 17 tecken" onChange={(value) => update('vin', normalizeVin(value))} maxLength={17} required />
      </div>
    </section>
  )
}

function VehicleIdentityStep({ form, update, selectedMake }: StepProps & { selectedMake: string }) {
  return (
    <section>
      <h3 className="text-xl font-semibold tracking-[-.025em]">Vilken bil vill du sälja?</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <Field label="Märke" value={form.make} placeholder="Till exempel Volvo" onChange={(value) => update('make', value)} />
        <Field label="Modell" value={form.model} placeholder={selectedMake ? `Till exempel ${selectedMake} modell` : 'Till exempel XC60'} onChange={(value) => update('model', value)} />
        <Select label="Årsmodell" value={form.modelYear} onChange={(value) => update('modelYear', value)} options={years} placeholder="Välj årsmodell" />
      </div>
    </section>
  )
}

function DetailsStep({ form, update }: StepProps) {
  return (
    <section>
      <h3 className="text-lg font-semibold tracking-[-.025em]">Berätta om bilen</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <Field label="Mätarställning i kilometer" value={form.mileageKm} placeholder="Till exempel 125000" onChange={(value) => update('mileageKm', digits(value))} inputMode="numeric" />
        <Select label="Drivmedel" value={form.fuelType} onChange={(value) => update('fuelType', value)} options={['Bensin', 'Diesel', 'El', 'Hybrid', 'Laddhybrid', 'Etanol', 'Gas']} />
        <Select label="Växellåda" value={form.transmission} onChange={(value) => update('transmission', value)} options={['Automat', 'Manuell']} />
        <Select label="Karosstyp" value={form.bodyType} onChange={(value) => update('bodyType', value)} options={['Kombi', 'Sedan', 'Halvkombi', 'SUV', 'Coupé', 'Cabriolet', 'Pickup', 'Minibuss']} />
        <Field label="Färg" value={form.color} placeholder="Till exempel vit" onChange={(value) => update('color', value)} />
        <Field label="Motoreffekt, frivilligt" value={form.enginePower} placeholder="hk eller kW" onChange={(value) => update('enginePower', value)} />
        <Field label="Antal tidigare ägare, frivilligt" value={form.previousOwners} placeholder="Till exempel 2" onChange={(value) => update('previousOwners', digits(value))} inputMode="numeric" />
        <Select label="Antal nycklar" value={form.keyCount} onChange={(value) => update('keyCount', value)} options={['1', '2', '3 eller fler']} />
        <Select label="Servicebok" value={form.serviceBook} onChange={(value) => update('serviceBook', value)} options={['Ja', 'Delvis', 'Nej']} />
        <Field label="Senast servad, frivilligt" value={form.lastService} placeholder="Till exempel 2025-11 eller 120000 km" onChange={(value) => update('lastService', value)} />
        <Select label="Sommarhjul" value={form.summerTires} onChange={(value) => update('summerTires', value)} options={['Ja', 'Nej']} />
        <Select label="Vinterhjul" value={form.winterTires} onChange={(value) => update('winterTires', value)} options={['Ja', 'Nej']} />
        <Select label="Är bilen besiktigad?" value={form.inspected} onChange={(value) => update('inspected', value)} options={['Ja', 'Nej']} />
        <Select label="Är bilen körbar?" value={form.drivable} onChange={(value) => update('drivable', value)} options={['Ja', 'Nej']} />
        <Select label="Finansierad, leasad eller kvarvarande kredit?" value={form.financeStatus} onChange={(value) => update('financeStatus', value)} options={['Ja', 'Nej', 'Vet inte']} />
      </div>
    </section>
  )
}

function ConditionStep({ form, update, images, setImages }: StepProps & { images: Record<string, File | null>; setImages: (images: Record<string, File | null>) => void }) {
  return (
    <section>
      <h3 className="text-lg font-semibold tracking-[-.025em]">Bilens skick</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <Select label="Finns synliga skador?" value={form.visibleDamage} onChange={(value) => update('visibleDamage', value)} options={['Ja', 'Nej']} />
        <Field label="Beskriv skadorna" value={form.damageDescription} placeholder="Kort beskrivning" onChange={(value) => update('damageDescription', value)} />
        <Select label="Finns repor, bucklor eller lackskador?" value={form.cosmeticDamage} onChange={(value) => update('cosmeticDamage', value)} options={['Ja', 'Nej']} />
        <Select label="Har bilen varit med i en olycka?" value={form.accidentHistory} onChange={(value) => update('accidentHistory', value)} options={['Ja', 'Nej', 'Vet inte']} />
        <Select label="Finns varningslampor?" value={form.warningLights} onChange={(value) => update('warningLights', value)} options={['Ja', 'Nej']} />
        <Select label="Finns tekniska problem?" value={form.technicalProblems} onChange={(value) => update('technicalProblems', value)} options={['Ja', 'Nej']} />
        <Select label="Problem med motor eller växellåda?" value={form.engineTransmissionProblems} onChange={(value) => update('engineTransmissionProblems', value)} options={['Ja', 'Nej']} />
        <Select label="Finns rost?" value={form.rust} onChange={(value) => update('rust', value)} options={['Ja', 'Nej']} />
        <Select label="Servad enligt rekommenderade intervall?" value={form.servicedBySchedule} onChange={(value) => update('servicedBySchedule', value)} options={['Ja', 'Nej', 'Vet inte']} />
        <Select label="Är bilen rökfri?" value={form.smokeFree} onChange={(value) => update('smokeFree', value)} options={['Ja', 'Nej']} />
        <Select label="Invändiga skador eller kraftigt slitage?" value={form.interiorDamage} onChange={(value) => update('interiorDamage', value)} options={['Ja', 'Nej']} />
      </div>
      <label className="mt-3 block text-xs font-bold text-[#344054]">
        Övrigt som bilhandlaren bör känna till
        <textarea className="dealer-lead-input mt-1 min-h-20 w-full rounded-[12px] border border-[#b9c3d1] px-3 py-2 text-sm font-normal text-[#101828] outline-none transition placeholder:text-[#7a8699] placeholder:font-normal focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/12" placeholder="Till exempel import, extrautrustning eller kommande service" value={form.otherNotes} onChange={(event) => update('otherNotes', event.target.value)} />
      </label>
      <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {imageFields.map(([key, label]) => (
          <label key={key} className="rounded-[14px] border border-dashed border-[#b9c3d1] bg-[#f8fbff] p-3 text-xs font-bold text-[#344054]">
            {label}
            <input className="mt-2 block w-full text-xs font-normal text-[#667085] file:mr-3 file:rounded-full file:border-0 file:bg-[#0866ff] file:px-3 file:py-2 file:text-xs file:font-bold file:text-white" type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => setImages({ ...images, [key]: event.target.files?.[0] || null })} />
          </label>
        ))}
      </div>
    </section>
  )
}

function ContactStep({ form, update, selectedMake, imageCount }: StepProps & { selectedMake: string; imageCount: number }) {
  return (
    <section>
      <h3 className="text-lg font-semibold tracking-[-.025em]">Dina kontaktuppgifter</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <Field label="Förnamn" value={form.firstName} placeholder="Förnamn" onChange={(value) => update('firstName', value)} />
        <Field label="Efternamn" value={form.lastName} placeholder="Efternamn" onChange={(value) => update('lastName', value)} />
        <Field label="E-post" value={form.email} placeholder="namn@example.com" onChange={(value) => update('email', value)} type="email" />
        <Field label="Telefonnummer" value={form.phone} placeholder="070 123 45 67" onChange={(value) => update('phone', value)} type="tel" />
        <Field label="Postnummer" value={form.postalCode} placeholder="123 45" onChange={(value) => update('postalCode', value)} />
        <Field label="Ort" value={form.city} placeholder="Stockholm" onChange={(value) => update('city', value)} />
        <Select label="Föredragen kontaktväg" value={form.preferredContact} onChange={(value) => update('preferredContact', value)} options={['Telefon', 'SMS', 'E-post']} />
      </div>
      <div className="mt-4 rounded-[14px] bg-[#f8fbff] p-3 text-xs leading-5 text-[#344054]">
        <strong className="block text-sm text-[#101828]">Sammanfattning</strong>
        <span className="block">{selectedMake} {form.model} {form.modelYear}</span>
        <span className="block">Mätarställning: {form.mileageKm || '-'} km</span>
        <span className="block">Drivmedel: {form.fuelType || '-'}</span>
        <span className="block">Växellåda: {form.transmission || '-'}</span>
        <span className="block">Skick: {form.visibleDamage === 'Ja' ? 'Skador finns' : 'Inga synliga skador angivna'}</span>
        <span className="block">Uppladdade bilder: {imageCount}</span>
        <span className="block">Kontakt: {form.firstName} {form.lastName}, {form.email}, {form.phone}</span>
      </div>
      <label className="mt-4 flex gap-3 text-xs font-semibold leading-5 text-[#344054]">
        <input type="checkbox" className="mt-1 h-4 w-4 rounded border-[#98a2b3]" checked={form.privacyAccepted} onChange={(event) => update('privacyAccepted', event.target.checked)} />
        Jag godkänner integritetspolicy och villkor.
      </label>
    </section>
  )
}

type StepProps = {
  form: FormState
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void
}

function Field({ label, value, placeholder, onChange, inputMode, maxLength, type = 'text', required = false }: { label: string; value: string; placeholder: string; onChange: (value: string) => void; inputMode?: 'numeric'; maxLength?: number; type?: 'text' | 'email' | 'tel'; required?: boolean }) {
  return (
    <label className="block text-xs font-bold text-[#344054]">
      {label}
      <span className="relative mt-1 block">
        {!value ? <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-sm font-normal text-[#7a8699]">{placeholder}</span> : null}
        <input className="dealer-lead-input h-11 w-full rounded-[12px] border border-[#b9c3d1] px-3 text-sm font-normal text-[#101828] outline-none transition placeholder:text-transparent focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/12" style={{ WebkitTextFillColor: '#101828', fontWeight: 400 }} type={type} value={value} placeholder="" inputMode={inputMode} maxLength={maxLength} required={required} aria-required={required} onChange={(event) => onChange(event.target.value)} />
      </span>
    </label>
  )
}

function Select({ label, value, options, onChange, placeholder = 'Välj' }: { label: string; value: string; options: string[]; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="block text-xs font-bold text-[#344054]">
      {label}
      <span className="relative mt-1 block">
      {!value ? <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-sm font-normal text-[#7a8699]">{placeholder}</span> : null}
      <select className={`dealer-lead-input h-11 w-full rounded-[12px] border border-[#b9c3d1] bg-white px-3 text-sm font-normal outline-none transition focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/12 ${value ? 'text-[#101828]' : 'text-transparent'}`} style={{ WebkitTextFillColor: value ? '#101828' : 'transparent', fontWeight: 400 }} value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="" className="font-normal text-[#7a8699]">{placeholder}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      </span>
    </label>
  )
}

function normalizeVin(value: string) {
  return value.replace(/\s+/g, '').toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '')
}

function isValidVin(value: string) {
  return /^[A-HJ-NPR-Z0-9]{17}$/.test(value)
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function positiveInteger(value: string) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0
}

function digits(value: string) {
  return value.replace(/\D/g, '').slice(0, 8)
}
