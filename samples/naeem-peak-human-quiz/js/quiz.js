// quiz.js — UI controller. Pure scoring lives in scoring.js.
import { QUESTIONS, ARCHETYPES } from './content.js';
import { scoreQuiz } from './scoring.js';

const STATE = {
  step: 'intro',          // 'intro' | 'question' | 'result'
  qIndex: 0,
  answers: {},            // { q1: 'forge', ... }
  result: null,
};

function render() {
  // Always query the LIVE #app — the previous one was replaced.
  const live = document.getElementById('app');
  const fresh = document.createElement('main');
  fresh.id = 'app';
  if (STATE.step === 'intro') fresh.innerHTML = renderIntro();
  else if (STATE.step === 'question') fresh.innerHTML = renderQuestion();
  else if (STATE.step === 'result') fresh.innerHTML = renderResult();
  live.parentElement.replaceChild(fresh, live);
  bindHandlers(fresh);
}

function bindHandlers(el) {
  el.querySelectorAll('[data-action="start"]').forEach(b =>
    b.addEventListener('click', () => { STATE.step = 'question'; STATE.qIndex = 0; render(); }));

  el.querySelectorAll('[data-action="answer"]').forEach(b =>
    b.addEventListener('click', () => {
      const qKey = b.dataset.qkey;
      const tier = b.dataset.tier;
      STATE.answers[qKey] = tier;
      // auto-advance after a beat
      setTimeout(() => {
        if (STATE.qIndex < QUESTIONS.length - 1) {
          STATE.qIndex++;
          render();
        } else {
          STATE.result = scoreQuiz(STATE.answers);
          STATE.step = 'result';
          render();
        }
      }, 180);
      // visual selection feedback
      b.parentElement.querySelectorAll('.option').forEach(o => o.classList.remove('is-selected'));
      b.classList.add('is-selected');
    }));

  el.querySelectorAll('[data-action="back"]').forEach(b =>
    b.addEventListener('click', () => {
      if (STATE.qIndex > 0) { STATE.qIndex--; render(); }
      else { STATE.step = 'intro'; render(); }
    }));

  el.querySelectorAll('[data-action="restart"]').forEach(b =>
    b.addEventListener('click', () => {
      STATE.step = 'intro';
      STATE.qIndex = 0;
      STATE.answers = {};
      STATE.result = null;
      render();
    }));

  const form = el.querySelector('[data-action="optin"]');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.querySelector('input[type="text"]').value;
      const email = form.querySelector('input[type="email"]').value;
      // Show a brief confirmation, then route to the Apply page with the
      // archetype + name as URL params. The Apply page pre-fills Q2 with
      // the user's archetype shadow — the "your funnel already knows you" moment.
      const successEl = el.querySelector('.funnel__inner');
      successEl.innerHTML = `
        <div class="funnel__success">
          <div class="eyebrow">Day 1 lands tomorrow</div>
          <p>Your 5-day protocol for <em>The</em> ${ARCHETYPES[STATE.result.tier].shortName} is on the way to <strong>${escapeHtml(email)}</strong>.</p>
          <p style="margin-top:24px;font-size:15px;color:var(--fg-2);font-family:var(--font-body);font-weight:400">One more thing — if you're already curious whether we'd be a fit to work together…</p>
        </div>
      `;
      // Persist for the apply page
      try { sessionStorage.setItem('phq_name', name); } catch (_) {}
      try { sessionStorage.setItem('phq_email', email); } catch (_) {}
      // Redirect after a beat so the success message is briefly seen
      const params = new URLSearchParams({
        archetype: STATE.result.tier,
        name: name,
      });
      setTimeout(() => {
        window.location.assign(`/samples/naeem-peak-human-quiz/apply?${params.toString()}`);
      }, 1400);
    });
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

/* -------------------- Screens -------------------- */

function renderIntro() {
  return `
    <div class="page">
      <div class="eyebrow">A diagnostic by Naeem Mahmood</div>
      <h1 class="intro__title">What's your <em>Peak Human</em> archetype?</h1>
      <p class="intro__lede">
        Every moment, you make three decisions:
        what you focus on, what you make it mean, what you do.
        Most high performers nail two of the three — and keep paying for the one they don't.
        Eight questions. Find the one you're getting wrong.
      </p>
      <div class="intro__meta">
        <span>8 <strong>Questions</strong></span>
        <span>3 <strong>Minutes</strong></span>
        <span>1 <strong>Diagnosis</strong></span>
      </div>
      <button class="btn btn--primary" data-action="start">Begin the diagnostic →</button>
    </div>
  `;
}

