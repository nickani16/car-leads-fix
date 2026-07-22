import type { MarketplaceCategorySlug } from './marketplace'

export type ListingOption = {
  value: string
  label: string
}

export type ListingTechnicalField = {
  name: string
  label: string
  kind: 'chips' | 'select' | 'number' | 'text' | 'date'
  options?: ListingOption[]
  required?: boolean
  min?: number
  max?: number
  suffix?: string
}

export const listingColorOptions: Array<ListingOption & { color: string; border?: string }> = [
  { value: 'Vit', label: 'Vit', color: '#ffffff', border: '#d0d5dd' },
  { value: 'Svart', label: 'Svart', color: '#111827' },
  { value: 'Grå', label: 'Grå', color: '#6b7280' },
  { value: 'Silver', label: 'Silver', color: 'linear-gradient(135deg,#f8fafc,#aeb8c5,#eef2f7)' },
  { value: 'Blå', label: 'Blå', color: '#1d4ed8' },
  { value: 'Mörkblå', label: 'Mörkblå', color: '#0b1f4d' },
  { value: 'Röd', label: 'Röd', color: '#dc2626' },
  { value: 'Vinröd', label: 'Vinröd', color: '#7f1d1d' },
  { value: 'Grön', label: 'Grön', color: '#16a34a' },
  { value: 'Mörkgrön', label: 'Mörkgrön', color: '#14532d' },
  { value: 'Gul', label: 'Gul', color: '#facc15' },
  { value: 'Orange', label: 'Orange', color: '#f97316' },
  { value: 'Brun', label: 'Brun', color: '#92400e' },
  { value: 'Beige', label: 'Beige', color: '#d6c3a3' },
  { value: 'Guld', label: 'Guld', color: 'linear-gradient(135deg,#fff3b0,#d4af37,#8a6d1d)' },
  { value: 'Champagne', label: 'Champagne', color: 'linear-gradient(135deg,#fff7df,#d9c69b,#f6ead2)' },
  { value: 'Lila', label: 'Lila', color: '#7c3aed' },
  { value: 'Rosa', label: 'Rosa', color: '#ec4899' },
  { value: 'Turkos', label: 'Turkos', color: '#14b8a6' },
  { value: 'Antracit', label: 'Antracit', color: 'linear-gradient(135deg,#4b5563,#111827,#6b7280)' },
  { value: 'other', label: 'Annan färg', color: 'linear-gradient(135deg,#0866ff,#f97316)' },
]

const gearboxOptions = options(['Automat', 'Manuell', 'Halvautomat'])

const fuelOptions = options([
  'Bensin',
  'Diesel',
  'El',
  'Hybrid',
  'Plug-in hybrid',
  'Etanol',
  'Gas',
  'Annat',
])

const heavyFuelOptions = options(['Diesel', 'El', 'Hybrid', 'Gas', 'HVO', 'Annat'])

const drivetrainOptions = options([
  'Framhjulsdrift',
  'Bakhjulsdrift',
  'Fyrhjulsdrift',
])
const motorcycleGearboxOptions = options(['Manuell', 'Automat', 'Halvautomat'])
const machineDrivetrainOptions = options(['Band', 'Hjul', '4WD', '2WD', 'Annat'])

const conditionOptions = options(['Ny', 'Begagnad', 'Defekt', 'Reservdelsobjekt'])
const yesNoUnknownOptions = options(['Nej', 'Ja', 'Vet ej'])

const electrifiedFuelValues = new Set(['el', 'electric', 'hybrid', 'plug-in hybrid', 'plug in hybrid'])

const electricPowertrainFields: ListingTechnicalField[] = [
  numberField('electricRangeKm', 'Räckvidd', 1, 2000, 'km'),
  numberField('batteryCapacityKWh', 'Batterikapacitet', 0.1, 500, 'kWh'),
  numberField('motorPowerKw', 'Motoreffekt', 0.1, 2000, 'kW'),
  numberField('chargingPowerKw', 'Laddningseffekt', 0.1, 500, 'kW'),
  numberField('chargingTimeHours', 'Laddningstid', 0.1, 100, 'h'),
  chips('fastCharging', 'Snabbladdning', yesNoUnknownOptions),
  chips('regenerativeBraking', 'Regenerativ bromsning', yesNoUnknownOptions),
]

function isElectrifiedFuel(value: unknown) {
  return electrifiedFuelValues.has(String(value || '').trim().toLowerCase())
}

