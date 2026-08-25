'use client'

import Image from 'next/image'
import { ChangeEvent, FormEvent, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ChevronLeft, ChevronRight, ImagePlus, LoaderCircle, Search, Star, X } from 'lucide-react'
import type { MarketplaceCategorySlug } from '@/lib/marketplace'
import {
  fieldsForCategoryAndSubcategory,
  identifierSelectOptions,
  type ListingTechnicalField,
} from '@/lib/listing-form-options'
import {
  equipmentGroupsForCategory,
  equipmentLabel,
  equipmentOptionByKey,
} from '@/lib/listing-equipment'
import {
  listingRequirementsByCategory,
  type ListingIdentifierInput,
} from '@/lib/marketplace-security'
import { localizedAccountError } from '@/lib/account-error-i18n'
import { translatePublic, translatePublicObject, type PublicLocale } from '@/lib/public-i18n'
import { brandCorrectionSuggestion, matchingBrandSuggestions } from '@/lib/listing-brand-suggestions'

type EditableListing = {
  id: string
  category: MarketplaceCategorySlug
  title: string
  make: string
  model: string
  variant: string
  modelYear: number | null
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
  mileage: number | null
  operatingHours: number | null
  technicalData: Record<string, unknown>
  identifiers: ListingIdentifierInput
  images: string[]
}

const decimalTechnicalFieldNames = new Set(['engineLiters', 'cargoVolumeM3'])
const mileageCategories = new Set<MarketplaceCategorySlug>([
  'cars',
  'vans',
  'motorcycles',
  'motorhomes',
  'trucks',
])
const swedishMileageFactor = 10

