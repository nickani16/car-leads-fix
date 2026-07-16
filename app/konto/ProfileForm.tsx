'use client'

import { FormEvent, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Clock3, ShieldAlert } from 'lucide-react'
import { euCountries, getEuCountryName } from '@/lib/eu-countries'
import {
  translatePublicObject,
  type PublicLocale,
} from '@/lib/public-i18n'

type Profile = {
  account_type: 'private' | 'business'
  first_name: string | null
  last_name: string | null
  birth_date: string | null
  email: string
  phone: string
  phone_verified: boolean | null
  phone_verification_status: string | null
  phone_risk_flags: string[] | null
  country_code: string
  company_name: string | null
  registration_number: string | null
  vat_number: string | null
  website_url: string | null
  logo_url: string | null
  address_line_1: string | null
  address_line_2: string | null
  city: string | null
  region: string | null
  postal_code: string | null
  identity_status: string
  business_verification_status: string | null
  risk_status: string
  national_id_last4: string | null
}

export default function ProfileForm({
  profile,
  locale,
  emailConfirmed = true,
}: {
  profile: Profile
  locale: PublicLocale
  emailConfirmed?: boolean
}) {
  const router = useRouter()
  const copy = getProfileCopy(locale)
  const [message, setMessage] = useState('')
  const [logoUrl, setLogoUrl] = useState(profile.logo_url || '')
  const [logoUploading, setLogoUploading] = useState(false)
  const [emailCodeSent, setEmailCodeSent] = useState(false)
  const [emailCode, setEmailCode] = useState('')
  const [emailVerificationMessage, setEmailVerificationMessage] = useState('')
  const [emailVerificationLoading, setEmailVerificationLoading] = useState(false)
  const countries = useMemo(
    () =>
      euCountries
        .map(([code]) => ({ code, name: getEuCountryName(code, locale) }))
        .sort((a, b) => a.name.localeCompare(b.name, locale)),
    [locale],
  )

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const response = await fetch('/api/account/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(form)),
    })
    const result = (await response.json()) as { error?: string }
    setMessage(response.ok ? copy.saved : result.error || copy.saveError)
  }

  async function uploadLogo(file?: File) {
    if (!file) return
    setLogoUploading(true)
    setMessage('')
    const form = new FormData()
    form.set('logo', file)
    const response = await fetch('/api/account/company-logo', {
      method: 'POST',
      body: form,
    })
    const result = (await response.json()) as { error?: string; logoUrl?: string }
    setLogoUploading(false)
    if (!response.ok || !result.logoUrl) {
      setMessage(result.error || copy.logoUploadError)
      return
    }
    setLogoUrl(result.logoUrl)
    setMessage(copy.logoUploaded)
  }

  async function requestEmailVerification() {
    setEmailVerificationLoading(true)
    setEmailVerificationMessage('')
    const response = await fetch('/api/auth/email-code/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: profile.email, locale }),
    })
    const result = (await response.json().catch(() => null)) as { error?: string } | null
    setEmailVerificationLoading(false)
    if (!response.ok) {
      setEmailVerificationMessage(result?.error || copy.emailCodeSendError)
      return
    }
    setEmailCodeSent(true)
    setEmailVerificationMessage(copy.emailCodeSent)
  }

  async function verifyEmailCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setEmailVerificationLoading(true)
    setEmailVerificationMessage('')
    const response = await fetch('/api/auth/email-code/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: profile.email,
        code: emailCode,
        locale,
        next: window.location.pathname,
      }),
    })
    const result = (await response.json().catch(() => null)) as { error?: string } | null
    setEmailVerificationLoading(false)
    if (!response.ok) {
      setEmailVerificationMessage(result?.error || copy.emailCodeVerifyError)
      return
    }
    setEmailVerificationMessage(copy.emailVerifiedNow)
    router.refresh()
  }

  const status =
    profile.account_type === 'business'
      ? profile.business_verification_status
      : profile.identity_status

  return (
    <div className="grid gap-6">
      <VerificationCard
        copy={copy}
        status={status || 'pending'}
        riskStatus={profile.risk_status}
        phoneStatus={profile.phone_verification_status || 'unverified'}
        email={profile.email}
        emailConfirmed={emailConfirmed}
        emailCode={emailCode}
        emailCodeSent={emailCodeSent}
        emailVerificationLoading={emailVerificationLoading}
        emailVerificationMessage={emailVerificationMessage}
        onEmailCodeChange={setEmailCode}
        onRequestEmailVerification={requestEmailVerification}
        onVerifyEmailCode={verifyEmailCode}
      />
      <form
        onSubmit={submit}
        className="grid gap-4 rounded-[22px] border border-[#e1e5ec] bg-white p-6 shadow-sm sm:grid-cols-2 sm:p-8"
      >
        <Field name="firstName" label={copy.firstName} defaultValue={profile.first_name || ''} required />
        <Field name="lastName" label={copy.lastName} defaultValue={profile.last_name || ''} required />
        <Field name="birthDate" label={copy.birthDate} type="date" defaultValue={profile.birth_date || ''} required={profile.account_type === 'private'} />
        <Field name="phone" label={copy.phone} defaultValue={profile.phone} required />
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">{copy.country}</span>
          <select name="countryCode" defaultValue={profile.country_code} className={controlClass} required>
            {countries.map(({ code, name }) => <option key={code} value={code}>{name}</option>)}
          </select>
        </label>
        {profile.account_type === 'private' && (
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">{copy.identityNumber}</span>
            <input
              value={profile.national_id_last4 ? `......${profile.national_id_last4}` : copy.notRegistered}
              disabled
              className={`${controlClass} bg-[#f5f6f8]`}
            />
          </label>
        )}
        {profile.account_type === 'business' && (
          <>
            <div className="sm:col-span-2 rounded-[16px] border border-[#d8e3f7] bg-[#f8fbff] p-4">
              <span className="mb-2 block text-sm font-semibold">{copy.companyLogo}</span>
              <div className="flex flex-wrap items-center gap-4">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoUrl}
                    alt=""
                    className="h-10 w-40 rounded-[12px] border border-[#d7deed] bg-white object-contain p-1"
                  />
                ) : null}
                <label className="inline-flex min-h-11 cursor-pointer items-center rounded-[12px] border border-[#c9d7ec] bg-white px-4 text-sm font-semibold text-[#0866ff]">
                  {logoUploading ? copy.uploadingLogo : copy.uploadLogo}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    onChange={(event) => void uploadLogo(event.target.files?.[0])}
                  />
                </label>
                <span className="text-xs leading-5 text-[#667085]">{copy.logoHelp}</span>
              </div>
            </div>
            <Field name="companyName" label={copy.companyName} defaultValue={profile.company_name || ''} required />
            <Field name="registrationNumber" label={copy.registrationNumber} defaultValue={profile.registration_number || ''} required />
            <Field name="vatNumber" label={copy.vatNumber} defaultValue={profile.vat_number || ''} />
            <Field name="websiteUrl" label={copy.websiteUrl} defaultValue={profile.website_url || ''} />
          </>
        )}
        <Field name="addressLine1" label={copy.addressLine1} defaultValue={profile.address_line_1 || ''} required />
        <Field name="addressLine2" label={copy.addressLine2} defaultValue={profile.address_line_2 || ''} />
        <Field name="postalCode" label={copy.postalCode} defaultValue={profile.postal_code || ''} required />
        <Field name="city" label={copy.city} defaultValue={profile.city || ''} required />
        <Field name="region" label={copy.region} defaultValue={profile.region || ''} />
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">{copy.email}</span>
          <input value={profile.email} disabled className={`${controlClass} bg-[#f5f6f8]`} />
        </label>
        <div className="sm:col-span-2">
          {message && <p className="mb-4 text-sm text-[#475467]">{message}</p>}
          <button className="min-h-12 rounded-[14px] bg-[#0866ff] px-6 font-semibold text-white">
            {copy.saveProfile}
          </button>
        </div>
      </form>
    </div>
  )
}

