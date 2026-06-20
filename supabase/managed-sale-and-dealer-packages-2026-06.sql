-- Paid dealer marketplace packages and Autorell Managed Sale.

alter table public.leads
  add column if not exists managed_sale_requested boolean not null default false,
  add column if not exists assigned_sales_user_id uuid references auth.users(id) on delete set null;

alter table public.leads
  drop constraint if exists leads_listing_plan_check;

alter table public.leads
  add constraint leads_listing_plan_check
  check (
    listing_plan in (
      'free_24h',
      'extended_7d',
      'premium_30d',
      'managed_sale'
    )
  );

alter table public.seller_listing_orders
  drop constraint if exists seller_listing_orders_package_check;

alter table public.seller_listing_orders
  add constraint seller_listing_orders_package_check
  check (package in ('extended_7d', 'premium_30d', 'managed_sale'));

alter table public.seller_listing_orders
  drop constraint if exists seller_listing_orders_amount_cents_check;

alter table public.seller_listing_orders
  add constraint seller_listing_orders_amount_cents_check
  check (amount_cents in (10000, 29000, 150000));

create index if not exists leads_managed_sale_assignment_idx
  on public.leads (assigned_sales_user_id, status)
  where managed_sale_requested = true;
