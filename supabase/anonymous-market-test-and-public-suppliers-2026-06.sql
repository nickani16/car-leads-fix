begin;

alter table public.leads
  add column if not exists supplier_type text not null default 'private',
  add column if not exists supplier_company_name text,
  add column if not exists supplier_registration_number text,
  add column if not exists supplier_contact_name text,
  add column if not exists supplier_vehicle_category text;

alter table public.leads
  drop constraint if exists leads_supplier_type_check,
  add constraint leads_supplier_type_check
    check (supplier_type in ('private', 'public_business', 'dealer_account'));

update public.leads
set supplier_type = case
  when seller_dealer_id is not null then 'dealer_account'
  when submission_type = 'dealer_marketplace' then 'public_business'
  else 'private'
end
where supplier_type = 'private';

create or replace view public.dealer_leads
as
select
  l.id,
  case
    when nullif(trim(l.reg), '') is null then null
    when length(trim(l.reg)) <= 3 then '***'
    else left(trim(l.reg), 3) || '***'
  end as reg,
  l.make,
  l.model,
  l.variant,
  l.model_year,
  l.first_registration,
  case
    when nullif(trim(l.vin), '') is null then null
    when length(trim(l.vin)) < 7 then '********'
    else left(trim(l.vin), 3) || '**********' || right(trim(l.vin), 4)
  end as vin,
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
  null::text as pickup_city,
  null::text as pickup_postal_code,
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
  to_jsonb(coalesce(
    array(
      select '/api/dealer/vehicle-image/' || l.id::text || '?index=' || (image_index - 1)::text
      from generate_series(1, coalesce(jsonb_array_length(l.images), 0)) image_index
    ),
    array[]::text[]
  )) as images,
  l.status,
  l.sale_format,
  l.buy_now_price,
  l.submission_type
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

commit;
