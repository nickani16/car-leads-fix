create table if not exists public.conversion_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null check (
    event_name in (
      'dealer_application_submitted',
      'bid_submitted',
      'contact_submitted',
      'whatsapp_clicked'
    )
  ),
  country_code text,
  market_domain text,
  page_path text,
  source text,
  medium text,
  campaign text,
  referrer text,
  user_id uuid,
  dealer_id uuid references public.dealers(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  deal_id uuid references public.deals(id) on delete set null,
  value numeric,
  currency text,
  dedupe_key text unique,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists conversion_events_created_at_idx
  on public.conversion_events(created_at desc);

create index if not exists conversion_events_country_event_idx
  on public.conversion_events(country_code, event_name, created_at desc);

create index if not exists conversion_events_dealer_id_idx
  on public.conversion_events(dealer_id);

create index if not exists conversion_events_lead_id_idx
  on public.conversion_events(lead_id);

create index if not exists conversion_events_deal_id_idx
  on public.conversion_events(deal_id);

alter table public.conversion_events enable row level security;

revoke all on table public.conversion_events from anon, authenticated;
grant select, insert on table public.conversion_events to service_role;

comment on table public.conversion_events is
  'First-party Autorell conversion events. Direct client access is disabled; trusted server routes write events.';

insert into public.conversion_events (
  event_name,
  country_code,
  user_id,
  dealer_id,
  source,
  dedupe_key,
  created_at,
  metadata
)
select
  'dealer_application_submitted',
  coalesce(nullif(upper(d.country_code), ''), 'EU'),
  d.user_id,
  d.id,
  'historical_backfill',
  'dealer_application:' || d.user_id::text,
  d.created_at,
  jsonb_build_object('backfilled', true)
from public.dealers d
where d.user_id is not null
on conflict (dedupe_key) do nothing;

insert into public.conversion_events (
  event_name,
  country_code,
  dealer_id,
  lead_id,
  value,
  currency,
  source,
  dedupe_key,
  created_at,
  metadata
)
select
  'bid_submitted',
  coalesce(nullif(upper(d.country_code), ''), 'EU'),
  d.id,
  b.lead_id,
  b.amount,
  'EUR',
  'historical_backfill',
  'bid:' || b.id::text,
  b.created_at,
  jsonb_build_object('backfilled', true)
from public.bids b
left join public.dealers d on d.user_id = b.dealer_id
on conflict (dedupe_key) do nothing;
