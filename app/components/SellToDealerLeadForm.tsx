'use client'

import { useEffect, useMemo, useState } from 'react'
import { Camera, ImagePlus, LoaderCircle, Trash2 } from 'lucide-react'
import { ACTIVE_MARKET_COUNTRIES, getEuCountryName, isActiveMarketCountryCode } from '@/lib/eu-countries'
import { translatePublic } from '@/lib/public-i18n'

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

type PublicFormLocale = 'sv' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'pl' | 'nl' | 'fi' | 'da' | 'at' | 'be'
type ImageKey = 'front' | 'rear' | 'leftSide' | 'rightSide' | 'interior' | 'odometer' | 'damage'
type SubmitPhase = 'uploading' | 'processing'
type Translator = (value: string) => string
type DealerFormOption = { value: string; label: string }
type DealerFormOptions = {
  fuelTypes: DealerFormOption[]
  transmissions: DealerFormOption[]
  bodyTypes: DealerFormOption[]
  keyCounts: DealerFormOption[]
  serviceBook: DealerFormOption[]
  yesNo: DealerFormOption[]
  yesNoUnknown: DealerFormOption[]
  preferredContact: DealerFormOption[]
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
  countryCode: string
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
  countryCode: '',
  preferredContact: '',
  privacyAccepted: false,
}

const years = Array.from({ length: 2027 - 1950 + 1 }, (_, index) => String(2027 - index))

const imageFields = [
  'front',
  'rear',
  'leftSide',
  'rightSide',
  'interior',
  'odometer',
  'damage',
] as const

