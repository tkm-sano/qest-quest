// 8種類の回路課題。全100問に15列以内の解答例を持たせる。
import { IMAGE_META } from '../ui/image-scenes.js';
import { thetaLabel } from '../quantum/gates.js';

const rows = [0, 1, 2];
const mask = (row) => 1 << (2 - row);
const gate = (row, col, gateId, extra = {}) => ({ row, col, gateId, ...extra });
const bits = (index) => index.toString(2).padStart(3, '0');
const image = (index, en = false) => '<code>' + bits(index) + '</code>「' + IMAGE_META[index][en ? 'nameEn' : 'name'] + '」';
const distribution = (targets, weights = targets.map(() => 1 / targets.length)) => (ctx) =>
  ctx.probs.every((p, index) => Math.abs(p - (weights[targets.indexOf(index)] ?? 0)) < 0.01);
const bitRows = (index) => rows.filter((row) => index & mask(row));
const flips = (index, col = 0) => bitRows(index).map((row) => gate(row, col, 'X'));
const uniform = () => rows.map((row) => gate(row, 0, 'H'));

function recipeHint(solution, en) {
  if (!solution.length) return en ? 'Leave the circuit empty.' : '回路には何も置かずに観測する。';
  const columns = [...new Set(solution.map((item) => item.col))].sort((a, b) => a - b);
  return columns.map((col) => {
    const entries = solution.filter((item) => item.col === col).map((item) => {
      let name = item.gateId === 'CNOT' ? 'CX' : item.gateId === 'CCNOT' ? 'CCX' : item.gateId;
      if (item.theta !== undefined) name += '(' + thetaLabel(item.theta) + ')';
      return 'q' + (2 - item.row) + ': ' + name + (item.control === undefined ? '' : ' (C=q' + (2 - item.control) + ')');
    });
    return (en ? 'Column ' + (col + 1) + ': ' : (col + 1) + '列目: ') + entries.join(' / ');
  }).join('<br>');
}

const questions = [];
function add(kind, category, categoryEn, text, textEn, allowed, solution, judge, hint, hintEn) {
  questions.push({
    id: 'quiz-' + String(questions.length + 1).padStart(3, '0'),
    kind, category, categoryEn, text, textEn, allowed, solution,
    hint: hint + '<br>解き方の一例:<br>' + recipeHint(solution, false),
    hintEn: hintEn + '<br>One possible circuit:<br>' + recipeHint(solution, true),
    judge: (ctx) => Object.entries(ctx.counts).every(([id, count]) => !count || allowed.includes(id)) && judge(ctx),
  });
}

// 8問: 確定した画像を選ぶ。
for (let target = 0; target < 8; target++) {
  add('certain', '画像を選ぶ', 'Choose an image',
    image(target) + 'だけを100%で表示し、観測しよう。',
    'Make only ' + image(target, true) + ' appear with 100% probability, then measure.',
    ['X'], flips(target), distribution([target]),
    '1にしたいビットの行にX。000なら何も置かなくてよい。', 'Put X on each row that should be 1. For 000, leave the circuit empty.');
}

// 7問: Xを使わない干渉。
for (let target = 1; target < 8; target++) {
  const solution = bitRows(target).flatMap((row) => [
    gate(row, 0, 'H'), gate(row, 1, 'R', { theta: Math.PI }), gate(row, 2, 'H'),
  ]);
  add('interference', '干渉', 'Interference',
    'Xを使わず、' + image(target) + 'を100%にして観測しよう。',
    'Make ' + image(target, true) + ' reach 100% without X, then measure.',
    ['H', 'R'], solution, (ctx) => ctx.counts.R >= 1 && distribution([target])(ctx),
    'H → R(π) → H は、干渉によってビットを反転する。', 'H → R(π) → H flips a bit through interference.');
}

// 28問: 任意の2枚。異なるビットが複数ならCXで相関を作る。
for (let a = 0; a < 8; a++) for (let b = a + 1; b < 8; b++) {
  const changed = bitRows(a ^ b);
  const pivot = changed[0];
  const solution = [...flips(a), gate(pivot, 1, 'H'),
    ...changed.slice(1).map((row, index) => gate(row, index + 2, 'CNOT', { control: pivot }))];
  const allowed = changed.length === 1 ? ['X', 'H'] : ['X', 'H', 'CNOT'];
  add('pair', '2枚の重ね合わせ', 'Blend two images',
    image(a) + 'と' + image(b) + 'だけを50%ずつにして観測しよう。',
    'Give only ' + image(a, true) + ' and ' + image(b, true) + ' 50% each, then measure.',
    allowed, solution, distribution([a, b]),
    '2つのビット列の違いに注目。1行をHで分け、ほかにも違う行があればCXで結ぶ。',
    'Compare the bit strings. Split one differing row with H; connect any other differing rows with CX.');
}

