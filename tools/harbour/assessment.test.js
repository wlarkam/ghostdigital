// Unit tests for the Harbour Aesthetics (fictional demo) assessment router.
//   node --test tools/harbour/assessment.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assess } from './assessment.js';
import { SCREENS, flowFor, REPORT, WAIT_REASONS, FLAG_LABELS, personalSummary, listAreas } from './content.js';

// Convenience builders -------------------------------------------------------
const botox = (o = {}) => ({
  concern: 'botox', goal_botox: 'movement', timeline: 'ready',
  botox_history: 'none', botox_area: ['forehead'], health: ['none'], ...o,
});
const fillers = (o = {}) => ({
  concern: 'fillers', goal_fillers: 'lips', timeline: 'ready',
  filler_history: 'none', filler_area: ['lips'], health: ['none'], ...o,
});
const laser = (o = {}) => ({
  concern: 'laser', goal_laser: 'hair', timeline: 'ready',
  laser_history: 'none', laser_sun: 'no', laser_area: ['legs'], health: ['none'], ...o,
});
const unsure = (o = {}) => ({
  concern: 'unsure', goal_unsure: 'which_fits', timeline: 'researching', health: ['none'], ...o,
});

// --- Botox branch -----------------------------------------------------------
test('botox movement, clean + ready -> anti-wrinkle consultation, ready', () => {
  const r = assess(botox());
  assert.equal(r.branch, 'botox');
  assert.equal(r.pathFamily, 'botox');
  assert.equal(r.bestFitPath, 'Anti-wrinkle consultation');
  assert.equal(r.readinessStage, 'Ready for consult');
  assert.equal(r.nextStepId, 'consult');
  assert.ok(r.tags.includes('interest_botox'));
  assert.ok(r.tags.includes('ready_consult'));
  assert.deepEqual(r.cautionFlags, []);
});

test('botox goal variants route to their own paths', () => {
  assert.equal(assess(botox({ goal_botox: 'rest' })).bestFitPath, 'Anti-wrinkle and skin quality review');
  assert.equal(assess(botox({ goal_botox: 'prevent' })).bestFitPath, 'Preventative anti-wrinkle consultation');
  assert.equal(assess(botox({ goal_botox: 'refresh' })).bestFitPath, 'Refreshed look consultation');
});

test('botox unsure goal -> guidance + education first', () => {
  const r = assess(botox({ goal_botox: 'unsure' }));
  assert.equal(r.bestFitPath, 'Anti-wrinkle guidance');
  assert.equal(r.readinessStage, 'Education first');
  assert.equal(r.nextStepId, 'learn_more');
});

test('botox timeline unsure_ready -> education first', () => {
  assert.equal(assess(botox({ timeline: 'unsure_ready' })).readinessStage, 'Education first');
});

// --- Fillers branch ---------------------------------------------------------
test('fillers lips, clean + ready -> lip filler consultation, ready', () => {
  const r = assess(fillers());
  assert.equal(r.bestFitPath, 'Lip filler consultation');
  assert.equal(r.readinessStage, 'Ready for consult');
  assert.ok(r.tags.includes('interest_fillers'));
  assert.ok(r.tags.includes('area_lips'));
});

test('fillers volume / contour route', () => {
  assert.equal(assess(fillers({ goal_fillers: 'volume', filler_area: ['cheeks'] })).bestFitPath, 'Facial volume consultation');
  assert.equal(assess(fillers({ goal_fillers: 'contour', filler_area: ['jawline', 'chin'] })).bestFitPath, 'Jawline and chin contour consultation');
});

test('fillers under-eyes -> under-eye review, photo review, delicate flag', () => {
  const r = assess(fillers({ goal_fillers: 'under_eyes', filler_area: ['under_eyes'] }));
  assert.equal(r.bestFitPath, 'Under-eye review');
  assert.equal(r.readinessStage, 'Photo review recommended');
  assert.equal(r.nextStepId, 'photo_review');
  assert.ok(r.cautionFlags.includes('delicate_area'));
});

test('fillers: under-eyes picked as an extra area still triggers photo review', () => {
  const r = assess(fillers({ goal_fillers: 'lips', filler_area: ['lips', 'under_eyes'] }));
  assert.equal(r.bestFitPath, 'Lip filler consultation');
  assert.equal(r.readinessStage, 'Photo review recommended');
});

