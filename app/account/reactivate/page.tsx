import { redirect } from 'next/navigation'
import { getRequestLocale } from '@/lib/request-locale'
import { localizePublicHref, type PublicLocale } from '@/lib/public-i18n'
import { createClient } from '@/lib/supabase/server'
import PrivateAccountReactivation from './PrivateAccountReactivation'

const copy: Record<PublicLocale, { title: string; text: string; retry: string }> = {
  sv: { title: 'Öppnar ditt konto', text: 'Ditt privatkonto återställs. Du skickas strax vidare.', retry: 'Försök igen' },
  en: { title: 'Opening your account', text: 'Your private account is being restored. You will continue shortly.', retry: 'Try again' },
  de: { title: 'Ihr Konto wird geöffnet', text: 'Ihr Privatkonto wird wiederhergestellt. Sie werden gleich weitergeleitet.', retry: 'Erneut versuchen' },
  at: { title: 'Ihr Konto wird geöffnet', text: 'Ihr Privatkonto wird wiederhergestellt. Sie werden gleich weitergeleitet.', retry: 'Erneut versuchen' },
  be: { title: 'Je account wordt geopend', text: 'Je privéaccount wordt hersteld. Je gaat zo verder.', retry: 'Opnieuw proberen' },
  fr: { title: 'Ouverture de votre compte', text: 'Votre compte particulier est en cours de restauration. Vous allez bientôt continuer.', retry: 'Réessayer' },
  es: { title: 'Abriendo tu cuenta', text: 'Tu cuenta particular se está restaurando. Continuarás en breve.', retry: 'Intentar de nuevo' },
  it: { title: 'Apertura del tuo account', text: 'Il tuo account privato è in fase di ripristino. Proseguirai a breve.', retry: 'Riprova' },
  pl: { title: 'Otwieranie konta', text: 'Twoje konto prywatne jest przywracane. Za chwilę przejdziesz dalej.', retry: 'Spróbuj ponownie' },
  nl: { title: 'Je account wordt geopend', text: 'Je privéaccount wordt hersteld. Je gaat zo verder.', retry: 'Opnieuw proberen' },
  fi: { title: 'Tiliäsi avataan', text: 'Yksityistiliäsi palautetaan. Jatkat pian eteenpäin.', retry: 'Yritä uudelleen' },
  da: { title: 'Din konto åbnes', text: 'Din private konto gendannes. Du fortsætter om et øjeblik.', retry: 'Prøv igen' },
}

export default async function PrivateAccountReactivationPage() {
  const locale = await getRequestLocale()
  const destination = localizePublicHref(locale, '/account')
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(localizePublicHref(locale, '/login'))

  return <PrivateAccountReactivation destination={destination} copy={copy[locale]} />
}
