'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  LockKeyhole,
  Upload,
  X,
} from 'lucide-react'

export type FormLocale = 'sv' | 'de' | 'en'

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
  'Other',
]

const YEARS = Array.from(
  { length: new Date().getFullYear() - 1979 },
  (_, index) => String(new Date().getFullYear() + 1 - index)
)

const copy = {
  sv: {
    market: 'Svensk bilförsäljning',
    hero: 'Sälj din bil till vårt europeiska handlarnätverk.',
    intro: 'Fyll i de viktigaste uppgifterna. Det tar normalt 3–5 minuter.',
    secure: 'Trygg och kostnadsfri förfrågan',
    steps: ['Bilen', 'Teknik', 'Skick', 'Bilder & kontakt'],
    step: 'Steg',
    of: 'av',
    vehicleEyebrow: 'Fordonsidentitet',
    vehicleTitle: 'Vilken bil vill du sälja?',
    vehicleIntro: 'Börja med bilens grunduppgifter.',
    reg: 'Registreringsnummer',
    make: 'Bilmärke',
    model: 'Modell',
    variant: 'Variant / version',
    year: 'Årsmodell',
    mileage: 'Miltal',
    firstRegistration: 'Första registrering',
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
    conditionTitle: 'Hur är bilens skick?',
    conditionIntro: 'Svara så korrekt du kan. Det ger tryggare och bättre bud.',
    owners: 'Antal tidigare ägare',
    service: 'Servicehistorik',
    damage: 'Skador',
    damageDescription: 'Beskriv skadorna',
    warnings: 'Varningslampor',
    tires: 'Däckens skick',
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
    privacy: 'Jag godkänner behandlingen av mina personuppgifter enligt',
    privacyLink: 'integritetspolicyn',
    back: 'Tillbaka',
    next: 'Fortsätt',
    submit: 'Skicka förfrågan',
    sending: 'Skickar...',
    required: 'Obligatoriskt',
    optional: 'Valfritt',
    choose: 'Välj alternativ',
    successLabel: 'Förfrågan mottagen',
    successTitle: 'Tack! Vi granskar din bil.',
    successText: 'Vi kontaktar dig när fordonsprofilen är redo för nästa steg.',
    home: 'Till Autorell',
    errors: {
      vehicle: 'Fyll i registreringsnummer, märke, modell, årsmodell och miltal.',
      technical: 'Välj karosstyp, bränsle, växellåda och drivning.',
      condition: 'Fyll i servicehistorik, skador, varningslampor och säljtillfälle.',
      damage: 'Beskriv skadorna kort.',
      photos: 'Ladda upp minst 4 bilder.',
      contact: 'Kontrollera telefonnummer, e-post och integritetsgodkännande.',
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
    selectBrand: 'Marke wählen', selectYear: 'Modelljahr wählen',
    technicalEyebrow: 'Technische Daten',
    technicalTitle: 'Die wichtigsten Spezifikationen',
    technicalIntro: 'Damit Händler das Fahrzeug europaweit vergleichen können.',
    body: 'Karosserie', fuel: 'Kraftstoff', gearbox: 'Getriebe',
    drivetrain: 'Antrieb', power: 'Leistung', color: 'Farbe',
    conditionEyebrow: 'Historie und Zustand',
    conditionTitle: 'Wie ist der Zustand des Fahrzeugs?',
    conditionIntro: 'Genaue Angaben schaffen Vertrauen und bessere Gebote.',
    owners: 'Vorbesitzer', service: 'Servicehistorie', damage: 'Schäden',
    damageDescription: 'Schäden beschreiben', warnings: 'Warnleuchten',
    tires: 'Reifenzustand', keys: 'Anzahl Schlüssel', towbar: 'Anhängerkupplung',
    sellTime: 'Wann möchten Sie verkaufen?', equipment: 'Wichtige Ausstattung (optional)',
    finalEyebrow: 'Fotos und Kontakt', finalTitle: 'Der letzte Schritt',
    finalIntro: 'Gute Fotos helfen Händlern, präzisere Gebote abzugeben.',
    upload: 'Fahrzeugfotos hochladen',
    uploadHelp: 'Mindestens 4, maximal 12 Bilder. Max. 10 MB pro Bild.',
    photos: 'Bilder', phone: 'Telefonnummer', email: 'E-Mail-Adresse',
    privacy: 'Ich stimme der Verarbeitung meiner Daten gemäß der',
    privacyLink: 'Datenschutzerklärung zu',
    back: 'Zurück', next: 'Weiter', submit: 'Anfrage senden', sending: 'Wird gesendet...',
    required: 'Pflichtfeld', optional: 'Optional', choose: 'Bitte wählen',
    successLabel: 'Anfrage erhalten', successTitle: 'Vielen Dank! Wir prüfen Ihr Fahrzeug.',
    successText: 'Wir melden uns, sobald das Fahrzeugprofil bereit ist.',
    home: 'Zu Autorell',
    errors: {
      vehicle: 'Bitte Kennzeichen, Marke, Modell, Modelljahr und Kilometerstand ausfüllen.',
      technical: 'Bitte Karosserie, Kraftstoff, Getriebe und Antrieb wählen.',
      condition: 'Bitte Servicehistorie, Schäden, Warnleuchten und Verkaufszeitpunkt angeben.',
      damage: 'Bitte beschreiben Sie die Schäden kurz.',
      photos: 'Bitte mindestens 4 Bilder hochladen.',
      contact: 'Bitte Telefonnummer, E-Mail und Datenschutzbestätigung prüfen.',
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
    selectYear: 'Select model year', technicalEyebrow: 'Technical details',
    technicalTitle: 'The key specifications',
    technicalIntro: 'This makes the vehicle comparable across Europe.',
    body: 'Body type', fuel: 'Fuel type', gearbox: 'Transmission',
    drivetrain: 'Drivetrain', power: 'Power', color: 'Colour',
    conditionEyebrow: 'History and condition', conditionTitle: 'What is the vehicle condition?',
    conditionIntro: 'Accurate information builds confidence and stronger bids.',
    owners: 'Previous owners', service: 'Service history', damage: 'Damage',
    damageDescription: 'Describe the damage', warnings: 'Warning lights',
    tires: 'Tire condition', keys: 'Number of keys', towbar: 'Towbar',
    sellTime: 'When do you want to sell?', equipment: 'Key equipment (optional)',
    finalEyebrow: 'Photos and contact', finalTitle: 'The final step',
    finalIntro: 'Good photos help dealers submit more accurate bids.',
    upload: 'Upload vehicle photos',
    uploadHelp: 'Minimum 4, maximum 12 images. Max 10 MB each.',
    photos: 'photos', phone: 'Phone number', email: 'Email address',
    privacy: 'I accept the processing of my personal data according to the',
    privacyLink: 'privacy policy', back: 'Back', next: 'Continue',
    submit: 'Submit enquiry', sending: 'Submitting...', required: 'Required',
    optional: 'Optional', choose: 'Select an option',
    successLabel: 'Enquiry received', successTitle: 'Thank you! We are reviewing your vehicle.',
    successText: 'We will contact you when the vehicle profile is ready.',
    home: 'Go to Autorell',
    errors: {
      vehicle: 'Enter registration, make, model, model year and mileage.',
      technical: 'Select body type, fuel type, transmission and drivetrain.',
      condition: 'Enter service history, damage, warning lights and selling time.',
      damage: 'Briefly describe the damage.',
      photos: 'Upload at least 4 photos.',
      contact: 'Check your phone number, email and privacy acceptance.',
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
    yesNo: ['Yes', 'No'],
    sell: ['As soon as possible', 'Within 1–2 weeks', 'Within one month', 'Within 2–3 months', 'Not sure'],
  },
} as const

const emptyForm = {
  reg: '', make: '', model: '', variant: '', modelYear: '', miles: '',
  firstRegistration: '', bodyType: '', fuelType: '', gearbox: '',
  drivetrain: '', powerHp: '', color: '', owners: '', service: '',
  damage: '', damageDescription: '', warnings: '', tires: '', keysCount: '',
  towbar: '', sellTime: '', equipment: '', phone: '', email: '',
  privacyAccepted: false,
}

type FormState = typeof emptyForm

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

export default function VehicleLeadForm({ locale }: { locale: FormLocale }) {
  const t = copy[locale]
  const o = options[locale]
  const c = conversionCopy[locale]
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(emptyForm)
  const [images, setImages] = useState<{ id: string; file: File; url: string }[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const source = locale === 'sv' ? 'SE' : locale === 'de' ? 'DE' : 'EU'
  const distanceUnit = locale === 'sv' ? 'mil' : 'km'
  const powerUnit = locale === 'sv' ? 'hk' : locale === 'de' ? 'PS' : 'hp'
  const otherBrandLabel =
    locale === 'sv' ? 'Annat' : locale === 'de' ? 'Sonstige' : 'Other'

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setError('')
  }

  function validate() {
    if (step === 1 && (!form.reg || !form.make || !form.model || !form.modelYear || !form.miles)) return t.errors.vehicle
    if (step === 2 && (!form.bodyType || !form.fuelType || !form.gearbox || !form.drivetrain)) return t.errors.technical
    if (step === 3 && (!form.service || !form.damage || !form.warnings || !form.sellTime)) return t.errors.condition
    if (step === 3 && form.damage !== o.damage[0] && !form.damageDescription) return t.errors.damage
    if (step === 4 && images.length < 4) return t.errors.photos
    if (step === 4 && (!/^[+0-9][0-9\s-]{6,18}$/.test(form.phone) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) || !form.privacyAccepted)) return t.errors.contact
    return ''
  }

  function next() {
    const message = validate()
    if (message) return setError(message)
    setStep((value) => Math.min(value + 1, 4))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function previous() {
    setError('')
    setStep((value) => Math.max(value - 1, 1))
  }

  function addImages(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files) return
    const files = Array.from(event.target.files)
      .filter((file) => file.size <= 10 * 1024 * 1024)
      .slice(0, 12 - images.length)
    setImages((current) => [...current, ...files.map((file) => ({
      id: crypto.randomUUID(), file, url: URL.createObjectURL(file),
    }))])
    event.target.value = ''
    setError('')
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    const message = validate()
    if (message) return setError(message)
    setLoading(true)

    const payload = new FormData()
    const apiValues = {
      ...form,
      source,
      miles: locale === 'sv' ? form.miles : String(Number(form.miles) / 10),
      importCar: '',
      brakes: '',
      tireset: '',
    }
    Object.entries(apiValues).forEach(([key, value]) => payload.append(key, String(value)))
    images.forEach((image) => payload.append('images', image.file))

    try {
      const response = await fetch('/api/submit', { method: 'POST', body: payload })
      const data = await response.json()
      if (!response.ok) return setError(data.error || t.errors.server)
      setSubmitted(true)
    } catch {
      setError(t.errors.server)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#07111f] px-5">
        <div className="w-full max-w-xl rounded-[12px] bg-white p-10 text-center shadow-2xl">
          <CheckCircle2 className="mx-auto text-emerald-600" size={48} />
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">{t.successLabel}</p>
          <h1 className="mt-3 text-3xl font-bold">{t.successTitle}</h1>
          <p className="mt-4 text-slate-500">{t.successText}</p>
          <a href="https://autorell.com/" className="mt-7 inline-flex h-12 items-center gap-2 rounded-[5px] bg-blue-600 px-6 font-bold text-white">
            {t.home}<ArrowRight size={16} />
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f2f4f7] text-slate-950">
      <header className="bg-[#07111f] text-white">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between px-5 py-6 sm:px-8 lg:px-12">
          <Image src="/autorell-logo.png" alt="Autorell" width={180} height={52} priority className="h-10 w-auto" />
          <span className="hidden text-xs font-normal tracking-wide text-slate-400 sm:block">
            {t.secure}
          </span>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1320px] gap-12 px-5 py-10 sm:px-8 lg:grid-cols-[0.78fr_1.22fr] lg:px-12 lg:py-16 xl:gap-20">
        <aside className="lg:pt-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0b5cff]">
            {t.market}
          </p>
          <h1 className="mt-6 max-w-xl text-[42px] font-semibold leading-[1.04] tracking-[-0.055em] text-[#0a1628] sm:text-5xl lg:text-[58px]">
            {t.hero}
          </h1>
          <p className="mt-7 max-w-lg text-base font-normal leading-7 text-slate-500">
            {t.intro}
          </p>

          <div className="mt-10 max-w-lg border-y border-slate-200 py-6">
            <h2 className="text-base font-semibold tracking-tight text-slate-900">
              {c.benefitTitle}
            </h2>
            <p className="mt-2 text-sm font-normal leading-6 text-slate-500">
              {c.benefitText}
            </p>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
              {c.trust.map(([title]) => (
                <span
                  key={title}
                  className="flex items-center gap-2 text-xs font-normal text-slate-600"
                >
                  <Check size={13} className="text-[#0b5cff]" />
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
                      ? 'border-[#0b5cff] bg-[#0b5cff] text-white'
                      : step === index + 1
                        ? 'border-[#0b5cff] bg-white text-[#0b5cff]'
                        : 'border-slate-300 bg-[#f2f4f7] text-slate-400'
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

        <section className="overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.07)]">
          <div className="border-b border-slate-100 px-6 py-6 sm:px-10">
            <div className="mb-3 flex justify-between text-xs font-bold text-slate-400">
              <span>{t.step} {step} {t.of} 4</span><span>{step * 25}%</span>
            </div>
            <div className="h-px bg-slate-200"><div className="h-px bg-[#0b5cff] transition-all" style={{ width: `${step * 25}%` }} /></div>
          </div>

          <form onSubmit={submit} className="p-6 sm:p-10">
            {step === 1 && (
              <Section eyebrow={t.vehicleEyebrow} title={t.vehicleTitle} intro={t.vehicleIntro}>
                <Grid>
                  <Field label={t.reg}><input className="form-control uppercase" value={form.reg} onChange={(e) => update('reg', e.target.value.toUpperCase())} /></Field>
                  <Field label={t.make}><select className="form-control" value={form.make} onChange={(e) => update('make', e.target.value)}><option value="">{t.selectBrand}</option>{BRANDS.map((brand) => <option key={brand} value={brand}>{brand === 'Other' ? otherBrandLabel : brand}</option>)}</select></Field>
                  <Field label={t.model}><input className="form-control" value={form.model} onChange={(e) => update('model', e.target.value)} /></Field>
                  <Field label={t.variant} optional={t.optional}><input className="form-control" value={form.variant} onChange={(e) => update('variant', e.target.value)} /></Field>
                  <Field label={t.year}><select className="form-control" value={form.modelYear} onChange={(e) => update('modelYear', e.target.value)}><option value="">{t.selectYear}</option>{YEARS.map((year) => <option key={year}>{year}</option>)}</select></Field>
                  <Field label={t.mileage}><div className="relative"><input type="number" min="0" className="form-control pr-14" value={form.miles} onChange={(e) => update('miles', e.target.value)} /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">{distanceUnit}</span></div></Field>
                  <Field label={t.firstRegistration} optional={t.optional}><input type="date" className="form-control" value={form.firstRegistration} onChange={(e) => update('firstRegistration', e.target.value)} /></Field>
                </Grid>
              </Section>
            )}

            {step === 2 && (
              <Section eyebrow={t.technicalEyebrow} title={t.technicalTitle} intro={t.technicalIntro}>
                <Grid>
                  <Choice label={t.body} value={form.bodyType} values={o.body} choose={t.choose} onChange={(v) => update('bodyType', v)} />
                  <Choice label={t.fuel} value={form.fuelType} values={o.fuel} choose={t.choose} onChange={(v) => update('fuelType', v)} />
                  <Choice label={t.gearbox} value={form.gearbox} values={o.gearbox} choose={t.choose} onChange={(v) => update('gearbox', v)} />
                  <Choice label={t.drivetrain} value={form.drivetrain} values={o.drivetrain} choose={t.choose} onChange={(v) => update('drivetrain', v)} />
                  <Field label={t.power} optional={t.optional}><div className="relative"><input type="number" className="form-control pr-12" value={form.powerHp} onChange={(e) => update('powerHp', e.target.value)} /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">{powerUnit}</span></div></Field>
                  <Field label={t.color} optional={t.optional}><input className="form-control" value={form.color} onChange={(e) => update('color', e.target.value)} /></Field>
                </Grid>
              </Section>
            )}

            {step === 3 && (
              <Section eyebrow={t.conditionEyebrow} title={t.conditionTitle} intro={t.conditionIntro}>
                <Grid>
                  <Field label={t.owners} optional={t.optional}><input type="number" min="0" className="form-control" value={form.owners} onChange={(e) => update('owners', e.target.value)} /></Field>
                  <Choice label={t.service} value={form.service} values={o.service} choose={t.choose} onChange={(v) => update('service', v)} />
                  <Choice label={t.damage} value={form.damage} values={o.damage} choose={t.choose} onChange={(v) => update('damage', v)} />
                  <Choice label={t.warnings} value={form.warnings} values={o.warnings} choose={t.choose} onChange={(v) => update('warnings', v)} />
                  <Choice label={t.tires} value={form.tires} values={o.tires} choose={t.choose} onChange={(v) => update('tires', v)} optionalLabel={t.optional} />
                  <Choice label={t.keys} value={form.keysCount} values={['1', '2', '3+']} choose={t.choose} onChange={(v) => update('keysCount', v)} optionalLabel={t.optional} />
                  <Choice label={t.towbar} value={form.towbar} values={o.yesNo} choose={t.choose} onChange={(v) => update('towbar', v)} optionalLabel={t.optional} />
                  <Choice label={t.sellTime} value={form.sellTime} values={o.sell} choose={t.choose} onChange={(v) => update('sellTime', v)} />
                  {form.damage && form.damage !== o.damage[0] && <div className="sm:col-span-2"><Field label={t.damageDescription}><textarea rows={3} className="form-control resize-none" value={form.damageDescription} onChange={(e) => update('damageDescription', e.target.value)} /></Field></div>}
                  <div className="sm:col-span-2"><Field label={t.equipment} optional={t.optional}><textarea rows={3} className="form-control resize-none" value={form.equipment} onChange={(e) => update('equipment', e.target.value)} /></Field></div>
                </Grid>
              </Section>
            )}

            {step === 4 && (
              <Section eyebrow={t.finalEyebrow} title={t.finalTitle} intro={t.finalIntro}>
                <label className="grid min-h-44 cursor-pointer place-items-center rounded-[5px] border border-dashed border-slate-300 bg-slate-50/60 p-5 text-center transition hover:border-[#0b5cff] hover:bg-blue-50/30">
                  <div><Upload className="mx-auto text-[#0b5cff]" /><p className="mt-3 font-semibold">{t.upload}</p><p className="mt-1 text-sm font-normal text-slate-500">{t.uploadHelp}</p><p className="mt-2 text-xs font-semibold text-[#0b5cff]">{images.length}/12 {t.photos}</p></div>
                  <input type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={addImages} />
                </label>
                {images.length > 0 && <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{images.map((image) => <div key={image.id} className="relative overflow-hidden rounded-[5px]"><Image src={image.url} alt="" width={240} height={160} unoptimized className="h-28 w-full object-cover" /><button type="button" onClick={() => setImages((current) => current.filter((item) => item.id !== image.id))} className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-[5px] bg-white/90"><X size={14} /></button></div>)}</div>}
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <Field label={t.phone}><input type="tel" autoComplete="tel" className="form-control" value={form.phone} onChange={(e) => update('phone', e.target.value)} /></Field>
                  <Field label={t.email}><input type="email" autoComplete="email" className="form-control" value={form.email} onChange={(e) => update('email', e.target.value)} /></Field>
                </div>
                <label className="mt-5 flex items-start gap-3 border-t border-slate-200 pt-5 text-sm font-normal leading-6 text-slate-600"><input type="checkbox" className="mt-1 accent-blue-600" checked={form.privacyAccepted} onChange={(e) => update('privacyAccepted', e.target.checked)} /><span>{t.privacy} <a className="font-semibold text-blue-600 underline" href="https://autorell.com/policies/privacy-policy" target="_blank">{t.privacyLink}</a>.</span></label>
              </Section>
            )}

            {error && <div className="mt-6 rounded-[5px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}
            <div className="mt-8 flex justify-between border-t border-slate-100 pt-6">
              {step > 1 ? <button type="button" onClick={previous} className="inline-flex h-12 items-center gap-2 rounded-[5px] border border-slate-300 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"><ArrowLeft size={16} />{t.back}</button> : <span />}
              {step < 4 ? <button type="button" onClick={next} className="inline-flex h-12 items-center gap-2 rounded-[5px] bg-[#0b5cff] px-6 text-sm font-semibold text-white transition hover:bg-[#004bd6]">{t.next}<ArrowRight size={16} /></button> : <button type="submit" disabled={loading} className="inline-flex h-12 items-center gap-2 rounded-[5px] bg-[#0b5cff] px-6 text-sm font-semibold text-white transition hover:bg-[#004bd6] disabled:opacity-60">{loading ? t.sending : t.submit}<ArrowRight size={16} /></button>}
            </div>
            <p className="mt-6 flex items-center justify-center gap-2 text-center text-[11px] font-normal text-slate-400">
              <LockKeyhole size={12} />
              {c.footer}
            </p>
          </form>
        </section>
      </div>
    </main>
  )
}

function Section({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: React.ReactNode }) {
  return <div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0b5cff]">{eyebrow}</p><h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] sm:text-[32px]">{title}</h2><p className="mb-8 mt-3 text-sm font-normal leading-6 text-slate-500">{intro}</p>{children}</div>
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2">{children}</div>
}

function Field({ label, optional, children }: { label: string; optional?: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2.5 flex justify-between text-sm font-semibold text-slate-700">{label}{optional && <small className="font-normal text-slate-400">{optional}</small>}</span>{children}</label>
}

function Choice({ label, value, values, choose, onChange, optionalLabel }: { label: string; value: string; values: readonly string[]; choose: string; onChange: (value: string) => void; optionalLabel?: string }) {
  return <Field label={label} optional={optionalLabel}><select className="form-control" value={value} onChange={(e) => onChange(e.target.value)}><option value="">{choose}</option>{values.map((item) => <option key={item}>{item}</option>)}</select></Field>
}
