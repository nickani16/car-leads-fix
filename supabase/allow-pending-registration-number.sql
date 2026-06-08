-- Allow Autorell's preliminary legal entity details to be saved while the
-- company registration number is pending. Contract signing remains blocked
-- until the registration number is added.

create or replace function public.update_platform_legal_entity(
  p_legal_name text,
  p_registration_number text,
  p_vat_number text,
  p_registered_address text,
  p_country_code text,
  p_email text,
  p_actor_role text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_entity_id uuid;
  v_deal record;
begin
  if p_actor_role not in ('admin', 'super_admin') then
    raise exception 'Admin access required';
  end if;
  if nullif(trim(p_legal_name), '') is null
    or nullif(trim(p_registered_address), '') is null then
    raise exception 'Legal name and registered address are required';
  end if;
  if p_country_code !~ '^[A-Z]{2}$' then
    raise exception 'Use a two-letter country code';
  end if;

  update public.platform_legal_entities set is_active = false
  where is_active = true;

  insert into public.platform_legal_entities (
    legal_name, registration_number, vat_number, registered_address,
    country_code, email, is_active
  ) values (
    trim(p_legal_name),
    nullif(trim(coalesce(p_registration_number, '')), ''),
    nullif(trim(coalesce(p_vat_number, '')), ''),
    trim(p_registered_address),
    upper(p_country_code),
    lower(nullif(trim(coalesce(p_email, '')), '')),
    true
  )
  returning id into v_entity_id;

  update public.contract_parties cp
  set
    legal_name = trim(p_legal_name),
    registration_number = nullif(trim(coalesce(p_registration_number, '')), ''),
    vat_number = nullif(trim(coalesce(p_vat_number, '')), ''),
    registered_address = trim(p_registered_address),
    country_code = upper(p_country_code),
    email = lower(nullif(trim(coalesce(p_email, '')), '')),
    verified_at = case
      when nullif(trim(coalesce(p_registration_number, '')), '') is not null
      then now()
      else null
    end,
    updated_at = now()
  where cp.party_role = 'platform'
    and exists (
      select 1 from public.contract_packets packet
      where packet.deal_id = cp.deal_id
        and packet.status in ('needs_information', 'draft_ready')
    );

  for v_deal in
    select deal_id
    from public.contract_packets
    where status in ('needs_information', 'draft_ready')
  loop
    perform public.refresh_contract_documents(v_deal.deal_id);
  end loop;

  return jsonb_build_object(
    'entity_id', v_entity_id,
    'updated', true,
    'registration_number_pending',
    nullif(trim(coalesce(p_registration_number, '')), '') is null
  );
end;
$$;

revoke all on function public.update_platform_legal_entity(text, text, text, text, text, text, text)
from public, anon, authenticated;
