'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  Crown,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react'
import PublicHeader from './PublicHeader'
import PublicBreadcrumbs from './PublicBreadcrumbs'
import ListingPackageCheckoutButton from './ListingPackageCheckoutButton'
import { swedishCounties } from '@/lib/swedish-regions.generated'

export type FormLocale = 'sv' | 'de' | 'en'

type LocalSeoContent = {
  city: string
  county: string
  countySlug: string
  areaDescription: string
  nearby: { name: string; slug: string }[]
  regionType?: 'municipality' | 'county'
}

const BRANDS = [
  'Abarth', 'Alfa Romeo', 'Alpine', 'Aston Martin', 'Audi', 'Bentley', 'BMW',
  'BYD', 'Cadillac', 'Chevrolet', 'Chrysler', 'Citroën', 'Cupra', 'Dacia',
  'Dodge', 'DS Automobiles', 'Ferrari', 'Fiat', 'Ford', 'Genesis', 'Honda',
  'Hongqi', 'Hyundai', 'Infiniti', 'Isuzu', 'Jaguar', 'Jeep', 'Kia',
  'Koenigsegg', 'Lamborghini', 'Land Rover', 'Lexus', 'Lotus', 'Lucid',
  'Lynk & Co', 'Maserati', 'Maxus', 'Mazda', 'McLaren', 'Mercedes-Benz',
  'MG', 'MINI', 'Mitsubishi', 'NIO', 'Nissan', 'Opel', 'Peugeot', 'Polestar',
  'Porsche', 'Renault', 'Rolls-Royce', 'Saab', 'SEAT', 'Škoda', 'Smart',
  'Subaru', 'Suzuki', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo', 'XPeng',
  'ZEEKR', 'Other',
]

const YEARS = Array.from(
  { length: new Date().getFullYear() - 2016 },
  (_, index) => String(new Date().getFullYear() + 1 - index)
)

const EU_COUNTRIES = [
  ['AT', 'Austria'],
  ['BE', 'Belgium'],
  ['BG', 'Bulgaria'],
  ['HR', 'Croatia'],
  ['CY', 'Cyprus'],
  ['CZ', 'Czechia'],
  ['DK', 'Denmark'],
  ['EE', 'Estonia'],
  ['FI', 'Finland'],
  ['FR', 'France'],
  ['DE', 'Germany'],
  ['GR', 'Greece'],
  ['HU', 'Hungary'],
  ['IE', 'Ireland'],
  ['IT', 'Italy'],
  ['LV', 'Latvia'],
  ['LT', 'Lithuania'],
  ['LU', 'Luxembourg'],
  ['MT', 'Malta'],
  ['NL', 'Netherlands'],
  ['PL', 'Poland'],
  ['PT', 'Portugal'],
  ['RO', 'Romania'],
  ['SK', 'Slovakia'],
  ['SI', 'Slovenia'],
  ['ES', 'Spain'],
  ['SE', 'Sweden'],
] as const

const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024
const MAX_SUBMIT_IMAGE_BYTES = 3.4 * 1024 * 1024
const TARGET_IMAGE_BYTES = 280 * 1024
const IMAGE_MAX_DIMENSION = 1600
const IMAGE_QUALITY_STEPS = [0.72, 0.62, 0.52, 0.44]

function imageSizeError(locale: FormLocale) {
  if (locale === 'de') {
    return 'Die Bilder sind zu groÃŸ. Bitte laden Sie weniger oder kleinere Bilder hoch.'
  }
  if (locale === 'en') {
    return 'The photos are too large. Please upload fewer or smaller images.'
  }
  return 'Bilderna Ã¤r fÃ¶r stora. Ladda upp fÃ¤rre eller mindre bilder.'
}

function singleImageSizeError(locale: FormLocale) {
  if (locale === 'de') {
    return 'Ein oder mehrere Bilder sind groesser als 10 MB und wurden nicht hinzugefuegt.'
  }
  if (locale === 'en') {
    return 'One or more photos are larger than 10 MB and were not added.'
  }
  return 'En eller flera bilder Ã¤r stÃ¶rre Ã¤n 10 MB och lades inte till.'
}

function readImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = document.createElement('img')

    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Image could not be loaded.'))
    }
    image.src = url
  })
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Image could not be compressed.'))
      },
      'image/jpeg',
      quality
    )
  })
}

async function compressImage(file: File) {
  const image = await readImage(file)
  const scale = Math.min(
    1,
    IMAGE_MAX_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight)
  )
  const canvas = document.createElement('canvas')

  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
  canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height)

  let smallest: Blob | null = null
  for (const quality of IMAGE_QUALITY_STEPS) {
    const blob = await canvasToJpeg(canvas, quality)
    if (!smallest || blob.size < smallest.size) smallest = blob
    if (blob.size <= TARGET_IMAGE_BYTES) break
  }

  if (!smallest) return file

  const name = file.name.replace(/\.[^.]+$/, '') || 'vehicle-photo'
  return new File([smallest], `${name}.jpg`, {
    type: 'image/jpeg',
    lastModified: Date.now(),
  })
}

