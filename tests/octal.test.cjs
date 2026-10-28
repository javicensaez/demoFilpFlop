const {test}=require('node:test');
const assert=require('node:assert/strict');
const {limit,decimal,octal,encode}=require('../octal-logic.js');
test('convierte todos los valores de uno a cuatro dígitos octales',()=>{for(let digits=1;digits<=4;digits++)for(let n=0;n<=limit(digits);n++)assert.equal(octal(encode(n,digits),digits),n);assert.equal(encode(13,2),'15');assert.equal(octal('7777',4),4095);assert.equal(encode(0,4),'0000');});
test('rechaza dígitos 8 y 9, signos, fracciones y desbordamientos',()=>{for(const text of ['8','19','-1','1.2','0o17',''])assert.throws(()=>octal(text,4));assert.throws(()=>octal('10000',4));assert.throws(()=>decimal('4096',4));assert.throws(()=>decimal('-1',4));assert.throws(()=>limit(0));});
test('binario y octal se corresponden mediante grupos de tres bits',()=>{const {binary,encodeBinary}=require('../octal-logic.js');assert.equal(encodeBinary(13,2),'001 101');assert.equal(binary('001 101',2),13);assert.equal(binary('1101',2),13);for(let n=0;n<=4095;n++)assert.equal(binary(encodeBinary(n,4),4),n);assert.throws(()=>binary('102',2));assert.throws(()=>binary('1000000',2));});