// 14問: 3ビット上の各アフィン平面（独立な重ね合わせやパリティ）。
for (let normal = 1; normal < 8; normal++) for (let parity = 0; parity < 2; parity++) {
  const controls = bitRows(normal);
  const targetRow = controls[0];
  const targets = Array.from({ length: 8 }, (_, i) => i)
    .filter((index) => bitRows(index & normal).length % 2 === parity);
  const solution = [
    ...rows.filter((row) => row !== targetRow).map((row) => gate(row, 0, 'H')),
    ...(parity ? [gate(targetRow, 0, 'X')] : []),
    ...controls.slice(1).map((row, index) => gate(targetRow, index + 1, 'CNOT', { control: row })),
  ];
  add('quartet', '4枚の重ね合わせ', 'Blend four images',
    targets.map((i) => '<code>' + bits(i) + '</code>').join('・') + 'だけを25%ずつにして観測しよう。',
    'Give only ' + targets.map((i) => '<code>' + bits(i) + '</code>').join(', ') + ' 25% each, then measure.',
    controls.length === 1 ? ['X', 'H'] : ['X', 'H', 'CNOT'], solution, distribution(targets),
    '2行をHで重ね合わせ、残りの行を固定するか、CXで指定した偶奇になるようにする。',
    'Put H on two rows. Fix the remaining row, or use CX to set its parity.');
}

// 24問: 1行の干渉で85.4%対14.6%の偏りを作る。
for (const row of rows) for (let target = 0; target < 8; target++) {
  const other = target ^ mask(row);
  const theta = target & mask(row) ? 3 * Math.PI / 4 : Math.PI / 4;
  const solution = [...flips(target & ~mask(row)), gate(row, 1, 'H'),
    gate(row, 2, 'R', { theta }), gate(row, 3, 'H')];
  add('biased', '確率を傾ける', 'Bias the probabilities',
    image(target) + 'を約85.4%、' + image(other) + 'を約14.6%にし、他の画像を出さずに観測しよう。',
    'Give ' + image(target, true) + ' about 85.4% and ' + image(other, true) + ' about 14.6%, with no other outcomes, then measure.',
    ['X', 'H', 'R'], solution, distribution([target, other], [Math.cos(Math.PI / 8) ** 2, Math.sin(Math.PI / 8) ** 2]),
    '違いのある1行にH → R → H。Rをπ/4または3π/4にすると偏りができる。',
    'Use H → R → H on the differing row. R at π/4 or 3π/4 creates a bias.');
}

function oracle(target, col) {
  const inverted = rows.filter((row) => !(target & mask(row)));
  return [
    ...inverted.map((row) => gate(row, col, 'X')),
    gate(2, col + 1, 'H'), gate(2, col + 2, 'CCNOT'), gate(2, col + 3, 'H'),
    ...inverted.map((row) => gate(row, col + 4, 'X')),
  ];
}

// 8問: 他の位相との相対差を判定し、全体位相だけの回転は正解にしない。
for (let target = 0; target < 8; target++) {
  add('phase', '位相に印を付ける', 'Mark an image with phase',
    '8枚を12.5%ずつに保ち、' + image(target) + 'だけ、他の7枚に対して位相を半回転させて観測しよう。',
    'Keep all eight images at 12.5%, turn only ' + image(target, true) + ' half a phase turn relative to the other seven, then measure.',
    ['X', 'H', 'CCNOT'], [...uniform(), ...oracle(target, 1)],
    (ctx) => ctx.counts.CCNOT >= 1 && ctx.probs.every((p) => Math.abs(p - 0.125) < 0.005)
      && ctx.phases.every((phase, index) => index === target || Math.cos(ctx.phases[target] - phase) < -0.99),
    'q0 のH → CCX → Hは111に印を付ける。目標の0の行を前後のXで反転すれば、他の画像に印を移せる。',
    'H → CCX → H on q0 marks 111. Surround it with X on the zero bits of the target to mark another image.');
}

// 8問: 任意の画像を2回のグローバー増幅で約94.5%にする。
for (let target = 0; target < 8; target++) {
  add('grover', 'グローバー探索', 'Grover search',
    'グローバー探索で' + image(target) + 'を約94.5%にし、観測しよう。',
    'Use Grover search to make ' + image(target, true) + ' reach about 94.5%, then measure.',
    ['X', 'H', 'CCNOT', 'G'],
    [...uniform(), ...oracle(target, 1), gate(0, 6, 'G'), ...oracle(target, 7), gate(0, 12, 'G')],
    (ctx) => ctx.counts.G >= 2 && ctx.counts.CCNOT >= 2 && Math.abs(ctx.probs[target] - 0.9453125) < 0.005,
    '8枚を均等に重ね、「目標への位相の印 → G」を2回。目標の0の行はオラクルの前後でXを使う。',
    'Start with eight equal images. Repeat “mark the target with phase → G” twice. Surround each oracle with X on the zero bits of the target.');
}

// 3問: Xを3つ、CCXを1つ使った2条件反転。
for (const row of rows) {
  const target = 7 ^ mask(row);
  add('ccx', '2条件の反転', 'Two-control flip',
    'Xを3つ、CCXを1つだけ使い、' + image(target) + 'を100%にして観測しよう。',
    'Use exactly three X gates and one CCX to make ' + image(target, true) + ' reach 100%, then measure.',
    ['X', 'CCNOT'], [...rows.map((r) => gate(r, 0, 'X')), gate(row, 1, 'CCNOT')],
    (ctx) => ctx.counts.X === 3 && ctx.counts.CCNOT === 1 && distribution([target])(ctx),
    'まず111を作る。CCXは、残したい2つの1をCにして、0にしたい行に置く。',
    'Start with 111. Place CCX on the row you want to become 0; the two remaining 1 bits are the controls.');
}

export const QUIZ_QUESTIONS = questions;
