// 複素数ヘルパ。要素は [re, im] のペアで表す。
export const c = (re, im = 0) => [re, im];

export const cAdd = (a, b) => [a[0] + b[0], a[1] + b[1]];

export const cMul = (a, b) => [
  a[0] * b[0] - a[1] * b[1],
  a[0] * b[1] + a[1] * b[0],
];

export const cAbsSq = (a) => a[0] * a[0] + a[1] * a[1];

export const cPhase = (a) => Math.atan2(a[1], a[0]);

export const cExp = (theta) => [Math.cos(theta), Math.sin(theta)];
