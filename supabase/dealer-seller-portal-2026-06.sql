-- Dealer seller portal built on the existing leads, bids and deals model.

begin;

alter table public.leads
  add column if not exists seller_dealer_id uuid references public.dealers(id) on delete restrict,
  add column if not exists reserve_price numeric(14,2);

alter table public.leads
  drop constraint if exists leads_reserve_price_check,
  add constraint leads_reserve_price_check
    check (reserve_price is null or reserve_price > 0);

create index if not exists leads_seller_dealer_created_idx
  on public.leads (seller_dealer_id, created_at desc);

create or replace view public.dealer_leads
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
  l.status,
  l.sale_format,
  l.buy_now_price
from public.leads l
where l.status = 'Active'
  and l.auction_closed_at is null
  and exists (
    select 1
    from public.dealers d
    where d.user_id = auth.uid()
      and d.status = 'approved'
      and l.seller_dealer_id is distinct from d.id
  );

alter view public.dealer_leads set (security_invoker = false);
revoke all on public.dealer_leads from public, anon;
grant select on public.dealer_leads to authenticated;

alter table public.seller_decisions
  drop constraint if exists seller_decisions_decided_by_role_check,
  add constraint seller_decisions_decided_by_role_check
    check (decided_by_role in ('admin', 'super_admin', 'sales', 'dealer'));

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
  v_dealer_id uuid;
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
    and l.seller_dealer_id is distinct from v_dealer_id;

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

create or replace function public.purchase_marketplace_vehicle(
  p_lead_id uuid,
  p_terms_version text,
  p_ip_address text default null,
  p_user_agent text default null
)
returns table (
  deal_id uuid,
  bid_id uuid,
  amount numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_lead public.leads%rowtype;
  v_dealer public.dealers%rowtype;
  v_rule public.commission_rules%rowtype;
  v_bid_id uuid;
  v_deal_id uuid;
begin
  if v_user_id is null then
    raise exception 'User is not authenticated';
  end if;

  select * into v_dealer
  from public.dealers
  where user_id = v_user_id
    and status = 'approved'
  limit 1;

  if v_dealer.id is null then
    raise exception 'Dealer account is not approved';
  end if;

  if nullif(trim(p_terms_version), '') is null then
    raise exception 'Binding purchase terms must be accepted';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_lead_id::text, 0));

  select * into v_lead
  from public.leads
  where id = p_lead_id
  for update;

  if v_lead.id is null
    or v_lead.status <> 'Active'
    or v_lead.sale_format <> 'marketplace'
    or v_lead.buy_now_price is null then
    raise exception 'Marketplace vehicle is unavailable';
  end if;

  if v_lead.seller_dealer_id = v_dealer.id then
    raise exception 'You cannot purchase your own vehicle';
  end if;

  if v_lead.auction_ends_at is not null and now() >= v_lead.auction_ends_at then
    raise exception 'Marketplace listing has expired';
  end if;

  if v_lead.auction_closed_at is not null or exists (
    select 1 from public.deals d
    where d.lead_id = p_lead_id and d.status <> 'cancelled'
  ) then
    raise exception 'This vehicle has already been purchased';
  end if;

  select * into v_rule
  from public.commission_rules
  where is_active = true
    and valid_from <= now()
    and (valid_until is null or valid_until > now())
  order by valid_from desc
  limit 1;

  if v_rule.id is null then
    raise exception 'No active pricing rule exists';
  end if;

  insert into public.bids (
    lead_id, amount, dealer_id, is_winner, terms_version,
    terms_accepted_at, submitted_ip, submitted_user_agent
  )
  values (
    v_lead.id, v_lead.buy_now_price, v_user_id, true, p_terms_version,
    now(), nullif(p_ip_address, '')::inet, left(p_user_agent, 1000)
  )
  returning id into v_bid_id;

  insert into public.deals (
    lead_id, winning_bid_id, buyer_dealer_id, commission_rule_id, status,
    currency, winning_bid_amount, seller_net_amount, commission_amount,
    transport_fee, export_document_fee, tax_amount, buyer_total_amount,
    origin_country, destination_country, vat_treatment, bid_is_binding,
    bid_binding_expires_at, vehicle_snapshot, pricing_snapshot
  )
  values (
    v_lead.id, v_bid_id, v_dealer.id, v_rule.id, 'provisional_winner',
    v_rule.currency, v_lead.buy_now_price, v_lead.buy_now_price, 399,
    v_rule.transport_fee, v_rule.export_document_fee, 0,
    v_lead.buy_now_price + 399 + 249
      + v_rule.transport_fee + v_rule.export_document_fee,
    coalesce(v_lead.origin_country, v_lead.source, 'SE'),
    v_dealer.country_code, 'pending_review', true, now() + interval '48 hours',
    to_jsonb(v_lead) - 'email' - 'phone' - 'seller_access_token_hash',
    jsonb_build_object(
      'sale_format', 'marketplace',
      'vehicle_price', v_lead.buy_now_price,
      'buyer_fee', 399,
      'inspection', 249,
      'transport', v_rule.transport_fee,
      'export_documents', v_rule.export_document_fee,
      'currency', v_rule.currency
    )
  )
  returning id into v_deal_id;

  update public.leads
  set auction_closed_at = now(), auction_outcome = 'won'
  where id = v_lead.id;

  insert into public.deal_events (
    deal_id, event_type, from_status, to_status, actor_type,
    actor_user_id, description, metadata
  )
  values (
    v_deal_id, 'marketplace_purchase_submitted', null, 'provisional_winner',
    'dealer', v_user_id,
    'Dealer submitted a binding purchase at the marketplace price.',
    jsonb_build_object(
      'bid_id', v_bid_id,
      'amount', v_lead.buy_now_price,
      'buyer_dealer_id', v_dealer.id
    )
  );

  perform public.enqueue_winning_bid_notifications(v_deal_id, v_lead.id);

  return query select v_deal_id, v_bid_id, v_lead.buy_now_price;
