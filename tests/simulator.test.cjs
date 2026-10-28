const {test} = require('node:test');
const assert = require('node:assert/strict');
const {compile, initial, step} = require('../simulator-logic.js');
const {examples} = require('../program-logic.js');
function split(source) {
  const lines = source.split('\n');
  const start = lines.findIndex(line => /^\s*[a-zA-Z_]\w*:\s*\d+\s*;?\s*$/.test(line));
  return [lines.slice(0, start).join('\n'), lines.slice(start).join('\n')];
}
function run(program) {
  let state = initial(program);
  for (let i = 0; i < 200 && !state.halted; i++) {
    state = step(program, state);
    if (state.event.waiting) return state;
  }
  return state;
}
test('los programas de ejemplo se ensamblan y ejecutan con sus resultados esperados', () => {
  const results = [15, 10, 7, 10, 1];
  examples.forEach((example, index) => {
    const program = compile(...split(example.source));
    const state = run(program);
    const variable = ['c', 'suma', 'resultado', 'acumulador', 'resultat'][index];
    assert.equal(state.memory[program.symbols[variable].address], results[index]);
    if (index === 2) { assert.equal(state.steps, 200); assert.ok([6, 7].includes(state.pc)); }
    else assert.equal(state.event.waiting, true);
  });
});
test('MOV y ADD actualizan Z, y una suma desborda en 16 bits', () => {
  const program = compile('MOV zero, out\nMOV max, out\nADD uno, out', 'zero: 0\nmax: 65535\nuno: 1\nout: 5');
  const original = initial(program);
  let state = step(program, original);
  assert.equal(state.z, 1); assert.equal(state.memory[103], 0);
  assert.equal(original.memory[103], 5);
  state = step(program, state); assert.equal(state.z, 0); assert.equal(state.memory[103], 65535);
  state = step(program, state); assert.equal(state.z, 1); assert.equal(state.memory[103], 0);
  assert.equal(state.halted, true); assert.equal(step(program, state), state);
});
test('CMP no escribe memoria y BEQ conserva Z tanto si salta como si no', () => {
  const program = compile('CMP a, b\nBEQ fin\nCMP a, a\nBEQ fin\nfin: BEQ fin', 'a: 1\nb: 2');
  let state = initial(program);
  const memory = [...state.memory];
  state = step(program, state); assert.equal(state.z, 0); assert.deepEqual(state.memory, memory); assert.equal(state.event.written, null);
  state = step(program, state); assert.equal(state.pc, 2); assert.equal(state.z, 0);
  state = step(program, state); assert.equal(state.z, 1);
  state = step(program, state); assert.equal(state.pc, 4); assert.equal(state.z, 1);
  state = step(program, state); assert.equal(state.event.waiting, true); assert.equal(state.pc, 4);
});
test('admite etiquetas aisladas, mayúsculas, comentarios y la dirección 127', () => {
  const program = compile('Inici:\nmov Zero, 127;\n# comentario\ncmp 127, zero\nbeq INICI;', 'ZERO:\n0;');
  assert.equal(program.code[0].instruction.destination, 127);
  assert.equal(program.code[2].instruction.destination, 0);
  const state = step(program, initial(program));
  assert.equal(state.event.written, 127); assert.equal(state.z, 1);
});
test('rechaza errores de sintaxis, etiquetas y direcciones fuera de sus zonas', () => {
  for (const [code, data] of [
    ['', 'a: 0'], ['MOV a, a', 'a: 65536'], ['MOV a, a', 'a: -1'],
    ['MOV a, a', 'a: 0\na: 1'], ['x: MOV a, a', 'x: 0\na: 1'],
    ['MOV falta, 100', ''], ['MOV 99, 100', ''], ['MOV 100, 128', ''],
    ['BEQ 1', ''], ['MOV fin, 100\nfin: BEQ fin', ''], ['BEQ a', 'a: 0'],
    ['NOP', ''], ['fin:', 'a: 0'], ['MOV 100, 100', 'fin:'],
    [Array(101).fill('MOV 100, 100').join('\n'), ''],
    ['MOV 100, 100', Array(29).fill('0').join('\n')]
  ]) assert.throws(() => compile(code, data));
});
test('permite exactamente 100 instrucciones y 28 datos y reinicia desde los originales', () => {
  const program = compile(Array(100).fill('ADD 100, 127').join('\n'), Array(28).fill('1').join('\n'));
  const state = run(program);
  assert.equal(state.memory[127], 101); assert.equal(state.steps, 100); assert.equal(state.pc, 100);
  assert.equal(initial(program).memory[127], 1); assert.equal(initial(program).z, 0);
});
