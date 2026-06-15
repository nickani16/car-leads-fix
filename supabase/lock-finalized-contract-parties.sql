-- Prevent party details from diverging from locked or distributed agreements.

create or replace function public.update_contract_party_details(
  p_deal_id uuid,
  p_actor_user_id uuid,
  p_seller_legal_name text,
  p_seller_email text,
  p_seller_phone text,
  p_seller_registration_number text,
  p_seller_registered_address text,
  p_seller_country_code text,
  p_buyer_legal_name text,
  p_buyer_email text,
  p_buyer_phone text,
  p_buyer_registration_number text,
  p_buyer_vat_number text,
  p_buyer_registered_address text,
  p_buyer_country_code text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_packet_id uuid;
begin
  if not exists (
    select 1 from public.staff_users
    where user_id = p_actor_user_id
      and role = 'sales'
      and is_active = true
  ) then
    raise exception 'Active sales access is required';
  end if;

  select id into v_packet_id
  from public.contract_packets
  where deal_id = p_deal_id
  for update;

  if v_packet_id is null then
    raise exception 'Contract packet was not found';
  end if;

  if exists (
    select 1
    from public.contract_documents_v2
    where deal_id = p_deal_id
      and (
        final_approved_at is not null
        or status in ('sent', 'signed')
      )
  ) then
    raise exception 'Finalized contract parties cannot be changed';
  end if;

  if nullif(trim(p_seller_legal_name), '') is null
    or nullif(trim(p_seller_email), '') is null
    or nullif(trim(p_seller_registered_address), '') is null then
    raise exception 'Seller name, email and address are required';
  end if;

  if nullif(trim(p_buyer_legal_name), '') is null
    or nullif(trim(p_buyer_email), '') is null
    or nullif(trim(p_buyer_vat_number), '') is null
    or nullif(trim(p_buyer_registered_address), '') is null then
    raise exception 'Buyer name, email, VAT number and address are required';
  end if;

  if upper(p_seller_country_code) !~ '^[A-Z]{2}$'
    or upper(p_buyer_country_code) !~ '^[A-Z]{2}$' then
    raise exception 'Use two-letter country codes';
  end if;

  update public.contract_parties
  set
    legal_name = trim(p_seller_legal_name),
    email = lower(trim(p_seller_email)),
    phone = nullif(trim(p_seller_phone), ''),
    registration_number = nullif(trim(p_seller_registration_number), ''),
    registered_address = trim(p_seller_registered_address),
    country_code = upper(p_seller_country_code),
    verified_at = now(),
    updated_at = now()
  where deal_id = p_deal_id and party_role = 'seller';

  if not found then
    raise exception 'Seller contract party was not found';
  end if;

  update public.contract_parties
  set
    legal_name = trim(p_buyer_legal_name),
    email = lower(trim(p_buyer_email)),
    phone = nullif(trim(p_buyer_phone), ''),
    registration_number = nullif(trim(p_buyer_registration_number), ''),
    vat_number = trim(p_buyer_vat_number),
    registered_address = trim(p_buyer_registered_address),
    country_code = upper(p_buyer_country_code),
    verified_at = now(),
    updated_at = now()
  where deal_id = p_deal_id and party_role = 'buyer';

  if not found then
    raise exception 'Buyer contract party was not found';
  end if;

  return public.refresh_contract_documents(p_deal_id);
end;
$$;

revoke all on function public.update_contract_party_details(
  uuid, uuid, text, text, text, text, text, text,
  text, text, text, text, text, text, text
) from public, anon, authenticated;
grant execute on function public.update_contract_party_details(
  uuid, uuid, text, text, text, text, text, text,
  text, text, text, text, text, text, text
) to service_role;
