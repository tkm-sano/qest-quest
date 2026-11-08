import { SceneMusicEngine } from '../audio/engine.js';
import { SCENE_MUSIC } from '../audio/score.js';
import { imageName } from './image-scenes.js';
import { localized, t } from '../i18n.js';

export function createMusicControls(root) {
  const engine = new SceneMusicEngine({ onChange: render });
  const play = root.querySelector('[data-music=play]');
  const mute = root.querySelector('[data-music=mute]');
  const volume = root.querySelector('[data-music=volume]');
  const status = root.querySelector('[data-music=status]');
  const tracks = root.querySelector('[data-music=tracks]');
  const library = root.querySelector('dialog');
  const follow = root.querySelector('[data-music=follow]');
  let probs = Float64Array.of(1,0,0,0,0,0,0,0), measured = null, advanced = false;
  let preview = null, loading = false, progress = 0, error = false;
  let previousKey = '';

  function syncMix() {
    engine.setActive(!advanced && !document.hidden);
    engine.setMix(probs, preview ?? measured);
  }

  function render() {
    root.dataset.audioState = loading ? 'loading' : error ? 'error' : engine.playing && engine.ctx?.state === 'running' ? 'playing' : 'paused';
    play.textContent = t(loading ? 'musicPreparing' : engine.playing && engine.ctx?.state === 'running' ? 'musicPause' : error ? 'musicRetry' : engine.buffers ? 'musicResume' : 'musicStart');
    play.disabled = loading;play.setAttribute('aria-pressed', String(engine.playing && engine.ctx?.state === 'running'));
    mute.textContent = t(engine.muted ? 'musicUnmute' : 'musicMute');
    mute.setAttribute('aria-pressed', String(engine.muted));
    volume.setAttribute('aria-label', t('musicVolume'));
    root.querySelector('[data-music=summary]').textContent = t('musicAudition');
    root.querySelector('[data-music=help]').textContent = t('musicHelp');
    follow.textContent = t('musicFollow');follow.hidden = preview === null;
    if (loading) status.textContent = t('musicProgress').replace('{count}', progress);
    else if (error) status.textContent = t('musicError');
    else if (!engine.playing) status.textContent = t(engine.buffers ? 'musicPaused' : 'musicIdle');
    else if (engine.muted || engine.volume === 0) status.textContent = t('musicMuted');
    else if (preview !== null) status.textContent = t('musicPreviewing') + localized(SCENE_MUSIC[preview], 'title');
    else {
      const active = measured === null ? [...probs].flatMap((p,i) => p > 1e-6 ? [i] : []) : [measured];
      status.textContent = active.length === 1 ? '♪ ' + localized(SCENE_MUSIC[active[0]], 'title')
        : t('musicMixing').replace('{count}', active.length);
    }
    status.title = status.textContent;
    tracks.innerHTML = SCENE_MUSIC.map((scene, index) => `<button type="button" data-track="${index}" aria-pressed="${preview === index}" ${loading ? 'disabled' : ''}><span>${scene.bits} ${imageName(index)}</span><strong>${localized(scene, 'title')}</strong><small>${localized(scene, 'instrument')}</small></button>`).join('');
  }

  async function start() {
    loading = true;error = false;progress = 0;render();
    try { await engine.play(count => { progress = count;render(); }); }
    catch { error = true; }
    finally { loading = false;syncMix();render(); }
  }

  play.addEventListener('click', async () => {
    if (loading) return;
    if (engine.playing && engine.ctx?.state === 'running') {
      try { await engine.pause(); } catch { error = true; }render();
    } else await start();
  });
  mute.addEventListener('click', () => { engine.setMuted(!engine.muted);render(); });
  volume.addEventListener('input', () => { engine.setVolume(Number(volume.value) / 100);render(); });
  tracks.addEventListener('click', async event => {
    const button = event.target.closest('[data-track]');
    if (!button || loading) return;
    preview = Number(button.dataset.track);syncMix();render();
    if (!engine.playing || engine.ctx?.state !== 'running') await start();
  });
  function followCircuit() { preview = null;syncMix();render(); }
  follow.addEventListener('click', followCircuit);
  root.querySelector('[data-music=library]').addEventListener('click', () => library.showModal());
  root.querySelector('[data-music=close]').addEventListener('click', () => library.close());
  document.addEventListener('visibilitychange', () => { syncMix();render(); });
  render();
  return {
    renderLanguage: render,
    followCircuit,
    update({ probabilities, outcome = null, isAdvanced = false }) {
      const key = JSON.stringify([probabilities && [...probabilities], outcome, isAdvanced]);
      if (key !== previousKey) preview = null;
      previousKey = key;
      probs = probabilities ?? probs;measured = outcome;advanced = isAdvanced;
      if (advanced && library.open) library.close();
      syncMix();render();
    },
  };
}
