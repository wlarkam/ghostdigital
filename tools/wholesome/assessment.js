// Wholesome Empire — Private Treatment Path Assessment.
// Pure routing/readiness core. No DOM, no fetch, no globals. Unit-tested by
// assessment.test.js. The UI imports assess() only.
//
// This is a DIAGNOSTIC/ROUTER, not a scored personality quiz: there are no
// "right" answers to game. assess() deterministically maps an answer set to a
// best-fit path, a readiness stage, caution flags, CRM tags, a recommended
// next step, and a clinic-facing internal summary.
//
// COMPLIANCE: never diagnose, approve, or reject. Language is "may fit" /
// "worth reviewing" / "a specialist would need to assess". Do not add copy that
// promises removal, erasure, eligibility, or guaranteed results.

// Human labels for building the internal summary sentence (kept local so this
// module stays pure and testable on its own).
const LABELS = {
  concern: { scars: 'scars or stretch marks', smp: 'scalp / hair density', brows: 'brows', unsure: 'a treatment starting point' },
  goal_scars: { texture: 'improving texture or skin damage', colour: 'reducing colour contrast', both: 'both texture and colour', unsure: 'figuring out the right treatment' },
  goal_smp: { subtle: 'the look of more density', stronger: 'a stronger hairline', blend: 'blending a thinning crown', shaved: 'a shaved scalp look', scar_less: 'making a scalp scar less noticeable' },
  goal_brows: { natural: 'a very natural brow', soft: 'a soft, filled brow', defined: 'a more defined brow', shape: 'better brow shape', less_makeup: 'less daily brow makeup', unsure: 'guidance on brow style' },
  goal_unsure: { which_fits: 'knowing which treatment fits', am_i_ready: 'understanding if they are ready', consult_or_photo: 'knowing whether to consult or send photos', what_affects: 'learning what affects the result', talk_first: 'talking to someone before deciding' },
  timeline: { ready: 'ready to book soon', researching: 'researching options', waiting: 'waiting for the right time', event: 'has an event or date coming up', unsure_ready: 'unsure if they are ready' },
  scar_area: { stomach: 'the stomach', hips_thighs: 'the hips or thighs', arms: 'the arms', chest_shoulders: 'the chest or shoulders', surgical: 'a surgical scar', injury: 'an injury scar', other: 'another area' },
};

// Map readiness stage -> CRM stage tag + recommended next-step id.
const STAGE_TAG = {
  'Ready for consult': 'ready_consult',
  'Photo review recommended': 'photo_review',
  'Wait and prepare': 'wait_prepare',
  'Education first': 'education_first',
  'Specialist review recommended': 'specialist_review',
};

// Pull the branch's goal answer regardless of which goal screen was shown.
function goalFor(branch, a) {
  if (branch === 'scars') return a.goal_scars;
  if (branch === 'smp') return a.goal_smp;
  if (branch === 'brows') return a.goal_brows;
  if (branch === 'unsure') return a.goal_unsure;
  return undefined;
}

// --- Path routing ----------------------------------------------------------
function routeScars(a) {
  const goal = a.goal_scars;
  if (goal === 'texture') return { family: 'revision', path: 'Scar & Stretch Mark Revision Review' };
  if (goal === 'colour') return { family: 'camouflage', path: 'Scar / Stretch Mark Camouflage Review' };
  // both | unsure -> needs a specialist to disambiguate
  return { family: 'match', path: 'Specialist Photo Review Recommended' };
}

function routeSmp(a) {
  const scarSignal = a.smp_look === 'scar_less' || a.smp_situation === 'scalp_scar' || a.smp_prior === 'scalp_scar';
  if (scarSignal) return { family: 'smp', path: 'Scalp Scar Camouflage Review', scarSignal };
  if (a.smp_look === 'shaved' || a.smp_situation === 'bald') return { family: 'smp', path: 'Full Scalp SMP Consultation', scarSignal };
  if (a.smp_look === 'stronger' || a.smp_situation === 'receding') return { family: 'smp', path: 'Hairline Definition Consultation', scarSignal };
  if (a.smp_situation === 'crown') return { family: 'smp', path: 'Crown Density Review', scarSignal };
  return { family: 'smp', path: 'SMP Density Consultation', scarSignal };
}

