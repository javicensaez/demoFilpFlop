(function(root){
 function limit(digits){if(!Number.isInteger(digits)||digits<1||digits>4)throw new Error('Elige entre 1 y 4 cifras.');return 10**digits-1;}
 function decimal(text,digits){const value=String(text).trim();if(!/^\d+$/.test(value))throw new Error('Escribe un entero decimal sin signo.');const n=Number(value);if(!Number.isSafeInteger(n)||n>limit(digits))throw new Error(`El valor debe estar entre 0 y ${limit(digits)}.`);return n;}
 function encode(n,digits){return String(decimal(n,digits)).padStart(digits,'0').split('').map(d=>Number(d).toString(2).padStart(4,'0')).join(' ');}
 function binary(text,digits){limit(digits);const bits=String(text).replace(/\s/g,'');if(!new RegExp(`^[01]{${digits*4}}$`).test(bits))throw new Error(`Escribe ${digits} grupos de 4 bits (${digits*4} bits); puedes separarlos con espacios.`);const groups=bits.match(/.{4}/g);const decoded=groups.map((group,i)=>{const n=parseInt(group,2);if(n>9)throw new Error(`El grupo ${i+1} (${group}) no es BCD válido: solo se admiten 0000 a 1001.`);return n;});return Number(decoded.join(''));}
 const api={limit,decimal,binary,encode};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.BCD8421=api;
})(globalThis);
