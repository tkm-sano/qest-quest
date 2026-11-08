import { IMAGE_NAMES, imageName, loadSceneImages } from './image-scenes.js';
import { getLanguage, t } from '../i18n.js';

const SOURCE_WIDTH = 1280;
const SOURCE_HEIGHT = 512;

// 同じ画素位置のRGBを理想確率で重み付けして合成する。
export function blendPixels(images, probabilities) {
  if (images.length !== probabilities.length || images.length === 0) throw new Error('画像と確率の数が一致しません');
  const length = images[0].length;
  const output = new Uint8ClampedArray(length);
  const total = probabilities.reduce((sum, p) => sum + p, 0) || 1;
  for (let pixel = 0; pixel < length; pixel += 4) {
    for (let channel = 0; channel < 3; channel++) {
      let value = 0;
      for (let image = 0; image < images.length; image++) value += images[image][pixel + channel] * probabilities[image];
      output[pixel + channel] = value / total;
    }
    output[pixel + 3] = 255;
  }
  return output;
}

function drawCover(ctx, image, width, height) {
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const sourceRatio = sourceWidth / sourceHeight;
  const destinationRatio = width / height;
  let sx = 0, sy = 0, sw = sourceWidth, sh = sourceHeight;
  if (destinationRatio > sourceRatio) {
    sh = sourceWidth / destinationRatio;
    sy = (sourceHeight - sh) / 2;
  } else {
    sw = sourceHeight * destinationRatio;
    sx = (sourceWidth - sw) / 2;
  }
  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, width, height);
}

