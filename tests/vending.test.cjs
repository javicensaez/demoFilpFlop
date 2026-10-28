const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {parse}=require('../wiper-logic.js');
const {step}=require('../vending-logic.js');
const machine=parse(fs.readFileSync('expendedora.dot','utf8'),{inputBits:3,outputBits:3});
test('todas las combinaciones hasta la venta entregan una lata y el cambio exacto',()=>{
 function visit(state,credit,depth){for(const [input,value] of [['100',200],['010',100],['001',50]]){const result=step(machine,state,input),total=credit+value;assert.equal(result.inserted,value);if(total>=150){assert.equal(result.cans,1);assert.equal(result.change,total-150);const idle=step(machine,result.state,'000');assert.equal(idle.state,machine.initial);assert.equal(idle.cans,0);assert.equal(idle.change,0);}else{assert.equal(result.output,'000');assert.ok(depth<3);visit(result.state,total,depth+1);}}}
 visit(machine.initial,0,0);
});
test('sin moneda conserva el saldo y rechaza varias monedas simultáneas',()=>{for(const state of ['SALDO_0','SALDO_050','SALDO_1'])assert.equal(step(machine,state,'000').state,state);for(const input of ['011','101','110','111'])for(const state of machine.outputs.keys())assert.throws(()=>step(machine,state,input),/una moneda/);});
test('saldo de 1 € más moneda de 2 € activa las tres salidas',()=>{let r=step(machine,machine.initial,'010');r=step(machine,r.state,'100');assert.equal(r.output,'111');assert.equal(r.change,150);});
test('el DOT determina las salidas sin imponer una venta desde la interfaz',()=>{const custom=parse('digraph { A [label="A\\n000"]; A -> A [label="xxx"]; }',{inputBits:3,outputBits:3});assert.equal(step(custom,'A','100').cans,0);});
