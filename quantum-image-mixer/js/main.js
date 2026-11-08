// エントリポイント: 全モジュールの結線とアプリの状態遷移。
import { probabilities, phases as getPhases, measure, measureQubit } from './quantum/state.js';
import { createCircuit, evaluate, clearCircuit, usedGateCounts, loadCircuitRecipe } from './quantum/circuit.js';
import { createPalette } from './ui/palette.js';
import { createBoard } from './ui/board.js';
import { createMeter } from './ui/floor.js';
import { phaseDisplay } from './ui/phase-display.js';
import { createFloor } from './ui/image-floor.js';
import { loadSavedImageSet, saveImageSet } from './ui/image-scenes.js';
import { renderQubitMeasurement, measurementLabel } from './ui/qubit-measurement.js';
import { createAdvancedView } from './ui/advanced-view.js';
import { phaseEstimationRecipe, periodFindingRecipe, advancedCircuitSections, ADVANCED_COLS, preparationColumns } from './quantum/advanced.js';
import { qaoaRecipe } from './quantum/qaoa.js';
import { vqeRecipe } from './quantum/vqe.js';
import { chshRecipe } from './quantum/chsh.js';
import { teleportRecipe, teleportCorrectionRecipe, correctTeleportState } from './quantum/teleportation.js';
import { setPartyFromProbs, setParty, strobe, showAnnounce, hideAnnounce } from './ui/fx.js';
import { createCourses } from './courses/courses.js';
import { applyStaticTranslations, setLanguage, t } from './i18n.js';

const $ = (sel) => document.querySelector(sel);

const circuit = createCircuit();

// 回路が準備する観測前の状態。段階測定中の表示には partialMeasurement.state を使う。
// 達成判定には、観測前の確率と個別の測定履歴を渡す。
let currentState = evaluate(circuit);
let currentProbs = probabilities(currentState);
let currentPhases = getPhases(currentState);
let measured = null; // 観測で確定した画像 index(未観測なら null)
let busy = false;    // ルーレット演出中
let partialMeasurement = null; // { state: 条件付き状態, results: [{ row, value }] }
let individualMode = true;
let advancedExample = null;
let advancedStep = 'output';

const boothEl = $('#booth');
const floorAreaEl = $('#floor-area');
const announceEl = $('#announce');
const measureBtn = $('#measure-btn');
const releaseBtn = $('#release-btn');

const palette = createPalette($('#palette'));
const meter = createMeter($('#meter'));
const floor = createFloor($('#floor-canvas'));
const advancedView = createAdvancedView($('#advanced-stage'), $('#advanced-meter'));
const imageSetSelect = $('#image-set-select');
const imagePhaseRotation = $('#image-phase-rotation');
let activeImageSet = loadSavedImageSet();
imageSetSelect.value = activeImageSet;

async function changeImageSet(id) {
  try {
    if (!await floor.setImageSet(id)) return;
    activeImageSet = id;
    saveImageSet(id);
  } catch (error) {
    imageSetSelect.value = activeImageSet;
    console.error(error);
  }
}

imageSetSelect.addEventListener('change', () => changeImageSet(imageSetSelect.value));
imagePhaseRotation.addEventListener('change', () => syncMeasurementUI());

const courses = createCourses($('#course-panel'), {
  isBusy: () => busy,
  onPhaseDisplayChange: () => syncMeasurementUI(),
  onLessonSelect(step) {
    advancedExample = null;
    loadCircuitRecipe(circuit, step.initialGates);
    board.render();
    releaseMeasurement();
  },
  onModeChange() {
    advancedExample = null;
    clearCircuit(circuit);
    board.render();
    if (measured !== null || partialMeasurement) releaseMeasurement();
    else recompute();
  },
  onAdvancedExample(example) {
    advancedExample = example;
    advancedStep = 'output';
    loadCircuitRecipe(circuit, example.kind === 'phase' ? phaseEstimationRecipe(example.turns)
      : example.kind === 'qaoa' ? qaoaRecipe(example) : example.kind === 'vqe' ? vqeRecipe(example.theta)
      : example.kind === 'teleport' ? teleportRecipe(example.input) : example.kind === 'chsh' ? chshRecipe(example) : periodFindingRecipe(example));
    board.render();
    releaseMeasurement();
  },
  onTeleportAction: handleTeleportAction,
  onAllowedChange() {
    palette.setAllowed(courses.getAllowedGates());
    syncTabs();
    pruneDisallowedGates();
    if (partialMeasurement && !getMeasurementPlan()) releaseMeasurement();
    else syncMeasurementUI();
  },
});

