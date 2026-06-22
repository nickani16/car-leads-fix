begin;

create table if not exists public.marketplace_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  account_type text not null check (account_type in ('private', 'business')),
  display_name text not null,
  legal_name text,
  email text not null,
  phone text not null,
  country_code text not null check (char_length(country_code) = 2 and country_code = upper(country_code)),
  company_name text,
  registration_number text,
  vat_number text,
  registered_address text,
  city text,
  postal_code text,
  locale text not null default 'en',
  terms_version text not null,
  privacy_version text not null,
  accepted_at timestamptz not null default now(),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    account_type = 'private'
    or (
      nullif(trim(company_name), '') is not null
      and nullif(trim(registration_number), '') is not null
    )
  )
);

alter table public.marketplace_profiles enable row level security;

drop policy if exists marketplace_profiles_select_own on public.marketplace_profiles;
create policy marketplace_profiles_select_own
  on public.marketplace_profiles for select to authenticated
  using (user_id = auth.uid());

drop policy if exists marketplace_profiles_update_own on public.marketplace_profiles;
create policy marketplace_profiles_update_own
  on public.marketplace_profiles for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, update on public.marketplace_profiles to authenticated;

alter table public.leads
  add column if not exists seller_user_id uuid references auth.users(id) on delete set null,
  add column if not exists vehicle_category text not null default 'cars',
  add column if not exists seller_public_name text,
  add column if not exists seller_is_trader boolean not null default false;

alter table public.leads drop constraint if exists leads_vehicle_category_check;
alter table public.leads add constraint leads_vehicle_category_check check (
  vehicle_category in (
    'cars','vans','bikes','motorhomes','caravans',
    'trucks','farm','plant','electric-bikes','e-scooters'
  )
);

alter table public.leads drop constraint if exists leads_listing_plan_check;
alter table public.leads add constraint leads_listing_plan_check check (
  listing_plan in (
    'free_24h','extended_7d','premium_30d','managed_sale',
    'free_7d','standard_15d'
  )
);

alter table public.seller_listing_orders
  add column if not exists account_type text,
  add column if not exists vehicle_category text;

alter table public.seller_listing_orders drop constraint if exists seller_listing_orders_package_check;
alter table public.seller_listing_orders add constraint seller_listing_orders_package_check check (
  package in (
    'extended_7d','premium_30d','managed_sale',
    'free_7d','standard_15d'
  )
);
alter table public.seller_listing_orders drop constraint if exists seller_listing_orders_amount_cents_check;
alter table public.seller_listing_orders add constraint seller_listing_orders_amount_cents_check
  check (amount_cents >= 0 and amount_cents <= 149000);

create table if not exists public.marketplace_conversations (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  buyer_user_id uuid not null references auth.users(id) on delete cascade,
  seller_user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'open' check (status in ('open', 'closed', 'blocked')),
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (lead_id, buyer_user_id, seller_user_id),
  check (buyer_user_id <> seller_user_id)
);

create table if not exists public.marketplace_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.marketplace_conversations(id) on delete cascade,
  sender_user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 3000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.marketplace_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid references auth.users(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  conversation_id uuid references public.marketplace_conversations(id) on delete set null,
  category text not null check (category in (
    'suspected_fraud','misleading_listing','unsafe_product','harassment',
    'identity_misuse','payment_request','other'
  )),
  details text not null check (char_length(trim(details)) between 10 and 5000),
  contact_email text,
  status text not null default 'new' check (status in ('new','reviewing','actioned','closed')),
  created_at timestamptz not null default now()
);

alter table public.marketplace_conversations enable row level security;
alter table public.marketplace_messages enable row level security;
alter table public.marketplace_reports enable row level security;

drop policy if exists marketplace_conversations_participants on public.marketplace_conversations;
create policy marketplace_conversations_participants
  on public.marketplace_conversations for select to authenticated
  using (auth.uid() in (buyer_user_id, seller_user_id));

drop policy if exists marketplace_messages_participants_select on public.marketplace_messages;
create policy marketplace_messages_participants_select
  on public.marketplace_messages for select to authenticated
  using (exists (
    select 1 from public.marketplace_conversations c
    where c.id = conversation_id
      and auth.uid() in (c.buyer_user_id, c.seller_user_id)
  ));

drop policy if exists marketplace_reports_insert on public.marketplace_reports;
create policy marketplace_reports_insert
  on public.marketplace_reports for insert to authenticated
  with check (reporter_user_id = auth.uid());

grant select on public.marketplace_conversations, public.marketplace_messages to authenticated;
grant insert on public.marketplace_reports to authenticated;

create index if not exists marketplace_conversations_participant_idx
  on public.marketplace_conversations (buyer_user_id, seller_user_id, last_message_at desc);
create index if not exists marketplace_messages_conversation_idx
  on public.marketplace_messages (conversation_id, created_at);
create index if not exists leads_seller_user_idx
  on public.leads (seller_user_id, created_at desc);

commit;
