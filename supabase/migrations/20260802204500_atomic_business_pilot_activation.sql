begin;

create or replace function public.activate_business_pilot_application(
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
  v_existing_program public.business_pilot_programs%rowtype;
  v_program public.business_pilot_programs%rowtype;
  v_contact_user_id uuid;
  v_member_role text;
  v_start_date date := coalesce(p_start_date, current_date);
  v_end_date date := coalesce(p_planned_end_date, current_date + 90);
  v_profile_count integer;
  v_previous_status text;
begin
  if p_environment not in ('development', 'preview', 'production', 'test') then
    raise exception 'Unsupported deployment environment.';
  end if;
  if nullif(btrim(p_terms_version), '') is null then
    raise exception 'Pilot terms version is required.';
  end if;
  if nullif(btrim(p_terms_accepted_by), '') is null then
    raise exception 'The company representative accepting the pilot terms is required.';
  end if;
  if char_length(btrim(coalesce(p_reason, ''))) < 8 then
    raise exception 'An activation reason of at least 8 characters is required.';
  end if;
  if v_end_date < v_start_date then
    raise exception 'The planned end date cannot be before the start date.';
  end if;

  select *
  into v_application
  from public.business_pilot_applications
  where id = p_application_id
  for update;

  if not found then
    raise exception 'Business pilot application not found.';
  end if;
  if v_application.status in ('rejected', 'closed') then
    raise exception 'A rejected or closed application cannot be activated.';
  end if;

  v_previous_status := v_application.status;

  select id
  into v_contact_user_id
  from auth.users
  where lower(email) = lower(v_application.contact_email)
    and deleted_at is null
  limit 1;

  if v_contact_user_id is null then
    raise exception 'The application contact must have an Autorell account before activation.';
  end if;

  perform 1
  from public.marketplace_profiles
  where user_id = v_contact_user_id;

  if not found then
    raise exception 'The application contact is missing an Autorell profile.';
  end if;

  if p_organization_id is not null then
    select *
    into v_organization
    from public.marketplace_companies
    where id = p_organization_id
    for update;

    if not found then
      raise exception 'The selected organization does not exist.';
    end if;
  elsif nullif(btrim(coalesce(v_application.company_registration_number, '')), '') is not null then
    select *
    into v_organization
    from public.marketplace_companies
    where country_code = v_application.country_code
      and regexp_replace(lower(registration_number), '[^a-z0-9]', '', 'g') =
        regexp_replace(lower(v_application.company_registration_number), '[^a-z0-9]', '', 'g')
    order by (verification_status = 'verified') desc, created_at asc
    limit 1
    for update;
  end if;

  if v_organization.id is null then
    if nullif(btrim(coalesce(v_application.company_registration_number, '')), '') is null then
      raise exception 'A registration number is required to create the organization.';
    end if;

    insert into public.marketplace_companies (
      name,
      registration_number,
      country_code,
      website_url,
      phone,
      contact_name,
      contact_email,
      contact_phone,
      verification_status,
      domain_match,
      verification_note,
      verified_at,
      verified_by,
      created_by
    ) values (
      v_application.company_name,
      v_application.company_registration_number,
      v_application.country_code,
      v_application.website_url,
      v_application.contact_phone,
      v_application.contact_name,
      v_application.contact_email,
      v_application.contact_phone,
      'verified',
      true,
      'Verified during atomic business pilot activation.',
      now(),
      p_actor_user_id,
      p_actor_user_id
    )
    returning * into v_organization;
  else
    if nullif(btrim(coalesce(v_application.company_registration_number, '')), '') is not null
      and regexp_replace(lower(v_organization.registration_number), '[^a-z0-9]', '', 'g') <>
        regexp_replace(lower(v_application.company_registration_number), '[^a-z0-9]', '', 'g') then
      raise exception 'The selected organization does not match the application registration number.';
    end if;

    update public.marketplace_companies
    set
      name = v_application.company_name,
      website_url = v_application.website_url,
      phone = coalesce(v_application.contact_phone, phone),
      contact_name = v_application.contact_name,
      contact_email = v_application.contact_email,
      contact_phone = coalesce(v_application.contact_phone, contact_phone),
      verification_status = 'verified',
      domain_match = true,
      verification_note = 'Verified during atomic business pilot activation.',
      verified_at = coalesce(verified_at, now()),
      verified_by = coalesce(verified_by, p_actor_user_id),
      updated_at = now()
    where id = v_organization.id
    returning * into v_organization;
  end if;

  select *
  into v_existing_program
  from public.business_pilot_programs
  where application_id = p_application_id
  for update;

  if v_existing_program.id is not null and v_existing_program.organization_id <> v_organization.id then
    raise exception 'The existing pilot program belongs to another organization.';
  end if;

  update public.marketplace_profiles
  set
    account_type = 'business',
    company_id = v_organization.id,
    company_name = v_organization.name,
    registration_number = v_organization.registration_number,
    website_url = coalesce(v_organization.website_url, website_url),
    business_verification_status = 'verified',
    business_onboarding_status = 'active',
    company_domain_match = true,
    company_verification_note = 'Activated through approved business pilot.',
    verified_at = coalesce(verified_at, now()),
    verification_updated_at = now(),
    updated_at = now()
  where user_id = v_contact_user_id;

  get diagnostics v_profile_count = row_count;
  if v_profile_count <> 1 then
    raise exception 'The contact profile could not be linked to the organization.';
  end if;

  insert into public.marketplace_company_members (
    company_id,
    user_id,
    role,
    invited_by,
    updated_at
  ) values (
    v_organization.id,
    v_contact_user_id,
    'manager',
    p_actor_user_id,
    now()
  )
  on conflict (company_id, user_id) do update
  set
    role = case
      when public.marketplace_company_members.role in ('owner', 'admin', 'manager')
        then public.marketplace_company_members.role
      else 'manager'
    end,
    invited_by = coalesce(public.marketplace_company_members.invited_by, excluded.invited_by),
    updated_at = now()
  returning role into v_member_role;

  update public.business_pilot_applications
  set
    status = 'pilot_active',
    assigned_admin_user_id = coalesce(assigned_admin_user_id, p_actor_user_id),
    organization_id = v_organization.id,
    review_notes = case
      when nullif(btrim(coalesce(review_notes, '')), '') is null then btrim(p_reason)
      when position(btrim(p_reason) in review_notes) > 0 then review_notes
      else review_notes || E'\n\n' || btrim(p_reason)
    end,
    reviewed_at = coalesce(reviewed_at, now()),
    approved_at = coalesce(approved_at, now()),
    pilot_started_at = coalesce(pilot_started_at, now()),
    pilot_ends_at = v_end_date::timestamp at time zone 'UTC',
    updated_by = p_actor_user_id,
    updated_at = now()
  where id = p_application_id;

  insert into public.business_pilot_programs (
    application_id,
    organization_id,
    program_name,
    status,
    start_date,
    planned_end_date,
    actual_end_date,
    is_free,
    automatic_conversion_enabled,
    commercial_agreement_required,
    agreed_inventory_limit,
    agreed_location_limit,
    integration_method,
    internal_owner_user_id,
    company_contact_user_id,
    terms_version,
    terms_accepted_at,
    terms_accepted_by
  ) values (
    p_application_id,
    v_organization.id,
    v_application.company_name || ' pilot',
    'pilot_active',
    v_start_date,
    v_end_date,
    null,
    true,
    false,
    true,
    case when v_application.estimated_inventory_count > 0 then v_application.estimated_inventory_count else null end,
    case when v_application.location_count > 0 then v_application.location_count else null end,
    coalesce(v_application.preferred_integration_method, 'unknown'),
    p_actor_user_id,
    v_contact_user_id,
    btrim(p_terms_version),
    now(),
    btrim(p_terms_accepted_by)
  )
  on conflict (application_id) do update
  set
    status = 'pilot_active',
    start_date = coalesce(public.business_pilot_programs.start_date, excluded.start_date),
    planned_end_date = excluded.planned_end_date,
    actual_end_date = null,
    is_free = true,
    automatic_conversion_enabled = false,
    commercial_agreement_required = true,
    agreed_inventory_limit = excluded.agreed_inventory_limit,
    agreed_location_limit = excluded.agreed_location_limit,
    integration_method = excluded.integration_method,
    internal_owner_user_id = excluded.internal_owner_user_id,
    company_contact_user_id = excluded.company_contact_user_id,
    terms_version = excluded.terms_version,
    terms_accepted_at = now(),
    terms_accepted_by = excluded.terms_accepted_by,
    updated_at = now()
  returning * into v_program;

  insert into public.feature_flag_overrides (
    flag_key,
    environment,
    market_code,
    organization_id,
    pilot_program_id,
    enabled,
    reason,
    updated_by
  )
  select
    flag_key,
    p_environment,
    null,
    v_organization.id,
    null,
    enabled,
    'Organization-specific access for an active approved business pilot.',
    p_actor_user_id
  from (
    values
      ('business_pilot_program', true),
      ('dealer_inventory_import', true),
      ('dealer_website_import', coalesce(v_application.preferred_integration_method, 'unknown') = 'website'),
      ('dealer_feed_import', false),
      ('dealer_api_import', false),
      ('dealer_dms_onboarding', coalesce(v_application.preferred_integration_method, 'unknown') = 'dms'),
      ('dealer_inventory_sync', coalesce(v_application.preferred_integration_method, 'unknown') = 'website')
  ) as requested_flags(flag_key, enabled)
  on conflict (flag_key, environment, market_code, organization_id, pilot_program_id) do update
  set
    enabled = excluded.enabled,
    reason = excluded.reason,
    updated_by = excluded.updated_by,
    updated_at = now();

  insert into public.business_pilot_application_events (
    application_id,
    actor_user_id,
    event_type,
    from_status,
    to_status,
    note,
    metadata
  ) values (
    p_application_id,
    p_actor_user_id,
    'admin_activate_pilot',
    v_previous_status,
    'pilot_active',
    btrim(p_reason),
    jsonb_build_object(
      'organization_id', v_organization.id,
      'program_id', v_program.id,
      'contact_user_id', v_contact_user_id,
      'member_role', v_member_role,
      'environment', p_environment,
      'atomic', true
    )
  );

  return jsonb_build_object(
    'application_id', p_application_id,
    'organization_id', v_organization.id,
    'program_id', v_program.id,
    'contact_user_id', v_contact_user_id,
    'member_role', v_member_role,
    'status', 'pilot_active',
    'is_free', true,
    'automatic_conversion_enabled', false
  );
end;
$$;

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
) is 'Atomically links an approved pilot company, contact membership, free program, and organization-scoped feature access.';

commit;
