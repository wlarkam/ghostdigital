// Lead notification email: builder + routing. Never sends.
//   node --test tools/wholesome/lead-email.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { buildLeadEmail, recipients, sendLeadEmail } = require('../../api/_lead-email.js');

const payload = (o = {}) => ({
  first_name: 'Maya', email: 'maya@example.com', phone: '403 555 0100',
  lead: {
    path: 'Scar & Stretch Mark Revision Review', stage: 'Photo review recommended', path_id: 'WE-9789',
    summary: 'Maya is interested in scars or stretch marks.', next_step: 'Start With a Photo Review',
    flags: ['Area healed less than 6 months ago'],
    answers: [['What area are you looking to treat?', 'Stomach, Arms']],
  },
  ...o,
});

const ENV = {
  RESEND_API_KEY: 're_test', LEAD_EMAIL_FROM: 'Map <leads@example.com>',
  LEAD_EMAIL_TO: 'coordinator@wholesomeempireyyc.com, warren@example.com',
  LEAD_EMAIL_TEST_TO: 'warren@example.com',
};

test('email carries the lead, path, readiness, answers and reply-to', () => {
  const m = buildLeadEmail(payload());
  assert.equal(m.subject, 'New assessment: Maya · Scar & Stretch Mark Revision Review');
  assert.equal(m.replyTo, 'maya@example.com');
  for (const s of ['maya@example.com', '403 555 0100', 'Photo review recommended', 'WE-9789', 'Stomach, Arms', 'Area healed less than 6 months ago']) {
    assert.ok(m.html.includes(s), `html has ${s}`);
    assert.ok(m.text.includes(s), `text has ${s}`);
  }
  assert.ok(m.html.includes('href="tel:4035550100"'));
});

test('client-supplied fields are HTML-escaped', () => {
  const m = buildLeadEmail(payload({ first_name: '<img src=x onerror=alert(1)>', lead: { summary: '<script>x</script>' } }));
  assert.doesNotMatch(m.html, /<img src=x|<script>/);
  assert.match(m.html, /&lt;script&gt;/);
});

test('missing phone and lead details degrade gracefully', () => {
  const m = buildLeadEmail({ first_name: 'Sam', email: 'sam@example.com' });
  assert.equal(m.subject, 'New assessment: Sam');
  assert.match(m.text, /Phone: Not given/);
});

test('real leads go to the clinic and Warren; "Test" names go to Warren only', () => {
  assert.deepEqual(recipients('Maya', ENV), ['coordinator@wholesomeempireyyc.com', 'warren@example.com']);
  assert.deepEqual(recipients('Test Maya', ENV), ['warren@example.com']);
  assert.deepEqual(recipients('testing', ENV), ['coordinator@wholesomeempireyyc.com', 'warren@example.com'], 'only the word "test" counts');
  assert.match(buildLeadEmail(payload({ first_name: 'Test' })).subject, /^\[TEST\] /);
});

test('without config it skips sending instead of throwing', async () => {
  const r = await sendLeadEmail(payload(), {});
  assert.deepEqual(r, { sent: false, reason: 'not_configured' });
});
