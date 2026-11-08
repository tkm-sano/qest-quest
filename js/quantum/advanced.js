// 5ビットの例。画像の番号との対応は使わない。
const gate = (row, col, gateId, extra = {}) => ({ row, col, gateId, ...extra });
export const ADVANCED_COLS = 16;
export const PREPARATION_COLS = 1;
export const preparationColumns = (example) => ['teleport', 'chsh'].includes(example?.kind) ? 2 : PREPARATION_COLS;

// Uの実装部分と、X・H・逆QFTを含む共通手順の表示区分。
export function advancedCircuitSections(example) {
  if (example.kind === 'chsh') return [
    { part: 'common', start: 0, end: 2, label: 'chshPreparation' },
    { part: 'problem', start: 2, end: 3, label: 'chshAxes' },
    { part: 'common', start: 3, end: ADVANCED_COLS, label: 'stageMeasurement' },
  ];
  if (example.kind === 'vqe') return [{ part: 'common', start: 0, end: ADVANCED_COLS, label: 'vqeAnsatz' }];
  if (example.kind === 'teleport') return [
    { part: 'problem', start: 0, end: 2, label: 'teleportInput' },
    { part: 'common', start: 2, end: 4, label: 'teleportPair' },
    { part: 'common', start: 4, end: 6, label: 'teleportBell' },
    { part: 'common', start: 6, end: ADVANCED_COLS, label: 'teleportCorrection' },
  ];
  if (example.kind === 'qaoa') return [
    { part: 'common', start: 0, end: 1, label: 'qaoaPreparation' },
    { part: 'problem', start: 1, end: example.graph.edges.length + 2, label: 'qaoaCost' },
    { part: 'common', start: example.graph.edges.length + 2, end: ADVANCED_COLS, label: 'qaoaMixer' },
  ];
  const end = example.kind === 'phase' ? 6
    : example.modulus === 15 && example.base === 4 ? 8 : 2 + example.readoutBits;
  return [
    { part: 'common', start: 0, end: 2 },
    { part: 'problem', start: 2, end },
    { part: 'common', start: end, end: ADVANCED_COLS },
  ];
}

export const PERIOD_EXAMPLES = [
  { modulus: 15, base: 4 },
  { modulus: 15, base: 11 },
  { modulus: 3, base: 2 },
  { modulus: 5, base: 2 },
  { modulus: 6, base: 5 },
].map((example) => {
  const workBits = Math.ceil(Math.log2(example.modulus));
  return { ...example, workBits, readoutBits: 5 - workBits };
});

export function modPow(base, power, modulus) {
  let value = 1;
  for (let i = 0; i < power; i++) value = value * base % modulus;
  return value;
}

function inverseQft(recipe, width, col) {
  for (let target = width - 1; target >= 0; target--) {
    for (let control = width - 1; control > target; control--) {
      recipe.push(gate(target, col++, 'CP', { control, theta: -Math.PI / 2 ** (control - target) }));
    }
    recipe.push(gate(target, col++, 'H'));
  }
}

// 低いUのべきを上の行に置き、出力ビットは上からMSBになるよう逆QFTを組む。
export function phaseEstimationRecipe(turns) {
  const recipe = [0, 1, 2, 3].map((row) => gate(row, 1, 'H'));
  recipe.push(gate(4, 0, 'X')); // R(2πφ) の固有状態 |1⟩
  for (let row = 0; row < 4; row++) {
    recipe.push(gate(4, row + 2, 'CP', { role: 'problem', control: row, theta: (2 * Math.PI * turns * 2 ** row) % (2 * Math.PI) }));
  }
  inverseQft(recipe, 4, 6);
  return recipe;
}

// 剰余レジスターを省略せず使う周期例。15・底4だけは従来のCX/CCX分解を表示。
export function periodFindingRecipe(example = PERIOD_EXAMPLES[0]) {
  const { modulus, base, workBits, readoutBits } = example;
  if (modulus !== 15 || base !== 4) {
    const recipe = Array.from({ length: readoutBits }, (_, row) => gate(row, 1, 'H'));
    recipe.push(gate(4, 0, 'X')); // 剰余レジスターを |1⟩ に準備する。
    for (let row = 0; row < readoutBits; row++) {
      recipe.push(gate(readoutBits, row + 2, 'CMOD', {
        role: 'problem', control: row, multiplier: modPow(base, 2 ** row, modulus), modulus, workBits,
      }));
    }
    inverseQft(recipe, readoutBits, readoutBits + 2);
    return recipe;
  }
  // 4倍(mod 15)は4ビットの2桁循環移動。制御SWAPをCX/CCXに分解する。
  const recipe = [gate(0, 1, 'H'), gate(4, 0, 'X')];
  let col = 2;
  for (const [a, b] of [[1, 3], [2, 4]]) {
    recipe.push(gate(a, col++, 'CNOT', { role: 'problem', control: b }));
    recipe.push(gate(b, col++, 'CCNOT', { role: 'problem', controls: [0, a] }));
    recipe.push(gate(a, col++, 'CNOT', { role: 'problem', control: b }));
  }
  recipe.push(gate(0, col, 'H'));
  return recipe;
}

const gcd = (a, b) => b ? gcd(b, a % b) : a;

// この例は周期が読み取り格子に載る。測定した分数の分母だけを候補にし、
// 古典計算で検証する。0や約分で失われた情報から周期を補ってはいけない。
export function periodSample(value, { readoutBits, base, modulus }) {
  if (value === 0) return { status: 'zero' };
  const denominator = 2 ** readoutBits;
  const divisor = gcd(value, denominator);
  const numerator = value / divisor, order = denominator / divisor;
  if (modPow(base, order, modulus) !== 1) return { status: 'insufficient', numerator, order };
  const halfPower = order % 2 === 0 ? modPow(base, order / 2, modulus) : null;
  const divisors = halfPower === null ? [] : [gcd(halfPower - 1, modulus), gcd(halfPower + 1, modulus)];
  const factor = divisors.find((d) => d > 1 && d < modulus);
  return { status: 'verified', numerator, order, halfPower, divisors, factor, cofactor: factor ? modulus / factor : null };
}

export function registerProbabilities(probabilities, width) {
  const counts = new Float64Array(1 << width);
  const shift = Math.log2(probabilities.length) - width;
  probabilities.forEach((p, index) => { counts[index >> shift] += p; });
  return counts;
}

export function measuredRegister(results, width) {
  let value = 0;
  for (let row = 0; row < width; row++) {
    const measured = results.find((result) => result.row === row);
    if (!measured) return null;
    value = (value << 1) | measured.value;
  }
  return value;
}
