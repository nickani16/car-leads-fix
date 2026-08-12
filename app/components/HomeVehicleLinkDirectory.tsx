import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { localizePublicHref, type PublicLocale } from '@/lib/public-i18n'

type DirectoryLink = { label: string; href: string }
type DirectoryGroup = { title: string; links: DirectoryLink[] }
type DirectoryLanguage = 'sv' | 'en' | 'de' | 'nl' | 'fr' | 'es' | 'it' | 'pl' | 'fi' | 'da'
type ModelDefinition = string | { value: string; labels: Record<DirectoryLanguage, string> }

type DirectoryCopy = {
  heading: string
  used: string
  moreBrands: string
  vehicleTypes: string
  powertrains: string
  guides: string
  bodyTypes: string[]
  fuels: string[]
  guideLinks: string[]
}

const directoryCopy: Record<DirectoryLanguage, DirectoryCopy> = {
  sv: {
    heading: 'Populära bilmärken, modeller och mer på Autorell',
    used: '{make} begagnat', moreBrands: 'Fler populära märken', vehicleTypes: 'Populära fordonstyper',
    powertrains: 'Drivmedel och egenskaper', guides: 'Guider och verktyg',
    bodyTypes: ['Kombi', 'SUV', 'Sedan', 'Halvkombi', 'Pickuper', 'Cabrioleter'],
    fuels: ['Elbilar', 'Hybridbilar', 'Bensinbilar', 'Dieselbilar', 'Automatväxlade bilar', 'Leasingbilar'],
    guideLinks: ['Köpguide', 'Jämför fordon', 'Fordonshistorik', 'Sparade sökningar', 'Säkerhetstips', 'Fordonsnyheter'],
  },
  en: {
    heading: 'Popular car brands, models and more on Autorell',
    used: 'Used {make}', moreBrands: 'More popular brands', vehicleTypes: 'Popular vehicle types',
    powertrains: 'Powertrains and features', guides: 'Guides and tools',
    bodyTypes: ['Estate cars', 'SUVs', 'Sedans', 'Hatchbacks', 'Pickups', 'Convertibles'],
    fuels: ['Electric cars', 'Hybrid cars', 'Petrol cars', 'Diesel cars', 'Automatic cars', 'Leasing cars'],
    guideLinks: ['Buying guide', 'Compare vehicles', 'Vehicle history', 'Saved searches', 'Safety tips', 'Vehicle news'],
  },
  de: {
    heading: 'Beliebte Automarken, Modelle und mehr bei Autorell',
    used: '{make} Gebrauchtwagen', moreBrands: 'Weitere beliebte Marken', vehicleTypes: 'Beliebte Fahrzeugtypen',
    powertrains: 'Antrieb und Eigenschaften', guides: 'Ratgeber und Tools',
    bodyTypes: ['Kombis', 'SUVs', 'Limousinen', 'Schrägheck', 'Pick-ups', 'Cabrios'],
    fuels: ['Elektroautos', 'Hybridautos', 'Benziner', 'Dieselfahrzeuge', 'Automatikfahrzeuge', 'Leasingfahrzeuge'],
    guideLinks: ['Kaufratgeber', 'Fahrzeuge vergleichen', 'Fahrzeughistorie', 'Gespeicherte Suchen', 'Sicherheitstipps', 'Fahrzeugnews'],
  },
  nl: {
    heading: 'Populaire automerken, modellen en meer op Autorell',
    used: 'Tweedehands {make}', moreBrands: 'Meer populaire merken', vehicleTypes: 'Populaire voertuigtypen',
    powertrains: 'Aandrijving en eigenschappen', guides: 'Gidsen en hulpmiddelen',
    bodyTypes: ['Stationwagens', "SUV's", 'Sedans', 'Hatchbacks', 'Pick-ups', 'Cabriolets'],
    fuels: ["Elektrische auto's", "Hybride auto's", "Benzineauto's", "Dieselauto's", "Auto's met automaat", "Leaseauto's"],
    guideLinks: ['Koopgids', 'Voertuigen vergelijken', 'Voertuighistorie', 'Opgeslagen zoekopdrachten', 'Veiligheidstips', 'Voertuignieuws'],
  },
  fr: {
    heading: 'Marques et modèles populaires et plus sur Autorell',
    used: "{make} d'occasion", moreBrands: 'Autres marques populaires', vehicleTypes: 'Types de véhicules populaires',
    powertrains: 'Motorisations et caractéristiques', guides: 'Guides et outils',
    bodyTypes: ['Breaks', 'SUV', 'Berlines', 'Compactes', 'Pick-up', 'Cabriolets'],
    fuels: ['Voitures électriques', 'Voitures hybrides', 'Voitures essence', 'Voitures diesel', 'Voitures automatiques', 'Voitures en leasing'],
    guideLinks: ["Guide d'achat", 'Comparer les véhicules', 'Historique du véhicule', 'Recherches enregistrées', 'Conseils de sécurité', 'Actualités automobiles'],
  },
  es: {
    heading: 'Marcas y modelos de coches populares y más en Autorell',
    used: '{make} de segunda mano', moreBrands: 'Más marcas populares', vehicleTypes: 'Tipos de vehículos populares',
    powertrains: 'Motorizaciones y características', guides: 'Guías y herramientas',
    bodyTypes: ['Familiares', 'SUV', 'Berlinas', 'Compactos', 'Pick-ups', 'Descapotables'],
    fuels: ['Coches eléctricos', 'Coches híbridos', 'Coches de gasolina', 'Coches diésel', 'Coches automáticos', 'Coches de leasing'],
    guideLinks: ['Guía de compra', 'Comparar vehículos', 'Historial del vehículo', 'Búsquedas guardadas', 'Consejos de seguridad', 'Noticias de vehículos'],
  },
  it: {
    heading: 'Marche e modelli di auto popolari e altro su Autorell',
    used: '{make} usate', moreBrands: 'Altri marchi popolari', vehicleTypes: 'Tipi di veicoli popolari',
    powertrains: 'Alimentazioni e caratteristiche', guides: 'Guide e strumenti',
    bodyTypes: ['Station wagon', 'SUV', 'Berline', 'Berlina due volumi', 'Pick-up', 'Cabriolet'],
    fuels: ['Auto elettriche', 'Auto ibride', 'Auto a benzina', 'Auto diesel', 'Auto automatiche', 'Auto in leasing'],
    guideLinks: ["Guida all'acquisto", 'Confronta veicoli', 'Storico del veicolo', 'Ricerche salvate', 'Consigli di sicurezza', 'Notizie sui veicoli'],
  },
  pl: {
    heading: 'Popularne marki i modele samochodów oraz więcej w Autorell',
    used: 'Używane {make}', moreBrands: 'Więcej popularnych marek', vehicleTypes: 'Popularne typy pojazdów',
    powertrains: 'Napędy i cechy', guides: 'Poradniki i narzędzia',
    bodyTypes: ['Kombi', 'SUV-y', 'Sedany', 'Hatchbacki', 'Pick-upy', 'Kabriolety'],
    fuels: ['Samochody elektryczne', 'Samochody hybrydowe', 'Samochody benzynowe', 'Samochody z silnikiem Diesla', 'Samochody z automatem', 'Samochody w leasingu'],
    guideLinks: ['Poradnik zakupu', 'Porównaj pojazdy', 'Historia pojazdu', 'Zapisane wyszukiwania', 'Wskazówki bezpieczeństwa', 'Wiadomości motoryzacyjne'],
  },
  fi: {
    heading: 'Suositut automerkit, mallit ja muuta Autorellissa',
    used: 'Käytetyt {make}-autot', moreBrands: 'Lisää suosittuja merkkejä', vehicleTypes: 'Suositut ajoneuvotyypit',
    powertrains: 'Käyttövoimat ja ominaisuudet', guides: 'Oppaat ja työkalut',
    bodyTypes: ['Farmarit', 'SUV:t', 'Sedanit', 'Viistoperät', 'Avolava-autot', 'Avoautot'],
    fuels: ['Sähköautot', 'Hybridiautot', 'Bensiiniautot', 'Dieselautot', 'Automaattivaihteiset autot', 'Leasingautot'],
    guideLinks: ['Osto-opas', 'Vertaile ajoneuvoja', 'Ajoneuvohistoria', 'Tallennetut haut', 'Turvallisuusvinkit', 'Ajoneuvouutiset'],
  },
  da: {
    heading: 'Populære bilmærker, modeller og mere på Autorell',
    used: 'Brugte {make}-biler', moreBrands: 'Flere populære mærker', vehicleTypes: 'Populære køretøjstyper',
    powertrains: 'Drivmidler og egenskaber', guides: 'Guider og værktøjer',
    bodyTypes: ['Stationcars', "SUV'er", 'Sedaner', 'Hatchbacks', 'Pickups', 'Cabrioleter'],
    fuels: ['Elbiler', 'Hybridbiler', 'Benzinbiler', 'Dieselbiler', 'Automatgearbiler', 'Leasingbiler'],
    guideLinks: ['Købsguide', 'Sammenlign køretøjer', 'Køretøjshistorik', 'Gemte søgninger', 'Sikkerhedstips', 'Køretøjsnyheder'],
  },
}

