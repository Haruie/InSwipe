-- InSwipe — row-level security and the write API.
--
-- The demo has no authentication (deliberately, for now). Rather than leave the
-- tables open, reads are public and every write goes through a security-definer
-- function below. That keeps the selection gate impossible to bypass from a client:
-- there is no path from either app to `conversations` except `select_candidate()`.

/* ------------------------------- read access ------------------------------- */

alter table public.companies     enable row level security;
alter table public.recruiters    enable row level security;
alter table public.students      enable row level security;
alter table public.jobs          enable row level security;
alter table public.swipes        enable row level security;
alter table public.applications  enable row level security;
alter table public.selections    enable row level security;
alter table public.conversations enable row level security;
alter table public.messages      enable row level security;
alter table public.notifications enable row level security;

do $do$
declare
  t text;
begin
  foreach t in array array[
    'companies', 'recruiters', 'students', 'jobs', 'swipes',
    'applications', 'selections', 'conversations', 'messages', 'notifications'
  ]
  loop
    execute format('drop policy if exists demo_read on public.%I', t);
    execute format(
      'create policy demo_read on public.%I for select to anon, authenticated using (true)', t
    );
  end loop;
end
$do$;

-- No insert/update/delete policies exist. Direct writes from a client are refused;
-- the functions below run as the definer and are the only write path.

/* -------------------------------- student side -------------------------------- */

