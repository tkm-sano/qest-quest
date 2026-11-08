// A display-only choice: never change the simulated state or the phases used by lessons.
// Use the same visibility threshold as the cylinder meters. Keep the chosen reference
// even when it vanishes; the UI explains why the relative view is unavailable.
export function phaseDisplay(probs, phases, { relative = false, reference = 0 } = {}) {
  const available = Number.isInteger(reference) && reference >= 0 && reference < probs.length
    && Math.round(probs[reference] * 100) > 0;
  const applied = relative && available;
  const offset = applied ? phases[reference] : 0;
  return { phases: Float64Array.from(phases, angle => Math.atan2(Math.sin(angle - offset), Math.cos(angle - offset))),
    applied, available };
}
