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
        src={
          iconOnly
            ? '/autorell-brand-mark-color.png'
            : '/autorell-brand-logo-color.png'
        }
        alt=""
        width={iconOnly ? 352 : 1817}
        height={iconOnly ? 265 : 331}
        priority
        className={`h-auto object-contain ${
          iconOnly
            ? 'w-[52px]'
            : compact
              ? 'w-[118px]'
              : 'w-[148px] sm:w-[160px] lg:w-[174px]'
        } ${inverted ? 'brightness-0 invert' : ''}`}
      />
    </span>
  )
}