$('#language-select').addEventListener('change', (event) => {
  setLanguage(event.target.value);
  applyStaticTranslations();
  palette.render();
  board.render();
  meter.renderLanguage();
  floor.renderLanguage();
  advancedView.renderLanguage();
  courses.render();
  if (measured !== null && courses.getMode() !== 'advanced') showAnnounce(announceEl, measured);
  syncMeasurementUI();
});

const board = createBoard($('#board'), palette, $('#drag-ghost'), circuit, {
  onChange: onCircuitChange,
  isLocked: () => busy || measured !== null || partialMeasurement !== null,
  preparationColumns: () => preparationColumns(advancedExample),
  circuitSections: () => advancedExample ? { ranges: advancedCircuitSections(advancedExample), edited: Boolean(advancedExample.edited) } : null,
});

function buildCtx() {
  return {
    probs: currentProbs, phases: currentPhases, counts: usedGateCounts(circuit), measured,
    sig: JSON.stringify(circuit),
    partialResults: partialMeasurement?.results ?? [],
    teleport: advancedExample?.kind === 'teleport' ? { ready: [2,3].every(row => partialMeasurement?.results.some(r => r.row === row)), sent: advancedExample.sent, corrected: advancedExample.corrected, edited: advancedExample.edited } : null,
    chshEdited: advancedExample?.kind === 'chsh' && Boolean(advancedExample.edited),
  };
}

function recompute() {
  currentState = evaluate(circuit);
  currentProbs = probabilities(currentState);
  currentPhases = getPhases(currentState);
  setPartyFromProbs(currentProbs);
  courses.update(buildCtx());
  syncMeasurementUI();
}

function getMeasurementPlan() {
  if (advancedExample?.kind === 'chsh' && !advancedExample.edited && individualMode) return { rows: [3,4], requiredRows: [3,4], ready: () => true, kind: 'chsh' };
  if (advancedExample?.kind === 'teleport' && !advancedExample.edited) return { rows: [2,3], requiredRows: [2,3], ready: () => true, kind: 'teleport' };
  const lessonPlan = courses.getMeasurementPlan();
  if (lessonPlan) return { ...lessonPlan, rows: [0, 1, 2], requiredRows: lessonPlan.rows, kind: 'entanglement' };
  if (courses.getMode() === 'advanced' && individualMode) {
    const rows = Array.from({ length: circuit.length }, (_, row) => row);
    return { rows, requiredRows: rows, ready: () => true, kind: 'free' };
  }
  return null;
}

function renderVisualization() {
  const advanced = courses.getMode() === 'advanced';
  $('#floor-area').hidden = advanced;
  $('#meter').hidden = advanced;
  $('.image-set-control').hidden = advanced;
  $('#advanced-stage').hidden = !advanced;
  $('#advanced-meter').hidden = !advanced;
  $('#credit').textContent = t(advanced ? 'advancedCredit' : 'credit');
  const help = $('.board-help > div');
  const helpText = t(advanced ? 'advancedBoardHelp' : 'boardHelp');
  if (help.innerHTML !== helpText) help.innerHTML = helpText;
  const preview = advanced && advancedExample !== null && advancedStep === 'input';
  const state = preview ? evaluate(circuit, preparationColumns(advancedExample)) : partialMeasurement?.state ?? currentState;
  $('#advanced-step-control').hidden = !advancedExample;
  for (const button of $('#advanced-step-control').querySelectorAll('[data-step]')) {
    button.setAttribute('aria-pressed', String(button.dataset.step === advancedStep));
  }
  $('#board').dataset.preview = preview ? 'input' : 'output';
  if (advanced) {
    advancedView.render({ state, referenceState: currentState, results: preview ? [] : partialMeasurement?.results ?? [], measured: preview ? null : measured, example: advancedExample, preview });
  } else {
    const probs = probabilities(state);
    const settings = courses.getPhaseDisplay();
    const display = phaseDisplay(probs, getPhases(state), settings);
    floor.setState(probs, display.phases, { rotate: imagePhaseRotation.checked });
    meter.update(probs, display.phases);
    if (imagePhaseRotation.checked) $('#image-caption').textContent += ' ' + t('imageRotationCaption');
    if (settings.relative) {
      const bits = settings.reference.toString(2).padStart(3, '0');
      const key = display.applied ? 'phaseReferenceActive' : 'phaseReferenceUnavailable';
      $('#image-caption').textContent += ' ' + t(key).replace('{bits}', bits);
    }
  }
}

