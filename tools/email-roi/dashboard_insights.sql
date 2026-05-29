-- dashboard_emailroi_insights(): owner-run aggregate behind /api/metrics.
-- SECURITY DEFINER so it runs as the table owner and bypasses the anon
-- insert-only RLS, but returns ONLY counts and averages. No raw submission or
-- contact row is ever exposed. The anon key may execute it because the function
-- itself is the gate. Applied to Supabase project rbedklytopejtogpsefg.
create or replace function public.dashboard_emailroi_insights()
returns json
language sql
security definer
set search_path = public
stable
as $$
  select json_build_object(
    'total_submissions', (select count(*) from emailroi_submissions),
    'total_optins',      (select count(*) from emailroi_contacts),
    'avg_current_annual',   (select round(avg((computed->>'currentAnnual')::numeric), 0)
                               from emailroi_submissions where computed ? 'currentAnnual'),
    'avg_projected_annual', (select round(avg((computed->>'projectedAnnual')::numeric), 0)
                               from emailroi_submissions where computed ? 'projectedAnnual'),
    'avg_cadence_gap',      (select round(avg((computed->>'cadenceGap')::numeric), 0)
                               from emailroi_submissions where computed ? 'cadenceGap'),
    'by_band', coalesce((
      select json_agg(t order by t.sort) from (
        select s.computed->>'band' as band,
               case s.computed->>'band'
                 when 'dormant' then 'Dormant Asset'
                 when 'underused' then 'Underused List'
                 when 'healthy' then 'Healthy Earner'
                 when 'compounding' then 'Compounding Machine'
                 else initcap(coalesce(s.computed->>'band','unknown')) end           as name,
               case s.computed->>'band'
                 when 'dormant' then 1 when 'underused' then 2
                 when 'healthy' then 3 when 'compounding' then 4 else 5 end          as sort,
               count(*)                                                              as submissions,
               count(c.id)                                                          as optins,
               case when count(*) > 0
                    then round((count(c.id)::numeric / count(*)) * 100, 1)
                    else null end                                                   as optin_rate
        from emailroi_submissions s
        left join emailroi_contacts c on c.submission_id = s.id
        where s.computed ? 'band'
        group by s.computed->>'band'
      ) t
    ), '[]'::json),
    'intent', (
      select json_build_object(
        'opt_in_call',   count(*) filter (where opt_in_call),
        'opt_in_notify', count(*) filter (where opt_in_notify),
        'opt_in_list',   count(*) filter (where opt_in_list),
        'hot',           count(*) filter (where opt_in_call or consent_to_outreach)
      ) from emailroi_contacts
    ),
    'by_subscriber_band', coalesce((
      select json_agg(t order by t.sort) from (
        select case
                 when (responses->>'subscribers')::numeric < 1000 then 'under 1k'
                 when (responses->>'subscribers')::numeric < 5000 then '1k to 5k'
                 when (responses->>'subscribers')::numeric < 25000 then '5k to 25k'
                 else '25k plus' end                                                 as bucket,
               case
                 when (responses->>'subscribers')::numeric < 1000 then 1
                 when (responses->>'subscribers')::numeric < 5000 then 2
                 when (responses->>'subscribers')::numeric < 25000 then 3
                 else 4 end                                                          as sort,
               count(*)                                                             as submissions
        from emailroi_submissions
        where responses ? 'subscribers'
        group by 1, 2
      ) t
    ), '[]'::json),
    'funnel', (
      select json_build_object(
        'funnel_view',       count(*) filter (where event_type = 'funnel_view'),
        'started',           count(*) filter (where event_type = 'started'),
        'completed',         count(*) filter (where event_type = 'completed'),
        'contact_submitted', count(*) filter (where event_type = 'contact_submitted')
      ) from emailroi_events
    )
  );
$$;
revoke all on function public.dashboard_emailroi_insights() from public;
grant execute on function public.dashboard_emailroi_insights() to anon, authenticated, service_role;
