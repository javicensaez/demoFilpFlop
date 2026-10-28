(function(root){
 function range(bits){if(!Number.isInteger(bits)||bits<2||bits>16)throw new Error('El ancho debe estar entre 2 y 16 bits.');return {min:-(2**(bits-1)),max:2**(bits-1)-1};}
 function decimal(text,bits){const value=String(text).trim(),{min,max}=range(bits);if(!/^-?\d+$/.test(value))throw new Error('Escribe un entero decimal; usa − con el signo del teclado (-) para los negativos.');const n=Number(value);if(!Number.isSafeInteger(n)||n<min||n>max)throw new Error(`El valor debe estar entre ${min} y ${max}.`);return n;}
 function binary(text,bits){range(bits);const value=String(text).trim();if(!new RegExp(`^[01]{${bits}}$`).test(value))throw new Error(`Escribe exactamente ${bits} bits, incluido el bit de signo.`);const unsigned=parseInt(value,2);return value[0]==='1'?unsigned-2**bits:unsigned;}
 function encode(n,bits){const value=decimal(n,bits);return (value<0?2**bits+value:value).toString(2).padStart(bits,'0');}
 const api={range,decimal,binary,encode};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TwosComplement=api;
})(globalThis);
