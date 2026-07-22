'use client'

type BenefitsAuthCtaProps = {
  label: string
  destination: string
}

export default function BenefitsAuthCta({ label, destination }: BenefitsAuthCtaProps) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent('autorell:open-auth', { detail: { mode: 'register', destination } }))}
      className="group inline-flex min-h-14 items-center justify-center rounded-[8px] bg-[#0866ff] px-7 text-base font-semibold text-white shadow-[0_12px_28px_rgba(8,102,255,.2)] transition hover:-translate-y-0.5 hover:bg-[#075ce5]"
    >
      {label}
      <span aria-hidden="true" className="ml-3 transition-transform group-hover:translate-x-1">-&gt;</span>
    </button>
  )
}
