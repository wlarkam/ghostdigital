// Engineering Team Health Scorecard — pure scoring core (Keystone demo).
// No DOM, no fetch, no globals. Unit-tested by scoring.test.js.
// The UI imports scoreScorecard(), DIMENSIONS, QUESTIONS, BANDS, RECS.
//
// Instrument design (the Ungameable Law, applied to a self-diagnostic):
// every answer option is a realistic, defensible description of a team's
// current state — there are no troll options and no obviously-"right" answer.
// The respondent is reporting their reality, not picking the good choice.
// Higher option score = healthier state. The grade emerges from the pattern
// across 15 items / 5 dimensions, not from any single answer.
//
// Copy below is in a direct, no-fluff fractional-CTO voice (velocity, the wall
// a scaling team hits, "you're the bottleneck", "give it to you straight").

export const DIMENSIONS = [
  {
    id: 'team_structure',
    label: 'Team Structure',
    blurb: 'Does the org map to the size you’ve grown to, or are you running the shape you had at half the headcount?',
  },
  {
    id: 'communication',
    label: 'Communication Overhead',
    blurb: 'How much velocity is lost to coordination, meetings, and context that only lives in people’s heads.',
  },
  {
    id: 'decisions',
    label: 'Decision-Making Speed',
    blurb: 'Do teams decide inside clear guardrails, or does everything wait on you?',
  },
  {
    id: 'architecture',
    label: 'Architecture Clarity',
    blurb: 'Can the team reason about the system and ship without holding its breath?',
  },
  {
    id: 'ai_readiness',
    label: 'AI Adoption Readiness',
    blurb: 'Are you using AI as a leveraged junior engineer, or reacting to board pressure with no plan?',
  },
];

