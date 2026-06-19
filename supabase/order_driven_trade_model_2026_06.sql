-- Make Autorell the conditional purchaser and European reseller for all new
-- transactions. Existing deals retain their legacy buyer-fee pricing model.

begin;

alter table public.leads
  add column if not exists seller_target_price numeric(14,2),
  add column if not exists autorell_purchase_price numeric(14,2);

alter table public.leads
  drop constraint if exists leads_seller_target_price_check,
  add constraint leads_seller_target_price_check
    check (seller_target_price is null or seller_target_price > 0),
  drop constraint if exists leads_autorell_purchase_price_check,
  add constraint leads_autorell_purchase_price_check
    check (autorell_purchase_price is null or autorell_purchase_price > 0),
  drop constraint if exists leads_private_bid_sale_format_check;

alter table public.deals
  add column if not exists pricing_model text not null
    default 'legacy_buyer_fee';

alter table public.deals
  drop constraint if exists deals_pricing_model_check,
  add constraint deals_pricing_model_check
    check (pricing_model in ('legacy_buyer_fee', 'trade_margin_v1'));

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
  l.buy_now_price,
  l.submission_type
from public.leads l
where l.status = 'Active'
  and l.autorell_purchase_price is not null
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

create or replace function public.apply_autorell_deal_pricing()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lead public.leads%rowtype;
  v_dealer public.dealers%rowtype;
  v_minimum_transport numeric := 850;
  v_estimated_supplier_cost numeric := 650;
  v_required_margin numeric;
begin
  select * into v_lead from public.leads where id = new.lead_id;
  select * into v_dealer from public.dealers where id = new.buyer_dealer_id;

  new.origin_city := coalesce(
    nullif(trim(new.origin_city), ''),
    nullif(trim(v_lead.pickup_city), '')
  );
  new.origin_postal_code := coalesce(
    nullif(trim(new.origin_postal_code), ''),
    nullif(trim(v_lead.pickup_postal_code), '')
  );
  new.destination_city := coalesce(
    nullif(trim(new.destination_city), ''),
    nullif(trim(v_dealer.delivery_city), '')
  );
  new.destination_postal_code := coalesce(
    nullif(trim(new.destination_postal_code), ''),
    nullif(trim(v_dealer.delivery_postal_code), '')
  );

  new.inspection_fee := coalesce(new.inspection_fee, 249);
  new.inspection_name := coalesce(
    nullif(trim(new.inspection_name), ''),
    'Autorell Vehicle Verification'
  );
  new.export_document_fee := coalesce(new.export_document_fee, 149);
  new.transport_fee := greatest(
    coalesce(new.transport_fee, 0),
    v_minimum_transport
  );
  new.transport_supplier_cost := coalesce(
    new.transport_supplier_cost,
    v_estimated_supplier_cost
  );
  new.transport_margin := new.transport_fee - new.transport_supplier_cost;

  if new.pricing_model = 'trade_margin_v1' then
    new.seller_net_amount := coalesce(
      new.seller_net_amount,
      v_lead.autorell_purchase_price
    );
    new.commission_amount := round(
      coalesce(new.winning_bid_amount, 0)
        - coalesce(new.seller_net_amount, 0),
      2
    );
    v_required_margin := greatest(
      1500,
      coalesce(new.winning_bid_amount, 0) * 0.05
    );

    if new.seller_net_amount is null or new.seller_net_amount <= 0 then
      raise exception 'Autorell purchase price must be set before creating a trade';
    end if;

    if new.commission_amount < v_required_margin then
      raise exception 'Trade does not meet the minimum gross margin';
    end if;

    new.buyer_total_amount :=
      coalesce(new.winning_bid_amount, 0)
      + new.transport_fee
      + new.export_document_fee;
  else
    if tg_op = 'INSERT'
      or new.winning_bid_amount is distinct from old.winning_bid_amount then
      new.commission_amount := round(
        greatest(750, coalesce(new.winning_bid_amount, 0) * 0.03),
        2
      );
    end if;

    new.buyer_total_amount :=
      coalesce(new.winning_bid_amount, 0)
      + coalesce(new.commission_amount, 0)
      + new.inspection_fee
      + new.transport_fee
      + new.export_document_fee;
  end if;

  if new.transport_margin < 150 then
    raise exception 'Transport margin must be at least EUR 150';
  end if;

  return new;
end;
$$;

