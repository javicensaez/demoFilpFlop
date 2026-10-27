const {test} = require('node:test');
const assert = require('node:assert/strict');
const {operations, encode, decode, parseAssembly, assembly, equivalent} = require('../machine-logic.js');
test('ADD 5, 10 usa código, fuente y destino en ese orden', () => {
  assert.equal(encode(parseAssembly('ADD 5, 10')), '0000001010001010');
});
test('todas las operaciones y direcciones se convierten en ambos sentidos', () => {
  for (const op of operations) for (let source = 0; source < 128; source++) for (let destination = 0; destination < 128; destination++) {
    const original = {op, source, destination};
    const decoded = decode(encode(original));
    assert.ok(equivalent(original, decoded));
    assert.ok(equivalent(original, parseAssembly(assembly(decoded))));
  }
});
test('BEQ ignora todos los valores posibles del campo fuente', () => {
  for (let source = 0; source < 128; source++) {
    const decoded = decode('11' + source.toString(2).padStart(7, '0') + '1111111');
    assert.equal(assembly(decoded), 'BEQ 127');
    assert.ok(equivalent(decoded, parseAssembly('BEQ 127')));
    assert.equal(encode(decoded), '1100000001111111');
  }
});
test('acepta espacios y minúsculas y rechaza instrucciones y direcciones inválidas', () => {
  assert.equal(assembly(parseAssembly(' mov 0 , 127 ')), 'MOV 0, 127');
  assert.equal(assembly(decode('10 0000000 1111111')), 'MOV 0, 127');
  for (const input of ['ADD 128, 0', 'CMP 0, 128', 'MOV -1, 0', 'BEQ 128', 'BEQ 1, 2', 'ADD 1', 'NOP 0', 'MOV 1.5, 2']) assert.throws(() => parseAssembly(input));
  for (const input of ['', '0'.repeat(15), '0'.repeat(17), '10 0000000 1111112']) assert.throws(() => decode(input));
});
