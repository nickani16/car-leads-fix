import type { Metadata } from 'next'
import AppComingSoonPage from '@/app/components/AppComingSoonPage'
import { getAppDownloadCopy } from '@/lib/app-download'

export function generateMetadata(): Metadata {
  const copy = getAppDownloadCopy('en')
  return {
    title: copy.metadataTitle,
    description: copy.metadataDescription,
    alternates: {
      canonical: 'https://www.autorell.com/app',
    },
  }
}

export default function AppPage() {
  return <AppComingSoonPage locale="en" marketCode="EU" />
}
