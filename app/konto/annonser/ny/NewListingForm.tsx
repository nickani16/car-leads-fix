'use client'

import { DragEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  ImagePlus,
  Search,
  Star,
  Trash2,
  X,
} from 'lucide-react'
import {
  formatListingPriceForMarket,
  marketplaceCategories,
} from '@/lib/marketplace-pricing'
import { normalizeBillingMarket } from '@/lib/billing/product-catalog'
import {
  euCurrencies,
  currencyForCountry,
  getMarketplaceCategory,
  marketplaceLanguage,
  normalizeMarketplaceCategory,
  type MarketplaceCategorySlug,
} from '@/lib/marketplace'
import { translatePublic, type PublicLocale } from '@/lib/public-i18n'
import { vehicleValueInEnglish } from '@/lib/vehicle-translation'
import {
  categoryTechnicalFields,
  identifierSelectOptions,
  listingColorOptions,
  type ListingOption,
  type ListingTechnicalField,
} from '@/lib/listing-form-options'
import {
  equipmentGroupsForCategory,
  equipmentLabel,
  equipmentOptionByKey,
} from '@/lib/listing-equipment'
import {
  listingRequirementsByCategory,
  sellerListingConfirmationKeys,
} from '@/lib/marketplace-security'
import {
  normalizePostalCode,
  validatePostalCode,
} from '@/lib/postal-code-validation'
import { activeMarketCountries, getEuCountryName } from '@/lib/eu-countries'
import {
  getMarketplaceCountryLocations,
  marketplaceMunicipalityLabel,
  marketplaceRegionLabel,
} from '@/lib/marketplace-locations'

type StepId = 0 | 1 | 2 | 3 | 4
type Values = Record<string, string>
type UploadImage = {
  id: string
  file: File
  preview: string
  name: string
  size: number
}
type ListingCreationError = {
  error?: string
  step?: StepId
  field?: string
}

const steps = [
  'Kategori & grundinfo',
  'Tekniska uppgifter',
  'Bilder',
  'Annonsförhandsvisning',
  'Paket & publicering',
] as const
const decimalTechnicalFieldNames = new Set(['engineLiters', 'cargoVolumeM3'])
const swedishMileageFactor = 10
const minModelYear = 1950
const maxModelYear = 2027
const listingRequestTimeoutMs = 240_000
const modelYearOptions = Array.from(
  { length: maxModelYear - minModelYear + 1 },
  (_, index) => String(maxModelYear - index),
)

const packageCopy = {
  free_7d: {
    title: 'Gratis',
    days: '7 dagar',
    text: 'Bra för att testa Autorell och komma igång snabbt.',
  },
  standard_15d: {
    title: 'Standard',
    days: '15 dagar',
    text: 'Mer synlighet och längre annonsperiod för seriös försäljning.',
  },
  premium_30d: {
    title: 'Premium',
    days: '30 dagar',
    text: 'Bästa synlighet, prioritet och längst annonsperiod.',
  },
}

