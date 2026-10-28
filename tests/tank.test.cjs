const {test} = require('node:test');
const assert = require('node:assert/strict');
const {outputs, step, sensors, advance} = require('../tank-logic.js');
test('reproduce las 14 transiciones del DOT y mantiene indefinidas las demás', () => {
  const expected = {
    APA: ['—', '—', 'B1', 'APA'], APB: ['—', '—', 'B2', 'APB'],
    B1: ['ENA', '—', 'B1', 'APB'], B2: ['ENB', '—', 'B2', 'APA'],
    ENA: ['ENA', '—', 'B2', '—'], ENB: ['ENB', '—', 'B1', '—']
  };
  for (const [state, targets] of Object.entries(expected)) ['00', '01', '10', '11'].forEach((input, index) => {
    const result = step(state, input);
    assert.equal(result.defined, targets[index] !== '—');
    assert.equal(result.state, targets[index] === '—' ? state : targets[index]);
    assert.equal(result.output, outputs[result.state]);
  });
});
test('salidas Moore exactas, sin intercambiar estados B1 y B2', () => {
  assert.deepEqual(outputs, {APA: '00', APB: '00', B1: '01', B2: '10', ENA: '11', ENB: '11'});
});
test('los recorridos por nivel bajo alternan las bombas según el DOT', () => {
  for (const [start, states] of [['APA', ['B1', 'ENA', 'B2', 'APA']], ['APB', ['B2', 'ENB', 'B1', 'APB']]]) {
    let state = start;
    ['10', '00', '10', '11'].forEach((input, i) => { state = step(state, input).state; assert.equal(state, states[i]); });
  }
});
test('sensores cubiertos, límites del nivel y balance de llenado y consumo', () => {
  for (const [level, input] of [[0,'00'],[29,'00'],[30,'10'],[74,'10'],[75,'11'],[100,'11']]) assert.equal(sensors(level), input);
  assert.equal(advance(85, '00', 6), 79);
  assert.equal(advance(50, '01', 6), 52);
  assert.equal(advance(50, '10', 6), 52);
  assert.equal(advance(20, '11', 6), 30);
  assert.equal(advance(99, '11', 0), 100);
  assert.equal(advance(1, '00', 20), 0);
});
test('el ciclo automático normal no requiere transiciones inventadas', () => {
  let state = 'APA', level = 85;
  const visited = new Set([state]);
  for (let i = 0; i < 200; i++) {
    const result = step(state, sensors(level));
    assert.ok(result.defined); state = result.state; visited.add(state);
    level = advance(level, result.output, 6);
  }
  for (const name of ['APA', 'APB', 'B1', 'B2']) assert.ok(visited.has(name));
});