export default function SellToDealerLeadForm({
  copy,
  locale = 'sv',
  sourceCountryCode,
}: {
  copy: SellToDealerFormCopy
  locale?: PublicFormLocale
  sourceCountryCode?: string
}) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>(() => ({
    ...initialState,
    countryCode: isActiveMarketCountryCode(sourceCountryCode) ? sourceCountryCode.toUpperCase() : '',
  }))
  const [images, setImages] = useState<Partial<Record<ImageKey, File | null>>>({})
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitProgress, setSubmitProgress] = useState(0)
  const [submitPhase, setSubmitPhase] = useState<SubmitPhase>('uploading')
  const [submittedReference, setSubmittedReference] = useState('')

  const selectedMake = form.make.trim()
  const imageCount = useMemo(() => Object.values(images).filter(Boolean).length, [images])
  const t = (value: string) => translatePublic(locale, value)
  const options: DealerFormOptions = {
    fuelTypes: localizedOptions(['Petrol', 'Diesel', 'Electric', 'Hybrid', 'Plug-in hybrid', 'Ethanol', 'Gas'], t),
    transmissions: localizedOptions(['Automatic', 'Manual'], t),
    bodyTypes: localizedOptions(['Estate', 'Sedan', 'Hatchback', 'SUV', 'Coupe', 'Convertible', 'Pickup', 'Minibus'], t),
    keyCounts: localizedOptions(['1', '2', '3 or more'], t),
    serviceBook: localizedOptions(['Yes', 'Partial', 'No'], t),
    yesNo: localizedOptions(['Yes', 'No'], t),
    yesNoUnknown: localizedOptions(['Yes', 'No', 'I do not know'], t),
    preferredContact: localizedOptions(['Phone', 'SMS', 'Email'], t),
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setError('')
  }

  function validate(targetStep = step) {
    if (targetStep === 0) {
      const vin = normalizeVin(form.vin)
      if (!vin) return t('Enter VIN/chassis number.')
      if (!isValidVin(vin)) return t('VIN must be exactly 17 characters and cannot contain I, O or Q.')
    }
    if (targetStep === 1) {
      if (!selectedMake) return t('Enter make.')
      if (!form.model.trim()) return t('Enter model.')
      if (!form.modelYear) return t('Select model year.')
    }
    if (targetStep === 2) {
      if (!positiveInteger(form.mileageKm)) return t('Enter mileage in kilometres.')
      if (!form.fuelType || !form.transmission || !form.bodyType || !form.color) return t('Fill in fuel, transmission, body type and colour.')
      if (!form.keyCount || !form.serviceBook || !form.summerTires || !form.winterTires || !form.inspected || !form.drivable || !form.financeStatus) return t('Fill in all required vehicle details.')
    }
    if (targetStep === 3) {
      if (!form.visibleDamage || !form.cosmeticDamage || !form.accidentHistory || !form.warningLights || !form.technicalProblems || !form.engineTransmissionProblems || !form.rust || !form.servicedBySchedule || !form.smokeFree || !form.interiorDamage) return t('Fill in vehicle condition and history.')
      if (form.visibleDamage === options.yesNo[0].value && form.damageDescription.trim().length < 3) return t('Describe the damage.')
    }
    if (targetStep === 4) {
      if (!form.firstName.trim() || !form.lastName.trim()) return t('Fill in first and last name.')
      if (!isValidEmail(form.email)) return t('Enter a valid email address.')
      if (form.phone.trim().length < 6) return t('Enter phone number.')
      if (!form.postalCode.trim() || !form.city.trim() || !form.countryCode || !form.preferredContact) return t('Fill in country, postal code, city and preferred contact method.')
      if (!form.privacyAccepted) return t('Accept the privacy policy and terms.')
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

  function updateImage(key: ImageKey, file: File | null) {
    if (file && file.size > 25 * 1024 * 1024) {
      setError(t('The image is larger than 25 MB.'))
      return
    }
    if (file && !isSupportedClientImage(file)) {
      setError(t('The selected file is not a supported image.'))
      return
    }
    setImages((current) => ({ ...current, [key]: file }))
    setError('')
  }

  async function submit() {
    const message = validate(4)
    if (message) {
      setError(message)
      return
    }
    setSubmitting(true)
    setSubmitProgress(1)
    setSubmitPhase('uploading')
    setError('')
    const body = new FormData()
    for (const [key, value] of Object.entries(form)) {
      body.append(key, typeof value === 'boolean' ? String(value) : value)
    }
    body.set('vin', normalizeVin(form.vin))
    body.set('make', selectedMake)
    body.set('makeSource', 'manual')
    body.set('sourceCountryCode', form.countryCode)
    body.set('sourceLocale', locale)
    for (const key of imageFields) {
      const file = images[key]
      if (file) body.append(`image_${key}`, file)
    }

    try {
      const result = await submitDealerRequest(body, {
        onUploadProgress: (progress) => setSubmitProgress(progress),
        onProcessing: () => setSubmitPhase('processing'),
      }, {
        generic: copy.submitError,
        timeout: t('The request took too long. Please try again.'),
      })
      setSubmitProgress(100)
      await wait(300)
      setSubmittedReference(result.reference || '')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : copy.submitError)
    } finally {
      setSubmitting(false)
      setSubmitProgress(0)
      setSubmitPhase('uploading')
    }
  }

  if (submittedReference) {
    return (
      <div data-step="submitted" className="dealer-lead-form min-w-0 w-full max-w-[calc(100vw-72px)] rounded-[18px] bg-white p-5 shadow-[0_18px_50px_rgba(16,24,40,.14)] sm:max-w-none">
        <h2 className="text-2xl font-semibold tracking-[-.04em]">{copy.successTitle || t('Your vehicle request has been sent')}</h2>
        <p className="mt-3 text-sm leading-6 text-[#475467]">
          {t('Reference number')}: <strong className="text-[#101828]">{submittedReference}</strong>
        </p>
      </div>
    )
  }

  return (
    <div data-step={step} className={`dealer-lead-form min-w-0 w-full bg-white shadow-[0_18px_50px_rgba(16,24,40,.14)] ${
      step === 0
        ? 'max-w-[calc(100vw-72px)] rounded-[18px] p-4 sm:max-w-none sm:p-5'
        : 'rounded-[18px] border border-[#d9e2ef] p-4 sm:p-5'
    }`}>
      <h2 className="max-w-full text-lg font-semibold leading-tight tracking-[-.025em] [overflow-wrap:anywhere] sm:text-xl sm:tracking-[-.035em]">{copy.formTitle}</h2>
      <p className="mt-2 text-xs leading-5 text-[#667085]">{copy.formText}</p>

      <div className="mt-5">
        {step === 0 ? <VinStep form={form} update={update} t={t} /> : null}
        {step === 1 ? <VehicleIdentityStep form={form} update={update} selectedMake={selectedMake} t={t} /> : null}
        {step === 2 ? <DetailsStep form={form} update={update} t={t} options={options} /> : null}
        {step === 3 ? <ConditionStep form={form} update={update} images={images} updateImage={updateImage} t={t} options={options} /> : null}
        {step === 4 ? <ContactStep form={form} update={update} selectedMake={selectedMake} imageCount={imageCount} t={t} options={options} locale={locale} /> : null}
      </div>

      {error ? <p className="mt-4 rounded-[12px] bg-[#fff4ed] px-3 py-2 text-xs font-semibold text-[#b42318]">{error}</p> : null}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        {step > 0 ? (
          <button type="button" className="min-h-11 flex-1 rounded-full border border-[#b9c3d1] px-4 text-sm font-bold text-[#344054]" onClick={() => setStep((current) => current - 1)}>
            {t('Back')}
          </button>
        ) : null}
        {step < 4 ? (
          <button type="button" className="min-h-11 flex-1 rounded-full bg-[#0866ff] px-4 text-sm font-bold text-white" onClick={next}>
            {step === 0 ? t('Next: Make and model') : step === 1 ? t('Next: Vehicle details') : step === 2 ? t('Next: Condition and history') : t('Next: Contact details')}
          </button>
        ) : (
          <button type="button" disabled={submitting} className="min-h-11 flex-1 rounded-full bg-[#0866ff] px-4 text-sm font-bold text-white disabled:bg-[#98a2b3]" onClick={submit}>
            {submitting ? copy.sending : t('Send request to dealers')}
          </button>
        )}
      </div>

      {submitting ? <SubmissionProgress progress={submitProgress} phase={submitPhase} t={t} /> : null}
    </div>
  )
}

