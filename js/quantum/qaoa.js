import { createCircuit, loadCircuitRecipe, evaluate } from './circuit.js';
import { probabilities } from './state.js';

// 頂点番号は回路の行（0=q4、4=q0）。5頂点なので全32通りを比較できる。
export const QAOA_GRAPHS = [
  { id: 'ring', name: 'qaoaRing', edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]] },
  { id: 'path', name: 'qaoaPath', edges: [[0, 1], [1, 2], [2, 3], [3, 4]] },
  { id: 'star', name: 'qaoaStar', edges: [[0, 1], [0, 2], [0, 3], [0, 4]] },
  { id: 'complete', name: 'qaoaComplete', edges: Array.from({ length: 5 }, (_, a) =>
    Array.from({ length: 4 - a }, (_, offset) => [a, a + offset + 1])).flat() },
];

// 選択時だけ新しい問題を作る。テンプレートや探索中の重みは変更しない。
export function randomWeightedGraph(template, random = Math.random) {
  return { ...template, edges: template.edges.map(([a, b]) => [a, b, 1 + Math.floor(random() * 5)]) };
}

export function totalEdgeWeight(graph) {
  return graph.edges.reduce((sum, [, , weight = 1]) => sum + weight, 0);
}

export function cutValue(value, graph) {
  return graph.edges.reduce((score, [a, b, weight = 1]) => {
    const different = ((value >> (4 - a)) ^ (value >> (4 - b))) & 1;
    return score + different * weight;
  }, 0);
}

// p=1: |+>^5 → exp(-iγ C) → exp(-iβ ΣX)。Cを最大化する符号規約。
// Cは異色の辺の重みの合計。R(-γ×重み付き次数)と各辺のCP(2γw)で実装。
// H R(2β) H は全体位相を除いて RX(2β)。新しいブラックボックスは使わない。
export function qaoaRecipe({ graph = QAOA_GRAPHS[0], gamma = Math.PI / 8, beta = Math.PI / 8 } = {}) {
  const recipe = Array.from({ length: 5 }, (_, row) => ({ row, col: 0, gateId: 'H' }));
  for (let row = 0; row < 5; row++) {
    const degree = graph.edges.reduce((sum, [a, b, weight = 1]) => sum + (a === row || b === row ? weight : 0), 0);
    recipe.push({ row, col: 1, gateId: 'R', theta: -gamma * degree, role: 'problem' });
  }
  graph.edges.forEach(([control, row, weight = 1], index) => {
    recipe.push({ row, col: index + 2, gateId: 'CP', control, theta: 2 * gamma * weight, role: 'problem' });
  });
  const mixer = graph.edges.length + 2;
  for (let row = 0; row < 5; row++) {
    recipe.push({ row, col: mixer, gateId: 'H' }, { row, col: mixer + 1, gateId: 'R', theta: 2 * beta }, { row, col: mixer + 2, gateId: 'H' });
  }
  return recipe;
}

export function qaoaStatistics(probs, graph) {
  const scores = Array.from({ length: 32 }, (_, value) => cutValue(value, graph));
  const optimum = Math.max(...scores);
  let expected = 0, optimalProbability = 0;
  probs.forEach((p, value) => {
    expected += p * scores[value];
    if (scores[value] === optimum) optimalProbability += p;
  });
  return { expected, optimalProbability, optimum, totalWeight: totalEdgeWeight(graph), baseline: totalEdgeWeight(graph) / 2,
    baselineOptimalProbability: scores.filter((score) => score === optimum).length / 32 };
}

// 1ステップにつき候補1組だけを評価する局所探索。
// 改善方向を続け、周囲8方向で改善がなければ探索幅を半分にする。
export function createQaoaOptimizer({ graph, gamma, beta, maxIterations = 96 }) {
  const circuit = createCircuit(16, 5);
  const wrap = (value, period) => ((value % period) + period) % period;
  const directions = [[1, 1], [1, 0], [0, 1], [-1, 0], [0, -1], [1, -1], [-1, 1], [-1, -1]];
  let evaluations = 0, iteration = 0, stepSize = Math.PI / 32, done = false;
  let direction = 0, misses = 0;
  const score = (g, b) => {
    const gamma = wrap(g, 2 * Math.PI), beta = wrap(b, Math.PI);
    loadCircuitRecipe(circuit, qaoaRecipe({ graph, gamma, beta }));
    evaluations++;
    return { gamma, beta, ...qaoaStatistics(probabilities(evaluate(circuit)), graph) };
  };
  let best = score(gamma, beta);
  let current = best;
  const history = [{ iteration, ...current, bestExpected: best.expected, evaluations, improved: false, refined: false, stepSize }];
  const snapshot = () => ({ iteration, evaluations, stepSize, done, best: { ...best }, current: { ...current }, history: history.map((point) => ({ ...point })) });
  return {
    snapshot,
    step() {
      if (done) return snapshot();
      const [dg, db] = directions[direction];
      current = score(best.gamma + dg * stepSize, best.beta + db * stepSize);
      const improved = current.expected > best.expected + 1e-10;
      let refined = false;
      if (improved) {
        best = current;misses = 0;
      } else {
        misses++;direction = (direction + 1) % directions.length;
        if (misses === directions.length) {
          stepSize /= 2;misses = 0;refined = true;
        }
      }
      iteration++;
      done = stepSize < Math.PI / 256 || iteration >= maxIterations;
      history.push({ iteration, ...current, bestExpected: best.expected, evaluations, improved, refined, stepSize });
      return snapshot();
    },
  };
}
