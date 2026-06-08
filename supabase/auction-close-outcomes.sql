-- Records a permanent outcome so each expired auction is processed once.
-- Run this after automatic-auction-close.sql.

begin;

alter table public.leads
  add column if not exists auction_closed_at timestamptz,
  add column if not exists auction_outcome text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'leads_auction_outcome_valid'
      and conrelid = 'public.leads'::regclass
  ) then
    alter table public.leads
      add constraint leads_auction_outcome_valid
      check (
        auction_outcome is null
        or auction_outcome in ('won', 'no_bids', 'cancelled')
      );
  end if;
end;
$$;

create index if not exists leads_open_auction_close_idx
  on public.leads (created_at)
  where auction_closed_at is null;

-- Backfill auctions that already have a deal.
update public.leads l
set
  auction_closed_at = coalesce(l.auction_closed_at, d.created_at, now()),
  auction_outcome = 'won'
from public.deals d
where d.lead_id = l.id
  and (
    l.auction_closed_at is null
    or l.auction_outcome is distinct from 'won'
  );

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
      and l.auction_closed_at is null
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
      update public.leads
      set
        auction_closed_at = now(),
        auction_outcome = 'no_bids'
      where id = v_lead.id
        and auction_closed_at is null;

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
        update public.leads
        set
          auction_closed_at = coalesce(auction_closed_at, now()),
          auction_outcome = 'won'
        where id = v_lead.id;
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

      update public.leads
      set
        auction_closed_at = now(),
        auction_outcome = 'won'
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

commit;

-- Process any currently expired auction once with the new outcome tracking.
select public.close_expired_auctions();

select
  id,
  reg,
  auction_closed_at,
  auction_outcome
from public.leads
where auction_closed_at is not null
order by auction_closed_at desc
limit 20;
