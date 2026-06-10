import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

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
      className={`inline-flex min-w-0 max-w-full self-start items-center rounded-full border border-white/80 bg-white/68 px-2 py-1.5 text-[11px] text-[#667780] shadow-[0_10px_30px_rgba(32,33,36,.055)] backdrop-blur-xl ${className}`}
    >
      <Link
        href="/"
        className="shrink-0 rounded-full px-3 py-1.5 font-medium text-[#52636b] transition hover:bg-white hover:text-[#202124]"
      >
        Autorell
      </Link>

      {items.map((item, index) => {
        const current = index === items.length - 1

        return (
          <span key={`${item.label}-${index}`} className="flex min-w-0 items-center">
            <ChevronRight className="h-3 w-3 shrink-0 text-[#a1adb2]" />
            {item.href && !current ? (
              <Link
                href={item.href}
                className="truncate rounded-full px-3 py-1.5 transition hover:bg-white hover:text-[#202124]"
              >
                {item.label}
              </Link>
            ) : (
              <span
                aria-current={current ? 'page' : undefined}
                className="truncate rounded-full bg-[#eaf4f8] px-3 py-1.5 font-medium text-[#314852]"
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
