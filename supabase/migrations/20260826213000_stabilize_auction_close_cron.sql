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
  if not pg_try_advisory_xact_lock(hashtextextended('autorell-close-expired-auctions', 0)) then
    return jsonb_build_object('skipped', true, 'reason', 'already_running');
  end if;

  insert into public.auction_close_runs default values
  returning id into v_run_id;

  for v_lead in
    select l.id
    from public.leads l
    where l.auction_ends_at is not null
      and l.auction_ends_at <= now()
      and l.auction_closed_at is null
      and not exists (
        select 1
        from public.deals d
        where d.lead_id = l.id
      )
    order by l.auction_ends_at asc
    limit 25
    for update skip locked
  loop
    v_checked := v_checked + 1;

    if not exists (
      select 1
      from public.bids b
      where b.lead_id = v_lead.id
    ) then
      update public.leads
      set auction_closed_at = now(), auction_outcome = 'no_bids'
      where id = v_lead.id and auction_closed_at is null;
      v_no_bids := v_no_bids + 1;
      continue;
    end if;

    begin
      if exists (
        select 1
        from public.deals d
        where d.lead_id = v_lead.id
      ) then
        update public.leads
        set auction_closed_at = coalesce(auction_closed_at, now()), auction_outcome = 'won'
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
      set auction_closed_at = now(), auction_outcome = 'won'
      where id = v_lead.id;

      perform public.enqueue_winning_bid_notifications(v_deal_id, v_lead.id);
      v_created := v_created + 1;
    exception
      when others then
        v_failures := v_failures + 1;
        v_errors := left(concat(
          v_errors,
          case when v_errors = '' then '' else E'\n' end,
          v_lead.id,
          ': ',
          sqlerrm
        ), 10000);
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

select cron.alter_job(
  job_id := 2,
  schedule := '*/5 * * * *',
  command := 'select public.close_expired_auctions();',
  active := true
);
