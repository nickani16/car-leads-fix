-- Autorell EU marketplace: independent listing domain.
-- The legacy leads/bids/dealers/deals domain is intentionally not referenced.

create table if not exists public.marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  seller_user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in (
    'cars', 'vans', 'motorcycles', 'motorhomes', 'caravans', 'trucks',
    'agriculture', 'construction', 'electric-bikes', 'e-scooters'
  )),
  status text not null default 'draft' check (status in (
    'draft', 'pending_review', 'pending_payment', 'published', 'paused',
    'sold', 'rejected', 'expired'
  )),
  title text not null,
  description text not null,
  make text,
  model text,
  variant text,
  registration_reference text,
  model_year integer check (model_year between 1900 and 2100),
  mileage_km integer check (mileage_km >= 0),
  operating_hours integer check (operating_hours >= 0),
  fuel_type text,
  gearbox text,
  body_type text,
  color text,
  condition text not null,
  known_faults text,
  service_history text,
  equipment text,
  country_code text not null check (char_length(country_code) = 2),
  city text not null,
  postal_code text,
  price numeric(14,2) not null check (price > 0),
  currency text not null default 'EUR' check (currency in (
    'EUR', 'SEK', 'DKK', 'PLN', 'CZK', 'HUF', 'RON', 'BGN', 'NOK', 'CHF', 'GBP', 'USD'
  )),
  images text[] not null default '{}',
  seller_name text not null,
  seller_type text not null check (seller_type in ('private', 'business')),
  package_id text not null default 'free_7d',
  priority integer not null default 0,
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marketplace_listings_public_idx
  on public.marketplace_listings (status, category, priority desc, published_at desc);
create index if not exists marketplace_listings_seller_idx
  on public.marketplace_listings (seller_user_id, created_at desc);
create index if not exists marketplace_listings_country_price_idx
  on public.marketplace_listings (country_code, currency, price);
create index if not exists marketplace_listings_search_idx
  on public.marketplace_listings using gin (
    to_tsvector('simple',
      coalesce(title, '') || ' ' || coalesce(make, '') || ' ' ||
      coalesce(model, '') || ' ' || coalesce(variant, '') || ' ' ||
      coalesce(body_type, '') || ' ' || coalesce(fuel_type, '') || ' ' ||
      coalesce(city, '') || ' ' || coalesce(country_code, '') || ' ' ||
      id::text
    )
  );

alter table public.marketplace_listings enable row level security;

drop policy if exists "Published listings are public" on public.marketplace_listings;
create policy "Published listings are public"
on public.marketplace_listings for select
to anon, authenticated
using (status = 'published' and (expires_at is null or expires_at > now()));

drop policy if exists "Sellers can read own listings" on public.marketplace_listings;
create policy "Sellers can read own listings"
on public.marketplace_listings for select
to authenticated
using ((select auth.uid()) = seller_user_id);

drop policy if exists "Sellers can create own listings" on public.marketplace_listings;
create policy "Sellers can create own listings"
on public.marketplace_listings for insert
to authenticated
with check ((select auth.uid()) = seller_user_id);

drop policy if exists "Sellers can update own listings" on public.marketplace_listings;
create policy "Sellers can update own listings"
on public.marketplace_listings for update
to authenticated
using ((select auth.uid()) = seller_user_id)
with check ((select auth.uid()) = seller_user_id);

drop policy if exists "Sellers can delete unpublished listings" on public.marketplace_listings;
create policy "Sellers can delete unpublished listings"
on public.marketplace_listings for delete
to authenticated
using (
  (select auth.uid()) = seller_user_id
  and status in ('draft', 'pending_review', 'rejected')
);

grant select on public.marketplace_listings to anon, authenticated;
grant insert, update, delete on public.marketplace_listings to authenticated;

create table if not exists public.marketplace_listing_orders (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.marketplace_listings(id) on delete cascade,
  seller_user_id uuid not null references auth.users(id) on delete cascade,
  package_id text not null check (package_id in ('standard_15d', 'premium_30d')),
  amount_minor integer not null check (amount_minor > 0),
  currency text not null default 'SEK',
  status text not null default 'pending' check (status in ('pending', 'paid', 'refunded', 'cancelled')),
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists marketplace_listing_orders_seller_idx
  on public.marketplace_listing_orders (seller_user_id, created_at desc);
alter table public.marketplace_listing_orders enable row level security;
drop policy if exists "Sellers can read own listing orders" on public.marketplace_listing_orders;
create policy "Sellers can read own listing orders"
on public.marketplace_listing_orders for select
to authenticated
using ((select auth.uid()) = seller_user_id);
grant select on public.marketplace_listing_orders to authenticated;

alter table public.marketplace_conversations
  add column if not exists listing_id uuid references public.marketplace_listings(id) on delete cascade;
alter table public.marketplace_conversations drop column if exists lead_id;
create unique index if not exists marketplace_conversations_listing_participants_idx
  on public.marketplace_conversations (listing_id, buyer_user_id, seller_user_id)
  where listing_id is not null;

alter table public.marketplace_reports
  add column if not exists listing_id uuid references public.marketplace_listings(id) on delete set null;
alter table public.marketplace_reports drop column if exists lead_id;

insert into storage.buckets (id, name, public)
values ('marketplace-listings', 'marketplace-listings', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Marketplace sellers upload own images" on storage.objects;
create policy "Marketplace sellers upload own images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'marketplace-listings'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Marketplace sellers manage own images" on storage.objects;
create policy "Marketplace sellers manage own images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'marketplace-listings'
  and owner_id = (select auth.uid())::text
)
with check (
  bucket_id = 'marketplace-listings'
  and owner_id = (select auth.uid())::text
);

drop policy if exists "Marketplace sellers delete own images" on storage.objects;
create policy "Marketplace sellers delete own images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'marketplace-listings'
  and owner_id = (select auth.uid())::text
);
