const categoryIconPaths: Record<string, string> = {
  cars: '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" /><circle cx="7" cy="17" r="2" /><path d="M9 17h6" /><circle cx="17" cy="17" r="2" />',
  vans: '<path d="M13 6v5a1 1 0 0 0 1 1h6.102a1 1 0 0 1 .712.298l.898.91a1 1 0 0 1 .288.702V17a1 1 0 0 1-1 1h-3" /><path d="M5 18H3a1 1 0 0 1-1-1V8a2 2 0 0 1 2-2h12c1.1 0 2.1.8 2.4 1.8l1.176 4.2" /><path d="M9 18h5" /><circle cx="16" cy="18" r="2" /><circle cx="7" cy="18" r="2" />',
  motorcycles: '<path d="m18 14-1-3" /><path d="m3 9 6 2a2 2 0 0 1 2-2h2a2 2 0 0 1 1.99 1.81" /><path d="M8 17h3a1 1 0 0 0 1-1 6 6 0 0 1 6-6 1 1 0 0 0 1-1v-.75A5 5 0 0 0 17 5" /><circle cx="19" cy="17" r="3" /><circle cx="5" cy="17" r="3" />',
  motorhomes: '<path d="M3 17V8a3 3 0 0 1 3-3h7.5a3 3 0 0 1 2.4 1.2L20 11.7V17" /><path d="M3 12h16.5" /><path d="M7 5v7" /><path d="M11 5v7" /><path d="M15 8h2.25" /><path d="M5 17h2" /><path d="M11 17h4" /><circle cx="9" cy="17" r="2" /><circle cx="17" cy="17" r="2" />',
  caravans: '<path d="M18 19V9a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v8a2 2 0 0 0 2 2h2" /><path d="M2 9h3a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2" /><path d="M22 17v1a1 1 0 0 1-1 1H10v-9a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v9" /><circle cx="8" cy="19" r="2" />',
  trucks: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" /><path d="M15 18H9" /><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" /><circle cx="17" cy="18" r="2" /><circle cx="7" cy="18" r="2" />',
  agriculture: '<path d="M7 15V9.5A2.5 2.5 0 0 1 9.5 7H13l2 4h2.5a2.5 2.5 0 0 1 2.5 2.5V15" /><path d="M9 7V4h4" /><path d="M5 15h7" /><circle cx="6" cy="17" r="3" /><circle cx="17.5" cy="17.5" r="2.5" /><path d="M15 11h-4" />',
  construction: '<path d="M5 17h9" /><path d="M8 17 5 9h5l3 8" /><path d="M10 9 15 5l4 3-5 4" /><path d="m18 8 2 5-3 2" /><circle cx="6.5" cy="18" r="2" /><circle cx="13.5" cy="18" r="2" />',
  'electric-bikes': '<circle cx="18.5" cy="17.5" r="3.5" /><circle cx="5.5" cy="17.5" r="3.5" /><circle cx="15" cy="5" r="1" /><path d="M12 17.5V14l-3-3 4-3 2 3h2" />',
}

type CategoryMapMarkerInput = {
  category?: string | null
  title?: string | null
  offerType?: string | null
  active?: boolean
}

export function createCategoryMapMarker({
  category,
  title,
  offerType,
  active = false,
}: CategoryMapMarkerInput) {
  const leasing = offerType === 'lease' || offerType === 'sale_and_lease'
  const colorClass = leasing ? 'bg-[#16a34a] group-hover:bg-[#15803d]' : 'bg-[#0866ff] group-hover:bg-[#0757da]'
  const markerElement = document.createElement('button')
  markerElement.type = 'button'
  markerElement.setAttribute('aria-label', title || 'Listing')
  markerElement.className = 'group relative grid h-12 w-12 cursor-pointer place-items-center rounded-full bg-transparent focus:outline-none focus:ring-2 focus:ring-[#0866ff]/30'

  const badge = document.createElement('span')
  badge.className = [
    'relative z-10 grid h-8 w-8 place-items-center rounded-full border-2 border-white text-white shadow-[0_8px_22px_rgba(16,24,40,.25)] transition-[background-color,box-shadow] duration-200 group-hover:shadow-[0_14px_34px_rgba(16,24,40,.28)]',
    colorClass,
    active ? 'bg-[#101828] shadow-[0_18px_40px_rgba(16,24,40,.34)]' : '',
  ].filter(Boolean).join(' ')
  badge.innerHTML = categoryMarkerSvg(category)
  markerElement.appendChild(badge)

  const point = document.createElement('span')
  point.className = [
    'absolute left-1/2 top-[34px] h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b-2 border-r-2 border-white transition-colors duration-200',
    colorClass,
    active ? 'bg-[#101828]' : '',
  ].filter(Boolean).join(' ')
  markerElement.appendChild(point)

  return markerElement
}

function categoryMarkerSvg(category?: string | null) {
  const paths = categoryIconPaths[category || ''] || categoryIconPaths.cars
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`
}
