'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  ChevronDown,
  FileCheck2,
  FileText,
  Gavel,
  LayoutDashboard,
  LineChart,
  ListChecks,
  Network,
  ShieldCheck,
  Store,
  UsersRound,
  UserRound,
} from 'lucide-react'
import BrandLogo from '../components/BrandLogo'
import LogoutButton from '../dealer/LogoutButton'

const mobileNavigation = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  {
    label: 'Review',
    href: '/admin/leads?status=Pending%20review',
    icon: ListChecks,
  },
  { label: 'Private bids', href: '/admin/leads?type=private_bid', icon: FileText },
  { label: 'Dealer market', href: '/admin/leads?type=dealer_marketplace', icon: Store },
  { label: 'Auctions', href: '/admin/auctions', icon: Gavel },
  { label: 'Dealers', href: '/admin/dealers', icon: Store },
  { label: 'Access', href: '/admin/access', icon: UsersRound },
  { label: 'Deals', href: '/admin/deals', icon: BarChart3 },
  { label: 'Conversions', href: '/admin/conversions', icon: LineChart },
  { label: 'Contracts', href: '/admin/contracts', icon: FileCheck2 },
]

const menuGroups = [
  {
    label: 'Marketplace',
    description: 'Vehicle intake, review and live auctions.',
    icon: Gavel,
    paths: ['/admin/leads', '/admin/auctions'],
    items: [
      {
        label: 'Review queue',
        text: 'Approve vehicle data before publication.',
        href: '/admin/leads?status=Pending%20review',
        icon: ListChecks,
      },
      {
        label: 'Private seller bids',
        text: 'Review vehicles submitted through the private seller form.',
        href: '/admin/leads?type=private_bid',
        icon: FileText,
      },
      {
        label: 'Dealer marketplace',
        text: 'Review inventory listed by approved dealers.',
        href: '/admin/leads?type=dealer_marketplace',
        icon: Store,
      },
      {
        label: 'Auctions',
        text: 'Monitor active bidding and closed outcomes.',
        href: '/admin/auctions',
        icon: Gavel,
      },
    ],
  },
  {
    label: 'Network',
    description: 'Dealer access and market performance.',
    icon: Network,
    paths: ['/admin/dealers', '/admin/conversions', '/admin/access'],
    items: [
      {
        label: 'Dealers',
        text: 'Review applicants and approved companies.',
        href: '/admin/dealers',
        icon: Store,
      },
      {
        label: 'Conversions',
        text: 'Compare applications, bids and contacts by country.',
        href: '/admin/conversions',
        icon: LineChart,
      },
      {
        label: 'Access control',
        text: 'Create staff accounts and review admin activity.',
        href: '/admin/access',
        icon: UsersRound,
      },
    ],
  },
  {
    label: 'Transactions',
    description: 'Winning bids, deals and agreements.',
    icon: FileCheck2,
    paths: ['/admin/deals', '/admin/contracts'],
    align: 'right',
    items: [
      {
        label: 'Deals',
        text: 'Follow accepted bids, deadlines and ownership.',
        href: '/admin/deals',
        icon: BarChart3,
      },
      {
        label: 'Contracts',
        text: 'Prepare, send and track signed agreements.',
        href: '/admin/contracts',
        icon: FileCheck2,
      },
    ],
  },
] as const

function isActive(pathname: string, href: string) {
  if (href === '/admin') return pathname === '/admin'
  if (href.includes('?')) return false
  return pathname.startsWith(href)
}

