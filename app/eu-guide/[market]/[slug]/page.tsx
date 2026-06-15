import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CarFront,
  Check,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  Landmark,
  ScanSearch,
  Ship,
} from 'lucide-react'
import BrandLogo from '@/app/components/BrandLogo'
import SocialIcons from '@/app/components/SocialIcons'
import {
  getImportGuide,
  getImportGuideAlternates,
  importGuides,
} from '@/lib/import-guides'

type RouteProps = {
  params: Promise<{ market: string; slug: string }>
}

const sectionIcons = [ClipboardCheck, Landmark, ScanSearch, Ship, FileCheck2]

export const dynamicParams = false

export function generateStaticParams() {
  return importGuides.map(({ market, slug }) => ({ market, slug }))
}

export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const { market, slug } = await params
  const guide = getImportGuide(market, slug)
  if (!guide) return {}

  const canonical = `${guide.host}${guide.publicPath}`

  return {
    title: { absolute: `${guide.title} | Autorell` },
    description: guide.description,
    keywords: [
      guide.title,
      `bilimport Sverige ${guide.country}`,
      `import samochodu ze Szwecji ${guide.country}`,
      `Fahrzeugimport Schweden ${guide.country}`,
      'Autorell dealer',
      'B2B vehicle sourcing',
    ],
    alternates: {
      canonical,
      languages: getImportGuideAlternates(),
    },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: canonical,
      siteName: 'Autorell',
      locale: guide.hreflang.replace('-', '_'),
      type: 'article',
      publishedTime: '2026-06-15T00:00:00.000Z',
      modifiedTime: '2026-06-15T00:00:00.000Z',
      images: [
        {
          url: `${guide.host}/autorell-volvo-hero.jpg`,
          width: 1600,
          height: 1067,
          alt: guide.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.title,
      description: guide.description,
      images: [`${guide.host}/autorell-volvo-hero.jpg`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    category: 'automotive',
  }
}

export default async function ImportGuidePage({ params }: RouteProps) {
  const { market, slug } = await params
  const guide = getImportGuide(market, slug)
  if (!guide) notFound()

  const canonical = `${guide.host}${guide.publicPath}`
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${canonical}#article`,
        headline: guide.title,
        description: guide.description,
        datePublished: '2026-06-15',
        dateModified: '2026-06-15',
        inLanguage: guide.hreflang,
        mainEntityOfPage: canonical,
        image: `${guide.host}/autorell-volvo-hero.jpg`,
        author: {
          '@type': 'Organization',
          name: 'Autorell AB',
          url: guide.host,
        },
        publisher: {
          '@type': 'Organization',
          name: 'Autorell AB',
          logo: {
            '@type': 'ImageObject',
            url: `${guide.host}/icon-512.png`,
          },
        },
        about: [
          'Vehicle import from Sweden',
          'B2B vehicle sourcing',
          `Professional automotive dealers in ${guide.country}`,
        ],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: guide.backToMarket,
            item: `${guide.host}${guide.marketPath}`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: guide.title,
            item: canonical,
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: guide.faq.map(([question, answer]) => ({
          '@type': 'Question',
          name: question,
          acceptedAnswer: { '@type': 'Answer', text: answer },
        })),
      },
    ],
  }

  return (
    <main className="overflow-hidden bg-[#f7f6f2] text-[#202124]">
      <header className="absolute inset-x-0 top-0 z-30 border-b border-white/35 bg-white/76 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[88px] max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8 lg:min-h-[108px] lg:px-12 xl:px-16">
          <Link href={guide.marketPath} aria-label={guide.backToMarket}>
            <BrandLogo />
          </Link>
          <nav className="flex items-center gap-3" aria-label="Dealer navigation">
            <Link
              href="/dealer"
              className="hidden text-sm font-medium text-[#4f6168] transition hover:text-black sm:block"
            >
              {guide.login}
            </Link>
            <Link
              href="/dealer-apply"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#242424] px-4 text-sm font-medium text-white sm:px-5"
            >
              <span className="hidden sm:inline">{guide.apply}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative isolate overflow-hidden border-b border-[#d9d8d2] bg-[#f4f1ea] pt-[88px] lg:pt-[108px]">
        <Image
          src="/autorell-volvo-hero.jpg"
          alt={guide.title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[72%_bottom] sm:object-[76%_center] lg:object-right"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(249,247,242,.99)_0%,rgba(249,247,242,.95)_48%,rgba(249,247,242,.68)_72%,rgba(238,238,233,.26)_100%)] sm:bg-[linear-gradient(90deg,#faf8f3_0%,rgba(250,248,243,.98)_38%,rgba(250,248,243,.78)_57%,rgba(250,248,243,.16)_82%,transparent_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(31,36,39,.22)_0%,transparent_38%)]" />
        <div className="home-hero-orb absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#b4d9ef]/30 blur-3xl" />

        <div className="relative mx-auto flex min-h-[740px] max-w-[1440px] items-center px-5 py-16 sm:px-8 sm:py-24 lg:px-12 xl:px-16">
          <div className="max-w-[850px]">
            <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-[#687c85]" aria-label="Breadcrumb">
              <Link href={guide.marketPath} className="hover:text-[#202124]">
                {guide.backToMarket}
              </Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{guide.eyebrow}</span>
            </nav>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#c7d7dc] bg-white/82 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4f7181] shadow-[0_12px_35px_rgba(32,33,36,.07)] backdrop-blur">
              <CarFront className="h-4 w-4" />
              {guide.eyebrow}
            </span>
            <h1 className="mt-8 max-w-[900px] text-[46px] leading-[.96] tracking-[-0.06em] sm:text-7xl lg:text-[82px]">
              {guide.title}
            </h1>
            <p className="mt-7 max-w-[720px] text-[17px] leading-8 text-[#536b76] sm:text-xl sm:leading-9">
              {guide.intro}
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/76 px-4 py-2 text-xs text-[#556d78]">
                <CalendarDays className="h-3.5 w-3.5" />
                {guide.updatedLabel}: {guide.updatedDate}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/76 px-4 py-2 text-xs text-[#556d78]">
                <Clock3 className="h-3.5 w-3.5" />
                {guide.readTime}
              </span>
            </div>
          </div>
        </div>

        <div className="relative mx-auto grid max-w-[1440px] gap-px border-t border-[#d7dcdd] bg-[#d7dcdd] sm:grid-cols-2 lg:grid-cols-4">
          {guide.facts.map((fact, index) => (
            <article
              key={fact.label}
              className={index === 0 ? 'bg-[#e6f4fa] px-6 py-7' : 'bg-white/92 px-6 py-7'}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#778b94]">
                {fact.label}
              </p>
              <strong className="mt-2 block text-base font-medium sm:text-lg">
                {fact.value}
              </strong>
            </article>
          ))}
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="mx-auto grid max-w-[1320px] gap-12 px-5 sm:px-8 lg:grid-cols-[.35fr_.65fr] lg:gap-16 lg:px-12">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#66808c]">
              {guide.contentsLabel}
            </p>
            <nav className="mt-6 grid gap-2" aria-label={guide.contentsLabel}>
              {guide.sections.map((section, index) => (
                <a
                  key={section.title}
                  href={`#section-${index + 1}`}
                  className="group flex items-center gap-3 rounded-[14px] border border-[#deddd7] bg-white px-4 py-3 text-sm transition hover:border-[#9ecce2]"
                >
                  <span className="text-[10px] tracking-[0.15em] text-[#78909b]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="flex-1">{section.title}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#62879a] transition group-hover:translate-x-0.5" />
                </a>
              ))}
            </nav>
          </aside>

          <article className="min-w-0">
            <div className="grid gap-5">
              {guide.sections.map((section, index) => {
                const Icon = sectionIcons[index]
                return (
                  <section
                    key={section.title}
                    id={`section-${index + 1}`}
                    className="scroll-mt-28 rounded-[28px] border border-[#deddd7] bg-white p-7 shadow-[0_18px_55px_rgba(32,33,36,.045)] sm:p-10"
                  >
                    <div className="flex items-center justify-between gap-5">
                      <span className="grid h-12 w-12 place-items-center rounded-full bg-[#dceef7] text-[#3e7188]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="text-[10px] tracking-[0.18em] text-[#9aa4a8]">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <h2 className="mt-8 text-[32px] leading-[1.05] tracking-[-0.045em] sm:text-4xl">
                      {section.title}
                    </h2>
                    <p className="mt-5 text-base leading-8 text-[#61737a]">
                      {section.text}
                    </p>
                    <ul className="mt-7 grid gap-3">
                      {section.points.map((point) => (
                        <li
                          key={point}
                          className="flex gap-3 rounded-[15px] bg-[#f5f7f6] px-4 py-3 text-sm leading-6 text-[#53686f]"
                        >
                          <Check className="mt-1 h-4 w-4 shrink-0 text-[#4e8197]" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </section>
                )
              })}
            </div>
          </article>
        </div>
      </section>

      <section className="bg-[#202427] py-20 text-white sm:py-24">
        <div className="mx-auto grid max-w-[1180px] gap-10 px-5 sm:px-8 lg:grid-cols-[.7fr_1.3fr] lg:px-12">
          <div>
            <BadgeCheck className="h-8 w-8 text-[#b4d9ef]" />
            <h2 className="mt-6 text-[38px] leading-[1.02] tracking-[-0.05em] sm:text-5xl">
              {guide.checklistTitle}
            </h2>
          </div>
          <div className="grid gap-px overflow-hidden rounded-[24px] border border-white/10 bg-white/10 sm:grid-cols-2">
            {guide.checklist.map((item, index) => (
              <div key={item} className="flex min-h-28 gap-4 bg-[#202427] p-6">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#b4d9ef] text-[#202124]">
                  <Check className="h-4 w-4" />
                </span>
                <div>
                  <span className="text-[9px] tracking-[0.16em] text-white/32">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <p className="mt-2 text-sm leading-6 text-white/72">{item}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-[1040px] px-5 sm:px-8">
          <h2 className="text-center text-[38px] tracking-[-0.05em] sm:text-5xl">
            {guide.faqTitle}
          </h2>
          <div className="mt-10 grid gap-3">
            {guide.faq.map(([question, answer]) => (
              <details
                key={question}
                className="group rounded-[20px] border border-[#deddd7] bg-[#faf9f6] p-6 open:bg-white open:shadow-[0_16px_45px_rgba(32,33,36,.05)]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-lg font-medium">
                  {question}
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#dceef7] text-[#365c6f] transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-5 max-w-3xl text-sm leading-7 text-[#68777c]">
                  {answer}
                </p>
              </details>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-6 text-[#7b888d]">
            {guide.disclaimer}
          </p>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
        <div className="relative mx-auto max-w-[1160px] overflow-hidden rounded-[30px] bg-[#b4d9ef] px-7 py-14 text-center sm:px-12 sm:py-20">
          <span className="absolute -right-24 -top-28 h-72 w-72 rounded-full border-[46px] border-white/28" />
          <h2 className="relative z-10 mx-auto max-w-4xl text-[38px] leading-[1.04] tracking-[-0.055em] sm:text-6xl">
            {guide.ctaTitle}
          </h2>
          <p className="relative z-10 mx-auto mt-6 max-w-2xl leading-8 text-[#3d6070]">
            {guide.ctaText}
          </p>
          <Link
            href="/dealer-apply"
            className="relative z-10 mt-8 inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#242424] px-8 text-sm font-medium text-white"
          >
            {guide.apply}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#deddd8] bg-[#202427] text-white">
        <div className="mx-auto flex max-w-[1320px] flex-col justify-between gap-8 px-5 py-10 sm:flex-row sm:items-center sm:px-8 lg:px-12">
          <div>
            <BrandLogo inverted />
            <p className="mt-4 text-sm text-white/55">{guide.eyebrow}</p>
          </div>
          <div className="flex flex-wrap items-center gap-5 text-sm">
            <Link href={guide.marketPath} className="text-white/65 hover:text-white">
              {guide.backToMarket}
            </Link>
            <Link href="/dealer-apply" className="text-white/65 hover:text-white">
              {guide.apply}
            </Link>
            <SocialIcons />
          </div>
        </div>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />
    </main>
  )
}