// Each question: 4 options, scored 3 (healthiest) → 0 (most stuck).
// id prefix maps to the dimension; `dim` is authoritative.
export const QUESTIONS = [
  // ---------- Team Structure ----------
  {
    id: 'ts1', dim: 'team_structure',
    stem: 'When something breaks in production, how clear is it who owns the fix?',
    options: [
      { label: 'Every system has a clear owner; the on-call path is obvious.', score: 3 },
      { label: 'Most areas have an owner, with a few gray zones.', score: 2 },
      { label: 'It depends who’s around. Ownership is informal.', score: 1 },
      { label: 'Almost everything routes through one or two people (often me).', score: 0 },
    ],
  },
  {
    id: 'ts2', dim: 'team_structure',
    stem: 'If your most critical engineer took two weeks off, what happens?',
    options: [
      { label: 'Barely a ripple. The team is cross-covered by design.', score: 3 },
      { label: 'We’d slow down, but we’d still ship.', score: 2 },
      { label: 'A couple of things would stall until they’re back.', score: 1 },
      { label: 'Real work would freeze. Only they know key systems.', score: 0 },
    ],
  },
  {
    id: 'ts3', dim: 'team_structure',
    stem: 'How well does your current org structure fit the size you’ve grown to?',
    options: [
      { label: 'We’ve restructured as we scaled; teams map to clear domains.', score: 3 },
      { label: 'Mostly fits. A couple of teams are overloaded.', score: 2 },
      { label: 'We’re running the structure we had at half this size.', score: 1 },
      { label: 'It’s one big group; there’s no real structure yet.', score: 0 },
    ],
  },
  // ---------- Communication Overhead ----------
  {
    id: 'co1', dim: 'communication',
    stem: 'How much of your engineers’ week goes to meetings and coordination?',
    options: [
      { label: 'Protected maker time is the default; meetings are the exception.', score: 3 },
      { label: 'Reasonable. A few standing meetings, mostly heads-down.', score: 2 },
      { label: 'Calendars are filling up; people complain about focus time.', score: 1 },
      { label: 'Engineers say they can’t get real work done during the day.', score: 0 },
    ],
  },
  {
    id: 'co2', dim: 'communication',
    stem: 'When two teams need to ship something together, how does it go?',
    options: [
      { label: 'Clear interfaces; they coordinate without leadership in the room.', score: 3 },
      { label: 'Usually fine with a little nudging.', score: 2 },
      { label: 'It takes a lot of meetings and back-and-forth.', score: 1 },
      { label: 'It stalls until a leader forces alignment.', score: 0 },
    ],
  },
  {
    id: 'co3', dim: 'communication',
    stem: 'How does important context move through the org?',
    options: [
      { label: 'Written, async, and findable. Decisions get documented.', score: 3 },
      { label: 'Mostly good; some of it lives in people’s heads.', score: 2 },
      { label: 'Tribal knowledge. You have to know who to ask.', score: 1 },
      { label: 'Context lives with me and a few others; we’re the bottleneck.', score: 0 },
    ],
  },
  // ---------- Decision-Making Speed ----------
  {
    id: 'dm1', dim: 'decisions',
    stem: 'How are most technical decisions made, day to day?',
    options: [
      { label: 'Teams decide within clear guardrails; they don’t wait on me.', score: 3 },
      { label: 'Teams decide small things; the bigger ones come to me.', score: 2 },
      { label: 'Most non-trivial decisions wait for me or a lead.', score: 1 },
      { label: 'I’m in nearly every decision. I’m the bottleneck.', score: 0 },
    ],
  },
  {
    id: 'dm2', dim: 'decisions',
    stem: 'How often do decisions stall because no one can break the tie?',
    options: [
      { label: 'Rarely. We have decision frameworks people trust.', score: 3 },
      { label: 'Occasionally, on genuinely hard calls.', score: 2 },
      { label: 'Often enough that it slows delivery.', score: 1 },
      { label: 'Teams are regularly deadlocked, waiting on a verdict.', score: 0 },
    ],
  },
  {
    id: 'dm3', dim: 'decisions',
    stem: 'How often do you re-open decisions that were supposedly made?',
    options: [
      { label: 'They stick. We disagree-and-commit and move.', score: 3 },
      { label: 'We revisit sometimes, with good reason.', score: 2 },
      { label: 'We relitigate more than we’d like.', score: 1 },
      { label: 'Decisions rarely feel final; we keep going in circles.', score: 0 },
    ],
  },
  // ---------- Architecture Clarity ----------
  {
    id: 'ar1', dim: 'architecture',
    stem: 'Can a mid-level engineer explain how your core system fits together?',
    options: [
      { label: 'Yes. The architecture is documented and teachable.', score: 3 },
      { label: 'Mostly; a couple of areas are murky.', score: 2 },
      { label: 'Only a few senior people really understand it.', score: 1 },
      { label: 'Honestly, no one holds the full picture anymore.', score: 0 },
    ],
  },
  {
    id: 'ar2', dim: 'architecture',
    stem: 'How much is technical debt slowing your shipping right now?',
    options: [
      { label: 'We manage it deliberately; it’s not what’s slowing us.', score: 3 },
      { label: 'It costs us, but it’s under control.', score: 2 },
      { label: 'It’s a real drag on velocity.', score: 1 },
      { label: 'Every change fights the codebase; velocity is dropping.', score: 0 },
    ],
  },
  {
    id: 'ar3', dim: 'architecture',
    stem: 'When you ship a change, how confident is the team it won’t break something elsewhere?',
    options: [
      { label: 'High. Tests and clear boundaries catch regressions.', score: 3 },
      { label: 'Reasonably; we catch most issues.', score: 2 },
      { label: 'We hold our breath on the bigger changes.', score: 1 },
      { label: 'Changes routinely cause surprises in unrelated areas.', score: 0 },
    ],
  },
  // ---------- AI Adoption Readiness ----------
  {
    id: 'ai1', dim: 'ai_readiness',
    stem: 'Where are you on AI adoption in engineering?',
    options: [
      { label: 'We have a deliberate strategy and we’re executing it.', score: 3 },
      { label: 'Experimenting intentionally; learning what works.', score: 2 },
      { label: 'Ad hoc. Some engineers use tools, no real plan.', score: 1 },
      { label: 'The board’s pushing and we don’t have an answer yet.', score: 0 },
    ],
  },
  {
    id: 'ai2', dim: 'ai_readiness',
    stem: 'How is your team using AI coding tools?',
    options: [
      { label: 'As a leveraged junior. Reviewed, guardrailed, accelerating us.', score: 3 },
      { label: 'On real work, still finding the right guardrails.', score: 2 },
      { label: 'Scattered use; quality and review are inconsistent.', score: 1 },
      { label: 'Either banned outright, or used with no oversight at all.', score: 0 },
    ],
  },
  {
    id: 'ai3', dim: 'ai_readiness',
    stem: 'If you went all-in on AI-assisted delivery tomorrow, could the team absorb it?',
    options: [
      { label: 'Yes. The review culture and practices are already in place.', score: 3 },
      { label: 'Mostly; we’d need to tighten a few things first.', score: 2 },
      { label: 'Not yet. We’d create as many problems as we solve.', score: 1 },
      { label: 'No. We don’t have the foundations to do it safely.', score: 0 },
    ],
  },
];

// Overall bands, keyed on the 0–100 composite health score. These map to the
// tool's core idea: the wall a team hits as it scales.
export const BANDS = [
  {
    id: 'in_it',
    min: 0,
    max: 39,
    name: 'In the Ceiling',
    tagline: 'You’re not approaching the wall. You’re against it.',
    narrative:
      'This is the wall every scaling team hits, the point where everything that worked at half this size suddenly doesn’t. ' +
      'Velocity is dropping, you’re the bottleneck on too many calls, and the team is overworked, underwater, and fighting fires. ' +
      'None of this means the team is bad. It means the systems haven’t caught up to the size you’ve grown to.',
  },
  {
    id: 'approaching',
    min: 40,
    max: 69,
    name: 'Approaching the Wall',
    tagline: 'It still mostly works, but you can feel the drag.',
    narrative:
      'You’re growing, and the cracks are starting to show. A few dimensions are still holding, but momentum is getting harder to sustain ' +
      'and the early signs of the wall are here. This is the cheapest moment to fix it, while the wall is still ahead of you. ' +
      'The pattern below shows exactly where velocity is leaking first.',
  },
  {
    id: 'through',
    min: 70,
    max: 100,
    name: 'Through the Wall',
    tagline: 'You’ve built systems that scale without you in the room.',
    narrative:
      'You’ve done the hard part. The team runs on durable systems instead of on you. Velocity is holding as you grow, decisions don’t pile up ' +
      'on your desk, and the structure fits the size. The danger now is different: one weak dimension can ' +
      'drag the rest back down. Watch your lowest score below.',
  },
];

