-- Pre-live hardening for database objects surfaced by Supabase Security Advisor.
-- The dealer RPCs remain SECURITY DEFINER intentionally: each binds auth.uid()
-- to an approved dealer and validates resource ownership inside the function.

alter view public.dealer_bids set (security_invoker = true);
alter view public.dealer_leads set (security_invoker = true);

-- These retired B2B views are no longer client API surfaces. Keeping them
-- service-only avoids exposing their underlying legacy tables while removing
-- view-owner privilege escalation.
revoke all on table public.dealer_bids from anon, authenticated;
revoke all on table public.dealer_leads from anon, authenticated;
grant select on table public.dealer_bids to service_role;
grant select on table public.dealer_leads to service_role;

alter function public.set_deal_updated_at() set search_path = public, pg_temp;
alter function public.prevent_deal_event_changes() set search_path = public, pg_temp;
alter function public.set_contract_updated_at() set search_path = public, pg_temp;
alter function public.set_payment_updated_at() set search_path = public, pg_temp;
alter function public.set_deal_party_updated_at() set search_path = public, pg_temp;
alter function public.set_signature_updated_at() set search_path = public, pg_temp;
alter function public.set_logistics_updated_at() set search_path = public, pg_temp;
alter function public.set_transport_rate_updated_at() set search_path = public, pg_temp;
alter function public.prevent_legal_acceptance_changes() set search_path = public, pg_temp;
alter function public.prevent_seller_decision_changes() set search_path = public, pg_temp;
alter function public.prevent_contract_document_changes() set search_path = public, pg_temp;
alter function public.set_marketplace_listing_references() set search_path = public, pg_temp;

-- Trigger helpers are not public RPC endpoints.
revoke execute on function public.set_marketplace_listing_references() from public, anon, authenticated;
grant execute on function public.set_marketplace_listing_references() to service_role;
