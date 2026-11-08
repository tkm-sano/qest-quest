// ゲート定義。展示と同じ記号(X / H / R)+ フリー・上級課題用の CNOT。

const S = Math.SQRT1_2;

// Rゲートのθ巡回値(クリックで順に切替)
export const THETAS = [
  0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI,
  (5 * Math.PI) / 4, (3 * Math.PI) / 2, (7 * Math.PI) / 4,
];
export const CP_THETAS = Array.from({ length: 32 }, (_, index) => index * Math.PI / 16);

export function thetaLabel(theta) {
  const numerator = Math.round(theta / Math.PI * 16);
  if (Math.abs(theta - numerator * Math.PI / 16) > 1e-8) return `${(theta / Math.PI).toFixed(3)}π`;
  if (numerator === 0) return '0';
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const divisor = gcd(Math.abs(numerator), 16);
  const n = numerator / divisor, d = 16 / divisor;
  const head = (Math.abs(n) === 1 ? (n < 0 ? '-' : '') : n) + 'π';
  return d === 1 ? head : head + '/' + d;
}

// 位相ゲート R(θ) = diag(1, e^{iθ})
export function rMatrix(theta) {
  return [
    [[1, 0], [0, 0]],
    [[0, 0], [Math.cos(theta), Math.sin(theta)]],
  ];
}

export function ryMatrix(theta) {
  const c = Math.cos(theta / 2), s = Math.sin(theta / 2);
  return [[[c, 0], [-s, 0]], [[s, 0], [c, 0]]];
}

export const GATES = {
  X: {
    id: 'X', label: 'X', caption: 'ビット反転', name: 'Xゲート(ビット反転)', color: '#ff4d9d',
    matrix: [
      [[0, 0], [1, 0]],
      [[1, 0], [0, 0]],
    ],
  },
  Y: {
    id: 'Y', label: 'Y', caption: '反転+位相', name: 'Yゲート(ビット反転+位相反転)', color: '#ff9d38',
    matrix: [
      [[0, 0], [0, -1]],
      [[0, 1], [0, 0]],
    ],
  },
  Z: {
    id: 'Z', label: 'Z', caption: '位相反転', name: 'Zゲート(位相反転 = R(π))', color: '#b06aff',
    matrix: [
      [[1, 0], [0, 0]],
      [[0, 0], [-1, 0]],
    ],
  },
  H: {
    id: 'H', label: 'H', caption: '重ね合わせ', name: 'Hゲート(重ね合わせ)', color: '#38c6ff',
    matrix: [
      [[S, 0], [S, 0]],
      [[S, 0], [-S, 0]],
    ],
  },
  R: {
    id: 'R', label: 'R', caption: '位相回転', name: 'Rゲート(位相回転)', color: '#ffc53d',
    isPhase: true,
  },
  RY: {
    id: 'RY', label: 'RY', caption: '0/1の混合', name: 'RYゲート（Y軸回転。0と1の振幅を変える）', color: '#ffb76b', isPhase: true,
  },
  CNOT: {
    id: 'CNOT', label: 'CX', caption: '条件反転', name: 'CXゲート(CNOT: C の行が1のとき X の行を反転。入力状態によってはもつれを作れる)', color: '#7dff6a',
    isCnot: true,
  },
  CCNOT: {
    id: 'CCNOT', label: 'CCX', caption: '2条件反転', name: 'CCXゲート(トフォリ/CCNOT: 2つの C が両方1のとき X の行を反転)', color: '#7dff6a',
    isCcnot: true,
  },
  CP: {
    id: 'CP', label: 'CP', caption: '制御位相', name: 'CPゲート(両方1の成分だけ位相回転。ゲートをタップで角度、Cをタップで制御の行を変更)', color: '#75c8eb',
    isCphase: true,
  },
  CMOD: {
    id: 'CMOD', label: '×a', color: '#a6b7ff',
    caption: '剰余乗算', name: '制御付き剰余乗算ブロック（剰余レジスター全体に作用）',
  },
  G: {
    id: 'G', label: 'G', caption: '振幅増幅', name: 'Gゲート(グローバーの拡散: 位相で印をつけた結果の振幅を増幅。全行に作用)', color: '#ff6af0',
    isDiffusion: true,
  },
};

const GATE_EN = {
  X: ['Bit flip', 'X gate (bit flip)'],
  Y: ['Flip + phase', 'Y gate (bit and phase flip)'],
  Z: ['Phase flip', 'Z gate (phase flip = R(π))'],
  H: ['Superposition', 'H gate (superposition)'],
  R: ['Phase rotation', 'R gate (phase rotation)'],
  RY: ['Mix 0 and 1', 'RY gate (Y-axis rotation; changes the amplitudes of 0 and 1)'],
  CNOT: ['Controlled flip', 'CX gate (flip X when the C row is 1; can create entanglement depending on the input state)'],
  CCNOT: ['Two controls', 'CCX gate (flip X when both C rows are 1)'],
  CP: ['Controlled phase', 'CP gate (phase rotation on the 11 component; tap gate to change angle, C to change control)'],
  CMOD: ['Modular multiply', 'Controlled modular multiplication block (acts on the whole work register)'],
  G: ['Amplify', 'G gate (Grover diffusion: acts across all qubits)'],
};
for (const [id, [captionEn, nameEn]] of Object.entries(GATE_EN)) {
  GATES[id].captionEn = captionEn;
  GATES[id].nameEn = nameEn;
}
