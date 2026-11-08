// コース管理: レッスン/トライ/フリーの切替、進行状態、パネル描画、達成判定。
import { LESSON_STEPS, LESSON_DONE_TEXT, LESSON_DONE_TEXT_EN } from './lessons.js';
import { CHALLENGES, TRY_DONE_TEXT, TRY_DONE_TEXT_EN } from './challenges.js';
import { QUIZ_QUESTIONS } from './quiz-questions.js';
import { createQuizSession } from './quiz-session.js';
import { IMAGE_META, imageName } from '../ui/image-scenes.js';
import { getLanguage, localized, t } from '../i18n.js';
import { PERIOD_EXAMPLES } from '../quantum/advanced.js';
import { QAOA_GRAPHS, createQaoaOptimizer, randomWeightedGraph } from '../quantum/qaoa.js';
import { H2_MOLECULES, createVqeOptimizer } from '../quantum/vqe.js';
import { CHSH_PAIRS, sampleChsh } from '../quantum/chsh.js';
import { TELEPORT_INPUTS } from '../quantum/teleportation.js';
import { thetaLabel } from '../quantum/gates.js';
import { PHASE_COMPARISONS, phaseComparisonRecipe, phaseComparisonSignature } from './phase-comparison.js';

const STORAGE_KEY = 'qdisco-cleared';
const fill = (template, values) => template.replace(/\{(\w+)\}/g, (_, key) => String(values[key]));