export default function EditListingForm({
  listing,
  backHref,
  locale,
}: {
  listing: EditableListing
  backHref: string
  locale: PublicLocale
}) {
  const router = useRouter()
  const copy = getEditListingFormCopy(locale)
  const [make, setMake] = useState(listing.make)
  const [makeSuggestionsOpen, setMakeSuggestionsOpen] = useState(false)
  const [model, setModel] = useState(listing.model)
  const [variant, setVariant] = useState(listing.variant)
  const [modelYear, setModelYear] = useState(listing.modelYear ? String(listing.modelYear) : '')
  const [price, setPrice] = useState(String(listing.price))
  const [city, setCity] = useState(listing.city)
  const [address, setAddress] = useState(listing.address)
  const [description, setDescription] = useState(listing.description)
  const [equipmentKeys, setEquipmentKeys] = useState(listing.equipmentKeys)
  const [phoneVisibility, setPhoneVisibility] = useState(listing.phoneVisibility || (listing.sellerType === 'private' ? 'registered_only' : 'public'))
  const usesSwedishMileage = isSwedishMileageCountry(listing.country)
  const [mileage, setMileage] = useState(listing.mileage ? formatMileageForInput(listing.mileage, usesSwedishMileage) : '')
  const [operatingHours, setOperatingHours] = useState(listing.operatingHours ? String(listing.operatingHours) : '')
  const [technicalData, setTechnicalData] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      Object.entries(listing.technicalData || {}).map(([key, value]) => [key, String(value ?? '')]),
    ),
  )
  const [identifiers, setIdentifiers] = useState<Record<keyof ListingIdentifierInput, string>>({
    registrationNumber: listing.identifiers.registrationNumber || '',
    vin: listing.identifiers.vin || '',
    chassisNumber: listing.identifiers.chassisNumber || '',
    serialNumber: listing.identifiers.serialNumber || '',
    frameNumber: listing.identifiers.frameNumber || '',
    batterySerialNumber: listing.identifiers.batterySerialNumber || '',
    totalWeightKg: listing.identifiers.totalWeightKg ? String(listing.identifiers.totalWeightKg) : '',
    axleConfiguration: listing.identifiers.axleConfiguration || '',
    machineType: listing.identifiers.machineType || '',
    agricultureObjectType: listing.identifiers.agricultureObjectType || 'tractor',
  })
  const makeSuggestions = useMemo(
    () => matchingBrandSuggestions(listing.category, make),
    [listing.category, make],
  )
  const makeCorrectionSuggestion = useMemo(
    () => brandCorrectionSuggestion(listing.category, make),
    [listing.category, make],
  )
  const visibleMakeSuggestions = makeSuggestions.filter((suggestion) => suggestion !== make)
  const [equipmentSearch, setEquipmentSearch] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [listingImages, setListingImages] = useState(listing.images)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [savingImageOrder, setSavingImageOrder] = useState(false)
  const [successNoticeOpen, setSuccessNoticeOpen] = useState(false)
  const showMileage = mileageCategories.has(listing.category)
  const showOperatingHours = listing.category === 'agriculture' || listing.category === 'construction'

  function setTechnicalValue(key: string, value: string) {
    setTechnicalData((current) => ({ ...current, [key]: value }))
  }

  function setIdentifierValue(key: keyof ListingIdentifierInput, value: string) {
    setIdentifiers((current) => ({ ...current, [key]: value }))
  }

  async function addImages(event: ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files || [])]
    event.target.value = ''
    if (!files.length) return
    setUploadingImages(true)
    setError('')
    const form = new FormData()
    files.forEach((file) => form.append('images', file, file.name))
    const response = await fetch(`/api/account/listings/${listing.id}/images`, { method: 'POST', body: form })
    const result = (await response.json().catch(() => ({}))) as { error?: string; images?: string[] }
    setUploadingImages(false)
    if (!response.ok || !result.images) return setError(localizedAccountError(locale, result, copy.imagesUploadError))
    setListingImages(result.images)
    setSuccessNoticeOpen(true)
    router.refresh()
  }

  function nextImageOrder(fromIndex: number, toIndex: number) {
    if (toIndex < 0 || toIndex >= listingImages.length || fromIndex === toIndex) return
    const next = [...listingImages]
    const [image] = next.splice(fromIndex, 1)
    if (!image) return
    next.splice(toIndex, 0, image)
    setListingImages(next)
    void persistImageOrder(next)
  }

  function reorderImage(fromIndex: number, toIndex: number) {
    nextImageOrder(fromIndex, toIndex)
  }

  function makeMainImage(index: number) {
    nextImageOrder(index, 0)
  }

  async function persistImageOrder(images: string[]) {
    if (!images.length || savingImageOrder) return
    setSavingImageOrder(true)
    setError('')
    const response = await fetch(`/api/account/listings/${listing.id}/images`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images }),
    })
    const result = (await response.json().catch(() => ({}))) as { error?: string; images?: string[] }
    setSavingImageOrder(false)
    if (!response.ok || !result.images) {
      setError(localizedAccountError(locale, result, copy.imagesOrderError))
      return
    }
    setListingImages(result.images)
    setSuccessNoticeOpen(true)
    router.refresh()
  }

  async function saveImageOrder() {
    await persistImageOrder(listingImages)
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError('')
    const response = await fetch(`/api/account/listings/${listing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_listing',
        make,
        model,
        variant,
        modelYear,
        price,
        city,
        country: listing.country,
        address,
        latitude: listing.latitude,
        longitude: listing.longitude,
        description,
        equipmentKeys,
        phoneVisibility,
        mileage: mileageInputToKilometers(mileage, usesSwedishMileage),
        operatingHours,
        technicalData,
        identifiers,
      }),
    })
    const result = (await response.json()) as { error?: string }
    if (!response.ok) {
      setError(localizedAccountError(locale, result, copy.saveError))
      setSaving(false)
      return
    }
    setSaving(false)
    setSuccessNoticeOpen(true)
    router.refresh()
  }

  return (
    <form onSubmit={submit} className="autorell-edit-listing-form space-y-7 p-6 sm:p-8">
      <section aria-labelledby="listing-images-title" className="rounded-[18px] border border-[#dfe6f1] bg-[#f8faff] p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 id="listing-images-title" className="text-lg font-semibold text-[#101828]">{copy.imagesTitle}</h2><p className="mt-1 text-sm text-[#667085]">{copy.imagesHelp}</p></div>
          <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={saveImageOrder}
            disabled={savingImageOrder || listingImages.length < 2}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-[12px] border border-[#0866ff] bg-white px-4 text-sm font-semibold text-[#0866ff] outline-none transition hover:bg-[#eef5ff] disabled:cursor-not-allowed disabled:border-[#cbd7e8] disabled:text-[#98a2b3]"
          >
            {savingImageOrder ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {savingImageOrder ? copy.savingImageOrder : copy.saveImageOrder}
          </button>
          <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-[12px] bg-[#0866ff] px-4 text-sm font-semibold text-white outline-none focus-within:ring-4 focus-within:ring-[#0866ff]/25">
            {uploadingImages ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            {uploadingImages ? copy.uploadingImages : copy.addImages}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple disabled={uploadingImages || listingImages.length >= 20} onChange={addImages} className="sr-only" />
          </label>
          </div>
        </div>
        {listingImages.length ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {listingImages.slice(0, 20).map((src, index) => (
              <div key={`${src}-${index}`} className="group relative overflow-hidden rounded-[14px] border border-[#d7deed] bg-white p-2 shadow-sm">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[10px] bg-[#e8edf5]">
                  <Image src={src} alt={`${copy.imageAlt} ${index + 1}`} fill sizes="180px" unoptimized className="object-cover" />
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className={`inline-flex min-h-7 items-center rounded-full px-2.5 text-xs font-semibold ${index === 0 ? 'bg-[#0866ff] text-white' : 'bg-[#eef2f7] text-[#475467]'}`}>
                    {index === 0 ? copy.mainImage : `${copy.imageNumber} ${index + 1}`}
                  </span>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => reorderImage(index, index - 1)} disabled={savingImageOrder || index === 0} className="grid h-8 w-8 place-items-center rounded-full border border-[#d7deed] bg-white text-[#344054] transition hover:border-[#0866ff] hover:text-[#0866ff] disabled:cursor-not-allowed disabled:opacity-40" aria-label={copy.moveLeft}>
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => reorderImage(index, index + 1)} disabled={savingImageOrder || index === listingImages.length - 1} className="grid h-8 w-8 place-items-center rounded-full border border-[#d7deed] bg-white text-[#344054] transition hover:border-[#0866ff] hover:text-[#0866ff] disabled:cursor-not-allowed disabled:opacity-40" aria-label={copy.moveRight}>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {index !== 0 ? (
                  <button
                    type="button"
                    onClick={() => makeMainImage(index)}
                    disabled={savingImageOrder}
                    className="mt-2 inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-[10px] border border-[#cbd7e8] bg-white px-3 text-xs font-semibold text-[#0866ff] transition hover:bg-[#eef5ff]"
                  >
                    <Star className="h-3.5 w-3.5" />
                    {copy.makeMainImage}
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        ) : <p className="mt-4 rounded-[12px] border border-dashed border-[#b9c6d8] bg-white p-5 text-center text-sm text-[#667085]">{copy.noImages}</p>}
      </section>
      <section className="rounded-[18px] border border-[#dfe6f1] p-4">
        <h2 className="text-lg font-semibold tracking-[-.03em]">Fordonsuppgifter</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="relative block">
            <span className="mb-2 block text-sm font-semibold">Märke eller tillverkare</span>
            <input
              value={make}
              autoComplete="off"
              onFocus={() => setMakeSuggestionsOpen(true)}
              onBlur={() => window.setTimeout(() => setMakeSuggestionsOpen(false), 120)}
              onChange={(event) => {
                setMakeSuggestionsOpen(true)
                setMake(event.target.value)
              }}
              className="h-13 w-full rounded-[14px] border border-[#d7deed] px-4 outline-none focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
              required
            />
            {makeSuggestionsOpen && (visibleMakeSuggestions.length || makeCorrectionSuggestion) ? (
              <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 max-h-[252px] overflow-y-auto rounded-[14px] border border-[#d7deed] bg-white shadow-[0_16px_34px_rgba(16,24,40,.14)] [scrollbar-width:thin]">
                {makeCorrectionSuggestion && makeCorrectionSuggestion !== make ? (
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setMake(makeCorrectionSuggestion)
                      setMakeSuggestionsOpen(false)
                    }}
                    className="flex min-h-11 w-full items-center justify-between gap-3 border-b border-[#edf1f6] bg-[#f7fbff] px-4 text-left text-sm font-semibold text-[#101828] transition hover:bg-[#eef5ff] hover:text-[#0866ff] focus-visible:bg-[#eef5ff] focus-visible:outline-none"
                  >
                    <span>{brandCorrectionLabel(locale, makeCorrectionSuggestion)}</span>
                    <span className="text-xs font-semibold text-[#0866ff]">{makeCorrectionSuggestion}</span>
                  </button>
                ) : null}
                {visibleMakeSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setMake(suggestion)
                      setMakeSuggestionsOpen(false)
                    }}
                    className="flex min-h-10 w-full items-center px-4 text-left text-sm font-medium text-[#101828] transition hover:bg-[#eef5ff] hover:text-[#0866ff] focus-visible:bg-[#eef5ff] focus-visible:outline-none"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            ) : null}
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Modell</span>
            <input
              value={model}
              onChange={(event) => setModel(event.target.value)}
              className="h-13 w-full rounded-[14px] border border-[#d7deed] px-4 outline-none focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Version / variant</span>
            <input
              value={variant}
              onChange={(event) => setVariant(event.target.value)}
              className="h-13 w-full rounded-[14px] border border-[#d7deed] px-4 outline-none focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Årsmodell</span>
            <input
              type="number"
              min="1950"
              max="2027"
              value={modelYear}
              onChange={(event) => setModelYear(event.target.value)}
              className="h-13 w-full rounded-[14px] border border-[#d7deed] px-4 outline-none focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
              required
            />
          </label>
        </div>
      </section>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Pris</span>
          <div className="flex overflow-hidden rounded-[14px] border border-[#d7deed] bg-white focus-within:border-[#0866ff] focus-within:ring-4 focus-within:ring-[#0866ff]/10">
            <input
              type="number"
              min="1"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              className="h-13 min-w-0 flex-1 px-4 outline-none"
              required
            />
            <span className="grid min-w-20 place-items-center border-l border-[#edf1f6] bg-[#f8faff] text-sm font-semibold text-[#667085]">
              {listing.currency}
            </span>
          </div>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Ort</span>
          <input
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className="h-13 w-full rounded-[14px] border border-[#d7deed] px-4 outline-none focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
            required
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Gatuadress</span>
          <input
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            className="h-13 w-full rounded-[14px] border border-[#d7deed] px-4 outline-none focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
            autoComplete="street-address"
          />
        </label>
      </div>

      <section className="rounded-[18px] border border-[#dfe6f1] p-4">
        <h2 className="text-lg font-semibold tracking-[-.03em]">Identifiering</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {listingRequirementsByCategory[listing.category].map((field) => (
            <IdentifierField
              key={field.key}
              field={field}
              value={identifiers[field.key] || ''}
              onChange={setIdentifierValue}
            />
          ))}
        </div>
      </section>

      <section className="rounded-[18px] border border-[#dfe6f1] p-4">
        <h2 className="text-lg font-semibold tracking-[-.03em]">Tekniska uppgifter</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {showMileage ? (
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Miltal ({usesSwedishMileage ? 'mil' : 'km'})</span>
              <input
                type="number"
                min="0"
                step={usesSwedishMileage ? '1' : undefined}
                value={mileage}
                onChange={(event) => setMileage(event.target.value)}
                className="h-13 w-full rounded-[14px] border border-[#d7deed] px-4 outline-none focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
                required
              />
            </label>
          ) : null}
          {showOperatingHours ? (
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Drifttimmar</span>
              <input
                type="number"
                min="0"
                value={operatingHours}
                onChange={(event) => setOperatingHours(event.target.value)}
                className="h-13 w-full rounded-[14px] border border-[#d7deed] px-4 outline-none focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
                required
              />
            </label>
          ) : null}
          {fieldsForCategoryAndSubcategory(listing.category, {
            bodyType: technicalData.bodyType,
            fuelType: technicalData.fuelType,
          }).map((field) => (
            <TechnicalField
              key={field.name}
              field={field}
              value={technicalData[field.name] || ''}
              onChange={setTechnicalValue}
            />
          ))}
        </div>
      </section>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold">{copy.descriptionTitle}</span>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={7}
          className="w-full rounded-[16px] border border-[#d7deed] p-4 text-[#101828] outline-none placeholder:font-normal placeholder:text-[#98a2b3] focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
          placeholder={copy.descriptionPlaceholder}
        />
      </label>

      <section className="rounded-[18px] border border-[#dfe6f1] p-4">
        <h2 className="text-lg font-semibold tracking-[-.03em]">{copy.equipmentTitle}</h2>
        <EquipmentEditor
          locale={locale}
          searchPlaceholder={copy.equipmentSearchPlaceholder}
          category={listing.category}
          selectedKeys={equipmentKeys}
          search={equipmentSearch}
          onSearch={setEquipmentSearch}
          onSelectedKeys={setEquipmentKeys}
        />
      </section>

      {listing.sellerType === 'private' ? (
        <section className="rounded-[18px] border border-[#dfe6f1] bg-[#fbfcff] p-4">
          <h2 className="text-lg font-semibold tracking-[-.03em]">Telefonnummer</h2>
          <p className="mt-1 text-sm leading-6 text-[#667085]">
            Ett öppet telefonnummer kan ge fler kontakter. Om du kräver inloggning kan det minska antalet förfrågningar.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setPhoneVisibility('public')}
              className={`rounded-[14px] border px-4 py-3 text-left text-sm font-semibold ${
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
              className={`rounded-[14px] border px-4 py-3 text-left text-sm font-semibold ${
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
        <p role="alert" className="rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}

      <button
        disabled={saving}
        className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-[14px] bg-[#0866ff] px-6 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(8,102,255,.24)] disabled:opacity-60 sm:w-auto"
      >
        <Check className="h-5 w-5" />
        {saving ? copy.saving : copy.saveChanges}
      </button>
      {successNoticeOpen ? (
        <div className="fixed inset-0 z-[160] grid place-items-center bg-[#101828]/45 px-4 py-8 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="edit-listing-success-title">
          <div className="w-full max-w-[460px] rounded-[24px] bg-white p-6 shadow-[0_24px_70px_rgba(16,24,40,.24)]">
            <div className="flex items-start justify-between gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#eef5ff] text-[#0866ff]">
                <Check className="h-5 w-5" />
              </span>
              <button
                type="button"
                onClick={() => setSuccessNoticeOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full border border-[#d7deed] text-[#475467] transition hover:border-[#0866ff] hover:text-[#0866ff]"
                aria-label={copy.close}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <h2 id="edit-listing-success-title" className="mt-4 text-xl font-semibold tracking-[-0.03em] text-[#101828]">
              {copy.savedTitle}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#667085]">
              {copy.savedDelayText}
            </p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setSuccessNoticeOpen(false)}
                className="inline-flex min-h-11 items-center justify-center rounded-[12px] border border-[#cbd7e8] bg-white px-4 text-sm font-semibold text-[#344054] transition hover:bg-[#f8faff]"
              >
                {copy.close}
              </button>
              <button
                type="button"
                onClick={() => router.push(backHref)}
                className="inline-flex min-h-11 items-center justify-center rounded-[12px] bg-[#0866ff] px-4 text-sm font-semibold text-white transition hover:bg-[#0758dc]"
              >
                {copy.backToListings}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </form>
  )
}

function EquipmentEditor({
  locale,
  searchPlaceholder,
  category,
  selectedKeys,
  search,
  onSearch,
  onSelectedKeys,
}: {
  locale: PublicLocale
  searchPlaceholder: string
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
            <span key={option.key} className="inline-flex items-center gap-2 rounded-full bg-[#eef5ff] px-3 py-2 text-sm font-semibold text-[#0866ff]">
              {equipmentLabel(option, locale)}
              <button type="button" onClick={() => toggle(option.key)} aria-label={`${removeLabel(locale)} ${equipmentLabel(option, locale)}`}>
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
          placeholder={searchPlaceholder}
          className="h-12 w-full rounded-[14px] border border-[#d7deed] pl-10 pr-4 text-[#101828] outline-none placeholder:font-normal placeholder:text-[#98a2b3] focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
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
              <h3 className="text-xs font-semibold uppercase tracking-[.14em] text-[#667085]">{groupLabel(group, locale)}</h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {options.map((option) => (
                  <label key={option.key} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-[12px] border border-[#d7deed] bg-white px-3 py-2 text-sm font-semibold">
                    <input
                      type="checkbox"
                      checked={selected.has(option.key)}
                      onChange={() => toggle(option.key)}
                      className="h-4 w-4 accent-[#0866ff]"
                    />
                    {equipmentLabel(option, locale)}
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

function IdentifierField({
  field,
  value,
  onChange,
}: {
  field: (typeof listingRequirementsByCategory)[MarketplaceCategorySlug][number]
  value: string
  onChange: (key: keyof ListingIdentifierInput, value: string) => void
}) {
  const options = identifierSelectOptions[field.key]
  if (options?.length) {
    return (
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">{field.label}</span>
        <select
          value={value}
          onChange={(event) => onChange(field.key, event.target.value)}
          className="h-13 w-full rounded-[14px] border border-[#d7deed] bg-white px-4 outline-none focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
          required={field.required}
        >
          <option value="">Välj</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    )
  }

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">{field.label}</span>
      <input
        type={field.key === 'totalWeightKg' ? 'number' : 'text'}
        min={field.key === 'totalWeightKg' ? 1 : undefined}
        value={value}
        onChange={(event) => onChange(field.key, event.target.value)}
        className="h-13 w-full rounded-[14px] border border-[#d7deed] px-4 outline-none focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
        required={field.required}
      />
    </label>
  )
}

function TechnicalField({
  field,
  value,
  onChange,
}: {
  field: ListingTechnicalField
  value: string
  onChange: (key: string, value: string) => void
}) {
  if (field.kind === 'chips' || field.kind === 'select') {
    return (
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">{field.label}</span>
        <select
          value={value}
          onChange={(event) => onChange(field.name, event.target.value)}
          className="h-13 w-full rounded-[14px] border border-[#d7deed] bg-white px-4 outline-none focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
          required={field.required}
        >
          <option value="">Välj</option>
          {(field.options || []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    )
  }

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">
        {field.label}
        {field.suffix ? ` (${field.suffix})` : ''}
      </span>
      <input
        type={field.kind === 'date' ? 'date' : field.kind === 'number' ? 'number' : 'text'}
        min={field.min}
        max={field.max}
        step={field.kind === 'number' && decimalTechnicalFieldNames.has(field.name) ? '0.1' : undefined}
        value={value}
        onChange={(event) => onChange(field.name, event.target.value)}
        className="h-13 w-full rounded-[14px] border border-[#d7deed] px-4 outline-none focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
        required={field.required}
      />
    </label>
  )
}

function getEditListingFormCopy(locale: PublicLocale) {
  const en = {
    imagesTitle: 'Images',
    imagesHelp: 'Add JPG, PNG, WebP or AVIF. You can change the order and choose the main image.',
    addImages: 'Add images',
    uploadingImages: 'Uploading...',
    saveImageOrder: 'Save image order',
    savingImageOrder: 'Saving order...',
    imagesOrderError: 'The image order could not be saved.',
    mainImage: 'Main image',
    makeMainImage: 'Make main image',
    imageNumber: 'Image',
    imageAlt: 'Listing image',
    moveLeft: 'Move image left',
    moveRight: 'Move image right',
    noImages: 'The listing has no images. Add at least one image.',
    saveChanges: 'Save changes',
    saving: 'Saving...',
    savedTitle: 'Changes saved',
    savedDelayText: 'Your changes have been saved. It can take 5-10 minutes before they are visible on the live listing.',
    close: 'Close',
    backToListings: 'Back to listings',
    imagesUploadError: 'The images could not be uploaded.',
    saveError: 'The listing could not be saved.',
    descriptionTitle: 'Description',
    descriptionPlaceholder: 'Write only your own free text here. Structured details and equipment are selected in fixed fields.',
    equipmentTitle: 'Equipment',
    equipmentSearchPlaceholder: 'Search equipment',
  }
  const localized: Partial<Record<PublicLocale, typeof en>> = {
    sv: {
      imagesTitle: 'Bilder',
      imagesHelp: 'Lägg till JPG, PNG, WebP eller AVIF. Du kan ändra ordningen och välja huvudbild.',
      addImages: 'Lägg till bilder',
      uploadingImages: 'Laddar upp...',
      saveImageOrder: 'Spara bildordning',
      savingImageOrder: 'Sparar ordning...',
      imagesOrderError: 'Bildordningen kunde inte sparas.',
      mainImage: 'Huvudbild',
      makeMainImage: 'Gör till huvudbild',
      imageNumber: 'Bild',
      imageAlt: 'Annonsbild',
      moveLeft: 'Flytta bild åt vänster',
      moveRight: 'Flytta bild åt höger',
      noImages: 'Annonsen saknar bilder. Lägg till minst en bild.',
      saveChanges: 'Spara ändringar',
      saving: 'Sparar...',
      savedTitle: 'Ändringarna är sparade',
      savedDelayText: 'Dina ändringar är sparade. Det kan ta 5-10 minuter innan de syns på live-annonsen.',
      close: 'Stäng',
      backToListings: 'Tillbaka till annonser',
      imagesUploadError: 'Bilderna kunde inte laddas upp.',
      saveError: 'Annonsen kunde inte sparas.',
      descriptionTitle: 'Beskrivning',
      descriptionPlaceholder: 'Skriv bara egen fritext här. Strukturerade uppgifter och utrustning väljs i fasta fält.',
      equipmentTitle: 'Utrustning',
      equipmentSearchPlaceholder: 'Sök utrustning',
    },
    de: {
      imagesTitle: 'Bilder',
      imagesHelp: 'JPG, PNG, WebP oder AVIF hinzufügen. Sie können die Reihenfolge ändern und das Hauptbild wählen.',
      addImages: 'Bilder hinzufügen',
      uploadingImages: 'Wird hochgeladen...',
      saveImageOrder: 'Bildreihenfolge speichern',
      savingImageOrder: 'Reihenfolge wird gespeichert...',
      imagesOrderError: 'Die Bildreihenfolge konnte nicht gespeichert werden.',
      mainImage: 'Hauptbild',
      makeMainImage: 'Als Hauptbild festlegen',
      imageNumber: 'Bild',
      imageAlt: 'Anzeigenbild',
      moveLeft: 'Bild nach links verschieben',
      moveRight: 'Bild nach rechts verschieben',
      noImages: 'Die Anzeige hat keine Bilder. Fügen Sie mindestens ein Bild hinzu.',
      saveChanges: 'Änderungen speichern',
      saving: 'Speichern...',
      savedTitle: 'Änderungen gespeichert',
      savedDelayText: 'Ihre Änderungen wurden gespeichert. Es kann 5-10 Minuten dauern, bis sie in der Live-Anzeige sichtbar sind.',
      close: 'Schließen',
      backToListings: 'Zurück zu Anzeigen',
      imagesUploadError: 'Die Bilder konnten nicht hochgeladen werden.',
      saveError: 'Die Anzeige konnte nicht gespeichert werden.',
      descriptionTitle: 'Beschreibung',
      descriptionPlaceholder: 'Schreiben Sie hier nur Ihren eigenen Freitext. Strukturierte Angaben und Ausstattung werden in festen Feldern gewählt.',
      equipmentTitle: 'Ausstattung',
      equipmentSearchPlaceholder: 'Ausstattung suchen',
    },
    fr: {
      imagesTitle: 'Images',
      imagesHelp: 'Ajoutez JPG, PNG, WebP ou AVIF. Vous pouvez modifier l’ordre et choisir l’image principale.',
      addImages: 'Ajouter des images',
      uploadingImages: 'Téléversement...',
      saveImageOrder: 'Enregistrer l’ordre',
      savingImageOrder: 'Enregistrement...',
      imagesOrderError: 'L’ordre des images n’a pas pu être enregistré.',
      mainImage: 'Image principale',
      makeMainImage: 'Définir comme principale',
      imageNumber: 'Image',
      imageAlt: 'Image de l’annonce',
      moveLeft: 'Déplacer l’image à gauche',
      moveRight: 'Déplacer l’image à droite',
      noImages: 'L’annonce ne contient aucune image. Ajoutez au moins une image.',
      saveChanges: 'Enregistrer',
      saving: 'Enregistrement...',
      savedTitle: 'Modifications enregistrées',
      savedDelayText: 'Vos modifications ont été enregistrées. Elles peuvent prendre 5 à 10 minutes avant d’apparaître sur l’annonce en ligne.',
      close: 'Fermer',
      backToListings: 'Retour aux annonces',
      imagesUploadError: 'Les images n’ont pas pu être téléversées.',
      saveError: 'L’annonce n’a pas pu être enregistrée.',
      descriptionTitle: 'Description',
      descriptionPlaceholder: 'Rédigez uniquement votre texte libre ici. Les informations structurées et l’équipement se choisissent dans les champs prévus.',
      equipmentTitle: 'Équipement',
      equipmentSearchPlaceholder: 'Rechercher un équipement',
    },
    es: {
      imagesTitle: 'Imágenes',
      imagesHelp: 'Añade JPG, PNG, WebP o AVIF. Puedes cambiar el orden y elegir la imagen principal.',
      addImages: 'Añadir imágenes',
      uploadingImages: 'Subiendo...',
      saveImageOrder: 'Guardar orden',
      savingImageOrder: 'Guardando orden...',
      imagesOrderError: 'No se pudo guardar el orden de las imágenes.',
      mainImage: 'Imagen principal',
      makeMainImage: 'Usar como principal',
      imageNumber: 'Imagen',
      imageAlt: 'Imagen del anuncio',
      moveLeft: 'Mover imagen a la izquierda',
      moveRight: 'Mover imagen a la derecha',
      noImages: 'El anuncio no tiene imágenes. Añade al menos una imagen.',
      saveChanges: 'Guardar cambios',
      saving: 'Guardando...',
      savedTitle: 'Cambios guardados',
      savedDelayText: 'Tus cambios se han guardado. Pueden tardar entre 5 y 10 minutos en verse en el anuncio publicado.',
      close: 'Cerrar',
      backToListings: 'Volver a anuncios',
      imagesUploadError: 'No se pudieron subir las imágenes.',
      saveError: 'No se pudo guardar el anuncio.',
      descriptionTitle: 'Descripción',
      descriptionPlaceholder: 'Escribe aquí solo tu texto libre. Los datos estructurados y el equipamiento se eligen en campos fijos.',
      equipmentTitle: 'Equipamiento',
      equipmentSearchPlaceholder: 'Buscar equipamiento',
    },
    it: {
      imagesTitle: 'Immagini',
      imagesHelp: 'Aggiungi JPG, PNG, WebP o AVIF. Puoi cambiare ordine e scegliere l’immagine principale.',
      addImages: 'Aggiungi immagini',
      uploadingImages: 'Caricamento...',
      saveImageOrder: 'Salva ordine',
      savingImageOrder: 'Salvataggio ordine...',
      imagesOrderError: 'Impossibile salvare l’ordine delle immagini.',
      mainImage: 'Immagine principale',
      makeMainImage: 'Rendi principale',
      imageNumber: 'Immagine',
      imageAlt: 'Immagine annuncio',
      moveLeft: 'Sposta immagine a sinistra',
      moveRight: 'Sposta immagine a destra',
      noImages: 'L’annuncio non ha immagini. Aggiungi almeno un’immagine.',
      saveChanges: 'Salva modifiche',
      saving: 'Salvataggio...',
      savedTitle: 'Modifiche salvate',
      savedDelayText: 'Le modifiche sono state salvate. Possono volerci 5-10 minuti prima che siano visibili nell’annuncio online.',
      close: 'Chiudi',
      backToListings: 'Torna agli annunci',
      imagesUploadError: 'Impossibile caricare le immagini.',
      saveError: 'Impossibile salvare l’annuncio.',
      descriptionTitle: 'Descrizione',
      descriptionPlaceholder: 'Scrivi qui solo il tuo testo libero. Dati strutturati e dotazioni si selezionano nei campi dedicati.',
      equipmentTitle: 'Dotazioni',
      equipmentSearchPlaceholder: 'Cerca dotazioni',
    },
    nl: {
      imagesTitle: 'Afbeeldingen',
      imagesHelp: 'Voeg JPG, PNG, WebP of AVIF toe. U kunt de volgorde aanpassen en de hoofdfoto kiezen.',
      addImages: 'Afbeeldingen toevoegen',
      uploadingImages: 'Uploaden...',
      saveImageOrder: 'Volgorde opslaan',
      savingImageOrder: 'Volgorde opslaan...',
      imagesOrderError: 'De afbeeldingsvolgorde kon niet worden opgeslagen.',
      mainImage: 'Hoofdfoto',
      makeMainImage: 'Maak hoofdfoto',
      imageNumber: 'Afbeelding',
      imageAlt: 'Advertentieafbeelding',
      moveLeft: 'Afbeelding naar links',
      moveRight: 'Afbeelding naar rechts',
      noImages: 'De advertentie heeft geen afbeeldingen. Voeg minstens één afbeelding toe.',
      saveChanges: 'Wijzigingen opslaan',
      saving: 'Opslaan...',
      savedTitle: 'Wijzigingen opgeslagen',
      savedDelayText: 'Uw wijzigingen zijn opgeslagen. Het kan 5-10 minuten duren voordat ze zichtbaar zijn op de live advertentie.',
      close: 'Sluiten',
      backToListings: 'Terug naar advertenties',
      imagesUploadError: 'De afbeeldingen konden niet worden geüpload.',
      saveError: 'De advertentie kon niet worden opgeslagen.',
      descriptionTitle: 'Beschrijving',
      descriptionPlaceholder: 'Schrijf hier alleen uw eigen vrije tekst. Gestructureerde gegevens en uitrusting kiest u in vaste velden.',
      equipmentTitle: 'Uitrusting',
      equipmentSearchPlaceholder: 'Uitrusting zoeken',
    },
    pl: {
      imagesTitle: 'Zdjęcia',
      imagesHelp: 'Dodaj JPG, PNG, WebP lub AVIF. Możesz zmienić kolejność i wybrać zdjęcie główne.',
      addImages: 'Dodaj zdjęcia',
      uploadingImages: 'Przesyłanie...',
      saveImageOrder: 'Zapisz kolejność',
      savingImageOrder: 'Zapisywanie kolejności...',
      imagesOrderError: 'Nie udało się zapisać kolejności zdjęć.',
      mainImage: 'Zdjęcie główne',
      makeMainImage: 'Ustaw jako główne',
      imageNumber: 'Zdjęcie',
      imageAlt: 'Zdjęcie ogłoszenia',
      moveLeft: 'Przesuń zdjęcie w lewo',
      moveRight: 'Przesuń zdjęcie w prawo',
      noImages: 'Ogłoszenie nie ma zdjęć. Dodaj co najmniej jedno zdjęcie.',
      saveChanges: 'Zapisz zmiany',
      saving: 'Zapisywanie...',
      savedTitle: 'Zmiany zapisane',
      savedDelayText: 'Zmiany zostały zapisane. Może minąć 5-10 minut, zanim będą widoczne w ogłoszeniu na żywo.',
      close: 'Zamknij',
      backToListings: 'Wróć do ogłoszeń',
      imagesUploadError: 'Nie udało się przesłać zdjęć.',
      saveError: 'Nie udało się zapisać ogłoszenia.',
      descriptionTitle: 'Opis',
      descriptionPlaceholder: 'Wpisz tutaj tylko własny tekst. Dane strukturalne i wyposażenie wybiera się w stałych polach.',
      equipmentTitle: 'Wyposażenie',
      equipmentSearchPlaceholder: 'Szukaj wyposażenia',
    },
    fi: {
      imagesTitle: 'Kuvat',
      imagesHelp: 'Lisää JPG-, PNG-, WebP- tai AVIF-kuvia. Voit muuttaa järjestystä ja valita pääkuvan.',
      addImages: 'Lisää kuvia',
      uploadingImages: 'Ladataan...',
      saveImageOrder: 'Tallenna kuvajärjestys',
      savingImageOrder: 'Tallennetaan järjestystä...',
      imagesOrderError: 'Kuvajärjestystä ei voitu tallentaa.',
      mainImage: 'Pääkuva',
      makeMainImage: 'Aseta pääkuvaksi',
      imageNumber: 'Kuva',
      imageAlt: 'Ilmoituksen kuva',
      moveLeft: 'Siirrä kuva vasemmalle',
      moveRight: 'Siirrä kuva oikealle',
      noImages: 'Ilmoituksessa ei ole kuvia. Lisää vähintään yksi kuva.',
      saveChanges: 'Tallenna muutokset',
      saving: 'Tallennetaan...',
      savedTitle: 'Muutokset tallennettu',
      savedDelayText: 'Muutokset on tallennettu. Niiden näkyminen live-ilmoituksessa voi kestää 5-10 minuuttia.',
      close: 'Sulje',
      backToListings: 'Takaisin ilmoituksiin',
      imagesUploadError: 'Kuvia ei voitu ladata.',
      saveError: 'Ilmoitusta ei voitu tallentaa.',
      descriptionTitle: 'Kuvaus',
      descriptionPlaceholder: 'Kirjoita tähän vain oma vapaatekstisi. Rakenteiset tiedot ja varusteet valitaan omista kentistään.',
      equipmentTitle: 'Varusteet',
      equipmentSearchPlaceholder: 'Hae varusteita',
    },
    da: {
      imagesTitle: 'Billeder',
      imagesHelp: 'Tilføj JPG, PNG, WebP eller AVIF. Du kan ændre rækkefølgen og vælge hovedbilledet.',
      addImages: 'Tilføj billeder',
      uploadingImages: 'Uploader...',
      saveImageOrder: 'Gem billedrækkefølge',
      savingImageOrder: 'Gemmer rækkefølge...',
      imagesOrderError: 'Billedrækkefølgen kunne ikke gemmes.',
      mainImage: 'Hovedbillede',
      makeMainImage: 'Gør til hovedbillede',
      imageNumber: 'Billede',
      imageAlt: 'Annoncebillede',
      moveLeft: 'Flyt billede til venstre',
      moveRight: 'Flyt billede til højre',
      noImages: 'Annoncen har ingen billeder. Tilføj mindst ét billede.',
      saveChanges: 'Gem ændringer',
      saving: 'Gemmer...',
      savedTitle: 'Ændringer gemt',
      savedDelayText: 'Dine ændringer er gemt. Det kan tage 5-10 minutter, før de vises på live-annoncen.',
      close: 'Luk',
      backToListings: 'Tilbage til annoncer',
      imagesUploadError: 'Billederne kunne ikke uploades.',
      saveError: 'Annoncen kunne ikke gemmes.',
      descriptionTitle: 'Beskrivelse',
      descriptionPlaceholder: 'Skriv kun din egen fritekst her. Strukturerede oplysninger og udstyr vælges i faste felter.',
      equipmentTitle: 'Udstyr',
      equipmentSearchPlaceholder: 'Søg udstyr',
    },
  }
  if (locale === 'at') return localized.de || en
  if (locale === 'be') return localized.nl || en
  return localized[locale] || translatePublicObject(locale, en)
}

function brandCorrectionLabel(locale: PublicLocale, suggestion: string) {
  const labels: Record<PublicLocale, string> = {
    sv: `Menade du ${suggestion}?`,
    en: `Did you mean ${suggestion}?`,
    de: `Meinten Sie ${suggestion}?`,
    at: `Meinten Sie ${suggestion}?`,
    be: `Bedoelde u ${suggestion}?`,
    fr: `Vouliez-vous dire ${suggestion} ?`,
    es: `¿Querías decir ${suggestion}?`,
    it: `Intendevi ${suggestion}?`,
    pl: `Czy chodziło o ${suggestion}?`,
    nl: `Bedoelde u ${suggestion}?`,
    fi: `Tarkoititko ${suggestion}?`,
    da: `Mente du ${suggestion}?`,
  }

  return labels[locale] || labels.en
}

function removeLabel(locale: PublicLocale) {
  const labels: Record<PublicLocale, string> = {
    sv: 'Ta bort',
    en: 'Remove',
    de: 'Entfernen',
    at: 'Entfernen',
    be: 'Verwijderen',
    fr: 'Supprimer',
    es: 'Quitar',
    it: 'Rimuovi',
    pl: 'Usuń',
    nl: 'Verwijderen',
    fi: 'Poista',
    da: 'Fjern',
  }
  return labels[locale] || labels.en
}

function groupLabel(
  group: ReturnType<typeof equipmentGroupsForCategory>[number],
  locale: PublicLocale,
) {
  if (locale === 'sv') return group.sv
  if (locale === 'de' || locale === 'at') return group.de
  if (locale === 'en') return group.en
  return translatePublic(locale, group.en)
}

function isSwedishMileageCountry(country: string) {
  const normalized = country.trim().toUpperCase()
  return normalized === 'SE' || normalized === 'SWEDEN' || normalized === 'SVERIGE'
}

function formatMileageForInput(kilometers: number, usesSwedishMileage: boolean) {
  return String(usesSwedishMileage ? Math.round(kilometers / swedishMileageFactor) : Math.round(kilometers))
}

function mileageInputToKilometers(value: string, usesSwedishMileage: boolean) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return value
  return String(Math.round(usesSwedishMileage ? numeric * swedishMileageFactor : numeric))
}
