import test from 'node:test';
import assert from 'node:assert/strict';
import { probabilities, phases } from '../js/quantum/state.js';
import { createCircuit, placeGate, evaluate, usedGateCounts } from '../js/quantum/circuit.js';
import { LESSON_STEPS } from '../js/courses/lessons.js';

function panelMock() {
  let html = '';
  let buttons = [];
  return {
    get innerHTML() { return html; },
    set innerHTML(value) {
      html = value;
      buttons = [...value.matchAll(/data-act="([\w-]+)"(?: data-i="(\d+)")?/g)].map((match) => ({
        dataset: { act: match[1], i: match[2] },
        addEventListener(_type, callback) { this.callback = callback; },
      }));
    },
    querySelectorAll() { return buttons; },
    click(action, index) {
      const button = buttons.find((item) => item.dataset.act === action
        && (index === undefined || item.dataset.i === String(index)));
      assert.ok(button, `missing button ${action}`);
      button.callback();
    },
  };
}

function context(circuit, measured = null) {
  const state = evaluate(circuit);
  return {
    probs: probabilities(state), phases: phases(state), counts: usedGateCounts(circuit),
    measured, sig: JSON.stringify(circuit),
  };
}

test('challenge clears after measurement and reports the observed image in both languages', async () => {
  const storage = new Map();
  globalThis.localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
  };
  globalThis.document = { documentElement: {} };
  const { createCourses } = await import('../js/courses/courses.js');
  const { setLanguage } = await import('../js/i18n.js');
  const panel = panelMock();
  const courses = createCourses(panel, { onAllowedChange() {} });
  courses.setMode('try');

  const empty = createCircuit();
  courses.update(context(empty, 0));
  assert.match(panel.innerHTML, /観測はできたけど/);
  assert.equal(storage.get('qdisco-cleared'), undefined);

  const certain = createCircuit();
  placeGate(certain, 0, 0, 'X');
  placeGate(certain, 2, 0, 'X');
  courses.update(context(certain));
  assert.match(panel.innerHTML, /回路は正解/);
  assert.equal(storage.get('qdisco-cleared'), undefined);

  courses.update(context(certain, 5));
  assert.match(panel.innerHTML, /砂漠/);
  assert.match(panel.innerHTML, /確率100%/);
  assert.deepEqual(JSON.parse(storage.get('qdisco-cleared')), [0]);

  courses.update(context(certain));
  assert.match(panel.innerHTML, /観測された画像/);
  courses.update(context(empty));
  assert.doesNotMatch(panel.innerHTML, /観測された画像/);
  courses.update(context(certain));
  assert.doesNotMatch(panel.innerHTML, /観測された画像/);

  panel.click('next-challenge');
  const balanced = createCircuit();
  placeGate(balanced, 0, 0, 'H');
  courses.update(context(balanced));
  assert.match(panel.innerHTML, /回路は正解/);
  courses.update(context(balanced, 4));
  assert.match(panel.innerHTML, /宇宙/);
  assert.match(panel.innerHTML, /50%/);
  assert.deepEqual(JSON.parse(storage.get('qdisco-cleared')), [0, 1]);

  setLanguage('en');
  courses.render();
  assert.match(panel.innerHTML, /Observed image: “Space”/);
  assert.match(panel.innerHTML, /50% chance/);
  setLanguage('ja');

  panel.click('goto-challenge', 0);
  courses.update(context(certain));
  assert.doesNotMatch(panel.innerHTML, /観測された画像/);
});

