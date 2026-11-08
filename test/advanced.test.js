import test from 'node:test';
import assert from 'node:assert/strict';
import { createCircuit, loadCircuitRecipe, evaluate, placeGate, markerAt, cellOccupied } from '../js/quantum/circuit.js';
import { probabilities, measureQubit, qubitProbabilities, createState, applyControlledModularMultiply } from '../js/quantum/state.js';
import { PERIOD_EXAMPLES, phaseEstimationRecipe, periodFindingRecipe, advancedCircuitSections, registerProbabilities, measuredRegister, periodSample, modPow, ADVANCED_COLS, PREPARATION_COLS } from '../js/quantum/advanced.js';

const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-10, a + ' != ' + b);
function state(recipe) {
  const circuit = createCircuit(ADVANCED_COLS, 5);
  loadCircuitRecipe(circuit, recipe);
  return evaluate(circuit);
}

test('five-qubit phase estimation exactly reads all 16 grid phases in MSB-first order', () => {
  for (let index = 0; index < 16; index++) {
    const s = state(phaseEstimationRecipe(index / 16));
    const p = probabilities(s);
    assert.equal(p.length, 32);
    near(p[index * 2 + 1], 1);
    near(registerProbabilities(p, 4)[index], 1);
    let collapsed = s;
    const results = [];
    for (const row of [4, 2, 0, 3, 1]) {
      const result = measureQubit(collapsed, row, () => 0.5);
      results.push({ row, value: result.outcome });
      collapsed = result.state;
    }
    assert.equal(measuredRegister(results, 4), index);
  }
});

test('off-grid phases produce a normalized distribution instead of a fabricated exact answer', () => {
  const p = registerProbabilities(probabilities(state(phaseEstimationRecipe(1 / 32))), 4);
  near(p.reduce((sum, value) => sum + value, 0), 1);
  near(p[0], p[1]);
  assert.ok(p[0] > 0.4 && p[0] < 0.5);
  assert.ok(p[2] > 0);
});

test('problem roles distinguish controlled U from inverse QFT, survive moves, and have no effect on simulation', () => {
  const recipes = [phaseEstimationRecipe(1 / 32), phaseEstimationRecipe(7 / 32)];
  assert.deepEqual(recipes[0].filter((gate) => !gate.role), recipes[1].filter((gate) => !gate.role));
  assert.notDeepEqual(recipes[0].filter((gate) => gate.role), recipes[1].filter((gate) => gate.role));
  assert.ok(recipes[0].some((gate) => gate.gateId === 'CP' && !gate.role), 'inverse QFT contains shared CP gates');
  for (const example of [{ kind: 'phase', turns: 1 / 32 }, ...PERIOD_EXAMPLES.map((p) => ({ kind: 'period', ...p }))]) {
    const recipe = example.kind === 'phase' ? phaseEstimationRecipe(example.turns) : periodFindingRecipe(example);
    const range = advancedCircuitSections(example).find((section) => section.part === 'problem');
    for (const gate of recipe) assert.equal(gate.role === 'problem', gate.col >= range.start && gate.col < range.end);
    const untagged = recipe.map(({ role, ...gate }) => gate);
    assert.deepEqual(probabilities(state(recipe)), probabilities(state(untagged)));
    const circuit = createCircuit(ADVANCED_COLS, 5);
    loadCircuitRecipe(circuit, recipe);
    const gate = recipe.find((gate) => gate.role === 'problem');
    const original = circuit[gate.row][gate.col];
    assert.equal(original.role, 'problem');
    assert.ok(placeGate(circuit, gate.row, 15, gate.gateId, original));
    assert.equal(circuit[gate.row][15].role, 'problem');
  }
});

test('five-bit CCX flips on exactly its two controls, regardless of spectator bits', () => {
  const circuit = createCircuit(15, 5);
  placeGate(circuit, 0, 0, 'X');
  placeGate(circuit, 1, 0, 'X');
  placeGate(circuit, 4, 1, 'CCNOT');
  near(probabilities(evaluate(circuit))[25], 1); // 11001; spectators stay 00
});

test('period finding performs controlled multiplication by four mod fifteen and gives a 50% useful sample', () => {
  const multiply = periodFindingRecipe().filter((gate) => gate.col >= 2 && gate.col < 8);
  for (let control = 0; control < 2; control++) for (let work = 0; work < 16; work++) {
    const input = control * 16 + work;
    const prep = Array.from({ length: 5 }, (_, row) => row)
      .filter((row) => input & (1 << (4 - row))).map((row) => ({ row, col: 0, gateId: 'X' }));
    const expected = control * 16 + (control && work < 15 ? 4 * work % 15 : work);
    near(probabilities(state([...prep, ...multiply]))[expected], 1);
  }
  const circuit = createCircuit(15, 5);
  loadCircuitRecipe(circuit, periodFindingRecipe());
  const beforeInverse = evaluate(circuit, 8);
  const before = probabilities(beforeInverse);
  near(before[1], 0.5); // control=0, work=0001
  near(before[16 + 4], 0.5); // control=1, work=0100
  const output = evaluate(circuit);
  near(qubitProbabilities(output, 0)[0], 0.5);
  near(qubitProbabilities(output, 0)[1], 0.5);
  near(registerProbabilities(probabilities(output), 1)[1], 0.5);
});

