const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {parse,step}=require('../wiper-logic.js');
const {advance,movePeople,sensors}=require('../door-logic.js');
const source=fs.readFileSync('puerta-cristal.dot','utf8');
test('la persona espera, pasa con la puerta abierta y la puerta termina cerrada',()=>{
  const m=parse(source);let state=m.initial,position=0,people=[{id:1,progress:0}];const visited=new Set();
  for(let n=0;n<100;n++){const before=people;const r=step(m,state,sensors(position,people));state=r.state;position=advance(position,r.output);people=movePeople(people,position);if(position<100&&before.length)assert.equal(people[0].progress,before[0].progress);visited.add(state);}
  assert.equal(people.length,0);assert.equal(position,0);assert.equal(state,'CERRADA');assert.equal(visited.size,4);
});
test('detectar personas durante el cierre invierte el motor',()=>{const m=parse(source);const r=step(m,'CERRANDO',sensors(50,[{id:1,progress:0}]));assert.equal(r.state,'ABRIENDO');assert.equal(advance(50,r.output),55);});
test('todas las combinaciones están definidas y el motor respeta las salidas',()=>{const m=parse(source);for(const state of m.outputs.keys())for(let n=0;n<8;n++)assert.ok(step(m,state,n.toString(2).padStart(3,'0')));assert.equal(advance(50,'00'),50);assert.equal(advance(50,'10'),55);assert.equal(advance(50,'01'),45);assert.equal(advance(100,'10'),100);assert.equal(advance(0,'01'),0);assert.throws(()=>advance(50,'11'),/Motor no válido/);assert.equal(sensors(0,[]),'001');assert.equal(sensors(100,[{}]),'110');});
test('el DOT del alumno determina la actuación del motor',()=>{const m=parse(source.replace('ABRIENDO\\n10','ABRIENDO\\n00'));const r=step(m,'CERRADA','101');assert.equal(advance(0,r.output),0);});
