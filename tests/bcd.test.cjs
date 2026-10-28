const {test}=require('node:test');
const assert=require('node:assert/strict');
const {encode,binary,decimal,limit}=require('../bcd-logic.js');
test('convierte todos los valores de una a cuatro cifras en ambos sentidos',()=>{for(let digits=1;digits<=4;digits++)for(let n=0;n<=limit(digits);n++)assert.equal(binary(encode(n,digits),digits),n);assert.equal(encode(25,2),'0010 0101');assert.equal(encode(7,3),'0000 0000 0111');assert.equal(binary('10011001',2),99);});
test('rechaza los seis grupos prohibidos y las entradas inválidas',()=>{for(let n=10;n<=15;n++)assert.throws(()=>binary(n.toString(2),1),/BCD válido/);for(const text of ['-1','1.2','1e2',''])assert.throws(()=>decimal(text,2));assert.throws(()=>decimal('100',2));assert.throws(()=>binary('101',1));assert.throws(()=>binary('0002',1));});
