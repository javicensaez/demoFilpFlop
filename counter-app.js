(() => {
  const {initial, excitation, update} = CounterLab;
  const $ = id => document.getElementById(id);
  let state = initial(), events = [], timer = null;
  const word = q => [...q].reverse().join('');
  const number = q => parseInt(word(q), 2);
  function wire(path, value) { return `<path class="signal${value ? ' on' : ''}" d="${path}"/>`; }
  function diagram() {
    const jk = excitation(state.q);
    const stages = state.q.map((bit, i) => {
      const x = 110 + 230 * i;
      let input;
      if (!i) input = `<text x="${x - 30}" y="87" class="logic-value">1</text>${wire(`M${x - 22} 95V210H${x}`, 1)}`;
      else if (i === 1) input = `${wire(`M210 145H${x - 22}V210H${x}`, jk[i])}<circle class="junction${jk[i] ? ' on' : ''}" cx="${x - 22}" cy="145" r="4"/>`;
      else {
        const terms = i === 3 ? `(Q0·Q1)=${jk[2]} · Q2=${state.q[2]}` : state.q.slice(0, i).map((q, index) => `Q${index}=${q}`).join(' · ');
        input = `<text x="${x - 100}" y="28">${terms}</text><path class="gate" d="M${x - 100} 45H${x - 77}A25 25 0 0 1 ${x - 77} 95H${x - 100}Z"/><text x="${x - 94}" y="76">&amp;</text>`;
        if (i === 2) {
          // Derivaciones reales desde las salidas Q0 y Q1 hasta la primera AND.
          input += wire(`M210 145V53H${x - 100}`, state.q[0]);
          input += wire(`M440 145V85H${x - 100}`, state.q[1]);
          input += `<circle class="junction${state.q[0] ? ' on' : ''}" cx="210" cy="145" r="4"/><circle class="junction${state.q[1] ? ' on' : ''}" cx="440" cy="145" r="4"/>`;
        } else {
          // Segunda AND de dos entradas: salida de la primera AND y Q2.
          input += wire(`M535 70V53H${x - 100}`, jk[2]);
          input += wire(`M670 145V85H${x - 100}`, state.q[2]);
          input += `<circle class="junction${jk[2] ? ' on' : ''}" cx="535" cy="70" r="4"/><circle class="junction${state.q[2] ? ' on' : ''}" cx="670" cy="145" r="4"/>`;
        }
        input += wire(`M${x - 52} 70H${x - 22}V210H${x}`, jk[i]);
      }
      return `${input}${wire(`M${x - 22} 145H${x}`, jk[i])}
        <rect class="stage" x="${x}" y="130" width="90" height="100" rx="6"/>
        <text x="${x + 10}" y="149">J</text><text x="${x + 10}" y="214">K</text>
        <text x="${x + 28}" y="193">JK ${i}</text><text x="${x + 66}" y="149">Q</text>
        ${wire(`M${x} 166L${x + 11} 175L${x} 184`, state.clk)}
        ${wire(`M${x - 12} 300V175H${x}`, state.clk)}
        <circle cx="${x + 45}" cy="236" r="6" fill="white" stroke="#70827c" stroke-width="2"/>
        ${wire(`M${x + 45} 242V335`, state.resetN)}
        ${wire(`M${x + 90} 145H${x + 110}V265`, bit)}
        <text x="${x + 92}" y="288" class="bit-label">Q${i}=${bit}</text><text x="${x + 92}" y="312">2^${i}</text>
        <text x="${x + 15}" y="114" class="logic-value">J=K=${jk[i]}</text>
        `;
    }).join('');
    $('counter-diagram').innerHTML = `<svg viewBox="0 0 1040 365" role="img" aria-labelledby="counter-svg-title counter-svg-desc"><title id="counter-svg-title">Contador síncrono de cuatro biestables JK</title><desc id="counter-svg-desc">Estado Q3 a Q0: ${word(state.q)}. J y K: ${jk.join(', ')} en orden Q0 a Q3. Reloj común ${state.clk}, reset activo bajo ${state.resetN}.</desc>${wire('M65 300H788', state.clk)}${wire('M65 335H845', state.resetN)}<text x="10" y="305">CLK</text><text x="10" y="340">RESET̅</text>${stages}</svg>`;
  }
  function render(message) {
    const jk = excitation(state.q);
    $('counter-binary').textContent = word(state.q);
    $('counter-decimal').textContent = number(state.q);
    $('counter-hex').textContent = number(state.q).toString(16).toUpperCase();
    $('counter-clock').setAttribute('aria-pressed', String(!!state.clk));
    $('counter-clock').querySelector('strong').textContent = state.clk;
    $('counter-clock').querySelector('small').textContent = state.clk ? 'Siguiente: flanco ↓' : 'Siguiente: flanco ↑';
    $('counter-reset').setAttribute('aria-pressed', String(!state.resetN));
    $('counter-reset').querySelector('strong').textContent = state.resetN;
    $('counter-reset').querySelector('small').textContent = state.resetN ? 'Inactivo' : 'Activo · borrado inmediato';
    $('counter-excitation').innerHTML = jk.map((value, i) => `<tr><td>Q${i} · peso ${2 ** i}</td><td>${['1', 'Q0', 'Q0 · Q1', 'Q0 · Q1 · Q2'][i]}</td><td>${value} · ${value ? 'Conmutará' : 'Conservará'} en ↑${!state.resetN ? ' (bloqueado por reset)' : ''}</td></tr>`).join('');
    $('counter-history').innerHTML = events.map(event => `<tr><td>${event.label}</td><td>${event.clk}</td><td>${event.resetN}</td><td>${word(event.q)}</td><td>${number(event.q)}</td></tr>`).join('');
    diagram();
    $('counter-feedback').textContent = message;
  }
  function act(change, label) {
    const previous = state;
    state = update(state, change);
    events.unshift({...state, label}); events = events.slice(0, 6);
    let message;
    if (!state.resetN) message = 'RESET̅ = 0: los cuatro biestables se mantienen en 0000, independientemente del reloj.';
    else if (!previous.resetN) message = 'Reset desactivado: el contador espera al próximo flanco ascendente.';
    else if (!previous.clk && state.clk) {
      const toggles = excitation(previous.q).flatMap((value, i) => value ? [`Q${i}`] : []);
      message = `Flanco ↑: ${word(previous.q)} → ${word(state.q)} (${number(state.q)}). Conmutan ${toggles.join(', ')} usando el estado anterior.${number(previous.q) === 15 ? ' Vuelta a cero: módulo 16.' : ''}`;
    } else message = `Flanco ↓: el contador conserva ${word(state.q)} (${number(state.q)}).`;
    render(message);
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
  $('counter-reset').addEventListener('click', () => act({resetN: 1 - state.resetN}, state.resetN ? 'Activar reset' : 'Desactivar reset'));
  $('counter-auto').addEventListener('click', () => {
    if (timer !== null) { stop(); return; }
    $('counter-auto').textContent = 'Detener reloj automático'; $('counter-auto').setAttribute('aria-pressed', 'true');
    timer = setInterval(() => act({clk: 1 - state.clk}, state.clk ? 'Automático ↓' : 'Automático ↑'), 650);
  });
  $('counter-restart').addEventListener('click', () => { stop(); state = initial(); events = []; render('Demo reiniciada: Q = 0000, CLK = 0 y RESET̅ = 1 (inactivo).'); });
  window.addEventListener('pagehide', stop);
  render('Contador listo en 0000. Genera un pulso para avanzar a 0001.');
})();
