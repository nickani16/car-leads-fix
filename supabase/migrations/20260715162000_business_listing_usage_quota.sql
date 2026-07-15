create table if not exists public.business_listing_usage_ledger (
  id uuid primary key default gen_random_uuid(),
  reservation_key uuid not null unique,
  subscription_id uuid not null references public.business_subscriptions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid references public.marketplace_listings(id) on delete set null,
  plan_key text not null,
  period_start timestamptz not null,
  period_end timestamptz not null,
  limit_at_time integer not null check (limit_at_time > 0),
  sequence_number integer not null check (sequence_number > 0),
  event_type text not null default 'reserved' check (event_type in ('reserved', 'released')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists business_listing_usage_one_listing_per_subscription_idx
  on public.business_listing_usage_ledger (subscription_id, listing_id)
  where listing_id is not null and event_type = 'reserved';

create index if not exists business_listing_usage_period_idx
  on public.business_listing_usage_ledger (subscription_id, period_start, period_end, event_type);

create index if not exists business_listing_usage_user_period_idx
  on public.business_listing_usage_ledger (user_id, period_start desc, created_at desc);

alter table public.business_listing_usage_ledger enable row level security;
revoke all on public.business_listing_usage_ledger from anon, authenticated;

drop policy if exists business_listing_usage_select_own_user on public.business_listing_usage_ledger;
create policy business_listing_usage_select_own_user
  on public.business_listing_usage_ledger for select
  to authenticated
  using (auth.uid() = user_id);

grant select on public.business_listing_usage_ledger to authenticated;

create or replace function public.resolve_business_listing_period(p_anchor timestamptz, p_now timestamptz)
returns table(period_start timestamptz, period_end timestamptz)
language plpgsql
stable
as $$
declare
  v_start timestamptz := coalesce(p_anchor, p_now);
begin
  while v_start + interval '1 month' <= p_now loop
    v_start := v_start + interval '1 month';
  end loop;

  period_start := v_start;
  period_end := v_start + interval '1 month';
  return next;
end;
$$;

create or replace function public.reserve_business_listing_quota(
  p_user_id uuid,
  p_reservation_key uuid,
  p_listing_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_subscription public.business_subscriptions%rowtype;
  v_limit integer;
  v_period_start timestamptz;
  v_period_end timestamptz;
  v_used integer;
  v_existing public.business_listing_usage_ledger%rowtype;
  v_status text;
  v_allowed_status boolean;
begin
  if p_user_id is null or p_reservation_key is null then
    raise exception 'user_id and reservation_key are required';
  end if;

  select *
    into v_existing
    from public.business_listing_usage_ledger
   where reservation_key = p_reservation_key;

  if found then
    return jsonb_build_object(
      'allowed', v_existing.event_type = 'reserved',
      'reservationKey', v_existing.reservation_key,
      'limit', v_existing.limit_at_time,
      'used', v_existing.sequence_number,
      'remaining', greatest(v_existing.limit_at_time - v_existing.sequence_number, 0),
      'planKey', v_existing.plan_key,
      'periodStart', v_existing.period_start,
      'periodEnd', v_existing.period_end,
      'reason', case when v_existing.event_type = 'reserved' then null else 'reservation_released' end
    );
  end if;

  select *
    into v_subscription
    from public.business_subscriptions
   where user_id = p_user_id
   order by updated_at desc nulls last, created_at desc nulls last
   limit 1
   for update;

  if not found then
    return jsonb_build_object('allowed', false, 'reason', 'missing_subscription');
  end if;

  v_status := coalesce(v_subscription.status, '');
  v_allowed_status :=
    v_status in ('active', 'trialing')
    or coalesce(v_subscription.manually_activated, false)
    or (v_subscription.free_period_ends_at is not null and v_subscription.free_period_ends_at > now())
    or (
      v_status in ('past_due', 'unpaid')
      and v_subscription.grace_period_ends_at is not null
      and v_subscription.grace_period_ends_at > now()
    );

  v_limit := coalesce(
    nullif(v_subscription.temporary_quota, 0),
    nullif(v_subscription.active_listing_limit, 0),
    case v_subscription.plan_key
      when 'free' then 5
      when 'starter' then 25
      when 'growth' then 100
      when 'professional' then 500
      else null
    end
  );

  if not v_allowed_status then
    return jsonb_build_object(
      'allowed', false,
      'reason', 'subscription_not_active',
      'planKey', v_subscription.plan_key,
      'status', v_subscription.status,
      'limit', v_limit
    );
  end if;

  if v_limit is null or v_limit < 1 then
    return jsonb_build_object(
      'allowed', false,
      'reason', 'invalid_plan_limit',
      'planKey', v_subscription.plan_key,
      'status', v_subscription.status
    );
  end if;

  select period_start, period_end
    into v_period_start, v_period_end
    from public.resolve_business_listing_period(
      coalesce(v_subscription.current_period_start, v_subscription.created_at, v_subscription.updated_at, now()),
      now()
    );

  select count(*)::integer
    into v_used
    from public.business_listing_usage_ledger
   where subscription_id = v_subscription.id
     and period_start = v_period_start
     and period_end = v_period_end
     and event_type = 'reserved';

  if v_used >= v_limit then
    return jsonb_build_object(
      'allowed', false,
      'reason', 'period_listing_limit_reached',
      'limit', v_limit,
      'used', v_used,
      'remaining', 0,
      'planKey', v_subscription.plan_key,
      'status', v_subscription.status,
      'periodStart', v_period_start,
      'periodEnd', v_period_end
    );
  end if;

  insert into public.business_listing_usage_ledger (
    reservation_key,
    subscription_id,
    user_id,
    listing_id,
    plan_key,
    period_start,
    period_end,
    limit_at_time,
    sequence_number,
    metadata
  )
  values (
    p_reservation_key,
    v_subscription.id,
    p_user_id,
    p_listing_id,
    v_subscription.plan_key,
    v_period_start,
    v_period_end,
    v_limit,
    v_used + 1,
    jsonb_build_object('source', 'listing_create')
  );

  return jsonb_build_object(
    'allowed', true,
    'reservationKey', p_reservation_key,
    'limit', v_limit,
    'used', v_used + 1,
    'remaining', greatest(v_limit - (v_used + 1), 0),
    'planKey', v_subscription.plan_key,
    'status', v_subscription.status,
    'periodStart', v_period_start,
    'periodEnd', v_period_end
  );
end;
$$;

create or replace function public.attach_business_listing_quota_reservation(
  p_reservation_key uuid,
  p_listing_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_reservation_key is null or p_listing_id is null then
    raise exception 'reservation_key and listing_id are required';
  end if;

  update public.business_listing_usage_ledger
     set listing_id = p_listing_id,
         metadata = metadata || jsonb_build_object('listing_id', p_listing_id, 'attached_at', now())
   where reservation_key = p_reservation_key
     and event_type = 'reserved'
     and listing_id is null;

  if not found then
    raise exception 'quota reservation could not be attached';
  end if;
end;
$$;

create or replace function public.release_business_listing_quota_reservation(p_reservation_key uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.business_listing_usage_ledger
     set event_type = 'released',
         metadata = metadata || jsonb_build_object('released_at', now())
   where reservation_key = p_reservation_key
     and listing_id is null
     and event_type = 'reserved';
end;
$$;

revoke all on function public.resolve_business_listing_period(timestamptz, timestamptz) from public, anon, authenticated;
revoke all on function public.reserve_business_listing_quota(uuid, uuid, uuid) from public, anon, authenticated;
revoke all on function public.attach_business_listing_quota_reservation(uuid, uuid) from public, anon, authenticated;
revoke all on function public.release_business_listing_quota_reservation(uuid) from public, anon, authenticated;

grant execute on function public.resolve_business_listing_period(timestamptz, timestamptz) to service_role;
grant execute on function public.reserve_business_listing_quota(uuid, uuid, uuid) to service_role;
grant execute on function public.attach_business_listing_quota_reservation(uuid, uuid) to service_role;
grant execute on function public.release_business_listing_quota_reservation(uuid) to service_role;
