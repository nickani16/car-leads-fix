begin;

-- PREVIEW ONLY. Refuse to run unless the isolated preview baseline is present.
do $$
begin
  if not exists (
    select 1
    from supabase_migrations.schema_migrations
    where name = 'preview_production_admin_baseline'
  ) then
    raise exception 'Preview-only seed guard failed';
  end if;
end $$;

-- Inert identities for relationally correct preview data. Passwords are random and
-- unknown, identities are not created, and every row is explicitly marked synthetic.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous
)
select
  (select instance_id from auth.users where instance_id is not null limit 1),
  md5('autorell-preview-user-' || g)::uuid,
  'authenticated',
  'authenticated',
  format('qa.user.%s@preview.autorell.invalid', lpad(g::text, 4, '0')),
  crypt(gen_random_uuid()::text, gen_salt('bf')),
  now() - make_interval(days => g % 540),
  '{"provider":"email","providers":["email"],"synthetic_preview":true}'::jsonb,
  jsonb_build_object('synthetic_preview', true, 'seed_version', 'admin-scale-v1'),
  now() - make_interval(days => g % 540, hours => g % 24),
  now() - make_interval(days => g % 45),
  false,
  false
from generate_series(1, 2400) g
on conflict (id) do nothing;

insert into public.marketplace_companies (
  id, name, registration_number, vat_number, country_code, website_url, phone,
  address_line_1, postal_code, city, region, contact_name, contact_email, contact_phone,
  verification_status, domain_match, verification_note, verified_at, created_by,
  created_at, updated_at
)
select
  md5('autorell-preview-company-' || g)::uuid,
  (array['Nordic Mobility','Autozentrum','Fjord Motor','Benelux Trucks','Alpine Cars','Baltic Machines'])[1 + (g % 6)] || ' ' || lpad(g::text, 3, '0'),
  'QA-' || lpad(g::text, 8, '0'),
  (array['SE','DE','DK','NL','AT','FI','PL'])[1 + (g % 7)] || lpad(g::text, 10, '0'),
  (array['SE','DE','DK','NL','AT','FI','PL'])[1 + (g % 7)],
  format('https://dealer-%s.preview.autorell.invalid', g),
  '+46 70 ' || lpad((1000000 + g)::text, 7, '0'),
  'Testgatan ' || (1 + (g % 90)),
  lpad((10000 + g)::text, 5, '0'),
  (array['Stockholm','Berlin','Köpenhamn','Amsterdam','Wien','Helsingfors','Warszawa'])[1 + (g % 7)],
  (array['Stockholm','Berlin','Hovedstaden','Noord-Holland','Wien','Uusimaa','Mazowieckie'])[1 + (g % 7)],
  (array['Anna Lind','Erik Berg','Sofia Nilsson','Lukas Weber','Emma de Vries','Mika Korhonen'])[1 + (g % 6)],
  format('qa.company.%s@preview.autorell.invalid', lpad(g::text, 3, '0')),
  '+46 8 ' || lpad((500000 + g)::text, 6, '0'),
  (array['pending_review','verified','verified','verified','unverified','rejected'])[1 + (g % 6)],
  g % 5 <> 0,
  case when g % 6 = 5 then 'Dokument behöver kompletteras i previewflödet.' else 'Syntetiskt previewföretag.' end,
  case when g % 6 in (1,2,3) then now() - make_interval(days => g % 300) end,
  md5('autorell-preview-user-' || (1 + ((g * 4 - 1) % 2400)))::uuid,
  now() - make_interval(days => g % 500),
  now() - make_interval(days => g % 30)
from generate_series(1, 360) g
on conflict (id) do nothing;

