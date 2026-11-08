import { noteFrequency } from './synth.js';

export const RECORDED_FAMILIES = {
  koto: 'harp', harp: 'harp', oud: 'guitar', flute: 'flute', bird: 'flute',
  water: 'epiano', synth: 'piano', felt: 'piano', tide: 'piano',
  star: 'vibes', bubble: 'vibes', nebula: 'glass', shimmer: 'glass',
  wood: 'marimba', celesta: 'glock', doum: 'doum', tek: 'tek',
  woodblock: 'woodblock', shaker: 'shaker', hat: 'shaker', kick: 'kick', clap: 'clap',
};

let manifestPromise;
const decoded = new Map();

async function manifest() {
  if (!manifestPromise) {
    manifestPromise = fetch(new URL('../../assets/instruments/manifest.json', import.meta.url))
      .then(response => { if (!response.ok) throw new Error('Instrument bank unavailable');return response.json(); })
      .catch(error => { manifestPromise = null;throw error; });
  }
  return manifestPromise;
}

export async function loadRecordedBank(context, events) {
  const families = new Set(events.map(event => RECORDED_FAMILIES[event.voice]).filter(Boolean));
  const source = await manifest();
  const zones = source.samples.filter(zone => families.has(zone.family));
  const bank = new Map();
  await Promise.all(zones.map(async zone => {
    const key = context.sampleRate + ':' + zone.file;
    if (!decoded.has(key)) {
      decoded.set(key, fetch(new URL('../../assets/instruments/' + zone.file, import.meta.url))
        .then(response => { if (!response.ok) throw new Error('Instrument sample unavailable: ' + zone.file);return response.arrayBuffer(); })
        .then(bytes => context.decodeAudioData(bytes))
        .catch(error => { decoded.delete(key);throw error; }));
    }
    const buffer = await decoded.get(key);
    if (!bank.has(zone.family)) bank.set(zone.family, []);
    bank.get(zone.family).push({ ...zone, buffer });
  }));
  // Fetch completion order must not change which take a seeded render chooses.
  for (const zones of bank.values()) zones.sort((a,b) => a.id.localeCompare(b.id));
  return bank;
}

export function selectRecordedZone(zones, frequency, random = Math.random) {
  if (!zones?.length) throw new Error('Empty recorded instrument');
  if (!zones[0].rootFrequency) return zones[Math.floor(random() * zones.length)];
  const distances = zones.map(zone => Math.abs(Math.log2(frequency / zone.rootFrequency)));
  const nearest = Math.min(...distances);
  const candidates = zones.filter((_,i) => distances[i] < nearest + .001);
  return candidates[Math.floor(random() * candidates.length)];
}

const LEVEL = {
  koto:.3,harp:.25,oud:.34,flute:.25,bird:.14,water:.25,synth:.28,felt:.23,tide:.18,
  star:.28,bubble:.12,nebula:.16,shimmer:.045,wood:.3,celesta:.25,doum:.32,tek:.27,
  woodblock:.16,shaker:.2,hat:.2,kick:.38,clap:.24,
};
const RING = {koto:1.5,harp:1.4,oud:.8,star:1.8,celesta:1.8,wood:.8,felt:.7,water:.7};
const HIGHPASS = {koto:45,harp:45,oud:60,flute:140,bird:500,water:60,synth:70,felt:60,
  tide:45,star:100,bubble:350,nebula:110,shimmer:3200,wood:100,celesta:400,
  doum:50,tek:450,woodblock:400,shaker:2200,hat:4500,kick:30,clap:150};
const LOWPASS = {water:1600,tide:850,nebula:4800,shimmer:11000,bird:6500,hat:13000};

// Preserve the recorded attack, body and natural decay. Only the scheduled
// note-off is shaped; the actual instrument is no longer made from oscillators.
export function scheduleRecordedInstrument(context, destination, event, beatSeconds, bank, random) {
  const family = RECORDED_FAMILIES[event.voice];
  if (!family) return false;
  const frequency = noteFrequency(event.note), voice = event.voice;
  const zone = selectRecordedZone(bank.get(family), frequency, random);
  const source = context.createBufferSource();source.buffer = zone.buffer;
  const rate = zone.rootFrequency ? frequency / zone.rootFrequency : 1;
  const time = event.beat * beatSeconds;
  source.playbackRate.setValueAtTime(rate, time);
  if (voice === 'bubble' || voice === 'bird') {
    source.playbackRate.setValueAtTime(rate * (voice === 'bubble' ? .75 : .94), time);
    source.playbackRate.exponentialRampToValueAtTime(rate, time + .12);
  }
  const duration = event.duration * beatSeconds;
  const percussive = !zone.rootFrequency;
  const desired = percussive ? zone.buffer.duration : duration + (RING[voice] ?? .16);
  const length = Math.min(zone.buffer.duration / rate - .005, desired);
  const release = Math.min(length / 3, percussive ? .06 : voice === 'flute' ? .12 : .18);
  const attack = Math.min(length / 4, voice === 'tide' ? .25 : voice === 'nebula' ? .5 : .003);
  const gain = context.createGain(), high = context.createBiquadFilter(), low = context.createBiquadFilter();
  high.type = 'highpass';high.frequency.value = HIGHPASS[voice];high.Q.value = .7;
  low.type = 'lowpass';low.frequency.value = LOWPASS[voice] ?? 7000 + 4000 * event.velocity;low.Q.value = .65;
  if (voice === 'synth') {
    low.frequency.setValueAtTime(6500, time);
    low.frequency.exponentialRampToValueAtTime(2200, time + Math.max(.04, duration));
  }
  const peak = event.velocity * LEVEL[voice];
  gain.gain.setValueAtTime(0,time);
  gain.gain.linearRampToValueAtTime(peak,time+attack);
  gain.gain.setValueAtTime(peak,time+length-release);
  gain.gain.linearRampToValueAtTime(0,time+length);
  const pan = context.createStereoPanner();pan.pan.value = event.pan;
  source.connect(high).connect(low).connect(gain).connect(pan).connect(destination);
  source.start(time);source.stop(time+length+.01);
  return true;
}