function VerificationCard({
  status,
  riskStatus,
  copy,
  phoneStatus,
  email,
  emailConfirmed,
  emailCode,
  emailCodeSent,
  emailVerificationLoading,
  emailVerificationMessage,
  onEmailCodeChange,
  onRequestEmailVerification,
  onVerifyEmailCode,
}: {
  status: string
  riskStatus: string
  copy: ReturnType<typeof getProfileCopy>
  phoneStatus: string
  email: string
  emailConfirmed: boolean
  emailCode: string
  emailCodeSent: boolean
  emailVerificationLoading: boolean
  emailVerificationMessage: string
  onEmailCodeChange: (value: string) => void
  onRequestEmailVerification: () => Promise<void>
  onVerifyEmailCode: (event: FormEvent<HTMLFormElement>) => Promise<void>
}) {
  const profileChecked = status === 'verified' || status === 'vat_validated' || status === 'format_validated'
  const verified = profileChecked && emailConfirmed
  const Icon = riskStatus !== 'standard' ? ShieldAlert : verified ? CheckCircle2 : Clock3
  return (
    <section className="grid gap-4 rounded-[18px] border border-[#d8e3f7] bg-[#f4f8ff] p-4 sm:grid-cols-[44px_minmax(0,1fr)] sm:p-5">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] bg-white text-[#0866ff] shadow-sm">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <h2 className="font-semibold">
          {riskStatus !== 'standard'
            ? copy.needsReview
            : verified
              ? copy.basicCheckDone
              : copy.verificationPending}
        </h2>
        <p className="mt-1 text-sm leading-6 text-[#667085]">
          {copy.verificationText}
        </p>
        <div className="mt-4 grid gap-2 text-sm md:grid-cols-2">
          <div className="min-w-0 rounded-[14px] border border-[#dfe7f2] bg-white px-4 py-3">
            <span className="block text-xs font-bold uppercase tracking-[0.12em] text-[#667085]">{copy.emailVerification}</span>
            <strong className="mt-1 block text-[#101828]">{emailConfirmed ? copy.verified : copy.notVerified}</strong>
            <span className="mt-1 block truncate text-xs font-medium text-[#667085]">{email}</span>
          </div>
          <div className="min-w-0 rounded-[14px] border border-[#dfe7f2] bg-white px-4 py-3">
            <span className="block text-xs font-bold uppercase tracking-[0.12em] text-[#667085]">{copy.phoneCheck}</span>
            <strong className="mt-1 block text-[#101828]">
              {phoneStatusLabel(phoneStatus, copy)}
            </strong>
            <span className="mt-1 block text-xs font-medium text-[#667085]">{copy.phoneCheckHelp}</span>
          </div>
        </div>
        {!emailConfirmed ? (
          <div className="mt-4 rounded-[16px] border border-[#cfe0ff] bg-white p-4">
            <h3 className="text-sm font-semibold text-[#101828]">{copy.verifyEmailTitle}</h3>
            <p className="mt-1 text-sm leading-6 text-[#667085]">{copy.verifyEmailText}</p>
            <button
              type="button"
              onClick={() => void onRequestEmailVerification()}
              disabled={emailVerificationLoading}
              className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-[12px] bg-[#0866ff] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {emailVerificationLoading ? copy.sendingCode : emailCodeSent ? copy.sendNewCode : copy.sendCode}
            </button>
            {emailCodeSent ? (
              <form onSubmit={onVerifyEmailCode} className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,180px)_auto]">
                <input
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={emailCode}
                  onChange={(event) => onEmailCodeChange(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="h-11 rounded-[12px] border border-[#d7deed] bg-white px-4 text-center text-lg font-semibold tracking-[0.28em] text-[#101828] outline-none focus:border-[#0866ff]"
                />
                <button
                  type="submit"
                  disabled={emailVerificationLoading || emailCode.length !== 6}
                  className="inline-flex min-h-11 items-center justify-center rounded-[12px] border border-[#cbd7e8] px-4 text-sm font-semibold text-[#0866ff] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {copy.verifyCode}
                </button>
              </form>
            ) : null}
            {emailVerificationMessage ? (
              <p className="mt-3 text-sm font-medium text-[#475467]">{emailVerificationMessage}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}

function phoneStatusLabel(status: string, copy: ReturnType<typeof getProfileCopy>) {
  if (status === 'format_valid') return copy.phoneFormatValid
  if (status === 'country_mismatch' || status === 'invalid_format') return copy.phoneNeedsReview
  return copy.phoneNeedsReview
}

const controlClass =
  'h-12 w-full rounded-[14px] border border-[#d7deed] bg-white px-4 text-sm outline-none focus:border-[#0866ff]'

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <input {...rest} className={controlClass} />
    </label>
  )
}

function getProfileCopy(locale: PublicLocale) {
  const en = {
    saved: 'Profile updated.',
    saveError: 'Could not save.',
    firstName: 'First name',
    lastName: 'Last name',
    birthDate: 'Date of birth',
    phone: 'Phone number',
    country: 'Country',
    identityNumber: 'Identity number',
    notRegistered: 'Not registered',
    companyName: 'Company name',
    companyLogo: 'Company logo',
    uploadLogo: 'Upload logo',
    uploadingLogo: 'Uploading...',
    logoUploaded: 'Logo uploaded.',
    logoUploadError: 'Could not upload logo.',
    logoHelp: 'PNG, JPG or WebP under 2 MB. Recommended size for listing cards: 640 x 160 px, transparent background.',
    registrationNumber: 'Registration number',
    vatNumber: 'VAT number',
    websiteUrl: 'Website',
    addressLine1: 'Street address',
    addressLine2: 'Apartment, floor or c/o',
    postalCode: 'Postal code',
    city: 'City',
    region: 'Region or state',
    email: 'Email',
    saveProfile: 'Save profile',
    needsReview: 'The account needs review',
    basicCheckDone: 'Basic check is complete',
    verificationPending: 'Verification in progress',
    verificationText:
      'Automated checks do not replace a full identity check. Autorell may request additional documents or e-identification if there is risk, a report or publication.',
    emailVerification: 'Email',
    phoneCheck: 'Phone check',
    phoneCheckHelp: 'Country code and number format are checked automatically.',
    verified: 'Verified',
    notVerified: 'Not verified',
    phoneFormatValid: 'Format approved',
    phoneNeedsReview: 'Check the number',
    verifyEmailTitle: 'Verify your email',
    verifyEmailText: 'Send a one-time code to your email and enter it here. After that your seller profile can show as verified.',
    sendCode: 'Send code',
    sendNewCode: 'Send new code',
    sendingCode: 'Sending...',
    verifyCode: 'Verify code',
    emailCodeSent: 'We sent a code to your email.',
    emailVerifiedNow: 'Email verified.',
    emailCodeSendError: 'The code could not be sent.',
    emailCodeVerifyError: 'The code could not be verified.',
  }
  if (locale === 'sv') {
    return {
      ...en,
      saved: 'Profilen är uppdaterad.',
      saveError: 'Kunde inte spara.',
      firstName: 'Förnamn',
      lastName: 'Efternamn',
      birthDate: 'Födelsedatum',
      phone: 'Telefonnummer',
      country: 'Land',
      identityNumber: 'Identitetsnummer',
      notRegistered: 'Ej registrerat',
      companyName: 'Företagsnamn',
      companyLogo: 'Företagslogotyp',
      uploadLogo: 'Ladda upp logotyp',
      uploadingLogo: 'Laddar upp...',
      logoUploaded: 'Logotypen är uppladdad.',
      logoUploadError: 'Kunde inte ladda upp logotypen.',
      logoHelp: 'PNG, JPG eller WebP under 2 MB. Rekommenderad storlek för annonskort: 640 x 160 px, transparent bakgrund.',
      registrationNumber: 'Registreringsnummer',
      vatNumber: 'VAT-nummer',
      websiteUrl: 'Webbplats',
      addressLine1: 'Gatuadress',
      addressLine2: 'Lägenhet, våning eller c/o',
      postalCode: 'Postnummer',
      city: 'Ort',
      region: 'Region eller delstat',
      email: 'E-post',
      emailVerification: 'Mejl',
      phoneCheck: 'Telefonkontroll',
      phoneCheckHelp: 'Landskod och nummerformat kontrolleras automatiskt.',
      verified: 'Verifierad',
      notVerified: 'Ej verifierad',
      phoneFormatValid: 'Format godkänt',
      phoneNeedsReview: 'Kontrollera numret',
      verifyEmailTitle: 'Verifiera mejladressen',
      verifyEmailText: 'Skicka en engångskod till mejlen och ange den här. Efter det kan säljarprofilen visas som verifierad.',
      sendCode: 'Skicka kod',
      sendNewCode: 'Skicka ny kod',
      sendingCode: 'Skickar...',
      verifyCode: 'Verifiera kod',
      emailCodeSent: 'Vi har skickat en kod till din mejl.',
      emailVerifiedNow: 'Mejladressen är verifierad.',
      emailCodeSendError: 'Koden kunde inte skickas.',
      emailCodeVerifyError: 'Koden kunde inte verifieras.',
      saveProfile: 'Spara profil',
      needsReview: 'Kontot behöver granskas',
      basicCheckDone: 'Grundkontrollen är genomförd',
      verificationPending: 'Verifiering pågår',
      verificationText:
        'Automatiska kontroller ersätter inte en full identitetskontroll. Autorell kan begära ytterligare dokument eller e-legitimation vid risk, rapport eller publicering.',
    }
  }
  if (locale === 'es') {
    return {
      ...en,
      saved: 'Perfil actualizado.',
      saveError: 'No se pudo guardar.',
      firstName: 'Nombre',
      lastName: 'Apellidos',
      birthDate: 'Fecha de nacimiento',
      phone: 'Número de teléfono',
      country: 'País',
      identityNumber: 'Número de identidad',
      notRegistered: 'No registrado',
      companyName: 'Nombre de la empresa',
      companyLogo: 'Logotipo de la empresa',
      uploadLogo: 'Subir logotipo',
      uploadingLogo: 'Subiendo...',
      logoUploaded: 'Logotipo subido.',
      logoUploadError: 'No se pudo subir el logotipo.',
      logoHelp: 'PNG, JPG o WebP de menos de 2 MB. Tamaño recomendado para tarjetas de anuncio: 640 x 160 px, fondo transparente.',
      registrationNumber: 'Número de registro',
      vatNumber: 'Número de IVA',
      websiteUrl: 'Sitio web',
      addressLine1: 'Dirección',
      addressLine2: 'Apartamento, planta o c/o',
      postalCode: 'Código postal',
      city: 'Ciudad',
      region: 'Región o provincia',
      email: 'Correo electrónico',
      saveProfile: 'Guardar perfil',
      needsReview: 'La cuenta necesita revisión',
      basicCheckDone: 'La comprobación básica se ha completado',
      verificationPending: 'Verificación en curso',
      verificationText:
        'Las comprobaciones automáticas no sustituyen una verificación completa de identidad. Autorell puede solicitar documentos adicionales o identificación electrónica si hay riesgo, una denuncia o una publicación.',
    }
  }
  if (locale === 'de') {
    return {
      ...en,
      emailVerification: 'E-Mail',
      phoneCheck: 'Telefonprüfung',
      phoneCheckHelp: 'Ländervorwahl und Nummernformat werden automatisch geprüft.',
      verified: 'Verifiziert',
      notVerified: 'Nicht verifiziert',
      phoneFormatValid: 'Format bestätigt',
      phoneNeedsReview: 'Nummer prüfen',
      verifyEmailTitle: 'E-Mail verifizieren',
      verifyEmailText: 'Senden Sie einen Einmalcode an Ihre E-Mail und geben Sie ihn hier ein. Danach kann Ihr Verkäuferprofil als verifiziert angezeigt werden.',
      sendCode: 'Code senden',
      sendNewCode: 'Neuen Code senden',
      sendingCode: 'Wird gesendet...',
      verifyCode: 'Code bestätigen',
      emailCodeSent: 'Wir haben einen Code an Ihre E-Mail gesendet.',
      emailVerifiedNow: 'E-Mail verifiziert.',
      emailCodeSendError: 'Der Code konnte nicht gesendet werden.',
      emailCodeVerifyError: 'Der Code konnte nicht bestätigt werden.',
    }
  }
  if (locale === 'fr') {
    return {
      ...en,
      emailVerification: 'E-mail',
      phoneCheck: 'Contrôle du téléphone',
      phoneCheckHelp: 'L’indicatif pays et le format du numéro sont contrôlés automatiquement.',
      verified: 'Vérifié',
      notVerified: 'Non vérifié',
      phoneFormatValid: 'Format validé',
      phoneNeedsReview: 'Vérifier le numéro',
      verifyEmailTitle: 'Vérifier l’e-mail',
      verifyEmailText: 'Envoyez un code à usage unique à votre e-mail et saisissez-le ici. Le profil vendeur pourra ensuite être affiché comme vérifié.',
      sendCode: 'Envoyer le code',
      sendNewCode: 'Envoyer un nouveau code',
      sendingCode: 'Envoi...',
      verifyCode: 'Vérifier le code',
      emailCodeSent: 'Nous avons envoyé un code à votre e-mail.',
      emailVerifiedNow: 'E-mail vérifié.',
      emailCodeSendError: 'Le code n’a pas pu être envoyé.',
      emailCodeVerifyError: 'Le code n’a pas pu être vérifié.',
    }
  }
  if (locale === 'it') {
    return {
      ...en,
      emailVerification: 'E-mail',
      phoneCheck: 'Controllo telefono',
      phoneCheckHelp: 'Prefisso internazionale e formato del numero vengono controllati automaticamente.',
      verified: 'Verificato',
      notVerified: 'Non verificato',
      phoneFormatValid: 'Formato approvato',
      phoneNeedsReview: 'Controlla il numero',
      verifyEmailTitle: 'Verifica l’e-mail',
      verifyEmailText: 'Invia un codice monouso alla tua e-mail e inseriscilo qui. Dopo, il profilo venditore potrà risultare verificato.',
      sendCode: 'Invia codice',
      sendNewCode: 'Invia nuovo codice',
      sendingCode: 'Invio...',
      verifyCode: 'Verifica codice',
      emailCodeSent: 'Abbiamo inviato un codice alla tua e-mail.',
      emailVerifiedNow: 'E-mail verificata.',
      emailCodeSendError: 'Impossibile inviare il codice.',
      emailCodeVerifyError: 'Impossibile verificare il codice.',
    }
  }
  if (locale === 'nl') {
    return {
      ...en,
      emailVerification: 'E-mail',
      phoneCheck: 'Telefooncontrole',
      phoneCheckHelp: 'Landcode en nummerformaat worden automatisch gecontroleerd.',
      verified: 'Geverifieerd',
      notVerified: 'Niet geverifieerd',
      phoneFormatValid: 'Formaat goedgekeurd',
      phoneNeedsReview: 'Controleer het nummer',
      verifyEmailTitle: 'E-mail verifiëren',
      verifyEmailText: 'Stuur een eenmalige code naar je e-mail en vul die hier in. Daarna kan je verkopersprofiel als geverifieerd worden getoond.',
      sendCode: 'Code sturen',
      sendNewCode: 'Nieuwe code sturen',
      sendingCode: 'Versturen...',
      verifyCode: 'Code verifiëren',
      emailCodeSent: 'We hebben een code naar je e-mail gestuurd.',
      emailVerifiedNow: 'E-mail geverifieerd.',
      emailCodeSendError: 'De code kon niet worden verstuurd.',
      emailCodeVerifyError: 'De code kon niet worden geverifieerd.',
    }
  }
  if (locale === 'pl') {
    return {
      ...en,
      emailVerification: 'E-mail',
      phoneCheck: 'Kontrola telefonu',
      phoneCheckHelp: 'Kod kraju i format numeru są sprawdzane automatycznie.',
      verified: 'Zweryfikowano',
      notVerified: 'Niezweryfikowano',
      phoneFormatValid: 'Format zatwierdzony',
      phoneNeedsReview: 'Sprawdź numer',
      verifyEmailTitle: 'Zweryfikuj e-mail',
      verifyEmailText: 'Wyślij jednorazowy kod na e-mail i wpisz go tutaj. Potem profil sprzedawcy może być oznaczony jako zweryfikowany.',
      sendCode: 'Wyślij kod',
      sendNewCode: 'Wyślij nowy kod',
      sendingCode: 'Wysyłanie...',
      verifyCode: 'Zweryfikuj kod',
      emailCodeSent: 'Wysłaliśmy kod na Twój e-mail.',
      emailVerifiedNow: 'E-mail zweryfikowany.',
      emailCodeSendError: 'Nie udało się wysłać kodu.',
      emailCodeVerifyError: 'Nie udało się zweryfikować kodu.',
    }
  }
  if (locale === 'da') {
    return {
      ...en,
      emailVerification: 'E-mail',
      phoneCheck: 'Telefonkontrol',
      phoneCheckHelp: 'Landekode og nummerformat kontrolleres automatisk.',
      verified: 'Verificeret',
      notVerified: 'Ikke verificeret',
      phoneFormatValid: 'Format godkendt',
      phoneNeedsReview: 'Kontrollér nummeret',
      verifyEmailTitle: 'Verificér e-mail',
      verifyEmailText: 'Send en engangskode til din e-mail og indtast den her. Derefter kan sælgerprofilen vises som verificeret.',
      sendCode: 'Send kode',
      sendNewCode: 'Send ny kode',
      sendingCode: 'Sender...',
      verifyCode: 'Verificér kode',
      emailCodeSent: 'Vi har sendt en kode til din e-mail.',
      emailVerifiedNow: 'E-mail verificeret.',
      emailCodeSendError: 'Koden kunne ikke sendes.',
      emailCodeVerifyError: 'Koden kunne ikke verificeres.',
    }
  }
  if (locale === 'fi') {
    return {
      ...en,
      emailVerification: 'Sähköposti',
      phoneCheck: 'Puhelintarkistus',
      phoneCheckHelp: 'Maatunnus ja numeron muoto tarkistetaan automaattisesti.',
      verified: 'Vahvistettu',
      notVerified: 'Ei vahvistettu',
      phoneFormatValid: 'Muoto hyväksytty',
      phoneNeedsReview: 'Tarkista numero',
      verifyEmailTitle: 'Vahvista sähköposti',
      verifyEmailText: 'Lähetä kertakäyttökoodi sähköpostiisi ja syötä se tähän. Sen jälkeen myyjäprofiili voidaan näyttää vahvistettuna.',
      sendCode: 'Lähetä koodi',
      sendNewCode: 'Lähetä uusi koodi',
      sendingCode: 'Lähetetään...',
      verifyCode: 'Vahvista koodi',
      emailCodeSent: 'Lähetimme koodin sähköpostiisi.',
      emailVerifiedNow: 'Sähköposti vahvistettu.',
      emailCodeSendError: 'Koodia ei voitu lähettää.',
      emailCodeVerifyError: 'Koodia ei voitu vahvistaa.',
    }
  }
  if (locale === 'en') return en
  return translatePublicObject(locale, en)
}
