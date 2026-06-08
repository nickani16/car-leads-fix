-- Admin approval of the exact seller and buyer agreement versions.
-- Run once in Supabase SQL Editor before using the admin approval button.

begin;

alter table public.contract_documents_v2
  add column if not exists final_approved_at timestamptz,
  add column if not exists final_approved_by uuid references auth.users(id) on delete restrict;

create table if not exists public.contract_approvals (
  id uuid primary key default gen_random_uuid(),
  packet_id uuid not null references public.contract_packets(id) on delete restrict,
  deal_id uuid not null references public.deals(id) on delete restrict,
  document_version integer not null,
  seller_document_id uuid not null references public.contract_documents_v2(id) on delete restrict,
  buyer_document_id uuid not null references public.contract_documents_v2(id) on delete restrict,
  seller_content_hash text not null,
  buyer_content_hash text not null,
  approved_by uuid not null references auth.users(id) on delete restrict,
  approved_by_role text not null check (approved_by_role in ('admin', 'super_admin')),
  approved_at timestamptz not null default now(),
  unique (packet_id, document_version)
);

alter table public.contract_approvals enable row level security;
revoke all on public.contract_approvals from public, anon, authenticated;

create index if not exists contract_approvals_deal_idx
  on public.contract_approvals (deal_id, approved_at desc);

create or replace function public.approve_final_contract_version(
  p_document_id uuid,
  p_actor_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_actor_role text;
  v_document public.contract_documents_v2%rowtype;
  v_packet public.contract_packets%rowtype;
  v_latest_version integer;
  v_seller public.contract_documents_v2%rowtype;
  v_buyer public.contract_documents_v2%rowtype;
  v_approval_id uuid;
begin
  select role into v_actor_role
  from public.admin_users
  where user_id = p_actor_user_id
    and is_active = true
    and role in ('admin', 'super_admin');

  if v_actor_role is null then
    raise exception 'Active admin access is required';
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

  if v_packet.id is null then
    raise exception 'Contract packet was not found';
  end if;

  if v_packet.status <> 'draft_ready'
    or jsonb_array_length(coalesce(v_packet.blockers, '[]'::jsonb)) > 0 then
    raise exception 'Complete all contract information before final approval';
  end if;

  select max(version) into v_latest_version
  from public.contract_documents_v2
  where packet_id = v_packet.id
    and status <> 'void';

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
    packet_id,
    deal_id,
    document_version,
    seller_document_id,
    buyer_document_id,
    seller_content_hash,
    buyer_content_hash,
    approved_by,
    approved_by_role
  ) values (
    v_packet.id,
    v_packet.deal_id,
    v_latest_version,
    v_seller.id,
    v_buyer.id,
    v_seller.content_hash,
    v_buyer.content_hash,
    p_actor_user_id,
    v_actor_role
  )
  on conflict (packet_id, document_version) do update
  set
    seller_document_id = excluded.seller_document_id,
    buyer_document_id = excluded.buyer_document_id,
    seller_content_hash = excluded.seller_content_hash,
    buyer_content_hash = excluded.buyer_content_hash
  returning id into v_approval_id;

  update public.contract_documents_v2
  set
    final_approved_at = now(),
    final_approved_by = p_actor_user_id
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
    'approved_at', now()
  );
end;
$$;

revoke all on function public.approve_final_contract_version(uuid, uuid)
from public, anon, authenticated;
grant execute on function public.approve_final_contract_version(uuid, uuid)
to service_role;

commit;
