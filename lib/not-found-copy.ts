import type { PublicLocale } from '@/lib/public-i18n'

export type NotFoundLanguage = PublicLocale

type NotFoundCopy = {
  eyebrow: string
  heading: string
  description: string
  home: string
  marketplace: string
  account: string
  support: string
  popularTitle: string
  cars: string
  vans: string
  motorcycles: string
  companies: string
  sell: string
  label: string
  homeAria: string
}

const copyByLanguage: Record<'en' | 'sv' | 'de' | 'fr' | 'es' | 'it' | 'nl' | 'pl' | 'da' | 'fi', NotFoundCopy> = {
  en: {
    eyebrow: 'Page not found',
    heading: 'We could not find that page.',
    description:
      'The listing, account page or link may have moved. Search the marketplace, return home or contact Autorell if you expected something to be here.',
    home: 'Back to homepage',
    marketplace: 'Search vehicles',
    account: 'My account',
    support: 'Contact support',
    popularTitle: 'Popular places to continue',
    cars: 'Cars',
    vans: 'Vans',
    motorcycles: 'Motorcycles',
    companies: 'For companies',
    sell: 'Sell a vehicle',
    label: 'Page not found',
    homeAria: 'Autorell homepage',
  },
  sv: {
    eyebrow: 'Sidan hittades inte',
    heading: 'Vi hittar inte sidan.',
    description:
      'Annonsen, kontosidan eller länken kan ha flyttats. Sök bland fordon, gå tillbaka till startsidan eller kontakta Autorell om du förväntade dig att sidan skulle finnas här.',
    home: 'Till startsidan',
    marketplace: 'Sök fordon',
    account: 'Mitt konto',
    support: 'Kontakta support',
    popularTitle: 'Vanliga vägar vidare',
    cars: 'Bilar',
    vans: 'Transportbilar',
    motorcycles: 'Motorcyklar',
    companies: 'För företag',
    sell: 'Sälj fordon',
    label: 'Sidan hittades inte',
    homeAria: 'Autorell startsida',
  },
  de: {
    eyebrow: 'Seite nicht gefunden',
    heading: 'Wir finden diese Seite nicht.',
    description:
      'Die Anzeige, Kontoseite oder der Link wurde möglicherweise verschoben. Suchen Sie Fahrzeuge, gehen Sie zur Startseite zurück oder kontaktieren Sie Autorell, wenn Sie diese Seite erwartet haben.',
    home: 'Zur Startseite',
    marketplace: 'Fahrzeuge suchen',
    account: 'Mein Konto',
    support: 'Support kontaktieren',
    popularTitle: 'Beliebte Wege weiter',
    cars: 'Autos',
    vans: 'Transporter',
    motorcycles: 'Motorräder',
    companies: 'Für Unternehmen',
    sell: 'Fahrzeug verkaufen',
    label: 'Seite nicht gefunden',
    homeAria: 'Autorell Startseite',
  },
  fr: {
    eyebrow: 'Page introuvable',
    heading: 'Nous ne trouvons pas cette page.',
    description:
      'L’annonce, la page de compte ou le lien a peut-être été déplacé. Recherchez un véhicule, revenez à l’accueil ou contactez Autorell si cette page devait exister.',
    home: 'Retour à l’accueil',
    marketplace: 'Rechercher',
    account: 'Mon compte',
    support: 'Contacter le support',
    popularTitle: 'Pages utiles',
    cars: 'Voitures',
    vans: 'Utilitaires',
    motorcycles: 'Motos',
    companies: 'Entreprises',
    sell: 'Vendre un véhicule',
    label: 'Page introuvable',
    homeAria: 'Accueil Autorell',
  },
  es: {
    eyebrow: 'Página no encontrada',
    heading: 'No encontramos esta página.',
    description:
      'El anuncio, la cuenta o el enlace pueden haberse movido. Busca vehículos, vuelve al inicio o contacta con Autorell si esperabas encontrar esta página.',
    home: 'Volver al inicio',
    marketplace: 'Buscar vehículos',
    account: 'Mi cuenta',
    support: 'Contactar soporte',
    popularTitle: 'Dónde continuar',
    cars: 'Coches',
    vans: 'Furgonetas',
    motorcycles: 'Motos',
    companies: 'Empresas',
    sell: 'Vender vehículo',
    label: 'Página no encontrada',
    homeAria: 'Inicio de Autorell',
  },
  it: {
    eyebrow: 'Pagina non trovata',
    heading: 'Non troviamo questa pagina.',
    description:
      'L’annuncio, la pagina account o il link potrebbero essere stati spostati. Cerca veicoli, torna alla home o contatta Autorell se questa pagina dovrebbe esistere.',
    home: 'Torna alla home',
    marketplace: 'Cerca veicoli',
    account: 'Il mio account',
    support: 'Contatta supporto',
    popularTitle: 'Pagine utili',
    cars: 'Auto',
    vans: 'Furgoni',
    motorcycles: 'Moto',
    companies: 'Aziende',
    sell: 'Vendi veicolo',
    label: 'Pagina non trovata',
    homeAria: 'Home Autorell',
  },
  nl: {
    eyebrow: 'Pagina niet gevonden',
    heading: 'We kunnen deze pagina niet vinden.',
    description:
      'De advertentie, accountpagina of link is mogelijk verplaatst. Zoek voertuigen, ga terug naar de homepage of neem contact op met Autorell.',
    home: 'Terug naar home',
    marketplace: 'Voertuigen zoeken',
    account: 'Mijn account',
    support: 'Support contacteren',
    popularTitle: 'Populaire vervolgstappen',
    cars: 'Auto’s',
    vans: 'Bestelwagens',
    motorcycles: 'Motoren',
    companies: 'Zakelijk',
    sell: 'Voertuig verkopen',
    label: 'Pagina niet gevonden',
    homeAria: 'Autorell homepage',
  },
  pl: {
    eyebrow: 'Nie znaleziono strony',
    heading: 'Nie możemy znaleźć tej strony.',
    description:
      'Ogłoszenie, strona konta lub link mogły zostać przeniesione. Wyszukaj pojazdy, wróć na stronę główną albo skontaktuj się z Autorell.',
    home: 'Wróć na start',
    marketplace: 'Szukaj pojazdów',
    account: 'Moje konto',
    support: 'Kontakt z pomocą',
    popularTitle: 'Popularne miejsca',
    cars: 'Samochody',
    vans: 'Dostawcze',
    motorcycles: 'Motocykle',
    companies: 'Dla firm',
    sell: 'Sprzedaj pojazd',
    label: 'Nie znaleziono strony',
    homeAria: 'Strona główna Autorell',
  },
  da: {
    eyebrow: 'Siden blev ikke fundet',
    heading: 'Vi kan ikke finde siden.',
    description:
      'Annoncen, kontosiden eller linket kan være flyttet. Søg efter køretøjer, gå tilbage til forsiden eller kontakt Autorell.',
    home: 'Til forsiden',
    marketplace: 'Søg køretøjer',
    account: 'Min konto',
    support: 'Kontakt support',
    popularTitle: 'Populære veje videre',
    cars: 'Biler',
    vans: 'Varebiler',
    motorcycles: 'Motorcykler',
    companies: 'Erhverv',
    sell: 'Sælg køretøj',
    label: 'Siden blev ikke fundet',
    homeAria: 'Autorell forside',
  },
  fi: {
    eyebrow: 'Sivua ei löytynyt',
    heading: 'Emme löydä tätä sivua.',
    description:
      'Ilmoitus, tilisivu tai linkki on voitu siirtää. Hae ajoneuvoja, palaa etusivulle tai ota yhteyttä Autorelliin.',
    home: 'Takaisin etusivulle',
    marketplace: 'Hae ajoneuvoja',
    account: 'Oma tili',
    support: 'Ota yhteyttä',
    popularTitle: 'Hyödyllisiä sivuja',
    cars: 'Autot',
    vans: 'Pakettiautot',
    motorcycles: 'Moottoripyörät',
    companies: 'Yrityksille',
    sell: 'Myy ajoneuvo',
    label: 'Sivua ei löytynyt',
    homeAria: 'Autorell etusivu',
  },
}

function languageForLocale(locale: PublicLocale): keyof typeof copyByLanguage {
  if (locale === 'at') return 'de'
  if (locale === 'be') return 'fr'
  return locale
}

export function getNotFoundCopy(locale: PublicLocale) {
  return copyByLanguage[languageForLocale(locale)] ?? copyByLanguage.en
}
