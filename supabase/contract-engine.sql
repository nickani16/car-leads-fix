-- Autorell contract packet engine.
-- Creates two immutable draft documents after seller acceptance:
-- 1. Seller <-> Autorell
-- 2. Buyer <-> Autorell
-- Missing legal identity data is recorded as blockers before e-signing.

begin;

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.platform_legal_entities (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null,
  registration_number text,
  vat_number text,
  registered_address text,
  country_code text not null default 'SE',
  email text,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists one_active_platform_legal_entity
  on public.platform_legal_entities (is_active)
  where is_active = true;

create table if not exists public.contract_parties (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  party_role text not null check (party_role in ('seller', 'buyer', 'platform')),
  user_id uuid references auth.users(id) on delete set null,
  legal_name text,
  email text,
  phone text,
  registration_number text,
  vat_number text,
  registered_address text,
  country_code text,
  source text not null,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (deal_id, party_role)
);

create table if not exists public.contract_packets (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null unique references public.deals(id) on delete restrict,
  template_version text not null,
  status text not null check (
    status in (
      'needs_information',
      'draft_ready',
      'sent_for_signature',
      'partially_signed',
      'signed',
      'void'
    )
  ),
  blockers jsonb not null default '[]'::jsonb,
  generated_at timestamptz not null default now(),
  sent_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contract_documents_v2 (
  id uuid primary key default gen_random_uuid(),
  packet_id uuid not null references public.contract_packets(id) on delete restrict,
  deal_id uuid not null references public.deals(id) on delete restrict,
  document_type text not null check (
    document_type in ('seller_purchase_agreement', 'buyer_resale_agreement')
  ),
  version integer not null default 1,
  status text not null default 'draft' check (
    status in ('draft', 'ready', 'sent', 'signed', 'void')
  ),
  template_version text not null,
  snapshot jsonb not null,
  content_hash text not null,
  signing_provider text,
  provider_document_id text,
  signing_url text,
  pdf_path text,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  signed_at timestamptz,
  unique (deal_id, document_type, version)
);

alter table public.platform_legal_entities enable row level security;
alter table public.contract_parties enable row level security;
alter table public.contract_packets enable row level security;
alter table public.contract_documents_v2 enable row level security;

revoke all on public.platform_legal_entities from public, anon, authenticated;
revoke all on public.contract_parties from public, anon, authenticated;
revoke all on public.contract_packets from public, anon, authenticated;
revoke all on public.contract_documents_v2 from public, anon, authenticated;

create index if not exists contract_parties_deal_idx
  on public.contract_parties (deal_id);
create index if not exists contract_packets_status_idx
  on public.contract_packets (status, created_at desc);
create index if not exists contract_documents_packet_idx
  on public.contract_documents_v2 (packet_id);

create or replace function public.prevent_contract_document_changes()
returns trigger
language plpgsql
as $$
begin
  if old.status in ('signed', 'void') then
    raise exception 'Signed or void contract documents are immutable';
  end if;

  if old.status = 'sent'
    and new.status not in ('sent', 'signed') then
    raise exception 'A sent contract can only remain sent or become signed';
  end if;

  if new.snapshot is distinct from old.snapshot
    or new.content_hash is distinct from old.content_hash
    or new.template_version is distinct from old.template_version
    or new.document_type is distinct from old.document_type
    or new.deal_id is distinct from old.deal_id
    or new.version is distinct from old.version then
    raise exception 'Contract document content is immutable; create a new version';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_contract_document_content
on public.contract_documents_v2;

create trigger protect_contract_document_content
before update on public.contract_documents_v2
for each row
execute function public.prevent_contract_document_changes();

create or replace function public.generate_contract_packet(p_deal_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_deal public.deals%rowtype;
  v_lead public.leads%rowtype;
  v_dealer public.dealers%rowtype;
  v_platform public.platform_legal_entities%rowtype;
  v_packet_id uuid;
  v_blockers jsonb := '[]'::jsonb;
  v_status text;
  v_common jsonb;
  v_seller_snapshot jsonb;
  v_buyer_snapshot jsonb;
  v_template_version text := 'autorell-transaction-v1.0-2026-06-08';
begin
  select * into v_deal
  from public.deals
  where id = p_deal_id
  for update;

  if v_deal.id is null then
    raise exception 'Deal was not found';
  end if;
  if v_deal.status not in (
    'seller_accepted',
    'contracts_pending',
    'contracts_ready'
  ) then
    raise exception 'Contracts require seller acceptance';
  end if;

  select * into v_lead
  from public.leads
  where id = v_deal.lead_id;

  select * into v_dealer
  from public.dealers
  where id = v_deal.buyer_dealer_id;

  select * into v_platform
  from public.platform_legal_entities
  where is_active = true
  limit 1;

  insert into public.contract_parties (
    deal_id, party_role, legal_name, email, phone,
    registered_address, country_code, source
  ) values (
    v_deal.id,
    'seller',
    null,
    v_lead.email,
    v_lead.phone,
    null,
    coalesce(v_deal.origin_country, v_lead.origin_country, v_lead.source, 'SE'),
    'lead'
  )
  on conflict (deal_id, party_role) do update
  set
    email = coalesce(contract_parties.email, excluded.email),
    phone = coalesce(contract_parties.phone, excluded.phone),
    country_code = coalesce(contract_parties.country_code, excluded.country_code),
    updated_at = now();

  insert into public.contract_parties (
    deal_id, party_role, user_id, legal_name, email, phone,
    registration_number, vat_number, registered_address, country_code, source
  ) values (
    v_deal.id,
    'buyer',
    v_dealer.user_id,
    v_dealer.company_name,
    v_dealer.email,
    v_dealer.phone,
    null,
    v_dealer.vat_number,
    null,
    coalesce(v_dealer.country_code, v_deal.destination_country),
    'dealer'
  )
  on conflict (deal_id, party_role) do update
  set
    user_id = coalesce(contract_parties.user_id, excluded.user_id),
    legal_name = coalesce(contract_parties.legal_name, excluded.legal_name),
    email = coalesce(contract_parties.email, excluded.email),
    phone = coalesce(contract_parties.phone, excluded.phone),
    vat_number = coalesce(contract_parties.vat_number, excluded.vat_number),
    country_code = coalesce(contract_parties.country_code, excluded.country_code),
    updated_at = now();

  if v_platform.id is not null then
    insert into public.contract_parties (
      deal_id, party_role, legal_name, email, registration_number,
      vat_number, registered_address, country_code, source, verified_at
    ) values (
      v_deal.id,
      'platform',
      v_platform.legal_name,
      v_platform.email,
      v_platform.registration_number,
      v_platform.vat_number,
      v_platform.registered_address,
      v_platform.country_code,
      'platform_legal_entity',
      now()
    )
    on conflict (deal_id, party_role) do update
    set
      legal_name = excluded.legal_name,
      email = excluded.email,
      registration_number = excluded.registration_number,
      vat_number = excluded.vat_number,
      registered_address = excluded.registered_address,
      country_code = excluded.country_code,
      verified_at = excluded.verified_at,
      updated_at = now();
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

  insert into public.contract_packets (
    deal_id, template_version, status, blockers
  ) values (
    v_deal.id, v_template_version, v_status, v_blockers
  )
  on conflict (deal_id) do update
  set
    status = excluded.status,
    blockers = excluded.blockers,
    updated_at = now()
  returning id into v_packet_id;

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
    'template_version', v_template_version,
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
  ) values (
    v_packet_id,
    v_deal.id,
    'seller_purchase_agreement',
    1,
    case when v_status = 'draft_ready' then 'ready' else 'draft' end,
    v_template_version,
    v_seller_snapshot,
    encode(digest(v_seller_snapshot::text, 'sha256'), 'hex')
  )
  on conflict (deal_id, document_type, version) do nothing;

  insert into public.contract_documents_v2 (
    packet_id, deal_id, document_type, version, status,
    template_version, snapshot, content_hash
  ) values (
    v_packet_id,
    v_deal.id,
    'buyer_resale_agreement',
    1,
    case when v_status = 'draft_ready' then 'ready' else 'draft' end,
    v_template_version,
    v_buyer_snapshot,
    encode(digest(v_buyer_snapshot::text, 'sha256'), 'hex')
  )
  on conflict (deal_id, document_type, version) do nothing;

  update public.deals
  set
    status = 'contracts_pending',
    updated_at = now()
  where id = v_deal.id;

  return jsonb_build_object(
    'packet_id', v_packet_id,
    'status', v_status,
    'blockers', v_blockers,
    'documents_created', 2
  );
end;
$$;

revoke all on function public.generate_contract_packet(uuid)
from public, anon, authenticated;

create or replace function public.generate_contract_packet_after_acceptance()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if new.status = 'seller_accepted'
    and old.status is distinct from new.status then
    perform public.generate_contract_packet(new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists generate_contracts_after_seller_acceptance
on public.deals;

create trigger generate_contracts_after_seller_acceptance
after update of status on public.deals
for each row
execute function public.generate_contract_packet_after_acceptance();

commit;

-- Backfill accepted test deals and future accepted deals.
do $$
declare
  v_deal record;
begin
  for v_deal in
    select id
    from public.deals
    where status in ('seller_accepted', 'contracts_pending', 'contracts_ready')
  loop
    perform public.generate_contract_packet(v_deal.id);
  end loop;
end;
$$;

select
  cp.id,
  cp.deal_id,
  cp.status,
  cp.blockers,
  count(cd.id) as documents
from public.contract_packets cp
left join public.contract_documents_v2 cd on cd.packet_id = cp.id
group by cp.id, cp.deal_id, cp.status, cp.blockers
order by cp.created_at desc;