function isPureElectricFuel(value: unknown) {
  const normalized = String(value || '').trim().toLowerCase()
  return normalized === 'el' || normalized === 'electric'
}
const serviceHistoryOptions = options(['Fullständig', 'Delvis', 'Saknas', 'Vet ej'])

const damageStatusOptions = options([
  'Inga kända fel',
  'Mindre bruksspår',
  'Repor/lackskador',
  'Tekniskt fel',
  'Behöver service',
  'Ej körklar',
  'Annat fel',
])

const vanFeeClassOptions = options(['Lätt lastbil', 'Annat', 'Vet ej'])
const motorhomeFeeClassOptions = options(['Husbil', 'Annat', 'Vet ej'])
const caravanFeeClassOptions = options(['Husvagn', 'Annat', 'Vet ej'])
const axleCountOptions = options(['2 axlar', '3 axlar', '4 axlar', '5+ axlar'])

export const categoryTechnicalFields: Record<
  MarketplaceCategorySlug,
  ListingTechnicalField[]
> = {
  cars: [
    numberField('powerHp', 'Effekt', 1, 3000, 'HK'),
    numberField('engineLiters', 'Motorvolym', 0.1, 20, 'L'),
    numberField('seats', 'Säten', 1, 12, 'st'),
    dateField('firstRegistrationDate', 'Registreringsdatum'),
    chips('bodyType', 'Kaross', ['Halvkombi', 'Sedan', 'SUV', 'Kombi', 'Coupé', 'Cabriolet', 'Pickup', 'Elbil'], true),
    chips('fuelType', 'Bränsle / drivlina', fuelOptions, true),
    chips('gearbox', 'Växellåda', gearboxOptions, true),
    chips('drivetrain', 'Drivning', drivetrainOptions),
    chips('importStatus', 'Import', yesNoUnknownOptions),
    chips('serviceHistory', 'Servicehistorik', serviceHistoryOptions),
    chips('condition', 'Skick', conditionOptions, true),
    chips('damageStatus', 'Skador/fel', damageStatusOptions),
    numberField('maxTrailerWeightKg', 'Max trailervikt', 1, 10000, 'kg'),
  ],
  vans: [
    numberField('powerHp', 'Effekt', 1, 3000, 'HK'),
    numberField('engineLiters', 'Motorvolym', 0.1, 20, 'L'),
    numberField('payloadKg', 'Lastvikt', 1, 10000, 'kg', true),
    numberField('cargoVolumeM3', 'Lastvolym', 1, 80, 'm³'),
    numberField('loadLengthCm', 'Lastutrymme längd', 1, 800, 'cm'),
    numberField('seats', 'Säten', 1, 20, 'st'),
    chips('feeClass', 'Avgiftsklass', vanFeeClassOptions),
    dateField('firstRegistrationDate', 'Registreringsdatum'),
    chips('bodyType', 'Karosstyp', ['Skåpbil', 'Crew van', 'Box van', 'Kylbil', 'Minibuss', 'Pickup', 'Flak', 'Chassi', 'Eltransport'], true),
    chips('fuelType', 'Bränsle / drivlina', fuelOptions, true),
    chips('gearbox', 'Växellåda', gearboxOptions, true),
    chips('drivetrain', 'Drivning', drivetrainOptions),
    chips('importStatus', 'Import', yesNoUnknownOptions),
    chips('serviceHistory', 'Servicehistorik', serviceHistoryOptions),
    chips('condition', 'Skick', conditionOptions, true),
    chips('damageStatus', 'Skador/fel', damageStatusOptions),
    numberField('maxTrailerWeightKg', 'Max trailervikt', 1, 12000, 'kg'),
  ],
  motorcycles: [
    chips('bodyType', 'Motorcykeltyp', ['Sport', 'Touring', 'Custom', 'Scooter', 'Cross / enduro', 'Naked', 'Adventure', 'Moped', 'ATV'], true),
    numberField('engineCc', 'Motorvolym', 1, 10000, 'cc', true),
    numberField('powerHp', 'Effekt', 1, 500, 'HK'),
    chips('fuelType', 'Drivmedel', ['Bensin', 'El', 'Hybrid', 'Annat'], true),
    chips('gearbox', 'Växellåda', motorcycleGearboxOptions),
    chips('abs', 'ABS', yesNoUnknownOptions, true),
    chips('condition', 'Skick', conditionOptions, true),
    chips('serviceHistory', 'Servicehistorik', serviceHistoryOptions),
    chips('damageStatus', 'Skador/fel', damageStatusOptions),
  ],
  motorhomes: [
    numberField('powerHp', 'Effekt', 1, 3000, 'HK'),
    numberField('engineLiters', 'Motorvolym', 0.1, 20, 'L'),
    numberField('totalWeightKg', 'Totalvikt', 1, 12000, 'kg', true),
    numberField('seats', 'Säten', 1, 12, 'st'),
    chips('feeClass', 'Avgiftsklass', motorhomeFeeClassOptions),
    dateField('firstRegistrationDate', 'Registreringsdatum'),
    chips('bodyType', 'Typ', ['Helintegrerad', 'Halvintegrerad', 'Alkov', 'Camper van', 'Plåtis'], true),
    numberField('sleepingPlaces', 'Sovplatser', 1, 12, 'st', true),
    numberField('lengthCm', 'Längd', 250, 1500, 'cm'),
    chips('fuelType', 'Drivmedel', fuelOptions, true),
    chips('gearbox', 'Växellåda', gearboxOptions),
    chips('heatingSystem', 'Värmesystem', ['Alde', 'Truma', 'Dieselvärmare', 'Elvärme', 'Annat']),
    chips('layout', 'Planlösning', ['Queen bed', 'Långbäddar', 'Våningssäng', 'Dinette', 'Bakre lounge', 'Annat']),
    chips('inspected', 'Besiktigad', yesNoUnknownOptions),
    chips('condition', 'Skick', conditionOptions, true),
    chips('damageStatus', 'Skador/fel', damageStatusOptions),
    numberField('maxTrailerWeightKg', 'Max trailervikt', 1, 12000, 'kg'),
  ],
  caravans: [
    numberField('totalWeightKg', 'Totalvikt', 1, 5000, 'kg', true),
    numberField('payloadKg', 'Lastvikt', 1, 2500, 'kg'),
    chips('feeClass', 'Avgiftsklass', caravanFeeClassOptions),
    dateField('firstRegistrationDate', 'Registreringsdatum'),
    chips('bodyType', 'Typ', ['Enkelaxel', 'Boggie', 'Familjevagn', 'Vintervagn', 'Liten husvagn'], true),
    numberField('sleepingPlaces', 'Sovplatser', 1, 12, 'st', true),
    numberField('lengthCm', 'Längd', 250, 1500, 'cm'),
    chips('heatingSystem', 'Värmesystem', ['Alde', 'Truma', 'Elvärme', 'Gasolvärme', 'Annat']),
    chips('layout', 'Planlösning', ['Queen bed', 'Långbäddar', 'Våningssäng', 'Dinette', 'Bakre lounge', 'Annat']),
    chips('inspected', 'Besiktigad', yesNoUnknownOptions),
    chips('condition', 'Skick', conditionOptions, true),
    chips('damageStatus', 'Skador/fel', damageStatusOptions),
  ],
  trucks: [
    chips('bodyType', 'Påbyggnad', ['Dragbil', 'Skåp', 'Flak', 'Tipp', 'Kranbil', 'Kylbil', 'Chassi', 'Tankbil', 'Lastväxlare', 'Betongbil'], true),
    numberField('payloadKg', 'Lastvikt', 1, 60000, 'kg', true),
    numberField('grossCombinationWeightKg', 'Tågvikt', 1, 100000, 'kg'),
    chips('axleCount', 'Antal axlar', axleCountOptions, true),
    chips('euroClass', 'Euroklass', ['Euro 3', 'Euro 4', 'Euro 5', 'Euro 6', 'El', 'Annat']),
    chips('fuelType', 'Drivmedel', heavyFuelOptions, true),
    chips('gearbox', 'Växellåda', gearboxOptions, true),
    chips('condition', 'Skick', conditionOptions, true),
    chips('damageStatus', 'Skador/fel', damageStatusOptions),
    chips('serviceHistory', 'Servicehistorik', serviceHistoryOptions),
  ],
  agriculture: [
    numberField('operatingHours', 'Drifttimmar', 1, 50000, 'h'),
    chips('bodyType', 'Maskintyp', ['Traktor', 'Skördetröska', 'Redskap', 'Press', 'Vagn', 'Spruta', 'Lastare', 'Annat'], true),
    chips('fuelType', 'Drivmedel', heavyFuelOptions),
    chips('attachmentType', 'Redskapsfäste', ['Trepunkt', 'Frontlastare', 'PTO', 'Hydrauliskt', 'Drag', 'Annat']),
    chips('drivetrain', 'Drivning', machineDrivetrainOptions),
    numberField('powerHp', 'Effekt', 1, 1000, 'HK'),
    chips('condition', 'Skick', conditionOptions, true),
    chips('damageStatus', 'Skador/fel', damageStatusOptions),
    chips('serviceHistory', 'Servicehistorik', serviceHistoryOptions),
  ],
  construction: [
    numberField('operatingHours', 'Drifttimmar', 1, 50000, 'h'),
    chips('bodyType', 'Maskintyp', ['Grävmaskin', 'Minigrävare', 'Hjullastare', 'Dumper', 'Dozer', 'Vält', 'Lift', 'Kran', 'Kompaktor', 'Annat'], true),
    chips('fuelType', 'Drivmedel', heavyFuelOptions, true),
    chips('attachmentType', 'Redskapsfäste', ['S40', 'S45', 'S50', 'S60', 'S70', 'Hydrauliskt', 'Annat']),
    chips('drivetrain', 'Drivning', machineDrivetrainOptions),
    numberField('operatingWeightKg', 'Maskinvikt', 1, 150000, 'kg'),
    numberField('diggingDepthCm', 'Grävdjup', 1, 3000, 'cm'),
    chips('condition', 'Skick', conditionOptions, true),
    chips('damageStatus', 'Skador/fel', damageStatusOptions),
    chips('serviceHistory', 'Servicehistorik', serviceHistoryOptions),
  ],
  'electric-bikes': [
    chips('bodyType', 'Cykeltyp', ['City', 'Hybrid', 'Mountainbike', 'Cargo', 'Folding', 'Speedbike', 'Racer', 'Barncykel'], true),
    numberField('batteryCapacityWh', 'Batterikapacitet', 1, 3000, 'Wh', true),
    numberField('batteryVoltageV', 'Batterispänning', 1, 100, 'V'),
    numberField('rangeKm', 'Räckvidd', 1, 500, 'km'),
    numberField('motorPowerW', 'Motoreffekt', 1, 2000, 'W'),
    numberField('maxSpeedKmh', 'Maxhastighet', 1, 80, 'km/h'),
    chips('condition', 'Skick', conditionOptions, true),
    chips('damageStatus', 'Skador/fel', damageStatusOptions),
  ],
}

