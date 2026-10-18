// Vercel Edge Middleware: gates /dashboard behind a signed session cookie,
// and serves the Wholesome Empire assessment at the root of its subdomain
// (vercel.json rewrites lose to the real index.html, middleware runs first).
// Runs in the EDGE runtime, so Web Crypto only, never node:crypto.
// Only the dashboard page routes are matched here. The public landing page,
// /email-roi-calculator, /swipe-file and the emailroi capture endpoints are
// untouched. /api/metrics gates itself in the Node runtime (api/metrics.js).
export const config = {
  matcher: ['/', '/dashboard', '/dashboard.html', '/dashboard/:path*'],
};

const COOKIE_NAME = 'dash_session';
const ASSESSMENT_HOST = 'assessment.wholesomeempireyyc.com';

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

  if (url.pathname === '/') {
    if (url.hostname !== ASSESSMENT_HOST) return; // every other host: normal homepage
    return new Response(null, {
      headers: { 'x-middleware-rewrite': new URL('/restoration-map' + url.search, url).toString() },
    });
  }

  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.split(';').map(s => s.trim())
    .find(s => s.startsWith(COOKIE_NAME + '='));
  const value = match ? decodeURIComponent(match.slice(COOKIE_NAME.length + 1)) : null;

  if (await verify(value, process.env.SESSION_SECRET)) return; // authed: pass through

  const loginUrl = new URL('/login', url);
  loginUrl.searchParams.set('next', url.pathname);
  return Response.redirect(loginUrl, 302);
}
