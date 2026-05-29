// Shared Supabase REST helper for the Email List ROI calculator endpoints.
// The anon key is a publishable, RLS-protected key — safe to ship. Tables are
// anon-INSERT-only; reads happen via the service role / dashboard only.
const { createHash } = require('node:crypto');

const SUPABASE_URL = 'https://rbedklytopejtogpsefg.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZWRrbHl0b3BlanRvZ3BzZWZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NjUzNDcsImV4cCI6MjA5NTA0MTM0N30.7oyyT5SKVnqehnAS-Vud6UB0vwuQAK-Pt8SRdFyWrdA';

// PostgREST INSERT. return=minimal avoids a RETURNING * read-back that would
// hit RLS on an insert-only table. Caller supplies any id it needs.
async function insert(table, row) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(row),
  });
  if (!r.ok) {
    const detail = await r.text().catch(() => '');
    throw new Error(`supabase ${table} ${r.status}: ${detail}`);
  }
}

// PostgREST RPC read. Used by the dashboard to call SECURITY DEFINER aggregate
// functions, which run as owner and return only aggregates. No raw rows leak
// past insert-only RLS. Safe with the anon key because the function is the gate.
async function rpc(fn, args = {}) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(args),
  });
  if (!r.ok) {
    const detail = await r.text().catch(() => '');
    throw new Error(`supabase rpc ${fn} ${r.status}: ${detail}`);
  }
  return r.json();
}

function readBody(req) {
  let b = req.body;
  if (typeof b === 'string') {
    try { b = JSON.parse(b); } catch { b = {}; }
  }
  return b && typeof b === 'object' ? b : {};
}

function uaHash(req) {
  const ua = req.headers['user-agent'] || '';
  return createHash('sha256').update(ua).digest('hex').slice(0, 16);
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (v) => typeof v === 'string' && UUID_RE.test(v);

module.exports = { insert, rpc, readBody, uaHash, isUuid };
