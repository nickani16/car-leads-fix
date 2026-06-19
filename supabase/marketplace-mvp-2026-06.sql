-- Fixed-price marketplace alongside the existing auction flow.

begin;

alter table public.leads
  add column if not exists sale_format text not null default 'auction',
  add column if not exists buy_now_price numeric(14,2);

alter table public.leads
  drop constraint if exists leads_sale_format_check,
  add constraint leads_sale_format_check
    check (sale_format in ('auction', 'marketplace')),
  drop constraint if exists leads_buy_now_price_check,
  add constraint leads_buy_now_price_check
    check (
      (sale_format = 'auction' and buy_now_price is null)
      or
      (sale_format = 'marketplace' and buy_now_price > 0)
    );

create index if not exists leads_sale_format_status_idx
  on public.leads (sale_format, status, auction_ends_at);

create or replace view public.dealer_leads
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
  );

revoke all on public.dealer_leads from public, anon;
grant select on public.dealer_leads to authenticated;

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

  select *
  into v_dealer
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

  select *
  into v_lead
  from public.leads
  where id = p_lead_id
  for update;

  if v_lead.id is null
    or v_lead.status <> 'Active'
    or v_lead.sale_format <> 'marketplace'
    or v_lead.buy_now_price is null then
    raise exception 'Marketplace vehicle is unavailable';
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

  select *
  into v_rule
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
    v_lead.id,
    v_lead.buy_now_price,
    v_user_id,
    true,
    p_terms_version,
    now(),
    nullif(p_ip_address, '')::inet,
    left(p_user_agent, 1000)
  )
  returning id into v_bid_id;

  insert into public.deals (
    lead_id,
    winning_bid_id,
    buyer_dealer_id,
    commission_rule_id,
    status,
    currency,
    winning_bid_amount,
    seller_net_amount,
    commission_amount,
    transport_fee,
    export_document_fee,
    tax_amount,
    buyer_total_amount,
    origin_country,
    destination_country,
    vat_treatment,
    bid_is_binding,
    bid_binding_expires_at,
    vehicle_snapshot,
    pricing_snapshot
  )
  values (
    v_lead.id,
    v_bid_id,
    v_dealer.id,
    v_rule.id,
    'provisional_winner',
    v_rule.currency,
    v_lead.buy_now_price,
    v_lead.buy_now_price,
    399,
    v_rule.transport_fee,
    v_rule.export_document_fee,
    0,
    v_lead.buy_now_price + 399 + 249
      + v_rule.transport_fee + v_rule.export_document_fee,
    coalesce(v_lead.origin_country, v_lead.source, 'SE'),
    v_dealer.country_code,
    'pending_review',
    true,
    now() + interval '48 hours',
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
  set
    auction_closed_at = now(),
    auction_outcome = 'won'
  where id = v_lead.id;

  insert into public.deal_events (
    deal_id,
    event_type,
    from_status,
    to_status,
    actor_type,
    actor_user_id,
    description,
    metadata
  )
  values (
    v_deal_id,
    'marketplace_purchase_submitted',
    null,
    'provisional_winner',
    'dealer',
    v_user_id,
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

revoke all on function public.purchase_marketplace_vehicle(
  uuid, text, text, text
) from public, anon;
grant execute on function public.purchase_marketplace_vehicle(
  uuid, text, text, text
) to authenticated;

commit;
