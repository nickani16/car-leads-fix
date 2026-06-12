-- Immutable transaction terms for contracts generated from 12 June 2026.
-- Existing sent, signed and void documents are not modified.

begin;

create or replace function public.apply_transaction_terms_v1_1()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_terms jsonb;
  v_template_version constant text := 'autorell-transaction-v1.1-2026-06-12';
begin
  if new.status in ('sent', 'signed', 'void') then
    return new;
  end if;

  if new.document_type = 'seller_purchase_agreement' then
    v_terms := jsonb_build_array(
      jsonb_build_object(
        'title', 'Seller declaration and duty to disclose',
        'text', 'The seller confirms that the vehicle identity, mileage, ownership, condition, warning lights, faults, damage, service information, keys, accessories and other information supplied to Autorell are complete and accurate to the seller''s knowledge. The seller must disclose any change before inspection or handover.'
      ),
      jsonb_build_object(
        'title', 'Buyer funding and conditional completion',
        'text', 'The buyer funds Autorell before collection. Receipt of buyer funds does not by itself complete Autorell''s purchase from the seller. Seller payout remains conditional on cleared funds, verified ownership and documents, an accepted inspection result and completed handover.'
      ),
      jsonb_build_object(
        'title', 'Autorell inspection',
        'text', 'Autorell may inspect and document the vehicle before completion, including identity, VIN, mileage, warning indicators, drivability, principal functions, visible condition, tyres, brakes where reasonably assessable, keys and disclosed faults. The inspection may include a lawful road test but is non-destructive.'
      ),
      jsonb_build_object(
        'title', 'Discrepancy, adjustment or cancellation',
        'text', 'If the vehicle or documents differ from the declaration, Autorell may pause the transaction. A revised price or condition is effective only by documented agreement. For a material, unsafe, unlawful or unresolved discrepancy, Autorell may cancel without completing the purchase or paying the seller.'
      ),
      jsonb_build_object(
        'title', 'Handover, ownership and risk',
        'text', 'The seller must provide the vehicle, keys, registration documents and agreed accessories at the stated location. Ownership and risk transfer only at the completion point recorded in the signed agreement and handover documentation.'
      ),
      jsonb_build_object(
        'title', 'Document status',
        'text', 'This document is an immutable transaction snapshot. It becomes executed only after release through Autorell''s approved signing workflow and completion of all required signatures.'
      )
    );
  else
    v_terms := jsonb_build_array(
      jsonb_build_object(
        'title', 'Vehicle basis and seller declaration',
        'text', 'The buyer''s bid and this agreement are based on the vehicle profile, seller declaration, images, records and disclosed faults. Autorell will compare the vehicle with that transaction record before final completion.'
      ),
      jsonb_build_object(
        'title', 'Advance funding to Autorell',
        'text', 'The buyer must transfer the complete confirmed buyer total to Autorell by the stated deadline and before collection. Receipt of funds secures the transaction workflow but does not by itself transfer ownership or risk.'
      ),
      jsonb_build_object(
        'title', 'Autorell Verified Inspection',
        'text', 'Before completion, Autorell normally checks identity, VIN, mileage, warning indicators, drivability, principal functions, visible condition, tyres, brakes where reasonably assessable, keys and disclosed faults against the seller declaration. The inspection is non-destructive and is not an unlimited mechanical warranty or guarantee against latent defects.'
      ),
      jsonb_build_object(
        'title', 'Discrepancy and revised agreement',
        'text', 'If a discrepancy is found, Autorell may pause release and completion. The transaction may continue at a revised price or on revised conditions only after the required parties give documented acceptance. The buyer is not required to accept a materially different vehicle.'
      ),
      jsonb_build_object(
        'title', 'Cancellation and return of funds',
        'text', 'Autorell may cancel where a discrepancy is material, unsafe, unlawful or unresolved, or where ownership or required documents cannot be verified. Buyer funds received for the transaction will then be returned to the verified originating account, subject only to deductions expressly permitted by this agreement and applicable law.'
      ),
      jsonb_build_object(
        'title', 'Completion, export and risk',
        'text', 'After successful verification, Autorell coordinates completion, Swedish export documentation, agreed collection and logistics. Ownership and risk transfer only at the point stated in the signed agreement and handover or transport documentation.'
      ),
      jsonb_build_object(
        'title', 'Document status',
        'text', 'This document is an immutable transaction snapshot. It becomes executed only after release through Autorell''s approved signing workflow and completion of all required signatures.'
      )
    );
  end if;

  new.template_version := v_template_version;
  new.snapshot := jsonb_set(
    jsonb_set(new.snapshot, '{template_version}', to_jsonb(v_template_version), true),
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
execute function public.apply_transaction_terms_v1_1();

revoke all on function public.apply_transaction_terms_v1_1()
from public, anon, authenticated;

commit;
