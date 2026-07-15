-- Wholesome Empire — Private Treatment Path Assessment storage.
-- Anon-INSERT-only, following the emailroi_* convention. RLS controls WHICH
-- rows; GRANT controls WHETHER the statement runs — both are required. No
-- select/update/delete for anon: reads happen via service role / dashboard.

-- One row per completed assessment.
create table if not exists wholesome_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id uuid not null,
  responses jsonb not null,          -- full answer set
  computed jsonb not null,           -- branch, path, readiness, flags, tags, summary
  referrer text,
  utm_source text,
  user_agent_hash text
);
alter table wholesome_submissions enable row level security;
drop policy if exists "wholesome_submissions public insert" on wholesome_submissions;
create policy "wholesome_submissions public insert"
  on wholesome_submissions for insert to anon, authenticated with check (true);
grant insert on wholesome_submissions to anon;
create index if not exists wholesome_submissions_created_idx on wholesome_submissions (created_at desc);

-- Email opt-ins, linked to a submission. Split from submissions so every
-- endpoint stays a pure INSERT (no UPDATE policy needed).
create table if not exists wholesome_contacts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  submission_id uuid references wholesome_submissions(id),
  first_name text,
  email text not null,
  phone text,
  consent_to_outreach boolean not null default true,
  opt_in_sms boolean not null default false
);
alter table wholesome_contacts enable row level security;
drop policy if exists "wholesome_contacts public insert" on wholesome_contacts;
create policy "wholesome_contacts public insert"
  on wholesome_contacts for insert to anon, authenticated with check (true);
grant insert on wholesome_contacts to anon;
create index if not exists wholesome_contacts_created_idx on wholesome_contacts (created_at desc);

-- Funnel telemetry — one row per tracked event (start, step, contact, result).
create table if not exists wholesome_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id uuid not null,
  event_type text not null,
  metadata jsonb
);
alter table wholesome_events enable row level security;
drop policy if exists "wholesome_events public insert" on wholesome_events;
create policy "wholesome_events public insert"
  on wholesome_events for insert to anon, authenticated with check (true);
grant insert on wholesome_events to anon;
create index if not exists wholesome_events_session_idx on wholesome_events (session_id);