function routeBrows(a) {
  if (a.brow_prev === 'visible') return { family: 'brow', path: 'Previous Brow Work Review' };
  const key = a.goal_brows && a.goal_brows !== 'unsure' ? a.goal_brows : a.brow_style;
  switch (key) {
    case 'natural':
    case 'less_makeup':
      return { family: 'brow', path: 'Natural Brow Enhancement' };
    case 'soft':
    case 'soft_powder':
      return { family: 'brow', path: 'Soft Powder Brow Match' };
    case 'defined':
    case 'fuller':
    case 'shape':
      return { family: 'brow', path: 'Brow Shape Consultation' };
    default:
      return { family: 'brow', path: 'Brow Style Guidance' };
  }
}

function routeUnsure() {
  return { family: 'match', path: 'Personalized Treatment Match' };
}

// --- Readiness stage --------------------------------------------------------
function scarWaitFlag(a) {
  return a.scar_heal === 'lt6' || a.scar_state === 'changing' || a.scar_state === 'sensitive';
}

function readinessFor(branch, a, route) {
  if (branch === 'scars') {
    if (scarWaitFlag(a)) return 'Wait and prepare';
    if (route.family === 'match') return 'Specialist review recommended';
    return 'Photo review recommended';
  }
  if (branch === 'smp') {
    if (route.scarSignal || a.smp_prior === 'transplant' || a.smp_prior === 'prev_smp') return 'Photo review recommended';
    if (a.smp_prior === 'unsure') return 'Specialist review recommended';
    if (a.timeline === 'unsure_ready') return 'Education first';
    return 'Ready for consult';
  }
  if (branch === 'brows') {
    if (a.brow_prev === 'visible') return 'Photo review recommended';
    if (route.path === 'Brow Style Guidance' || a.timeline === 'unsure_ready') return 'Education first';
    return 'Ready for consult';
  }
  // unsure branch
  const g = a.goal_unsure;
  if (g === 'am_i_ready' || g === 'consult_or_photo') return 'Photo review recommended';
  if (g === 'talk_first') return 'Specialist review recommended';
  return 'Education first';
}

// --- Next step --------------------------------------------------------------
function nextStepFor(branch, stage) {
  if (stage === 'Wait and prepare') return 'wait_prepare';
  if (stage === 'Education first') return 'learn_more';
  if (stage === 'Photo review recommended' || stage === 'Specialist review recommended') return 'photo_review';
  // Ready for consult
  return branch === 'brows' ? 'consult_brow' : 'consult_phone';
}

// --- Caution flags ----------------------------------------------------------
function cautionFlagsFor(branch, a, route, stage) {
  const flags = [];
  if (branch === 'scars') {
    if (scarWaitFlag(a)) flags.push('wait_prepare');
    if (a.scar_heal === 'lt6') flags.push('early_healing');
    if (a.scar_state === 'changing') flags.push('changing_area');
    if (a.scar_state === 'sensitive') {
      flags.push('sensitive_area');
      flags.push('medical_clearance_possible');
    }
    if (route.family === 'match') flags.push('mixed_signals');
  }
  if (branch === 'smp') {
    if (route.scarSignal) flags.push('scalp_scar');
    if (a.smp_prior === 'transplant' || a.smp_prior === 'prev_smp') flags.push('medical_clearance_possible');
  }
  if (branch === 'brows') {
    if (a.brow_prev === 'faded' || a.brow_prev === 'visible' || a.brow_fill === 'prev_tattoo') {
      flags.push('previous_brow_work');
    }
  }
  return [...new Set(flags)];
}

