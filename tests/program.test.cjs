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

test('acumulador conserva las direcciones originales a base 100 y relocaliza los datos', () => {
  const example = examples.find(item => item.name === 'Acumulador con etiquetas');
  const at100 = assemble(example.source, 100);
  assert.deepEqual({...at100.symbols}, {inici: 0, bucle: 2, fi: 8, zero: 100, uno: 101, n: 102, i: 103, acumulador: 104});
  assert.deepEqual(at100.rows.filter(row => !row.isData).map(row => decode(row.bits)), [
    {op: 'MOV', source: 100, destination: 103},
    {op: 'MOV', source: 100, destination: 104},
    {op: 'ADD', source: 101, destination: 103},
    {op: 'ADD', source: 103, destination: 104},
    {op: 'CMP', source: 102, destination: 103},
    {op: 'BEQ', source: 0, destination: 8},
    {op: 'CMP', source: 100, destination: 100},
    {op: 'BEQ', source: 0, destination: 2},
    {op: 'BEQ', source: 0, destination: 8}
  ]);
  const relocated = assemble(example.source, 50);
  assert.deepEqual(decode(relocated.rows[0].bits), {op: 'MOV', source: 50, destination: 53});
  assert.equal(decode(relocated.rows[7].bits).destination, 2);
  assert.equal(relocated.rows.length, 14);
});

test('comparación por incremento conserva todas las instrucciones y los saltos originales', () => {
  const example = examples.find(item => item.name === 'Comparación por incremento');
  const original = ['MOV 100, 104', 'ADD 101, 104', 'CMP 102, 104', 'BEQ 8',
    'CMP 103, 104', 'BEQ 11', 'CMP 100, 100', 'BEQ 1', 'MOV 100, 105',
    'CMP 100, 100', 'BEQ 13', 'MOV 101, 105', 'CMP 100, 100', 'BEQ 13'];
  const {parseAssembly} = require('../machine-logic.js');
  for (const base of [50, 100]) {
    const {rows, symbols} = assemble(example.source, base);
    assert.deepEqual({...symbols}, {inici: 0, bucle: 1, trobat_a: 8, trobat_b: 11, fi: 13,
      zero: base, uno: base + 1, a: base + 2, b: base + 3, i: base + 4, resultat: base + 5});
    assert.equal(rows.length, 20);
    original.forEach((text, index) => {
      const expected = parseAssembly(text);
      if (expected.op !== 'BEQ') { expected.source += base - 100; expected.destination += base - 100; }
      assert.deepEqual(decode(rows[index].bits), expected);
    });
    assert.deepEqual(rows.filter(row => row.isData).map(row => parseInt(row.bits, 2)), [0, 1, 2, 1, 0, 0]);
  }
});
