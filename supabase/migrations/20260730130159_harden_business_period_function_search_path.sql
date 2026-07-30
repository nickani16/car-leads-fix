begin;

create or replace function public.resolve_business_listing_period(p_anchor timestamptz, p_now timestamptz)
returns table(period_start timestamptz, period_end timestamptz)
language plpgsql
stable
set search_path = public, pg_temp
as $$
declare
  v_start timestamptz := coalesce(p_anchor, p_now);
begin
  while v_start + interval '1 month' <= p_now loop
    v_start := v_start + interval '1 month';
  end loop;

  period_start := v_start;
  period_end := v_start + interval '1 month';
  return next;
end;
$$;

revoke all on function public.resolve_business_listing_period(timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function public.resolve_business_listing_period(timestamptz, timestamptz) to service_role;

commit;