export const categoryEquipmentOptions: Record<MarketplaceCategorySlug, ListingOption[]> = {
  cars: options(['Navigation', 'Backkamera', 'Parkeringssensorer', 'Dragkrok', 'LED-strålkastare', 'Xenon', 'Adaptiv farthållare', 'Farthållare', 'Bluetooth', 'Apple CarPlay', 'Android Auto', 'Elstolar', 'Sätesvärme', 'Ventilerade säten', 'Panoramatak', 'Taklucka', 'Skinnklädsel', 'ISOFIX', 'Keyless', 'Head-up display', 'Fyrhjulsdrift', 'Vinterhjul', 'Sommarhjul']),
  vans: options(['Navigation', 'Backkamera', 'Parkeringssensorer', 'Dragkrok', 'LED-strålkastare', 'Xenon', 'Adaptiv farthållare', 'Farthållare', 'Bluetooth', 'Apple CarPlay', 'Android Auto', 'Elstolar', 'Sätesvärme', 'Skåpinredning', 'Lastbågar', 'Bakgavellyft', 'Kylaggregat', 'Vinterhjul', 'Sommarhjul']),
  motorcycles: options(['Packväskor', 'ABS', 'Traction control', 'Värmehandtag', 'Quickshifter', 'Vindruta']),
  motorhomes: options(['Solpanel', 'Markis', 'Backkamera', 'Cykelställ', 'AC', 'Toalett', 'Dusch', 'Dragkrok']),
  caravans: options(['Förtält', 'Mover', 'Solpanel', 'AC', 'Vinterpaket', 'Cykelställ']),
  trucks: options(['Hydraulik', 'Retarder', 'PTO', 'Kran', 'Bakgavellyft', 'Kylaggregat', 'Sovhytt']),
  agriculture: options(['Frontlastare', 'GPS', 'PTO', 'Hydrauluttag', 'Dubbelmontage', 'Redskap ingår']),
  construction: options(['Rototilt', 'Skopor ingår', 'Snabbfäste', 'GPS', 'Centralsmörjning', 'Kamera']),
  'electric-bikes': options(['Laddare', 'Extra batteri', 'Pakethållare', 'Lås', 'Korg', 'Barnstol']),
}

