import { loadAllSongs } from './songs.js';
import { SCENE_MUSIC } from './score.js';

const COUNT = SCENE_MUSIC.length;

// Independent soundtracks use amplitude gains sqrt(p). This is a sonification
// of the distribution: quantum phases never shift the music's playback clock.
export function musicGains(probabilities, measured = null) {
  const gains = new Float64Array(COUNT);
  if (Number.isInteger(measured) && measured >= 0 && measured < COUNT) {
    gains[measured] = 1;return gains;
  }
  if (probabilities?.length !== COUNT) return gains;
  const weights = Float64Array.from(probabilities, p => Number.isFinite(p) ? Math.max(0, p) : 0);
  const total = weights.reduce((sum, p) => sum + p, 0);
  if (total > 0) for (let i = 0; i < COUNT; i++) gains[i] = Math.sqrt(weights[i] / total);
  return gains;
}

export class SceneMusicEngine {
  constructor({ createContext = () => new (window.AudioContext || window.webkitAudioContext)(), render = null, onChange = () => {} } = {}) {
    this.createContext = createContext;this.render = render;this.onChange = onChange;
    this.ctx = null;this.buffers = null;this.sources = [];this.gains = [];
    this.master = null;this.preparing = null;this.playing = false;
    this.volume = .35;this.muted = false;this.active = true;
    this.targets = new Float64Array(COUNT);this.targets[0] = 1;
  }

  async play(onProgress = () => {}) {
    // Resume directly in the user gesture, before awaiting offline rendering.
    if (!this.ctx) {
      this.ctx = this.createContext();
      this.ctx.onstatechange = () => this.onChange();
    }
    const context = this.ctx;
    try {
      await context.resume();
      if (!this.buffers) {
        this.preparing ??= this.render ? this.render(context.sampleRate, onProgress) : loadAllSongs(context, onProgress);
        this.buffers = await this.preparing;
      }
      if (!this.master) {
        this.master = context.createGain();
        this.master.gain.value = 0;
        const compressor = context.createDynamicsCompressor();
        compressor.threshold.value = -9;compressor.knee.value = 8;compressor.ratio.value = 8;
        compressor.attack.value = .006;compressor.release.value = .2;
        this.master.connect(compressor).connect(context.destination);
        const start = context.currentTime + .06;
        this.startTime = start;
        this.sources = this.buffers.map((buffer, index) => {
          const source = context.createBufferSource(), gain = context.createGain();
          source.buffer = buffer;source.loop = true;gain.gain.value = this.targets[index];
          source.connect(gain).connect(this.master);this.gains.push(gain);source.start(start);
          return source;
        });
      }
      this.playing = true;this.syncMaster();this.onChange();
    } catch (error) {
      context.onstatechange = null;
      this.ctx = null;this.buffers = null;this.preparing = null;
      this.sources = [];this.gains = [];this.master = null;this.playing = false;
      await context.close().catch(() => {});
      this.onChange();throw error;
    }
  }

  async pause() {
    if (!this.ctx) return;
    this.playing = false;this.syncMaster();
    await this.ctx.suspend();this.onChange();
  }

  setMix(probabilities, measured = null) {
    const next = musicGains(probabilities, measured);
    if (next.every((value, i) => Math.abs(value - this.targets[i]) < 1e-10)) return;
    this.targets = next;
    if (!this.master) return;
    for (let i = 0; i < COUNT; i++) this.gains[i].gain.setTargetAtTime(next[i], this.ctx.currentTime, .08);
  }

  setVolume(value) { this.volume = Math.min(1, Math.max(0, Number(value) || 0));this.syncMaster(); }
  setMuted(value) { this.muted = Boolean(value);this.syncMaster(); }
  setActive(value) { this.active = Boolean(value);this.syncMaster(); }
  syncMaster() {
    if (this.master) this.master.gain.setTargetAtTime(this.playing && this.active && !this.muted ? this.volume : 0, this.ctx.currentTime, .025);
  }
}
