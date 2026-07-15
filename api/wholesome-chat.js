// POST /api/wholesome-chat — the LIVE concierge turn handler.
//
// The browser sends the running conversation; this calls Claude with the
// guardrail system prompt (tools/wholesome/concierge-prompt.md), gets back a
// warm reply + at most one extracted answer, VALIDATES that answer against the
// real option ids, and returns it. The model never routes — assessment.js does.
//
// Not configured until ANTHROPIC_API_KEY is set (Vercel env). Without it this
// returns 501 and the client falls back to the tap flow / keyword demo.
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-4-5-20251001'; // fast + cheap; warmth doesn't need a big model

// Server-side schema: which option ids are valid per field. Mirrors content.js
// SCREENS (kept here because api/* is CommonJS and can't import the ESM module).
const VALID = {
  concern: ['scars', 'smp', 'brows', 'unsure'],
  goal: ['texture', 'colour', 'both', 'unsure', 'subtle', 'stronger', 'blend', 'shaved', 'scar_less', 'natural', 'soft', 'defined', 'shape', 'less_makeup', 'which_fits', 'am_i_ready', 'consult_or_photo', 'what_affects', 'talk_first'],
  scar_heal: ['lt6', '6to12', 'over1', 'several', 'unsure'],
  scar_state: ['flat', 'raised', 'indented', 'changing', 'sensitive', 'unsure'],
  scar_area: ['stomach', 'hips_thighs', 'arms', 'chest_shoulders', 'surgical', 'injury', 'other'],
  smp_situation: ['thinning', 'receding', 'crown', 'bald', 'patchy', 'scalp_scar'],
  smp_look: ['subtle', 'stronger', 'shaved', 'blend', 'scar_less'],
  smp_prior: ['none', 'transplant', 'prev_smp', 'scalp_scar', 'unsure'],
  brow_fill: ['daily', 'sometimes', 'rarely', 'no', 'prev_tattoo'],
  brow_prev: ['none', 'faded', 'visible', 'unsure'],
  brow_style: ['natural', 'soft_powder', 'defined', 'fuller', 'unsure'],
  barrier: ['natural', 'hopeless', 'not_ready', 'self_conscious', 'cost', 'nothing'],
};

// Canonical guardrail prompt (spec of record: tools/wholesome/concierge-prompt.md).
const SYSTEM = `You are the private intake concierge for Wholesome Empire, a paramedical clinic in Calgary (scar & stretch-mark revision and camouflage, scalp micropigmentation, brow micropigmentation). You are warm, calm, and unhurried. Many people here feel self-conscious or have carried a scar or hair loss for years. Make them feel safe and heard while gently gathering a few facts.

You are NOT a clinician. You never diagnose, assess, approve, reject, or promise anything.

Rules:
- Ask ONE short question at a time. Reflect back what they said first. Keep replies to 1-3 sentences.
- Gather only these fields, in order, stopping once you have enough for their path: concern (scars|smp|brows|unsure), then the branch goal, timeline, the branch readiness fields, and finally barrier (their hesitation).
- NEVER say a treatment will work/remove/erase/fix/cure. NEVER say someone is or isn't a candidate/eligible/cleared; fit is "something a specialist would confirm". NEVER quote price, session count, or timeline; say "the clinic can walk you through that".
- NEVER give medical advice or interpret symptoms. If they mention a possible medical concern (infection, a changing mole/spot, pain, a wound not healing), tell them to raise it with their doctor or the clinic, and do not continue as normal.
- No emoji, no hype, no pressure to book. Never claim to be human; you are the clinic's assistant.
- If someone expresses self-harm or crisis, stop the intake, express care, and direct them to 988 (Canada Suicide Crisis Helpline) or emergency services.

On every turn respond with ONLY a JSON object:
{"reply": "<1-3 warm sentences + the next single question>", "field": "<concern|goal|timeline|scar_heal|scar_state|scar_area|smp_situation|smp_look|smp_prior|brow_fill|brow_prev|brow_style|barrier|null>", "value": "<the matching option id or null>", "done": <true only once every needed field for their branch is filled>}`;

function readBody(req) {
  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = {}; } }
  return b && typeof b === 'object' ? b : {};
}

module.exports = async (req, res) => {
  res.setHeader('cache-control', 'no-store');
  if (req.method !== 'POST') { res.status(405).json({ error: 'method_not_allowed' }); return; }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) { res.status(501).json({ error: 'concierge_not_configured' }); return; }

  const body = readBody(req);
  const messages = Array.isArray(body.messages) ? body.messages.slice(-20) : [];
  if (!messages.length) { res.status(400).json({ error: 'no_messages' }); return; }

  try {
    const r = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: MODEL, max_tokens: 400, system: SYSTEM, messages }),
    });
    if (!r.ok) { throw new Error(`anthropic ${r.status}: ${(await r.text()).slice(0, 300)}`); }
    const data = await r.json();
    const raw = (data.content && data.content[0] && data.content[0].text) || '';

    // Parse the model's JSON; tolerate stray prose around it.
    let out = {};
    const m = raw.match(/\{[\s\S]*\}/);
    try { out = JSON.parse(m ? m[0] : raw); } catch { out = { reply: raw, field: null, value: null, done: false }; }

    // Validate the extracted answer against the real schema; drop if off-spec.
    let field = typeof out.field === 'string' ? out.field : null;
    let value = typeof out.value === 'string' ? out.value : null;
    const key = field === 'goal' ? 'goal' : field;
    if (!field || !VALID[key] || !VALID[key].includes(value)) { field = null; value = null; }

    res.status(200).json({
      reply: typeof out.reply === 'string' ? out.reply : "Sorry, could you say that another way?",
      field, value, done: out.done === true,
    });
  } catch (err) {
    console.error('concierge_failed', err);
    res.status(502).json({ error: 'concierge_failed' });
  }
};