export const identifierSelectOptions: Partial<Record<string, ListingOption[]>> = {
  agricultureObjectType: [
    { value: 'tractor', label: 'Traktor' },
    { value: 'implement', label: 'Redskap' },
  ],
  axleConfiguration: options(['4x2', '6x2', '6x4', '8x2', '8x4', 'Annat']),
  machineType: options(['Grävmaskin', 'Minigrävare', 'Hjullastare', 'Dumper', 'Dozer', 'Vält', 'Lift', 'Traktor', 'Skördetröska', 'Redskap', 'Annat']),
}

const yesNoOptions = options(['Nej', 'Ja'])

export const categorySubcategoryFields: Partial<
  Record<MarketplaceCategorySlug, Record<string, ListingTechnicalField[]>>
> = {
  agriculture: {
    tractor: [
      chips('pto', 'PTO', yesNoOptions),
      chips('hydraulics', 'Hydraulik', yesNoOptions),
      chips('frontLoader', 'Frontlastare', yesNoOptions),
      chips('gps', 'GPS', yesNoOptions),
      chips('isobus', 'ISOBUS', yesNoOptions),
    ],
    balePress: [
      chips('baleType', 'Baltyp', ['Rundbal', 'Fyrkantsbal', 'Småbal', 'Annat']),
      numberField('baleSize', 'Balstorlek', 1, 300, 'cm'),
      chips('chamberType', 'Kammartyp', ['Fast', 'Variabel', 'Annat']),
      chips('knives', 'Knivar', yesNoOptions),
      chips('wrapper', 'Plastare', yesNoOptions),
    ],
  },
  construction: {
    excavator: [
      chips('quickCoupler', 'Snabbfäste', yesNoOptions),
      chips('hydraulics', 'Hydraulik', yesNoOptions),
      chips('tiltrotator', 'Rotortilt', yesNoOptions),
      chips('buckets', 'Skopor', yesNoOptions),
    ],
    lift: [
      numberField('workingHeightM', 'Arbetshöjd', 1, 150, 'm'),
      numberField('outreachM', 'Räckvidd', 1, 100, 'm'),
      numberField('platformCapacityKg', 'Plattformskapacitet', 1, 10000, 'kg'),
    ],
  },
}

