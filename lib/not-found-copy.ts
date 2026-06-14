import type { EuBuyerLanguage } from '@/lib/eu-buyer-markets'

export type NotFoundLanguage = EuBuyerLanguage | 'sv'

type NotFoundCopy = {
  heading: string
  description: string
  home: string
  action: string
  label: string
  homeAria: string
}

const en: NotFoundCopy = {
  heading: 'This road does not lead to the right place.',
  description:
    'The page may have moved or the link may be incorrect. Return to the homepage or apply for professional dealer access.',
  home: 'Back to homepage',
  action: 'Apply for dealer access',
  label: 'Page not found',
  homeAria: 'Autorell homepage',
}

export const notFoundCopy: Record<NotFoundLanguage, NotFoundCopy> = {
  en,
  sv: {
    heading: 'Den här vägen leder inte rätt.',
    description:
      'Sidan kan ha flyttats eller länken kan vara fel. Gå tillbaka till startsidan eller börja sälja din bil.',
    home: 'Till startsidan',
    action: 'Sälj din bil',
    label: 'Sidan hittades inte',
    homeAria: 'Autorell startsida',
  },
  de: {
    heading: 'Dieser Weg führt nicht zum Ziel.',
    description:
      'Die Seite wurde möglicherweise verschoben oder der Link ist falsch. Kehren Sie zur Startseite zurück oder beantragen Sie Händlerzugang.',
    home: 'Zur Startseite',
    action: 'Händlerzugang beantragen',
    label: 'Seite nicht gefunden',
    homeAria: 'Autorell Startseite',
  },
  pl: {
    heading: 'Ta droga nie prowadzi we właściwe miejsce.',
    description:
      'Strona mogła zostać przeniesiona lub link jest nieprawidłowy. Wróć na stronę główną albo złóż wniosek o dostęp dealerski.',
    home: 'Wróć na stronę główną',
    action: 'Złóż wniosek o dostęp',
    label: 'Nie znaleziono strony',
    homeAria: 'Strona główna Autorell',
  },
  nl: {
    heading: 'Deze weg leidt niet naar de juiste plek.',
    description:
      'De pagina is mogelijk verplaatst of de link klopt niet. Ga terug naar de homepage of vraag dealertoegang aan.',
    home: 'Terug naar homepage',
    action: 'Dealertoegang aanvragen',
    label: 'Pagina niet gevonden',
    homeAria: 'Autorell homepage',
  },
  fr: {
    heading: 'Cette route ne mène pas au bon endroit.',
    description:
      'La page a peut-être été déplacée ou le lien est incorrect. Revenez à l’accueil ou demandez un accès professionnel.',
    home: 'Retour à l’accueil',
    action: 'Demander un accès',
    label: 'Page introuvable',
    homeAria: 'Accueil Autorell',
  },
  es: {
    heading: 'Este camino no lleva al lugar correcto.',
    description:
      'La página puede haberse movido o el enlace es incorrecto. Vuelve al inicio o solicita acceso profesional.',
    home: 'Volver al inicio',
    action: 'Solicitar acceso',
    label: 'Página no encontrada',
    homeAria: 'Inicio de Autorell',
  },
  it: {
    heading: 'Questa strada non porta alla pagina giusta.',
    description:
      'La pagina potrebbe essere stata spostata o il link non è corretto. Torna alla home o richiedi l’accesso professionale.',
    home: 'Torna alla home',
    action: 'Richiedi accesso',
    label: 'Pagina non trovata',
    homeAria: 'Homepage Autorell',
  },
  pt: {
    heading: 'Este caminho não leva ao lugar certo.',
    description:
      'A página pode ter sido movida ou a ligação está incorreta. Volte ao início ou peça acesso profissional.',
    home: 'Voltar ao início',
    action: 'Pedir acesso',
    label: 'Página não encontrada',
    homeAria: 'Página inicial Autorell',
  },
  da: {
    heading: 'Denne vej fører ikke til det rigtige sted.',
    description:
      'Siden kan være flyttet, eller linket kan være forkert. Gå tilbage til forsiden eller ansøg om forhandleradgang.',
    home: 'Tilbage til forsiden',
    action: 'Ansøg om adgang',
    label: 'Siden blev ikke fundet',
    homeAria: 'Autorell forside',
  },
  fi: {
    heading: 'Tämä reitti ei vie oikeaan paikkaan.',
    description:
      'Sivu on voitu siirtää tai linkki on virheellinen. Palaa etusivulle tai hae jälleenmyyjäoikeutta.',
    home: 'Takaisin etusivulle',
    action: 'Hae käyttöoikeutta',
    label: 'Sivua ei löytynyt',
    homeAria: 'Autorell etusivu',
  },
  cs: {
    heading: 'Tato cesta nevede na správné místo.',
    description:
      'Stránka mohla být přesunuta nebo je odkaz chybný. Vraťte se na úvodní stránku nebo požádejte o přístup pro prodejce.',
    home: 'Zpět na úvod',
    action: 'Požádat o přístup',
    label: 'Stránka nenalezena',
    homeAria: 'Úvodní stránka Autorell',
  },
  sk: {
    heading: 'Táto cesta nevedie na správne miesto.',
    description:
      'Stránka mohla byť presunutá alebo je odkaz chybný. Vráťte sa na úvod alebo požiadajte o prístup pre predajcu.',
    home: 'Späť na úvod',
    action: 'Požiadať o prístup',
    label: 'Stránka sa nenašla',
    homeAria: 'Úvodná stránka Autorell',
  },
  hu: {
    heading: 'Ez az út nem a megfelelő helyre vezet.',
    description:
      'Az oldal áthelyezésre kerülhetett, vagy a hivatkozás hibás. Térjen vissza a főoldalra, vagy kérjen kereskedői hozzáférést.',
    home: 'Vissza a főoldalra',
    action: 'Hozzáférés igénylése',
    label: 'Az oldal nem található',
    homeAria: 'Autorell főoldal',
  },
  ro: {
    heading: 'Acest drum nu duce la locul potrivit.',
    description:
      'Pagina poate fi mutată sau linkul poate fi greșit. Reveniți la pagina principală sau solicitați acces pentru dealeri.',
    home: 'Înapoi la pagina principală',
    action: 'Solicită acces',
    label: 'Pagina nu a fost găsită',
    homeAria: 'Pagina principală Autorell',
  },
  bg: {
    heading: 'Този път не води до правилното място.',
    description:
      'Страницата може да е преместена или връзката да е грешна. Върнете се в началото или кандидатствайте за дилърски достъп.',
    home: 'Към началната страница',
    action: 'Кандидатствайте за достъп',
    label: 'Страницата не е намерена',
    homeAria: 'Начална страница на Autorell',
  },
  hr: {
    heading: 'Ovaj put ne vodi na pravo mjesto.',
    description:
      'Stranica je možda premještena ili poveznica nije ispravna. Vratite se na početnu stranicu ili zatražite pristup za trgovce.',
    home: 'Natrag na početnu',
    action: 'Zatražite pristup',
    label: 'Stranica nije pronađena',
    homeAria: 'Autorell početna stranica',
  },
  sl: {
    heading: 'Ta pot ne vodi na pravo mesto.',
    description:
      'Stran je bila morda premaknjena ali pa povezava ni pravilna. Vrnite se na domačo stran ali zaprosite za dostop trgovca.',
    home: 'Nazaj na domačo stran',
    action: 'Zaprosi za dostop',
    label: 'Strani ni bilo mogoče najti',
    homeAria: 'Domača stran Autorell',
  },
  et: {
    heading: 'See tee ei vii õigesse kohta.',
    description:
      'Leht võib olla teisaldatud või link on vale. Minge tagasi avalehele või taotlege edasimüüja juurdepääsu.',
    home: 'Tagasi avalehele',
    action: 'Taotle juurdepääsu',
    label: 'Lehte ei leitud',
    homeAria: 'Autorelli avaleht',
  },
  lv: {
    heading: 'Šis ceļš neved uz pareizo vietu.',
    description:
      'Lapa var būt pārvietota vai saite ir nepareiza. Atgriezieties sākumlapā vai piesakieties tirgotāja piekļuvei.',
    home: 'Atpakaļ uz sākumlapu',
    action: 'Pieteikties piekļuvei',
    label: 'Lapa nav atrasta',
    homeAria: 'Autorell sākumlapa',
  },
  lt: {
    heading: 'Šis kelias neveda į tinkamą vietą.',
    description:
      'Puslapis galėjo būti perkeltas arba nuoroda neteisinga. Grįžkite į pradžią arba prašykite prekybininko prieigos.',
    home: 'Grįžti į pradžią',
    action: 'Prašyti prieigos',
    label: 'Puslapis nerastas',
    homeAria: 'Autorell pradinis puslapis',
  },
  el: {
    heading: 'Αυτός ο δρόμος δεν οδηγεί στο σωστό σημείο.',
    description:
      'Η σελίδα μπορεί να μετακινήθηκε ή ο σύνδεσμος να είναι λανθασμένος. Επιστρέψτε στην αρχική ή ζητήστε πρόσβαση εμπόρου.',
    home: 'Πίσω στην αρχική',
    action: 'Αίτηση πρόσβασης',
    label: 'Η σελίδα δεν βρέθηκε',
    homeAria: 'Αρχική σελίδα Autorell',
  },
}