test('fillers unhappy with previous work -> previous filler review, specialist', () => {
  const r = assess(fillers({ filler_history: 'unhappy' }));
  assert.equal(r.bestFitPath, 'Previous filler review');
  assert.equal(r.readinessStage, 'Specialist review recommended');
  assert.equal(r.nextStepId, 'specialist_call');
  assert.ok(r.cautionFlags.includes('previous_filler'));
  assert.ok(r.tags.includes('returning_patient'));
});

test('fillers unsure what was used -> photo review', () => {
  const r = assess(fillers({ filler_history: 'unsure_what' }));
  assert.equal(r.readinessStage, 'Photo review recommended');
  assert.ok(r.cautionFlags.includes('previous_filler'));
});

test('fillers unsure goal -> guidance + education first', () => {
  const r = assess(fillers({ goal_fillers: 'unsure', filler_area: ['unsure'] }));
  assert.equal(r.bestFitPath, 'Dermal filler guidance');
  assert.equal(r.readinessStage, 'Education first');
});

// --- Laser branch -----------------------------------------------------------
test('laser hair, clean + ready -> hair removal consultation, ready', () => {
  const r = assess(laser());
  assert.equal(r.bestFitPath, 'Laser hair removal consultation');
  assert.equal(r.pathKey, 'laser_hair');
  assert.equal(r.readinessStage, 'Ready for consult');
  assert.ok(r.tags.includes('interest_laser'));
});

test('laser pigment and redness -> photo review', () => {
  const p = assess(laser({ goal_laser: 'pigment', laser_area: ['face'] }));
  assert.equal(p.bestFitPath, 'Pigmentation laser review');
  assert.equal(p.readinessStage, 'Photo review recommended');
  const r = assess(laser({ goal_laser: 'redness', laser_area: ['face'] }));
  assert.equal(r.bestFitPath, 'Redness laser review');
  assert.equal(r.readinessStage, 'Photo review recommended');
});

test('laser texture -> consultation, ready', () => {
  const r = assess(laser({ goal_laser: 'texture', laser_area: ['face'] }));
  assert.equal(r.bestFitPath, 'Skin texture laser consultation');
  assert.equal(r.readinessStage, 'Ready for consult');
});

test('laser previous reaction -> specialist + flag', () => {
  const r = assess(laser({ laser_history: 'reaction' }));
  assert.equal(r.readinessStage, 'Specialist review recommended');
  assert.ok(r.cautionFlags.includes('previous_reaction'));
});

test('laser unsure goal -> guidance + education first', () => {
  const r = assess(laser({ goal_laser: 'unsure' }));
  assert.equal(r.bestFitPath, 'Laser treatment guidance');
  assert.equal(r.readinessStage, 'Education first');
});

// --- Unsure branch ----------------------------------------------------------
test('unsure which_fits -> match + education first', () => {
  const r = assess(unsure());
  assert.equal(r.pathFamily, 'match');
  assert.equal(r.bestFitPath, 'Personalised treatment match');
  assert.equal(r.readinessStage, 'Education first');
  assert.equal(r.nextStepId, 'learn_more');
});

test('unsure am_i_ready / consult_or_photo -> photo review; talk_first -> specialist', () => {
  assert.equal(assess(unsure({ goal_unsure: 'am_i_ready' })).readinessStage, 'Photo review recommended');
  assert.equal(assess(unsure({ goal_unsure: 'consult_or_photo' })).readinessStage, 'Photo review recommended');
  assert.equal(assess(unsure({ goal_unsure: 'talk_first' })).readinessStage, 'Specialist review recommended');
});

test('missing concern falls back to the unsure branch without throwing', () => {
  const r = assess({});
  assert.equal(r.branch, 'unsure');
  assert.equal(r.pathFamily, 'match');
});

// --- Wait-and-prepare triggers ---------------------------------------------
test('recent treatment in the same area -> wait and prepare (every treatment branch)', () => {
  for (const r of [
    assess(botox({ botox_history: 'recent' })),
    assess(fillers({ filler_history: 'recent' })),
    assess(laser({ laser_history: 'recent' })),
  ]) {
    assert.equal(r.readinessStage, 'Wait and prepare');
    assert.equal(r.nextStepId, 'wait_prepare');
    assert.ok(r.cautionFlags.includes('wait_prepare'));
    assert.ok(r.cautionFlags.includes('recent_treatment'));
    assert.deepEqual(r.waitReasons, ['recent_treatment']);
  }
});

