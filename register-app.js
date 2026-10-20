(() => {
  const { initial, update } = window.RegisterLab;
  const $ = s => document.querySelector(s);
  const sipo = document.body.dataset.demo === 'register-sipo';
  const serial = sipo || document.body.dataset.demo === 'register-siso';
  const piso = document.body.dataset.demo === 'register-piso';
  const newState = () => initial(piso ? 'piso' : sipo ? 'sipo' : serial ? 'siso' : 'pipo');
  let state = newState();
  let events = [];
  const word = bits => bits.join('');
  function render(message) {
    $('#register-bits').innerHTML = state.d.map((bit,i) => `<div class="register-bit-row"><span class="bit-name">D${3-i}</span><button class="bit-switch ${bit ? 'on' : ''}" data-bit="${i}" aria-label="D${3-i}: ${bit}. Pulsar para cambiar." aria-pressed="${!!bit}">${bit}</button><span class="bit-wire"></span><span class="register-cell">D<span>↑ CLK</span></span><span class="bit-wire ${state.q[i] ? 'on' : ''}"></span><output class="bit-output ${state.q[i] ? 'on' : ''}" aria-label="Q${3-i}">${state.q[i]}</output><span class="bit-name">Q${3-i}</span></div>`).join('');
    if (serial) {
      $('#register-bits').innerHTML = `<div class="serial-chain"><div class="serial-terminal"><span>ENTRADA SERIE</span><button class="bit-switch ${state.d[0] ? 'on' : ''}" data-bit="0" aria-label="Entrada serie: ${state.d[0]}. Pulsar para cambiar." aria-pressed="${!!state.d[0]}">${state.d[0]}</button><small>Din</small></div><span class="serial-arrow" aria-hidden="true">→</span>${state.q.map((bit,i) => `<div class="serial-stage"><span>Q${3-i}</span><output class="bit-output ${bit ? 'on' : ''}" aria-label="Bit interno Q${3-i}">${bit}</output><small>↑ CLK</small></div><span class="serial-arrow" aria-hidden="true">→</span>`).join('')}<div class="serial-terminal"><span>SALIDA SERIE</span><output class="bit-output ${state.q[3] ? 'on' : ''}" aria-label="Salida serie Dout">${state.q[3]}</output><small>Dout = Q0</small></div></div>`;
    }
    if (sipo) {
      $('#register-bits').innerHTML = `<div class="sipo-chain"><div class="serial-terminal"><span>ENTRADA SERIE</span><button class="bit-switch ${state.d[0] ? 'on' : ''}" data-bit="0" aria-label="Entrada serie Din: ${state.d[0]}. Pulsar para cambiar." aria-pressed="${!!state.d[0]}">${state.d[0]}</button><small>Din</small></div><span class="sipo-arrow" aria-hidden="true">→</span>${state.q.map((bit,i) => `<div class="sipo-column"><div class="serial-stage"><span>ETAPA ${i+1}</span><span>↑ CLK</span></div><span class="piso-down" aria-hidden="true">↓</span><output class="bit-output ${bit ? 'on' : ''}" aria-label="Salida paralela Q${3-i}">${bit}</output><span class="bit-name">Q${3-i}</span></div>${i<3 ? '<span class="sipo-arrow" aria-hidden="true">→</span>' : ''}`).join('')}</div>`;
    }
    if (piso) {
      $('#register-bits').innerHTML = `<div class="piso-chain"><div class="piso-fill"><small>RELLENO</small><strong>0 →</strong></div>${state.q.map((bit,i) => `<div class="piso-column"><span>D${3-i}</span><button class="bit-switch ${state.d[i] ? 'on' : ''}" data-bit="${i}" aria-label="D${3-i}: ${state.d[i]}. Pulsar para cambiar." aria-pressed="${!!state.d[i]}">${state.d[i]}</button><span class="piso-down">↓</span><div class="serial-stage"><span>Q${3-i}</span><output class="bit-output ${bit ? 'on' : ''}" aria-label="Bit interno Q${3-i}">${bit}</output></div></div><span class="piso-arrow" aria-hidden="true">→</span>`).join('')}<div class="piso-out"><small>SALIDA SERIE</small><output class="bit-output ${state.q[3] ? 'on' : ''}" aria-label="Salida serie Dout">${state.q[3]}</output><small>Dout = Q0</small></div></div>`;
      const loadButton = $('#load-register');
      loadButton.setAttribute('aria-pressed',String(!!state.load));
      loadButton.querySelector('strong').textContent = state.load ? 'Carga' : 'Desplazar';
      loadButton.querySelector('small').textContent = state.load ? 'LOAD = 1 · paralelo' : 'LOAD = 0 · serie';
    }
    for (const [id,value,detail] of [['enable',state.enable,state.enable ? 'Captura habilitada' : 'Conserva el contenido'],['reset',state.reset,state.reset ? 'Activo · borrado inmediato' : 'Inactivo'],['clock',state.clk,state.clk ? 'Siguiente: flanco ↓' : 'Siguiente: flanco ↑']]) {
      const button = $(`#${id}-register`);
      button.setAttribute('aria-pressed',String(!!value));
      button.querySelector('strong').textContent = value;
      button.querySelector('small').textContent = detail;
    }
    $('#register-feedback').textContent = message;
    $('#register-history').innerHTML = events.map(e => `<tr><td>${e.label}</td><td>${e.clk}</td><td>${e.enable}</td><td>${e.reset}</td>${piso ? `<td>${e.load}</td>` : ''}<td>${serial ? e.d[0] : word(e.d)}</td><td>${word(e.q)}</td></tr>`).join('');
  }
  function act(change,label) {
    const previous = state;
    state = update(state,change);
    events.unshift({ ...state, label });
    events = events.slice(0,4);
    let message;
    if (state.reset) message = 'Reset activo: Q = 0000 inmediatamente, independientemente de Enable y CLK.';
    else if (previous.reset) message = 'Reset desactivado. Q conserva 0000 hasta un flanco ascendente con Enable = 1.';
    else if (previous.clk === 0 && state.clk === 1) message = state.enable ? serial ? `Flanco ascendente: entra ${state.d[0]}, los bits se desplazan hacia Q0. Registro = ${word(state.q)}; salida serie = ${state.q[3]}.` : `Flanco ascendente: capturados los cuatro bits. Q = ${word(state.q)}.` : `Flanco ascendente con Enable = 0: Q conserva ${word(state.q)}.`;
    else message = `Sin captura: Q conserva ${word(state.q)}. Solo cambia en ↑ con Enable = 1 o por reset.`;
    if (sipo && !state.reset && !previous.reset && previous.clk === 0 && state.clk === 1 && state.enable) {
      message = `Entra ${state.d[0]} por Q3 y se desplazan las etapas. Salidas paralelas Q3–Q0 = ${word(state.q)}.`;
    }
    if (piso && !state.reset && !previous.reset && previous.clk === 0 && state.clk === 1 && state.enable) {
      message = state.load ? `Carga paralela: Q = ${word(state.q)}. Salida serie actual: ${state.q[3]}.` : `Desplazamiento: sale ${previous.q[3]}, entra 0 por Q3. Registro = ${word(state.q)}; salida serie actual: ${state.q[3]}.`;
    }
    render(message);
  }
  $('#register-bits').addEventListener('click',e => {
    const button = e.target.closest('[data-bit]');
    if (!button) return;
    const d = [...state.d], i = Number(button.dataset.bit);
    d[i] = 1-d[i];
    act({d},serial ? 'Cambio Din' : `Cambio D${3-i}`);
    $('#register-bits').querySelector(`[data-bit="${i}"]`).focus();
  });
  if (piso) $('#load-register').addEventListener('click', () => act({load:1-state.load}, 'Cambio LOAD'));
  $('#enable-register').addEventListener('click', () => act({enable:1-state.enable},'Cambio Enable'));
  $('#reset-register').addEventListener('click', () => act({reset:1-state.reset},state.reset ? 'Desactivar reset' : 'Activar reset'));
  $('#clock-register').addEventListener('click', () => act({clk:1-state.clk},state.clk ? 'Flanco ↓' : 'Flanco ↑'));
  $('#pulse-register').addEventListener('click', () => {
    if (state.clk) act({clk:0},'Flanco ↓');
    act({clk:1},'Pulso ↑');
    const captureMessage = $('#register-feedback').textContent;
    act({clk:0},'Pulso ↓');
    $('#register-feedback').textContent = `${captureMessage} Reloj de nuevo en 0.`;
  });
  $('#restart-register').addEventListener('click', () => {
    state = newState(); events = [];
    render(serial ? 'Demo reiniciada: Din = 0, registro = 0000, CLK = 0, Enable = 1 y Reset = 0.' : 'Demo reiniciada: D = 0000, Q = 0000, CLK = 0, Enable = 1 y Reset = 0.');
  });
  render(sipo ? 'Elige Din y genera pulsos. Cada bit entra por Q3; las cuatro salidas paralelas muestran el contenido guardado.' : piso ? 'Prepara D3–D0 y genera un pulso en Carga. Luego elige Desplazar para sacar los bits por Q0.' : serial ? 'Registro listo. Elige Din y genera un pulso para desplazar un bit hacia la salida serie.' : 'Registro listo. Prepara las entradas y genera un flanco ascendente.');
})();