insert into public.marketplace_profiles (
  user_id, account_type, display_name, legal_name, email, phone, country_code,
  company_name, registration_number, vat_number, registered_address, city, postal_code,
  locale, terms_version, privacy_version, accepted_at, verified_at, created_at, updated_at,
  first_name, last_name, address_line_1, region, identity_status,
  business_verification_status, risk_status, company_id, website_url, company_domain_match
)
select
  md5('autorell-preview-user-' || g)::uuid,
  case when g % 4 = 0 then 'business' else 'private' end,
  case when g % 4 = 0
    then (array['Nordic Mobility','Autozentrum','Fjord Motor','Benelux Trucks','Alpine Cars','Baltic Machines'])[1 + (g % 6)] || ' kontakt ' || g
    else (array['Anna','Erik','Sofia','Johan','Emma','Lukas','Maja','Noah'])[1 + (g % 8)] || ' ' ||
         (array['Lind','Berg','Nilsson','Andersson','Weber','Jensen','Korhonen','de Vries'])[1 + ((g / 3) % 8)]
  end,
  case when g % 4 = 0 then 'Preview Dealer ' || g end,
  format('qa.user.%s@preview.autorell.invalid', lpad(g::text, 4, '0')),
  '+46 70 ' || lpad((2000000 + g)::text, 7, '0'),
  (array['SE','DE','DK','NL','AT','FI','PL'])[1 + (g % 7)],
  case when g % 4 = 0 then 'Preview Dealer ' || g end,
  case when g % 4 = 0 then 'QA-' || lpad((1 + ((g / 4 - 1) % 360))::text, 8, '0') end,
  case when g % 4 = 0 then 'SE' || lpad(g::text, 10, '0') end,
  'Testgatan ' || (1 + (g % 90)),
  (array['Stockholm','Berlin','Köpenhamn','Amsterdam','Wien','Helsingfors','Warszawa'])[1 + (g % 7)],
  lpad((10000 + (g % 80000))::text, 5, '0'),
  (array['sv','de','da','nl','de','fi','pl'])[1 + (g % 7)],
  '2026-07', '2026-07',
  now() - make_interval(days => g % 540),
  case when g % 5 <> 0 then now() - make_interval(days => g % 400) end,
  now() - make_interval(days => g % 540, hours => g % 24),
  now() - make_interval(days => g % 60),
  (array['Anna','Erik','Sofia','Johan','Emma','Lukas','Maja','Noah'])[1 + (g % 8)],
  (array['Lind','Berg','Nilsson','Andersson','Weber','Jensen','Korhonen','de Vries'])[1 + ((g / 3) % 8)],
  'Testgatan ' || (1 + (g % 90)),
  (array['Stockholm','Berlin','Hovedstaden','Noord-Holland','Wien','Uusimaa','Mazowieckie'])[1 + (g % 7)],
  (array['verified','verified','format_validated','pending','needs_review','rejected'])[1 + (g % 6)],
  case when g % 4 = 0 then (array['verified','verified','pending_review','needs_review','rejected'])[1 + (g % 5)] end,
  (array['standard','standard','standard','standard','review','restricted','blocked'])[1 + (g % 7)],
  case when g % 4 = 0 then md5('autorell-preview-company-' || (1 + ((g / 4 - 1) % 360)))::uuid end,
  case when g % 4 = 0 then format('https://dealer-%s.preview.autorell.invalid', g) end,
  g % 5 <> 0
from generate_series(1, 2400) g
on conflict (user_id) do nothing;

