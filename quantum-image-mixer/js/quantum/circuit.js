// 回路グリッド(標準3行×15列、発展5行×16列)のモデルと逐次評価。
// セル: null | { gateId, theta?, control?, controls? }
// トークンを置いた行が対象。CX/CPはcontrol、CCXはcontrolsの2行を持つ。

import { GATES, THETAS, CP_THETAS, rMatrix, ryMatrix } from './gates.js';
import { createState, applySingle, applyCNOT, applyCCNOT, applyDiffusion, applyControlledPhase, applyControlledModularMultiply, NUM_QUBITS } from './state.js';

export const ROWS = NUM_QUBITS;
export const MAX_COLS = 15;

export function createCircuit(cols = MAX_COLS, rows = ROWS) {
  return Array.from({ length: rows }, () => Array(cols).fill(null));
}

export function numCols(circuit) {
  return circuit[0].length;
}

// この行を制御(C)にしている CNOT のトークン行(=X の行)を返す
export function cnotControlAt(circuit, row, col) {
  for (let r = 0; r < circuit.length; r++) {
    const cell = circuit[r][col];
    if (cell && ['CNOT', 'CP'].includes(cell.gateId) && cell.control === row) return r;
  }
  return -1;
}

// 列を占有するゲート(CCNOT: 制御2+対象1、G: 全行に作用)
export const SPAN_GATES = new Set(['CCNOT', 'G', 'CMOD']);

function spanGateInColumn(circuit, col) {
  for (let r = 0; r < circuit.length; r++) {
    const cell = circuit[r][col];
    if (cell && SPAN_GATES.has(cell.gateId)) return r;
  }
  return -1;
}

export function cellOccupied(circuit, row, col) {
  return circuit[row][col] !== null
    || cnotControlAt(circuit, row, col) >= 0
    || spanGateInColumn(circuit, col) >= 0;
}

// 空セルに描くマーカー(C = 制御、span = 列全体ゲートの一部)。gateRow はトークンの行。
export function markerAt(circuit, row, col) {
  if (circuit[row][col]) return null;
  for (let r = 0; r < circuit.length; r++) {
    const cell = circuit[r][col];
    if (!cell || r === row) continue;
    if (['CNOT', 'CP'].includes(cell.gateId) && cell.control === row) return { kind: 'control', gateRow: r };
    if (cell.gateId === 'CCNOT' && cell.controls.includes(row)) return { kind: 'control', gateRow: r };
    if (cell.gateId === 'G') return { kind: 'span', gateRow: r, label: 'G' };
    if (cell.gateId === 'CMOD') {
      if (cell.control === row) return { kind: 'control', gateRow: r };
      if (row >= circuit.length - cell.workBits) return { kind: 'span', gateRow: r, label: 'CMOD' };
    }
  }
  return null;
}

export function placeGate(circuit, row, col, gateId, options = {}) {
  if (row < 0 || row >= circuit.length || col < 0 || col >= numCols(circuit)) return false;
  if (cellOccupied(circuit, row, col)) return false;
  if (gateId === 'CMOD') {
    if (row !== circuit.length - options.workBits || !Number.isInteger(options.control)
      || options.control < 0 || options.control >= row || !Number.isInteger(options.modulus)
      || !Number.isInteger(options.multiplier)) return false;
    if (circuit.some((_, r) => cellOccupied(circuit, r, col))) return false;
    circuit[row][col] = { gateId, control: options.control, multiplier: options.multiplier, modulus: options.modulus, workBits: options.workBits };
  } else if (gateId === 'CNOT' || gateId === 'CP') {
    // 置いた行が X(反転される側)、control の行が C
    const control = pickFreeRow(circuit, row, col);
    if (control < 0) return false;
    circuit[row][col] = { gateId, control, ...(gateId === 'CP' ? { theta: Math.PI / 2 } : {}) };
  } else if (gateId === 'CCNOT' || gateId === 'G') {
    // CCXは他の行から制御を2つ選ぶ。Cマーカーのタップで変更できる。
    for (let r = 0; r < circuit.length; r++) {
      if (r !== row && cellOccupied(circuit, r, col)) return false;
    }
    circuit[row][col] = { gateId, ...(gateId === 'CCNOT' ? { controls: Array.from({ length: circuit.length }, (_, r) => r).filter((r) => r !== row).slice(0, 2) } : {}) };
  } else if (gateId === 'R' || gateId === 'RY') {
    // 初期値は0以外のランダムな角度 — 「なんで斜めなの?」と興味を引く仕掛け
    const theta = THETAS[1 + Math.floor(Math.random() * (THETAS.length - 1))];
    circuit[row][col] = { gateId, theta };
  } else {
    circuit[row][col] = { gateId };
  }
  if (options.role === 'problem') circuit[row][col].role = 'problem';
  if (Number.isInteger(options.classicalControl)) circuit[row][col].classicalControl = options.classicalControl;
  return true;
}