export default function NewListingForm({
  accountType,
  countryCode,
  defaultCategory,
  locale,
}: {
  accountType: 'private' | 'business'
  countryCode: string
  defaultCategory: string
  locale: PublicLocale
}) {
  const router = useRouter()
  const [step, setStep] = useState<StepId>(0)
  const [listingCountryCode, setListingCountryCode] = useState(countryCode.toUpperCase())
  const [category, setCategory] = useState<MarketplaceCategorySlug>(
    normalizeMarketplaceCategory(defaultCategory),
  )
  const createInitialValues = () => ({
    packageId: 'free_7d',
    currency: currencyForCountry(countryCode),
    phoneVisibility: 'public',
  })
  const [values, setValues] = useState<Values>(createInitialValues)
  const [equipment, setEquipment] = useState<string[]>([])
  const [equipmentSearch, setEquipmentSearch] = useState('')
  const [images, setImages] = useState<UploadImage[]>([])
  const [mainImageId, setMainImageId] = useState('')
  const [openField, setOpenField] = useState<string | null>(null)
  const [draggedImageId, setDraggedImageId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [draftNotice, setDraftNotice] = useState(false)
  const draftRestored = useRef(false)
  const draftImagesRestored = useRef(false)
  const draftKey = `autorell-listing-draft:${countryCode.toUpperCase()}`
  const selectedPricing =
    marketplaceCategories.find((item) => item.slug === category) ||
    marketplaceCategories[0]
  const copy = getListingFormCopy(locale)
  const usesSwedishMileage = listingCountryCode.toUpperCase() === 'SE'
  const mileageUnit = usesSwedishMileage ? 'mil' : 'km'
  const selectedCategoryLabel = categoryLabelForLocale(category, locale)
  const progress = Math.round(((step + 1) / steps.length) * 100)
  const locationMarket = useMemo(
    () => getMarketplaceCountryLocations(listingCountryCode),
    [listingCountryCode],
  )
  const municipalityOptions = useMemo(() => {
    const region = locationMarket.regions.find((item) => item.name === values.county)
    return region
      ? [...region.municipalities]
      : locationMarket.regions.flatMap((item) => item.municipalities)
  }, [locationMarket, values.county])
  const orderedImages = useMemo(() => {
    if (!mainImageId) return images
    const main = images.find((image) => image.id === mainImageId)
    return main
      ? [main, ...images.filter((image) => image.id !== mainImageId)]
      : images
  }, [images, mainImageId])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(draftKey)
        if (saved) {
          const draft = JSON.parse(saved) as { step?: StepId; country?: string; category?: string; values?: Values; equipment?: string[] }
          if (draft.values) setValues((current) => ({ ...current, ...draft.values }))
          if (draft.country) setListingCountryCode(draft.country)
          if (draft.category) setCategory(normalizeMarketplaceCategory(draft.category))
          if (draft.equipment) setEquipment(draft.equipment)
          if (typeof draft.step === 'number') setStep(Math.min(4, Math.max(0, draft.step)) as StepId)
          setDraftNotice(true)
        }
      } catch {
        // A corrupt browser draft must never block the form.
      }
      draftRestored.current = true
    }, 0)
    return () => window.clearTimeout(timeout)
  }, [draftKey])

  useEffect(() => {
    let active = true
    void loadDraftImages(draftKey).then((savedImages) => {
      if (!active) return
      if (savedImages.length) {
        const restored = savedImages.map((item) => ({
          id: item.id,
          file: item.file,
          name: item.file.name,
          size: item.file.size,
          preview: URL.createObjectURL(item.file),
        }))
        setImages(restored)
        setMainImageId(restored[0]?.id || '')
      }
      draftImagesRestored.current = true
    })
    return () => { active = false }
  }, [draftKey])

  useEffect(() => {
    if (!draftRestored.current) return
    window.localStorage.setItem(draftKey, JSON.stringify({ step, country: listingCountryCode, category, values, equipment, savedAt: new Date().toISOString() }))
  }, [category, draftKey, equipment, listingCountryCode, step, values])

  useEffect(() => {
    if (!draftImagesRestored.current) return
    void saveDraftImages(draftKey, orderedImages)
  }, [draftKey, orderedImages])

  function setValue(name: string, value: string) {
    const nextValue = identifierFieldNames.has(name)
      ? normalizeIdentifierInput(value)
      : name === 'postalCode'
        ? normalizePostalCode(value, listingCountryCode)
        : smartTextFieldNames.has(name)
          ? formatSmartText(value)
          : value
    setValues((current) => ({ ...current, [name]: nextValue }))
  }

  function changeListingCountry(value: string) {
    const nextCountry = value.toUpperCase()
    setListingCountryCode(nextCountry)
    setValues((current) => ({
      ...current,
      currency: currencyForCountry(nextCountry),
      county: '',
      municipality: '',
      postalCode: '',
    }))
  }

  function changeLocationRegion(value: string) {
    const region = locationMarket.regions.find((item) => item.name === value)
    setValues((current) => ({
      ...current,
      county: value,
      municipality:
        region && current.municipality && !(region.municipalities as readonly string[]).includes(current.municipality)
          ? ''
          : current.municipality || '',
    }))
  }

  function changeLocationMunicipality(value: string) {
    const region = locationMarket.regions.find((item) =>
      (item.municipalities as readonly string[]).includes(value),
    )
    setValues((current) => ({
      ...current,
      municipality: value,
      county: region?.name || current.county || '',
    }))
  }

  function changeCategory(value: string) {
    setCategory(normalizeMarketplaceCategory(value))
    setValues((current) => ({
      packageId: current.packageId || 'free_7d',
      currency: current.currency || currencyForCountry(listingCountryCode),
    }))
    setEquipment([])
    setEquipmentSearch('')
    setOpenField(null)
  }

  function validate(targetStep = step) {
    const missing = (message: string) => {
      setError(message)
      return false
    }

    if (targetStep === 0) {
      if (!values.make) return missing('Fyll i märke eller tillverkare.')
      if (!values.model) return missing('Fyll i modell.')
      if (!values.modelYear) return missing('Fyll i årsmodell.')
      if (!isAllowedModelYear(values.modelYear)) return missing(`Välj årsmodell mellan ${minModelYear}+ och ${maxModelYear}.`)
      if (
        category !== 'agriculture' &&
        category !== 'construction' &&
        !['caravans', 'electric-bikes', 'e-scooters'].includes(category) &&
        !values.mileage
      ) {
        return missing('Fyll i kilometer.')
      }
      if ((category === 'agriculture' || category === 'construction') && !values.operatingHours) {
        return missing('Fyll i drifttimmar.')
      }
      if (!values.price) return missing('Fyll i pris.')
      if (!values.city) return missing('Fyll i ort.')
      if (
        values.postalCode &&
        !validatePostalCode(values.postalCode, listingCountryCode)
      ) {
        return missing('Postnumret verkar inte vara giltigt för valt land.')
      }
    }

    if (targetStep === 1) {
      const missingIdentifier = listingRequirementsByCategory[category].find(
        (item) => item.required && !values[item.key],
      )
      if (missingIdentifier) {
        return missing(`Fyll i ${missingIdentifier.label.toLowerCase()}.`)
      }
      const missingTechnical = categoryTechnicalFields[category].find(
        (field) => field.required && !values[field.name],
      )
      if (missingTechnical) {
        return missing(`Välj ${missingTechnical.label.toLowerCase()}.`)
      }
      if (!values.colorChoice) return missing('Välj färg.')
    }

    if (targetStep === 2 && images.length < 1) {
      return missing('Ladda upp minst en bild.')
    }

    if (targetStep === 4) {
      if (!values.packageId) return missing('Välj annonspaket.')
      if (values.listingTerms !== 'on') {
        return missing('Godkänn bekräftelsen innan publicering.')
      }
    }

    setError('')
    return true
  }

  function validateForSubmit() {
    const submitSteps: StepId[] = [0, 1, 2, 4]
    for (const targetStep of submitSteps) {
      if (!validate(targetStep)) {
        setStep(targetStep)
        return false
      }
    }
    return true
  }

  function applySubmissionError(
    result: ListingCreationError,
    fallback = 'Kunde inte skapa annonsen.',
  ) {
    const targetStep =
      typeof result.step === 'number' && result.step >= 0 && result.step <= 4
        ? (result.step as StepId)
        : null
    if (targetStep !== null) {
      setStep(targetStep)
    }
    const message = result.error || fallback
    const displayMessage = targetStep !== null ? `${copy.steps[targetStep]}: ${message}` : message
    setError(displayMessage)
    return displayMessage
  }

  function nextStep() {
    if (!validate(step)) return
    setStep((current) => Math.min(4, current + 1) as StepId)
  }

  function previousStep() {
    setError('')
    setStep((current) => Math.max(0, current - 1) as StepId)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (loading) return
    if (!validateForSubmit()) return
    setLoading(true)
    setError('')

    const form = new FormData()
    form.set('category', category)
    form.set('sellerCountryCode', listingCountryCode)
    Object.entries(values).forEach(([key, value]) => {
      if (value) form.set(key, key === 'mileage' ? mileageInputToKilometers(value, usesSwedishMileage) : value)
    })
    form.set(
      'color',
      values.colorChoice === 'other' ? 'Annan färg' : values.colorChoice || '',
    )
    form.set('equipmentKeys', JSON.stringify(equipment))
    sellerListingConfirmationKeys.forEach((key) => form.set(key, 'on'))
    orderedImages.forEach((image) => form.append('images', image.file, image.name))

    let response: Response
    try {
      response = await fetchWithTimeout('/api/account/listings', {
        method: 'POST',
        body: form,
      })
    } catch (caught) {
      setError(
        caught instanceof DOMException && caught.name === 'AbortError'
          ? 'Publiceringen tog för lång tid och avbröts. Dina uppgifter finns kvar; försök igen eller ladda upp färre bilder.'
          : 'Anslutningen avbröts. Dina uppgifter finns kvar; försök igen.',
      )
      setLoading(false)
      return
    }
    const result = (await response.json().catch(() => ({}))) as ListingCreationError & {
      listingId?: string
      requiresPayment?: boolean
      packageId?: string
    }
    if (!response.ok || !result.listingId) {
      applySubmissionError(result)
      setLoading(false)
      return
    }
    window.localStorage.removeItem(draftKey)
    void deleteDraftImages(draftKey)
    if (result.requiresPayment) {
      router.push(`/account/listings?choosePackage=1&listing=${encodeURIComponent(result.listingId)}`)
      return
    }
    router.push('/account/listings')
  }

  return (
    <form
      onSubmit={submit}
      className="overflow-hidden rounded-[28px] border border-[#dce3ee] bg-white shadow-[0_24px_80px_rgba(16,24,40,.08)]"
    >
      {draftNotice ? <div className="border-b border-[#bfdbfe] bg-[#eff6ff] px-5 py-3 text-sm text-[#1d4ed8] sm:px-7"><strong>Ditt utkast har återställts.</strong> Uppgifter och bilder sparas automatiskt i den här webbläsaren medan du arbetar.</div> : null}
      <div className="border-b border-[#e6ebf2] bg-[#fbfcff] p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#0866ff]">
              {copy.step} {step + 1} {copy.of} {steps.length}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#101828]">
              {copy.steps[step]}
            </h2>
          </div>
          <strong className="rounded-full bg-[#eef5ff] px-4 py-2 text-sm font-semibold text-[#0866ff]">
            {progress} % {copy.complete}
          </strong>
        </div>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#e8eef7]">
          <div
            className="h-full rounded-full bg-[#0866ff] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-5">
          {copy.steps.map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                if (index <= step || validate(step)) setStep(index as StepId)
              }}
              className={`min-h-11 rounded-[12px] px-3 py-2 text-left text-xs font-semibold leading-4 transition ${
                index === step
                  ? 'bg-[#0866ff] text-white'
                  : index < step
                    ? 'bg-[#eef5ff] text-[#0866ff]'
                    : 'bg-white text-[#667085]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 sm:p-7">
        {step === 0 ? (
          <StepShell title={copy.basicTitle} text={copy.basicText} columns="two">
            <div className="md:col-span-2">
              <SelectCard
                label={copy.category}
                value={selectedCategoryLabel}
                open={openField === 'category'}
                onToggle={() => setOpenField(openField === 'category' ? null : 'category')}
              >
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {marketplaceCategories.map((item) => (
                    <ChoiceButton
                      key={item.slug}
                      selected={category === item.slug}
                      onClick={() => changeCategory(item.slug)}
                    >
                      {categoryLabelForLocale(item.slug, locale)}
                    </ChoiceButton>
                  ))}
                </div>
              </SelectCard>
            </div>
            <Field name="make" label={copy.make} value={values.make || ''} onValueChange={setValue} required />
            <Field name="model" label={copy.model} value={values.model || ''} onValueChange={setValue} required />
            <Field name="variant" label={copy.variant} value={values.variant || ''} onValueChange={setValue} />
            <SelectNative name="modelYear" label={copy.modelYear} value={values.modelYear || ''} onValueChange={setValue} required>
              <option value="">{copy.choose}</option>
              {modelYearOptions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
              <option value="1950+">1950+</option>
            </SelectNative>
            {category !== 'agriculture' && category !== 'construction' ? (
              <Field
                name="mileage"
                label={copy.mileageLabel || mileageUnit}
                type="number"
                value={values.mileage || ''}
                onValueChange={setValue}
                required={!['caravans', 'electric-bikes', 'e-scooters'].includes(category)}
                step={usesSwedishMileage ? '1' : undefined}
              />
            ) : (
              <Field
                name="operatingHours"
                label={copy.operatingHours}
                type="number"
                value={values.operatingHours || ''}
                onValueChange={setValue}
                required
              />
            )}
            <Field name="price" label={copy.price} type="number" value={values.price || ''} onValueChange={setValue} required />
            <SelectNative name="currency" label={copy.currency} value={values.currency || 'EUR'} onValueChange={setValue}>
              {euCurrencies.map((currency) => (
                <option key={currency} value={currency}>{currency}</option>
              ))}
            </SelectNative>
            <SelectNative
              name="sellerCountryCode"
              label={copy.country}
              value={listingCountryCode}
              onValueChange={(_, value) => changeListingCountry(value)}
            >
              {activeMarketCountries.map(([code]) => (
                <option key={code} value={code}>
                  {getEuCountryName(code, locale)}
                </option>
              ))}
            </SelectNative>
            <SelectNative
              name="county"
              label={marketplaceRegionLabel(listingCountryCode, locale)}
              value={values.county || ''}
              onValueChange={(_, value) => changeLocationRegion(value)}
            >
              <option value="">{copy.choose}</option>
              {locationMarket.regions.map((region) => (
                <option key={region.name} value={region.name}>
                  {region.name}
                </option>
              ))}
            </SelectNative>
            <SelectNative
              name="municipality"
              label={marketplaceMunicipalityLabel(listingCountryCode, locale)}
              value={values.municipality || ''}
              onValueChange={(_, value) => changeLocationMunicipality(value)}
            >
              <option value="">{copy.choose}</option>
              {municipalityOptions.map((municipality) => (
                <option key={municipality} value={municipality}>
                  {municipality}
                </option>
              ))}
            </SelectNative>
            <Field name="city" label={copy.city} value={values.city || ''} onValueChange={setValue} required />
            <Field
              name="addressLine1"
              label={copy.streetAddress}
              value={values.addressLine1 || ''}
              onValueChange={setValue}
              autoComplete="street-address"
            />
            <Field
              name="postalCode"
              label={copy.postalCode}
              value={values.postalCode || ''}
              onValueChange={setValue}
              autoComplete="postal-code"
            />
          </StepShell>
        ) : null}

        {step === 1 ? (
          <StepShell title={copy.technicalTitle} text={copy.technicalText}>
            {listingRequirementsByCategory[category].map((item) => {
              const options = identifierSelectOptions[item.key]
              return options ? (
                <SelectCard
                  key={item.key}
                  label={localizeVehicleText(locale, item.label)}
                  value={localizeVehicleText(locale, labelFor(options, values[item.key])) || copy.choose}
                  open={openField === item.key}
                  onToggle={() => setOpenField(openField === item.key ? null : item.key)}
                  required={item.required}
                >
                  <ChoiceGrid
                    options={localizeOptions(locale, options)}
                    value={values[item.key] || ''}
                    onChange={(value) => {
                      setValue(item.key, value)
                      setOpenField(null)
                    }}
                  />
                </SelectCard>
              ) : (
                <Field
                  key={item.key}
                  name={item.key}
                  label={localizeVehicleText(locale, item.label)}
                  type={item.key === 'totalWeightKg' ? 'number' : 'text'}
                  value={values[item.key] || ''}
                  onValueChange={setValue}
                  required={item.required}
                  helper={identifierHelpText(category)}
                />
              )
            })}
            {categoryTechnicalFields[category].map((field) => (
              <TechnicalCard
                key={field.name}
                field={field}
                locale={locale}
                chooseLabel={copy.choose}
                value={values[field.name] || ''}
                open={openField === field.name}
                onToggle={() => setOpenField(openField === field.name ? null : field.name)}
                onChange={(value) => {
                  setValue(field.name, value)
                  setOpenField(null)
                }}
              />
            ))}
            <ColorCard
              open={openField === 'colorChoice'}
              onToggle={() => setOpenField(openField === 'colorChoice' ? null : 'colorChoice')}
              value={values.colorChoice || ''}
              locale={locale}
              chooseLabel={copy.chooseColor}
              onChange={(value) => {
                setValue('colorChoice', value)
                setOpenField(null)
              }}
            />
            <SelectCard
              label={copy.equipment}
              value={
                equipment.length
                  ? `${equipment.length} valda`
                  : copy.chooseEquipment
              }
              open={openField === 'equipment'}
              onToggle={() => setOpenField(openField === 'equipment' ? null : 'equipment')}
            >
              <EquipmentMultiSelect
                category={category}
                selectedKeys={equipment}
                search={equipmentSearch}
                onSearch={setEquipmentSearch}
                onSelectedKeys={setEquipment}
                locale={locale}
              />
            </SelectCard>
          </StepShell>
        ) : null}

        {step === 2 ? (
          <ImageStep
            copy={copy}
            images={images}
            mainImageId={mainImageId}
            draggedImageId={draggedImageId}
            onDraggedImageId={setDraggedImageId}
            onImages={setImages}
            onMainImageId={setMainImageId}
          />
        ) : null}

        {step === 3 ? (
          <PreviewStep
            locale={locale}
            copy={copy}
            categoryLabel={selectedCategoryLabel}
            values={values}
            equipment={equipment}
            images={orderedImages}
            onChange={setValue}
            usesSwedishMileage={usesSwedishMileage}
          />
        ) : null}

        {step === 4 ? (
          <PublishStep
            copy={copy}
            values={values}
            selectedPricing={selectedPricing}
            accountType={accountType}
            onChange={setValue}
            locale={locale}
            marketCode={listingCountryCode}
          />
        ) : null}

        {error ? (
          <p role="alert" className="mt-5 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-[#e6ebf2] bg-[#fbfcff] p-5 sm:flex-row sm:justify-between sm:p-7">
        <button
          type="button"
          onClick={previousStep}
          disabled={step === 0 || loading}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] border border-[#d7deed] bg-white px-5 font-semibold text-[#344054] disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" />
          {copy.back}
        </button>
        {step < 4 ? (
          <button
            type="button"
            onClick={nextStep}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] bg-[#0866ff] px-6 font-semibold text-white"
          >
            {copy.next}
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            disabled={loading}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] bg-[#0866ff] px-6 font-semibold text-white disabled:opacity-60"
          >
            {loading ? copy.publishing : copy.publish}
            <Check className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  )
}

function StepShell({
  title,
  text,
  columns = 'single',
  children,
}: {
  title: string
  text: string
  columns?: 'single' | 'two'
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="mb-6">
        <h3 className="text-xl font-semibold tracking-[-0.03em] text-[#101828]">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-[#667085]">{text}</p>
      </div>
      <div
        className={
          columns === 'two'
            ? 'grid gap-4 md:grid-cols-2'
            : 'grid gap-4'
        }
      >
        {children}
      </div>
    </section>
  )
}

function TechnicalCard({
  field,
  locale,
  chooseLabel,
  value,
  open,
  onToggle,
  onChange,
}: {
  field: ListingTechnicalField
  locale: PublicLocale
  chooseLabel: string
  value: string
  open: boolean
  onToggle: () => void
  onChange: (value: string) => void
}) {
  if (field.kind === 'date') {
    return (
      <DatePickerCard
        label={localizeVehicleText(locale, field.label)}
        value={value}
        locale={locale}
        open={open}
        onToggle={onToggle}
        onChange={onChange}
        required={field.required}
      />
    )
  }

  if (field.kind === 'text') {
    return (
      <Field
        name={field.name}
        label={localizeVehicleText(locale, field.label)}
        type="text"
        value={value}
        onValueChange={(_, next) => onChange(next)}
        required={field.required}
      />
    )
  }

  if (field.kind === 'number') {
    return (
      <Field
        name={field.name}
        label={`${localizeVehicleText(locale, field.label)}${field.suffix ? ` (${field.suffix})` : ''}${field.name === 'maxTrailerWeightKg' && !field.required ? ` (${localizeFormText(locale, 'valfritt', 'optional', 'optional')})` : ''}`}
        type="number"
        value={value}
        onValueChange={(_, next) => onChange(next)}
        required={field.required}
        min={field.min}
        max={field.max}
        step={decimalTechnicalFieldNames.has(field.name) ? '0.1' : '1'}
      />
    )
  }

  return (
    <SelectCard
      label={localizeVehicleText(locale, field.label)}
      value={localizeVehicleText(locale, labelFor(field.options || [], value)) || chooseLabel}
      open={open}
      onToggle={onToggle}
      required={field.required}
    >
      <ChoiceGrid
        options={localizeOptions(locale, field.options || [])}
        value={value}
        onChange={onChange}
      />
    </SelectCard>
  )
}

function SelectCard({
  label,
  value,
  open,
  onToggle,
  required,
  children,
}: {
  label: string
  value: string
  open: boolean
  onToggle: () => void
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="min-w-0 rounded-[18px] border border-[#d7deed] bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="flex min-h-16 w-full items-center justify-between gap-4 px-4 py-3 text-left"
      >
        <span className="min-w-0">
          <span className="block text-xs font-semibold uppercase tracking-[.12em] text-[#667085]">
            {label}{required ? ' *' : ''}
          </span>
          <strong className="mt-1 block min-w-0 whitespace-normal break-words text-sm font-semibold leading-5 text-[#101828]">
            {value}
          </strong>
        </span>
        <ChevronDown className={`h-5 w-5 shrink-0 text-[#667085] transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? <div className="border-t border-[#edf1f7] p-4">{children}</div> : null}
    </div>
  )
}