insert into public.marketplace_listings (
  id, seller_user_id, category, status, title, description, make, model, variant,
  model_year, mileage_km, operating_hours, fuel_type, gearbox, body_type, color,
  condition, known_faults, service_history, equipment, country_code, city, postal_code,
  price, currency, images, seller_name, seller_type, package_id, priority,
  published_at, expires_at, created_at, updated_at, listing_number, reference_number,
  review_status, risk_score, risk_flags, vin, chassis_number, total_weight_kg,
  boost_status, featured_status
)
select
  md5('autorell-preview-listing-' || g)::uuid,
  md5('autorell-preview-user-' || (1 + ((g - 1) % 2400)))::uuid,
  (array['cars','vans','motorcycles','motorhomes','caravans','trucks','agriculture','construction','electric-bikes','e-scooters'])[1 + (g % 10)],
  case when g % 10 < 5 then 'published' when g % 10 = 5 then 'draft' when g % 10 = 6 then 'pending_payment' when g % 10 = 7 then 'pending_review' when g % 10 = 8 then 'paused' else 'sold' end,
  (array['Volvo XC60','BMW 320d','Mercedes Sprinter','Volkswagen ID.4','Scania R450','KTM 890 Adventure','Knaus Sky TI','Husqvarna 545','Caterpillar 320','Riese & Müller Charger'])[1 + (g % 10)] || ' #' || g,
  'Realistisk syntetisk previewannons för verifiering av Admin Control Center. Objektet är kontrollerat och innehåller komplett testmetadata.',
  (array['Volvo','BMW','Mercedes-Benz','Volkswagen','Scania','KTM','Knaus','Husqvarna','Caterpillar','Riese & Müller'])[1 + (g % 10)],
  (array['XC60','320d','Sprinter','ID.4','R450','890 Adventure','Sky TI','545','320','Charger'])[1 + (g % 10)],
  case when g % 3 = 0 then 'Premium' else 'Standard' end,
  2016 + (g % 11),
  case when g % 10 in (6,7,8) then null else 5000 + ((g * 137) % 240000) end,
  case when g % 10 in (6,7,8) then 400 + (g % 9000) end,
  (array['petrol','diesel','electric','hybrid'])[1 + (g % 4)],
  (array['automatic','manual'])[1 + (g % 2)],
  (array['suv','sedan','van','truck','machine'])[1 + (g % 5)],
  (array['Svart','Vit','Silver','Blå','Röd','Grå'])[1 + (g % 6)],
  'used',
  case when g % 9 = 0 then 'Mindre kosmetiska märken, dokumenterade i annonsen.' end,
  case when g % 4 = 0 then 'Full servicehistorik' else 'Delvis dokumenterad servicehistorik' end,
  'Klimatanläggning, farthållare, navigation, vinterhjul',
  (array['SE','DE','DK','NL','AT','FI','PL'])[1 + (g % 7)],
  (array['Stockholm','Berlin','Köpenhamn','Amsterdam','Wien','Helsingfors','Warszawa'])[1 + (g % 7)],
  lpad((10000 + (g % 80000))::text, 5, '0'),
  25000 + ((g * 7919) % 850000),
  case when g % 7 = 2 then 'DKK' when g % 7 = 6 then 'PLN' when g % 7 = 0 then 'SEK' else 'EUR' end,
  case when g <= 900 then array['https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80']::text[] else '{}'::text[] end,
  case when (1 + ((g - 1) % 2400)) % 4 = 0 then 'Preview Dealer ' || (1 + ((g - 1) % 2400)) else 'Privat säljare ' || (1 + ((g - 1) % 2400)) end,
  case when (1 + ((g - 1) % 2400)) % 4 = 0 then 'business' else 'private' end,
  (array['free_7d','standard_15d','premium_30d'])[1 + (g % 3)],
  g % 4,
  case when g % 10 in (0,1,2,3,4,9) then now() - make_interval(days => g % 120) end,
  case when g % 10 < 5 then now() + make_interval(days => 1 + (g % 40)) when g % 10 = 9 then now() - make_interval(days => g % 60) end,
  now() - make_interval(days => g % 540, hours => g % 24),
  now() - make_interval(days => g % 35),
  900000 + g,
  'QA-' || lpad(g::text, 7, '0'),
  case when g % 10 in (6,7) then 'pending_review' when g % 10 = 8 then 'flagged' when g % 10 = 9 then 'rejected' else 'approved' end,
  case when g % 10 = 8 then 75 when g % 10 = 9 then 92 else g % 28 end,
  case when g % 10 = 8 then array['price_anomaly','identity_review']::text[] when g % 10 = 9 then array['suspected_fraud']::text[] else '{}'::text[] end,
  upper(substr(md5('vin-' || g), 1, 17)),
  upper(substr(md5('chassis-' || g), 1, 17)),
  case when g % 10 in (5,6,7) then 2500 + (g % 24000) end,
  case when g % 12 = 0 then 'active' else 'inactive' end,
  case when g % 20 = 0 then 'active' else 'inactive' end
