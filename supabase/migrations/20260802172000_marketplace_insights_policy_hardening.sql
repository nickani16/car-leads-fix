begin;

drop policy if exists saved_search_alert_deliveries_select_own
  on public.saved_search_alert_deliveries;
create policy saved_search_alert_deliveries_select_own
  on public.saved_search_alert_deliveries for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists marketplace_listing_analytics_daily_select_seller
  on public.marketplace_listing_analytics_daily;
create policy marketplace_listing_analytics_daily_select_seller
  on public.marketplace_listing_analytics_daily for select to authenticated
  using ((select auth.uid()) = seller_user_id);

drop policy if exists marketplace_listing_comparison_items_select_own
  on public.marketplace_listing_comparison_items;
create policy marketplace_listing_comparison_items_select_own
  on public.marketplace_listing_comparison_items for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists marketplace_listing_comparison_items_insert_own
  on public.marketplace_listing_comparison_items;
create policy marketplace_listing_comparison_items_insert_own
  on public.marketplace_listing_comparison_items for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists marketplace_listing_comparison_items_update_own
  on public.marketplace_listing_comparison_items;
create policy marketplace_listing_comparison_items_update_own
  on public.marketplace_listing_comparison_items for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists marketplace_listing_comparison_items_delete_own
  on public.marketplace_listing_comparison_items;
create policy marketplace_listing_comparison_items_delete_own
  on public.marketplace_listing_comparison_items for delete to authenticated
  using ((select auth.uid()) = user_id);

commit;
