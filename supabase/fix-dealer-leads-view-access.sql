begin;

-- The view exposes an approved, non-sensitive vehicle projection. Running it
-- with invoker rights would require direct SELECT access to private lead data.
alter view public.dealer_leads set (security_invoker = false);

revoke all on public.dealer_leads from public, anon;
grant select on public.dealer_leads to authenticated;

commit;
