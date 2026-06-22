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
        src="/autorell-wordmark-blue.png"
        alt=""
        width={960}
        height={204}
        priority
        className={`h-auto object-contain ${
          iconOnly
            ? 'w-[92px]'
            : compact
              ? 'w-[88px]'
              : 'w-[108px] sm:w-[114px] lg:w-[120px]'
        } ${inverted ? 'brightness-0 invert' : ''}`}
      />
    </span>
  )
}
