import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

type BreadcrumbItem = {
  label: string
  href?: string
}

export default function PublicBreadcrumbs({
  items,
  className = '',
}: {
  items: BreadcrumbItem[]
  className?: string
}) {
  return (
    <nav
      aria-label="Brödsmulor"
      className={`flex min-w-0 items-center gap-2 text-xs text-[#667780] ${className}`}
    >
      <Link
        href="/"
        aria-label="Till startsidan"
        className="group inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/80 bg-white/70 shadow-[0_8px_24px_rgba(32,33,36,.05)] backdrop-blur transition hover:border-[#b9d6e5] hover:bg-white"
      >
        <Home className="h-3.5 w-3.5 transition group-hover:text-[#202124]" />
      </Link>

      {items.map((item, index) => {
        const current = index === items.length - 1

        return (
          <span key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-2">
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#9aa6ac]" />
            {item.href && !current ? (
              <Link
                href={item.href}
                className="truncate rounded-full px-2 py-1.5 transition hover:bg-white/70 hover:text-[#202124]"
              >
                {item.label}
              </Link>
            ) : (
              <span
                aria-current={current ? 'page' : undefined}
                className="truncate rounded-full border border-[#cbdce4] bg-white/65 px-3 py-1.5 font-medium text-[#314852] backdrop-blur"
              >
                {item.label}
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
