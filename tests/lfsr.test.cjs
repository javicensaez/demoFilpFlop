const {test} = require('node:test');
const assert = require('node:assert/strict');
const {initial, inputs, update} = require('../lfsr-logic.js');
const word = q => [...q].reverse().join('');
const pulse = state => update(update(state, {clk: 1}), {clk: 0});
test('todas las semillas no nulas recorren exactamente 15 estados', () => {
  for (let seed = 1; seed < 16; seed++) {
    const start = seed.toString(2).padStart(4, '0');
    let state = update(initial(), {seed: start});
    const seen = new Set();
    for (let count = 0; count < 15; count++) {
      const value = word(state.q);
      assert.notEqual(value, '0000'); assert.ok(!seen.has(value)); seen.add(value);
      state = pulse(state);
    }
    assert.equal(word(state.q), start); assert.equal(seen.size, 15);
  }
});
test('el desplazamiento y la XOR usan simultáneamente el estado anterior', () => {
  let state = initial();
  for (const expected of ['1000', '0100', '0010', '1001', '1100']) {
    state = pulse(state); assert.equal(word(state.q), expected);
  }
  assert.deepEqual(inputs([1, 1, 0, 1]), [1, 0, 1, 0]);
});
test('no cambia sin subida y 0000 queda bloqueado', () => {
  const high = update(initial(), {clk: 1});
  assert.deepEqual(update(high, {clk: 1}).q, high.q);
  assert.deepEqual(update(high, {clk: 0}).q, high.q);
  let zero = update(initial(), {seed: '0000'});
  for (let i = 0; i < 20; i++) zero = pulse(zero);
  assert.equal(word(zero.q), '0000');
  for (const seed of ['1', '00000', 'abc0']) assert.throws(() => update(initial(), {seed}));
});
test('INIT bajo carga 0001 inmediatamente, tiene prioridad y no avanza al liberarlo', () => {
  let state = update(initial(), {seed: '1111'});
  state = update(state, {resetN: 0, clk: 1});
  assert.equal(word(state.q), '0001');
  state = update(state, {clk: 0}); state = update(state, {clk: 1});
  assert.equal(word(state.q), '0001');
  state = update(state, {resetN: 1});
  assert.equal(word(state.q), '0001');
  state = pulse(state); // CLK ya era alto: solo baja, sin nueva subida.
  assert.equal(word(state.q), '0001');
  assert.equal(word(pulse(state).q), '1000');
});
