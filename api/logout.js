// POST /api/logout: clears the session cookie. CommonJS.
const { COOKIE_NAME } = require('./_auth.js');

module.exports = async (req, res) => {
  res.setHeader('cache-control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('allow', 'POST');
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }
  res.setHeader('set-cookie',
    `${COOKIE_NAME}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax`);
  res.status(200).json({ ok: true });
};
