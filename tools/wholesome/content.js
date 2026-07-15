// Wholesome Empire — Private Treatment Path Assessment.
// Content layer: the question graph, the branch flow, and the report copy.
// The scoring/routing logic lives in assessment.js (pure, tested). The UI
// imports both. Question/option IDs here are the contract both sides agree on.
//
// All narrative copy is a stub pending brand-voice review. [NEEDS_VOICE_REVIEW]

// ---------------------------------------------------------------------------
// Screens — one question per screen. Each option has a stable `id` + `label`.
// ---------------------------------------------------------------------------
export const SCREENS = {
  concern: {
    id: 'concern',
    eyebrow: 'Where you are',
    question: 'What are you hoping to improve?',
    help: 'Pick the one that feels closest. You can add detail in a moment.',
    options: [
      { id: 'scars', label: 'Scars or stretch marks' },
      { id: 'smp', label: 'Hairline, thinning, or scalp density' },
      { id: 'brows', label: 'Brows' },
      { id: 'unsure', label: "I'm not sure yet" },
    ],
  },

  goal_scars: {
    id: 'goal_scars',
    eyebrow: 'Your goal',
    question: 'What are you most hoping to change?',
    options: [
      { id: 'texture', label: 'Texture, raised areas, or skin damage' },
      { id: 'colour', label: 'Colour difference or visible contrast' },
      { id: 'both', label: 'Both texture and colour' },
      { id: 'unsure', label: "I'm not sure what treatment I need" },
    ],
  },
  goal_smp: {
    id: 'goal_smp',
    eyebrow: 'Your goal',
    question: 'What best describes your scalp or hair goal?',
    options: [
      { id: 'subtle', label: 'Add the look of density' },
      { id: 'stronger', label: 'Define or rebuild my hairline' },
      { id: 'blend', label: 'Blend a thinning crown' },
      { id: 'shaved', label: 'Create a shaved scalp look' },
      { id: 'scar_less', label: 'Camouflage a scalp scar' },
    ],
  },
  goal_brows: {
    id: 'goal_brows',
    eyebrow: 'Your goal',
    question: 'What brow result are you looking for?',
    options: [
      { id: 'natural', label: 'Very natural' },
      { id: 'soft', label: 'Soft and filled' },
      { id: 'defined', label: 'More defined' },
      { id: 'shape', label: 'Better shape' },
      { id: 'less_makeup', label: 'Less daily makeup' },
      { id: 'unsure', label: 'Not sure, I want guidance' },
    ],
  },
  goal_unsure: {
    id: 'goal_unsure',
    eyebrow: 'Your goal',
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
    eyebrow: 'Your timing',
    question: 'Where are you in the process?',
    options: [
      { id: 'ready', label: 'Ready to book soon' },
      { id: 'researching', label: 'Researching options' },
      { id: 'waiting', label: 'Waiting for the right time' },
      { id: 'event', label: 'I have an event or date coming up' },
      { id: 'unsure_ready', label: "Not sure if I'm ready" },
    ],
  },

  // --- Scar / stretch mark readiness ---
  scar_heal: {
    id: 'scar_heal',
    eyebrow: 'The area',
    question: 'How long has the area been healed or visible?',
    options: [
      { id: 'lt6', label: 'Less than 6 months' },
      { id: '6to12', label: '6 to 12 months' },
      { id: 'over1', label: 'More than 1 year' },
      { id: 'several', label: 'Several years' },
      { id: 'unsure', label: 'Not sure' },
    ],
  },
  scar_state: {
    id: 'scar_state',
    eyebrow: 'The area',
    question: 'Which best describes the area today?',
    options: [
      { id: 'flat', label: 'Flat and settled' },
      { id: 'raised', label: 'Raised' },
      { id: 'indented', label: 'Indented' },
      { id: 'changing', label: 'Still red, pink, or changing' },
      { id: 'sensitive', label: 'Sensitive or irritated' },
      { id: 'unsure', label: 'Not sure' },
    ],
  },
  scar_area: {
    id: 'scar_area',
    eyebrow: 'The area',
    question: 'What area are you looking to treat?',
    options: [
      { id: 'stomach', label: 'Stomach' },
      { id: 'hips_thighs', label: 'Hips or thighs' },
      { id: 'arms', label: 'Arms' },
      { id: 'chest_shoulders', label: 'Chest or shoulders' },
      { id: 'surgical', label: 'Surgical scar' },
      { id: 'injury', label: 'Injury scar' },
      { id: 'other', label: 'Other' },
    ],
  },

  // --- SMP readiness ---
  smp_situation: {
    id: 'smp_situation',
    eyebrow: 'Your scalp',
    question: 'What best describes your current hair situation?',
    options: [
      { id: 'thinning', label: 'Thinning but still have hair' },
      { id: 'receding', label: 'Receding hairline' },
      { id: 'crown', label: 'Thinning crown' },
      { id: 'bald', label: 'Bald or closely shaved' },
      { id: 'patchy', label: 'Patchy hair loss' },
      { id: 'scalp_scar', label: 'Scalp scar or hair transplant scar' },
    ],
  },
  smp_look: {
    id: 'smp_look',
    eyebrow: 'Your scalp',
    question: 'What look are you hoping for?',
    options: [
      { id: 'subtle', label: 'Subtle density' },
      { id: 'stronger', label: 'Stronger hairline' },
      { id: 'shaved', label: 'Shaved scalp look' },
      { id: 'blend', label: 'Blend thinning areas' },
      { id: 'scar_less', label: 'Make a scar less noticeable' },
    ],
  },
  smp_prior: {
    id: 'smp_prior',
    eyebrow: 'Your history',
    question: 'Have you had any previous hair restoration or scalp procedures?',
    options: [
      { id: 'none', label: 'No' },
      { id: 'transplant', label: 'Hair transplant' },
      { id: 'prev_smp', label: 'Previous SMP' },
      { id: 'scalp_scar', label: 'Scalp scar' },
      { id: 'unsure', label: 'Not sure' },
    ],
  },

  // --- Brow readiness ---
  brow_fill: {
    id: 'brow_fill',
    eyebrow: 'Your brows',
    question: 'Do you currently fill in your brows?',
    options: [
      { id: 'daily', label: 'Every day' },
      { id: 'sometimes', label: 'Sometimes' },
      { id: 'rarely', label: 'Rarely' },
      { id: 'no', label: 'No' },
      { id: 'prev_tattoo', label: 'I have previous brow tattooing' },
    ],
  },
  brow_prev: {
    id: 'brow_prev',
    eyebrow: 'Your history',
    question: 'Have you had previous brow tattooing or microblading?',
    options: [
      { id: 'none', label: 'No' },
      { id: 'faded', label: 'Yes, but it has faded' },
      { id: 'visible', label: 'Yes, and it is still visible' },
      { id: 'unsure', label: 'Not sure' },
    ],
  },
  brow_style: {
    id: 'brow_style',
    eyebrow: 'Your goal',
    question: 'What style feels closest to what you want?',
    options: [
      { id: 'natural', label: 'Natural' },
      { id: 'soft_powder', label: 'Soft powder' },
      { id: 'defined', label: 'Defined' },
      { id: 'fuller', label: 'Fuller' },
      { id: 'unsure', label: 'Not sure' },
    ],
  },

  // The emotional pivot — the one question no clinic form asks. Every option is
  // a real, common hesitation; there is no wrong answer. The report answers it.
  barrier: {
    id: 'barrier',
    eyebrow: 'One honest question',
    question: "What's really holding you back?",
    help: 'There is no wrong answer here. It only helps us meet you where you are.',
    options: [
      { id: 'natural', label: "I worry it won't look natural" },
      { id: 'hopeless', label: "I've been told nothing can be done" },
      { id: 'not_ready', label: "I'm not sure I'm ready" },
      { id: 'self_conscious', label: 'I feel self-conscious even asking' },
      { id: 'cost', label: "Whether it's worth the cost" },
      { id: 'nothing', label: "Honestly, nothing — I'm ready" },
    ],
  },
};

