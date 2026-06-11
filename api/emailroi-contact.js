// POST /api/emailroi-contact — records an email opt-in linked to a submission,
// then best-effort enrolls the contact in the Kit FOMO sales sequence.
const { randomUUID } = require('node:crypto');
const { insert, readBody, isUuid } = require('./_supabase.js');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clip = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : null);

// Kit (ConvertKit) v4 — "Email List ROI Calculator — FOMO Sales Sequence".
const KIT_SEQUENCE_ID = 2774906;
const KIT_API_BASE = 'https://api.kit.com/v4';

// POST to Kit v4 with the API key header and a short timeout so a slow or down
// Kit can never hang this request. Throws on non-2xx so the caller can log it.
async function kitPost(path, payload, apiKey) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 4000);
  try {
    const r = await fetch(`${KIT_API_BASE}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'X-Kit-Api-Key': apiKey },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    if (!r.ok) {
      throw new Error(`kit ${path} ${r.status}: ${(await r.text()).slice(0, 300)}`);
    }
  } finally {
    clearTimeout(t);
  }
}

// Upsert the subscriber, then add them to the sequence (the add-to-sequence
// endpoint requires the subscriber to already exist). Best-effort: any failure
// is logged and swallowed so the Supabase capture stays the source of truth.
async function enrollInKit(email, firstName) {
  const apiKey = process.env.KIT_API_KEY;
  if (!apiKey) return; // not configured yet — skip silently
  try {
    await kitPost('/subscribers', { email_address: email, first_name: firstName, state: 'active' }, apiKey);
    await kitPost(`/sequences/${KIT_SEQUENCE_ID}/subscribers`, { email_address: email }, apiKey);
  } catch (err) {
    console.error('kit_enroll_failed', err);
  }
}

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
  const name = clip(body.name, 120);
  try {
    await insert('emailroi_contacts', {
      id: randomUUID(),
      submission_id: isUuid(body.submission_id) ? body.submission_id : null,
      email,
      name,
      business: clip(body.business, 200),
      opt_in_call: body.opt_in_call === true,
      opt_in_notify: body.opt_in_notify === true,
      opt_in_list: body.opt_in_list === true,
      consent_to_outreach: true,
    });
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: 'store_failed' });
    return;
  }
  // Capture is safe at this point; Kit enrollment is a best-effort add-on.
  await enrollInKit(email, name);
  res.status(200).json({ ok: true });
};