function DatePickerCard({
  label,
  value,
  locale,
  open,
  onToggle,
  onChange,
  required,
}: {
  label: string
  value: string
  locale: PublicLocale
  open: boolean
  onToggle: () => void
  onChange: (value: string) => void
  required?: boolean
}) {
  const selectedDate = parseIsoDate(value)
  const today = new Date()
  const [visibleYear, setVisibleYear] = useState(selectedDate?.getFullYear() || today.getFullYear())
  const [visibleMonth, setVisibleMonth] = useState(selectedDate?.getMonth() || today.getMonth())
  const monthLabel = new Intl.DateTimeFormat(locale, { month: 'long' }).format(new Date(visibleYear, visibleMonth, 1))
  const years = Array.from({ length: 90 }, (_, index) => today.getFullYear() + 1 - index)

  function moveMonth(delta: number) {
    const next = new Date(visibleYear, visibleMonth + delta, 1)
    setVisibleYear(next.getFullYear())
    setVisibleMonth(next.getMonth())
  }

  return (
    <div className="relative min-w-0 rounded-[18px] border border-[#d7deed] bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="flex min-h-16 w-full items-center justify-between gap-3 px-4 text-left"
        aria-expanded={open}
      >
        <span className="min-w-0">
          <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#667085]">
            {label}{required ? ' *' : ''}
          </span>
          <span className={`mt-1 block truncate text-sm font-semibold ${selectedDate ? 'text-[#101828]' : 'text-[#98a2b3]'}`}>
            {selectedDate ? formatDateChoice(selectedDate, locale) : localizeFormText(locale, 'Välj datum', 'Choose date', 'Datum wählen')}
          </span>
        </span>
        <CalendarDays className="h-5 w-5 shrink-0 text-[#667085]" />
      </button>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+8px)] z-40 w-full min-w-[290px] rounded-[18px] border border-[#d7deed] bg-white p-3 shadow-[0_20px_48px_rgba(16,24,40,.16)] sm:w-[360px]">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => moveMonth(-1)} className="grid h-10 w-10 place-items-center rounded-full border border-[#d7deed] text-[#344054]">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="grid min-w-0 flex-1 grid-cols-[1fr_auto] gap-2">
              <select
                value={visibleMonth}
                onChange={(event) => setVisibleMonth(Number(event.target.value))}
                className="h-10 rounded-[12px] border border-[#d7deed] bg-white px-3 text-sm font-semibold outline-none"
              >
                {Array.from({ length: 12 }, (_, month) => (
                  <option key={month} value={month}>
                    {new Intl.DateTimeFormat(locale, { month: 'long' }).format(new Date(visibleYear, month, 1))}
                  </option>
                ))}
              </select>
              <select
                value={visibleYear}
                onChange={(event) => setVisibleYear(Number(event.target.value))}
                className="h-10 rounded-[12px] border border-[#d7deed] bg-white px-3 text-sm font-semibold outline-none"
              >
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <button type="button" onClick={() => moveMonth(1)} className="grid h-10 w-10 place-items-center rounded-full border border-[#d7deed] text-[#344054]">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-3 text-center text-sm font-semibold capitalize text-[#101828]">{monthLabel} {visibleYear}</p>
          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase text-[#667085]">
            {weekdayLabels(locale).map((day) => <span key={day}>{day}</span>)}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {calendarDays(visibleYear, visibleMonth).map((day) => {
              const iso = toIsoDate(day.date)
              const active = value === iso
              return (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => {
                    onChange(iso)
                    onToggle()
                  }}
                  className={`h-10 rounded-[10px] text-sm font-semibold transition ${
                    active
                      ? 'bg-[#0866ff] text-white'
                      : day.inMonth
                        ? 'text-[#101828] hover:bg-[#eef5ff]'
                        : 'text-[#98a2b3] hover:bg-[#f8faff]'
                  }`}
                >
                  {day.date.getDate()}
                </button>
              )
            })}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-[#edf1f6] pt-3">
            <button type="button" onClick={() => onChange('')} className="text-sm font-semibold text-[#667085]">
              {localizeFormText(locale, 'Rensa', 'Clear', 'Leeren')}
            </button>
            <button type="button" onClick={() => {
              onChange(toIsoDate(today))
              onToggle()
            }} className="text-sm font-semibold text-[#0866ff]">
              {localizeFormText(locale, 'Idag', 'Today', 'Heute')}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function ChoiceGrid({
  options,
  value,
  onChange,
}: {
  options: ListingOption[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
      {options.map((option) => (
        <ChoiceButton
          key={option.value}
          selected={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </ChoiceButton>
      ))}
    </div>
  )
}

function ChoiceButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-12 min-w-0 items-center justify-between gap-3 rounded-[14px] border px-4 py-2.5 text-left text-sm font-semibold leading-5 transition ${
        selected
          ? 'border-[#0866ff] bg-[#eef5ff] text-[#0866ff]'
          : 'border-[#d7deed] bg-white text-[#344054] hover:border-[#0866ff]/50'
      }`}
    >
      <span className="min-w-0 whitespace-normal break-words">{children}</span>
      {selected ? <Check className="h-4 w-4 shrink-0" /> : null}
    </button>
  )
}

function EquipmentMultiSelect({
  category,
  selectedKeys,
  search,
  onSearch,
  onSelectedKeys,
  locale,
}: {
  category: MarketplaceCategorySlug
  selectedKeys: string[]
  search: string
  onSearch: (value: string) => void
  onSelectedKeys: (value: string[]) => void
  locale: PublicLocale
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
    <div className="space-y-5">
      {selectedOptions.length ? (
        <div className="flex flex-wrap gap-2">
          {selectedOptions.map((option) => (
            <span
              key={option.key}
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#eef5ff] px-3 py-1.5 text-sm font-semibold text-[#0866ff]"
            >
              {equipmentLabel(option, locale)}
              <button
                type="button"
                onClick={() => toggle(option.key)}
                aria-label={`${localizeFormText(locale, 'Ta bort', 'Remove', 'Entfernen')} ${equipmentLabel(option, locale)}`}
                className="rounded-full p-0.5 hover:bg-white"
              >
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
          placeholder={localizeFormText(locale, 'Sök utrustning, t.ex. dragkrok, navigation eller värmepump', 'Search equipment, e.g. towbar, navigation or heat pump', 'Ausstattung suchen, z. B. Anhängerkupplung, Navigation oder Wärmepumpe')}
          className="h-12 w-full rounded-[14px] border border-[#d7deed] bg-white pl-10 pr-4 text-sm font-medium outline-none focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
        />
      </label>

      <div className="max-h-[460px] space-y-5 overflow-y-auto pr-1">
        {groups.map((group) => {
          const options = group.options.filter((option) => {
            if (!normalizedSearch) return true
            return `${option.sv} ${option.en} ${option.de} ${option.key}`
              .toLowerCase()
              .includes(normalizedSearch)
          })
          if (!options.length) return null

          return (
            <section key={group.key} className="rounded-[16px] border border-[#edf1f6] bg-[#fbfcff] p-3">
              <h4 className="px-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#667085]">
                {locale === 'sv' ? group.sv : locale === 'de' || locale === 'at' ? group.de : translatePublic(locale, group.en)}
              </h4>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {options.map((option) => {
                  const checked = selected.has(option.key)
                  return (
                    <label
                      key={option.key}
                      className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-[12px] border px-3 py-2 text-sm font-semibold transition ${
                        checked
                          ? 'border-[#0866ff] bg-[#eef5ff] text-[#0866ff]'
                          : 'border-[#d7deed] bg-white text-[#344054] hover:border-[#0866ff]/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(option.key)}
                        className="h-4 w-4 shrink-0 accent-[#0866ff]"
                      />
                      <span className="min-w-0 leading-5">{equipmentLabel(option, locale)}</span>
                    </label>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

function ColorCard({
  open,
  onToggle,
  value,
  locale,
  chooseLabel,
  onChange,
}: {
  open: boolean
  onToggle: () => void
  value: string
  locale: PublicLocale
  chooseLabel: string
  onChange: (value: string) => void
}) {
  const label =
    value === 'other'
      ? localizeVehicleText(locale, 'Annan färg')
      : localizeVehicleText(locale, listingColorOptions.find((item) => item.value === value)?.label || '') || chooseLabel

  return (
    <SelectCard label={localizeVehicleText(locale, 'Färg')} value={label} open={open} onToggle={onToggle} required>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {listingColorOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex min-h-14 min-w-0 items-center gap-3 rounded-[16px] border px-3 py-2 text-left text-sm font-semibold leading-5 transition ${
              value === option.value
                ? 'border-[#0866ff] bg-[#eef5ff] text-[#0866ff] shadow-[0_10px_28px_rgba(8,102,255,.12)]'
                : 'border-[#d7deed] bg-white text-[#344054] hover:border-[#0866ff]/50'
            }`}
          >
            <span
              className="h-7 w-7 shrink-0 rounded-full border shadow-inner"
              style={{
                background: option.color,
                borderColor: option.border || 'rgba(16,24,40,.12)',
              }}
            />
            <span className="min-w-0 whitespace-normal break-words">
              {localizeVehicleText(locale, option.label)}
            </span>
            {value === option.value ? <Check className="ml-auto h-4 w-4 shrink-0" /> : null}
          </button>
        ))}
      </div>
    </SelectCard>
  )
}

