begin;

-- These operational tables already exist in production, but were absent from the
-- isolated admin preview baseline. Keep this migration additive and idempotent.

create table if not exists public.marketplace_listing_identifiers (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null unique references public.marketplace_listings(id) on delete cascade,
  seller_user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  registration_number text,
  vin text,
  chassis_number text,
  serial_number text,
  frame_number text,
  battery_serial_number text,
  total_weight_kg integer,
  axle_configuration text,
  machine_type text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.marketplace_listing_events (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.marketplace_listings(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_role text not null default 'system' check (actor_role in ('seller','admin','system')),
  event_type text not null,
  from_status text,
  to_status text,
  from_review_status text,
  to_review_status text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.marketplace_listing_risk_events (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.marketplace_listings(id) on delete cascade,
  seller_user_id uuid references auth.users(id) on delete set null,
  risk_key text not null,
  severity text not null check (severity in ('low','medium','high','critical')),
  score integer not null default 0 check (score between 0 and 100),
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.marketplace_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid references auth.users(id) on delete set null,
  conversation_id uuid,
  category text not null check (category in (
    'suspected_fraud','misleading_listing','unsafe_product','harassment',
    'identity_misuse','payment_request','other'
  )),
  details text not null check (char_length(trim(details)) between 10 and 5000),
  contact_email text,
  status text not null default 'new' check (status in ('new','reviewing','actioned','closed')),
  created_at timestamptz not null default now(),
  transaction_reference text,
  counterparty_name text,
  occurred_at timestamptz,
  amount numeric,
  currency text,
  contact_phone text,
  listing_id uuid references public.marketplace_listings(id) on delete set null
);

do $$
begin
  if to_regclass('public.marketplace_conversations') is not null
     and not exists (select 1 from pg_constraint where conname = 'marketplace_reports_conversation_id_fkey') then
    alter table public.marketplace_reports
      add constraint marketplace_reports_conversation_id_fkey
      foreign key (conversation_id) references public.marketplace_conversations(id) on delete set null;
  end if;
end $$;

create table if not exists public.stripe_webhook_events (
  stripe_event_id text primary key,
  event_type text not null,
  processing_status text not null default 'processing'
    check (processing_status in ('processing','processed','failed')),
  error_message text,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists marketplace_listing_events_listing_type_idx
  on public.marketplace_listing_events (listing_id, event_type);
create index if not exists marketplace_listing_events_created_idx
  on public.marketplace_listing_events (created_at desc);
create index if not exists marketplace_listing_risk_events_listing_idx
  on public.marketplace_listing_risk_events (listing_id, created_at desc);
create index if not exists marketplace_listing_risk_events_severity_idx
  on public.marketplace_listing_risk_events (severity, created_at desc);
create index if not exists marketplace_reports_listing_idx
  on public.marketplace_reports (listing_id, created_at desc);
create index if not exists marketplace_reports_status_idx
  on public.marketplace_reports (status, created_at desc);

alter table public.marketplace_listing_identifiers enable row level security;
alter table public.marketplace_listing_events enable row level security;
alter table public.marketplace_listing_risk_events enable row level security;
alter table public.marketplace_reports enable row level security;
alter table public.stripe_webhook_events enable row level security;

revoke all on public.marketplace_listing_identifiers from anon, authenticated;
revoke all on public.marketplace_listing_events from anon, authenticated;
revoke all on public.marketplace_listing_risk_events from anon, authenticated;
revoke all on public.marketplace_reports from anon, authenticated;
revoke all on public.stripe_webhook_events from anon, authenticated;

grant all on public.marketplace_listing_identifiers to service_role;
grant all on public.marketplace_listing_events to service_role;
grant all on public.marketplace_listing_risk_events to service_role;
grant all on public.marketplace_reports to service_role;
grant all on public.stripe_webhook_events to service_role;

drop policy if exists marketplace_reports_insert on public.marketplace_reports;
create policy marketplace_reports_insert
  on public.marketplace_reports for insert
  to authenticated
  with check ((select auth.uid()) = reporter_user_id);
grant insert on public.marketplace_reports to authenticated;

commit;
