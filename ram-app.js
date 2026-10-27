(() => {
  const {initial, update, enables, read} = RamLab;
  const $ = id => document.getElementById(`ram-${id}`);
  const bits = (n, width = 4) => n.toString(2).padStart(width, '0');
  let state = initial(), history = [];
  const path = (d, value) => `<path class="signal${value ? ' on' : ''}" d="${d}"/>`;
  const bus = d => `<path class="ram-bus" d="${d}"/>`;
  function render(message) {
    const en = enables(state), output = read(state);
    for (const [field, width, prefix] of [['data', 4, 'D'], ['address', 2, 'A']]) {
      $(field).innerHTML = Array.from({length: width}, (_, i) => {
        const bit = width - 1 - i, value = (state[field] >> bit) & 1;
        return `<button class="ram-bit" data-field="${field}" data-bit="${bit}" aria-label="${prefix}${bit}" aria-pressed="${!!value}">${value}</button>`;
      }).join('');
    }
    for (const field of ['we', 'clock']) {
      const value = field === 'we' ? state.we : state.clk;
      $(field).setAttribute('aria-pressed', String(!!value));
      $(field).querySelector('strong').textContent = value;
      $(field).querySelector('small').textContent = field === 'we' ? (value ? 'Escritura en el próximo ↑' : 'Deshabilitada') : `Siguiente: flanco ${value ? '↓' : '↑'}`;
    }
    $('output').textContent = bits(output);
    $('output-number').textContent = `Decimal ${output} · Hex ${output.toString(16).toUpperCase()}`;
    $('memory').innerHTML = state.words.map((value, i) => `<tr${state.address === i ? ' class="ram-selected"' : ''}><td>${bits(i, 2)}${state.address === i ? ' ←' : ''}</td><td>R${i}</td><td>${en[i]}</td><td>${bits(value)}</td><td>${value}</td></tr>`).join('');
    $('history').innerHTML = history.map(event => `<tr><td>${event.label}</td><td>${bits(event.address, 2)}</td><td>${bits(event.data)}</td><td>${bits(event.output)}</td></tr>`).join('');
    const stages = state.words.map((value, i) => {
      const x = 280 + i * 175, muxY = 360 + i * 24;
      return `${bus(`M${x - 25} 50V130H${x}`)}<circle cx="${x - 25}" cy="50" r="5" fill="#3379ac"/>
      <rect class="stage${state.address === i ? ' ram-selected-stage' : ''}" x="${x}" y="110" width="105" height="110" rx="6"/>
      <text x="${x + 12}" y="133">D[3:0]</text><text x="${x + 18}" y="158">R${i} · D</text><text x="${x + 15}" y="185" class="bit-label">${bits(value)}</text><text x="${x + 12}" y="209">EN</text><text x="${x + 80}" y="209">CK</text>
      ${path(`M${x + 84} 220L${x + 91} 210L${x + 98} 220M${x + 91} 220V255`, state.clk)}
      ${path(`M180 ${325 + i * 25}H${x + 15}V220`, en[i])}<text x="190" y="${320 + i * 25}">E${i}=${en[i]}</text>
      ${bus(`M${x + 105} 175H${x + 130}V${muxY}H1010`)}<text x="975" y="${muxY - 5}">${i}</text>`;
    }).join('');
    $('diagram').innerHTML = `<svg viewBox="0 0 1230 520" role="img" aria-labelledby="ram-title ram-desc"><title id="ram-title">RAM de cuatro registros D con decodificador y multiplexador</title><desc id="ram-desc">Datos ${bits(state.data)} a todos los registros. Dirección ${bits(state.address, 2)} al decodificador y al multiplexador. WE ${state.we}, enables ${en.join(', ')}. Salida ${bits(output)} de R${state.address}.</desc>
      ${bus('M35 50H850')}<text x="35" y="30">DIN[3:0] = ${bits(state.data)} · /4</text>
      <rect class="stage" x="80" y="295" width="100" height="135" rx="6"/><text x="92" y="320">DEC 2→4</text><text x="92" y="348">EN = WE</text>
      ${path('M25 370H80', state.we)}<text x="12" y="355">WE=${state.we}</text>
      <path class="ram-address" d="M25 475H1060V440M120 475V430"/><circle cx="120" cy="475" r="5" fill="#a46d20"/><text x="30" y="503">A1 A0 = ${bits(state.address, 2)} · /2 → decodificador y MUX</text>
      ${path('M35 255H896', state.clk)}<text x="15" y="278">CLK=${state.clk} · común ↑</text>
      ${stages}
      <path class="stage" d="M1010 335L1090 365V420L1010 450Z"/><text x="1020" y="386">MUX</text><text x="1020" y="408">4→1</text>
      ${bus('M1090 392H1190')}<text x="1100" y="365">DOUT /4</text><text x="1100" y="425" class="bit-label">${bits(output)}</text>
      </svg>`;
    $('feedback').textContent = message;
  }
  function act(change, label) {
    const previous = state;
    state = update(state, change);
    const rising = !previous.clk && state.clk;
    const written = rising && state.we;
    history.unshift({label: written ? `Escritura R${state.address}` : label, address: state.address, data: state.data, output: read(state)});
    history = history.slice(0, 6);
    render(written ? `Flanco ↑ con WE = 1: R${state.address} captura ${bits(state.data)}. Los otros registros conservan sus datos.` : `${label}. Memoria conservada. DOUT = R${state.address} = ${bits(read(state))}.${rising ? ' WE = 0 impide la escritura.' : ''}`);
  }
  for (const field of ['data', 'address']) $(field).addEventListener('click', event => {
    const button = event.target.closest('button[data-bit]');
    if (!button) return;
    const bit = Number(button.dataset.bit);
    act({[field]: state[field] ^ (1 << bit)}, field === 'data' ? 'Cambio del bus de datos' : 'Cambio de dirección: lectura inmediata');
    $(field).querySelector(`[data-bit="${bit}"]`).focus();
  });
  $('we').addEventListener('click', () => act({we: 1 - state.we}, state.we ? 'Escritura deshabilitada' : 'Escritura habilitada'));
  $('clock').addEventListener('click', () => act({clk: 1 - state.clk}, state.clk ? 'Flanco ↓' : 'Flanco ↑'));
  $('pulse').addEventListener('click', () => {
    if (state.clk) act({clk: 0}, 'Preparar pulso ↓');
    act({clk: 1}, 'Pulso ↑');
    const message = $('feedback').textContent;
    act({clk: 0}, 'Pulso ↓');
    $('feedback').textContent = `${message} CLK vuelve a 0.`;
  });
  $('restart').addEventListener('click', () => {state = initial(); history = []; render('Memoria reiniciada: cuatro palabras 0000, dirección 00, WE = 0 y CLK = 0.');});
  render('Prepara un dato, selecciona una dirección, activa WE y genera un pulso para escribir. Cambia la dirección para leer otra palabra.');
})();
