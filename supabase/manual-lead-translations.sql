-- Manual English review fields for customer-written vehicle text.
-- Run once in Supabase SQL Editor before deploying the matching application code.

begin;

alter table public.leads
  add column if not exists damage_description_en text,
  add column if not exists equipment_en text,
  add column if not exists translation_reviewed_at timestamptz,
  add column if not exists translation_reviewed_by uuid references auth.users(id) on delete set null;

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

create or replace function public.use_approved_english_in_contract_snapshot()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_lead public.leads%rowtype;
  v_vehicle jsonb;
begin
  select l.* into v_lead
  from public.deals d
  join public.leads l on l.id = d.lead_id
  where d.id = new.deal_id;

  v_vehicle := coalesce(new.snapshot -> 'vehicle', '{}'::jsonb);
  v_vehicle := jsonb_set(
    v_vehicle,
    '{damage_description}',
    coalesce(to_jsonb(nullif(trim(v_lead.damage_description_en), '')), 'null'::jsonb),
    true
  );
  v_vehicle := jsonb_set(
    v_vehicle,
    '{equipment}',
    coalesce(to_jsonb(nullif(trim(v_lead.equipment_en), '')), 'null'::jsonb),
    true
  );
  new.snapshot := jsonb_set(new.snapshot, '{vehicle}', v_vehicle, true);
  new.content_hash := encode(
    digest(new.snapshot::text, 'sha256'),
    'hex'
  );

  return new;
end;
$$;

drop trigger if exists contract_snapshot_approved_english
on public.contract_documents_v2;
create trigger contract_snapshot_approved_english
before insert on public.contract_documents_v2
for each row
execute function public.use_approved_english_in_contract_snapshot();

create or replace function public.block_untranslated_contract_approval()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lead public.leads%rowtype;
begin
  if old.final_approved_at is null and new.final_approved_at is not null then
    select l.* into v_lead
    from public.deals d
    join public.leads l on l.id = d.lead_id
    where d.id = new.deal_id;

    if nullif(trim(v_lead.damage_description), '') is not null
      and nullif(trim(v_lead.damage_description_en), '') is null then
      raise exception 'English damage description must be approved first';
    end if;

    if nullif(trim(v_lead.equipment), '') is not null
      and nullif(trim(v_lead.equipment_en), '') is null then
      raise exception 'English equipment description must be approved first';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists block_untranslated_contract_approval
on public.contract_documents_v2;
create trigger block_untranslated_contract_approval
before update of final_approved_at on public.contract_documents_v2
for each row
execute function public.block_untranslated_contract_approval();

commit;
