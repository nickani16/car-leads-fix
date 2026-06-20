import {
  getEuBuyerCopy,
  getEuBuyerMarket,
  type EuBuyerLanguage,
} from '@/lib/eu-buyer-markets'

export const internationalPageKeys = [
  'vehicles',
  'how-it-works',
  'dealer-benefits',
  'about',
  'faq',
  'contact',
  'privacy',
  'cookies',
  'terms',
] as const

export type InternationalPageKey = (typeof internationalPageKeys)[number]

type NavigationLabels = {
  vehicles: string
  process: string
  benefits: string
  about: string
  faq: string
  contact: string
  privacy: string
  cookies: string
  terms: string
  navigation: string
  platform: string
  company: string
  legal: string
  allMarkets: string
}

const labels: Record<EuBuyerLanguage, NavigationLabels> = {
  en: { vehicles: 'Vehicles', process: 'How it works', benefits: 'Dealer benefits', about: 'About Autorell', faq: 'FAQ', contact: 'Contact', privacy: 'Privacy policy', cookies: 'Cookies', terms: 'Terms of use', navigation: 'Navigation', platform: 'Vehicles & buying', company: 'About Autorell', legal: 'Legal', allMarkets: 'European markets' },
  de: { vehicles: 'Fahrzeuge', process: 'So funktioniert es', benefits: 'Vorteile für Händler', about: 'Über Autorell', faq: 'FAQ', contact: 'Kontakt', privacy: 'Datenschutz', cookies: 'Cookies', terms: 'Nutzungsbedingungen', navigation: 'Navigation', platform: 'Fahrzeuge & Einkauf', company: 'Über Autorell', legal: 'Rechtliches', allMarkets: 'Europäische Märkte' },
  pl: { vehicles: 'Pojazdy', process: 'Jak to działa', benefits: 'Korzyści dla dealerów', about: 'O Autorell', faq: 'FAQ', contact: 'Kontakt', privacy: 'Polityka prywatności', cookies: 'Pliki cookie', terms: 'Warunki użytkowania', navigation: 'Nawigacja', platform: 'Pojazdy i zakup', company: 'O Autorell', legal: 'Informacje prawne', allMarkets: 'Rynki europejskie' },
  nl: { vehicles: 'Voertuigen', process: 'Zo werkt het', benefits: 'Voordelen voor dealers', about: 'Over Autorell', faq: 'FAQ', contact: 'Contact', privacy: 'Privacybeleid', cookies: 'Cookies', terms: 'Gebruiksvoorwaarden', navigation: 'Navigatie', platform: 'Voertuigen & inkoop', company: 'Over Autorell', legal: 'Juridisch', allMarkets: 'Europese markten' },
  fr: { vehicles: 'Véhicules', process: 'Comment ça marche', benefits: 'Avantages professionnels', about: 'À propos d’Autorell', faq: 'FAQ', contact: 'Contact', privacy: 'Politique de confidentialité', cookies: 'Cookies', terms: 'Conditions d’utilisation', navigation: 'Navigation', platform: 'Véhicules et achat', company: 'À propos d’Autorell', legal: 'Informations légales', allMarkets: 'Marchés européens' },
  es: { vehicles: 'Vehículos', process: 'Cómo funciona', benefits: 'Ventajas para profesionales', about: 'Sobre Autorell', faq: 'Preguntas frecuentes', contact: 'Contacto', privacy: 'Política de privacidad', cookies: 'Cookies', terms: 'Condiciones de uso', navigation: 'Navegación', platform: 'Vehículos y compra', company: 'Sobre Autorell', legal: 'Información legal', allMarkets: 'Mercados europeos' },
  it: { vehicles: 'Veicoli', process: 'Come funziona', benefits: 'Vantaggi per i rivenditori', about: 'Chi è Autorell', faq: 'FAQ', contact: 'Contatti', privacy: 'Informativa sulla privacy', cookies: 'Cookie', terms: 'Condizioni d’uso', navigation: 'Navigazione', platform: 'Veicoli e acquisto', company: 'Chi è Autorell', legal: 'Informazioni legali', allMarkets: 'Mercati europei' },
  pt: { vehicles: 'Veículos', process: 'Como funciona', benefits: 'Vantagens para profissionais', about: 'Sobre a Autorell', faq: 'Perguntas frequentes', contact: 'Contacto', privacy: 'Política de privacidade', cookies: 'Cookies', terms: 'Termos de utilização', navigation: 'Navegação', platform: 'Veículos e compra', company: 'Sobre a Autorell', legal: 'Informação legal', allMarkets: 'Mercados europeus' },
  da: { vehicles: 'Køretøjer', process: 'Sådan fungerer det', benefits: 'Fordele for forhandlere', about: 'Om Autorell', faq: 'FAQ', contact: 'Kontakt', privacy: 'Privatlivspolitik', cookies: 'Cookies', terms: 'Brugsvilkår', navigation: 'Navigation', platform: 'Køretøjer og indkøb', company: 'Om Autorell', legal: 'Juridisk', allMarkets: 'Europæiske markeder' },
  fi: { vehicles: 'Ajoneuvot', process: 'Näin se toimii', benefits: 'Edut jälleenmyyjille', about: 'Tietoa Autorellista', faq: 'UKK', contact: 'Yhteystiedot', privacy: 'Tietosuojakäytäntö', cookies: 'Evästeet', terms: 'Käyttöehdot', navigation: 'Navigointi', platform: 'Ajoneuvot ja osto', company: 'Tietoa Autorellista', legal: 'Oikeudelliset tiedot', allMarkets: 'Euroopan markkinat' },
  cs: { vehicles: 'Vozidla', process: 'Jak to funguje', benefits: 'Výhody pro prodejce', about: 'O společnosti Autorell', faq: 'Časté dotazy', contact: 'Kontakt', privacy: 'Zásady ochrany osobních údajů', cookies: 'Cookies', terms: 'Podmínky použití', navigation: 'Navigace', platform: 'Vozidla a nákup', company: 'O společnosti Autorell', legal: 'Právní informace', allMarkets: 'Evropské trhy' },
  sk: { vehicles: 'Vozidlá', process: 'Ako to funguje', benefits: 'Výhody pre predajcov', about: 'O spoločnosti Autorell', faq: 'Časté otázky', contact: 'Kontakt', privacy: 'Ochrana osobných údajov', cookies: 'Cookies', terms: 'Podmienky používania', navigation: 'Navigácia', platform: 'Vozidlá a nákup', company: 'O spoločnosti Autorell', legal: 'Právne informácie', allMarkets: 'Európske trhy' },
  hu: { vehicles: 'Járművek', process: 'Hogyan működik', benefits: 'Előnyök kereskedőknek', about: 'Az Autorellről', faq: 'GYIK', contact: 'Kapcsolat', privacy: 'Adatvédelmi irányelvek', cookies: 'Cookie-k', terms: 'Felhasználási feltételek', navigation: 'Navigáció', platform: 'Járművek és beszerzés', company: 'Az Autorellről', legal: 'Jogi információk', allMarkets: 'Európai piacok' },
  ro: { vehicles: 'Vehicule', process: 'Cum funcționează', benefits: 'Avantaje pentru dealeri', about: 'Despre Autorell', faq: 'Întrebări frecvente', contact: 'Contact', privacy: 'Politica de confidențialitate', cookies: 'Cookie-uri', terms: 'Condiții de utilizare', navigation: 'Navigare', platform: 'Vehicule și achiziții', company: 'Despre Autorell', legal: 'Informații juridice', allMarkets: 'Piețe europene' },
  bg: { vehicles: 'Автомобили', process: 'Как работи', benefits: 'Предимства за търговци', about: 'За Autorell', faq: 'Често задавани въпроси', contact: 'Контакт', privacy: 'Политика за поверителност', cookies: 'Бисквитки', terms: 'Условия за ползване', navigation: 'Навигация', platform: 'Автомобили и покупки', company: 'За Autorell', legal: 'Правна информация', allMarkets: 'Европейски пазари' },
  el: { vehicles: 'Οχήματα', process: 'Πώς λειτουργεί', benefits: 'Οφέλη για εμπόρους', about: 'Σχετικά με την Autorell', faq: 'Συχνές ερωτήσεις', contact: 'Επικοινωνία', privacy: 'Πολιτική απορρήτου', cookies: 'Cookies', terms: 'Όροι χρήσης', navigation: 'Πλοήγηση', platform: 'Οχήματα και αγορές', company: 'Σχετικά με την Autorell', legal: 'Νομικές πληροφορίες', allMarkets: 'Ευρωπαϊκές αγορές' },
  hr: { vehicles: 'Vozila', process: 'Kako funkcionira', benefits: 'Prednosti za trgovce', about: 'O Autorellu', faq: 'Česta pitanja', contact: 'Kontakt', privacy: 'Pravila privatnosti', cookies: 'Kolačići', terms: 'Uvjeti korištenja', navigation: 'Navigacija', platform: 'Vozila i nabava', company: 'O Autorellu', legal: 'Pravne informacije', allMarkets: 'Europska tržišta' },
  sl: { vehicles: 'Vozila', process: 'Kako deluje', benefits: 'Prednosti za trgovce', about: 'O Autorellu', faq: 'Pogosta vprašanja', contact: 'Kontakt', privacy: 'Politika zasebnosti', cookies: 'Piškotki', terms: 'Pogoji uporabe', navigation: 'Navigacija', platform: 'Vozila in nabava', company: 'O Autorellu', legal: 'Pravne informacije', allMarkets: 'Evropski trgi' },
  et: { vehicles: 'Sõidukid', process: 'Kuidas see toimib', benefits: 'Edasimüüja eelised', about: 'Autorellist', faq: 'KKK', contact: 'Kontakt', privacy: 'Privaatsuspoliitika', cookies: 'Küpsised', terms: 'Kasutustingimused', navigation: 'Navigeerimine', platform: 'Sõidukid ja ostmine', company: 'Autorellist', legal: 'Õigusteave', allMarkets: 'Euroopa turud' },
  lv: { vehicles: 'Transportlīdzekļi', process: 'Kā tas darbojas', benefits: 'Ieguvumi tirgotājiem', about: 'Par Autorell', faq: 'BUJ', contact: 'Kontakti', privacy: 'Privātuma politika', cookies: 'Sīkdatnes', terms: 'Lietošanas noteikumi', navigation: 'Navigācija', platform: 'Transportlīdzekļi un iepirkšana', company: 'Par Autorell', legal: 'Juridiskā informācija', allMarkets: 'Eiropas tirgi' },
  lt: { vehicles: 'Automobiliai', process: 'Kaip tai veikia', benefits: 'Nauda prekybininkams', about: 'Apie Autorell', faq: 'DUK', contact: 'Kontaktai', privacy: 'Privatumo politika', cookies: 'Slapukai', terms: 'Naudojimo sąlygos', navigation: 'Navigacija', platform: 'Automobiliai ir pirkimas', company: 'Apie Autorell', legal: 'Teisinė informacija', allMarkets: 'Europos rinkos' },
}

export function getInternationalSite(marketCode: string) {
  const market = getEuBuyerMarket(marketCode)
  if (!market) return null

  const copy = getEuBuyerCopy(market.language)
  const navigation = labels[market.language]
  const prefix = `/${market.code}`

  return {
    market,
    copy,
    navigation,
    prefix,
    href(page: InternationalPageKey | '') {
      return page ? `${prefix}/${page}` : prefix
    },
  }
}

export function isInternationalPageKey(
  value: string,
): value is InternationalPageKey {
  return internationalPageKeys.includes(value as InternationalPageKey)
}
