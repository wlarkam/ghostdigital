// Harbour Aesthetics (FICTIONAL demo clinic) — Treatment Chart assessment.
// Pure routing/readiness core. No DOM, no fetch, no globals. Unit-tested by
// assessment.test.js. The UI imports assess() only.
//
// Cloned from tools/wholesome/assessment.js and re-pointed at anti-wrinkle
// injections, dermal fillers and laser. Same contract: assess(answers, meta)
// deterministically maps an answer set to a best-fit path, a readiness stage,
// caution flags, CRM tags, a next step and a clinic-facing summary.
//
// COMPLIANCE: never diagnose, approve or reject. No dosing, unit counts,
// prices or clinical intervals stated as fact. Anything clinical is phrased
// as "the clinic confirms on your call".

// Multi-select answers arrive as arrays; single answers as strings.
const ids = (v) => (Array.isArray(v) ? v : v ? [v] : []);
const has = (v, id) => ids(v).includes(id);

// Human labels for the internal summary sentence.
const LABELS = {
  concern: { botox: 'anti-wrinkle injections', fillers: 'dermal fillers', laser: 'laser treatment', unsure: 'a treatment starting point' },
  goal_botox: { movement: 'softening expression lines', rest: 'softening lines at rest', prevent: 'preventing lines', refresh: 'looking less tired', unsure: 'figuring out what they need' },
  goal_fillers: { lips: 'fuller or more defined lips', volume: 'restoring lost volume', contour: 'jawline or chin definition', under_eyes: 'under-eye hollows', unsure: 'figuring out what they need' },
  goal_laser: { pigment: 'pigment or uneven tone', texture: 'skin texture', redness: 'redness or visible veins', hair: 'hair removal', unsure: 'figuring out which laser fits' },
  goal_unsure: { which_fits: 'knowing which treatment fits', am_i_ready: 'understanding if they are ready', consult_or_photo: 'knowing whether to consult or send photos', what_affects: 'learning what affects the result', talk_first: 'talking to someone before deciding' },
  timeline: { ready: 'ready to book soon', researching: 'researching options', waiting: 'waiting for the right time', event: 'has an event or date coming up', unsure_ready: 'unsure if they are ready' },
  botox_area: { forehead: 'forehead', frown: 'frown lines', crows: "crow's feet", bunny: 'nose lines', chin: 'chin', jaw: 'jaw (clenching)', unsure: 'unsure of area' },
  filler_area: { lips: 'lips', cheeks: 'cheeks', jawline: 'jawline', chin: 'chin', under_eyes: 'under-eyes', smile_lines: 'smile lines', temples: 'temples', unsure: 'unsure of area' },
  laser_area: { face: 'face', neck: 'neck', chest: 'chest', arms: 'arms', legs: 'legs', underarms: 'underarms', bikini: 'bikini line', back: 'back' },
};

export const GOAL_KEY = { botox: 'goal_botox', fillers: 'goal_fillers', laser: 'goal_laser', unsure: 'goal_unsure' };
export const HISTORY_KEY = { botox: 'botox_history', fillers: 'filler_history', laser: 'laser_history' };
export const AREA_KEY = { botox: 'botox_area', fillers: 'filler_area', laser: 'laser_area' };

const STAGE_TAG = {
  'Ready for consult': 'ready_consult',
  'Photo review recommended': 'photo_review',
  'Wait and prepare': 'wait_prepare',
  'Education first': 'education_first',
  'Specialist review recommended': 'specialist_review',
};

// --- Path routing ----------------------------------------------------------
// `key` selects the granular report copy; `family` the shared copy.
function routeBotox(a) {
  switch (a.goal_botox) {
    case 'movement': return { family: 'botox', key: 'botox_movement', path: 'Anti-wrinkle consultation' };
    case 'rest': return { family: 'botox', key: 'botox_rest', path: 'Anti-wrinkle and skin quality review' };
    case 'prevent': return { family: 'botox', key: 'botox_prevent', path: 'Preventative anti-wrinkle consultation' };
    case 'refresh': return { family: 'botox', key: 'botox_refresh', path: 'Refreshed look consultation' };
    default: return { family: 'botox', key: 'botox_guidance', path: 'Anti-wrinkle guidance', guidance: true };
  }
}

