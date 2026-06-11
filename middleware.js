// Vercel Edge Middleware: gates /dashboard behind a signed session cookie.
// Runs in the EDGE runtime, so Web Crypto only, never node:crypto.
// Only the dashboard page routes are matched here. The public landing page,
// /email-roi-calculator, /swipe-file and the emailroi capture endpoints are
// untouched. /api/metrics gates itself in the Node runtime (api/metrics.js).
export const config = {
  matcher: ['/dashboard', '/dashboard.html', '/dashboard/:path*'],
};

const COOKIE_NAME = 'dash_session';

function hexToBytes(hex) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
}

async function verify(cookieValue, secret) {
  if (!cookieValue || !secret) return false;
  const [exp, sig] = cookieValue.split('.');
  if (!exp || !sig) return false;
  if (Date.now() > Number(exp)) return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
  );
  try {
    return await crypto.subtle.verify('HMAC', key, hexToBytes(sig), enc.encode(exp));
  } catch {
    return false;
  }
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.split(';').map(s => s.trim())
    .find(s => s.startsWith(COOKIE_NAME + '='));
  const value = match ? decodeURIComponent(match.slice(COOKIE_NAME.length + 1)) : null;

  if (await verify(value, process.env.SESSION_SECRET)) return; // authed: pass through

  const loginUrl = new URL('/login', url);
  loginUrl.searchParams.set('next', url.pathname);
  return Response.redirect(loginUrl, 302);
}
