import Link from 'next/link'
import {
  categoryLandingMenuHref,
  categoryLandingPath,
  getCategoryLanding,
  localizeCategoryLanding,
} from '@/lib/category-landings'
import type { MarketplaceCategorySlug } from '@/lib/marketplace'
import type { PublicLocale } from '@/lib/public-i18n'

export default function MarketplaceChannelNav({
  slug,
  locale,
}: {
  slug: MarketplaceCategorySlug
  locale: PublicLocale
}) {
  const config = getCategoryLanding(slug)
  const localized = localizeCategoryLanding(config, locale)

  return (
    <div className="border-b border-[#e4e7ec] bg-white">
      <nav
        aria-label={`${localized.label} navigation`}
        className="mx-auto flex min-h-[54px] max-w-[1440px] items-stretch gap-6 overflow-x-auto px-5 text-[13px] font-semibold text-[#344054] sm:px-8 lg:gap-8 lg:px-10 xl:px-14"
      >
        <Link
          href={categoryLandingPath(slug)}
          className="flex shrink-0 items-center border-b-2 border-[#0866ff] font-bold text-[#101828]"
        >
          {localized.label}
        </Link>
        {localized.menu.map((item) => (
          <Link
            key={item}
            href={categoryLandingMenuHref(config, item)}
            className="flex shrink-0 items-center border-b-2 border-transparent transition hover:border-[#0866ff] hover:text-[#0866ff]"
          >
            {item}
          </Link>
        ))}
      </nav>
    </div>
  )
}
