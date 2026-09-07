-- InSwipe — work-email (domain) verification for the company onboarding.
--
-- Onboarding step 3 confirms the recruiter uses a company address before the
-- "Verified" badge is granted. Same pattern as the team invites: the code lives
-- in a table with RLS on and no read policy, and is reached only through the two
-- functions below. The client e-mails it via the send-code Edge Function and
-- falls back to showing it when that is not configured.
--
-- Additive only.

create table if not exists public.domain_verifications (
  email      text primary key,
  company    text not null default '',
  code       text not null,
  verified   boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.domain_verifications enable row level security;
-- no read policy: the code lives here.

-- Start (or restart) verification for an address. Returns the code.
create or replace function public.verify_domain_start(p_email text, p_company text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $fn$
declare
  v_email  text := lower(trim(coalesce(p_email, '')));
  v_domain text;
  v_code   text;
begin
  if v_email = '' or position('@' in v_email) = 0 then
    raise exception 'a company email is required';
  end if;
  v_domain := split_part(v_email, '@', 2);
  v_code := lpad((floor(random() * 1000000))::int::text, 6, '0');

  insert into public.domain_verifications (email, company, code, verified)
  values (v_email, coalesce(p_company, ''), v_code, false)
  on conflict (email) do update
    set company = excluded.company, code = excluded.code, verified = false, updated_at = now();

  return jsonb_build_object('ok', true, 'sentTo', 'verify@' || v_domain, 'code', v_code);
end;
$fn$;

create or replace function public.verify_domain_check(p_email text, p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $fn$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_row   public.domain_verifications%rowtype;
begin
  select * into v_row from public.domain_verifications where email = v_email;
  if not found then
    raise exception 'Start verification first.';
  end if;
  if trim(coalesce(p_code, '')) <> v_row.code then
    return jsonb_build_object('ok', true, 'verified', false);
  end if;

  update public.domain_verifications set verified = true, updated_at = now() where email = v_email;
  return jsonb_build_object('ok', true, 'verified', true);
end;
$fn$;

revoke all on function public.verify_domain_start(text, text) from public;
revoke all on function public.verify_domain_check(text, text) from public;
grant execute on function public.verify_domain_start(text, text) to anon, authenticated;
grant execute on function public.verify_domain_check(text, text) to anon, authenticated;