const copy = {
  sv: {
    market: 'Sälj din bil till professionella köpare',
    hero: 'Sälj din bil till verifierade handlare i Sverige och Europa.',
    intro: 'Fyll i bilens uppgifter kostnadsfritt. I formuläret ser du om bilen uppfyller våra grundkriterier för årsmodell, miltal, plats och tekniskt skick.',
    secure: 'Kostnadsfri registrering utan bindning',
    steps: ['Bilen', 'Teknik', 'Skick', 'Bilder & kontakt'],
    step: 'Steg',
    of: 'av',
    vehicleEyebrow: 'Fordonsidentitet',
    vehicleTitle: 'Berätta vilken bil du vill sälja',
    vehicleIntro: 'Börja med registrering, årsmodell, miltal och var bilen finns. Vi tar för närvarande emot bilar från 2018 och nyare.',
    reg: 'Registreringsnummer',
    make: 'Bilmärke',
    model: 'Modell',
    variant: 'Variant / version',
    year: 'Årsmodell',
    mileage: 'Miltal',
    firstRegistration: 'Första registrering',
    pickupCity: 'Ort där bilen finns',
    pickupPostalCode: 'Postnummer',
    pickupCountry: 'Land',
    selectBrand: 'Välj bilmärke',
    selectYear: 'Välj årsmodell',
    technicalEyebrow: 'Tekniska uppgifter',
    technicalTitle: 'Bilens viktigaste specifikationer',
    technicalIntro: 'Detta gör bilen jämförbar för handlare i hela Europa.',
    body: 'Karosstyp',
    fuel: 'Bränsle',
    gearbox: 'Växellåda',
    drivetrain: 'Drivning',
    power: 'Motoreffekt',
    color: 'Färg',
    conditionEyebrow: 'Historik och skick',
    conditionTitle: 'Kvalificera bilens tekniska skick',
    conditionIntro: 'Konkreta svar avgör om bilen kan gå vidare till europeisk budgivning.',
    driveable: 'Är bilen körbar och trafiksäker?',
    engineTransmissionIssues: 'Finns problem med motor eller växellåda?',
    fluidLeaks: 'Finns olje-, kylvätske- eller andra vätskeläckage?',
    seriousCollisionDamage: 'Har bilen en större eller ej reparerad krockskada?',
    owners: 'Antal tidigare ägare',
    service: 'Servicehistorik',
    damage: 'Skador',
    damageDescription: 'Beskriv skadorna',
    warnings: 'Varningslampor',
    tires: 'Däckens skick',
    tireSets: 'Däckuppsättningar som medföljer',
    keys: 'Antal nycklar',
    towbar: 'Dragkrok',
    sellTime: 'När vill du sälja?',
    equipment: 'Viktig utrustning (valfritt)',
    finalEyebrow: 'Bilder och kontakt',
    finalTitle: 'Sista steget',
    finalIntro: 'Bra bilder hjälper handlarna att lämna mer träffsäkra bud.',
    upload: 'Ladda upp bilder',
    uploadHelp: 'Minst 4 bilder, högst 12. Max 10 MB per bild.',
    photos: 'bilder',
    phone: 'Telefonnummer',
    email: 'E-postadress',
    financeTitle: 'Ägande och finansiering',
    financeIntro: 'Detta påverkar inte om du får skicka in bilen. Uppgifterna hjälper Autorell att planera en säker lösen- och ägarövergång om du accepterar ett bud.',
    financeStatus: 'Hur är bilen finansierad?',
    financeProvider: 'Finansbolag eller bank',
    financeReference: 'Avtals- eller lånenummer',
    financeBalance: 'Ungefärligt kvarvarande belopp',
    financeBalanceHelp: 'En uppskattning räcker. Autorell begär ett aktuellt lösenbelopp före affären.',
    financeConsent: 'Jag ger Autorell tillåtelse att kontakta finansbolaget för att verifiera finansieringen och begära lösenbelopp om jag går vidare med ett bud.',
    financeNotice: 'Autorell betalar i förekommande fall finansbolaget direkt. Ett överskott betalas till dig. Om skulden är högre än köpeskillingen behöver mellanskillnaden lösas före överlämning.',
    leasingNotice: 'En leasingbil kan bara säljas om leasingbolaget skriftligen godkänner lösen eller utköp. Autorell granskar detta innan affären kan genomföras.',
    privacy: 'Jag har läst',
    privacyLink: 'integritetspolicyn',
    termsJoin: 'och accepterar',
    termsLink: 'användarvillkoren',
    back: 'Tillbaka',
    next: 'Fortsätt',
    submit: 'Skicka för granskning',
    sending: 'Skickar...',
    required: 'Obligatoriskt',
    optional: 'Valfritt',
    choose: 'Välj alternativ',
    successLabel: 'Förfrågan mottagen',
    successTitle: 'Tack! Bilen är skickad för granskning.',
    successText: 'Vi kontrollerar fordonsprofilen innan en eventuell 24-timmarsbudgivning startas.',
    home: 'Till Autorell',
    errors: {
      vehicle: 'Fyll i registreringsnummer, märke, modell, årsmodell, miltal, ort och postnummer.',
      technical: 'Välj karosstyp, bränsle, växellåda och drivning.',
      condition: 'Fyll i servicehistorik, skador, varningslampor och säljtillfälle.',
      qualification: 'Bilen behöver vara körbar och utan allvarliga motor-, växellåds-, läckage- eller krockproblem för att gå vidare.',
      damage: 'Beskriv skadorna kort.',
      photos: 'Ladda upp minst 4 bilder.',
      contact: 'Kontrollera telefonnummer, e-post och integritetsgodkännande.',
      finance: 'Fyll i finansbolag och godkänn att Autorell får verifiera finansieringen.',
      server: 'Något gick fel. Försök igen.',
    },
  },
  de: {
    market: 'Fahrzeugverkauf Deutschland',
    hero: 'Verkaufen Sie Ihr Fahrzeug an unser europäisches Händlernetz.',
    intro: 'Geben Sie die wichtigsten Daten ein. Das dauert meist 3–5 Minuten.',
    secure: 'Sichere und kostenlose Anfrage',
    steps: ['Fahrzeug', 'Technik', 'Zustand', 'Fotos & Kontakt'],
    step: 'Schritt', of: 'von',
    vehicleEyebrow: 'Fahrzeugidentität',
    vehicleTitle: 'Welches Fahrzeug möchten Sie verkaufen?',
    vehicleIntro: 'Beginnen Sie mit den wichtigsten Fahrzeugdaten.',
    reg: 'Kennzeichen', make: 'Marke', model: 'Modell',
    variant: 'Variante / Ausführung', year: 'Modelljahr',
    mileage: 'Kilometerstand', firstRegistration: 'Erstzulassung',
    pickupCity: 'Abholort des Fahrzeugs',
    pickupPostalCode: 'Postleitzahl',
    pickupCountry: 'Land',
    selectBrand: 'Marke wählen', selectYear: 'Modelljahr wählen',
    technicalEyebrow: 'Technische Daten',
    technicalTitle: 'Die wichtigsten Spezifikationen',
    technicalIntro: 'Damit Händler das Fahrzeug europaweit vergleichen können.',
    body: 'Karosserie', fuel: 'Kraftstoff', gearbox: 'Getriebe',
    drivetrain: 'Antrieb', power: 'Leistung', color: 'Farbe',
    conditionEyebrow: 'Historie und Zustand',
    conditionTitle: 'Wie ist der Zustand des Fahrzeugs?',
    conditionIntro: 'Genaue Angaben schaffen Vertrauen und bessere Gebote.',
    driveable: 'Ist das Fahrzeug fahrbereit und verkehrssicher?',
    engineTransmissionIssues: 'Gibt es Motor- oder Getriebeprobleme?',
    fluidLeaks: 'Gibt es Öl-, Kühlmittel- oder andere Flüssigkeitslecks?',
    seriousCollisionDamage: 'Hat das Fahrzeug einen schweren oder unreparierten Unfallschaden?',
    owners: 'Vorbesitzer', service: 'Servicehistorie', damage: 'Schäden',
    damageDescription: 'Schäden beschreiben', warnings: 'Warnleuchten',
    tires: 'Reifenzustand',
    tireSets: 'Mitgelieferte Reifensätze',
    keys: 'Anzahl Schlüssel', towbar: 'Anhängerkupplung',
    sellTime: 'Wann möchten Sie verkaufen?', equipment: 'Wichtige Ausstattung (optional)',
    finalEyebrow: 'Fotos und Kontakt', finalTitle: 'Der letzte Schritt',
    finalIntro: 'Gute Fotos helfen Händlern, präzisere Gebote abzugeben.',
    upload: 'Fahrzeugfotos hochladen',
    uploadHelp: 'Mindestens 4, maximal 12 Bilder. Fotos werden vor dem Senden automatisch optimiert.',
    photos: 'Bilder', phone: 'Telefonnummer', email: 'E-Mail-Adresse',
    financeTitle: 'Eigentum und Finanzierung',
    financeIntro: 'Diese Angaben helfen Autorell, eine sichere Ablösung und Eigentumsübertragung zu planen, falls Sie ein Gebot annehmen.',
    financeStatus: 'Wie ist das Fahrzeug finanziert?',
    financeProvider: 'Finanzierungsgesellschaft oder Bank',
    financeReference: 'Vertrags- oder Kreditnummer',
    financeBalance: 'Geschätzter Restbetrag',
    financeBalanceHelp: 'Eine Schätzung genügt. Autorell fordert vor Abschluss einen aktuellen Ablösebetrag an.',
    financeConsent: 'Ich ermächtige Autorell, die Finanzierung zu prüfen und bei Bedarf einen Ablösebetrag anzufordern.',
    financeNotice: 'Autorell zahlt gegebenenfalls direkt an den Finanzierer. Ein Überschuss wird an Sie ausgezahlt; eine Unterdeckung muss vor Übergabe ausgeglichen werden.',
    leasingNotice: 'Ein Leasingfahrzeug kann nur mit schriftlicher Zustimmung des Leasinggebers verkauft werden.',
    privacy: 'Ich habe die',
    privacyLink: 'Datenschutzerklärung gelesen',
    termsJoin: 'und akzeptiere die',
    termsLink: 'Nutzungsbedingungen',
    back: 'Zurück', next: 'Weiter', submit: 'Anfrage senden', sending: 'Wird gesendet...',
    required: 'Pflichtfeld', optional: 'Optional', choose: 'Bitte wählen',
    successLabel: 'Anfrage erhalten', successTitle: 'Vielen Dank! Wir prüfen Ihr Fahrzeug.',
    successText: 'Wir melden uns, sobald das Fahrzeugprofil bereit ist.',
    home: 'Zu Autorell',
    errors: {
      vehicle: 'Bitte Kennzeichen, Marke, Modell, Modelljahr, Kilometerstand, Abholort und Postleitzahl ausfüllen.',
      technical: 'Bitte Karosserie, Kraftstoff, Getriebe und Antrieb wählen.',
      condition: 'Bitte Servicehistorie, Schäden, Warnleuchten und Verkaufszeitpunkt angeben.',
      qualification: 'Das Fahrzeug muss fahrbereit und frei von schweren Motor-, Getriebe-, Leckage- oder Unfallschäden sein.',
      damage: 'Bitte beschreiben Sie die Schäden kurz.',
      photos: 'Bitte mindestens 4 Bilder hochladen.',
      contact: 'Bitte Telefonnummer, E-Mail und Datenschutzbestätigung prüfen.',
      finance: 'Bitte Finanzierer angeben und die Prüfung der Finanzierung erlauben.',
      server: 'Etwas ist schiefgelaufen. Bitte erneut versuchen.',
    },
  },
  en: {
    market: 'European vehicle selling',
    hero: 'Sell your vehicle to our European dealer network.',
    intro: 'Enter the essential details. It usually takes 3–5 minutes.',
    secure: 'Secure and free enquiry',
    steps: ['Vehicle', 'Technical', 'Condition', 'Photos & contact'],
    step: 'Step', of: 'of',
    vehicleEyebrow: 'Vehicle identity', vehicleTitle: 'Which vehicle are you selling?',
    vehicleIntro: 'Start with the essential vehicle details.',
    reg: 'Registration number', make: 'Make', model: 'Model',
    variant: 'Variant / trim', year: 'Model year', mileage: 'Mileage',
    firstRegistration: 'First registration', selectBrand: 'Select make',
    pickupCity: 'Vehicle collection city',
    pickupPostalCode: 'Postal code',
    pickupCountry: 'Country',
    selectYear: 'Select model year', technicalEyebrow: 'Technical details',
    technicalTitle: 'The key specifications',
    technicalIntro: 'This makes the vehicle comparable across Europe.',
    body: 'Body type', fuel: 'Fuel type', gearbox: 'Transmission',
    drivetrain: 'Drivetrain', power: 'Power', color: 'Colour',
    conditionEyebrow: 'History and condition', conditionTitle: 'What is the vehicle condition?',
    conditionIntro: 'Accurate information builds confidence and stronger bids.',
    driveable: 'Is the vehicle driveable and roadworthy?',
    engineTransmissionIssues: 'Are there engine or transmission problems?',
    fluidLeaks: 'Are there oil, coolant or other fluid leaks?',
    seriousCollisionDamage: 'Does the vehicle have major or unrepaired collision damage?',
    owners: 'Previous owners', service: 'Service history', damage: 'Damage',
    damageDescription: 'Describe the damage', warnings: 'Warning lights',
    tires: 'Tire condition',
    tireSets: 'Tire sets included',
    keys: 'Number of keys', towbar: 'Towbar',
    sellTime: 'When do you want to sell?', equipment: 'Key equipment (optional)',
    finalEyebrow: 'Photos and contact', finalTitle: 'The final step',
    finalIntro: 'Good photos help dealers submit more accurate bids.',
    upload: 'Upload vehicle photos',
    uploadHelp: 'Minimum 4, maximum 12 images. Photos are optimized automatically before sending.',
    photos: 'photos', phone: 'Phone number', email: 'Email address',
    financeTitle: 'Ownership and finance',
    financeIntro: 'These details help Autorell plan a secure settlement and title transfer if you accept a bid.',
    financeStatus: 'How is the vehicle financed?',
    financeProvider: 'Finance company or bank',
    financeReference: 'Agreement or loan reference',
    financeBalance: 'Estimated outstanding balance',
    financeBalanceHelp: 'An estimate is enough. Autorell requests a current settlement figure before completion.',
    financeConsent: 'I authorise Autorell to verify the finance and request a settlement figure if required.',
    financeNotice: 'Where applicable, Autorell pays the finance provider directly. Any surplus is paid to you; any shortfall must be covered before handover.',
    leasingNotice: 'A leased vehicle can only be sold with the leasing company’s written approval for settlement or purchase.',
    privacy: 'I have read the',
    privacyLink: 'privacy policy',
    termsJoin: 'and accept the',
    termsLink: 'terms of use', back: 'Back', next: 'Continue',
    submit: 'Submit enquiry', sending: 'Submitting...', required: 'Required',
    optional: 'Optional', choose: 'Select an option',
    successLabel: 'Enquiry received', successTitle: 'Thank you! We are reviewing your vehicle.',
    successText: 'We will contact you when the vehicle profile is ready.',
    home: 'Go to Autorell',
    errors: {
      vehicle: 'Enter registration, make, model, model year, mileage, collection city and postal code.',
      technical: 'Select body type, fuel type, transmission and drivetrain.',
      condition: 'Enter service history, damage, warning lights and selling time.',
      qualification: 'The vehicle must be driveable and free from major engine, transmission, leakage or collision issues.',
      damage: 'Briefly describe the damage.',
      photos: 'Upload at least 4 photos.',
      contact: 'Check your phone number, email and privacy acceptance.',
      finance: 'Enter the finance provider and authorise Autorell to verify the finance.',
      server: 'Something went wrong. Please try again.',
    },
  },
} as const