test('a low-probability image can complete a challenge, while equal outcomes are not called less likely', async () => {
  const storage = new Map();
  globalThis.localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
  };
  globalThis.document = { documentElement: {} };
  const { createCourses } = await import('../js/courses/courses.js');
  const panel = panelMock();
  const courses = createCourses(panel, { onAllowedChange() {} });
  courses.setMode('try');
  panel.click('goto-challenge', 4);

  const tilted = createCircuit();
  placeGate(tilted, 0, 0, 'X');
  placeGate(tilted, 1, 0, 'H');
  placeGate(tilted, 1, 1, 'R');
  tilted[1][1].theta = 3 * Math.PI / 4;
  placeGate(tilted, 1, 2, 'H');
  courses.update(context(tilted));
  assert.match(panel.innerHTML, /回路は正解/);
  courses.update(context(tilted, 4));
  assert.match(panel.innerHTML, /低確率の画像が出た/);
  assert.match(panel.innerHTML, /15%/);
  assert.deepEqual(JSON.parse(storage.get('qdisco-cleared')), [4]);

  panel.click('goto-challenge', 2);
  const uniform = createCircuit();
  for (let row = 0; row < 3; row++) placeGate(uniform, row, 0, 'H');
  courses.update(context(uniform));
  courses.update(context(uniform, 7));
  assert.match(panel.innerHTML, /雪/);
  assert.match(panel.innerHTML, /13%/); // 12.5% rounds to 13% in the UI
  assert.doesNotMatch(panel.innerHTML, /低確率の画像が出た/);

  // レッスンで観測を学ぶステップは、従来どおり M が必須。
  assert.equal(LESSON_STEPS[5].check(context(uniform)), false);
  assert.equal(LESSON_STEPS[5].check(context(uniform, 7)), true);
});

test('advancing releases the previous observation before judging the next lesson or challenge, preserving the circuit', async () => {
  globalThis.localStorage = { getItem: () => null, setItem() {} };
  globalThis.document = { documentElement: {} };
  const { createCourses } = await import('../js/courses/courses.js');
  const { loadCircuitRecipe } = await import('../js/quantum/circuit.js');
  const panel = panelMock(), circuit = createCircuit();
  let measured = null, advances = 0, busy = false;
  const courses = createCourses(panel, {
    onAllowedChange() {}, isBusy: () => busy,
    onLessonSelect(step) { loadCircuitRecipe(circuit, step.initialGates);measured = null;courses.update(context(circuit)); },
    onAdvance() { advances++;measured = null;courses.update(context(circuit)); },
  });
  courses.setMode('lesson');
  panel.click('goto-lesson', 3); // deterministic measurement lesson
  measured = 5;courses.update(context(circuit, measured));
  const before = JSON.stringify(circuit);
  busy = true;panel.click('next-step');assert.equal(advances, 0);
  busy = false;panel.click('next-step');
  assert.equal(measured, null);assert.equal(advances, 1);assert.equal(JSON.stringify(circuit), before);

  panel.click('goto-lesson', 4);
  placeGate(circuit, 0, 0, 'H');courses.update(context(circuit));
  for (const row of [1,2]) placeGate(circuit, row, 0, 'H');
  measured = 3;courses.update(context(circuit, measured));
  panel.click('next-step'); // next lesson requires a new measurement of the same uniform circuit
  assert.doesNotMatch(panel.innerHTML, /data-act="next-step"/);
  assert.equal(measured, null);
  courses.update(context(circuit, 2));assert.match(panel.innerHTML, /data-act="next-step"/);

  courses.setMode('try');
  panel.click('goto-challenge', 2);
  measured = 2;courses.update(context(circuit, measured));
  const tryCircuit = JSON.stringify(circuit), count = advances;
  panel.click('toggle-hint');assert.equal(advances, count);
  panel.click('next-challenge');assert.equal(advances, count + 1);assert.equal(measured, null);
  assert.doesNotMatch(panel.innerHTML, /観測された画像/);
  measured = 7;courses.update(context(circuit, measured));
  panel.click('goto-challenge', 2);assert.equal(advances, count + 2);assert.equal(measured, null);
  assert.equal(JSON.stringify(circuit), tryCircuit);
  assert.doesNotMatch(panel.innerHTML, /観測された画像/);
});
