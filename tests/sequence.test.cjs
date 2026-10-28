const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {parse,step}=require('../wiper-logic.js');
const machine=parse(fs.readFileSync('secuencia-1011.dot','utf8'),{inputBits:1,outputBits:1});
function run(sequence){let state=machine.initial;return [...sequence].map(bit=>{const result=step(machine,state,bit);state=result.state;return result.output;}).join('');}
test('Moore de cinco estados, salida 1 solo en S4',()=>{assert.equal(machine.outputs.size,5);assert.equal(machine.outputs.get(machine.initial),'0');assert.deepEqual([...machine.outputs.values()],['0','0','0','0','1']);});
test('detecta solapamientos en los bits 4 y 7 de 1011011',()=>{assert.equal(run('1011011'),'0001001');assert.equal(run('1011'),'0001');assert.equal(run('1010'),'0000');});
test('coincide con la búsqueda de sufijos para todas las secuencias de doce bits',()=>{for(let n=0;n<4096;n++){const sequence=n.toString(2).padStart(12,'0');const expected=[...sequence].map((_,i)=>sequence.slice(0,i+1).endsWith('1011')?'1':'0').join('');assert.equal(run(sequence),expected,sequence);}});