const options = {
  sv: {
    body: ['SUV', 'Sedan', 'Kombi', 'Halvkombi', 'Coupé', 'Cabriolet', 'Minibuss / MPV', 'Pickup', 'Transportbil', 'Annat'],
    fuel: ['Bensin', 'Diesel', 'El', 'Laddhybrid', 'Hybrid', 'Etanol', 'Gas', 'Annat'],
    gearbox: ['Automat', 'Manuell'],
    drivetrain: ['Framhjulsdrift', 'Bakhjulsdrift', 'Fyrhjulsdrift'],
    service: ['Full servicehistorik', 'Delvis servicehistorik', 'Ingen servicehistorik'],
    damage: ['Inga kända skador', 'Mindre kosmetiska skador', 'Större skador', 'Krockskada'],
    warnings: ['Inga varningslampor', 'Varningslampor finns'],
    tires: ['Nya', 'Bra skick', 'Slitna'],
    tireSets: [
      'Endast sommardäck',
      'Endast vinterdäck',
      'Sommar- och vinterdäck',
      'Året runt-däck',
    ],
    yesNo: ['Ja', 'Nej'],
    sell: ['Så snart som möjligt', 'Inom 1–2 veckor', 'Inom en månad', 'Inom 2–3 månader', 'Osäker'],
  },
  de: {
    body: ['SUV', 'Limousine', 'Kombi', 'Schrägheck', 'Coupé', 'Cabriolet', 'Van / MPV', 'Pickup', 'Transporter', 'Sonstige'],
    fuel: ['Benzin', 'Diesel', 'Elektro', 'Plug-in-Hybrid', 'Hybrid', 'Ethanol', 'Gas', 'Sonstige'],
    gearbox: ['Automatik', 'Schaltgetriebe'],
    drivetrain: ['Frontantrieb', 'Heckantrieb', 'Allradantrieb'],
    service: ['Lückenlose Servicehistorie', 'Teilweise Servicehistorie', 'Keine Servicehistorie'],
    damage: ['Keine bekannten Schäden', 'Kleine kosmetische Schäden', 'Größere Schäden', 'Unfallschaden'],
    warnings: ['Keine Warnleuchten', 'Warnleuchten aktiv'],
    tires: ['Neu', 'Guter Zustand', 'Abgenutzt'],
    tireSets: [
      'Nur Sommerreifen',
      'Nur Winterreifen',
      'Sommer- und Winterreifen',
      'Ganzjahresreifen',
    ],
    yesNo: ['Ja', 'Nein'],
    sell: ['So schnell wie möglich', 'Innerhalb 1–2 Wochen', 'Innerhalb eines Monats', 'Innerhalb 2–3 Monaten', 'Unsicher'],
  },
  en: {
    body: ['SUV', 'Sedan', 'Estate / Wagon', 'Hatchback', 'Coupé', 'Convertible', 'MPV', 'Pickup', 'Van', 'Other'],
    fuel: ['Petrol', 'Diesel', 'Electric', 'Plug-in hybrid', 'Hybrid', 'Ethanol', 'Gas', 'Other'],
    gearbox: ['Automatic', 'Manual'],
    drivetrain: ['Front-wheel drive', 'Rear-wheel drive', 'All-wheel drive'],
    service: ['Full service history', 'Partial service history', 'No service history'],
    damage: ['No known damage', 'Minor cosmetic damage', 'Significant damage', 'Accident damage'],
    warnings: ['No warning lights', 'Warning lights present'],
    tires: ['New', 'Good condition', 'Worn'],
    tireSets: [
      'Summer tires only',
      'Winter tires only',
      'Summer and winter tires',
      'All-season tires',
    ],
    yesNo: ['Yes', 'No'],
    sell: ['As soon as possible', 'Within 1–2 weeks', 'Within one month', 'Within 2–3 months', 'Not sure'],
  },
} as const

const emptyForm = {
  reg: '', make: '', model: '', variant: '', modelYear: '', miles: '',
  firstRegistration: '', pickupCity: '', pickupPostalCode: '', pickupCountry: '',
  bodyType: '', fuelType: '', gearbox: '',
  drivetrain: '', powerHp: '', color: '', owners: '', service: '',
  damage: '', damageDescription: '', warnings: '', tires: '', tireset: '',
  keysCount: '',
  driveable: '', engineTransmissionIssues: '', fluidLeaks: '',
  seriousCollisionDamage: '',
  towbar: '', sellTime: '', equipment: '', phone: '', email: '',
  financeStatus: '', financeProvider: '', financeAgreementReference: '',
  financeEstimatedBalance: '', financeContactConsent: false,
  privacyAccepted: false,
}

type FormState = typeof emptyForm
type FieldKey = keyof FormState | 'images'
type FieldErrors = Partial<Record<FieldKey, string>>

const SWEDISH_MILEAGE_LIMIT = 10_000
const SWEDISH_MIN_MODEL_YEAR = 2018
const SWEDISH_MILEAGE_LIMIT_MESSAGE =
  'Vårt nätverk av europeiska återförsäljare fokuserar för närvarande på fordon med upp till 10 000 mil. Tyvärr innebär det att vi inte kan erbjuda försäljning eller förmedling av bilar som överstiger denna gräns.'
const SWEDISH_MODEL_YEAR_MESSAGE =
  'Autorell tar just nu emot bilar från årsmodell 2018 och framåt.'
const SWEDISH_LOCATION_MESSAGE =
  'I den första lanseringen tar Autorell endast emot bilar som finns registrerade och tillgängliga i Sverige.'

