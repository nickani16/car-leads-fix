-- Sales-managed party completion and contract finalization.
-- Admin can inspect every version but is no longer a required approval step.

begin;

alter table public.contract_approvals
  drop constraint if exists contract_approvals_approved_by_role_check;

alter table public.contract_approvals
  add constraint contract_approvals_approved_by_role_check
  check (approved_by_role in ('sales', 'admin', 'super_admin'));

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
begin
  if not exists (
    select 1 from public.staff_users
    where user_id = p_actor_user_id
      and role = 'sales'
      and is_active = true
  ) then
    raise exception 'Active sales access is required';
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

  if not found then raise exception 'Seller contract party was not found'; end if;

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

  if not found then raise exception 'Buyer contract party was not found'; end if;

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

create or replace function public.finalize_contract_version_for_signature(
  p_document_id uuid,
  p_actor_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_document public.contract_documents_v2%rowtype;
  v_packet public.contract_packets%rowtype;
  v_latest_version integer;
  v_seller public.contract_documents_v2%rowtype;
  v_buyer public.contract_documents_v2%rowtype;
  v_approval_id uuid;
begin
  if not exists (
    select 1 from public.staff_users
    where user_id = p_actor_user_id
      and role = 'sales'
      and is_active = true
  ) then
    raise exception 'Active sales access is required';
  end if;

  select * into v_document
  from public.contract_documents_v2
  where id = p_document_id;

  if v_document.id is null then
    raise exception 'Contract document was not found';
  end if;

  select * into v_packet
  from public.contract_packets
  where id = v_document.packet_id
  for update;

  if v_packet.status <> 'draft_ready'
    or jsonb_array_length(coalesce(v_packet.blockers, '[]'::jsonb)) > 0 then
    raise exception 'Complete all contract information before finalizing';
  end if;

  select max(version) into v_latest_version
  from public.contract_documents_v2
  where packet_id = v_packet.id and status <> 'void';

  select * into v_seller
  from public.contract_documents_v2
  where packet_id = v_packet.id
    and document_type = 'seller_purchase_agreement'
    and version = v_latest_version
    and status = 'ready';

  select * into v_buyer
  from public.contract_documents_v2
  where packet_id = v_packet.id
    and document_type = 'buyer_resale_agreement'
    and version = v_latest_version
    and status = 'ready';

  if v_seller.id is null or v_buyer.id is null then
    raise exception 'Both latest agreement versions must be ready';
  end if;

  insert into public.contract_approvals (
    packet_id, deal_id, document_version,
    seller_document_id, buyer_document_id,
    seller_content_hash, buyer_content_hash,
    approved_by, approved_by_role
  ) values (
    v_packet.id, v_packet.deal_id, v_latest_version,
    v_seller.id, v_buyer.id,
    v_seller.content_hash, v_buyer.content_hash,
    p_actor_user_id, 'sales'
  )
  on conflict (packet_id, document_version) do update
  set
    seller_document_id = excluded.seller_document_id,
    buyer_document_id = excluded.buyer_document_id,
    seller_content_hash = excluded.seller_content_hash,
    buyer_content_hash = excluded.buyer_content_hash,
    approved_by = excluded.approved_by,
    approved_by_role = excluded.approved_by_role,
    approved_at = now()
  returning id into v_approval_id;

  update public.contract_documents_v2
  set final_approved_at = now(), final_approved_by = p_actor_user_id
  where id in (v_seller.id, v_buyer.id);

  update public.deals
  set status = 'contracts_ready', updated_at = now()
  where id = v_packet.deal_id;

  return jsonb_build_object(
    'approval_id', v_approval_id,
    'deal_id', v_packet.deal_id,
    'packet_id', v_packet.id,
    'document_version', v_latest_version,
    'seller_document_id', v_seller.id,
    'buyer_document_id', v_buyer.id,
    'finalized_at', now()
  );
end;
$$;

revoke all on function public.finalize_contract_version_for_signature(uuid, uuid)
from public, anon, authenticated;
grant execute on function public.finalize_contract_version_for_signature(uuid, uuid)
to service_role;

create or replace function public.apply_transaction_terms_v1_3()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_terms jsonb;
  v_language text;
  v_template_version constant text := 'autorell-transaction-v1.3-2026-06-15';
begin
  if new.status in ('sent', 'signed', 'void') then return new; end if;

  if new.document_type = 'seller_purchase_agreement' then
    v_language := 'sv';
    v_terms := jsonb_build_array(
      jsonb_build_object(
        'title', 'Detta köper Autorell',
        'text', 'Autorell köper det fordon som anges i avtalet till den angivna köpeskillingen. Köpet bygger på uppgifterna, bilderna och fordonsdeklarationen som säljaren har lämnat i formuläret. Dessa uppgifter är en del av avtalet.'
      ),
      jsonb_build_object(
        'title', 'Ett tryggt och tydligt underlag',
        'text', 'Säljaren bekräftar att uppgifterna är riktiga enligt säljarens kännedom och meddelar Autorell om något ändras före överlämningen. Autorell samordnar kontroll, betalning och hämtning.'
      ),
      jsonb_build_object(
        'title', 'Kontroll före slutförande',
        'text', 'Autorell kontrollerar bilen mot deklarationen före slutförandet. Kontrollen omfattar bland annat identitet och VIN, mätarställning, varningsindikeringar, körbarhet, synligt skick, nycklar, utrustning och uppgivna fel. Kontrollen är icke-destruktiv.'
      ),
      jsonb_build_object(
        'title', 'Om något avviker',
        'text', 'Om bilen eller handlingarna avviker väsentligt kontaktar Autorell säljaren och förklarar vad som har upptäckts. Parterna kan skriftligen komma överens om ett justerat pris eller andra villkor. Om en rimlig lösning inte kan nås får Autorell avstå från köpet utan att någon part behöver fullfölja affären.'
      ),
      jsonb_build_object(
        'title', 'Betalning och överlämning',
        'text', 'Utbetalning sker när köparens medel har kommit Autorell tillhanda, ägande och handlingar har verifierats, kontrollen är godkänd och bilen med nycklar och avtalade tillbehör har överlämnats enligt instruktion.'
      ),
      jsonb_build_object(
        'title', 'När avtalet blir bindande',
        'text', 'Avtalet blir bindande för säljaren och Autorell när båda parter har signerat samma låsta dokumentversion. En skriftligt godkänd prisjustering eller ändring blir därefter en del av avtalet.'
      )
    );
  else
    v_language := 'en';
    v_terms := jsonb_build_array(
      jsonb_build_object(
        'title', 'What the buyer is purchasing',
        'text', 'The buyer purchases the vehicle identified in this agreement at the stated vehicle price. The bid was placed on the basis of the vehicle profile, images, records, disclosed faults and seller declaration submitted through Autorell. That information forms part of the agreement.'
      ),
      jsonb_build_object(
        'title', 'Autorell manages the complete process',
        'text', 'Autorell coordinates the agreement, payment, seller completion, vehicle control, collection, Swedish export documentation, registration plate handling where applicable and the agreed transport or handover.'
      ),
      jsonb_build_object(
        'title', 'Control against the seller declaration',
        'text', 'Before completion, Autorell checks the vehicle against the declaration used for the bid. The control includes identity and VIN, mileage, warning indicators, drivability, principal functions, visible condition, tyres, brakes where reasonably assessable, keys, equipment and disclosed faults. It is non-destructive and cannot guarantee against hidden defects that could not reasonably be identified.'
      ),
      jsonb_build_object(
        'title', 'A clear choice if something differs',
        'text', 'If a material difference is found, Autorell pauses completion and provides the buyer with the available evidence. The buyer may cancel the transaction or ask Autorell to negotiate a documented price reduction or revised condition with the seller. No change applies unless the required parties accept it in writing.'
      ),
      jsonb_build_object(
        'title', 'Payment and protection of funds',
        'text', 'The complete confirmed buyer total must be transferred to the account designated by Autorell within three business days after signature. Funds must be cleared before release. If a material discrepancy leads to cancellation, funds received for the transaction are returned to the verified originating account, subject only to deductions expressly agreed in writing and permitted by law.'
      ),
      jsonb_build_object(
        'title', 'Export and delivery',
        'text', 'After cleared funds and an accepted control result, Autorell coordinates collection, export documentation and agreed logistics through selected partners by vehicle transporter or vessel. Documents or registration plates may be sent separately by tracked delivery where required.'
      ),
      jsonb_build_object(
        'title', 'When the agreement becomes binding',
        'text', 'The agreement becomes binding on the buyer and Autorell when both parties sign the same locked document version. Ownership and risk transfer at the point stated in the signed handover or transport documentation.'
      )
    );
  end if;

  new.template_version := v_template_version;
  new.snapshot := jsonb_set(
    jsonb_set(
      jsonb_set(new.snapshot, '{template_version}', to_jsonb(v_template_version), true),
      '{language}', to_jsonb(v_language), true
    ),
    '{terms}', v_terms, true
  );
  new.content_hash := encode(digest(new.snapshot::text, 'sha256'), 'hex');

  update public.contract_packets
  set template_version = v_template_version, updated_at = now()
  where id = new.packet_id and status in ('needs_information', 'draft_ready');

  return new;
end;
$$;

drop trigger if exists apply_transaction_terms_before_insert
on public.contract_documents_v2;

create trigger apply_transaction_terms_before_insert
before insert on public.contract_documents_v2
for each row
execute function public.apply_transaction_terms_v1_3();

revoke all on function public.apply_transaction_terms_v1_3()
from public, anon, authenticated;

do $$
declare
  v_deal_id uuid;
begin
  for v_deal_id in
    select distinct packet.deal_id
    from public.contract_packets packet
    join public.contract_documents_v2 document on document.packet_id = packet.id
    where packet.status in ('needs_information', 'draft_ready')
      and document.status in ('draft', 'ready')
      and document.final_approved_at is null
      and not exists (
        select 1
        from public.contract_documents_v2 protected_document
        where protected_document.packet_id = packet.id
          and (
            protected_document.status in ('sent', 'signed')
            or protected_document.final_approved_at is not null
          )
      )
  loop
    perform public.refresh_contract_documents(v_deal_id);
  end loop;
end;
$$;

commit;
