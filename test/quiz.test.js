import test from 'node:test';
import assert from 'node:assert/strict';
import { QUIZ_QUESTIONS } from '../js/courses/quiz-questions.js';
import { createQuizSession } from '../js/courses/quiz-session.js';
import { createCircuit, loadCircuitRecipe, evaluate, usedGateCounts, MAX_COLS } from '../js/quantum/circuit.js';
import { probabilities, phases } from '../js/quantum/state.js';
import { createCourses } from '../js/courses/courses.js';
import { setLanguage } from '../js/i18n.js';

function context(recipe, measured = null) {
  const circuit = createCircuit();
  loadCircuitRecipe(circuit, recipe);
  const state = evaluate(circuit);
  return { probs: probabilities(state), phases: phases(state), counts: usedGateCounts(circuit), measured, sig: JSON.stringify(circuit) };
}
function memory() {
  const data = new Map();
  return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
}

test('all 100 bilingual questions have a valid solution within 15 columns', () => {
  assert.equal(QUIZ_QUESTIONS.length, 100);
  assert.equal(new Set(QUIZ_QUESTIONS.map((q) => q.id)).size, 100);
  assert.equal(new Set(QUIZ_QUESTIONS.map((q) => q.text)).size, 100);
  assert.equal(new Set(QUIZ_QUESTIONS.map((q) => q.kind)).size, 8);
  for (const question of QUIZ_QUESTIONS) {
    assert.ok(question.textEn && question.hintEn && question.categoryEn, question.id);
    assert.ok(question.solution.every((gate) => gate.col < MAX_COLS), question.id);
    assert.equal(question.judge(context(question.solution)), true, question.id);
    if (question.id !== 'quiz-001') assert.equal(question.judge(context([])), false, question.id + ' must reject the empty circuit');
  }
  const uniform = [0, 1, 2].map((row) => ({ row, col: 0, gateId: 'H' }));
  for (const question of QUIZ_QUESTIONS.filter((q) => q.kind === 'phase')) {
    assert.equal(question.judge(context(uniform)), false, 'equal probabilities alone do not solve phase marking');
  }
});

test('the random deck does not repeat until all 100 have been drawn and avoids a repeat at the boundary', () => {
  let seed = 1729;
  const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const session = createQuizSession({ random, storage: null });
  const seen = new Set();
  let last;
  for (let i = 0; i < 100; i++) {
    last = session.current().id;
    assert.equal(seen.has(last), false);
    seen.add(last);
    if (i < 99) session.next();
  }
  assert.equal(session.remainingCount(), 0);
  assert.notEqual(session.next().id, last);
  assert.equal(seen.size, 100);
});

test('current question, remaining deck and distinct clears persist; bad storage recovers', () => {
  const storage = memory();
  const first = createQuizSession({ random: () => 0.3, storage });
  const id = first.current().id;
  assert.equal(first.markCleared(), true);
  assert.equal(first.markCleared(), false);
  assert.equal(first.clearedCount(), 1);
  const restored = createQuizSession({ storage });
  assert.equal(restored.current().id, id);
  assert.equal(restored.remainingCount(), 99);
  assert.equal(restored.clearedCount(), 1);
  assert.notEqual(restored.next().id, id);
  const bad = createQuizSession({ storage: { getItem: () => '{broken', setItem() {} } });
  assert.ok(bad.current());
  assert.equal(bad.remainingCount(), 99);
});

function panelMock() {
  let html = '';
  let buttons = [];
  return {
    get innerHTML() { return html; },
    set innerHTML(value) {
      html = value;
      buttons = [...value.matchAll(/data-act="([\w-]+)"(?: data-i="(\d+)")?/g)].map((m) => ({
        dataset: { act: m[1], i: m[2] }, addEventListener(_event, callback) { this.callback = callback; },
      }));
    },
    querySelectorAll() { return buttons; },
    click(action) {
      const button = buttons.find((b) => b.dataset.act === action);
      assert.ok(button, 'missing ' + action);
      button.callback();
    },
  };
}

test('quiz needs a correct circuit and measurement, preserves language, and resets before the next question', () => {
  globalThis.localStorage = memory();
  globalThis.document = { documentElement: {} };
  setLanguage('ja');
  const panel = panelMock();
  let changes = 0;
  let busy = false;
  const courses = createCourses(panel, {
    onAllowedChange() {}, isBusy: () => busy,
    onModeChange() { changes++; courses.update(context([])); },
  });
  courses.setMode('quiz');
  const question = QUIZ_QUESTIONS.find((q) => panel.innerHTML.includes('data-quiz-id="' + q.id + '"'));
  assert.ok(question);
  assert.equal(courses.getMeasurementPlan(), null);
  assert.deepEqual(courses.getAllowedGates(), question.allowed);
  const ctx = context(question.solution);
  courses.update(ctx);
  assert.match(panel.innerHTML, /回路は正解/);
  assert.match(panel.innerHTML, /累計クリア 0\/100/);
  const measured = ctx.probs.findIndex((p) => p > 0.01);
  courses.update({ ...ctx, measured });
  assert.match(panel.innerHTML, /正解!/);
  assert.match(panel.innerHTML, /累計クリア 1\/100/);
  courses.update({ ...ctx, measured });
  assert.match(panel.innerHTML, /累計クリア 1\/100/);
  setLanguage('en');
  courses.render();
  assert.match(panel.innerHTML, /Correct!/);
  assert.match(panel.innerHTML, /Solved 1\/100/);
  assert.ok(panel.innerHTML.includes('data-quiz-id="' + question.id + '"'));
  busy = true;
  panel.click('next-quiz');
  assert.equal(changes, 0);
  busy = false;
  panel.click('next-quiz');
  assert.equal(changes, 1);
  assert.ok(!panel.innerHTML.includes('data-quiz-id="' + question.id + '"'));
  assert.doesNotMatch(panel.innerHTML, /Correct!/);
  setLanguage('ja');
});