from generate_series(1, 5200) g
on conflict (id) do nothing;

insert into public.marketplace_listing_identifiers (
  id, listing_id, seller_user_id, category, registration_number, vin,
  chassis_number, total_weight_kg, machine_type, metadata, created_at, updated_at
)
select
  md5('autorell-preview-identifier-' || g)::uuid,
  md5('autorell-preview-listing-' || g)::uuid,
  md5('autorell-preview-user-' || (1 + ((g - 1) % 2400)))::uuid,
  (array['cars','vans','motorcycles','motorhomes','caravans','trucks','agriculture','construction','electric-bikes','e-scooters'])[1 + (g % 10)],
  'QA' || lpad(g::text, 6, '0'),
  upper(substr(md5('vin-' || g), 1, 17)),
  upper(substr(md5('chassis-' || g), 1, 17)),
  case when g % 10 in (5,6,7) then 2500 + (g % 24000) end,
  case when g % 10 in (6,7) then 'Arbetsmaskin' end,
  jsonb_build_object('synthetic_preview', true, 'seed_version', 'admin-scale-v1'),
  now() - make_interval(days => g % 540), now() - make_interval(days => g % 35)
from generate_series(1, 1600) g
on conflict (id) do nothing;

insert into public.marketplace_listing_events (
  id, listing_id, actor_user_id, actor_role, event_type, to_status, to_review_status, metadata, created_at
)
select
  md5('autorell-preview-listing-event-' || g)::uuid,
  md5('autorell-preview-listing-' || g)::uuid,
  md5('autorell-preview-user-' || (1 + ((g - 1) % 2400)))::uuid,
  'seller', 'listing_created',
  case when g % 10 < 5 then 'published' when g % 10 = 5 then 'draft' when g % 10 = 6 then 'pending_payment' when g % 10 = 7 then 'pending_review' when g % 10 = 8 then 'paused' else 'sold' end,
  case when g % 10 in (6,7) then 'pending_review' when g % 10 = 8 then 'flagged' when g % 10 = 9 then 'rejected' else 'approved' end,
  jsonb_build_object('synthetic_preview', true, 'reference_number', 'QA-' || lpad(g::text, 7, '0')),
  now() - make_interval(days => g % 540)
from generate_series(1, 5200) g
on conflict (id) do nothing;

insert into public.marketplace_listing_risk_events (
  id, listing_id, seller_user_id, risk_key, severity, score, details, created_at
)
select
  md5('autorell-preview-risk-event-' || g)::uuid,
  md5('autorell-preview-listing-' || g)::uuid,
  md5('autorell-preview-user-' || (1 + ((g - 1) % 2400)))::uuid,
  (array['price_anomaly','identity_review','duplicate_identifier','rapid_relisting'])[1 + (g % 4)],
  (array['low','medium','high','critical'])[1 + (g % 4)],
  (array[12,38,72,94])[1 + (g % 4)],
  jsonb_build_object('synthetic_preview', true, 'detector', 'qa-seed-v1'),
  now() - make_interval(days => g % 120)
from generate_series(1, 760) g
on conflict (id) do nothing;

