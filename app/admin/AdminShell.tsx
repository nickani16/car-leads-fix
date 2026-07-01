'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  Building2,
  ChevronRight,
  CircleHelp,
  Flag,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  Settings,
  ShieldCheck,
  UserRound,
  UsersRound,
} from 'lucide-react'
import AccountLogoutButton from '../konto/AccountLogoutButton'

const navigation = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Användare', href: '/admin/users', icon: UsersRound },
  { label: 'Företag', href: '/admin/companies', icon: Building2 },
  { label: 'Privatpersoner', href: '/admin/private', icon: UserRound },
  { label: 'Annonser', href: '/admin/listings', icon: ListChecks },
  { label: 'Rapporter', href: '/admin/reports', icon: Flag },
  { label: 'Support', href: '/admin/support', icon: LifeBuoy },
  { label: 'Statistik', href: '/admin/stats', icon: BarChart3 },
  { label: 'Inställningar', href: '/admin/settings', icon: Settings },
  { label: 'Personal', href: '/admin/access', icon: ShieldCheck },
] as const

function isActive(pathname: string, href: string) {
  if (href === '/admin') return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
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
  const active = navigation.find((item) => isActive(pathname, item.href))

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#101828]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] border-r border-[#dce3ee] bg-[#0f172a] text-white lg:block">
        <div className="flex h-full flex-col">
          <Link href="/admin" className="flex min-h-[76px] items-center gap-3 border-b border-white/10 px-6">
            <span className="grid h-10 w-10 place-items-center rounded-[12px] bg-[#0866ff] text-xl font-black">
              a
            </span>
            <span>
              <span className="block text-lg font-black tracking-tight">Autorell</span>
              <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Admin control
              </span>
            </span>
          </Link>

          <nav className="flex-1 overflow-y-auto px-3 py-5">
            {navigation.map(({ label, href, icon: Icon }) => {
              const activeItem = isActive(pathname, href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={`mb-1 flex min-h-11 items-center justify-between rounded-[10px] px-3 text-sm font-semibold transition ${
                    activeItem
                      ? 'bg-white text-[#0f172a]'
                      : 'text-slate-300 hover:bg-white/[0.08] hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {label}
                  </span>
                  {activeItem ? <ChevronRight className="h-4 w-4" /> : null}
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-white/10 p-4">
            <div className="rounded-[12px] bg-white/8 p-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                <ShieldCheck className="h-4 w-4" />
                Admin session
              </div>
              <p className="mt-2 truncate text-xs text-slate-300">{email}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-slate-500">
                {role.replaceAll('_', ' ')}
              </p>
            </div>
            <div className="mt-3">
              <AccountLogoutButton />
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-30 border-b border-[#dce3ee] bg-white/95 backdrop-blur">
          <div className="flex min-h-[68px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#667085]">
                Internt kontrollcenter
              </p>
              <h1 className="mt-1 text-lg font-bold text-[#101828]">
                {active?.label || 'Admin'}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/support"
                className="hidden min-h-10 items-center gap-2 rounded-[10px] border border-[#d7deea] bg-white px-3 text-sm font-semibold text-[#344054] md:inline-flex"
              >
                <CircleHelp className="h-4 w-4" />
                Support
              </Link>
              <span className="hidden max-w-[220px] truncate text-xs text-[#667085] md:block">
                {email}
              </span>
            </div>
          </div>
          <nav className="flex gap-2 overflow-x-auto border-t border-[#edf1f6] px-4 py-2 lg:hidden">
            {navigation.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`inline-flex shrink-0 items-center gap-2 rounded-[10px] px-3 py-2 text-xs font-bold ${
                  isActive(pathname, href)
                    ? 'bg-[#0866ff] text-white'
                    : 'bg-[#eef3fb] text-[#344054]'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </header>
        {children}
      </div>
    </div>
  )
}
