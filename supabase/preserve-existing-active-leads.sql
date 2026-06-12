update public.leads
set status = 'Active'
where status = 'New'
  and auction_closed_at is null
  and auction_ends_at is not null;
