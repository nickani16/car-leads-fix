-- Final preview-verification contracts for the Admin Control Center.

alter table public.support_tickets drop constraint if exists support_tickets_status_check;
update public.support_tickets
set status = case status
  when 'open' then 'new'
  when 'waiting_customer' then 'waiting_for_customer'
  when 'waiting_internal' then 'in_progress'
  else status
end
where status in ('open', 'waiting_customer', 'waiting_internal');
alter table public.support_tickets alter column status set default 'new';
alter table public.support_tickets
  add constraint support_tickets_status_check
  check (status in ('new','assigned','in_progress','waiting_for_customer','escalated','resolved','closed','reopened'));

alter table public.support_tickets
  add column if not exists market text,
  add column if not exists first_response_at timestamptz,
  add column if not exists resolved_at timestamptz,
  add column if not exists reopened_at timestamptz,
  add column if not exists last_message_at timestamptz,
  add column if not exists last_customer_message_at timestamptz,
  add column if not exists last_support_message_at timestamptz;

alter table public.support_messages
  add column if not exists delivery_status text not null default 'not_applicable'
    check (delivery_status in ('not_applicable','queued','sent','failed')),
  add column if not exists provider_message_id text,
  add constraint support_internal_note_never_delivered_check
    check (not is_internal or (delivery_status = 'not_applicable' and provider_message_id is null));

create or replace function public.sync_support_message_timestamps()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.support_tickets
  set updated_at = now(),
      last_message_at = new.created_at,
      last_customer_message_at = case when new.author_type = 'customer' then new.created_at else last_customer_message_at end,
      last_support_message_at = case when new.author_type = 'support' and not new.is_internal then new.created_at else last_support_message_at end,
      first_response_at = case
        when new.author_type = 'support' and not new.is_internal then coalesce(first_response_at, new.created_at)
        else first_response_at
      end
  where id = new.ticket_id;
  return new;
end;
$$;
drop trigger if exists support_message_timestamps on public.support_messages;
create trigger support_message_timestamps
  after insert on public.support_messages
  for each row execute function public.sync_support_message_timestamps();
revoke all on function public.sync_support_message_timestamps() from public, anon, authenticated;

create index if not exists support_tickets_assignment_queue_idx
  on public.support_tickets (assigned_to, status, updated_at desc);
create index if not exists support_tickets_resolution_metrics_idx
  on public.support_tickets (created_at, first_response_at, resolved_at);

alter table public.newsletter_deliveries
  add column if not exists is_test boolean not null default false,
  add column if not exists recipient_email text;

alter table public.admin_staff_invitations
  add column if not exists resent_at timestamptz,
  add column if not exists revoked_by uuid references auth.users(id) on delete set null;

create table if not exists public.auth_email_codes (
  id uuid primary key default gen_random_uuid(),
  email_hash text not null,
  code_hash text not null,
  redirect_path text,
  attempts integer not null default 0,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.auth_email_codes enable row level security;
revoke all on table public.auth_email_codes from anon, authenticated;
grant select, insert, update, delete on table public.auth_email_codes to service_role;
create index if not exists auth_email_codes_lookup_idx
  on public.auth_email_codes (email_hash, created_at desc) where consumed_at is null;
create index if not exists auth_email_codes_expiry_idx on public.auth_email_codes (expires_at);

create or replace function public.notify_admin_on_company_application()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  company_name text := coalesce(to_jsonb(new)->>'company_name', to_jsonb(new)->>'name', 'Nytt foretag');
  company_status text := coalesce(to_jsonb(new)->>'verification_status', to_jsonb(new)->>'status', 'pending');
  old_status text;
begin
  if tg_op = 'UPDATE' then
    old_status := coalesce(to_jsonb(old)->>'verification_status', to_jsonb(old)->>'status');
  end if;
  if tg_op = 'INSERT' or company_status is distinct from old_status then
    if company_status in ('pending','pending_review','submitted','application_pending') then
      insert into public.admin_notifications (
        notification_type, title, body, priority, resource_type, resource_id,
        action_url, created_by_event, metadata
      ) values (
        'company_application', 'Ny foretagsansokan', company_name, 'high',
        'marketplace_company', new.id::text, '/admin/companies?company=' || new.id::text,
        'marketplace_company_application', jsonb_build_object('company_status', company_status)
      );
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists marketplace_company_admin_notification on public.marketplace_companies;
create trigger marketplace_company_admin_notification
  after insert or update on public.marketplace_companies
  for each row execute function public.notify_admin_on_company_application();
revoke all on function public.notify_admin_on_company_application() from public, anon, authenticated;

comment on constraint support_internal_note_never_delivered_check on public.support_messages is
  'Defense in depth: an internal note can never carry outbound-delivery state or a provider message id.';