// --- CRM tags ---------------------------------------------------------------
function tagsFor(branch, a, route, stage) {
  const tags = new Set();
  // Interest
  if (route.family === 'revision') tags.add('interest_revision');
  if (route.family === 'camouflage') tags.add('interest_camouflage');
  if (branch === 'scars' && route.family === 'match') {
    tags.add('interest_revision');
    tags.add('interest_camouflage');
  }
  if (branch === 'smp') tags.add('interest_smp');
  if (branch === 'brows') tags.add('interest_brows');
  // Stage
  const stageTag = STAGE_TAG[stage];
  if (stageTag) tags.add(stageTag);
  // Timeline segment
  if (a.timeline === 'event') tags.add('event_timeline');
  if (a.timeline === 'researching') tags.add('researching');
  // Scar goal signal
  if (a.goal_scars === 'texture') tags.add('texture_concern');
  if (a.goal_scars === 'colour') tags.add('colour_concern');
  if (a.goal_scars === 'both') { tags.add('texture_concern'); tags.add('colour_concern'); }
  // Flag-derived tags
  const flags = cautionFlagsFor(branch, a, route, stage);
  if (flags.includes('previous_brow_work')) tags.add('previous_brow_work');
  if (flags.includes('scalp_scar')) tags.add('scalp_scar');
  if (flags.includes('medical_clearance_possible')) tags.add('medical_clearance_possible');
  return [...tags];
}

// --- Internal lead summary --------------------------------------------------
function label(map, key) {
  return (map && map[key]) || null;
}

function internalSummary(name, branch, a, route, stage, nextStepId, flags) {
  const who = name && name.trim() ? name.trim() : 'This lead';
  const interest = label(LABELS.concern, a.concern) || 'a treatment';
  const goalKey = branch === 'scars' ? 'goal_scars' : branch === 'smp' ? 'goal_smp' : branch === 'brows' ? 'goal_brows' : 'goal_unsure';
  const goal = label(LABELS[goalKey], goalFor(branch, a));
  const timeline = label(LABELS.timeline, a.timeline);
  const area = branch === 'scars' ? label(LABELS.scar_area, a.scar_area) : null;

  const parts = [];
  parts.push(`${who} is interested in ${interest}.`);
  if (goal) parts.push(`Main goal: ${goal}${area ? ` on ${area}` : ''}.`);
  parts.push(`Best-fit path: ${route.path}.`);
  if (timeline) parts.push(`Timing: ${timeline}.`);
  parts.push(`Readiness stage: ${stage.toLowerCase()}.`);
  const nextText = {
    consult_phone: 'offer a free phone consult',
    consult_brow: 'offer a brow consultation',
    photo_review: 'ask for clear natural-light photos before consult',
    wait_prepare: 'send prep guidance and follow up later',
    learn_more: 'lead with education, no pressure to book',
  }[nextStepId];
  parts.push(`Suggested next step: ${nextText}.`);
  if (flags.length) {
    const flagText = flags.map((f) => f.replace(/_/g, ' ')).join(', ');
    parts.push(`Caution flags: ${flagText}.`);
  }
  return parts.join(' ');
}

// --- Public entry -----------------------------------------------------------
// answers: { concern, goal_scars|goal_smp|goal_brows|goal_unsure, timeline,
//   scar_heal, scar_state, scar_area, smp_situation, smp_look, smp_prior,
//   brow_fill, brow_prev, brow_style }
// meta (optional): { name } for the internal summary.
export function assess(answers = {}, meta = {}) {
  const a = answers || {};
  const branch = a.concern; // scars | smp | brows | unsure

  let route;
  if (branch === 'scars') route = routeScars(a);
  else if (branch === 'smp') route = routeSmp(a);
  else if (branch === 'brows') route = routeBrows(a);
  else route = routeUnsure(a);

  const readinessStage = readinessFor(branch, a, route);
  const nextStepId = nextStepFor(branch, readinessStage);
  const cautionFlags = cautionFlagsFor(branch, a, route, readinessStage);
  const tags = tagsFor(branch, a, route, readinessStage);
  const summary = internalSummary(meta.name, branch, a, route, readinessStage, nextStepId, cautionFlags);

  return {
    branch,
    goal: goalFor(branch, a) || null,
    timeline: a.timeline || null,
    pathFamily: route.family, // revision | camouflage | smp | brow | match
    bestFitPath: route.path,
    readinessStage,
    nextStepId,
    cautionFlags,
    tags,
    internalSummary: summary,
    // `checklistKey` selects the right consult-prep checklist in content.js.
    checklistKey: branch === 'unsure' ? 'unsure' : branch,
  };
}

export default assess;
