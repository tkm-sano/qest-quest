import test from 'node:test';
import assert from 'node:assert/strict';
import { createCircuit, placeGate, evaluate } from '../js/quantum/circuit.js';
import { probabilities, qubitProbabilities, measureQubit } from '../js/quantum/state.js';

const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-12, `${a} != ${b}`);
function bell() {
  const circuit = createCircuit();
  placeGate(circuit, 0, 0, 'H');
  placeGate(circuit, 2, 1, 'CNOT');
  return circuit;
}

test('measuring q2 in either Bell branch makes the unmeasured q0 certain, then q0 agrees', () => {
  const original = evaluate(bell());
  const before = structuredClone(original);
  for (const value of [0, 1]) {
    const first = measureQubit(original, 0, () => value ? 0.9 : 0.1);
    assert.equal(first.outcome, value);
    const prediction = qubitProbabilities(first.state, 2);
    near(prediction[value], 1);
    near(prediction[1 - value], 0);
    for (const random of [0, 0.999999]) {
      const second = measureQubit(first.state, 2, () => random);
      assert.equal(second.outcome, value);
      near(probabilities(second.state)[value * 5], 1);
    }
  }
  assert.deepEqual(original, before, 'measurement must not change the prepared circuit state');
});

test('partial measurement preserves the superposition and relative phase of an unmeasured spectator', () => {
  const circuit = bell();
  placeGate(circuit, 1, 0, 'H');
  placeGate(circuit, 1, 2, 'R');
  circuit[1][2].theta = Math.PI / 2;
  for (const value of [0, 1]) {
    const first = measureQubit(evaluate(circuit), 0, () => value ? 0.9 : 0.1);
    const second = measureQubit(first.state, 2, () => 0.5);
    const base = value * 5;
    near(second.state.re[base], Math.SQRT1_2);
    near(second.state.im[base + 2], Math.SQRT1_2);
    near(qubitProbabilities(second.state, 1)[0], 0.5);
    near(qubitProbabilities(second.state, 1)[1], 0.5);
  }
});

test('measuring one independent superposition leaves the other outcomes uncertain', () => {
  const circuit = createCircuit();
  placeGate(circuit, 0, 0, 'H');
  placeGate(circuit, 2, 0, 'H');
  const first = measureQubit(evaluate(circuit), 0, () => 0.1);
  near(qubitProbabilities(first.state, 2)[0], 0.5);
  near(qubitProbabilities(first.state, 2)[1], 0.5);
});
