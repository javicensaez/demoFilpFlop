(function(root){
 function limit(bits){if(!Number.isInteger(bits)||bits<1||bits>16)throw new Error('El ancho debe estar entre 1 y 16 bits.');return 2**bits-1;}
 function decimal(text,bits){const value=String(text).trim();if(!/^\d+$/.test(value))throw new Error('Escribe un entero decimal sin signo, sin comas ni puntos.');const n=Number(value);if(!Number.isSafeInteger(n)||n>limit(bits))throw new Error(`El valor debe estar entre 0 y ${limit(bits)}.`);return n;}
 function binary(text,bits){const value=String(text).trim();limit(bits);if(!/^[01]+$/.test(value))throw new Error('Escribe solamente ceros y unos.');if(value.length>bits)throw new Error(`Usa como máximo ${bits} bits.`);return parseInt(value,2);}
 function encode(n,bits){decimal(String(n),bits);return n.toString(2).padStart(bits,'0');}
 const api={limit,decimal,binary,encode};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.UnsignedBinary=api;
})(globalThis);
