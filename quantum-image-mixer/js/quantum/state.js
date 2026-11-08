// 標準は3量子ビット、発展は5量子ビットの状態ベクトル。
// 表示は上が最上位ビット。演算関数の qubit は上からの内部行インデックス。
// 3ビットの画像モードでは基底インデックスと画像番号が対応する。

export const NUM_QUBITS = 3;
export const DIM = 1 << NUM_QUBITS; // 8

export function createState(numQubits = NUM_QUBITS) {
  const s = { re: new Float64Array(1 << numQubits), im: new Float64Array(1 << numQubits) };
  s.re[0] = 1; // |000⟩
  return s;
}

export function clone(s) {
  return { re: Float64Array.from(s.re), im: Float64Array.from(s.im) };
}

export const qubitCount = (s) => Math.log2(s.re.length);
const maskForQubit = (s, qubit) => s.re.length >> (qubit + 1);

// 2x2ユニタリ行列 m = [[m00, m01], [m10, m11]](各要素は [re, im])を
// 指定量子ビットに作用させる(in-place)。
export function applySingle(s, qubit, m) {
  const mask = maskForQubit(s, qubit);
  const [[a, b], [c, d]] = m;
  for (let i = 0; i < s.re.length; i++) {
    if (i & mask) continue;
    const j = i | mask;
    const x0r = s.re[i], x0i = s.im[i];
    const x1r = s.re[j], x1i = s.im[j];
    s.re[i] = a[0] * x0r - a[1] * x0i + b[0] * x1r - b[1] * x1i;
    s.im[i] = a[0] * x0i + a[1] * x0r + b[0] * x1i + b[1] * x1r;
    s.re[j] = c[0] * x0r - c[1] * x0i + d[0] * x1r - d[1] * x1i;
    s.im[j] = c[0] * x0i + c[1] * x0r + d[0] * x1i + d[1] * x1r;
  }
}

// CNOT: control が |1⟩ のとき target を反転(in-place)。
export function applyCNOT(s, control, target) {
  const cMask = maskForQubit(s, control);
  const tMask = maskForQubit(s, target);
  for (let i = 0; i < s.re.length; i++) {
    if ((i & cMask) && !(i & tMask)) {
      const j = i | tMask;
      let tmp = s.re[i]; s.re[i] = s.re[j]; s.re[j] = tmp;
      tmp = s.im[i]; s.im[i] = s.im[j]; s.im[j] = tmp;
    }
  }
}

// CCNOT(トフォリ): target 以外の2ビットが両方 |1⟩ のとき target を反転(in-place)。
export function applyCCNOT(s, target, controls = Array.from({ length: qubitCount(s) }, (_, row) => row).filter((row) => row !== target).slice(0, 2)) {
  const tMask = maskForQubit(s, target);
  const cMask = controls.reduce((value, row) => value | maskForQubit(s, row), 0);
  for (let i = 0; i < s.re.length; i++) {
    if ((i & cMask) === cMask && !(i & tMask)) {
      const j = i | tMask;
      let tmp = s.re[i]; s.re[i] = s.re[j]; s.re[j] = tmp;
      tmp = s.im[i]; s.im[i] = s.im[j]; s.im[j] = tmp;
    }
  }
}

// グローバーの拡散演算子 D = 2|s⟩⟨s| − I(平均まわりの反転)。
// 位相反転で印をつけた基底の振幅が増幅される。全量子ビットに作用。
export function applyDiffusion(s) {
  let mr = 0;
  let mi = 0;
  for (let i = 0; i < s.re.length; i++) { mr += s.re[i]; mi += s.im[i]; }
  mr /= s.re.length;
  mi /= s.re.length;
  for (let i = 0; i < s.re.length; i++) {
    s.re[i] = 2 * mr - s.re[i];
    s.im[i] = 2 * mi - s.im[i];
  }
}

// CP(θ): 制御と対象が両方1の成分だけに相対位相 e^(iθ) を付ける。
export function applyControlledPhase(s, control, target, theta) {
  const mask = maskForQubit(s, control) | maskForQubit(s, target);
  const c = Math.cos(theta), sn = Math.sin(theta);
  for (let i = 0; i < s.re.length; i++) {
    if ((i & mask) !== mask) continue;
    const re = s.re[i], im = s.im[i];
    s.re[i] = c * re - sn * im;
    s.im[i] = sn * re + c * im;
  }
}

