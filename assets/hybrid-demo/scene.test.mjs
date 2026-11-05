import assert from 'node:assert/strict';
import {test} from 'node:test';
import {duration, stateAt} from './scene.mjs';

test('absolute-time state clamps and survives out-of-order seeking', () => {
  assert.deepEqual(stateAt(-1), stateAt(0)); assert.deepEqual(stateAt(100), stateAt(duration));
  const expected = stateAt(5.1); stateAt(11); stateAt(0);
  assert.deepEqual(stateAt(5.1), expected);
});
test('energy arrives before the lamp settles; layer reveal waits for the explanation', () => {
  assert.equal(stateAt(3.6).travel, 0); assert.equal(stateAt(6.2).travel, 1);
  assert.equal(stateAt(6.1).light, 0); assert.equal(stateAt(6.8).light, 1);
  assert.equal(stateAt(8.6).reveal, 0); assert.equal(stateAt(9.7).reveal, 1);
  assert.equal(stateAt(11).energy, 0); assert.equal(stateAt(11).outro, 1);
});
test('720-frame timeline has finite bounded state, forward energy and a smooth reveal', () => {
  let previous = stateAt(0);
  for (let frame = 1; frame <= duration * 60; frame++) {
    const state = stateAt(frame / 60);
    for (const [name, value] of Object.entries(state)) {
      assert.ok(Number.isFinite(value), name);
      if (!['t', 'camera'].includes(name)) assert.ok(value >= 0 && value <= 1, name);
    }
    assert.ok(state.travel >= previous.travel && state.travel - previous.travel < 0.011);
    assert.ok(state.reveal >= previous.reveal && state.reveal - previous.reveal < 0.024);
    previous = state;
  }
});
