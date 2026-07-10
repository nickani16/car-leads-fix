create table if not exists public.marketplace_saved_listings (
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references public.marketplace_listings(id) on delete cascade,
  saved_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create index if not exists marketplace_saved_listings_user_saved_at_idx
  on public.marketplace_saved_listings (user_id, saved_at desc);

alter table public.marketplace_saved_listings enable row level security;

drop policy if exists marketplace_saved_listings_select_own on public.marketplace_saved_listings;
create policy marketplace_saved_listings_select_own
  on public.marketplace_saved_listings for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists marketplace_saved_listings_insert_own on public.marketplace_saved_listings;
create policy marketplace_saved_listings_insert_own
  on public.marketplace_saved_listings for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists marketplace_saved_listings_delete_own on public.marketplace_saved_listings;
create policy marketplace_saved_listings_delete_own
  on public.marketplace_saved_listings for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, delete on public.marketplace_saved_listings to authenticated;

create table if not exists public.marketplace_saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  href text not null,
  locale text not null default 'sv',
  market_code text,
  filters jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marketplace_saved_searches_user_updated_at_idx
  on public.marketplace_saved_searches (user_id, updated_at desc);

alter table public.marketplace_saved_searches enable row level security;

drop policy if exists marketplace_saved_searches_select_own on public.marketplace_saved_searches;
create policy marketplace_saved_searches_select_own
  on public.marketplace_saved_searches for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists marketplace_saved_searches_insert_own on public.marketplace_saved_searches;
create policy marketplace_saved_searches_insert_own
  on public.marketplace_saved_searches for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists marketplace_saved_searches_update_own on public.marketplace_saved_searches;
create policy marketplace_saved_searches_update_own
  on public.marketplace_saved_searches for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists marketplace_saved_searches_delete_own on public.marketplace_saved_searches;
create policy marketplace_saved_searches_delete_own
  on public.marketplace_saved_searches for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.marketplace_saved_searches to authenticated;
