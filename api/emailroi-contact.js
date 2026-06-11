// POST /api/emailroi-contact — records an email opt-in linked to a submission.
const { randomUUID } = require('node:crypto');
const { insert, readBody, isUuid } = require('./_supabase.js');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clip = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : null);

module.exports = async (req, res) => {
  res.setHeader('cache-control', 'no-store');
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }
  const body = readBody(req);
  const email = clip(body.email, 200);
  if (!email || !EMAIL_RE.test(email)) {
    res.status(400).json({ error: 'invalid_email' });
    return;
  }
  try {
    await insert('emailroi_contacts', {
      id: randomUUID(),
      submission_id: isUuid(body.submission_id) ? body.submission_id : null,
      email,
      name: clip(body.name, 120),
      business: clip(body.business, 200),
      opt_in_call: body.opt_in_call === true,
      opt_in_notify: body.opt_in_notify === true,
      opt_in_list: body.opt_in_list === true,
      consent_to_outreach: true,
    });
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: 'store_failed' });
  }
};
