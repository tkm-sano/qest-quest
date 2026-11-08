// Original miniature soundtracks for the eight worlds. Distinct arrangements share an eight-bar
// harmonic clock so changing a probability changes the arrangement, not the beat.
export const BPM = 96;
export const MUSIC_VERSION = 3;
export const BEAT_SECONDS = 60 / BPM;
export const LOOP_BEATS = 32;
export const LOOP_SECONDS = LOOP_BEATS * BEAT_SECONDS;

export const SCENE_MUSIC = [
  { bits: '000', title: '桜の小径', titleEn: 'Petal Walk', instrument: '和風のハープ・弦の掛け合い', instrumentEn: 'Acoustic harp duet', voice: 'koto' },
  { bits: '001', title: '深海のゆりかご', titleEn: 'Deep Sea Lullaby', instrument: '低い海中アンビエント・泡', instrumentEn: 'Deep underwater ambient / bubbles', voice: 'water' },
  { bits: '010', title: '風の階段', titleEn: 'Stairway of Wind', instrument: 'フルートとハープ', instrumentEn: 'Recorded flute / harp', voice: 'flute' },
  { bits: '011', title: 'ネオンの交差点', titleEn: 'Neon Crossroads', instrument: '四つ打ち・ピアノと生ドラム', instrumentEn: 'Four-on-the-floor / piano and acoustic drums', voice: 'synth' },
  { bits: '100', title: '星の軌道', titleEn: 'Stellar Orbits', instrument: 'ビブラフォン・ガラスの余韻', instrumentEn: 'Vibraphone / resonating glass', voice: 'star' },
  { bits: '101', title: '砂丘のキャラバン', titleEn: 'Dune Caravan', instrument: 'アコースティック弦・ハンドドラム', instrumentEn: 'Acoustic strings / hand drums', voice: 'oud' },
  { bits: '110', title: '木漏れ日のこだま', titleEn: 'Woodland Echoes', instrument: 'マリンバ・木の打楽器・小鳥', instrumentEn: 'Marimba / wooden percussion / birds', voice: 'wood' },
  { bits: '111', title: '雪明かり', titleEn: 'Snowlight', instrument: 'グロッケン・静かなピアノ', instrumentEn: 'Glockenspiel / quiet piano', voice: 'celesta' },
];
const FILES = ['000-cherry','001-underwater','010-sky','011-future','100-space','101-desert','110-forest','111-snow'];
SCENE_MUSIC.forEach((scene, index) => { scene.asset = FILES[index]; });

