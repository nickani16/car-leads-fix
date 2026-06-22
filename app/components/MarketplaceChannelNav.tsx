import Link from 'next/link'
import type { PublicLocale } from '@/lib/public-i18n'

const channelLinks: Record<string, Record<'sv' | 'en' | 'de', string[]>> = {
  cars: {
    sv: ['Begagnade bilar', 'Nya bilar', 'Sälj din bil', 'Bilrecensioner', 'Elbilar'],
    en: ['Used cars', 'New cars', 'Sell your car', 'Car reviews', 'Electric cars'],
    de: ['Gebrauchtwagen', 'Neuwagen', 'Auto verkaufen', 'Autotests', 'Elektroautos'],
  },
  bikes: {
    sv: ['Begagnade motorcyklar', 'Nya motorcyklar', 'Sälj motorcykel', 'MC-recensioner', 'Elektriska motorcyklar'],
    en: ['Used motorcycles', 'New motorcycles', 'Sell your bike', 'Bike reviews', 'Electric motorcycles'],
    de: ['Gebrauchte Motorräder', 'Neue Motorräder', 'Motorrad verkaufen', 'Tests', 'Elektromotorräder'],
  },
  vans: {
    sv: ['Begagnade transportbilar', 'Nya transportbilar', 'Sälj transportbil', 'Recensioner', 'Eltransportbilar'],
    en: ['Used vans', 'New vans', 'Sell your van', 'Van reviews', 'Electric vans'],
    de: ['Gebrauchte Transporter', 'Neue Transporter', 'Transporter verkaufen', 'Tests', 'Elektrotransporter'],
  },
  motorhomes: {
    sv: ['Begagnade husbilar', 'Nya husbilar', 'Sälj husbil', 'Husbilsråd'],
    en: ['Used motorhomes', 'New motorhomes', 'Sell your motorhome', 'Motorhome advice'],
    de: ['Gebrauchte Wohnmobile', 'Neue Wohnmobile', 'Wohnmobil verkaufen', 'Ratgeber'],
  },
}

export default function MarketplaceChannelNav({
  slug,
  label,
  locale,
}: {
  slug: string
  label: string
  locale: PublicLocale
}) {
  const supportedLocale = locale === 'de' ? 'de' : locale === 'en' ? 'en' : 'sv'
  const fallback =
    supportedLocale === 'sv'
      ? [`Alla ${label.toLowerCase()}`, `Sälj ${label.toLowerCase()}`, 'Priser', 'Köpråd']
      : supportedLocale === 'de'
        ? [`Alle ${label}`, `${label} verkaufen`, 'Preise', 'Ratgeber']
        : [`All ${label.toLowerCase()}`, `Sell ${label.toLowerCase()}`, 'Pricing', 'Buying advice']
  const links = channelLinks[slug]?.[supportedLocale] || fallback

  return (
    <div className="hidden border-b border-[#e4e7ec] bg-white min-[1120px]:block">
      <nav className="mx-auto flex h-[52px] max-w-[1440px] items-center gap-7 overflow-x-auto px-10 text-[13px] font-semibold text-[#344054] xl:px-14">
        <strong className="shrink-0 text-[#101828]">{label}</strong>
        {links.map((item, index) => (
          <Link
            key={item}
            href={index === 2 || item.toLowerCase().includes('sälj') || item.toLowerCase().includes('sell') || item.toLowerCase().includes('verkaufen')
              ? `/salj-fordon?category=${slug}`
              : `/marketplace/${slug}${index === 0 ? '' : `?filter=${encodeURIComponent(item)}`}`}
            className="flex h-full shrink-0 items-center border-b-2 border-transparent transition hover:border-[#0866ff] hover:text-[#0866ff]"
          >
            {item}
          </Link>
        ))}
        <Link href="/sparade" className="ml-auto shrink-0 text-[#0866ff]">
          {supportedLocale === 'sv' ? 'Sparade annonser' : supportedLocale === 'de' ? 'Gespeichert' : 'Saved listings'}
        </Link>
      </nav>
    </div>
  )
}
