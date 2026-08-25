'use client'

import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useId, useMemo, useState, type ReactNode } from 'react'
import type { PublicLocale } from '@/lib/public-i18n'

type BirthDatePickerProps = {
  label: string
  helper?: string
  locale: PublicLocale
  name: string
  onChange: (value: string) => void
  required?: boolean
  value: string
}

type PickerCopy = {
  chooseDate: string
  clear: string
  month: string
  nextMonth: string
  previousMonth: string
  year: string
}

const pickerCopy: Record<PublicLocale, PickerCopy> = {
  sv: { chooseDate: 'Välj födelsedatum', clear: 'Rensa', month: 'Månad', nextMonth: 'Nästa månad', previousMonth: 'Föregående månad', year: 'År' },
  en: { chooseDate: 'Choose date of birth', clear: 'Clear', month: 'Month', nextMonth: 'Next month', previousMonth: 'Previous month', year: 'Year' },
  de: { chooseDate: 'Geburtsdatum wählen', clear: 'Leeren', month: 'Monat', nextMonth: 'Nächster Monat', previousMonth: 'Vorheriger Monat', year: 'Jahr' },
  at: { chooseDate: 'Geburtsdatum wählen', clear: 'Leeren', month: 'Monat', nextMonth: 'Nächster Monat', previousMonth: 'Vorheriger Monat', year: 'Jahr' },
  be: { chooseDate: 'Geboortedatum kiezen', clear: 'Wissen', month: 'Maand', nextMonth: 'Volgende maand', previousMonth: 'Vorige maand', year: 'Jaar' },
  fr: { chooseDate: 'Choisir la date de naissance', clear: 'Effacer', month: 'Mois', nextMonth: 'Mois suivant', previousMonth: 'Mois précédent', year: 'Année' },
  es: { chooseDate: 'Elegir fecha de nacimiento', clear: 'Borrar', month: 'Mes', nextMonth: 'Mes siguiente', previousMonth: 'Mes anterior', year: 'Año' },
  it: { chooseDate: 'Scegli la data di nascita', clear: 'Cancella', month: 'Mese', nextMonth: 'Mese successivo', previousMonth: 'Mese precedente', year: 'Anno' },
  pl: { chooseDate: 'Wybierz datę urodzenia', clear: 'Wyczyść', month: 'Miesiąc', nextMonth: 'Następny miesiąc', previousMonth: 'Poprzedni miesiąc', year: 'Rok' },
  nl: { chooseDate: 'Geboortedatum kiezen', clear: 'Wissen', month: 'Maand', nextMonth: 'Volgende maand', previousMonth: 'Vorige maand', year: 'Jaar' },
  fi: { chooseDate: 'Valitse syntymäaika', clear: 'Tyhjennä', month: 'Kuukausi', nextMonth: 'Seuraava kuukausi', previousMonth: 'Edellinen kuukausi', year: 'Vuosi' },
  da: { chooseDate: 'Vælg fødselsdato', clear: 'Ryd', month: 'Måned', nextMonth: 'Næste måned', previousMonth: 'Forrige måned', year: 'År' },
}

const dateLocales: Record<PublicLocale, string> = {
  sv: 'sv-SE',
  en: 'en-GB',
  de: 'de-DE',
  at: 'de-AT',
  be: 'nl-BE',
  fr: 'fr-FR',
  es: 'es-ES',
  it: 'it-IT',
  pl: 'pl-PL',
  nl: 'nl-NL',
  fi: 'fi-FI',
  da: 'da-DK',
}