function VinStep({ form, update, t }: StepProps & { t: Translator }) {
  return (
    <section>
      <h3 className="text-lg font-semibold tracking-[-.025em]">{t('VIN/chassis number')}</h3>
      <p className="mt-2 text-xs leading-5 text-[#667085]">{t('Enter the VIN/chassis number to continue to the next step.')}</p>
      <div className="mt-4">
        <Field label={t('VIN/chassis number')} value={form.vin} placeholder={t('Enter 17 characters')} onChange={(value) => update('vin', normalizeVin(value))} maxLength={17} required />
      </div>
    </section>
  )
}

function VehicleIdentityStep({ form, update, selectedMake, t }: StepProps & { selectedMake: string; t: Translator }) {
  return (
    <section>
      <h3 className="text-xl font-semibold tracking-[-.025em]">{t('Which vehicle do you want to sell?')}</h3>
      <div className="mt-4 grid gap-3 xl:grid-cols-3">
        <Field label={t('Make')} value={form.make} placeholder={t('For example Volvo')} onChange={(value) => update('make', value)} />
        <Field label={t('Model')} value={form.model} placeholder={selectedMake ? t('For example {make} model').replace('{make}', selectedMake) : t('For example XC60')} onChange={(value) => update('model', value)} />
        <Select label={t('Model year')} value={form.modelYear} onChange={(value) => update('modelYear', value)} options={years} placeholder={t('Select model year')} />
      </div>
    </section>
  )
}

