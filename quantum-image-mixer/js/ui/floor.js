// 8枚の画像の確率を液面の高さ、位相を液面上の針で表示する。
import { IMAGE_META, imageName } from './image-scenes.js';
import { thetaLabel } from '../quantum/gates.js';
import { t } from '../i18n.js';

const NUM = IMAGE_META.length;
const TAU = 2 * Math.PI;

export function createMeter(el) {
  el.innerHTML = '';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = null;
  const cols = IMAGE_META.map((meta) => {
    const col = document.createElement('div');
    col.className = 'meter-col';
    col.tabIndex = 0;
    col.setAttribute('role', 'img');
    const key = 'meter-cylinder-' + meta.index;
    col.innerHTML = `
      <div class="meter-bar-wrap">
        <div class="meter-readings"><span class="meter-pct">0%</span></div>
        <svg class="meter-cylinder" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="${key}-glass" x1="0" x2="1"><stop stop-color="#d3e5ff" stop-opacity=".13"/><stop offset=".35" stop-color="#071021" stop-opacity=".12"/><stop offset="1" stop-color="#d3e5ff" stop-opacity=".19"/></linearGradient>
            <linearGradient id="${key}-liquid" x1="0" x2="1"><stop stop-color="${meta.color}" stop-opacity=".85"/><stop offset=".45" stop-color="${meta.color}" stop-opacity=".35"/><stop offset="1" stop-color="${meta.color}" stop-opacity=".72"/></linearGradient>
            <clipPath id="${key}-clip"><path d="M14 18 A36 16 0 0 1 86 18 V82 A36 16 0 0 1 14 82 Z"/></clipPath>
          </defs>
          <path class="cylinder-glass" d="M14 18 A36 16 0 0 1 86 18 V82 A36 16 0 0 1 14 82 Z" fill="url(#${key}-glass)"/>
          <g class="cylinder-liquid" clip-path="url(#${key}-clip)" opacity="0">
            <ellipse cx="50" cy="82" rx="36" ry="16" fill="${meta.color}" opacity=".55"/>
            <rect class="meter-bar" x="14" y="82" width="72" height="0" fill="url(#${key}-liquid)"/>
            <ellipse class="liquid-surface" cx="50" cy="82" rx="36" ry="16" fill="${meta.color}" fill-opacity=".5" stroke="${meta.color}" stroke-width="1"/>
          </g>
          <g class="phase-dial" hidden>
            <line class="phase-needle" x1="50" y1="48" x2="50" y2="35"/>
            <circle class="phase-center" cx="50" cy="48" r="1.8"/>
            <ellipse class="phase-glow" cx="50" cy="35" rx="6" ry="6"/>
            <ellipse class="phase-point" cx="50" cy="35" rx="2.6" ry="2.6"/>
            <text class="meter-phase-angle" x="0" y="0" text-anchor="middle" dominant-baseline="central"></text>
          </g>
          <ellipse class="cylinder-rim" cx="50" cy="18" rx="36" ry="16"/>
          <path class="cylinder-front" d="M14 18 V82 A36 16 0 0 0 86 82 V18"/>
        </svg>
      </div>
      <div class="meter-caption"><span class="meter-bits">${meta.bits}</span><span class="meter-name">${imageName(meta.index)}</span></div>`;
    el.appendChild(col);
    return {
      col, svg: col.querySelector('svg'), bar: col.querySelector('.meter-bar'), pct: col.querySelector('.meter-pct'),
      angle: col.querySelector('.meter-phase-angle'), dial: col.querySelector('.phase-dial'),
      liquid: col.querySelector('.cylinder-liquid'), surface: col.querySelector('.liquid-surface'),
      needle: col.querySelector('.phase-needle'), point: col.querySelector('.phase-point'), glow: col.querySelector('.phase-glow'),
      p: 0, radians: 0, displayed: 0, from: 0, target: 0, started: 0, moving: false, visible: false, scaleX: 1, scaleY: 1, labelSize: 10,
    };
  });

  function drawPhase(c, radians) {
    const x = 50 + 29 * Math.sin(radians), y = 48 - 13 * Math.cos(radians);
    const depth = (1 - Math.cos(radians)) / 2;
    c.needle.setAttribute('x2', x);c.needle.setAttribute('y2', y);
    for (const dot of [c.point, c.glow]) { dot.setAttribute('cx', x);dot.setAttribute('cy', y); }
    const radius = 2.2 + depth * .7;
    c.point.setAttribute('rx', radius * c.scaleX);c.point.setAttribute('ry', radius * c.scaleY);
    c.point.setAttribute('opacity', .65 + depth * .35);
    const halo = 4.5 + depth * 1.2;
    c.glow.setAttribute('rx', halo * c.scaleX);c.glow.setAttribute('ry', halo * c.scaleY);
    c.glow.setAttribute('opacity', .15 + depth * .15);
    // 針の中ほどの横に添える。画面上の文字幅を含めて、針から離す。
    const dx = (x - 50) / c.scaleX, dy = (y - 48) / c.scaleY;
    const length = Math.hypot(dx, dy), nx = -dy / length, ny = dx / length;
    const labelKey = c.labelSize + ':' + c.angle.textContent;
    if (c.labelKey !== labelKey) {
      c.angle.style.fontSize = c.labelSize + 'px';
      c.angle.setAttribute('x', 0);c.angle.setAttribute('y', 0);
      const box = c.angle.getBBox();
      c.angle.setAttribute('x', -box.x - box.width / 2);
      c.angle.setAttribute('y', -box.y - box.height / 2);
      c.labelWidth = box.width;c.labelHeight = box.height;c.labelKey = labelKey;
    }
    const halfWidth = c.labelWidth / 2 + 1, halfHeight = c.labelHeight / 2 + 1;
    const offset = Math.abs(nx) * halfWidth + Math.abs(ny) * halfHeight + 2;
    const positions = [.55, .3, .1].flatMap((along) => [1, -1].map((side) => ({
      x: 50 + (x - 50) * along + side * nx * offset * c.scaleX,
      y: 48 + (y - 48) * along + side * ny * offset * c.scaleY,
    })));
    // 狭い画面でも円柱からはみ出しにくい側を選ぶ。
    const surfaceShift = 82 - c.p * 64 - 48;
    const overflow = (p) => Math.max(0, halfWidth * c.scaleX - p.x)
      + Math.max(0, p.x + halfWidth * c.scaleX - 100)
      + Math.max(0, halfHeight * c.scaleY - p.y - surfaceShift)
      + Math.max(0, p.y + surfaceShift + halfHeight * c.scaleY - 100);
    const label = positions.reduce((best, p) => overflow(p) < overflow(best) ? p : best);
    const labelX = label.x, labelY = label.y;
    c.angle.setAttribute('transform', `translate(${labelX} ${labelY}) scale(${c.scaleX} ${c.scaleY})`);
    c.dial.style.color = `hsl(${radians / TAU * 360}, 90%, 72%)`;
    c.displayed = radians;
  }

  function animate(now) {
    frame = null;
    let moving = false;
    for (const c of cols) {
      if (!c.moving || !c.visible) continue;
      const progress = reducedMotion.matches ? 1 : Math.min(1, (now - c.started) / 260);
      drawPhase(c, c.from + (c.target - c.from) * (1 - (1 - progress) ** 3));
      c.moving = progress < 1;
      moving ||= c.moving;
    }
    if (moving) frame = requestAnimationFrame(animate);
  }

  function describe(c, index) {
    const angle = c.visible ? thetaLabel(((c.radians % TAU) + TAU) % TAU) : t('phaseUndefined');
    c.angle.textContent = c.visible ? angle : '';
    const values = { image: imageName(index), bits: IMAGE_META[index].bits, pct: Math.round(c.p * 100), angle };
    c.col.title = t('cylinderMeterDescription').replace(/\{(\w+)\}/g, (_, key) => values[key]);
    c.col.setAttribute('aria-label', c.col.title);
  }

  // 縦横比が変わっても光点は丸いまま、画面上で読める大きさを保つ。
  const resize = new ResizeObserver(() => {
    const sizes = cols.map((c) => c.svg.getBoundingClientRect());
    cols.forEach((c, i) => {
      if (sizes[i].width > 0 && sizes[i].height > 0) {
        c.scaleX = 100 / sizes[i].width;c.scaleY = 100 / sizes[i].height;
        c.labelSize = sizes[i].width < 60 ? 7.5 : 10;
        if (c.visible) drawPhase(c, c.displayed);
      }
    });
  });
  cols.forEach((c) => resize.observe(c.svg));

  return {
    update(probs, phases) {
      const now = performance.now();
      for (let i = 0; i < NUM; i++) {
        const c = cols[i], p = Math.max(0, Math.min(1, probs[i]));
        c.p = p;
        const height = p * 64;
        const surfaceY = 82 - height;
        const percent = Math.round(p * 100);
        c.bar.setAttribute('height', height);c.bar.setAttribute('y', surfaceY);
        c.surface.setAttribute('cy', surfaceY);
        c.dial.setAttribute('transform', `translate(0 ${surfaceY - 48})`);
        c.liquid.setAttribute('opacity', percent > 0 ? '1' : '0');
        c.pct.textContent = `${percent}%`;
        const show = percent > 0, wasVisible = c.visible;
        c.visible = show;c.radians = phases[i];
        c.dial.toggleAttribute('hidden', !show);
        describe(c, i);
        if (show) {
          const delta = Math.atan2(Math.sin(phases[i] - c.target), Math.cos(phases[i] - c.target));
          if (!wasVisible || reducedMotion.matches) {
            c.target = phases[i];c.moving = false;drawPhase(c, phases[i]);
          } else if (Math.abs(delta) > 1e-9) {
            c.from = c.displayed;
            c.target = c.displayed + Math.atan2(Math.sin(phases[i] - c.displayed), Math.cos(phases[i] - c.displayed));
            c.started = now;c.moving = true;
          }
        } else c.moving = false;
      }
      if (frame === null && cols.some((c) => c.moving)) frame = requestAnimationFrame(animate);
    },
    renderLanguage() {
      cols.forEach((c, i) => { c.col.querySelector('.meter-name').textContent = imageName(i);describe(c, i); });
    },
    setRoulette(idx) { cols.forEach((c, i) => c.col.classList.toggle('hot', i === idx)); },
    setWinner(idx) { cols.forEach((c, i) => c.col.classList.toggle('winner', i === idx)); },
  };
}
