// Unit tests for the Wholesome Empire assessment router. Zero deps.
//   node --test tools/wholesome/assessment.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assess } from './assessment.js';

// Convenience builders -------------------------------------------------------
const scar = (o = {}) => ({
  concern: 'scars', goal_scars: 'texture', timeline: 'researching',
  scar_heal: 'over1', scar_state: 'flat', scar_area: 'stomach', ...o,
});
const smp = (o = {}) => ({
  concern: 'smp', goal_smp: 'subtle', timeline: 'ready',
  smp_situation: 'thinning', smp_look: 'subtle', smp_prior: 'none', ...o,
});
const brow = (o = {}) => ({
  concern: 'brows', goal_brows: 'natural', timeline: 'ready',
  brow_fill: 'daily', brow_prev: 'none', brow_style: 'natural', ...o,
});
const unsure = (o = {}) => ({
  concern: 'unsure', goal_unsure: 'which_fits', timeline: 'researching', ...o,
});

// --- Brief example 1: scar revision ----------------------------------------
test('scar texture goal -> revision, photo review', () => {
  const r = assess(scar({ goal_scars: 'texture' }));
  assert.equal(r.bestFitPath, 'Scar & Stretch Mark Revision Review');
  assert.equal(r.pathFamily, 'revision');
  assert.equal(r.readinessStage, 'Photo review recommended');
  assert.equal(r.nextStepId, 'photo_review');
  assert.ok(r.tags.includes('interest_revision'));
  assert.ok(r.tags.includes('texture_concern'));
  assert.ok(r.tags.includes('photo_review'));
});

// --- Brief example 2: camouflage -------------------------------------------
test('scar colour goal -> camouflage, photo review', () => {
  const r = assess(scar({ goal_scars: 'colour' }));
  assert.equal(r.bestFitPath, 'Scar / Stretch Mark Camouflage Review');
  assert.equal(r.pathFamily, 'camouflage');
  assert.equal(r.readinessStage, 'Photo review recommended');
  assert.ok(r.tags.includes('interest_camouflage'));
  assert.ok(r.tags.includes('colour_concern'));
});

// --- Brief example 3: SMP density, ready -----------------------------------
test('smp density clean + ready -> SMP Density Consultation, ready for consult', () => {
  const r = assess(smp());
  assert.equal(r.bestFitPath, 'SMP Density Consultation');
  assert.equal(r.readinessStage, 'Ready for consult');
  assert.equal(r.nextStepId, 'consult_phone');
  assert.ok(r.tags.includes('interest_smp'));
  assert.ok(r.tags.includes('ready_consult'));
});

// --- Brief example 4: brows natural, ready ---------------------------------
test('brow natural clean + ready -> Natural Brow Enhancement, ready', () => {
  const r = assess(brow());
  assert.equal(r.bestFitPath, 'Natural Brow Enhancement');
  assert.equal(r.readinessStage, 'Ready for consult');
  assert.equal(r.nextStepId, 'consult_brow');
  assert.ok(r.tags.includes('interest_brows'));
});

// --- Scar wait/prepare overrides -------------------------------------------
test('scar healed < 6 months -> wait and prepare + flags', () => {
  const r = assess(scar({ scar_heal: 'lt6' }));
  assert.equal(r.readinessStage, 'Wait and prepare');
  assert.equal(r.nextStepId, 'wait_prepare');
  assert.ok(r.cautionFlags.includes('wait_prepare'));
  assert.ok(r.cautionFlags.includes('early_healing'));
  assert.ok(r.tags.includes('wait_prepare'));
});

test('scar still changing -> wait and prepare', () => {
  assert.equal(assess(scar({ scar_state: 'changing' })).readinessStage, 'Wait and prepare');
});

test('scar sensitive -> wait + medical clearance flag', () => {
  const r = assess(scar({ scar_state: 'sensitive' }));
  assert.equal(r.readinessStage, 'Wait and prepare');
  assert.ok(r.cautionFlags.includes('sensitive_area'));
  assert.ok(r.cautionFlags.includes('medical_clearance_possible'));
});

// --- Scar mixed goals -> specialist ----------------------------------------
test('scar both texture+colour -> specialist review + mixed flag', () => {
  const r = assess(scar({ goal_scars: 'both' }));
  assert.equal(r.pathFamily, 'match');
  assert.equal(r.readinessStage, 'Specialist review recommended');
  assert.ok(r.cautionFlags.includes('mixed_signals'));
  assert.ok(r.tags.includes('interest_revision'));
  assert.ok(r.tags.includes('interest_camouflage'));
});