-- A right swipe. Idempotent: applying twice returns the existing application.
create or replace function public.apply_to_job(
  p_student_id text,
  p_job_id     text,
  p_note       text default null,
  p_note_ai    boolean default false,
  p_fit        int default 0
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $fn$
declare
  v_existing   uuid;
  v_id         uuid;
  v_order      int;
  v_student    public.students%rowtype;
  v_job        public.jobs%rowtype;
  v_held       text[];
  v_met        text[];
  v_missing    text[];
  v_first      text;
  v_summary    text;
  v_prefs      jsonb;
begin
  select id into v_existing
  from public.applications
  where student_id = p_student_id and job_id = p_job_id;
  if v_existing is not null then
    return v_existing;
  end if;

  select * into v_student from public.students where id = p_student_id;
  if not found then
    raise exception 'Unknown student %', p_student_id;
  end if;

  select * into v_job from public.jobs where id = p_job_id;
  if not found then
    raise exception 'Unknown job %', p_job_id;
  end if;

  -- Everything a student claims, plus everything their projects actually use. The
  -- fit engine treats project tech as evidence; the summary should read the same way.
  select array_agg(distinct lower(v)) into v_held
  from (
    select jsonb_array_elements_text(jsonb_path_query_array(v_student.skills, '$[*].name')) as v
    union all
    select jsonb_array_elements_text(jsonb_path_query_array(v_student.projects, '$[*].tech[*]')) as v
  ) q;
  v_held := coalesce(v_held, '{}');

  select coalesce(array_agg(s), '{}') into v_met
  from unnest(v_job.required_skills) s
  where lower(s) = any (v_held);

  select coalesce(array_agg(s), '{}') into v_missing
  from unnest(v_job.required_skills) s
  where not (lower(s) = any (v_held));

  v_first := split_part(v_student.name, ' ', 1);
  v_prefs := v_student.preferences;

  -- An AI resume summary written against THIS job's requirements (CLAUDE.md section 7).
  -- Until the model is wired up, it is generated from the same evidence the fit score
  -- reads, so it can never disagree with the rows beneath it.
  v_summary :=
    format(
      'Read against this role: %s evidences %s of %s required skills%s.',
      v_first,
      cardinality(v_met),
      cardinality(v_job.required_skills),
      case when cardinality(v_met) > 0 then ' (' || array_to_string(v_met, ', ') || ')' else '' end
    )
    || case
         when cardinality(v_missing) > 0
           then format(' %s is not evidenced anywhere in the profile — worth probing in the screen.',
                       array_to_string(v_missing, ', '))
         else ' No required skill is missing.'
       end
    || format(' %s projects and %s prior role(s) on the profile.',
              jsonb_array_length(v_student.projects),
              jsonb_array_length(v_student.experience));

  select coalesce(max(applied_order), 0) + 1 into v_order
  from public.applications where student_id = p_student_id;

  insert into public.applications (
    student_id, job_id, status, stage, note, note_ai_drafted, resume_file,
    fit_snapshot, applied_label, applied_order, timeline,
    availability, preference_notes, resume_summary
  )
  values (
    p_student_id, p_job_id, 'applied', 'Applied',
    nullif(btrim(coalesce(p_note, '')), ''),
    p_note_ai and nullif(btrim(coalesce(p_note, '')), '') is not null,
    v_student.resume ->> 'filename',
    p_fit, 'Applied just now', v_order,
    jsonb_build_array(jsonb_build_object('status', 'applied', 'date', 'Just now')),
    format('%s months · Full-time', coalesce((v_prefs ->> 'durationMonths')::int, v_job.duration_months)),
    array_remove(array[
      nullif(concat_ws(' or ',
        nullif((v_prefs -> 'locations' ->> 0), ''),
        nullif((v_prefs ->> 'workMode'), '')), ''),
      nullif(array_to_string(
        array(select jsonb_array_elements_text(coalesce(v_prefs -> 'roles', '[]'::jsonb))), ', '), '')
    ], null),
    v_summary
  )
  returning id into v_id;

  -- Applying clears any earlier pass or star on the same job.
  delete from public.swipes where student_id = p_student_id and job_id = p_job_id;

  return v_id;
end;
$fn$;

create or replace function public.pass_job(p_student_id text, p_job_id text)
returns void
language sql
security definer
set search_path = public, pg_temp
as $fn$
  insert into public.swipes (student_id, job_id, action)
  values (p_student_id, p_job_id, 'passed')
  on conflict (student_id, job_id, action) do nothing;
$fn$;

create or replace function public.set_saved(p_student_id text, p_job_id text, p_saved boolean)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $fn$
begin
  if p_saved then
    insert into public.swipes (student_id, job_id, action)
    values (p_student_id, p_job_id, 'saved')
    on conflict (student_id, job_id, action) do nothing;
  else
    delete from public.swipes
    where student_id = p_student_id and job_id = p_job_id and action = 'saved';
  end if;
  return p_saved;
end;
$fn$;

create or replace function public.mark_notifications_read(p_student_id text)
returns void
language sql
security definer
set search_path = public, pg_temp
as $fn$
  update public.notifications set unread = false where student_id = p_student_id;
$fn$;

/* -------------------------------- company side -------------------------------- */

create or replace function public.set_application_stage(p_application_id uuid, p_stage text)
returns void
language sql
security definer
set search_path = public, pg_temp
as $fn$
  update public.applications
  set stage  = p_stage,
      status = case
                 when p_stage = 'Applied' then status
                 when p_stage = 'Reviewed' and status = 'applied' then 'reviewing'
                 else status
               end
  where id = p_application_id;
$fn$;

-- THE GATE. The only way a conversation comes into existence.
--
-- One transaction: the application flips to selected, a `selections` row is written,
-- a conversation hangs off that row, and the company's opening message lands in it.
-- Calling it twice returns the conversation that already exists.
create or replace function public.select_candidate(
  p_application_id uuid,
  p_recruiter_id   text default null,
  p_message        text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $fn$
declare
  v_app          public.applications%rowtype;
  v_job          public.jobs%rowtype;
  v_company      public.companies%rowtype;
  v_student      public.students%rowtype;
  v_selection_id uuid;
  v_conv_id      uuid;
  v_message      text;
  v_first        text;
  v_project      text;
begin
  select * into v_app from public.applications where id = p_application_id for update;
  if not found then
    raise exception 'Unknown application %', p_application_id;
  end if;

  select id into v_selection_id from public.selections where application_id = p_application_id;
  if v_selection_id is not null then
    select id into v_conv_id from public.conversations where selection_id = v_selection_id;
    return v_conv_id;
  end if;

  select * into v_job     from public.jobs      where id = v_app.job_id;
  select * into v_company from public.companies where id = v_job.company_id;
  select * into v_student from public.students  where id = v_app.student_id;

  update public.applications
  set status   = 'selected',
      stage    = 'In Conversation',
      timeline = timeline || jsonb_build_array(jsonb_build_object(
        'status', 'selected',
        'date',   'Just now',
        'detail', format('%s selected you.', v_company.name)
      ))
  where id = p_application_id;

  insert into public.selections (application_id, student_id, job_id, company_id, selected_by)
  values (p_application_id, v_app.student_id, v_app.job_id, v_job.company_id, p_recruiter_id)
  returning id into v_selection_id;

  insert into public.conversations (selection_id)
  values (v_selection_id)
  returning id into v_conv_id;

  v_first   := split_part(v_student.name, ' ', 1);
  v_project := v_student.projects -> 0 ->> 'name';

  v_message := coalesce(
    nullif(btrim(coalesce(p_message, '')), ''),
    format(
      'Hi %s — we went through your application for %s and %s. We would like to set up a short call this week. Does Thursday or Friday afternoon work for you?',
      v_first,
      v_job.title,
      case
        when v_project is not null
          then 'were impressed by ' || btrim(split_part(v_project, '—', 1))
        else 'liked what we saw in your profile'
      end
    )
  );

  insert into public.messages (conversation_id, from_company, body, read_by_company)
  values (v_conv_id, true, v_message, true);

  insert into public.notifications (student_id, kind, title, body, time_label, group_label, unread, sort_order)
  values (
    v_app.student_id,
    'selected',
    format('You have been selected by %s', v_company.name),
    format('%s selected you for %s. Open the chat to respond.', v_company.name, v_job.title),
    'Just now', 'Today', true,
    (select coalesce(max(sort_order), 0) + 1 from public.notifications where student_id = v_app.student_id)
  );

  return v_conv_id;
end;
$fn$;

/* ---------------------------------- messaging ---------------------------------- */

create or replace function public.send_message(
  p_conversation_id uuid,
  p_from_company    boolean,
  p_body            text
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $fn$
declare
  v_id uuid;
begin
  if btrim(coalesce(p_body, '')) = '' then
    raise exception 'A message needs a body';
  end if;

  insert into public.messages (conversation_id, from_company, body, read_by_company, read_by_student)
  values (p_conversation_id, p_from_company, btrim(p_body), p_from_company, not p_from_company)
  returning id into v_id;

  return v_id;
end;
$fn$;

create or replace function public.mark_conversation_read(p_conversation_id uuid, p_as_company boolean)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $fn$
begin
  if p_as_company then
    update public.messages set read_by_company = true
    where conversation_id = p_conversation_id and not from_company;
  else
    update public.messages set read_by_student = true
    where conversation_id = p_conversation_id and from_company;
  end if;
end;
$fn$;

-- Posting admin. Pausing a job pulls it out of every student's deck, which is why this
-- is a database write and not a piece of dashboard state.
create or replace function public.set_job_status(p_job_id text, p_status text)
returns void
language sql
security definer
set search_path = public, pg_temp
as $fn$
  update public.jobs set status = p_status where id = p_job_id;
$fn$;

create or replace function public.duplicate_job(p_job_id text)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $fn$
declare
  v_new_id text;
begin
  v_new_id := p_job_id || '-copy-' || to_char(clock_timestamp(), 'YYYYMMDDHH24MISS');

  insert into public.jobs (
    id, company_id, title, role_category, location, work_mode, duration_months, stipend,
    about, responsibilities, required_skills, preferred_skills, department,
    employment_type, status, posted, deadline, in_student_deck, sort_order
  )
  select
    v_new_id, company_id, title || ' (Copy)', role_category, location, work_mode,
    duration_months, stipend, about, responsibilities, required_skills, preferred_skills,
    department, employment_type, 'Paused', 'Just now', deadline, false, sort_order + 100
  from public.jobs
  where id = p_job_id;

  return v_new_id;
end;
$fn$;

/* ----------------------------------- grants ----------------------------------- */

revoke all on function public.apply_to_job(text, text, text, boolean, int) from public;
revoke all on function public.pass_job(text, text) from public;
revoke all on function public.set_saved(text, text, boolean) from public;
revoke all on function public.mark_notifications_read(text) from public;
revoke all on function public.set_application_stage(uuid, text) from public;
revoke all on function public.select_candidate(uuid, text, text) from public;
revoke all on function public.send_message(uuid, boolean, text) from public;
revoke all on function public.mark_conversation_read(uuid, boolean) from public;
revoke all on function public.set_job_status(text, text) from public;
revoke all on function public.duplicate_job(text) from public;

grant execute on function public.apply_to_job(text, text, text, boolean, int) to anon, authenticated;
grant execute on function public.pass_job(text, text) to anon, authenticated;
grant execute on function public.set_saved(text, text, boolean) to anon, authenticated;
grant execute on function public.mark_notifications_read(text) to anon, authenticated;
grant execute on function public.set_application_stage(uuid, text) to anon, authenticated;
grant execute on function public.select_candidate(uuid, text, text) to anon, authenticated;
grant execute on function public.send_message(uuid, boolean, text) to anon, authenticated;
grant execute on function public.mark_conversation_read(uuid, boolean) to anon, authenticated;
grant execute on function public.set_job_status(text, text) to anon, authenticated;
grant execute on function public.duplicate_job(text) to anon, authenticated;
