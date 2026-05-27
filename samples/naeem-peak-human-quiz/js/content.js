// content.js — questions, archetype copy, and result narratives.
// All copy is [NEEDS_VOICE_REVIEW] — Warren to redline against Naeem's actual voice.

export const QUESTIONS = [
  {
    key: 'q1',
    prompt: 'When a launch underperforms, your first move is…',
    options: [
      { tier: 'forge',        label: 'Ship the next thing faster — momentum heals everything.' },
      { tier: 'cartographer', label: 'Reframe what "underperform" actually means in this context.' },
      { tier: 'wildfire',     label: 'Start three new experiments to find what works.' },
      { tier: 'lighthouse',   label: 'Audit which signal I missed — refine the filter.' },
    ],
  },
  {
    key: 'q2',
    prompt: 'The hardest part of your work right now is…',
    options: [
      { tier: 'forge',        label: 'Knowing whether what I\'m doing actually matters.' },
      { tier: 'cartographer', label: 'Forcing myself to start before I\'ve thought it through fully.' },
      { tier: 'wildfire',     label: 'Finishing one thing before the next one pulls me away.' },
      { tier: 'lighthouse',   label: 'Knowing when to stop following the routine and adapt.' },
    ],
  },
  {
    key: 'q3',
    prompt: 'At your best, you…',
    options: [
      { tier: 'forge',        label: 'Out-work everyone in the room.' },
      { tier: 'cartographer', label: 'See the pattern nobody else sees.' },
      { tier: 'wildfire',     label: 'Generate ideas faster than you can use them.' },
      { tier: 'lighthouse',   label: 'Stay locked in when others get distracted.' },
    ],
  },
  {
    key: 'q4',
    prompt: 'Your worst week looks like…',
    options: [
      { tier: 'forge',        label: 'Going hard, getting results, but feeling empty.' },
      { tier: 'cartographer', label: 'Thinking deeply, planning, but not moving.' },
      { tier: 'wildfire',     label: 'Starting six things, finishing zero.' },
      { tier: 'lighthouse',   label: 'Executing the plan while the world changed around me.' },
    ],
  },
  {
    key: 'q5',
    prompt: 'What people misunderstand about you is…',
    options: [
      { tier: 'forge',        label: 'That my drive comes from joy, not pressure.' },
      { tier: 'cartographer', label: 'That my pausing isn\'t passivity.' },
      { tier: 'wildfire',     label: 'That my range is a strategy, not a flaw.' },
      { tier: 'lighthouse',   label: 'That my routine is freedom, not constraint.' },
    ],
  },
  {
    key: 'q6',
    prompt: 'The thing you re-read or re-listen to most is…',
    options: [
      { tier: 'forge',        label: 'Tactical execution playbooks.' },
      { tier: 'cartographer', label: 'Philosophy, frameworks, first-principles thinking.' },
      { tier: 'wildfire',     label: 'Whatever\'s new and unfamiliar.' },
      { tier: 'lighthouse',   label: 'The system I\'m already running, refining it.' },
    ],
  },
  {
    key: 'q7',
    prompt: 'The question that lands hardest when you check in with yourself is…',
    options: [
      { tier: 'forge',        label: '"What is this costing me?"' },
      { tier: 'cartographer', label: '"What am I actually doing about it?"' },
      { tier: 'wildfire',     label: '"What is the ONE thing here?"' },
      { tier: 'lighthouse',   label: '"Is the map still matching the territory?"' },
    ],
  },
  {
    key: 'q8',
    prompt: 'If you had 6 months of total focus, you\'d…',
    options: [
      { tier: 'forge',        label: 'Build the thing I\'ve been putting off.' },
      { tier: 'cartographer', label: 'Finish the framework I\'ve been refining.' },
      { tier: 'wildfire',     label: 'Test the 10 ideas I haven\'t gotten to.' },
      { tier: 'lighthouse',   label: 'Master the practice I\'ve already started.' },
    ],
  },
];

