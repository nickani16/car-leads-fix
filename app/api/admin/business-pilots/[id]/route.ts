import { NextResponse } from 'next/server'
import { requireAdminRoute, writeAdminAuditLog } from '@/lib/admin-route-auth'
import { sendBusinessPilotEmail, type BusinessPilotEmailKind } from '@/lib/email/business-pilot'

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const datePattern = /^\d{4}-\d{2}-\d{2}$/

const statusByAction: Record<string, string> = {
  under_review: 'under_review',
  request_information: 'more_information_required',
  record_contact: 'contacted',
  technical_review: 'technical_review',
  approve: 'approved',
  activate_pilot: 'pilot_active',
  reject: 'rejected',
  start_onboarding: 'onboarding',
  pilot_active: 'pilot_active',
  pilot_paused: 'pilot_paused',
  pilot_completed: 'pilot_completed',
  commercial_discussion: 'commercial_discussion',
  commercial_customer: 'commercial_customer',
  close: 'closed',
}

const emailKindByAction: Partial<Record<string, BusinessPilotEmailKind>> = {
  request_information: 'more_information_required',
  approve: 'approved',
  activate_pilot: 'pilot_active',
  reject: 'rejected',
  pilot_active: 'pilot_active',
  pilot_completed: 'pilot_completed',
}

const programActions = new Set([
  'create_program',
  'record_terms',
  'start_onboarding',
  'pilot_active',
  'pilot_paused',
  'pilot_completed',
  'commercial_discussion',
  'commercial_customer',
])

const allowedActions = new Set([
  'assign_self',
  'add_note',
  'link_organization',
  'create_organization',
  ...Object.keys(statusByAction),
  ...programActions,
])

