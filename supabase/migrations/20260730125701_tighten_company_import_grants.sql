begin;

revoke all on public.marketplace_company_locations from authenticated;
grant select on public.marketplace_company_locations to authenticated;
grant all on public.marketplace_company_locations to service_role;

revoke all on public.marketplace_company_import_jobs from authenticated;
grant select on public.marketplace_company_import_jobs to authenticated;
grant all on public.marketplace_company_import_jobs to service_role;

commit;
