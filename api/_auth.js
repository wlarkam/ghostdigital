// Shared session verification for Node serverless endpoints (defense in depth
// alongside the Edge middleware). CommonJS to match the other api/*.js files.
const crypto = require('node:crypto');

const COOKIE_NAME = 'dash_session';

// Verifies the HMAC-signed `<exp>.<sig>` cookie against SESSION_SECRET.
// Returns false (fail closed) if the secret is unset, the cookie is missing,
// malformed, expired, or the signature does not match.
function verifySession(req) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return false;
  const cookieHeader = req.headers.cookie || '';
  const match = cookieHeader.split(';').map((s) => s.trim())
    .find((s) => s.startsWith(COOKIE_NAME + '='));
  if (!match) return false;
  const value = decodeURIComponent(match.slice(COOKIE_NAME.length + 1));
  const [exp, sig] = value.split('.');
  if (!exp || !sig) return false;
  if (Date.now() > Number(exp)) return false;
  const expected = crypto.createHmac('sha256', secret).update(String(exp)).digest('hex');
  const a = Buffer.from(sig, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = { verifySession, COOKIE_NAME };
