-- Keep closed auctions and bids available to admin while excluding them from
-- the dealer-facing Data API views.

begin;

create or replace view public.dealer_leads
with (security_barrier = true, security_invoker = false)
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
  l.status
from public.leads l
where l.status = 'Active'
  and coalesce(
    l.auction_ends_at,
    l.created_at + interval '24 hours'
  ) > now()
  and exists (
    select 1
    from public.dealers d
    where d.user_id = auth.uid()
      and d.status = 'approved'
  );

revoke all on public.dealer_leads from public, anon;
grant select on public.dealer_leads to authenticated;

create or replace view public.dealer_bids
with (security_barrier = true, security_invoker = false)
as
select
  b.id,
  b.lead_id,
  b.amount,
  case when b.dealer_id = auth.uid() then b.dealer_id else null end as dealer_id,
  b.created_at
from public.bids b
join public.leads l on l.id = b.lead_id
where l.status = 'Active'
  and coalesce(
    l.auction_ends_at,
    l.created_at + interval '24 hours'
  ) > now()
  and exists (
    select 1
    from public.dealers d
    where d.user_id = auth.uid()
      and d.status = 'approved'
  );

revoke all on public.dealer_bids from public, anon;
grant select on public.dealer_bids to authenticated;

commit;
