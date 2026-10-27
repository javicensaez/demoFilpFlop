const {test} = require('node:test');
const assert = require('node:assert/strict');
const {examples, assemble} = require('../program-logic.js');
const {decode} = require('../machine-logic.js');
test('el programa propuesto resuelve variables y saltos hacia delante y atrás', () => {
  const {rows, symbols} = assemble(examples[0].source, 70);
  assert.deepEqual({...symbols}, {bucle: 2, fi: 8, zero: 70, u: 71, i: 72, a: 73, b: 74, c: 75});
  assert.equal(rows.length, 15);
  assert.deepEqual(decode(rows[0].bits), {op: 'MOV', source: 70, destination: 75});
  assert.deepEqual(decode(rows[5].bits), {op: 'BEQ', source: 0, destination: 8});
  assert.equal(decode(rows[7].bits).destination, 2);
  assert.equal(decode(rows[8].bits).destination, 8);
  assert.equal(rows[12].bits, '0000000000000011');
});
test('todos los programas caben con todas las bases de 50 a 100 inclusive', () => {
  for (const example of examples) for (let base = 50; base <= 100; base++) {
    const {rows} = assemble(example.source, base);
    let instructionAddress = 0, dataAddress = base;
    for (const row of rows) {
      assert.equal(row.address, row.isData ? dataAddress++ : instructionAddress++);
      assert.match(row.bits, /^[01]{16}$/);
      assert.ok(row.address <= 127);
    }
  }
});
test('rechaza bases, etiquetas y datos inválidos', () => {
  for (const base of [49, 101, 70.5]) assert.throws(() => assemble(examples[0].source, base));
  assert.throws(() => assemble('MOV ausente, dato\ndato: 0', 50));
  assert.throws(() => assemble('a: 0\na: 1', 50));
  assert.throws(() => assemble('a: 65536', 50));
});
