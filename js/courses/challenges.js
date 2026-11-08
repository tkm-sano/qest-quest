// トライコース: 課題クリア型。judge(ctx) の ctx = { probs, phases, counts, measured }

const inRange = (x, lo, hi) => x >= lo && x <= hi;
const isSmall = (x) => x < 0.01;

export const CHALLENGES = [
  {
    title: '課題1',
    text: '画像 <code>101</code>「砂漠」を100%で表示せよ。',
    allowed: ['X', 'H', 'R'],
    judge: (c) => c.probs[5] >= 0.99,
    hint: 'q2 と q0 に X を置く。',
  },
  {
    title: '課題2',
    text: '画像 <code>000</code>「桜」と <code>100</code>「宇宙」を50%ずつ重ねよ。',
    allowed: ['X', 'H', 'R'],
    judge: (c) =>
      inRange(c.probs[0], 0.45, 0.55) && inRange(c.probs[4], 0.45, 0.55) &&
      c.probs.every((p, i) => i === 0 || i === 4 || isSmall(p)),
    hint: '違いは q2 のビットだけ。q2 に H を1つ。',
  },
  {
    title: '課題3',
    text: '8枚すべてを均等(12.5%ずつ)に重ねよ。',
    allowed: ['X', 'H', 'R'],
    judge: (c) => c.probs.every((p) => inRange(p, 0.115, 0.135)),
    hint: '全部の行に H。',
  },
  {
    title: '課題4',
    text: '<strong>X を使わずに</strong>画像 <code>011</code>「未来都市」を100%にせよ。',
    allowed: ['X', 'H', 'R'],
    judge: (c) => c.probs[3] >= 0.99 && c.counts.X === 0,
    hint: 'H → R(π) → H は X と同じ働き(干渉)。q1 と q0 の両方に。',
  },
  {
    title: '課題5',
    text: '画像 <code>110</code>「森」の確率を80%以上にせよ(ただし100%未満)。',
    allowed: ['X', 'H', 'R'],
    judge: (c) => inRange(c.probs[6], 0.8, 0.99),
    hint: 'H → R(3π/4) → H で約85%の「傾いた」状態が作れる。もう1行は X で確実に反転。',
  },
  {
    title: '課題6',
    text: '画像 <code>010</code>「天空」と <code>111</code>「雪」<strong>だけ</strong>を50%ずつにせよ。',
    allowed: ['X', 'H', 'R', 'CNOT'],
    judge: (c) =>
      inRange(c.probs[2], 0.45, 0.55) && inRange(c.probs[7], 0.45, 0.55) &&
      c.probs.every((p, i) => i === 2 || i === 7 || isSmall(p)),
    hint: 'q2 と q0 が連動して変わる=「もつれ」が必要。q1 に X、q2 に H、そして CX を q0 に置き、C マーカーを q2 に。',
  },
  {
    title: '課題7',
    text: '画像 <code>000</code>・<code>011</code>・<code>101</code>・<code>110</code> を25%ずつにせよ。',
    allowed: ['X', 'H', 'R', 'CNOT'],
    judge: (c) => {
      const targets = [0, 3, 5, 6];
      return c.probs.every((p, i) => (targets.includes(i) ? inRange(p, 0.22, 0.28) : isSmall(p)));
    },
    hint: '4枚はどれも「1の数が偶数」。q2 と q1 に H、そして CX を q0 に2列分置き、C をそれぞれ q2 と q1 に(パリティの書き込み)。',
  },
  {
    title: '課題8',
    text: '<strong>グローバー探索</strong>: 位相で印をつけた画像を <code>G</code>(振幅増幅)で強め、画像 <code>111</code>「雪」の確率を90%以上にせよ(ただし100%未満)。',
    allowed: ['X', 'H', 'R', 'CNOT', 'CCNOT', 'G'],
    judge: (c) => inRange(c.probs[7], 0.9, 0.99) && c.counts.G >= 1,
    hint: '① 全行に H(8枚を均等に重ねる) ② オラクル: q0 を H → CCX → H で挟むと「111 だけ位相反転」(CCZ)。この時点では画像の濃さは変わらない ③ G で増幅 → 約78% ④ もう一度 ②③ を繰り返すと約94.5%!(全9列)。Gの中身は「全行H → 全行X → CCZ → 全行X → 全行H」と同じ働き。',
  },
];

export const TRY_DONE_TEXT =
  '🏆 全課題クリア!「フリー」コースで最大15ステップの回路を作り、画像の重なり方を探してみよう。ここで学んだ X・Y・Z・H・R・CX・CCX は、本物の量子コンピュータでも使われる記号だ。';

const CHALLENGE_TEXT_EN = [
  'Show image <code>101</code>, “Desert”, with 100% probability.',
  'Blend image <code>000</code>, “Cherry Blossoms”, and <code>100</code>, “Space”, at exactly 50% each.',
  'Give all eight images equal probability (12.5% each).',
  'Make image <code>011</code>, “Future City”, reach 100% <strong>without using X</strong>.',
  'Raise the probability of image <code>110</code>, “Forest”, to at least 80% but below 100%.',
  'Give <strong>only</strong> image <code>010</code>, “Sky Realm”, and <code>111</code>, “Snow”, 50% each.',
  'Give images <code>000</code>, <code>011</code>, <code>101</code>, and <code>110</code> 25% each.',
  '<strong>Grover search:</strong> Mark an image with phase, then use <code>G</code> (amplitude amplification) to raise image <code>111</code>, “Snow”, above 90% but below 100%.',
];
const CHALLENGE_HINT_EN = [
  'Put X on q2 and q0.',
  'Only q2 differs. Put one H on q2.',
  'Put H on every row.',
  'H → R(π) → H acts like X through interference. Use it on q1 and q0.',
  'H → R(3π/4) → H gives about 85% on one row. Use X to flip another row with certainty.',
  'q2 and q0 must change together: this needs entanglement. Put X on q1, H on q2, then CX on q0 with its C marker on q2.',
  'These four results have an even number of 1 bits. Put H on q2 and q1. Place CX on q0 in two columns, controlled by q2 and q1 respectively.',
  '① Put H on all rows for eight equal outcomes. ② Oracle: H → CCX → H on q0 flips the phase of 111 only (CCZ); the visible blend stays the same. ③ G amplifies it to about 78%. ④ Repeat steps ② and ③ to reach about 94.5% (nine columns total). G acts like H on all rows → X on all rows → CCZ → X on all rows → H on all rows.',
];
CHALLENGES.forEach((challenge, index) => {
  challenge.titleEn = `Challenge ${index + 1}`;
  challenge.textEn = CHALLENGE_TEXT_EN[index];
  challenge.hintEn = CHALLENGE_HINT_EN[index];
});

export const TRY_DONE_TEXT_EN =
  '🏆 All challenges cleared! Use Free mode to build a circuit with up to 15 columns and explore different image blends. X, Y, Z, H, R, CX, and CCX are also used in real quantum programming.';
