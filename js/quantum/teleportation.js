import { clone, applySingle } from './state.js';
import { GATES } from './gates.js';

export const TELEPORT_INPUTS = [
  { label: '|0⟩', theta: 0, phi: 0 }, { label: '|1⟩', theta: Math.PI, phi: 0 },
  { label: '|+⟩', theta: Math.PI / 2, phi: 0 }, { label: '|−⟩', theta: Math.PI / 2, phi: Math.PI },
  { label: '|+i⟩', theta: Math.PI / 2, phi: Math.PI / 2 }, { label: '|−i⟩', theta: Math.PI / 2, phi: -Math.PI / 2 },
  { label: 'cos(π/6)|0⟩ + eⁱπ/⁴sin(π/6)|1⟩', theta: Math.PI / 3, phi: Math.PI / 4 },
];

export function teleportRecipe(input) {
  return [
    { row: 2, col: 0, gateId: 'RY', theta: input.theta, role: 'problem' },
    { row: 2, col: 1, gateId: 'R', theta: input.phi, role: 'problem' },
    { row: 3, col: 2, gateId: 'H' }, { row: 4, col: 3, gateId: 'CNOT', control: 3 },
    { row: 3, col: 4, gateId: 'CNOT', control: 2 }, { row: 2, col: 5, gateId: 'H' },
  ];
}

export function teleportCorrectionRecipe(results) {
  if (![2, 3].every((row) => results.some((r) => r.row === row))) throw new Error('Measure both sender qubits first');
  return [
    ...(results.find((r) => r.row === 3).value ? [{ row: 4, col: 7, gateId: 'X', classicalControl: 3 }] : []),
    ...(results.find((r) => r.row === 2).value ? [{ row: 4, col: 8, gateId: 'Z', classicalControl: 2 }] : []),
  ];
}

export function correctTeleportState(state, results) {
  const corrected = clone(state);
  for (const gate of teleportCorrectionRecipe(results)) applySingle(corrected, 4, GATES[gate.gateId].matrix);
  return corrected;
}

// 他の量子ビットを部分トレースした1量子ビットのBloch成分。混合状態にも有効。
export function qubitBloch(state, row) {
  const mask = state.re.length >> (row + 1);
  let x = 0, y = 0, z = 0;
  for (let i = 0; i < state.re.length; i++) {
    const p = state.re[i] ** 2 + state.im[i] ** 2;
    z += (i & mask) ? -p : p;
    if (i & mask) continue;
    const j = i | mask;
    x += 2 * (state.re[i] * state.re[j] + state.im[i] * state.im[j]);
    y += 2 * (state.re[i] * state.im[j] - state.im[i] * state.re[j]);
  }
  return { x, y, z };
}

export function inputBloch(input) {
  return { x: Math.sin(input.theta) * Math.cos(input.phi), y: Math.sin(input.theta) * Math.sin(input.phi), z: Math.cos(input.theta) };
}

export function teleportFidelity(state, input) {
  const a = inputBloch(input), b = qubitBloch(state, 4);
  return Math.max(0, Math.min(1, (1 + a.x * b.x + a.y * b.y + a.z * b.z) / 2));
}
