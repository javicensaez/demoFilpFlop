(function(root){
 function limit(digits){if(!Number.isInteger(digits)||digits<1||digits>4)throw new Error('Elige entre 1 y 4 dígitos octales.');return 8**digits-1;}
 function decimal(text,digits){const value=String(text).trim();if(!/^\d+$/.test(value))throw new Error('Escribe un entero decimal sin signo.');const n=Number(value);if(!Number.isSafeInteger(n)||n>limit(digits))throw new Error(`El valor debe estar entre 0 y ${limit(digits)}.`);return n;}
 function octal(text,digits){limit(digits);const value=String(text).trim();if(!/^[0-7]+$/.test(value))throw new Error('En octal solo se admiten los dígitos de 0 a 7.');if(value.length>digits)throw new Error(`Usa como máximo ${digits} dígitos octales.`);return parseInt(value,8);}
 function encode(n,digits){return decimal(n,digits).toString(8).padStart(digits,'0');}
 function binary(text,digits){limit(digits);const bits=String(text).trim().replace(/\s/g,'');if(!/^[01]+$/.test(bits))throw new Error('En binario solo se admiten ceros y unos.');if(bits.length>digits*3)throw new Error(`Usa como máximo ${digits*3} bits.`);return parseInt(bits,2);}
 function encodeBinary(n,digits){return decimal(n,digits).toString(2).padStart(digits*3,'0').match(/.{3}/g).join(' ');}
 const api={limit,decimal,octal,encode,binary,encodeBinary};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Octal=api;
})(globalThis);
