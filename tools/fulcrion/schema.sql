-- Engineering Team Health Scorecard — storage for Fulcrion.
-- Applied to Supabase project rbedklytopejtogpsefg.
-- Anon-INSERT-only: the publishable anon key may INSERT, nothing else. Reads
-- happen via the service role / dashboard or the SECURITY DEFINER aggregate
-- below. Splitting submissions vs contacts keeps every endpoint a pure INSERT.

-- ---------- submissions: one row per completion ----------
create table if not exists fulcrion_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id uuid not null,
  responses jsonb not null,   -- { ts1:0..3, ts2:..., ... } raw answers
  computed jsonb not null,    -- { overall, band, dimensions, statuses, bindingConstraint }
  referrer text,
  user_agent_hash text
);
alter table fulcrion_submissions enable row level security;
drop policy if exists "fulcrion_submissions public insert" on fulcrion_submissions;
create policy "fulcrion_submissions public insert"
  on fulcrion_submissions for insert to public with check (true);
grant insert on fulcrion_submissions to anon;
-- editorial cross-tab indexes
create index if not exists fulcrion_submissions_band_idx
  on fulcrion_submissions ((computed->>'band'));
create index if not exists fulcrion_submissions_binding_idx
  on fulcrion_submissions ((computed->>'bindingConstraint'));

-- ---------- contacts: email opt-ins, linked to a submission ----------
create table if not exists fulcrion_contacts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  submission_id uuid references fulcrion_submissions(id),
  email text not null,
  name text,
  company text,
  opt_in_call boolean not null default false,
  opt_in_notify boolean not null default false,
  opt_in_list boolean not null default false,
  consent_to_outreach boolean not null default true
);
alter table fulcrion_contacts enable row level security;
drop policy if exists "fulcrion_contacts public insert" on fulcrion_contacts;
create policy "fulcrion_contacts public insert"
  on fulcrion_contacts for insert to public with check (true);
grant insert on fulcrion_contacts to anon;

-- ---------- events: funnel telemetry ----------
create table if not exists fulcrion_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id uuid not null,
  event_type text not null,
  metadata jsonb
);
alter table fulcrion_events enable row level security;
drop policy if exists "fulcrion_events public insert" on fulcrion_events;
create policy "fulcrion_events public insert"
  on fulcrion_events for insert to public with check (true);
grant insert on fulcrion_events to anon;

-- ---------- owner-run aggregate (SECURITY DEFINER) ----------
-- Returns ONLY counts and averages. No raw submission or contact row is ever
-- exposed; the function itself is the gate, so the anon key may execute it.
create or replace function public.dashboard_fulcrion_insights()
returns json
language sql
security definer
set search_path = public
stable
as $$
  select json_build_object(
    'total_submissions', (select count(*) from fulcrion_submissions),
    'total_optins',      (select count(*) from fulcrion_contacts),
    'avg_overall',       (select round(avg((computed->>'overall')::numeric), 1)
                            from fulcrion_submissions where computed ? 'overall'),
    'by_band', coalesce((
      select json_agg(t order by t.sort) from (
        select s.computed->>'band' as band,
               case s.computed->>'band'
                 when 'in_it' then 'In the Ceiling'
                 when 'approaching' then 'Approaching the Wall'
                 when 'through' then 'Through the Wall'
                 else initcap(coalesce(s.computed->>'band','unknown')) end          as name,
               case s.computed->>'band'
                 when 'in_it' then 1 when 'approaching' then 2 when 'through' then 3
                 else 4 end                                                         as sort,
               count(*)                                                            as submissions,
               count(c.id)                                                         as optins,
               case when count(*) > 0
                    then round((count(c.id)::numeric / count(*)) * 100, 1)
                    else null end                                                  as optin_rate
        from fulcrion_submissions s
        left join fulcrion_contacts c on c.submission_id = s.id
        where s.computed ? 'band'
        group by s.computed->>'band'
      ) t
    ), '[]'::json),
    'by_binding_constraint', coalesce((
      select json_agg(t order by t.submissions desc) from (
        select computed->>'bindingConstraint' as dimension, count(*) as submissions
        from fulcrion_submissions
        where computed ? 'bindingConstraint'
        group by 1
      ) t
    ), '[]'::json),
    'intent', (
      select json_build_object(
        'opt_in_call',   count(*) filter (where opt_in_call),
        'opt_in_notify', count(*) filter (where opt_in_notify),
        'opt_in_list',   count(*) filter (where opt_in_list),
        'hot',           count(*) filter (where opt_in_call or consent_to_outreach)
      ) from fulcrion_contacts
    ),
    'funnel', (
      select json_build_object(
        'funnel_view',       count(*) filter (where event_type = 'funnel_view'),
        'started',           count(*) filter (where event_type = 'started'),
        'completed',         count(*) filter (where event_type = 'completed'),
        'contact_submitted', count(*) filter (where event_type = 'contact_submitted')
      ) from fulcrion_events
    )
  );
$$;
revoke all on function public.dashboard_fulcrion_insights() from public;
grant execute on function public.dashboard_fulcrion_insights() to anon, authenticated, service_role;