// Short, repeated hooks have a recognizable rhythmic identity from the start.
// Each tuple is [beat in bar, note, held beats, optional accent].
const PHRASES = [
  [
    [[0,'E5',.8],[1,'G5',.45],[1.5,'A5',.9],[2.5,'G5',.45],[3,'E5',.8]],
    [[0,'D5',.6],[.75,'E5',.45],[1.5,'G5',.8],[2.5,'E5',.5],[3.25,'C5',.7]],
    [[0,'C5',.8],[1,'E5',.45],[1.5,'G5',.9],[2.5,'E5',.45],[3,'C5',.8]],
    [[0,'D5',.6],[.75,'C5',.5],[1.5,'A4',1],[3,'G4',.8]],
  ], [
    [[.25,'G3',2.8],[3,'D4',2]], [[1,'C4',3],[3.5,'G3',2]],
    [[.25,'E3',3.5],[3,'G3',2]], [[1.5,'A3',3.5]],
  ], [
    [[0,'G4',.45],[.5,'C5',.45],[1,'E5',.8],[2,'G5',.5],[2.75,'A5',.9]],
    [[0,'G5',.8],[1,'E5',.5],[1.75,'D5',.6],[2.5,'C5',1.2]],
    [[0,'E5',.45],[.5,'G5',.45],[1,'A5',.8],[2,'G5',.5],[2.75,'E5',.9]],
    [[0,'D5',.8],[1,'C5',.5],[1.75,'A4',.6],[2.5,'G4',1.1]],
  ], [
    [[0,'C5',.18],[.5,'G4',.18],[.75,'C5',.18],[1.5,'E5',.22],[2,'G4',.18],[2.75,'D5',.18],[3.25,'C5',.22],[3.75,'G4',.15]],
    [[.25,'C5',.18],[.75,'G4',.18],[1.25,'E5',.18],[1.75,'G4',.18],[2.5,'D5',.2],[3,'E5',.2],[3.5,'G4',.25]],
    [[0,'A4',.18],[.5,'E4',.18],[.75,'A4',.18],[1.5,'C5',.22],[2,'E4',.18],[2.75,'G4',.18],[3.25,'A4',.22],[3.75,'E4',.15]],
    [[.25,'A4',.18],[.75,'E4',.18],[1.25,'C5',.18],[1.75,'E4',.18],[2.5,'G4',.2],[3,'C5',.2],[3.5,'E4',.25]],
  ], [
    [[0,'C5',4.8],[3,'G5',3.5]], [[1.5,'E6',4.2]],
    [[.5,'A5',4.8],[3.25,'E6',3.5]], [[2,'G5',4.5]],
  ], [
    [[0,'C4',.55],[.75,'G4',.35],[1.5,'E4',.55],[2.5,'D4',.4],[3.25,'C4',.65]],
    [[0,'G3',.5],[.75,'C4',.35],[1.5,'D4',.55],[2.5,'E4',.4],[3.25,'G4',.65]],
    [[0,'A3',.55],[.75,'E4',.35],[1.5,'C4',.55],[2.5,'A3',.4],[3.25,'G3',.65]],
    [[0,'A3',.5],[.75,'C4',.35],[1.5,'E4',.55],[2.5,'G4',.4],[3.25,'E4',.65]],
  ], [
    [[0,'C5',.35],[.75,'E5',.3],[1.25,'G5',.35],[2,'E5',.3],[2.75,'D5',.3],[3.5,'C5',.4]],
    [[0,'G4',.4],[.75,'C5',.3],[1.25,'D5',.3],[2,'E5',.4],[2.75,'G5',.3],[3.5,'E5',.35]],
    [[0,'A4',.35],[.75,'C5',.3],[1.25,'E5',.35],[2,'G5',.3],[2.75,'E5',.3],[3.5,'C5',.4]],
    [[0,'E5',.4],[.75,'C5',.3],[1.25,'A4',.3],[2,'G4',.4],[2.75,'A4',.3],[3.5,'C5',.35]],
  ], [
    [[0,'C6',1.6],[1,'E6',1.3],[2.5,'G6',1.4]],
    [[.5,'E6',1.5],[2,'D6',1.1],[3,'C6',1.5]],
    [[0,'A5',1.6],[1,'C6',1.3],[2.5,'E6',1.4]],
    [[.5,'G6',1.5],[2,'E6',1.1],[3,'C6',1.5]],
  ],
];

export const HARMONY_NAMES = ['Cadd9','Cadd9','Am7','Am7','Fmaj9','Fmaj9','Gsus2','Gsus2'];
const CHORDS = [
  ['C3','E3','G3','D4'], ['C3','E3','G3','D4'], ['A2','C3','E3','G3'], ['A2','C3','E3','G3'],
  ['F3','A3','C4','E4','G4'], ['F3','A3','C4','E4','G4'], ['G2','A3','D4'], ['G2','A3','D4'],
];
const ROOTS = ['C2','C2','A1','A1','F2','F2','G1','G1'];
const octave = (note, shift) => note.slice(0,-1) + (Number(note.slice(-1)) + shift);

