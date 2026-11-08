// レッスンコース: X → 観測 → H → R → 干渉 → CX → CCX → グローバー探索。
// check(ctx) の ctx = { probs, phases, counts, measured }
import { phaseComparisonRecipe } from './phase-comparison.js';

const near = (a, b, eps = 0.02) => Math.abs(a - b) < eps;
const CX_GATES = ['X', 'H', 'R', 'CNOT'];
const CCX_GATES = [...CX_GATES, 'CCNOT'];
const GROVER_GATES = [...CCX_GATES, 'G'];
const hasRelativePhase = (c) => {
  const visible = [...c.phases].filter((_, index) => c.probs[index] > 0.01);
  return visible.some(phase => Math.cos(phase - visible[0]) < 0.99);
};

const isBellExample = (c) => c.counts.CNOT === 1 && c.counts.H === 1
  && c.counts.X === 0 && c.counts.R === 0
  && near(c.probs[0], 0.5) && near(c.probs[5], 0.5)
  && c.probs.every((p, i) => i === 0 || i === 5 || p < 0.01);
const isProductExample = (c) => c.counts.CNOT === 1 && c.counts.X === 1
  && c.counts.H === 0 && c.counts.R === 0 && near(c.probs[5], 1);

export const LESSON_STEPS = [
  {
    text: '画面下は<strong>量子回路</strong>。横線1本が量子ビットで、上から <code>q2・q1・q0</code>。ゲートは量子ビットへの操作で、<strong>左の列から右の列へ</strong>順にかかる。<br>画像の3桁は測ったときの値を左から <code>q2 q1 q0</code> と並べたもの。<code>001</code> なら q0 だけが1。最初は全部0なので <code>000</code>「桜」が100%。',
    allowed: [],
    needNext: true,
  },
  {
    text: '<code>X</code> ゲートは0と1を反転する。いちばん下の行 <code>q0</code> の空きマスに X を置いてみよう。q0 は画像番号の<strong>右端の桁</strong>なので、<code>000 → 001</code> に変わる。<span class="goal">目標: 画像 001「海底」だけを表示する</span>',
    allowed: ['X'],
    check: (c) => near(c.probs[1], 1),
  },
  {
    text: 'X を組み合わせれば8枚から好きな画像を選べる。<span class="goal">目標: 画像 101「砂漠」だけを表示する</span>(ヒント: q2 と q0 を反転)',
    allowed: ['X'],
    check: (c) => near(c.probs[5], 1),
  },
  {
    text: 'そのまま金色の <code>M</code> ボタン(観測)を押してみよう。確定した状態なら、何度観測しても必ず「砂漠」が選ばれる。',
    allowed: ['X'],
    check: (c) => c.measured === 5,
  },
  {
    text: 'リセットして、こんどは <code>H</code> ゲートをどれか1行に置いてみよう。H は「重ね合わせ」を作る。画面には2枚の画像が半分ずつ重なって見える。<span class="goal">目標: 2枚が50%ずつの画像を作る</span>',
    allowed: ['X', 'H'],
    check: (c) => {
      const nz = [...c.probs].filter((p) => p > 0.01);
      return nz.length === 2 && nz.every((p) => near(p, 0.5));
    },
  },
  {
    text: '3行ぜんぶに H を置くと、8枚すべての重ね合わせになる。各画像が12.5%になったら <code>M</code> で観測! どの1枚が現れるかはランダムだ。',
    allowed: ['X', 'H'],
    check: (c) => [...c.probs].every((p) => near(p, 0.125, 0.01)) && c.measured !== null,
  },
  {
    text: '<code>R</code> は、置いた行の量子ビットが<strong>1の成分だけ</strong>位相（針の向き）を回す。0の成分はそのまま。<br>q0 の H の右に R を置こう。末尾が1の <code>001・011・101・111</code> の針だけが回り、画像の濃さと確率は変わらない。R はタップするたび45°ずつ変わる。干渉で効くのは針同士の角度差だ。',
    allowed: ['X', 'H', 'R'],
    check: (c) => c.counts.R >= 1 && c.counts.H >= 1 && hasRelativePhase(c),
  },
  {
    text: '位相は「干渉」で効いてくる。リセットして q2 の行に <code>H → R(π) → H</code> と並べてみよう(R はタップして π に合わせる)。2回目の H で波が打ち消し合い、X を使わずに画像が変わる!<span class="goal">目標: 画像 100「宇宙」を100%にする</span>',
    allowed: ['X', 'H', 'R'],
    check: (c) => near(c.probs[4], 1) && c.counts.X === 0,
  },
  {
    id: 'cx',
    text: '<code>CX</code>(CNOT)は「C が1のときだけ X を反転する」ゲート。リセットして q2 に X を1つ、その右の列の q0 に CX を1つ置こう。C は q2 に合わせる(タップで切替)。<span class="goal">目標: 101「砂漠」を100%に</span>q2 も q0 も必ず1。この X → CX には、もつれはない。CX を使うと必ずもつれるわけではない。',
    allowed: CX_GATES,
    check: isProductExample,
  },
  {
    id: 'cx-entanglement',
    text: 'CX はそのまま残し、q2 の X をタップして外して、同じマスに <code>H</code> を置こう。観測中なら先に「重ね合わせに戻る」。<span class="goal">目標: 000「桜」と101「砂漠」を50%ずつに。まだ観測しない</span>この H → CX が作る観測前の状態では、q2 と q0 はそれぞれ0か1に決まっていないのに、測ると必ず同じ値になる。この状態がもつれの例だ。',
    allowed: CX_GATES,
    check: (c) => isBellExample(c) && c.measured === null,
  },
  {
    id: 'cx-product',
    text: 'H を X に戻しても、もつれは残るだろうか? CX は動かさず、q2 の H を外し、同じマスに <code>X</code> を置いて確かめよう。観測中なら先に「重ね合わせに戻る」。<span class="goal">目標: 101「砂漠」だけに戻す</span>両方とも必ず1になる X → CX の状態には、もつれはない。「2つが同時に変わる」ことともつれは別だ。',
    allowed: CX_GATES,
    check: (c) => isProductExample(c) && c.measured === null,
  },
  {
    id: 'cx-measure',
    text: '観測中なら「重ね合わせに戻る」。q2 の X だけを <code>H</code> に交換し、000と101を50%ずつにしよう。<span class="goal">目標: q2 と q0 の横の小さい M で、1つずつ観測</span>どちらから測ってもよい。1つ目を測ったら、まだ測っていない相手の確率に注目しよう。q1 は常に0で、測定は任意。結果の一致だけが、もつれの証明になるわけではない。',
    allowed: CX_GATES,
    measurement: { rows: [0, 2], ready: isBellExample },
    check: (c) => {
      const q2 = c.partialResults?.find((result) => result.row === 0);
      const q0 = c.partialResults?.find((result) => result.row === 2);
      return isBellExample(c) && (c.measured === 0 || c.measured === 5)
        && q2 !== undefined && q0 !== undefined && q2.value === q0.value
        && q2.value === (c.measured >> 2);
    },
  },
  {
    id: 'ccx',
    text: '<code>CCX</code>(トフォリ)は「2つの C が両方1のときだけ X を反転する」。リセットして q2 と q1 に X、その右の列の q0 に CCX を置こう。C は残りの2行に付く。<span class="goal">目標: CCX を使って 111「雪」を100%に</span>どちらかの X を外すと条件がそろわず、q0 は反転しない。',
    allowed: CCX_GATES,
    check: (c) => c.counts.CCNOT >= 1 && near(c.probs[7], 1),
  },
  {
    id: 'grover-mark',
    text: 'グローバー探索で「雪」を出やすくしよう。まずリセットして、同じ列の全行に H。次に q0 の行で、その右に <code>H → CCX → H</code> を並べる。これが「111 だけに位相の印を付ける」回路だ。<span class="goal">目標: 各12.5%のまま、雪の位相ダイヤルだけ半回転</span>画像の濃さはまだ変わらない。',
    allowed: CCX_GATES,
    check: (c) => c.counts.CCNOT >= 1
      && c.probs.every((p) => near(p, 0.125, 0.01))
      && [...c.phases].slice(0, 7).every((phase) => Math.cos(c.phases[7] - phase) < -0.99),
  },
  {
    id: 'grover-amplify',
    text: 'いまの回路の右に <code>G</code> を1つ置こう(どの行でもよい)。G は3行全体に作用し、干渉によって、位相で印を付けた「雪」の確率を高める。<span class="goal">目標: 雪を約78%に</span>先ほどまで同じ濃さだった8つの世界から、雪がはっきり見えてくる!',
    allowed: GROVER_GATES,
    check: (c) => c.counts.CCNOT >= 1 && c.counts.G === 1 && near(c.probs[7], 0.78125, 0.015),
  },
  {
    id: 'grover-measure',
    text: '続けて、右の空き列に q0 の <code>H → CCX → H</code> と、もう1つの <code>G</code> を足そう。位相の印と増幅を繰り返すと、雪の確率はさらに上がる。<span class="goal">目標: 雪を約94.5%にして M で観測</span>まれに別の画像が出ても、回路ができていれば達成だ。確率を高めてから結果を取り出すのがグローバー探索。',
    allowed: GROVER_GATES,
    check: (c) => c.counts.CCNOT >= 2 && c.counts.G >= 2
      && near(c.probs[7], 0.9453125, 0.015) && c.measured !== null,
  },
  {
    id: 'phase-comparison',
    experiment: 'phase-comparison',
    text: '3種類の回路で針の向きを比べ、Hで干渉させる前後の確率も見比べよう。全体に共通の回転と、針同士の角度差の違いを確かめる。',
    allowed: GROVER_GATES,
  },
];

