/* Motor independiente de la interfaz, reutilizable por futuros laboratorios. */
(function (root) {
  const TYPES = {
    'jk-rising': { name: 'Flanco ascendente', active: 1, edge: true },
    'jk-falling': { name: 'Flanco descendente', active: 0, edge: true },
    't-rising': { name: 'Flanco ascendente', active: 1, edge: true },
    't-falling': { name: 'Flanco descendente', active: 0, edge: true },
    'd-rising': { name: 'Flanco ascendente', active: 1, edge: true, rows: [[0, '↑', 0, 1, 'Captura D'], [1, '↑', 1, 0, 'Captura D'], ['–', 'Sin ↑', 'Q(t−1)', 'Q̅(t−1)', 'Memoria']] },
    'd-falling': { name: 'Flanco descendente', active: 0, edge: true, rows: [[0, '↓', 0, 1, 'Captura D'], [1, '↓', 1, 0, 'Captura D'], ['–', 'Sin ↓', 'Q(t−1)', 'Q̅(t−1)', 'Memoria']] },
    'd-high': { name: 'Nivel alto', active: 1, rows: [[0, 0, 'Q(t−1)', 'Q̅(t−1)', 'Memoria'], [0, 1, 0, 1, 'Q = D'], [1, 0, 'Q(t−1)', 'Q̅(t−1)', 'Memoria'], [1, 1, 1, 0, 'Q = D']] },
    'd-low': { name: 'Nivel bajo', active: 0, rows: [[0, 0, 0, 1, 'Q = D'], [0, 1, 'Q(t−1)', 'Q̅(t−1)', 'Memoria'], [1, 0, 1, 0, 'Q = D'], [1, 1, 'Q(t−1)', 'Q̅(t−1)', 'Memoria']] },
    nor: { name: 'NOR', active: 1, rows: [[0, 0, 'Q(t−1)', 'Q̅(t−1)', 'Memoria'], [0, 1, 1, 0, 'Set'], [1, 0, 0, 1, 'Reset'], [1, 1, 0, 0, 'Prohibida']] },
    nand: { name: 'NAND', active: 0, rows: [[1, 1, 'Q(t−1)', 'Q̅(t−1)', 'Memoria'], [1, 0, 1, 0, 'Set'], [0, 1, 0, 1, 'Reset'], [0, 0, 1, 1, 'Prohibida']] }
  };
  function solve(type, r, s, initial, k = []) {
    if (!TYPES[type]) throw new Error('Tipo desconocido');
    if (r.length !== s.length) throw new Error('Longitudes distintas');
    let q = initial;
    if (type.startsWith('jk-') || type.startsWith('t-')) {
      const jk = type.startsWith('jk-');
      if (jk && k.length !== r.length) throw new Error('Longitud de K distinta');
      const result = r.map((value, i) => {
        const previousClock = i ? s[i - 1] : 0;
        if (s[i] !== previousClock && s[i] === TYPES[type].active) {
          if (!jk) { if (value === 1) q = 1 - q; }
          else if (value === 1 && k[i] === 1) q = 1 - q;
          else if (value === 1) q = 1;
          else if (k[i] === 1) q = 0;
        }
        return q;
      });
      return { q: result, nq: result.map(value => 1 - value) };
    }
    if (type.startsWith('d-')) {
      const result = r.map((d, i) => {
        const previousClock = i === 0 ? 0 : s[i - 1];
        const enabled = TYPES[type].edge
          ? s[i] !== previousClock && s[i] === TYPES[type].active
          : s[i] === TYPES[type].active;
        if (enabled) q = d;
        return q;
      });
      return { q: result, nq: result.map(value => 1 - value) };
    }
    let wasForbidden = false;
    const result = [], inverted = [];
    for (let i = 0; i < r.length; i++) {
      const reset = r[i] === TYPES[type].active;
      const set = s[i] === TYPES[type].active;
      if (reset && set) {
        // Mientras se fuerzan ambas entradas, las dos salidas son conocidas e iguales.
        q = type === 'nor' ? 0 : 1;
        result.push(q);
        inverted.push(q);
        wasForbidden = true;
        continue;
      }
      if (reset) q = 0;
      else if (set) q = 1;
      else if (wasForbidden) q = 'X';
      wasForbidden = false;
      result.push(q);
      inverted.push(q === 'X' ? 'X' : 1 - q);
    }
    return { q: result, nq: inverted };
  }
  function generate(type, count = 12, random = Math.random) {
    if (count < 6) throw new Error('Se necesitan al menos 6 tramos');
    if (TYPES[type]?.edge) {
      // Reloj periódico; D cambia entre flancos para evitar muestreos ambiguos.
      const s = Array.from({ length: count }, (_, i) => Math.floor(i / 2) % 2);
      const r = Array.from({ length: count }, () => 0);
      let d = random() < 0.5 ? 0 : 1;
      for (let i = 0; i < count; i++) {
        if (i % 2) d = random() < 0.5 ? 0 : 1;
        r[i] = d;
      }
      const k = [];
      let kv = random() < 0.5 ? 0 : 1;
      for (let i = 0; i < count; i++) {
        if (i % 2) kv = random() < 0.5 ? 0 : 1;
        k.push(kv);
      }
      const initial = 0;
      return { type, r, s, k, initial, ...solve(type, r, s, initial, k) };
    }
    if (type.startsWith('d-')) {
      // D cambia con Enable tanto activo como inactivo, sin necesitar un flanco.
      const r = Array.from({ length: count }, () => random() < 0.5 ? 0 : 1);
      const s = Array.from({ length: count }, () => random() < 0.5 ? 0 : 1);
      const offset = Math.floor(random() * (count - 5));
      r.splice(offset, 6, 0, 1, 0, 1, 0, 1);
      s.splice(offset, 6, 0, 0, 0, 1, 1, 1);
      const initial = 0;
      return { type, r, s, initial, ...solve(type, r, s, initial) };
    }
    const inactive = 1 - TYPES[type].active;
    const states = [1, 2, ...Array.from({ length: count - 6 }, () => Math.floor(random() * 4))];
    for (let i = states.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [states[i], states[j]] = [states[j], states[i]];
    }
    // Garantiza una liberación simultánea, memoria indeterminada y recuperación.
    const position = Math.floor(random() * (states.length + 1));
    states.splice(position, 0, 3, 0, 0, random() < 0.5 ? 1 : 2);
    const r = states.map(v => v === 2 || v === 3 ? 1 - inactive : inactive);
    const s = states.map(v => v === 1 || v === 3 ? 1 - inactive : inactive);
    const initial = 0;
    return { type, r, s, initial, ...solve(type, r, s, initial) };
  }
  root.LogicLab = { TYPES, solve, generate };
  if (typeof module !== 'undefined') module.exports = root.LogicLab;
})(typeof window !== 'undefined' ? window : globalThis);
