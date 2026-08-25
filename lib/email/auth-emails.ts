import { translationLocale, type PublicLocale } from '@/lib/public-i18n'

export type AuthEmailCopy = {
  subject: string
  preheader: string
  eyebrow: string
  heading: string
  intro: string
  cta: string
  expiry: string
  ignore: string
  footer: string
}

type EmailCopySource = Omit<AuthEmailCopy, 'subject'> & {
  subject: (code: string) => string
}

const otpCopy: Record<string, EmailCopySource> = {
  en: {
    subject: (code) => `${code} is your Autorell sign-in code`,
    preheader: 'Use this one-time code to sign in to Autorell.',
    eyebrow: 'Secure sign-in',
    heading: 'Sign in to Autorell',
    intro: 'Enter the code below to continue to your Autorell account.',
    cta: 'One-time code',
    expiry: 'The code is valid for 10 minutes and can only be used once.',
    ignore: 'If you did not request this code, you can ignore this email.',
    footer: "Europe's trusted marketplace for buying and selling vehicles.",
  },
  sv: {
    subject: (code) => `${code} \u00e4r din inloggningskod f\u00f6r Autorell`,
    preheader: 'Anv\u00e4nd eng\u00e5ngskoden f\u00f6r att logga in p\u00e5 Autorell.',
    eyebrow: 'S\u00e4ker inloggning',
    heading: 'Logga in p\u00e5 Autorell',
    intro: 'Ange koden nedan f\u00f6r att forts\u00e4tta till ditt Autorell-konto.',
    cta: 'Eng\u00e5ngskod',
    expiry: 'Koden \u00e4r giltig i 10 minuter och kan bara anv\u00e4ndas en g\u00e5ng.',
    ignore: 'Om du inte beg\u00e4rde koden kan du ignorera mejlet.',
    footer: 'Europas trygga marknadsplats f\u00f6r k\u00f6p och f\u00f6rs\u00e4ljning av fordon.',
  },
  de: {
    subject: (code) => `${code} ist Ihr Autorell-Anmeldecode`,
    preheader: 'Verwenden Sie diesen Einmalcode, um sich bei Autorell anzumelden.',
    eyebrow: 'Sichere Anmeldung',
    heading: 'Bei Autorell anmelden',
    intro: 'Geben Sie den Code unten ein, um mit Ihrem Autorell-Konto fortzufahren.',
    cta: 'Einmalcode',
    expiry: 'Der Code ist 10 Minuten g\u00fcltig und kann nur einmal verwendet werden.',
    ignore: 'Wenn Sie diesen Code nicht angefordert haben, k\u00f6nnen Sie diese E-Mail ignorieren.',
    footer: 'Europas vertrauensw\u00fcrdiger Marktplatz f\u00fcr den Kauf und Verkauf von Fahrzeugen.',
  },
  fr: {
    subject: (code) => `${code} est votre code de connexion Autorell`,
    preheader: 'Utilisez ce code \u00e0 usage unique pour vous connecter \u00e0 Autorell.',
    eyebrow: 'Connexion s\u00e9curis\u00e9e',
    heading: 'Connectez-vous \u00e0 Autorell',
    intro: 'Saisissez le code ci-dessous pour acc\u00e9der \u00e0 votre compte Autorell.',
    cta: 'Code \u00e0 usage unique',
    expiry: 'Le code est valable 10 minutes et ne peut \u00eatre utilis\u00e9 qu\u2019une seule fois.',
    ignore: 'Si vous n\u2019avez pas demand\u00e9 ce code, vous pouvez ignorer cet e-mail.',
    footer: 'La place de march\u00e9 europ\u00e9enne de confiance pour acheter et vendre des v\u00e9hicules.',
  },
  es: {
    subject: (code) => `${code} es tu c\u00f3digo de acceso a Autorell`,
    preheader: 'Usa este c\u00f3digo de un solo uso para iniciar sesi\u00f3n en Autorell.',
    eyebrow: 'Acceso seguro',
    heading: 'Inicia sesi\u00f3n en Autorell',
    intro: 'Introduce el c\u00f3digo siguiente para continuar con tu cuenta de Autorell.',
    cta: 'C\u00f3digo de un solo uso',
    expiry: 'El c\u00f3digo es v\u00e1lido durante 10 minutos y solo puede usarse una vez.',
    ignore: 'Si no solicitaste este c\u00f3digo, puedes ignorar este correo.',
    footer: 'El marketplace europeo de confianza para comprar y vender veh\u00edculos.',
  },
  it: {
    subject: (code) => `${code} \u00e8 il tuo codice di accesso Autorell`,
    preheader: 'Usa questo codice monouso per accedere ad Autorell.',
    eyebrow: 'Accesso sicuro',
    heading: 'Accedi ad Autorell',
    intro: 'Inserisci il codice qui sotto per continuare con il tuo account Autorell.',
    cta: 'Codice monouso',
    expiry: 'Il codice \u00e8 valido per 10 minuti e pu\u00f2 essere usato una sola volta.',
    ignore: 'Se non hai richiesto questo codice, puoi ignorare questa email.',
    footer: 'Il marketplace europeo affidabile per comprare e vendere veicoli.',
  },
  pl: {
    subject: (code) => `${code} to Tw\u00f3j kod logowania Autorell`,
    preheader: 'U\u017cyj tego jednorazowego kodu, aby zalogowa\u0107 si\u0119 do Autorell.',
    eyebrow: 'Bezpieczne logowanie',
    heading: 'Zaloguj si\u0119 do Autorell',
    intro: 'Wpisz poni\u017cszy kod, aby przej\u015b\u0107 do swojego konta Autorell.',
    cta: 'Kod jednorazowy',
    expiry: 'Kod jest wa\u017cny przez 10 minut i mo\u017cna go u\u017cy\u0107 tylko raz.',
    ignore: 'Je\u015bli nie proszono o ten kod, mo\u017cesz zignorowa\u0107 t\u0119 wiadomo\u015b\u0107.',
    footer: 'Zaufany europejski marketplace do kupna i sprzeda\u017cy pojazd\u00f3w.',
  },
  nl: {
    subject: (code) => `${code} is je Autorell-inlogcode`,
    preheader: 'Gebruik deze eenmalige code om in te loggen bij Autorell.',
    eyebrow: 'Veilig inloggen',
    heading: 'Log in bij Autorell',
    intro: 'Voer de onderstaande code in om door te gaan naar je Autorell-account.',
    cta: 'Eenmalige code',
    expiry: 'De code is 10 minuten geldig en kan slechts \u00e9\u00e9n keer worden gebruikt.',
    ignore: 'Als je deze code niet hebt aangevraagd, kun je deze e-mail negeren.',
    footer: 'De vertrouwde Europese marktplaats voor het kopen en verkopen van voertuigen.',
  },
  fi: {
    subject: (code) => `${code} on Autorell-kirjautumiskoodisi`,
    preheader: 'K\u00e4yt\u00e4 t\u00e4t\u00e4 kertak\u00e4ytt\u00f6koodia kirjautuaksesi Autorelliin.',
    eyebrow: 'Turvallinen kirjautuminen',
    heading: 'Kirjaudu Autorelliin',
    intro: 'Sy\u00f6t\u00e4 alla oleva koodi jatkaaksesi Autorell-tilillesi.',
    cta: 'Kertak\u00e4ytt\u00f6koodi',
    expiry: 'Koodi on voimassa 10 minuuttia ja sit\u00e4 voi k\u00e4ytt\u00e4\u00e4 vain kerran.',
    ignore: 'Jos et pyyt\u00e4nyt t\u00e4t\u00e4 koodia, voit ohittaa t\u00e4m\u00e4n s\u00e4hk\u00f6postin.',
    footer: 'Euroopan luotettu markkinapaikka ajoneuvojen ostoon ja myyntiin.',
  },
  da: {
    subject: (code) => `${code} er din Autorell-login-kode`,
    preheader: 'Brug denne engangskode til at logge ind p\u00e5 Autorell.',
    eyebrow: 'Sikker login',
    heading: 'Log ind p\u00e5 Autorell',
    intro: 'Indtast koden nedenfor for at forts\u00e6tte til din Autorell-konto.',
    cta: 'Engangskode',
    expiry: 'Koden er gyldig i 10 minutter og kan kun bruges \u00e9n gang.',
    ignore: 'Hvis du ikke har bedt om denne kode, kan du ignorere denne mail.',
    footer: 'Europas betroede markedsplads for k\u00f8b og salg af k\u00f8ret\u00f8jer.',
  },
}

