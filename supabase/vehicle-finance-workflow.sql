-- Vehicle ownership and finance settlement workflow.
-- Sensitive lender details stay on the lead and are not exposed in dealer_leads.

begin;

alter table public.leads
  add column if not exists finance_status text not null default 'unknown',
  add column if not exists finance_provider text,
  add column if not exists finance_agreement_reference text,
  add column if not exists finance_estimated_balance numeric(14,2),
  add column if not exists finance_contact_consent boolean not null default false,
  add column if not exists finance_review_status text not null default 'needs_review',
  add column if not exists finance_settlement_amount numeric(14,2),
  add column if not exists finance_settlement_valid_until date,
  add column if not exists finance_release_reference text,
  add column if not exists finance_admin_notes text,
  add column if not exists finance_reviewed_at timestamptz,
  add column if not exists finance_reviewed_by uuid references auth.users(id) on delete set null;

alter table public.leads
  drop constraint if exists leads_finance_status_check,
  add constraint leads_finance_status_check check (
    finance_status in (
      'owned_outright',
      'vehicle_finance',
      'unsecured_loan',
      'leasing',
      'unknown'
    )
  ),
  drop constraint if exists leads_finance_review_status_check,
  add constraint leads_finance_review_status_check check (
    finance_review_status in (
      'not_required',
      'needs_review',
      'settlement_requested',
      'settlement_received',
      'shortfall_required',
      'ready_to_settle',
      'released',
      'blocked'
    )
  ),
  drop constraint if exists leads_finance_estimated_balance_check,
  add constraint leads_finance_estimated_balance_check check (
    finance_estimated_balance is null or finance_estimated_balance >= 0
  ),
  drop constraint if exists leads_finance_settlement_amount_check,
  add constraint leads_finance_settlement_amount_check check (
    finance_settlement_amount is null or finance_settlement_amount >= 0
  );

create index if not exists leads_finance_review_idx
  on public.leads (finance_review_status, status)
  where finance_review_status <> 'not_required';

create index if not exists leads_finance_reviewed_by_idx
  on public.leads (finance_reviewed_by)
  where finance_reviewed_by is not null;

create or replace function public.apply_transaction_terms_v1_3()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_terms jsonb;
  v_language text;
  v_template_version constant text := 'autorell-transaction-v1.3-2026-06-13';
