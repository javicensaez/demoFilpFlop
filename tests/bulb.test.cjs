const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {parse,step}=require('../wiper-logic.js');
const source=fs.readFileSync('bombilla.dot','utf8');
test('la bombilla sigue el pulsador con una entrada y una salida',()=>{
 const machine=parse(source,{inputBits:1,outputBits:1});let state=machine.initial;
 for(const input of ['0','1','1','0','1','0']){const r=step(machine,state,input);assert.equal(r.output,input);state=r.state;}
 assert.throws(()=>step(machine,state,'001'),/entrada no válidos/);
});
test('la configuración de un bit valida el DOT y respeta los cambios del alumno',()=>{
 assert.throws(()=>parse(source.replace('label="1"','label="11"'),{inputBits:1,outputBits:1}),/un bit/);
 const m=parse(source.replace('ENCENDIDA\\n1','ENCENDIDA\\n0'),{inputBits:1,outputBits:1});assert.equal(step(m,m.initial,'1').output,'0');
});