const resetCopy: Record<string, AuthEmailCopy> = {
  en: {
    subject: 'Reset your Autorell password',
    preheader: 'Use this secure link to reset your Autorell account password.',
    eyebrow: 'Password reset',
    heading: 'Choose a new password',
    intro: 'We received a request to reset the password for your Autorell marketplace account.',
    cta: 'Reset password',
    expiry: 'The link is temporary and can only be used once.',
    ignore: 'If you did not request this reset, you can ignore this email.',
    footer: 'Security messages are sent from noreply@autorell.com.',
  },
  sv: {
    subject: '\u00c5terst\u00e4ll ditt Autorell-l\u00f6senord',
    preheader: 'Anv\u00e4nd den h\u00e4r s\u00e4kra l\u00e4nken f\u00f6r att v\u00e4lja ett nytt l\u00f6senord.',
    eyebrow: '\u00c5terst\u00e4ll l\u00f6senord',
    heading: 'V\u00e4lj ett nytt l\u00f6senord',
    intro: 'Vi har f\u00e5tt en beg\u00e4ran om att \u00e5terst\u00e4lla l\u00f6senordet f\u00f6r ditt Autorell-konto.',
    cta: '\u00c5terst\u00e4ll l\u00f6senord',
    expiry: 'L\u00e4nken \u00e4r tillf\u00e4llig och kan bara anv\u00e4ndas en g\u00e5ng.',
    ignore: 'Om du inte beg\u00e4rde \u00e5terst\u00e4llningen kan du ignorera det h\u00e4r mejlet.',
    footer: 'S\u00e4kerhetsmeddelanden skickas fr\u00e5n noreply@autorell.com.',
  },
  de: {
    subject: 'Autorell-Passwort zur\u00fccksetzen',
    preheader: 'Verwenden Sie diesen sicheren Link, um ein neues Passwort zu w\u00e4hlen.',
    eyebrow: 'Passwort zur\u00fccksetzen',
    heading: 'W\u00e4hlen Sie ein neues Passwort',
    intro: 'Wir haben eine Anfrage erhalten, das Passwort f\u00fcr Ihr Autorell-Konto zur\u00fcckzusetzen.',
    cta: 'Passwort zur\u00fccksetzen',
    expiry: 'Der Link ist zeitlich begrenzt und kann nur einmal verwendet werden.',
    ignore: 'Wenn Sie diese Zur\u00fccksetzung nicht angefordert haben, k\u00f6nnen Sie diese E-Mail ignorieren.',
    footer: 'Sicherheitsmeldungen werden von noreply@autorell.com gesendet.',
  },
  fr: {
    subject: 'R\u00e9initialisez votre mot de passe Autorell',
    preheader: 'Utilisez ce lien s\u00e9curis\u00e9 pour choisir un nouveau mot de passe.',
    eyebrow: 'R\u00e9initialisation du mot de passe',
    heading: 'Choisissez un nouveau mot de passe',
    intro: 'Nous avons re\u00e7u une demande de r\u00e9initialisation du mot de passe de votre compte Autorell.',
    cta: 'R\u00e9initialiser le mot de passe',
    expiry: 'Le lien est temporaire et ne peut \u00eatre utilis\u00e9 qu\u2019une seule fois.',
    ignore: 'Si vous n\u2019avez pas demand\u00e9 cette r\u00e9initialisation, vous pouvez ignorer cet e-mail.',
    footer: 'Les messages de s\u00e9curit\u00e9 sont envoy\u00e9s depuis noreply@autorell.com.',
  },
  es: {
    subject: 'Restablece tu contrase\u00f1a de Autorell',
    preheader: 'Usa este enlace seguro para elegir una nueva contrase\u00f1a.',
    eyebrow: 'Restablecer contrase\u00f1a',
    heading: 'Elige una nueva contrase\u00f1a',
    intro: 'Hemos recibido una solicitud para restablecer la contrase\u00f1a de tu cuenta de Autorell.',
    cta: 'Restablecer contrase\u00f1a',
    expiry: 'El enlace es temporal y solo puede usarse una vez.',
    ignore: 'Si no solicitaste este restablecimiento, puedes ignorar este correo.',
    footer: 'Los mensajes de seguridad se env\u00edan desde noreply@autorell.com.',
  },
  it: {
    subject: 'Reimposta la password di Autorell',
    preheader: 'Usa questo link sicuro per scegliere una nuova password.',
    eyebrow: 'Reimpostazione password',
    heading: 'Scegli una nuova password',
    intro: 'Abbiamo ricevuto una richiesta per reimpostare la password del tuo account Autorell.',
    cta: 'Reimposta password',
    expiry: 'Il link \u00e8 temporaneo e pu\u00f2 essere usato una sola volta.',
    ignore: 'Se non hai richiesto questa reimpostazione, puoi ignorare questa email.',
    footer: 'I messaggi di sicurezza vengono inviati da noreply@autorell.com.',
  },
  pl: {
    subject: 'Zresetuj has\u0142o do Autorell',
    preheader: 'U\u017cyj tego bezpiecznego linku, aby ustawi\u0107 nowe has\u0142o.',
    eyebrow: 'Resetowanie has\u0142a',
    heading: 'Wybierz nowe has\u0142o',
    intro: 'Otrzymali\u015bmy pro\u015bb\u0119 o zresetowanie has\u0142a do Twojego konta Autorell.',
    cta: 'Zresetuj has\u0142o',
    expiry: 'Link jest tymczasowy i mo\u017cna go u\u017cy\u0107 tylko raz.',
    ignore: 'Je\u015bli nie proszono o reset has\u0142a, mo\u017cesz zignorowa\u0107 t\u0119 wiadomo\u015b\u0107.',
    footer: 'Wiadomo\u015bci bezpiecze\u0144stwa s\u0105 wysy\u0142ane z noreply@autorell.com.',
  },
  nl: {
    subject: 'Reset je Autorell-wachtwoord',
    preheader: 'Gebruik deze beveiligde link om een nieuw wachtwoord te kiezen.',
    eyebrow: 'Wachtwoord resetten',
    heading: 'Kies een nieuw wachtwoord',
    intro: 'We hebben een verzoek ontvangen om het wachtwoord van je Autorell-account te resetten.',
    cta: 'Wachtwoord resetten',
    expiry: 'De link is tijdelijk en kan slechts \u00e9\u00e9n keer worden gebruikt.',
    ignore: 'Als je deze reset niet hebt aangevraagd, kun je deze e-mail negeren.',
    footer: 'Beveiligingsberichten worden verzonden vanaf noreply@autorell.com.',
  },
  fi: {
    subject: 'Palauta Autorell-salasanasi',
    preheader: 'K\u00e4yt\u00e4 t\u00e4t\u00e4 turvallista linkki\u00e4 uuden salasanan valitsemiseen.',
    eyebrow: 'Salasanan palautus',
    heading: 'Valitse uusi salasana',
    intro: 'Saimme pyynn\u00f6n palauttaa Autorell-tilisi salasana.',
    cta: 'Palauta salasana',
    expiry: 'Linkki on v\u00e4liaikainen ja sit\u00e4 voi k\u00e4ytt\u00e4\u00e4 vain kerran.',
    ignore: 'Jos et pyyt\u00e4nyt salasanan palautusta, voit ohittaa t\u00e4m\u00e4n s\u00e4hk\u00f6postin.',
    footer: 'Turvaviestit l\u00e4hetet\u00e4\u00e4n osoitteesta noreply@autorell.com.',
  },
  da: {
    subject: 'Nulstil din Autorell-adgangskode',
    preheader: 'Brug dette sikre link til at v\u00e6lge en ny adgangskode.',
    eyebrow: 'Nulstil adgangskode',
    heading: 'V\u00e6lg en ny adgangskode',
    intro: 'Vi har modtaget en anmodning om at nulstille adgangskoden til din Autorell-konto.',
    cta: 'Nulstil adgangskode',
    expiry: 'Linket er midlertidigt og kan kun bruges \u00e9n gang.',
    ignore: 'Hvis du ikke har anmodet om nulstillingen, kan du ignorere denne mail.',
    footer: 'Sikkerhedsbeskeder sendes fra noreply@autorell.com.',
  },
}

