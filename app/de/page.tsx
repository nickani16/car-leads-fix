import BusinessMarketplaceHome from '../components/BusinessMarketplaceHome'
import { createPublicMetadata } from '@/lib/public-seo'

export const metadata = createPublicMetadata({
  title: 'Europas Marktplatz für Fahrzeuge | Autorell',
  description:
    'Fahrzeuge und Maschinen in ganz Europa kaufen und verkaufen — für Privatpersonen und Unternehmen.',
  path: '/',
  locale: 'de',
  keywords: [
    'Fahrzeugmarktplatz Europa',
    'Autos kaufen Europa',
    'Fahrzeuge verkaufen Europa',
    'Marktplatz für Privatpersonen',
    'Fahrzeugmarkt für Unternehmen',
    'Transporter',
    'Motorräder',
    'Wohnmobile',
    'Landmaschinen',
    'Baumaschinen',
    'E-Bikes',
    'E-Scooter',
  ],
})

export default function GermanVehiclePage() {
  return <BusinessMarketplaceHome locale="de" />
}
