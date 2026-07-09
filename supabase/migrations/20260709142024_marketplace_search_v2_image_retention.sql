-- Autorell marketplace search v2 and media retention.
--
-- Local migration draft only. Do not run against production until search-v2
-- and the media cleanup flow have been validated on a Supabase branch/staging.

begin;

create extension if not exists pgcrypto with schema extensions;
create extension if not exists pg_trgm with schema extensions;

alter table public.marketplace_listings
  add column if not exists search_document tsvector generated always as (
    to_tsvector(
      'simple',
      coalesce(title, '') || ' ' ||
      coalesce(description, '') || ' ' ||
      coalesce(make, '') || ' ' ||
      coalesce(model, '') || ' ' ||
      coalesce(variant, '') || ' ' ||
      coalesce(body_type, '') || ' ' ||
      coalesce(fuel_type, '') || ' ' ||
      coalesce(gearbox, '') || ' ' ||
      coalesce(condition, '') || ' ' ||
      coalesce(equipment, '') || ' ' ||
      coalesce(city, '') || ' ' ||
      coalesce(municipality, '') || ' ' ||
      coalesce(country_code, '') || ' ' ||
      coalesce(reference_number, '') || ' ' ||
      coalesce(registration_reference, '') || ' ' ||
      coalesce(vin, '') || ' ' ||
      coalesce(chassis_number, '') || ' ' ||
      coalesce(serial_number, '') || ' ' ||
      coalesce(frame_number, '') || ' ' ||
      coalesce(battery_serial_number, '') || ' ' ||
      id::text
    )
  ) stored;

create index if not exists marketplace_listings_search_document_idx
  on public.marketplace_listings using gin (search_document);

create index if not exists marketplace_listings_published_sort_price_idx
  on public.marketplace_listings (category, country_code, price, published_at desc, id desc)
  where status = 'published' and price is not null;

create index if not exists marketplace_listings_published_sort_year_idx
  on public.marketplace_listings (category, country_code, model_year desc, published_at desc, id desc)
  where status = 'published' and model_year is not null;

create index if not exists marketplace_listings_published_sort_mileage_idx
  on public.marketplace_listings (category, country_code, mileage_km, published_at desc, id desc)
  where status = 'published' and mileage_km is not null;

create index if not exists marketplace_listings_published_rank_v2_idx
  on public.marketplace_listings (country_code, category, priority desc, published_at desc, id desc)
  where status = 'published';

create index if not exists marketplace_listings_retention_idx
  on public.marketplace_listings (status, expires_at, created_at);

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

create or replace function public.set_marketplace_media_purge_after()
returns trigger
language plpgsql
as $$
begin
  if new.status in ('expired', 'sold', 'rejected') and old.status is distinct from new.status then
    update public.marketplace_listing_images
    set purge_after = least(
      coalesce(purge_after, now() + interval '30 days'),
      now() + interval '30 days'
    ),
    expires_at = coalesce(new.expires_at, now())
    where listing_id = new.id
      and deleted_at is null;
  end if;

  if new.status = 'published' and new.expires_at is not null then
    update public.marketplace_listing_images
    set expires_at = new.expires_at,
        purge_after = greatest(new.expires_at, now()) + interval '30 days'
    where listing_id = new.id
      and deleted_at is null
      and (purge_after is null or purge_after > greatest(new.expires_at, now()) + interval '30 days');
  end if;

  return new;
end;
$$;

drop trigger if exists set_marketplace_media_purge_after_on_listing_status
  on public.marketplace_listings;
create trigger set_marketplace_media_purge_after_on_listing_status
  after update of status, expires_at on public.marketplace_listings
  for each row
  execute function public.set_marketplace_media_purge_after();

create or replace function public.purge_expired_marketplace_listing_media(
  p_batch_size integer default 250
)
returns table (
  image_id uuid,
  listing_id uuid,
  storage_avif_path text,
  storage_webp_path text
)
language sql
security definer
set search_path = public
as $$
  select i.id, i.listing_id, i.storage_avif_path, i.storage_webp_path
  from public.marketplace_listing_images i
  join public.marketplace_listings l on l.id = i.listing_id
  where i.deleted_at is null
    and i.purge_after is not null
    and i.purge_after < now()
    and l.status <> 'published'
  order by i.purge_after, i.created_at
  limit greatest(1, least(p_batch_size, 1000));
$$;

create or replace function public.mark_marketplace_listing_images_deleted(
  p_image_ids uuid[]
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer := 0;
begin
  update public.marketplace_listing_images
  set deleted_at = now()
  where id = any(p_image_ids)
    and deleted_at is null
    and exists (
      select 1
      from public.marketplace_listings l
      where l.id = marketplace_listing_images.listing_id
        and l.status <> 'published'
    );

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.purge_expired_marketplace_listing_media(integer) from public;
revoke all on function public.mark_marketplace_listing_images_deleted(uuid[]) from public;
grant execute on function public.purge_expired_marketplace_listing_media(integer) to service_role;
grant execute on function public.mark_marketplace_listing_images_deleted(uuid[]) to service_role;

commit;
