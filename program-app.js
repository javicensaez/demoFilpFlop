(() => {
  const $ = id => document.getElementById(id);
  const {examples, assemble} = ProgramMachine;
  let entries = [], base;
  examples.forEach((example, index) => {
    const option = document.createElement('option');
    option.value = index; option.textContent = example.name;
    $('program-choice').append(option);
  });
  function preview(entry) {
    const bits = entry.inputs.map(input => input.value).join('');
    entry.binary.textContent = entry.inputs.map(input => input.value.padEnd(input.maxLength, '·')).join('');
    entry.hex.textContent = entry.inputs.every(input => new RegExp(`^[01]{${input.maxLength}}$`).test(input.value))
      ? '0x' + parseInt(bits, 2).toString(16).toUpperCase().padStart(4, '0') : '—';
  }
  function next() {
    const previousBase = base;
    do { base = 50 + Math.floor(Math.random() * 51); } while (base === previousBase);
    const example = examples[Number($('program-choice').value)];
    const program = assemble(example.source, base);
    $('data-base').textContent = base;
    $('program-source').textContent = example.source;
    $('program-feedback').textContent = '';
    $('program-rows').replaceChildren();
    entries = program.rows.map(row => {
      const tr = document.createElement('tr');
      const cell = text => { const td = document.createElement('td'); td.textContent = text; tr.append(td); return td; };
      cell(row.address); cell(`${row.label ? row.label + ': ' : ''}${row.content}`);
      const inputs = [];
      const addInput = (width, name, target) => {
        const input = document.createElement('input');
        input.type = 'text'; input.inputMode = 'numeric'; input.maxLength = width;
        input.dataset.width = width; input.autocomplete = 'off'; input.spellcheck = false;
        input.setAttribute('aria-label', `Dirección ${row.address}: ${name}, ${width} bits`);
        input.setAttribute('aria-describedby', 'coding-help');
        target.append(input); inputs.push(input);
      };
      if (row.isData) { const td = cell(''); td.colSpan = 3; addInput(16, `dato ${row.label}`, td); }
      else { addInput(2, 'código de operación', cell('')); addInput(7, 'fuente', cell('')); addInput(7, 'destino', cell('')); }
      const binary = document.createElement('output'); cell('').append(binary);
      const hex = document.createElement('output'); cell('').append(hex);
      const status = cell(''); status.className = 'row-status';
      const entry = {row, tr, inputs, binary, hex, status};
      inputs.forEach(input => input.addEventListener('input', () => {
        input.value = input.value.replace(/[^01]/g, '').slice(0, input.maxLength);
        inputs.forEach(item => item.removeAttribute('aria-invalid'));
        delete tr.dataset.result; status.textContent = ''; $('program-feedback').textContent = '';
        preview(entry);
      }));
      preview(entry); $('program-rows').append(tr);
      return entry;
    });
  }
  $('program-form').addEventListener('submit', event => {
    event.preventDefault(); let correct = 0;
    entries.forEach(entry => {
      const {inputs, row, tr, status} = entry;
      const complete = inputs.every(input => new RegExp(`^[01]{${input.maxLength}}$`).test(input.value));
      const bits = inputs.map(input => input.value).join('');
      const success = complete && (row.isData ? bits === row.bits : Machine.equivalent(Machine.decode(bits), row.instruction));
      if (success) correct++;
      tr.dataset.result = success ? 'success' : 'error';
      status.textContent = success ? '✓ Correcto' : complete ? 'Revisar' : 'Incompleto';
      inputs.forEach(input => input.setAttribute('aria-invalid', String(!success)));
    });
    $('program-feedback').textContent = correct === entries.length ? `¡Programa completo correcto! ${correct} de ${entries.length} palabras.` : `${correct} de ${entries.length} palabras correctas. Revisa las filas marcadas; puedes corregirlas y comprobar de nuevo.`;
  });
  $('program-solution').addEventListener('click', () => {
    entries.forEach(entry => {
      let offset = 0;
      entry.inputs.forEach(input => { input.value = entry.row.bits.slice(offset, offset + input.maxLength); offset += input.maxLength; input.removeAttribute('aria-invalid'); });
      delete entry.tr.dataset.result; entry.status.textContent = 'Solución'; preview(entry);
    });
    $('program-feedback').textContent = 'Solución mostrada. En BEQ se ha usado fuente 0000000; cualquier valor de ese campo es válido. Pulsa Nuevo ejercicio para practicar con otra base.';
  });
  $('program-new').addEventListener('click', next);
  $('program-choice').addEventListener('change', next);
  next();
})();
