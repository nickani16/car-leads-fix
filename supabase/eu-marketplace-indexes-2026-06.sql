create index if not exists marketplace_conversations_seller_idx
  on public.marketplace_conversations (seller_user_id, last_message_at desc);

create index if not exists marketplace_messages_sender_idx
  on public.marketplace_messages (sender_user_id, created_at desc);

create index if not exists marketplace_reports_reporter_idx
  on public.marketplace_reports (reporter_user_id, created_at desc);

create index if not exists marketplace_reports_lead_idx
  on public.marketplace_reports (lead_id, created_at desc)
  where lead_id is not null;

create index if not exists marketplace_reports_conversation_idx
  on public.marketplace_reports (conversation_id, created_at desc)
  where conversation_id is not null;
