-- Sales workflow, native electronic signing, VAT checks and audit history.

begin;

alter table public.deals
  add column if not exists assigned_sales_user_id uuid references auth.users(id) on delete set null,
  add column if not exists assigned_at timestamptz,
  add column if not exists action_due_at timestamptz;

alter table public.contract_parties
  add column if not exists vat_validation_status text
    check (vat_validation_status in ('valid', 'invalid', 'unavailable')),
  add column if not exists vat_validated_at timestamptz,
  add column if not exists vat_validation_name text,
  add column if not exists vat_validation_address text,
  add column if not exists vat_validation_request_id text;

alter table public.notifications
  add column if not exists action_url text;

create table if not exists public.contract_signing_requests (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.contract_documents_v2(id) on delete restrict,
  packet_id uuid not null references public.contract_packets(id) on delete restrict,
  deal_id uuid not null references public.deals(id) on delete restrict,
  signer_role text not null check (signer_role in ('seller', 'buyer')),
  signer_email text not null,
  signer_name text,
  token_hash text not null unique,
  expires_at timestamptz not null,
  opened_at timestamptz,
  signed_at timestamptz,
  revoked_at timestamptz,
  typed_name text,
  accepted_terms boolean not null default false,
  signed_ip inet,
  signed_user_agent text,
  email_provider_id text,
  email_sent_at timestamptz,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.contract_events (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  packet_id uuid references public.contract_packets(id) on delete cascade,
  document_id uuid references public.contract_documents_v2(id) on delete cascade,
  signing_request_id uuid references public.contract_signing_requests(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_role text,
  event_type text not null,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.contract_signing_requests enable row level security;
alter table public.contract_events enable row level security;
revoke all on public.contract_signing_requests from public, anon, authenticated;
revoke all on public.contract_events from public, anon, authenticated;

create index if not exists deals_sales_workflow_idx
  on public.deals (assigned_sales_user_id, action_due_at, status);
create index if not exists signing_requests_document_idx
  on public.contract_signing_requests (document_id, created_at desc);
create index if not exists signing_requests_active_idx
  on public.contract_signing_requests (token_hash)
  where signed_at is null and revoked_at is null;
create index if not exists contract_events_deal_idx
  on public.contract_events (deal_id, created_at desc);

alter table public.deals
  drop constraint if exists deals_status_valid;
alter table public.deals
  add constraint deals_status_valid check (
    status in (
      'provisional_winner', 'seller_review', 'seller_accepted',
      'contracts_pending', 'contracts_ready', 'contracts_signed',
      'payment_pending', 'funded', 'pickup_scheduled',
      'vehicle_collected', 'seller_paid', 'export_in_progress',
      'delivered', 'completed', 'cancelled', 'disputed'
    )
  );

create or replace function public.complete_native_contract_signature(
  p_token_hash text,
  p_typed_name text,
  p_ip_address text default null,
  p_user_agent text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.contract_signing_requests%rowtype;
  v_signed_count integer;
  v_required_count integer;
  v_current_version integer;
  v_updated_count integer;
begin
  select * into v_request
  from public.contract_signing_requests
  where token_hash = p_token_hash
  for update;

  if v_request.id is null
    or v_request.revoked_at is not null
    or v_request.expires_at <= now() then
    raise exception 'This signing link is invalid or has expired';
  end if;

  if v_request.signed_at is not null then
    return jsonb_build_object(
      'already_signed', true,
      'deal_id', v_request.deal_id,
      'document_id', v_request.document_id
    );
  end if;

  if nullif(trim(p_typed_name), '') is null then
    raise exception 'Enter the signer name';
  end if;

  update public.contract_signing_requests
  set
    signed_at = now(),
    typed_name = trim(p_typed_name),
    accepted_terms = true,
    signed_ip = nullif(p_ip_address, '')::inet,
    signed_user_agent = left(p_user_agent, 1000)
  where id = v_request.id;

  update public.contract_documents_v2
  set status = 'signed', signed_at = now()
  where id = v_request.document_id
    and status = 'sent';

  get diagnostics v_updated_count = row_count;
  if v_updated_count <> 1 then
    raise exception 'This agreement is no longer available for signature';
  end if;

  insert into public.contract_events (
    deal_id, packet_id, document_id, signing_request_id,
    actor_role, event_type, summary, metadata
  ) values (
    v_request.deal_id,
    v_request.packet_id,
    v_request.document_id,
    v_request.id,
    v_request.signer_role,
    'contract_signed',
    initcap(v_request.signer_role) || ' signed the agreement',
    jsonb_build_object('typed_name', trim(p_typed_name))
  );

  select max(version) into v_current_version
  from public.contract_documents_v2
  where packet_id = v_request.packet_id
    and status <> 'void';

  select count(*) into v_required_count
  from public.contract_documents_v2
  where packet_id = v_request.packet_id
    and version = v_current_version
    and status <> 'void'
    and final_approved_at is not null;

  select count(*) into v_signed_count
  from public.contract_documents_v2
  where packet_id = v_request.packet_id
    and version = v_current_version
    and status = 'signed'
    and final_approved_at is not null;

  update public.contract_packets
  set
    status = case
      when v_required_count > 0 and v_signed_count = v_required_count then 'signed'
      else 'partially_signed'
    end,
    completed_at = case
      when v_required_count > 0 and v_signed_count = v_required_count then now()
      else completed_at
    end,
    updated_at = now()
  where id = v_request.packet_id;

  if v_required_count > 0 and v_signed_count = v_required_count then
    update public.deals
    set status = 'contracts_signed', action_due_at = null, updated_at = now()
    where id = v_request.deal_id;

    insert into public.contract_events (
      deal_id, packet_id, actor_role, event_type, summary
    ) values (
      v_request.deal_id,
      v_request.packet_id,
      'system',
      'contract_packet_completed',
      'Both agreements are signed'
    );
  end if;

  return jsonb_build_object(
    'deal_id', v_request.deal_id,
    'document_id', v_request.document_id,
    'signed_count', v_signed_count,
    'required_count', v_required_count,
    'packet_complete', v_required_count > 0 and v_signed_count = v_required_count
  );
end;
$$;

revoke all on function public.complete_native_contract_signature(
  text, text, text, text
) from public, anon, authenticated;
grant execute on function public.complete_native_contract_signature(
  text, text, text, text
) to service_role;

commit;
