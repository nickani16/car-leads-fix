import Link from 'next/link'
import { ChevronRight, House } from 'lucide-react'

type BreadcrumbItem = {
  label: string
  href: string
  icon?: 'home'
}

export default function ListingBreadcrumbs({
  items,
  currentLabel,
  ariaLabel,
}: {
  items: BreadcrumbItem[]
  currentLabel: string
  ariaLabel: string
}) {
  return (
    <nav aria-label={ariaLabel} className="hidden min-w-0 sm:block">
      <ol className="flex min-w-0 items-center gap-2 overflow-hidden whitespace-nowrap text-[13px] font-medium text-[#475467]">
        {items.map((item) => (
          <li key={`${item.href}-${item.label}`} className="flex min-w-0 items-center gap-2">
            <Link
              href={item.href}
              title={item.label}
              className="inline-flex min-w-0 items-center gap-1.5 truncate underline decoration-[#c4cfdd] underline-offset-4 transition hover:text-[#0866ff] hover:decoration-[#0866ff]"
            >
              {item.icon === 'home' ? <House className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> : null}
              <span className={item.icon === 'home' ? 'sr-only' : 'truncate'}>{item.label}</span>
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#98a2b3]" aria-hidden="true" />
          </li>
        ))}
        <li aria-current="page" title={currentLabel} className="min-w-0 truncate font-semibold text-[#101828]">
          {currentLabel}
        </li>
      </ol>
    </nav>
  )
}