test('all offered orders emerge from the real five-qubit circuit, with uncompressed remainder registers', () => {
  const expectedOrders = [2, 2, 2, 4, 2];
  for (const [index, example] of PERIOD_EXAMPLES.entries()) {
    const { readoutBits, workBits, modulus } = example;
    assert.equal(readoutBits + workBits, 5);
    assert.ok(2 ** workBits >= modulus);
    const order = expectedOrders[index], count = 2 ** readoutBits;
    const recipe = periodFindingRecipe(example);
    assert.ok(recipe.every((gate) => gate.col < ADVANCED_COLS));
    const s = state(recipe), p = registerProbabilities(probabilities(s), readoutBits);
    for (let value = 0; value < count; value++) near(p[value], value % (count / order) === 0 ? 1 / order : 0);
    // A sample taken after reading the remainder first must still lie in the supported readout bins.
    let collapsed = s;
    const results = [];
    for (const row of [4, 0, 3, 1, 2]) {
      const result = measureQubit(collapsed, row, () => .8);
      results.push({ row, value: result.outcome });
      collapsed = result.state;
    }
    const value = measuredRegister(results, readoutBits);
    assert.ok(p[value] > .01);
  }
});

test('all presets prepare the input before any algorithm gate and retain the full circuit when inspecting it', () => {
  for (const recipe of [phaseEstimationRecipe(.25), ...PERIOD_EXAMPLES.map(periodFindingRecipe)]) {
    const circuit = createCircuit(ADVANCED_COLS, 5);
    loadCircuitRecipe(circuit, recipe);
    const before = JSON.stringify(circuit);
    const preparation = recipe.filter((gate) => gate.col < PREPARATION_COLS);
    assert.deepEqual(preparation, [{ row: 4, col: 0, gateId: 'X' }]);
    near(probabilities(evaluate(circuit, PREPARATION_COLS))[1], 1);
    const after = probabilities(evaluate(circuit));
    assert.ok(after.some((p, index) => index !== 1 && p > .01));
    assert.equal(JSON.stringify(circuit), before);
    // The preview must use actual edited gates rather than a hard-coded |00001>.
    circuit[4][0] = null;
    placeGate(circuit, 3, 0, 'X');
    near(probabilities(evaluate(circuit, PREPARATION_COLS))[2], 1);
  }
});

test('modular blocks permute every basis input, including spectators and out-of-range remainders, without losing phase', () => {
  for (const example of PERIOD_EXAMPLES) {
    const { modulus, base, workBits, readoutBits } = example;
    for (let control = 0; control < readoutBits; control++) {
      const multiplier = modPow(base, 2 ** control, modulus);
      const destinations = new Set();
      for (let input = 0; input < 32; input++) {
        const s = createState(5);
        s.re.fill(0);s.re[input] = .6;s.im[input] = .8;
        const work = input % (2 ** workBits);
        const expected = input & (1 << (4 - control)) && work < modulus
          ? input - work + work * multiplier % modulus : input;
        applyControlledModularMultiply(s, control, multiplier, modulus, workBits);
        near(s.re[expected], .6);near(s.im[expected], .8);
        near(probabilities(s).reduce((sum, value) => sum + value), 1);
        destinations.add(expected);
      }
      assert.equal(destinations.size, 32);
    }
  }
  assert.throws(() => applyControlledModularMultiply(createState(5), 0, 3, 6, 3), RangeError);
  assert.throws(() => applyControlledModularMultiply(createState(5), 4, 2, 5, 3), RangeError);
});

test('classical processing verifies measured candidates and distinguishes orders from factors', () => {
  for (const example of PERIOD_EXAMPLES) assert.equal(periodSample(0, example).status, 'zero');
  const fifteen = periodSample(1, PERIOD_EXAMPLES[0]);
  assert.equal(fifteen.order, 2);
  assert.deepEqual(fifteen.divisors, [3, 5]);
  assert.equal(fifteen.factor * fifteen.cofactor, 15);
  const five = PERIOD_EXAMPLES.find((example) => example.modulus === 5);
  for (const value of [1, 3]) {
    const sample = periodSample(value, five);
    assert.equal(sample.status, 'verified');
    assert.equal(sample.order, 4);
    assert.equal(sample.factor, undefined); // 5 is prime; an order does not imply factors.
  }
  assert.equal(periodSample(2, five).status, 'insufficient'); // 1/2 hides the true order four.
  const six = periodSample(2, PERIOD_EXAMPLES.find((example) => example.modulus === 6));
  assert.equal(six.factor * six.cofactor, 6);
});

test('modular blocks reserve and display their work register and keep parameters when moved horizontally', () => {
  const circuit = createCircuit(15, 5);
  const block = periodFindingRecipe(PERIOD_EXAMPLES.find((example) => example.modulus === 5)).find((gate) => gate.gateId === 'CMOD');
  assert.ok(placeGate(circuit, block.row, block.col, block.gateId, block));
  assert.deepEqual(markerAt(circuit, block.control, block.col), { kind: 'control', gateRow: block.row });
  assert.deepEqual(markerAt(circuit, 4, block.col), { kind: 'span', gateRow: block.row, label: 'CMOD' });
  for (let row = 0; row < 5; row++) assert.ok(cellOccupied(circuit, row, block.col));
  assert.equal(placeGate(circuit, 4, block.col, 'X'), false);
  assert.equal(placeGate(circuit, block.row + 1, 8, 'CMOD', block), false);
  assert.ok(placeGate(circuit, block.row, 8, 'CMOD', circuit[block.row][block.col]));
  assert.deepEqual(circuit[block.row][8], circuit[block.row][block.col]);
});