function DetailsStep({ form, update, t, options }: StepProps & { t: Translator; options: DealerFormOptions }) {
  return (
    <section>
      <h3 className="text-lg font-semibold tracking-[-.025em]">{t('Tell us about the vehicle')}</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <Field label={t('Mileage in kilometres')} value={form.mileageKm} placeholder={t('For example 125000')} onChange={(value) => update('mileageKm', digits(value))} inputMode="numeric" />
        <Select label={t('Fuel')} value={form.fuelType} onChange={(value) => update('fuelType', value)} options={options.fuelTypes} placeholder={t('Select')} />
        <Select label={t('Transmission')} value={form.transmission} onChange={(value) => update('transmission', value)} options={options.transmissions} placeholder={t('Select')} />
        <Select label={t('Body type')} value={form.bodyType} onChange={(value) => update('bodyType', value)} options={options.bodyTypes} placeholder={t('Select')} />
        <Field label={t('Colour')} value={form.color} placeholder={t('For example white')} onChange={(value) => update('color', value)} />
        <Field label={t('Engine power, optional')} value={form.enginePower} placeholder={t('hp or kW')} onChange={(value) => update('enginePower', value)} />
        <Field label={t('Previous owners, optional')} value={form.previousOwners} placeholder={t('For example 2')} onChange={(value) => update('previousOwners', digits(value))} inputMode="numeric" />
        <Select label={t('Number of keys')} value={form.keyCount} onChange={(value) => update('keyCount', value)} options={options.keyCounts} placeholder={t('Select')} />
        <Select label={t('Service book')} value={form.serviceBook} onChange={(value) => update('serviceBook', value)} options={options.serviceBook} placeholder={t('Select')} />
        <Field label={t('Last service, optional')} value={form.lastService} placeholder={t('For example 2025-11 or 120000 km')} onChange={(value) => update('lastService', value)} />
        <Select label={t('Summer tyres')} value={form.summerTires} onChange={(value) => update('summerTires', value)} options={options.yesNo} placeholder={t('Select')} />
        <Select label={t('Winter tyres')} value={form.winterTires} onChange={(value) => update('winterTires', value)} options={options.yesNo} placeholder={t('Select')} />
        <Select label={t('Has the vehicle passed inspection?')} value={form.inspected} onChange={(value) => update('inspected', value)} options={options.yesNo} placeholder={t('Select')} />
        <Select label={t('Is the vehicle drivable?')} value={form.drivable} onChange={(value) => update('drivable', value)} options={options.yesNo} placeholder={t('Select')} />
        <Select label={t('Financed, leased or remaining credit?')} value={form.financeStatus} onChange={(value) => update('financeStatus', value)} options={options.yesNoUnknown} placeholder={t('Select')} />
      </div>
    </section>
  )
}

function ConditionStep({ form, update, images, updateImage, t, options }: StepProps & { images: Partial<Record<ImageKey, File | null>>; updateImage: (key: ImageKey, file: File | null) => void; t: Translator; options: DealerFormOptions }) {
  const imageLabels: Record<ImageKey, string> = {
    front: t('Front'),
    rear: t('Rear'),
    leftSide: t('Left side'),
    rightSide: t('Right side'),
    interior: t('Interior'),
    odometer: t('Odometer'),
    damage: t('Any damage'),
  }

  return (
    <section>
      <h3 className="text-lg font-semibold tracking-[-.025em]">{t('Vehicle condition')}</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <Select label={t('Any visible damage?')} value={form.visibleDamage} onChange={(value) => update('visibleDamage', value)} options={options.yesNo} placeholder={t('Select')} />
        <Field label={t('Describe the damage')} value={form.damageDescription} placeholder={t('Short description')} onChange={(value) => update('damageDescription', value)} />
        <Select label={t('Scratches, dents or paint damage?')} value={form.cosmeticDamage} onChange={(value) => update('cosmeticDamage', value)} options={options.yesNo} placeholder={t('Select')} />
        <Select label={t('Has the vehicle been in an accident?')} value={form.accidentHistory} onChange={(value) => update('accidentHistory', value)} options={options.yesNoUnknown} placeholder={t('Select')} />
        <Select label={t('Any warning lights?')} value={form.warningLights} onChange={(value) => update('warningLights', value)} options={options.yesNo} placeholder={t('Select')} />
        <Select label={t('Any technical problems?')} value={form.technicalProblems} onChange={(value) => update('technicalProblems', value)} options={options.yesNo} placeholder={t('Select')} />
        <Select label={t('Engine or transmission problems?')} value={form.engineTransmissionProblems} onChange={(value) => update('engineTransmissionProblems', value)} options={options.yesNo} placeholder={t('Select')} />
        <Select label={t('Any rust?')} value={form.rust} onChange={(value) => update('rust', value)} options={options.yesNo} placeholder={t('Select')} />
        <Select label={t('Serviced according to recommended intervals?')} value={form.servicedBySchedule} onChange={(value) => update('servicedBySchedule', value)} options={options.yesNoUnknown} placeholder={t('Select')} />
        <Select label={t('Smoke-free vehicle?')} value={form.smokeFree} onChange={(value) => update('smokeFree', value)} options={options.yesNo} placeholder={t('Select')} />
        <Select label={t('Interior damage or heavy wear?')} value={form.interiorDamage} onChange={(value) => update('interiorDamage', value)} options={options.yesNo} placeholder={t('Select')} />
      </div>
      <label className="mt-3 block text-xs font-bold text-[#344054]">
        {t('Anything else the dealer should know')}
        <textarea className="dealer-lead-input mt-1 min-h-20 w-full rounded-[12px] border border-[#b9c3d1] px-3 py-2 text-sm font-normal text-[#101828] outline-none transition placeholder:text-[#7a8699] placeholder:font-normal focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/12" placeholder={t('For example import, extra equipment or upcoming service')} value={form.otherNotes} onChange={(event) => update('otherNotes', event.target.value)} />
      </label>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {imageFields.map((key) => (
          <ImageUploadCard
            key={key}
            imageKey={key}
            label={imageLabels[key]}
            file={images[key] || null}
            onChange={(file) => updateImage(key, file)}
            t={t}
          />
        ))}
      </div>
    </section>
  )
}

