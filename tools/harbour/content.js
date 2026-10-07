// Harbour Aesthetics (FICTIONAL demo clinic) — Treatment Chart assessment.
// Content layer: the question graph, the branch flow and the report copy.
// Routing logic lives in assessment.js (pure, tested). Question/option IDs here
// are the contract both sides agree on.
//
// Compliance: guidance only. No dosing, unit counts, prices or clinical
// intervals stated as fact. Clinical specifics are "the clinic confirms".

// ---------------------------------------------------------------------------
// Screens — one question per screen. `multi: true` screens are rendered by the
// multi-select picker and store an array. An `exclusive` option clears others.
// ---------------------------------------------------------------------------
export const SCREENS = {
  concern: {
    id: 'concern',
    question: 'What would you like to change?',
    help: 'Pick the one that feels closest. You can add detail in a moment.',
    options: [
      { id: 'botox', label: 'Lines and wrinkles' },
      { id: 'fillers', label: 'Volume, lips or contour' },
      { id: 'laser', label: 'Skin tone, texture or hair removal' },
      { id: 'unsure', label: "I'm not sure yet" },
    ],
  },

  goal_botox: {
    id: 'goal_botox',
    question: 'Which lines bother you most?',
    options: [
      { id: 'movement', label: 'Lines that show when I frown, smile or raise my brows' },
      { id: 'rest', label: 'Lines that stay when my face is relaxed' },
      { id: 'prevent', label: 'I want to stop lines setting in' },
      { id: 'refresh', label: 'I want to look less tired or stressed' },
      { id: 'unsure', label: "I'm not sure what I need" },
    ],
  },
  goal_fillers: {
    id: 'goal_fillers',
    question: 'What would you most like to change?',
    options: [
      { id: 'lips', label: 'Fuller or more defined lips' },
      { id: 'volume', label: 'Lost volume in my cheeks or face' },
      { id: 'contour', label: 'A sharper jawline or chin' },
      { id: 'under_eyes', label: 'Hollows or shadows under my eyes' },
      { id: 'unsure', label: "I'm not sure what I need" },
    ],
  },
  goal_laser: {
    id: 'goal_laser',
    question: 'What would you most like to change?',
    options: [
      { id: 'pigment', label: 'Sun spots, pigment or uneven tone' },
      { id: 'texture', label: 'Texture, pores or fine lines' },
      { id: 'redness', label: 'Redness or thread veins' },
      { id: 'hair', label: 'Unwanted hair' },
      { id: 'unsure', label: "I'm not sure which laser I need" },
    ],
  },
  goal_unsure: {
    id: 'goal_unsure',
    question: 'What would feel like a helpful outcome?',
    options: [
      { id: 'which_fits', label: 'Know which treatment might fit' },
      { id: 'am_i_ready', label: "Understand if I'm ready" },
      { id: 'consult_or_photo', label: 'Know whether I need a consult or photo review' },
      { id: 'what_affects', label: 'Learn what could affect my result' },
      { id: 'talk_first', label: 'Talk to someone before deciding' },
    ],
  },

  timeline: {
    id: 'timeline',
    question: 'Where are you in the process?',
    options: [
      { id: 'ready', label: 'Ready to book soon' },
      { id: 'researching', label: 'Researching options' },
      { id: 'waiting', label: 'Waiting for the right time' },
      { id: 'event', label: 'I have an event or date coming up' },
      { id: 'unsure_ready', label: "Not sure if I'm ready" },
    ],
  },

  // --- Treatment history (the "recent treatment" wait trigger) ---
  botox_history: {
    id: 'botox_history',
    question: 'Have you had anti-wrinkle injections before?',
    help: 'A rough guess is fine.',
    options: [
      { id: 'none', label: 'No, this would be my first time' },
      { id: 'recent', label: 'Yes, in the last 3 months' },
      { id: 'older', label: 'Yes, more than 3 months ago' },
      { id: 'unsure', label: "Yes, but I can't remember when" },
    ],
  },
  filler_history: {
    id: 'filler_history',
    question: 'Have you had dermal filler before?',
    help: 'A rough guess is fine.',
    options: [
      { id: 'none', label: 'No, this would be my first time' },
      { id: 'recent', label: 'Yes, in the last 6 months' },
      { id: 'older', label: 'Yes, more than 6 months ago' },
      { id: 'unhappy', label: "Yes, and I'm not happy with how it looks" },
      { id: 'unsure_what', label: "Yes, but I'm not sure what was used" },
    ],
  },
  laser_history: {
    id: 'laser_history',
    question: 'Have you had laser or IPL before?',
    help: 'A rough guess is fine.',
    options: [
      { id: 'none', label: 'No, this would be my first time' },
      { id: 'recent', label: 'Yes, in the last month' },
      { id: 'older', label: 'Yes, more than a month ago' },
      { id: 'reaction', label: 'Yes, and my skin reacted badly' },
    ],
  },
  laser_sun: {
    id: 'laser_sun',
    question: 'Have you had a tan or much sun lately?',
    help: 'Include fake tan and sunbeds.',
    options: [
      { id: 'no', label: 'No, my skin is its usual shade' },
      { id: 'tan', label: 'Yes, a tan or sunburn in the last few weeks' },
      { id: 'self_tan', label: 'I use fake tan' },
      { id: 'sun_soon', label: 'I have a sunny holiday coming up' },
      { id: 'unsure', label: 'Not sure' },
    ],
  },

  // --- Areas (multi-select) ---
  botox_area: {
    id: 'botox_area',
    multi: true,
    question: 'Which areas would you like to treat?',
    options: [
      { id: 'forehead', label: 'Forehead lines' },
      { id: 'frown', label: 'Frown lines between the brows' },
      { id: 'crows', label: "Crow's feet" },
      { id: 'bunny', label: 'Lines on the nose' },
      { id: 'chin', label: 'Dimpled chin' },
      { id: 'jaw', label: 'Jaw clenching or grinding' },
      { id: 'unsure', label: 'Not sure yet', exclusive: true },
    ],
  },
  filler_area: {
    id: 'filler_area',
    multi: true,
    question: 'Which areas would you like to treat?',
    options: [
      { id: 'lips', label: 'Lips' },
      { id: 'cheeks', label: 'Cheeks' },
      { id: 'jawline', label: 'Jawline' },
      { id: 'chin', label: 'Chin' },
      { id: 'under_eyes', label: 'Under-eyes' },
      { id: 'smile_lines', label: 'Smile lines' },
      { id: 'temples', label: 'Temples' },
      { id: 'unsure', label: 'Not sure yet', exclusive: true },
    ],
  },
  laser_area: {
    id: 'laser_area',
    multi: true,
    question: 'Which areas would you like to treat?',
    options: [
      { id: 'face', label: 'Face' },
      { id: 'neck', label: 'Neck' },
      { id: 'chest', label: 'Chest' },
      { id: 'arms', label: 'Arms or hands' },
      { id: 'legs', label: 'Legs' },
      { id: 'underarms', label: 'Underarms' },
      { id: 'bikini', label: 'Bikini line' },
      { id: 'back', label: 'Back or shoulders' },
    ],
  },

  // --- Health check (shared, multi-select) ---
  health: {
    id: 'health',
    multi: true,
    question: 'Does any of this apply to you right now?',
    help: 'Select all that apply. This stays private and helps the clinic plan safely.',
    options: [
      { id: 'pregnant', label: 'Pregnant or breastfeeding' },
      { id: 'skin_issue', label: 'An active skin issue in the area, like a breakout, cold sore or irritation' },
      { id: 'medical_unsure', label: "I'm unsure about something in my medical history" },
      { id: 'none', label: 'None of these', exclusive: true },
    ],
  },

  // The emotional pivot. Every option is a common hesitation, and the report
  // answers whichever one they pick.
  barrier: {
    id: 'barrier',
    question: "What's holding you back, if anything?",
    help: "There's no wrong answer. It helps the clinic meet you where you are.",
    options: [
      { id: 'natural', label: "I worry I won't look like me" },
      { id: 'needles', label: "I'm nervous about needles or pain" },
      { id: 'safety', label: "I want to know it's safe for me" },
      { id: 'judged', label: 'I worry what people will think' },
      { id: 'cost', label: "I'm unsure about the cost" },
      { id: 'nothing', label: "Honestly, nothing. I'm ready" },
    ],
  },
};

