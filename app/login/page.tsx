import EmailCodeAuth from '@/app/components/EmailCodeAuth'
import { getRequestLocale } from '@/lib/request-locale'

export default async function LoginPage() {
  const locale = await getRequestLocale()
  return <EmailCodeAuth locale={locale} mode="login" />
}
