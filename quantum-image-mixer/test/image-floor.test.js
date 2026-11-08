import test from 'node:test';
import assert from 'node:assert/strict';
import { blendPixels } from '../js/ui/image-floor.js';

test('image blend uses the same ideal probabilities shown by the meter', () => {
  const forest = new Uint8ClampedArray([20, 100, 40, 255]);
  const sea = new Uint8ClampedArray([100, 20, 200, 255]);
  assert.deepEqual([...blendPixels([forest, sea], [1, 0])], [20, 100, 40, 255]);
  assert.deepEqual([...blendPixels([forest, sea], [0, 1])], [100, 20, 200, 255]);
  assert.deepEqual([...blendPixels([forest, sea], [.5, .5])], [60, 60, 120, 255]);
});