function routeFillers(a) {
  if (a.filler_history === 'unhappy') return { family: 'fillers', key: 'filler_previous', path: 'Previous filler review' };
  switch (a.goal_fillers) {
    case 'lips': return { family: 'fillers', key: 'filler_lips', path: 'Lip filler consultation' };
    case 'volume': return { family: 'fillers', key: 'filler_volume', path: 'Facial volume consultation' };
    case 'contour': return { family: 'fillers', key: 'filler_contour', path: 'Jawline and chin contour consultation' };
    case 'under_eyes': return { family: 'fillers', key: 'filler_under_eyes', path: 'Under-eye review' };
    default: return { family: 'fillers', key: 'filler_guidance', path: 'Dermal filler guidance', guidance: true };
  }
}

function routeLaser(a) {
  switch (a.goal_laser) {
    case 'pigment': return { family: 'laser', key: 'laser_pigment', path: 'Pigmentation laser review' };
    case 'texture': return { family: 'laser', key: 'laser_texture', path: 'Skin texture laser consultation' };
    case 'redness': return { family: 'laser', key: 'laser_redness', path: 'Redness laser review' };
    case 'hair': return { family: 'laser', key: 'laser_hair', path: 'Laser hair removal consultation' };
    default: return { family: 'laser', key: 'laser_guidance', path: 'Laser treatment guidance', guidance: true };
  }
}

function routeUnsure() {
  return { family: 'match', key: 'match', path: 'Personalised treatment match' };
}

// --- Wait-and-prepare triggers ---------------------------------------------
// Generic and safe. Each id doubles as a caution flag and selects the
// plain-English reason in content.js (WAIT_REASONS).
export function waitReasonsFor(branch, a = {}) {
  const r = [];
  if (a[HISTORY_KEY[branch]] === 'recent') r.push('recent_treatment');
  if (branch === 'laser' && ['tan', 'self_tan', 'sun_soon'].includes(a.laser_sun)) r.push('recent_sun');
  if (has(a.health, 'pregnant')) r.push('pregnancy_breastfeeding');
  if (has(a.health, 'skin_issue')) r.push('active_skin_issue');
  return r;
}

// --- Readiness stage --------------------------------------------------------
function readinessFor(branch, a, route, waits) {
  if (waits.length) return 'Wait and prepare';
  if (has(a.health, 'medical_unsure')) return 'Specialist review recommended';

  if (branch === 'unsure') {
    const g = a.goal_unsure;
    if (g === 'am_i_ready' || g === 'consult_or_photo') return 'Photo review recommended';
    if (g === 'talk_first') return 'Specialist review recommended';
    return 'Education first';
  }
  if (branch === 'fillers') {
    if (a.filler_history === 'unhappy') return 'Specialist review recommended';
    if (a.filler_history === 'unsure_what' || route.key === 'filler_under_eyes' || has(a.filler_area, 'under_eyes')) return 'Photo review recommended';
  }
  if (branch === 'laser') {
    if (a.laser_history === 'reaction') return 'Specialist review recommended';
    if (route.key === 'laser_pigment' || route.key === 'laser_redness') return 'Photo review recommended';
  }
  if (route.guidance || a.timeline === 'unsure_ready') return 'Education first';
  return 'Ready for consult';
}

// --- Next step --------------------------------------------------------------
function nextStepFor(stage) {
  if (stage === 'Wait and prepare') return 'wait_prepare';
  if (stage === 'Education first') return 'learn_more';
  if (stage === 'Photo review recommended') return 'photo_review';
  if (stage === 'Specialist review recommended') return 'specialist_call';
  return 'consult';
}

// --- Caution flags ----------------------------------------------------------
function cautionFlagsFor(branch, a, waits) {
  const flags = [];
  if (waits.length) flags.push('wait_prepare', ...waits);
  if (has(a.health, 'pregnant') || has(a.health, 'medical_unsure')) flags.push('medical_clearance_possible');
  if (branch === 'fillers' && (a.filler_history === 'unhappy' || a.filler_history === 'unsure_what')) flags.push('previous_filler');
  if (branch === 'fillers' && (a.goal_fillers === 'under_eyes' || has(a.filler_area, 'under_eyes'))) flags.push('delicate_area');
  if (branch === 'laser' && a.laser_history === 'reaction') flags.push('previous_reaction');
  return [...new Set(flags)];
}

// --- CRM tags ---------------------------------------------------------------
function tagsFor(branch, a, route, stage, flags) {
  const tags = new Set();
  if (branch === 'botox' || branch === 'fillers' || branch === 'laser') tags.add(`interest_${branch}`);
  if (route.key && route.family !== 'match') tags.add(`path_${route.key}`);
  const stageTag = STAGE_TAG[stage];
  if (stageTag) tags.add(stageTag);
  if (a.timeline === 'event') tags.add('event_timeline');
  if (a.timeline === 'researching') tags.add('researching');
  if (a[HISTORY_KEY[branch]] && a[HISTORY_KEY[branch]] !== 'none') tags.add('returning_patient');
  for (const id of ids(a[AREA_KEY[branch]])) if (id !== 'unsure') tags.add(`area_${id}`);
  for (const f of flags) if (f !== 'wait_prepare') tags.add(f);
  if (a.barrier && a.barrier !== 'nothing') {
    tags.add('has_hesitation');
    tags.add(`barrier_${a.barrier}`);
  }
  return [...tags];
}

