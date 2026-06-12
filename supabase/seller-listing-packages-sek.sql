-- Price seller listing extensions in Swedish kronor.

alter table public.seller_listing_orders
  drop constraint if exists seller_listing_orders_amount_cents_check,
  drop constraint if exists seller_listing_orders_currency_check;

alter table public.seller_listing_orders
  alter column currency set default 'SEK';

update public.seller_listing_orders
set
  amount_cents = case package
    when 'extended_7d' then 10000
    when 'premium_30d' then 29000
    else amount_cents
  end,
  currency = 'SEK'
where status = 'pending';

alter table public.seller_listing_orders
  add constraint seller_listing_orders_amount_cents_check
    check (amount_cents in (10000, 29000)),
  add constraint seller_listing_orders_currency_check
    check (currency = 'SEK');
