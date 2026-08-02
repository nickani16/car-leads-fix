begin;

alter function public.activate_business_pilot_application(
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  uuid,
  date,
  date
) rename to activate_business_pilot_application_v1;

create function public.activate_business_pilot_application(
  p_application_id uuid,
  p_actor_user_id uuid,
  p_environment text,
  p_terms_version text,
  p_terms_accepted_by text,
  p_reason text,
  p_organization_id uuid default null,
  p_start_date date default null,
  p_planned_end_date date default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_application public.business_pilot_applications%rowtype;
  v_organization public.marketplace_companies%rowtype;
  v_contact_user_id uuid;
  v_registration_owner_user_id uuid;
  v_registration_number text;
  v_temporary_registration text;
  v_member_registration text;
  v_result jsonb;
begin
  select *
  into v_application
  from public.business_pilot_applications
  where id = p_application_id;

  if not found then
    raise exception 'Business pilot application not found.';
  end if;

  select id
  into v_contact_user_id
  from auth.users
  where lower(email) = lower(v_application.contact_email)
    and deleted_at is null
  limit 1;

  if p_organization_id is not null then
    select *
    into v_organization
    from public.marketplace_companies
    where id = p_organization_id;
  elsif nullif(btrim(coalesce(v_application.company_registration_number, '')), '') is not null then
    select *
    into v_organization
    from public.marketplace_companies
    where country_code = v_application.country_code
      and regexp_replace(lower(registration_number), '[^a-z0-9]', '', 'g') =
        regexp_replace(lower(v_application.company_registration_number), '[^a-z0-9]', '', 'g')
    order by (verification_status = 'verified') desc, created_at asc
    limit 1;
  end if;

  if v_organization.id is not null and v_contact_user_id is not null then
    v_registration_number := v_organization.registration_number;

    select user_id
    into v_registration_owner_user_id
    from public.marketplace_profiles
    where user_id <> v_contact_user_id
      and account_type = 'business'
      and country_code = v_organization.country_code
      and registration_number = v_registration_number
    limit 1;

    if v_registration_owner_user_id is not null then
      v_temporary_registration := 'PILOT-TEMP-' || substr(v_registration_owner_user_id::text, 1, 8) || '-' || substr(p_application_id::text, 1, 8);
      v_member_registration := 'TEAM-' || substr(v_organization.id::text, 1, 8) || '-' || substr(v_contact_user_id::text, 1, 8);

      update public.marketplace_profiles
      set registration_number = v_temporary_registration,
          updated_at = now()
      where user_id = v_registration_owner_user_id;
    end if;
  end if;

  v_result := public.activate_business_pilot_application_v1(
    p_application_id,
    p_actor_user_id,
    p_environment,
    p_terms_version,
    p_terms_accepted_by,
    p_reason,
    p_organization_id,
    p_start_date,
    p_planned_end_date
  );

  if v_registration_owner_user_id is not null then
    update public.marketplace_profiles
    set registration_number = v_member_registration,
        updated_at = now()
    where user_id = v_contact_user_id;

    update public.marketplace_profiles
    set registration_number = v_registration_number,
        updated_at = now()
    where user_id = v_registration_owner_user_id;
  end if;

  return v_result;
end;
$$;

revoke all on function public.activate_business_pilot_application_v1(
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  uuid,
  date,
  date
) from public, anon, authenticated;

revoke all on function public.activate_business_pilot_application(
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  uuid,
  date,
  date
) from public, anon, authenticated;

grant execute on function public.activate_business_pilot_application_v1(
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  uuid,
  date,
  date
) to service_role;

grant execute on function public.activate_business_pilot_application(
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  uuid,
  date,
  date
) to service_role;

comment on function public.activate_business_pilot_application(
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  uuid,
  date,
  date
) is 'Atomically activates a business pilot and preserves unique registration numbers for existing organization owners and linked team members.';

commit;
