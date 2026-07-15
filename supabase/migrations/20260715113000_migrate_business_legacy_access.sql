begin;

update public.marketplace_profiles p
set business_onboarding_status = 'subscription_pending',
    verification_updated_at = now()
where p.account_type = 'business'
  and coalesce(p.business_onboarding_status, '') in ('active', 'approved', 'subscription_pending', 'payment_pending', '')
  and not exists (
    select 1
    from public.business_subscriptions s
    where s.user_id = p.user_id
      and (
        s.status in ('active', 'trialing')
        or s.manually_activated = true
        or (s.free_period_ends_at is not null and s.free_period_ends_at > now())
      )
  );

commit;
