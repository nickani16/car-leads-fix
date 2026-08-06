begin;

create schema if not exists private;

alter table public.business_subscriptions
  add column if not exists dealer_lead_access_starts_at timestamptz;

comment on column public.business_subscriptions.dealer_lead_access_starts_at is
  'First lead creation time visible in the current uninterrupted Growth-or-higher entitlement.';

with eligible_activation as (
  select
    e.subscription_id,
    max(e.created_at) as activated_at
  from public.business_subscription_events e
  where lower(coalesce(e.to_plan, '')) = any (array['growth','professional','enterprise']::text[])
    and lower(coalesce(e.from_plan, '')) <> all (array['growth','professional','enterprise']::text[])
  group by e.subscription_id
)
update public.business_subscriptions s
set dealer_lead_access_starts_at = greatest(
  s.created_at,
  coalesce(
    activation.activated_at,
    case
      when coalesce(s.manually_activated, false)
        or (
          lower(coalesce(s.status, '')) <> all (array['active','trialing']::text[])
          and coalesce(s.free_period_ends_at > now(), false)
        )
      then s.updated_at
      else s.current_period_start
    end,
    s.created_at
  )
)
from eligible_activation activation
where activation.subscription_id = s.id
  and s.dealer_lead_access_starts_at is null
  and lower(coalesce(s.plan_key, '')) = any (array['growth','professional','enterprise']::text[])
  and (
    lower(coalesce(s.status, '')) = any (array['active','trialing']::text[])
    or coalesce(s.manually_activated, false)
    or coalesce(s.free_period_ends_at > now(), false)
  );

update public.business_subscriptions s
set dealer_lead_access_starts_at = greatest(
  s.created_at,
  coalesce(
    case
      when coalesce(s.manually_activated, false)
        or (
          lower(coalesce(s.status, '')) <> all (array['active','trialing']::text[])
          and coalesce(s.free_period_ends_at > now(), false)
        )
      then s.updated_at
      else s.current_period_start
    end,
    s.created_at
  )
)
where s.dealer_lead_access_starts_at is null
  and lower(coalesce(s.plan_key, '')) = any (array['growth','professional','enterprise']::text[])
  and (
    lower(coalesce(s.status, '')) = any (array['active','trialing']::text[])
    or coalesce(s.manually_activated, false)
    or coalesce(s.free_period_ends_at > now(), false)
  );

with continuous_entitlement as (
  select
    s.user_id,
    min(s.dealer_lead_access_starts_at) as access_starts_at
  from public.business_subscriptions s
  where s.dealer_lead_access_starts_at is not null
    and lower(coalesce(s.plan_key, '')) = any (array['growth','professional','enterprise']::text[])
    and (
      lower(coalesce(s.status, '')) = any (array['active','trialing']::text[])
      or coalesce(s.manually_activated, false)
      or coalesce(s.free_period_ends_at > now(), false)
    )
  group by s.user_id
)
update public.business_subscriptions s
set dealer_lead_access_starts_at = entitlement.access_starts_at
from continuous_entitlement entitlement
where entitlement.user_id = s.user_id
  and s.dealer_lead_access_starts_at is not null
  and lower(coalesce(s.plan_key, '')) = any (array['growth','professional','enterprise']::text[])
  and (
    lower(coalesce(s.status, '')) = any (array['active','trialing']::text[])
    or coalesce(s.manually_activated, false)
    or coalesce(s.free_period_ends_at > now(), false)
  );

alter table public.business_subscriptions
  drop constraint if exists business_subscriptions_dealer_lead_access_plan_check;

alter table public.business_subscriptions
  add constraint business_subscriptions_dealer_lead_access_plan_check
  check (
    dealer_lead_access_starts_at is null
    or (
      lower(plan_key) = any (array['growth','professional','enterprise']::text[])
    )
  );

create index if not exists business_subscriptions_user_recency_idx
  on public.business_subscriptions (user_id, updated_at desc, created_at desc, id desc);

create or replace function private.sync_business_subscription_dealer_lead_access_start()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_new_entitled boolean;
  v_old_entitled boolean := false;
  v_existing_access_starts_at timestamptz;
