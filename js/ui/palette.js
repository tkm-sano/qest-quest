// ゲートパレット: 使用可能なゲートのトークンを表示し、選択状態を管理する。
import { GATES } from '../quantum/gates.js';
import { localized } from '../i18n.js';

export function createPalette(el) {
  let allowed = ['X', 'H', 'R'];
  let selected = null;

  function render() {
    el.innerHTML = '';
    for (const id of allowed) {
      const g = GATES[id];
      const item = document.createElement('div');
      item.className = 'palette-item';
      const tok = document.createElement('div');
      tok.className = 'gate-token palette-token';
      tok.dataset.gate = id;
      tok.style.background = g.color;
      tok.textContent = g.label;
      tok.title = localized(g, 'name');
      if (id === selected) tok.classList.add('selected');
      const cap = document.createElement('div');
      cap.className = 'palette-caption';
      cap.textContent = localized(g, 'caption');
      item.appendChild(tok);
      item.appendChild(cap);
      el.appendChild(item);
    }
  }

  render();

  return {
    el,
    render,
    setAllowed(gateIds) {
      allowed = gateIds;
      if (selected && !allowed.includes(selected)) selected = null;
      render();
    },
    getSelected: () => selected,
    toggleSelect(gateId) {
      selected = selected === gateId ? null : gateId;
      render();
    },
    clearSelect() {
      if (selected !== null) { selected = null; render(); }
    },
  };
}
