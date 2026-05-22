// node --test tools/email-roi/scoring.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scoreEmailRoi, BANDS } from './scoring.js';

const base = {
  subscribers: 5000,
  monthlyGrowth: 0,
  sendsPerMonth: 1,
  offerPrice: 200,
  clickRate: 2,
  buyRate: 4,
};

test('revenue per send matches the formula', () => {
  const r = scoreEmailRoi(base);
  // 5000 * 0.02 * 0.04 * 200 = 800
  assert.equal(r.revenuePerSend, 800);
});

test('current annual = revenue per send * sends * 12', () => {
  const r = scoreEmailRoi(base);
  assert.equal(r.currentAnnual, 9600);
});

test('cadence gap surfaces the weekly-cadence upside', () => {
  const r = scoreEmailRoi(base);
  // potential at 4 sends = 800 * 4 * 12 = 38400
  assert.equal(r.potentialAnnual, 38400);
  assert.equal(r.cadenceGap, 28800);
});

test('no cadence gap when already emailing weekly or more', () => {
  const r = scoreEmailRoi({ ...base, sendsPerMonth: 4 });
  assert.equal(r.cadenceGap, 0);
  assert.equal(r.alreadyWeekly, true);
});

test('band reflects revenue per subscriber per year', () => {
  assert.equal(scoreEmailRoi(base).band, 'dormant'); // rpsy 1.92
  assert.equal(scoreEmailRoi({ ...base, sendsPerMonth: 4 }).band, 'underused'); // 7.68
  assert.equal(scoreEmailRoi({ ...base, sendsPerMonth: 8 }).band, 'healthy'); // 15.36
  assert.equal(scoreEmailRoi({ ...base, sendsPerMonth: 20 }).band, 'compounding'); // 38.4
});

test('zero subscribers does not produce NaN', () => {
  const r = scoreEmailRoi({ ...base, subscribers: 0 });
  assert.equal(r.rpsy, 0);
  assert.equal(r.currentAnnual, 0);
  assert.equal(r.band, 'dormant');
});

test('garbage / empty input is coerced to zero, no throw', () => {
  const r = scoreEmailRoi({ subscribers: 'abc', offerPrice: -50 });
  assert.equal(r.currentAnnual, 0);
  assert.equal(r.band, 'dormant');
  assert.equal(scoreEmailRoi().currentAnnual, 0);
});

test('list growth lifts the 12-month projection above current', () => {
  const flat = scoreEmailRoi({ ...base, sendsPerMonth: 4 });
  const grow = scoreEmailRoi({ ...base, sendsPerMonth: 4, monthlyGrowth: 200 });
  assert.ok(grow.projectedAnnual > flat.projectedAnnual);
});

test('every band has copy fields', () => {
  for (const b of BANDS) {
    assert.ok(b.name && b.tagline && b.narrative);
  }
});
