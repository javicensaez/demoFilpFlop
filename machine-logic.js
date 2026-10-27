(function (root) {
  const operations = ['ADD', 'CMP', 'MOV', 'BEQ'];
  function address(value) {
    if (!Number.isInteger(value) || value < 0 || value > 127) throw new Error('Las direcciones deben estar entre 0 y 127.');
    return value.toString(2).padStart(7, '0');
  }
  function parseAssembly(text) {
    const match = text.trim().toUpperCase().match(/^(ADD|CMP|MOV)\s+(\d+)\s*,\s*(\d+)$|^(BEQ)\s+(\d+)$/);
    if (!match) throw new Error('Usa ADD fuente, destino; CMP fuente, destino; MOV fuente, destino o BEQ destino.');
    const instruction = match[4] ? {op: 'BEQ', source: 0, destination: Number(match[5])} : {op: match[1], source: Number(match[2]), destination: Number(match[3])};
    address(instruction.source); address(instruction.destination);
    return instruction;
  }
  function encode(instruction) {
    const code = operations.indexOf(instruction.op);
    if (code < 0) throw new Error('Instrucción desconocida.');
    return code.toString(2).padStart(2, '0') + address(instruction.op === 'BEQ' ? 0 : instruction.source) + address(instruction.destination);
  }
  function decode(text) {
    const bits = text.replace(/\s/g, '');
    if (!/^[01]{16}$/.test(bits)) throw new Error('Introduce exactamente 16 bits (0 o 1). Puedes separarlos con espacios.');
    return {op: operations[parseInt(bits.slice(0, 2), 2)], source: parseInt(bits.slice(2, 9), 2), destination: parseInt(bits.slice(9), 2)};
  }
  function assembly(i) { return i.op === 'BEQ' ? `BEQ ${i.destination}` : `${i.op} ${i.source}, ${i.destination}`; }
  function equivalent(a, b) { return a.op === b.op && a.destination === b.destination && (a.op === 'BEQ' || a.source === b.source); }
  const api = {operations, parseAssembly, encode, decode, assembly, equivalent};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Machine = api;
})(globalThis);
