import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import VehicleLeadForm from '@/app/components/VehicleLeadForm'
import {
  getSwedishCounty,
  getSwedishCountyMunicipalities,
} from '@/lib/swedish-local-seo'
import { swedishCounties } from '@/lib/swedish-regions.generated'

type CountySellCarPageProps = PageProps<'/salj-bil/lan/[lan]'>

export const dynamicParams = false

export function generateStaticParams() {
  return swedishCounties.map(({ slug }) => ({ lan: slug }))
}

export async function generateMetadata({
  params,
}: CountySellCarPageProps): Promise<Metadata> {
  const { lan } = await params
  const county = getSwedishCounty(lan)

  if (!county) return {}

  const title = `Sälj bil i ${county.name} – få bud från handlare | Autorell`
  const description = `Sälj din bil i ${county.name} kostnadsfritt. Registrera bilen digitalt, nå verifierade handlare och välj själv om du vill acceptera ett bud.`
  const canonical = `https://www.autorell.se/salj-bil/lan/${county.slug}`

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

export default async function CountySellCarPage({
  params,
}: CountySellCarPageProps) {
  const { lan } = await params
  const county = getSwedishCounty(lan)

  if (!county) notFound()

  const municipalities = getSwedishCountyMunicipalities(county)
  const canonical = `https://www.autorell.se/salj-bil/lan/${county.slug}`
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': canonical,
        url: canonical,
        name: `Sälj bil i ${county.name}`,
        description:
          'Registrera bilen kostnadsfritt och nå verifierade bilhandlare i Sverige och Europa.',
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
            name: county.name,
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
          city: county.name,
          county: county.name,
          countySlug: county.slug,
          areaDescription: `I ${county.name} kan du registrera bilen digitalt och nå professionella köpare genom ett sammanhållet och granskat fordonsunderlag. Välj din kommun nedan för mer lokal information och ett förifyllt formulär.`,
          nearby: municipalities.map(({ name, slug }) => ({ name, slug })),
          regionType: 'county',
        }}
      />
    </>
  )
}