const bmwSeries = (value: string, labels: Record<DirectoryLanguage, string>): ModelDefinition => ({ value, labels })
const models = {
  bmw1: bmwSeries('1 Series', { sv: '1-serie', en: '1 Series', de: '1er', nl: '1 Serie', fr: 'Série 1', es: 'Serie 1', it: 'Serie 1', pl: 'Seria 1', fi: '1-sarja', da: '1-serie' }),
  bmw3: bmwSeries('3 Series', { sv: '3-serie', en: '3 Series', de: '3er', nl: '3 Serie', fr: 'Série 3', es: 'Serie 3', it: 'Serie 3', pl: 'Seria 3', fi: '3-sarja', da: '3-serie' }),
  bmw5: bmwSeries('5 Series', { sv: '5-serie', en: '5 Series', de: '5er', nl: '5 Serie', fr: 'Série 5', es: 'Serie 5', it: 'Serie 5', pl: 'Seria 5', fi: '5-sarja', da: '5-serie' }),
  aClass: bmwSeries('A-Class', { sv: 'A-klass', en: 'A-Class', de: 'A-Klasse', nl: 'A-klasse', fr: 'Classe A', es: 'Clase A', it: 'Classe A', pl: 'Klasa A', fi: 'A-sarja', da: 'A-klasse' }),
  cClass: bmwSeries('C-Class', { sv: 'C-klass', en: 'C-Class', de: 'C-Klasse', nl: 'C-klasse', fr: 'Classe C', es: 'Clase C', it: 'Classe C', pl: 'Klasa C', fi: 'C-sarja', da: 'C-klasse' }),
  eClass: bmwSeries('E-Class', { sv: 'E-klass', en: 'E-Class', de: 'E-Klasse', nl: 'E-klasse', fr: 'Classe E', es: 'Clase E', it: 'Classe E', pl: 'Klasa E', fi: 'E-sarja', da: 'E-klasse' }),
}

