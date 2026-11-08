import { createCircuit, loadCircuitRecipe, evaluate } from './circuit.js';
import { qubitBloch } from './teleportation.js';
export { H2_MOLECULES } from './h2-data.js';

// H2の2つの電子配置をq0の|0>,|1>に符号化。他の4量子ビットは補助なし。
export function vqeRecipe(theta) {
  return [{ row: 4, col: 1, gateId: 'RY', theta }];
}

export function vqeEnergy(state, molecule) {
  const { x, z } = qubitBloch(state, 4);
  return molecule.identity + molecule.x * x + molecule.z * z;
}

export function referenceEnergy(molecule) {
  return molecule.identity - Math.hypot(molecule.x, molecule.z);
}

export function createVqeOptimizer({ molecule, theta, maxIterations = 96 }) {
  const circuit = createCircuit(16, 5);
  let iteration = 0, stepSize = Math.PI / 16, direction = 1, misses = 0, done = false;
  const score = (angle) => {
    const theta = ((angle + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
    loadCircuitRecipe(circuit, vqeRecipe(theta));
    const energy = vqeEnergy(evaluate(circuit), molecule);
    return { theta, energy, expected: energy, optimum: referenceEnergy(molecule) };
  };
  let best = score(theta), current = best;
  const history = [{ iteration, ...current, bestExpected: best.energy, improved: false, refined: false }];
  const snapshot = () => ({ kind: 'vqe', iteration, evaluations: iteration + 1, stepSize, done,
    current: { ...current }, best: { ...best }, history: history.map((p) => ({ ...p })) });
  return { snapshot, step() {
    if (done) return snapshot();
    current = score(best.theta + direction * stepSize);
    const improved = current.energy < best.energy - 1e-12;
    let refined = false;
    if (improved) { best = current;misses = 0; }
    else {
      direction *= -1;misses++;
      if (misses === 2) { misses = 0;stepSize /= 2;refined = true; }
    }
    iteration++;
    done = stepSize < Math.PI / 1024 || iteration >= maxIterations;
    history.push({ iteration, ...current, bestExpected: best.energy, improved, refined });
    return snapshot();
  } };
}