test('older treatment history does not trigger a wait', () => {
  assert.equal(assess(botox({ botox_history: 'older' })).readinessStage, 'Ready for consult');
});

test('recent tan, fake tan or upcoming sun -> laser wait and prepare', () => {
  for (const sun of ['tan', 'self_tan', 'sun_soon']) {
    const r = assess(laser({ laser_sun: sun }));
    assert.equal(r.readinessStage, 'Wait and prepare', sun);
    assert.ok(r.cautionFlags.includes('recent_sun'), sun);
  }
  assert.equal(assess(laser({ laser_sun: 'unsure' })).readinessStage, 'Ready for consult');
});

test('sun answer is ignored outside the laser branch', () => {
  assert.equal(assess(botox({ laser_sun: 'tan' })).readinessStage, 'Ready for consult');
});

test('pregnancy or breastfeeding -> wait + medical clearance, any branch', () => {
  for (const r of [
    assess(botox({ health: ['pregnant'] })),
    assess(fillers({ health: ['pregnant'] })),
    assess(laser({ health: ['pregnant'] })),
    assess(unsure({ health: ['pregnant'] })),
  ]) {
    assert.equal(r.readinessStage, 'Wait and prepare');
    assert.ok(r.cautionFlags.includes('pregnancy_breastfeeding'));
    assert.ok(r.cautionFlags.includes('medical_clearance_possible'));
  }
});

test('active skin issue -> wait and prepare', () => {
  const r = assess(fillers({ health: ['skin_issue'] }));
  assert.equal(r.readinessStage, 'Wait and prepare');
  assert.ok(r.cautionFlags.includes('active_skin_issue'));
});

test('unsure about medical history -> specialist review + medical clearance flag', () => {
  const r = assess(botox({ health: ['medical_unsure'] }));
  assert.equal(r.readinessStage, 'Specialist review recommended');
  assert.equal(r.nextStepId, 'specialist_call');
  assert.ok(r.cautionFlags.includes('medical_clearance_possible'));
  assert.ok(r.tags.includes('medical_clearance_possible'));
});

test('a wait trigger outranks every other stage', () => {
  const r = assess(fillers({ filler_history: 'recent', goal_fillers: 'under_eyes', health: ['medical_unsure'] }));
  assert.equal(r.readinessStage, 'Wait and prepare');
  assert.ok(r.cautionFlags.includes('medical_clearance_possible'));
});

test('several wait triggers are all reported', () => {
  const r = assess(laser({ laser_history: 'recent', laser_sun: 'tan', health: ['pregnant', 'skin_issue'] }));
  assert.deepEqual(r.waitReasons, ['recent_treatment', 'recent_sun', 'pregnancy_breastfeeding', 'active_skin_issue']);
});

test('every wait reason and flag has copy', () => {
  const r = assess(laser({ laser_history: 'recent', laser_sun: 'tan', health: ['pregnant', 'skin_issue', 'medical_unsure'] }));
  for (const w of r.waitReasons) assert.ok(WAIT_REASONS[w], w);
  for (const f of r.cautionFlags) assert.ok(FLAG_LABELS[f], f);
});

// --- Multi-select areas -----------------------------------------------------
test('area screens and the health screen are multi-select', () => {
  for (const id of ['botox_area', 'filler_area', 'laser_area', 'health']) assert.equal(SCREENS[id].multi, true, id);
});

test('multi-select areas become area tags and are returned', () => {
  const r = assess(botox({ botox_area: ['forehead', 'frown', 'crows'] }));
  assert.deepEqual(r.areas, ['forehead', 'frown', 'crows']);
  for (const t of ['area_forehead', 'area_frown', 'area_crows']) assert.ok(r.tags.includes(t), t);
});

test('a single area given as a string still works', () => {
  const r = assess(fillers({ filler_area: 'cheeks', goal_fillers: 'volume' }));
  assert.deepEqual(r.areas, ['cheeks']);
  assert.ok(r.tags.includes('area_cheeks'));
});

test('"not sure" area does not become a tag', () => {
  assert.ok(!assess(botox({ botox_area: ['unsure'] })).tags.some((t) => t === 'area_unsure'));
});

test('internal summary lists multiple areas', () => {
  const r = assess(fillers({ filler_area: ['lips', 'cheeks'] }), { name: 'Mia' });
  assert.match(r.internalSummary, /^Mia is interested in dermal fillers/);
  assert.match(r.internalSummary, /areas: lips, cheeks/);
  assert.match(r.internalSummary, /Lip filler consultation/);
});

