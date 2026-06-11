// POST /api/emailroi-event — lightweight funnel telemetry.
const { randomUUID } = require('node:crypto');
const { insert, readBody, isUuid } = require('./_supabase.js');

const ALLOWED = new Set(['started', 'completed', 'funnel_view', 'contact_submitted']);

module.exports = async (req, res) => {
  res.setHeader('cache-control', 'no-store');
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }
  const body = readBody(req);
  if (!ALLOWED.has(body.event_type)) {
    res.status(400).json({ error: 'bad_event' });
    return;
  }
  try {
    await insert('emailroi_events', {
      id: randomUUID(),
      session_id: isUuid(body.session_id) ? body.session_id : randomUUID(),
      event_type: body.event_type,
      metadata: body.metadata && typeof body.metadata === 'object' ? body.metadata : null,
    });
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: 'store_failed' });
  }
};