function subcategoryKey(value: unknown) {
  const text = String(value || '').toLowerCase()
  if (text.includes('traktor') || text.includes('tractor')) return 'tractor'
  if (text.includes('press') || text.includes('baler')) return 'balePress'
  if (
    text.includes('excav') ||
    text.includes('grävmaskin') ||
    text.includes('grÃ¤vmaskin') ||
    text.includes('bagger') ||
    text.includes('pelle')
  ) return 'excavator'
  if (text.includes('lift')) return 'lift'
  return null
}

export function fieldsForCategoryAndSubcategory(
  category: MarketplaceCategorySlug,
  values: Record<string, unknown> = {},
) {
  const base = (categoryTechnicalFields[category] || []).filter(
    (field) => !(isPureElectricFuel(values.fuelType) && field.name === 'engineLiters'),
  )
  const key = subcategoryKey(values.bodyType)
  const extra = key ? categorySubcategoryFields[category]?.[key] || [] : []
  const electric = isElectrifiedFuel(values.fuelType) ? electricPowertrainFields : []
  return [...base, ...electric, ...extra]
}

export const structuredListingFieldNames = Array.from(
  new Set(
    Object.values(categoryTechnicalFields)
      .flat()
      .concat(electricPowertrainFields)
      .concat(Object.values(categorySubcategoryFields).flatMap((groups) => Object.values(groups).flat()))
      .map((field) => field.name)
      .concat(['color', 'equipment', 'sellerNote']),
  ),
)

function option(value: string): ListingOption {
  return { value, label: value }
}

function options(values: string[]): ListingOption[] {
  return values.map(option)
}

function chips(
  name: string,
  label: string,
  values: string[] | ListingOption[],
  required = false,
): ListingTechnicalField {
  return {
    name,
    label,
    kind: 'chips',
    options: values.map((value) =>
      typeof value === 'string' ? option(value) : value,
    ),
    required,
  }
}

function numberField(
  name: string,
  label: string,
  min: number,
  max: number,
  suffix: string,
  required = false,
): ListingTechnicalField {
  return { name, label, kind: 'number', min, max, suffix, required }
}

function dateField(name: string, label: string, required = false): ListingTechnicalField {
  return { name, label, kind: 'date', required }
}
