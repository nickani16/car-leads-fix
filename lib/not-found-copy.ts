import {
  translatePublicObject,
  type PublicLocale,
} from '@/lib/public-i18n'

export type NotFoundLanguage = PublicLocale

const english = {
  heading: 'This road does not lead to the right place.',
  description:
    'The page may have moved or the link may be incorrect. Return to the homepage or explore the vehicle marketplace.',
  home: 'Back to homepage',
  action: 'Explore vehicles',
  label: 'Page not found',
  homeAria: 'Autorell homepage',
}

export function getNotFoundCopy(locale: PublicLocale) {
  if (locale === 'sv') {
    return {
      heading: 'Den här vägen leder inte rätt.',
      description:
        'Sidan kan ha flyttats eller länken kan vara fel. Gå tillbaka till startsidan eller utforska fordonsmarknaden.',
      home: 'Till startsidan',
      action: 'Utforska fordon',
      label: 'Sidan hittades inte',
      homeAria: 'Autorell startsida',
    }
  }
  if (locale === 'de') {
    return {
      heading: 'Dieser Weg führt nicht zum Ziel.',
      description:
        'Die Seite wurde möglicherweise verschoben oder der Link ist falsch. Kehren Sie zur Startseite zurück oder entdecken Sie den Fahrzeugmarktplatz.',
      home: 'Zur Startseite',
      action: 'Fahrzeuge entdecken',
      label: 'Seite nicht gefunden',
      homeAria: 'Autorell Startseite',
    }
  }
  return locale === 'en' ? english : translatePublicObject(locale, english)
}
