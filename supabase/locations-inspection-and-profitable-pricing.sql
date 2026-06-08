-- Exact city-level locations and profitable buyer pricing.
-- Run once in Supabase SQL Editor before deploying the matching application code.

begin;

alter table public.leads
  add column if not exists pickup_city text,
  add column if not exists pickup_postal_code text;

alter table public.dealers
  add column if not exists delivery_city text,
  add column if not exists delivery_postal_code text;

alter table public.deals
  add column if not exists origin_city text,
  add column if not exists origin_postal_code text,
  add column if not exists destination_city text,
  add column if not exists destination_postal_code text,
  add column if not exists inspection_fee numeric(12,2) not null default 249,
  add column if not exists inspection_name text not null default 'Autorell Verified Inspection',
  add column if not exists transport_supplier_cost numeric(12,2),
  add column if not exists transport_margin numeric(12,2);

alter table public.deals
  alter column export_document_fee set default 250;

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

  new.commission_amount := greatest(
    round(coalesce(new.winning_bid_amount, 0) * 0.03, 2),
    750
  );
  new.inspection_fee := coalesce(new.inspection_fee, 249);
  new.inspection_name := coalesce(
    nullif(trim(new.inspection_name), ''),
    'Autorell Verified Inspection'
  );
  new.export_document_fee := coalesce(new.export_document_fee, 250);
  new.transport_fee := greatest(coalesce(new.transport_fee, 0), v_minimum_transport);
  new.transport_supplier_cost := coalesce(
    new.transport_supplier_cost,
    v_estimated_supplier_cost
  );
  new.transport_margin := new.transport_fee - new.transport_supplier_cost;
  new.buyer_total_amount :=
    coalesce(new.winning_bid_amount, 0)
    + new.commission_amount
    + new.inspection_fee
    + new.transport_fee
    + new.export_document_fee;

  if new.transport_margin < 150 then
    raise exception 'Transport margin must be at least EUR 150';
  end if;

  return new;
end;
$$;

drop trigger if exists zzz_apply_autorell_deal_pricing on public.deals;
create trigger zzz_apply_autorell_deal_pricing
before insert or update of
  lead_id,
  buyer_dealer_id,
  winning_bid_amount,
  commission_amount,
  inspection_fee,
  transport_fee,
  transport_supplier_cost,
  export_document_fee,
  origin_city,
  origin_postal_code,
  destination_city,
  destination_postal_code
on public.deals
for each row
execute function public.apply_autorell_deal_pricing();

-- Refresh existing transactions only when no final contract version has been approved.
update public.deals d
set
  inspection_fee = coalesce(d.inspection_fee, 249),
  export_document_fee = greatest(coalesce(d.export_document_fee, 0), 250),
  transport_fee = greatest(coalesce(d.transport_fee, 0), 850),
  updated_at = now()
where not exists (
  select 1
  from public.contract_approvals ca
  where ca.deal_id = d.id
);

-- Dealer-safe auction view. Customer contact details remain excluded.
drop view if exists public.dealer_leads;
create or replace view public.dealer_leads
with (security_barrier = true)
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
  coalesce(l.origin_country, l.source, 'SE') as source,
  l.pickup_city,
  l.pickup_postal_code,
  l."sellTime",
  l.owners,
  l.service,
  l.damage,
  l.damage_description,
  l.brakes,
  l."importCar",
  l.inspection_valid_until,
  l.keys_count,
  l.gearbox,
  l.tires,
  l.tireset,
  l.towbar,
  l.warnings,
  l.equipment,
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

revoke all on public.dealer_leads from public, anon;
grant select on public.dealer_leads to authenticated;

commit;
