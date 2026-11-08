const GATE_KEYS = { x:'X', y:'Y', z:'Z', h:'H', r:'R', g:'G', p:'CP' };

export function installKeyboardShortcuts({ document: doc = document, allowedGates, selectedGate,
  holdGate, measure, release, next, isBusy, isDragging }) {
  let lastGateKey = null;
  doc.addEventListener('pointerdown', () => { lastGateKey = null; });
  doc.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.repeat || event.isComposing || event.keyCode === 229
      || event.altKey || event.ctrlKey || event.metaKey) return;
    if (doc.querySelector('dialog[open]') || event.target?.isContentEditable
      || event.target?.closest('input,textarea,select,[contenteditable="true"],[role="textbox"]')) {
      lastGateKey = null;return;
    }
    if (isBusy()) return;
    const key = event.key.toLowerCase();
    if (key === 'escape') {
      lastGateKey = null;if (release()) event.preventDefault();return;
    }
    if (isDragging()) return;
    let gate = GATE_KEYS[key];
    if (key === 'c') gate = lastGateKey === 'c' && selectedGate() === 'CNOT'
      && allowedGates().includes('CCNOT') ? 'CCNOT' : 'CNOT';
    if (gate) {
      if (allowedGates().includes(gate) && holdGate(gate)) { lastGateKey = key;event.preventDefault(); }
      return;
    }
    lastGateKey = null;
    if (key === 'enter') {
      if (event.shiftKey) { next();event.preventDefault();return; }
      // Keep native activation for focused buttons/links. Gate selection moves
      // focus to the circuit, where Enter always means measurement.
      if (event.target?.closest('button,a,summary,[role="button"]')) return;
      if (measure()) event.preventDefault();
    } else if (key === 'n' && next()) event.preventDefault();
  });
}
