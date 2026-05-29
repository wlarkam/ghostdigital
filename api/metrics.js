// GET /api/metrics: read-only dashboard feed.
// Calls the dashboard_emailroi_insights() SECURITY DEFINER aggregate, which
// runs as owner and returns only counts and averages. No raw submission or
// contact rows are ever exposed here. Own data, so this is live from day one.
const { rpc } = require('./_supabase.js');

module.exports = async (req, res) => {
  res.setHeader('cache-control', 'no-store');
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  let emailroi = null;
  let status = 'pending';
  try {
    emailroi = await rpc('dashboard_emailroi_insights');
    status = 'live';
  } catch (err) {
    console.error(err);
  }

  res.status(200).json({
    emailroi,
    sources: { emailroi: status },
  });
};