const conversionCopy = {
  sv: {
    promise: 'En tryggare väg till rätt pris',
    benefitTitle: 'Du behåller kontrollen hela vägen.',
    benefitText:
      'Din bil presenteras professionellt för verifierade handlare. Du väljer själv om du vill gå vidare.',
    trust: [
      ['Kostnadsfritt', 'Ingen avgift för värderingen'],
      ['Ingen förbindelse', 'Du bestämmer om du vill sälja'],
      ['Skyddade uppgifter', 'Kontaktdata visas aldrig för handlare'],
    ],
    time: 'Tar normalt 3–5 minuter',
    network: 'Verifierade europeiska bilhandlare',
    data: 'Dina uppgifter hanteras säkert',
    footer: 'Kostnadsfritt · Ingen förbindelse · Säker hantering',
  },
  de: {
    promise: 'Ein sicherer Weg zum richtigen Preis',
    benefitTitle: 'Sie behalten jederzeit die Kontrolle.',
    benefitText:
      'Ihr Fahrzeug wird professionell verifizierten Händlern präsentiert. Sie entscheiden selbst, ob Sie verkaufen.',
    trust: [
      ['Kostenlos', 'Keine Gebühr für die Bewertung'],
      ['Unverbindlich', 'Sie entscheiden, ob Sie verkaufen'],
      ['Geschützte Daten', 'Kontaktdaten bleiben für Händler verborgen'],
    ],
    time: 'Dauert normalerweise 3–5 Minuten',
    network: 'Verifizierte europäische Händler',
    data: 'Ihre Daten werden sicher verarbeitet',
    footer: 'Kostenlos · Unverbindlich · Sichere Verarbeitung',
  },
  en: {
    promise: 'A safer route to the right price',
    benefitTitle: 'You stay in control throughout.',
    benefitText:
      'Your vehicle is presented professionally to verified dealers. You decide whether to proceed with a sale.',
    trust: [
      ['Free valuation', 'No fee for submitting your vehicle'],
      ['No obligation', 'You decide whether to sell'],
      ['Protected details', 'Dealers never see your contact information'],
    ],
    time: 'Usually takes 3–5 minutes',
    network: 'Verified European dealers',
    data: 'Your information is handled securely',
    footer: 'Free · No obligation · Secure handling',
  },
} as const

