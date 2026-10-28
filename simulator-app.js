(() => {
  const $ = id => document.getElementById(id);
  const {compile, initial, step} = MachineSimulator;
  let program = null, state = null, timer = null, dirty = false, history = [], runSteps = 0;
  const hex = value => '0x' + value.toString(16).toUpperCase().padStart(4, '0');
  function message(text, error = false) { $('sim-feedback').textContent = text; $('sim-feedback').dataset.error = String(error); }
  function controls() {
    const ready = program && !dirty;
    $('sim-step').disabled = !ready || state.halted || timer !== null;
    $('sim-run').disabled = !ready || state.halted || timer !== null;
    $('sim-pause').disabled = timer === null;
    $('sim-restart').disabled = !ready;
    $('sim-status').textContent = dirty ? 'Cambios sin ensamblar' : !ready ? 'Sin ensamblar' : state.halted ? 'Fin del programa' : timer !== null ? 'En ejecución' : 'En pausa';
  }
  function pause() { clearInterval(timer); timer = null; controls(); }
  function row(tbody, values, className = '') {
    const tr = document.createElement('tr'); tr.className = className;
    values.forEach(value => { const td = document.createElement('td'); td.textContent = value; tr.append(td); });
    tbody.append(tr); return tr;
  }
  function render() {
    controls(); if (!program) return;
    $('sim-pc').textContent = state.pc; $('sim-z').textContent = state.z; $('sim-steps').textContent = state.steps;
    $('sim-listing').replaceChildren();
    for (const instruction of program.code) {
      const labels = Object.entries(program.symbols).filter(([, value]) => !value.isData && value.address === instruction.address).map(([key]) => key + ':').join(' ');
      row($('sim-listing'), [instruction.address === state.pc && !state.halted ? '→ ' + instruction.address : instruction.address,
        `${labels} ${instruction.content}`.trim(), instruction.bits, hex(parseInt(instruction.bits, 2))],
      instruction.address === state.pc && !state.halted ? 'next' : instruction.address === state.event?.pc ? 'last' : '');
    }
    $('sim-memory').replaceChildren();
    for (let address = 100; address <= 127; address++) {
      const labels = Object.entries(program.symbols).filter(([, value]) => value.isData && value.address === address).map(([key]) => key).join(', ');
      const written = state.event?.written === address;
      const changed = state.memory[address] !== program.memory[address];
      row($('sim-memory'), [address, labels || '—', program.memory[address], state.memory[address], hex(state.memory[address]),
        written ? `${state.event.before} → ${state.event.after}` : changed ? 'Modificado' : '—'], `${written ? 'written' : ''} ${changed ? 'changed' : ''}`);
    }
    $('sim-history').replaceChildren();
    history.forEach(entry => row($('sim-history'), [entry.steps, entry.pc, entry.instruction, entry.result, entry.z, entry.nextPc]));
  }
  function assemble() {
    pause();
    try {
      program = compile($('sim-code').value, $('sim-data').value);
      state = initial(program); dirty = false; history = [];
      render(); message(`Ensamblado: ${program.code.length} instrucciones. PC = 0, Z = 0. Datos cargados desde 100. Ejecuta un paso para comenzar.`);
    } catch (error) { dirty = true; controls(); message(error.message, true); }
  }
  function execute() {
    if (!program || dirty || state.halted) return;
    try {
      const previous = state;
      state = step(program, state);
      const event = state.event;
      const result = event.written !== null ? `Mem[${event.written}]: ${event.before} → ${event.after}` : event.op === 'CMP'
        ? `Mem[${event.source}]=${previous.memory[event.source]} ${state.z ? '=' : '≠'} Mem[${event.destination}]=${event.before}`
        : event.taken ? `Salto a ${event.destination}` : 'Sin salto';
      history.unshift({steps: state.steps, pc: previous.pc, instruction: program.code[previous.pc].content, result, z: state.z, nextPc: state.pc});
      history = history.slice(0, 100); runSteps++;
      let text = `Paso ${state.steps}: ${program.code[previous.pc].content}. ${result}. Z = ${state.z}.`;
      if (state.halted) { pause(); text += ' Fin del programa: no hay más instrucciones.'; }
      else if (event.waiting) { pause(); text += ' Bucle de espera: el salto apunta a sí mismo. Ejecución pausada.'; }
      else if (timer !== null && runSteps >= 1000) { pause(); text += ' Pausa tras 1000 instrucciones seguidas; puedes continuar.'; }
      render(); message(text);
    } catch (error) { pause(); message(error.message, true); }
  }
  function run() {
    if (!program || dirty || state.halted) return;
    pause(); runSteps = 0;
    timer = setInterval(execute, Number($('sim-speed').value)); controls();
  }
  function loadExample() {
    const source = ProgramMachine.examples[Number($('sim-example').value)].source;
    const lines = source.split('\n');
    const dataStart = lines.findIndex(line => /^\s*[a-zA-Z_]\w*:\s*\d+\s*;?\s*$/.test(line));
    $('sim-code').value = lines.slice(0, dataStart).join('\n').replace(/#Dades/gi, '').trim();
    $('sim-data').value = lines.slice(dataStart).join('\n').trim();
    assemble();
  }
  ProgramMachine.examples.forEach((example, index) => {
    const option = document.createElement('option'); option.value = index; option.textContent = example.name; $('sim-example').append(option);
  });
  ['sim-code', 'sim-data'].forEach(id => $(id).addEventListener('input', () => { pause(); dirty = true; controls(); message('El código o los datos han cambiado. Pulsa Ensamblar y reiniciar para aplicar los cambios.'); }));
  $('sim-assemble').addEventListener('click', assemble);
  $('sim-step').addEventListener('click', execute);
  $('sim-run').addEventListener('click', run);
  $('sim-pause').addEventListener('click', () => { pause(); message('Ejecución pausada. Puedes continuar o ejecutar paso a paso.'); });
  $('sim-speed').addEventListener('change', () => { if (timer !== null) run(); });
  $('sim-restart').addEventListener('click', () => { pause(); if (!program || dirty) return; state = initial(program); history = []; render(); message('Ejecución reiniciada: PC = 0, Z = 0 y datos restaurados a sus valores iniciales.'); });
  $('sim-example-load').addEventListener('click', loadExample);
  window.addEventListener('pagehide', pause);
  loadExample();
})();