function syncMeasurementUI() {
  releaseBtn.innerHTML = t(courses.getMode() === 'advanced' ? 'prepareAgain' : 'release');
  const plan = getMeasurementPlan();
  const results = partialMeasurement?.results ?? [];
  const ready = plan ? plan.ready(buildCtx()) : true;
  const label = t('measure');
  const preview = courses.getMode() === 'advanced' && advancedExample !== null && advancedStep === 'input';
  measureBtn.querySelector('.label').textContent = label;
  measureBtn.title = preview ? t('measureAfterCircuit') : label;
  measureBtn.setAttribute('aria-label', measureBtn.title);
  measureBtn.hidden = Boolean(plan);
  measureBtn.disabled = preview || busy || measured !== null || Boolean(plan);
  $('#measurement-mode-control').hidden = courses.getMode() !== 'advanced' || (advancedExample?.kind === 'teleport' && !advancedExample.edited);
  $('#measurement-mode-select').value = individualMode ? 'individual' : 'all';
  $('#row-measurements').hidden = !plan;
  if ($('#row-measurements').children.length !== circuit.length) {
    $('#row-measurements').innerHTML = Array.from({ length: circuit.length }, (_, row) => `<button class="qubit-measure-btn" data-row="${row}">M</button>`).join('');
  }
  for (const button of document.querySelectorAll('.qubit-measure-btn')) {
    const row = Number(button.dataset.row);
    const result = results.find((item) => item.row === row);
    button.disabled = preview || !plan || !plan.rows.includes(row) || !ready || busy || Boolean(result);
    button.textContent = result && !preview ? result.value : 'M';
    button.dataset.measured = String(Boolean(result) && !preview);
    button.title = preview ? t('measureAfterCircuit') : result ? `${measurementLabel(row, circuit.length)}: ${result.value}` : measurementLabel(row, circuit.length);
    button.setAttribute('aria-label', button.title);
  }
  $('#row-measurements').dataset.stageLabel = advancedExample ? t('stageMeasurement') : '';
  renderQubitMeasurement($('#qubit-measurement'), {
    plan: plan?.kind === 'entanglement' ? plan : null, results, state: partialMeasurement?.state ?? currentState, ready,
  });
  $('#image-caption').textContent = t(results.length && measured === null ? 'partialImageCaption' : 'imageCaption');
  for (const element of $('#board').querySelectorAll('.board-row')) {
    element.dataset.measureNext = 'false';
  }
  renderVisualization();
}

function onCircuitChange() {
  courses.cancelOptimizers();
  const firstEdit = advancedExample && !advancedExample.edited;
  if (advancedExample) advancedExample = { ...advancedExample, edited: true, training: null };
  if (firstEdit) board.render();
  palette.clearSelect();
  recompute();
}

