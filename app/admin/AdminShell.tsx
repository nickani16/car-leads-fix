'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  BellRing,
  BookOpenText,
  Boxes,
  Building2,
  CarFront,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  FileClock,
  FileText,
  Flag,
  Gauge,
  Globe2,
  ImageIcon,
  Languages,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  LockKeyhole,
  Mail,
  Menu,
  PackageCheck,
  Settings,
  ShieldAlert,
  ShieldCheck,
  UsersRound,
  X,
  type LucideIcon,
} from 'lucide-react'
import BrandLogo from '@/app/components/BrandLogo'
import AccountLogoutButton from '../konto/AccountLogoutButton'
import { navigationForPermissions } from '@/lib/admin/navigation'
import { ADMIN_ROLE_LABELS, type AdminRole } from '@/lib/admin/permissions'

const ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  users: UsersRound,
  companies: Building2,
  verification: ClipboardCheck,
  listings: ListChecks,
  moderation: ClipboardCheck,
  reports: Flag,
  support: LifeBuoy,
  payments: CircleDollarSign,
  subscriptions: PackageCheck,
  content: BookOpenText,
  newsletter: Mail,
  media: ImageIcon,
  markets: Globe2,
  vehicle: CarFront,
  security: ShieldAlert,
  analytics: BarChart3,
  system: Gauge,
  audit: FileClock,
  settings: Settings,
  administrators: ShieldCheck,
  notifications: BellRing,
  languages: Languages,
  packages: Boxes,
  documents: FileText,
}

function isActive(pathname: string, href: string) {
  if (href === '/admin') return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function AdminShell({
  roles,
  permissions,
  email,
  assuranceLevel,
  accessSource,
  children,
}: {
  roles: AdminRole[]
  permissions: string[]
  email: string
  assuranceLevel: string | null
  accessSource: 'rbac' | 'legacy'
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigation = navigationForPermissions(permissions)
  const active = navigation
    .flatMap((group) => group.items)
    .find((item) => isActive(pathname, item.href))

  const primaryRole = roles[0]
  const mfaReady = assuranceLevel === 'aal2'

  function navigationContent(isCompact = false) {
    return (
      <>
        <div className={`flex min-h-[78px] items-center border-b border-white/10 ${isCompact ? 'justify-center px-3' : 'px-5'}`}>
          <Link
            href="/admin"
            aria-label="Autorell admin"
            className={`inline-flex items-center rounded-xl bg-white ${isCompact ? 'p-2' : 'px-3 py-2.5'}`}
          >
            <BrandLogo compact underline={false} />
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto overscroll-contain px-3 py-4" aria-label="Adminnavigation">
          {navigation.map((group) => (
            <div key={group.label} className="mb-5 last:mb-0">
              {!isCompact ? (
                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  {group.label}
                </p>
              ) : null}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = ICONS[item.icon] || LayoutDashboard
                  const activeItem = item.available && isActive(pathname, item.href)
                  const className = `group flex min-h-11 w-full items-center rounded-xl text-sm font-semibold transition ${
                    isCompact ? 'justify-center px-2' : 'justify-between gap-3 px-3'
                  } ${
                    activeItem
                      ? 'bg-white text-slate-950 shadow-sm'
                      : item.available
                        ? 'text-slate-300 hover:bg-white/8 hover:text-white'
                        : 'cursor-not-allowed text-slate-600'
                  }`

                  const content = (
                    <>
                      <span className={`flex min-w-0 items-center ${isCompact ? '' : 'gap-3'}`}>
                        <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                        {!isCompact ? <span className="truncate">{item.label}</span> : null}
                      </span>
                      {!isCompact && item.badge ? (
                        <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">
                          {item.badge}
                        </span>
                      ) : null}
                      {!isCompact && activeItem ? <ChevronRight className="h-4 w-4 shrink-0" /> : null}
                    </>
                  )

                  return item.available ? (
                    <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={className} title={isCompact ? item.label : undefined}>
                      {content}
                    </Link>
                  ) : (
                    <div key={item.href} className={className} title={`${item.label} – ${item.badge || 'planerad'}`}>
                      {content}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          {!isCompact ? (
            <div className="mb-3 rounded-xl border border-white/10 bg-white/[0.05] p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-xs font-bold text-white">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  {ADMIN_ROLE_LABELS[primaryRole]}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${mfaReady ? 'bg-emerald-400/15 text-emerald-300' : 'bg-amber-400/15 text-amber-300'}`}>
                  {mfaReady ? 'MFA' : 'AAL1'}
                </span>
              </div>
              <p className="mt-2 truncate text-xs text-slate-400">{email}</p>
              {primaryRole === 'super_admin' ? (
                <span className="mt-2 inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-amber-200">
                  God Mode
                </span>
              ) : null}
              <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-slate-600">
                {accessSource === 'rbac' ? 'RBAC aktiv' : 'Legacy-åtkomst'}
              </p>
            </div>
          ) : (
            <div className="mb-3 grid place-items-center" title={ADMIN_ROLE_LABELS[primaryRole]}>
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            </div>
          )}
          <div className={isCompact ? 'flex justify-center' : ''}>
            <AccountLogoutButton homeHref="/se" label={isCompact ? '' : 'Logga ut'} />
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-[#101828]">
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden border-r border-slate-800 bg-[#0b1220] text-white transition-[width] duration-200 lg:flex lg:flex-col ${collapsed ? 'w-[88px]' : 'w-[280px]'}`}
      >
        {navigationContent(collapsed)}
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="absolute -right-3 top-[92px] grid h-7 w-7 place-items-center rounded-full border border-[#d8e0eb] bg-white text-slate-600 shadow-sm hover:text-[#0866ff]"
          aria-label={collapsed ? 'Fäll ut navigation' : 'Fäll ihop navigation'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-label="Stäng meny"
          />
          <aside
            className="absolute inset-y-0 left-0 flex w-[min(90vw,360px)] flex-col bg-[#0b1220] text-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Adminmeny"
          >
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-4 top-5 z-10 grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white"
              aria-label="Stäng meny"
            >
              <X className="h-5 w-5" />
            </button>
            {navigationContent(false)}
          </aside>
        </div>
      ) : null}

      <div className={`transition-[padding] duration-200 ${collapsed ? 'lg:pl-[88px]' : 'lg:pl-[280px]'}`}>
        <header className="sticky top-0 z-30 border-b border-[#dce3ee] bg-white/95 backdrop-blur-xl">
          <div className="flex min-h-[68px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[#d8e0eb] bg-white text-slate-700 lg:hidden"
                aria-label="Öppna adminmeny"
                aria-expanded={mobileOpen}
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#667085]">
                  Autorell kontrollcenter
                </p>
                <h1 className="mt-0.5 truncate text-base font-bold text-[#101828] sm:text-lg">
                  {active?.label || 'Admin'}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {primaryRole === 'super_admin' ? (
                <span className="hidden rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-amber-800 sm:inline-flex">
                  God Mode
                </span>
              ) : null}
              {!mfaReady ? (
                <span className="hidden items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 sm:flex">
                  <LockKeyhole className="h-4 w-4" />
                  MFA behöver aktiveras
                </span>
              ) : null}
              {permissions.includes('dashboard.view') ? (
                <Link href="/admin/notifications" className="grid h-11 w-11 place-items-center rounded-xl border border-[#d8e0eb] text-[#475467] hover:border-[#0866ff] hover:text-[#0866ff]" aria-label="Öppna notiscenter">
                  <BellRing className="h-[18px] w-[18px]" />
                </Link>
              ) : null}
            </div>
          </div>
        </header>
        {children}
      </div>
    </div>
  )
}