type ActionBody = {
  action?: unknown
  reason?: unknown
  organizationId?: unknown
  startDate?: unknown
  plannedEndDate?: unknown
  termsVersion?: unknown
  acceptedBy?: unknown
  commercialAgreementConfirmed?: unknown
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminRoute('business_pilots.manage')
  if ('error' in auth) return auth.error
  const { id } = await context.params
  if (!uuidPattern.test(id)) return NextResponse.json({ error: 'Ogiltigt ansöknings-ID.' }, { status: 400 })

  let body: ActionBody
  try {
    body = await request.json() as ActionBody
  } catch {
    return NextResponse.json({ error: 'Ogiltig begäran.' }, { status: 400 })
  }

  const action = text(body.action, 80)
  const reason = text(body.reason, 4000, true)
  const organizationId = text(body.organizationId, 80)
  const startDate = optionalDate(body.startDate)
  const plannedEndDate = optionalDate(body.plannedEndDate)
  const termsVersion = text(body.termsVersion, 120)
  const acceptedBy = text(body.acceptedBy, 180)

  if (!allowedActions.has(action)) return NextResponse.json({ error: 'Ogiltig åtgärd.' }, { status: 400 })
  if (action !== 'assign_self' && reason.length < 8) {
    return NextResponse.json({ error: 'Ange en intern anteckning på minst 8 tecken.' }, { status: 400 })
  }
  if (organizationId && !uuidPattern.test(organizationId)) {
    return NextResponse.json({ error: 'Företags-ID måste vara ett giltigt UUID.' }, { status: 400 })
  }
  if (body.startDate && !startDate || body.plannedEndDate && !plannedEndDate) {
    return NextResponse.json({ error: 'Kontrollera pilotens datum.' }, { status: 400 })
  }
  if (startDate && plannedEndDate && plannedEndDate < startDate) {
    return NextResponse.json({ error: 'Slutdatum kan inte ligga före startdatum.' }, { status: 400 })
  }
  if (action === 'commercial_customer' && body.commercialAgreementConfirmed !== true) {
    return NextResponse.json({ error: 'Ett separat kommersiellt avtal måste bekräftas uttryckligen.' }, { status: 409 })
  }
  if ((action === 'activate_pilot' || action === 'pilot_active') && (!termsVersion || !acceptedBy)) {
    return NextResponse.json({ error: 'Ange villkorsversion och vem hos företaget som godkände villkoren.' }, { status: 400 })
  }

  const admin = auth.adminClient
  const { data: before, error: readError } = await admin
    .from('business_pilot_applications')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (readError) return NextResponse.json({ error: readError.message }, { status: 400 })
  if (!before) return NextResponse.json({ error: 'Pilotansökan hittades inte.' }, { status: 404 })

  const { data: existingProgram } = await admin
    .from('business_pilot_programs')
    .select('*')
    .eq('application_id', id)
    .maybeSingle()

  let linkedOrganizationId = organizationId || String(before.organization_id || '')
  let program = existingProgram
  const now = new Date().toISOString()
  const organizationReadyStatuses = new Set(['approved', 'onboarding', 'pilot_active', 'pilot_paused', 'pilot_completed', 'commercial_discussion', 'commercial_customer'])

  try {
    if (action === 'activate_pilot' || action === 'pilot_active') {
      const { data: activationData, error: activationError } = await admin.rpc('activate_business_pilot_application', {
        p_application_id: id,
        p_actor_user_id: auth.user.id,
        p_environment: businessPilotEnvironment(),
        p_terms_version: termsVersion,
        p_terms_accepted_by: acceptedBy,
        p_reason: reason,
        p_organization_id: organizationId || null,
        p_start_date: startDate,
        p_planned_end_date: plannedEndDate,
      })
      if (activationError) throw activationError

      const activation = (activationData || {}) as Record<string, unknown>
      linkedOrganizationId = String(activation.organization_id || '')
      const programId = String(activation.program_id || '')
      if (!linkedOrganizationId || !programId) throw new Error('Pilotaktiveringen returnerade ofullständiga uppgifter.')

      const [{ data: after }, { data: activatedProgram }] = await Promise.all([
        admin.from('business_pilot_applications').select('*').eq('id', id).single(),
        admin.from('business_pilot_programs').select('*').eq('id', programId).single(),
      ])
      program = activatedProgram

      await writeAdminAuditLog({
        adminClient: admin,
        actorUserId: auth.user.id,
        actorRole: auth.primaryRole,
        permission: 'business_pilots.manage',
        action: 'business_pilot_activate_pilot',
        targetType: 'business_pilot_application',
        targetId: id,
        reason,
        beforeData: before,
        afterData: { application: after, program, activation },
        metadata: { atomic: true },
      })

      await admin.from('admin_notifications').update({
        status: 'assigned',
        assigned_to: auth.user.id,
        closed_at: null,
        updated_at: now,
      }).eq('notification_type', 'business_pilot_application').eq('resource_id', id)

      const result = await sendBusinessPilotEmail(admin, {
        applicationId: id,
        kind: 'pilot_active',
        recipientEmail: before.contact_email,
        companyName: before.company_name,
        locale: before.locale,
        countryCode: before.country_code,
        note: reason,
      })
      if (!result.delivered && !['duplicate', 'missing_provider_key'].includes(String(result.reason))) {
        console.error('[business-pilot] activation email failed', { id, reason: result.reason })
      }

      return NextResponse.json({ success: true, organizationId: linkedOrganizationId, programId })
    }

    if (['link_organization', 'create_organization', 'create_program'].includes(action) && !organizationReadyStatuses.has(String(before.status))) {
      throw new Error('Ansökan måste godkännas innan ett företag kopplas eller ett pilotprogram skapas.')
    }

    if (action === 'create_organization') {
      const { data: organization, error } = await admin
        .from('marketplace_companies')
        .insert({
          name: before.company_name,
          registration_number: before.company_registration_number || null,
          country_code: before.country_code,
          website_url: before.website_url,
          phone: before.contact_phone || null,
          contact_name: before.contact_name,
          contact_email: before.contact_email,
          contact_phone: before.contact_phone || null,
          verification_status: 'pending_review',
          domain_match: false,
          verification_note: `Skapad från pilotansökan ${id}.`,
          created_by: auth.user.id,
        })
        .select('id')
        .single()
      if (error || !organization) throw error || new Error('Företaget kunde inte skapas.')
      linkedOrganizationId = organization.id
    }

    if (action === 'link_organization' || action === 'create_organization') {
      if (!linkedOrganizationId) throw new Error('Ange eller skapa ett företag först.')
      const { data: organization, error: organizationError } = await admin
        .from('marketplace_companies')
        .select('id')
        .eq('id', linkedOrganizationId)
        .maybeSingle()
      if (organizationError || !organization) throw organizationError || new Error('Företaget hittades inte.')
      const { error } = await admin
        .from('business_pilot_applications')
        .update({ organization_id: linkedOrganizationId, updated_by: auth.user.id })
        .eq('id', id)
      if (error) throw error
    }

    if (programActions.has(action)) {
      linkedOrganizationId = linkedOrganizationId || String(before.organization_id || '')
      if (!linkedOrganizationId) throw new Error('Länka ett företag innan pilotprogrammet hanteras.')

      if (!program) {
        if (action !== 'create_program') throw new Error('Skapa pilotprogrammet först.')
        const { data: createdProgram, error } = await admin
          .from('business_pilot_programs')
          .insert({
            application_id: id,
            organization_id: linkedOrganizationId,
            program_name: `${before.company_name} pilot`,
            status: 'approved',
            start_date: startDate,
            planned_end_date: plannedEndDate,
            is_free: true,
            automatic_conversion_enabled: false,
            commercial_agreement_required: true,
            agreed_inventory_limit: before.estimated_inventory_count || null,
            agreed_location_limit: before.location_count || null,
            integration_method: before.preferred_integration_method || 'unknown',
            internal_owner_user_id: auth.user.id,
          })
          .select('*')
          .single()
        if (error || !createdProgram) throw error || new Error('Pilotprogrammet kunde inte skapas.')
        program = createdProgram
      }

      if (action === 'record_terms') {
        if (!termsVersion || !acceptedBy) throw new Error('Ange villkorsversion och vem hos företaget som godkände villkoren.')
        const { data: updatedProgram, error } = await admin
          .from('business_pilot_programs')
          .update({
            terms_version: termsVersion,
            terms_accepted_at: now,
            terms_accepted_by: acceptedBy,
            start_date: startDate || program.start_date,
            planned_end_date: plannedEndDate || program.planned_end_date,
          })
          .eq('id', program.id)
          .select('*')
          .single()
        if (error) throw error
        program = updatedProgram
      }

      if (action === 'pilot_active' && !program.terms_accepted_at) {
        throw new Error('Pilotvillkoren måste vara registrerade som godkända innan piloten startas.')
      }

      const nextProgramStatus = statusByAction[action]
      if (nextProgramStatus && ['approved', 'onboarding', 'pilot_active', 'pilot_paused', 'pilot_completed', 'commercial_discussion', 'commercial_customer', 'closed'].includes(nextProgramStatus)) {
        const { data: updatedProgram, error } = await admin
          .from('business_pilot_programs')
          .update({
            status: nextProgramStatus,
            start_date: nextProgramStatus === 'pilot_active' ? (program.start_date || startDate || now.slice(0, 10)) : (startDate || program.start_date),
            planned_end_date: plannedEndDate || program.planned_end_date,
            actual_end_date: nextProgramStatus === 'pilot_completed' ? now.slice(0, 10) : program.actual_end_date,
          })
          .eq('id', program.id)
          .select('*')
          .single()
        if (error) throw error
        program = updatedProgram
      }

      if (action === 'pilot_active') {
        await configurePilotFeatureFlags(admin, {
          organizationId: linkedOrganizationId,
          integrationMethod: String(program.integration_method || before.preferred_integration_method || 'unknown'),
          syncEnabled: true,
          updatedBy: auth.user.id,
        })
      }
      if (action === 'pilot_paused' || action === 'pilot_completed') {
        await configurePilotFeatureFlags(admin, {
          organizationId: linkedOrganizationId,
          integrationMethod: String(program.integration_method || before.preferred_integration_method || 'unknown'),
          syncEnabled: false,
          updatedBy: auth.user.id,
        })
      }
    }

    const nextStatus = statusByAction[action]
    if (nextStatus) {
      const patch: Record<string, unknown> = {
        status: nextStatus,
        assigned_admin_user_id: before.assigned_admin_user_id || auth.user.id,
        review_notes: reason || before.review_notes,
        updated_by: auth.user.id,
      }
      if (nextStatus === 'under_review' && !before.reviewed_at) patch.reviewed_at = now
      if (nextStatus === 'approved') patch.approved_at = now
      if (nextStatus === 'rejected') patch.rejection_reason = reason
      if (nextStatus === 'pilot_active') patch.pilot_started_at = now
      if (nextStatus === 'pilot_completed') patch.pilot_completed_at = now
      if (linkedOrganizationId) patch.organization_id = linkedOrganizationId
      const { error } = await admin.from('business_pilot_applications').update(patch).eq('id', id)
      if (error) throw error
    } else if (action === 'assign_self') {
      const { error } = await admin.from('business_pilot_applications').update({
        assigned_admin_user_id: auth.user.id,
        updated_by: auth.user.id,
      }).eq('id', id)
      if (error) throw error
    }

    await admin.from('business_pilot_application_events').insert({
      application_id: id,
      actor_user_id: auth.user.id,
      event_type: `admin_${action}`,
      from_status: before.status,
      to_status: statusByAction[action] || before.status,
      note: reason || null,
      metadata: {
        organization_id: linkedOrganizationId || null,
        program_id: program?.id || null,
        commercial_agreement_confirmed: action === 'commercial_customer' ? true : undefined,
      },
    })

    const { data: after } = await admin.from('business_pilot_applications').select('*').eq('id', id).single()
    await writeAdminAuditLog({
      adminClient: admin,
      actorUserId: auth.user.id,
      actorRole: auth.primaryRole,
      permission: 'business_pilots.manage',
      action: `business_pilot_${action}`,
      targetType: 'business_pilot_application',
      targetId: id,
      reason: reason || null,
      beforeData: before,
      afterData: { application: after, program },
      metadata: {
        commercialAgreementConfirmed: action === 'commercial_customer' ? true : undefined,
      },
    })

    const notificationStatus = ['reject', 'pilot_completed', 'commercial_customer', 'close'].includes(action) ? 'closed' : 'assigned'
    await admin.from('admin_notifications').update({
      status: notificationStatus,
      assigned_to: auth.user.id,
      closed_at: notificationStatus === 'closed' ? now : null,
      updated_at: now,
    }).eq('notification_type', 'business_pilot_application').eq('resource_id', id)

    const emailKind = emailKindByAction[action]
    if (emailKind) {
      const result = await sendBusinessPilotEmail(admin, {
        applicationId: id,
        kind: emailKind,
        recipientEmail: before.contact_email,
        companyName: before.company_name,
        locale: before.locale,
        countryCode: before.country_code,
        note: reason,
      })
      if (!result.delivered && !['duplicate', 'missing_provider_key'].includes(String(result.reason))) {
        console.error('[business-pilot] customer status email failed', { id, action, reason: result.reason })
      }
    }

    return NextResponse.json({ success: true, organizationId: linkedOrganizationId || null, programId: program?.id || null })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Åtgärden kunde inte genomföras.'
    await writeAdminAuditLog({
      adminClient: admin,
      actorUserId: auth.user.id,
      actorRole: auth.primaryRole,
      permission: 'business_pilots.manage',
      action: `business_pilot_${action}`,
      targetType: 'business_pilot_application',
      targetId: id,
      reason: reason || null,
      beforeData: before,
      success: false,
      errorCode: 'BUSINESS_PILOT_ACTION_FAILED',
      metadata: { message },
    })
    return NextResponse.json({ error: message }, { status: 409 })
  }
}

