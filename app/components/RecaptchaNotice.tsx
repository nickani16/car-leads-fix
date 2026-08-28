import type { PublicLocale } from '@/lib/public-i18n'

type NoticeCopy = { prefix: string; privacy: string; conjunction: string; terms: string; suffix: string }

const copies: Record<PublicLocale, NoticeCopy> = {
  sv: { prefix: 'Den här webbplatsen skyddas av reCAPTCHA och Googles', privacy: 'integritetspolicy', conjunction: 'och', terms: 'användarvillkor', suffix: 'gäller.' },
  en: { prefix: 'This site is protected by reCAPTCHA and the Google', privacy: 'Privacy Policy', conjunction: 'and', terms: 'Terms of Service', suffix: 'apply.' },
  de: { prefix: 'Diese Website ist durch reCAPTCHA geschützt. Es gelten die', privacy: 'Datenschutzerklärung', conjunction: 'und', terms: 'Nutzungsbedingungen', suffix: 'von Google.' },
  at: { prefix: 'Diese Website ist durch reCAPTCHA geschützt. Es gelten die', privacy: 'Datenschutzerklärung', conjunction: 'und', terms: 'Nutzungsbedingungen', suffix: 'von Google.' },
  fr: { prefix: 'Ce site est protégé par reCAPTCHA. La', privacy: 'règle de confidentialité', conjunction: 'et les', terms: "conditions d'utilisation", suffix: 'de Google s’appliquent.' },
  es: { prefix: 'Este sitio está protegido por reCAPTCHA y se aplican la', privacy: 'Política de Privacidad', conjunction: 'y las', terms: 'Condiciones del Servicio', suffix: 'de Google.' },
  it: { prefix: 'Questo sito è protetto da reCAPTCHA e si applicano le', privacy: 'Norme sulla privacy', conjunction: 'e i', terms: 'Termini di servizio', suffix: 'di Google.' },
  pl: { prefix: 'Ta strona jest chroniona przez reCAPTCHA. Obowiązują', privacy: 'Polityka prywatności', conjunction: 'i', terms: 'Warunki korzystania z usługi', suffix: 'Google.' },
  nl: { prefix: 'Deze site wordt beschermd door reCAPTCHA. Het', privacy: 'privacybeleid', conjunction: 'en de', terms: 'servicevoorwaarden', suffix: 'van Google zijn van toepassing.' },
  be: { prefix: 'Deze site wordt beschermd door reCAPTCHA. Het', privacy: 'privacybeleid', conjunction: 'en de', terms: 'servicevoorwaarden', suffix: 'van Google zijn van toepassing.' },
  fi: { prefix: 'Tätä sivustoa suojaa reCAPTCHA. Googlen', privacy: 'tietosuojakäytäntö', conjunction: 'ja', terms: 'käyttöehdot', suffix: 'ovat voimassa.' },
  da: { prefix: 'Dette website er beskyttet af reCAPTCHA. Googles', privacy: 'privatlivspolitik', conjunction: 'og', terms: 'servicevilkår', suffix: 'gælder.' },
}

export default function RecaptchaNotice({ locale }: { locale: PublicLocale }) {
  const copy = copies[locale] || copies.en
  return (
    <p className="text-[10px] font-normal leading-4 text-[#667085]">
      {copy.prefix}{' '}
      <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-[#344054]">{copy.privacy}</a>{' '}
      {copy.conjunction}{' '}
      <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-[#344054]">{copy.terms}</a>{' '}
      {copy.suffix}
    </p>
  )
}
