import Image from 'next/image'

type BrandLogoProps = {
  inverted?: boolean
  compact?: boolean
  iconOnly?: boolean
}

export default function BrandLogo({
  inverted = false,
  compact = false,
  iconOnly = false,
}: BrandLogoProps) {
  return (
    <span className="inline-flex items-center" aria-label="Autorell">
      <Image
        src="/autorell-wordmark.svg"
        alt=""
        width={620}
        height={136}
        preload
        className={`h-auto object-contain ${
          iconOnly
            ? 'w-[92px]'
            : compact
              ? 'w-[88px]'
              : 'w-[104px] sm:w-[108px] lg:w-[112px]'
        } ${inverted ? 'brightness-0 invert' : ''}`}
      />
    </span>
  )
}
