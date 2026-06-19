-- Keep legacy active vehicles hidden until an Autorell purchase price and
-- protected resale margin have been reviewed by an administrator.

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
