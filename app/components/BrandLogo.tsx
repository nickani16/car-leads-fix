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
        src="/autorell-wordmark-primary.png"
        alt=""
        width={1848}
        height={405}
        preload
        className={`h-auto object-contain ${
          iconOnly
            ? 'w-[108px]'
            : compact
              ? 'w-[104px]'
              : 'w-[122px] sm:w-[132px] lg:w-[138px]'
        } ${inverted ? 'brightness-0 invert' : ''}`}
      />
    </span>
  )
}