export default function HomeVehicleLinkDirectory({ locale }: { locale: PublicLocale }) {
  const language = directoryLanguage(locale)
  const copy = directoryCopy[language]
  const groups: DirectoryGroup[] = [
    modelGroup(locale, language, copy, 'Audi', ['A3', 'A4', 'A5', 'A6', 'Q3', 'Q5']),
    modelGroup(locale, language, copy, 'BMW', [models.bmw1, models.bmw3, models.bmw5, 'X1', 'X3', 'X5']),
    modelGroup(locale, language, copy, 'Mercedes-Benz', [models.aClass, models.cClass, models.eClass, 'GLC', 'GLE', 'Sprinter']),
    modelGroup(locale, language, copy, 'Volkswagen', ['Golf', 'Passat', 'Polo', 'Tiguan', 'T-Roc', 'ID.4']),
    modelGroup(locale, language, copy, 'Volvo', ['V40', 'V60', 'V90', 'XC40', 'XC60', 'XC90']),
    modelGroup(locale, language, copy, 'Toyota', ['Corolla', 'Yaris', 'C-HR', 'RAV4', 'Prius', 'Land Cruiser']),
    modelGroup(locale, language, copy, 'Ford', ['Fiesta', 'Focus', 'Kuga', 'Mustang', 'Puma', 'Ranger']),
    modelGroup(locale, language, copy, 'Tesla', ['Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck', 'Roadster']),
    {
      title: copy.moreBrands,
      links: ['Cupra', 'Opel', 'Renault', 'Peugeot', 'Kia', 'Hyundai'].map((make) => ({ label: make, href: marketplaceHref(locale, { make, q: make }) })),
    },
    {
      title: copy.vehicleTypes,
      links: copy.bodyTypes.map((item, index) => filterLink(locale, item, { bodyType: ['Kombi', 'SUV', 'Sedan', 'Halvkombi', 'Pickup', 'Cabriolet'][index] })),
    },
    {
      title: copy.powertrains,
      links: [
        filterLink(locale, copy.fuels[0], { fuel: 'El' }),
        filterLink(locale, copy.fuels[1], { fuel: 'Hybrid' }),
        filterLink(locale, copy.fuels[2], { fuel: 'Bensin' }),
        filterLink(locale, copy.fuels[3], { fuel: 'Diesel' }),
        filterLink(locale, copy.fuels[4], { gearbox: 'Automat' }),
        filterLink(locale, copy.fuels[5], { mode: 'leasing', leasingPossible: 'true' }),
      ],
    },
    {
      title: copy.guides,
      links: [
        directLink(locale, copy.guideLinks[0], '/buying-guide'),
        directLink(locale, copy.guideLinks[1], '/compare-vehicles'),
        directLink(locale, copy.guideLinks[2], '/vehicle-history'),
        directLink(locale, copy.guideLinks[3], '/saved-searches'),
        directLink(locale, copy.guideLinks[4], '/safety-tips'),
        directLink(locale, copy.guideLinks[5], '/vehicle-news'),
      ],
    },
  ]

  return (
    <section className="overflow-hidden border-y border-[#cfd8e4] bg-white px-5 py-8 sm:rounded-[8px] sm:border sm:px-7 sm:py-9">
      <h2 className="max-w-[920px] text-[24px] font-semibold leading-tight text-[#101828] sm:text-[28px]">{copy.heading}</h2>
      <div className="mt-7 grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-9">
        {groups.map((group) => (
          <div key={group.title} className="min-w-0">
            <h3 className="text-[13px] font-semibold leading-[1.3] text-[#0866ff] sm:text-[14px]">{group.title}</h3>
            <ul className="mt-2.5 space-y-1.5">
              {group.links.map((item) => (
                <li key={`${group.title}-${item.label}`}>
                  <Link href={item.href} prefetch={false} className="group inline-flex max-w-full items-start gap-1 text-[13px] leading-[1.35] text-[#0866ff] transition hover:text-[#004fc4] sm:text-[15px]">
                    <ChevronRight className="mt-[2px] h-3.5 w-3.5 flex-none text-current transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={2} aria-hidden="true" />
                    <span className="min-w-0 [overflow-wrap:anywhere]">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

function modelGroup(locale: PublicLocale, language: DirectoryLanguage, copy: DirectoryCopy, make: string, definitions: ModelDefinition[]): DirectoryGroup {
  return {
    title: copy.used.replace('{make}', make),
    links: definitions.map((definition) => {
      const value = typeof definition === 'string' ? definition : definition.value
      const modelLabel = typeof definition === 'string' ? definition : definition.labels[language]
      return { label: `${make} ${modelLabel}`, href: marketplaceHref(locale, { make, model: value, q: `${make} ${value}` }) }
    }),
  }
}

function filterLink(locale: PublicLocale, label: string, filters: Record<string, string>): DirectoryLink {
  return { label, href: marketplaceHref(locale, filters) }
}

function directLink(locale: PublicLocale, label: string, href: string): DirectoryLink {
  return { label, href: localizePublicHref(locale, href) }
}

function marketplaceHref(locale: PublicLocale, filters: Record<string, string>) {
  const params = new URLSearchParams({ categories: 'cars', ...filters })
  return localizePublicHref(locale, `/marketplace/cars?${params.toString()}`)
}

function directoryLanguage(locale: PublicLocale): DirectoryLanguage {
  if (locale === 'at') return 'de'
  if (locale === 'be') return 'nl'
  return locale
}
