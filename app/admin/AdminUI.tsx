import Link from 'next/link'
import { ArrowLeft, Search } from 'lucide-react'

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  backHref,
}: {
  eyebrow: string
  title: string
  description: string
  backHref?: string
}) {
  return (
    <header className="mb-7">
      {backHref && (
        <Link
          href={backHref}
          className="mb-5 inline-flex items-center gap-2 text-sm text-[#62686c] hover:text-[#242424]"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
      )}
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#70767a]">
        {eyebrow}
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-[#62686c]">
        {description}
      </p>
    </header>
  )
}

export function AdminFilters({
  search,
  searchPlaceholder,
  children,
}: {
  search?: string
  searchPlaceholder: string
  children?: React.ReactNode
}) {
  return (
    <form className="mb-6 flex flex-col gap-3 rounded-[18px] border border-[#deddd7] bg-white p-4 shadow-[0_8px_24px_rgba(32,33,36,.04)] lg:flex-row">
      <label className="relative min-w-0 flex-1">
        <Search
          size={17}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a8f91]"
        />
        <input
          name="q"
          defaultValue={search}
          placeholder={searchPlaceholder}
          className="h-11 w-full rounded-[12px] border border-[#d8d7d1] bg-[#faf9f6] pl-11 pr-4 text-sm outline-none focus:border-[#8dbdd8]"
        />
      </label>
      {children}
      <button className="h-11 rounded-full bg-[#242424] px-6 text-sm text-white">
        Apply filters
      </button>
    </form>
  )
}

export function FilterSelect({
  name,
  value,
  label,
  options,
}: {
  name: string
  value?: string
  label: string
  options: { value: string; label: string }[]
}) {
  return (
    <select
      name={name}
      defaultValue={value || ''}
      aria-label={label}
      className="h-11 rounded-[12px] border border-[#d8d7d1] bg-white px-4 text-sm text-[#52616b] outline-none focus:border-[#8dbdd8]"
    >
      <option value="">{label}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

export function AdminEmpty({ text }: { text: string }) {
  return (
    <div className="rounded-[18px] border border-dashed border-[#d8d7d1] bg-white p-10 text-center text-sm text-[#73797c]">
      {text}
    </div>
  )
}

export function Badge({
  label,
  tone = 'blue',
}: {
  label: string
  tone?: 'blue' | 'green' | 'amber' | 'red' | 'gray'
}) {
  const tones = {
    blue: 'border-[#c9e3f2] bg-[#eff8fd] text-[#31546a]',
    green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-800',
    red: 'border-red-200 bg-red-50 text-red-700',
    gray: 'border-[#deddd7] bg-[#f5f4f0] text-[#62686c]',
  }

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${tones[tone]}`}
    >
      {label}
    </span>
  )
}

export function DetailCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-[20px] border border-[#deddd7] bg-white shadow-[0_12px_35px_rgba(32,33,36,.045)]">
      <h2 className="border-b border-[#e7e5df] px-6 py-5 text-lg font-semibold">
        {title}
      </h2>
      <div className="p-6">{children}</div>
    </section>
  )
}

export function DetailGrid({
  items,
}: {
  items: { label: string; value: React.ReactNode }[]
}) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="rounded-[14px] bg-[#f8f7f3] p-4">
          <dt className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#858a8c]">
            {item.label}
          </dt>
          <dd className="mt-1 break-words text-sm text-[#242424]">
            {item.value || 'Not provided'}
          </dd>
        </div>
      ))}
    </dl>
  )
}

