// node --test tools/fulcrion/scoring.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scoreScorecard, DIMENSIONS, QUESTIONS, BANDS, RECS } from './scoring.js';

// Build an answers object where every question gets the same score.
const allAt = (s) => Object.fromEntries(QUESTIONS.map((q) => [q.id, s]));

test('15 questions across 5 dimensions, 3 each', () => {
  assert.equal(QUESTIONS.length, 15);
  assert.equal(DIMENSIONS.length, 5);
  for (const d of DIMENSIONS) {
    assert.equal(QUESTIONS.filter((q) => q.dim === d.id).length, 3);
  }
});

test('every question has exactly 4 tier-coded options scoring 0..3', () => {
  for (const q of QUESTIONS) {
    assert.equal(q.options.length, 4);
    const scores = q.options.map((o) => o.score).sort();
    assert.deepEqual(scores, [0, 1, 2, 3]);
    for (const o of q.options) assert.ok(typeof o.label === 'string' && o.label.length > 0);
  }
});

test('all-healthy answers => 100 and "through the wall"', () => {
  const r = scoreScorecard(allAt(3));
  assert.equal(r.overall, 100);
  assert.equal(r.band, 'through');
  for (const d of DIMENSIONS) assert.equal(r.dimensions[d.id], 100);
});

test('all-stuck answers => 0 and "in the ceiling"', () => {
  const r = scoreScorecard(allAt(0));
  assert.equal(r.overall, 0);
  assert.equal(r.band, 'in_it');
  for (const d of DIMENSIONS) assert.equal(r.statuses[d.id], 'blocked');
});

test('middling answers land in "approaching the wall"', () => {
  const r2 = scoreScorecard(allAt(2)); // 2/3 => 67 each => overall 67
  assert.equal(r2.overall, 67);
  assert.equal(r2.band, 'approaching');
  const r1 = scoreScorecard(allAt(1)); // 1/3 => 33 each => overall 33 (in it)
  assert.equal(r1.overall, 33);
  assert.equal(r1.band, 'in_it');
});

test('band boundaries: 39 in_it, 40 approaching, 69 approaching, 70 through', () => {
  // craft per-question scores to hit exact overall values via dimension means
  const byId = (mapDimToScore) =>
    Object.fromEntries(QUESTIONS.map((q) => [q.id, mapDimToScore[q.dim]]));
  // helper not needed for exactness; instead test the band lookup directly
  const bandOf = (overall) => BANDS.find((b) => overall >= b.min && overall <= b.max).id;
  assert.equal(bandOf(39), 'in_it');
  assert.equal(bandOf(40), 'approaching');
  assert.equal(bandOf(69), 'approaching');
  assert.equal(bandOf(70), 'through');
  assert.equal(bandOf(100), 'through');
});

test('binding constraint = lowest-scoring dimension', () => {
  // Make architecture the clear weakest; everything else healthy.
  const ans = allAt(3);
  for (const q of QUESTIONS) if (q.dim === 'architecture') ans[q.id] = 0;
  const r = scoreScorecard(ans);
  assert.equal(r.bindingConstraint, 'architecture');
  assert.equal(r.dimensions.architecture, 0);
  assert.equal(r.bindingRec, RECS.architecture.blocked);
});

test('binding-constraint ties break by dimension order (team_structure first)', () => {
  const r = scoreScorecard(allAt(1)); // all equal
  assert.equal(r.bindingConstraint, DIMENSIONS[0].id);
  assert.equal(r.bindingConstraint, 'team_structure');
});

test('per-dimension status thresholds (holding>=67, strained>=34, blocked<34)', () => {
  // dim with two 3s + one 0 => raw 6/9 => 67 => holding
  const ans = allAt(0);
  ans.ts1 = 3; ans.ts2 = 3; ans.ts3 = 0;
  assert.equal(scoreScorecard(ans).statuses.team_structure, 'holding');
  // one 3 + two 0 => 3/9 => 33 => blocked
  const ans2 = allAt(0); ans2.ts1 = 3;
  assert.equal(scoreScorecard(ans2).statuses.team_structure, 'blocked');
  // one 3 + one 1 + one 0 => 4/9 => 44 => strained
  const ans3 = allAt(0); ans3.ts1 = 3; ans3.ts2 = 1;
  assert.equal(scoreScorecard(ans3).statuses.team_structure, 'strained');
});

test('garbage / empty input coerces to zero, never throws', () => {
  assert.equal(scoreScorecard().overall, 0);
  assert.equal(scoreScorecard({}).overall, 0);
  const r = scoreScorecard({ ts1: 'abc', ts2: -5, ts3: 99, co1: 2.6 });
  assert.ok(Number.isFinite(r.overall));
  assert.equal(r.dimensions.team_structure, Math.round(((0 + 0 + 3) / 9) * 100)); // -5->0, 99->3, abc->0
});

test('every band and every dimension rec has copy', () => {
  for (const b of BANDS) assert.ok(b.name && b.tagline && b.narrative);
  for (const d of DIMENSIONS) {
    assert.ok(d.label && d.blurb);
    for (const s of ['blocked', 'strained', 'holding']) {
      assert.ok(RECS[d.id][s] && RECS[d.id][s].length > 0);
    }
  }
});
