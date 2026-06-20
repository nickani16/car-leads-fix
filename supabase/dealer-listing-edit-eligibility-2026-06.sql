-- Enforce the public dealer-stock eligibility rules at the database boundary.
-- The leads.miles column stores Swedish mil, so 1,000 mil equals 10,000 km.

begin;

alter table public.leads
  drop constraint if exists leads_dealer_stock_eligibility_check;

alter table public.leads
  add constraint leads_dealer_stock_eligibility_check
  check (
    seller_dealer_id is null
    or (
      model_year >= 2018
      and miles ~ '^[0-9]+([.][0-9]+)?$'
      and miles::numeric <= 1000
    )
  );

commit;