function pickFreeRow(circuit, row, col, after = -1) {
  // row 以外の空き行を after より後から巡回で探す
  for (let k = 1; k <= circuit.length; k++) {
    const r = (((after < 0 ? row : after) + k) % circuit.length);
    if (r === row) continue;
    if (!cellOccupied(circuit, r, col)) return r;
  }
  return -1;
}

export function removeGate(circuit, row, col) {
  circuit[row][col] = null;
}

export function cycleTheta(circuit, row, col) {
  const cell = circuit[row][col];
  if (!cell || !['R', 'RY', 'CP'].includes(cell.gateId)) return;
  const values = cell.gateId === 'CP' ? CP_THETAS : THETAS;
  const angle = ((cell.theta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const idx = values.findIndex((t) => Math.abs(t - angle) < 1e-9);
  cell.theta = values[(idx + 1) % values.length];
}

// CNOT の制御(C)の行を切り替える(CCNOT は残り2行が常に制御なので対象外)
export function cycleCnotControl(circuit, row, col) {
  const cell = circuit[row][col];
  if (!cell || !['CNOT', 'CP', 'CCNOT'].includes(cell.gateId)) return;
  if (cell.gateId === 'CCNOT') {
    const options = [];
    for (let a = 0; a < circuit.length; a++) for (let b = a + 1; b < circuit.length; b++) {
      if (a !== row && b !== row) options.push([a, b]);
    }
    const index = options.findIndex((pair) => pair.every((control) => cell.controls.includes(control)));
    cell.controls = options[(index + 1) % options.length];
    return;
  }
  const next = pickFreeRow(circuit, row, col, cell.control);
  if (next >= 0) cell.control = next;
}

// |000⟩ から列順に逐次適用して状態ベクトルを返す。
export function evaluate(circuit, upToCol = Infinity) {
  const state = createState(circuit.length);
  const cols = Math.min(numCols(circuit), upToCol);
  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < circuit.length; row++) {
      const cell = circuit[row][col];
      if (!cell) continue;
      if (cell.gateId === 'CNOT') {
        applyCNOT(state, cell.control, row);
      } else if (cell.gateId === 'CCNOT') {
        applyCCNOT(state, row, cell.controls);
      } else if (cell.gateId === 'CP') {
        applyControlledPhase(state, cell.control, row, cell.theta);
      } else if (cell.gateId === 'CMOD') {
        applyControlledModularMultiply(state, cell.control, cell.multiplier, cell.modulus, cell.workBits);
      } else if (cell.gateId === 'G') {
        applyDiffusion(state);
      } else if (cell.gateId === 'R') {
        applySingle(state, row, rMatrix(cell.theta));
      } else if (cell.gateId === 'RY') {
        applySingle(state, row, ryMatrix(cell.theta));
      } else {
        applySingle(state, row, GATES[cell.gateId].matrix);
      }
    }
  }
  return state;
}

// 課題の制約判定用(「X禁止」など)
export function usedGateCounts(circuit) {
  const counts = { X: 0, Y: 0, Z: 0, H: 0, R: 0, RY: 0, CNOT: 0, CCNOT: 0, CP: 0, CMOD: 0, G: 0 };
  for (const rowCells of circuit) {
    for (const cell of rowCells) {
      if (cell) counts[cell.gateId]++;
    }
  }
  return counts;
}

export function clearCircuit(circuit) {
  for (let r = 0; r < circuit.length; r++) circuit[r].fill(null);
}

// 途中のレッスンを選んだときに、前の課題で作る回路を準備する。
export function loadCircuitRecipe(circuit, recipe) {
  clearCircuit(circuit);
  for (const { row, col, gateId, theta, control, controls, ...options } of recipe) {
    if (!placeGate(circuit, row, col, gateId, { control, ...options })) throw new Error(`Cannot place ${gateId} at ${row}, ${col}`);
    if (theta !== undefined) circuit[row][col].theta = theta;
    if (control !== undefined) circuit[row][col].control = control;
    if (controls !== undefined) circuit[row][col].controls = [...controls];
  }
}
