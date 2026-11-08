import { SCENE_MUSIC, BEAT_SECONDS, LOOP_SECONDS, MUSIC_VERSION, createSceneScore } from './score.js';
import { seededRandom, noiseBuffer, reverbImpulse, scheduleInstrument } from './synth.js';
import { loadRecordedBank, scheduleRecordedInstrument } from './recorded-instruments.js';

export { SCENE_MUSIC, LOOP_SECONDS } from './score.js';

export function audioStatistics(buffer) {
  let energy = 0, peak = 0;
  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    for (const value of buffer.getChannelData(channel)) { energy += value * value;peak = Math.max(peak, Math.abs(value)); }
  }
  return { rms: Math.sqrt(energy / (buffer.length * buffer.numberOfChannels)), peak };
}

// Balance sparse plucks against sustained ambient tracks. A few pick/drum
// transients should not force an entire song to half the others' RMS level.
export function masterComposition(buffer) {
  const { rms } = audioStatistics(buffer);
  if (rms < 1e-8) return buffer;
  const channels = Array.from({ length: buffer.numberOfChannels }, (_,i) => buffer.getChannelData(i));
  const soften = value => {
    const magnitude = Math.abs(value);
    return magnitude <= .38 ? value : Math.sign(value) * (.38 + .15 * Math.tanh((magnitude-.38)/.15));
  };
  let gain = .075 / rms;
  for (let pass=0;pass<6;pass++) {
    let energy=0;
    for (const data of channels) for (const value of data) { const output=soften(value*gain);energy+=output*output; }
    const actual = Math.sqrt(energy/(buffer.length*buffer.numberOfChannels));
    if (Math.abs(actual-.075)<.00005) break;
    gain *= .075 / Math.max(actual,1e-8);
  }
  for (const data of channels) for (let i=0;i<data.length;i++) data[i]=soften(data[i]*gain);
  return buffer;
}

function normalizeSong(buffer) {
  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const data = buffer.getChannelData(channel);
    const mean = data.reduce((sum, value) => sum + value, 0) / data.length;
    for (let i = 0; i < data.length; i++) data[i] -= mean;
  }
  const { rms, peak } = audioStatistics(buffer);
  const scale = Math.min(.075 / Math.max(rms, 1e-8), .55 / Math.max(peak, 1e-8));
  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < data.length; i++) data[i] *= scale;
  }
  return buffer;
}

export async function loadAllSongs(context, onProgress = () => {}) {
  let complete = 0;
  onProgress(0, SCENE_MUSIC.length);
  try {
    return await Promise.all(SCENE_MUSIC.map(async scene => {
      const response = await fetch(new URL(`../../assets/music/${scene.asset}.ogg?v=${MUSIC_VERSION}`, import.meta.url));
      if (!response.ok) throw new Error('Music asset unavailable');
      const buffer = await context.decodeAudioData(await response.arrayBuffer());
      if (Math.abs(buffer.duration - LOOP_SECONDS) > 1.5 / context.sampleRate) throw new Error('Unexpected music loop length');
      onProgress(++complete, SCENE_MUSIC.length);
      return normalizeSong(buffer);
    }));
  } catch {
    // Retain a self-contained fallback for browsers without Vorbis decoding.
    return renderAllSongs(context.sampleRate, onProgress);
  }
}

export async function renderSceneSong(index, sampleRate = 44100) {
  const scene = SCENE_MUSIC[index];
  if (!scene) throw new RangeError('Unknown music scene');
  const tailSeconds = 8;
  const ctx = new OfflineAudioContext(2, Math.ceil((LOOP_SECONDS + tailSeconds) * sampleRate), sampleRate);
  const dry = ctx.createGain(), wet = ctx.createGain(), reverb = ctx.createConvolver();
  const bus = ctx.createDynamicsCompressor();
  bus.threshold.value = -23;bus.knee.value = 18;bus.ratio.value = 3;
  bus.attack.value = .004;bus.release.value = .16;bus.connect(ctx.destination);
  const random = seededRandom(0x514d4958 + index * 7919);
  dry.gain.value = .8;wet.gain.value = [ .1,.48,.22,.06,.65,.04,.1,.28 ][index];
  reverb.buffer = reverbImpulse(ctx, [ .8,2.5,1.4,.55,4.2,.45,.7,1.8 ][index], random);
  dry.connect(bus);dry.connect(reverb);reverb.connect(wet).connect(bus);
  // Spatial echoes belong to the space track; short plucked-string echoes
  // give cherry blossoms a different texture without washing out the attacks.
  if (index === 0 || index === 4) {
    const delay = ctx.createDelay(3), feedback = ctx.createGain(), echo = ctx.createGain(), pan = ctx.createStereoPanner();
    delay.delayTime.value = BEAT_SECONDS * (index === 4 ? 1.5 : .5);
    feedback.gain.value = index === 4 ? .24 : .12;
    echo.gain.value = index === 4 ? .32 : .11;pan.pan.value = .55;
    dry.connect(delay);delay.connect(feedback).connect(delay);delay.connect(echo).connect(pan).connect(bus);
  }
  const noise = noiseBuffer(ctx, 1, random);
  const score = createSceneScore(index);
  const recordings = await loadRecordedBank(ctx, score);
  for (const event of score) {
    if (!scheduleRecordedInstrument(ctx, dry, event, BEAT_SECONDS, recordings, random)) {
      scheduleInstrument(ctx, dry, event, BEAT_SECONDS, noise, random);
    }
  }
  const rendered = await ctx.startRendering();
  const length = Math.round(LOOP_SECONDS * sampleRate);
  const result = new AudioBuffer({ numberOfChannels: 2, length, sampleRate });
  for (let channel = 0; channel < 2; channel++) {
    const source = rendered.getChannelData(channel), target = result.getChannelData(channel);
    // Fold reverberation and held notes into the beginning rather than cutting
    // them at the loop boundary. Eight extra seconds retain the space echoes.
    target.set(source.subarray(0, length));
    for (let i = length; i < source.length; i++) target[i - length] += source[i];
  }
  return normalizeSong(masterComposition(result));
}

export async function renderAllSongs(sampleRate = 44100, onProgress = () => {}) {
  const buffers = [];
  onProgress(0, SCENE_MUSIC.length);
  for (let i = 0; i < SCENE_MUSIC.length; i++) {
    buffers.push(await renderSceneSong(i, sampleRate));
    onProgress(i + 1, SCENE_MUSIC.length);
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  return buffers;
}
