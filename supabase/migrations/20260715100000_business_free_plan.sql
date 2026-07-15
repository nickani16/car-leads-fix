begin;

alter table public.business_subscriptions
  drop constraint if exists business_subscriptions_plan_key_check;
alter table public.business_subscriptions
  add constraint business_subscriptions_plan_key_check
  check (plan_key in ('free','starter','growth','professional','enterprise'));

commit;
