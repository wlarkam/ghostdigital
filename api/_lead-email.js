// Lead notification email for the Wholesome Empire assessment.
// Sent via Resend when someone completes the Restoration Map. The payload is
// client-supplied, so every field is clipped and HTML-escaped before use.
//
// Env (Vercel):
//   RESEND_API_KEY      Resend API key
//   LEAD_EMAIL_FROM     verified sender, e.g. "Restoration Map <leads@yourdomain.com>"
//   LEAD_EMAIL_TO       comma-separated recipients (clinic + Warren)
//   LEAD_EMAIL_TEST_TO  recipients for test runs (first name starting "test")

const clip = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : '');
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const list = (v) => (v || '').split(',').map((s) => s.trim()).filter(Boolean);

const isTest = (firstName) => /^test\b/i.test(firstName || '');

function recipients(firstName, env = process.env) {
  return isTest(firstName) ? list(env.LEAD_EMAIL_TEST_TO) : list(env.LEAD_EMAIL_TO);
}

function buildLeadEmail(p) {
  const name = clip(p.first_name, 120) || 'Someone';
  const email = clip(p.email, 200);
  const phone = clip(p.phone, 40);
  const lead = p.lead && typeof p.lead === 'object' ? p.lead : {};
  const path = clip(lead.path, 160);
  const stage = clip(lead.stage, 80);
  const pathId = clip(lead.path_id, 20);
  const summary = clip(lead.summary, 1500);
  const nextStep = clip(lead.next_step, 120);
  const flags = (Array.isArray(lead.flags) ? lead.flags : []).slice(0, 10).map((f) => clip(f, 120)).filter(Boolean);
  const answers = (Array.isArray(lead.answers) ? lead.answers : []).slice(0, 20)
    .map((a) => [clip(a && a[0], 200), clip(a && a[1], 300)]).filter(([q, a]) => q && a);

  const subject = `${isTest(name) ? '[TEST] ' : ''}New assessment: ${name}${path ? ` · ${path}` : ''}`;

  const row = (k, v) => (v ? `<tr><td style="padding:6px 16px 6px 0;color:#6b6b66;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:6px 0;color:#1b1b18">${v}</td></tr>` : '');
  const html = `<!doctype html><html><body style="margin:0;background:#f4f4f1;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55">
<div style="max-width:600px;margin:0 auto;padding:24px 16px">
<div style="background:#fff;border:1px solid #e3e3de;padding:24px">
<p style="margin:0 0 4px;color:#a46f55;font-weight:600">New Restoration Map lead</p>
<h1 style="margin:0 0 18px;font-size:22px;color:#404a3d">${esc(name)}${path ? ` · ${esc(path)}` : ''}</h1>
<table style="border-collapse:collapse;width:100%">
${row('Email', email ? `<a href="mailto:${esc(email)}" style="color:#404a3d">${esc(email)}</a>` : '')}
${row('Phone', phone ? `<a href="tel:${esc(phone.replace(/[^\d+]/g, ''))}" style="color:#404a3d">${esc(phone)}</a>` : 'Not given')}
${row('Best-fit path', esc(path))}
${row('Readiness', esc(stage))}
${row('Next step shown', esc(nextStep))}
${row('Path ID', esc(pathId))}
</table>
${summary ? `<h2 style="margin:22px 0 6px;font-size:16px;color:#404a3d">Summary</h2><p style="margin:0;color:#1b1b18">${esc(summary)}</p>` : ''}
${flags.length ? `<h2 style="margin:22px 0 6px;font-size:16px;color:#404a3d">Worth checking on the call</h2><ul style="margin:0;padding-left:20px">${flags.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}
${answers.length ? `<h2 style="margin:22px 0 6px;font-size:16px;color:#404a3d">Their answers</h2><table style="border-collapse:collapse;width:100%">${answers.map(([q, a]) => row(q, esc(a))).join('')}</table>` : ''}
<p style="margin:22px 0 0;color:#6b6b66;font-size:13px">Reply to this email to answer ${esc(name)} directly. They agreed to be contacted about their inquiry.</p>
</div></div></body></html>`;

  const text = [
    `New Restoration Map lead: ${name}`,
    email && `Email: ${email}`,
    `Phone: ${phone || 'Not given'}`,
    path && `Best-fit path: ${path}`,
    stage && `Readiness: ${stage}`,
    nextStep && `Next step shown: ${nextStep}`,
    pathId && `Path ID: ${pathId}`,
    summary && `\nSummary\n${summary}`,
    flags.length && `\nWorth checking on the call\n${flags.map((f) => `- ${f}`).join('\n')}`,
    answers.length && `\nTheir answers\n${answers.map(([q, a]) => `${q}: ${a}`).join('\n')}`,
    `\nReply to this email to answer ${name} directly.`,
  ].filter(Boolean).join('\n');

  return { subject, html, text, replyTo: email || undefined };
}

async function sendLeadEmail(p, env = process.env) {
  const to = recipients(p.first_name, env);
  if (!env.RESEND_API_KEY || !env.LEAD_EMAIL_FROM || !to.length) {
    return { sent: false, reason: 'not_configured' };
  }
  const { subject, html, text, replyTo } = buildLeadEmail(p);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: env.LEAD_EMAIL_FROM, to, subject, html, text, ...(replyTo ? { reply_to: replyTo } : {}) }),
      signal: ctrl.signal,
    });
    if (!r.ok) return { sent: false, reason: `resend_${r.status}`, detail: await r.text().catch(() => '') };
    return { sent: true, to: to.length };
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { buildLeadEmail, sendLeadEmail, recipients, isTest };
