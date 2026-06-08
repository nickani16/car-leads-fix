-- Autorell automatic auction closing.
-- Prerequisite: security-and-bidding.sql has already been run.
-- Run this entire file in Supabase SQL Editor.

begin;

alter table public.notifications
  add column if not exists dedupe_key text;

create unique index if not exists notifications_dedupe_key_idx
  on public.notifications (dedupe_key)
  where dedupe_key is not null;

create table if not exists public.auction_close_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  auctions_checked integer not null default 0,
  deals_created integer not null default 0,
  auctions_without_bids integer not null default 0,
  failures integer not null default 0,
  error_summary text
);

alter table public.auction_close_runs enable row level security;
revoke all on public.auction_close_runs from public, anon, authenticated;

create or replace function public.enqueue_winning_bid_notifications(
  p_deal_id uuid,
  p_lead_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deal public.deals%rowtype;
  v_lead public.leads%rowtype;
  v_dealer public.dealers%rowtype;
  v_vehicle text;
  v_amount text;
begin
  select *
  into v_deal
  from public.deals
  where id = p_deal_id;

  select *
  into v_lead
  from public.leads
  where id = p_lead_id;

  if v_deal.id is null or v_lead.id is null then
    raise exception 'Deal or lead was not found';
  end if;

  select *
  into v_dealer
  from public.dealers
  where id = v_deal.buyer_dealer_id;

  v_vehicle := trim(
    concat_ws(
      ' ',
      nullif(v_lead.make, ''),
      nullif(v_lead.model, ''),
      nullif(v_lead.reg, '')
    )
  );
  v_amount := to_char(v_deal.winning_bid_amount, 'FM999G999G999G990D00');

  insert into public.notifications (
    recipient_user_id,
    recipient_email,
    audience,
    event_type,
    title,
    body,
    deal_id,
    lead_id,
    channels,
    dedupe_key
  )
  select
    a.user_id,
    null,
    'admin',
    'auction_won',
    'Auction closed with a winning bid',
    concat(v_vehicle, ' closed at EUR ', v_amount, '. Deal review is ready.'),
    v_deal.id,
    v_lead.id,
    array['in_app', 'email']::text[],
    concat('auction_won:admin:', a.user_id, ':', v_deal.id)
  from public.admin_users a
  where a.is_active = true
  on conflict (dedupe_key) where dedupe_key is not null do nothing;

  insert into public.notifications (
    recipient_user_id,
    recipient_email,
    audience,
    event_type,
    title,
    body,
    deal_id,
    lead_id,
    channels,
    dedupe_key
  )
  select
    s.user_id,
    s.email,
    'sales',
    'auction_won',
    'New seller follow-up required',
    concat(v_vehicle, ' closed at EUR ', v_amount, '. Contact the seller and record the response.'),
    v_deal.id,
    v_lead.id,
    array['in_app', 'email']::text[],
    concat('auction_won:sales:', s.user_id, ':', v_deal.id)
  from public.staff_users s
  where s.role = 'sales'
    and s.is_active = true
  on conflict (dedupe_key) where dedupe_key is not null do nothing;

  if v_dealer.user_id is not null then
    insert into public.notifications (
      recipient_user_id,
      recipient_email,
      audience,
      event_type,
      title,
      body,
      deal_id,
      lead_id,
      channels,
      dedupe_key
    )
    values (
      v_dealer.user_id,
      v_dealer.email,
      'dealer',
      'provisional_winner',
      'You are the provisional winning bidder',
      concat(
        'Your bid of EUR ',
        v_amount,
        ' for ',
        v_vehicle,
        ' is the winning bid. Autorell will contact you after seller acceptance.'
      ),
      v_deal.id,
      v_lead.id,
      array['in_app', 'email']::text[],
      concat('provisional_winner:dealer:', v_dealer.user_id, ':', v_deal.id)
    )
    on conflict (dedupe_key) where dedupe_key is not null do nothing;
  end if;

  if nullif(trim(v_lead.email), '') is not null then
    insert into public.notifications (
      recipient_email,
      audience,
      event_type,
      title,
      body,
      deal_id,
      lead_id,
      channels,
      dedupe_key
    )
    values (
      lower(trim(v_lead.email)),
      'seller',
      'seller_offer_ready',
      'Your Autorell offer is ready',
      concat(
        'The bidding for ',
        v_vehicle,
        ' has closed. Your offer of EUR ',
        v_amount,
        ' is ready for review.'
      ),
      v_deal.id,
      v_lead.id,
      array['email']::text[],
      concat('seller_offer_ready:', lower(trim(v_lead.email)), ':', v_deal.id)
    )
    on conflict (dedupe_key) where dedupe_key is not null do nothing;
  end if;
end;
$$;

revoke all on function public.enqueue_winning_bid_notifications(uuid, uuid)
from public, anon, authenticated;

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
    where l.created_at is not null
      and l.created_at + interval '24 hours' <= now()
      and not exists (
        select 1
        from public.deals d
        where d.lead_id = l.id
      )
    order by l.created_at asc
    for update skip locked
  loop
    v_checked := v_checked + 1;

    if not exists (
      select 1
      from public.bids b
      where b.lead_id = v_lead.id
    ) then
      v_no_bids := v_no_bids + 1;
      continue;
    end if;

    begin
      perform pg_advisory_xact_lock(hashtextextended(v_lead.id::text, 0));

      if exists (
        select 1
        from public.deals d
        where d.lead_id = v_lead.id
      ) then
        continue;
      end if;

      perform public.create_deal_from_winning_bid(v_lead.id);

      select d.id
      into v_deal_id
      from public.deals d
      where d.lead_id = v_lead.id
      order by d.created_at desc
      limit 1;

      if v_deal_id is null then
        raise exception 'Deal creation returned without creating a deal';
      end if;

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

revoke all on function public.close_expired_auctions()
from public, anon, authenticated;

commit;

-- Test once manually after the transaction succeeds:
select public.close_expired_auctions();

-- Enable Supabase Cron and run the closer every minute.
create extension if not exists pg_cron with schema extensions;

do $$
declare
  v_job_id bigint;
begin
  select jobid
  into v_job_id
  from cron.job
  where jobname = 'autorell-close-expired-auctions';

  if v_job_id is not null then
    perform cron.unschedule(v_job_id);
  end if;

  perform cron.schedule(
    'autorell-close-expired-auctions',
    '* * * * *',
    'select public.close_expired_auctions();'
  );
end;
$$;

select
  jobid,
  jobname,
  schedule,
  command,
  active
from cron.job
where jobname = 'autorell-close-expired-auctions';
