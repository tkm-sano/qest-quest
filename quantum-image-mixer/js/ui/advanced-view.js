import { probabilities, qubitProbabilities } from '../quantum/state.js';
import { registerProbabilities, measuredRegister, periodSample } from '../quantum/advanced.js';
import { thetaLabel } from '../quantum/gates.js';
import { qubitLabel } from './qubit-measurement.js';
import { vqeEnergy, referenceEnergy } from '../quantum/vqe.js';
import { qubitBloch, inputBloch, teleportFidelity } from '../quantum/teleportation.js';
import { t } from '../i18n.js';
import { cutValue, qaoaStatistics, totalEdgeWeight } from '../quantum/qaoa.js';
import { CHSH_PAIRS, chshStatistics, chshCorrelation } from '../quantum/chsh.js';

export function createAdvancedView(stage, meter) {
  const canvas = stage.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const title = stage.querySelector('#advanced-title');
  const readout = stage.querySelector('#advanced-readout');
  let current = null;
  const graphView = document.createElement('figure');
  graphView.id = 'qaoa-graph-view';graphView.hidden = true;
  stage.appendChild(graphView);

  function candidate(data, probs) {
    if (data.measured !== null) return data.measured;
    return probs.indexOf(Math.max(...probs));
  }

  function trainingHistory(training) {
    const history = training.history, last = history.at(-1);
    const energy = training.kind === 'vqe';
    const lower = energy ? Math.min(training.best.optimum, ...history.map(p => p.expected)) - .01 : Math.max(0, Math.min(...history.map(p => p.expected)) - .15);
    const upper = energy ? Math.max(...history.map(p => p.expected)) + .02 : training.best.optimum;
    const x = (index) => 12 + index / Math.max(1, history.length - 1) * 576;
    const y = (value) => 36 - (value - lower) / (upper - lower) * 31;
    const points = history.map((point, index) => x(index) + ',' + y(point.expected)).join(' ');
    const bestPoints = history.map((point, index) => x(index) + ',' + y(point.bestExpected)).join(' ');
    const status = t(training.done ? 'qaoaFinished' : training.running ? 'qaoaRunning' : 'qaoaPaused');
    const label = fill(t('qaoaIteration'), { iteration: training.iteration, status });
    const progress = fill(t(energy ? 'vqeProgress' : 'qaoaProgress'), { current: last.expected.toFixed(energy ? 4 : 2), best: training.best.expected.toFixed(energy ? 4 : 2) });
    const evaluations = fill(t('qaoaEvaluations'), { count: training.evaluations });
    const action = training.displayingBest ? t('qaoaBestView') + ' · ' : training.iteration ? t(last.improved ? 'qaoaImproved' : last.refined ? 'qaoaRefined' : 'qaoaRejected') + ' · ' : '';
    return `<div class="qaoa-training" data-iteration="${training.iteration}" data-running="${training.running}" data-done="${training.done}" data-evaluations="${training.evaluations}" data-trial-score="${last.expected}" data-best-score="${training.best.expected}" data-displaying-best="${training.displayingBest}">
      <div class="qaoa-training-summary" role="status"><strong>${label}</strong><span>${progress}</span><small>${action}${evaluations}</small></div>
      <div class="qaoa-trace" role="img" aria-label="${t(energy ? 'vqeHistory' : 'qaoaHistory')} · ${label} · ${progress}">
        <svg viewBox="0 0 600 42" preserveAspectRatio="none" aria-hidden="true"><path d="M12 4 V36 H588" class="qaoa-trace-axis"/><polyline class="qaoa-trial-trace" points="${points}"/><polyline class="qaoa-best-trace" points="${bestPoints}"/><circle cx="${x(history.length - 1)}" cy="${y(training.displayingBest ? training.best.expected : last.expected)}" r="2.5"/></svg>
        <span class="qaoa-trace-high">${energy ? upper.toFixed(3) : upper}</span><span class="qaoa-trace-low">${lower.toFixed(2)}</span><span class="qaoa-trace-label">${t(energy ? 'vqeHistory' : 'qaoaHistory')}</span>
      </div>
    </div>`;
  }

  function drawCut(graph, value, results, isMeasured) {
    const points = Array.from({ length: 5 }, (_, row) => {
      const angle = row / 5 * Math.PI * 2 - Math.PI / 2;
      return { x: 70 + Math.cos(angle) * 45, y: 63 + Math.sin(angle) * 45, angle };
    });
    const bit = (row) => (value >> (4 - row)) & 1;
    const lines = [], labels = [];
    for (const [a, b, weight = 1] of graph.edges) {
      const cut = bit(a) !== bit(b), color = cut ? '#7dff9e' : '#657894';
      const x = (points[a].x + points[b].x) / 2, y = (points[a].y + points[b].y) / 2;
      lines.push(`<line class="qaoa-edge" data-a="${a}" data-b="${b}" data-weight="${weight}" data-cut="${cut}" x1="${points[a].x}" y1="${points[a].y}" x2="${points[b].x}" y2="${points[b].y}" stroke="${color}" stroke-width="${.7 + weight * .33}"/>`);
      labels.push(`<g class="qaoa-weight-label" data-weight="${weight}" transform="translate(${x} ${y})"><title>q${4 - a}–q${4 - b}: ${weight}</title><rect x="-6" y="-6.5" width="12" height="13" rx="3" fill="#0e192c"/><text text-anchor="middle" dominant-baseline="central" fill="${cut ? '#d4ffe0' : '#b4c2d8'}" font-size="10.5">${weight}</text></g>`);
    }
    const nodes = points.map(({ x, y, angle }, row) => {
      const measured = results.some((result) => result.row === row);
      return `<g class="qaoa-node" data-row="${row}" data-measured="${measured}"><circle cx="${x}" cy="${y}" r="7" fill="${bit(row) ? '#ffc53d' : '#53c3eb'}" stroke="${measured ? '#fff' : 'none'}" stroke-width="2"/><text x="${x}" y="${y + 3}" text-anchor="middle" fill="#11192b" font-size="8.5" font-weight="bold">${bit(row)}</text><text x="${x + Math.cos(angle) * 13}" y="${y + Math.sin(angle) * 13 + 3}" text-anchor="middle" fill="#d2e3fa" font-size="9.5">q${4 - row}</text></g>`;
    }).join('');
    const summary = graph.edges.map(([a, b, weight = 1]) => `q${4 - a}–q${4 - b}: ${weight}`).join('; ');
    const score = cutValue(value, graph);
    const caption = fill(t(isMeasured ? 'qaoaMeasured' : 'qaoaCandidate'), { bits: value.toString(2).padStart(5, '0'), score });
    graphView.title = t('qaoaWeightRule');
    graphView.innerHTML = `<svg viewBox="0 0 140 140" role="img" aria-label="${t('qaoaWeightRule')} ${summary}. ${caption}"><g>${lines.join('')}</g><g>${labels.join('')}</g>${nodes}<text x="70" y="133" text-anchor="middle" fill="#d2e3fa" font-size="10">${caption}</text></svg>`;
  }

  function drawVqe(width, height) {
    const { example, referenceState, state } = current;
    const m = example.molecule, energy = vqeEnergy(referenceState ?? state, m);
    const picture = Math.min(150, width * .28), left = picture + 42, right = width - 12, top = 12, bottom = height - 20;
    const low = referenceEnergy(m) - .04, high = m.identity + Math.hypot(m.x, m.z) + .04;
    const x = theta => left + (theta + Math.PI) / (2 * Math.PI) * (right - left);
    const y = e => bottom - (e - low) / (high - low) * (bottom - top);
    const cx = picture / 2, cy = height * .42, distance = Math.min(picture * .33, 14 + m.distance * 12);
    ctx.strokeStyle = '#768bb4';ctx.beginPath();ctx.moveTo(cx - distance / 2, cy);ctx.lineTo(cx + distance / 2, cy);ctx.stroke();
    for (const px of [cx - distance / 2, cx + distance / 2]) {
      ctx.fillStyle = '#53c3eb';ctx.beginPath();ctx.arc(px, cy, 8, 0, 2 * Math.PI);ctx.fill();
      ctx.fillStyle = '#10233b';ctx.font = 'bold 9px system-ui';ctx.textAlign = 'center';ctx.fillText('H', px, cy + 3);
    }
    ctx.fillStyle = '#d2e3fa';ctx.font = '11px system-ui';ctx.fillText(m.distance + ' Å', cx, height - 9);
    ctx.font = '9px system-ui';
    for (const e of [referenceEnergy(m), m.identity, high - .04]) {
      ctx.strokeStyle = '#354365';ctx.beginPath();ctx.moveTo(left, y(e));ctx.lineTo(right, y(e));ctx.stroke();
      ctx.fillStyle = '#a4b2d0';ctx.textAlign = 'right';ctx.fillText(e.toFixed(2), left - 4, y(e) + 3);
    }
    ctx.strokeStyle = '#53c3eb';ctx.lineWidth = 2;ctx.beginPath();
    for (let i = 0; i <= 128; i++) {
      const theta = -Math.PI + i / 128 * 2 * Math.PI, e = m.identity + m.z * Math.cos(theta) + m.x * Math.sin(theta);
      if (i) ctx.lineTo(x(theta), y(e));else ctx.moveTo(x(theta), y(e));
    }
    ctx.stroke();ctx.lineWidth = 1;
    const marker = (theta, e, color) => { ctx.fillStyle = color;ctx.beginPath();ctx.arc(x(theta), y(e), 3, 0, 2 * Math.PI);ctx.fill(); };
    if (example.training && !example.edited) marker(example.training.best.theta, example.training.best.energy, '#7dff9e');
    if (!example.edited) marker(example.theta, energy, '#ffc53d');
    ctx.textAlign = 'center';ctx.fillStyle = '#d2e3fa';
    for (const theta of [-Math.PI, 0, Math.PI]) ctx.fillText(thetaLabel(theta), x(theta), height - 5);
    ctx.fillText('θ', (left + right) / 2 + 13, height - 5);
  }

  function drawTeleport(width, height) {
    const { example, state, referenceState, results } = current;
    const input = inputBloch(example.input), receiver = qubitBloch(example.sent ? state : referenceState, 4);
    const panel = (center, titleText, values) => {
      ctx.textAlign = 'center';ctx.font = '11px system-ui';ctx.fillStyle = '#d2e3fa';ctx.fillText(titleText, center, 11);
      const radius = Math.min(80, width * .17);
      for (const [index, key] of ['x','y','z'].entries()) {
        const cy = 25 + index * Math.max(13, (height - 34) / 3);
        ctx.strokeStyle = '#354365';ctx.beginPath();ctx.moveTo(center - radius, cy);ctx.lineTo(center + radius, cy);ctx.stroke();
        ctx.strokeStyle = '#768bb4';ctx.beginPath();ctx.moveTo(center, cy - 5);ctx.lineTo(center, cy + 5);ctx.stroke();
        ctx.strokeStyle = ['#ff7fa3','#7dff9e','#53c3eb'][index];ctx.lineWidth = 5;ctx.beginPath();ctx.moveTo(center, cy);ctx.lineTo(center + radius * values[key], cy);ctx.stroke();ctx.lineWidth = 1;
        ctx.textAlign = 'right';ctx.fillStyle = '#d2e3fa';ctx.font = '9px system-ui';ctx.fillText(key.toUpperCase(), center - radius - 4, cy + 3);
      }
    };
    panel(width * .24, t('teleportSource'), input);panel(width * .76, t('teleportReceiver'), receiver);
    ctx.textAlign = 'center';ctx.fillStyle = '#ffc53d';ctx.font = '10px system-ui';
    const a = results.find(r => r.row === 2), b = results.find(r => r.row === 3);
    ctx.fillText((a ? a.value : '?') + '' + (b ? b.value : '?'), width / 2, height / 2 - 4);
    ctx.fillText(example.sent ? '→' : '⋯', width / 2, height / 2 + 10);
  }

  function drawChsh(width, height) {
    const { example, referenceState, state } = current;
    const stats = example.edited ? null : chshStatistics(example);
    const correlations = stats?.correlations ?? CHSH_PAIRS.map((_, i) => i === example.pair ? chshCorrelation(probabilities(referenceState ?? state)) : null);
    const left = 24, right = width * .57, top = 15, bottom = height - 20;
    const zero = (top + bottom) / 2, scale = (bottom - top) / 2, pitch = (right - left) / 4;
    ctx.font = '9px system-ui';ctx.textAlign = 'right';
    for (const value of [-1, 0, 1]) {
      const y = zero - value * scale;
      ctx.strokeStyle = '#354365';ctx.beginPath();ctx.moveTo(left, y);ctx.lineTo(right, y);ctx.stroke();
      ctx.fillStyle = '#a4b2d0';ctx.fillText(value, left - 4, y + 3);
    }
    correlations.forEach((e, i) => {
      const x = left + (i + .5) * pitch, barWidth = Math.min(34, pitch * .5);
      ctx.textAlign = 'center';ctx.fillStyle = '#cbd7ed';ctx.fillText('E' + CHSH_PAIRS[i].join(''), x, height - 5);
      if (e === null) return;
      const y = zero - e * scale, h = Math.max(1, Math.abs(y - zero));
      ctx.fillStyle = '#53c3eb';ctx.fillRect(x - barWidth / 2, Math.min(y, zero), barWidth, h);
      if (i === example.pair) { ctx.strokeStyle = '#fff';ctx.strokeRect(x - barWidth / 2 - 1, Math.min(y, zero) - 1, barWidth + 2, h + 2); }
      ctx.fillStyle = '#d2e3fa';ctx.fillText(e.toFixed(3), x, 10);
      if (example.sample && !example.edited) {
        ctx.fillStyle = '#ffc53d';ctx.beginPath();ctx.arc(x, zero - example.sample.correlations[i] * scale, 2.5, 0, Math.PI * 2);ctx.fill();
      }
    });
    const start = width * .64, end = width - 14, y = height * .5;
    const x = value => start + value / 4 * (end - start);
    ctx.fillStyle = '#354365';ctx.fillRect(start, y - 2, end - start, 4);
    ctx.fillStyle = '#61718a55';ctx.fillRect(start, y - 6, x(2) - start, 12);
    ctx.textAlign = 'center';ctx.font = '9px system-ui';
    for (const [value, label] of [[0,'0'],[2,'2'],[2 * Math.SQRT2,'2√2'],[4,'4']]) {
      ctx.strokeStyle = value === 2 ? '#ffc53d' : '#768bb4';ctx.beginPath();ctx.moveTo(x(value), y - 8);ctx.lineTo(x(value), y + 8);ctx.stroke();
      ctx.fillStyle = '#cbd7ed';ctx.fillText(label, x(value), height - 5);
    }
    ctx.fillStyle = '#53c3eb';ctx.font = '11px system-ui';ctx.fillText(t('chshTheory') + ' |S|=' + (stats ? Math.abs(stats.s).toFixed(3) : '—'), (start + end) / 2, 12);
    if (stats) { ctx.beginPath();ctx.arc(x(Math.abs(stats.s)), y, 4, 0, Math.PI * 2);ctx.fill(); }
    if (example.sample && stats) {
      const s = Math.abs(example.sample.s), error = example.sample.standardError;
      ctx.fillStyle = '#ffc53d';ctx.font = '10px system-ui';ctx.fillText(t('chshEstimate') + ' |S|=' + s.toFixed(3), (start + end) / 2, 25);
      ctx.strokeStyle = '#ffc53d';ctx.beginPath();ctx.moveTo(x(Math.max(0,s - error)), y + 12);ctx.lineTo(x(Math.min(4,s + error)), y + 12);ctx.stroke();
      ctx.fillStyle = '#ffc53d';ctx.beginPath();ctx.arc(x(s), y + 12, 3, 0, Math.PI * 2);ctx.fill();
    }
  }

  function draw() {
    if (!current || stage.hidden) return;
    const { state, results, example, preview } = current;
    const p = probabilities(state);
    const width = canvas.clientWidth, height = canvas.clientHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);
    if (!preview && example?.kind === 'chsh') { drawChsh(width, height);return; }
    if (!preview && example?.kind === 'vqe') { drawVqe(width, height);return; }
    if (!preview && example?.kind === 'teleport') { drawTeleport(width, height);return; }
    const registerWidth = preview ? null : example?.kind === 'phase' ? 4 : example?.kind === 'period' ? example.readoutBits : null;
    const bins = registerWidth ? registerProbabilities(p, registerWidth) : p;
    const qaoa = !preview && example?.kind === 'qaoa';
    const selected = qaoa ? candidate(current, p) : null;
    const stats = qaoa ? qaoaStatistics(p, example.graph) : null;
    const measured = registerWidth ? measuredRegister(results, registerWidth) : current.measured;
    const dialWidth = !preview && example?.kind === 'phase' ? Math.min(150, width * .22) : 0;
    const left = dialWidth + 35, right = width - 12, top = qaoa ? 10 : 20, bottom = Math.max(42, height - (qaoa ? 23 : 33));
    const graphHeight = Math.max(12, bottom - top);
    const ceiling = qaoa ? Math.max(.125, Math.ceil(Math.max(...bins) * 8) / 8) : 1;
    ctx.font = '10px system-ui';
    ctx.textAlign = 'right';
    for (const fraction of [0, .5, 1]) {
      const y = bottom - graphHeight * fraction, value = fraction * ceiling;
      ctx.strokeStyle = '#354365';
      ctx.beginPath();ctx.moveTo(left, y);ctx.lineTo(right, y);ctx.stroke();
      ctx.fillStyle = '#a4b2d0';ctx.fillText(Math.round(value * 1000) / 10 + '%', left - 4, y + 3);
    }
    const pitch = Math.max(1, (right - left) / bins.length);
    const sparsePreview = preview && bins.filter((p) => p > .01).length < 5;
    for (let index = 0; index < bins.length; index++) {
      const x = left + index * pitch;
      const barHeight = bins[index] / ceiling * graphHeight;
      ctx.fillStyle = measured === index ? '#ffc53d' : qaoa && cutValue(index, example.graph) === stats.optimum ? '#7dff9e' : '#53c3eb';
      ctx.fillRect(x + 2, bottom - barHeight, Math.max(1, pitch - 4), Math.max(1, barHeight));
      if (selected === index && measured === null) {
        ctx.strokeStyle = '#fff';ctx.strokeRect(x + 1, bottom - barHeight - 1, Math.max(2, pitch - 2), Math.max(2, barHeight + 2));
      }
      ctx.textAlign = 'center';
      ctx.font = (bins.length === 32 ? '8' : '10') + 'px ui-monospace, monospace';
      ctx.fillStyle = '#cbd7ed';
      const label = registerWidth ? index + '/' + bins.length : index.toString(2).padStart(5, '0');
      if ((!preview || bins[index] > .01) && (!qaoa || pitch >= 18 || index === selected || index % 8 === 0)) {
        ctx.fillText(label, x + pitch / 2, bottom + 15, sparsePreview ? 32 : Math.max(8, pitch - 1));
      }
      if (bins[index] > .01 && (!qaoa || pitch >= 18 || index === selected)) {
        ctx.fillText(Math.round(bins[index] * 100) + '%', x + pitch / 2, Math.max(12, bottom - barHeight - 5), sparsePreview ? 32 : Math.max(8, pitch));
      }
    }
    if (dialWidth && example?.kind === 'phase') {
      const x = dialWidth / 2, y = height / 2, radius = Math.max(12, Math.min(dialWidth * .36, height * .32));
      ctx.strokeStyle = '#768bb4';ctx.beginPath();ctx.arc(x, y, radius, 0, Math.PI * 2);ctx.stroke();
      for (let tick = 0; tick < 16; tick++) {
        const angle = tick / 16 * 2 * Math.PI - Math.PI / 2;
        ctx.beginPath();ctx.moveTo(x + Math.cos(angle) * radius * .88, y + Math.sin(angle) * radius * .88);
        ctx.lineTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);ctx.stroke();
      }
      const hand = (turns, color, length) => {
        const angle = turns * 2 * Math.PI - Math.PI / 2;
        ctx.strokeStyle = color;ctx.lineWidth = 3;ctx.beginPath();ctx.moveTo(x,y);
        ctx.lineTo(x + Math.cos(angle) * radius * length, y + Math.sin(angle) * radius * length);ctx.stroke();ctx.lineWidth = 1;
      };
      hand(example.turns, '#53c3eb', .95);
      if (measured !== null) hand(measured / 16, '#ffc53d', .72);
      ctx.fillStyle = '#b8c8e4';ctx.textAlign = 'center';ctx.font = '11px system-ui';ctx.fillText('0', x, y - radius - 7);
    }
  }

  function render(data) {
    current = data;
    const { state, results, example, preview } = data;
    const showGraph = example?.kind === 'qaoa' && !preview;
    stage.dataset.qaoa = String(showGraph);graphView.hidden = !showGraph;
    if (showGraph) drawCut(example.graph, candidate(data, probabilities(state)), results, data.measured !== null);
    canvas.setAttribute('aria-label', t('advancedCanvasLabel'));
    title.textContent = t(example?.kind === 'phase' ? 'phaseEstimationTitle' : example?.kind === 'period' ? 'periodFindingTitle' : example?.kind === 'qaoa' ? 'qaoaTitle' : example?.kind === 'vqe' ? 'vqeTitle' : example?.kind === 'teleport' ? 'teleportTitle' : example?.kind === 'chsh' ? 'chshTitle' : 'advancedStateTitle');
    if (example?.kind === 'period') title.textContent = fill(title.textContent, example);
    if (example) title.textContent += ' · ' + t(preview ? 'viewInitial' : results.length ? 'viewMeasured' : 'viewOutput');
    if (!preview && example?.training && !example.edited) title.textContent += ' · ' + t(example.training.displayingBest ? 'qaoaBestView' : 'qaoaTrialView');
    title.title = title.textContent;
    meter.innerHTML = Array.from({ length: 5 }, (_, row) => {
      const before = example?.kind === 'teleport' && !example.sent && !preview && row === 4;
      const p = qubitProbabilities(before ? data.referenceState : state, row);
      const result = results.find((item) => item.row === row);
      return '<div class="advanced-qubit" data-qubit="' + qubitLabel(row, 5) + '" data-measured="' + Boolean(result) + '">'
        + '<strong>' + qubitLabel(row, 5) + (result ? ' = ' + result.value : '') + '</strong>'
        + '<span>' + t(before ? 'teleportBefore' : result ? 'qubitMeasured' : 'qubitUnmeasured') + '</span>'
        + '<div>0: ' + Math.round(p[0] * 100) + '% ／ 1: ' + Math.round(p[1] * 100) + '%</div></div>';
    }).join('');
    const training = ['qaoa','vqe'].includes(example?.kind) && !example.edited ? example.training : null;
    meter.dataset.training = String(Boolean(training));
    if (training) meter.insertAdjacentHTML('beforeend', trainingHistory(training));
    if (preview) {
      const index = probabilities(state).findIndex((p) => p > 1 - 1e-8);
      readout.textContent = (index >= 0 ? '|' + index.toString(2).padStart(5, '0') + '⟩。 ' : '') + t(example?.kind === 'qaoa' && !example.edited ? 'qaoaPreview' : 'initialStatePreview');
    } else if (example?.kind === 'chsh') {
      if (example.edited) {
        readout.textContent = fill(t('chshEdited'), { e: chshCorrelation(probabilities(data.referenceState ?? state)).toFixed(3) });
      } else {
        const stats = chshStatistics(example);
        readout.textContent = fill(t('chshReadout'), { e0: stats.correlations[0].toFixed(3), e1: stats.correlations[1].toFixed(3), e2: stats.correlations[2].toFixed(3), e3: stats.correlations[3].toFixed(3), s: Math.abs(stats.s).toFixed(3) });
        if (example.sample) readout.textContent += ' ' + fill(t('chshEstimated'), { shots: example.sample.shots, s: Math.abs(example.sample.s).toFixed(3), error: example.sample.standardError.toFixed(3) });
      }
      const a = results.find(r => r.row === 3), b = results.find(r => r.row === 4);
      if (a && b) readout.textContent += ' ' + fill(t('chshOutcome'), { a: a.value, b: b.value, sign: a.value === b.value ? '+1' : '−1' });
      canvas.setAttribute('aria-label', title.textContent + '。' + readout.textContent);
    } else if (example?.kind === 'vqe') {
      const energy = vqeEnergy(data.referenceState ?? state, example.molecule), reference = referenceEnergy(example.molecule);
      readout.textContent = fill(t('vqeReadout'), { energy: energy.toFixed(6), reference: reference.toFixed(6), gap: (energy - reference).toFixed(6) });
    } else if (example?.kind === 'teleport') {
      const a = results.find(r => r.row === 2), b = results.find(r => r.row === 3);
      const ready = Boolean(a && b);
      const shown = example.sent ? state : data.referenceState;
      const key = example.corrected ? 'teleportDone' : example.sent ? 'teleportReceived' : ready ? 'teleportReady' : 'teleportStart';
      readout.textContent = fill(t(key), { a: a?.value, b: b?.value }) + ' ' + fill(t('teleportMatch'), { pct: (teleportFidelity(shown, example.input) * 100).toFixed(1) });
    } else if (example?.kind === 'qaoa') {
      const p = probabilities(state), value = candidate(data, p);
      const stats = qaoaStatistics(probabilities(data.referenceState ?? state), example.graph);
      readout.textContent = fill(t('qaoaStats'), { expected: stats.expected.toFixed(2), baseline: stats.baseline,
        probability: (stats.optimalProbability * 100).toFixed(1), baselineProbability: (stats.baselineOptimalProbability * 100).toFixed(1),
        optimum: stats.optimum, totalWeight: totalEdgeWeight(example.graph) });
      readout.textContent += ' ' + fill(t(data.measured === null ? 'qaoaCandidate' : 'qaoaMeasured'), {
        bits: value.toString(2).padStart(5, '0'), score: cutValue(value, example.graph) });
      if (results.length && data.measured === null) readout.textContent += ' ' + fill(t('qaoaPartial'), { count: results.length });
      readout.textContent += ' ' + t('qaoaLegend');
      if (training?.done && !training.displayingBest) readout.textContent += ' ' + t('qaoaFinishHint');
      canvas.setAttribute('aria-label', title.textContent + '。' + readout.textContent);
    } else if (example?.kind === 'phase') {
      const value = measuredRegister(results, 4);
      readout.textContent = value === null ? t('phaseInitial') : t('phaseAnswer')
        .replace('{bits}', value.toString(2).padStart(4, '0')).replace('{value}', value).replace('{angle}', thetaLabel(value * Math.PI / 8));
    } else if (example?.kind === 'period' && !example.edited) {
      const value = measuredRegister(results, example.readoutBits);
      const range = (start, end) => start === end ? 'q' + start : 'q' + start + '–q' + end;
      if (value === null) {
        readout.textContent = fill(t('periodInitial'), { ...example,
          readout: range(4, 5 - example.readoutBits), work: range(example.workBits - 1, 0), denominator: 2 ** example.readoutBits });
      } else {
        const sample = periodSample(value, example);
        const values = { ...example, ...sample, value, denominator: 2 ** example.readoutBits };
        if (sample.status === 'zero') readout.textContent = t('periodRetry');
        else if (sample.status === 'insufficient') readout.textContent = fill(t('periodInsufficient'), values);
        else {
          readout.textContent = fill(t('periodAnswer'), values);
          readout.textContent += ' ' + fill(t(sample.factor ? 'periodFactors' : 'periodNoFactors'), values);
        }
      }
    } else {
      readout.textContent = data.measured === null ? t(results.length ? 'individualPartial' : 'advancedInitial')
        : '|' + data.measured.toString(2).padStart(5, '0') + '⟩';
    }
    if (example?.edited) readout.textContent = t(example.kind === 'phase' ? 'phaseExampleEdited' : 'exampleEdited') + ' ' + readout.textContent;
    draw();
  }
  new ResizeObserver(draw).observe(canvas);
  return { render, renderLanguage: () => { if (current) render(current); } };
}

const fill = (template, values) => template.replace(/\{(\w+)\}/g, (_, key) => String(values[key]));