begin
  v_new_entitled :=
    lower(coalesce(new.plan_key, '')) = any (array['growth','professional','enterprise']::text[])
    and (
      lower(coalesce(new.status, '')) = any (array['active','trialing']::text[])
      or coalesce(new.manually_activated, false)
      or coalesce(new.free_period_ends_at > statement_timestamp(), false)
    );

  if not v_new_entitled then
    new.dealer_lead_access_starts_at := null;
    return new;
  end if;

  if tg_op = 'UPDATE' then
    v_old_entitled :=
      lower(coalesce(old.plan_key, '')) = any (array['growth','professional','enterprise']::text[])
      and (
        lower(coalesce(old.status, '')) = any (array['active','trialing']::text[])
        or coalesce(old.manually_activated, false)
        or coalesce(old.free_period_ends_at > statement_timestamp(), false)
      );
  end if;

  if tg_op = 'UPDATE'
    and v_old_entitled
    and old.dealer_lead_access_starts_at is not null
  then
    new.dealer_lead_access_starts_at := old.dealer_lead_access_starts_at;
  else
    select min(subscription.dealer_lead_access_starts_at)
    into v_existing_access_starts_at
    from public.business_subscriptions subscription
    where subscription.user_id = new.user_id
      and subscription.id <> new.id
      and subscription.dealer_lead_access_starts_at is not null
      and lower(coalesce(subscription.plan_key, '')) = any (array['growth','professional','enterprise']::text[])
      and (
        lower(coalesce(subscription.status, '')) = any (array['active','trialing']::text[])
        or coalesce(subscription.manually_activated, false)
        or coalesce(subscription.free_period_ends_at > statement_timestamp(), false)
      );

    new.dealer_lead_access_starts_at := coalesce(
      v_existing_access_starts_at,
      greatest(
        new.created_at,
        coalesce(new.current_period_start, statement_timestamp()),
        statement_timestamp()
      )
    );
  end if;

  return new;
end;
$$;

revoke all on function private.sync_business_subscription_dealer_lead_access_start()
  from public, anon, authenticated, service_role;

drop trigger if exists business_subscriptions_sync_dealer_lead_access_start
  on public.business_subscriptions;

create trigger business_subscriptions_sync_dealer_lead_access_start
before insert or update of
  plan_key,
  status,
  manually_activated,
  free_period_ends_at,
  current_period_start,
  dealer_lead_access_starts_at
on public.business_subscriptions
for each row
execute function private.sync_business_subscription_dealer_lead_access_start();

create or replace function private.current_user_dealer_lead_access_starts_at()
returns timestamptz
language sql
stable
security definer
set search_path = ''
as $$
  select s.dealer_lead_access_starts_at
  from public.marketplace_profiles p
  left join public.marketplace_companies company on company.id = p.company_id
  join lateral (
    select
      subscription.plan_key,
      subscription.status,
      subscription.manually_activated,
      subscription.free_period_ends_at,
      subscription.dealer_lead_access_starts_at
    from public.business_subscriptions subscription
    where subscription.user_id = coalesce(company.created_by, p.user_id)
    order by subscription.updated_at desc, subscription.created_at desc, subscription.id desc
    limit 1
  ) s on true
  where p.user_id = (select auth.uid())
    and p.account_type = 'business'
    and lower(coalesce(s.plan_key, '')) = any (array['growth','professional','enterprise']::text[])
    and (
      lower(coalesce(s.status, '')) = any (array['active','trialing']::text[])
      or coalesce(s.manually_activated, false)
      or coalesce(s.free_period_ends_at > now(), false)
    )
    and s.dealer_lead_access_starts_at is not null
    and s.dealer_lead_access_starts_at <= now();
$$;

revoke all on function private.current_user_dealer_lead_access_starts_at()
  from public, anon, authenticated, service_role;

