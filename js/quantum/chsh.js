import { createCircuit, loadCircuitRecipe, evaluate } from './circuit.js';
import { probabilities, measure } from './state.js';

export const CHSH_PAIRS = [[0, 0], [0, 1], [1, 0], [1, 1]];

// A0=Z、A1=X。B0=cosθ Z+sinθ X、B1=cosθ Z−sinθ X。
// RY(-方向角)を置いてからZ測定する。使用するのはq1(行3)とq0(行4)。
export function chshRecipe({ theta = Math.PI / 4, entangled = true, pair = 0 } = {}) {
  const [a, b] = CHSH_PAIRS[pair];
  return [
    ...(entangled ? [{ row: 3, col: 0, gateId: 'H' }, { row: 4, col: 1, gateId: 'CNOT', control: 3 }] : []),
    { row: 3, col: 2, gateId: 'RY', theta: -a * Math.PI / 2, role: 'problem' },
    { row: 4, col: 2, gateId: 'RY', theta: b ? theta : -theta, role: 'problem' },
  ];
}

export function chshCorrelation(probs) {
  return probs.reduce((sum, p, value) => sum + (((value >> 1) & 1) === (value & 1) ? p : -p), 0);
}

export function chshValue(correlations) {
  return correlations[0] + correlations[1] + correlations[2] - correlations[3];
}

function settingStates(options) {
  const circuit = createCircuit(16, 5);
  return CHSH_PAIRS.map((_, pair) => { loadCircuitRecipe(circuit, chshRecipe({ ...options, pair }));return evaluate(circuit); });
}

export function chshStatistics(options = {}) {
  const correlations = settingStates(options).map(state => chshCorrelation(probabilities(state)));
  return { correlations, s: chshValue(correlations) };
}

// 4設定は別々に同じ初期状態から準備し、有限回の測定を独立に行う。
export function sampleChsh(options, shots = 256, random = Math.random) {
  if (!Number.isInteger(shots) || shots < 2) throw new RangeError('At least two shots per setting are required');
  const counts = settingStates(options).map(state => {
    const bins = [0, 0, 0, 0];
    for (let i = 0; i < shots; i++) bins[measure(state, random).outcome & 3]++;
    return bins;
  });
  const correlations = counts.map(bins => (bins[0] + bins[3] - bins[1] - bins[2]) / shots);
  const standardError = Math.sqrt(correlations.reduce((sum, e) => sum + (1 - e * e) / (shots - 1), 0));
  return { counts, correlations, shots, s: chshValue(correlations), standardError };
}