insert into public.payment_orders (
  id, user_id, business_id, listing_id, product_key, market, currency, amount_minor,
  stripe_checkout_session_id, stripe_payment_intent_id, status, paid_at, fulfilled_at,
  refunded_at, failure_reason, metadata, created_at, updated_at
)
select
  md5('autorell-preview-payment-' || g)::uuid,
  md5('autorell-preview-user-' || (1 + ((g - 1) % 2400)))::uuid,
  case when (1 + ((g - 1) % 2400)) % 4 = 0 then md5('autorell-preview-company-' || (1 + ((g - 1) % 360)))::uuid end,
  md5('autorell-preview-listing-' || (1 + ((g * 3) % 5200)))::uuid,
  (array['listing_standard','listing_premium','boost_7d','featured_30d','business_growth'])[1 + (g % 5)],
  (array['se','de','dk','nl','at','fi','pl'])[1 + (g % 7)],
  (array['sek','eur','dkk','eur','eur','eur','pln'])[1 + (g % 7)],
  (array[9900,14900,24900,39900,119000])[1 + (g % 5)],
  'cs_test_preview_' || lpad(g::text, 6, '0'),
  'pi_test_preview_' || lpad(g::text, 6, '0'),
  (array['created','checkout_created','pending','paid','fulfilled','paid','failed','expired','refunded','cancelled'])[1 + (g % 10)],
  case when g % 10 in (3,4,5,8) then now() - make_interval(days => g % 180) end,
  case when g % 10 = 4 then now() - make_interval(days => g % 170) end,
  case when g % 10 = 8 then now() - make_interval(days => g % 90) end,
  case when g % 10 = 6 then 'Kortbetalningen nekades i syntetiskt previewscenario.' when g % 10 = 7 then 'Checkout-sessionen löpte ut.' end,
  jsonb_build_object('synthetic_preview', true, 'seed_version', 'admin-scale-v1'),
  now() - make_interval(days => g % 365, hours => g % 24),
  now() - make_interval(days => g % 30)
from generate_series(1, 1400) g
on conflict (id) do nothing;

insert into public.marketplace_reports (
  id, reporter_user_id, category, details, contact_email, status, created_at,
  transaction_reference, counterparty_name, occurred_at, amount, currency, contact_phone, listing_id
)
select
  md5('autorell-preview-report-' || g)::uuid,
  md5('autorell-preview-user-' || (1 + ((g * 7) % 2400)))::uuid,
  (array['suspected_fraud','misleading_listing','unsafe_product','harassment','identity_misuse','payment_request','other'])[1 + (g % 7)],
  (array[
    'Priset och beskrivningen verkar inte stämma överens med fordonets skick.',
    'Säljaren har bett om betalning utanför Autorell och ärendet behöver granskas.',
    'Annonsen innehåller motstridiga fordonsuppgifter och bör kontrolleras.',
    'Kontakten upplevdes som misstänkt och kunden vill att supporten följer upp.'
  ])[1 + (g % 4)],
  format('qa.reporter.%s@preview.autorell.invalid', g),
  (array['new','new','reviewing','reviewing','actioned','closed'])[1 + (g % 6)],
  now() - make_interval(days => g % 240, hours => g % 24),
  'QA-' || lpad((1 + ((g * 5) % 5200))::text, 7, '0'),
  'Previewmotpart ' || g,
  now() - make_interval(days => g % 250),
  500 + ((g * 137) % 120000),
  case when g % 3 = 0 then 'SEK' else 'EUR' end,
  '+46 70 ' || lpad((3000000 + g)::text, 7, '0'),
  md5('autorell-preview-listing-' || (1 + ((g * 5) % 5200)))::uuid
from generate_series(1, 650) g
on conflict (id) do nothing;

insert into public.moderation_cases (
  id, listing_id, subject_user_id, source, case_type, severity, priority, status,
  assigned_to, sla_due_at, evidence, created_at, updated_at, closed_at
)
select
  md5('autorell-preview-moderation-' || g)::uuid,
  md5('autorell-preview-listing-' || (1 + ((g * 11) % 5200)))::uuid,
  md5('autorell-preview-user-' || (1 + ((g * 11) % 2400)))::uuid,
  (array['automatic','customer_report','manual_review'])[1 + (g % 3)],
  (array['price_anomaly','identity_mismatch','duplicate_listing','unsafe_content','payment_risk'])[1 + (g % 5)],
  (array['low','medium','high','critical'])[1 + (g % 4)],
  20 + ((g * 13) % 81),
  (array['open','assigned','awaiting_information','action_taken','rejected','closed'])[1 + (g % 6)],
  case when g % 6 in (1,2,3) then (select user_id from public.support_agent_profiles where is_active order by user_id offset (g % 2) limit 1) end,
  now() + make_interval(hours => 2 + (g % 72)),
  jsonb_build_object('synthetic_preview', true, 'signals', jsonb_build_array('automated_rule','qa_scenario')),
  now() - make_interval(days => g % 180),
  now() - make_interval(days => g % 20),
  case when g % 6 = 5 then now() - make_interval(days => g % 30) end
