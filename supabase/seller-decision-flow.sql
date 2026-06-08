-- Seller decision flow after a winning bid.
-- Run this entire file in Supabase SQL Editor.

begin;

alter table public.deals
  add column if not exists seller_decision text,
  add column if not exists seller_decision_at timestamptz,
  add column if not exists seller_decision_by uuid references auth.users(id) on delete set null,
  add column if not exists seller_decision_notes text,
  add column if not exists cancellation_reason text,
  add column if not exists contracts_started_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'deals_seller_decision_valid'
      and conrelid = 'public.deals'::regclass
  ) then
    alter table public.deals
      add constraint deals_seller_decision_valid
      check (
        seller_decision is null
        or seller_decision in ('accepted', 'declined')
      );
  end if;
end;
$$;

create table if not exists public.seller_decisions (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null unique references public.deals(id) on delete restrict,
  lead_id uuid not null references public.leads(id) on delete restrict,
  decision text not null check (decision in ('accepted', 'declined')),
  decided_by uuid references auth.users(id) on delete set null,
  decided_by_role text not null check (decided_by_role in ('admin', 'super_admin', 'sales')),
  notes text,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.seller_decisions enable row level security;
revoke all on public.seller_decisions from public, anon, authenticated;

create or replace function public.prevent_seller_decision_changes()
returns trigger language plpgsql as $$
begin
  raise exception 'Seller decision records are immutable';
end;
$$;

drop trigger if exists prevent_seller_decision_update on public.seller_decisions;
create trigger prevent_seller_decision_update
before update on public.seller_decisions
for each row execute function public.prevent_seller_decision_changes();

drop trigger if exists prevent_seller_decision_delete on public.seller_decisions;
create trigger prevent_seller_decision_delete
before delete on public.seller_decisions
for each row execute function public.prevent_seller_decision_changes();

create or replace function public.record_seller_decision(
  p_deal_id uuid,
  p_decision text,
  p_notes text,
  p_actor_user_id uuid,
  p_actor_role text,
  p_ip_address text default null,
  p_user_agent text default null
)
returns jsonb
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
  v_next_status text;
begin
  if p_decision not in ('accepted', 'declined') then
    raise exception 'Invalid seller decision';
  end if;
  if p_actor_role not in ('admin', 'super_admin', 'sales') then
    raise exception 'Seller decision access denied';
  end if;

  select * into v_deal
  from public.deals
  where id = p_deal_id
  for update;

  if v_deal.id is null then
    raise exception 'Deal was not found';
  end if;
  if v_deal.seller_decision is not null then
    raise exception 'Seller decision has already been recorded';
  end if;
  if v_deal.status not in ('provisional_winner', 'seller_review') then
    raise exception 'Seller decision is not allowed for current deal status';
  end if;

  select * into v_lead from public.leads where id = v_deal.lead_id;
  select * into v_dealer from public.dealers where id = v_deal.buyer_dealer_id;

  v_vehicle := trim(concat_ws(
    ' ',
    nullif(v_lead.make, ''),
    nullif(v_lead.model, ''),
    nullif(v_lead.reg, '')
  ));
  v_amount := to_char(v_deal.winning_bid_amount, 'FM999G999G999G990D00');
  v_next_status := case when p_decision = 'accepted'
    then 'seller_accepted' else 'cancelled' end;

  insert into public.seller_decisions (
    deal_id, lead_id, decision, decided_by, decided_by_role,
    notes, ip_address, user_agent
  ) values (
    v_deal.id, v_deal.lead_id, p_decision, p_actor_user_id, p_actor_role,
    nullif(trim(coalesce(p_notes, '')), ''),
    nullif(p_ip_address, '')::inet,
    left(p_user_agent, 1000)
  );

  update public.deals
  set
    status = v_next_status,
    seller_decision = p_decision,
    seller_decision_at = now(),
    seller_decision_by = p_actor_user_id,
    seller_decision_notes = nullif(trim(coalesce(p_notes, '')), ''),
    cancellation_reason = case when p_decision = 'declined'
      then coalesce(nullif(trim(p_notes), ''), 'Seller declined winning bid')
      else cancellation_reason end,
    contracts_started_at = case when p_decision = 'accepted'
      then now() else contracts_started_at end,
    updated_at = now()
  where id = v_deal.id;

  insert into public.notifications (
    recipient_user_id, recipient_email, audience, event_type, title,
    body, deal_id, lead_id, channels, dedupe_key
  ) values (
    v_dealer.user_id,
    v_dealer.email,
    'dealer',
    case when p_decision = 'accepted' then 'seller_accepted' else 'seller_declined' end,
    case when p_decision = 'accepted'
      then 'Seller accepted the winning bid'
      else 'Seller declined the winning bid' end,
    case when p_decision = 'accepted'
      then concat(
        'The seller accepted the winning bid of EUR ', v_amount,
        ' for ', v_vehicle, '. Autorell will start the contract process.'
      )
      else concat(
        'The seller declined the winning bid for ', v_vehicle,
        '. The transaction will not proceed.'
      ) end,
    v_deal.id,
    v_deal.lead_id,
    array['in_app', 'email']::text[],
    concat(
      case when p_decision = 'accepted' then 'seller_accepted' else 'seller_declined' end,
      ':dealer:', v_dealer.user_id, ':', v_deal.id
    )
  )
  on conflict (dedupe_key) where dedupe_key is not null do nothing;

  insert into public.notifications (
    recipient_user_id, audience, event_type, title, body,
    deal_id, lead_id, channels, dedupe_key
  )
  select
    a.user_id,
    'admin',
    case when p_decision = 'accepted' then 'contracts_pending' else 'seller_declined' end,
    case when p_decision = 'accepted'
      then 'Contracts are ready to generate'
      else 'Seller declined the winning bid' end,
    case when p_decision = 'accepted'
      then concat('Seller accepted ', v_vehicle, '. Generate buyer and seller contracts.')
      else concat('Seller declined ', v_vehicle, '. The deal has been cancelled.') end,
    v_deal.id,
    v_deal.lead_id,
    array['in_app', 'email']::text[],
    concat(
      case when p_decision = 'accepted' then 'contracts_pending' else 'seller_declined' end,
      ':admin:', a.user_id, ':', v_deal.id
    )
  from public.admin_users a
  where a.is_active = true
  on conflict (dedupe_key) where dedupe_key is not null do nothing;

  insert into public.notifications (
    recipient_user_id, recipient_email, audience, event_type, title, body,
    deal_id, lead_id, channels, dedupe_key
  )
  select
    s.user_id,
    s.email,
    'sales',
    case when p_decision = 'accepted' then 'contracts_pending' else 'seller_declined' end,
    case when p_decision = 'accepted'
      then 'Seller accepted - contracts pending'
      else 'Seller declined - deal cancelled' end,
    case when p_decision = 'accepted'
      then concat('Seller accepted ', v_vehicle, '. The contract flow can now start.')
      else concat('Seller declined ', v_vehicle, '. No contracts will be generated.') end,
    v_deal.id,
    v_deal.lead_id,
    array['in_app', 'email']::text[],
    concat(
      case when p_decision = 'accepted' then 'contracts_pending' else 'seller_declined' end,
      ':sales:', s.user_id, ':', v_deal.id
    )
  from public.staff_users s
  where s.role = 'sales'
    and s.is_active = true
  on conflict (dedupe_key) where dedupe_key is not null do nothing;

  return jsonb_build_object(
    'deal_id', v_deal.id,
    'decision', p_decision,
    'status', v_next_status
  );
end;
$$;

revoke all on function public.record_seller_decision(uuid, text, text, uuid, text, text, text)
from public, anon, authenticated;

commit;