function ImageStep({
  copy,
  images,
  mainImageId,
  draggedImageId,
  onDraggedImageId,
  onImages,
  onMainImageId,
}: {
  copy: ListingFormCopy
  images: UploadImage[]
  mainImageId: string
  draggedImageId: string
  onDraggedImageId: (value: string) => void
  onImages: (value: UploadImage[]) => void
  onMainImageId: (value: string) => void
}) {
  const [processingImages, setProcessingImages] = useState(false)
  const [imageErrors, setImageErrors] = useState<string[]>([])

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return
    setProcessingImages(true)
    setImageErrors([])
    const selected = Array.from(files).slice(0, 20 - images.length)
    const compressed: UploadImage[] = []
    const errors: string[] = []
    for (const file of selected) {
      try {
        compressed.push(await compressImage(file))
      } catch (error) {
        errors.push(`${file.name || 'Bild'}: ${imageErrorText(error)}`)
      }
    }
    const next = [...images, ...compressed]
    onImages(next)
    if (!mainImageId && next[0]) onMainImageId(next[0].id)
    setImageErrors(errors)
    setProcessingImages(false)
  }

  function removeImage(id: string) {
    const next = images.filter((image) => image.id !== id)
    onImages(next)
    if (mainImageId === id) onMainImageId(next[0]?.id || '')
  }

  function dropImage(event: DragEvent<HTMLDivElement>, targetId: string) {
    event.preventDefault()
    if (!draggedImageId || draggedImageId === targetId) return
    const from = images.findIndex((image) => image.id === draggedImageId)
    const to = images.findIndex((image) => image.id === targetId)
    if (from < 0 || to < 0) return
    const next = [...images]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onImages(next)
    onDraggedImageId('')
  }

  return (
    <section>
      <div className="mb-6">
        <h3 className="text-xl font-semibold tracking-[-0.03em] text-[#101828]">{copy.imagesTitle}</h3>
        <p className="mt-1 text-sm leading-6 text-[#667085]">
          {copy.imagesText}
        </p>
      </div>
      <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-[22px] border border-dashed border-[#a8b4c7] bg-[#fbfcff] p-6 text-center">
        <ImagePlus className="h-8 w-8 text-[#0866ff]" />
        <strong className="mt-3 font-semibold text-[#101828]">
          {processingImages ? 'Bearbetar bilder…' : copy.addImages}
        </strong>
        <span className="mt-1 text-sm text-[#667085]">{images.length}/20 {copy.uploaded}</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,.jpg,.jpeg,.png,.webp,.avif"
          multiple
          disabled={processingImages}
          onChange={(event) => {
            void handleFiles(event.target.files)
            event.currentTarget.value = ''
          }}
          className="sr-only"
        />
      </label>
      {imageErrors.length ? (
        <div className="mt-3 rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {imageErrors.map((message) => <p key={message}>{message}</p>)}
        </div>
      ) : null}
      {images.length ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => (
            <div
              key={image.id}
              draggable
              onDragStart={() => onDraggedImageId(image.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => dropImage(event, image.id)}
              className="overflow-hidden rounded-[18px] border border-[#d7deed] bg-white"
            >
              <Image src={image.preview} alt="" width={720} height={540} unoptimized className="aspect-[4/3] w-full object-cover" />
              <div className="flex items-center justify-between gap-2 p-3">
                <span className="flex min-w-0 items-center gap-2 text-xs font-semibold text-[#667085]">
                  <GripVertical className="h-4 w-4 shrink-0" />
                  {copy.image} {index + 1}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => onMainImageId(image.id)}
                    className={`inline-flex min-h-9 items-center gap-1 rounded-full px-3 text-xs font-semibold ${
                      mainImageId === image.id ? 'bg-[#0866ff] text-white' : 'bg-[#eef5ff] text-[#0866ff]'
                    }`}
                    aria-label={copy.chooseMainImage}
                  >
                    <Star className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {mainImageId === image.id ? copy.mainImage : copy.useAsMainImage}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(image.id)}
                    className="grid h-9 w-9 place-items-center rounded-full bg-red-50 text-red-600"
                    aria-label={copy.removeImage}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {mainImageId === image.id ? (
                <div className="border-t border-[#edf1f7] px-3 py-2 text-xs font-semibold text-[#0866ff]">
                  {copy.mainImage}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}

function PreviewStep({
  locale,
  copy,
  categoryLabel,
  values,
  equipment,
  images,
  onChange,
  usesSwedishMileage,
}: {
  locale: PublicLocale
  copy: ListingFormCopy
  categoryLabel: string
  values: Values
  equipment: string[]
  images: UploadImage[]
  onChange: (name: string, value: string) => void
  usesSwedishMileage: boolean
}) {
  const title = [values.make, values.model, values.variant].filter(Boolean).join(' ')
  const specs = [
    values.modelYear,
    values.mileage ? formatMileageInput(values.mileage, usesSwedishMileage) : '',
    values.operatingHours ? `${Number(values.operatingHours).toLocaleString('sv-SE')} timmar` : '',
    values.fuelType,
    values.gearbox,
    values.bodyType,
    values.condition,
    values.serviceHistory,
    values.damageStatus,
  ].filter(Boolean)

  return (
    <section className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
      <div>
        <h3 className="text-xl font-semibold tracking-[-0.03em] text-[#101828]">{copy.previewTitle}</h3>
        <p className="mt-1 text-sm leading-6 text-[#667085]">
          {copy.previewText}
        </p>
        <p className="mt-4 rounded-[14px] border border-[#cfe0ff] bg-[#eef5ff] px-4 py-3 text-sm font-semibold text-[#0866ff]">
          {copy.previewNotice}
        </p>
        <div className="mt-5 rounded-[18px] border border-[#d7deed] bg-white p-4">
          <h4 className="text-sm font-semibold text-[#101828]">{copy.structuredDataTitle}</h4>
          <p className="mt-2 text-sm leading-6 text-[#667085]">
            {copy.structuredDataText}
          </p>
        </div>
        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-semibold">
            {copy.sellerNoteLabel}
          </span>
          <textarea
            value={values.sellerNote || ''}
            onChange={(event) => onChange('sellerNote', event.target.value)}
            placeholder={copy.sellerNotePlaceholder}
            className="min-h-28 w-full rounded-[16px] border border-[#d7deed] p-4 outline-none focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
          />
          <span className="mt-2 block text-xs leading-5 text-[#667085]">
            {copy.sellerNoteHelp}
          </span>
        </label>
      </div>
      <article className="overflow-hidden rounded-[24px] border border-[#d7deed] bg-white shadow-sm">
        {images[0] ? (
          <Image src={images[0].preview} alt="" width={720} height={540} unoptimized className="aspect-[4/3] w-full object-cover" />
        ) : (
          <div className="grid h-64 place-items-center bg-[#f3f6fb] text-sm text-[#667085]">
            {copy.noImage}
          </div>
        )}
        <div className="p-5">
          <span className="rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-semibold text-[#0866ff]">
            {categoryLabel}
          </span>
          <h4 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">{title || copy.listingTitle}</h4>
          <p className="mt-2 text-lg font-semibold text-[#101828]">
            {values.price ? `${Number(values.price).toLocaleString(formNumberLocale(locale))} ${values.currency || 'EUR'}` : copy.priceMissing}
          </p>
          <p className="mt-1 text-sm text-[#667085]">{values.city || copy.city} | {values.postalCode || copy.postalCode}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {specs.map((spec) => (
              <span key={String(spec)} className="rounded-full bg-[#f2f4f7] px-3 py-1 text-xs font-semibold text-[#475467]">
                {spec}
              </span>
            ))}
          </div>
          {equipment.length ? (
            <p className="mt-4 text-sm leading-6 text-[#475467]">
              <strong className="font-semibold">{copy.equipment}:</strong>{' '}
              {equipment
                .map((key) => {
                  const option = equipmentOptionByKey.get(key)
                  return option ? equipmentLabel(option, locale) : key
                })
                .join(', ')}
            </p>
          ) : null}
          {values.sellerNote ? (
            <p className="mt-4 whitespace-pre-line text-sm leading-6 text-[#475467]">
              {values.sellerNote}
            </p>
          ) : null}
          {images.length > 1 ? (
            <div className="mt-4 grid grid-cols-4 gap-2">
              {images.slice(1, 5).map((image) => (
                <Image key={image.id} src={image.preview} alt="" width={240} height={180} unoptimized className="aspect-[4/3] w-full rounded-[10px] object-cover" />
              ))}
            </div>
          ) : null}
        </div>
      </article>
    </section>
  )
}

function PublishStep({
  copy,
  values,
  selectedPricing,
  accountType,
  onChange,
  locale,
  marketCode,
}: {
  copy: ListingFormCopy
  values: Values
  selectedPricing: (typeof marketplaceCategories)[number]
  accountType: 'private' | 'business'
  onChange: (name: string, value: string) => void
  locale: PublicLocale
  marketCode: string
}) {
  const billingMarket = normalizeBillingMarket(marketCode)
  const numberLocale =
    locale === 'sv' ? 'sv-SE' :
    locale === 'da' ? 'da-DK' :
    locale === 'pl' ? 'pl-PL' :
    locale === 'de' ? 'de-DE' :
    locale === 'fr' ? 'fr-FR' :
    locale === 'es' ? 'es-ES' :
    locale === 'it' ? 'it-IT' :
    locale === 'nl' || locale === 'be' ? 'nl-NL' :
    locale === 'fi' ? 'fi-FI' :
    'en-GB'
  const packages = [
    { id: 'free_7d', price: 0 },
    { id: 'standard_15d', price: selectedPricing.standard },
    { id: 'premium_30d', price: selectedPricing.premium },
  ] as const

  return (
    <section>
      <div className="mb-6">
        <h3 className="text-xl font-semibold tracking-[-0.03em] text-[#101828]">{copy.publishTitle}</h3>
        <p className="mt-1 text-sm leading-6 text-[#667085]">
          {copy.publishText}
        </p>
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        {packages.map((item) => {
          const packageItemCopy = packageCopy[item.id]
          const selected = values.packageId === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange('packageId', item.id)}
              className={`rounded-[20px] border p-5 text-left transition ${
                selected
                  ? 'border-[#0866ff] bg-[#eef5ff] shadow-[0_16px_42px_rgba(8,102,255,.12)]'
                  : 'border-[#d7deed] bg-white'
              }`}
            >
              <span className="text-sm font-semibold text-[#0866ff]">{packageItemCopy.days}</span>
              <strong className="mt-2 block text-xl font-semibold">{packageItemCopy.title}</strong>
              <span className="mt-2 block text-2xl font-semibold">
                {item.price === 0
                  ? copy.free
                  : formatListingPriceForMarket(selectedPricing.slug, item.id, billingMarket, numberLocale)}
              </span>
              <span className="mt-3 block text-sm leading-6 text-[#667085]">{packageItemCopy.text}</span>
            </button>
          )
        })}
      </div>
      {accountType === 'private' ? (
        <section className="mt-6 rounded-[18px] border border-[#d7deed] bg-[#fbfcff] p-4">
          <div>
            <h4 className="text-sm font-semibold text-[#101828]">{copy.phoneVisibilityTitle}</h4>
            <p className="mt-1 text-xs leading-5 text-[#667085]">{copy.phoneVisibilityText}</p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => onChange('phoneVisibility', 'public')}
              className={`rounded-[14px] border px-4 py-3 text-left text-sm transition ${
                values.phoneVisibility === 'public'
                  ? 'border-[#0866ff] bg-[#eef5ff] text-[#0866ff]'
                  : 'border-[#d7deed] bg-white text-[#344054]'
              }`}
            >
              <strong className="block font-semibold">{copy.phoneVisibilityPublic}</strong>
              <span className="mt-1 block text-xs leading-5 text-[#667085]">
                {copy.phoneVisibilityPublicText}
              </span>
            </button>
            <button
              type="button"
              onClick={() => onChange('phoneVisibility', 'registered_only')}
              className={`rounded-[14px] border px-4 py-3 text-left text-sm transition ${
                values.phoneVisibility === 'registered_only'
                  ? 'border-[#0866ff] bg-[#eef5ff] text-[#0866ff]'
                  : 'border-[#d7deed] bg-white text-[#344054]'
              }`}
            >
              <strong className="block font-semibold">{copy.phoneVisibilityRegistered}</strong>
              <span className="mt-1 block text-xs leading-5 text-[#667085]">
                {copy.phoneVisibilityRegisteredText}
              </span>
            </button>
          </div>
        </section>
      ) : null}
      <label className="mt-6 flex gap-3 rounded-[18px] border border-[#d7deed] p-4 text-sm leading-6 text-[#475467]">
        <input
          type="checkbox"
          checked={values.listingTerms === 'on'}
          onChange={(event) => onChange('listingTerms', event.target.checked ? 'on' : '')}
          className="mt-1 h-4 w-4 accent-[#0866ff]"
        />
        <span>
          {copy.terms}
        </span>
      </label>
    </section>
  )
}

function Field(
  props: Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'onChange' | 'value' | 'name'
  > & {
    label: string
    helper?: string
    name: string
    value: string
    onValueChange: (name: string, value: string) => void
  },
) {
  const { label, helper, name, value, onValueChange, ...rest } = props
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <input
        {...rest}
        name={name}
        value={value}
        onChange={(event) => onValueChange(String(name), event.target.value)}
        className="h-12 w-full rounded-[14px] border border-[#d7deed] bg-white px-4 outline-none focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
      />
      {helper ? <span className="mt-2 block text-xs leading-5 text-[#667085]">{helper}</span> : null}
    </label>
  )
}