const signupCopy: Record<string, AuthEmailCopy> = {
  en: {
    subject: 'Confirm your Autorell email',
    preheader: 'Use this secure link to confirm your email and activate your Autorell account.',
    eyebrow: 'Email confirmation',
    heading: 'Confirm your email',
    intro: 'Confirm your email address to activate your Autorell account and continue setting up your profile.',
    cta: 'Confirm email',
    expiry: 'The link is temporary and can only be used once.',
    ignore: 'If you did not create an Autorell account, you can ignore this email.',
    footer: 'Security messages are sent from noreply@autorell.com.',
  },
  sv: {
    subject: 'Bekr\u00e4fta din mejladress hos Autorell',
    preheader: 'Anv\u00e4nd den s\u00e4kra l\u00e4nken f\u00f6r att bekr\u00e4fta din mejladress och aktivera kontot.',
    eyebrow: 'Mejlbekr\u00e4ftelse',
    heading: 'Bekr\u00e4fta din mejladress',
    intro: 'Bekr\u00e4fta mejladressen f\u00f6r att aktivera ditt Autorell-konto och forts\u00e4tta skapa din profil.',
    cta: 'Bekr\u00e4fta mejladress',
    expiry: 'L\u00e4nken \u00e4r tillf\u00e4llig och kan bara anv\u00e4ndas en g\u00e5ng.',
    ignore: 'Om du inte skapade ett Autorell-konto kan du ignorera det h\u00e4r mejlet.',
    footer: 'S\u00e4kerhetsmeddelanden skickas fr\u00e5n noreply@autorell.com.',
  },
  de: {
    subject: 'E-Mail-Adresse bei Autorell best\u00e4tigen',
    preheader: 'Best\u00e4tigen Sie Ihre E-Mail-Adresse mit diesem sicheren Link und aktivieren Sie Ihr Konto.',
    eyebrow: 'E-Mail-Best\u00e4tigung',
    heading: 'E-Mail-Adresse best\u00e4tigen',
    intro: 'Best\u00e4tigen Sie Ihre E-Mail-Adresse, um Ihr Autorell-Konto zu aktivieren und Ihr Profil einzurichten.',
    cta: 'E-Mail best\u00e4tigen',
    expiry: 'Der Link ist zeitlich begrenzt und kann nur einmal verwendet werden.',
    ignore: 'Wenn Sie kein Autorell-Konto erstellt haben, k\u00f6nnen Sie diese E-Mail ignorieren.',
    footer: 'Sicherheitsmeldungen werden von noreply@autorell.com gesendet.',
  },
  fr: {
    subject: 'Confirmez votre adresse e-mail Autorell',
    preheader: 'Utilisez ce lien s\u00e9curis\u00e9 pour confirmer votre e-mail et activer votre compte.',
    eyebrow: 'Confirmation de l\u2019e-mail',
    heading: 'Confirmez votre adresse e-mail',
    intro: 'Confirmez votre adresse e-mail pour activer votre compte Autorell et poursuivre la cr\u00e9ation de votre profil.',
    cta: 'Confirmer l\u2019e-mail',
    expiry: 'Le lien est temporaire et ne peut \u00eatre utilis\u00e9 qu\u2019une seule fois.',
    ignore: 'Si vous n\u2019avez pas cr\u00e9\u00e9 de compte Autorell, vous pouvez ignorer cet e-mail.',
    footer: 'Les messages de s\u00e9curit\u00e9 sont envoy\u00e9s depuis noreply@autorell.com.',
  },
  es: {
    subject: 'Confirma tu correo de Autorell',
    preheader: 'Usa este enlace seguro para confirmar tu correo y activar tu cuenta.',
    eyebrow: 'Confirmaci\u00f3n de correo',
    heading: 'Confirma tu correo electr\u00f3nico',
    intro: 'Confirma tu correo para activar tu cuenta de Autorell y continuar configurando tu perfil.',
    cta: 'Confirmar correo',
    expiry: 'El enlace es temporal y solo puede usarse una vez.',
    ignore: 'Si no creaste una cuenta de Autorell, puedes ignorar este correo.',
    footer: 'Los mensajes de seguridad se env\u00edan desde noreply@autorell.com.',
  },
  it: {
    subject: 'Conferma la tua e-mail Autorell',
    preheader: 'Usa questo link sicuro per confermare la tua e-mail e attivare l\u2019account.',
    eyebrow: 'Conferma e-mail',
    heading: 'Conferma il tuo indirizzo e-mail',
    intro: 'Conferma la tua e-mail per attivare l\u2019account Autorell e continuare a configurare il profilo.',
    cta: 'Conferma e-mail',
    expiry: 'Il link \u00e8 temporaneo e pu\u00f2 essere usato una sola volta.',
    ignore: 'Se non hai creato un account Autorell, puoi ignorare questa e-mail.',
    footer: 'I messaggi di sicurezza vengono inviati da noreply@autorell.com.',
  },
  pl: {
    subject: 'Potwierd\u017a adres e-mail w Autorell',
    preheader: 'U\u017cyj bezpiecznego linku, aby potwierdzi\u0107 e-mail i aktywowa\u0107 konto.',
    eyebrow: 'Potwierdzenie e-mail',
    heading: 'Potwierd\u017a adres e-mail',
    intro: 'Potwierd\u017a adres e-mail, aby aktywowa\u0107 konto Autorell i kontynuowa\u0107 tworzenie profilu.',
    cta: 'Potwierd\u017a e-mail',
    expiry: 'Link jest tymczasowy i mo\u017cna go u\u017cy\u0107 tylko raz.',
    ignore: 'Je\u015bli nie utworzono konta Autorell, mo\u017cesz zignorowa\u0107 t\u0119 wiadomo\u015b\u0107.',
    footer: 'Wiadomo\u015bci bezpiecze\u0144stwa s\u0105 wysy\u0142ane z noreply@autorell.com.',
  },
  nl: {
    subject: 'Bevestig je Autorell-e-mailadres',
    preheader: 'Gebruik deze beveiligde link om je e-mailadres te bevestigen en je account te activeren.',
    eyebrow: 'E-mailbevestiging',
    heading: 'Bevestig je e-mailadres',
    intro: 'Bevestig je e-mailadres om je Autorell-account te activeren en verder te gaan met je profiel.',
    cta: 'E-mail bevestigen',
    expiry: 'De link is tijdelijk en kan slechts \u00e9\u00e9n keer worden gebruikt.',
    ignore: 'Als je geen Autorell-account hebt aangemaakt, kun je deze e-mail negeren.',
    footer: 'Beveiligingsberichten worden verzonden vanaf noreply@autorell.com.',
  },
  fi: {
    subject: 'Vahvista Autorell-s\u00e4hk\u00f6postiosoitteesi',
    preheader: 'Vahvista s\u00e4hk\u00f6postisi turvallisen linkin avulla ja aktivoi tilisi.',
    eyebrow: 'S\u00e4hk\u00f6postin vahvistus',
    heading: 'Vahvista s\u00e4hk\u00f6postiosoitteesi',
    intro: 'Vahvista s\u00e4hk\u00f6posti aktivoidaksesi Autorell-tilisi ja jatkaaksesi profiilin luomista.',
    cta: 'Vahvista s\u00e4hk\u00f6posti',
    expiry: 'Linkki on v\u00e4liaikainen ja sit\u00e4 voi k\u00e4ytt\u00e4\u00e4 vain kerran.',
    ignore: 'Jos et luonut Autorell-tili\u00e4, voit ohittaa t\u00e4m\u00e4n viestin.',
    footer: 'Turvaviestit l\u00e4hetet\u00e4\u00e4n osoitteesta noreply@autorell.com.',
  },
  da: {
    subject: 'Bekr\u00e6ft din Autorell-e-mailadresse',
    preheader: 'Brug dette sikre link til at bekr\u00e6fte din e-mail og aktivere din konto.',
    eyebrow: 'E-mailbekr\u00e6ftelse',
    heading: 'Bekr\u00e6ft din e-mailadresse',
    intro: 'Bekr\u00e6ft din e-mail for at aktivere din Autorell-konto og forts\u00e6tte ops\u00e6tningen af din profil.',
    cta: 'Bekr\u00e6ft e-mail',
    expiry: 'Linket er midlertidigt og kan kun bruges \u00e9n gang.',
    ignore: 'Hvis du ikke har oprettet en Autorell-konto, kan du ignorere denne mail.',
    footer: 'Sikkerhedsbeskeder sendes fra noreply@autorell.com.',
  },
}

