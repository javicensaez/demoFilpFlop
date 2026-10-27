(() => {
  const {operations, encode, decode, parseAssembly, assembly, equivalent} = Machine;
  const $ = id => document.getElementById(id);
  let mode = 'encode', current, counted = false, correct = 0, attempts = 0;
  const bitInputs = ['opcode-answer', 'source-answer', 'destination-answer'].map($);
  const binaryValue = () => bitInputs.map(input => input.value).join('');
  function updatePreview() {
    $('binary-preview').textContent = bitInputs.map(input => input.value.padEnd(input.maxLength, '·')).join('');
    $('hex-preview').textContent = bitInputs.every(input => new RegExp(`^[01]{${input.maxLength}}$`).test(input.value))
      ? '0x' + parseInt(binaryValue(), 2).toString(16).toUpperCase().padStart(4, '0') : '—';
  }
  bitInputs.forEach(input => input.addEventListener('input', () => {
    input.value = input.value.replace(/[^01]/g, '').slice(0, input.maxLength);
    input.removeAttribute('aria-invalid');
    updatePreview();
  }));
  function markAnswer(invalid) {
    (mode === 'encode' ? bitInputs : [$('answer')]).forEach(input => input.setAttribute('aria-invalid', String(invalid)));
  }
  const grouped = bits => `${bits.slice(0, 2)} ${bits.slice(2, 9)} ${bits.slice(9)}`;
  function feedback(message, kind = '') { $('machine-feedback').textContent = message; $('machine-feedback').dataset.kind = kind; }
  function count(success) {
    if (counted) return;
    counted = true; attempts++; if (success) correct++;
    $('score').textContent = `${correct} / ${attempts} aciertos`;
  }
  function next(focus = true) {
    current = {op: operations[Math.floor(Math.random() * 4)], source: Math.floor(Math.random() * 128), destination: Math.floor(Math.random() * 128)};
    let bits = encode(current);
    // BEQ puede contener cualquier valor en el campo fuente.
    if (mode === 'decode' && current.op === 'BEQ') bits = '11' + current.source.toString(2).padStart(7, '0') + bits.slice(9);
    $('instruction').textContent = mode === 'encode' ? assembly(current) : grouped(bits);
    $('prompt-label').textContent = mode === 'encode' ? 'ENSAMBLADOR' : 'CÓDIGO MÁQUINA';
    $('binary-answer').hidden = mode !== 'encode';
    $('assembly-answer').hidden = mode !== 'decode';
    $('answer').disabled = mode !== 'decode';
    bitInputs.forEach(input => { input.disabled = mode !== 'encode'; input.value = ''; input.removeAttribute('aria-invalid'); });
    updatePreview();
    $('answer-label').textContent = 'Tu respuesta en ensamblador';
    $('answer-help').textContent = mode === 'encode' ? 'Completa los campos con 2, 7 y 7 bits. A la derecha verás la palabra completa y su valor hexadecimal. En BEQ, el campo fuente puede tener cualquier valor.' : 'Usa OP fuente, destino; para el salto, BEQ destino. Las direcciones se escriben en decimal.';
    $('answer').value = ''; $('answer').placeholder = mode === 'encode' ? '00 0000101 0001010' : 'ADD 5, 10';
    $('answer').removeAttribute('aria-invalid'); counted = false; feedback('');
    if (focus) (mode === 'encode' ? bitInputs[0] : $('answer')).focus();
  }
  document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => {
    mode = button.dataset.mode;
    document.querySelectorAll('[data-mode]').forEach(item => { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active)); });
    next();
  }));
  $('answer-form').addEventListener('submit', event => {
    event.preventDefault();
    try {
      if (mode === 'encode' && !bitInputs.every(input => new RegExp(`^[01]{${input.maxLength}}$`).test(input.value))) throw new Error('Completa los tres campos binarios.');
      const answer = mode === 'encode' ? decode(binaryValue()) : parseAssembly($('answer').value);
      const success = equivalent(answer, current);
      count(success); markAnswer(!success);
      feedback(success ? '¡Correcto! Has traducido la instrucción. Pulsa Nuevo ejercicio para continuar.' : 'Todavía no coincide. Revisa el código de operación y las direcciones. Puedes corregir tu respuesta.', success ? 'success' : 'error');
    } catch (error) { markAnswer(true); feedback(mode === 'encode' && !bitInputs.every(input => input.value.length === input.maxLength) ? 'Completa el código con 2 bits, la fuente con 7 y el destino con 7.' : error.message, 'error'); }
  });
  $('solution').addEventListener('click', () => {
    count(false);
    feedback(`Solución: ${mode === 'encode' ? grouped(encode(current)) : assembly(current)}\nCódigo: ${operations.indexOf(current.op).toString(2).padStart(2, '0')} · ${current.op === 'BEQ' ? 'Fuente: se ignora (se suele escribir 0000000)' : `Fuente: ${current.source}`} · Destino: ${current.destination}`);
  });
  $('next').addEventListener('click', () => next());
  next(false);
})();
