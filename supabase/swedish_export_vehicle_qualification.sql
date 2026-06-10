begin;

alter table public.leads
  add column if not exists is_driveable boolean,
  add column if not exists has_engine_transmission_issues boolean,
  add column if not exists has_fluid_leaks boolean,
  add column if not exists has_serious_collision_damage boolean;

drop view if exists public.dealer_leads;
create view public.dealer_leads
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
  case
    when nullif(trim(l.damage_description), '') is not null
      and nullif(trim(l.damage_description_en), '') is null then true
    else false
  end as damage_translation_pending,
  case
    when nullif(trim(l.equipment), '') is not null
      and nullif(trim(l.equipment_en), '') is null then true
    else false
  end as equipment_translation_pending,
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
