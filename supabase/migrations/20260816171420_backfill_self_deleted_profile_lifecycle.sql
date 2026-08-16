with deletion_requests as (
  select reporter_user_id, max(created_at) as requested_at
  from public.marketplace_reports
  where details ilike '%[account_deletion_request]%'
  group by reporter_user_id
)
update public.marketplace_profiles as profile
set
  suspended = true,
  deleted_at = deletion_requests.requested_at,
  removed_by_admin = false,
  updated_at = greatest(profile.updated_at, deletion_requests.requested_at)
from deletion_requests
where profile.user_id = deletion_requests.reporter_user_id
  and profile.risk_status = 'restricted'
  and profile.deleted_at is null;
