import test from 'node:test';
import assert from 'node:assert/strict';
import { QAOA_GRAPHS, cutValue, qaoaRecipe, qaoaStatistics, createQaoaOptimizer, randomWeightedGraph, totalEdgeWeight } from '../js/quantum/qaoa.js';
import { createCircuit, loadCircuitRecipe, evaluate } from '../js/quantum/circuit.js';
import { probabilities, measureQubit } from '../js/quantum/state.js';
import { advancedCircuitSections, ADVANCED_COLS, PREPARATION_COLS } from '../js/quantum/advanced.js';

const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-10, `${a} != ${b}`);
function circuitFor(options) {
  const circuit = createCircuit(ADVANCED_COLS, 5);
  loadCircuitRecipe(circuit, qaoaRecipe(options));
  return circuit;
}

test('Max-Cut scores use q4..q0 and compare against all 32 actual colorings', () => {
  for (const graph of QAOA_GRAPHS) {
    const stats = qaoaStatistics(Array(32).fill(1 / 32), graph);
    near(stats.expected, graph.edges.length / 2);
    assert.equal(stats.optimum, graph.id === 'complete' ? 6 : 4);
    near(stats.optimalProbability, (graph.id === 'ring' ? 10 : graph.id === 'complete' ? 20 : 2) / 32);
    for (let value = 0; value < 32; value++) near(cutValue(value, graph), cutValue(value ^ 31, graph));
  }
  assert.equal(cutValue(0b10000, QAOA_GRAPHS[2]), 4);
  assert.equal(cutValue(0b00001, QAOA_GRAPHS[2]), 1);
});

test('QAOA gates match an independent complex-amplitude cost-and-RX calculation', () => {
  const gamma = .731, beta = .297;
  let draw = 0;
  const weighted = QAOA_GRAPHS.map((graph) => randomWeightedGraph(graph, () => (draw++ % 5) / 5));
  for (const graph of [...QAOA_GRAPHS, ...weighted]) {
    const s = evaluate(circuitFor({ graph, gamma, beta }));
    for (let output = 0; output < 32; output++) {
      let re = 0, im = 0;
      for (let input = 0; input < 32; input++) {
        const distance = (input ^ output).toString(2).replaceAll('0', '').length;
        const magnitude = Math.cos(beta) ** (5 - distance) * Math.sin(beta) ** distance / Math.sqrt(32);
        const angle = -gamma * cutValue(input, graph) - Math.PI / 2 * distance + 5 * beta;
        re += magnitude * Math.cos(angle);im += magnitude * Math.sin(angle);
      }
      near(s.re[output], re);near(s.im[output], im);
    }
    near(probabilities(s).reduce((a, b) => a + b, 0), 1);
  }
});

test('random weights create independent problem instances without changing graph templates', () => {
  const template = QAOA_GRAPHS.find((graph) => graph.id === 'complete');
  const original = JSON.stringify(template);
  let draws = 0;
  const first = randomWeightedGraph(template, () => (draws++ % 5) / 5);
  const second = randomWeightedGraph(template, () => .999);
  assert.equal(draws, 10);
  assert.equal(first.edges.length, 10);
  assert.equal(new Set(first.edges.map(([a, b]) => `${a},${b}`)).size, 10);
  assert.deepEqual(first.edges.slice(0, 5).map((edge) => edge[2]), [1, 2, 3, 4, 5]);
  assert.ok(second.edges.every((edge) => edge[2] === 5));
  assert.equal(JSON.stringify(template), original);
  first.edges[0][2] = 3;
  assert.equal(second.edges[0][2], 5);
  assert.equal(template.edges[0].length, 2);
});

