create unique index if not exists marketplace_conversations_listing_buyer_seller_unique
  on public.marketplace_conversations (listing_id, buyer_user_id, seller_user_id);

notify pgrst, 'reload schema';