export default function VehicleLeadForm({
  locale,
  localSeo,
}: {
  locale: FormLocale
  localSeo?: LocalSeoContent
}) {
  const t = copy[locale]
  const o = options[locale]
  const c = conversionCopy[locale]
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    ...emptyForm,
    pickupCity:
      localSeo?.regionType === 'county' ? '' : localSeo?.city || '',
    pickupCountry: locale === 'sv' ? 'SE' : locale === 'de' ? 'DE' : '',
  })
  const [images, setImages] = useState<{ id: string; file: File; url: string }[]>([])
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [sellerPortalUrl, setSellerPortalUrl] = useState('')

  const source = form.pickupCountry
  const distanceUnit = locale === 'sv' ? 'mil' : 'km'
  const mileageLimitExceeded =
    locale === 'sv' && Number(form.miles) > SWEDISH_MILEAGE_LIMIT
  const modelYearUnsupported =
    locale === 'sv' &&
    Boolean(form.modelYear) &&
    Number(form.modelYear) < SWEDISH_MIN_MODEL_YEAR
  const locationUnsupported =
    locale === 'sv' && Boolean(form.pickupCountry) && form.pickupCountry !== 'SE'
  const qualificationFailed =
    locale === 'sv' &&
    (form.driveable === 'Nej' ||
      form.engineTransmissionIssues === 'Ja' ||
      form.fluidLeaks === 'Ja' ||
      form.seriousCollisionDamage === 'Ja' ||
      form.warnings === o.warnings[1] ||
      form.damage === o.damage[2] ||
      form.damage === o.damage[3])
  const powerUnit = locale === 'sv' ? 'hk' : locale === 'de' ? 'PS' : 'hp'
  const currencyUnit = locale === 'sv' ? 'SEK' : 'EUR'
  const financeOptions =
    locale === 'sv'
      ? [
          ['owned_outright', 'Bilen är fullt betald och ägs av mig'],
          ['vehicle_finance', 'Billån eller avbetalning med bilen som säkerhet'],
          ['unsecured_loan', 'Privatlån utan bilen som säkerhet'],
          ['leasing', 'Privat- eller företagsleasing'],
          ['unknown', 'Jag är osäker'],
        ]
      : locale === 'de'
        ? [
            ['owned_outright', 'Vollständig bezahlt und in meinem Eigentum'],
            ['vehicle_finance', 'Fahrzeugfinanzierung oder Ratenkredit'],
            ['unsecured_loan', 'Unbesicherter Privatkredit'],
            ['leasing', 'Privat- oder Gewerbeleasing'],
            ['unknown', 'Ich bin nicht sicher'],
          ]
        : [
            ['owned_outright', 'Fully paid and owned by me'],
            ['vehicle_finance', 'Vehicle finance or secured hire purchase'],
            ['unsecured_loan', 'Unsecured personal loan'],
            ['leasing', 'Private or business lease'],
            ['unknown', 'I am not sure'],
          ]
  const securedFinance =
    form.financeStatus === 'vehicle_finance' || form.financeStatus === 'leasing'
  const otherBrandLabel =
    locale === 'sv' ? 'Annat' : locale === 'de' ? 'Sonstige' : 'Other'
  const pageMarket = localSeo
    ? localSeo.regionType === 'county'
      ? `Sälj bil i ${localSeo.city} · Sveriges kommuner`
      : `Sälj bil i ${localSeo.city} · ${localSeo.county}`
    : t.market
  const pageHero = localSeo
    ? `Sälj din bil i ${localSeo.city}. Nå fler professionella köpare.`
    : t.hero
  const pageIntro = localSeo
    ? `Registrera bilen kostnadsfritt och låt verifierade bilhandlare i Sverige och Europa bedöma den. Du följer processen digitalt och väljer själv om du vill acceptera ett bud.`
    : t.intro
  const successView =
    locale === 'sv'
      ? {
          live: 'Mottagen för granskning',
          title: 'Vi granskar bilen innan publicering.',
          text: 'Autorell kontrollerar uppgifterna och bilderna innan bilen visas för handlare. Det tar normalt cirka 1–2 timmar.',
          portal: 'Öppna säljarportalen',
          vehicle: 'Registrerad bil',
          facts: [
            'Granskas av Autorell',
            'Publiceras efter godkännande',
            'Kontaktuppgifterna är skyddade',
          ],
          steps: [
            ['01', 'Autorell granskar', 'Vi kontrollerar uppgifter, skick och bilder inom cirka 1–2 timmar.'],
            ['02', 'Marknaden öppnas', 'Efter godkännande visas bilen för verifierade handlare.'],
            ['03', 'Du följer allt', 'Din privata portal visar paket, aktivitet och bud.'],
          ],
        }
      : locale === 'de'
        ? {
            live: 'Zur Prüfung eingegangen',
            title: 'Wir prüfen das Fahrzeug vor der Veröffentlichung.',
            text: 'Autorell prüft die Angaben und Bilder, bevor Händler das Fahrzeug sehen. Dies dauert normalerweise etwa 1–2 Stunden.',
            portal: 'Verkäuferportal öffnen',
            vehicle: 'Registriertes Fahrzeug',
            facts: [
              'Prüfung durch Autorell',
              'Veröffentlichung nach Freigabe',
              'Kontaktdaten bleiben geschützt',
            ],
            steps: [
              ['01', 'Autorell prüft', 'Wir prüfen Angaben, Zustand und Bilder in etwa 1–2 Stunden.'],
              ['02', 'Markt wird geöffnet', 'Nach Freigabe sehen verifizierte Händler das Fahrzeug.'],
              ['03', 'Alles im Blick', 'Ihr Portal zeigt Paket, Aktivität und Gebote.'],
            ],
          }
        : {
            live: 'Received for review',
            title: 'We review the vehicle before publishing it.',
            text: 'Autorell checks the details and images before dealers can see the vehicle. This normally takes around 1–2 hours.',
            portal: 'Open seller portal',
            vehicle: 'Registered vehicle',
            facts: [
              'Reviewed by Autorell',
              'Published after approval',
              'Contact details stay protected',
            ],
            steps: [
              ['01', 'Autorell reviews', 'We check the details, condition and images in around 1–2 hours.'],
              ['02', 'The market opens', 'After approval, verified dealers can view the vehicle.'],
              ['03', 'Track everything', 'Your private portal shows the package, activity and bids.'],
            ],
          }

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setFieldErrors((current) => {
      if (!current[key]) return current
      const nextErrors = { ...current }
      delete nextErrors[key]
      return nextErrors
    })
    setError('')
  }

  function requiredMessage(label: string) {
    if (locale === 'de') return `${label} ist erforderlich.`
    if (locale === 'en') return `${label} is required.`
    return `${label} är obligatoriskt.`
  }

  function validate() {
    const errors: FieldErrors = {}
    const requireField = (key: keyof FormState, label: string) => {
      if (!form[key]) errors[key] = requiredMessage(label)
    }

    if (step === 1) {
      requireField('reg', t.reg)
      requireField('make', t.make)
      requireField('model', t.model)
      requireField('modelYear', t.year)
      requireField('miles', t.mileage)
      requireField('pickupCity', t.pickupCity)
      requireField('pickupPostalCode', t.pickupPostalCode)
      requireField('pickupCountry', t.pickupCountry)
      if (mileageLimitExceeded) errors.miles = SWEDISH_MILEAGE_LIMIT_MESSAGE
      if (modelYearUnsupported) errors.modelYear = SWEDISH_MODEL_YEAR_MESSAGE
      if (locationUnsupported) errors.pickupCountry = SWEDISH_LOCATION_MESSAGE
    }

    if (step === 2) {
      requireField('bodyType', t.body)
      requireField('fuelType', t.fuel)
      requireField('gearbox', t.gearbox)
      requireField('drivetrain', t.drivetrain)
    }

    if (step === 3) {
      requireField('service', t.service)
      requireField('driveable', t.driveable)
      requireField('engineTransmissionIssues', t.engineTransmissionIssues)
      requireField('fluidLeaks', t.fluidLeaks)
      requireField('seriousCollisionDamage', t.seriousCollisionDamage)
      requireField('damage', t.damage)
      requireField('warnings', t.warnings)
      requireField('tireset', t.tireSets)
      requireField('sellTime', t.sellTime)
      if (form.damage && form.damage !== o.damage[0] && !form.damageDescription) {
        errors.damageDescription = t.errors.damage
      }
    }

    if (step === 4) {
      requireField('financeStatus', t.financeStatus)
      if (securedFinance) {
        requireField('financeProvider', t.financeProvider)
        if (!form.financeContactConsent) {
          errors.financeContactConsent = t.errors.finance
        }
      }
      if (images.length < 4) errors.images = t.errors.photos
      if (!/^[+0-9][0-9\s-]{6,18}$/.test(form.phone)) {
        errors.phone =
          locale === 'sv'
            ? 'Ange ett giltigt telefonnummer.'
            : locale === 'de'
              ? 'Geben Sie eine gültige Telefonnummer ein.'
              : 'Enter a valid phone number.'
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errors.email =
          locale === 'sv'
            ? 'Ange en giltig e-postadress.'
            : locale === 'de'
              ? 'Geben Sie eine gültige E-Mail-Adresse ein.'
              : 'Enter a valid email address.'
      }
      if (!form.privacyAccepted) {
        errors.privacyAccepted = requiredMessage(t.privacy)
      }
    }

    return errors
  }

  function showValidationErrors(errors: FieldErrors) {
    setFieldErrors(errors)
    const firstKey = Object.keys(errors)[0] as FieldKey | undefined
    if (!firstKey) return false
    setError('')
    requestAnimationFrame(() => {
      const field = document.getElementById(`field-${firstKey}`)
      field?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      field?.querySelector<HTMLElement>('input, select, textarea, button')?.focus()
    })
    return true
  }

  function next() {
    if (showValidationErrors(validate())) return
    if (step === 3 && qualificationFailed) return setError(t.errors.qualification)
    setStep((value) => Math.min(value + 1, 4))
    setFieldErrors({})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function previous() {
    setError('')
    setFieldErrors({})
    setStep((value) => Math.max(value - 1, 1))
  }

  function addImages(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files) return
    const selectedFiles = Array.from(event.target.files)
    const rejectedFiles = selectedFiles.filter((file) => file.size > MAX_IMAGE_FILE_SIZE)
    const files = selectedFiles
      .filter((file) => file.size <= MAX_IMAGE_FILE_SIZE)
      .slice(0, 12 - images.length)
    setImages((current) => [...current, ...files.map((file) => ({
      id: crypto.randomUUID(), file, url: URL.createObjectURL(file),
    }))])
    event.target.value = ''
    setFieldErrors((current) => {
      const nextErrors = { ...current }
      delete nextErrors.images
      return nextErrors
    })
    setError(rejectedFiles.length ? singleImageSizeError(locale) : '')
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (showValidationErrors(validate())) return
    setLoading(true)

    const payload = new FormData()
    const apiValues = {
      ...form,
      source,
      miles: locale === 'sv' ? form.miles : String(Number(form.miles) / 10),
      importCar: '',
      brakes: '',
      isDriveable: form.driveable === o.yesNo[0],
      hasEngineTransmissionIssues:
        form.engineTransmissionIssues === o.yesNo[0],
      hasFluidLeaks: form.fluidLeaks === o.yesNo[0],
      hasSeriousCollisionDamage:
        form.seriousCollisionDamage === o.yesNo[0],
    }
    Object.entries(apiValues).forEach(([key, value]) => payload.append(key, String(value)))

    try {
      const compressedImages = await Promise.all(
        images.map((image) => compressImage(image.file))
      )
      const imageBytes = compressedImages.reduce((sum, file) => sum + file.size, 0)

      if (imageBytes > MAX_SUBMIT_IMAGE_BYTES) {
        setError(imageSizeError(locale))
        return
      }

      compressedImages.forEach((file) => payload.append('images', file))

      const response = await fetch('/api/submit', { method: 'POST', body: payload })
      if (response.status === 413) {
        setError(imageSizeError(locale))
        return
      }

      const body = await response.text()
      const data = body ? JSON.parse(body) : {}

      if (!response.ok) {
        return setError(data.error || t.errors.server)
      }
      setSellerPortalUrl(data.sellerPortalUrl || '')
      setSubmitted(true)
    } catch (error) {
      if (error instanceof SyntaxError) {
        setError(imageSizeError(locale))
        return
      }
      setError(t.errors.server)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#f4f3ee] text-[#202124]">
        <PublicHeader locale={locale} />
        <div className="mx-auto max-w-[1180px] px-5 py-10 sm:px-8 lg:py-16">
          <section className="relative overflow-hidden rounded-[32px] bg-[#202528] text-white shadow-[0_30px_100px_rgba(32,37,40,.2)]">
            <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full border border-white/10" />
            <div className="absolute -right-6 -top-8 h-56 w-56 rounded-full border border-white/10" />
            <div className="relative grid gap-10 p-7 sm:p-10 lg:grid-cols-[1.15fr_.85fr] lg:p-14">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 text-sm">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  {successView.live}
                </span>
                <p className="mt-8 text-[11px] font-medium uppercase tracking-[0.24em] text-[#B4D9EF]">
                  {t.successLabel}
                </p>
                <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-5xl">
                  {successView.title}
                </h1>
                <p className="mt-5 max-w-xl text-base leading-7 text-white/65">
                  {successView.text}
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  {sellerPortalUrl ? (
                    <a
                      href={sellerPortalUrl}
                      className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-[#B4D9EF] px-7 font-medium text-[#202124] transition hover:bg-white"
                    >
                      {successView.portal}
                      <ArrowRight size={17} />
                    </a>
                  ) : null}
                  <Link
                    href="/"
                    className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full border border-white/15 px-7 font-medium text-white transition hover:bg-white/10"
                  >
                    {t.home}
                    <ArrowRight size={17} />
                  </Link>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/7 p-6 backdrop-blur sm:p-7">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">
                  {successView.vehicle}
                </p>
                <p className="mt-4 text-3xl font-semibold tracking-[-0.04em]">
                  {form.make} {form.model}
                </p>
                <p className="mt-2 text-white/55">
                  {form.modelYear} · {form.reg}
                </p>
                <div className="mt-8 grid gap-3">
                  {[
                    { icon: ShieldCheck, label: successView.facts[0] },
                    { icon: Clock3, label: successView.facts[1] },
                    { icon: ShieldCheck, label: successView.facts[2] },
                  ].map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className="flex items-center gap-3 rounded-[16px] border border-white/8 bg-black/10 px-4 py-3.5 text-sm text-white/75"
                    >
                      <Icon size={17} className="text-[#B4D9EF]" />
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {sellerPortalUrl ? (
            <section className="mt-6 rounded-[28px] border border-[#deddd7] bg-white p-6 sm:p-8">
              <div className="max-w-2xl">
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#52768a]">
                  Välj räckvidd direkt
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
                  Starta med rätt paket från första dagen.
                </h2>
                <p className="mt-3 leading-7 text-[#697278]">
                  Paketet börjar räknas först när Autorell har granskat och
                  godkänt bilen. Du förlorar alltså ingen annonstid medan du
                  väntar.
                </p>
              </div>
              <div className="mt-7 grid gap-4 lg:grid-cols-3">
                <article className="rounded-[22px] border border-[#deddd7] bg-[#faf9f6] p-6">
                  <Clock3 size={21} className="text-[#4f8fb5]" />
                  <h3 className="mt-5 text-xl font-semibold">24 timmar</h3>
                  <p className="mt-2 text-sm leading-6 text-[#697278]">
                    Kostnadsfri introduktion till verifierade handlare.
                  </p>
                  <p className="mt-6 text-2xl font-semibold">0 kr</p>
                </article>
                <article className="rounded-[22px] border border-[#c9dce7] bg-[#f4f9fc] p-6">
                  <Clock3 size={21} className="text-[#397fa8]" />
                  <h3 className="mt-5 text-xl font-semibold">7 dagar</h3>
                  <p className="mt-2 text-sm leading-6 text-[#617681]">
                    Mer tid för fler handlare att bedöma och lägga bud.
                  </p>
                  <p className="mt-6 text-2xl font-semibold">100 kr</p>
                  <ListingPackageCheckoutButton
                    token={sellerPortalUrl.split('/').filter(Boolean).at(-1) || ''}
                    packageId="extended_7d"
                    label="Välj 7 dagar"
                  />
                </article>
                <article className="relative overflow-hidden rounded-[22px] border border-[#8fc4e2] bg-[#eaf5fb] p-6">
                  <div className="absolute right-0 top-0 h-28 w-28 translate-x-8 -translate-y-8 rounded-full bg-[#B4D9EF]" />
                  <Crown size={21} className="relative text-[#276d96]" />
                  <h3 className="relative mt-5 text-xl font-semibold">
                    Premium 30 dagar
                  </h3>
                  <p className="relative mt-2 text-sm leading-6 text-[#526d7c]">
                    Längre exponering med prioriterad placering i handlarflödet.
                  </p>
                  <p className="relative mt-6 text-2xl font-semibold">290 kr</p>
                  <div className="relative">
                    <ListingPackageCheckoutButton
                      token={sellerPortalUrl.split('/').filter(Boolean).at(-1) || ''}
                      packageId="premium_30d"
                      label="Välj Premium"
                    />
                  </div>
                </article>
              </div>
            </section>
          ) : null}

          <section className="mt-6 grid gap-4 sm:grid-cols-3">
            {successView.steps.map(([number, title, text]) => (
              <article
                key={number}
                className="rounded-[22px] border border-[#deddd7] bg-white p-6"
              >
                <span className="text-xs font-medium text-[#4f8fb5]">{number}</span>
                <h2 className="mt-5 text-lg font-semibold">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#737b81]">{text}</p>
              </article>
            ))}
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#202124]">
      <PublicHeader locale={locale} />

      <div className="mx-auto grid min-w-0 max-w-[1320px] gap-12 px-5 py-12 sm:px-8 lg:grid-cols-[0.78fr_1.22fr] lg:px-12 lg:py-20 xl:gap-20">
        <aside className="min-w-0 lg:pt-8">
          {localSeo && (
            <PublicBreadcrumbs
              className="mb-7"
              items={[
                { label: 'Sälj din bil', href: '/salj-bil' },
                ...(localSeo.regionType === 'municipality'
                  ? [
                      {
                        label: localSeo.county,
                        href: `/salj-bil/lan/${localSeo.countySlug}`,
                      },
                    ]
                  : []),
                { label: localSeo.city },
              ]}
            />
          )}
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#535a60]">
            {pageMarket}
          </p>
          <h1 className="mt-6 max-w-xl break-words text-[42px] font-semibold leading-[1.04] tracking-[-0.055em] text-[#202124] sm:text-5xl lg:text-[58px]">
            {pageHero}
          </h1>
          <p className="mt-7 max-w-lg text-base font-normal leading-7 text-[#68727a]">
            {pageIntro}
          </p>

          <div className="mt-10 max-w-lg border-y border-[#dedcd5] py-7">
            <h2 className="text-base font-medium tracking-tight text-[#202124]">
              {c.benefitTitle}
            </h2>
            <p className="mt-2 text-sm font-normal leading-6 text-slate-500">
              {c.benefitText}
            </p>
            <div className="mt-5 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-x-6 sm:gap-y-3">
              {c.trust.map(([title]) => (
                <span
                  key={title}
                  className="flex min-w-0 items-center gap-1.5 whitespace-nowrap text-[9px] font-normal text-[#646c72] min-[390px]:text-[10px] sm:gap-2 sm:text-xs"
                >
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#B4D9EF]">
                    <Check size={11} className="text-[#242424]" />
                  </span>
                  {title}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-9 hidden lg:block">
            {t.steps.map((title, index) => (
              <div
                key={title}
                className="relative flex items-center gap-4 pb-6 last:pb-0"
              >
                {index < t.steps.length - 1 && (
                  <span className="absolute left-[13px] top-7 h-[calc(100%-20px)] w-px bg-slate-200" />
                )}
                <span
                  className={`relative z-10 grid h-7 w-7 place-items-center rounded-full border text-[11px] font-semibold ${
                    step > index + 1
                      ? 'border-[#242424] bg-[#242424] text-white'
                      : step === index + 1
                        ? 'border-[#242424] bg-[#B4D9EF] text-[#242424]'
                        : 'border-[#d2d0ca] bg-[#f7f5ef] text-[#999b98]'
                  }`}
                >
                  {step > index + 1 ? <Check size={13} /> : index + 1}
                </span>
                <span
                  className={`text-sm ${
                    step === index + 1
                      ? 'font-semibold text-slate-900'
                      : 'font-normal text-slate-400'
                  }`}
                >
                  {title}
                </span>
              </div>
            ))}
          </div>
        </aside>

        <section className="min-w-0 overflow-hidden rounded-[24px] border border-[#dfddd6] bg-white shadow-[0_24px_70px_rgba(32,33,36,.08)]">
          <div className="border-b border-[#eceae5] px-6 py-6 sm:px-10">
            <div className="mb-3 flex justify-between text-xs font-medium text-[#8b8e8b]">
              <span>{t.step} {step} {t.of} 4</span><span>{step * 25}%</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-[#eceae5]"><div className="h-full rounded-full bg-[#B4D9EF] transition-all" style={{ width: `${step * 25}%` }} /></div>
          </div>

          <form onSubmit={submit} className="p-6 sm:p-10">
            {step === 1 && (
              <Section eyebrow={t.vehicleEyebrow} title={t.vehicleTitle} intro={t.vehicleIntro}>
                <Grid>
                  <Field label={t.reg} fieldKey="reg" error={fieldErrors.reg}><input className="form-control uppercase" value={form.reg} onChange={(e) => update('reg', e.target.value.toUpperCase())} /></Field>
                  <Field label={t.make} fieldKey="make" error={fieldErrors.make}><select className="form-control" value={form.make} onChange={(e) => update('make', e.target.value)}><option value="">{t.selectBrand}</option>{BRANDS.map((brand) => <option key={brand} value={brand}>{brand === 'Other' ? otherBrandLabel : brand}</option>)}</select></Field>
                  <Field label={t.model} fieldKey="model" error={fieldErrors.model}><input className="form-control" value={form.model} onChange={(e) => update('model', e.target.value)} /></Field>
                  <Field label={t.variant} optional={t.optional}><input className="form-control" value={form.variant} onChange={(e) => update('variant', e.target.value)} /></Field>
                  <Field label={t.year} fieldKey="modelYear" error={fieldErrors.modelYear}><select className="form-control" value={form.modelYear} onChange={(e) => update('modelYear', e.target.value)}><option value="">{t.selectYear}</option>{YEARS.map((year) => <option key={year}>{year}</option>)}</select></Field>
                  <Field label={t.mileage} fieldKey="miles" error={fieldErrors.miles}>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        aria-invalid={mileageLimitExceeded}
                        className={`form-control pr-14 ${mileageLimitExceeded ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''}`}
                        value={form.miles}
                        onChange={(e) => update('miles', e.target.value)}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">{distanceUnit}</span>
                    </div>
                  </Field>
                  <Field label={t.firstRegistration} optional={t.optional}><input type="date" className="form-control" value={form.firstRegistration} onChange={(e) => update('firstRegistration', e.target.value)} /></Field>
                  <Field label={t.pickupCity} fieldKey="pickupCity" error={fieldErrors.pickupCity}><input autoComplete="address-level2" className="form-control" value={form.pickupCity} onChange={(e) => update('pickupCity', e.target.value)} /></Field>
                  <Field label={t.pickupPostalCode} fieldKey="pickupPostalCode" error={fieldErrors.pickupPostalCode}><input autoComplete="postal-code" className="form-control uppercase" value={form.pickupPostalCode} onChange={(e) => update('pickupPostalCode', e.target.value.toUpperCase())} /></Field>
                  <Field label={t.pickupCountry} fieldKey="pickupCountry" error={fieldErrors.pickupCountry}>
                    {locale === 'sv' ? (
                      <div className="form-control flex items-center text-[#4d5960]">
                        Sverige
                      </div>
                    ) : (
                      <select className="form-control" value={form.pickupCountry} onChange={(e) => update('pickupCountry', e.target.value)}><option value="">{t.choose}</option>{EU_COUNTRIES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select>
                    )}
                  </Field>
                </Grid>
                {(modelYearUnsupported || mileageLimitExceeded || locationUnsupported) && (
                  <div className="mt-6 rounded-[16px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
                    {modelYearUnsupported
                      ? SWEDISH_MODEL_YEAR_MESSAGE
                      : mileageLimitExceeded
                        ? SWEDISH_MILEAGE_LIMIT_MESSAGE
                        : SWEDISH_LOCATION_MESSAGE}
                  </div>
                )}
              </Section>
            )}

            {step === 2 && (
              <Section eyebrow={t.technicalEyebrow} title={t.technicalTitle} intro={t.technicalIntro}>
                <Grid>
                  <Choice fieldKey="bodyType" error={fieldErrors.bodyType} label={t.body} value={form.bodyType} values={o.body} choose={t.choose} onChange={(v) => update('bodyType', v)} />
                  <Choice fieldKey="fuelType" error={fieldErrors.fuelType} label={t.fuel} value={form.fuelType} values={o.fuel} choose={t.choose} onChange={(v) => update('fuelType', v)} />
                  <Choice fieldKey="gearbox" error={fieldErrors.gearbox} label={t.gearbox} value={form.gearbox} values={o.gearbox} choose={t.choose} onChange={(v) => update('gearbox', v)} />
                  <Choice fieldKey="drivetrain" error={fieldErrors.drivetrain} label={t.drivetrain} value={form.drivetrain} values={o.drivetrain} choose={t.choose} onChange={(v) => update('drivetrain', v)} />
                  <Field label={t.power} optional={t.optional}><div className="relative"><input type="number" className="form-control pr-12" value={form.powerHp} onChange={(e) => update('powerHp', e.target.value)} /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">{powerUnit}</span></div></Field>
                  <Field label={t.color} optional={t.optional}><input className="form-control" value={form.color} onChange={(e) => update('color', e.target.value)} /></Field>
                </Grid>
              </Section>
            )}

            {step === 3 && (
              <Section eyebrow={t.conditionEyebrow} title={t.conditionTitle} intro={t.conditionIntro}>
                <Grid>
                  <Field label={t.owners} optional={t.optional}><input type="number" min="0" className="form-control" value={form.owners} onChange={(e) => update('owners', e.target.value)} /></Field>
                  <Choice fieldKey="service" error={fieldErrors.service} label={t.service} value={form.service} values={o.service} choose={t.choose} onChange={(v) => update('service', v)} />
                  <Choice fieldKey="driveable" error={fieldErrors.driveable} label={t.driveable} value={form.driveable} values={o.yesNo} choose={t.choose} onChange={(v) => update('driveable', v)} />
                  <Choice fieldKey="engineTransmissionIssues" error={fieldErrors.engineTransmissionIssues} label={t.engineTransmissionIssues} value={form.engineTransmissionIssues} values={o.yesNo} choose={t.choose} onChange={(v) => update('engineTransmissionIssues', v)} />
                  <Choice fieldKey="fluidLeaks" error={fieldErrors.fluidLeaks} label={t.fluidLeaks} value={form.fluidLeaks} values={o.yesNo} choose={t.choose} onChange={(v) => update('fluidLeaks', v)} />
                  <Choice fieldKey="seriousCollisionDamage" error={fieldErrors.seriousCollisionDamage} label={t.seriousCollisionDamage} value={form.seriousCollisionDamage} values={o.yesNo} choose={t.choose} onChange={(v) => update('seriousCollisionDamage', v)} />
                  <Choice fieldKey="damage" error={fieldErrors.damage} label={t.damage} value={form.damage} values={o.damage} choose={t.choose} onChange={(v) => update('damage', v)} />
                  <Choice fieldKey="warnings" error={fieldErrors.warnings} label={t.warnings} value={form.warnings} values={o.warnings} choose={t.choose} onChange={(v) => update('warnings', v)} />
                  <Choice label={t.tires} value={form.tires} values={o.tires} choose={t.choose} onChange={(v) => update('tires', v)} optionalLabel={t.optional} />
                  <Choice fieldKey="tireset" error={fieldErrors.tireset} label={t.tireSets} value={form.tireset} values={o.tireSets} choose={t.choose} onChange={(v) => update('tireset', v)} />
                  <Choice label={t.keys} value={form.keysCount} values={['1', '2', '3+']} choose={t.choose} onChange={(v) => update('keysCount', v)} optionalLabel={t.optional} />
                  <Choice label={t.towbar} value={form.towbar} values={o.yesNo} choose={t.choose} onChange={(v) => update('towbar', v)} optionalLabel={t.optional} />
                  <Choice fieldKey="sellTime" error={fieldErrors.sellTime} label={t.sellTime} value={form.sellTime} values={o.sell} choose={t.choose} onChange={(v) => update('sellTime', v)} />
                  {form.damage && form.damage !== o.damage[0] && <div className="sm:col-span-2"><Field label={t.damageDescription} fieldKey="damageDescription" error={fieldErrors.damageDescription}><textarea rows={3} className="form-control resize-none" value={form.damageDescription} onChange={(e) => update('damageDescription', e.target.value)} /></Field></div>}
                  <div className="sm:col-span-2"><Field label={t.equipment} optional={t.optional}><textarea rows={3} className="form-control resize-none" value={form.equipment} onChange={(e) => update('equipment', e.target.value)} /></Field></div>
                </Grid>
                {qualificationFailed && (
                  <div className="mt-6 rounded-[16px] border border-amber-200 bg-amber-50 px-5 py-4">
                    <p className="font-medium text-amber-950">
                      Bilen passar tyvärr inte våra nuvarande exportkriterier.
                    </p>
                    <p className="mt-2 text-sm leading-6 text-amber-800">
                      Vi tar just nu endast emot körbara bilar i gott tekniskt
                      skick, utan allvarliga motor-, växellåds-, läckage- eller
                      krockproblem.
                    </p>
                  </div>
                )}
              </Section>
            )}

            {step === 4 && (
              <Section eyebrow={t.finalEyebrow} title={t.finalTitle} intro={t.finalIntro}>
                <div className="mb-7 rounded-[20px] border border-[#c9e3f2] bg-[#f1f8fc] p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#B4D9EF] text-[#202124]">
                      <ShieldCheck size={18} />
                    </span>
                    <div>
                      <h3 className="font-semibold text-[#202124]">{t.financeTitle}</h3>
                      <p className="mt-1 text-sm leading-6 text-[#62727b]">{t.financeIntro}</p>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <Field label={t.financeStatus} fieldKey="financeStatus" error={fieldErrors.financeStatus}>
                      <select className="form-control" value={form.financeStatus} onChange={(event) => update('financeStatus', event.target.value)}>
                        <option value="">{t.choose}</option>
                        {financeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                    </Field>
                    {securedFinance && (
                      <Field label={t.financeProvider} fieldKey="financeProvider" error={fieldErrors.financeProvider}>
                        <input className="form-control" value={form.financeProvider} onChange={(event) => update('financeProvider', event.target.value)} />
                      </Field>
                    )}
                    {securedFinance && (
                      <Field label={t.financeReference} optional={t.optional}>
                        <input className="form-control" value={form.financeAgreementReference} onChange={(event) => update('financeAgreementReference', event.target.value)} />
                      </Field>
                    )}
                    {securedFinance && (
                      <Field label={t.financeBalance} optional={t.optional}>
                        <div className="relative">
                          <input type="number" min="0" className="form-control pr-16" value={form.financeEstimatedBalance} onChange={(event) => update('financeEstimatedBalance', event.target.value)} />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#8a9296]">{currencyUnit}</span>
                        </div>
                        <span className="mt-2 block text-xs leading-5 text-[#7c878d]">{t.financeBalanceHelp}</span>
                      </Field>
                    )}
                  </div>
                  {securedFinance && (
                    <>
                      <div className={`mt-5 rounded-[14px] border px-4 py-3 text-sm leading-6 ${form.financeStatus === 'leasing' ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-[#d7e8f1] bg-white text-[#526873]'}`}>
                        {form.financeStatus === 'leasing' ? t.leasingNotice : t.financeNotice}
                      </div>
                      <label id="field-financeContactConsent" className={`mt-4 flex items-start gap-3 text-sm leading-6 ${fieldErrors.financeContactConsent ? 'text-red-700' : 'text-[#53636c]'}`}>
                        <input type="checkbox" className="mt-1 h-4 w-4 accent-[#242424]" checked={form.financeContactConsent} onChange={(event) => update('financeContactConsent', event.target.checked)} />
                        <span>{t.financeConsent}{fieldErrors.financeContactConsent && <span className="mt-1 block font-medium text-red-600">{fieldErrors.financeContactConsent}</span>}</span>
                      </label>
                    </>
                  )}
                </div>
                <label id="field-images" className={`grid min-h-44 cursor-pointer place-items-center rounded-[18px] border border-dashed p-5 text-center transition hover:border-[#8dbdd8] hover:bg-[#f4f9fc] ${fieldErrors.images ? 'border-red-500 bg-red-50/50 ring-3 ring-red-100' : 'border-[#c9c8c2] bg-[#faf9f6]'}`}>
                  <div><span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#B4D9EF]"><Upload className="text-[#242424]" size={20} /></span><p className="mt-4 font-medium">{t.upload}</p><p className="mt-1 text-sm font-normal text-[#737b81]">{t.uploadHelp}</p><p className="mt-2 text-xs font-medium text-[#4f5960]">{images.length}/12 {t.photos}</p></div>
                  <input type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={addImages} />
                </label>
                {fieldErrors.images && <p className="mt-2 text-sm font-medium text-red-600">{fieldErrors.images}</p>}
                {images.length > 0 && <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{images.map((image) => <div key={image.id} className="relative overflow-hidden rounded-[14px]"><Image src={image.url} alt="" width={240} height={160} unoptimized className="h-28 w-full object-cover" /><button type="button" onClick={() => setImages((current) => current.filter((item) => item.id !== image.id))} className="absolute right-1.5 top-1.5 grid h-8 w-8 place-items-center rounded-full bg-white/90 shadow"><X size={14} /></button></div>)}</div>}
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <Field label={t.phone} fieldKey="phone" error={fieldErrors.phone}><input type="tel" autoComplete="tel" className="form-control" value={form.phone} onChange={(e) => update('phone', e.target.value)} /></Field>
                  <Field label={t.email} fieldKey="email" error={fieldErrors.email}><input type="email" autoComplete="email" className="form-control" value={form.email} onChange={(e) => update('email', e.target.value)} /></Field>
                </div>
                <label id="field-privacyAccepted" className={`mt-5 flex items-start gap-3 border-t pt-5 text-sm font-normal leading-6 ${fieldErrors.privacyAccepted ? 'border-red-300 text-red-700' : 'border-[#e3e1dc] text-[#626b72]'}`}><input type="checkbox" className="mt-1 h-4 w-4 accent-[#242424]" checked={form.privacyAccepted} onChange={(e) => update('privacyAccepted', e.target.checked)} /><span>{t.privacy} <a className="font-medium text-[#242424] underline" href="/integritet" target="_blank">{t.privacyLink}</a> {t.termsJoin} <a className="font-medium text-[#242424] underline" href="/villkor" target="_blank">{t.termsLink}</a>.{fieldErrors.privacyAccepted && <span className="mt-1 block font-medium text-red-600">{fieldErrors.privacyAccepted}</span>}</span></label>
              </Section>
            )}

            {error && <div className="mt-6 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}
            <div className="mt-8 flex justify-between border-t border-[#eceae5] pt-6">
              {step > 1 ? <button type="button" onClick={previous} className="inline-flex h-12 items-center gap-2 rounded-full border border-[#d4d2cc] px-5 text-sm font-normal text-[#4a5055] transition hover:bg-[#f6f5f1]"><ArrowLeft size={16} />{t.back}</button> : <span />}
              {step < 4 ? <button type="button" onClick={next} disabled={mileageLimitExceeded || modelYearUnsupported || locationUnsupported || qualificationFailed} className="inline-flex h-12 items-center gap-2 rounded-full bg-[#242424] px-7 text-sm font-normal text-white transition hover:bg-[#111111] disabled:cursor-not-allowed disabled:opacity-45">{t.next}<ArrowRight size={16} /></button> : <button type="submit" disabled={loading} className="inline-flex h-12 items-center gap-2 rounded-full bg-[#242424] px-7 text-sm font-normal text-white transition hover:bg-[#111111] disabled:opacity-60">{loading ? t.sending : t.submit}<ArrowRight size={16} /></button>}
            </div>
            <p className="mt-6 flex items-center justify-center gap-2 text-center text-[11px] font-normal text-slate-400">
              <LockKeyhole size={12} />
              {c.footer}
            </p>
          </form>
        </section>
      </div>

      {locale === 'sv' && (
        <section className="border-t border-[#dedcd5] bg-white">
          <div className="mx-auto max-w-[1320px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
            {localSeo ? (
              <>
                <div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:gap-20">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#65727a]">
                      Lokal bilförsäljning
                    </p>
                    <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-[#202124] sm:text-4xl">
                      Ett bredare köparnätverk för din bil i {localSeo.city}.
                    </h2>
                    <p className="mt-6 max-w-2xl text-base leading-8 text-[#68727a]">
                      {localSeo.areaDescription}
                    </p>
                    <p className="mt-4 max-w-2xl text-base leading-8 text-[#68727a]">
                      Autorell passar i första hand nyare, körbara bilar från
                      2018 med högst 10&nbsp;000 mil och ett dokumenterbart
                      tekniskt skick. Registreringen är kostnadsfri och inte
                      bindande.
                    </p>
                  </div>

                  <div className="rounded-[28px] border border-[#dfe3e3] bg-[#f4f8fa] p-7 sm:p-9">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-[#B4D9EF] text-[#202124]">
                      <MapPin size={21} />
                    </span>
                    <h2 className="mt-6 text-2xl font-semibold tracking-[-0.03em]">
                      Så fungerar det i {localSeo.city}
                    </h2>
                    <ol className="mt-6 space-y-5 text-sm leading-6 text-[#626d73]">
                      <li className="flex gap-4">
                        <span className="font-semibold text-[#202124]">01</span>
                        Fyll i bilens uppgifter, skick och plats samt ladda upp
                        tydliga bilder.
                      </li>
                      <li className="flex gap-4">
                        <span className="font-semibold text-[#202124]">02</span>
                        Autorell granskar profilen innan den visas för
                        verifierade professionella köpare.
                      </li>
                      <li className="flex gap-4">
                        <span className="font-semibold text-[#202124]">03</span>
                        Du följer aktiviteten och väljer själv om ett bud är
                        tillräckligt bra.
                      </li>
                    </ol>
                  </div>
                </div>

                <div className="mt-14 border-t border-[#e5e3dd] pt-10">
                  <h2 className="text-xl font-semibold tracking-[-0.025em]">
                    {localSeo.regionType === 'county'
                      ? `Välj kommun i ${localSeo.city}`
                      : `Sälj bil i närheten av ${localSeo.city}`}
                  </h2>
                  <div className="mt-5 flex flex-wrap gap-3">
                    {localSeo.nearby.map((item) => (
                      <Link
                        key={item.slug}
                        href={`/salj-bil/${item.slug}`}
                        className="rounded-full border border-[#d8d8d3] bg-white px-4 py-2.5 text-sm text-[#4f5c63] transition hover:border-[#8dbdd8] hover:bg-[#f1f8fb] hover:text-[#202124]"
                      >
                        Sälj bil i {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#65727a]">
                  Sälj bil nära dig
                </p>
                <div className="mt-4 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                  <h2 className="max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-[#202124] sm:text-4xl">
                    Sälj din bil lokalt. Nå köpare på en större marknad.
                  </h2>
                  <p className="max-w-lg text-sm leading-7 text-[#68727a]">
                    Välj län och därefter din kommun. Registreringen,
                    granskningen och budprocessen sker digitalt.
                  </p>
                </div>
                <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {swedishCounties.map((county) => (
                    <Link
                      key={county.slug}
                      href={`/salj-bil/lan/${county.slug}`}
                      className="group flex items-center justify-between rounded-[18px] border border-[#e0dfda] bg-[#faf9f6] px-5 py-4 text-sm text-[#4f5c63] transition hover:border-[#a9cfe3] hover:bg-[#f1f8fb] hover:text-[#202124]"
                    >
                      <span>{county.name}</span>
                      <ArrowRight
                        size={15}
                        className="transition group-hover:translate-x-0.5"
                      />
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      <footer className="border-t border-[#dedcd5] bg-[#f1f0eb]">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-4 px-5 py-7 text-xs text-[#7d817f] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <p>© {new Date().getFullYear()} Autorell AB</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <span>{t.secure}</span>
            <span>{c.footer}</span>
          </div>
        </div>
      </footer>
    </main>
  )
}

function Section({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: React.ReactNode }) {
  return <div><p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#656c71]">{eyebrow}</p><h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#202124] sm:text-[32px]">{title}</h2><p className="mb-8 mt-3 text-sm font-normal leading-6 text-[#727a80]">{intro}</p>{children}</div>
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2">{children}</div>
}

function Field({ label, optional, children, fieldKey, error }: { label: string; optional?: string; children: React.ReactNode; fieldKey?: FieldKey; error?: string }) {
  return <label id={fieldKey ? `field-${fieldKey}` : undefined} className={`block ${error ? '[&_.form-control]:border-red-500 [&_.form-control]:ring-3 [&_.form-control]:ring-red-100' : ''}`}><span className="mb-2.5 flex justify-between text-sm font-normal text-[#3d4348]">{label}{optional && <small className="font-normal text-[#999c9d]">{optional}</small>}</span>{children}{error && <span className="mt-2 block text-sm font-medium text-red-600">{error}</span>}</label>
}

function Choice({ label, value, values, choose, onChange, optionalLabel, fieldKey, error }: { label: string; value: string; values: readonly string[]; choose: string; onChange: (value: string) => void; optionalLabel?: string; fieldKey?: FieldKey; error?: string }) {
  return <Field label={label} optional={optionalLabel} fieldKey={fieldKey} error={error}><select className="form-control" value={value} onChange={(e) => onChange(e.target.value)}><option value="">{choose}</option>{values.map((item) => <option key={item}>{item}</option>)}</select></Field>
}
