import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import {
  localizePublicHref,
  translatePublic,
  type PublicLocale,
} from '@/lib/public-i18n'

type DirectoryLink = {
  label: string
  href: string
}

type DirectoryGroup = {
  title: string
  links: DirectoryLink[]
}

type LocalizedLabel = {
  sv: string
  en: string
  de: string
}

type ModelDefinition = string | {
  value: string
  label: LocalizedLabel
}

export default function HomeVehicleLinkDirectory({ locale }: { locale: PublicLocale }) {
  const groups: DirectoryGroup[] = [
    modelGroup(locale, 'Audi', ['A3', 'A4', 'A5', 'A6', 'Q3', 'Q5']),
    modelGroup(locale, 'BMW', [
      { value: '1 Series', label: { sv: '1-serie', en: '1 Series', de: '1er' } },
      { value: '3 Series', label: { sv: '3-serie', en: '3 Series', de: '3er' } },
      { value: '5 Series', label: { sv: '5-serie', en: '5 Series', de: '5er' } },
      'X1',
      'X3',
      'X5',
    ]),
    modelGroup(locale, 'Mercedes-Benz', [
      { value: 'A-Class', label: { sv: 'A-klass', en: 'A-Class', de: 'A-Klasse' } },
      { value: 'C-Class', label: { sv: 'C-klass', en: 'C-Class', de: 'C-Klasse' } },
      { value: 'E-Class', label: { sv: 'E-klass', en: 'E-Class', de: 'E-Klasse' } },
      'GLC',
      'GLE',
      'Sprinter',
    ]),
    modelGroup(locale, 'Volkswagen', ['Golf', 'Passat', 'Polo', 'Tiguan', 'T-Roc', 'ID.4']),
    modelGroup(locale, 'Volvo', ['V40', 'V60', 'V90', 'XC40', 'XC60', 'XC90']),
    modelGroup(locale, 'Toyota', ['Corolla', 'Yaris', 'C-HR', 'RAV4', 'Prius', 'Land Cruiser']),
    modelGroup(locale, 'Ford', ['Fiesta', 'Focus', 'Kuga', 'Mustang', 'Puma', 'Ranger']),
    modelGroup(locale, 'Tesla', ['Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck', 'Roadster']),
    {
      title: label(locale, 'Fler populära märken', 'More popular brands', 'Weitere beliebte Marken'),
      links: ['Cupra', 'Opel', 'Renault', 'Peugeot', 'Kia', 'Hyundai'].map((make) => ({
        label: make,
        href: marketplaceHref(locale, { make, q: make }),
      })),
    },
    {
      title: label(locale, 'Populära fordonstyper', 'Popular vehicle types', 'Beliebte Fahrzeugtypen'),
      links: [
        filterLink(locale, 'Kombi', 'Estate cars', 'Kombis', { bodyType: 'Kombi' }),
        filterLink(locale, 'SUV', 'SUVs', 'SUVs', { bodyType: 'SUV' }),
        filterLink(locale, 'Sedan', 'Sedans', 'Limousinen', { bodyType: 'Sedan' }),
        filterLink(locale, 'Halvkombi', 'Hatchbacks', 'Schrägheck', { bodyType: 'Halvkombi' }),
        filterLink(locale, 'Pickuper', 'Pickups', 'Pickups', { bodyType: 'Pickup' }),
        filterLink(locale, 'Cabrioleter', 'Convertibles', 'Cabrios', { bodyType: 'Cabriolet' }),
      ],
    },
    {
      title: label(locale, 'Drivmedel och egenskaper', 'Powertrains and features', 'Antrieb und Eigenschaften'),
      links: [
        filterLink(locale, 'Elbilar', 'Electric cars', 'Elektroautos', { fuel: 'El' }),
        filterLink(locale, 'Hybridbilar', 'Hybrid cars', 'Hybridautos', { fuel: 'Hybrid' }),
        filterLink(locale, 'Bensinbilar', 'Petrol cars', 'Benziner', { fuel: 'Bensin' }),
        filterLink(locale, 'Dieselbilar', 'Diesel cars', 'Dieselfahrzeuge', { fuel: 'Diesel' }),
        filterLink(locale, 'Automatväxlade bilar', 'Automatic cars', 'Automatikfahrzeuge', { gearbox: 'Automat' }),
        filterLink(locale, 'Leasingbilar', 'Leasing cars', 'Leasingfahrzeuge', { mode: 'leasing', leasingPossible: 'true' }),
      ],
    },
    {
      title: label(locale, 'Guider och verktyg', 'Guides and tools', 'Ratgeber und Werkzeuge'),
      links: [
        directLink(locale, 'Köpguide', 'Buying guide', 'Kaufratgeber', '/buying-guide'),
        directLink(locale, 'Jämför fordon', 'Compare vehicles', 'Fahrzeuge vergleichen', '/compare-vehicles'),
        directLink(locale, 'Fordonshistorik', 'Vehicle history', 'Fahrzeughistorie', '/vehicle-history'),
        directLink(locale, 'Sparade sökningar', 'Saved searches', 'Gespeicherte Suchen', '/saved-searches'),
        directLink(locale, 'Säkerhetstips', 'Safety tips', 'Sicherheitstipps', '/safety-tips'),
        directLink(locale, 'Fordonsnyheter', 'Vehicle news', 'Fahrzeugnews', '/vehicle-news'),
      ],
    },
  ]

  return (
    <section className="overflow-hidden border-y border-[#cfd8e4] bg-white px-5 py-8 sm:rounded-[8px] sm:border sm:px-7 sm:py-9">
      <h2 className="max-w-[920px] text-[24px] font-semibold leading-tight text-[#101828] sm:text-[28px]">
        {label(
          locale,
          'Populära bilmärken, modeller och mer på Autorell',
          'Popular car brands, models and more on Autorell',
          'Beliebte Automarken, Modelle und mehr bei Autorell',
        )}
      </h2>

      <div className="mt-7 grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-9">
        {groups.map((group) => (
          <div key={group.title} className="min-w-0">
            <h3 className="text-[13px] font-semibold leading-[1.3] text-[#101828] sm:text-[14px]">
              {group.title}
            </h3>
            <ul className="mt-2.5 space-y-1.5">
              {group.links.map((item) => (
                <li key={`${group.title}-${item.label}`}>
                  <Link
                    href={item.href}
                    prefetch={false}
                    className="group inline-flex max-w-full items-start gap-1 text-[13px] leading-[1.35] text-[#344054] transition hover:text-[#0866ff] sm:text-[15px]"
                  >
                    <ChevronRight
                      className="mt-[2px] h-3.5 w-3.5 flex-none text-[#98a2b3] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[#0866ff]"
                      strokeWidth={2}
                      aria-hidden="true"
                    />
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

function modelGroup(
  locale: PublicLocale,
  make: string,
  models: ModelDefinition[],
): DirectoryGroup {
  return {
    title: label(locale, `${make} begagnat`, `Used ${make}`, `${make} Gebrauchtwagen`),
    links: models.map((definition) => {
      const value = typeof definition === 'string' ? definition : definition.value
      const modelLabel = typeof definition === 'string'
        ? definition
        : localizedDefinitionLabel(locale, definition.label)

      return {
        label: `${make} ${modelLabel}`,
        href: marketplaceHref(locale, { make, model: value, q: `${make} ${value}` }),
      }
    }),
  }
}

function filterLink(
  locale: PublicLocale,
  sv: string,
  en: string,
  de: string,
  filters: Record<string, string>,
): DirectoryLink {
  return {
    label: label(locale, sv, en, de),
    href: marketplaceHref(locale, filters),
  }
}

function directLink(
  locale: PublicLocale,
  sv: string,
  en: string,
  de: string,
  href: string,
): DirectoryLink {
  return {
    label: label(locale, sv, en, de),
    href: localizePublicHref(locale, href),
  }
}

function marketplaceHref(locale: PublicLocale, filters: Record<string, string>) {
  const params = new URLSearchParams({ categories: 'cars', ...filters })
  return localizePublicHref(locale, `/marketplace/cars?${params.toString()}`)
}

function localizedDefinitionLabel(locale: PublicLocale, value: LocalizedLabel) {
  if (locale === 'sv') return value.sv
  if (locale === 'de') return value.de
  if (locale === 'en') return value.en
  return translatePublic(locale, value.en)
}

function label(locale: PublicLocale, sv: string, en: string, de: string) {
  if (locale === 'sv') return sv
  if (locale === 'de') return de
  if (locale === 'en') return en
  return translatePublic(locale, en)
}
