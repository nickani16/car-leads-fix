export type ListingLifecycleGroup =
  | 'active'
  | 'review'
  | 'payment'
  | 'draft'
  | 'paused'
  | 'sold'
  | 'expired'
  | 'deleted'

export const listingGroupOrder: ListingLifecycleGroup[] = [
  'active', 'review', 'payment', 'draft', 'paused', 'sold', 'expired', 'deleted',
]

export const listingGroupCopy: Record<ListingLifecycleGroup, { title: string; description: string }> = {
  active: { title: 'Aktiva', description: 'Synliga för köpare på Autorell.' },
  review: { title: 'Under granskning', description: 'Sparade och kontrolleras innan de blir synliga.' },
  payment: { title: 'Väntar på betalning', description: 'Inte publicerade. Välj paket och slutför betalningen när du vill.' },
  draft: { title: 'Utkast', description: 'Sparade men inte publicerade.' },
  paused: { title: 'Pausade', description: 'Dolda för köpare tills du aktiverar dem igen.' },
  sold: { title: 'Sålda', description: 'Avslutade annonser som du kan lägga ut igen eller duplicera.' },
  expired: { title: 'Utgångna', description: 'Annonsperioden är slut. Välj ett nytt paket för att förnya.' },
  deleted: { title: 'Borttagna', description: 'Dolda annonser som ligger kvar i historiken.' },
}

export function listingLifecycle(status: string, reviewStatus?: string | null) {
  if (status === 'published') return { group: 'active' as const, label: 'Aktiv', tone: 'blue' }
  if (status === 'pending_payment') return { group: 'payment' as const, label: 'Väntar på betalning', tone: 'amber' }
  if (status === 'pending_review' || (status === 'rejected' && reviewStatus !== 'approved')) {
    return { group: 'review' as const, label: status === 'rejected' ? 'Behöver åtgärdas' : 'Under granskning', tone: status === 'rejected' ? 'red' : 'purple' }
  }
  if (status === 'paused') return { group: 'paused' as const, label: 'Pausad', tone: 'slate' }
  if (status === 'sold') return { group: 'sold' as const, label: 'Såld', tone: 'green' }
  if (status === 'expired') return { group: 'expired' as const, label: 'Utgången', tone: 'amber' }
  if (status === 'deleted' || status === 'removed') return { group: 'deleted' as const, label: 'Borttagen', tone: 'slate' }
  return { group: 'draft' as const, label: 'Utkast', tone: 'slate' }
}