// Per-dimension recommendations, keyed by status. Each is a concrete next move.
// The 'blocked' rec for the binding constraint is the bridge to the paid sprint.
export const RECS = {
  team_structure: {
    blocked: 'Ownership runs through you. Map every critical system to a named owner and a backup this week. Single points of failure are the first thing the ceiling exploits.',
    strained: 'The shape is lagging the size. Pick the one overloaded team and split it along a clean domain boundary before it becomes the bottleneck.',
    holding: 'Structure is fitting the size. Keep re-checking domain boundaries every time you add ~10 engineers.',
  },
  communication: {
    blocked: 'Coordination is eating your velocity. Audit standing meetings, kill or async half of them, and move decisions into writing so context stops living in heads.',
    strained: 'Overhead is creeping. Protect maker time explicitly and tighten the interfaces between the two teams that coordinate most.',
    holding: 'Communication is paying its way. Keep documenting decisions so the next 10 hires inherit context instead of interrupting people.',
  },
  decisions: {
    blocked: 'You are the bottleneck. Write decision frameworks that let teams decide inside clear guardrails, and stop being the tiebreaker on reversible calls.',
    strained: 'Too many decisions still climb to you. Define which calls are one-way doors (yours) and which are two-way (theirs), and push the rest down.',
    holding: 'Decisions move without you. Keep widening the guardrails as the team earns it.',
  },
  architecture: {
    blocked: 'The system has outrun the people who understand it. Get the core architecture documented and teachable, and carve out boundaries so changes stop causing surprises.',
    strained: 'Debt is taxing velocity. Name the one subsystem that fights every change and fund a deliberate paydown before it compounds.',
    holding: 'Architecture is clear enough to scale on. Keep the docs current and the boundaries clean.',
  },
  ai_readiness: {
    blocked: 'You’re reacting to AI instead of leading it. Set a deliberate adoption strategy with review guardrails. Delegate to AI as a leveraged junior; don’t abdicate to it.',
    strained: 'You’re experimenting without a system. Standardize how AI gets used and reviewed so the gains are real and the risk is contained.',
    holding: 'AI is leverage, not chaos. Keep tightening the review loop as you scale usage.',
  },
};

const STATUS = { HOLDING: 'holding', STRAINED: 'strained', BLOCKED: 'blocked' };

function statusFor(score) {
  if (score >= 67) return STATUS.HOLDING;
  if (score >= 34) return STATUS.STRAINED;
  return STATUS.BLOCKED;
}

function clampScore(v) {
  const n = typeof v === 'number' ? v : parseInt(v, 10);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(3, Math.round(n)));
}

// answers: { ts1: 0..3, ts2: 0..3, ... } keyed by question id.
// Missing/garbage answers coerce to 0. Returns the full computed result.
export function scoreScorecard(answers = {}) {
  const a = answers && typeof answers === 'object' ? answers : {};

  const dimensions = {}; // id -> 0..100
  const statuses = {};   // id -> status string

  for (const dim of DIMENSIONS) {
    const items = QUESTIONS.filter((q) => q.dim === dim.id);
    const raw = items.reduce((sum, q) => sum + clampScore(a[q.id]), 0);
    const maxRaw = items.length * 3;
    const score = maxRaw > 0 ? Math.round((raw / maxRaw) * 100) : 0;
    dimensions[dim.id] = score;
    statuses[dim.id] = statusFor(score);
  }

  const dimScores = DIMENSIONS.map((d) => dimensions[d.id]);
  const overall = Math.round(dimScores.reduce((s, n) => s + n, 0) / DIMENSIONS.length);

  const band = BANDS.find((b) => overall >= b.min && overall <= b.max) || BANDS[0];

  // Binding constraint = lowest-scoring dimension; ties break by DIMENSIONS order.
  let binding = DIMENSIONS[0].id;
  for (const d of DIMENSIONS) {
    if (dimensions[d.id] < dimensions[binding]) binding = d.id;
  }
  const bindingDim = DIMENSIONS.find((d) => d.id === binding);
  const bindingRec = RECS[binding][statuses[binding]];

  return {
    overall,
    band: band.id,
    bandName: band.name,
    dimensions,
    statuses,
    bindingConstraint: binding,
    bindingLabel: bindingDim.label,
    bindingRec,
  };
}
