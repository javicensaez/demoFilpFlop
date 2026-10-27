(() => {
  const {initial, update} = DividerLab;
  const $ = id => document.getElementById(`divider-${id}`);
  let state = initial(), timer = null, samples = [initial()];
  const word = () => [...state.q].reverse().join('');
  const wire = (d, value) => `<path class="signal${value ? ' on' : ''}" d="${d}"/>`;
  function render(message) {
    $('binary').textContent = word();
    $('decimal').textContent = parseInt(word(), 2);
    $('clock').setAttribute('aria-pressed', String(!!state.clk));
    $('clock').querySelector('strong').textContent = state.clk;
    $('clock').querySelector('small').textContent = state.clk ? 'Siguiente: flanco ↓' : 'Siguiente: flanco ↑';
    const stages = state.q.map((bit, i) => {
      const x = 120 + i * 235, name = 'ABCD'[i], input = i ? state.q[i - 1] : state.clk;
      return `${wire(`M${x - 25} 270V100H${x}M${x - 25} 180H${x}`, 1)}
      <rect class="stage" x="${x}" y="80" width="90" height="120" rx="5"/>
      <text x="${x + 12}" y="105">J</text><text x="${x + 12}" y="185">K</text><text x="${x + 15}" y="146">CK</text><text x="${x + 60}" y="105">Q</text>
      ${wire(`M${x} 131L${x + 10} 140L${x} 149`, input)}<circle cx="${x - 6}" cy="140" r="6" fill="white" stroke="#70827c" stroke-width="2"/>
      ${wire(i ? `M${x - 145} 100H${x - 55}V140H${x - 12}` : `M20 140H${x - 12}`, input)}
      ${wire(`M${x + 90} 100H${x + 125}V45`, bit)}<circle class="junction${bit ? ' on' : ''}" cx="${x + 125}" cy="100" r="4"/>
      <text x="${x + 85}" y="30" class="bit-label">${name} = ${bit}</text><text x="${x + 15}" y="230">f / ${2 ** (i + 1)}</text>`;
    }).join('');
    $('diagram').innerHTML = `<svg viewBox="0 0 1040 300" role="img" aria-label="Cuatro JK en cascada con J y K a uno. A, B, C, D: ${state.q.join(', ')}. Reloj ${state.clk}."><text x="15" y="120">CLK</text>${wire('M70 270H800', 1)}<text x="25" y="275">1</text>${stages}</svg>`;
    const rows = ['CLK', 'A', 'B', 'C', 'D'].map((name, row) => {
      const y = 20 + row * 48;
      let d = '';
      samples.forEach((sample, i) => {
        const level = row ? sample.q[row - 1] : sample.clk;
        const x = 65 + i * 12, v = y + (level ? 0 : 24);
        d += i ? `V${v}H${x + 12}` : `M${x} ${v}H${x + 12}`;
      });
      return `<text x="10" y="${y + 18}">${name}</text><path class="signal on" d="${d}"/>`;
    }).join('');
    $('timing').innerHTML = `<svg viewBox="0 0 850 265" role="img" aria-label="Cronograma de CLK y salidas A, B, C y D">${rows}</svg>`;
    $('feedback').textContent = message;
  }
  function act(clk) {
    const previous = word();
    state = update(state, {clk});
    samples.push(state); samples = samples.slice(-64);
    render(clk ? `Flanco ↑: las salidas conservan ${word()}.` : `Flanco ↓: ${previous} → ${word()}. A conmuta; cada salida que cae hace conmutar la siguiente etapa.`);
  }
  function stop() {
    clearInterval(timer); timer = null;
    $('auto').textContent = 'Iniciar reloj automático';
    $('auto').setAttribute('aria-pressed', 'false');
  }
  $('clock').addEventListener('click', () => { stop(); act(1 - state.clk); });
  $('pulse').addEventListener('click', () => { stop(); if (!state.clk) act(1); act(0); });
  $('auto').addEventListener('click', () => {
    if (timer !== null) { stop(); return; }
    $('auto').textContent = 'Detener reloj automático';
    $('auto').setAttribute('aria-pressed', 'true');
    timer = setInterval(() => act(1 - state.clk), 650);
  });
  $('restart').addEventListener('click', () => { stop(); state = initial(); samples = [state]; render('Demo reiniciada: CLK = 0 y DCBA = 0000.'); });
  window.addEventListener('pagehide', stop);
  render('Genera pulsos: A divide la frecuencia entre 2; B entre 4; C entre 8; D entre 16.');
})();
