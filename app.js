(() => {
  const { TYPES, generate, solve } = window.LogicLab;
  const $ = selector => document.querySelector(selector);
  const count = 12, width = 720, height = 76;
  const family = document.body.dataset.demo;
  const isJK = family === 'jk';
  const isT = family === 't';
  const isEdge = family === 'd-edge' || isJK || isT;
  const isD = isEdge || family === 'd';
  const inputLabel = isJK ? 'J' : isT ? 'T' : 'D';
  const outputKeys = isD ? ['q'] : ['q', 'nq'];
  const total = count * outputKeys.length;
  const outputLabel = isD ? 'Q' : 'Q y Q̅';
  const answerValues = () => outputKeys.flatMap(key => answers[key]);
  let type = isJK ? 'jk-rising' : isT ? 't-rising' : isEdge ? 'd-rising' : isD ? 'd-high' : 'nor', exercise, answers, paint = 1, drawing = false, checked = false, xMode = false, showingSolution = false;
  function isForbidden(index) {
    return !isD && exercise.r[index] === TYPES[type].active && exercise.s[index] === TYPES[type].active;
  }
  function waveform(values, color, output = false) {
    let path = '';
    values.forEach((value, i) => {
      if (value === null || value === 'X') return;
      const x = i * width / count, y = value ? 18 : 58;
      path += `${i && (values[i - 1] === 0 || values[i - 1] === 1) ? 'L' : 'M'}${x},${y} H${x + width / count} `;
    });
    const forbidden = output ? values.map((value, i) => {
      if (!showingSolution || !isForbidden(i) || (value !== 0 && value !== 1)) return '';
      const x = i * width / count, y = value ? 18 : 58;
      return `<path d="M${x},${y} H${x + width / count}" fill="none" stroke="#c3332d" stroke-width="3" vector-effect="non-scaling-stroke"/>`;
    }).join('') : '';
    return `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true"><path d="${path}" fill="none" stroke="${color}" stroke-width="2.5" vector-effect="non-scaling-stroke"/>${forbidden}</svg>`;
  }
  function renderChart() {
    const rows = [['r', isD ? inputLabel : type === 'nand' ? 'R̅' : 'R', exercise.r], ['s', isD ? (isEdge ? 'CLK' : 'EN') : type === 'nand' ? 'S̅' : 'S', exercise.s], ['q', 'Q', answers.q], ['nq', 'Q̅', answers.nq]].filter(([key]) => !isD || key !== 'nq');
    if (isJK) rows.splice(1, 0, ['k', 'K', exercise.k]);
    $('#chart').innerHTML = `<div class="axis-title">t (s)</div><div class="time-axis">${Array.from({length: count + 1}, (_, i) => `<span style="left:${i * 100 / count}%">${i}</span>`).join('')}</div>` + rows.map(([key, label, values]) => {
      const editable = key === 'q' || key === 'nq';
      return `<div class="signal-label ${editable ? 'editable-label' : ''}"><strong>${label}</strong><span>${editable ? 'SALIDA' : 'ENTRADA'}</span></div><div class="signal-track ${editable ? 'editable-track' : ''}" data-track="${key}"><span class="level level-high">1</span><span class="level level-low">0</span>${waveform(values, editable ? '#3672ed' : '#324c48', editable)}<div class="cells">${values.map((v, i) => editable ? `<button class="signal-cell ${showingSolution && isForbidden(i) ? 'forbidden-output' : ''} ${checked ? (v === exercise[key][i] ? 'correct' : 'incorrect') : ''}" data-row="${key}" data-index="${i}" aria-label="${label}, de ${i} a ${i + 1} segundos: ${v === null ? 'sin completar' : v}${showingSolution && isForbidden(i) ? ', condición prohibida' : ''}" ${v !== null ? `data-value="${v}"` : ''}><span>${v === null ? '·' : v === 'X' ? 'X' : ''}</span></button>` : `<span title="${label}: ${v}, de ${i} a ${i + 1} segundos"></span>`).join('')}</div></div>`;
    }).join('');
    updateCompletion();
  }
  function updateCompletion() {
    const completed = answerValues().filter(v => v !== null).length;
    $('#completion').textContent = `${completed} de ${total} tramos`;
  }
  function feedback(title, text, status = '') {
    $('#feedback').innerHTML = `<strong>${title}</strong><span>${text}</span>`;
    $('.check-area').className = `check-area ${status}`;
  }
  function start(newSignals = true) {
    exercise = newSignals || !exercise
      ? generate(type, count)
      : { ...exercise, type, ...solve(type, exercise.r, exercise.s, exercise.initial, exercise.k) };
    answers = { q: Array(count).fill(null), nq: Array(count).fill(null) };
    checked = false;
    showingSolution = false;
    $('#initial-state').textContent = `Q = ${exercise.initial}${isEdge ? " · CLK = 0" : ""}`;
    if (!isD) {
      $('#initial-state').innerHTML = `<span>Q = ${exercise.initial}</span><span>Q̅ = ${1 - exercise.initial}</span>`;
    }
    $('#r-heading').textContent = isD ? inputLabel : type === 'nand' ? 'R̅' : 'R';
    $('#s-heading').textContent = isD ? (isEdge ? 'CLK' : 'EN') : type === 'nand' ? 'S̅' : 'S';
    $('#truth-table').innerHTML = (TYPES[type].rows || []).map(([r, s, q, nq, action], i) => `<tr class="${!isD && action === 'Prohibida' ? 'forbidden' : ''}"><td>${r}</td><td>${s}</td><td>${q}</td>${isD ? '' : `<td>${nq}</td>`}<td>${action}</td></tr>`).join('');
    $('#rule-note').textContent = type === 'nor' ? 'NOR: S = 1 activa Set; R = 1 activa Reset. Con ambas a 0, conserva Q. Q(t−1) y Q̅(t−1) indican los valores anteriores. En el estado prohibido, las salidas no son complementarias.' : 'NAND: S̅ = 0 activa Set; R̅ = 0 activa Reset. Con ambas a 1, conserva Q. Q(t−1) y Q̅(t−1) indican los valores anteriores. En el estado prohibido, las salidas no son complementarias.';
    $('#rule-note').textContent += ' Si se pasa de prohibida a memoria, ambas salidas son X hasta un Set o Reset.';
    if (isD) {
      $('#rule-note').textContent = `D por nivel ${type === 'd-high' ? 'alto' : 'bajo'}: con EN = ${TYPES[type].active}, Q sigue a D durante todo el nivel activo. Con EN = ${1 - TYPES[type].active}, conserva Q(t−1).`;
      if (isEdge) {
        $('#rule-note').textContent = `D por flanco ${type === 'd-rising' ? 'ascendente (↑, 0 → 1)' : 'descendente (↓, 1 → 0)'}: Q captura D solo en ese flanco de CLK. Entre flancos conserva Q(t−1). D no cambia a la vez que CLK en estos ejercicios.`;
      }
      if (isJK || isT) {
        const edge = TYPES[type].active ? '↑' : '↓';
        const cells = isJK
          ? [[0,0,edge,'Q(t−1)','Memoria'],[0,1,edge,0,'Reset'],[1,0,edge,1,'Set'],[1,1,edge,'Q̅(t−1)','Conmutación'],['–','–',`Sin ${edge}`,'Q(t−1)','Memoria']]
          : [[0,edge,'Q(t−1)','Memoria'],[1,edge,'Q̅(t−1)','Conmutación'],['–',`Sin ${edge}`,'Q(t−1)','Memoria']];
        $('#truth-table').innerHTML = cells.map(row => `<tr>${row.map(value => `<td>${value}</td>`).join('')}</tr>`).join('');
        $('#rule-note').textContent = `${isJK ? 'JK' : 'T'}: solo actúa en el flanco ${TYPES[type].active ? 'ascendente (↑)' : 'descendente (↓)'}. ${isJK ? '00 conserva Q, 01 hace Reset, 10 hace Set y 11 invierte Q.' : 'T = 0 conserva Q; T = 1 invierte Q.'} Entre flancos conserva Q. Q̅(t−1) significa invertir el valor anterior de Q.`;
      }
      xMode = false;
      $('#mark-x').hidden = true;
    }
    feedback('¿Qué valor conserva el circuito?', `Completa ${outputLabel} y comprueba tu respuesta.`);
    renderChart();
  }
  function setCell(cell, value = paint) {
    if (!cell) return;
    const key = cell.dataset.row, i = Number(cell.dataset.index);
    if (answers[key][i] === value) return;
    answers[key][i] = value;
    if (showingSolution) {
      showingSolution = false;
      document.querySelectorAll('.forbidden-output').forEach(c => c.classList.remove('forbidden-output'));
      document.querySelectorAll('.editable-track').forEach(track => {
        track.querySelector('svg').outerHTML = waveform(answers[track.dataset.track], '#3672ed', true);
        track.querySelectorAll('.signal-cell').forEach(c => c.setAttribute('aria-label', c.getAttribute('aria-label').replace(', condición prohibida', '')));
      });
      feedback('Respuesta modificada', 'Pulsa Comprobar para revisar los cambios.');
    }
    if (checked) {
      checked = false;
      feedback('Respuesta modificada', 'Pulsa Comprobar para revisar los cambios.');
      document.querySelectorAll('.signal-cell').forEach(c => c.classList.remove('correct', 'incorrect'));
    }
    const track = cell.closest('.signal-track');
    track.querySelector('svg').outerHTML = waveform(answers[key], '#3672ed', true);
    cell.querySelector('span').textContent = value === null ? '·' : value === 'X' ? 'X' : '';
    cell.setAttribute('aria-label', `${key === 'q' ? 'Q' : 'Q̅'}, de ${i} a ${i + 1} segundos: ${value === null ? 'sin completar' : value}${showingSolution && isForbidden(i) ? ', condición prohibida' : ''}`);
    if (value === null) delete cell.dataset.value; else cell.dataset.value = value;
    updateCompletion();
  }
  document.querySelectorAll('[data-type]').forEach(button => button.addEventListener('click', () => {
    if (type === button.dataset.type) return;
    type = button.dataset.type;
    document.querySelectorAll('[data-type]').forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', b === button); });
    start(false);
  }));
  function toggleCell(cell) {
    if (!cell) return;
    const current = answers[cell.dataset.row][Number(cell.dataset.index)];
    paint = xMode ? 'X' : current === 1 ? 0 : 1;
    setCell(cell);
  }
  $('#mark-x').addEventListener('click', () => {
    xMode = !xMode;
    $('#mark-x').setAttribute('aria-pressed', String(xMode));
    $('#mark-x').classList.toggle('selected', xMode);
  });
  $('#chart').addEventListener('pointerdown', event => {
    const cell = event.target.closest('.signal-cell');
    if (cell && event.button === 0) { drawing = true; toggleCell(cell); }
  });
  $('#chart').addEventListener('pointermove', event => {
    if (drawing) setCell(document.elementFromPoint(event.clientX, event.clientY)?.closest('.signal-cell'));
  });
  window.addEventListener('pointerup', () => { drawing = false; });
  window.addEventListener('pointercancel', () => { drawing = false; });
  window.addEventListener('blur', () => { drawing = false; });
  $('#chart').addEventListener('click', event => { if (event.detail === 0) toggleCell(event.target.closest('.signal-cell')); });
  $('#new-exercise').addEventListener('click', () => start(true));
  $('#clear').addEventListener('click', () => {
    answers = { q: Array(count).fill(null), nq: Array(count).fill(null) };
    checked = false;
    showingSolution = false;
    feedback('Salidas limpias', `Dibuja ${outputLabel} para este mismo ejercicio.`);
    renderChart();
  });
  $('#show-solution').addEventListener('click', () => {
    showingSolution = true;
    answers = { q: [...exercise.q], nq: [...exercise.nq] };
    checked = false;
    renderChart();
    feedback('Solución del ejercicio', isD ? 'Se muestra Q correcta. Pulsa Borrar para intentarlo de nuevo.' : 'Se muestran Q y Q̅ correctas. X indica indeterminación. Pulsa Borrar para intentarlo de nuevo.');
  });
  $('#check').addEventListener('click', () => {
    showingSolution = false;
    const pending = answerValues().filter(v => v === null).length;
    if (pending) { feedback('Faltan tramos por dibujar', `Completa los ${pending} tramos pendientes de ${outputLabel} antes de comprobar.`, 'warning'); return; }
    checked = true;
    const errors = outputKeys.reduce((sum, key) => sum + answers[key].filter((v, i) => v !== exercise[key][i]).length, 0);
    feedback(errors ? 'Todavía hay algo que revisar' : '¡Correcto! Has completado el cronograma.', errors ? `${total - errors} de ${total} tramos correctos. Revisa los ${errors} marcados en rojo y vuelve a comprobar.` : isD ? 'La salida Q es correcta. Prueba con nuevas señales o cambia el tipo de activación.' : 'Las dos salidas son correctas. Prueba con nuevas señales o cambia de puertas.', errors ? 'error' : 'success');
    renderChart();
  });
  start();
})();