export const ARCHETYPES = {
  forge: {
    name: 'The Forge',
    shortName: 'Forge',
    tagline: 'Action-saturated. Meaning-starved.',
    strong: ['Attention', 'Action'],
    weak: 'Meaning',
    summary:
      'You out-work the room. You ship through resistance. You don\'t need motivation — you need the next problem. The cost: you let outcomes deliver your identity verdict. A flat launch doesn\'t feel like a flat launch. It feels like proof of something deeper.',
    shadow:
      'Effort becomes the answer to a question you haven\'t asked. The work runs hot and you don\'t notice until the meaning vacuum catches up — usually three weeks after the win you thought you needed.',
    beliefShift: 'Effort doesn\'t generate meaning. You assign it before the work, not after.',
    practice:
      'Before the next sprint, write the one sentence that names why this matters — independent of the outcome. Re-read it on the worst day of the sprint.',
    nextRead: {
      title: 'You Are A Meaning Making Machine',
      url: 'https://nmood.substack.com/p/you-are-a-meaning-making-machine',
      note: 'Start here. The Three Decisions framework is the diagnostic you\'ve been missing.',
    },
  },

  cartographer: {
    name: 'The Cartographer',
    shortName: 'Cartographer',
    tagline: 'Meaning-rich. Action-poor.',
    strong: ['Attention', 'Meaning'],
    weak: 'Action',
    summary:
      'You see the pattern nobody else sees. You can reframe almost anything — a setback becomes a lesson, a failure becomes a data point, a stuck moment becomes a chapter break. You think in maps.',
    shadow:
      'The map keeps getting better. The territory doesn\'t move. Reframing has quietly become the procrastination — the most defensible-sounding form of not doing the thing.',
    beliefShift: 'A frame you don\'t enact is a hallucination.',
    practice:
      'For one week: every insight you have must be paired with one action shipped within 24 hours. If the insight can\'t be paired with an action, it doesn\'t get written down.',
    nextRead: {
      title: 'Reasons Come First, Answers Come Second',
      url: 'https://nmood.substack.com/p/reasons-come-first-answers-come-second',
      note: 'On why insight without commitment dissolves into self-soothing.',
    },
  },

  wildfire: {
    name: 'The Wildfire',
    shortName: 'Wildfire',
    tagline: 'High meaning. High action. Low focus.',
    strong: ['Meaning', 'Action'],
    weak: 'Attention',
    summary:
      'You reframe fast, you execute fast, and you carry energy that other people borrow. You\'re a magnet for ideas — and a magnet for the next idea, and the next one. Most rooms run colder than you.',
    shadow:
      'Nothing compounds. The most valuable bet you ever placed is sitting half-finished while you light a new fire across the room. Range looks like a strategy. From the inside, it feels like a slow leak.',
    beliefShift: 'Compounding requires staying with one bet past the point it gets boring.',
    practice:
      'Pick the one bet that, if you only worked on it for the next 90 days, would meaningfully change your trajectory. Put the other fires in writing — a parking lot, not a graveyard. Revisit in 90.',
    nextRead: {
      title: 'You Are A Meaning Making Machine',
      url: 'https://nmood.substack.com/p/you-are-a-meaning-making-machine',
      note: 'Use the Three Decisions to audit which bet is actually carrying the meaning.',
    },
  },

  lighthouse: {
    name: 'The Lighthouse',
    shortName: 'Lighthouse',
    tagline: 'Disciplined. Reliable. Subtly brittle.',
    strong: ['Attention', 'Action'],
    weak: 'Meaning (rigid)',
    summary:
      'You\'ve built the system. You run the system. The system runs you. From the outside, you look like the discipline everyone else aspires to — and most days you are. Your worst weeks are the ones where the territory shifts and you keep executing the old map perfectly.',
    shadow:
      'A missed day of the regimen feels like an identity crack — not a logistics problem. The practice has become the proof. You\'ve confused following the protocol with the growth the protocol was supposed to produce.',
    beliefShift: 'The routine serves you, not the other way around.',
    practice:
      'Once a month, run a "permission audit": one ritual you\'ll deliberately break, one you\'ll keep, one you\'ll redesign. Notice which one you resist letting go of — that\'s the diagnostic.',
    nextRead: {
      title: 'You Are A Meaning Making Machine',
      url: 'https://nmood.substack.com/p/you-are-a-meaning-making-machine',
      note: 'On meaning as a malleable filter — not a verdict the regimen earns.',
    },
  },
};
