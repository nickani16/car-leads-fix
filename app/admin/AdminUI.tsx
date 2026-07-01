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
          Tillbaka
        </Link>
      )}
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#70767a]">
        {eyebrow}
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-[#667085]">
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
    <form
      method="get"
      className="mb-6 flex flex-col gap-3 rounded-[14px] border border-[#dce3ee] bg-white p-4 shadow-[0_8px_24px_rgba(16,24,40,.04)] lg:flex-row"
    >
      <label className="relative min-w-0 flex-1">
        <Search
          size={17}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a8f91]"
        />
        <input
          name="q"
          defaultValue={search}
          placeholder={searchPlaceholder}
          className="h-11 w-full rounded-[10px] border border-[#d7deea] bg-[#f8fafc] pl-11 pr-4 text-sm outline-none focus:border-[#0866ff] focus:ring-2 focus:ring-[#dbeafe]"
        />
      </label>
      {children}
      <button
        type="submit"
        className="h-11 rounded-[10px] bg-[#0866ff] px-6 text-sm font-bold text-white"
      >
        Filtrera
      </button>
      <Link
        href="?"
        className="inline-flex h-11 items-center justify-center rounded-[10px] border border-[#d7deea] px-4 text-sm font-bold text-[#475467]"
      >
        Rensa
      </Link>
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
    className="h-11 rounded-[10px] border border-[#d7deea] bg-white px-4 text-sm text-[#52616b] outline-none focus:border-[#0866ff]"
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
    <div className="rounded-[14px] border border-dashed border-[#d7deea] bg-white p-10 text-center text-sm text-[#667085]">
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
    <section className="rounded-[14px] border border-[#dce3ee] bg-white shadow-[0_12px_35px_rgba(16,24,40,.045)]">
      <h2 className="border-b border-[#edf1f6] px-6 py-5 text-lg font-semibold">
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
        <div key={item.label} className="rounded-[12px] bg-[#f8fafc] p-4">
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

export function AdminStatCard({
  label,
  value,
  helper,
}: {
  label: string
  value: React.ReactNode
  helper?: string
}) {
  return (
    <article className="rounded-[14px] border border-[#dce3ee] bg-white p-5 shadow-[0_8px_22px_rgba(16,24,40,.04)]">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#667085]">
        {label}
      </p>
      <p className="mt-3 text-3xl font-black tracking-tight text-[#101828]">
        {value}
      </p>
      {helper ? <p className="mt-2 text-xs text-[#667085]">{helper}</p> : null}
    </article>
  )
}

export function AdminTable({
  columns,
  children,
}: {
  columns: string[]
  children: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-[#dce3ee] bg-white shadow-[0_12px_35px_rgba(16,24,40,.045)]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#edf1f6] text-sm">
          <thead className="bg-[#f8fafc]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-[#667085]"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#edf1f6]">{children}</tbody>
        </table>
      </div>
    </div>
  )
}

export function AdminPagination({
  page,
  hasNext,
  basePath,
  query,
}: {
  page: number
  hasNext: boolean
  basePath: string
  query: URLSearchParams
}) {
  const previousQuery = new URLSearchParams(query)
  previousQuery.set('page', String(Math.max(1, page - 1)))
  const nextQuery = new URLSearchParams(query)
  nextQuery.set('page', String(page + 1))

  return (
    <div className="mt-5 flex items-center justify-between gap-3 text-sm">
      <span className="text-[#667085]">Sida {page}</span>
      <div className="flex gap-2">
        <Link
          aria-disabled={page <= 1}
          href={`${basePath}?${previousQuery.toString()}`}
          className={`rounded-[10px] border px-4 py-2 font-bold ${
            page <= 1
              ? 'pointer-events-none border-[#e4e7ec] text-[#98a2b3]'
              : 'border-[#d7deea] text-[#344054]'
          }`}
        >
          Föregående
        </Link>
        <Link
          aria-disabled={!hasNext}
          href={`${basePath}?${nextQuery.toString()}`}
          className={`rounded-[10px] border px-4 py-2 font-bold ${
            !hasNext
              ? 'pointer-events-none border-[#e4e7ec] text-[#98a2b3]'
              : 'border-[#d7deea] text-[#344054]'
          }`}
        >
          Nästa
        </Link>
      </div>
    </div>
  )
}
