const {test}=require('node:test');
const assert=require('node:assert/strict');
const {range,decimal,binary,encode}=require('../twos-logic.js');
test('todos los valores de 4 y 8 bits se convierten en ambos sentidos',()=>{for(const width of [4,8]){const {min,max}=range(width);for(let n=min;n<=max;n++){const bits=encode(n,width);assert.equal(bits.length,width);assert.equal(binary(bits,width),n);assert.equal(decimal(String(n),width),n);}}});
test('límites y negativos en complemento a 2',()=>{assert.equal(encode(-128,8),'10000000');assert.equal(encode(-1,8),'11111111');assert.equal(encode(127,8),'01111111');assert.equal(encode(0,8),'00000000');assert.equal(binary('1000000000000000',16),-32768);assert.equal(encode(32767,16),'0111111111111111');assert.equal(encode(-13,8),'11110011');});
test('rechaza desbordamientos, ancho incorrecto y entradas no enteras',()=>{for(const n of [-129,128])assert.throws(()=>decimal(n,8));for(const bits of ['1','111111111','00000002',''])assert.throws(()=>binary(bits,8));for(const text of ['1.5','1e2','--1',''])assert.throws(()=>decimal(text,8));});
