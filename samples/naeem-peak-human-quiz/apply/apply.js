// apply.js — sample Apply page. Reads archetype from URL params and
// pre-fills question 2 (the "pattern holding you back") with the user's
// archetype shadow. THIS IS THE MOMENT THAT SELLS THE FUNNEL.
import { ARCHETYPES } from '../js/content.js';

const params = new URLSearchParams(window.location.search);
const archetypeKey = params.get('archetype');
const name = params.get('name') || '';
const archetype = archetypeKey ? ARCHETYPES[archetypeKey] : null;

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

function renderApply() {
  const greeting = name ? `${escapeHtml(name)}, ready` : 'Ready';
  const tag = archetype
    ? `<div class="apply__archetype-tag">Your archetype · The ${escapeHtml(archetype.shortName)}</div>`
    : '';

  const q2Prefill = archetype ? archetype.pattern : '';
  const q2PrefillNote = archetype
    ? `<span class="apply__prefill-note">Pre-filled from your Peak Human result — edit anything that doesn't ring true.</span>`
    : '';

  return `
    <div class="page">
      <div class="apply__hero">
        ${tag}
        <h1>${greeting} to <em>work</em> together?</h1>
        <p>Three questions. We read every one. If we're a fit, the next step is a 30-minute conversation — no pitch, no pressure.</p>
      </div>

      <form id="apply-form">
        <div class="apply__field">
          <label class="apply__label" for="q1">01 · Where are you financially?</label>
          <span class="apply__sublabel">Your current annual revenue or monthly income. Rough is fine.</span>
          <input class="apply__input" id="q1" name="q1" type="text" placeholder="e.g. $25K/mo · $300K ARR · $1.2M last year" required>
        </div>

        <div class="apply__field">
          <label class="apply__label" for="q2">02 · The one pattern holding you back right now</label>
          <span class="apply__sublabel">The thing you keep doing — or not doing — that you can name but haven't broken.</span>
          <textarea class="apply__textarea" id="q2" name="q2" placeholder="Be specific. Nothing here is graded." required>${escapeHtml(q2Prefill)}</textarea>
          ${q2PrefillNote}
        </div>

        <div class="apply__field">
          <label class="apply__label">03 · Are you ready to invest in yourself if this is the right fit?</label>
          <span class="apply__sublabel">There's no wrong answer. Honest beats polite.</span>
          <div class="apply__radios">
            <label class="apply__radio">
              <input type="radio" name="q3" value="yes" required>
              <span>Yes — if the work matches the problem, I'm in.</span>
            </label>
            <label class="apply__radio">
              <input type="radio" name="q3" value="maybe">
              <span>Maybe — I want to see what the work looks like first.</span>
            </label>
            <label class="apply__radio">
              <input type="radio" name="q3" value="no">
              <span>Not yet — I'm here to learn what's possible.</span>
            </label>
          </div>
        </div>

        <button class="btn btn--primary apply__submit" type="submit">Send application →</button>
      </form>
    </div>
  `;
}

function renderSuccess(firstName) {
  const greet = firstName ? escapeHtml(firstName) : 'You';
  return `
    <div class="page">
      <div class="apply__success">
        <div class="eyebrow">Application received</div>
        <h2>Thanks, <em>${greet}</em>.</h2>
        <p>If we're a fit, you'll hear back from Naeem inside 48 hours with a link to schedule.</p>
        <p>If we're not, you'll hear back anyway — with a pointer to what could help instead.</p>
      </div>
    </div>
  `;
}

const root = document.getElementById('app');
root.innerHTML = renderApply();

// Radio visual state
document.querySelectorAll('.apply__radio input').forEach(input => {
  input.addEventListener('change', () => {
    document.querySelectorAll('.apply__radio').forEach(r => r.classList.remove('is-checked'));
    if (input.checked) input.parentElement.classList.add('is-checked');
  });
});

// Submit handler — placeholder success state (no backend; this is a sample)
document.getElementById('apply-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const firstName = name.split(' ')[0] || '';
  root.innerHTML = renderSuccess(firstName);
  window.scrollTo(0, 0);
});