export default function BirthDatePicker({
  label,
  helper,
  locale,
  name,
  onChange,
  required = false,
  value,
}: BirthDatePickerProps) {
  const labelId = useId()
  const copy = pickerCopy[locale]
  const dateLocale = dateLocales[locale]
  const maximumDate = useMemo(() => adultLimitDate(), [])
  const selectedDate = useMemo(() => parseIsoDate(value), [value])
  const initialDate = selectedDate || maximumDate
  const [open, setOpen] = useState(false)
  const [visibleYear, setVisibleYear] = useState(initialDate.getFullYear())
  const [visibleMonth, setVisibleMonth] = useState(initialDate.getMonth())
  const maximumIso = toIsoDate(maximumDate)
  const minimumIso = '1900-01-01'
  const minimumMonthKey = 1900 * 12
  const maximumMonthKey = maximumDate.getFullYear() * 12 + maximumDate.getMonth()
  const visibleMonthKey = visibleYear * 12 + visibleMonth
  const years = useMemo(
    () => Array.from({ length: maximumDate.getFullYear() - 1899 }, (_, index) => maximumDate.getFullYear() - index),
    [maximumDate],
  )

  function moveMonth(delta: number) {
    const next = new Date(visibleYear, visibleMonth + delta, 1)
    const nextMonthKey = next.getFullYear() * 12 + next.getMonth()
    if (nextMonthKey < minimumMonthKey || nextMonthKey > maximumMonthKey) return
    setVisibleYear(next.getFullYear())
    setVisibleMonth(next.getMonth())
  }

  function changeYear(year: number) {
    setVisibleYear(year)
    if (year === maximumDate.getFullYear() && visibleMonth > maximumDate.getMonth()) {
      setVisibleMonth(maximumDate.getMonth())
    }
  }

  const formattedValue = selectedDate
    ? new Intl.DateTimeFormat(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' }).format(selectedDate)
    : copy.chooseDate

  return (
    <div className="min-w-0 sm:col-span-2">
      <input type="hidden" name={name} value={value} />
      <span id={labelId} className="mb-2 block text-sm font-semibold">
        {label}{required ? ' *' : ''}
      </span>
      <div className="overflow-hidden rounded-[14px] border border-[#d7deed] bg-white transition focus-within:border-[#0866ff] focus-within:ring-4 focus-within:ring-[#0866ff]/10">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-labelledby={labelId}
          className="flex min-h-13 w-full items-center justify-between gap-3 px-4 text-left"
        >
          <span className={`min-w-0 truncate text-sm font-normal ${selectedDate ? 'text-[#101828]' : 'text-[#7b8494]'}`}>
            {formattedValue}
          </span>
          <CalendarDays className="h-5 w-5 shrink-0 text-[#667085]" />
        </button>

        {open ? (
          <div role="dialog" aria-labelledby={labelId} className="border-t border-[#e4e9f1] p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={copy.previousMonth}
                disabled={visibleMonthKey <= minimumMonthKey}
                onClick={() => moveMonth(-1)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#d7deed] text-[#344054] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(96px,116px)] gap-2">
                <PickerSelect
                  ariaLabel={copy.month}
                  value={visibleMonth}
                  onChange={(nextValue) => setVisibleMonth(Number(nextValue))}
                >
                  {Array.from({ length: 12 }, (_, month) => (
                    <option
                      key={month}
                      value={month}
                      disabled={visibleYear === maximumDate.getFullYear() && month > maximumDate.getMonth()}
                    >
                      {new Intl.DateTimeFormat(dateLocale, { month: 'long' }).format(new Date(2024, month, 1))}
                    </option>
                  ))}
                </PickerSelect>
                <PickerSelect ariaLabel={copy.year} value={visibleYear} onChange={(nextValue) => changeYear(Number(nextValue))}>
                  {years.map((year) => <option key={year} value={year}>{year}</option>)}
                </PickerSelect>
              </div>
              <button
                type="button"
                aria-label={copy.nextMonth}
                disabled={visibleMonthKey >= maximumMonthKey}
                onClick={() => moveMonth(1)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#d7deed] text-[#344054] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-3 text-center text-sm font-semibold capitalize text-[#101828]">
              {new Intl.DateTimeFormat(dateLocale, { month: 'long', year: 'numeric' }).format(new Date(visibleYear, visibleMonth, 1))}
            </p>
            <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase text-[#667085]">
              {weekdayLabels(dateLocale).map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {calendarDays(visibleYear, visibleMonth).map((day) => {
                const iso = toIsoDate(day.date)
                const active = value === iso
                const disabled = iso < minimumIso || iso > maximumIso
                return (
                  <button
                    key={day.key}
                    type="button"
                    disabled={disabled}
                    aria-label={new Intl.DateTimeFormat(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' }).format(day.date)}
                    onClick={() => {
                      onChange(iso)
                      setOpen(false)
                    }}
                    className={`h-10 rounded-[10px] text-sm font-semibold transition ${
                      active
                        ? 'bg-[#0866ff] text-white'
                        : disabled
                          ? 'cursor-not-allowed text-[#d0d5dd]'
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
            {value ? (
              <div className="mt-3 border-t border-[#edf1f6] pt-3 text-right">
                <button type="button" onClick={() => onChange('')} className="text-sm font-semibold text-[#667085] hover:text-[#0866ff]">
                  {copy.clear}
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      {helper ? <span className="mt-1.5 block text-xs leading-5 text-[#7b8494]">{helper}</span> : null}
    </div>
  )
}

function PickerSelect({
  ariaLabel,
  children,
  onChange,
  value,
}: {
  ariaLabel: string
  children: ReactNode
  onChange: (value: string) => void
  value: number
}) {
  return (
    <div className="relative min-w-0">
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full min-w-0 appearance-none rounded-[12px] border border-[#d7deed] bg-white py-0 pl-3 pr-8 text-sm font-medium text-[#101828] outline-none"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
    </div>
  )
}

function adultLimitDate() {
  const today = new Date()
  return new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
}

function parseIsoDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return Number.isNaN(date.getTime()) ? null : date
}

function toIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function weekdayLabels(locale: string) {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' })
  return Array.from({ length: 7 }, (_, index) => formatter.format(new Date(2024, 0, index + 1)))
}

function calendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const mondayOffset = (firstDay.getDay() + 6) % 7
  const start = new Date(year, month, 1 - mondayOffset)
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index)
    return {
      date,
      inMonth: date.getMonth() === month,
      key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
    }
  })
}