// --- Flow ------------------------------------------------------------------
test('each branch flow ends in contact + result and only uses real screens', () => {
  for (const c of ['botox', 'fillers', 'laser', 'unsure']) {
    const f = flowFor(c);
    assert.deepEqual(f.slice(-2), ['contact', 'result'], c);
    assert.ok(f.includes('health') && f.includes('barrier'), c);
    for (const id of f.slice(0, -2)) assert.ok(SCREENS[id], `${c}:${id}`);
  }
  assert.ok(flowFor('laser').includes('laser_sun'));
  assert.ok(!flowFor('botox').includes('laser_sun'));
});

// --- Barrier -----------------------------------------------------------------
test('barrier is captured, tagged and drives a follow-up angle', () => {
  const r = assess(botox({ barrier: 'needles' }), { name: 'Dana' });
  assert.equal(r.barrier, 'needles');
  assert.ok(r.tags.includes('has_hesitation'));
  assert.ok(r.tags.includes('barrier_needles'));
  assert.match(r.internalSummary, /Follow-up angle: walk through/);
});

test('barrier "nothing" adds no hesitation tag; every barrier has a response', () => {
  assert.ok(!assess(botox({ barrier: 'nothing' })).tags.includes('has_hesitation'));
  for (const o of SCREENS.barrier.options) assert.ok(REPORT.barrierResponse[o.id], o.id);
});

// --- Compliance ---------------------------------------------------------------
test('no diagnosis, dosing or price language in paths or report copy', () => {
  const banned = /eligible|guaranteed|cured|\bunits?\b|\bml\b|[$£€]\s?\d/i;
  const paths = [botox(), fillers(), laser(), unsure()].map((x) => assess(x).bestFitPath);
  for (const p of paths) assert.doesNotMatch(p, banned);
  const copy = JSON.stringify(REPORT) + JSON.stringify(WAIT_REASONS);
  assert.doesNotMatch(copy, banned);
});

test('no em dashes in report or question copy', () => {
  assert.doesNotMatch(JSON.stringify(REPORT) + JSON.stringify(SCREENS) + JSON.stringify(WAIT_REASONS), /—/);
});

// --- Personalised report prose -----------------------------------------------
test('personalSummary reflects each branch', () => {
  assert.match(personalSummary(botox({ botox_area: ['forehead'] })), /softer lines when your face moves, focused on your forehead lines\./);
  assert.match(personalSummary(fillers()), /fuller or more defined lips\./); // no "focused on your lips" echo
  assert.match(personalSummary(fillers({ filler_area: ['lips', 'chin'] })), /lips, focused on your lips and chin\./);
  assert.match(personalSummary(laser({ laser_sun: 'tan' })), /less unwanted hair.*legs.*tan or some sun/);
  assert.match(personalSummary(unsure()), /which treatment might fit/);
});

test('personalSummary is plural-safe for one, two and three areas', () => {
  assert.equal(listAreas('filler_area', ['lips']), 'lips');
  assert.equal(listAreas('filler_area', ['lips', 'cheeks']), 'lips and cheeks');
  assert.equal(listAreas('botox_area', ['forehead', 'frown', 'crows']), "forehead lines, frown lines and crow's feet");
  for (const areas of [['chin'], ['chin', 'jawline'], ['chin', 'jawline', 'temples']]) {
    const s = personalSummary(fillers({ goal_fillers: 'contour', filler_area: areas }));
    assert.doesNotMatch(s, /\b(is|are|has|have) (been )?(there|your)/i);
    assert.doesNotMatch(s, /your the|,\s*\./);
  }
});

test('personalSummary skips "not sure" areas and handles missing answers', () => {
  const s = personalSummary(botox({ botox_area: ['unsure'] }));
  assert.doesNotMatch(s, /focused on/);
  assert.match(personalSummary(botox({ botox_area: ['unsure', 'frown'] })), /focused on your frown lines\./);
  assert.match(personalSummary({ concern: 'laser' }), /^You're hoping for/);
  assert.match(personalSummary({}), /still weighing/);
});

test('personalSummary mentions treatment history', () => {
  assert.match(personalSummary(botox({ botox_history: 'none' })), /first treatment/);
  assert.match(personalSummary(fillers({ filler_history: 'unhappy' })), /second opinion/);
});
