(function(root){
 function limit(digits){if(!Number.isInteger(digits)||digits<1||digits>4)throw new Error('Elige entre 1 y 4 dígitos hexadecimales.');return 16**digits-1;}
 function decimal(text,digits){const value=String(text).trim();if(!/^\d+$/.test(value))throw new Error('Escribe un entero decimal sin signo.');const n=Number(value);if(!Number.isSafeInteger(n)||n>limit(digits))throw new Error(`El valor debe estar entre 0 y ${limit(digits)}.`);return n;}
 function hexadecimal(text,digits){limit(digits);const value=String(text).trim();if(!/^[0-9a-fA-F]+$/.test(value))throw new Error('En hexadecimal solo se admiten 0–9 y A–F (se admiten minúsculas).');if(value.length>digits)throw new Error(`Usa como máximo ${digits} dígitos hexadecimales.`);return parseInt(value,16);}
 function encode(n,digits){return decimal(n,digits).toString(16).toUpperCase().padStart(digits,'0');}
 function binary(text,digits){limit(digits);const bits=String(text).trim().replace(/\s/g,'');if(!/^[01]+$/.test(bits))throw new Error('En binario solo se admiten ceros y unos.');if(bits.length>digits*4)throw new Error(`Usa como máximo ${digits*4} bits.`);return parseInt(bits,2);}
 function encodeBinary(n,digits){return decimal(n,digits).toString(2).padStart(digits*4,'0').match(/.{4}/g).join(' ');}
 const api={limit,decimal,hexadecimal,encode,binary,encodeBinary};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Hexadecimal=api;
})(globalThis);