// ---------------------------------------------------------------------------
// Flow — ordered screen IDs per branch. Drives the UI's next/back + progress.
// `contact` and `result` are terminal screens rendered by the UI, not SCREENS.
// ---------------------------------------------------------------------------
export function flowFor(concern) {
  switch (concern) {
    case 'scars':
      return ['concern', 'goal_scars', 'timeline', 'scar_heal', 'scar_state', 'scar_area', 'barrier', 'contact', 'result'];
    case 'smp':
      return ['concern', 'goal_smp', 'timeline', 'smp_situation', 'smp_look', 'smp_prior', 'barrier', 'contact', 'result'];
    case 'brows':
      return ['concern', 'goal_brows', 'timeline', 'brow_fill', 'brow_prev', 'brow_style', 'barrier', 'contact', 'result'];
    case 'unsure':
      return ['concern', 'goal_unsure', 'timeline', 'barrier', 'contact', 'result'];
    default:
      // Before a concern is chosen, the flow is just the first question.
      return ['concern'];
  }
}

// ---------------------------------------------------------------------------
// Report copy — keyed by path family. Assembled by the UI from the computed
// result. Compliance rule: guidance only, never diagnosis. [NEEDS_VOICE_REVIEW]
// ---------------------------------------------------------------------------
export const REPORT = {
  // "What this means" — one short block per path family.
  whatThisMeans: {
    revision:
      'Your answers suggest scar or stretch mark revision may be worth exploring, ' +
      'especially if your main goal is improving texture, skin appearance, or visible skin damage. ' +
      'A specialist would still need to assess the area before recommending a treatment plan.',
    camouflage:
      'Your answers suggest camouflage may be worth reviewing if your main goal is blending colour ' +
      'difference or reducing visible contrast. The clinic would need to assess colour, texture, skin ' +
      'tone, and healing stage before confirming whether treatment is a fit.',
    smp:
      'Your answers suggest scalp micropigmentation may be a good fit if your goal is creating the look ' +
      'of fuller density, a more defined hairline, or a more even shaved scalp appearance.',
    brow:
      'Your answers suggest brow micropigmentation may be a good fit if your goal is better shape, more ' +
      'definition, or less daily brow makeup.',
    match:
      'Your answers suggest more than one path could fit, and the right starting point depends on details ' +
      'that are easier to read from photos or a short conversation. A specialist can help you narrow it down ' +
      'without any pressure to book.',
  },

  // "What may affect your result" — checklist per path family.
  whatAffects: {
    revision: ['Age of the area', 'Texture', 'Colour', 'Skin tone', 'Sensitivity', 'Previous treatments', 'Whether the area is still changing'],
    camouflage: ['Colour contrast', 'Skin tone', 'Texture', 'Age of the area', 'Tanning habits', 'Previous treatments', 'Healing stage'],
    smp: ['Hair colour', 'Existing density', 'Hairline preference', 'Skin tone', 'Hair length', 'Previous transplant or scalp scarring', 'Desired final look'],
    brow: ['Existing brow hair', 'Skin type', 'Previous brow tattooing', 'Desired shape', 'Makeup style', 'Maintenance preference'],
    match: ['Your main goal', 'The age and condition of the area', 'Skin tone and texture', 'Any previous treatments', 'How the area looks in natural light', 'What you want day to day'],
  },

  // Consult prep checklist — by branch (service group).
  checklist: {
    scars: [
      'Take 2 to 3 clear photos in natural light',
      'Include a close-up and a slightly pulled-back photo',
      'Note how long the area has been visible or healed',
      'Share any previous treatments',
      'Share whether the area is raised, indented, sensitive, or changing',
      'Write down your main goal: texture, colour, or both',
    ],
    smp: [
      'Take clear photos of your hairline, crown, sides, and top of scalp',
      'Note any hair transplant or scalp scar history',
      'Think about your preferred hairline style',
      'Share whether you want density, hairline definition, or a shaved scalp look',
      'Bring reference photos if helpful',
    ],
    brows: [
      'Take a clear photo of your brows with no makeup if possible',
      'Bring 2 to 3 inspiration photos',
      'Share any previous brow tattooing or microblading',
      'Think about whether you prefer natural, soft, or defined brows',
      'Share your usual makeup routine',
    ],
    unsure: [
      'Note the one concern you most want to improve',
      'Take a clear photo in natural light if you are comfortable',
      'Write down what a good result would look like for you',
      'Note anything that has changed recently in the area',
      'Jot down any questions you want answered first',
    ],
  },

  // Readiness stage — short explanation shown under the badge.
  readinessMeaning: {
    'Ready for consult':
      'Nothing in your answers points to a reason to wait. A short consult is a natural next step.',
    'Photo review recommended':
      'Fit here depends a lot on what the area actually looks like. A quick photo review is the most useful first step.',
    'Wait and prepare':
      'Your answers suggest the area may still be settling. Preparing now and reviewing a little later tends to give a better result.',
    'Education first':
      "You're early in the process, which is a good place to be. A little guidance first will make any next step clearer.",
    'Specialist review recommended':
      'Your answers point in a couple of directions. A specialist can look at the details and help you choose a starting point.',
  },

  // Next-step CTA copy, keyed by the recommended step id.
  nextStep: {
    consult_phone: { primary: 'Book a Free Phone Consult', note: 'A short, no-pressure call to talk through your options.' },
    photo_review: { primary: 'Start With a Photo Review', note: 'Send a few clear photos so the clinic can guide your next step.' },
    consult_brow: { primary: 'Book a Brow Consultation', note: 'A quick sit-down to plan shape, style, and finish.' },
    wait_prepare: { primary: 'Get Your Prep Guide', note: "We'll help you prepare now and revisit when the timing is right." },
    learn_more: { primary: 'Learn More First', note: 'A little context before you decide anything.' },
  },
};

