import test from 'node:test';
import assert from 'node:assert/strict';
import { SCENE_MUSIC, LOOP_BEATS, LOOP_SECONDS, BPM, createSceneScore } from '../js/audio/score.js';
import { noteFrequency, seededRandom, pluckedStringSamples } from '../js/audio/synth.js';
import { musicGains, SceneMusicEngine } from '../js/audio/engine.js';
import { masterComposition, audioStatistics } from '../js/audio/songs.js';
import { RECORDED_FAMILIES, selectRecordedZone } from '../js/audio/recorded-instruments.js';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createCircuit, placeGate, evaluate } from '../js/quantum/circuit.js';
import { probabilities, measureQubit } from '../js/quantum/state.js';

const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-10, `${a} != ${b}`);

test('eight original scores share a loop clock and have playable, distinct melodies and timbres', () => {
  assert.equal(SCENE_MUSIC.length, 8);
  assert.equal(LOOP_SECONDS, LOOP_BEATS * 60 / BPM);
  assert.equal(new Set(SCENE_MUSIC.map(scene => scene.voice)).size, 8);
  const melodies = new Set();
  for (const [index, scene] of SCENE_MUSIC.entries()) {
    assert.equal(scene.bits, index.toString(2).padStart(3, '0'));
    assert.ok(scene.title && scene.titleEn && scene.instrument && scene.instrumentEn);
    const events = createSceneScore(index);
    assert.ok(events.length > 20);
    assert.deepEqual(events, createSceneScore(index), 'scores do not change on a gate edit');
    for (const [i, event] of events.entries()) {
      assert.ok(event.beat >= 0 && event.beat < LOOP_BEATS);
      assert.ok(event.duration > 0 && event.duration < 6);
      assert.ok(event.velocity > 0 && event.velocity <= 1);
      assert.ok(Math.abs(event.pan) <= 1);
      assert.ok(noteFrequency(event.note) > 20 && noteFrequency(event.note) < 10000);
      if (i) assert.ok(event.beat >= events[i - 1].beat);
    }
    const melody = events.filter(event => event.role === 'melody');
    assert.ok(melody.length >= 12 && new Set(melody.map(event => event.note)).size >= 4);
    melodies.add(JSON.stringify(melody.map(({ beat, note }) => [beat, note])));
  }
  assert.equal(melodies.size, 8);
  close(noteFrequency('A4'), 440);
  const a = seededRandom(123), b = seededRandom(123);
  for (let i = 0; i < 30; i++) close(a(), b());
});

test('plucked strings resonate near their written pitch and have smooth, decaying endpoints', () => {
  for (const voice of ['koto','oud','harp']) {
    const rate=22050,freq=220,samples=pluckedStringSamples(freq,rate,1.5,voice,seededRandom(9));
    close(samples[0],0);close(samples.at(-1),0);
    assert.ok(samples.every(Number.isFinite));
    const energy=(start,end)=>samples.slice(start,end).reduce((sum,x)=>sum+x*x,0)/(end-start);
    assert.ok(energy(rate*.04,rate*.14)>energy(rate,rate*1.3)*10,'natural string decay');
    let bestLag=0,best=-Infinity;
    for(let lag=Math.floor(rate/freq*.9);lag<=Math.ceil(rate/freq*1.1);lag++){
      let correlation=0;
      for(let i=800;i<3500;i++)correlation+=samples[i]*samples[i+lag];
      if(correlation>best){best=correlation;bestLag=lag;}
    }
    assert.ok(Math.abs(rate/bestLag-freq)/freq<.025,`${voice}: incorrect pitch ${rate/bestLag}`);
  }
});

test('all main melodies use local, traceable recordings with valid tuning and complete sample files', () => {
  const manifest=JSON.parse(readFileSync(new URL('../assets/instruments/manifest.json',import.meta.url)));
  assert.equal(manifest.license,'CC0-1.0');
  const families=new Set(manifest.samples.map(sample=>sample.family));
  for(let i=0;i<8;i++)for(const event of createSceneScore(i).filter(event=>event.role==='melody')){
    assert.ok(families.has(RECORDED_FAMILIES[event.voice]),`${event.voice} must use recorded instruments`);
  }
  for(const sample of manifest.samples){
    const file=new URL('../assets/instruments/'+sample.file,import.meta.url);
    assert.ok(existsSync(file));
    assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'),sample.sha256);
    assert.ok(sample.duration>.1&&sample.duration<=5.01);
    if(sample.rootNote)assert.ok(sample.rootFrequency>40&&sample.rootFrequency<3000);
  }
});