function SelectNative({
  label,
  name,
  value,
  onValueChange,
  children,
  ...rest
}: Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  'onChange' | 'value' | 'name'
> & {
  label: string
  name: string
  value: string
  onValueChange: (name: string, value: string) => void
  children: React.ReactNode
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <select
        {...rest}
        name={name}
        value={value}
        onChange={(event) => onValueChange(name, event.target.value)}
        className="h-12 w-full rounded-[14px] border border-[#d7deed] bg-white px-4 outline-none focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
      >
        {children}
      </select>
    </label>
  )
}

function labelFor(options: ListingOption[], value: string) {
  return options.find((option) => option.value === value)?.label || ''
}

async function fetchWithTimeout(url: string, init: RequestInit) {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), listingRequestTimeoutMs)
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    })
  } finally {
    window.clearTimeout(timeout)
  }
}

function mileageInputToKilometers(value: string, usesSwedishMileage: boolean) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return value
  return String(Math.round(usesSwedishMileage ? numeric * swedishMileageFactor : numeric))
}

function isAllowedModelYear(value: string) {
  if (value === '1950+') return true
  const year = Number(value)
  return Number.isInteger(year) && year >= minModelYear && year <= maxModelYear
}

function formatMileageInput(value: string, usesSwedishMileage: boolean) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return ''
  return `${numeric.toLocaleString('sv-SE')} ${usesSwedishMileage ? 'mil' : 'km'}`
}

function parseIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

function toIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDateChoice(date: Date, locale: PublicLocale) {
  return new Intl.DateTimeFormat(formNumberLocale(locale), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function formNumberLocale(locale: PublicLocale) {
  if (locale === 'sv') return 'sv-SE'
  if (locale === 'de') return 'de-DE'
  if (locale === 'at') return 'de-AT'
  if (locale === 'be') return 'nl-BE'
  if (locale === 'da') return 'da-DK'
  if (locale === 'fi') return 'fi-FI'
  if (locale === 'fr') return 'fr-FR'
  if (locale === 'it') return 'it-IT'
  if (locale === 'nl') return 'nl-NL'
  if (locale === 'pl') return 'pl-PL'
  if (locale === 'es') return 'es-ES'
  return 'en-GB'
}

function weekdayLabels(locale: PublicLocale) {
  const monday = new Date(2026, 0, 5)
  return Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(formNumberLocale(locale), { weekday: 'short' })
      .format(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index))
      .replace('.', ''),
  )
}

function calendarDays(year: number, month: number) {
  const first = new Date(year, month, 1)
  const mondayOffset = (first.getDay() + 6) % 7
  const start = new Date(year, month, 1 - mondayOffset)
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index)
    return {
      key: toIsoDate(date),
      date,
      inMonth: date.getMonth() === month,
    }
  })
}

type ListingFormCopy = ReturnType<typeof getListingFormCopy>

