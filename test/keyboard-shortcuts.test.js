import test from 'node:test';
import assert from 'node:assert/strict';
import { installKeyboardShortcuts } from '../js/ui/keyboard-shortcuts.js';

function setup() {
  const listeners = new Map();
  const state = { selected: null, allowed: ['X','Y','Z','H','R','G','CP','CNOT','CCNOT'], busy: false, dragging: false, modal: false, actions: [] };
  const doc = {
    addEventListener(type, callback) { listeners.set(type, callback); },
    querySelector() { return state.modal; },
  };
  installKeyboardShortcuts({ document: doc,
    allowedGates: () => state.allowed, selectedGate: () => state.selected,
    holdGate(id) { state.selected = id;return true; },
    measure() { state.selected = null;state.actions.push('measure');return true; },
    release() { state.selected = null;state.actions.push('release');return true; },
    next() { state.selected = null;state.actions.push('next');return true; },
    isBusy: () => state.busy, isDragging: () => state.dragging,
  });
  const key = (key, props = {}) => {
    const event = { key, target: { closest: () => false }, prevented: false,
      preventDefault() { this.prevented = true; }, ...props };
    listeners.get('keydown')(event);return event;
  };
  return { state, key, pointer: () => listeners.get('pointerdown')() };
}

test('gate keys switch the held tool without measuring or placing, and unavailable keys leave it alone', () => {
  const { state, key } = setup();
  key('x');assert.equal(state.selected, 'X');
  key('z');assert.equal(state.selected, 'Z');
  key('z');assert.equal(state.selected, 'Z');
  key('q');assert.equal(state.selected, 'Z');
  state.allowed = ['X','Z'];key('h');assert.equal(state.selected, 'Z');
  assert.deepEqual(state.actions, []);
  key('Escape');assert.equal(state.selected, null);
});

test('consecutive C presses cycle CX and CCX, with a fresh CX after placement or another tool', () => {
  const { state, key, pointer } = setup();
  for (const expected of ['CNOT','CCNOT','CNOT']) { key('c');assert.equal(state.selected, expected); }
  state.selected = null;pointer();key('c');assert.equal(state.selected, 'CNOT');
  key('x');key('c');assert.equal(state.selected, 'CNOT');
  state.allowed = ['CNOT'];key('c');assert.equal(state.selected, 'CNOT');
});

test('Enter measures, Shift+Enter advances even from a button, Escape releases, and N also advances', () => {
  const { state, key } = setup();
  key('Enter');
  key('Enter', { shiftKey: true, target: { closest: selector => selector.includes('button') } });
  key('Escape');key('n');
  assert.deepEqual(state.actions, ['measure','next','release','next']);
  const native = key('Enter', { target: { closest: selector => selector.includes('button') } });
  assert.equal(native.prevented, false);
  assert.equal(state.actions.length, 4);
});

test('shortcuts respect text entry, dialogs, modifiers, composition, key repeat and in-progress interactions', () => {
  const { state, key } = setup();
  for (const props of [{ repeat: true },{ isComposing: true },{ keyCode: 229 },{ ctrlKey: true },{ metaKey: true },{ altKey: true },{ defaultPrevented: true },{ target: { isContentEditable: true } },{ target: { closest: selector => selector.includes('input') } }]) {
    key('x', props);key('Enter', props);key('Enter', { ...props, shiftKey: true });
  }
  state.modal = true;key('x');key('Enter');key('Enter', { shiftKey: true });key('Escape');
  state.modal = false;state.busy = true;key('x');key('Enter');key('Enter', { shiftKey: true });key('Escape');
  state.busy = false;state.dragging = true;key('x');key('Enter');key('Enter', { shiftKey: true });
  assert.equal(state.selected, null);assert.deepEqual(state.actions, []);
  key('Escape');assert.deepEqual(state.actions, ['release']);
});