export function createCourses(panelEl, { onAllowedChange, onModeChange = () => {}, onLessonSelect = () => {}, onAdvance = () => {}, onAdvancedExample = () => {}, onTeleportAction = () => {}, onPhaseDisplayChange = () => {}, isBusy = () => false }) {
  let mode = 'lesson';
  let lessonStep = 0;
  let stepDone = false;
  let lessonComplete = false;
  const completedLessons = new Set();
  let phaseComparison = { variant: 'original', interference: false, visited: new Set() };
  let lastPhaseComparisonKey = '';
  let relativePhase = false, phaseReference = 0;
  let challengeIdx = 0;
  let showHint = false;
  let lastCtx = null;
  let tryResult = null; // { idx, sig, outcome, p, lessLikely, ok }
  let lastTryKey = '';
  let quiz = null;
  let quizResult = null;
  let lastQuizKey = '';
  let phaseInput = 8;
  let periodInput = 0;
  let qaoaGraph = 0, gammaStep = 2, betaStep = 2;
  let qaoaProblem = randomWeightedGraph(QAOA_GRAPHS[0]);
  let advancedKind = null;
  let chshThetaStep = 4, chshPair = 0, chshEntangled = true, chshSample = null;
  let advancedSelection = 'free', vqeMolecule = 1, vqeTheta = 0, teleportInput = 6;
  let vqeOptimizer = null, vqeRunning = false, vqeTimer = null, vqeShowBest = false;
  let qaoaOptimizer = null, qaoaRunning = false, qaoaTimer = null;
  let qaoaShowBest = false;
  const quizSession = () => quiz ??= createQuizSession();
  let cleared;
  try {
    cleared = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
  } catch {
    cleared = new Set();
  }

  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...cleared])); } catch { /* プライベートモード等 */ }
  }

  function pauseQaoa() {
    clearTimeout(qaoaTimer);qaoaTimer = null;qaoaRunning = false;
    syncQaoaControls();
  }

  function cancelQaoa() {
    pauseQaoa();qaoaOptimizer = null;qaoaShowBest = false;
    syncQaoaControls();
  }

  function syncQaoaControls() {
    const auto = panelEl.querySelector?.('[data-act="qaoa-optimize"]');
    const one = panelEl.querySelector?.('[data-act="qaoa-step"]');
    const prepare = panelEl.querySelector?.('[data-act="qaoa-example"]');
    const best = panelEl.querySelector?.('[data-act="qaoa-best"]');
    const progress = qaoaOptimizer?.snapshot();
    if (auto) {
      auto.textContent = t(qaoaRunning ? 'qaoaPause' : progress?.iteration ? 'qaoaResume' : 'qaoaOptimize');
      auto.disabled = Boolean(progress?.done);
      auto.setAttribute('aria-pressed', String(qaoaRunning));
    }
    if (one) one.disabled = qaoaRunning || Boolean(progress?.done);
    if (prepare) prepare.textContent = t(qaoaOptimizer ? 'qaoaRestart' : 'prepareExample');
    if (best) { best.hidden = !progress;best.disabled = qaoaShowBest; }
  }

  function publishQaoa() {
    advancedKind = 'qaoa';advancedSelection = 'qaoa';
    const progress = qaoaOptimizer?.snapshot();
    if (progress) {
      const shown = qaoaShowBest ? progress.best : progress.current;
      gammaStep = shown.gamma * 16 / Math.PI;
      betaStep = shown.beta * 16 / Math.PI;
    }
    panelEl.querySelector('#algorithm-description').textContent = t('qaoaDescription');
    for (const [id, step] of [['gamma', gammaStep], ['beta', betaStep]]) {
      panelEl.querySelector('#qaoa-' + id).value = step;
      panelEl.querySelector('[for="qaoa-' + id + '"]').textContent = thetaLabel(step * Math.PI / 16);
    }
    syncQaoaControls();
    onAdvancedExample({ kind: 'qaoa', graph: qaoaProblem, gamma: gammaStep * Math.PI / 16, beta: betaStep * Math.PI / 16,
      training: progress ? { ...progress, running: qaoaRunning, displayingBest: qaoaShowBest } : null });
  }

  function ensureQaoaOptimizer() {
    qaoaOptimizer ??= createQaoaOptimizer({ graph: qaoaProblem, gamma: gammaStep * Math.PI / 16, beta: betaStep * Math.PI / 16 });
  }

  function tickQaoa() {
    qaoaTimer = null;
    if (!qaoaRunning || mode !== 'advanced' || advancedKind !== 'qaoa') return;
    const progress = qaoaOptimizer.step();
    qaoaShowBest = false;
    if (progress.done) qaoaRunning = false;
    publishQaoa();
    if (qaoaRunning) qaoaTimer = setTimeout(tickQaoa, 700);
  }

  function syncVqeControls() {
    const progress = vqeOptimizer?.snapshot();
    const run = panelEl.querySelector?.('[data-act="vqe-run"]');
    const step = panelEl.querySelector?.('[data-act="vqe-step"]');
    const best = panelEl.querySelector?.('[data-act="vqe-best"]');
    const reset = panelEl.querySelector?.('[data-act="vqe-example"]');
    if (run) { run.textContent = t(vqeRunning ? 'qaoaPause' : progress?.iteration ? 'qaoaResume' : 'qaoaOptimize');run.disabled = Boolean(progress?.done); }
    if (step) step.disabled = vqeRunning || Boolean(progress?.done);
    if (best) { best.hidden = !progress;best.disabled = vqeShowBest; }
    if (reset) reset.textContent = t(progress ? 'qaoaRestart' : 'prepareExample');
  }

  function pauseVqe() { clearTimeout(vqeTimer);vqeTimer = null;vqeRunning = false;syncVqeControls(); }
  function pauseOptimizers() { pauseQaoa();pauseVqe(); }
  function cancelOptimizers() { cancelQaoa();pauseVqe();vqeOptimizer = null;vqeShowBest = false;syncVqeControls(); }

  function publishVqe() {
    advancedKind = 'vqe';advancedSelection = 'vqe';
    const progress = vqeOptimizer?.snapshot();
    if (progress) vqeTheta = (vqeShowBest ? progress.best : progress.current).theta;
    panelEl.querySelector('#algorithm-description').textContent = t('vqeDescription');
    panelEl.querySelector('#vqe-theta').value = vqeTheta * 256 / Math.PI;
    panelEl.querySelector('[for="vqe-theta"]').textContent = thetaLabel(vqeTheta);
    syncVqeControls();
    onAdvancedExample({ kind: 'vqe', molecule: H2_MOLECULES[vqeMolecule], theta: vqeTheta,
      training: progress ? { ...progress, running: vqeRunning, displayingBest: vqeShowBest } : null });
  }

  function ensureVqeOptimizer() {
    vqeOptimizer ??= createVqeOptimizer({ molecule: H2_MOLECULES[vqeMolecule], theta: vqeTheta });
  }

  function tickVqe() {
    vqeTimer = null;
    if (!vqeRunning || mode !== 'advanced' || advancedKind !== 'vqe') return;
    const progress = vqeOptimizer.step();vqeShowBest = false;
    if (progress.done) vqeRunning = false;
    publishVqe();
    if (vqeRunning) vqeTimer = setTimeout(tickVqe, 700);
  }

  function syncTeleportControls() {
    const ctx = lastCtx?.teleport;
    const send = panelEl.querySelector?.('[data-act="teleport-send"]');
    const correct = panelEl.querySelector?.('[data-act="teleport-correct"]');
    if (send) { send.disabled = !ctx?.ready || ctx.sent || ctx.edited;send.textContent = t(ctx?.sent ? 'teleportSent' : 'teleportSend'); }
    if (correct) { correct.disabled = !ctx?.sent || ctx.corrected || ctx.edited;correct.textContent = t(ctx?.corrected ? 'teleportRestored' : 'teleportCorrect'); }
  }

  function publishChsh() {
    advancedKind = 'chsh';advancedSelection = 'chsh';
    panelEl.querySelector('#algorithm-description').textContent = t('chshDescription');
    panelEl.querySelector('[for="chsh-theta"]').textContent = thetaLabel(chshThetaStep * Math.PI / 16);
    onAdvancedExample({ kind: 'chsh', theta: chshThetaStep * Math.PI / 16, entangled: chshEntangled, pair: chshPair, sample: chshSample });
  }

  function syncChshControls() {
    const button = panelEl.querySelector?.('[data-act="chsh-sample"]');
    if (button) button.disabled = Boolean(lastCtx?.chshEdited);
  }

  function prepareSelected() {
    if (advancedSelection === 'chsh') publishChsh();
    else if (advancedSelection === 'qaoa') publishQaoa();
    else if (advancedSelection === 'vqe') publishVqe();
    else if (advancedSelection === 'teleport') onAdvancedExample({ kind: 'teleport', input: TELEPORT_INPUTS[teleportInput], sent: false, corrected: false });
    else if (advancedSelection === 'phase') onAdvancedExample({ kind: 'phase', turns: phaseInput / 32 });
    else if (advancedSelection === 'period') onAdvancedExample({ kind: 'period', ...PERIOD_EXAMPLES[periodInput] });
    else onModeChange();
  }

  function getAllowedGates() {
    if (mode === 'advanced') return ['X', 'Y', 'Z', 'H', 'R', 'RY', 'CNOT', 'CCNOT', 'CP', 'G'];
    if (mode === 'free') return ['X', 'Y', 'Z', 'H', 'R', 'CNOT', 'CCNOT', 'G'];
    if (mode === 'try') return CHALLENGES[challengeIdx].allowed;
    if (mode === 'quiz') return quizSession().current().allowed;
    if (lessonComplete) return LESSON_STEPS.at(-1).allowed;
    return LESSON_STEPS[lessonStep].allowed;
  }

  function tryStatus() {
    const ok = lastCtx ? CHALLENGES[challengeIdx].judge(lastCtx) : false;
    const result = tryResult && lastCtx && tryResult.idx === challengeIdx && tryResult.sig === lastCtx.sig
      ? tryResult : null;
    return { ok, result };
  }

  function tryKey() {
    const { ok, result } = tryStatus();
    return JSON.stringify([challengeIdx, ok, result, cleared.has(challengeIdx)]);
  }

  function tryStatusHtml({ ok, result }, course = 'try') {
    if (result?.ok) {
      const meta = IMAGE_META[result.outcome];
      const tail = result.p >= 0.99
        ? t('tryCertain')
        : fill(t('tryChance'), { pct: Math.round(result.p * 100) })
          + (result.lessLikely ? t('tryUnlikely') : '');
      const message = fill(t(course + 'Cleared'), { image: imageName(result.outcome), bits: meta.bits, tail });
      return `<span class="success-msg">${message}</span>`;
    }
    if (result) return `<span class="rule-note">${t(course + 'Miss')}</span>`;
    if (ok) return `<span class="ready-msg">${t(course + 'Ready')}</span>`;
    return `<span class="rule-note">${t(course + 'Rule')}</span>`;
  }

  function quizStatus() {
    const question = quizSession().current();
    return {
      ok: Boolean(lastCtx && question.judge(lastCtx)),
      result: quizResult && lastCtx && quizResult.id === question.id && quizResult.sig === lastCtx.sig ? quizResult : null,
    };
  }
  function quizKey() {
    return JSON.stringify([quizSession().current().id, quizStatus(), quizSession().clearedCount()]);
  }

  function lessonNavigation() {
    return `<nav class="lesson-list" aria-label="${t('chooseLesson')}">${LESSON_STEPS.map((step, index) => {
      const cls = ['challenge-dot'];
      if (!lessonComplete && index === lessonStep) cls.push('current');
      if (completedLessons.has(index)) cls.push('cleared');
      return `<button class="${cls.join(' ')}" data-act="goto-lesson" data-i="${index}" aria-pressed="${!lessonComplete && index === lessonStep}" title="${index + 1}. ${localized(step, 'title')}">${index + 1}</button>`;
    }).join('')}</nav>`;
  }

  function phaseComparisonMatches() {
    return lastCtx?.sig === phaseComparisonSignature(phaseComparison.variant, phaseComparison.interference);
  }

  function phaseComparisonKey() {
    return JSON.stringify([phaseComparison.variant, phaseComparison.interference,
      [...phaseComparison.visited], phaseComparisonMatches(), stepDone]);
  }

  function showPhaseComparison() {
    onLessonSelect({ initialGates: phaseComparisonRecipe(phaseComparison.variant, phaseComparison.interference) });
  }

  function phaseComparisonHtml() {
    const { variant, interference, visited } = phaseComparison;
    const matches = phaseComparisonMatches();
    lastPhaseComparisonKey = phaseComparisonKey();
    return `<div class="phase-comparison-controls" role="group" aria-label="${t('phaseComparisonControls')}">
      ${PHASE_COMPARISONS.map((name, index) => `<button class="panel-btn" data-act="compare-phase" data-i="${index}" aria-pressed="${matches && variant === name}">${visited.has(name + ':' + interference) ? '✓ ' : ''}${t('phaseCompare' + name)}</button>`).join('')}
      <button class="panel-btn" data-act="phase-interference" aria-pressed="${interference}">${t(interference ? 'phaseInterferenceOn' : 'phaseInterferenceOff')}</button>
      <span class="phase-comparison-progress" title="${t('phaseComparisonProgress')}">${visited.size}/6</span>
    </div><div aria-live="polite">${t(!matches ? 'phaseComparisonEdited' : 'phaseNote' + variant + (interference ? 'After' : 'Before'))}</div>`;
  }

  function render() {
    if (mode === 'advanced') {
      const settings = {
        phase: `<fieldset><legend>${t('phaseSettings')}</legend>
            <label>${t('phaseAngle')} <select id="phase-angle-select">${Array.from({ length: 32 }, (_, value) => `<option value="${value}" ${value === phaseInput ? 'selected' : ''}>${value}/32</option>`).join('')}</select></label>
            <button class="panel-btn primary" data-act="phase-example">${t('prepareExample')}</button>
          </fieldset>`,
        period: `<fieldset><legend>${t('periodSettings')}</legend>
            <label>${t('periodParameters')} <select id="period-example-select">${PERIOD_EXAMPLES.map((example, index) => `<option value="${index}" ${index === periodInput ? 'selected' : ''}>N=${example.modulus} · ${t('periodBase')} ${example.base}</option>`).join('')}</select></label>
            <button class="panel-btn" data-act="period-example">${t('prepareExample')}</button>
          </fieldset>`,
        qaoa: `<fieldset class="qaoa-settings"><legend>${t('qaoaSettings')}</legend>
            <div class="qaoa-problem-controls"><label>${t('qaoaGraph')} <select id="qaoa-graph-select">${QAOA_GRAPHS.map((graph, index) => `<option value="${index}" ${index === qaoaGraph ? 'selected' : ''}>${t(graph.name)}</option>`).join('')}</select></label><button class="panel-btn" data-act="qaoa-weights" title="${t('qaoaNewWeightsTitle')}">${t('qaoaNewWeights')}</button></div>
            <div class="qaoa-angles">
              <label title="${t('qaoaGamma')}"><span class="qaoa-angle-caption gamma-caption">${t('qaoaGammaCaption')}</span><input id="qaoa-gamma" type="range" min="0" max="32" step="0.0625" value="${gammaStep}" aria-label="${t('qaoaGamma')}"><output for="qaoa-gamma">${thetaLabel(gammaStep * Math.PI / 16)}</output></label>
              <label title="${t('qaoaBeta')}"><span class="qaoa-angle-caption beta-caption">${t('qaoaBetaCaption')}</span><input id="qaoa-beta" type="range" min="0" max="16" step="0.0625" value="${betaStep}" aria-label="${t('qaoaBeta')}"><output for="qaoa-beta">${thetaLabel(betaStep * Math.PI / 16)}</output></label>
            </div>
            <div class="qaoa-buttons"><button class="panel-btn" data-act="qaoa-example">${t('prepareExample')}</button><button class="panel-btn" data-act="qaoa-step">${t('qaoaStep')}</button><button class="panel-btn" data-act="qaoa-optimize">${t('qaoaOptimize')}</button><button class="panel-btn" data-act="qaoa-best" hidden>${t('qaoaUseBest')}</button></div>
          </fieldset>`,
        chsh: `<fieldset class="chsh-settings"><legend>${t('chshSettings')}</legend>
          <label>${t('chshState')} <select id="chsh-state-select"><option value="bell" ${chshEntangled ? 'selected' : ''}>${t('chshBell')}</option><option value="product" ${!chshEntangled ? 'selected' : ''}>${t('chshProduct')}</option></select></label>
          <label>${t('chshAngle')} <input id="chsh-theta" type="range" min="0" max="32" step="1" value="${chshThetaStep}" aria-label="${t('chshAngle')}"><output for="chsh-theta">${thetaLabel(chshThetaStep * Math.PI / 16)}</output></label>
          <div class="chsh-actions"><select id="chsh-pair-select" aria-label="${t('chshSetting')}">${CHSH_PAIRS.map(([a,b], i) => `<option value="${i}" ${chshPair === i ? 'selected' : ''}>A${a} B${b}</option>`).join('')}</select><button class="panel-btn" data-act="chsh-sample" title="${t('chshSampleTitle')}">${t('chshSample')}</button></div>
        </fieldset>`,
        vqe: `<fieldset class="vqe-settings"><legend>${t('vqeSettings')}</legend>
          <label>${t('vqeDistance')} <select id="vqe-molecule-select">${H2_MOLECULES.map((m, i) => `<option value="${i}" ${i === vqeMolecule ? 'selected' : ''}>${m.distance} Å</option>`).join('')}</select></label>
          <label>θ <input id="vqe-theta" type="range" min="-256" max="256" step="0.25" value="${vqeTheta * 256 / Math.PI}" aria-label="${t('vqeTheta')}"><output for="vqe-theta">${thetaLabel(vqeTheta)}</output></label>
          <div class="qaoa-buttons"><button class="panel-btn" data-act="vqe-example">${t('prepareExample')}</button><button class="panel-btn" data-act="vqe-step">${t('qaoaStep')}</button><button class="panel-btn" data-act="vqe-run">${t('qaoaOptimize')}</button><button class="panel-btn" data-act="vqe-best" hidden>${t('qaoaUseBest')}</button></div>
        </fieldset>`,
        teleport: `<fieldset class="teleport-settings"><legend>${t('teleportSettings')}</legend>
          <label>${t('teleportInput')} <select id="teleport-input-select">${TELEPORT_INPUTS.map((input, i) => `<option value="${i}" ${i === teleportInput ? 'selected' : ''}>${i === 6 ? t('teleportTilted') : input.label}</option>`).join('')}</select></label>
          <div class="teleport-buttons"><button class="panel-btn" data-act="teleport-send" disabled>${t('teleportSend')}</button><button class="panel-btn" data-act="teleport-correct" disabled>${t('teleportCorrect')}</button><button class="panel-btn" data-act="teleport-repeat">${t('teleportRepeat')}</button></div>
        </fieldset>`,
        free: `<div class="advanced-free-note">${t('advancedDescription')}</div>`,
      };
      const description = advancedKind === 'chsh' ? 'chshDescription' : advancedKind === 'qaoa' ? 'qaoaDescription' : advancedKind === 'vqe' ? 'vqeDescription' : advancedKind === 'teleport' ? 'teleportDescription' : advancedSelection === 'free' ? 'advancedInitial' : 'circuitRolesDescription';
      panelEl.innerHTML = `
        <span class="panel-badge">${t('advanced')}</span>
        <div class="panel-text advanced-description">
          <div class="circuit-role-key"><span class="problem-key">${t('problemPart')}</span><span class="common-key">${t('commonPart')}</span></div>
          <div id="algorithm-description">${t(description)}</div>
        </div>
        <div class="panel-actions advanced-actions">
          <label class="algorithm-choice">${t('chooseAlgorithm')}<select id="advanced-algorithm-select">${['free','phase','period','qaoa','vqe','teleport','chsh'].map((kind) => `<option value="${kind}" ${kind === advancedSelection ? 'selected' : ''}>${t({ free: 'freeCircuit', phase: 'phaseSettings', period: 'periodSettings', qaoa: 'qaoaSettings', vqe: 'vqeSettings', teleport: 'teleportSettings', chsh: 'chshSettings' }[kind])}</option>`).join('')}</select></label>
          ${settings[advancedSelection]}
        </div>`;
      bind();
      syncQaoaControls();syncVqeControls();syncTeleportControls();syncChshControls();
      return;
    }
    if (mode === 'quiz') {
      const session = quizSession();
      const question = session.current();
      const status = quizStatus();
      lastQuizKey = quizKey();
      panelEl.innerHTML = `
        <span class="panel-badge${status.result?.ok ? ' ok' : ''}">${t('quiz')} #${question.id.slice(-3)}</span>
        <div class="quiz-progress">${localized(question, 'category')} · ${fill(t('quizProgress'), { count: session.clearedCount(), total: QUIZ_QUESTIONS.length })}</div>
        <div class="panel-text" data-quiz-id="${question.id}">${localized(question, 'text')}<br>${tryStatusHtml(status, 'quiz')}</div>
        <div class="panel-actions">
          <button class="panel-btn primary" data-act="next-quiz" aria-keyshortcuts="Shift+Enter N" ${isBusy() ? 'disabled' : ''}>${t(status.result?.ok ? 'nextQuiz' : 'skipQuiz')}</button>
          <button class="panel-btn ghost" data-act="toggle-hint">${t(showHint ? 'hideHint' : 'hint')}</button>
        </div>
        ${showHint ? `<div class="hint-text quiz-hint">💡 ${localized(question, 'hint')}</div>` : ''}`;
      bind();
      return;
    }
    if (mode === 'free') {
      panelEl.innerHTML = `
        <span class="panel-badge">${t('free')}</span>
        <div class="panel-text">${t('freeDescription')}<br><span class="rule-note">${t('phaseDisplayHelp')}</span></div>
        <div class="panel-actions phase-display-controls">
          <label>${t('phaseDisplayLabel')} <select id="phase-display-select"><option value="circuit" ${!relativePhase ? 'selected' : ''}>${t('phaseDisplayCircuit')}</option><option value="relative" ${relativePhase ? 'selected' : ''}>${t('phaseDisplayRelative')}</option></select></label>
          ${relativePhase ? `<label>${t('phaseReferenceLabel')} <select id="phase-reference-select">${IMAGE_META.map((meta, index) => `<option value="${index}" ${phaseReference === index ? 'selected' : ''}>${meta.bits} ${imageName(index)}</option>`).join('')}</select></label>` : ''}
        </div>`;
      bind();
      return;
    }

    if (mode === 'lesson') {
      if (lessonComplete) {
        panelEl.innerHTML = `
          <span class="panel-badge ok">${t('lessonComplete')}</span>
          ${lessonNavigation()}
          <div class="panel-text">${getLanguage() === 'en' ? LESSON_DONE_TEXT_EN : LESSON_DONE_TEXT}</div>
          <div class="panel-actions"><button class="panel-btn primary" data-act="goto-try" aria-keyshortcuts="Shift+Enter N">${t('goToChallenges')}</button></div>`;
        bind();
        return;
      }
      const step = LESSON_STEPS[lessonStep];
      const successHtml = stepDone && !step.needNext
        ? `<br><span class="success-msg">${t('done')}</span>` : '';
      const nextBtn = (step.needNext || stepDone)
        ? `<button class="panel-btn primary" data-act="next-step" aria-keyshortcuts="Shift+Enter N">${t('next')}</button>` : '';
      panelEl.innerHTML = `
        <span class="panel-badge">${t('lesson')} ${lessonStep + 1}/${LESSON_STEPS.length}</span>
        ${lessonNavigation()}
        <div class="panel-text">${step.experiment === 'phase-comparison' ? phaseComparisonHtml() : localized(step, 'text')}${successHtml}</div>
        <div class="panel-actions">${nextBtn}</div>`;
      bind();
      return;
    }

    // トライ
    const ch = CHALLENGES[challengeIdx];
    const isCleared = cleared.has(challengeIdx);
    const allCleared = cleared.size >= CHALLENGES.length;
    const dots = CHALLENGES.map((c, i) => {
      const cls = ['challenge-dot'];
      if (i === challengeIdx) cls.push('current');
      if (cleared.has(i)) cls.push('cleared');
      return `<button class="${cls.join(' ')}" data-act="goto-challenge" data-i="${i}" title="${localized(c, 'title')}">${cleared.has(i) ? '✓' : i + 1}</button>`;
    }).join('');
    const status = isCleared
      ? `<span class="panel-badge ok">${t('cleared')}</span>`
      : `<span class="panel-badge">${localized(ch, 'title')}</span>`;
    const nextBtn = isCleared && challengeIdx < CHALLENGES.length - 1
      ? `<button class="panel-btn primary" data-act="next-challenge" aria-keyshortcuts="Shift+Enter N">${t('nextChallenge')}</button>` : '';
    const doneMsg = allCleared ? `<br><span class="success-msg">${getLanguage() === 'en' ? TRY_DONE_TEXT_EN : TRY_DONE_TEXT}</span>` : '';
    lastTryKey = tryKey();
    panelEl.innerHTML = `
      ${status}
      <div class="challenge-list">${dots}</div>
      <div class="panel-text">${localized(ch, 'text')}<br>${tryStatusHtml(tryStatus())}${doneMsg}</div>
      <div class="panel-actions">
        ${nextBtn}
        <button class="panel-btn ghost" data-act="toggle-hint">${t(showHint ? 'hideHint' : 'hint')}</button>
      </div>
      ${showHint ? `<div class="hint-text">💡 ${localized(ch, 'hint')}</div>` : ''}`;
    bind();
  }

  function bind() {
    panelEl.querySelector?.('#phase-display-select')?.addEventListener('change', event => {
      if (isBusy()) { event.target.value = relativePhase ? 'relative' : 'circuit';return; }
      relativePhase = event.target.value === 'relative';render();onPhaseDisplayChange();
    });
    panelEl.querySelector?.('#phase-reference-select')?.addEventListener('change', event => {
      if (isBusy()) { event.target.value = String(phaseReference);return; }
      phaseReference = Number(event.target.value);onPhaseDisplayChange();
    });
    panelEl.querySelector?.('#chsh-state-select')?.addEventListener('change', event => {
      chshEntangled = event.target.value === 'bell';chshSample = null;publishChsh();
    });
    panelEl.querySelector?.('#chsh-theta')?.addEventListener('input', event => {
      chshThetaStep = Number(event.target.value);chshSample = null;publishChsh();
    });
    panelEl.querySelector?.('#chsh-pair-select')?.addEventListener('change', event => {
      chshPair = Number(event.target.value);publishChsh();
    });
    panelEl.querySelector?.('#advanced-algorithm-select')?.addEventListener('change', (event) => {
      cancelOptimizers();advancedSelection = event.target.value;advancedKind = advancedSelection === 'free' ? null : advancedSelection;
      render();prepareSelected();onAllowedChange();
    });
    panelEl.querySelector?.('#vqe-molecule-select')?.addEventListener('change', (event) => {
      cancelOptimizers();vqeMolecule = Number(event.target.value);vqeTheta = 0;publishVqe();
    });
    panelEl.querySelector?.('#vqe-theta')?.addEventListener('input', (event) => {
      cancelOptimizers();vqeTheta = Number(event.target.value) * Math.PI / 256;publishVqe();
    });
    panelEl.querySelector?.('#teleport-input-select')?.addEventListener('change', (event) => {
      teleportInput = Number(event.target.value);prepareSelected();
    });
    panelEl.querySelector?.('#qaoa-graph-select')?.addEventListener('change', (event) => {
      cancelQaoa();qaoaGraph = Number(event.target.value);qaoaProblem = randomWeightedGraph(QAOA_GRAPHS[qaoaGraph]);publishQaoa();
    });
    for (const id of ['gamma', 'beta']) panelEl.querySelector?.('#qaoa-' + id)?.addEventListener('input', (event) => {
      cancelQaoa();
      if (id === 'gamma') gammaStep = Number(event.target.value);
      else betaStep = Number(event.target.value);
      publishQaoa();
    });
    panelEl.querySelector?.('#phase-angle-select')?.addEventListener('change', (event) => { phaseInput = Number(event.target.value); });
    panelEl.querySelector?.('#period-example-select')?.addEventListener('change', (event) => { periodInput = Number(event.target.value); });
    for (const btn of panelEl.querySelectorAll('[data-act]')) {
      btn.addEventListener('click', () => {
        const act = btn.dataset.act;
        if (isBusy() && act !== 'toggle-hint') return;
        if (act === 'compare-phase' || act === 'phase-interference') {
          if (act === 'compare-phase') phaseComparison.variant = PHASE_COMPARISONS[Number(btn.dataset.i)];
          else phaseComparison.interference = !phaseComparison.interference;
          showPhaseComparison();
        } else if (act === 'chsh-sample') {
          chshSample = sampleChsh({ theta: chshThetaStep * Math.PI / 16, entangled: chshEntangled });publishChsh();
        } else if (act === 'vqe-example') {
          const initial = vqeOptimizer?.snapshot().history[0];if (initial) vqeTheta = initial.theta;
          cancelOptimizers();publishVqe();
        } else if (act === 'vqe-step') {
          pauseVqe();ensureVqeOptimizer();vqeOptimizer.step();vqeShowBest = false;publishVqe();
        } else if (act === 'vqe-best') {
          pauseVqe();vqeShowBest = true;publishVqe();
        } else if (act === 'vqe-run') {
          if (vqeRunning) { pauseVqe();publishVqe(); }
          else { ensureVqeOptimizer();vqeRunning = true;publishVqe();vqeTimer = setTimeout(tickVqe, 700); }
        } else if (act === 'teleport-repeat') {
          prepareSelected();
        } else if (act === 'teleport-send' || act === 'teleport-correct') {
          onTeleportAction(act);
        } else if (act === 'qaoa-weights') {
          cancelQaoa();qaoaProblem = randomWeightedGraph(QAOA_GRAPHS[qaoaGraph]);publishQaoa();
        } else if (act === 'qaoa-example') {
          const initial = qaoaOptimizer?.snapshot().history[0];
          if (initial) { gammaStep = initial.gamma * 16 / Math.PI;betaStep = initial.beta * 16 / Math.PI; }
          cancelQaoa();publishQaoa();
        } else if (act === 'qaoa-step') {
          pauseQaoa();ensureQaoaOptimizer();qaoaOptimizer.step();qaoaShowBest = false;publishQaoa();
        } else if (act === 'qaoa-best') {
          pauseQaoa();qaoaShowBest = true;publishQaoa();
        } else if (act === 'qaoa-optimize') {
          if (qaoaRunning) { pauseQaoa();publishQaoa(); }
          else {
            ensureQaoaOptimizer();qaoaRunning = true;publishQaoa();
            qaoaTimer = setTimeout(tickQaoa, 700);
          }
        } else if (act === 'phase-example' || act === 'period-example') {
          if (isBusy()) return;
          cancelQaoa();
          const turns = phaseInput / 32;
          advancedKind = act === 'phase-example' ? 'phase' : 'period';
          panelEl.querySelector('#algorithm-description').textContent = t('circuitRolesDescription');
          onAdvancedExample(act === 'phase-example' ? { kind: 'phase', turns } : { kind: 'period', ...PERIOD_EXAMPLES[periodInput] });
        } else if (act === 'next-quiz') {
          if (isBusy()) return;
          quizSession().next();
          quizResult = null;
          showHint = false;
          lastCtx = null;
          onModeChange();
        } else if (act === 'goto-lesson') {
          if (isBusy()) return;
          lessonStep = +btn.dataset.i;
          lessonComplete = false;
          stepDone = false;
          lastCtx = null;
          if (LESSON_STEPS[lessonStep].experiment === 'phase-comparison') {
            phaseComparison = { variant: 'original', interference: false, visited: new Set() };
          }
          onLessonSelect(LESSON_STEPS[lessonStep]);
        } else if (act === 'next-step') {
          completedLessons.add(lessonStep);
          lessonStep++;
          stepDone = false;
          if (lessonStep >= LESSON_STEPS.length) { lessonComplete = true;onAdvance(); }
          else if (LESSON_STEPS[lessonStep].experiment === 'phase-comparison') {
            phaseComparison = { variant: 'original', interference: false, visited: new Set() };
            showPhaseComparison();
          } else onAdvance();
        } else if (act === 'goto-try') {
          mode = 'try';
          onModeChange();
        } else if (act === 'next-challenge') {
          challengeIdx++;
          showHint = false;
          tryResult = null;
          onAdvance();
        } else if (act === 'goto-challenge') {
          challengeIdx = +btn.dataset.i;
          showHint = false;
          tryResult = null;
          onAdvance();
        } else if (act === 'toggle-hint') {
          showHint = !showHint;
        }
        render();
        onAllowedChange();
      });
    }
  }

  return {
    getAllowedGates,
    getPhaseDisplay: () => ({ relative: mode === 'free' && relativePhase, reference: phaseReference }),
    getMeasurementPlan: () => mode === 'lesson' && !lessonComplete
      ? LESSON_STEPS[lessonStep].measurement ?? null : null,
    getMode: () => mode,
    pauseOptimizers,
    cancelOptimizers,
    setMode(m) {
      cancelOptimizers();advancedSelection = 'free';
      mode = m;
      advancedKind = null;
      showHint = false;
      lastCtx = null;
      tryResult = null;
      quizResult = null;
      render();
      onAllowedChange();
    },
    // 回路変更・観測のたびに呼ばれる。達成判定を行い必要ならパネルを更新。
    update(ctx) {
      if (tryResult && tryResult.sig !== ctx.sig) tryResult = null;
      if (quizResult && quizResult.sig !== ctx.sig) quizResult = null;
      lastCtx = ctx;
      if (mode === 'advanced') { syncTeleportControls();syncChshControls(); }
      if (mode === 'lesson' && !lessonComplete) {
        const step = LESSON_STEPS[lessonStep];
        if (step.experiment === 'phase-comparison') {
          if (phaseComparisonMatches()) phaseComparison.visited.add(phaseComparison.variant + ':' + phaseComparison.interference);
          if (phaseComparison.visited.size === 6) {
            stepDone = true;completedLessons.add(lessonStep);
          }
          if (phaseComparisonKey() !== lastPhaseComparisonKey) render();
        } else if (!stepDone && step.check && step.check(ctx)) {
          stepDone = true;
          completedLessons.add(lessonStep);
          render();
        }
      } else if (mode === 'quiz') {
        if (ctx.measured !== null) {
          const question = quizSession().current();
          const ok = question.judge(ctx);
          quizResult = {
            id: question.id, sig: ctx.sig, outcome: ctx.measured, p: ctx.probs[ctx.measured],
            lessLikely: ctx.probs[ctx.measured] + 1e-6 < Math.max(...ctx.probs), ok,
          };
          if (ok) quizSession().markCleared();
          render();
        } else if (quizKey() !== lastQuizKey) render();
      } else if (mode === 'try') {
        if (ctx.measured !== null) {
          const ok = CHALLENGES[challengeIdx].judge(ctx);
          const p = ctx.probs[ctx.measured];
          tryResult = {
            idx: challengeIdx, sig: ctx.sig, outcome: ctx.measured, p,
            lessLikely: p + 1e-6 < Math.max(...ctx.probs), ok,
          };
          if (ok && !cleared.has(challengeIdx)) {
            cleared.add(challengeIdx);
            persist();
          }
          render();
        } else if (tryKey() !== lastTryKey) {
          render();
        }
      }
    },
    render,
  };
}
