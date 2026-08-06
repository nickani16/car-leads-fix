create index if not exists dealer_vehicle_lead_company_contacts_contacted_by_idx
  on public.dealer_vehicle_lead_company_contacts (contacted_by_user_id);

create index if not exists marketplace_withdrawal_user_idx
  on public.marketplace_withdrawal_requests (user_id);
