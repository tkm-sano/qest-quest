// 照明・ストロボなどの演出制御(CSSクラス・CSS変数の着脱)。
import { IMAGE_META } from './image-scenes.js';
import { imageName } from './image-scenes.js';

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 重ね合わせの「にぎやかさ」(エントロピー)を照明の強さに反映する
export function setPartyFromProbs(probs) {
  let entropy = 0;
  for (const p of probs) if (p > 1e-9) entropy -= p * Math.log2(p);
  setParty(entropy / 3); // 3ビットの最大エントロピーで正規化
}

export function setParty(level) {
  document.documentElement.style.setProperty('--party', String(Math.max(0, Math.min(1, level))));
}

export function strobe(floorAreaEl) {
  if (REDUCED_MOTION) return;
  floorAreaEl.classList.remove('strobe');
  void floorAreaEl.offsetWidth; // アニメーション再トリガ
  floorAreaEl.classList.add('strobe');
  setTimeout(() => floorAreaEl.classList.remove('strobe'), 700);
}

export function showAnnounce(announceEl, imageIndex) {
  const meta = IMAGE_META[imageIndex];
  announceEl.querySelector('.announce-image').textContent = imageName(imageIndex);
  announceEl.querySelector('.announce-bits').textContent = `|${meta.bits}⟩`;
  announceEl.hidden = false;
}

export function hideAnnounce(announceEl) {
  announceEl.hidden = true;
}
