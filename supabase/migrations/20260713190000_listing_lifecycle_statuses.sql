begin;

alter table public.marketplace_listings
  drop constraint if exists marketplace_listings_status_check;

alter table public.marketplace_listings
  add constraint marketplace_listings_status_check check (
    status in (
      'draft', 'pending_payment', 'pending_review', 'published', 'paused',
      'expired', 'sold', 'rejected', 'deleted', 'removed'
    )
  );

create index if not exists marketplace_listings_seller_lifecycle_idx
  on public.marketplace_listings (seller_user_id, status, created_at desc);

commit;