function getListingFormCopy(locale: PublicLocale) {
  const en = {
    steps: ['Category & basics', 'Technical details', 'Images', 'Preview', 'Package & publish'],
    step: 'Step',
    of: 'of',
    complete: 'complete',
    basicTitle: 'Start with the vehicle',
    basicText: 'We collect the most important details first. The rest comes in the right order.',
    category: 'Category',
    make: 'Make or manufacturer',
    model: 'Model',
    variant: 'Version / variant',
    modelYear: 'Model year',
    kilometers: 'Kilometres',
    mileageLabel: 'Kilometres',
    operatingHours: 'Operating hours',
    price: 'Price',
    currency: 'Currency',
    country: 'Country',
    county: 'Region',
    city: 'City',
    municipality: 'Municipality',
    municipalityHelper: 'Optional, but useful in Sweden and local markets.',
    streetAddress: 'Street address',
    postalCode: 'Postal code',
    technicalTitle: 'Technical details and verification',
    technicalText: 'Choices are shown only when you open a question, keeping the flow clean on mobile.',
    choose: 'Choose',
    chooseColor: 'Choose colour',
    equipment: 'Equipment',
    chooseEquipment: 'Choose equipment',
    imagesTitle: 'Images',
    imagesText: 'Images are compressed before upload. Upload at least 5 images for a stronger listing. Drag images to reorder them.',
    addImages: 'Add images',
    uploaded: 'uploaded',
    image: 'Image',
    chooseMainImage: 'Choose main image',
    mainImage: 'Main image',
    useAsMainImage: 'Use as main image',
    removeImage: 'Remove image',
    previewTitle: 'Preview',
    previewText: 'This is how the listing can appear on Autorell. Go back if anything needs changing.',
    previewNotice: 'This is a preview. The listing is not published yet.',
    structuredDataTitle: 'Structured listing data',
    structuredDataText: 'Specifications, equipment, condition and faults are shown as fixed choices and can be translated through Autorell language files.',
    sellerNoteLabel: 'Additional seller information (optional)',
    sellerNotePlaceholder: 'Short original text if something important is missing from the structured choices.',
    sellerNoteHelp: 'This text is shown in the seller’s original language.',
    noImage: 'No image uploaded',
    listingTitle: 'Listing title',
    priceMissing: 'Price missing',
    package: 'Package',
    notSelected: 'Not selected',
    publishTitle: 'Package & publishing',
    publishText: 'Choose a package. The publish button is enabled once the confirmation is accepted.',
    batchTitle: 'Create several listings at once',
    batchText: 'Add the finished listing to a queue, create the next one, preview the queue and publish everything in one flow.',
    addToBatch: 'Add to listing queue',
    publishBatch: 'Publish queued listings',
    batchCount: '{count} listings ready',
    removeFromBatch: 'Remove from queue',
    volumeOffers: [
      { title: '3 for 2', text: 'Good for smaller batches and repeat sellers.' },
      { title: '6 for 4', text: 'Better value when listing a broader stock.' },
      { title: '12+ listings', text: 'Request a tailored company quote from Autorell.' },
    ],
    phoneVisibilityTitle: 'Phone number visibility',
    phoneVisibilityText: 'A public phone number can make it easier for buyers to contact you. Requiring login may reduce enquiries and slow down the sale.',
    phoneVisibilityPublic: 'Show phone number to everyone',
    phoneVisibilityPublicText: 'Visitors can reveal and call the number without an Autorell account.',
    phoneVisibilityRegistered: 'Only show to logged-in users',
    phoneVisibilityRegisteredText: 'Buyers must sign in before the number is shown.',
    free: 'Free',
    terms: 'I confirm that I am the rightful owner or have the legal right to sell the object, that the listing information is correct, that the object is not stolen, wanted or subject to illegal sale, and that I have read and accept Autorell’s terms of use, purchase terms and privacy policy.',
    back: 'Back',
    next: 'Next',
    publishing: 'Publishing...',
    publish: 'Publish listing',
  }
  if (locale === 'sv') {
    return {
      steps: ['Kategori & grundinfo', 'Tekniska uppgifter', 'Bilder', 'Annonsförhandsvisning', 'Paket & publicering'],
      step: 'Steg',
      of: 'av',
      complete: 'klart',
      basicTitle: 'Börja med objektet',
      basicText: 'Vi samlar bara det viktigaste först. Resten kommer i rätt ordning.',
      category: 'Kategori',
      make: 'Märke eller tillverkare',
      model: 'Modell',
      variant: 'Version / variant',
      modelYear: 'Årsmodell',
      kilometers: 'Kilometer',
      mileageLabel: 'Mil',
      operatingHours: 'Drifttimmar',
      price: 'Pris',
      currency: 'Valuta',
      country: 'Land',
      county: 'Län',
      city: 'Ort',
      municipality: 'Kommun',
      municipalityHelper: 'Frivilligt, men gör platsen tydligare för köpare.',
      streetAddress: 'Gatuadress',
      postalCode: 'Postnummer',
      technicalTitle: 'Teknik och verifiering',
      technicalText: 'Valen visas bara när du öppnar en fråga, så flödet hålls rent även på mobil.',
      choose: 'Välj',
      chooseColor: 'Välj färg',
      equipment: 'Utrustning',
      chooseEquipment: 'Välj utrustning',
      imagesTitle: 'Bilder',
      imagesText: 'Bilder komprimeras innan de skickas. Ladda upp minst 5 bilder för en starkare annons. Dra bilderna för att ändra ordning.',
      addImages: 'Lägg till bilder',
      uploaded: 'uppladdade',
      image: 'Bild',
      chooseMainImage: 'Välj huvudbild',
      mainImage: 'Huvudbild',
      useAsMainImage: 'Använd som huvudbild',
      removeImage: 'Ta bort bild',
      previewTitle: 'Förhandsvisning',
      previewText: 'Så här kan annonsen upplevas på Autorell. Gå tillbaka om något behöver ändras.',
      previewNotice: 'Detta är en förhandsvisning. Annonsen är inte publicerad ännu.',
      structuredDataTitle: 'Strukturerad annonsdata',
      structuredDataText: 'Specifikationer, utrustning, skick och skador/fel visas som fasta val och kan översättas via Autorells språkfiler.',
      sellerNoteLabel: 'Ytterligare information från säljaren (valfritt)',
      sellerNotePlaceholder: 'Kort originaltext om något viktigt saknas i de strukturerade valen.',
      sellerNoteHelp: 'Denna text visas i säljarens originalspråk.',
      noImage: 'Ingen bild uppladdad',
      listingTitle: 'Annonsrubrik',
      priceMissing: 'Pris saknas',
      package: 'Paket',
      notSelected: 'Ej valt',
      publishTitle: 'Paket & publicering',
      publishText: 'Välj paket. Publicera-knappen visas först när bekräftelsen är godkänd.',
      batchTitle: 'Skapa flera annonser samtidigt',
      batchText: 'Lägg den färdiga annonsen i en kö, skapa nästa, förhandsgranska kön och publicera allt i samma flöde.',
      addToBatch: 'Lägg till i annonskö',
      publishBatch: 'Publicera annonskö',
      batchCount: '{count} annonser klara',
      removeFromBatch: 'Ta bort från kön',
      volumeOffers: [
        { title: '3 för 2', text: 'Bra för mindre batchar och återkommande säljare.' },
        { title: '6 för 4', text: 'Bättre pris när fler objekt läggs upp samtidigt.' },
        { title: '12+ annonser', text: 'Be Autorell om en anpassad företagsoffert.' },
      ],
      phoneVisibilityTitle: 'Synlighet för telefonnummer',
      phoneVisibilityText: 'Ett öppet telefonnummer kan göra det enklare för köpare att kontakta dig. Krav på inloggning kan minska antalet förfrågningar och göra försäljningen långsammare.',
      phoneVisibilityPublic: 'Visa telefonnummer för alla',
      phoneVisibilityPublicText: 'Besökare kan visa och ringa numret utan Autorell-konto.',
      phoneVisibilityRegistered: 'Visa bara för inloggade',
      phoneVisibilityRegisteredText: 'Köpare måste logga in innan numret visas.',
      free: 'Gratis',
      terms: 'Jag bekräftar att jag är rättmätig ägare eller har laglig rätt att sälja objektet, att uppgifterna i annonsen är korrekta, att objektet inte är stulet, efterlyst eller föremål för olaglig försäljning och att jag har läst och godkänner Autorells användarvillkor, köpvillkor och integritetspolicy.',
      back: 'Tillbaka',
      next: 'Nästa',
      publishing: 'Publicerar...',
      publish: 'Publicera annons',
    }
  }
  if (locale === 'de' || locale === 'at') {
    const de = {
      ...en,
      step: 'Schritt',
      of: 'von',
      complete: 'fertig',
      back: 'Zurück',
      next: 'Weiter',
      publish: 'Anzeige veröffentlichen',
      publishing: 'Wird veröffentlicht...',
      batchTitle: 'Mehrere Anzeigen gleichzeitig erstellen',
      batchText: 'Fertige Anzeige in die Warteschlange legen, die nächste erstellen, alles prüfen und gemeinsam veröffentlichen.',
      addToBatch: 'Zur Anzeigenwarteschlange',
      publishBatch: 'Warteschlange veröffentlichen',
      batchCount: '{count} Anzeigen bereit',
      removeFromBatch: 'Aus Warteschlange entfernen',
      volumeOffers: [
        { title: '3 für 2', text: 'Gut für kleinere Pakete und wiederkehrende Verkäufer.' },
        { title: '6 für 4', text: 'Besserer Preis bei größerem Bestand.' },
        { title: '12+ Anzeigen', text: 'Individuelles Firmenangebot bei Autorell anfragen.' },
      ],
      phoneVisibilityTitle: 'Sichtbarkeit der Telefonnummer',
      phoneVisibilityText: 'Eine öffentliche Telefonnummer kann Käufern die Kontaktaufnahme erleichtern. Eine Anmeldungspflicht kann Anfragen reduzieren und den Verkauf verlangsamen.',
      phoneVisibilityPublic: 'Telefonnummer allen anzeigen',
      phoneVisibilityPublicText: 'Besucher können die Nummer ohne Autorell-Konto anzeigen und anrufen.',
      phoneVisibilityRegistered: 'Nur angemeldeten Nutzern anzeigen',
      phoneVisibilityRegisteredText: 'Käufer müssen sich anmelden, bevor die Nummer angezeigt wird.',
      mileageLabel: 'Kilometer',
    }
    return de
    return { ...en, step: 'Schritt', of: 'von', complete: 'fertig', back: 'Zurück', next: 'Weiter', publish: 'Anzeige veröffentlichen', publishing: 'Wird veröffentlicht...' }
  }
  return Object.fromEntries(
    Object.entries(en).map(([key, value]) => [
      key,
      key === 'volumeOffers'
        ? value
        : Array.isArray(value)
          ? value.map((item) => (typeof item === 'string' ? translatePublic(locale, item) : item))
          : translatePublic(locale, value),
    ]),
  ) as typeof en
}

function localizeFormText(locale: PublicLocale, sv: string, en: string, de: string) {
  if (locale === 'sv') return sv
  if (locale === 'de' || locale === 'at') return de
  return translatePublic(locale, en)
}

function localizeVehicleText(locale: PublicLocale, value?: string | null) {
  if (!value) return ''
  if (locale === 'sv') return value
  const english = vehicleValueInEnglish(value) || value
  return translatePublic(locale, english)
}

function localizeOptions(locale: PublicLocale, options: ListingOption[]) {
  return options.map((option) => ({
    ...option,
    label: localizeVehicleText(locale, option.label),
  }))
}