begin
  if new.status in ('sent', 'signed', 'void') then
    return new;
  end if;

  if new.document_type = 'seller_purchase_agreement' then
    new.snapshot := jsonb_set(
      new.snapshot,
      '{vehicle}',
      coalesce(new.snapshot->'vehicle', '{}'::jsonb)
        - 'finance_admin_notes'
        - 'finance_reviewed_by',
      true
    );
    v_language := 'sv';
    v_terms := jsonb_build_array(
      jsonb_build_object(
        'title', 'Avtalets omfattning',
        'text', 'Detta elektroniska avtal avser det angivna budpriset och den fordonsdeklaration som säljaren har lämnat till Autorell. Fordonets identitet, mätarställning, skick, utrustning, bilder, ägande- och finansieringsuppgifter samt övriga lämnade uppgifter utgör en del av avtalsunderlaget.'
      ),
      jsonb_build_object(
        'title', 'Säljarens deklaration',
        'text', 'Säljaren bekräftar att uppgifterna om ägande, kredit, leasing, fordonets skick, varningslampor, fel, skador, servicehistorik, nycklar, däck, tillbehör och övriga relevanta förhållanden är fullständiga och korrekta enligt säljarens kännedom. Förändringar ska meddelas före kontroll eller överlämning.'
      ),
      jsonb_build_object(
        'title', 'Finansiering, lösen och äganderätt',
        'text', 'Om bilen omfattas av fordonskredit, avbetalning, återtagandeförbehåll eller leasing är affären villkorad av att finansbolaget bekräftar ett giltigt lösen- eller utköpsbelopp och att bilen kan frisläppas för överlåtelse. Säljaren ger Autorell rätt att verifiera uppgifterna med finansbolaget. Autorell får betala lösenbeloppet direkt till finansbolaget ur köpeskillingen och betalar endast därefter ett eventuellt överskott till säljaren. Om lösenbeloppet överstiger säljarens nettobelopp måste säljaren täcka mellanskillnaden före slutförande.'
      ),
      jsonb_build_object(
        'title', 'Autorells kontroll',
        'text', 'Före slutförandet får Autorell genomföra och dokumentera en teknisk och visuell kontroll av bilen mot deklarationen. Kontrollen kan omfatta identitet och VIN, mätarställning, varningsindikeringar, körbarhet, centrala funktioner, synligt skick, däck, bromsar där de rimligen kan bedömas, nycklar och deklarerade fel. Kontrollen är icke-destruktiv.'
      ),
      jsonb_build_object(
        'title', 'Rätt att avstå från affären',
        'text', 'Autorell har rätt att avstå från att fullfölja affären utan skyldighet att ange skäl. Detta gäller särskilt om bilen inte överensstämmer med deklarationen, om ägande, skuldfrihet, finansieringslösen eller handlingar inte kan verifieras, eller om registrerings-, identitets- eller andra formella uppgifter är felaktiga eller ofullständiga.'
      ),
      jsonb_build_object(
        'title', 'Avvikelse och prisjustering',
        'text', 'Om bilen eller handlingarna avviker från avtalsunderlaget får Autorell pausa processen. Affären kan fortsätta med ett justerat pris eller ändrade villkor endast efter att berörda parter har godkänt detta skriftligen. Om avvikelsen inte kan lösas får Autorell avsluta processen utan köp eller utbetalning.'
      ),
      jsonb_build_object(
        'title', 'Betalning och överlämning',
        'text', 'Utbetalning till säljaren förutsätter att köparens medel har kommit Autorell tillhanda, att ägande, finansiering och handlingar har verifierats, att kontrollresultatet har godkänts och att överlämningen har genomförts. Säljaren ska tillhandahålla bilen, nycklarna, registreringshandlingarna och avtalade tillbehör på angiven plats.'
      ),
      jsonb_build_object(
        'title', 'Elektronisk signering',
        'text', 'Dokumentet är en låst sammanställning av den aktuella affären. Avtalet blir verkställt först när Autorell har godkänt dokumentversionen för signering och samtliga nödvändiga elektroniska signaturer har slutförts.'
      )
    );
  else
    new.snapshot := jsonb_set(
      new.snapshot,
      '{vehicle}',
      coalesce(new.snapshot->'vehicle', '{}'::jsonb)
        - 'finance_provider'
        - 'finance_agreement_reference'
        - 'finance_estimated_balance'
        - 'finance_contact_consent'
        - 'finance_settlement_amount'
        - 'finance_settlement_valid_until'
        - 'finance_release_reference'
        - 'finance_admin_notes'
        - 'finance_reviewed_at'
        - 'finance_reviewed_by',
      true
    );
    v_language := 'en';
    v_terms := jsonb_build_array(
      jsonb_build_object(
        'title', 'A managed transaction from bid to delivery',
        'text', 'The buyer only needs to review the vehicle information and place its bid. If the bid is accepted, Autorell coordinates the agreement, receipt of funds, vehicle inspection, finance settlement where applicable, seller completion, collection, export documentation and agreed logistics.'
      ),
      jsonb_build_object(
        'title', 'Vehicle basis and seller declaration',
        'text', 'The buyer''s bid and this agreement are based on the vehicle profile, seller declaration, images, records, disclosed faults and the commercial terms shown in this document. Autorell compares the vehicle with that transaction record before final completion.'
      ),
      jsonb_build_object(
        'title', 'Payment within three business days',
        'text', 'The buyer must transfer the complete confirmed buyer total to the bank account or SEPA account designated by Autorell within three business days after this agreement has been signed. Funds must be cleared before collection or release. Receipt of funds starts the managed completion process but does not by itself transfer ownership or risk.'
      ),
      jsonb_build_object(
        'title', 'Clear title and finance release',
        'text', 'Where the vehicle is subject to secured finance, hire purchase, retention of title or lease, completion is conditional on Autorell obtaining a valid settlement or purchase figure and confirmation that the vehicle can be released. Autorell may pay the finance provider directly from the transaction funds. The vehicle is not released to the buyer until the required finance settlement and title checks have been completed.'
      ),
      jsonb_build_object(
        'title', 'Comprehensive technical and visual inspection',
        'text', 'Autorell performs a technical and visual inspection against the submitted seller declaration before completion. The inspection includes vehicle identity and VIN, mileage, warning indicators, drivability, principal functions, visible body and interior condition, tyres, brakes where reasonably assessable, keys, equipment and disclosed faults. The inspection is non-destructive and does not constitute a guarantee against latent defects that could not reasonably be identified.'
      ),
      jsonb_build_object(
        'title', 'Buyer options if the declaration is inaccurate',
        'text', 'If the vehicle''s actual condition materially differs from the declaration, the buyer may, in dialogue with Autorell, decline completion of the agreement or instruct Autorell to negotiate a reduced purchase price. Any revised price or condition becomes effective only after documented acceptance by the required parties.'
      ),
      jsonb_build_object(
        'title', 'Cancellation and return of funds',
        'text', 'Autorell may pause or cancel the transaction where a discrepancy is material, unsafe, unlawful or unresolved, or where ownership, finance release or required documents cannot be verified. Buyer funds received for a cancelled transaction will be returned to the verified originating account, subject only to deductions expressly agreed in writing and permitted by applicable law.'
      ),
      jsonb_build_object(
        'title', 'Completion, collection and export',
        'text', 'After cleared funds, an accepted inspection result and any required finance release, Autorell coordinates completion with the seller, collection of the vehicle, Swedish export documentation, registration plate handling where applicable and the agreed transport or handover. Ownership and risk transfer only at the point stated in the signed agreement and handover or transport documentation.'
      ),
      jsonb_build_object(
        'title', 'Electronic signing and document status',
        'text', 'This document is an immutable transaction snapshot. It becomes executed only after release through Autorell''s approved signing workflow and completion of all required electronic signatures.'
      )
    );
  end if;

  new.template_version := v_template_version;
  new.snapshot := jsonb_set(
    jsonb_set(
      jsonb_set(new.snapshot, '{template_version}', to_jsonb(v_template_version), true),
      '{language}',
      to_jsonb(v_language),
      true
    ),
    '{terms}',
    v_terms,
    true
  );
  new.content_hash := encode(digest(new.snapshot::text, 'sha256'), 'hex');

  update public.contract_packets
  set template_version = v_template_version, updated_at = now()
  where id = new.packet_id
    and status in ('needs_information', 'draft_ready');

  return new;
end;
$$;

drop trigger if exists apply_transaction_terms_before_insert
on public.contract_documents_v2;

create trigger apply_transaction_terms_before_insert
before insert on public.contract_documents_v2
for each row
execute function public.apply_transaction_terms_v1_3();

revoke all on function public.apply_transaction_terms_v1_3()
from public, anon, authenticated;

do $$
declare
  v_deal_id uuid;
begin
  for v_deal_id in
    select distinct packet.deal_id
    from public.contract_packets packet
    join public.contract_documents_v2 document
      on document.packet_id = packet.id
    where packet.status in ('needs_information', 'draft_ready')
      and document.status in ('draft', 'ready')
      and document.final_approved_at is null
      and not exists (
        select 1
        from public.contract_documents_v2 protected_document
        where protected_document.packet_id = packet.id
          and (
            protected_document.status in ('sent', 'signed')
            or protected_document.final_approved_at is not null
          )
      )
  loop
    perform public.refresh_contract_documents(v_deal_id);
  end loop;
end;
$$;

commit;
