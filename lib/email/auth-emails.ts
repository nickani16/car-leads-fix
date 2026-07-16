import type { PublicLocale } from '@/lib/public-i18n'

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

const otpCopy = {
  en: {
    subject: (code: string) => `${code} is your Autorell sign-in code`,
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
    subject: (code: string) => `${code} är din inloggningskod för Autorell`,
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
    subject: (code: string) => `${code} ist Ihr Autorell-Anmeldecode`,
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
    subject: (code: string) => `${code} est votre code de connexion Autorell`,
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
    subject: (code: string) => `${code} es tu código de acceso a Autorell`,
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
    subject: (code: string) => `${code} è il tuo codice di accesso Autorell`,
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
    subject: (code: string) => `${code} to Twój kod logowania Autorell`,
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
    subject: (code: string) => `${code} is je Autorell-inlogcode`,
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
    subject: (code: string) => `${code} on Autorell-kirjautumiskoodisi`,
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
    subject: (code: string) => `${code} er din Autorell-login-kode`,
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

const resetCopy = {
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

export function getOtpEmailCopy(locale: PublicLocale, code: string): AuthEmailCopy {
  const key = locale === 'at' ? 'de' : locale === 'be' ? 'nl' : locale
  const copy = otpCopy[key as keyof typeof otpCopy] || otpCopy.en
  return { ...copy, subject: copy.subject(code) }
}

export function getPasswordResetEmailCopy(locale: PublicLocale): AuthEmailCopy {
  const key = locale === 'at' ? 'de' : locale === 'be' ? 'nl' : locale
  return resetCopy[key as keyof typeof resetCopy] || resetCopy.en
}

export function authEmailHtml(copy: AuthEmailCopy, action?: { href: string; label: string }, code?: string) {
  return `
    <!doctype html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="x-apple-disable-message-reformatting" />
        <title>${copy.subject}</title>
      </head>
      <body style="margin:0;background:#f3f7ff;color:#101828;font-family:Arial,Helvetica,sans-serif;">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${copy.preheader}</div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f7ff;padding:36px 12px;">
          <tr><td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;overflow:hidden;border:1px solid #dce5f4;border-radius:24px;background:#ffffff;box-shadow:0 22px 60px rgba(16,24,40,.10);">
              <tr>
                <td style="padding:28px 32px;border-bottom:1px solid #edf1f7;">
                  <img src="https://www.autorell.com/autorell-logo-primary.png" width="138" alt="Autorell" style="display:block;border:0;outline:none;text-decoration:none;height:auto;" />
                  <div style="margin-top:12px;font-size:12px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:#667085;">${copy.eyebrow}</div>
                </td>
              </tr>
              <tr><td style="padding:34px 32px 28px;text-align:left;">
                <h1 style="margin:0;font-size:28px;line-height:1.18;letter-spacing:-1px;color:#101828;">${copy.heading}</h1>
                <p style="margin:12px 0 0;color:#475467;font-size:15px;line-height:1.7;">${copy.intro}</p>
                ${code ? `<div style="margin:26px 0 0;border-radius:18px;background:#eef5ff;padding:22px;text-align:center;border:1px solid #cfe0ff;"><div style="font-size:12px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#0866ff;">${copy.cta}</div><div style="margin-top:10px;font-size:46px;font-weight:800;letter-spacing:10px;color:#101828;">${code}</div></div>` : ''}
                ${action ? `<a href="${action.href}" style="display:inline-block;margin-top:26px;border-radius:14px;background:#0866ff;color:#ffffff;text-decoration:none;padding:15px 22px;font-size:14px;font-weight:800;">${action.label}</a>` : ''}
                <p style="margin:22px 0 0;color:#667085;font-size:13px;line-height:1.7;">${copy.expiry}</p>
                <p style="margin:18px 0 0;color:#98a2b3;font-size:12px;line-height:1.6;">${copy.ignore}</p>
              </td></tr>
              <tr><td style="padding:20px 32px;border-top:1px solid #edf1f7;color:#98a2b3;font-size:12px;line-height:1.6;">Autorell marketplace<br />${copy.footer}</td></tr>
            </table>
          </td></tr>
        </table>
      </body>
    </html>
  `
}