from generate_series(1, 480) g
on conflict (id) do nothing;

insert into public.moderation_actions (id, case_id, actor_user_id, action, reason, before_data, after_data, created_at)
select
  md5('autorell-preview-moderation-action-' || g)::uuid,
  md5('autorell-preview-moderation-' || g)::uuid,
  (select user_id from public.support_agent_profiles where is_active order by user_id limit 1),
  (array['triaged','assigned','requested_information','reviewed'])[1 + (g % 4)],
  'Syntetisk åtgärd för verifiering av modereringshistoriken.',
  jsonb_build_object('status','open'),
  jsonb_build_object('synthetic_preview',true,'status',(array['assigned','awaiting_information','action_taken','closed'])[1 + (g % 4)]),
  now() - make_interval(days => g % 120)
from generate_series(1, 480) g
on conflict (id) do nothing;

insert into public.business_verification_requests (
  id, company_id, status, risk_flags, submitted_by, assigned_to, decided_by,
  decision_reason, submitted_at, decided_at, created_at, updated_at
)
select
  md5('autorell-preview-verification-' || g)::uuid,
  md5('autorell-preview-company-' || (1 + ((g - 1) % 360)))::uuid,
  (array['submitted','under_review','more_information_required','approved','approved','rejected','suspended'])[1 + (g % 7)],
  case when g % 5 = 0 then array['domain_mismatch','document_review']::text[] else '{}'::text[] end,
  md5('autorell-preview-user-' || (4 * (1 + ((g - 1) % 360))))::uuid,
  case when g % 7 <> 0 then (select user_id from public.support_agent_profiles where is_active order by user_id offset (g % 2) limit 1) end,
  case when g % 7 in (3,4,5,6) then (select user_id from public.support_agent_profiles where is_active order by user_id limit 1) end,
  case when g % 7 = 2 then 'Komplettera registreringsbevis och adress.' when g % 7 = 5 then 'Uppgifterna kunde inte styrkas.' else 'Syntetiskt previewbeslut.' end,
  now() - make_interval(days => g % 210),
  case when g % 7 in (3,4,5,6) then now() - make_interval(days => g % 150) end,
  now() - make_interval(days => g % 210),
  now() - make_interval(days => g % 25)
from generate_series(1, 220) g
on conflict (id) do nothing;

insert into public.business_verification_events (
  id, request_id, actor_user_id, event_type, from_status, to_status, reason, metadata, created_at
)
select
  md5('autorell-preview-verification-event-' || g)::uuid,
  md5('autorell-preview-verification-' || g)::uuid,
  (select user_id from public.support_agent_profiles where is_active order by user_id limit 1),
  'status_changed', 'submitted',
  (array['submitted','under_review','more_information_required','approved','approved','rejected','suspended'])[1 + (g % 7)],
  'Syntetisk verifieringshändelse för preview-QA.',
  jsonb_build_object('synthetic_preview', true),
  now() - make_interval(days => g % 180)
from generate_series(1, 220) g
on conflict (id) do nothing;

