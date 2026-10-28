(function (root) {
  const machine = typeof module !== 'undefined' && module.exports ? require('./machine-logic.js') : root.Machine;
  function compile(codeText, dataText) {
    const symbols = Object.create(null), code = [], data = [];
    function parse(text, isData) {
      let pending = [];
      text.split('\n').forEach((raw, index) => {
        let content = raw.split(/[;#]/, 1)[0].trim();
        if (!content) return;
        const fail = message => { throw new Error(`${isData ? 'Datos' : 'Programa'}, línea ${index + 1}: ${message}`); };
        const label = content.match(/^([a-zA-Z_]\w*):\s*/);
        if (label) {
          const name = label[1].toLowerCase();
          if (Object.hasOwn(symbols, name) || pending.includes(name)) fail(`Etiqueta duplicada: ${name}.`);
          pending.push(name); content = content.slice(label[0].length).trim();
        }
        if (!content) return;
        const rows = isData ? data : code;
        const address = rows.length + (isData ? 100 : 0);
        if (rows.length >= (isData ? 28 : 100)) fail(isData ? 'Solo hay 28 posiciones de datos (100–127).' : 'Solo hay 100 posiciones de instrucciones (0–99).');
        for (const name of pending) symbols[name] = {address, isData};
        pending = [];
        if (isData && (!/^\d+$/.test(content) || Number(content) > 65535)) fail('El dato debe ser un entero de 0 a 65535.');
        rows.push({address, content, label: label ? label[1] : '', fail});
      });
      if (pending.length) throw new Error(`Etiqueta sin ${isData ? 'dato' : 'instrucción'}: ${pending.join(', ')}.`);
    }
    parse(codeText, false); parse(dataText, true);
    if (!code.length) throw new Error('Escribe al menos una instrucción.');
    const memory = Array(128).fill(0);
    for (const row of data) memory[row.address] = Number(row.content);
    function resolve(token, isData, row) {
      let address;
      if (/^\d+$/.test(token)) address = Number(token);
      else {
        const entry = symbols[token.toLowerCase()];
        if (!entry) row.fail(`Etiqueta desconocida: ${token}.`);
        if (entry.isData !== isData) row.fail(`${token} debe referirse a ${isData ? 'un dato' : 'una instrucción'}.`);
        address = entry.address;
      }
      if (isData ? address < 100 || address > 127 : address < 0 || address >= code.length) row.fail(isData ? 'Los operandos de datos deben estar entre 100 y 127.' : 'El salto debe apuntar a una instrucción del programa.');
      return address;
    }
    for (const row of code) {
      const match = row.content.match(/^(ADD|CMP|MOV)\s+([a-zA-Z_]\w*|\d+)\s*,\s*([a-zA-Z_]\w*|\d+)$|^(BEQ)\s+([a-zA-Z_]\w*|\d+)$/i);
      if (!match) row.fail('Usa ADD/CMP/MOV fuente, destino o BEQ destino.');
      row.instruction = match[4] ? {op: 'BEQ', source: 0, destination: resolve(match[5], false, row)} : {op: match[1].toUpperCase(), source: resolve(match[2], true, row), destination: resolve(match[3], true, row)};
      row.bits = machine.encode(row.instruction);
      memory[row.address] = parseInt(row.bits, 2);
    }
    return {code: code.map(({fail, ...row}) => row), memory, symbols};
  }
  function initial(program) { return {memory: [...program.memory], pc: 0, z: 0, steps: 0, halted: false, event: null}; }
  function step(program, state) {
    if (state.halted) return state;
    const row = program.code[state.pc];
    if (!row) throw new Error('PC fuera del programa.');
    const {op, source, destination} = row.instruction;
    const next = {...state, memory: [...state.memory], pc: state.pc + 1, steps: state.steps + 1};
    const before = state.memory[destination];
    let written = null, taken = false;
    if (op === 'BEQ') {
      taken = state.z === 1;
      if (taken) next.pc = destination;
    } else if (op === 'CMP') next.z = Number(state.memory[source] === before);
    else {
      const value = op === 'ADD' ? (state.memory[source] + before) % 65536 : state.memory[source];
      next.memory[destination] = value; next.z = Number(value === 0); written = destination;
    }
    next.halted = next.pc === program.code.length;
    next.event = {pc: state.pc, op, source, destination, before, after: next.memory[destination], written, taken, waiting: op === 'BEQ' && taken && next.pc === state.pc};
    return next;
  }
  const api = {compile, initial, step};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MachineSimulator = api;
})(globalThis);