function ContactStep({ form, update, selectedMake, imageCount, t, options, locale }: StepProps & { selectedMake: string; imageCount: number; t: Translator; options: DealerFormOptions; locale: PublicFormLocale }) {
  return (
    <section>
      <h3 className="text-lg font-semibold tracking-[-.025em]">{t('Your contact details')}</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <Field label={t('First name')} value={form.firstName} placeholder={t('First name')} onChange={(value) => update('firstName', value)} />
        <Field label={t('Last name')} value={form.lastName} placeholder={t('Last name')} onChange={(value) => update('lastName', value)} />
        <Field label={t('Email')} value={form.email} placeholder={t('name@example.com')} onChange={(value) => update('email', value)} type="email" />
        <Field label={t('Phone number')} value={form.phone} placeholder={t('Phone number')} onChange={(value) => update('phone', value)} type="tel" />
        <Field label={t('Postal code')} value={form.postalCode} placeholder={t('Postal code')} onChange={(value) => update('postalCode', value)} />
        <Field label={t('City')} value={form.city} placeholder={t('City')} onChange={(value) => update('city', value)} />
        <CountrySelect label={t('Country')} value={form.countryCode} onChange={(value) => update('countryCode', value)} placeholder={t('Select country')} locale={locale} />
        <Select label={t('Preferred contact method')} value={form.preferredContact} onChange={(value) => update('preferredContact', value)} options={options.preferredContact} placeholder={t('Select')} />
      </div>
      <div className="mt-4 rounded-[14px] bg-[#f8fbff] p-3 text-xs leading-5 text-[#344054]">
        <strong className="block text-sm text-[#101828]">{t('Summary')}</strong>
        <span className="block">{selectedMake} {form.model} {form.modelYear}</span>
        <span className="block">{t('Mileage')}: {form.mileageKm || '-'} km</span>
        <span className="block">{t('Fuel')}: {form.fuelType || '-'}</span>
        <span className="block">{t('Transmission')}: {form.transmission || '-'}</span>
        <span className="block">{t('Condition')}: {form.visibleDamage === options.yesNo[0].value ? t('Damage reported') : t('No visible damage specified')}</span>
        <span className="block">{t('Uploaded photos')}: {imageCount}</span>
        <span className="block">{t('Contact')}: {form.firstName} {form.lastName}, {form.email}, {form.phone}</span>
        <span className="block">{t('Country')}: {form.countryCode ? getEuCountryName(form.countryCode, locale) : '-'}</span>
      </div>
      <label className="mt-4 flex gap-3 text-xs font-semibold leading-5 text-[#344054]">
        <input type="checkbox" className="mt-1 h-4 w-4 rounded border-[#98a2b3]" checked={form.privacyAccepted} onChange={(event) => update('privacyAccepted', event.target.checked)} />
        {t('I accept the privacy policy and terms.')}
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

function Select({ label, value, options, onChange, placeholder = 'Välj' }: { label: string; value: string; options: DealerFormOption[] | string[]; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="block text-xs font-bold text-[#344054]">
      {label}
      <span className="relative mt-1 block">
      <select className={`dealer-lead-input h-11 w-full rounded-[12px] border border-[#b9c3d1] bg-white px-3 text-sm font-normal outline-none transition focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/12 ${value ? 'text-[#101828]' : 'text-[#7a8699]'}`} style={{ WebkitTextFillColor: value ? '#101828' : '#7a8699', fontWeight: 400 }} value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="" className="font-normal text-[#7a8699]">{placeholder}</option>
        {options.map((option) => {
          const value = typeof option === 'string' ? option : option.value
          const label = typeof option === 'string' ? option : option.label
          return <option key={value} value={value}>{label}</option>
        })}
      </select>
      </span>
    </label>
  )
}

function CountrySelect({ label, value, onChange, placeholder, locale }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; locale: PublicFormLocale }) {
  return (
    <label className="block text-xs font-bold text-[#344054]">
      {label}
      <span className="relative mt-1 block">
        <select className={`dealer-lead-input h-11 w-full rounded-[12px] border border-[#b9c3d1] bg-white px-3 text-sm font-normal outline-none transition focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/12 ${value ? 'text-[#101828]' : 'text-[#7a8699]'}`} style={{ WebkitTextFillColor: value ? '#101828' : '#7a8699', fontWeight: 400 }} value={value} onChange={(event) => onChange(event.target.value)}>
          <option value="" className="font-normal text-[#7a8699]">{placeholder}</option>
          {ACTIVE_MARKET_COUNTRIES.map(([code]) => (
            <option key={code} value={code}>{getEuCountryName(code, locale)}</option>
          ))}
        </select>
      </span>
    </label>
  )
}

function ImageUploadCard({ imageKey, label, file, onChange, t }: { imageKey: ImageKey; label: string; file: File | null; onChange: (file: File | null) => void; t: Translator }) {
  const pickerId = `dealer-image-${imageKey}-picker`
  const cameraId = `dealer-image-${imageKey}-camera`
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function readSelectedFile(files: FileList | null) {
    onChange(files?.[0] || null)
  }

  return (
    <article className="min-w-0 overflow-hidden rounded-[14px] border border-[#c7d2e2] bg-white shadow-[0_4px_14px_rgba(16,24,40,.06)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#eef5ff]">
        {previewUrl ? (
          <div
            role="img"
            aria-label={`${t('Photo selected')}: ${label}`}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${JSON.stringify(previewUrl)})` }}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-3 text-center text-[#667085]">
            <ImagePlus aria-hidden="true" className="h-7 w-7 stroke-[1.6] text-[#0866ff]" />
            <span className="text-[11px] font-normal leading-4">{t('No photo selected')}</span>
          </div>
        )}
        {file ? (
          <button
            type="button"
            title={t('Remove photo')}
            aria-label={`${t('Remove photo')}: ${label}`}
            className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white text-[#101828] shadow-[0_3px_12px_rgba(16,24,40,.2)] transition hover:bg-[#f2f4f7]"
            onClick={() => onChange(null)}
          >
            <Trash2 aria-hidden="true" className="h-4 w-4 stroke-[1.8]" />
          </button>
        ) : null}
      </div>
      <div className="p-2.5">
        <h4 className="truncate text-xs font-bold text-[#344054]">{label}</h4>
        <p className="mt-1 truncate text-[10px] font-normal text-[#667085]" title={file?.name}>
          {file ? `${file.name} · ${formatFileSize(file.size)}` : t('JPG, PNG, WebP or AVIF, max 25 MB.')}
        </p>
        <div className="mt-2 grid gap-1.5">
          <input
            id={pickerId}
            className="sr-only"
            type="file"
            accept="image/*,.jpg,.jpeg,.png,.webp,.avif"
            onClick={(event) => { event.currentTarget.value = '' }}
            onChange={(event) => readSelectedFile(event.target.files)}
          />
          <label htmlFor={pickerId} className="flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[#0866ff] px-2 text-[11px] font-bold text-white transition hover:bg-[#0759de]">
            <ImagePlus aria-hidden="true" className="h-4 w-4 stroke-[1.8]" />
            {file ? t('Replace photo') : t('Choose photo')}
          </label>
          <input
            id={cameraId}
            className="sr-only"
            type="file"
            accept="image/*"
            capture="environment"
            onClick={(event) => { event.currentTarget.value = '' }}
            onChange={(event) => readSelectedFile(event.target.files)}
          />
          <label htmlFor={cameraId} className="flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-[#0866ff] bg-white px-2 text-[11px] font-bold text-[#0866ff] transition hover:bg-[#eef5ff]">
            <Camera aria-hidden="true" className="h-4 w-4 stroke-[1.8]" />
            {t('Take photo')}
          </label>
        </div>
      </div>
    </article>
  )
}

function SubmissionProgress({ progress, phase, t }: { progress: number; phase: SubmitPhase; t: Translator }) {
  const roundedProgress = Math.max(1, Math.min(100, Math.round(progress)))
  const title = phase === 'uploading' ? t('Uploading details and photos') : t('Reviewing vehicle details and processing photos')
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#101828]/55 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby="dealer-submit-progress-title">
      <div className="w-full max-w-md rounded-[18px] bg-white p-5 shadow-[0_24px_80px_rgba(16,24,40,.28)] sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#eaf2ff] text-[#0866ff]">
            <LoaderCircle aria-hidden="true" className="h-6 w-6 animate-spin stroke-[1.8]" />
          </span>
          <div className="min-w-0">
            <h2 id="dealer-submit-progress-title" className="text-lg font-semibold leading-6 text-[#101828]">{t('Preparing your request')}</h2>
            <p className="mt-1 text-sm font-normal leading-5 text-[#667085]">{title}</p>
          </div>
        </div>
        <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-[#e4e7ec]" aria-hidden="true">
          <div className="h-full rounded-full bg-[#0866ff] transition-[width] duration-300 ease-out" style={{ width: `${roundedProgress}%` }} />
        </div>
        <div className="mt-2 flex items-center justify-between gap-3 text-xs">
          <span className="font-normal text-[#667085]">{t('Please wait. Keep this page open until the request is sent.')}</span>
          <strong className="shrink-0 text-[#101828]" aria-live="polite">{roundedProgress}%</strong>
        </div>
      </div>
    </div>
  )
}

function submitDealerRequest(body: FormData, handlers: { onUploadProgress: (progress: number) => void; onProcessing: () => void }, messages: { generic: string; timeout: string }): Promise<{ reference?: string }> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    let processingProgress = 78
    let processingTimer: number | undefined

    function stopTimer() {
      if (processingTimer !== undefined) window.clearInterval(processingTimer)
    }

    request.open('POST', '/api/dealer-offer-requests')
    request.responseType = 'json'
    request.timeout = 5 * 60 * 1000
    request.upload.addEventListener('progress', (event) => {
      if (!event.lengthComputable || event.total <= 0) return
      handlers.onUploadProgress(Math.max(3, Math.min(75, Math.round((event.loaded / event.total) * 75))))
    })
    request.upload.addEventListener('load', () => {
      handlers.onProcessing()
      handlers.onUploadProgress(processingProgress)
      processingTimer = window.setInterval(() => {
        processingProgress = Math.min(94, processingProgress + 1)
        handlers.onUploadProgress(processingProgress)
      }, 700)
    })
    request.addEventListener('load', () => {
      stopTimer()
      const result = request.response && typeof request.response === 'object' ? request.response as { reference?: string } : null
      if (request.status >= 200 && request.status < 300) {
        resolve({ reference: result?.reference })
        return
      }
      reject(new Error(messages.generic))
    })
    request.addEventListener('error', () => {
      stopTimer()
      reject(new Error(messages.generic))
    })
    request.addEventListener('timeout', () => {
      stopTimer()
      reject(new Error(messages.timeout))
    })
    request.send(body)
  })
}

function isSupportedClientImage(file: File) {
  const type = file.type.toLowerCase()
  if (['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(type)) return true
  return !type && /\.(jpe?g|png|webp|avif)$/i.test(file.name)
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function wait(milliseconds: number) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds))
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

function localizedOptions(values: string[], translate: Translator): DealerFormOption[] {
  return values.map((value) => ({ value, label: translate(value) }))
}