// コース切替などで使用不可になったゲートを盤面から取り除く
function pruneDisallowedGates() {
  const allowed = new Set(courses.getAllowedGates());
  // 剰余乗算は周期例から配置するブロック。発展ではパレット外でも保持する。
  if (courses.getMode() === 'advanced') allowed.add('CMOD');
  let removedAny = false;
  for (const rowCells of circuit) {
    for (let c = 0; c < rowCells.length; c++) {
      if (rowCells[c] && !allowed.has(rowCells[c].gateId)) {
        rowCells[c] = null;
        removedAny = true;
      }
    }
  }
  if (removedAny) {
    board.render();
    recompute();
  }
}

// ---- 観測 ----

async function runRoulette(winner, probs, durMs, onIndex) {
  // 確率が乗っている画像だけを周回するハイライトが、減速しながら winner で止まる。
  // 確率の高い画像ほど少し長く滞在する。
  const candidates = [];
  for (let i = 0; i < probs.length; i++) if (probs[i] > 1e-3) candidates.push(i);
  if (!candidates.includes(winner)) candidates.push(winner);
  if (candidates.length === 1) {
    // 確定状態: 回さずにタメだけ作る
    onIndex(winner);
    await new Promise((r) => setTimeout(r, durMs));
    return;
  }
  const seq = [];
  const rounds = Math.max(3, Math.ceil(24 / candidates.length));
  for (let k = 0; k < rounds * candidates.length; k++) seq.push(candidates[k % candidates.length]);
  let next = (candidates.indexOf(seq[seq.length - 1]) + 1) % candidates.length;
  while (candidates[next] !== winner) { seq.push(candidates[next]); next = (next + 1) % candidates.length; }
  seq.push(winner);
  const ratio = 1.09;
  const weights = seq.map((idx, k) => ratio ** k * (0.5 + probs[idx]));
  const total = weights.reduce((a, b) => a + b, 0);
  for (let k = 0; k < seq.length; k++) {
    onIndex(seq[k]);
    await new Promise((r) => setTimeout(r, (weights[k] / total) * durMs));
  }
}

function onMeasureQubit(row) {
  const plan = getMeasurementPlan();
  if (busy || !plan || !plan.ready(buildCtx()) || (advancedExample && advancedStep === 'input')) return;
  pauseTraining();
  const results = partialMeasurement?.results ?? [];
  if (results.some((result) => result.row === row)) return;
  const { outcome, state } = measureQubit(partialMeasurement?.state ?? currentState, row);
  partialMeasurement = { state, results: [...results, { row, value: outcome }] };
  const conditionalProbs = probabilities(state);
  setPartyFromProbs(conditionalProbs);
  boothEl.classList.add('locked');
  releaseBtn.hidden = false;
  const complete = plan.requiredRows.every((required) => partialMeasurement.results.some((result) => result.row === required));
  if (complete && measured === null && plan.kind !== 'teleport') {
    // 必要な行を測定すると基底が一意に決まる。
    // 3ビットのもつれレッスンでは q1=0 が既知なので、q2 と q0 だけでよい。
    measured = conditionalProbs.findIndex((p) => p > 1 - 1e-8);
    if (courses.getMode() !== 'advanced') {
      floor.setWinner(measured);
      meter.setWinner(measured);
      showAnnounce(announceEl, measured);
      strobe(floorAreaEl);
    }
    setParty(1);
  }
  courses.update(buildCtx());
  syncMeasurementUI();
}

async function onMeasure() {
  if (busy || measured !== null || getMeasurementPlan() || (advancedExample && advancedStep === 'input')) return;
  pauseTraining();
  if (courses.getMode() === 'advanced') {
    const result = measure(currentState);
    measured = result.outcome;
    partialMeasurement = { state: result.state, results: Array.from({ length: circuit.length }, (_, row) => ({ row, value: (measured >> (circuit.length - 1 - row)) & 1 })) };
    boothEl.classList.add('locked');
    releaseBtn.hidden = false;
    syncMeasurementUI();
    return;
  }
  busy = true;
  boothEl.classList.add('locked');
  measureBtn.disabled = true;
  if (courses.getMode() === 'quiz') courses.render();

  const { outcome } = measure(currentState);
  const spinMs = 2200;
  await runRoulette(outcome, currentProbs, spinMs, (i) => {
    floor.setRoulette(i);
    meter.setRoulette(i);
  });

  floor.setRoulette(null);
  meter.setRoulette(null);
  floor.setWinner(outcome);
  meter.setWinner(outcome);
  strobe(floorAreaEl);
  showAnnounce(announceEl, outcome);
  setParty(1);

  measured = outcome;
  busy = false;
  releaseBtn.hidden = false;
  measureBtn.disabled = true;
  courses.update(buildCtx());
}

