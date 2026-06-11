// Email List ROI — pure scoring core. No DOM, no fetch, no globals.
// Unit-tested by scoring.test.js. UI imports scoreEmailRoi() only.

// Interpretation bands, keyed on revenue per subscriber per year (RPSY, $).
// $12/yr == the classic "$1 per subscriber per month" benchmark.
// Copy below is a stub pending brand-voice review. [NEEDS_VOICE_REVIEW]
export const BANDS = [
  {
    id: 'dormant',
    max: 3,
    name: 'Dormant Asset',
    tagline: 'You have a list. You do not have an email channel.',
    narrative:
      'Your subscribers raised their hands once and have heard almost nothing since. ' +
      'The asset is real — the revenue is theoretical. Right now the list is a cost, not a channel.',
  },
  {
    id: 'underused',
    max: 12,
    name: 'Underused List',
    tagline: 'The list works. It just barely gets to.',
    narrative:
      'When you send, money moves — so the list is not the problem. Cadence is. ' +
      'You are leaving the compounding on the table because the emails go out when you remember, not when they are due.',
  },
  {
    id: 'healthy',
    max: 36,
    name: 'Healthy Earner',
    tagline: 'A real channel, pulling real weight.',
    narrative:
      'Your list earns its keep — you email with enough rhythm that subscribers expect you. ' +
      'The gap now is not whether you send, it is how hard each send works.',
  },
  {
    id: 'compounding',
    max: Infinity,
    name: 'Compounding Machine',
    tagline: 'The list is the business.',
    narrative:
      'You have built the rare thing: an owned channel that prints predictable revenue. ' +
      'At this level the risk is not under-sending — it is letting quality or deliverability slip.',
  },
];

function num(v) {
  const n = typeof v === 'number' ? v : parseFloat(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

// input: { subscribers, monthlyGrowth, sendsPerMonth, offerPrice, clickRate, buyRate }
// clickRate / buyRate are percentages (e.g. 2 means 2%).
export function scoreEmailRoi(input = {}) {
  const subscribers = num(input.subscribers);
  const monthlyGrowth = num(input.monthlyGrowth);
  const sendsPerMonth = num(input.sendsPerMonth);
  const offerPrice = num(input.offerPrice);
  const clickRate = num(input.clickRate) / 100;
  const buyRate = num(input.buyRate) / 100;

  const revenuePerSend = subscribers * clickRate * buyRate * offerPrice;
  const currentAnnual = revenuePerSend * sendsPerMonth * 12;

  // The lever Ghost Digital sells: consistent weekly cadence.
  const recommendedSends = Math.max(4, sendsPerMonth);
  const potentialAnnual =
    subscribers * clickRate * buyRate * offerPrice * recommendedSends * 12;
  const cadenceGap = Math.max(0, potentialAnnual - currentAnnual);

  // 12-month projection at recommended cadence, averaging list growth.
  const avgSubs = subscribers + monthlyGrowth * 5.5;
  const projectedAnnual =
    avgSubs * clickRate * buyRate * offerPrice * recommendedSends * 12;

  const rpsy = subscribers > 0 ? currentAnnual / subscribers : 0;
  const band = BANDS.find((b) => rpsy < b.max) || BANDS[BANDS.length - 1];

  return {
    revenuePerSend,
    currentAnnual,
    potentialAnnual,
    cadenceGap,
    projectedAnnual,
    rpsy,
    sendsPerMonth,
    recommendedSends,
    alreadyWeekly: sendsPerMonth >= 4,
    band: band.id,
    bandName: band.name,
  };
}
