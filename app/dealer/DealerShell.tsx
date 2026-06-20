'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  Building2,
  CarFront,
  ChevronDown,
  FileText,
  Gavel,
  HelpCircle,
  Menu,
  PlusCircle,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import LogoutButton from './LogoutButton'
import BrandLogo from '../components/BrandLogo'

type DealerInfo = {
  company_name: string | null
  contact_person: string | null
  email: string
  country: string | null
}

const navigation = [
  {
    href: '/dealer',
    label: 'Auctions & private-seller bids',
    description: 'Bid on vehicles submitted by private sellers and offered by Autorell.',
    icon: Gavel,
  },
  {
    href: '/dealer/sell',
    label: 'Sell business vehicles to Autorell',
    description: 'Submit dealer stock, fleet vehicles and leasing returns.',
    icon: PlusCircle,
  },
  {
    href: '/dealer/sales',
    label: 'Your supplied vehicles',
    description: 'Follow vehicles your company has submitted to Autorell.',
    icon: CarFront,
  },
  {
    href: '/dealer/analytics',
    label: 'Buyer activity & analytics',
    description: 'Review bids, demand signals and marketplace activity.',
    icon: BarChart3,
  },
  { href: '/dealer/support', label: 'Support', description: 'Get help from the Autorell team.', icon: HelpCircle },
  { href: '/dealer/profile', label: 'Company profile', description: 'Manage company and delivery information.', icon: Building2 },
  { href: '/dealer/legal', label: 'Terms & legal', description: 'Review bidding, fees and transaction rules.', icon: FileText },
]

const navigationGroups = [
  {
    label: 'Buy vehicles',
    description: 'Autorell auctions vehicles across Europe through our verified buyer network.',
    items: [navigation[0], navigation[3]],
  },
  {
    label: 'Sell to Autorell',
    description: 'Sell company-owned vehicles through Autorell’s European dealer network.',
    items: [navigation[1], navigation[2]],
  },
  {
    label: 'Account',
    description: 'Company settings, support and transaction terms.',
    items: [navigation[5], navigation[4], navigation[6]],
  },
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
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const desktopNavRef = useRef<HTMLElement>(null)

  useEffect(() => {
    function closeDesktopMenu(event: PointerEvent) {
      if (
        desktopNavRef.current &&
        !desktopNavRef.current.contains(event.target as Node)
      ) {
        setOpenGroup(null)
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpenGroup(null)
    }

    document.addEventListener('pointerdown', closeDesktopMenu)
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeDesktopMenu)
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  return (
    <div className="dealer-portal min-h-screen bg-[#f5f4f0] text-[#202124]">
      <div className="h-2 bg-[#B4D9EF]" />
      <header className="sticky top-0 z-40 border-b border-[#deddd7] bg-white/95 shadow-[0_8px_30px_rgba(32,33,36,.05)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-5 px-5 py-3.5 sm:px-8 lg:px-12">
          <div className="flex items-center gap-8">
            <Link href="/dealer" aria-label="Autorell Dealer Portal">
              <BrandLogo />
            </Link>

            <nav ref={desktopNavRef} className="hidden items-center gap-2 lg:flex">
              {navigationGroups.map((group) => {
                const groupActive = group.items.some((item) =>
                  item.href === '/dealer'
                    ? pathname === '/dealer'
                    : pathname.startsWith(item.href)
                )
                const isOpen = openGroup === group.label
                return (
                  <div key={group.label} className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenGroup((current) =>
                          current === group.label ? null : group.label
                        )
                      }
                      aria-expanded={isOpen}
                      className={`flex cursor-pointer list-none items-center gap-2 rounded-full px-4 py-2.5 text-sm transition [&::-webkit-details-marker]:hidden ${
                        groupActive
                          ? 'bg-[#B4D9EF] text-[#242424]'
                          : 'text-[#62686c] hover:bg-[#f3f2ee] hover:text-[#202124]'
                      }`}
                    >
                      {group.label}
                      <ChevronDown
                        size={15}
                        className={`transition ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {isOpen && (
                    <div className="absolute left-0 top-full z-50 w-[340px] pt-3">
                      <div className="rounded-[18px] border border-[#deddd7] bg-white p-3 shadow-[0_24px_65px_rgba(32,33,36,.16)]">
                        <div className="mb-2 rounded-[13px] bg-[#eef7fb] px-4 py-3">
                          <p className="text-xs font-semibold text-[#315f74]">
                            {group.label}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-[#647780]">
                            {group.description}
                          </p>
                        </div>
                        {group.items.map((item) => {
                          const Icon = item.icon
                          const active =
                            item.href === '/dealer'
                              ? pathname === '/dealer'
                              : pathname.startsWith(item.href)
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setOpenGroup(null)}
                              className={`flex items-start gap-3 rounded-[12px] px-4 py-3 text-sm ${
                                active
                                  ? 'bg-[#eef7fb] text-[#202124]'
                                  : 'text-[#62686c] hover:bg-[#f5f4f0]'
                              }`}
                            >
                              <Icon size={17} className="mt-0.5 shrink-0" />
                              <span>
                                <strong className="block font-medium text-[#202124]">
                                  {item.label}
                                </strong>
                                <span className="mt-1 block text-xs leading-5 text-[#7a858a]">
                                  {item.description}
                                </span>
                              </span>
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                    )}
                  </div>
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
          <div className="max-h-[calc(100dvh-82px)] overflow-y-auto overscroll-contain border-t border-[#e5e3dd] bg-white px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden">
            <nav className="mx-auto grid max-w-[1440px] gap-4">
              {navigationGroups.map((group) => (
                <section key={group.label}>
                  <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#78909a]">
                    {group.label}
                  </p>
                  <p className="px-3 pb-2 pt-1 text-xs leading-5 text-[#7a858a]">
                    {group.description}
                  </p>
                  <div className="grid gap-1">
                    {group.items.map((item) => {
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
                          className={`flex items-start gap-3 rounded-[15px] px-4 py-3 text-sm ${
                            active
                              ? 'bg-[#B4D9EF] text-[#242424]'
                              : 'text-[#62686c] hover:bg-[#f3f2ee]'
                          }`}
                        >
                          <Icon size={17} className="mt-0.5 shrink-0" />
                          <span>
                            <strong className="block font-medium text-[#202124]">
                              {item.label}
                            </strong>
                            <span className="mt-1 block text-xs leading-5 text-[#718087]">
                              {item.description}
                            </span>
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                </section>
              ))}
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
