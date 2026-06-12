import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import VehicleLeadForm from '@/app/components/VehicleLeadForm'
import {
  getNearbySwedishLocations,
  getSwedishLocalSeoLocation,
  swedishLocalSeoLocations,
} from '@/lib/swedish-local-seo'

type LocalSellCarPageProps = PageProps<'/salj-bil/[ort]'>

export const dynamicParams = false

export function generateStaticParams() {
  return swedishLocalSeoLocations.map(({ slug }) => ({ ort: slug }))
}

export async function generateMetadata({
  params,
}: LocalSellCarPageProps): Promise<Metadata> {
  const { ort } = await params
  const location = getSwedishLocalSeoLocation(ort)

  if (!location) return {}

  const title = `Sälj bil i ${location.name} – få bud från handlare | Autorell`
  const description = `Sälj din bil i ${location.name} kostnadsfritt. Nå verifierade bilhandlare i Sverige och Europa, följ budgivningen och välj själv om du vill sälja.`
  const canonical = `https://www.autorell.se/salj-bil/${location.slug}`

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Autorell',
      locale: 'sv_SE',
      type: 'website',
    },
  }
}

export default async function LocalSellCarPage({
  params,
}: LocalSellCarPageProps) {
  const { ort } = await params
  const location = getSwedishLocalSeoLocation(ort)

  if (!location) notFound()

  const nearby = getNearbySwedishLocations(location)
  const canonical = `https://www.autorell.se/salj-bil/${location.slug}`
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': canonical,
        url: canonical,
        name: `Sälj bil i ${location.name}`,
        description: `Registrera bilen kostnadsfritt och nå verifierade bilhandlare i Sverige och Europa.`,
        inLanguage: 'sv-SE',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Autorell',
            item: 'https://www.autorell.se/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Sälj din bil',
            item: 'https://www.autorell.se/salj-bil',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: location.name,
            item: canonical,
          },
        ],
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <VehicleLeadForm
        locale="sv"
        localSeo={{
          city: location.name,
          county: location.county,
          areaDescription: location.areaDescription,
          nearby: nearby.map(({ name, slug }) => ({ name, slug })),
        }}
      />
    </>
  )
}