test('recorded notes select the nearest calibrated pitch, not the source file octave label', () => {
  const zones=[{id:'low',rootFrequency:219.5},{id:'high',rootFrequency:441.5}];
  assert.equal(selectRecordedZone(zones,440,()=>0).id,'high');
  assert.equal(selectRecordedZone(zones,220,()=>0).id,'low');
  const drum=[{id:'take-1',rootFrequency:null},{id:'take-2',rootFrequency:null}];
  assert.equal(selectRecordedZone(drum,440,()=>.9).id,'take-2');
});

test('probability sound mix follows actual Bell preparation, partial collapse and measured outcomes', () => {
  const circuit = createCircuit();
  placeGate(circuit, 0, 0, 'H');placeGate(circuit, 2, 1, 'CNOT');
  const state = evaluate(circuit), p = probabilities(state);
  const gains = musicGains(p);
  close(gains[0], Math.SQRT1_2);close(gains[5], Math.SQRT1_2);
  close(gains.reduce((sum, gain) => sum + gain * gain, 0), 1);
  for (const random of [() => .1, () => .9]) {
    const result = measureQubit(state, 0, random);
    const conditional = musicGains(probabilities(result.state));
    assert.equal(conditional[result.outcome ? 5 : 0], 1);
    close(conditional.reduce((sum, gain) => sum + gain, 0), 1);
  }
  for (let i = 0; i < 8; i++) {
    const measured = musicGains(new Float64Array(8).fill(1 / 8), i);
    assert.equal(measured[i], 1);assert.equal(measured.reduce((sum, gain) => sum + gain, 0), 1);
  }
  assert.deepEqual([...musicGains(null)], Array(8).fill(0), 'five-qubit advanced examples have no image soundtrack');
  close(musicGains([2,2,0,0,0,0,0,0])[0], Math.SQRT1_2);
});

test('a few pluck transients do not make a whole track quieter than a sustained track', () => {
  for (const transients of [false,true]) {
    const channels = Array.from({ length: 2 },()=>Float32Array.from({ length: 16000 },(_,i)=>
      transients && i%2000<3 ? .8 : .015*Math.sin(i*.12)));
    const buffer={numberOfChannels:2,length:16000,getChannelData:i=>channels[i]};
    const stats=audioStatistics(masterComposition(buffer));
    assert.ok(Math.abs(stats.rms-.075)<.0001);
    assert.ok(stats.peak<=.531);
  }
});

test('eight sources start together, resume without duplicates, preserve mute and receive current mix after preparation', async () => {
  const starts = [], masterTargets = [], sourceGains = [];
  let rendered = 0, resume = 0, suspend = 0, contextCreated = 0;
  const context = {
    sampleRate: 44100, currentTime: 10, destination: {},
    resume: async () => { resume++; }, suspend: async () => { suspend++; }, close: async () => {},
    createGain() {
      const gain = { value: 0, setTargetAtTime(value) { this.value = value;if (sourceGains[0] === gain) masterTargets.push(value); } };
      sourceGains.push(gain);
      return { gain, connect() { return this; } };
    },
    createDynamicsCompressor() { return { threshold: {}, knee: {}, ratio: {}, attack: {}, release: {}, connect() { return this; } }; },
    createBufferSource() { return { connect() { return this; }, start(time) { starts.push(time); } }; },
  };
  const engine = new SceneMusicEngine({ createContext: () => { contextCreated++;return context; }, render: async () => { rendered++;return Array(8).fill({}); } });
  engine.setMuted(true);engine.setMix(Float64Array.of(0,1,0,0,0,0,0,0));
  await engine.play();
  assert.equal(starts.length, 8);assert.equal(new Set(starts).size, 1);
  assert.equal(sourceGains[2].value, 1);assert.equal(masterTargets.at(-1), 0);
  engine.setMuted(false);engine.setVolume(.2);assert.equal(masterTargets.at(-1), .2);
  engine.setActive(false);assert.equal(masterTargets.at(-1), 0);
  engine.setActive(true);assert.equal(masterTargets.at(-1), .2);
  await engine.pause();await engine.play();
  assert.equal(starts.length, 8);assert.equal(contextCreated, 1);assert.equal(rendered, 1);assert.equal(resume, 2);assert.equal(suspend, 1);
});