function copyKey(locale: PublicLocale) {
  const key = translationLocale(locale)
  return key in otpCopy ? key : 'en'
}

export function getOtpEmailCopy(locale: PublicLocale, code: string): AuthEmailCopy {
  const source = otpCopy[copyKey(locale)]
  return { ...source, subject: source.subject(code) }
}

export function getEmailVerificationCodeCopy(locale: PublicLocale, code: string): AuthEmailCopy {
  const base = getOtpEmailCopy(locale, code)
  const localized: Record<string, Partial<AuthEmailCopy>> = {
    en: {
      subject: `${code} is your Autorell email verification code`,
      preheader: 'Use this one-time code to verify your Autorell email address.',
      eyebrow: 'Email verification',
      heading: 'Verify your email',
      intro: 'Enter this code on My pages to verify your email address.',
    },
    sv: {
      subject: `${code} \u00e4r din verifieringskod f\u00f6r Autorell`,
      preheader: 'Anv\u00e4nd eng\u00e5ngskoden f\u00f6r att verifiera din mejladress.',
      eyebrow: 'Mejlverifiering',
      heading: 'Verifiera din mejladress',
      intro: 'Ange koden p\u00e5 Mina sidor f\u00f6r att verifiera din mejladress.',
    },
    de: {
      subject: `${code} ist Ihr Autorell-Verifizierungscode`,
      preheader: 'Verwenden Sie diesen Einmalcode, um Ihre E-Mail-Adresse zu verifizieren.',
      eyebrow: 'E-Mail-Verifizierung',
      heading: 'E-Mail verifizieren',
      intro: 'Geben Sie den Code in Ihrem Konto ein, um Ihre E-Mail-Adresse zu verifizieren.',
    },
    fr: {
      subject: `${code} est votre code de v\u00e9rification Autorell`,
      preheader: 'Utilisez ce code \u00e0 usage unique pour v\u00e9rifier votre e-mail.',
      eyebrow: 'V\u00e9rification e-mail',
      heading: 'V\u00e9rifiez votre e-mail',
      intro: 'Saisissez ce code dans votre compte pour v\u00e9rifier votre adresse e-mail.',
    },
    es: {
      subject: `${code} es tu c\u00f3digo de verificaci\u00f3n de Autorell`,
      preheader: 'Usa este c\u00f3digo de un solo uso para verificar tu correo electr\u00f3nico.',
      eyebrow: 'Verificaci\u00f3n de correo',
      heading: 'Verifica tu correo',
      intro: 'Introduce este c\u00f3digo en tu cuenta para verificar tu direcci\u00f3n de correo.',
    },
    it: {
      subject: `${code} \u00e8 il tuo codice di verifica Autorell`,
      preheader: 'Usa questo codice monouso per verificare la tua e-mail.',
      eyebrow: 'Verifica e-mail',
      heading: 'Verifica la tua e-mail',
      intro: 'Inserisci questo codice nel tuo account per verificare il tuo indirizzo e-mail.',
    },
    pl: {
      subject: `${code} to Tw\u00f3j kod weryfikacyjny Autorell`,
      preheader: 'U\u017cyj tego jednorazowego kodu, aby zweryfikowa\u0107 adres e-mail.',
      eyebrow: 'Weryfikacja e-mail',
      heading: 'Zweryfikuj e-mail',
      intro: 'Wpisz ten kod na swoim koncie, aby zweryfikowa\u0107 adres e-mail.',
    },
    nl: {
      subject: `${code} is je Autorell-verificatiecode`,
      preheader: 'Gebruik deze eenmalige code om je e-mailadres te verifi\u00ebren.',
      eyebrow: 'E-mailverificatie',
      heading: 'Verifieer je e-mail',
      intro: 'Voer deze code in je account in om je e-mailadres te verifi\u00ebren.',
    },
    fi: {
      subject: `${code} on Autorell-vahvistuskoodisi`,
      preheader: 'K\u00e4yt\u00e4 t\u00e4t\u00e4 kertak\u00e4ytt\u00f6koodia s\u00e4hk\u00f6postiosoitteesi vahvistamiseen.',
      eyebrow: 'S\u00e4hk\u00f6postin vahvistus',
      heading: 'Vahvista s\u00e4hk\u00f6posti',
      intro: 'Sy\u00f6t\u00e4 t\u00e4m\u00e4 koodi tilill\u00e4si vahvistaaksesi s\u00e4hk\u00f6postiosoitteesi.',
    },
    da: {
      subject: `${code} er din Autorell-verificeringskode`,
      preheader: 'Brug denne engangskode til at verificere din e-mailadresse.',
      eyebrow: 'E-mailverificering',
      heading: 'Verific\u00e9r din e-mail',
      intro: 'Indtast koden p\u00e5 din konto for at verificere din e-mailadresse.',
    },
  }
  return { ...base, ...(localized[copyKey(locale)] || localized.en) }
}