function handleTeleportAction(action) {
  if (advancedExample?.kind !== 'teleport' || advancedExample.edited) return;
  const results = partialMeasurement?.results ?? [];
  if (![2,3].every(row => results.some(r => r.row === row))) return;
  if (action === 'teleport-send') advancedExample = { ...advancedExample, sent: true };
  else if (action === 'teleport-correct' && advancedExample.sent && !advancedExample.corrected) {
    partialMeasurement = { ...partialMeasurement, state: correctTeleportState(partialMeasurement.state, results) };
    advancedExample = { ...advancedExample, corrected: true };
    loadCircuitRecipe(circuit, [...teleportRecipe(advancedExample.input), ...teleportCorrectionRecipe(results)]);
    board.render();recompute();return;
  }
  courses.update(buildCtx());syncMeasurementUI();
}

function releaseMeasurement() {
  if (advancedExample?.kind === 'teleport' && !advancedExample.edited) {
    advancedExample = { ...advancedExample, sent: false, corrected: false };
    loadCircuitRecipe(circuit, teleportRecipe(advancedExample.input));board.render();
  }
  measured = null;
  partialMeasurement = null;
  releaseBtn.hidden = true;
  measureBtn.disabled = false;
  boothEl.classList.remove('locked');
  hideAnnounce(announceEl);
  floor.setWinner(null);
  meter.setWinner(null);
  recompute();
}

// ---- コントロール ----

function pauseTraining() {
  courses.pauseOptimizers();
  if (advancedExample?.training) advancedExample = { ...advancedExample, training: { ...advancedExample.training, running: false } };
}

measureBtn.addEventListener('click', onMeasure);
$('#advanced-step-control').addEventListener('click', (event) => {
  const button = event.target.closest('[data-step]');
  if (!button || !advancedExample) return;
  pauseTraining();
  advancedStep = button.dataset.step;
  syncMeasurementUI();
});
$('#row-measurements').addEventListener('click', (event) => {
  const button = event.target.closest('.qubit-measure-btn');
  if (button && !button.disabled) onMeasureQubit(Number(button.dataset.row));
});
$('#measurement-mode-select').addEventListener('change', (event) => {
  pauseTraining();
  individualMode = event.target.value === 'individual';
  releaseMeasurement();
});
releaseBtn.addEventListener('click', releaseMeasurement);

$('#reset-btn').addEventListener('click', () => {
  if (busy) return;
  courses.cancelOptimizers();
  advancedExample = null;
  clearCircuit(circuit);
  board.render();
  if (measured !== null || partialMeasurement) releaseMeasurement();
  else recompute();
});

for (const tab of document.querySelectorAll('#course-tabs .tab')) {
  tab.addEventListener('click', () => {
    if (busy) return;
    if (measured !== null || partialMeasurement) releaseMeasurement();
    advancedExample = null;
    circuit.splice(0, circuit.length, ...createCircuit(tab.dataset.mode === 'advanced' ? ADVANCED_COLS : 15, tab.dataset.mode === 'advanced' ? 5 : 3));
    $('#app').dataset.qubits = circuit.length;
    currentState = evaluate(circuit);
    currentProbs = probabilities(currentState);
    currentPhases = getPhases(currentState);
    board.render();
    courses.setMode(tab.dataset.mode);
    recompute();
  });
}

function syncTabs() {
  const mode = courses.getMode();
  for (const tab of document.querySelectorAll('#course-tabs .tab')) {
    tab.classList.toggle('active', tab.dataset.mode === mode);
  }
}

// ---- 初期化 ----
applyStaticTranslations();
changeImageSet(activeImageSet);
courses.setMode('lesson');
recompute();