test('weighted scores, random baseline and the cost-phase circuit agree for all 32 colorings', () => {
  let draw = 0;
  const graph = randomWeightedGraph(QAOA_GRAPHS.find((graph) => graph.id === 'complete'), () => (draw++ % 5) / 5);
  const gamma = .23;
  const circuit = circuitFor({ graph, gamma, beta: .4 });
  const costState = evaluate(circuit, graph.edges.length + 2);
  const scores = Array.from({ length: 32 }, (_, value) => {
    const bits = value.toString(2).padStart(5, '0');
    return graph.edges.reduce((sum, [a, b, weight]) => sum + (bits[a] !== bits[b] ? weight : 0), 0);
  });
  assert.equal(totalEdgeWeight(graph), 30);
  assert.equal(cutValue(0b10000, graph), 10);
  for (let value = 0; value < 32; value++) {
    assert.equal(cutValue(value, graph), scores[value]);
    near(costState.re[value], Math.cos(-gamma * scores[value]) / Math.sqrt(32));
    near(costState.im[value], Math.sin(-gamma * scores[value]) / Math.sqrt(32));
  }
  const stats = qaoaStatistics(Array(32).fill(1 / 32), graph);
  near(stats.expected, 15);near(stats.baseline, 15);
  assert.equal(stats.totalWeight, 30);
  assert.equal(stats.optimum, Math.max(...scores));
  near(stats.optimalProbability, scores.filter((score) => score === stats.optimum).length / 32);
});

test('weighted optimization keeps the same problem and reports real weighted trial scores', () => {
  let draws = 0;
  const graph = randomWeightedGraph(QAOA_GRAPHS[3], () => (draws++ % 5) / 5);
  const original = JSON.stringify(graph);
  const optimizer = createQaoaOptimizer({ graph, gamma: .17, beta: .24 });
  const initial = optimizer.snapshot();
  for (let i = 0; i < 12; i++) {
    const progress = optimizer.step();
    const state = evaluate(circuitFor({ graph, gamma: progress.current.gamma, beta: progress.current.beta }));
    near(qaoaStatistics(probabilities(state), graph).expected, progress.current.expected);
    assert.ok(progress.best.expected >= initial.best.expected - 1e-10);
    assert.equal(JSON.stringify(graph), original);
    assert.equal(draws, 10);
  }
});

test('preparation and either disabled QAOA operator retain a uniform distribution', () => {
  for (const graph of QAOA_GRAPHS) {
    const options = { graph, gamma: .7, beta: .3 };
    const c = circuitFor(options);
    const before = JSON.stringify(c);
    const probs = probabilities(evaluate(c, PREPARATION_COLS));
    for (const p of probs) near(p, 1 / 32);
    for (const disabled of [{ gamma: 0 }, { beta: 0 }]) {
      for (const p of probabilities(evaluate(circuitFor({ ...options, ...disabled })))) near(p, 1 / 32);
    }
    assert.equal(JSON.stringify(c), before);
    const recipe = qaoaRecipe(options), ranges = advancedCircuitSections({ kind: 'qaoa', graph });
    const cost = ranges.find((range) => range.part === 'problem');
    for (const gate of recipe) {
      assert.ok(gate.col < ADVANCED_COLS);
      assert.equal(gate.role === 'problem', gate.col >= cost.start && gate.col < cost.end);
    }
  }
});

