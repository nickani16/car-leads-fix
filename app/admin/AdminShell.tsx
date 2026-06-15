'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  FileCheck2,
  FileText,
  Gavel,
  ListChecks,
  LayoutDashboard,
  LineChart,
  ShieldCheck,
  Store,
} from 'lucide-react'
import BrandLogo from '../components/BrandLogo'
import LogoutButton from '../dealer/LogoutButton'

const navigation = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  {
    label: 'Review queue',
    href: '/admin/leads?status=Pending%20review',
    icon: ListChecks,
  },
  { label: 'Leads', href: '/admin/leads', icon: FileText },
  { label: 'Auctions', href: '/admin/auctions', icon: Gavel },
  { label: 'Dealers', href: '/admin/dealers', icon: Store },
  { label: 'Deals', href: '/admin/deals', icon: BarChart3 },
  { label: 'Conversions', href: '/admin/conversions', icon: LineChart },
  { label: 'Contracts', href: '/admin/contracts', icon: FileCheck2 },
]

function isActive(pathname: string, href: string) {
  if (href === '/admin') return pathname === '/admin'
  if (href.startsWith('/admin/leads?')) return false
  return pathname.startsWith(href)
}

export default function AdminShell({
  role,
  email,
  children,
}: {
  role: string
  email: string
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#f5f4f0] text-[#202124]">
      <div className="h-1.5 bg-[#B4D9EF]" />
      <header className="sticky top-0 z-40 border-b border-[#dcdad4] bg-white/95 shadow-[0_12px_35px_rgba(32,33,36,.06)] backdrop-blur-xl">
        <div className="border-b border-[#ebe9e3]">
          <div className="mx-auto flex min-h-[76px] max-w-[1440px] items-center justify-between gap-5 px-5 sm:px-8 lg:px-12">
            <Link
              href="/admin"
              aria-label="Autorell Admin"
              className="flex min-w-0 items-center gap-4"
            >
              <BrandLogo />
              <span className="hidden h-7 w-px bg-[#deddd7] sm:block" />
              <span className="hidden rounded-full bg-[#eef7fb] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.17em] text-[#527485] sm:inline-flex">
                Admin workspace
              </span>
            </Link>

            <div className="flex min-w-0 items-center gap-3">
              <div className="hidden min-w-0 text-right sm:block">
                <p className="max-w-52 truncate text-sm font-medium text-[#202124] lg:max-w-72">
                  {email}
                </p>
                <p className="mt-0.5 flex items-center justify-end gap-1.5 text-[11px] font-medium text-emerald-700">
                  <ShieldCheck size={13} />
                  {role.replaceAll('_', ' ')}
                </p>
              </div>
              <span className="hidden h-9 w-px bg-[#deddd7] sm:block" />
              <LogoutButton compact />
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1440px] px-3 sm:px-6 lg:px-10">
          <nav
            aria-label="Admin navigation"
            className="flex gap-1 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {navigation.map((item) => {
              const Icon = item.icon
              const active = isActive(pathname, item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`group relative flex min-h-12 shrink-0 items-center gap-2.5 rounded-[14px] px-3.5 text-sm font-medium transition sm:px-4 ${
                    active
                      ? 'bg-[#dceef7] text-[#203f4e]'
                      : 'text-[#626b70] hover:bg-[#f4f3ef] hover:text-[#202124]'
                  }`}
                >
                  <span
                    className={`grid h-7 w-7 place-items-center rounded-[9px] transition ${
                      active
                        ? 'bg-white text-[#315f74] shadow-[0_4px_12px_rgba(49,95,116,.12)]'
                        : 'bg-[#f2f1ed] text-[#6b7377] group-hover:bg-white'
                    }`}
                  >
                    <Icon size={15} strokeWidth={1.9} />
                  </span>
                  {item.label}
                  {active && (
                    <span className="absolute inset-x-4 -bottom-2 h-0.5 rounded-full bg-[#5b94af]" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      {children}
    </div>
  )
}
