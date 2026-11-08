import test from 'node:test';
import assert from 'node:assert/strict';
import { createCircuit, loadCircuitRecipe, evaluate, placeGate } from '../js/quantum/circuit.js';
import { probabilities, measureQubit } from '../js/quantum/state.js';
import { H2_MOLECULES, vqeRecipe, vqeEnergy, referenceEnergy, createVqeOptimizer } from '../js/quantum/vqe.js';
import { TELEPORT_INPUTS, teleportRecipe, teleportCorrectionRecipe, correctTeleportState, teleportFidelity, qubitBloch, inputBloch } from '../js/quantum/teleportation.js';
const near = (a, b, tolerance = 1e-10) => assert.ok(Math.abs(a - b) < tolerance, `${a} != ${b}`);
function build(recipe) { const circuit = createCircuit(16, 5);loadCircuitRecipe(circuit, recipe);return circuit; }

test('H2 coefficients reproduce full-CI reference data and the Hartree-Fock initial state', () => {
  for (const molecule of H2_MOLECULES) {
    near(referenceEnergy(molecule), molecule.ground);
    near(vqeEnergy(evaluate(build(vqeRecipe(0))), molecule), molecule.hartreeFock);
    for (let theta = -Math.PI; theta < Math.PI; theta += .17) {
      const state = evaluate(build(vqeRecipe(theta)));
      const e = vqeEnergy(state, molecule);
      near(e, molecule.identity + molecule.z * Math.cos(theta) + molecule.x * Math.sin(theta));
      assert.ok(e >= molecule.ground - 1e-10);
      near(probabilities(state)[0], Math.cos(theta / 2) ** 2);
    }
  }
  near(H2_MOLECULES[1].ground, -1.1373060357534);
});

test('VQE evaluates edited circuit states and improves energy with one candidate per step', () => {
  for (const molecule of H2_MOLECULES) {
    const edited = build([]);placeGate(edited, 4, 1, 'X');
    near(vqeEnergy(evaluate(edited), molecule), molecule.identity - molecule.z);
    const optimizer = createVqeOptimizer({ molecule, theta: 0 });
    const initial = optimizer.snapshot();let current = initial;
    while (!current.done) {
      const previous = current;current = optimizer.step();
      assert.equal(current.evaluations, previous.evaluations + 1);
      near(current.current.energy, vqeEnergy(evaluate(build(vqeRecipe(current.current.theta))), molecule));
      assert.ok(current.best.energy <= previous.best.energy + 1e-12);
      assert.ok(current.iteration <= 96);
    }
    assert.equal(initial.history.length, 1);
    assert.ok(current.best.energy < initial.best.energy);
    near(current.best.energy, molecule.ground, 1e-5);
    assert.deepEqual(optimizer.step(), current);
  }
});

test('teleportation restores amplitude and complex phase for every sender outcome and input', () => {
  for (const input of [...TELEPORT_INPUTS, { theta: .83, phi: 1.27 }]) {
    const circuit = build(teleportRecipe(input));
    const original = evaluate(circuit), originalCopy = JSON.stringify(original);
    const target = inputBloch(input);
    const receiver = qubitBloch(original, 4);
    near(receiver.x, 0);near(receiver.y, 0);near(receiver.z, 0);
    near(teleportFidelity(original, input), .5);
    for (const a of [0, 1]) for (const b of [0, 1]) {
      const first = measureQubit(original, 2, () => a ? .99 : .01);
      const second = measureQubit(first.state, 3, () => b ? .99 : .01);
      assert.equal(first.outcome, a);assert.equal(second.outcome, b);
      const results = [{ row: 2, value: a }, { row: 3, value: b }];
      const before = JSON.stringify(second.state);
      const corrected = correctTeleportState(second.state, results);
      near(teleportFidelity(corrected, input), 1);
      const actual = qubitBloch(corrected, 4);
      for (const axis of ['x', 'y', 'z']) near(actual[axis], target[axis]);
      assert.equal(JSON.stringify(second.state), before);
      const recipe = teleportCorrectionRecipe(results);
      assert.equal(recipe.some(g => g.gateId === 'X'), Boolean(b));
      assert.equal(recipe.some(g => g.gateId === 'Z'), Boolean(a));
      const displayed = build([...teleportRecipe(input), ...recipe]);
      for (const gate of recipe) assert.equal(displayed[gate.row][gate.col].classicalControl, gate.classicalControl);
    }
    assert.equal(JSON.stringify(original), originalCopy);
  }
});

test('sender outcomes are uniform and their uncommunicated average reveals no input state', () => {
  for (const input of TELEPORT_INPUTS) {
    const state = evaluate(build(teleportRecipe(input)));
    const p = probabilities(state);
    for (let bits = 0; bits < 4; bits++) {
      const chance = p.reduce((sum, weight, index) => sum + ((index >> 1) === bits ? weight : 0), 0);
      near(chance, .25);
    }
  }
  assert.throws(() => teleportCorrectionRecipe([{ row: 2, value: 0 }]));
});
