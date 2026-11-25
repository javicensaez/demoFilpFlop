(function (root) {
  const machine = typeof module !== 'undefined' && module.exports ? require('./machine-logic.js') : root.Machine;
  const defaultDataBase = 100;
  function compile(codeText, dataText, dataBase = defaultDataBase) {
    if (!Number.isInteger(dataBase) || dataBase < 1 || dataBase > 127) {
      throw new Error('La dirección base de los datos debe ser un entero de 1 a 127.');
    }
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
        const address = rows.length + (isData ? dataBase : 0);
        if (address >= (isData ? 128 : dataBase)) fail(isData ? `Solo hay ${128 - dataBase} posiciones de datos desde la dirección ${dataBase}.` : `Las instrucciones deben quedar por debajo de la dirección base de datos (${dataBase}).`);
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
    function resolve(token, isJump, row) {
      let address;
      if (/^\d+$/.test(token)) address = Number(token);
      else {
        const entry = symbols[token.toLowerCase()];
        if (!entry) row.fail(`Etiqueta desconocida: ${token}.`);
        if (isJump && entry.isData) row.fail(`${token} debe referirse a una instrucción.`);
        address = entry.address;
      }
      if (isJump && address >= code.length) row.fail('El salto debe apuntar a una instrucción del programa.');
      if (!isJump && (address > 127 || (address >= code.length && address < dataBase))) {
        row.fail(`El operando debe apuntar a una instrucción o a una dirección de datos entre ${dataBase} y 127.`);
      }
      return address;
    }
    for (const row of code) {
      const match = row.content.match(/^(ADD|CMP|MOV)\s+([a-zA-Z_]\w*|\d+)\s*,\s*([a-zA-Z_]\w*|\d+)$|^(BEQ)\s+([a-zA-Z_]\w*|\d+)$/i);
      if (!match) row.fail('Usa ADD/CMP/MOV fuente, destino o BEQ destino.');
      row.instruction = match[4] ? {op: 'BEQ', source: 0, destination: resolve(match[5], true, row)} : {op: match[1].toUpperCase(), source: resolve(match[2], false, row), destination: resolve(match[3], false, row)};
      row.bits = machine.encode(row.instruction);
      memory[row.address] = parseInt(row.bits, 2);
    }
    return {code: code.map(({fail, ...row}) => row), memory, symbols, dataBase};
  }
  function initial(program) { return {memory: [...program.memory], pc: 0, z: 0, steps: 0, halted: false, event: null}; }
  function instructionAt(program, memory, address) {
    const row = program.code[address];
    const word = memory[address];
    if (word === program.memory[address]) return row;
    const bits = word.toString(2).padStart(16, '0');
    const instruction = machine.decode(bits);
    return {...row, bits, instruction, content: machine.assembly(instruction)};
  }
  function step(program, state) {
    if (state.halted) return state;
    if (!program.code[state.pc]) throw new Error('PC fuera del programa.');
    const {instruction, content} = instructionAt(program, state.memory, state.pc);
    const {op, source, destination} = instruction;
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
    next.event = {pc: state.pc, content, op, source, destination, before, after: next.memory[destination], written, taken, waiting: op === 'BEQ' && taken && next.pc === state.pc};
    return next;
  }
  const api = {compile, initial, step, instructionAt, defaultDataBase};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MachineSimulator = api;
})(globalThis);