create or replace function public.create_deal_from_winning_bid(p_lead_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lead public.leads%rowtype;
  v_bid public.bids%rowtype;
  v_dealer public.dealers%rowtype;
  v_rule public.commission_rules%rowtype;
  v_deal_id uuid;
  v_margin numeric(14,2);
  v_required_margin numeric(14,2);
  v_buyer_total numeric(14,2);
begin
  perform pg_advisory_xact_lock(hashtextextended(p_lead_id::text, 0));

  select * into v_lead
  from public.leads
  where id = p_lead_id;

  if v_lead.id is null then
    raise exception 'Lead not found';
  end if;

  if coalesce(v_lead.auction_ends_at, v_lead.created_at + interval '24 hours') > now() then
    raise exception 'The auction is still active';
  end if;

  if v_lead.autorell_purchase_price is null then
    raise exception 'Autorell purchase price has not been set';
  end if;

  if exists (
    select 1 from public.deals
    where lead_id = p_lead_id and status <> 'cancelled'
  ) then
    raise exception 'A deal already exists for this vehicle';
  end if;

  select * into v_bid
  from public.bids
  where lead_id = p_lead_id
  order by amount desc, created_at asc
  limit 1;

  if v_bid.id is null then
    raise exception 'No bids exist for this vehicle';
  end if;

  if v_lead.reserve_price is not null
    and v_bid.amount < v_lead.reserve_price then
    raise exception 'The Autorell sale reserve was not met';
  end if;

  select * into v_dealer
  from public.dealers
  where user_id = v_bid.dealer_id
    and status = 'approved'
  limit 1;

  if v_dealer.id is null then
    raise exception 'The winning bidder is not an approved dealer';
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

  v_margin := round(v_bid.amount - v_lead.autorell_purchase_price, 2);
  v_required_margin := greatest(1500, v_bid.amount * 0.05);

  if v_margin < v_required_margin then
    raise exception 'Trade does not meet the minimum gross margin';
  end if;

  v_buyer_total := round(
    v_bid.amount
      + greatest(v_rule.transport_fee, 850)
      + v_rule.export_document_fee,
    2
  );

  update public.bids set is_winner = false where lead_id = p_lead_id;
  update public.bids set is_winner = true where id = v_bid.id;

  insert into public.deals (
    lead_id, winning_bid_id, buyer_dealer_id, commission_rule_id,
    status, pricing_model, currency, winning_bid_amount, seller_net_amount,
    commission_amount, transport_fee, export_document_fee, tax_amount,
    buyer_total_amount, origin_country, destination_country, vat_treatment,
    bid_is_binding, bid_binding_expires_at, vehicle_snapshot, pricing_snapshot
  )
  values (
    v_lead.id, v_bid.id, v_dealer.id, v_rule.id,
    'provisional_winner', 'trade_margin_v1', v_rule.currency,
    v_bid.amount, v_lead.autorell_purchase_price, v_margin,
    greatest(v_rule.transport_fee, 850), v_rule.export_document_fee, 0,
    v_buyer_total, coalesce(v_lead.origin_country, v_lead.source, 'SE'),
    v_dealer.country_code, 'pending_review', true,
    now() + interval '48 hours',
    to_jsonb(v_lead) - 'email' - 'phone' - 'seller_access_token_hash'
      - 'seller_target_price' - 'autorell_purchase_price',
    jsonb_build_object(
      'pricing_model', 'trade_margin_v1',
      'vehicle_sale_price', v_bid.amount,
      'seller_purchase_price', v_lead.autorell_purchase_price,
      'gross_trade_margin', v_margin,
      'minimum_required_margin', v_required_margin,
      'inspection_internal_cost', 249,
      'transport', greatest(v_rule.transport_fee, 850),
      'export_documents', v_rule.export_document_fee,
      'buyer_total', v_buyer_total,
      'currency', v_rule.currency
    )
  )
  returning id into v_deal_id;

  insert into public.deal_events (
    deal_id, event_type, from_status, to_status, actor_type,
    description, metadata
  )
  values (
    v_deal_id, 'trade_created', null, 'provisional_winner', 'system',
    'Autorell secured a provisional European buyer for a conditional vehicle purchase.',
    jsonb_build_object(
      'winning_bid_id', v_bid.id,
      'buyer_sale_price', v_bid.amount,
      'seller_purchase_price', v_lead.autorell_purchase_price,
      'gross_trade_margin', v_margin,
      'buyer_dealer_id', v_dealer.id
    )
  );

  return v_deal_id;
end;
$$;

create or replace function public.purchase_marketplace_vehicle(
  p_lead_id uuid,
  p_terms_version text,
  p_ip_address text default null,
  p_user_agent text default null
)
returns table (deal_id uuid, bid_id uuid, amount numeric)
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
  v_margin numeric(14,2);
  v_required_margin numeric(14,2);
  v_buyer_total numeric(14,2);
begin
  if v_user_id is null then raise exception 'User is not authenticated'; end if;

  select * into v_dealer
  from public.dealers
  where user_id = v_user_id and status = 'approved'
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
    or v_lead.buy_now_price is null
    or v_lead.autorell_purchase_price is null then
    raise exception 'Autorell vehicle is unavailable';
  end if;

  if v_lead.seller_dealer_id = v_dealer.id then
    raise exception 'You cannot purchase a vehicle supplied by your company';
  end if;

  if v_lead.auction_ends_at is not null and now() >= v_lead.auction_ends_at then
    raise exception 'The Autorell offer has expired';
  end if;

  if v_lead.auction_closed_at is not null or exists (
    select 1 from public.deals d
    where d.lead_id = p_lead_id and d.status <> 'cancelled'
  ) then
    raise exception 'This vehicle has already been allocated';
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

  v_margin := round(
    v_lead.buy_now_price - v_lead.autorell_purchase_price,
    2
  );
  v_required_margin := greatest(1500, v_lead.buy_now_price * 0.05);

  if v_margin < v_required_margin then
    raise exception 'Trade does not meet the minimum gross margin';
  end if;

  v_buyer_total := round(
    v_lead.buy_now_price
      + greatest(v_rule.transport_fee, 850)
      + v_rule.export_document_fee,
    2
  );

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
    lead_id, winning_bid_id, buyer_dealer_id, commission_rule_id,
    status, pricing_model, currency, winning_bid_amount, seller_net_amount,
    commission_amount, transport_fee, export_document_fee, tax_amount,
    buyer_total_amount, origin_country, destination_country, vat_treatment,
    bid_is_binding, bid_binding_expires_at, vehicle_snapshot, pricing_snapshot
  )
  values (
    v_lead.id, v_bid_id, v_dealer.id, v_rule.id,
    'provisional_winner', 'trade_margin_v1', v_rule.currency,
    v_lead.buy_now_price, v_lead.autorell_purchase_price, v_margin,
    greatest(v_rule.transport_fee, 850), v_rule.export_document_fee, 0,
    v_buyer_total, coalesce(v_lead.origin_country, v_lead.source, 'SE'),
    v_dealer.country_code, 'pending_review', true,
    now() + interval '48 hours',
    to_jsonb(v_lead) - 'email' - 'phone' - 'seller_access_token_hash'
      - 'seller_target_price' - 'autorell_purchase_price',
    jsonb_build_object(
      'pricing_model', 'trade_margin_v1',
      'sale_format', 'fixed_price',
      'vehicle_sale_price', v_lead.buy_now_price,
      'seller_purchase_price', v_lead.autorell_purchase_price,
      'gross_trade_margin', v_margin,
      'minimum_required_margin', v_required_margin,
      'inspection_internal_cost', 249,
      'transport', greatest(v_rule.transport_fee, 850),
      'export_documents', v_rule.export_document_fee,
      'buyer_total', v_buyer_total,
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
    v_deal_id, 'fixed_price_trade_created', null, 'provisional_winner',
    'dealer', v_user_id,
    'European dealer submitted a binding purchase to Autorell.',
    jsonb_build_object(
      'bid_id', v_bid_id,
      'buyer_sale_price', v_lead.buy_now_price,
      'seller_purchase_price', v_lead.autorell_purchase_price,
      'gross_trade_margin', v_margin,
      'buyer_dealer_id', v_dealer.id
    )
  );

  perform public.enqueue_winning_bid_notifications(v_deal_id, v_lead.id);

  return query select v_deal_id, v_bid_id, v_lead.buy_now_price;
end;
$$;

revoke all on function public.purchase_marketplace_vehicle(
  uuid, text, text, text
) from public, anon;
grant execute on function public.purchase_marketplace_vehicle(
  uuid, text, text, text
) to authenticated;

commit;
