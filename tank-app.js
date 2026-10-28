(() => {
  const {outputs, transitions, sensors, step, advance} = TankFSM;
  const $ = id => document.getElementById(id);
  let state = 'APA', level = 85, manual = false, input = '11', timer = null, last = null, history = [], count = 0;
  function reading() { return manual ? input : sensors(level); }
  function feedback(text, error = false) { $('tank-feedback').textContent = text; $('tank-feedback').dataset.error = String(error); }
  function stop() {
    clearInterval(timer); timer = null;
    $('tank-auto').textContent = 'Iniciar simulación'; $('tank-auto').setAttribute('aria-pressed', 'false');
  }
  function render() {
    const bits = reading(), output = outputs[state];
    $('tank-state').textContent = state; $('tank-input').textContent = bits; $('tank-output').textContent = output;
    $('tank-level').textContent = `${level}%`; $('tank-water').style.height = `${level}%`; $('tank-slider').value = level;
    $('tank-low').classList.toggle('on', bits[0] === '1'); $('tank-high').classList.toggle('on', bits[1] === '1');
    [1, 2].forEach((pump, i) => {
      $(`pump-${pump}`).classList.toggle('on', output[i] === '1');
      $(`pump-${pump}`).querySelector('output').textContent = output[i] === '1' ? '1 · Encendida' : '0 · Apagada';
    });
    $('tank-manual-input').hidden = !manual;
    ['low', 'high'].forEach((sensor, i) => {
      $(`tank-sensor-${sensor}`).textContent = `${i ? 'Alto' : 'Bajo'}: ${input[i]}`;
      $(`tank-sensor-${sensor}`).setAttribute('aria-pressed', String(input[i] === '1'));
    });
    $('tank-tick').disabled = manual;
    document.querySelectorAll('.tank-graph .node').forEach(node => node.classList.toggle('active', node.id === `state-${state}`));
    document.querySelectorAll('.tank-graph .edge').forEach(edge => edge.classList.toggle('last', last !== null && edge.id === `edge-${last.from}-${last.input}`));
    $('tank-transitions').replaceChildren();
    for (const [name, output] of Object.entries(outputs)) {
      addRow('tank-transitions', [name, output, ...['00', '10', '11', '01'].map(bits => transitions[name][bits] || '—')], name === state ? 'current' : '');
    }
    $('tank-history').replaceChildren();
    history.forEach(event => addRow('tank-history', [event.count, event.from, event.input, event.state, event.output, `${event.before}% → ${event.after}%`]));
  }
  function addRow(id, values, className = '') {
    const tr = document.createElement('tr'); tr.className = className;
    values.forEach(value => { const td = document.createElement('td'); td.textContent = value; tr.append(td); });
    $(id).append(tr);
  }
  function apply(simulate) {
    const result = step(state, reading());
    if (!result.defined) {
      stop();
      feedback(`No hay transición definida desde ${state} con entrada ${result.input}.${result.input === '01' ? ' El sensor alto no puede estar cubierto si el bajo está descubierto.' : ''} El estado y el nivel se conservan. Ajusta las entradas para continuar.`, true);
      return;
    }
    const before = level;
    state = result.state; last = result;
    if (simulate) level = advance(level, result.output, Number($('tank-demand').value));
    history.unshift({...result, count: ++count, before, after: level}); history = history.slice(0, 30);
    render();
    feedback(`${result.from} —${result.input}→ ${state}. B1=${result.output[0]}, B2=${result.output[1]}.${simulate ? ` Nivel: ${before}% → ${level}%. Próxima lectura: ${reading()}.` : ' Nivel conservado: solo se han aplicado los sensores.'}`);
  }
  $('tank-slider').addEventListener('input', () => { stop(); level = Number($('tank-slider').value); render(); feedback(`Nivel ajustado a ${level}%. Pulsa Aplicar sensores para evaluar la entrada ${reading()}.`); });
  $('tank-step').addEventListener('click', () => { stop(); apply(false); });
  $('tank-tick').addEventListener('click', () => { stop(); apply(true); });
  $('tank-auto').addEventListener('click', () => {
    if (timer !== null) { stop(); feedback('Simulación pausada.'); return; }
    $('tank-auto').textContent = 'Pausar simulación'; $('tank-auto').setAttribute('aria-pressed', 'true');
    timer = setInterval(() => apply(!manual), 750);
  });
  $('tank-demand').addEventListener('input', () => { $('tank-demand-value').textContent = $('tank-demand').value; });
  $('tank-manual').addEventListener('change', () => {
    stop(); input = reading(); manual = $('tank-manual').checked; render();
    feedback(manual ? 'Sensores manuales: prueba las combinaciones y pulsa Aplicar sensores. En este modo el agua no evoluciona automáticamente.' : 'Sensores derivados del nivel de agua. Pulsa Aplicar sensores o inicia la simulación.');
  });
  ['low', 'high'].forEach((name, i) => $(`tank-sensor-${name}`).addEventListener('click', () => {
    stop(); const bits = input.split(''); bits[i] = bits[i] === '1' ? '0' : '1'; input = bits.join(''); render();
    feedback(`Entrada manual ${input}. Pulsa Aplicar sensores para evaluar la transición.`);
  }));
  $('tank-reset').addEventListener('click', () => {
    stop(); state = $('tank-start').value; level = 85; input = '11'; manual = false; last = null; history = []; count = 0;
    $('tank-manual').checked = false; $('tank-demand').value = '6'; $('tank-demand-value').textContent = '6';
    render(); feedback(`Demo reiniciada en ${state}, con nivel 85%. Las salidas dependen del estado: ${outputs[state]}.`);
  });
  window.addEventListener('pagehide', stop);
  render(); feedback('Inicio en APA con nivel 85%, sensores 11 y ambas bombas apagadas. Baja el nivel hasta la zona intermedia y aplica los sensores, o inicia la simulación.');
})();
