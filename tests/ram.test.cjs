const {test} = require('node:test');
const assert = require('node:assert/strict');
const {initial, update, enables, read} = require('../ram-logic.js');
test('decodificador: WE deshabilita todas las salidas y habilitado selecciona una sola', () => {
  for (let address = 0; address < 4; address++) {
    assert.deepEqual(enables({...initial(), address}), [0, 0, 0, 0]);
    assert.deepEqual(enables({...initial(), address, we: 1}), [0, 1, 2, 3].map(i => Number(i === address)));
  }
});
test('cada dirección guarda cualquier dato de 4 bits sin alterar los otros registros', () => {
  for (let address = 0; address < 4; address++) {
    for (let data = 0; data < 16; data++) {
      const state = {...initial(), words: [1, 2, 3, 4], address, data, we: 1};
      const before = structuredClone(state);
      const result = update(state, {clk: 1});
      assert.equal(read(result), data);
      result.words.forEach((word, i) => assert.equal(word, i === address ? data : state.words[i]));
      assert.deepEqual(state, before);
    }
  }
});
test('solo una subida con WE escribe; cambiar controles con CLK alto conserva la RAM', () => {
  let state = update(initial(), {data: 7, clk: 1});
  assert.deepEqual(state.words, [0, 0, 0, 0]);
  state = update(state, {we: 1});
  state = update(state, {data: 15, address: 3});
  state = update(state, {clk: 1});
  state = update(state, {clk: 0});
  assert.deepEqual(state.words, [0, 0, 0, 0]);
  state = update(state, {clk: 1});
  assert.deepEqual(state.words, [0, 0, 0, 15]);
  state = update(state, {data: 2, address: 1});
  assert.deepEqual(state.words, [0, 0, 0, 15]);
});
test('escribe cuatro palabras independientes y el MUX lee sin reloj ni WE', () => {
  let state = initial();
  for (let address = 0; address < 4; address++) {
    state = update(state, {clk: 0, address, data: address + 5, we: 1});
    state = update(state, {clk: 1});
  }
  state = update(state, {we: 0});
  for (let address = 0; address < 4; address++) {
    state = update(state, {address});
    assert.equal(read(state), address + 5);
    assert.deepEqual(state.words, [5, 6, 7, 8]);
  }
  assert.deepEqual(initial().words, [0, 0, 0, 0]);
});
test('rechaza direcciones y datos fuera del ancho del bus', () => {
  for (const address of [-1, 4, 1.5]) assert.throws(() => update(initial(), {address}), RangeError);
  for (const data of [-1, 16, 2.5]) assert.throws(() => update(initial(), {data}), RangeError);
});
