-- Lower the buyer fee without changing the existing managed auction workflow.

begin;

create or replace function public.apply_autorell_deal_pricing()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lead public.leads%rowtype;
  v_dealer public.dealers%rowtype;
  v_minimum_transport numeric := 850;
  v_estimated_supplier_cost numeric := 650;
begin
  select * into v_lead from public.leads where id = new.lead_id;
  select * into v_dealer from public.dealers where id = new.buyer_dealer_id;

  new.origin_city := coalesce(
    nullif(trim(new.origin_city), ''),
    nullif(trim(v_lead.pickup_city), '')
  );
  new.origin_postal_code := coalesce(
    nullif(trim(new.origin_postal_code), ''),
    nullif(trim(v_lead.pickup_postal_code), '')
  );
  new.destination_city := coalesce(
    nullif(trim(new.destination_city), ''),
    nullif(trim(v_dealer.delivery_city), '')
  );
  new.destination_postal_code := coalesce(
    nullif(trim(new.destination_postal_code), ''),
    nullif(trim(v_dealer.delivery_postal_code), '')
  );

  new.commission_amount := 399;
  new.inspection_fee := coalesce(new.inspection_fee, 249);
  new.inspection_name := coalesce(
    nullif(trim(new.inspection_name), ''),
    'Autorell Verified Inspection'
  );
  new.export_document_fee := coalesce(new.export_document_fee, 149);
  new.transport_fee := greatest(
    coalesce(new.transport_fee, 0),
    v_minimum_transport
  );
  new.transport_supplier_cost := coalesce(
    new.transport_supplier_cost,
    v_estimated_supplier_cost
  );
  new.transport_margin := new.transport_fee - new.transport_supplier_cost;
  new.buyer_total_amount :=
    coalesce(new.winning_bid_amount, 0)
    + new.commission_amount
    + new.inspection_fee
    + new.transport_fee
    + new.export_document_fee;

  if new.transport_margin < 150 then
    raise exception 'Transport margin must be at least EUR 150';
  end if;

  return new;
end;
$$;

update public.deals d
set
  commission_amount = 399,
  inspection_fee = coalesce(d.inspection_fee, 249),
  transport_fee = greatest(coalesce(d.transport_fee, 0), 850),
  export_document_fee = coalesce(d.export_document_fee, 149),
  buyer_total_amount =
    coalesce(d.winning_bid_amount, 0)
    + 399
    + coalesce(d.inspection_fee, 249)
    + greatest(coalesce(d.transport_fee, 0), 850)
    + coalesce(d.export_document_fee, 149),
  updated_at = now()
where not exists (
  select 1
  from public.contract_approvals ca
  where ca.deal_id = d.id
);

commit;

select
  id,
  winning_bid_amount,
  commission_amount,
  inspection_fee,
  transport_fee,
  export_document_fee,
  buyer_total_amount
from public.deals
order by created_at desc
limit 20;