// --- SMP path variants ------------------------------------------------------
test('smp scar signal -> scalp scar camouflage + photo review', () => {
  const r = assess(smp({ smp_look: 'scar_less' }));
  assert.equal(r.bestFitPath, 'Scalp Scar Camouflage Review');
  assert.equal(r.readinessStage, 'Photo review recommended');
  assert.ok(r.cautionFlags.includes('scalp_scar'));
  assert.ok(r.tags.includes('scalp_scar'));
});

test('smp shaved look -> full scalp', () => {
  assert.equal(assess(smp({ smp_look: 'shaved' })).bestFitPath, 'Full Scalp SMP Consultation');
});

test('smp receding -> hairline definition', () => {
  assert.equal(assess(smp({ smp_situation: 'receding', smp_look: 'stronger' })).bestFitPath, 'Hairline Definition Consultation');
});

test('smp crown -> crown density review', () => {
  assert.equal(assess(smp({ smp_situation: 'crown', smp_look: 'blend' })).bestFitPath, 'Crown Density Review');
});

test('smp previous transplant -> photo review + medical flag', () => {
  const r = assess(smp({ smp_prior: 'transplant' }));
  assert.equal(r.readinessStage, 'Photo review recommended');
  assert.ok(r.cautionFlags.includes('medical_clearance_possible'));
});

test('smp prior unsure -> specialist review', () => {
  assert.equal(assess(smp({ smp_prior: 'unsure' })).readinessStage, 'Specialist review recommended');
});

// --- Brow variants ----------------------------------------------------------
test('brow visible previous work -> previous brow work review + photo review', () => {
  const r = assess(brow({ brow_prev: 'visible' }));
  assert.equal(r.bestFitPath, 'Previous Brow Work Review');
  assert.equal(r.readinessStage, 'Photo review recommended');
  assert.ok(r.tags.includes('previous_brow_work'));
});

test('brow faded previous work -> still routed by style, flagged', () => {
  const r = assess(brow({ brow_prev: 'faded', goal_brows: 'defined' }));
  assert.equal(r.bestFitPath, 'Brow Shape Consultation');
  assert.ok(r.cautionFlags.includes('previous_brow_work'));
});

test('brow unsure goal + unsure style -> style guidance + education', () => {
  const r = assess(brow({ goal_brows: 'unsure', brow_style: 'unsure' }));
  assert.equal(r.bestFitPath, 'Brow Style Guidance');
  assert.equal(r.readinessStage, 'Education first');
});

test('brow soft -> soft powder match', () => {
  assert.equal(assess(brow({ goal_brows: 'soft' })).bestFitPath, 'Soft Powder Brow Match');
});

// --- Unsure branch ----------------------------------------------------------
test('unsure which_fits -> match + education first', () => {
  const r = assess(unsure({ goal_unsure: 'which_fits' }));
  assert.equal(r.pathFamily, 'match');
  assert.equal(r.bestFitPath, 'Personalized Treatment Match');
  assert.equal(r.readinessStage, 'Education first');
  assert.equal(r.nextStepId, 'learn_more');
});

test('unsure am_i_ready -> photo review', () => {
  assert.equal(assess(unsure({ goal_unsure: 'am_i_ready' })).readinessStage, 'Photo review recommended');
});

test('unsure talk_first -> specialist review', () => {
  assert.equal(assess(unsure({ goal_unsure: 'talk_first' })).readinessStage, 'Specialist review recommended');
});

// --- Internal summary + safety ---------------------------------------------
test('internal summary names lead, path, next step', () => {
  const r = assess(scar({ goal_scars: 'colour', scar_area: 'stomach' }), { name: 'Sarah' });
  assert.match(r.internalSummary, /^Sarah is interested in/);
  assert.match(r.internalSummary, /Camouflage Review/);
  assert.match(r.internalSummary, /photos/);
});

test('no diagnosis language leaks into path names', () => {
  const banned = /eligible|cleared|guaranteed|will remove|will erase|cured/i;
  const paths = [
    assess(scar()).bestFitPath,
    assess(smp()).bestFitPath,
    assess(brow()).bestFitPath,
    assess(unsure()).bestFitPath,
  ];
  for (const p of paths) assert.doesNotMatch(p, banned);
});

test('event timeline tag applied', () => {
  assert.ok(assess(brow({ timeline: 'event' })).tags.includes('event_timeline'));
});
