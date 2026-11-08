import test from 'node:test';
import assert from 'node:assert/strict';
import { probabilities, phases, measureQubit } from '../js/quantum/state.js';
import { createCircuit, placeGate, evaluate, usedGateCounts, loadCircuitRecipe } from '../js/quantum/circuit.js';
import { LESSON_STEPS } from '../js/courses/lessons.js';
import { createCourses } from '../js/courses/courses.js';
import { setLanguage } from '../js/i18n.js';

function context(circuit, measured = null, partialResults = []) {
  const state = evaluate(circuit);
  return {
    probs: probabilities(state), phases: phases(state), counts: usedGateCounts(circuit),
    measured, partialResults, sig: JSON.stringify(circuit),
  };
}

function build(gates) {
  const circuit = createCircuit();
  for (const [row, col, gate, theta] of gates) {
    assert.equal(placeGate(circuit, row, col, gate), true);
    if (theta !== undefined) circuit[row][col].theta = theta;
  }
  return circuit;
}

const cx = () => build([[0, 0, 'X'], [2, 1, 'CNOT']]);
const entangled = () => build([[0, 0, 'H'], [2, 1, 'CNOT']]);
function measuredPair(value) {
  const circuit = entangled();
  const first = measureQubit(evaluate(circuit), 0, () => value ? 0.9 : 0.1);
  const second = measureQubit(first.state, 2, () => 0.5);
  return context(circuit, first.outcome * 4 + second.outcome, [
    { row: 0, value: first.outcome }, { row: 2, value: second.outcome },
  ]);
}
const ccx = () => build([[0, 0, 'X'], [1, 0, 'X'], [2, 1, 'CCNOT']]);
const mark = () => build([
  [0, 0, 'H'], [1, 0, 'H'], [2, 0, 'H'],
  [2, 1, 'H'], [2, 2, 'CCNOT'], [2, 3, 'H'],
]);
function amplify(twice = false) {
  const circuit = mark();
  assert.equal(placeGate(circuit, 0, 4, 'G'), true);
  if (twice) {
    for (const [row, col, gate] of [[2, 5, 'H'], [2, 6, 'CCNOT'], [2, 7, 'H'], [0, 8, 'G']]) {
      assert.equal(placeGate(circuit, row, col, gate), true);
    }
  }
  return circuit;
}
const step = (id) => LESSON_STEPS.find((item) => item.id === id);

test('new lessons can be completed with their displayed gates and real circuit probabilities', () => {
  const cases = [
    ['cx', cx(), null],
    ['cx-entanglement', entangled(), null],
    ['cx-product', cx(), null],
    ['ccx', ccx(), null],
    ['grover-mark', mark(), null],
    ['grover-amplify', amplify(), null],
    ['grover-measure', amplify(true), 7],
  ];
  for (const [id, circuit, measured] of cases) {
    const ctx = context(circuit, measured);
    assert.equal(step(id).check(ctx), true, id);
    for (const [gate, count] of Object.entries(ctx.counts)) {
      assert.ok(count === 0 || step(id).allowed.includes(gate), `${id}: ${gate} unavailable`);
    }
    assert.ok(step(id).textEn, `${id}: missing English instructions`);
  }
  assert.equal(step('cx-measure').check(measuredPair(0)), true);
  assert.equal(step('cx-measure').check(measuredPair(1)), true);
  const reversed = measuredPair(1);
  reversed.partialResults.reverse();
  assert.equal(step('cx-measure').check(reversed), true, 'either qubit can be measured first');
  reversed.partialResults.unshift({ row: 1, value: 0 });
  assert.equal(step('cx-measure').check(reversed), true, 'measuring the spectator is optional');
  assert.ok(Math.abs(context(amplify()).probs[7] - 0.78125) < 1e-9);
  assert.ok(Math.abs(context(amplify(true)).probs[7] - 0.9453125) < 1e-9);
  assert.equal(step('grover-measure').check(context(amplify(true), 0)), true,
    'a less likely measured image still completes the correct circuit');
});

test('lessons require the introduced gate, the correct phase mark, and measurement where requested', () => {
  assert.equal(step('cx').check(context(build([[0, 0, 'X'], [2, 0, 'X']]))), false);
  assert.equal(step('ccx').check(context(build([[0, 0, 'X'], [1, 0, 'X'], [2, 0, 'X']]))), false);
  assert.equal(step('cx-entanglement').check(context(cx())), false);
  assert.equal(step('cx-product').check(context(entangled())), false);
  assert.equal(step('cx-measure').check(context(entangled())), false);
  assert.equal(step('cx-measure').check(context(entangled(), 5)), false,
    'a full measurement cannot replace the two individual measurements');
  assert.equal(step('cx-measure').check(context(entangled(), null, [{ row: 0, value: 1 }])), false);
  assert.equal(step('cx-measure').measurement.ready(context(cx())), false,
    'X → CX must not start the entanglement measurement exercise');
  assert.equal(step('cx-measure').measurement.ready(context(entangled())), true);
  assert.equal(step('grover-measure').check(context(amplify(true))), false);

  const uniform = build([[0, 0, 'H'], [1, 0, 'H'], [2, 0, 'H']]);
  assert.equal(step('grover-mark').check(context(uniform)), false);
  const wrongMark = mark();
  placeGate(wrongMark, 0, 1, 'X');
  placeGate(wrongMark, 0, 3, 'X'); // marks 011 instead of 111
  assert.equal(step('grover-mark').check(context(wrongMark)), false);
  placeGate(wrongMark, 0, 4, 'G');
  assert.equal(step('grover-amplify').check(context(wrongMark)), false);
});

