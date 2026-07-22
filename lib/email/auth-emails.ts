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
    subject: (code) => `${code} är din inloggningskod för Autorell`,
    preheader: 'Använd engångskoden för att logga in på Autorell.',
    eyebrow: 'Säker inloggning',
    heading: 'Logga in på Autorell',
    intro: 'Ange koden nedan för att fortsätta till ditt Autorell-konto.',
    cta: 'Engångskod',
    expiry: 'Koden är giltig i 10 minuter och kan bara användas en gång.',
    ignore: 'Om du inte begärde koden kan du ignorera mejlet.',
    footer: 'Europas trygga marknadsplats för köp och försäljning av fordon.',
  },
  de: {
    subject: (code) => `${code} ist Ihr Autorell-Anmeldecode`,
    preheader: 'Verwenden Sie diesen Einmalcode, um sich bei Autorell anzumelden.',
    eyebrow: 'Sichere Anmeldung',
    heading: 'Bei Autorell anmelden',
    intro: 'Geben Sie den Code unten ein, um mit Ihrem Autorell-Konto fortzufahren.',
    cta: 'Einmalcode',
    expiry: 'Der Code ist 10 Minuten gültig und kann nur einmal verwendet werden.',
    ignore: 'Wenn Sie diesen Code nicht angefordert haben, können Sie diese E-Mail ignorieren.',
    footer: 'Europas vertrauenswürdiger Marktplatz für den Kauf und Verkauf von Fahrzeugen.',
  },
  fr: {
    subject: (code) => `${code} est votre code de connexion Autorell`,
    preheader: 'Utilisez ce code à usage unique pour vous connecter à Autorell.',
    eyebrow: 'Connexion sécurisée',
    heading: 'Connectez-vous à Autorell',
    intro: 'Saisissez le code ci-dessous pour accéder à votre compte Autorell.',
    cta: 'Code à usage unique',
    expiry: 'Le code est valable 10 minutes et ne peut être utilisé qu’une seule fois.',
    ignore: 'Si vous n’avez pas demandé ce code, vous pouvez ignorer cet e-mail.',
    footer: 'La place de marché européenne de confiance pour acheter et vendre des véhicules.',
  },
  es: {
    subject: (code) => `${code} es tu código de acceso a Autorell`,
    preheader: 'Usa este código de un solo uso para iniciar sesión en Autorell.',
    eyebrow: 'Acceso seguro',
    heading: 'Inicia sesión en Autorell',
    intro: 'Introduce el código siguiente para continuar con tu cuenta de Autorell.',
    cta: 'Código de un solo uso',
    expiry: 'El código es válido durante 10 minutos y solo puede usarse una vez.',
    ignore: 'Si no solicitaste este código, puedes ignorar este correo.',
    footer: 'El marketplace europeo de confianza para comprar y vender vehículos.',
  },
  it: {
    subject: (code) => `${code} è il tuo codice di accesso Autorell`,
    preheader: 'Usa questo codice monouso per accedere ad Autorell.',
    eyebrow: 'Accesso sicuro',
    heading: 'Accedi ad Autorell',
    intro: 'Inserisci il codice qui sotto per continuare con il tuo account Autorell.',
    cta: 'Codice monouso',
    expiry: 'Il codice è valido per 10 minuti e può essere usato una sola volta.',
    ignore: 'Se non hai richiesto questo codice, puoi ignorare questa email.',
    footer: 'Il marketplace europeo affidabile per comprare e vendere veicoli.',
  },
  pl: {
    subject: (code) => `${code} to Twój kod logowania Autorell`,
    preheader: 'Użyj tego jednorazowego kodu, aby zalogować się do Autorell.',
    eyebrow: 'Bezpieczne logowanie',
    heading: 'Zaloguj się do Autorell',
    intro: 'Wpisz poniższy kod, aby przejść do swojego konta Autorell.',
    cta: 'Kod jednorazowy',
    expiry: 'Kod jest ważny przez 10 minut i można go użyć tylko raz.',
    ignore: 'Jeśli nie proszono o ten kod, możesz zignorować tę wiadomość.',
    footer: 'Zaufany europejski marketplace do kupna i sprzedaży pojazdów.',
  },
  nl: {
    subject: (code) => `${code} is je Autorell-inlogcode`,
    preheader: 'Gebruik deze eenmalige code om in te loggen bij Autorell.',
    eyebrow: 'Veilig inloggen',
    heading: 'Log in bij Autorell',
    intro: 'Voer de onderstaande code in om door te gaan naar je Autorell-account.',
    cta: 'Eenmalige code',
    expiry: 'De code is 10 minuten geldig en kan slechts één keer worden gebruikt.',
    ignore: 'Als je deze code niet hebt aangevraagd, kun je deze e-mail negeren.',
    footer: 'De vertrouwde Europese marktplaats voor het kopen en verkopen van voertuigen.',
  },
  fi: {
    subject: (code) => `${code} on Autorell-kirjautumiskoodisi`,
    preheader: 'Käytä tätä kertakäyttökoodia kirjautuaksesi Autorelliin.',
    eyebrow: 'Turvallinen kirjautuminen',
    heading: 'Kirjaudu Autorelliin',
    intro: 'Syötä alla oleva koodi jatkaaksesi Autorell-tilillesi.',
    cta: 'Kertakäyttökoodi',
    expiry: 'Koodi on voimassa 10 minuuttia ja sitä voi käyttää vain kerran.',
    ignore: 'Jos et pyytänyt tätä koodia, voit ohittaa tämän sähköpostin.',
    footer: 'Euroopan luotettu markkinapaikka ajoneuvojen ostoon ja myyntiin.',
  },
  da: {
    subject: (code) => `${code} er din Autorell-login-kode`,
    preheader: 'Brug denne engangskode til at logge ind på Autorell.',
    eyebrow: 'Sikker login',
    heading: 'Log ind på Autorell',
    intro: 'Indtast koden nedenfor for at fortsætte til din Autorell-konto.',
    cta: 'Engangskode',
    expiry: 'Koden er gyldig i 10 minutter og kan kun bruges én gang.',
    ignore: 'Hvis du ikke har bedt om denne kode, kan du ignorere denne mail.',
    footer: 'Europas betroede markedsplads for køb og salg af køretøjer.',
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
    subject: 'Återställ ditt Autorell-lösenord',
    preheader: 'Använd den här säkra länken för att välja ett nytt lösenord.',
    eyebrow: 'Återställ lösenord',
    heading: 'Välj ett nytt lösenord',
    intro: 'Vi har fått en begäran om att återställa lösenordet för ditt Autorell-konto.',
    cta: 'Återställ lösenord',
    expiry: 'Länken är tillfällig och kan bara användas en gång.',
    ignore: 'Om du inte begärde återställningen kan du ignorera det här mejlet.',
    footer: 'Säkerhetsmeddelanden skickas från noreply@autorell.com.',
  },
  de: {
    subject: 'Autorell-Passwort zurücksetzen',
    preheader: 'Verwenden Sie diesen sicheren Link, um ein neues Passwort zu wählen.',
    eyebrow: 'Passwort zurücksetzen',
    heading: 'Wählen Sie ein neues Passwort',
    intro: 'Wir haben eine Anfrage erhalten, das Passwort für Ihr Autorell-Konto zurückzusetzen.',
    cta: 'Passwort zurücksetzen',
    expiry: 'Der Link ist zeitlich begrenzt und kann nur einmal verwendet werden.',
    ignore: 'Wenn Sie diese Zurücksetzung nicht angefordert haben, können Sie diese E-Mail ignorieren.',
    footer: 'Sicherheitsmeldungen werden von noreply@autorell.com gesendet.',
  },
  fr: {
    subject: 'Réinitialisez votre mot de passe Autorell',
    preheader: 'Utilisez ce lien sécurisé pour choisir un nouveau mot de passe.',
    eyebrow: 'Réinitialisation du mot de passe',
    heading: 'Choisissez un nouveau mot de passe',
    intro: 'Nous avons reçu une demande de réinitialisation du mot de passe de votre compte Autorell.',
    cta: 'Réinitialiser le mot de passe',
    expiry: 'Le lien est temporaire et ne peut être utilisé qu’une seule fois.',
    ignore: 'Si vous n’avez pas demandé cette réinitialisation, vous pouvez ignorer cet e-mail.',
    footer: 'Les messages de sécurité sont envoyés depuis noreply@autorell.com.',
  },
  es: {
    subject: 'Restablece tu contraseña de Autorell',
    preheader: 'Usa este enlace seguro para elegir una nueva contraseña.',
    eyebrow: 'Restablecer contraseña',
    heading: 'Elige una nueva contraseña',
    intro: 'Hemos recibido una solicitud para restablecer la contraseña de tu cuenta de Autorell.',
    cta: 'Restablecer contraseña',
    expiry: 'El enlace es temporal y solo puede usarse una vez.',
    ignore: 'Si no solicitaste este restablecimiento, puedes ignorar este correo.',
    footer: 'Los mensajes de seguridad se envían desde noreply@autorell.com.',
  },
  it: {
    subject: 'Reimposta la password di Autorell',
    preheader: 'Usa questo link sicuro per scegliere una nuova password.',
    eyebrow: 'Reimpostazione password',
    heading: 'Scegli una nuova password',
    intro: 'Abbiamo ricevuto una richiesta per reimpostare la password del tuo account Autorell.',
    cta: 'Reimposta password',
    expiry: 'Il link è temporaneo e può essere usato una sola volta.',
    ignore: 'Se non hai richiesto questa reimpostazione, puoi ignorare questa email.',
    footer: 'I messaggi di sicurezza vengono inviati da noreply@autorell.com.',
  },
  pl: {
    subject: 'Zresetuj hasło do Autorell',
    preheader: 'Użyj tego bezpiecznego linku, aby ustawić nowe hasło.',
    eyebrow: 'Resetowanie hasła',
    heading: 'Wybierz nowe hasło',
    intro: 'Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta Autorell.',
    cta: 'Zresetuj hasło',
    expiry: 'Link jest tymczasowy i można go użyć tylko raz.',
    ignore: 'Jeśli nie proszono o reset hasła, możesz zignorować tę wiadomość.',
    footer: 'Wiadomości bezpieczeństwa są wysyłane z noreply@autorell.com.',
  },
  nl: {
    subject: 'Reset je Autorell-wachtwoord',
    preheader: 'Gebruik deze beveiligde link om een nieuw wachtwoord te kiezen.',
    eyebrow: 'Wachtwoord resetten',
    heading: 'Kies een nieuw wachtwoord',
    intro: 'We hebben een verzoek ontvangen om het wachtwoord van je Autorell-account te resetten.',
    cta: 'Wachtwoord resetten',
    expiry: 'De link is tijdelijk en kan slechts één keer worden gebruikt.',
    ignore: 'Als je deze reset niet hebt aangevraagd, kun je deze e-mail negeren.',
    footer: 'Beveiligingsberichten worden verzonden vanaf noreply@autorell.com.',
  },
  fi: {
    subject: 'Palauta Autorell-salasanasi',
    preheader: 'Käytä tätä turvallista linkkiä uuden salasanan valitsemiseen.',
    eyebrow: 'Salasanan palautus',
    heading: 'Valitse uusi salasana',
    intro: 'Saimme pyynnön palauttaa Autorell-tilisi salasana.',
    cta: 'Palauta salasana',
    expiry: 'Linkki on väliaikainen ja sitä voi käyttää vain kerran.',
    ignore: 'Jos et pyytänyt salasanan palautusta, voit ohittaa tämän sähköpostin.',
    footer: 'Turvaviestit lähetetään osoitteesta noreply@autorell.com.',
  },
  da: {
    subject: 'Nulstil din Autorell-adgangskode',
    preheader: 'Brug dette sikre link til at vælge en ny adgangskode.',
    eyebrow: 'Nulstil adgangskode',
    heading: 'Vælg en ny adgangskode',
    intro: 'Vi har modtaget en anmodning om at nulstille adgangskoden til din Autorell-konto.',
    cta: 'Nulstil adgangskode',
    expiry: 'Linket er midlertidigt og kan kun bruges én gang.',
    ignore: 'Hvis du ikke har anmodet om nulstillingen, kan du ignorere denne mail.',
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
      subject: `${code} är din verifieringskod för Autorell`,
      preheader: 'Använd engångskoden för att verifiera din mejladress.',
      eyebrow: 'Mejlverifiering',
      heading: 'Verifiera din mejladress',
      intro: 'Ange koden på Mina sidor för att verifiera din mejladress.',
    },
    de: {
      subject: `${code} ist Ihr Autorell-Verifizierungscode`,
      preheader: 'Verwenden Sie diesen Einmalcode, um Ihre E-Mail-Adresse zu verifizieren.',
      eyebrow: 'E-Mail-Verifizierung',
      heading: 'E-Mail verifizieren',
      intro: 'Geben Sie den Code in Ihrem Konto ein, um Ihre E-Mail-Adresse zu verifizieren.',
    },
    fr: {
      subject: `${code} est votre code de vérification Autorell`,
      preheader: 'Utilisez ce code à usage unique pour vérifier votre e-mail.',
      eyebrow: 'Vérification e-mail',
      heading: 'Vérifiez votre e-mail',
      intro: 'Saisissez ce code dans votre compte pour vérifier votre adresse e-mail.',
    },
    es: {
      subject: `${code} es tu código de verificación de Autorell`,
      preheader: 'Usa este código de un solo uso para verificar tu correo electrónico.',
      eyebrow: 'Verificación de correo',
      heading: 'Verifica tu correo',
      intro: 'Introduce este código en tu cuenta para verificar tu dirección de correo.',
    },
    it: {
      subject: `${code} è il tuo codice di verifica Autorell`,
      preheader: 'Usa questo codice monouso per verificare la tua e-mail.',
      eyebrow: 'Verifica e-mail',
      heading: 'Verifica la tua e-mail',
      intro: 'Inserisci questo codice nel tuo account per verificare il tuo indirizzo e-mail.',
    },
    pl: {
      subject: `${code} to Twój kod weryfikacyjny Autorell`,
      preheader: 'Użyj tego jednorazowego kodu, aby zweryfikować adres e-mail.',
      eyebrow: 'Weryfikacja e-mail',
      heading: 'Zweryfikuj e-mail',
      intro: 'Wpisz ten kod na swoim koncie, aby zweryfikować adres e-mail.',
    },
    nl: {
      subject: `${code} is je Autorell-verificatiecode`,
      preheader: 'Gebruik deze eenmalige code om je e-mailadres te verifiëren.',
      eyebrow: 'E-mailverificatie',
      heading: 'Verifieer je e-mail',
      intro: 'Voer deze code in je account in om je e-mailadres te verifiëren.',
    },
    fi: {
      subject: `${code} on Autorell-vahvistuskoodisi`,
      preheader: 'Käytä tätä kertakäyttökoodia sähköpostiosoitteesi vahvistamiseen.',
      eyebrow: 'Sähköpostin vahvistus',
      heading: 'Vahvista sähköposti',
      intro: 'Syötä tämä koodi tililläsi vahvistaaksesi sähköpostiosoitteesi.',
    },
    da: {
      subject: `${code} er din Autorell-verificeringskode`,
      preheader: 'Brug denne engangskode til at verificere din e-mailadresse.',
      eyebrow: 'E-mailverificering',
      heading: 'Verificér din e-mail',
      intro: 'Indtast koden på din konto for at verificere din e-mailadresse.',
    },
  }
  return { ...base, ...(localized[copyKey(locale)] || localized.en) }
}

export function getPasswordResetEmailCopy(locale: PublicLocale): AuthEmailCopy {
  return resetCopy[copyKey(locale)] || resetCopy.en
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
