-- Bilingual transaction terms for contracts generated from 13 June 2026.
-- Seller agreements are Swedish. Buyer agreements remain English.
-- Sent, signed, void and final-approved documents are never rewritten.

begin;

create or replace function public.apply_transaction_terms_v1_2()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_terms jsonb;
  v_language text;
  v_template_version constant text := 'autorell-transaction-v1.2-2026-06-13';
begin
  if new.status in ('sent', 'signed', 'void') then
    return new;
  end if;

  if new.document_type = 'seller_purchase_agreement' then
    v_language := 'sv';
    v_terms := jsonb_build_array(
      jsonb_build_object(
        'title', 'Avtalets omfattning',
        'text', 'Detta elektroniska avtal avser det angivna budpriset och den fordonsdeklaration som säljaren har lämnat till Autorell. Fordonets identitet, mätarställning, skick, utrustning, bilder och övriga lämnade uppgifter utgör en del av avtalsunderlaget.'
      ),
      jsonb_build_object(
        'title', 'Säljarens deklaration',
        'text', 'Säljaren bekräftar att uppgifterna om ägande, fordonets skick, varningslampor, fel, skador, servicehistorik, nycklar, däck, tillbehör och övriga relevanta förhållanden är fullständiga och korrekta enligt säljarens kännedom. Förändringar ska meddelas före kontroll eller överlämning.'
      ),
      jsonb_build_object(
        'title', 'Autorells kontroll',
        'text', 'Före slutförandet får Autorell genomföra och dokumentera en teknisk och visuell kontroll av bilen mot deklarationen. Kontrollen kan omfatta identitet och VIN, mätarställning, varningsindikeringar, körbarhet, centrala funktioner, synligt skick, däck, bromsar där de rimligen kan bedömas, nycklar och deklarerade fel. Kontrollen är icke-destruktiv.'
      ),
      jsonb_build_object(
        'title', 'Rätt att avstå från affären',
        'text', 'Autorell har rätt att avstå från att fullfölja affären utan skyldighet att ange skäl. Detta gäller särskilt om bilen inte överensstämmer med deklarationen, om ägande eller handlingar inte kan verifieras, eller om registrerings-, identitets- eller andra formella uppgifter är felaktiga eller ofullständiga.'
      ),
      jsonb_build_object(
        'title', 'Avvikelse och prisjustering',
        'text', 'Om bilen eller handlingarna avviker från avtalsunderlaget får Autorell pausa processen. Affären kan fortsätta med ett justerat pris eller ändrade villkor endast efter att berörda parter har godkänt detta skriftligen. Om avvikelsen inte kan lösas får Autorell avsluta processen utan köp eller utbetalning.'
      ),
      jsonb_build_object(
        'title', 'Betalning och överlämning',
        'text', 'Utbetalning till säljaren förutsätter att köparens medel har kommit Autorell tillhanda, att ägande och handlingar har verifierats, att kontrollresultatet har godkänts och att överlämningen har genomförts. Säljaren ska tillhandahålla bilen, nycklarna, registreringshandlingarna och avtalade tillbehör på angiven plats.'
      ),
      jsonb_build_object(
        'title', 'Elektronisk signering',
        'text', 'Dokumentet är en låst sammanställning av den aktuella affären. Avtalet blir verkställt först när Autorell har godkänt dokumentversionen för signering och samtliga nödvändiga elektroniska signaturer har slutförts.'
      )
    );
  else
    v_language := 'en';
    v_terms := jsonb_build_array(
      jsonb_build_object(
        'title', 'A managed transaction from bid to delivery',
        'text', 'The buyer only needs to review the vehicle information and place its bid. If the bid is accepted, Autorell coordinates the agreement, receipt of funds, vehicle inspection, seller completion, collection, export documentation and agreed logistics.'
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
        'title', 'Comprehensive technical and visual inspection',
        'text', 'Autorell performs a technical and visual inspection against the submitted seller declaration before completion. The inspection includes vehicle identity and VIN, mileage, warning indicators, drivability, principal functions, visible body and interior condition, tyres, brakes where reasonably assessable, keys, equipment and disclosed faults. The inspection is non-destructive and does not constitute a guarantee against latent defects that could not reasonably be identified.'
      ),
      jsonb_build_object(
        'title', 'Buyer options if the declaration is inaccurate',
        'text', 'If the vehicle''s actual condition materially differs from the declaration, the buyer may, in dialogue with Autorell, decline completion of the agreement or instruct Autorell to negotiate a reduced purchase price. Any revised price or condition becomes effective only after documented acceptance by the required parties.'
      ),
      jsonb_build_object(
        'title', 'Cancellation and return of funds',
        'text', 'Autorell may pause or cancel the transaction where a discrepancy is material, unsafe, unlawful or unresolved, or where ownership or required documents cannot be verified. Buyer funds received for a cancelled transaction will be returned to the verified originating account, subject only to deductions expressly agreed in writing and permitted by applicable law.'
      ),
      jsonb_build_object(
        'title', 'Completion, collection and export',
        'text', 'After cleared funds and an accepted inspection result, Autorell coordinates completion with the seller, collection of the vehicle, Swedish export documentation, registration plate handling where applicable and the agreed transport or handover. Ownership and risk transfer only at the point stated in the signed agreement and handover or transport documentation.'
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
execute function public.apply_transaction_terms_v1_2();

revoke all on function public.apply_transaction_terms_v1_2()
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