// ---------------------------------------------------------------------------
// Flow — ordered screen IDs per branch. `contact` and `result` are terminal
// screens rendered by the UI, not SCREENS.
// ---------------------------------------------------------------------------
export function flowFor(concern) {
  switch (concern) {
    case 'botox':
      return ['concern', 'goal_botox', 'timeline', 'botox_history', 'botox_area', 'health', 'barrier', 'contact', 'result'];
    case 'fillers':
      return ['concern', 'goal_fillers', 'timeline', 'filler_history', 'filler_area', 'health', 'barrier', 'contact', 'result'];
    case 'laser':
      return ['concern', 'goal_laser', 'timeline', 'laser_history', 'laser_sun', 'laser_area', 'health', 'barrier', 'contact', 'result'];
    case 'unsure':
      return ['concern', 'goal_unsure', 'timeline', 'health', 'barrier', 'contact', 'result'];
    default:
      return ['concern'];
  }
}

// ---------------------------------------------------------------------------
// Report copy.
// pathLogic + outcomeGuide are keyed by pathKey with a family fallback; the
// rest by family or checklistKey (branch).
// ---------------------------------------------------------------------------
export const REPORT = {
  // "Why this path fits"
  pathLogic: {
    botox_movement:
      'You picked lines that show when your face moves. Anti-wrinkle injections relax the muscles behind ' +
      'those expression lines, so they soften when you frown, smile or raise your brows. The clinic checks ' +
      'how your face moves before suggesting anything.',
    botox_rest:
      'You picked lines that stay when your face is relaxed. Anti-wrinkle injections can soften these, and ' +
      'deeper resting lines sometimes respond best alongside a skin treatment. The clinic tells you which ' +
      'approach suits your lines on your call.',
    botox_prevent:
      "You'd like to stop lines setting in. Some people start anti-wrinkle treatment early for this reason, " +
      'often with a light approach. The clinic talks you through whether it makes sense for you yet.',
    botox_refresh:
      "You'd like to look less tired or stressed. Frown lines and a heavy brow often drive that look, and " +
      'anti-wrinkle injections are one way to soften them. The clinic may suggest other options too once ' +
      "they've seen your face.",
    botox_guidance:
      "Some lines bother you and you'd like to know the right fix. That's a good place to start. The clinic " +
      'looks at how your face moves and explains your options in plain terms.',
    filler_lips:
      "You'd like fuller or more defined lips. Lip filler adds shape and volume, and it can be kept very " +
      'subtle. The clinic looks at your lips alongside the rest of your face so any change stays in balance.',
    filler_volume:
      'You mentioned lost volume. Dermal filler can restore some of that support in areas like the cheeks, ' +
      'which can lift how the face looks overall. The clinic assesses where volume has changed before ' +
      'suggesting anything.',
    filler_contour:
      "You'd like a sharper jawline or chin. Filler can add definition along the jaw and shape to the chin, " +
      'which changes how your profile reads. The clinic checks your proportions first.',
    filler_under_eyes:
      'You picked hollows or shadows under the eyes. This area is delicate, and filler suits some people ' +
      'better than others, so the clinic wants to see it before advising. A photo review is the best first step.',
    filler_previous:
      "You've had filler before and you're unhappy with how it looks. The clinic would look at what's there " +
      'now before suggesting anything new, so a specialist review is the right place to begin.',
    filler_guidance:
      "You'd like to know which filler treatment fits. The clinic looks at your face as a balance and " +
      'explains where filler could help you.',
    laser_pigment:
      'You picked sun spots, pigment or uneven tone. Laser can target pigment in the skin, and the right ' +
      "choice depends on your skin type and what's causing the marks. That's why the clinic wants to see " +
      'your skin first.',
    laser_texture:
      "You'd like smoother texture, smaller-looking pores or softer fine lines. Laser resurfacing works on " +
      'texture over a course of sessions. The clinic recommends the approach that suits your skin type.',
    laser_redness:
      'You picked redness or thread veins. Some lasers target redness in the skin, and the right one depends ' +
      'on your skin and the cause. The clinic wants to see your skin before advising.',
    laser_hair:
      "You'd like to reduce unwanted hair. Laser hair removal works over a course of sessions, and how well " +
      'it works depends on your hair and skin colour. The clinic checks this at your consultation.',
    laser_guidance:
      "You'd like to improve your skin and want to know which laser fits. The clinic looks at your skin " +
      'type and goals and explains the options in plain terms.',
    match:
      'Your answers could point to more than one treatment, which is common and completely fine. A clinician ' +
      'can look at the details and tell you which makes sense as a first step.',
  },

  // "Realistic outcome guide"
  outcomeGuide: {
    botox: {
      helps: 'softening expression lines so your face looks more rested.',
      notExpect: 'a permanent change. Results wear off over time, and the clinic explains what to expect for you.',
    },
    fillers: {
      helps: 'restoring volume, adding shape or defining features in a way that suits your face.',
      notExpect: 'a permanent result, or the final look on day one. Filler breaks down over time, and some swelling is normal at first.',
    },
    laser: {
      helps: 'evening out tone, smoothing texture or reducing hair over a course of sessions.',
      notExpect: 'a finished result after one session. Laser usually works over a course, with sun protection in between.',
    },
    laser_hair: {
      helps: 'reducing unwanted hair over a course of sessions, so there is less to shave or wax.',
      notExpect: 'the same result for everyone. Hair and skin colour change how well it works, which the clinic checks first.',
    },
    match: {
      helps: "a clearer sense of which direction fits, so you aren't guessing when you reach out.",
      notExpect: 'a final answer today. The right path depends on details a clinician would review with you first.',
    },
  },

  // "What may affect your result"
  whatAffects: {
    botox: ['How your face moves', 'How deep the lines are at rest', 'Previous treatments', 'Your skin quality', 'Sun exposure and lifestyle', 'How subtle you want the result'],
    fillers: ['Your facial proportions', 'Skin quality', 'Previous filler', 'How much change you want', 'Swelling and healing', 'Upcoming events'],
    laser: ['Skin type and tone', 'Recent sun or tan', 'Hair colour, for hair removal', 'Previous laser or IPL', 'Medication and skin products', 'Aftercare and daily SPF'],
    match: ['Your main goal', 'Your skin type', 'Previous treatments', 'Your health right now', 'How much change you want', 'Your timing'],
  },

  // "Photo review shot list", keyed by checklistKey (branch).
  shotList: {
    botox: {
      shots: ['Face relaxed, straight on', 'Frowning', 'Raising your eyebrows', "Smiling widely, to show crow's feet"],
      light: 'Natural light, no flash.', avoid: 'No makeup, filters or editing.',
    },
    fillers: {
      shots: ['Straight on, face relaxed', 'Left and right profile', 'A three-quarter angle from each side', 'A close-up of the area you want to change'],
      light: 'Natural light, no flash.', avoid: 'No makeup or filters.',
    },
    laser: {
      shots: ['A close-up of the area in natural light', 'A wider photo showing where it sits', 'Any spots or redness you most want treated'],
      light: 'Natural window light.', avoid: 'No makeup, filters or fake tan.',
    },
    unsure: {
      shots: ["A clear photo of your face, straight on, if you're comfortable"],
      light: 'Natural light.', avoid: 'No filters.',
    },
  },

  // "Questions to ask on your call"
  consultQuestions: {
    botox: ['Which areas would suit me best?', 'How do you keep the result natural?', 'How soon will I see a result, and how long does it last?', 'What aftercare should I follow?', 'What happens at the review appointment?'],
    fillers: ['Which product would you use, and why?', 'How subtle can the result be?', 'What swelling or bruising should I expect?', 'How long does the result usually last?', "What happens if I don't like it?"],
    laser: ['Which laser suits my skin type?', 'Do I need a patch test first?', 'How many sessions should I expect?', 'How should I prepare, and what about the sun?', 'What does aftercare involve?'],
    match: ['Which treatment fits my goal best?', 'Is now a good time, or should I wait?', 'What result is realistic for me?', 'What would a first step look like?', 'Roughly what does it cost?'],
  },

  // Readiness stage, short explanation under the stage name.
  readinessMeaning: {
    'Ready for consult':
      'Nothing in your answers suggests a reason to wait. A free consultation is a natural next step.',
    'Photo review recommended':
      'The best advice here depends on how your skin or features look. A quick photo review is the most useful first step.',
    'Wait and prepare':
      "Something in your answers means it's better to hold off on treatment for now. That's common, and easy to plan around.",
    'Education first':
      "You're early in the process, which is a good place to be. A little guidance first will make any next step clearer.",
    'Specialist review recommended':
      'There is a detail in your answers a clinician should talk through with you first. A short call is the quickest way to a clear plan.',
  },

  // Next-step CTA copy, keyed by the recommended step id.
  nextStep: {
    consult: { primary: 'Book a free consultation', note: 'A short, private chat about your options. There is no pressure to book treatment.' },
    photo_review: { primary: 'Start with a photo review', note: 'Send a few clear photos so the clinic can guide your next step.' },
    specialist_call: { primary: 'Book a specialist call', note: 'A private call with a clinician to talk through your answers first.' },
    wait_prepare: { primary: 'Book a free consultation', note: 'Plan ahead now, and start treatment when the timing is right.' },
    learn_more: { primary: 'Learn more first', note: 'A little context before you decide anything.' },
  },

  // The hesitation answered. Warm, compliance-safe, never a promise.
  barrierResponse: {
    natural:
      'Looking overdone is the most common worry people bring to a first appointment. A careful clinic ' +
      'starts gently and builds slowly, so you still look like yourself. Asking for subtle is a perfectly ' +
      'good request.',
    needles:
      'Plenty of people feel nervous about needles or discomfort. The clinic can talk you through what each ' +
      'step feels like and the comfort options they use, before anything happens. You can stop and ask ' +
      'questions at any point.',
    safety:
      "Wanting to know it's safe for you is the right instinct. A proper consultation covers your health, " +
      "medication and history before any treatment is offered, and the clinic will tell you plainly if " +
      "something isn't right for you.",
    judged:
      "Lots of people keep treatments private, and that's your call to make. Subtle results are designed to " +
      'look like a well-rested version of you. Anything you share stays between you and the clinic.',
    cost:
      'Wanting to understand the cost is sensible. The clinic can walk you through prices and options at a ' +
      'free consultation, before you commit to anything.',
    nothing:
      "Then let's keep things moving. You've got a clear place to start.",
  },
};

