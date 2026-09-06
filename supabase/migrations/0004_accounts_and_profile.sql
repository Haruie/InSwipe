-- InSwipe — student accounts and profile writes.
--
-- Two gaps this closes:
--
--   1. "Create your account" was a screen, not an account. Signing up now writes a real
--      `students` row and the app runs as that student for the rest of the session.
--   2. The profile was read-only in practice. Every screen that edits it — the manual
--      onboarding steps and the profile tab — wrote to React state only, and the next
--      four-second poll replaced it with the row from the database. `save_student_profile`
--      gives those edits somewhere to land.
--
-- Still no authentication (CLAUDE.md section 10). Passwords are deliberately NOT stored:
-- a demo has no business holding credentials, and a fake password column would read as
-- one. Sign-in matches on email alone. When Supabase Auth lands, `students.id` becomes
-- the auth uid and these two functions collapse into a trigger on `auth.users`.

/* ------------------------------- profile photo ------------------------------- */

-- The photo a student uploads on their profile. Held as a data URL rather than a file
-- in storage: the demo has no bucket and no auth to scope one by, and the app downscales
-- to 256px before it writes, so a row stays small. A storage URL drops in here unchanged.
alter table public.students add column if not exists avatar_url text not null default '';

/* ---------------------------------- accounts ---------------------------------- */

-- A URL-safe id from a person's name — 'Priya Raghavan' -> 'priya-raghavan'. Collisions
-- get a numeric suffix, so two Priya Raghavans both get an account.
create or replace function public.student_id_from_name(p_name text)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $fn$
declare
  v_base text;
  v_id   text;
  v_n    int := 2;
begin
  v_base := regexp_replace(lower(trim(coalesce(p_name, ''))), '[^a-z0-9]+', '-', 'g');
  v_base := trim(both '-' from v_base);
  if v_base = '' then v_base := 'student'; end if;
  v_base := left(v_base, 40);

  v_id := v_base;
  while exists (select 1 from public.students where id = v_id) loop
    v_id := v_base || '-' || v_n;
    v_n := v_n + 1;
  end loop;

  return v_id;
end;
$fn$;

-- Signing up. Returns the student id the app then runs as.
--
-- Idempotent on email, which is what makes it safe to call from a form that can be
-- submitted twice: a second sign-up with a known address returns the existing account
-- rather than creating a duplicate one.
--
-- The row starts genuinely empty — no skills, no projects, no preferences beyond the
-- defaults the fit engine needs to produce a number. That is the point: a new account
-- has an empty deck-ranking profile until the student fills it in, and their fit scores
-- climb as they do. Nothing is copied from the demo student.
create or replace function public.create_student(
  p_name  text,
  p_email text
)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $fn$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_name  text := trim(coalesce(p_name, ''));
  v_id    text;
begin
  if v_name = '' then raise exception 'a name is required'; end if;
  if v_email = '' then raise exception 'an email is required'; end if;

  select id into v_id from public.students where lower(email) = v_email limit 1;
  if v_id is not null then
    return v_id;
  end if;

  v_id := public.student_id_from_name(v_name);

  insert into public.students (
    id, name, initial, email, university, degree, field, grad_year,
    skills, projects, experience, education, preferences, resume, links,
    avatar_color, gpa, location, year_label, resume_file, avatar_url
  )
  values (
    v_id, v_name, upper(left(v_name, 1)), v_email, '', '', '', '',
    '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '{}'::jsonb,
    -- the shape @inswipe/core expects; empty of opinions, so the fit engine scores
    -- preferences neutrally until the student states some
    '{"roles":[],"workMode":"Hybrid","locations":[],"durationMonths":3,"minStipend":0}'::jsonb,
    null, '{}'::jsonb,
    '#EEF0FF', '', '', '', '', ''
  );

  return v_id;
end;
$fn$;

-- Signing back in. Email only — see the header. Returns null if there is no such account,
-- which is what the app shows "we could not find that account" from.
create or replace function public.sign_in_student(p_email text)
returns text
language sql
security definer
set search_path = public, pg_temp
as $fn$
  select id from public.students
  where lower(email) = lower(trim(coalesce(p_email, '')))
  limit 1;
$fn$;

/* ------------------------------ profile writes ------------------------------ */

-- Everything the student can change about themselves, as one patch.
--
-- A patch rather than fifteen parameters, because the callers differ: onboarding step 2
-- sends only skills, the profile tab's Links section sends only links, and a photo
-- upload sends only `avatar_url`. A key that is absent — or explicitly null — leaves the
-- column alone. `resume` is the one field that can be cleared, by sending the string
-- 'null' in a `clear` array.
--
-- No fit score is written here and none can be: `fit_scores` is computed, never stored
-- (CLAUDE.md section 12, rule 4). This function only ever touches one row.
create or replace function public.save_student_profile(
  p_student_id text,
  p_patch      jsonb
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $fn$
declare
  v_clear text[] := coalesce(
    array(select jsonb_array_elements_text(p_patch->'clear')),
    '{}'::text[]
  );
begin
  if not exists (select 1 from public.students where id = p_student_id) then
    raise exception 'no student %', p_student_id;
  end if;

  update public.students set
    name         = coalesce(p_patch->>'name', name),
    initial      = coalesce(p_patch->>'initial', initial),
    email        = coalesce(p_patch->>'email', email),
    phone        = coalesce(p_patch->>'phone', phone),
    university   = coalesce(p_patch->>'university', university),
    degree       = coalesce(p_patch->>'degree', degree),
    field        = coalesce(p_patch->>'field', field),
    grad_year    = coalesce(p_patch->>'grad_year', grad_year),
    skills       = coalesce(p_patch->'skills', skills),
    projects     = coalesce(p_patch->'projects', projects),
    experience   = coalesce(p_patch->'experience', experience),
    education    = coalesce(p_patch->'education', education),
    preferences  = coalesce(p_patch->'preferences', preferences),
    links        = coalesce(p_patch->'links', links),
    avatar_url   = coalesce(p_patch->>'avatar_url', avatar_url),
    -- display facts the company dashboard reads off the same row
    gpa          = coalesce(p_patch->>'gpa', gpa),
    location     = coalesce(p_patch->>'location', location),
    year_label   = coalesce(p_patch->>'year_label', year_label),
    resume_file  = coalesce(p_patch->>'resume_file', resume_file),
    resume       = case
                     when 'resume' = any(v_clear) then null
                     else coalesce(p_patch->'resume', resume)
                   end
  where id = p_student_id;
end;
$fn$;

/* ----------------------------------- grants ----------------------------------- */

revoke all on function public.student_id_from_name(text) from public;
revoke all on function public.create_student(text, text) from public;
revoke all on function public.sign_in_student(text) from public;
revoke all on function public.save_student_profile(text, jsonb) from public;

-- `student_id_from_name` is an internal helper; only the two account functions and the
-- profile write are reachable from a client.
grant execute on function public.create_student(text, text) to anon, authenticated;
grant execute on function public.sign_in_student(text) to anon, authenticated;
grant execute on function public.save_student_profile(text, jsonb) to anon, authenticated;
