alter table public.marketplace_company_members
  add column if not exists billing_notifications_enabled boolean not null default false;

create index if not exists marketplace_company_members_billing_recipients_idx
  on public.marketplace_company_members (company_id, billing_notifications_enabled)
  where billing_notifications_enabled = true;

alter table public.marketplace_company_members
  drop constraint if exists marketplace_company_members_role_check;

alter table public.marketplace_company_members
  add constraint marketplace_company_members_role_check
  check (role in ('owner','admin','manager','finance','sales','staff','viewer','contact_person'));

alter table public.marketplace_company_invitations
  drop constraint if exists marketplace_company_invitations_role_check;

alter table public.marketplace_company_invitations
  add constraint marketplace_company_invitations_role_check
  check (role in ('admin','manager','finance','sales','staff','viewer'));

alter table public.business_email_deliveries
  drop constraint if exists business_email_deliveries_email_type_check;

alter table public.business_email_deliveries
  add constraint business_email_deliveries_email_type_check
  check (email_type in (
    'welcome',
    'invoice_ready',
    'payment_receipt',
    'payment_failed',
    'invoice_reminder',
    'account_blocked',
    'cancellation_scheduled'
  ));

grant select, update on public.marketplace_company_members to authenticated;
grant select, insert, update, delete on table public.business_email_deliveries to service_role;
