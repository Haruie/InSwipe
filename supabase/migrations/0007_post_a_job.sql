-- InSwipe — posting a job.
--
-- "Post a Job" collected a role and then dropped it: there was no write path for a
-- new posting, only for pausing/duplicating an existing one. `create_job` closes
-- that — a new row in `jobs`, in the student deck immediately, same as any seeded
-- posting.
--
-- Additive: one new function, no change to any table, policy or existing function.

create or replace function public.create_job(
  p_company_id       text,
  p_title            text,
  p_department       text default '',
  p_location         text default '',
  p_work_mode        text default 'Hybrid',
  p_stipend          int default 0,
  p_about            text default '',
  p_required_skills  text[] default '{}',
  p_preferred_skills text[] default '{}',
  p_employment_type  text default 'Internship',
  p_duration_months  int default 3,
  p_deadline         text default ''
)
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
  if coalesce(btrim(p_title), '') = '' then
    raise exception 'a job title is required';
  end if;
  if not exists (select 1 from public.companies where id = p_company_id) then
    raise exception 'unknown company %', p_company_id;
  end if;

  -- id from company + title, e.g. 'technova-frontend-engineering-intern'
  v_base := regexp_replace(lower(btrim(p_title)), '[^a-z0-9]+', '-', 'g');
  v_base := btrim(v_base, '-');
  if v_base = '' then v_base := 'job'; end if;
  v_base := left(p_company_id || '-' || v_base, 60);

  v_id := v_base;
  while exists (select 1 from public.jobs where id = v_id) loop
    v_id := v_base || '-' || v_n;
    v_n := v_n + 1;
  end loop;

  insert into public.jobs (
    id, company_id, title, role_category, location, work_mode, duration_months, stipend,
    about, responsibilities, required_skills, preferred_skills, department,
    employment_type, status, posted, deadline, in_student_deck, sort_order
  )
  values (
    v_id,
    p_company_id,
    btrim(p_title),
    coalesce(nullif(btrim(p_department), ''), 'General'),
    coalesce(nullif(btrim(p_location), ''), 'Remote'),
    case when p_work_mode in ('Remote', 'Hybrid', 'On-site') then p_work_mode else 'Hybrid' end,
    greatest(coalesce(p_duration_months, 3), 1),
    greatest(coalesce(p_stipend, 0), 0),
    coalesce(p_about, ''),
    '{}',
    coalesce(p_required_skills, '{}'),
    coalesce(p_preferred_skills, '{}'),
    coalesce(nullif(btrim(p_department), ''), 'General'),
    coalesce(nullif(btrim(p_employment_type), ''), 'Internship'),
    'Active',
    'Just now',
    coalesce(nullif(btrim(p_deadline), ''), 'Rolling'),
    true,
    (select coalesce(max(sort_order), 0) + 1 from public.jobs where company_id = p_company_id)
  );

  return v_id;
end;
$fn$;

revoke all on function public.create_job(text, text, text, text, text, int, text, text[], text[], text, int, text) from public;
grant execute on function public.create_job(text, text, text, text, text, int, text, text[], text[], text, int, text) to anon, authenticated;
