// POST /api/wholesome-contact — records a contact opt-in linked to a submission.
//
// NOTE: Unlike emailroi-contact, this does NOT enroll in Kit. The connected Kit
// account is Warren's personal list — client (Wholesome Empire) leads must not
// be written there. Supabase is the source of truth; clinic notification / the
// clinic's own CRM is a separate integration. [TODO: clinic notify hook]
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
    await insert('wholesome_contacts', {
      id: randomUUID(),
      submission_id: isUuid(body.submission_id) ? body.submission_id : null,
      first_name: clip(body.first_name, 120),
      email,
      phone: clip(body.phone, 40),
      opt_in_sms: body.opt_in_sms === true,
      consent_to_outreach: true,
    });
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: 'store_failed' });
  }
};
