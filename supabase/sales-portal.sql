-- Sales Portal permissions and notification delivery support.
-- Run this after security-and-bidding.sql.

begin;

alter table public.notifications
  add column if not exists delivery_provider_id text;

create index if not exists notifications_sales_inbox_idx
  on public.notifications (recipient_user_id, created_at desc)
  where audience = 'sales';

commit;

-- Create the sales user's Supabase Auth account first, then add that user here.
-- Replace both placeholders before running the insert separately:
--
-- insert into public.staff_users (
--   user_id,
--   role,
--   display_name,
--   email,
--   is_active
-- )
-- values (
--   'AUTH_USER_UUID',
--   'sales',
--   'Sales person name',
--   'sales@autorell.com',
--   true
-- )
-- on conflict (user_id) do update
-- set
--   role = excluded.role,
--   display_name = excluded.display_name,
--   email = excluded.email,
--   is_active = true,
--   updated_at = now();
