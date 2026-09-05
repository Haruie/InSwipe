-- InSwipe — demo schema.
--
-- Supabase owns runtime data. `packages/core` keeps the domain types and the fit
-- engine; nothing in here computes a fit score, because both products derive that
-- from the profile and the job (CLAUDE.md section 5).
--
-- The one rule the product hangs on — CLAUDE.md section 3, rule 2: a conversation
-- cannot exist without a selection. That is enforced below by a NOT NULL foreign
-- key from `conversations` to `selections`, not by application code.

/* ------------------------------- catalogue ------------------------------- */

create table if not exists public.companies (
  id          text primary key,
  name        text not null,
  initial     text not null,
  color       text not null default '#4F46E5',
  gradient    text not null default '',
  cover_url   text not null default '',
  verified    boolean not null default false,
  tagline     text not null default '',
  about       text not null default '',
  industry    text not null default '',
  size        text not null default '',
  founded     text not null default '',
  location    text not null default '',
  website     text not null default '',
  culture     text[] not null default '{}',
  stack       text[] not null default '{}',
  team        jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now()
);

-- `create table if not exists` cannot add a column to a table that already exists,
-- so columns added after the first release are also stated as an alter. Both apps
-- read `cover_url` as the image on a job card; it holds a path the apps serve
-- (`/covers/<id>.svg`, written by scripts/covers.mjs) and a company that later
-- uploads a photo of its own just replaces the value.
alter table public.companies add column if not exists cover_url text not null default '';

create table if not exists public.recruiters (
  id          text primary key,
  company_id  text not null references public.companies(id) on delete cascade,
  name        text not null,
  initials    text not null,
  role        text not null default ''
);

create table if not exists public.students (
  id           text primary key,
  name         text not null,
  initial      text not null,
  email        text not null,
  phone        text not null default '',
  university   text not null default '',
  degree       text not null default '',
  field        text not null default '',
  grad_year    text not null default '',
  -- the shared @inswipe/core shapes, stored verbatim so both apps read one profile
  skills       jsonb not null default '[]'::jsonb,
  projects     jsonb not null default '[]'::jsonb,
  experience   jsonb not null default '[]'::jsonb,
  education    jsonb not null default '{}'::jsonb,
  preferences  jsonb not null default '{}'::jsonb,
  resume       jsonb,
  links        jsonb not null default '{}'::jsonb,
  -- display facts the company dashboard shows that the profile itself does not carry
  avatar_color text not null default '#EEF0FF',
  gpa          text not null default '',
  location     text not null default '',
  year_label   text not null default '',
  resume_file  text not null default '',
  created_at   timestamptz not null default now()
);

create table if not exists public.jobs (
  id               text primary key,
  company_id       text not null references public.companies(id) on delete cascade,
  title            text not null,
  role_category    text not null default '',
  location         text not null default '',
  work_mode        text not null check (work_mode in ('Remote', 'Hybrid', 'On-site')),
  duration_months  int not null default 3,
  stipend          int not null default 0,
  about            text not null default '',
  responsibilities text[] not null default '{}',
  required_skills  text[] not null default '{}',
  preferred_skills text[] not null default '{}',
  -- listing metadata only the company dashboard renders
  department       text not null default '',
  employment_type  text not null default '',
  status           text not null default 'Active' check (status in ('Active', 'Paused', 'Closed')),
  posted           text not null default '',
  deadline         text not null default '',
  -- whether this posting enters student discovery decks
  in_student_deck  boolean not null default false,
  sort_order       int not null default 0,
  created_at       timestamptz not null default now()
);

create index if not exists jobs_company_id_idx on public.jobs (company_id);

/* -------------------------------- activity -------------------------------- */

-- Left swipes and stars. A right swipe becomes a row in `applications`.
create table if not exists public.swipes (
  id         uuid primary key default gen_random_uuid(),
  student_id text not null references public.students(id) on delete cascade,
  job_id     text not null references public.jobs(id) on delete cascade,
  action     text not null check (action in ('passed', 'saved')),
  created_at timestamptz not null default now(),
  unique (student_id, job_id, action)
);

create table if not exists public.applications (
  id               uuid primary key default gen_random_uuid(),
  student_id       text not null references public.students(id) on delete cascade,
  job_id           text not null references public.jobs(id) on delete cascade,
  status           text not null default 'applied'
                   check (status in ('applied', 'reviewing', 'shortlisted', 'selected', 'rejected')),
  -- the company-side pipeline column; the student never sees this
  stage            text not null default 'Applied'
                   check (stage in ('Applied', 'Reviewed', 'Selected', 'In Conversation', 'Interview', 'Offer', 'Hired')),
  note             text,
  note_ai_drafted  boolean not null default false,
  resume_file      text,
  fit_snapshot     int not null default 0,
  applied_label    text not null default 'Applied just now',
  applied_order    int not null default 0,
  timeline         jsonb not null default '[]'::jsonb,
  -- what the recruiter reads alongside the profile
  availability     text not null default '',
  preference_notes text[] not null default '{}',
  resume_summary   text not null default '',
  created_at       timestamptz not null default now(),
  unique (student_id, job_id)
);

create index if not exists applications_job_id_idx on public.applications (job_id);
create index if not exists applications_student_id_idx on public.applications (student_id);

/* -------------------------------- the gate -------------------------------- */

-- A company selecting a student, scoped to one job. This row is what unlocks a
-- conversation, and nothing else may create one.
create table if not exists public.selections (
  id             uuid primary key default gen_random_uuid(),
  application_id uuid not null unique references public.applications(id) on delete cascade,
  student_id     text not null references public.students(id) on delete cascade,
  job_id         text not null references public.jobs(id) on delete cascade,
  company_id     text not null references public.companies(id) on delete cascade,
  selected_by    text references public.recruiters(id) on delete set null,
  created_at     timestamptz not null default now()
);

-- CLAUDE.md section 3, rule 2. `selection_id` is NOT NULL and unique: no selection,
-- no conversation — enforced by the database, not by either client.
create table if not exists public.conversations (
  id           uuid primary key default gen_random_uuid(),
  selection_id uuid not null unique references public.selections(id) on delete cascade,
  created_at   timestamptz not null default now()
);

create table if not exists public.messages (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references public.conversations(id) on delete cascade,
  from_company     boolean not null,
  body             text not null,
  read_by_student  boolean not null default false,
  read_by_company  boolean not null default false,
  created_at       timestamptz not null default now()
);

create index if not exists messages_conversation_id_idx on public.messages (conversation_id, created_at);

-- CLAUDE.md section 3, rule 3: the company sends the first message. Students cannot
-- open a thread, so the first row in any conversation must come from the company.
create or replace function public.enforce_company_opens_thread()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $fn$
begin
  if not new.from_company
     and not exists (select 1 from public.messages m where m.conversation_id = new.conversation_id)
  then
    raise exception 'The company sends the first message in a conversation (%)', new.conversation_id
      using errcode = 'check_violation';
  end if;
  return new;
end;
$fn$;

drop trigger if exists messages_company_opens_thread on public.messages;
create trigger messages_company_opens_thread
  before insert on public.messages
  for each row execute function public.enforce_company_opens_thread();

/* ------------------------------ notifications ------------------------------ */

create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  student_id  text not null references public.students(id) on delete cascade,
  kind        text not null check (kind in ('selected', 'message', 'status', 'view', 'matches')),
  title       text not null,
  body        text not null default '',
  time_label  text not null default 'Just now',
  group_label text not null default 'Today',
  unread      boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists notifications_student_id_idx on public.notifications (student_id);
