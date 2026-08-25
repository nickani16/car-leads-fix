alter table public.auth_email_codes
  add column if not exists redirect_path text;
