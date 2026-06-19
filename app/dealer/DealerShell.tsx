'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  Building2,
  CarFront,
  FileText,
  Gavel,
  HelpCircle,
  Menu,
  PlusCircle,
  X,
} from 'lucide-react'
import { useState } from 'react'
import LogoutButton from './LogoutButton'
import BrandLogo from '../components/BrandLogo'

type DealerInfo = {
  company_name: string | null
  contact_person: string | null
  email: string
  country: string | null
}

const navigation = [
  { href: '/dealer', label: 'Autorell stock', icon: Gavel },
  { href: '/dealer/sell', label: 'Offer stock', icon: PlusCircle },
  { href: '/dealer/sales', label: 'Stock supplied', icon: CarFront },
  { href: '/dealer/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dealer/support', label: 'Support', icon: HelpCircle },
  { href: '/dealer/profile', label: 'Profile', icon: Building2 },
  { href: '/dealer/legal', label: 'Legal', icon: FileText },
]

export default function DealerShell({
  dealer,
  children,
}: {
  dealer: DealerInfo
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="dealer-portal min-h-screen bg-[#f5f4f0] text-[#202124]">
      <div className="h-2 bg-[#B4D9EF]" />
      <header className="sticky top-0 z-40 border-b border-[#deddd7] bg-white/95 shadow-[0_8px_30px_rgba(32,33,36,.05)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-5 px-5 py-3.5 sm:px-8 lg:px-12">
          <div className="flex items-center gap-8">
            <Link href="/dealer" aria-label="Autorell Dealer Portal">
              <BrandLogo />
            </Link>

            <nav className="hidden items-center gap-1.5 lg:flex">
              {navigation.map((item) => {
                const Icon = item.icon
                const active =
                  item.href === '/dealer'
                    ? pathname === '/dealer'
                    : pathname.startsWith(item.href)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-normal transition ${
                      active
                        ? 'bg-[#B4D9EF] text-[#242424]'
                        : 'text-[#62686c] hover:bg-[#f3f2ee] hover:text-[#202124]'
                    }`}
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <div className="hidden text-right xl:block">
              <p className="max-w-48 truncate text-sm font-medium text-[#202124]">
                {dealer.contact_person || dealer.company_name || dealer.email}
              </p>
              <p className="text-xs text-[#858a8c]">
                {dealer.company_name || dealer.country || 'European dealer'}
              </p>
            </div>
            <LogoutButton />
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="grid h-11 w-11 place-items-center rounded-full border border-[#deddd7] bg-[#f7f6f2] text-[#242424] lg:hidden"
            aria-label="Toggle dealer navigation"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-[#e5e3dd] bg-white px-5 py-4 lg:hidden">
            <nav className="mx-auto grid max-w-[1440px] gap-2">
              {navigation.map((item) => {
                const Icon = item.icon
                const active =
                  item.href === '/dealer'
                    ? pathname === '/dealer'
                    : pathname.startsWith(item.href)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-full px-4 py-3 text-sm font-normal ${
                      active
                        ? 'bg-[#B4D9EF] text-[#242424]'
                        : 'text-[#62686c] hover:bg-[#f3f2ee]'
                    }`}
                  >
                    <Icon size={17} />
                    {item.label}
                  </Link>
                )
              })}
              <div className="mt-2 border-t border-[#e5e3dd] pt-4 sm:hidden">
                <p className="mb-3 truncate text-sm text-[#62686c]">
                  {dealer.contact_person || dealer.company_name || dealer.email}
                </p>
                <LogoutButton />
              </div>
            </nav>
          </div>
        )}
      </header>

      {children}

      <footer className="border-t border-[#deddd7] bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-5 py-8 text-xs text-[#6b7073] sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12">
          <div>
            <p className="font-medium text-[#242424]">
              © {new Date().getFullYear()} Autorell AB
            </p>
            <p className="mt-1">
              European export inventory sold by Autorell · All transaction
              amounts are settled in EUR.
            </p>
          </div>
          <nav
            aria-label="Dealer legal information"
            className="flex flex-wrap gap-x-5 gap-y-3"
          >
            <Link href="/dealer/legal#dealer-terms">Dealer terms</Link>
            <Link href="/dealer/legal#binding-bids">Binding bid rules</Link>
            <Link href="/dealer/legal#fees">Fees</Link>
            <Link href="/dealer/legal#privacy">Privacy</Link>
            <Link href="/dealer/legal#cookies">Cookies</Link>
            <Link href="/dealer/legal#complaints">Complaints</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