insert into public.support_tickets (
  id, user_id, listing_id, assigned_to, customer_name, customer_email, customer_phone,
  customer_country, subject, category, priority, status, customer_language,
  ai_summary, ai_risk_level, ai_recommended_action, created_at, updated_at, closed_at,
  company_id, payment_order_id, escalated_at, market, first_response_at, resolved_at,
  reopened_at, last_message_at, last_customer_message_at, last_support_message_at
)
select
  md5('autorell-preview-ticket-' || g)::uuid,
  md5('autorell-preview-user-' || (1 + ((g * 13) % 2400)))::uuid,
  md5('autorell-preview-listing-' || (1 + ((g * 17) % 5200)))::uuid,
  case when g % 4 <> 0 then (select user_id from public.support_agent_profiles where is_active order by user_id offset (g % 2) limit 1) end,
  'Previewkund ' || g,
  format('qa.customer.%s@preview.autorell.invalid', g),
  '+46 70 ' || lpad((4000000 + g)::text, 7, '0'),
  (array['SE','DE','DK','NL','AT','FI','PL'])[1 + (g % 7)],
  (array[
    'Jag behöver hjälp med min annons','Betalningen gick inte igenom','Företagskontot väntar på verifiering',
    'Jag vill rapportera en misstänkt annons','Tekniskt fel vid bilduppladdning','Fråga om mitt konto'
  ])[1 + (g % 6)] || ' #' || g,
  (array['listing','payment','business_account','report_listing','technical','account','fraud','gdpr','other'])[1 + (g % 9)],
  (array['low','normal','normal','high','urgent'])[1 + (g % 5)],
  (array['new','assigned','in_progress','waiting_for_customer','escalated','resolved','closed','reopened'])[1 + (g % 8)],
  (array['sv','de','da','nl','de','fi','pl'])[1 + (g % 7)],
  'Kunden behöver hjälp i ett realistiskt syntetiskt previewscenario. Kopplingar till användare, annons, företag och betalning är verifierbara.',
  case when g % 9 = 6 then 'high' else 'low' end,
  'Granska historiken och svara enligt supportprocessen.',
  now() - make_interval(days => g % 180, hours => g % 24),
  now() - make_interval(days => g % 20),
  case when g % 8 = 6 then now() - make_interval(days => g % 30) end,
  case when g % 4 = 0 then md5('autorell-preview-company-' || (1 + ((g - 1) % 360)))::uuid end,
  case when g % 9 = 1 then md5('autorell-preview-payment-' || (1 + ((g * 3) % 1400)))::uuid end,
  case when g % 8 = 4 then now() - make_interval(days => g % 40) end,
  lower((array['SE','DE','DK','NL','AT','FI','PL'])[1 + (g % 7)]),
  case when g % 8 <> 0 then now() - make_interval(days => g % 170) + interval '2 hours' end,
  case when g % 8 in (5,6) then now() - make_interval(days => g % 30) end,
  case when g % 8 = 7 then now() - make_interval(days => g % 15) end,
  now() - make_interval(days => g % 15),
  now() - make_interval(days => g % 15, hours => 2),
  case when g % 8 <> 0 then now() - make_interval(days => g % 15, hours => 1) end
from generate_series(1, 720) g
on conflict (id) do nothing;

insert into public.support_messages (
  id, ticket_id, author_id, author_type, message, is_internal, original_language,
  translated_message, created_at, delivery_status, provider_message_id
)
select
  md5(format('autorell-preview-ticket-message-%s-%s', g, m))::uuid,
  md5('autorell-preview-ticket-' || g)::uuid,
  case when m = 1 then md5('autorell-preview-user-' || (1 + ((g * 13) % 2400)))::uuid
       else (select user_id from public.support_agent_profiles where is_active order by user_id limit 1) end,
  case when m = 1 then 'customer' else 'support' end,
  case when m = 1 then 'Hej, jag behöver hjälp och beskriver här mitt ärende med relevanta detaljer.'
       when m = 2 then 'Tack, vi granskar uppgifterna och återkommer med nästa steg.'
       else 'Intern kontroll: verifiera kopplad annons och betalning innan slutligt svar.' end,
  m = 3,
  (array['sv','de','da','nl','fi','pl'])[1 + (g % 6)],
  case when g % 6 <> 0 then 'Preview translation available for support QA.' end,
  now() - make_interval(days => g % 120, hours => (4 - m)),
  case when m = 2 then 'sent' else 'not_applicable' end,
  case when m = 2 then format('preview_delivery_%s', g) end
from generate_series(1, 720) g
cross join generate_series(1, 3) m
on conflict (id) do nothing;

