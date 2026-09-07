-- InSwipe — hiring teams (organizations, members, invites).
--
-- The company dashboard lets a recruiter create a shared workspace and invite
-- teammates by email. Before this, that state lived on a local sync server; this
-- moves it onto Supabase so an invited teammate on another device sees the same
-- company and team.
--
-- Same shape as the rest of the demo: reads are public, every write is a
-- security-definer function. `org_invites` is the exception — it carries the
-- e-mail challenge code, so it has RLS on and NO read policy; the only way to see
-- an invite is `lookup_invite()`, which never returns the code.
--
-- Additive only. Nothing here touches an existing table, function or policy, and
-- the student app imports none of it.

/* --------------------------------- tables --------------------------------- */

create table if not exists public.organizations (
  id          text primary key,                 -- client-minted, e.g. 'org-lz3k9x-a1b2c3'
  company     jsonb not null default '{}'::jsonb, -- the CompanyInfo blob the dashboard edits
  owner_name  text not null default '',
  owner_email text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.org_members (
  org_id      text not null references public.organizations(id) on delete cascade,
  id          text not null,                    -- 'm-owner' for the owner, 'm-<n>' otherwise
  name        text not null default '',
  email       text not null default '',
  role        text not null default 'Recruiter'
                check (role in ('Admin', 'Recruiter', 'Hiring Manager')),
  status      text not null default 'Pending'
                check (status in ('Active', 'Pending')),
  is_owner    boolean not null default false,
  invited_at  timestamptz not null default now(),
  accepted_at timestamptz,
  primary key (org_id, id)
);

create table if not exists public.org_invites (
  token        text primary key,                -- opaque capability, in the invite link
  org_id       text not null references public.organizations(id) on delete cascade,
  member_id    text not null,
  to_email     text not null,
  to_name      text not null default '',
  role         text not null default 'Recruiter',
  inviter_name text not null default '',
  code         text,                            -- 6-digit challenge, set by challenge_invite()
  code_sent_at timestamptz,
  consumed     boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists org_members_org_idx on public.org_members (org_id);
create index if not exists org_invites_org_idx  on public.org_invites (org_id);

/* -------------------------------- read access -------------------------------- */

alter table public.organizations enable row level security;
alter table public.org_members   enable row level security;
alter table public.org_invites   enable row level security;

drop policy if exists demo_read on public.organizations;
create policy demo_read on public.organizations for select to anon, authenticated using (true);

drop policy if exists demo_read on public.org_members;
create policy demo_read on public.org_members for select to anon, authenticated using (true);

-- org_invites: no read policy on purpose. The code lives here.

/* ------------------------------- snapshot helper ------------------------------- */

-- The shape lib/org.ts renders: { ok, orgId, company, members: [...] }, owner first.
create or replace function public.org_snapshot(p_org_id text)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $fn$
  select jsonb_build_object(
    'ok', true,
    'orgId', o.id,
    'company', o.company,
    'members', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', m.id,
            'name', m.name,
            'email', m.email,
            'role', m.role,
            'status', m.status,
            'isOwner', m.is_owner,
            'invitedAt', to_char(m.invited_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
            'acceptedAt', case when m.accepted_at is null then null
              else to_char(m.accepted_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') end
          )
          order by m.is_owner desc, m.invited_at asc
        )
        from public.org_members m
        where m.org_id = o.id
      ),
      '[]'::jsonb
    )
  )
  from public.organizations o
  where o.id = p_org_id;
$fn$;

/* ---------------------------------- writes ---------------------------------- */

