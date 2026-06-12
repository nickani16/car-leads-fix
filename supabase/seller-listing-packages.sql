-- Seller listing packages, measurable delivery and flexible auction windows.

alter table public.leads
  add column if not exists auction_starts_at timestamptz,
  add column if not exists auction_ends_at timestamptz,
  add column if not exists listing_plan text not null default 'free_24h',
  add column if not exists listing_priority integer not null default 0,
  add column if not exists seller_access_token_hash text,
  add column if not exists dealer_reach_snapshot integer not null default 0;

update public.leads
set
  auction_starts_at = coalesce(auction_starts_at, created_at at time zone 'UTC'),
  auction_ends_at = coalesce(
    auction_ends_at,
    (created_at at time zone 'UTC') + interval '24 hours'
  )
where auction_starts_at is null
   or auction_ends_at is null;

alter table public.leads
  alter column auction_starts_at set default now(),
  alter column auction_ends_at set default (now() + interval '24 hours');

alter table public.leads
  drop constraint if exists leads_listing_plan_check;

alter table public.leads
  add constraint leads_listing_plan_check
  check (listing_plan in ('free_24h', 'extended_7d', 'premium_30d'));

create unique index if not exists leads_seller_access_token_hash_key
  on public.leads (seller_access_token_hash)
  where seller_access_token_hash is not null;

create index if not exists leads_auction_ends_at_idx
  on public.leads (auction_ends_at)
  where auction_closed_at is null;

create table if not exists public.seller_listing_orders (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  package text not null
    check (package in ('extended_7d', 'premium_30d')),
  amount_cents integer not null check (amount_cents in (10000, 29000)),
  currency text not null default 'SEK' check (currency = 'SEK'),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'expired', 'refunded')),
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  dealer_reach_snapshot integer not null default 0,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  activated_at timestamptz,
  expires_at timestamptz
);

alter table public.seller_listing_orders enable row level security;

create index if not exists seller_listing_orders_lead_id_idx
  on public.seller_listing_orders (lead_id, created_at desc);

create table if not exists public.vehicle_listing_views (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  dealer_id uuid not null references public.dealers(id) on delete cascade,
  viewed_on date not null default current_date,
  viewed_at timestamptz not null default now(),
  unique (lead_id, dealer_id, viewed_on)
);

alter table public.vehicle_listing_views enable row level security;

create index if not exists vehicle_listing_views_lead_id_idx
  on public.vehicle_listing_views (lead_id, viewed_at desc);

drop view if exists public.dealer_leads;

create view public.dealer_leads
with (security_invoker = true)
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
  l.auction_starts_at,
  l.auction_ends_at,
  l.listing_plan,
  l.listing_priority,
  coalesce(l.origin_country, l.source, 'SE') as source,
  l.pickup_city,
  l.pickup_postal_code,
  l."sellTime",
  l.owners,
  l.service,
  l.damage,
  case
    when nullif(trim(l.damage_description), '') is null then null
    else nullif(trim(l.damage_description_en), '')
  end as damage_description,
  l.brakes,
  l."importCar",
  l.inspection_valid_until,
  l.keys_count,
  l.gearbox,
  l.tires,
  l.tireset,
  l.towbar,
  l.warnings,
  l.is_driveable,
  l.has_engine_transmission_issues,
  l.has_fluid_leaks,
  l.has_serious_collision_damage,
  case
    when nullif(trim(l.equipment), '') is null then null
    else nullif(trim(l.equipment_en), '')
  end as equipment,
  (
    nullif(trim(l.damage_description), '') is not null
    and nullif(trim(l.damage_description_en), '') is null
  ) as damage_translation_pending,
  (
    nullif(trim(l.equipment), '') is not null
    and nullif(trim(l.equipment_en), '') is null
  ) as equipment_translation_pending,
  l.images,
  l.status
from public.leads l
where coalesce(l.status, '') not in ('Deleted', 'Cancelled')
  and exists (
    select 1
    from public.dealers d
    where d.user_id = auth.uid()
      and d.status = 'approved'
  );

create or replace function public.place_dealer_bid(
  p_lead_id uuid,
  p_amount numeric,
  p_terms_version text,
  p_ip_address text default null,
  p_user_agent text default null
)
returns table(
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
  v_auction_ends_at timestamptz;
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

  perform pg_advisory_xact_lock(hashtextextended(p_lead_id::text, 0));

  select l.auction_ends_at
  into v_auction_ends_at
  from public.leads l
  where l.id = p_lead_id;

  if v_auction_ends_at is null then
    raise exception 'Vehicle was not found';
  end if;

  if now() >= v_auction_ends_at then
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

create or replace function public.close_expired_auctions()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_run_id uuid;
  v_lead record;
  v_deal_id uuid;
  v_checked integer := 0;
  v_created integer := 0;
  v_no_bids integer := 0;
  v_failures integer := 0;
  v_errors text := '';
begin
  insert into public.auction_close_runs default values
  returning id into v_run_id;

  for v_lead in
    select l.id
    from public.leads l
    where l.auction_ends_at is not null
      and l.auction_ends_at <= now()
      and l.auction_closed_at is null
      and not exists (
        select 1 from public.deals d where d.lead_id = l.id
      )
    order by l.auction_ends_at asc
    for update skip locked
  loop
    v_checked := v_checked + 1;

    if not exists (
      select 1 from public.bids b where b.lead_id = v_lead.id
    ) then
      update public.leads
      set auction_closed_at = now(), auction_outcome = 'no_bids'
      where id = v_lead.id and auction_closed_at is null;

      v_no_bids := v_no_bids + 1;
      continue;
    end if;

    begin
      perform pg_advisory_xact_lock(hashtextextended(v_lead.id::text, 0));

      if exists (select 1 from public.deals d where d.lead_id = v_lead.id) then
        update public.leads
        set auction_closed_at = coalesce(auction_closed_at, now()),
            auction_outcome = 'won'
        where id = v_lead.id;
        continue;
      end if;

      perform public.create_deal_from_winning_bid(v_lead.id);

      select d.id into v_deal_id
      from public.deals d
      where d.lead_id = v_lead.id
      order by d.created_at desc
      limit 1;

      if v_deal_id is null then
        raise exception 'Deal creation returned without creating a deal';
      end if;

      update public.leads
      set auction_closed_at = now(), auction_outcome = 'won'
      where id = v_lead.id;

      perform public.enqueue_winning_bid_notifications(v_deal_id, v_lead.id);
      v_created := v_created + 1;
    exception
      when others then
        v_failures := v_failures + 1;
        v_errors := left(
          concat(
            v_errors,
            case when v_errors = '' then '' else E'\n' end,
            v_lead.id,
            ': ',
            sqlerrm
          ),
          10000
        );
    end;
  end loop;

  update public.auction_close_runs
  set
    finished_at = now(),
    auctions_checked = v_checked,
    deals_created = v_created,
    auctions_without_bids = v_no_bids,
    failures = v_failures,
    error_summary = nullif(v_errors, '')
  where id = v_run_id;

  return jsonb_build_object(
    'run_id', v_run_id,
    'auctions_checked', v_checked,
    'deals_created', v_created,
    'auctions_without_bids', v_no_bids,
    'failures', v_failures
  );
end;
$$;
