// POST /api/wholesome-submit — records one completed assessment.
const { randomUUID } = require('node:crypto');
const { insert, readBody, uaHash, isUuid } = require('./_supabase.js');

module.exports = async (req, res) => {
  res.setHeader('cache-control', 'no-store');
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }
  const body = readBody(req);
  const sessionId = isUuid(body.session_id) ? body.session_id : randomUUID();
  if (!body.responses || !body.computed) {
    res.status(400).json({ error: 'missing_payload' });
    return;
  }
  const id = randomUUID();
  try {
    await insert('wholesome_submissions', {
      id,
      session_id: sessionId,
      responses: body.responses,
      computed: body.computed,
      referrer: typeof body.referrer === 'string' ? body.referrer.slice(0, 500) : null,
      utm_source: typeof body.utm_source === 'string' ? body.utm_source.slice(0, 120) : null,
      user_agent_hash: uaHash(req),
    });
    res.status(200).json({ id, session_id: sessionId });
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: 'store_failed' });
  }
};