// Plain-English reason for each wait-and-prepare trigger (ids match
// waitReasonsFor in assessment.js). Shown in the readiness and plan sections.
export const WAIT_REASONS = {
  recent_treatment: 'You had treatment in this area recently. Give it time to settle so the clinic can see where things stand.',
  recent_sun: 'Recent sun or tan, including fake tan, can change how skin responds to laser. Let it fade first.',
  pregnancy_breastfeeding: 'Most clinics hold off on these treatments during pregnancy and breastfeeding.',
  active_skin_issue: 'An active skin issue in the area should clear before treatment.',
};
export const WAIT_CONFIRM = 'The clinic confirms when to start on your call.';

// ---------------------------------------------------------------------------
// Personalisation — restate the visitor's own answers as 1–3 sentences.
// Area lists are always the object of a sentence, never its subject, so one
// area and several areas read correctly with the same verbs.
// ---------------------------------------------------------------------------
const PHRASE = {
  goal_botox: {
    movement: 'softer lines when your face moves', rest: 'softer lines when your face is relaxed',
    prevent: 'fewer lines setting in over time', refresh: 'a less tired, less stressed look',
    unsure: 'guidance on what you need',
  },
  goal_fillers: {
    lips: 'fuller or more defined lips', volume: 'some of your lost volume back',
    contour: 'a sharper jawline or chin', under_eyes: 'softer hollows under your eyes',
    unsure: 'guidance on what would suit you',
  },
  goal_laser: {
    pigment: 'a more even skin tone', texture: 'smoother skin texture', redness: 'less redness',
    hair: 'less unwanted hair', unsure: 'guidance on which laser fits',
  },
  goal_unsure: {
    which_fits: 'knowing which treatment might fit', am_i_ready: "understanding whether you're ready",
    consult_or_photo: 'knowing whether to book or send photos first',
    what_affects: 'learning what shapes the result', talk_first: 'talking it through before deciding',
  },
  botox_area: { forehead: 'forehead lines', frown: 'frown lines', crows: "crow's feet", bunny: 'nose lines', chin: 'chin', jaw: 'jaw' },
  filler_area: { lips: 'lips', cheeks: 'cheeks', jawline: 'jawline', chin: 'chin', under_eyes: 'under-eyes', smile_lines: 'smile lines', temples: 'temples' },
  laser_area: { face: 'face', neck: 'neck', chest: 'chest', arms: 'arms or hands', legs: 'legs', underarms: 'underarms', bikini: 'bikini line', back: 'back' },
  history: {
    none: 'This would be your first treatment.',
    recent: 'Your last treatment was recent.',
    older: "You've had treatment before.",
    unsure: "You've had treatment before.",
    unhappy: "You've had filler before and would like a second opinion on it.",
    unsure_what: "You've had filler before.",
    reaction: 'Your skin reacted to a previous treatment, which the clinic will want to hear about.',
  },
  laser_sun: {
    tan: "You've had a tan or some sun recently.",
    self_tan: 'You use fake tan.',
    sun_soon: "You've got a sunny holiday coming up.",
  },
};

