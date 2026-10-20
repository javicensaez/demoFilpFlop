const {test} = require('node:test');
const assert = require('node:assert/strict');
const {initial,update} = require('../register-logic.js');
test('PIPO captura simultáneamente los cuatro bits solo en subida', () => {
  let s = update(initial(),{d:[1,0,1,0]});
  assert.deepEqual(s.q,[0,0,0,0]);
  s = update(s,{clk:1});
  assert.deepEqual(s.q,[1,0,1,0]);
  s = update(s,{d:[0,1,0,1]});
  assert.deepEqual(s.q,[1,0,1,0]);
  s = update(s,{clk:0});
  assert.deepEqual(s.q,[1,0,1,0]);
  assert.deepEqual(update(s,{clk:1}).q,[0,1,0,1]);
});
test('Enable bloquea capturas; activarlo con CLK alto no captura', () => {
  let s = update(initial(),{d:[1,1,1,1],enable:0});
  s = update(s,{clk:1});
  assert.deepEqual(s.q,[0,0,0,0]);
  s = update(s,{enable:1});
  assert.deepEqual(s.q,[0,0,0,0]);
  s = update(s,{clk:0});
  assert.deepEqual(update(s,{clk:1}).q,[1,1,1,1]);
});
test('Reset es asíncrono, prioritario y mantiene Q a cero mientras está activo', () => {
  for (const clk of [0,1]) for (const enable of [0,1]) {
    let s = update(initial(),{d:[1,1,1,1],clk:1});
    s = update(s,{clk,enable});
    assert.deepEqual(s.q,[1,1,1,1]);
    s = update(s,{reset:1});
    assert.deepEqual(s.q,[0,0,0,0]);
    s = update(s,{clk:1-clk});
    assert.deepEqual(s.q,[0,0,0,0]);
    s = update(s,{reset:0});
    assert.deepEqual(s.q,[0,0,0,0]);
    s = update(s,{clk:0,enable:1});
    assert.deepEqual(update(s,{clk:1}).q,[1,1,1,1]);
  }
});
test('No comparte arrays entre estado, entradas y salida', () => {
  const before=initial(), d=[1,0,0,1];
  const after=update(before,{d,clk:1});
  assert.deepEqual(before.q,[0,0,0,0]);
  d[0]=0;after.d[1]=1;
  assert.deepEqual(after.q,[1,0,0,1]);
});
test('SISO: un 1 alcanza Q0 tras cuatro flancos ascendentes habilitados', () => {
  let s=initial('siso');
  const expected=[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]];
  for (let i=0;i<4;i++) {
    s=update(s,{d:[i===0?1:0,0,0,0]});
    s=update(s,{clk:1});
    assert.deepEqual(s.q,expected[i]);
    s=update(s,{clk:0});
    assert.deepEqual(s.q,expected[i]);
  }
});
test('SISO: enable impide desplazamientos y reset borra sin reloj', () => {
  let s=update(initial('siso'),{d:[1,0,0,0],clk:1});
  s=update(s,{clk:0,enable:0});
  s=update(s,{clk:1});
  assert.deepEqual(s.q,[1,0,0,0]);
  s=update(s,{reset:1});
  assert.deepEqual(s.q,[0,0,0,0]);
  s=update(s,{reset:0,enable:1});
  assert.deepEqual(s.q,[0,0,0,0]);
});
test('SISO: salida serie sigue el orden de llegada de los bits', () => {
  let s=initial('siso');const outputs=[];
  for (const bit of [1,0,1,1,0,0,0]) {
    s=update(s,{d:[bit,0,0,0]});s=update(s,{clk:1});outputs.push(s.q[3]);s=update(s,{clk:0});
  }
  assert.deepEqual(outputs,[0,0,0,1,0,1,1]);
});
test('PISO: carga paralela, salida D0, D1, D2, D3 y relleno con cero', () => {
  let s=update(initial('piso'),{d:[1,1,0,1]});
  assert.deepEqual(s.q,[0,0,0,0]);
  s=update(s,{clk:1});
  assert.deepEqual(s.q,[1,1,0,1]);
  const out=[s.q[3]];
  s=update(s,{clk:0,load:0});
  for(let i=0;i<3;i++) {
    s=update(s,{clk:1});out.push(s.q[3]);s=update(s,{clk:0});
  }
  assert.deepEqual(out,[1,0,1,1]);
  s=update(s,{clk:1});
  assert.deepEqual(s.q,[0,0,0,0]);
});
test('PISO: LOAD solo actúa en flanco ascendente y Enable bloquea carga y desplazamiento', () => {
  let s=update(initial('piso'),{d:[1,0,1,1],clk:1});
  s=update(s,{load:0});
  assert.deepEqual(s.q,[1,0,1,1]);
  for(const load of [0,1]) {
    s=update(s,{clk:0,enable:0,load,d:[0,0,0,0]});s=update(s,{clk:1});
    assert.deepEqual(s.q,[1,0,1,1]);
  }
  s=update(s,{reset:1});
  assert.deepEqual(s.q,[0,0,0,0]);
  s=update(s,{reset:0,enable:1,load:1});
  assert.deepEqual(s.q,[0,0,0,0]);
});
test('SIPO: captura bits en serie y presenta las cuatro salidas en paralelo', () => {
  let s=initial('sipo');
  for (const bit of [1,0,1,1]) {
    s=update(s,{d:[bit,0,0,0]});
    const previous=[...s.q];
    s=update(s,{clk:1});
    assert.deepEqual(s.q,[bit,...previous.slice(0,3)]);
    s=update(s,{clk:0});
  }
  assert.deepEqual(s.q,[1,1,0,1]);
  s=update(s,{enable:0});s=update(s,{clk:1});
  assert.deepEqual(s.q,[1,1,0,1]);
  s=update(s,{reset:1});
  assert.deepEqual(s.q,[0,0,0,0]);
});
