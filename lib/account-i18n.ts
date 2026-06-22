import type { PublicLocale } from './public-i18n'

export type AccountCopy = {
  account: string
  signIn: string
  register: string
  email: string
  password: string
  name: string
  phone: string
  country: string
  privateAccount: string
  businessAccount: string
  company: string
  registrationNumber: string
  profile: string
  listings: string
  messages: string
  support: string
  signOut: string
  save: string
  createAccount: string
  noAccount: string
  haveAccount: string
}

const en: AccountCopy = {
  account: 'Account',
  signIn: 'Sign in',
  register: 'Register',
  email: 'Email',
  password: 'Password',
  name: 'Name',
  phone: 'Phone number',
  country: 'Country',
  privateAccount: 'Private account',
  businessAccount: 'Business account',
  company: 'Company name',
  registrationNumber: 'Company registration number',
  profile: 'Profile',
  listings: 'Listings',
  messages: 'Messages',
  support: 'Help & safety',
  signOut: 'Sign out',
  save: 'Save',
  createAccount: 'Create account',
  noAccount: 'No account yet?',
  haveAccount: 'Already have an account?',
}

const translations: Partial<Record<PublicLocale, Partial<AccountCopy>>> = {
  sv: { account: 'Konto', signIn: 'Logga in', register: 'Registrera', email: 'E-post', password: 'Lösenord', name: 'Namn', phone: 'Telefonnummer', country: 'Land', privateAccount: 'Privatkonto', businessAccount: 'Företagskonto', company: 'Företagsnamn', registrationNumber: 'Organisationsnummer', profile: 'Profil', listings: 'Annonser', messages: 'Meddelanden', support: 'Hjälp & trygghet', signOut: 'Logga ut', save: 'Spara', createAccount: 'Skapa konto', noAccount: 'Inget konto ännu?', haveAccount: 'Har du redan ett konto?' },
  de: { account: 'Konto', signIn: 'Anmelden', register: 'Registrieren', email: 'E-Mail', password: 'Passwort', name: 'Name', phone: 'Telefonnummer', country: 'Land', privateAccount: 'Privatkonto', businessAccount: 'Unternehmenskonto', company: 'Firmenname', registrationNumber: 'Handelsregisternummer', profile: 'Profil', listings: 'Anzeigen', messages: 'Nachrichten', support: 'Hilfe & Sicherheit', signOut: 'Abmelden', save: 'Speichern', createAccount: 'Konto erstellen', noAccount: 'Noch kein Konto?', haveAccount: 'Bereits registriert?' },
  fr: { account: 'Compte', signIn: 'Se connecter', register: "S'inscrire", email: 'E-mail', password: 'Mot de passe', name: 'Nom', phone: 'Téléphone', country: 'Pays', privateAccount: 'Compte particulier', businessAccount: 'Compte entreprise', company: "Nom de l'entreprise", registrationNumber: "Numéro d'immatriculation", profile: 'Profil', listings: 'Annonces', messages: 'Messages', support: 'Aide et sécurité', signOut: 'Déconnexion', save: 'Enregistrer', createAccount: 'Créer un compte' },
  es: { account: 'Cuenta', signIn: 'Iniciar sesión', register: 'Registrarse', email: 'Correo electrónico', password: 'Contraseña', name: 'Nombre', phone: 'Teléfono', country: 'País', privateAccount: 'Cuenta particular', businessAccount: 'Cuenta de empresa', company: 'Empresa', registrationNumber: 'Número de registro', profile: 'Perfil', listings: 'Anuncios', messages: 'Mensajes', support: 'Ayuda y seguridad', signOut: 'Cerrar sesión', save: 'Guardar', createAccount: 'Crear cuenta' },
  it: { account: 'Account', signIn: 'Accedi', register: 'Registrati', email: 'E-mail', password: 'Password', name: 'Nome', phone: 'Telefono', country: 'Paese', privateAccount: 'Account privato', businessAccount: 'Account aziendale', company: 'Azienda', registrationNumber: 'Numero di registrazione', profile: 'Profilo', listings: 'Annunci', messages: 'Messaggi', support: 'Aiuto e sicurezza', signOut: 'Esci', save: 'Salva', createAccount: 'Crea account' },
  pl: { account: 'Konto', signIn: 'Zaloguj się', register: 'Zarejestruj się', email: 'E-mail', password: 'Hasło', name: 'Imię i nazwisko', phone: 'Telefon', country: 'Kraj', privateAccount: 'Konto prywatne', businessAccount: 'Konto firmowe', company: 'Nazwa firmy', registrationNumber: 'Numer rejestracyjny firmy', profile: 'Profil', listings: 'Ogłoszenia', messages: 'Wiadomości', support: 'Pomoc i bezpieczeństwo', signOut: 'Wyloguj', save: 'Zapisz', createAccount: 'Utwórz konto' },
  nl: { account: 'Account', signIn: 'Inloggen', register: 'Registreren', email: 'E-mail', password: 'Wachtwoord', name: 'Naam', phone: 'Telefoonnummer', country: 'Land', privateAccount: 'Particulier account', businessAccount: 'Zakelijk account', company: 'Bedrijfsnaam', registrationNumber: 'Registratienummer', profile: 'Profiel', listings: 'Advertenties', messages: 'Berichten', support: 'Hulp en veiligheid', signOut: 'Uitloggen', save: 'Opslaan', createAccount: 'Account maken' },
  pt: { account: 'Conta', signIn: 'Entrar', register: 'Registar', email: 'E-mail', password: 'Palavra-passe', name: 'Nome', phone: 'Telefone', country: 'País', privateAccount: 'Conta particular', businessAccount: 'Conta empresarial', company: 'Empresa', registrationNumber: 'Número de registo', profile: 'Perfil', listings: 'Anúncios', messages: 'Mensagens', support: 'Ajuda e segurança', signOut: 'Sair', save: 'Guardar', createAccount: 'Criar conta' },
  fi: { account: 'Tili', signIn: 'Kirjaudu', register: 'Rekisteröidy', email: 'Sähköposti', password: 'Salasana', name: 'Nimi', phone: 'Puhelinnumero', country: 'Maa', privateAccount: 'Yksityistili', businessAccount: 'Yritystili', company: 'Yrityksen nimi', registrationNumber: 'Yritystunnus', profile: 'Profiili', listings: 'Ilmoitukset', messages: 'Viestit', support: 'Ohje ja turvallisuus', signOut: 'Kirjaudu ulos', save: 'Tallenna', createAccount: 'Luo tili' },
  da: { account: 'Konto', signIn: 'Log ind', register: 'Opret konto', email: 'E-mail', password: 'Adgangskode', name: 'Navn', phone: 'Telefonnummer', country: 'Land', privateAccount: 'Privatkonto', businessAccount: 'Virksomhedskonto', company: 'Virksomhedsnavn', registrationNumber: 'Registreringsnummer', profile: 'Profil', listings: 'Annoncer', messages: 'Beskeder', support: 'Hjælp og sikkerhed', signOut: 'Log ud', save: 'Gem', createAccount: 'Opret konto' },
  cs: { account: 'Účet', signIn: 'Přihlásit se', register: 'Registrovat', email: 'E-mail', password: 'Heslo', name: 'Jméno', phone: 'Telefon', country: 'Země', privateAccount: 'Soukromý účet', businessAccount: 'Firemní účet', company: 'Název firmy', registrationNumber: 'Registrační číslo', profile: 'Profil', listings: 'Inzeráty', messages: 'Zprávy', support: 'Pomoc a bezpečnost', signOut: 'Odhlásit se', save: 'Uložit', createAccount: 'Vytvořit účet' },
  ro: { account: 'Cont', signIn: 'Autentificare', register: 'Înregistrare', email: 'E-mail', password: 'Parolă', name: 'Nume', phone: 'Telefon', country: 'Țară', privateAccount: 'Cont privat', businessAccount: 'Cont companie', company: 'Numele companiei', registrationNumber: 'Număr de înregistrare', profile: 'Profil', listings: 'Anunțuri', messages: 'Mesaje', support: 'Ajutor și siguranță', signOut: 'Deconectare', save: 'Salvează', createAccount: 'Creează cont' },
  bg: { account: 'Профил', signIn: 'Вход', register: 'Регистрация', email: 'Имейл', password: 'Парола', name: 'Име', phone: 'Телефон', country: 'Държава', privateAccount: 'Личен профил', businessAccount: 'Фирмен профил', company: 'Фирма', registrationNumber: 'Регистрационен номер', profile: 'Профил', listings: 'Обяви', messages: 'Съобщения', support: 'Помощ и сигурност', signOut: 'Изход', save: 'Запази', createAccount: 'Създай профил' },
  hr: { account: 'Račun', signIn: 'Prijava', register: 'Registracija', email: 'E-pošta', password: 'Lozinka', name: 'Ime', phone: 'Telefon', country: 'Država', privateAccount: 'Privatni račun', businessAccount: 'Poslovni račun', company: 'Tvrtka', registrationNumber: 'Registracijski broj', profile: 'Profil', listings: 'Oglasi', messages: 'Poruke', support: 'Pomoć i sigurnost', signOut: 'Odjava', save: 'Spremi', createAccount: 'Izradi račun' },
  el: { account: 'Λογαριασμός', signIn: 'Σύνδεση', register: 'Εγγραφή', email: 'Email', password: 'Κωδικός', name: 'Όνομα', phone: 'Τηλέφωνο', country: 'Χώρα', privateAccount: 'Ιδιωτικός λογαριασμός', businessAccount: 'Εταιρικός λογαριασμός', company: 'Επωνυμία εταιρείας', registrationNumber: 'Αριθμός μητρώου', profile: 'Προφίλ', listings: 'Αγγελίες', messages: 'Μηνύματα', support: 'Βοήθεια και ασφάλεια', signOut: 'Αποσύνδεση', save: 'Αποθήκευση', createAccount: 'Δημιουργία λογαριασμού' },
  hu: { account: 'Fiók', signIn: 'Bejelentkezés', register: 'Regisztráció', email: 'E-mail', password: 'Jelszó', name: 'Név', phone: 'Telefonszám', country: 'Ország', privateAccount: 'Magánfiók', businessAccount: 'Céges fiók', company: 'Cégnév', registrationNumber: 'Cégjegyzékszám', profile: 'Profil', listings: 'Hirdetések', messages: 'Üzenetek', support: 'Súgó és biztonság', signOut: 'Kijelentkezés', save: 'Mentés', createAccount: 'Fiók létrehozása' },
  sk: { account: 'Účet', signIn: 'Prihlásiť sa', register: 'Registrovať', email: 'E-mail', password: 'Heslo', name: 'Meno', phone: 'Telefón', country: 'Krajina', privateAccount: 'Súkromný účet', businessAccount: 'Firemný účet', company: 'Názov firmy', registrationNumber: 'Registračné číslo', profile: 'Profil', listings: 'Inzeráty', messages: 'Správy', support: 'Pomoc a bezpečnosť', signOut: 'Odhlásiť sa', save: 'Uložiť', createAccount: 'Vytvoriť účet' },
  sl: { account: 'Račun', signIn: 'Prijava', register: 'Registracija', email: 'E-pošta', password: 'Geslo', name: 'Ime', phone: 'Telefon', country: 'Država', privateAccount: 'Zasebni račun', businessAccount: 'Poslovni račun', company: 'Podjetje', registrationNumber: 'Registrska številka', profile: 'Profil', listings: 'Oglasi', messages: 'Sporočila', support: 'Pomoč in varnost', signOut: 'Odjava', save: 'Shrani', createAccount: 'Ustvari račun' },
  et: { account: 'Konto', signIn: 'Logi sisse', register: 'Registreeru', email: 'E-post', password: 'Parool', name: 'Nimi', phone: 'Telefon', country: 'Riik', privateAccount: 'Erakonto', businessAccount: 'Ettevõttekonto', company: 'Ettevõtte nimi', registrationNumber: 'Registrikood', profile: 'Profiil', listings: 'Kuulutused', messages: 'Sõnumid', support: 'Abi ja turvalisus', signOut: 'Logi välja', save: 'Salvesta', createAccount: 'Loo konto' },
  lv: { account: 'Konts', signIn: 'Pieteikties', register: 'Reģistrēties', email: 'E-pasts', password: 'Parole', name: 'Vārds', phone: 'Tālrunis', country: 'Valsts', privateAccount: 'Privāts konts', businessAccount: 'Uzņēmuma konts', company: 'Uzņēmuma nosaukums', registrationNumber: 'Reģistrācijas numurs', profile: 'Profils', listings: 'Sludinājumi', messages: 'Ziņas', support: 'Palīdzība un drošība', signOut: 'Izrakstīties', save: 'Saglabāt', createAccount: 'Izveidot kontu' },
  lt: { account: 'Paskyra', signIn: 'Prisijungti', register: 'Registruotis', email: 'El. paštas', password: 'Slaptažodis', name: 'Vardas', phone: 'Telefonas', country: 'Šalis', privateAccount: 'Privati paskyra', businessAccount: 'Įmonės paskyra', company: 'Įmonės pavadinimas', registrationNumber: 'Registracijos numeris', profile: 'Profilis', listings: 'Skelbimai', messages: 'Žinutės', support: 'Pagalba ir saugumas', signOut: 'Atsijungti', save: 'Išsaugoti', createAccount: 'Sukurti paskyrą' },
}

export function getAccountCopy(locale: PublicLocale): AccountCopy {
  return { ...en, ...(translations[locale] || {}) }
}