function initials(email: string) {
  return email.slice(0, 2).toUpperCase()
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
        <div className="mx-auto flex min-h-[82px] max-w-[1440px] items-center justify-between gap-5 px-5 sm:px-8 lg:px-12">
          <Link
            href="/admin"
            aria-label="Autorell Admin"
            className="flex shrink-0 items-center gap-4"
          >
            <BrandLogo />
            <span className="hidden h-7 w-px bg-[#deddd7] sm:block" />
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-[#718087] sm:block">
              Admin
            </span>
          </Link>

          <nav
            aria-label="Admin navigation"
            className="hidden items-center gap-1 lg:flex"
          >
            <Link
              href="/admin"
              aria-current={pathname === '/admin' ? 'page' : undefined}
              className={`flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-medium transition ${
                pathname === '/admin'
                  ? 'bg-[#dceef7] text-[#244a5d]'
                  : 'text-[#626b70] hover:bg-[#f4f3ef] hover:text-[#202124]'
              }`}
            >
              <LayoutDashboard size={16} />
              Overview
            </Link>

            {menuGroups.map((group) => {
              const GroupIcon = group.icon
              const active = group.paths.some((path) =>
                pathname.startsWith(path),
              )

              return (
                <div key={group.label} className="group relative">
                  <button
                    type="button"
                    aria-haspopup="menu"
                    className={`flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-medium transition ${
                      active
                        ? 'bg-[#dceef7] text-[#244a5d]'
                        : 'text-[#626b70] hover:bg-[#f4f3ef] hover:text-[#202124]'
                    }`}
                  >
                    <GroupIcon size={16} />
                    {group.label}
                    <ChevronDown className="h-3.5 w-3.5 transition duration-200 group-hover:rotate-180 group-focus-within:rotate-180" />
                  </button>

                  <div
                    className={`pointer-events-none absolute top-full w-[390px] translate-y-2 pt-4 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100 ${
                      'align' in group && group.align === 'right'
                        ? 'right-0'
                        : 'left-1/2 -translate-x-1/2 group-hover:-translate-x-1/2 group-focus-within:-translate-x-1/2'
                    }`}
                  >
                    <section
                      role="menu"
                      className="overflow-hidden rounded-[22px] border border-[#d9d8d2] bg-white shadow-[0_26px_80px_rgba(32,33,36,.18)]"
                    >
                      <div className="border-b border-[#e5e3dd] bg-[linear-gradient(145deg,#f8f6f0,#eaf5fa)] p-5">
                        <span className="grid h-10 w-10 place-items-center rounded-[12px] bg-white text-[#315f74] shadow-[0_8px_22px_rgba(49,95,116,.1)]">
                          <GroupIcon size={18} />
                        </span>
                        <h2 className="mt-4 text-lg font-semibold tracking-[-0.025em]">
                          {group.label}
                        </h2>
                        <p className="mt-1 text-xs leading-5 text-[#66757b]">
                          {group.description}
                        </p>
                      </div>
                      <div className="grid gap-1 p-2">
                        {group.items.map((item) => {
                          const ItemIcon = item.icon
                          const itemActive = isActive(pathname, item.href)
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              role="menuitem"
                              className={`group/item flex items-start gap-4 rounded-[16px] p-4 transition ${
                                itemActive
                                  ? 'bg-[#eaf5fa]'
                                  : 'hover:bg-[#f6f5f1]'
                              }`}
                            >
                              <span
                                className={`grid h-10 w-10 shrink-0 place-items-center rounded-[12px] ${
                                  itemActive
                                    ? 'bg-white text-[#315f74]'
                                    : 'bg-[#eff1ef] text-[#68757a]'
                                }`}
                              >
                                <ItemIcon size={17} />
                              </span>
                              <span className="min-w-0 flex-1">
                                <strong className="block text-sm font-semibold">
                                  {item.label}
                                </strong>
                                <span className="mt-1 block text-xs leading-5 text-[#737d81]">
                                  {item.text}
                                </span>
                              </span>
                              <span className="mt-1 text-[#829096] transition group-hover/item:translate-x-0.5">
                                →
                              </span>
                            </Link>
                          )
                        })}
                      </div>
                    </section>
                  </div>
                </div>
              )
            })}
          </nav>

          <div className="group relative shrink-0">
            <button
              type="button"
              aria-haspopup="menu"
              className="flex min-h-11 items-center gap-3 rounded-full border border-[#dddcd6] bg-white py-1.5 pl-1.5 pr-3 transition hover:border-[#a9c8d7] hover:bg-[#f7fbfd]"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#dceef7] text-[11px] font-semibold text-[#315f74]">
                {initials(email)}
              </span>
              <span className="hidden max-w-40 truncate text-sm font-medium xl:block">
                {email}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-[#718087] transition duration-200 group-hover:rotate-180 group-focus-within:rotate-180" />
            </button>

            <div className="pointer-events-none absolute right-0 top-full w-[320px] translate-y-2 pt-4 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
              <section
                role="menu"
                className="overflow-hidden rounded-[20px] border border-[#d9d8d2] bg-white p-2 shadow-[0_24px_70px_rgba(32,33,36,.18)]"
              >
                <div className="rounded-[15px] bg-[#f5f4f0] p-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#dceef7] text-sm font-semibold text-[#315f74]">
                      {initials(email)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{email}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                        <ShieldCheck size={13} />
                        {role.replaceAll('_', ' ')}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-1 flex items-center gap-3 rounded-[15px] px-4 py-3 text-sm text-[#657177]">
                  <UserRound size={16} />
                  Secure admin session
                </div>
                <div className="border-t border-[#e7e5df] p-2">
                  <LogoutButton />
                </div>
              </section>
            </div>
          </div>
        </div>

        <nav
          aria-label="Admin mobile navigation"
          className="flex gap-2 overflow-x-auto border-t border-[#ebe9e3] px-4 py-2.5 [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden"
        >
          {mobileNavigation.map((item) => {
            const Icon = item.icon
            const active = isActive(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-10 shrink-0 items-center gap-2 rounded-full px-3.5 text-xs font-medium ${
                  active
                    ? 'bg-[#dceef7] text-[#244a5d]'
                    : 'bg-[#f5f4f0] text-[#626b70]'
                }`}
              >
                <Icon size={14} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </header>

      {children}
    </div>
  )
}
