import test from 'node:test';
import assert from 'node:assert/strict';
import {motion, PERIOD, CENTRES, CRANK} from './mechanics.mjs';

test('one turn advances exactly one quarter turn', () => {
  for (let t = -8; t < 8; t += .1) assert.ok(Math.abs(motion(t + PERIOD).output - motion(t).output + Math.PI / 2) < 1e-10);
});
test('no discontinuity or backwards step at wrap', () => {
  let previous = motion(-8).output;
  for (let t = -8 + 1 / 600; t < 12; t += 1 / 600) {
    const next = motion(t).output;
    assert.ok(Math.abs(next - previous) < .01);
    assert.ok(next <= previous + 1e-10); previous = next;
  }
});
test('dwell is still and pin remains on its crank circle', () => {
  assert.equal(motion(1).output, motion(2).output);
  for (let t = 0; t < 8; t += .1) {
    const {pin} = motion(t);
    assert.ok(Math.abs(Math.hypot(pin[0] + CENTRES / 2, pin[1]) - CRANK) < 1e-10);
  }
});
