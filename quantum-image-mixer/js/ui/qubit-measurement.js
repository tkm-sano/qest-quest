import { NUM_QUBITS, qubitProbabilities } from '../quantum/state.js';
import { t } from '../i18n.js';

export const qubitLabel = (row, count = NUM_QUBITS) => `q${count - 1 - row}`;
export const measurementLabel = (row, count = NUM_QUBITS) => t('measureQubit').replace('{qubit}', qubitLabel(row, count));

export function renderQubitMeasurement(panel, { plan, results, state, ready }) {
  panel.hidden = !plan;
  if (!plan) { panel.innerHTML = ''; return; }
  const cards = plan.rows.map((row) => {
    const result = results.find((item) => item.row === row);
    const p = qubitProbabilities(state, row);
    return `<div class="qubit-readout" data-qubit="${qubitLabel(row)}" data-state="${result ? 'measured' : 'waiting'}">
      <span class="qubit-name">${qubitLabel(row)}</span>
      <span class="qubit-state">${t(result ? 'qubitMeasured' : 'qubitUnmeasured')}</span>
      <strong>${result ? `${qubitLabel(row)} = ${result.value}` : `0: ${Math.round(p[0] * 100)}%<br>1: ${Math.round(p[1] * 100)}%`}</strong>
    </div>`;
  }).join('');
  const pair = results.filter((result) => plan.requiredRows.includes(result.row));
  let message;
  if (plan.kind === 'free') {
    message = t(results.length === 0 ? 'individualStart' : results.length === 3 ? 'individualComplete' : 'individualPartial');
  } else {
    message = !ready ? t('partialNotReady')
      : results.length === 0 ? t('partialStart')
      : pair.length === 0 ? t('partialSpectator')
      : pair.length === 1 ? t('partialAfterFirst')
        .replaceAll('{first}', qubitLabel(pair[0].row))
        .replaceAll('{other}', qubitLabel(pair[0].row === 0 ? 2 : 0))
        .replaceAll('{value}', pair[0].value)
      : t('partialComplete').replaceAll('{value}', pair[0].value);
  }
  panel.innerHTML = `<div class="qubit-readouts">${cards}</div>
    <p class="partial-message" role="status">${message}</p>`;
}
