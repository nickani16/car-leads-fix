-- Core image metadata required by listing creation and public listing galleries.
-- Search-v2 and automated media retention remain deliberately out of scope.

begin;

create table if not exists public.marketplace_listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.marketplace_listings(id) on delete cascade,
  seller_user_id uuid not null references auth.users(id) on delete cascade,
  position integer not null,
  avif_url text not null,
  webp_url text not null,
  storage_avif_path text not null,
  storage_webp_path text not null,
  width integer,
  height integer,
  avif_size_bytes integer,
  webp_size_bytes integer,
  original_filename text,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  purge_after timestamptz,
  deleted_at timestamptz,
  unique (listing_id, position)
);

create index if not exists marketplace_listing_images_listing_idx
  on public.marketplace_listing_images (listing_id, position);

create index if not exists marketplace_listing_images_seller_idx
  on public.marketplace_listing_images (seller_user_id, created_at desc);

create index if not exists marketplace_listing_images_purge_idx
  on public.marketplace_listing_images (purge_after)
  where deleted_at is null;

alter table public.marketplace_listing_images enable row level security;
revoke all on public.marketplace_listing_images from anon, authenticated;
grant select on public.marketplace_listing_images to anon, authenticated;

drop policy if exists "Published listing images are public"
  on public.marketplace_listing_images;
create policy "Published listing images are public"
on public.marketplace_listing_images for select
to anon, authenticated
using (
  deleted_at is null
  and exists (
    select 1
    from public.marketplace_listings l
    where l.id = marketplace_listing_images.listing_id
      and l.status = 'published'
      and (l.expires_at is null or l.expires_at > now())
  )
);

drop policy if exists "Sellers can read own listing images"
  on public.marketplace_listing_images;
create policy "Sellers can read own listing images"
on public.marketplace_listing_images for select
to authenticated
using ((select auth.uid()) = seller_user_id);

commit;
