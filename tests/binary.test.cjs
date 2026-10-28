const {test}=require('node:test');
const assert=require('node:assert/strict');
const {limit,decimal,binary,encode}=require('../binary-logic.js');
test('conversión exacta para todos los valores de 4 y 8 bits y límites de 16 bits',()=>{for(const width of [4,8])for(let n=0;n<=limit(width);n++){const encoded=encode(n,width);assert.equal(encoded.length,width);assert.equal(binary(encoded,width),n);assert.equal(decimal(String(n),width),n);}assert.equal(encode(65535,16),'1111111111111111');assert.equal(binary('0000',8),0);assert.equal(binary('1101',8),13);});
test('rechaza signos, fracciones, dígitos no binarios y valores fuera del ancho',()=>{for(const s of ['-1','+1','1.5','1,5','1e2',''])assert.throws(()=>decimal(s,8));for(const s of ['102','-1','0b11','1 0',''])assert.throws(()=>binary(s,8));assert.throws(()=>decimal('256',8));assert.throws(()=>binary('100000000',8));assert.throws(()=>limit(0));assert.throws(()=>limit(17));});
