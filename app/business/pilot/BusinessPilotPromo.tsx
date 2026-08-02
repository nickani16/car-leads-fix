import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import type { BusinessPilotCopy } from '@/lib/business-pilot-i18n'

export default function BusinessPilotPromo({
  copy,
  applicationHref,
  inventoryHref,
}: {
  copy: BusinessPilotCopy['businessSection']
  applicationHref: string
  inventoryHref: string
}) {
  return (
    <section className="border-y border-[#dce5f1] bg-[#f4f8fd] px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto grid w-full max-w-[1120px] gap-12 lg:grid-cols-[minmax(0,0.86fr)_minmax(420px,1.14fr)] lg:items-start">
        <div className="max-w-[580px]">
          <p className="text-xs font-semibold uppercase tracking-[.14em] text-[#0866ff]">{copy.eyebrow}</p>
          <h2 className="mt-3 text-[34px] font-semibold leading-tight text-[#101828] sm:text-5xl">{copy.title}</h2>
          <div className="mt-6 space-y-4 text-base leading-7 text-[#475467]">
            {copy.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={applicationHref}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] bg-[#0866ff] px-5 text-sm font-semibold text-white transition hover:bg-[#0057df]"
            >
              {copy.primaryCta}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href={inventoryHref}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] border border-[#98a2b3] bg-white px-5 text-sm font-semibold text-[#344054] transition hover:border-[#0866ff] hover:text-[#0866ff]"
            >
              {copy.secondaryCta}
            </Link>
          </div>
          <p className="mt-5 text-sm font-medium leading-6 text-[#667085]">{copy.availabilityNote}</p>
        </div>

        <ul className="grid gap-px overflow-hidden rounded-[8px] border border-[#d5dfec] bg-[#d5dfec] sm:grid-cols-2">
          {copy.benefits.map((benefit) => (
            <li key={benefit} className="flex min-h-[96px] items-start gap-3 bg-white p-5 text-sm font-semibold leading-6 text-[#344054]">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#eaf7ef] text-[#16794a]">
                <Check className="h-4 w-4" aria-hidden="true" />
              </span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
