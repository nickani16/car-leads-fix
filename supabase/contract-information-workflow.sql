-- Contract information completion and immutable document versioning.
-- Run after contract-engine.sql.

begin;

create or replace function public.refresh_contract_documents(p_deal_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_deal public.deals%rowtype;
  v_lead public.leads%rowtype;
  v_packet public.contract_packets%rowtype;
  v_blockers jsonb := '[]'::jsonb;
  v_status text;
  v_version integer;
  v_common jsonb;
  v_seller_snapshot jsonb;
  v_buyer_snapshot jsonb;
begin
  select * into v_deal from public.deals where id = p_deal_id for update;
  if v_deal.id is null then raise exception 'Deal was not found'; end if;
  if v_deal.seller_decision is distinct from 'accepted' then
    raise exception 'Seller must accept before contracts are prepared';
  end if;

  select * into v_lead from public.leads where id = v_deal.lead_id;
  select * into v_packet
  from public.contract_packets
  where deal_id = v_deal.id
  for update;

  if v_packet.id is null then
    raise exception 'Contract packet was not found';
  end if;

  if not exists (
    select 1 from public.contract_parties
    where deal_id = v_deal.id and party_role = 'seller'
      and nullif(trim(legal_name), '') is not null
  ) then
    v_blockers := v_blockers || jsonb_build_array('seller_legal_name');
  end if;
  if not exists (
    select 1 from public.contract_parties
    where deal_id = v_deal.id and party_role = 'seller'
      and nullif(trim(registered_address), '') is not null
  ) then
    v_blockers := v_blockers || jsonb_build_array('seller_registered_address');
  end if;
  if not exists (
    select 1 from public.contract_parties
    where deal_id = v_deal.id and party_role = 'buyer'
      and nullif(trim(legal_name), '') is not null
  ) then
    v_blockers := v_blockers || jsonb_build_array('buyer_legal_name');
  end if;
  if not exists (
    select 1 from public.contract_parties
    where deal_id = v_deal.id and party_role = 'buyer'
      and nullif(trim(vat_number), '') is not null
  ) then
    v_blockers := v_blockers || jsonb_build_array('buyer_vat_number');
  end if;
  if not exists (
    select 1 from public.contract_parties
    where deal_id = v_deal.id and party_role = 'platform'
      and nullif(trim(legal_name), '') is not null
      and nullif(trim(registration_number), '') is not null
      and nullif(trim(registered_address), '') is not null
  ) then
    v_blockers := v_blockers || jsonb_build_array('autorell_legal_entity');
  end if;

  v_status := case
    when jsonb_array_length(v_blockers) = 0 then 'draft_ready'
    else 'needs_information'
  end;

  update public.contract_packets
  set status = v_status, blockers = v_blockers, updated_at = now()
  where id = v_packet.id;

  select coalesce(max(version), 0) + 1
  into v_version
  from public.contract_documents_v2
  where deal_id = v_deal.id;

  update public.contract_documents_v2
  set status = 'void'
  where deal_id = v_deal.id
    and status in ('draft', 'ready');

  v_common := jsonb_build_object(
    'deal', to_jsonb(v_deal),
    'vehicle', to_jsonb(v_lead) - 'phone' - 'email',
    'pricing', jsonb_build_object(
      'currency', v_deal.currency,
      'winning_bid_amount', v_deal.winning_bid_amount,
      'seller_net_amount', v_deal.seller_net_amount,
      'commission_amount', v_deal.commission_amount,
      'transport_fee', v_deal.transport_fee,
      'export_document_fee', v_deal.export_document_fee,
      'buyer_total_amount', v_deal.buyer_total_amount
    ),
    'template_version', v_packet.template_version,
    'document_version', v_version,
    'generated_at', now()
  );

  v_seller_snapshot := v_common || jsonb_build_object(
    'agreement', 'seller_purchase_agreement',
    'seller', (
      select to_jsonb(cp) from public.contract_parties cp
      where cp.deal_id = v_deal.id and cp.party_role = 'seller'
    ),
    'autorell', (
      select to_jsonb(cp) from public.contract_parties cp
      where cp.deal_id = v_deal.id and cp.party_role = 'platform'
    ),
    'blockers', v_blockers
  );

  v_buyer_snapshot := v_common || jsonb_build_object(
    'agreement', 'buyer_resale_agreement',
    'buyer', (
      select to_jsonb(cp) from public.contract_parties cp
      where cp.deal_id = v_deal.id and cp.party_role = 'buyer'
    ),
    'autorell', (
      select to_jsonb(cp) from public.contract_parties cp
      where cp.deal_id = v_deal.id and cp.party_role = 'platform'
    ),
    'blockers', v_blockers
  );

  insert into public.contract_documents_v2 (
    packet_id, deal_id, document_type, version, status,
    template_version, snapshot, content_hash
  ) values
  (
    v_packet.id, v_deal.id, 'seller_purchase_agreement', v_version,
    case when v_status = 'draft_ready' then 'ready' else 'draft' end,
    v_packet.template_version, v_seller_snapshot,
    encode(digest(v_seller_snapshot::text, 'sha256'), 'hex')
  ),
  (
    v_packet.id, v_deal.id, 'buyer_resale_agreement', v_version,
    case when v_status = 'draft_ready' then 'ready' else 'draft' end,
    v_packet.template_version, v_buyer_snapshot,
    encode(digest(v_buyer_snapshot::text, 'sha256'), 'hex')
  );

  update public.deals
  set status = 'contracts_pending', updated_at = now()
  where id = v_deal.id;

  return jsonb_build_object(
    'packet_id', v_packet.id,
    'status', v_status,
    'version', v_version,
    'blockers', v_blockers
  );
end;
$$;

revoke all on function public.refresh_contract_documents(uuid)
from public, anon, authenticated;

create or replace function public.update_seller_contract_identity(
  p_deal_id uuid,
  p_legal_name text,
  p_registered_address text,
  p_country_code text,
  p_actor_user_id uuid,
  p_actor_role text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_actor_role not in ('admin', 'super_admin', 'sales') then
    raise exception 'Contract identity access denied';
  end if;
  if nullif(trim(p_legal_name), '') is null then
    raise exception 'Seller legal name is required';
  end if;
  if nullif(trim(p_registered_address), '') is null then
    raise exception 'Seller registered address is required';
  end if;
  if p_country_code !~ '^[A-Z]{2}$' then
    raise exception 'Use a two-letter country code';
  end if;

  update public.contract_parties
  set
    legal_name = trim(p_legal_name),
    registered_address = trim(p_registered_address),
    country_code = upper(p_country_code),
    verified_at = now(),
    updated_at = now()
  where deal_id = p_deal_id
    and party_role = 'seller';

  if not found then raise exception 'Seller contract party was not found'; end if;

  return public.refresh_contract_documents(p_deal_id);
end;
$$;

revoke all on function public.update_seller_contract_identity(uuid, text, text, text, uuid, text)
from public, anon, authenticated;

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
    or nullif(trim(p_registration_number), '') is null
    or nullif(trim(p_registered_address), '') is null then
    raise exception 'Legal name, registration number and address are required';
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
    trim(p_registration_number),
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
    registration_number = trim(p_registration_number),
    vat_number = nullif(trim(coalesce(p_vat_number, '')), ''),
    registered_address = trim(p_registered_address),
    country_code = upper(p_country_code),
    email = lower(nullif(trim(coalesce(p_email, '')), '')),
    verified_at = now(),
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

  return jsonb_build_object('entity_id', v_entity_id, 'updated', true);
end;
$$;

revoke all on function public.update_platform_legal_entity(text, text, text, text, text, text, text)
from public, anon, authenticated;

commit;