export function probabilities(s) {
  const p = new Float64Array(s.re.length);
  for (let i = 0; i < s.re.length; i++) p[i] = s.re[i] * s.re[i] + s.im[i] * s.im[i];
  return p;
}

// 制御付き剰余乗算ブロック。下位workBitsを省略せず使い、N以上は固定。
// baseとNが互いに素なら基底の置換となり、複素振幅と干渉をそのまま保つ。
export function applyControlledModularMultiply(s, control, multiplier, modulus, workBits) {
  const workMask = (1 << workBits) - 1;
  const cMask = maskForQubit(s, control);
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  if (!Number.isInteger(workBits) || workBits < 1 || workBits >= qubitCount(s)
    || !Number.isInteger(control) || control < 0 || control >= qubitCount(s) - workBits
    || !Number.isInteger(modulus) || modulus < 2 || modulus > (1 << workBits)
    || !Number.isInteger(multiplier) || multiplier < 1 || multiplier >= modulus || gcd(multiplier, modulus) !== 1) {
    throw new RangeError('Invalid controlled modular multiplication');
  }
  const re = new Float64Array(s.re.length), im = new Float64Array(s.im.length);
  for (let input = 0; input < s.re.length; input++) {
    const work = input & workMask;
    const output = (input & cMask) && work < modulus ? (input & ~workMask) | (work * multiplier % modulus) : input;
    re[output] = s.re[input];
    im[output] = s.im[input];
  }
  s.re.set(re);s.im.set(im);
}

// 各基底の位相角(振幅がほぼ0なら0)。UIの色相表示用。
export function phases(s) {
  const ph = new Float64Array(s.re.length);
  for (let i = 0; i < s.re.length; i++) {
    const mag = s.re[i] * s.re[i] + s.im[i] * s.im[i];
    ph[i] = mag < 1e-12 ? 0 : Math.atan2(s.im[i], s.re[i]);
  }
  return ph;
}

// 指定した行だけを測るときの確率。他の行は測定しない。
export function qubitProbabilities(s, qubit) {
  if (!Number.isInteger(qubit) || qubit < 0 || qubit >= qubitCount(s)) throw new RangeError('Invalid qubit row');
  const mask = maskForQubit(s, qubit);
  const p = new Float64Array(2);
  for (let i = 0; i < s.re.length; i++) p[(i & mask) ? 1 : 0] += s.re[i] ** 2 + s.im[i] ** 2;
  const total = p[0] + p[1];
  if (!(total > 0)) throw new RangeError('Cannot measure a zero state');
  return p.map((value) => value / total);
}

// 1行だけを射影測定する。選ばれた部分空間の位相と重ね合わせは保つ。
// 入力状態は変更せず、条件付きの状態を返す。
export function measureQubit(s, qubit, rand = Math.random) {
  const p = qubitProbabilities(s, qubit);
  const outcome = rand() < p[0] ? 0 : 1;
  const mask = maskForQubit(s, qubit);
  const collapsed = { re: new Float64Array(s.re.length), im: new Float64Array(s.re.length) };
  let weight = 0;
  for (let i = 0; i < s.re.length; i++) {
    if (Number(Boolean(i & mask)) !== outcome) continue;
    collapsed.re[i] = s.re[i];
    collapsed.im[i] = s.im[i];
    weight += s.re[i] ** 2 + s.im[i] ** 2;
  }
  const norm = Math.sqrt(weight);
  for (let i = 0; i < s.re.length; i++) {
    collapsed.re[i] /= norm;
    collapsed.im[i] /= norm;
  }
  return { outcome, state: collapsed };
}

// 観測: 確率に基づき1つの基底をサンプリングし、収縮後の状態を返す。
export function measure(s, rand = Math.random) {
  const p = probabilities(s);
  const r = rand();
  let acc = 0;
  let outcome = s.re.length - 1;
  for (let i = 0; i < s.re.length; i++) {
    acc += p[i];
    if (r < acc) { outcome = i; break; }
  }
  const collapsed = { re: new Float64Array(s.re.length), im: new Float64Array(s.re.length) };
  collapsed.re[outcome] = 1;
  return { outcome, state: collapsed };
}
