import { createCircuit, loadCircuitRecipe } from '../quantum/circuit.js';

export const PHASE_COMPARISONS = ['original', 'global', 'relative'];

// Every operation, including the final interference, is visible in the editor.
// X → R(π) → X → R(π) = -I: all eight amplitudes acquire the same phase.
export function phaseComparisonRecipe(variant = 'original', interference = false) {
  if (!PHASE_COMPARISONS.includes(variant)) throw new RangeError('Unknown phase comparison');
  const gate = (row, col, gateId) => ({ row, col, gateId });
  const recipe = [0, 1, 2].map(row => gate(row, 0, 'H'));
  if (variant === 'global') {
    recipe.push(gate(0, 1, 'X'), { ...gate(0, 2, 'R'), theta: Math.PI },
      gate(0, 3, 'X'), { ...gate(0, 4, 'R'), theta: Math.PI });
  } else if (variant === 'relative') {
    recipe.push({ ...gate(0, 2, 'R'), theta: Math.PI });
  }
  if (interference) recipe.push(...[0, 1, 2].map(row => gate(row, 5, 'H')));
  return recipe;
}

export function phaseComparisonSignature(variant, interference) {
  const circuit = createCircuit();
  loadCircuitRecipe(circuit, phaseComparisonRecipe(variant, interference));
  return JSON.stringify(circuit);
}