-- Create or refresh the org. Idempotent: the first call creates it and the owner
-- member row; later calls update the company blob and the owner's identity.
create or replace function public.create_org(
  p_org_id      text,
  p_company     jsonb,
  p_owner_name  text,
  p_owner_email text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $fn$
begin
  insert into public.organizations (id, company, owner_name, owner_email)
  values (p_org_id, coalesce(p_company, '{}'::jsonb), coalesce(p_owner_name, ''), lower(coalesce(p_owner_email, '')))
  on conflict (id) do update
    set company = coalesce(excluded.company, public.organizations.company),
        owner_name = excluded.owner_name,
        owner_email = excluded.owner_email,
        updated_at = now();

  insert into public.org_members (org_id, id, name, email, role, status, is_owner, accepted_at)
  values (p_org_id, 'm-owner', coalesce(p_owner_name, ''), lower(coalesce(p_owner_email, '')), 'Admin', 'Active', true, now())
  on conflict (org_id, id) do update
    set name = excluded.name, email = excluded.email;

  return public.org_snapshot(p_org_id);
end;
$fn$;

create or replace function public.push_org_company(p_org_id text, p_company jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $fn$
begin
  update public.organizations set company = coalesce(p_company, company), updated_at = now()
  where id = p_org_id;
  return public.org_snapshot(p_org_id);
end;
$fn$;

-- Invite a teammate. Writes a Pending member row and an invite token, and returns
-- the token so the client can build the link. Re-inviting the same address reuses
-- the member row and issues a fresh token.
create or replace function public.invite_to_org(
  p_org_id       text,
  p_to_email     text,
  p_to_name      text,
  p_role         text,
  p_inviter_name text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $fn$
declare
  v_email     text := lower(trim(coalesce(p_to_email, '')));
  v_role      text := coalesce(nullif(p_role, ''), 'Recruiter');
  v_member_id text;
  v_token     text;
begin
  if not exists (select 1 from public.organizations where id = p_org_id) then
    raise exception 'no such team';
  end if;
  if v_email = '' then raise exception 'an email is required'; end if;

  select id into v_member_id from public.org_members
  where org_id = p_org_id and lower(email) = v_email and not is_owner;

  if v_member_id is null then
    v_member_id := 'm-' || substr(md5(gen_random_uuid()::text), 1, 10);
    insert into public.org_members (org_id, id, name, email, role, status, is_owner)
    values (p_org_id, v_member_id, coalesce(p_to_name, ''), v_email, v_role, 'Pending', false);
  else
    update public.org_members
    set name = coalesce(nullif(p_to_name, ''), name), role = v_role, status = 'Pending'
    where org_id = p_org_id and id = v_member_id;
  end if;

  -- one live invite per member
  delete from public.org_invites where org_id = p_org_id and member_id = v_member_id and not consumed;

  v_token := replace(gen_random_uuid()::text, '-', '') || substr(md5(gen_random_uuid()::text), 1, 8);
  insert into public.org_invites (token, org_id, member_id, to_email, to_name, role, inviter_name)
  values (v_token, p_org_id, v_member_id, v_email, coalesce(p_to_name, ''), v_role, coalesce(p_inviter_name, ''));

  return jsonb_build_object('token', v_token, 'memberId', v_member_id, 'snapshot', public.org_snapshot(p_org_id));
end;
$fn$;

create or replace function public.set_org_member_role(p_org_id text, p_member_id text, p_role text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $fn$
begin
  update public.org_members set role = p_role
  where org_id = p_org_id and id = p_member_id and not is_owner;
  return public.org_snapshot(p_org_id);
end;
$fn$;

create or replace function public.remove_org_member(p_org_id text, p_member_id text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $fn$
begin
  delete from public.org_members where org_id = p_org_id and id = p_member_id and not is_owner;
  delete from public.org_invites where org_id = p_org_id and member_id = p_member_id;
  return public.org_snapshot(p_org_id);
end;
$fn$;

/* --------------------------------- invites --------------------------------- */

-- What the accept screen shows. Never returns the code.
create or replace function public.lookup_invite(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $fn$
declare
  v_inv public.org_invites%rowtype;
  v_company jsonb;
begin
  select * into v_inv from public.org_invites where token = p_token;
  if not found or v_inv.consumed then
    raise exception 'This invite link is invalid or was already used.';
  end if;

  select company into v_company from public.organizations where id = v_inv.org_id;

  return jsonb_build_object(
    'ok', true,
    'company', jsonb_build_object(
      'name', coalesce(v_company ->> 'name', ''),
      'logo', v_company ->> 'logo'
    ),
    'role', v_inv.role,
    'toName', v_inv.to_name,
    'toEmail', v_inv.to_email,
    'inviterName', v_inv.inviter_name
  );
end;
$fn$;

-- Issue (or re-issue) the 6-digit code. Returns it: the client e-mails it via the
-- send-code Edge Function, and falls back to showing it when that is not set up.
create or replace function public.challenge_invite(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $fn$
declare
  v_inv  public.org_invites%rowtype;
  v_code text;
begin
  select * into v_inv from public.org_invites where token = p_token;
  if not found or v_inv.consumed then
    raise exception 'This invite link is invalid or was already used.';
  end if;

  v_code := lpad((floor(random() * 1000000))::int::text, 6, '0');
  update public.org_invites set code = v_code, code_sent_at = now() where token = p_token;

  return jsonb_build_object('ok', true, 'sentTo', v_inv.to_email, 'code', v_code);
end;
$fn$;

-- Verify the code, set the display name, join the org. Returns the member id and
-- a fresh snapshot.
create or replace function public.accept_invite(p_token text, p_code text, p_name text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $fn$
declare
  v_inv public.org_invites%rowtype;
begin
  select * into v_inv from public.org_invites where token = p_token for update;
  if not found or v_inv.consumed then
    raise exception 'This invite link is invalid or was already used.';
  end if;
  if v_inv.code is null or trim(coalesce(p_code, '')) <> v_inv.code then
    raise exception 'That code did not match. Check the email and try again.';
  end if;

  update public.org_members
  set name = coalesce(nullif(trim(p_name), ''), name),
      status = 'Active',
      accepted_at = now()
  where org_id = v_inv.org_id and id = v_inv.member_id;

  update public.org_invites set consumed = true where token = p_token;

  return jsonb_build_object('ok', true, 'memberId', v_inv.member_id, 'snapshot', public.org_snapshot(v_inv.org_id));
end;
$fn$;

/* ----------------------------------- grants ----------------------------------- */

revoke all on function public.org_snapshot(text) from public;
revoke all on function public.create_org(text, jsonb, text, text) from public;
revoke all on function public.push_org_company(text, jsonb) from public;
revoke all on function public.invite_to_org(text, text, text, text, text) from public;
revoke all on function public.set_org_member_role(text, text, text) from public;
revoke all on function public.remove_org_member(text, text) from public;
revoke all on function public.lookup_invite(text) from public;
revoke all on function public.challenge_invite(text) from public;
revoke all on function public.accept_invite(text, text, text) from public;

grant execute on function public.create_org(text, jsonb, text, text) to anon, authenticated;
grant execute on function public.push_org_company(text, jsonb) to anon, authenticated;
grant execute on function public.invite_to_org(text, text, text, text, text) to anon, authenticated;
grant execute on function public.set_org_member_role(text, text, text) to anon, authenticated;
grant execute on function public.remove_org_member(text, text) to anon, authenticated;
grant execute on function public.lookup_invite(text) to anon, authenticated;
grant execute on function public.challenge_invite(text) to anon, authenticated;
grant execute on function public.accept_invite(text, text, text) to anon, authenticated;
-- org_snapshot is an internal helper; it is only reached through the functions above.