insert into public.support_ticket_events (id, ticket_id, actor_id, event_type, event_data, created_at)
select
  md5(format('autorell-preview-ticket-event-%s-%s', g, e))::uuid,
  md5('autorell-preview-ticket-' || g)::uuid,
  case when e = 1 then md5('autorell-preview-user-' || (1 + ((g * 13) % 2400)))::uuid
       else (select user_id from public.support_agent_profiles where is_active order by user_id limit 1) end,
  (array['created','assigned','status_changed'])[e],
  jsonb_build_object('synthetic_preview', true, 'sequence', e),
  now() - make_interval(days => g % 120, hours => (4 - e))
from generate_series(1, 720) g
cross join generate_series(1, 3) e
on conflict (id) do nothing;

insert into public.admin_notifications (
  id, notification_type, title, body, priority, status, resource_type, resource_id,
  action_url, assigned_to, created_by_event, metadata, read_at, closed_at, created_at, updated_at
)
select
  md5('autorell-preview-notification-' || g)::uuid,
  (array['company_application','support_ticket','listing_report','moderation_signal','payment_exception'])[1 + (g % 5)],
  (array['Ny företagsansökan','Nytt supportärende','Ny annonsrapport','Modereringssignal','Betalningsavvikelse'])[1 + (g % 5)] || ' #' || g,
  'Realistisk syntetisk adminnotis med direktlänk till rätt arbetskö.',
  (array['low','normal','high','critical'])[1 + (g % 4)],
  (array['unread','unread','assigned','read','closed','escalated'])[1 + (g % 6)],
  (array['business_verification','support_ticket','marketplace_report','moderation_case','payment_order'])[1 + (g % 5)],
  case g % 5
    when 0 then md5('autorell-preview-verification-' || (1 + (g % 220)))::text
    when 1 then md5('autorell-preview-ticket-' || (1 + (g % 720)))::text
    when 2 then md5('autorell-preview-report-' || (1 + (g % 650)))::text
    when 3 then md5('autorell-preview-moderation-' || (1 + (g % 480)))::text
    else md5('autorell-preview-payment-' || (1 + (g % 1400)))::text end,
  case g % 5
    when 0 then '/admin/companies/verification'
    when 1 then '/admin/support?ticket=' || md5('autorell-preview-ticket-' || (1 + (g % 720)))::uuid
    when 2 then '/admin/reports'
    when 3 then '/admin/moderation/cases'
    else '/admin/payments' end,
  case when g % 3 = 0 then (select user_id from public.support_agent_profiles where is_active order by user_id limit 1) end,
  'preview_seed_admin_scale_v1',
  jsonb_build_object('synthetic_preview', true, 'seed_version', 'admin-scale-v1'),
  case when g % 6 in (3,4) then now() - make_interval(days => g % 30) end,
  case when g % 6 = 4 then now() - make_interval(days => g % 20) end,
  now() - make_interval(days => g % 120, hours => g % 24),
  now() - make_interval(days => g % 20)
from generate_series(1, 600) g
on conflict (id) do nothing;

insert into public.stripe_webhook_events (
  stripe_event_id, event_type, processing_status, error_message, received_at, processed_at
)
select
  'evt_preview_' || lpad(g::text, 6, '0'),
  (array['checkout.session.completed','payment_intent.succeeded','payment_intent.payment_failed','customer.subscription.updated'])[1 + (g % 4)],
  (array['processed','processed','failed','processed'])[1 + (g % 4)],
  case when g % 4 = 2 then 'Syntetiskt webhookfel för systemstatus-QA.' end,
  now() - make_interval(days => g % 45, hours => g % 24),
  case when g % 4 <> 2 then now() - make_interval(days => g % 45, hours => g % 24) + interval '4 seconds' end
from generate_series(1, 180) g
on conflict (stripe_event_id) do nothing;

analyze public.marketplace_profiles;
analyze public.marketplace_companies;
analyze public.marketplace_listings;
analyze public.marketplace_reports;
analyze public.payment_orders;
analyze public.moderation_cases;
analyze public.business_verification_requests;
analyze public.support_tickets;
analyze public.admin_notifications;

commit;
