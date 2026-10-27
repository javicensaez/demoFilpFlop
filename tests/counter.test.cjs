const {test} = require('node:test');
const assert = require('node:assert/strict');
const {initial, excitation, update} = require('../counter-logic.js');
const value = state => state.q.reduce((sum, bit, i) => sum + bit * 2 ** i, 0);
test('cuenta los 16 estados y vuelve a cero con flancos ascendentes', () => {
  let state = initial();
  for (let count = 1; count <= 32; count++) {
    state = update(state, {clk: 1});
    assert.equal(value(state), count % 16);
    const falling = update(state, {clk: 0});
    assert.deepEqual(falling.q, state.q);
    state = falling;
  }
});
test('las excitaciones usan el estado anterior y conmutan simultáneamente', () => {
  assert.deepEqual(excitation([1, 1, 0, 0]), [1, 1, 1, 0]);
  const state = {...initial(), q: [1, 1, 1, 0]};
  assert.deepEqual(update(state, {clk: 1}).q, [0, 0, 0, 1]);
  assert.deepEqual(state.q, [1, 1, 1, 0]);
});
test('reset bajo borra inmediatamente, bloquea el conteo y no captura al liberarlo', () => {
  for (const clk of [0, 1]) {
    const state = {...initial(), clk, q: [1, 0, 1, 1]};
    let reset = update(state, {resetN: 0});
    assert.equal(value(reset), 0);
    reset = update(reset, {clk: 1 - clk});
    assert.equal(value(reset), 0);
    const released = update(reset, {resetN: 1});
    assert.equal(value(released), 0);
    const low = update(released, {clk: 0});
    assert.equal(value(update(low, {clk: 1})), 1);
  }
});
test('mantener el reloj alto no vuelve a contar y reset gana a una subida', () => {
  const high = update(initial(), {clk: 1});
  assert.equal(value(update(high, {clk: 1})), 1);
  assert.equal(value(update({...initial(), q: [1, 1, 1, 1]}, {clk: 1, resetN: 0})), 0);
});