// The fear answered — one warm, compliance-safe reply per hesitation. This is
// the emotional core of the report. Never promises a result. [NEEDS_VOICE_REVIEW]
REPORT.barrierResponse = {
  natural:
    "The fear of looking 'done' is the most common thing we hear — and it's exactly why good " +
    'paramedical work is built slowly, in thin layers, matched to your own skin and colouring. ' +
    'Looking like yourself is the entire point.',
  hopeless:
    "Being told 'nothing can be done' is often the reason people wait years longer than they " +
    'needed to. What is possible has changed a great deal. It is worth a fresh look — though a ' +
    'specialist would still need to assess your specific situation before saying anything for certain.',
  not_ready:
    'Not being sure is a completely valid place to stand. There is no clock here and no pressure. ' +
    'Understanding your options — and nothing more — is a perfectly good reason to have come today.',
  self_conscious:
    'Reaching out took something, and we do not take that lightly. Feeling exposed is exactly why ' +
    'this stays private: no photos are required to begin, and your first step can be a quiet ' +
    'conversation, entirely on your terms.',
  cost:
    'Wondering whether it is worth it is fair and honest. The clinic can walk you through what is ' +
    'involved and what payment options exist before you decide anything at all.',
  nothing:
    "Then let's not slow you down. Here is a clear place to start.",
};

