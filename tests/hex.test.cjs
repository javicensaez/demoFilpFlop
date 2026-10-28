const {test}=require('node:test');
const assert=require('node:assert/strict');
const {limit,decimal,hexadecimal,encode,binary,encodeBinary}=require('../hex-logic.js');
test('todos los valores de hasta cuatro dígitos convierten a hexadecimal y binario',()=>{for(let digits=1;digits<=4;digits++)for(let n=0;n<=limit(digits);n++){assert.equal(hexadecimal(encode(n,digits),digits),n);assert.equal(binary(encodeBinary(n,digits),digits),n);}assert.equal(encode(255,2),'FF');assert.equal(hexadecimal('aF',2),175);assert.equal(encodeBinary(175,2),'1010 1111');assert.equal(encode(0,4),'0000');});
test('rechaza caracteres inválidos y desbordamientos',()=>{for(const text of ['G1','-1','0xFF','1.5',''])assert.throws(()=>hexadecimal(text,4));assert.throws(()=>hexadecimal('10000',4));assert.throws(()=>decimal('65536',4));assert.throws(()=>binary('10000000000000000',4));assert.throws(()=>binary('102',2));});
