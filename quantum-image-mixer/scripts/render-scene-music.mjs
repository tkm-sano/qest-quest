// Development exporter: Node 18+, the ws package, Chrome, Python 3, libsndfile.
// Runtime playback needs none of these tools. Run from any directory.
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { resolve, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { SCENE_MUSIC, BPM, LOOP_SECONDS, HARMONY_NAMES, MUSIC_VERSION } from '../js/audio/score.js';
const WebSocket = createRequire(import.meta.url)('ws');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'assets/music');
const temporary = await mkdtemp(resolve(tmpdir(), 'quantum-music-'));
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    if (pathname === '/') { response.end('<!doctype html><title>Rendering scene music</title>');return; }
    const path = resolve(root, '.' + decodeURIComponent(pathname));
    if (!path.startsWith(root + sep)) { response.writeHead(403).end();return; }
    const file = await readFile(path);
    response.setHeader('Content-Type', path.endsWith('.js') ? 'text/javascript' : 'application/octet-stream');response.end(file);
  } catch { response.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const address = `http://127.0.0.1:${server.address().port}`;
const chrome = spawn(process.env.SCENE_MUSIC_CHROME || '/usr/bin/google-chrome', [
  '--headless','--no-sandbox','--disable-gpu','--remote-allow-origins=*',
  '--remote-debugging-port=0','--user-data-dir=' + temporary,address,
], { stdio: 'ignore' });
let socket;
try {
  let port;
  for (let i = 0; i < 200; i++) {
    try { port = Number((await readFile(resolve(temporary, 'DevToolsActivePort'), 'utf8')).split('\n')[0]);break; }
    catch { await pause(100); }
  }
  if (!port) throw new Error('Chrome did not start');
  const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const page = pages.find(page => page.type === 'page');
  socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.on('open', resolve);socket.on('error', reject); });
  let id = 0;const pending = new Map();
  socket.on('message', bytes => { const result = JSON.parse(bytes);if (pending.has(result.id)) { pending.get(result.id)(result);pending.delete(result.id); } });
  const evaluate = async expression => {
    const result = await new Promise(resolve => {
      const current = ++id;pending.set(current, resolve);
      socket.send(JSON.stringify({ id: current, method: 'Runtime.evaluate', params: { expression, awaitPromise: true, returnByValue: true } }));
    });
    if (result.error || result.result.exceptionDetails) throw new Error(JSON.stringify(result.error || result.result.exceptionDetails));
    return result.result.result.value;
  };
  await mkdir(output, { recursive: true });
  for (const [index, scene] of SCENE_MUSIC.entries()) {
    const rendered = await evaluate(`(async()=>{
      const {renderSceneSong}=await import('/js/audio/songs.js');const b=await renderSceneSong(${index},44100);
      const samples=new Float32Array(b.length*2),left=b.getChannelData(0),right=b.getChannelData(1);
      for(let i=0;i<b.length;i++){samples[i*2]=left[i];samples[i*2+1]=right[i]}
      const data=await new Promise(resolve=>{const r=new FileReader();r.onload=()=>resolve(r.result.split(',')[1]);r.readAsDataURL(new Blob([samples.buffer]))});
      return{sampleRate:b.sampleRate,data};
    })()`);
    const raw = resolve(temporary, scene.asset + '.f32');
    await writeFile(raw, Buffer.from(rendered.data, 'base64'));
    const encoded = spawnSync('python3', [resolve(root, 'scripts/encode-scene-music.py'), raw, resolve(output, scene.asset + '.ogg'), String(rendered.sampleRate)], { encoding: 'utf8' });
    if (encoded.status !== 0) throw new Error(encoded.stderr);
    console.log(`${index + 1}/8 ${scene.asset}.ogg — ${scene.title}`);
  }
  await writeFile(resolve(output, 'music.json'), JSON.stringify({
    description: 'Original compositions for Quantum Image Mixer rendered with recorded instruments',
    version: MUSIC_VERSION, bpm: BPM, loopSeconds: LOOP_SECONDS, bars: 8, progression: HARMONY_NAMES,
    source: '../../js/audio/score.js', tracks: SCENE_MUSIC,
    instrumentBank: '../instruments/manifest.json',
  }, null, 2) + '\n');
} finally {
  socket?.close();chrome.kill('SIGTERM');server.close();
  // Chrome may still be finishing its profile writes after SIGTERM.
  await new Promise(resolve => { if (chrome.exitCode !== null) resolve();else chrome.once('exit', resolve); });
  await rm(temporary, { recursive: true, force: true });
}
