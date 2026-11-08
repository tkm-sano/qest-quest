import test from 'node:test';
import assert from 'node:assert/strict';
import { createCircuit, loadCircuitRecipe, evaluate, placeGate, usedGateCounts } from '../js/quantum/circuit.js';
import { probabilities, phases } from '../js/quantum/state.js';
import { phaseComparisonRecipe } from '../js/courses/phase-comparison.js';
import { LESSON_STEPS } from '../js/courses/lessons.js';
import { phaseDisplay } from '../js/ui/phase-display.js';

function circuitFor(variant, interference = false) {
  const circuit = createCircuit();
  loadCircuitRecipe(circuit, phaseComparisonRecipe(variant, interference));
  return circuit;
}
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} != ${expected}`);

test('visible gates rotate all amplitudes together or only half, without changing initial probabilities', () => {
  const original = evaluate(circuitFor('original'));
  const global = evaluate(circuitFor('global'));
  const relative = evaluate(circuitFor('relative'));
  for (let i = 0; i < 8; i++) {
    close(probabilities(original)[i], 0.125);
    close(probabilities(global)[i], 0.125);
    close(probabilities(relative)[i], 0.125);
    close(global.re[i], -original.re[i]);close(global.im[i], 0);
    close(relative.re[i], original.re[i] * (i < 4 ? 1 : -1));close(relative.im[i], 0);
    close(Math.cos(phases(global)[i]), -1);
  }
});

test('interference reveals relative phase while global phase cannot change later probabilities', () => {
  for (const variant of ['original', 'global', 'relative']) {
    const probs = probabilities(evaluate(circuitFor(variant, true)));
    probs.forEach((p, index) => close(p, index === (variant === 'relative' ? 4 : 0) ? 1 : 0));
  }
  // A nontrivial shared suffix, beyond just undoing the initial H gates.
  const circuits = ['original', 'global'].map(variant => circuitFor(variant));
  for (const circuit of circuits) {
    placeGate(circuit, 2, 6, 'R');circuit[2][6].theta = Math.PI / 3;
    placeGate(circuit, 1, 7, 'H');placeGate(circuit, 0, 8, 'CNOT');
    placeGate(circuit, 2, 9, 'H');placeGate(circuit, 1, 10, 'Y');
  }
  const [a, b] = circuits.map(circuit => evaluate(circuit));
  for (let i = 0; i < 8; i++) {
    close(b.re[i], -a.re[i]);close(b.im[i], -a.im[i]);
    close(probabilities(a)[i], probabilities(b)[i]);
  }
});

test('the introductory phase lesson requires a relative phase, not merely a global rotation', () => {
  const lesson = LESSON_STEPS[6];
  for (const [variant, expected] of [['original', false], ['global', false], ['relative', true]]) {
    const circuit = circuitFor(variant), state = evaluate(circuit);
    assert.equal(lesson.check({ probs: probabilities(state), phases: phases(state), counts: usedGateCounts(circuit) }), expected);
  }
});

test('optional relative display removes only a common angle, keeps its reference fixed and does not mutate physics', () => {
  const state = evaluate(circuitFor('relative'));
  const probs = probabilities(state), raw = phases(state), snapshot = [...raw];
  const rotated = Float64Array.from(raw, angle => angle + 0.739);
  const a = phaseDisplay(probs, raw, { relative: true, reference: 4 });
  const b = phaseDisplay(probs, rotated, { relative: true, reference: 4 });
  assert.equal(a.applied, true);close(a.phases[4], 0);
  for (let i = 0; i < 8; i++) close(Math.cos(a.phases[i] - b.phases[i]), 1);
  close(Math.cos(a.phases[0]), -1);
  assert.deepEqual([...raw], snapshot);
  const definite = evaluate(circuitFor('relative', true));
  const unavailable = phaseDisplay(probabilities(definite), phases(definite), { relative: true, reference: 0 });
  assert.equal(unavailable.available, false);assert.equal(unavailable.applied, false);
  const rawView = phaseDisplay(probs, rotated);
  assert.equal(rawView.applied, false);
  for (let i = 0; i < 8; i++) close(Math.cos(rawView.phases[i] - rotated[i]), 1);
});