create or replace function private.can_current_user_access_dealer_lead(
  p_country_code text,
  p_lead_created_at timestamptz
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    p_lead_created_at is not null
    and p_lead_created_at >= private.current_user_dealer_lead_access_starts_at()
    and exists (
      select 1
      from public.marketplace_profiles p
      left join public.dealer_lead_notification_preferences pref on pref.user_id = p.user_id
      where p.user_id = (select auth.uid())
        and p.account_type = 'business'
        and (
          coalesce(pref.all_countries, false)
          or upper(coalesce(p_country_code, '')) = any (
            case
              when coalesce(array_length(pref.country_codes, 1), 0) > 0 then pref.country_codes
              else array[upper(coalesce(p.country_code, ''))]
            end
          )
        )
    );
$$;

revoke all on function private.can_current_user_access_dealer_lead(text, timestamptz)
  from public, anon, authenticated, service_role;
grant usage on schema private to authenticated;
grant execute on function private.can_current_user_access_dealer_lead(text, timestamptz)
  to authenticated;

drop policy if exists dealer_vehicle_leads_select_growth_company
  on public.dealer_vehicle_leads;

create policy dealer_vehicle_leads_select_growth_company
on public.dealer_vehicle_leads
for select to authenticated
using (
  private.can_current_user_access_dealer_lead(source_country_code, created_at)
);

drop policy if exists dealer_vehicle_lead_images_select_growth_company
  on public.dealer_vehicle_lead_images;

create policy dealer_vehicle_lead_images_select_growth_company
on public.dealer_vehicle_lead_images
for select to authenticated
using (
  exists (
    select 1
    from public.dealer_vehicle_leads lead
    where lead.id = dealer_vehicle_lead_images.lead_id
      and private.can_current_user_access_dealer_lead(
        lead.source_country_code,
        lead.created_at
      )
  )
);

drop function if exists private.can_current_user_access_dealer_lead_country(text);

create or replace function private.enforce_dealer_bid_entitlement()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_country_code text;
  v_lead_created_at timestamptz;
begin
  if v_user_id is null then
    return new;
  end if;

  if new.dealer_id is distinct from v_user_id then
    raise exception 'A bid can only be submitted for the signed-in dealer';
  end if;

  select
    coalesce(lead.origin_country, lead.source, 'SE'),
    lead.created_at at time zone 'UTC'
  into v_country_code, v_lead_created_at
  from public.leads lead
  where lead.id = new.lead_id;

  if v_lead_created_at is null
    or not coalesce(
      private.can_current_user_access_dealer_lead(
        v_country_code,
        v_lead_created_at
      ),
      false
    )
  then
    raise exception 'An active Growth plan or higher is required for this lead';
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_dealer_bid_entitlement()
  from public, anon, authenticated, service_role;

drop trigger if exists bids_enforce_dealer_lead_entitlement on public.bids;

create trigger bids_enforce_dealer_lead_entitlement
before insert on public.bids
for each row
execute function private.enforce_dealer_bid_entitlement();

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
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_dealer_id uuid;
  v_access_starts_at timestamptz;
  v_auction_ends_at timestamptz;
  v_highest numeric;
begin
  if v_user_id is null then
    raise exception 'User is not authenticated';
  end if;

  select d.id into v_dealer_id
  from public.dealers d
  where d.user_id = v_user_id
    and d.status = 'approved'
  limit 1;

  if v_dealer_id is null then
    raise exception 'Dealer account is not approved';
  end if;

  v_access_starts_at := private.current_user_dealer_lead_access_starts_at();
  if v_access_starts_at is null then
    raise exception 'An active Growth plan or higher is required to bid';
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
  where l.id = p_lead_id
    and l.status = 'Active'
    and l.sale_format = 'auction'
    and l.auction_closed_at is null
    and l.seller_dealer_id is distinct from v_dealer_id
    and (l.created_at at time zone 'UTC') >= v_access_starts_at
    and private.can_current_user_access_dealer_lead(
      coalesce(l.origin_country, l.source, 'SE'),
      l.created_at at time zone 'UTC'
    );

  if v_auction_ends_at is null then
    raise exception 'Vehicle was not found or cannot be bid on';
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
  from public, anon, authenticated;
grant execute on function public.place_dealer_bid(uuid, numeric, text, text, text)
  to authenticated;

commit;
