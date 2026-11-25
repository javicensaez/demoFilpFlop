(() => {
  const $ = id => document.getElementById(id);
  const {compile, initial, step, instructionAt, defaultDataBase} = MachineSimulator;
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
    for (const {address} of program.code) {
      const instruction = instructionAt(program, state.memory, address);
      const labels = Object.entries(program.symbols).filter(([, value]) => !value.isData && value.address === address).map(([key]) => key + ':').join(' ');
      const isNext = address === state.pc && !state.halted;
      const positionClass = isNext ? 'next' : address === state.event?.pc ? 'last' : '';
      const written = state.event?.written === address;
      row($('sim-listing'), [isNext ? '→ ' + address : address,
        `${labels} ${instruction.content}`.trim(), instruction.bits, hex(state.memory[address])],
      `${positionClass} ${written ? 'written' : ''}`);
    }
    $('sim-memory').replaceChildren();
    for (let address = program.dataBase; address <= 127; address++) {
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
      program = compile($('sim-code').value, $('sim-data').value, $('sim-data-base').valueAsNumber);
      state = initial(program); dirty = false; history = [];
      render(); message(`Ensamblado: ${program.code.length} instrucciones. PC = 0, Z = 0. Datos cargados desde ${program.dataBase}. Ejecuta un paso para comenzar.`);
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
      history.unshift({steps: state.steps, pc: previous.pc, instruction: event.content, result, z: state.z, nextPc: state.pc});
      history = history.slice(0, 100); runSteps++;
      let text = `Paso ${state.steps}: ${event.content}. ${result}. Z = ${state.z}.`;
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
    $('sim-data-base').value = defaultDataBase;
    assemble();
  }
  ProgramMachine.examples.forEach((example, index) => {
    const option = document.createElement('option'); option.value = index; option.textContent = example.name; $('sim-example').append(option);
  });
  ['sim-code', 'sim-data', 'sim-data-base'].forEach(id => $(id).addEventListener('input', () => { pause(); dirty = true; controls(); message('Hay cambios sin ensamblar. Pulsa Ensamblar y reiniciar para aplicar los cambios.'); }));
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
