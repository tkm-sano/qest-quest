import test from 'node:test';
import assert from 'node:assert/strict';
import { CHSH_PAIRS, chshRecipe, chshStatistics, chshValue, sampleChsh } from '../js/quantum/chsh.js';
import { createCircuit, loadCircuitRecipe, evaluate } from '../js/quantum/circuit.js';
import { probabilities, qubitProbabilities } from '../js/quantum/state.js';
import { preparationColumns } from '../js/quantum/advanced.js';
const near = (a,b) => assert.ok(Math.abs(a-b)<1e-10, `${a} != ${b}`);

test('CHSH Bell circuits reproduce all four analytic correlators and the 2sqrt2 bound', () => {
  for (let step = 0; step <= 32; step++) {
    const theta = step * Math.PI / 16;
    const stats = chshStatistics({ theta, entangled: true });
    CHSH_PAIRS.forEach(([a,b], i) => near(stats.correlations[i], Math.cos(a*Math.PI/2 - (b ? -theta : theta))));
    near(stats.s, 2*(Math.cos(theta)+Math.sin(theta)));
    assert.ok(Math.abs(stats.s)<=2*Math.SQRT2+1e-10);
  }
  near(chshStatistics().s, 2*Math.SQRT2);
  near(chshStatistics({theta:0}).s, 2);
  near(chshStatistics({theta:Math.PI/2}).s, 2);
});

test('product-state circuits and all deterministic local strategies obey the local bound', () => {
  for (let step = 0; step <= 32; step++) {
    const theta = step*Math.PI/16;
    const stats = chshStatistics({ theta, entangled: false });
    CHSH_PAIRS.forEach(([a,b],i) => near(stats.correlations[i], Math.cos(a*Math.PI/2)*Math.cos(b ? -theta : theta)));
    assert.ok(Math.abs(stats.s)<=2+1e-10);
  }
  for (let strategy=0; strategy<16; strategy++) {
    const values=Array.from({length:4},(_,i)=>(strategy>>i)&1?1:-1);
    const [a0,a1,b0,b1]=values;
    assert.equal(Math.abs(chshValue([a0*b0,a0*b1,a1*b0,a1*b1])),2);
  }
});

test('preparation is shared across settings, rotations are explicit, and spectators remain zero', () => {
  const circuit=createCircuit(16,5);
  for(let pair=0;pair<4;pair++) {
    loadCircuitRecipe(circuit,chshRecipe({pair}));
    const prepared=probabilities(evaluate(circuit,preparationColumns({kind:'chsh'})));
    near(prepared[0],.5);near(prepared[3],.5);
    assert.equal(circuit[3][2].gateId,'RY');assert.equal(circuit[4][2].gateId,'RY');
    const state=evaluate(circuit),p=probabilities(state);
    near(p.slice(4).reduce((a,b)=>a+b,0),0);
    near(qubitProbabilities(state,3)[0],.5);near(qubitProbabilities(state,4)[0],.5);
  }
});

test('repeated measurements use independent preparations and report counts and sampling error', () => {
  let seed=123456;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
  const sample=sampleChsh({theta:Math.PI/4,entangled:true},4096,random);
  for(const counts of sample.counts)assert.equal(counts.reduce((a,b)=>a+b,0),4096);
  assert.ok(Math.abs(sample.s-2*Math.SQRT2)<.1);
  assert.ok(sample.standardError>0&&sample.standardError<.04);
  const controlled=sampleChsh({},16,()=>0);
  assert.deepEqual(controlled.counts,Array.from({length:4},()=>[16,0,0,0]));
  assert.equal(controlled.s,2);
  assert.throws(()=>sampleChsh({},1),RangeError);
});