// There is deliberately no common pad-and-bass backing across all eight songs.
// Register, articulation, rhythm and accompaniment belong to the scene.
export function createSceneScore(index) {
  if (!SCENE_MUSIC[index]) throw new RangeError('Unknown music scene');
  const events = [];
  const add = (beat, note, voice, duration = 1, velocity = 1, pan = 0, role = 'accompaniment') =>
    events.push({ beat, note, voice, duration, velocity, pan, role });
  for (let bar = 0; bar < 8; bar++) {
    const start = bar * 4, chord = CHORDS[bar];
    const phrase = PHRASES[index][bar % 4];
    for (const [beat,note,duration,accent] of phrase) {
      add(start + beat, note, SCENE_MUSIC[index].voice, duration, accent ?? (beat === 0 ? .95 : .8),
        index === 4 ? (bar % 2 ? -.45 : .45) : Math.sin(bar + beat) * .18, 'melody');
    }
    if (index === 0) {
      // Answer the high koto hook with low, dry plucked dyads, not a drone.
      for (const [beat, note] of [[0,chord[0]],[.5,chord[2]],[2,chord[1]],[3,chord[2]]])
        add(start + beat, note, 'harp', 1.2, .36, -.35);
      if (bar % 2) add(start + 3.5, 'C5', 'woodblock', .18, .12, .3, 'rhythm');
    } else if (index === 1) {
      chord.slice(0,3).forEach((note,i) => add(start, note, 'tide', 4.7, .36, (i-1)*.5));
      if (bar % 2 === 0) add(start, ROOTS[bar], 'sub', 5, .32);
      add(start + .6, bar % 2 ? 'G5' : 'C5', 'bubble', .6, .42, -.6, 'texture');
      add(start + 2.9, bar % 2 ? 'C6' : 'E5', 'bubble', .45, .3, .6, 'texture');
    } else if (index === 2) {
      // Triplet harp movement under a legato, breathy lead.
      for (let step = 0; step < 6; step++)
        add(start + step * 2/3, octave(chord[step % 3],1), 'harp', 1.1, .23, step % 2 ? -.4 : .4);
    } else if (index === 3) {
      for (let beat = 0; beat < 4; beat++) add(start + beat, 'C2', 'kick', .42, .85, 0, 'rhythm');
      for (const beat of [1,3]) add(start + beat, 'C5', 'clap', .24, .62, -.1, 'rhythm');
      for (let step = 0; step < 8; step++) add(start + step/2, 'C6', 'hat', .12, step % 2 ? .42 : .16, .25, 'rhythm');
      for (const [i,beat] of [0,.75,1.5,2,2.75,3.5].entries())
        add(start + beat, octave(ROOTS[bar],i % 3 === 2 ? 1 : 0), 'synthbass', .32, .65);
    } else if (index === 4) {
      chord.forEach((note,i) => add(start, octave(note,1), 'nebula', 5.2, .3, (i/(chord.length-1)-.5)*1.4));
      if (bar % 2 === 0) add(start, ROOTS[bar], 'sub', 5.5, .2);
      add(start + 1, 'G6', 'shimmer', 2.6, .12, bar % 2 ? -.6 : .6, 'texture');
    } else if (index === 5) {
      for (const beat of [0,1.75]) add(start + beat, 'G2', 'doum', .52, .8, -.15, 'rhythm');
      for (const beat of [1,2.5,3.25]) add(start + beat, 'D4', 'tek', .22, .62, .18, 'rhythm');
      for (let step = 0; step < 8; step++) add(start + step/2, 'C6', 'shaker', .16, [0,3,6].includes(step) ? .45 : .2, .5, 'rhythm');
      add(start, octave(ROOTS[bar],1), 'oud', 1.1, .42, -.4);
    } else if (index === 6) {
      add(start, octave(chord[0],1), 'wood', .8, .38, -.4);
      add(start + 2, octave(chord[2],1), 'wood', .8, .32, -.4);
      for (const beat of [.5,1.75,2.5,3.75]) add(start + beat, beat < 2 ? 'G4' : 'C5', 'woodblock', .22, .38, .4, 'rhythm');
      if (bar % 2 === 0) add(start + 1.5, bar % 4 ? 'E6' : 'G6', 'bird', .65, .26, -.65, 'texture');
    } else {
      // A high, clockwork music box with occasional quiet felt-piano dyads.
      if (bar % 2 === 0) {
        add(start, octave(chord[0],1), 'felt', 3.5, .3, -.3);
        add(start + .05, octave(chord[2],1), 'felt', 3.5, .24, .3);
      }
    }
  }
  return events.sort((a,b) => a.beat - b.beat);
}