export function createFloor(canvas) {
  const ctx = canvas.getContext('2d');
  const status = canvas.parentElement.querySelector('#image-status');
  const mixedCanvas = document.createElement('canvas');
  mixedCanvas.width = SOURCE_WIDTH;
  mixedCanvas.height = SOURCE_HEIGHT;
  const mixedCtx = mixedCanvas.getContext('2d');
  let images = null;
  let buffers = null;
  let sources = null;
  let probs = new Float64Array(IMAGE_NAMES.length);
  probs[0] = 1;
  let rotate = false;
  let angles = new Float64Array(IMAGE_NAMES.length);
  let fromAngles = new Float64Array(IMAGE_NAMES.length);
  let targetAngles = new Float64Array(IMAGE_NAMES.length);
  let frame = null;
  let started = 0;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let roulette = null;
  let winner = null;
  let loading = true;
  let loadError = null;
  let loadSequence = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    draw();
  }

  function draw() {
    const width = canvas.width, height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#14223d';
    ctx.fillRect(0, 0, width, height);
    if (!images) {
      status.textContent = loadError ? `${t('imageLoadingError')}${loadError.message}` : t('imageLoading');
      return;
    }
    const selected = winner ?? roulette;
    const displayed = selected === null ? mixedCanvas : images[selected];
    const scale = Math.min(width / (displayed.naturalWidth || displayed.width), height / (displayed.naturalHeight || displayed.height));
    const dw = (displayed.naturalWidth || displayed.width) * scale;
    const dh = (displayed.naturalHeight || displayed.height) * scale;
    ctx.drawImage(displayed, (width - dw) / 2, (height - dh) / 2, dw, dh);
    if (loading || loadError) {
      status.textContent = loadError ? `${t('imageLoadingError')}${loadError.message}` : t('imageLoading');
      return;
    }
    const active = Array.from(probs, (p, i) => ({ p, i })).filter(({ p }) => p > 1e-3);
    status.textContent = winner !== null
      ? `${t('observationResult')} |${winner.toString(2).padStart(3, '0')}⟩ ${imageName(winner)}`
      : roulette !== null ? `${t('choosingImage')}${imageName(roulette)}`
      : active.length === 1 ? getLanguage() === 'en' ? `Showing ${imageName(active[0].i)}` : `${imageName(active[0].i)}を表示中`
      : active.length <= 3 ? `${active.map(({ p, i }) => `${imageName(i)} ${Math.round(p * 100)}%`).join(' + ')}`
      : getLanguage() === 'en' ? `Blending ${active.length} images by probability` : `${active.length}枚の画像を確率に応じて重ねています`;
  }

  function updateMix() {
    if (!buffers) return;
    if (rotate) {
      // Add premultiplied colors with probability weights. Ordinary source-over
      // would favor the last image. Rotate each component before combining it.
      mixedCtx.clearRect(0, 0, SOURCE_WIDTH, SOURCE_HEIGHT);
      const total = probs.reduce((sum, p) => sum + p, 0) || 1;
      mixedCtx.save();
      mixedCtx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < sources.length; i++) {
        if (probs[i] <= 0) continue;
        mixedCtx.save();
        mixedCtx.globalAlpha = probs[i] / total;
        mixedCtx.translate(SOURCE_WIDTH / 2, SOURCE_HEIGHT / 2);
        mixedCtx.rotate(angles[i]);
        mixedCtx.drawImage(sources[i], -SOURCE_WIDTH / 2, -SOURCE_HEIGHT / 2);
        mixedCtx.restore();
      }
      // Fill uncovered corners with the same stage background, in proportion
      // to the missing image weight. Keep size and crop fixed while rotating.
      mixedCtx.globalCompositeOperation = 'destination-over';
      mixedCtx.fillStyle = '#14223d';
      mixedCtx.fillRect(0, 0, SOURCE_WIDTH, SOURCE_HEIGHT);
      mixedCtx.restore();
    } else {
      const pixels = blendPixels(buffers, probs);
      mixedCtx.putImageData(new ImageData(pixels, SOURCE_WIDTH, SOURCE_HEIGHT), 0, 0);
    }
    draw();
  }

  function animate(now) {
    frame = null;
    const progress = reducedMotion.matches ? 1 : Math.min(1, (now - started) / 260);
    const eased = 1 - (1 - progress) ** 3;
    angles = Float64Array.from(targetAngles, (target, i) => fromAngles[i] + (target - fromAngles[i]) * eased);
    updateMix();
    if (progress < 1) frame = requestAnimationFrame(animate);
  }

  function setState(nextProbs, nextPhases, { rotate: nextRotate = false } = {}) {
    const previousProbs = probs;
    const wasRotating = rotate;
    probs = Float64Array.from(nextProbs);
    rotate = nextRotate;
    const nextTargets = Float64Array.from(nextPhases, (phase, i) => {
      // Newly visible images start at their phase; don't spin them from an
      // arbitrary angle that belonged to a zero-probability component.
      if (!wasRotating || previousProbs[i] < 1e-12 || reducedMotion.matches) return phase;
      const change = Math.atan2(Math.sin(phase - targetAngles[i]), Math.cos(phase - targetAngles[i]));
      if (Math.abs(change) < 1e-9) return targetAngles[i];
      return angles[i] + Math.atan2(Math.sin(phase - angles[i]), Math.cos(phase - angles[i]));
    });
    const changed = nextTargets.some((target, i) => Math.abs(target - targetAngles[i]) > 1e-9);
    if (changed || rotate !== wasRotating || reducedMotion.matches) {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      fromAngles = Float64Array.from(angles);
      targetAngles = nextTargets;
      for (let i = 0; i < angles.length; i++) {
        if (!wasRotating || previousProbs[i] < 1e-12 || reducedMotion.matches) {
          angles[i] = targetAngles[i];fromAngles[i] = targetAngles[i];
        }
      }
      if (rotate && angles.some((angle, i) => probs[i] > 0 && Math.abs(angle - targetAngles[i]) > 1e-9)) {
        started = performance.now();frame = requestAnimationFrame(animate);
      } else angles = Float64Array.from(targetAngles);
    }
    updateMix();
  }

  async function setImageSet(id) {
    const sequence = ++loadSequence;
    loading = true;
    loadError = null;
    draw();
    try {
      const loaded = await loadSceneImages(id);
      if (sequence !== loadSequence) return false;
      const nextSources = loaded.map((image) => {
        const source = document.createElement('canvas');
        source.width = SOURCE_WIDTH;
        source.height = SOURCE_HEIGHT;
        const sourceCtx = source.getContext('2d', { willReadFrequently: true });
        drawCover(sourceCtx, image, SOURCE_WIDTH, SOURCE_HEIGHT);
        return source;
      });
      images = loaded;
      sources = nextSources;
      buffers = sources.map(source => source.getContext('2d').getImageData(0, 0, SOURCE_WIDTH, SOURCE_HEIGHT).data);
      loading = false;
      canvas.dataset.imageSet = id;
      updateMix();
      return true;
    } catch (error) {
      if (sequence !== loadSequence) return false;
      loading = false;
      loadError = error;
      draw();
      throw error;
    }
  }

  window.addEventListener('resize', resize);
  resize();

  return {
    setImageSet,
    setState,
    renderLanguage: draw,
    setProbs(next) { probs = next; updateMix(); },
    setRoulette(index) { roulette = index; draw(); },
    setWinner(index) { winner = index; draw(); },
  };
}
