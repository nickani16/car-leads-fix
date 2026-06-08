-- Autorell security baseline and atomic dealer bidding.
-- Run this entire file in Supabase SQL Editor.

begin;

alter table public.leads enable row level security;
alter table public.bids enable row level security;

revoke all on public.leads from anon, authenticated;
revoke all on public.bids from anon, authenticated;

-- Dealers only receive the vehicle fields needed for bidding.
drop view if exists public.dealer_leads;
create view public.dealer_leads
with (security_barrier = true)
as
select
  l.id,
  l.reg,
  l.make,
  l.model,
  l.variant,
  l.model_year,
  l.first_registration,
  l.vin,
  l.body_type,
  l.fuel_type,
  l.drivetrain,
  l.power_hp,
  l.engine_size,
  l.color,
  l.miles,
  l.created_at,
  coalesce(l.origin_country, l.source, 'SE') as source,
  l."sellTime",
  l.owners,
  l.service,
  l.damage,
  l.damage_description,
  l.brakes,
  l."importCar",
  l.inspection_valid_until,
  l.keys_count,
  l.gearbox,
  l.tires,
  l.tireset,
  l.towbar,
  l.warnings,
  l.equipment,
  l.images,
  l.status
from public.leads l
where exists (
  select 1
  from public.dealers d
  where d.user_id = auth.uid()
    and d.status = 'approved'
);

revoke all on public.dealer_leads from public, anon;
grant select on public.dealer_leads to authenticated;

-- Other dealers remain anonymous. A dealer can only identify their own bids.
drop view if exists public.dealer_bids;
create view public.dealer_bids
with (security_barrier = true)
as
select
  b.id,
  b.lead_id,
  b.amount,
  case when b.dealer_id = auth.uid() then b.dealer_id else null end as dealer_id,
  b.created_at
from public.bids b
where exists (
  select 1
  from public.dealers d
  where d.user_id = auth.uid()
    and d.status = 'approved'
);

revoke all on public.dealer_bids from public, anon;
grant select on public.dealer_bids to authenticated;

alter table public.bids
  add column if not exists terms_version text,
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists submitted_ip inet,
  add column if not exists submitted_user_agent text;

create index if not exists bids_lead_amount_created_idx
  on public.bids (lead_id, amount desc, created_at asc);

create index if not exists bids_dealer_id_idx
  on public.bids (dealer_id);

create or replace function public.place_dealer_bid(
  p_lead_id uuid,
  p_amount numeric,
  p_terms_version text,
  p_ip_address text default null,
  p_user_agent text default null
)
returns table (
  id uuid,
  lead_id uuid,
  amount numeric,
  dealer_id uuid,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_created_at timestamptz;
  v_highest numeric;
begin
  if v_user_id is null then
    raise exception 'User is not authenticated';
  end if;

  if not exists (
    select 1
    from public.dealers d
    where d.user_id = v_user_id
      and d.status = 'approved'
  ) then
    raise exception 'Dealer account is not approved';
  end if;

  if p_amount is null or p_amount <= 0 or p_amount > 10000000 then
    raise exception 'Enter a valid bid amount';
  end if;

  if nullif(trim(p_terms_version), '') is null then
    raise exception 'Binding bid terms must be accepted';
  end if;

  -- Serializes bids per vehicle and prevents two simultaneous winning bids.
  perform pg_advisory_xact_lock(hashtextextended(p_lead_id::text, 0));

  select l.created_at
  into v_created_at
  from public.leads l
  where l.id = p_lead_id;

  if v_created_at is null then
    raise exception 'Vehicle was not found';
  end if;

  if now() >= v_created_at + interval '24 hours' then
    raise exception 'Bidding for this vehicle has closed';
  end if;

  select max(b.amount::numeric)
  into v_highest
  from public.bids b
  where b.lead_id = p_lead_id;

  if v_highest is not null and p_amount <= v_highest then
    raise exception 'Your bid must be higher than the current highest bid';
  end if;

  return query
  insert into public.bids (
    lead_id,
    amount,
    dealer_id,
    is_winner,
    terms_version,
    terms_accepted_at,
    submitted_ip,
    submitted_user_agent
  )
  values (
    p_lead_id,
    round(p_amount, 2),
    v_user_id,
    false,
    p_terms_version,
    now(),
    nullif(p_ip_address, '')::inet,
    left(p_user_agent, 1000)
  )
  returning
    bids.id,
    bids.lead_id,
    bids.amount::numeric,
    bids.dealer_id,
    bids.created_at;
end;
$$;

revoke all on function public.place_dealer_bid(uuid, numeric, text, text, text)
from public, anon;
grant execute on function public.place_dealer_bid(uuid, numeric, text, text, text)
to authenticated;

-- Staff accounts are separate from full administrators.
create table if not exists public.staff_users (
  user_id uuid primary key references auth.users(id) on delete restrict,
  role text not null check (role in ('sales', 'operations', 'legal')),
  display_name text not null,
  email text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.staff_users enable row level security;
revoke all on public.staff_users from anon, authenticated;

-- Notification outbox: database events are recorded once and delivered by a
-- scheduled server job or Supabase Edge Function.
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_user_id uuid references auth.users(id) on delete cascade,
  recipient_email text,
  audience text not null check (audience in ('admin', 'sales', 'dealer', 'seller')),
  event_type text not null,
  title text not null,
  body text not null,
  deal_id uuid references public.deals(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,
  channels text[] not null default array['in_app']::text[],
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'sent', 'failed', 'read')),
  attempts integer not null default 0,
  available_at timestamptz not null default now(),
  sent_at timestamptz,
  read_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;
revoke all on public.notifications from anon, authenticated;

create index if not exists notifications_delivery_idx
  on public.notifications (status, available_at);

create index if not exists notifications_recipient_idx
  on public.notifications (recipient_user_id, created_at desc);

drop policy if exists "Users can read own notifications"
on public.notifications;

create policy "Users can read own notifications"
on public.notifications
for select
to authenticated
using (recipient_user_id = auth.uid());

drop policy if exists "Users can mark own notifications read"
on public.notifications;

create policy "Users can mark own notifications read"
on public.notifications
for update
to authenticated
using (recipient_user_id = auth.uid())
with check (recipient_user_id = auth.uid());

grant select on public.notifications to authenticated;
grant update (status, read_at) on public.notifications to authenticated;

commit;