// A short line of acknowledgment shown on the result, keyed by concern.
REPORT.acknowledgment = {
  scars: 'Scars carry stories you did not choose. This is about giving you a say in how they are seen.',
  smp: 'Hair loss can feel like losing a piece of yourself. Wanting it back is reason enough to be here.',
  brows: 'Brows frame everything. It makes complete sense to want them to feel like yours again.',
  unsure: 'Not knowing where to start is its own kind of weight. Let us take the first step with you.',
};

// The letter frame — opening salutation + restorative closing. Collective clinic
// voice (not a fabricated individual). The close carries the brand's own promise:
// turning what you carry into strength. Emotional, never a treatment claim.
export const LETTER = {
  open: (first) => `${first ? first + ',' : 'Hello,'}`,
  lede:
    "Thank you for answering honestly. Here is what your answers tell us about where to start — " +
    'and, just as importantly, what they tell us about you.',
  closing:
    "Whatever brought you here, you have carried it long enough. Healing is not about erasing what " +
    'happened. It is about choosing how it is seen from here. When you are ready, we will be here.',
  signoff: 'With care,\nWholesome Empire',
};

// Caution-flag codes → human labels (report + internal summary).
export const FLAG_LABELS = {
  wait_prepare: 'Area may still be settling',
  early_healing: 'Area healed less than 6 months ago',
  changing_area: 'Area still red, pink, or changing',
  sensitive_area: 'Area sensitive or irritated',
  previous_brow_work: 'Has previous brow tattooing / microblading',
  scalp_scar: 'Scalp scar or transplant history',
  medical_clearance_possible: 'Medical clearance may be requested',
  mixed_signals: 'Goals point to more than one path',
};

export const DISCLAIMER =
  'This report is for general guidance only. It does not replace a consultation or medical advice. ' +
  'A trained specialist will confirm whether treatment is appropriate.';