function categoryLabelForLocale(category: string, locale: PublicLocale) {
  const marketplaceCategory = getMarketplaceCategory(category)
  const localeLabels = categoryLabelOverrides[locale]?.[marketplaceCategory.slug]
  if (localeLabels) return localeLabels
  const language = marketplaceLanguage(locale)
  if (locale === 'sv' || locale === 'de' || locale === 'at' || locale === 'en') {
    return marketplaceCategory.labels[language]
  }
  return translatePublic(locale, marketplaceCategory.labels.en)
}

const categoryLabelOverrides: Partial<
  Record<PublicLocale, Partial<Record<MarketplaceCategorySlug, string>>>
> = {
  da: {
    cars: 'Biler',
    vans: 'Transportbiler',
    motorcycles: 'Motorcykler',
    motorhomes: 'Autocampere',
    caravans: 'Campingvogne',
    trucks: 'Lastbiler',
    agriculture: 'Landbrugsmaskiner',
    construction: 'Entreprenørmaskiner',
    'electric-bikes': 'Cykler',
    'e-scooters': 'Scootere',
  },
}

const identifierFieldNames = new Set([
  'registrationNumber',
  'registration',
  'vin',
  'chassisNumber',
  'serialNumber',
  'frameNumber',
  'batterySerialNumber',
])

const smartTextFieldNames = new Set([
  'make',
  'model',
  'variant',
  'city',
  'addressLine1',
])

const preservedUppercaseWords = new Set([
  'AMG',
  'BMW',
  'BYD',
  'DS',
  'GT',
  'GTI',
  'GTR',
  'HD',
  'MAN',
  'MG',
  'RS',
  'RWD',
  'SUV',
  'TDI',
  'TSI',
  'VW',
  'XC',
])

function normalizeIdentifierInput(value: string) {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '')
    .trim()
}

function formatSmartText(value: string) {
  return value
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((word) => {
      if (!word) return word
      const upper = word.toUpperCase()
      if (preservedUppercaseWords.has(upper)) return upper
      if (/^[A-Z]{1,3}\d/.test(upper)) return upper
      if (/^\d/.test(word)) return word
      return word.charAt(0).toLocaleUpperCase('sv-SE') + word.slice(1).toLocaleLowerCase('sv-SE')
    })
    .join(' ')
    .trimStart()
}

function identifierHelpText(category: MarketplaceCategorySlug) {
  if (category === 'construction' || category === 'agriculture') {
    return 'Ange registreringsnummer om objektet har ett. Annars ange serienummer, VIN eller chassinummer.'
  }
  if (category === 'electric-bikes' || category === 'e-scooters') {
    return 'Ange ramnummer eller serienummer. Batteriserienummer kan anges om det finns.'
  }
  return 'Ange registreringsnummer om fordonet har ett. Annars ange VIN/chassinummer eller serienummer.'
}

async function compressImage(file: File): Promise<UploadImage> {
  const supportedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
  if (['image/heic', 'image/heif'].includes(file.type) || /\.(heic|heif)$/i.test(file.name)) {
    throw new Error('HEIC_NOT_SUPPORTED')
  }
  if (!supportedTypes.has(file.type)) throw new Error('UNSUPPORTED_IMAGE_TYPE')
  if (!file.size || file.size > 25 * 1024 * 1024) throw new Error('IMAGE_SIZE_INVALID')
  if (!await hasSupportedImageSignature(file)) throw new Error('IMAGE_SIGNATURE_MISMATCH')

  const decoded = await decodeBrowserImage(file)
  if (decoded.width * decoded.height > 80_000_000) {
    decoded.close()
    throw new Error('IMAGE_DIMENSIONS_TOO_LARGE')
  }
  const maxWidth = 1920
  const maxHeight = 1440
  const ratio = Math.min(maxWidth / decoded.width, maxHeight / decoded.height, 1)
  let width = Math.max(1, Math.round(decoded.width * ratio))
  let height = Math.max(1, Math.round(decoded.height * ratio))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('IMAGE_PROCESSING_UNAVAILABLE')
  context.fillStyle = '#fff'
  context.fillRect(0, 0, width, height)
  context.drawImage(decoded.source, 0, 0, width, height)
  decoded.close()

  let blob = await encodeJpegWithinLimit(canvas, 180_000)
  while (blob.size > 180_000 && width > 900 && height > 675) {
    width = Math.max(900, Math.round(width * 0.82))
    height = Math.max(675, Math.round(height * 0.82))
    const resized = document.createElement('canvas')
    resized.width = width
    resized.height = height
    const resizedContext = resized.getContext('2d')
    if (!resizedContext) break
    resizedContext.drawImage(canvas, 0, 0, width, height)
    canvas.width = width
    canvas.height = height
    context.drawImage(resized, 0, 0)
    blob = await encodeJpegWithinLimit(canvas, 180_000)
  }
  const name = file.name.replace(/\.[^.]+$/, '') + '.jpg'
  const compressed = new File([blob], name, { type: 'image/jpeg' })
  return {
    id: crypto.randomUUID(),
    file: compressed,
    preview: URL.createObjectURL(compressed),
    name,
    size: compressed.size,
  }
}

async function encodeJpegWithinLimit(canvas: HTMLCanvasElement, maxBytes: number) {
  let result: Blob | null = null
  for (const quality of [0.82, 0.72, 0.62, 0.52]) {
    result = await canvasToJpeg(canvas, quality)
    if (result.size <= maxBytes) return result
  }
  if (!result) throw new Error('IMAGE_ENCODING_FAILED')
  return result
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => result ? resolve(result) : reject(new Error('IMAGE_ENCODING_FAILED')),
      'image/jpeg',
      quality,
    )
  })
}

async function decodeBrowserImage(file: File) {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    return {
      source: bitmap as CanvasImageSource,
      width: bitmap.width,
      height: bitmap.height,
      close: () => bitmap.close(),
    }
  } catch {
    const url = URL.createObjectURL(file)
    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const element = new window.Image()
        element.onload = () => resolve(element)
        element.onerror = () => reject(new Error('IMAGE_DECODE_FAILED'))
        element.src = url
      })
      return {
        source: image as CanvasImageSource,
        width: image.naturalWidth,
        height: image.naturalHeight,
        close: () => URL.revokeObjectURL(url),
      }
    } catch (error) {
      URL.revokeObjectURL(url)
      throw error
    }
  }
}

async function hasSupportedImageSignature(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 32).arrayBuffer())
  const ascii = String.fromCharCode(...bytes)
  if (file.type === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  if (file.type === 'image/png') return bytes.slice(0, 8).every((value, index) => value === [137, 80, 78, 71, 13, 10, 26, 10][index])
  if (file.type === 'image/webp') return ascii.slice(0, 4) === 'RIFF' && ascii.slice(8, 12) === 'WEBP'
  if (file.type === 'image/avif') return ascii.slice(4, 8) === 'ftyp' && /avif|avis|mif1/.test(ascii.slice(8))
  return false
}

function imageErrorText(error: unknown) {
  const code = error instanceof Error ? error.message : ''
  if (code === 'HEIC_NOT_SUPPORTED') return 'HEIC/HEIF stöds inte ännu. Konvertera bilden till JPG.'
  if (code === 'IMAGE_SIZE_INVALID') return 'Filen är tom eller större än 25 MB.'
  if (code === 'UNSUPPORTED_IMAGE_TYPE' || code === 'IMAGE_SIGNATURE_MISMATCH') return 'Formatet stöds inte eller filens innehåll är ogiltigt.'
  if (code === 'IMAGE_DECODE_FAILED') return 'Bilden kunde inte öppnas i den här webbläsaren.'
  if (code === 'IMAGE_DIMENSIONS_TOO_LARGE') return 'Bilden har för hög upplösning. Välj en bild under 80 megapixel.'
  return 'Bilden kunde inte bearbetas. Försök igen.'
}

type StoredDraftImage = { id: string; file: File }

function openDraftDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open('autorell-listing-drafts', 1)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains('images')) request.result.createObjectStore('images')
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function loadDraftImages(key: string): Promise<StoredDraftImage[]> {
  try {
    const database = await openDraftDatabase()
    return await new Promise((resolve) => {
      const request = database.transaction('images', 'readonly').objectStore('images').get(key)
      request.onsuccess = () => resolve(Array.isArray(request.result) ? request.result : [])
      request.onerror = () => resolve([])
    })
  } catch {
    return []
  }
}

async function saveDraftImages(key: string, images: UploadImage[]) {
  try {
    const database = await openDraftDatabase()
    await new Promise<void>((resolve) => {
      const request = database.transaction('images', 'readwrite').objectStore('images').put(
        images.map(({ id, file }) => ({ id, file })),
        key,
      )
      request.onsuccess = () => resolve()
      request.onerror = () => resolve()
    })
  } catch {
    // Browser storage can be unavailable or full; the in-memory form still remains intact.
  }
}

async function deleteDraftImages(key: string) {
  try {
    const database = await openDraftDatabase()
    database.transaction('images', 'readwrite').objectStore('images').delete(key)
  } catch {
    // Cleanup is best-effort.
  }
}
