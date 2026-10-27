const {test} = require('node:test');
const assert = require('node:assert/strict');
const {initial, update} = require('../divider-logic.js');
const value = s => s.q.reduce((sum, bit, i) => sum + bit * 2 ** i, 0);
test('cuenta en caídas, conserva en subidas y recorre el módulo 16', () => {
  let state = initial();
  for (let count = 1; count <= 64; count++) {
    const before = structuredClone(state);
    const high = update(state, {clk: 1});
    assert.deepEqual(high.q, state.q);
    assert.deepEqual(update(high, {clk: 1}).q, state.q);
    state = update(high, {clk: 0});
    assert.equal(value(state), count % 16);
    assert.deepEqual(update(state, {clk: 0}).q, state.q);
    assert.deepEqual(before.q, high.q);
  }
});
test('cada etapa divide por dos y solo propaga sus caídas', () => {
  let state = initial();
  const changes = [0, 0, 0, 0];
  for (let pulse = 0; pulse < 32; pulse++) {
    const previous = state;
    state = update(update(state, {clk: 1}), {clk: 0});
    state.q.forEach((bit, i) => {
      if (bit !== previous.q[i]) changes[i]++;
      if (i && bit !== previous.q[i]) {
        assert.equal(previous.q[i - 1], 1);
        assert.equal(state.q[i - 1], 0);
      }
    });
  }
  assert.deepEqual(changes, [32, 16, 8, 4]);
});
test('no modifica el estado recibido y reinicia a cero', () => {
  const state = {...initial(), clk: 1, q: [1, 1, 1, 0]};
  const before = structuredClone(state);
  assert.deepEqual(update(state, {clk: 0}).q, [0, 0, 0, 1]);
  assert.deepEqual(state, before);
  assert.deepEqual(initial(), {q: [0, 0, 0, 0], clk: 0});
});
