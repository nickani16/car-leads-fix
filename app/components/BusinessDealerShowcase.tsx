'use client'

import { useEffect, useState } from 'react'
import {
  ArrowUpRight,
  BarChart3,
  CarFront,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Gavel,
  Globe2,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'

const scenes = [
  {
    label: 'Fordonsöversikt',
    title: 'Ett samlat lager för hela portföljen',
    description:
      'Se status, marknadstest och nästa steg för varje fordon i ett gemensamt arbetsflöde.',
  },
  {
    label: 'EU-marknadstest',
    title: 'Efterfrågan blir synlig i realtid',
    description:
      'Verifierade handlare lämnar prissignaler medan säljaridentitet och känsliga uppgifter skyddas.',
  },
  {
    label: 'Portföljanalys',
    title: 'Följ volym, räckvidd och utfall',
    description:
      'Se vilka fordonsgrupper som fungerar bäst och var köparintresset finns.',
  },
] as const

const ROTATION_MS = 5600

export default function BusinessDealerShowcase() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      return
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % scenes.length),
      ROTATION_MS
    )
    return () => window.clearInterval(timer)
  }, [paused])

  function move(direction: -1 | 1) {
    setActive(
      (current) => (current + direction + scenes.length) % scenes.length
    )
  }

  return (
    <div
      className="relative min-w-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="absolute -inset-6 rounded-[44px] bg-white/55 blur-3xl" />
      <div className="relative overflow-hidden rounded-[28px] border border-white/90 bg-[#1f2529] shadow-[0_38px_100px_rgba(35,52,61,.3)]">
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-4 text-white sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex gap-1.5" aria-hidden="true">
              <i className="h-2 w-2 rounded-full bg-[#ef8b7e]" />
              <i className="h-2 w-2 rounded-full bg-[#e8cc78]" />
              <i className="h-2 w-2 rounded-full bg-[#7fc195]" />
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/45">
              Autorell dealer workspace
            </span>
          </div>
          <span className="flex items-center gap-2 rounded-full bg-white/[.07] px-3 py-1.5 text-[10px] text-[#a9dfbb]">
            <span className="home-live-dot h-2 w-2 rounded-full bg-[#76bb91]" />
            Live demo
          </span>
        </header>

        <div className="relative min-h-[430px] overflow-hidden bg-[#edf1f2] p-3 sm:p-5">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#b4d9ef]/55 blur-3xl" />
          <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-white blur-3xl" />

          <div
            key={active}
            className="relative animate-[home-signal-card_.6s_ease-out_both]"
          >
            {active === 0 ? <InventoryScene /> : null}
            {active === 1 ? <BiddingScene /> : null}
            {active === 2 ? <AnalyticsScene /> : null}
          </div>

          <div className="absolute inset-x-3 bottom-3 rounded-[18px] border border-white/80 bg-white/90 p-4 shadow-[0_18px_50px_rgba(34,47,53,.14)] backdrop-blur-xl sm:inset-x-5 sm:bottom-5 sm:p-5">
            <div className="flex items-end justify-between gap-5">
              <div key={`copy-${active}`}>
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#628092]">
                  0{active + 1} · {scenes[active].label}
                </p>
                <h2 className="mt-2 text-xl leading-tight tracking-[-0.035em] sm:text-2xl">
                  {scenes[active].title}
                </h2>
                <p className="mt-2 max-w-lg text-xs leading-5 text-[#66767d] sm:text-sm">
                  {scenes[active].description}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => move(-1)}
                  aria-label="Föregående vy"
                  className="grid h-10 w-10 place-items-center rounded-full border border-[#d9e0e2] bg-white text-[#52656e] transition hover:bg-[#f3f7f8]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(1)}
                  aria-label="Nästa vy"
                  className="grid h-10 w-10 place-items-center rounded-full bg-[#242424] text-white transition hover:bg-[#111]"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex h-1 bg-white/5">
          {scenes.map((scene, index) => (
            <button
              key={scene.label}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Visa ${scene.label}`}
              className="relative flex-1 overflow-hidden"
            >
              <span
                className={`absolute inset-y-0 left-0 bg-[#B4D9EF] ${
                  index === active ? 'w-full' : 'w-0'
                } transition-[width] duration-500`}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function WorkspaceTopbar({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between rounded-[14px] border border-white bg-white/82 px-4 py-3 shadow-sm backdrop-blur">
      <div>
        <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#849399]">
          Dealer workspace
        </p>
        <strong className="mt-1 block text-sm">{title}</strong>
      </div>
      <span className="grid h-9 w-9 place-items-center rounded-full bg-[#B4D9EF] text-[#294f62]">
        <ShieldCheck className="h-4 w-4" />
      </span>
    </div>
  )
}

function InventoryScene() {
  const vehicles = [
    ['Volvo XC40 Recharge', '2022 · 4 820 mil', 'Marknadstest', '18'],
    ['Volkswagen ID.4', '2021 · 6 140 mil', 'Under granskning', '—'],
    ['BMW 330e Touring', '2020 · 7 350 mil', 'Erbjudande klart', '24'],
  ]

  return (
    <div>
      <WorkspaceTopbar title="Företagslager" />
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          ['Aktiva fordon', '38'],
          ['EU-räckvidd', '12 länder'],
          ['Pågående test', '17'],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[13px] bg-[#252b2f] p-3 text-white">
            <span className="text-[8px] uppercase tracking-[0.14em] text-white/38">
              {label}
            </span>
            <strong className="mt-3 block text-lg tracking-[-0.03em]">
              {value}
            </strong>
          </div>
        ))}
      </div>
      <div className="mt-3 overflow-hidden rounded-[16px] border border-[#dfe5e7] bg-white shadow-sm">
        <div className="grid grid-cols-[1fr_.72fr_.65fr] bg-[#f5f7f7] px-4 py-2 text-[8px] font-semibold uppercase tracking-[0.14em] text-[#88959a]">
          <span>Fordon</span><span>Status</span><span>Intresse</span>
        </div>
        {vehicles.map(([name, detail, status, interest], index) => (
          <div key={name} className="grid grid-cols-[1fr_.72fr_.65fr] items-center border-t border-[#edf0f1] px-4 py-3 text-xs">
            <span className="flex min-w-0 items-center gap-2.5">
              <i className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-[#e9f3f7] text-[#4d8197]"><CarFront className="h-4 w-4" /></i>
              <span className="min-w-0"><strong className="block truncate font-medium">{name}</strong><small className="text-[9px] text-[#829096]">{detail}</small></span>
            </span>
            <span className="text-[9px] text-[#607078]">{status}</span>
            <span className="flex items-center gap-1.5 font-medium"><i className={`h-2 w-2 rounded-full ${index === 1 ? 'bg-[#e2c66e]' : 'bg-[#78bc91]'}`} />{interest} {interest !== '—' ? 'köpare' : ''}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function BiddingScene() {
  const bids = [
    ['DE', '€31 400', '+€600'],
    ['NL', '€30 800', '+€450'],
    ['BE', '€30 350', '+€250'],
  ]

  return (
    <div>
      <WorkspaceTopbar title="Anonymt EU-marknadstest" />
      <div className="mt-3 grid gap-3 sm:grid-cols-[1.12fr_.88fr]">
        <div className="rounded-[17px] bg-[#232a2e] p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-[#B4D9EF]"><Gavel className="h-4 w-4" />Live activity</span>
            <span className="flex items-center gap-1.5 text-[9px] text-white/50"><Clock3 className="h-3.5 w-3.5" />07:42 kvar</span>
          </div>
          <p className="mt-5 text-[10px] text-white/42">Högsta marknadssignal</p>
          <strong className="mt-1 block text-4xl tracking-[-0.055em]">€31 400</strong>
          <div className="mt-5 flex h-24 items-end gap-2">
            {[34, 48, 42, 61, 57, 74, 69, 88].map((height, index) => (
              <i key={index} className="flex-1 rounded-t bg-[#B4D9EF]/75 transition-all" style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {bids.map(([country, amount, change], index) => (
            <div key={country} className="flex items-center justify-between rounded-[14px] border border-white bg-white/88 p-3 shadow-sm">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#edf4f6] text-[10px] font-bold text-[#527080]">{country}</span>
              <span className="text-right"><strong className="block text-sm">{amount}</strong><small className="text-[9px] text-[#65a17b]">{index === 0 ? 'Högst' : change}</small></span>
            </div>
          ))}
          <div className="flex items-center gap-2 rounded-[14px] bg-[#dff0f7] p-3 text-[10px] text-[#426779]">
            <Globe2 className="h-4 w-4" />12 aktiva köparmarknader
          </div>
        </div>
      </div>
    </div>
  )
}

function AnalyticsScene() {
  return (
    <div>
      <WorkspaceTopbar title="Portföljanalys" />
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-[16px] border border-white bg-white/88 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-[0.14em] text-[#829096]">Fordon testade</span>
            <BarChart3 className="h-4 w-4 text-[#58849a]" />
          </div>
          <strong className="mt-4 block text-3xl tracking-[-0.045em]">128</strong>
          <span className="mt-1 flex items-center gap-1 text-[9px] text-[#629c77]"><TrendingUp className="h-3 w-3" />+18% senaste 30 dagarna</span>
        </div>
        <div className="rounded-[16px] bg-[#242a2e] p-4 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-[0.14em] text-white/40">Köparräckvidd</span>
            <Globe2 className="h-4 w-4 text-[#B4D9EF]" />
          </div>
          <strong className="mt-4 block text-3xl tracking-[-0.045em]">14</strong>
          <span className="mt-1 block text-[9px] text-white/45">europeiska marknader</span>
        </div>
      </div>
      <div className="mt-3 rounded-[17px] border border-white bg-white/88 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span><small className="block text-[8px] uppercase tracking-[0.15em] text-[#849399]">Efterfrågan per kategori</small><strong className="mt-1 block text-sm">Senaste marknadstesterna</strong></span>
          <ArrowUpRight className="h-4 w-4 text-[#5d8293]" />
        </div>
        <div className="mt-4 space-y-3">
          {[['El & hybrid', 86], ['SUV & crossover', 72], ['Nyare premium', 64]].map(([label, value]) => (
            <div key={label as string}>
              <div className="flex justify-between text-[9px] text-[#64757c]"><span>{label}</span><strong>{value}%</strong></div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#e7ecee]"><i className="block h-full rounded-full bg-[#8fc6df]" style={{ width: `${value}%` }} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
