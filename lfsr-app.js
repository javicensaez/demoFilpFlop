(() => {
  const {initial, inputs, update} = LfsrLab;
  const $ = id => document.getElementById(id);
  let state = initial(), events = [], timer = null;
  const word = q => [...q].reverse().join('');
  const number = q => parseInt(word(q), 2);
  function wire(path, value) { return `<path class="signal${value ? ' on' : ''}" d="${path}"/>`; }
  function diagram() {
    const feedback = state.q[0] ^ state.q[1];
    const stages = [3, 2, 1, 0].map((i, column) => {
      const x = 110 + 220 * column;
      return `<rect class="stage" x="${x}" y="130" width="100" height="100" rx="6"/>
        <text x="${x + 10}" y="150">D</text><text x="${x + 78}" y="150">Q</text><text x="${x + 32}" y="195">D ${i}</text>
        ${wire(`M${x} 166L${x + 11} 175L${x} 184`, state.clk)}
        ${wire(`M${x - 15} 275V175H${x}`, state.clk)}
        ${wire(`M${x + 100} 145H${i ? x + 220 : 930}`, state.q[i])}
        <text x="${x + 115}" y="170" class="bit-label">Q${i}=${state.q[i]}</text>
        <circle cx="${x + 50}" cy="236" r="6" fill="white" stroke="#70827c" stroke-width="2"/>
        ${wire(`M${x + 50} 242V315`, state.resetN)}
        <text x="${x + 20}" y="220">${i ? 'CLR̅' : 'PRE̅'}</text>`;
    }).join('');
    $('counter-diagram').innerHTML = `<svg viewBox="0 0 1040 350" role="img" aria-labelledby="lfsr-title lfsr-desc"><title id="lfsr-title">LFSR de 4 bits con realimentación XOR</title><desc id="lfsr-desc">Estado ${word(state.q)}. Q0 XOR Q1 = ${feedback} entra por Q3. Desplazamiento hacia Q0.</desc>
      ${wire('M65 275H755', state.clk)}${wire('M65 315H820', state.resetN)}<text x="10" y="280">CLK</text><text x="10" y="320">INIT̅</text>
      ${stages}
      <path class="gate" d="M165 45Q130 45 110 70Q130 95 165 95Q145 70 165 45Z"/><path class="xor-input-curve" d="M175 45Q155 70 175 95"/>
      ${wire('M930 145V40H180V60H158', state.q[0])}
      ${wire('M710 145V100H180V80H158', state.q[1])}
      <circle class="junction${state.q[1] ? ' on' : ''}" cx="710" cy="145" r="4"/>
      ${wire('M110 70H70V145H110', feedback)}
      <text x="240" y="27">Realimentación Q0 ⊕ Q1 = ${feedback}</text>
      <text x="290" y="340">Q3 → Q2 → Q1 → Q0 · Reloj común ↑</text></svg>`;
  }
  function render(message) {
    const d = inputs(state.q);
    $('counter-binary').textContent = word(state.q);
    $('counter-decimal').textContent = number(state.q);
    $('counter-hex').textContent = number(state.q).toString(16).toUpperCase();
    $('counter-clock').setAttribute('aria-pressed', String(!!state.clk));
    $('counter-clock').querySelector('strong').textContent = state.clk;
    $('counter-clock').querySelector('small').textContent = state.clk ? 'Siguiente: flanco ↓' : 'Siguiente: flanco ↑';
    $('counter-reset').setAttribute('aria-pressed', String(!state.resetN));
    $('counter-reset').querySelector('strong').textContent = state.resetN;
    $('counter-reset').querySelector('small').textContent = state.resetN ? 'Inactivo' : 'Activo · borrado inmediato';
    $('counter-excitation').innerHTML = [3, 2, 1, 0].map(i => `<tr><td>Q${i}</td><td>${['Q1', 'Q2', 'Q3', 'Q0 ⊕ Q1'][i]}</td><td>${d[i]}${!state.resetN ? ' (INIT activo)' : ''}</td></tr>`).join('');
    $('counter-history').innerHTML = events.map(event => `<tr><td>${event.label}</td><td>${event.clk}</td><td>${event.resetN}</td><td>${word(event.q)}</td><td>${number(event.q)}</td></tr>`).join('');
    diagram();
    $('counter-feedback').textContent = message;
  }
  function act(change, label) {
    const previous = state;
    state = update(state, change);
    events.unshift({...state, label}); events = events.slice(0, 6);
    let message;
    if (!state.resetN) message = 'INIT̅ = 0: Q0 se pone a 1 y Q3, Q2, Q1 a 0. Estado 0001, independientemente del reloj.';
    else if (!previous.resetN) message = 'Inicialización desactivada: el LFSR espera al próximo flanco ascendente.';
    else if (!previous.clk && state.clk) {
      message = `Flanco ↑: ${word(previous.q)} → ${word(state.q)}. Entra Q0 ⊕ Q1 = ${previous.q[0] ^ previous.q[1]} por Q3; los demás bits se desplazan hacia Q0.`;
    } else message = `Flanco ↓: el LFSR conserva ${word(state.q)} (${number(state.q)}).`;
    render(message + (number(state.q) === 0 ? ' Estado 0000 bloqueado: carga una semilla no nula o activa INIT.' : ''));
  }
  function stop() {
    clearInterval(timer); timer = null;
    $('counter-auto').textContent = 'Iniciar reloj automático';
    $('counter-auto').setAttribute('aria-pressed', 'false');
  }
  $('counter-clock').addEventListener('click', () => { stop(); act({clk: 1 - state.clk}, state.clk ? 'Flanco ↓' : 'Flanco ↑'); });
  $('counter-pulse').addEventListener('click', () => {
    stop();
    if (state.clk) act({clk: 0}, 'Preparar pulso ↓');
    act({clk: 1}, 'Pulso ↑');
    const message = $('counter-feedback').textContent;
    act({clk: 0}, 'Pulso ↓');
    $('counter-feedback').textContent = message + ' CLK vuelve a 0.';
  });
  $('counter-reset').addEventListener('click', () => act({resetN: 1 - state.resetN}, state.resetN ? 'Activar INIT' : 'Desactivar INIT'));
  $('counter-auto').addEventListener('click', () => {
    if (timer !== null) { stop(); return; }
    $('counter-auto').textContent = 'Detener reloj automático'; $('counter-auto').setAttribute('aria-pressed', 'true');
    timer = setInterval(() => act({clk: 1 - state.clk}, state.clk ? 'Automático ↓' : 'Automático ↑'), 650);
  });
  $('counter-restart').addEventListener('click', () => { stop(); state = initial(); events = []; render('Demo reiniciada: Q = 0001, CLK = 0 e INIT̅ = 1 (inactivo).'); });
  $('lfsr-seed-form').addEventListener('submit', event => {
    event.preventDefault(); stop();
    try {
      if (!state.resetN) throw new Error('Desactiva INIT antes de cargar una semilla.');
      state = update(state, {seed: $('lfsr-seed').value.trim()});
      events.unshift({...state, label: 'Cargar semilla'}); events = events.slice(0, 6);
      $('lfsr-seed').removeAttribute('aria-invalid');
      render(`Semilla cargada: ${word(state.q)}.${number(state.q) ? ' Espera a la siguiente subida de CLK.' : ' Estado bloqueado: 0000 permanece en cero. Carga una semilla no nula.'}`);
    } catch (error) { $('lfsr-seed').setAttribute('aria-invalid', 'true'); $('counter-feedback').textContent = error.message; }
  });
  window.addEventListener('pagehide', stop);
  render('LFSR listo en 0001. Genera un pulso: el siguiente estado será 1000.');
})();