end;
$$;

create or replace function public.dealer_record_seller_decision(
  p_deal_id uuid,
  p_decision text,
  p_notes text default null,
  p_ip_address text default null,
  p_user_agent text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_dealer_id uuid;
  v_deal public.deals%rowtype;
  v_lead public.leads%rowtype;
  v_buyer public.dealers%rowtype;
  v_vehicle text;
  v_amount text;
  v_next_status text;
begin
  if v_user_id is null then
    raise exception 'User is not authenticated';
  end if;

  if p_decision not in ('accepted', 'declined') then
    raise exception 'Invalid seller decision';
  end if;

  select d.id into v_dealer_id
  from public.dealers d
  where d.user_id = v_user_id
    and d.status = 'approved'
  limit 1;

  select deal.* into v_deal
  from public.deals deal
  join public.leads lead on lead.id = deal.lead_id
  where deal.id = p_deal_id
    and lead.seller_dealer_id = v_dealer_id
  for update of deal;

  if v_deal.id is null then
    raise exception 'Deal was not found for this seller';
  end if;

  if v_deal.seller_decision is not null then
    raise exception 'Seller decision has already been recorded';
  end if;

  if v_deal.status not in ('provisional_winner', 'seller_review') then
    raise exception 'Seller decision is not allowed for current deal status';
  end if;

  select * into v_lead from public.leads where id = v_deal.lead_id;
  select * into v_buyer from public.dealers where id = v_deal.buyer_dealer_id;

  v_vehicle := trim(concat_ws(
    ' ', nullif(v_lead.make, ''), nullif(v_lead.model, ''), nullif(v_lead.reg, '')
  ));
  v_amount := to_char(v_deal.winning_bid_amount, 'FM999G999G999G990D00');
  v_next_status := case when p_decision = 'accepted'
    then 'seller_accepted' else 'cancelled' end;

  insert into public.seller_decisions (
    deal_id, lead_id, decision, decided_by, decided_by_role,
    notes, ip_address, user_agent
  )
  values (
    v_deal.id, v_deal.lead_id, p_decision, v_user_id, 'dealer',
    nullif(trim(coalesce(p_notes, '')), ''),
    nullif(p_ip_address, '')::inet,
    left(p_user_agent, 1000)
  );

  update public.deals
  set
    status = v_next_status,
    seller_decision = p_decision,
    seller_decision_at = now(),
    seller_decision_by = v_user_id,
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
  )
  values (
    v_buyer.user_id, v_buyer.email, 'dealer',
    case when p_decision = 'accepted' then 'seller_accepted' else 'seller_declined' end,
    case when p_decision = 'accepted'
      then 'Seller accepted the winning bid'
      else 'Seller declined the winning bid' end,
    case when p_decision = 'accepted'
      then concat('The seller accepted the winning bid of EUR ', v_amount,
        ' for ', v_vehicle, '. Autorell will start the contract process.')
      else concat('The seller declined the winning bid for ', v_vehicle,
        '. The transaction will not proceed.') end,
    v_deal.id, v_deal.lead_id, array['in_app', 'email']::text[],
    concat(
      case when p_decision = 'accepted' then 'seller_accepted' else 'seller_declined' end,
      ':dealer:', v_buyer.user_id, ':', v_deal.id
    )
  )
  on conflict (dedupe_key) where dedupe_key is not null do nothing;

  insert into public.notifications (
    recipient_user_id, audience, event_type, title, body,
    deal_id, lead_id, channels, dedupe_key
  )
  select
    a.user_id, 'admin',
    case when p_decision = 'accepted' then 'contracts_pending' else 'seller_declined' end,
    case when p_decision = 'accepted'
      then 'Contracts are ready to generate'
      else 'Seller declined the winning bid' end,
    case when p_decision = 'accepted'
      then concat('Dealer seller accepted ', v_vehicle, '. Generate buyer and seller contracts.')
      else concat('Dealer seller declined ', v_vehicle, '. The deal has been cancelled.') end,
    v_deal.id, v_deal.lead_id, array['in_app', 'email']::text[],
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
    s.user_id, s.email, 'sales',
    case when p_decision = 'accepted' then 'contracts_pending' else 'seller_declined' end,
    case when p_decision = 'accepted'
      then 'Dealer seller accepted - contracts pending'
      else 'Dealer seller declined - deal cancelled' end,
    case when p_decision = 'accepted'
      then concat('Dealer seller accepted ', v_vehicle, '. The contract flow can now start.')
      else concat('Dealer seller declined ', v_vehicle, '. No contracts will be generated.') end,
    v_deal.id, v_deal.lead_id, array['in_app', 'email']::text[],
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

revoke all on function public.dealer_record_seller_decision(
  uuid, text, text, text, text
) from public, anon;
grant execute on function public.dealer_record_seller_decision(
  uuid, text, text, text, text
) to authenticated;

commit;
