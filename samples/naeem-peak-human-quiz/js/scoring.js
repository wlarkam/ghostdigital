// scoring.js — pure scoring engine. No DOM, no fetch, no globals.
// Input: { q1: 'forge'|'cartographer'|'wildfire'|'lighthouse', q2: ..., ... q8 }
// Output: { tier, tally, coherence, dimensionGrades }

export const TIERS = ['forge', 'cartographer', 'wildfire', 'lighthouse'];

export const QUESTION_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8'];

// Dimension groupings (which questions test which behavior aspect).
// 4 dimensions, 2 items each — matches the playbook's "2 × dimensions + 1" shape
// (we're skipping the +1 drift gate in this MVP sample).
export const DIMENSIONS = {
  response_to_setback: ['q1', 'q4'],
  self_perception:     ['q3', 'q5'],
  energy_pattern:      ['q2', 'q8'],
  inner_dialogue:      ['q6', 'q7'],
};

// Q7 is the tiebreaker (the "what question lands hardest" diagnostic).
const TIEBREAKER_KEY = 'q7';

function plurality(answers) {
  const counts = Object.fromEntries(TIERS.map(t => [t, 0]));
  for (const k of QUESTION_KEYS) {
    const v = answers[k];
    if (v && counts[v] !== undefined) counts[v]++;
  }
  return counts;
}

function pickWinner(counts, tiebreaker) {
  const max = Math.max(...Object.values(counts));
  const top = TIERS.filter(t => counts[t] === max);
  if (top.length === 1) return top[0];
  // Tiebreaker: if Q7 answer is one of the tied tiers, it wins.
  if (top.includes(tiebreaker)) return tiebreaker;
  // Otherwise: first in canonical TIERS order among the tied — deterministic.
  return top[0];
}

function dimensionGrades(answers, primary) {
  const grades = {};
  for (const [dim, keys] of Object.entries(DIMENSIONS)) {
    const hits = keys.filter(k => answers[k] === primary).length;
    if (hits === 2) grades[dim] = 'strong';
    else if (hits === 1) grades[dim] = 'mixed';
    else grades[dim] = 'shadow';
  }
  return grades;
}

export function scoreQuiz(answers) {
  // Validate
  for (const k of QUESTION_KEYS) {
    if (!answers[k]) {
      throw new Error(`Missing answer: ${k}`);
    }
    if (!TIERS.includes(answers[k])) {
      throw new Error(`Invalid tier for ${k}: ${answers[k]}`);
    }
  }

  const counts = plurality(answers);
  const tier = pickWinner(counts, answers[TIEBREAKER_KEY]);
  const coherence = counts[tier] / QUESTION_KEYS.length;
  const grades = dimensionGrades(answers, tier);

  return {
    tier,
    tally: counts,
    coherence: Number(coherence.toFixed(2)),
    dimensionGrades: grades,
  };
}
