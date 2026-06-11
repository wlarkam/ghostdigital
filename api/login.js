// POST /api/login: Node serverless runtime (node:crypto). CommonJS.
// Body: { "password": "..." }. On match, sets an HMAC-signed session cookie.
// Env: DASHBOARD_PASSWORD_HASH (sha256 hex of the password), SESSION_SECRET (32+ byte hex).
const crypto = require('node:crypto');
const { COOKIE_NAME } = require('./_auth.js');

const SESSION_DAYS = 7;
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 60_000;
const attempts = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const list = (attempts.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  list.push(now);
  attempts.set(ip, list);
  return list.length > MAX_ATTEMPTS;
}

function timingSafeEqualStr(a, b) {
  const ab = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

module.exports = async (req, res) => {
  res.setHeader('cache-control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('allow', 'POST');
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || (req.socket && req.socket.remoteAddress) || 'unknown';
  if (rateLimited(ip)) { res.status(429).json({ error: 'rate_limited' }); return; }

  const hash = process.env.DASHBOARD_PASSWORD_HASH;
  const secret = process.env.SESSION_SECRET;
  if (!hash || !secret) { res.status(500).json({ error: 'auth_not_configured' }); return; }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const password = body && body.password;
  if (!password || typeof password !== 'string') {
    res.status(400).json({ error: 'password_required' });
    return;
  }

  const candidate = crypto.createHash('sha256').update(password).digest('hex');
  if (!timingSafeEqualStr(candidate, hash)) {
    res.status(401).json({ error: 'invalid_password' });
    return;
  }

  const exp = Date.now() + SESSION_DAYS * 86400_000;
  const sig = crypto.createHmac('sha256', secret).update(String(exp)).digest('hex');
  res.setHeader('set-cookie',
    `${COOKIE_NAME}=${exp}.${sig}; Max-Age=${SESSION_DAYS * 86400}; Path=/; HttpOnly; Secure; SameSite=Lax`);
  res.status(200).json({ ok: true });
};