function panelMock() {
  let html = '';
  let buttons = [];
  return {
    get innerHTML() { return html; },
    set innerHTML(value) {
      html = value;
      buttons = [...value.matchAll(/data-act="([\w-]+)"(?: data-i="(\d+)")?/g)].map((match) => ({
        dataset: { act: match[1], i: match[2] },
        addEventListener(_event, callback) { this.callback = callback; },
      }));
    },
    querySelectorAll() { return buttons; },
    click(action, index) {
      const button = buttons.find((item) => item.dataset.act === action
        && (index === undefined || item.dataset.i === String(index)));
      assert.ok(button, `missing ${action}`);
      button.callback();
    },
  };
}

test('all 17 lessons progress to completion, keep learned gates, and notify the app before challenges', () => {
  globalThis.localStorage = { getItem: () => null, setItem() {} };
  globalThis.document = { documentElement: {} };
  setLanguage('ja');
  const panel = panelMock();
  let modeChanges = 0;
  const courses = createCourses(panel, {
    onAllowedChange() {}, onModeChange() { modeChanges++; },
    onLessonSelect(lesson) {
      const circuit = createCircuit();
      loadCircuitRecipe(circuit, lesson.initialGates);
      courses.update(context(circuit));
    },
  });
  courses.setMode('lesson');
  const desert = build([[0, 0, 'X'], [2, 0, 'X']]);
  const uniform = build([[0, 0, 'H'], [1, 0, 'H'], [2, 0, 'H']]);
  const cases = [
    [createCircuit()], [build([[2, 0, 'X']])], [desert], [desert, 5],
    [build([[0, 0, 'H']])], [uniform, 0],
    [build([[0, 0, 'H'], [0, 1, 'R', Math.PI / 2]])],
    [build([[0, 0, 'H'], [0, 1, 'R', Math.PI], [0, 2, 'H']])],
    [cx()], [entangled()], [cx()], [entangled(), 0, measuredPair(0).partialResults],
    [ccx()], [mark()], [amplify()], [amplify(true), 0],
  ];
  assert.equal(cases.length, LESSON_STEPS.length - 1);
  for (const [index, [circuit, measured = null, results = []]] of cases.entries()) {
    assert.match(panel.innerHTML, new RegExp(`レッスン ${index + 1}/17`));
    assert.equal(Boolean(courses.getMeasurementPlan()), index === 11);
    courses.update(context(circuit, measured, results));
    panel.click('next-step');
  }
  assert.match(panel.innerHTML, /レッスン 17\/17/);
  assert.match(panel.innerHTML, /1\/6/);
  for (let index = 0; index < 3; index++) panel.click('compare-phase', index);
  panel.click('phase-interference');
  panel.click('compare-phase', 0);
  assert.doesNotMatch(panel.innerHTML, /data-act="next-step"/);
  panel.click('compare-phase', 1);
  assert.match(panel.innerHTML, /6\/6/);
  panel.click('next-step');
  assert.match(panel.innerHTML, /レッスン修了/);
  assert.ok(courses.getAllowedGates().includes('CNOT'));
  assert.ok(courses.getAllowedGates().includes('CCNOT'));
  assert.ok(courses.getAllowedGates().includes('G'));
  setLanguage('en');
  courses.render();
  assert.match(panel.innerHTML, /entanglement from H → CX/);
  assert.match(panel.innerHTML, /Grover search/);
  panel.click('goto-try');
  assert.equal(courses.getMode(), 'try');
  assert.equal(courses.getMeasurementPlan(), null);
  assert.equal(modeChanges, 1);
  setLanguage('ja');
});

test('lesson selection opens any of the 17 steps with a valid prerequisite circuit', () => {
  const panel = panelMock();
  const circuit = createCircuit();
  let busy = false;
  let selected = null;
  const courses = createCourses(panel, {
    onAllowedChange() {}, isBusy: () => busy,
    onLessonSelect(lesson) {
      selected = lesson;
      loadCircuitRecipe(circuit, lesson.initialGates);
      courses.update(context(circuit));
    },
  });
  courses.setMode('lesson');
  for (const [index, lesson] of LESSON_STEPS.entries()) {
    panel.click('goto-lesson', index);
    assert.equal(selected, lesson);
    assert.match(panel.innerHTML, new RegExp(`レッスン ${index + 1}/17`));
    assert.ok(lesson.title && lesson.titleEn);
    const ctx = context(circuit);
    for (const [gate, count] of Object.entries(ctx.counts)) {
      assert.ok(count === 0 || courses.getAllowedGates().includes(gate));
    }
    if (lesson.check) assert.equal(lesson.check(ctx), false, `step ${index + 1} still needs user interaction`);
  }
  assert.ok(context(circuit).probs.every(p => Math.abs(p - 0.125) < 1e-9));
  busy = true;
  panel.click('goto-lesson', 11);
  assert.equal(selected, LESSON_STEPS[16], 'do not change lessons during a measurement');
  busy = false;
  panel.click('goto-lesson', 11);
  assert.deepEqual(courses.getMeasurementPlan().rows, [0, 2]);
  assert.equal(context(circuit).probs[5], 1);
});