// The hesitation, phrased as a follow-up angle for the clinic.
const BARRIER_ANGLE = {
  natural: 'reassure on subtle, natural-looking results',
  needles: 'walk through what each step feels like and comfort options',
  safety: 'lead with the health check and how suitability is assessed',
  judged: 'lead with privacy and subtle results',
  cost: 'be upfront about cost and payment options',
  nothing: 'ready to move, keep momentum',
};

const NEXT_TEXT = {
  consult: 'offer a free consultation',
  photo_review: 'ask for clear natural-light photos before consult',
  specialist_call: 'book a call with a clinician before anything else',
  wait_prepare: 'send prep guidance and follow up when timing is right',
  learn_more: 'lead with education, no pressure to book',
};

// --- Internal lead summary --------------------------------------------------
function label(map, key) {
  return (map && map[key]) || null;
}

function internalSummary(name, branch, a, route, stage, nextStepId, flags) {
  const who = name && name.trim() ? name.trim() : 'This lead';
  const interest = label(LABELS.concern, a.concern) || 'a treatment';
  const goal = label(LABELS[GOAL_KEY[branch]], a[GOAL_KEY[branch]]);
  const timeline = label(LABELS.timeline, a.timeline);
  const areaKey = AREA_KEY[branch];
  const area = areaKey
    ? (ids(a[areaKey]).map((id) => label(LABELS[areaKey], id)).filter(Boolean).join(', ') || null)
    : null;

  const parts = [];
  parts.push(`${who} is interested in ${interest}.`);
  if (goal) parts.push(`Main goal: ${goal}${area ? ` (areas: ${area})` : ''}.`);
  parts.push(`Best-fit path: ${route.path}.`);
  if (timeline) parts.push(`Timing: ${timeline}.`);
  parts.push(`Readiness stage: ${stage.toLowerCase()}.`);
  parts.push(`Suggested next step: ${NEXT_TEXT[nextStepId]}.`);
  if (a.barrier && a.barrier !== 'nothing' && BARRIER_ANGLE[a.barrier]) {
    parts.push(`Follow-up angle: ${BARRIER_ANGLE[a.barrier]}.`);
  }
  if (flags.length) parts.push(`Caution flags: ${flags.map((f) => f.replace(/_/g, ' ')).join(', ')}.`);
  return parts.join(' ');
}

// --- Public entry -----------------------------------------------------------
// answers: { concern, goal_botox|goal_fillers|goal_laser|goal_unsure, timeline,
//   botox_history|filler_history|laser_history, laser_sun,
//   botox_area|filler_area|laser_area (arrays), health (array), barrier }
// meta (optional): { name } for the internal summary.
export function assess(answers = {}, meta = {}) {
  const a = answers || {};
  const branch = ['botox', 'fillers', 'laser'].includes(a.concern) ? a.concern : 'unsure';

  let route;
  if (branch === 'botox') route = routeBotox(a);
  else if (branch === 'fillers') route = routeFillers(a);
  else if (branch === 'laser') route = routeLaser(a);
  else route = routeUnsure(a);

  const waits = waitReasonsFor(branch, a);
  const readinessStage = readinessFor(branch, a, route, waits);
  const nextStepId = nextStepFor(readinessStage);
  const cautionFlags = cautionFlagsFor(branch, a, waits);
  const tags = tagsFor(branch, a, route, readinessStage, cautionFlags);
  const summary = internalSummary(meta.name, branch, a, route, readinessStage, nextStepId, cautionFlags);

  return {
    branch,
    goal: a[GOAL_KEY[branch]] || null,
    timeline: a.timeline || null,
    barrier: a.barrier || null,
    areas: ids(a[AREA_KEY[branch]]),
    pathFamily: route.family, // botox | fillers | laser | match
    pathKey: route.key,
    bestFitPath: route.path,
    readinessStage,
    waitReasons: waits,
    nextStepId,
    cautionFlags,
    tags,
    internalSummary: summary,
    // `checklistKey` selects the photo shot list in content.js.
    checklistKey: branch,
  };
}

export default assess;
