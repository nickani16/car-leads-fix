-- Autorell notification email delivery cron.
-- Before running:
-- 1. Add CRON_SECRET in Vercel Environment Variables.
-- 2. Replace PASTE_THE_SAME_CRON_SECRET_HERE below with the exact same value.

create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron with schema extensions;

do $$
declare
  v_job_id bigint;
begin
  select jobid
  into v_job_id
  from cron.job
  where jobname = 'autorell-deliver-notifications';

  if v_job_id is not null then
    perform cron.unschedule(v_job_id);
  end if;

  perform cron.schedule(
    'autorell-deliver-notifications',
    '*/5 * * * *',
    $cron$
      select
        net.http_get(
          url := 'https://www.autorell.com/api/cron/notifications',
          headers := jsonb_build_object(
            'Authorization',
            'Bearer PASTE_THE_SAME_CRON_SECRET_HERE'
          )
        );
    $cron$
  );
end;
$$;

select
  jobid,
  jobname,
  schedule,
  command,
  active
from cron.job
where jobname = 'autorell-deliver-notifications';
