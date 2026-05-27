// scoring.test.js — node --test, zero deps
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scoreQuiz } from '../js/scoring.js';

const all = (tier) => ({
  q1: tier, q2: tier, q3: tier, q4: tier,
  q5: tier, q6: tier, q7: tier, q8: tier,
});

test('all-forge answers → forge with coherence 1.0', () => {
  const r = scoreQuiz(all('forge'));
  assert.equal(r.tier, 'forge');
  assert.equal(r.coherence, 1.0);
});

test('all-cartographer answers → cartographer', () => {
  assert.equal(scoreQuiz(all('cartographer')).tier, 'cartographer');
});

test('all-wildfire answers → wildfire', () => {
  assert.equal(scoreQuiz(all('wildfire')).tier, 'wildfire');
});

test('all-lighthouse answers → lighthouse', () => {
  assert.equal(scoreQuiz(all('lighthouse')).tier, 'lighthouse');
});

test('plurality wins when not unanimous', () => {
  // 5 forge, 2 cartographer, 1 wildfire
  const answers = {
    q1: 'forge', q2: 'forge', q3: 'forge', q4: 'forge',
    q5: 'cartographer', q6: 'cartographer', q7: 'forge', q8: 'wildfire',
  };
  const r = scoreQuiz(answers);
  assert.equal(r.tier, 'forge');
  assert.equal(r.tally.forge, 5);
});

test('Q7 breaks ties between tied tiers', () => {
  // 4 forge, 4 cartographer — Q7 says cartographer
  const answers = {
    q1: 'forge', q2: 'forge', q3: 'forge', q4: 'forge',
    q5: 'cartographer', q6: 'cartographer', q7: 'cartographer', q8: 'cartographer',
  };
  assert.equal(scoreQuiz(answers).tier, 'cartographer');
});

test('Q7 breaks ties — forge wins when Q7 is forge', () => {
  const answers = {
    q1: 'forge', q2: 'forge', q3: 'forge', q4: 'cartographer',
    q5: 'cartographer', q6: 'cartographer', q7: 'forge', q8: 'forge',
  };
  // forge: q1,q2,q3,q7,q8 = 5; cartographer: q4,q5,q6 = 3
  assert.equal(scoreQuiz(answers).tier, 'forge');
});

test('dimensionGrades — strong when both dim items match primary', () => {
  const answers = {
    q1: 'forge', q4: 'forge',           // response_to_setback both forge
    q3: 'forge', q5: 'cartographer',     // self_perception mixed
    q2: 'wildfire', q8: 'wildfire',     // energy_pattern none-forge
    q6: 'forge', q7: 'forge',           // inner_dialogue both forge
  };
  const r = scoreQuiz(answers);
  assert.equal(r.tier, 'forge'); // 5 forge total
  assert.equal(r.dimensionGrades.response_to_setback, 'strong');
  assert.equal(r.dimensionGrades.self_perception, 'mixed');
  assert.equal(r.dimensionGrades.energy_pattern, 'shadow');
  assert.equal(r.dimensionGrades.inner_dialogue, 'strong');
});

test('throws on missing answer', () => {
  assert.throws(() => scoreQuiz({ q1: 'forge' }), /Missing answer/);
});

test('throws on invalid tier', () => {
  const bad = { ...all('forge'), q3: 'something-wrong' };
  assert.throws(() => scoreQuiz(bad), /Invalid tier/);
});