const GOALS = { botox: 'goal_botox', fillers: 'goal_fillers', laser: 'goal_laser' };
const AREAS = { botox: 'botox_area', fillers: 'filler_area', laser: 'laser_area' };
const HISTORY = { botox: 'botox_history', fillers: 'filler_history', laser: 'laser_history' };

// "lips" / "lips and cheeks" / "lips, cheeks and chin". Ignores "unsure".
export function listAreas(areaKey, value) {
  const list = (Array.isArray(value) ? value : value ? [value] : [])
    .map((id) => PHRASE[areaKey] && PHRASE[areaKey][id]).filter(Boolean);
  if (!list.length) return '';
  if (list.length === 1) return list[0];
  return `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`;
}

export function personalSummary(answers = {}) {
  const a = answers;
  const branch = a.concern;

  if (GOALS[branch]) {
    const goal = PHRASE[GOALS[branch]][a[GOALS[branch]]];
    const areas = listAreas(AREAS[branch], a[AREAS[branch]]);
    let s = `You're hoping for ${goal || 'a change you can feel good about'}`;
    // Skip the area clause when it only repeats the goal ("fuller lips, focused on your lips").
    if (areas && !goal?.includes(areas)) s += `, focused on your ${areas}`;
    s += '.';
    const hist = PHRASE.history[a[HISTORY[branch]]];
    if (hist) s += ` ${hist}`;
    if (branch === 'laser' && PHRASE.laser_sun[a.laser_sun]) s += ` ${PHRASE.laser_sun[a.laser_sun]}`;
    return s;
  }

  const g = PHRASE.goal_unsure[a.goal_unsure];
  return `You're still weighing where to start${g ? `, and what would help most is ${g}` : ''}.`;
}

// Caution-flag codes → human labels.
export const FLAG_LABELS = {
  wait_prepare: 'Timing: better to wait before treatment',
  recent_treatment: 'Recent treatment in the same area',
  recent_sun: 'Recent sun, tan or upcoming sun exposure',
  pregnancy_breastfeeding: 'Pregnant or breastfeeding',
  active_skin_issue: 'Active skin issue in the area',
  medical_clearance_possible: 'Medical clearance may be requested',
  previous_filler: 'Previous filler to review',
  delicate_area: 'Delicate area (under-eyes)',
  previous_reaction: 'Previous reaction to laser or IPL',
};

export const DISCLAIMER =
  "This report is general guidance only. It doesn't replace a consultation or medical advice. " +
  'A qualified clinician confirms whether treatment is right for you.';