async function configurePilotFeatureFlags(
  admin: ReturnType<typeof import('@/lib/supabase/admin').createAdminClient>,
  input: { organizationId: string; integrationMethod: string; syncEnabled: boolean; updatedBy: string },
) {
  const environment = businessPilotEnvironment()
  const flags = [
    ['business_pilot_program', true],
    ['dealer_inventory_import', true],
    ['dealer_website_import', input.integrationMethod === 'website'],
    ['dealer_feed_import', false],
    ['dealer_api_import', false],
    ['dealer_dms_onboarding', input.integrationMethod === 'dms'],
    ['dealer_inventory_sync', input.integrationMethod === 'website' && input.syncEnabled],
  ] as const
  const { error } = await admin.from('feature_flag_overrides').upsert(flags.map(([flagKey, enabled]) => ({
    flag_key: flagKey,
    environment,
    market_code: null,
    organization_id: input.organizationId,
    pilot_program_id: null,
    enabled,
    reason: input.syncEnabled ? 'Enabled for an active approved pilot.' : 'Automatic sync paused or pilot completed.',
    updated_by: input.updatedBy,
  })), { onConflict: 'flag_key,environment,market_code,organization_id,pilot_program_id' })
  if (error) throw error
}

function businessPilotEnvironment() {
  return process.env.VERCEL_ENV === 'production'
    ? 'production'
    : process.env.VERCEL_ENV === 'preview'
      ? 'preview'
      : process.env.NODE_ENV === 'test'
        ? 'test'
        : 'development'
}

function text(value: unknown, maxLength: number, multiline = false) {
  if (typeof value !== 'string') return ''
  const normalized = multiline ? value.trim() : value.trim().replace(/[\r\n\t]+/g, ' ')
  return normalized.slice(0, maxLength)
}

function optionalDate(value: unknown) {
  const date = text(value, 10)
  return datePattern.test(date) && !Number.isNaN(Date.parse(`${date}T00:00:00Z`)) ? date : null
}
