import assert from 'node:assert/strict';
import {test} from 'node:test';
import {duration, stateAt} from './scene.mjs';

test('timeline clamps at both ends and is independent of call order', () => {
  assert.deepEqual(stateAt(-2), stateAt(0));
  assert.deepEqual(stateAt(20), stateAt(duration));
  const first = stateAt(4.2);
  stateAt(7); stateAt(0.1);
  assert.deepEqual(stateAt(4.2), first);
});
test('energy reaches the lamp before it lights; annotation leaves on arrival', () => {
  assert.equal(stateAt(3.5).travel, 0);
  assert.equal(stateAt(6).travel, 1);
  assert.equal(stateAt(5.8).lamp, 0);
  assert.equal(stateAt(6.4).lamp, 1);
  assert.equal(stateAt(6.4).energy, 0);
});
test('60 fps samples remain finite and travel is continuous and monotonic', () => {
  let previous = 0;
  for (let frame = 0; frame <= duration * 60; frame++) {
    const state = stateAt(frame / 60);
    for (const value of Object.values(state).filter(v => typeof v === 'number')) assert.ok(Number.isFinite(value));
    assert.ok(state.travel >= previous && state.travel - previous < 0.011);
    previous = state.travel;
  }
});