function renderQuestion() {
  const q = QUESTIONS[STATE.qIndex];
  const pct = Math.round(((STATE.qIndex) / QUESTIONS.length) * 100);
  const optionsHtml = q.options.map(o => `
    <li>
      <button class="option ${STATE.answers[q.key] === o.tier ? 'is-selected' : ''}"
              data-action="answer" data-qkey="${q.key}" data-tier="${o.tier}">
        ${o.label}
      </button>
    </li>
  `).join('');

  return `
    <div class="page question">
      <div class="progress">
        <span>${String(STATE.qIndex + 1).padStart(2,'0')} / ${String(QUESTIONS.length).padStart(2,'0')}</span>
        <div class="progress__bar"><div class="progress__fill" style="width:${pct}%"></div></div>
      </div>
      <h2 class="question__prompt">${q.prompt}</h2>
      <ul class="options">${optionsHtml}</ul>
      <div class="question__nav">
        <button class="btn btn--ghost" data-action="back">← Back</button>
        <span></span>
      </div>
    </div>
  `;
}

function renderResult() {
  const { tier, dimensionGrades, coherence } = STATE.result;
  const a = ARCHETYPES[tier];
  const dimLabels = {
    response_to_setback: 'Response to setback',
    self_perception:     'Self-perception',
    energy_pattern:      'Energy pattern',
    inner_dialogue:      'Inner dialogue',
  };
  const dimRows = Object.entries(dimensionGrades).map(([k, v]) => `
    <li>
      <span>${dimLabels[k]}</span>
      <span class="grade ${v}">${v === 'strong' ? 'aligned' : v === 'mixed' ? 'mixed' : 'shadow'}</span>
    </li>
  `).join('');

  return `
    <div class="page">
      <div class="result__eyebrow">Your archetype</div>
      <h1 class="result__name"><em>The</em> ${a.shortName}</h1>
      <div class="result__tagline">${a.tagline}</div>

      <div class="result__row">
        <div>
          <div class="result__stat__label">Strong in</div>
          <div class="result__stat__value">${a.strong.join(' + ')}</div>
        </div>
        <div>
          <div class="result__stat__label">Shadow</div>
          <div class="result__stat__value is-shadow">${a.weak}</div>
        </div>
        <div>
          <div class="result__stat__label">Coherence</div>
          <div class="result__stat__value">${Math.round(coherence * 100)}%</div>
        </div>
      </div>

      <section class="result__section">
        <h3>The pattern</h3>
        <p>${a.summary}</p>
      </section>

      <section class="result__section">
        <h3>The shadow</h3>
        <p>${a.shadow}</p>
      </section>

      <div class="result__belief">"${a.beliefShift}"</div>

      <section class="result__section">
        <h3>The practice</h3>
        <p>${a.practice}</p>
      </section>

      <section class="dimensions">
        <div class="dimensions__title">Breakdown</div>
        <ul class="dimensions__list">${dimRows}</ul>
      </section>

      <section class="result__section">
        <h3>Start here</h3>
        <p>
          <a href="${a.nextRead.url}" target="_blank" rel="noopener">${a.nextRead.title}</a>
          — ${a.nextRead.note}
        </p>
      </section>

      <div class="funnel">
        <div class="funnel__inner">
          <h2 class="funnel__title">Your 5-day protocol, built for <em>The</em> ${a.shortName}.</h2>
          <p class="funnel__lede">
            A short email each morning for five days — built around the one decision you're getting wrong.
            Day 5 ends with a question only you can answer.
          </p>
          <form class="funnel__form" data-action="optin">
            <input type="text" placeholder="Your first name" required>
            <input type="email" placeholder="Your best email" required>
            <button class="btn btn--primary" type="submit">Send me Day 1</button>
          </form>
          <div class="funnel__note">Unsubscribe in one click. Your archetype stays yours.</div>
        </div>
      </div>

      <div class="footer">
        <a href="#" data-action="restart">↻ Retake the diagnostic</a>
        <span>Sample · Built for Naeem Mahmood</span>
      </div>
    </div>
  `;
}

// Boot
render();