export const LESSON_DONE_TEXT =
  '🎓 レッスン完了! X → CX の条件反転と H → CX が作るもつれを比べ、1つずつ観測できた。位相と干渉、CCX、グローバー探索で目的の画像も出やすくできた。全体に共通の位相と相対位相の違いも確かめた。次は「トライ」コースで腕試ししよう!';

const LESSON_TEXT_EN = [
  'The diagram below is a <strong>quantum circuit</strong>. Each line is a qubit: <code>q2, q1, q0</code> from top to bottom. Gates are operations on qubits, applied <strong>column by column, from left to right</strong>.<br>Image labels list measurement outcomes in <code>q2 q1 q0</code> order: <code>001</code> means only q0 is 1. Initially all three are 0, so <code>000</code>, “Cherry Blossoms”, has 100% probability.',
  'An <code>X</code> gate flips 0 and 1. Place X in an empty cell on the bottom row, <code>q0</code>. q0 corresponds to the <strong>rightmost digit</strong> of the image label, changing <code>000 → 001</code>.<span class="goal">Goal: show only image 001, “Underwater”</span>',
  'Combine X gates to choose any of the eight images.<span class="goal">Goal: show only image 101, “Desert”</span>(Hint: flip q2 and q0.)',
  'Now press the gold <code>M</code> button to measure. With a certain outcome, every measurement selects “Desert”.',
  'Reset, then place an <code>H</code> gate on any row. H creates a superposition. Two images appear blended in equal parts.<span class="goal">Goal: blend two images at 50% each</span>',
  'Put H on all three rows to give all eight images equal probability (12.5% each). Then press <code>M</code>. Which image appears is random.',
  '<code>R</code> rotates the phase (needle direction) <strong>only for components where its qubit is 1</strong>. Components where it is 0 stay unchanged.<br>Place R to the right of H on q0. Only the needles for labels ending in 1, <code>001, 011, 101, 111</code>, turn; the image blend and probabilities stay the same. Tap R to change its angle by 45°. Interference depends on the angles between the needles.',
  'Phase matters when states interfere. Reset and put <code>H → R(π) → H</code> on q2 (tap R until it shows π). The second H makes waves cancel, changing the image without X.<span class="goal">Goal: make image 100, “Space”, reach 100% without X</span>',
  '<code>CX</code> (CNOT) flips X only when C is 1. Reset, put one X on q2, then one CX on q0 in the next column. Set C to q2 (tap to change it).<span class="goal">Goal: make 101, “Desert”, reach 100%</span>Both q2 and q0 are certainly 1. This X → CX state has no entanglement. Using CX does not always create entanglement.',
  'Keep CX in place. Tap the X on q2 to remove it, then put <code>H</code> in the same cell. If measured, first press “Return to blend”.<span class="goal">Goal: give 000, “Cherry Blossoms”, and 101, “Desert”, 50% each. Do not measure yet</span>Before measurement, this H → CX state has entanglement: neither q2 nor q0 has a definite 0 or 1 value, yet measuring them always gives matching values.',
  'If you change H back to X, will entanglement remain? Keep CX in place, remove H on q2 and put <code>X</code> in the same cell. If measured, first press “Return to blend”.<span class="goal">Goal: return to only 101, “Desert”</span>Both bits are certainly 1 in this X → CX state, with no entanglement. Two bits changing together does not by itself mean entanglement.',
  'If measured, first press “Return to blend”. Replace only X on q2 with <code>H</code> to give 000 and 101 50% each.<span class="goal">Goal: use the small M beside q2 and q0 to measure one at a time</span>Either order is fine. After the first, look at the probabilities for the unmeasured partner. q1 is always 0; measuring it is optional. Matching outcomes alone do not prove entanglement.',
  '<code>CCX</code> (Toffoli) flips X only when both C rows are 1. Reset, put X on q2 and q1, then CCX on q0 in the next column. The other two rows get C markers.<span class="goal">Goal: use CCX to make 111, “Snow”, reach 100%</span>Remove either X and the condition is no longer met: q0 does not flip.',
  'Use Grover search to make “Snow” more likely. First reset and put H on every row in the same column. Then place <code>H → CCX → H</code> on q0 to their right. This marks only 111 with phase.<span class="goal">Goal: keep every probability at 12.5%, with only Snow’s phase dial turned halfway around</span>The visible blend stays the same for now.',
  'Add one <code>G</code> to the right of the circuit (on any row). G acts on all three rows. Interference raises the probability of “Snow”, the image marked with phase.<span class="goal">Goal: make Snow reach about 78%</span>Snow now stands out from the eight equally blended worlds!',
  'Keep building to the right: add <code>H → CCX → H</code> on q0, then another <code>G</code>. Repeating the phase mark and amplification raises Snow’s probability further.<span class="goal">Goal: make Snow reach about 94.5%, then press M</span>A rare different image still completes the lesson if the circuit is correct. Grover search raises the desired outcome’s probability before measurement.',
  'Compare the needles in three circuits, then compare their probabilities before and after interference with H. Discover the difference between a common rotation and the angles between the needles.',
];
const LESSON_TITLES = [
  ['回路の読み方', 'Read the circuit'], ['Xで反転', 'Flip with X'], ['画像を選ぶ', 'Choose an image'],
  ['観測する', 'Measurement'], ['Hで重ね合わせ', 'Superposition'], ['8枚を重ねる', 'Eight worlds'],
  ['位相を回す', 'Rotate phase'], ['干渉', 'Interference'], ['CXの条件反転', 'Controlled flip'],
  ['XをHに交換', 'Replace X with H'], ['HをXに戻す', 'Replace H with X'], ['1つずつ観測', 'Measure one at a time'],
  ['CCXの条件反転', 'Two controls'], ['位相に印を付ける', 'Mark with phase'],
  ['グローバー増幅', 'Grover amplification'], ['増幅して観測', 'Amplify and measure'],
  ['位相を比べる', 'Compare phases'],
];
const gate = (row, col, gateId) => ({ row, col, gateId });
const uniform = () => [0, 1, 2].map((row) => gate(row, 0, 'H'));
const pair = (firstGate) => [gate(0, 0, firstGate), { ...gate(2, 1, 'CNOT'), control: 0 }];
const marked = () => [...uniform(), gate(2, 1, 'H'), gate(2, 2, 'CCNOT'), gate(2, 3, 'H')];
const LESSON_STARTS = {
  2: [gate(2, 0, 'X')],
  3: [gate(0, 0, 'X'), gate(2, 0, 'X')],
  5: [gate(0, 0, 'H')],
  6: uniform(),
  9: pair('X'),
  10: pair('H'),
  11: pair('X'),
  14: marked(),
  15: [...marked(), gate(0, 4, 'G')],
  16: phaseComparisonRecipe(),
};
LESSON_STEPS.forEach((step, index) => {
  step.textEn = LESSON_TEXT_EN[index];
  [step.title, step.titleEn] = LESSON_TITLES[index];
  step.initialGates = LESSON_STARTS[index] ?? [];
});

export const LESSON_DONE_TEXT_EN =
  '🎓 Lessons complete! You compared the controlled flip of X → CX with entanglement from H → CX, then measured the qubits one at a time. You also used phase, interference, CCX and Grover search to make the desired image more likely, and compared global and relative phase. Try the challenges next!';
