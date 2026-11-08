// Procedural bass, auxiliary instruments, and room impulse generation.
// The main instruments use recordings via recorded-instruments.js.
export function noteFrequency(note) {
  const match = /^([A-G])(#?)(\d)$/.exec(note);
  if (!match) throw new RangeError('Invalid note: ' + note);
  const semitones = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 };
  return 440 * 2 ** ((semitones[match[1]] + (match[2] ? 1 : 0) + (Number(match[3]) - 4) * 12) / 12);
}

export function seededRandom(seed) {
  let value = seed | 0 || 1;
  return () => {
    value ^= value << 13;value ^= value >>> 17;value ^= value << 5;
    return (value >>> 0) / 4294967296;
  };
}

export function noiseBuffer(ctx, seconds, random) {
  const buffer = ctx.createBuffer(1, Math.ceil(seconds * ctx.sampleRate), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = random() * 2 - 1;
  return buffer;
}

export function reverbImpulse(ctx, seconds, random) {
  const buffer = ctx.createBuffer(2, Math.ceil(seconds * ctx.sampleRate), ctx.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    let first=0, second=0;
    const predelay=.018+channel*.004;
    for (let i = 0; i < data.length; i++) {
      const time=i/ctx.sampleRate;
      const cutoff=6500*Math.exp(-1.5*time/seconds);
      const blend=1-Math.exp(-2*Math.PI*cutoff/ctx.sampleRate);
      first+=blend*(random()*2-1-first);second+=blend*(first-second);
      if(time>predelay) data[i]=second*.055*Math.exp(-6.9*(time-predelay)/seconds)*Math.min(1,(time-predelay)/.035);
    }
    for (const [delay,level] of [[.013,.7],[.023,.5],[.037,.34],[.053,.22],[.079,.14]]) {
      data[Math.round((delay+channel*.003)*ctx.sampleRate)]+=level;
    }
  }
  return buffer;
}

// A fractional-delay Karplus–Strong string: the pluck excites a resonating
// string, rather than applying the same envelope to a few sine waves.
export function pluckedStringSamples(freq, sampleRate, seconds, voice, random) {
  const delay = sampleRate / freq - .5;
  const size = Math.ceil(delay) + 2;
  const ring = new Float32Array(size);
  const excitation = Float32Array.from({ length: size }, () => random() * 2 - 1);
  const position = voice === 'oud' ? .16 : .3;
  const pick = Math.max(1, Math.round(size * position)), phase = random();
  for (let i = 0; i < size; i++) {
    const x = (i / size + phase) % 1;
    const displacement = x < position ? x / position : (1-x)/(1-position);
    // A displaced string supplies a clear fundamental; a little pick noise
    // retains the attack without letting a noise spike dominate its level.
    ring[i] = (displacement-.5)*1.2 + (excitation[i]-excitation[(i+pick)%size])*.07;
  }
  const mean = ring.reduce((sum,v) => sum+v,0)/size;
  for (let i = 0; i < size; i++) ring[i] -= mean;
  const decay = voice === 'oud' ? .6 : voice === 'harp' ? 1.15 : .95;
  const damping = Math.exp(-6.9 / (freq * decay));
  const result = new Float32Array(Math.ceil(sampleRate * seconds));
  let write = 0, previous = 0;
  for (let i = 0; i < result.length; i++) {
    const read = (write-delay+size)%size, lo = Math.floor(read), fraction = read-lo;
    const value = ring[lo]*(1-fraction)+ring[(lo+1)%size]*fraction;
    ring[write] = (value+previous)*.5*damping;previous = value;
    result[i] = value;write = (write+1)%size;
  }
  // Smooth the pick attack and the buffer's final samples.
  const attack = Math.round(.002 * sampleRate), release = Math.round(.04 * sampleRate);
  for (let i = 0; i < result.length; i++) result[i] *= Math.min(1,i/attack,(result.length-1-i)/release);
  return result;
}

function envelope(ctx,dest,time,duration,level,attack=.005,sustain=false) {
  const gain=ctx.createGain(),a=Math.min(attack,duration/4);
  gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(level,time+a);
  if(sustain) {
    gain.gain.linearRampToValueAtTime(level*.85,time+duration*.65);
    gain.gain.linearRampToValueAtTime(0,time+duration);
  } else {
    gain.gain.exponentialRampToValueAtTime(.00001,time+duration);
    gain.gain.linearRampToValueAtTime(0,time+duration+.01);
  }
  gain.connect(dest);return gain;
}

function oscillator(ctx,dest,time,duration,freq,type='sine',detune=0) {
  const osc=ctx.createOscillator();osc.type=type;osc.frequency.value=freq;osc.detune.value=detune;
  osc.connect(dest);osc.start(time);osc.stop(time+duration+.02);return osc;
}

function noiseNote(ctx,dest,time,duration,level,noise,random,frequency=2500,type='bandpass',q=.7) {
  const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter();
  source.buffer=noise;source.loop=true;filter.type=type;filter.frequency.value=frequency;filter.Q.value=q;
  const gain=envelope(ctx,dest,time,duration,level,.003);
  source.connect(filter).connect(gain);source.start(time,random()*.4);source.stop(time+duration+.02);
}

function stringNote(ctx,dest,time,duration,freq,voice,velocity,random) {
  const seconds=Math.max(.7,Math.min(2.7,duration*2.4));
  const samples=pluckedStringSamples(freq,ctx.sampleRate,seconds,voice,random);
  const buffer=ctx.createBuffer(1,samples.length,ctx.sampleRate);buffer.copyToChannel(samples,0);
  const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
  source.buffer=buffer;filter.type='lowpass';filter.frequency.value=voice==='oud'?3200:voice==='harp'?4500:9000;
  gain.gain.value=velocity*(voice==='harp'?.8:1.1);
  source.playbackRate.setValueAtTime(voice==='koto'?1.025:1.006,time);
  source.playbackRate.exponentialRampToValueAtTime(1,time+.055);
  source.connect(filter).connect(gain).connect(dest);source.start(time);source.stop(time+seconds+.05);
}

function fmNote(ctx,dest,time,duration,freq,voice,velocity) {
  const metallic=voice==='star';
  const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=metallic?12000:950;filter.connect(dest);
  const gain=envelope(ctx,filter,time,duration,velocity*(metallic?.18:.22),metallic?.012:.035);
  let carrierOutput=gain;
  if(!metallic) {
    // Tremolo multiplies the note envelope; adding it to the envelope's own
    // gain would leave a nonzero signal when the oscillator stops.
    const amplitude=ctx.createGain(),tremolo=ctx.createOscillator(),depth=ctx.createGain();
    amplitude.gain.value=.9;amplitude.connect(gain);
    tremolo.frequency.value=.8;depth.gain.value=.1;tremolo.connect(depth).connect(amplitude.gain);
    tremolo.start(time);tremolo.stop(time+duration+.02);carrierOutput=amplitude;
  }
  const carrier=oscillator(ctx,carrierOutput,time,duration,freq);
  const index=ctx.createGain();index.gain.setValueAtTime(freq*(metallic?2.8:1.2),time);
  index.gain.exponentialRampToValueAtTime(freq*.035,time+duration*.8);
  oscillator(ctx,index,time,duration,freq*(metallic?1.414:2));
  index.connect(carrier.frequency);
}

function fluteNote(ctx,dest,time,duration,freq,velocity,noise,random) {
  const gain=envelope(ctx,dest,time,duration,velocity*.2,.055,true);
  const fundamental=oscillator(ctx,gain,time,duration,freq);
  fundamental.frequency.setValueAtTime(freq*.985,time);fundamental.frequency.exponentialRampToValueAtTime(freq,time+.07);
  const harmonic=ctx.createGain();harmonic.gain.value=.2;harmonic.connect(gain);
  oscillator(ctx,harmonic,time,duration,freq*2);
  const vibrato=ctx.createOscillator(),depth=ctx.createGain();vibrato.frequency.value=5.1;
  depth.gain.setValueAtTime(0,time);depth.gain.linearRampToValueAtTime(freq*.004,time+Math.min(.3,duration*.5));
  vibrato.connect(depth).connect(fundamental.frequency);vibrato.start(time);vibrato.stop(time+duration+.02);
  noiseNote(ctx,dest,time,duration,velocity*.014,noise,random,2600,'bandpass',.5);
}

function analogNote(ctx,dest,time,duration,freq,voice,velocity) {
  const bass=voice==='synthbass',filter=ctx.createBiquadFilter();filter.type='lowpass';filter.Q.value=bass?1.6:2.5;
  filter.frequency.setValueAtTime(bass?1600:6500,time);
  filter.frequency.exponentialRampToValueAtTime(bass?180:650,time+duration*.9);
  const gain=envelope(ctx,dest,time,duration,velocity*(bass?.22:.13),.003);
  filter.connect(gain);
  oscillator(ctx,filter,time,duration,freq,bass?'triangle':'sawtooth',-3);
  oscillator(ctx,filter,time,duration,freq,bass?'sine':'sawtooth',3);
}

function padNote(ctx,dest,time,duration,freq,voice,velocity) {
  const space=voice==='nebula',filter=ctx.createBiquadFilter();filter.type='lowpass';
  filter.frequency.setValueAtTime(space?2100:420,time);
  filter.frequency.linearRampToValueAtTime(space?4200:700,time+duration*.55);filter.connect(dest);
  const gain=envelope(ctx,filter,time,duration,velocity*(space?.065:.15),space?.7:.45,true);
  for(const detune of space?[-9,0,9]:[-3,3]) oscillator(ctx,gain,time,duration,freq,space?'sawtooth':'sine',detune);
}

function struckNote(ctx,dest,time,duration,freq,voice,velocity) {
  const wood=voice==='wood',felt=voice==='felt';
  const partials=wood?[[1,1,1],[3.99,.28,.23],[9.98,.04,.08]]
    :felt?[[1,1,1],[2,.2,.4],[3,.06,.15]]
      :[[1,1,1],[2.76,.45,.42],[5.4,.15,.22],[8.93,.07,.12]];
  for(const [ratio,level,decay] of partials) {
    const d=(wood?Math.max(.5,duration*1.7):duration)*decay;
    const gain=envelope(ctx,dest,time,d,velocity*level*(felt?.16:wood?.32:.18),.002);
    oscillator(ctx,gain,time,d,freq*ratio);
  }
}

function percussion(ctx,dest,time,duration,freq,voice,velocity,noise,random) {
  if(voice==='hat'||voice==='shaker') {
    noiseNote(ctx,dest,time,duration,velocity*.18,noise,random,voice==='hat'?7000:4800,'highpass');
  } else if(voice==='clap') {
    for(const offset of [0,.012,.024]) noiseNote(ctx,dest,time+offset,duration*.65,velocity*.14,noise,random,1900,'bandpass',.8);
  } else if(voice==='tek'||voice==='woodblock') {
    const wood=voice==='woodblock',gain=envelope(ctx,dest,time,duration,velocity*(wood?.13:.15),.002);
    oscillator(ctx,gain,time,duration,wood?freq*1.6:760,'sine');
    if(!wood)noiseNote(ctx,dest,time,duration*.5,velocity*.1,noise,random,2200,'bandpass',1.2);
  } else {
    const gain=envelope(ctx,dest,time,duration,velocity*.45,.003),osc=ctx.createOscillator();
    osc.type=voice==='doum'?'triangle':'sine';
    osc.frequency.setValueAtTime(voice==='doum'?170:150,time);
    osc.frequency.exponentialRampToValueAtTime(voice==='doum'?75:43,time+.09);
    osc.connect(gain);osc.start(time);osc.stop(time+duration+.02);
  }
}

export function scheduleInstrument(ctx,dest,event,beatSeconds,noise,random) {
  const time=event.beat*beatSeconds,duration=event.duration*beatSeconds,freq=noteFrequency(event.note);
  const pan=ctx.createStereoPanner();pan.pan.value=event.pan;pan.connect(dest);
  const {voice,velocity}=event;
  if(['koto','oud','harp'].includes(voice))stringNote(ctx,pan,time,duration,freq,voice,velocity,random);
  else if(voice==='water'||voice==='star')fmNote(ctx,pan,time,duration,freq,voice,velocity);
  else if(voice==='flute')fluteNote(ctx,pan,time,duration,freq,velocity,noise,random);
  else if(voice==='synth'||voice==='synthbass')analogNote(ctx,pan,time,duration,freq,voice,velocity);
  else if(voice==='nebula'||voice==='tide')padNote(ctx,pan,time,duration,freq,voice,velocity);
  else if(['wood','celesta','felt'].includes(voice))struckNote(ctx,pan,time,duration,freq,voice,velocity);
  else if(voice==='sub')oscillator(ctx,envelope(ctx,pan,time,duration,velocity*.15,.12,true),time,duration,freq);
  else if(['kick','clap','hat','doum','tek','shaker','woodblock'].includes(voice))percussion(ctx,pan,time,duration,freq,voice,velocity,noise,random);
  else if(voice==='bubble'||voice==='bird') {
    const bird=voice==='bird',gain=envelope(ctx,pan,time,duration,velocity*(bird?.14:.16),.004),osc=ctx.createOscillator();
    osc.frequency.setValueAtTime(freq*(bird?.8:.35),time);
    osc.frequency.exponentialRampToValueAtTime(freq*(bird?1.15:1.5),time+duration*.45);
    osc.frequency.exponentialRampToValueAtTime(freq*(bird?.9:1.05),time+duration);
    osc.connect(gain);osc.start(time);osc.stop(time+duration+.02);
  } else if(voice==='shimmer')noiseNote(ctx,pan,time,duration,velocity*.09,noise,random,6500,'bandpass',.4);
  else throw new RangeError('Unknown voice: '+voice);
}