export function getPasswordResetEmailCopy(locale: PublicLocale): AuthEmailCopy {
  return resetCopy[copyKey(locale)] || resetCopy.en
}

export function getSignupConfirmationEmailCopy(locale: PublicLocale): AuthEmailCopy {
  return signupCopy[copyKey(locale)] || signupCopy.en
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function authEmailHtml(copy: AuthEmailCopy, action?: { href: string; label: string }, code?: string) {
  const safeCopy = Object.fromEntries(
    Object.entries(copy).map(([key, value]) => [key, escapeHtml(value)]),
  ) as AuthEmailCopy
  const safeCode = code ? escapeHtml(code) : ''
  const safeAction = action
    ? { href: escapeHtml(action.href), label: escapeHtml(action.label) }
    : null

  return `
    <!doctype html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="x-apple-disable-message-reformatting" />
        <title>${safeCopy.subject}</title>
      </head>
      <body style="margin:0;background:#f3f7ff;color:#101828;font-family:Arial,Helvetica,sans-serif;">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${safeCopy.preheader}</div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f7ff;padding:36px 12px;">
          <tr><td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;overflow:hidden;border:1px solid #dce5f4;border-radius:24px;background:#ffffff;box-shadow:0 22px 60px rgba(16,24,40,.10);">
              <tr>
                <td style="padding:28px 32px;border-bottom:1px solid #edf1f7;">
                  <img src="https://www.autorell.com/autorell-logo-primary.png" width="138" alt="Autorell" style="display:block;border:0;outline:none;text-decoration:none;height:auto;" />
                  <div style="margin-top:12px;font-size:12px;font-weight:600;letter-spacing:1.8px;text-transform:uppercase;color:#667085;">${safeCopy.eyebrow}</div>
                </td>
              </tr>
              <tr><td style="padding:34px 32px 28px;text-align:left;">
                <h1 style="margin:0;font-size:28px;line-height:1.18;letter-spacing:-1px;color:#101828;font-weight:600;">${safeCopy.heading}</h1>
                <p style="margin:12px 0 0;color:#475467;font-size:15px;line-height:1.7;">${safeCopy.intro}</p>
                ${safeCode ? `<div style="margin:26px 0 0;border-radius:18px;background:#eef5ff;padding:22px;text-align:center;border:1px solid #cfe0ff;"><div style="font-size:12px;font-weight:600;letter-spacing:1.6px;text-transform:uppercase;color:#0866ff;">${safeCopy.cta}</div><div style="margin-top:10px;font-size:46px;font-weight:600;letter-spacing:10px;color:#101828;">${safeCode}</div></div>` : ''}
                ${safeAction ? `<a href="${safeAction.href}" style="display:inline-block;margin-top:26px;border-radius:14px;background:#0866ff;color:#ffffff;text-decoration:none;padding:15px 22px;font-size:14px;font-weight:600;">${safeAction.label}</a>` : ''}
                <p style="margin:22px 0 0;color:#667085;font-size:13px;line-height:1.7;">${safeCopy.expiry}</p>
                <p style="margin:18px 0 0;color:#98a2b3;font-size:12px;line-height:1.6;">${safeCopy.ignore}</p>
              </td></tr>
              <tr><td style="padding:20px 32px;border-top:1px solid #edf1f7;color:#98a2b3;font-size:12px;line-height:1.6;">Autorell marketplace<br />${safeCopy.footer}</td></tr>
            </table>
          </td></tr>
        </table>
      </body>
    </html>
  `
}