test('iterative tuning uses current angles and improves real circuit scores, without forcing the answer', () => {
  for (const graph of QAOA_GRAPHS) {
    const optimizer = createQaoaOptimizer({ graph, gamma: Math.PI / 8, beta: Math.PI / 8 });
    const initial = optimizer.snapshot();
    let progress = initial;
    while (!progress.done) {
      progress = optimizer.step();
      assert.ok(progress.iteration <= 96);
      const state = evaluate(circuitFor({ graph, gamma: progress.best.gamma, beta: progress.best.beta }));
      near(qaoaStatistics(probabilities(state), graph).expected, progress.best.expected);
      const trial = evaluate(circuitFor({ graph, gamma: progress.current.gamma, beta: progress.current.beta }));
      near(qaoaStatistics(probabilities(trial), graph).expected, progress.current.expected);
      assert.ok(progress.best.expected >= progress.history.at(-2).bestExpected - 1e-10);
      assert.ok(progress.best.expected >= progress.current.expected - 1e-10);
    }
    assert.equal(initial.iteration, 0);
    assert.equal(initial.history.length, 1, 'earlier snapshots remain unchanged');
    assert.equal(progress.history.length, progress.iteration + 1);
    assert.equal(progress.evaluations, 1 + progress.iteration);
    assert.ok(progress.evaluations <= 97);
    const best = progress.best;
    const state = evaluate(circuitFor({ graph, gamma: best.gamma, beta: best.beta }));
    const stats = qaoaStatistics(probabilities(state), graph);
    near(stats.expected, best.expected);
    assert.ok(stats.expected > stats.baseline + .5);
    assert.ok(stats.optimalProbability > stats.baselineOptimalProbability);
    assert.ok(stats.expected < stats.optimum, 'one layer does not guarantee a best cut for these graphs');
    if (graph.id === 'ring') near(stats.expected, 3.75);
    let collapsed = state;
    let measured = 0;
    for (const row of [0, 1, 2, 3, 4]) {
      const result = measureQubit(collapsed, row, () => .37);
      collapsed = result.state;measured = (measured << 1) | result.outcome;
    }
    assert.ok(probabilities(state)[measured] > 1e-10);
    near(probabilities(collapsed)[measured], 1);
    assert.deepEqual(optimizer.step(), progress, 'finished runs do not keep evaluating');
  }
});

test('one step evaluates one trial, keeps worse results visible, and chooses the next trial from the best point', () => {
  const graph = QAOA_GRAPHS[0];
  const optimizer = createQaoaOptimizer({ graph, gamma: Math.PI / 8, beta: Math.PI / 8 });
  const initial = optimizer.snapshot();
  const first = optimizer.step(), second = optimizer.step(), third = optimizer.step();
  assert.equal(first.evaluations, initial.evaluations + 1);
  assert.equal(second.evaluations, first.evaluations + 1);
  assert.equal(third.evaluations, second.evaluations + 1);
  assert.ok(first.best.expected > initial.best.expected);
  assert.ok(first.best.expected < 3.75, 'a smaller real update does not jump to the ring optimum');
  assert.ok(second.current.expected < first.current.expected);
  near(second.best.expected, first.best.expected);
  assert.equal(second.history.at(-1).improved, false);
  near(third.current.gamma, first.best.gamma + Math.PI / 32);
  near(third.current.beta, first.best.beta);
  near(second.history.at(-1).expected, second.current.expected);
  near(second.history.at(-1).bestExpected, first.best.expected);
  assert.equal(second.done, false);
});

test('search width shrinks only after testing all eight directions, even when starting at a ring optimum', () => {
  const optimizer = createQaoaOptimizer({ graph: QAOA_GRAPHS[0], gamma: Math.PI / 4, beta: Math.PI / 8 });
  for (let count = 1; count <= 32; count++) {
    const progress = optimizer.step();
    assert.equal(progress.evaluations, count + 1);
    assert.equal(progress.history.at(-1).refined, count % 8 === 0);
    assert.equal(progress.done, count === 32);
    near(progress.best.expected, 3.75);
  }
});

test('a flat zero-angle start is escaped, periodic angles wrap, and an iteration budget stops work', () => {
  const graph = QAOA_GRAPHS[0];
  const optimizer = createQaoaOptimizer({ graph, gamma: 0, beta: 0, maxIterations: 2 });
  near(optimizer.snapshot().best.expected, 2.5);
  const first = optimizer.step();
  assert.ok(first.best.expected > 2.5);
  assert.equal(first.done, false);
  const last = optimizer.step();
  assert.equal(last.done, true);
  assert.equal(last.iteration, 2);
  const wrapped = createQaoaOptimizer({ graph, gamma: -Math.PI / 8, beta: Math.PI + Math.PI / 8 }).snapshot();
  near(wrapped.best.gamma, 2 * Math.PI - Math.PI / 8);
  near(wrapped.best.beta, Math.PI / 8);
});
