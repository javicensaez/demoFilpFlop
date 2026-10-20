const { test } = require('node:test');
const assert = require('node:assert/strict');
const { solve, generate } = require('../logic.js');
test('NOR: memoria inicial, set, memoria, reset y memoria', () => {
  assert.deepEqual(solve('nor', [0,0,0,1,0], [0,1,0,0,0], 0), {q:[0,1,1,0,0], nq:[1,0,0,1,1]});
  assert.equal(solve('nor', [0], [0], 1).q[0], 1);
});
test('NAND: entradas activas a nivel bajo y conservación del estado', () => {
  assert.deepEqual(solve('nand', [1,1,1,0,1], [1,0,1,1,1], 0), {q:[0,1,1,0,0], nq:[1,0,0,1,1]});
  assert.equal(solve('nand', [1], [1], 1).q[0], 1);
});
test('NOR: prohibido, memoria indeterminada persistente y recuperación por Set/Reset', () => {
  assert.deepEqual(solve('nor', [1,1,0,0,0,0,1,0], [1,1,0,0,1,0,0,0], 1), {
    q:[0,0,'X','X',1,1,0,0], nq:[0,0,'X','X',0,0,1,1]
  });
});
test('NAND: prohibido, memoria indeterminada persistente y recuperación por Reset/Set', () => {
  assert.deepEqual(solve('nand', [0,0,1,1,0,1,1,1], [0,0,1,1,1,1,0,1], 0), {
    q:[1,1,'X','X',0,0,1,1], nq:[1,1,'X','X',1,1,0,0]
  });
});
test('Se puede salir de prohibido directamente a Set o Reset sin indeterminación', () => {
  for (const type of ['nor', 'nand']) {
    const active = type === 'nor' ? 1 : 0, inactive = 1 - active;
    assert.deepEqual(solve(type, [active,inactive,active,active], [active,active,active,inactive], 0).q,
      [inactive,1,inactive,0]);
  }
});
test('Los ejercicios incluyen las cuatro combinaciones, indeterminación y recuperación', () => {
  for (const type of ['nor', 'nand']) for (let n = 0; n < 500; n++) {
    const exercise = generate(type);
    const active = type === 'nor' ? 1 : 0;
    assert.equal(exercise.r.length, 12);
    assert.equal(new Set(exercise.r.map((v,i) => `${v}${exercise.s[i]}`)).size, 4);
    assert.deepEqual(solve(type, exercise.r, exercise.s, exercise.initial).q, exercise.q);
    assert.ok(exercise.q.includes('X'));
    exercise.q.forEach((q,i) => {
      const nq = exercise.nq[i];
      if (q === 'X') assert.equal(nq, 'X');
      else if (exercise.r[i] === active && exercise.s[i] === active) {
        assert.equal(q, 1 - active);
        assert.equal(nq, q);
      } else assert.equal(q + nq, 1);
    });
  }
});
test('D alto: sigue cada cambio de D con EN=1 y conserva con EN=0', () => {
  assert.deepEqual(solve('d-high', [1,0,1,0,0,1,0], [0,1,1,1,0,0,1], 0), {
    q:[0,0,1,0,0,0,0], nq:[1,1,0,1,1,1,1]
  });
});
test('D bajo: sigue cada cambio de D con EN=0 y conserva con EN=1', () => {
  assert.deepEqual(solve('d-low', [0,1,0,1,0,1,0], [1,0,0,1,1,0,0], 1), {
    q:[1,1,0,0,0,1,0], nq:[0,0,1,1,1,0,1]
  });
});
test('Cambiar el nivel activo recalcula las mismas señales sin modificarlas', () => {
  const d = [0,1,0,1], en = [1,1,0,0];
  assert.deepEqual(solve('d-high', d, en, 1).q, [0,1,1,1]);
  assert.deepEqual(solve('d-low', d, en, 1).q, [1,1,0,1]);
  assert.deepEqual(d, [0,1,0,1]);
  assert.deepEqual(en, [1,1,0,0]);
});
test('Generador D: ambos niveles y variaciones de D dentro de cada nivel', () => {
  for (const type of ['d-high','d-low']) for (let n = 0; n < 100; n++) {
    const e = generate(type);
    assert.equal(e.r.length, 12);
    assert.equal(e.s.length, 12);
    for (const level of [0,1]) assert.ok(e.r.some((v,i) => i && e.s[i] === level && e.s[i-1] === level && v !== e.r[i-1]));
    e.q.forEach((q,i) => {
      assert.equal(q + e.nq[i], 1);
      assert.equal(q, e.s[i] === (type === 'd-high' ? 1 : 0) ? e.r[i] : i ? e.q[i-1] : e.initial);
    });
  }
});

test('Todas las demos empiezan con Q = 0 antes de t = 0', () => {
  for (const type of ['nor', 'nand', 'd-high', 'd-low']) {
    for (const random of [() => 0, () => 0.75]) {
      assert.equal(generate(type, 12, random).initial, 0);
    }
  }
});
test('D ascendente: captura solo 0→1, conserva con nivel alto y en bajadas', () => {
  assert.deepEqual(solve('d-rising', [1,1,0,0,1,1,0,0], [0,1,1,0,0,1,1,0], 0).q,
    [0,1,1,1,1,1,1,1]);
});
test('D descendente: captura solo 1→0, conserva con nivel bajo y en subidas', () => {
  assert.deepEqual(solve('d-falling', [1,1,0,1,0,1,1,0], [0,1,1,0,0,1,1,0], 0).q,
    [0,0,0,1,1,1,1,0]);
});
test('CLK inicial es 0: el primer tramo alto es subida y el primer tramo bajo no es bajada', () => {
  assert.equal(solve('d-rising', [1], [1], 0).q[0], 1);
  assert.equal(solve('d-falling', [1], [0], 0).q[0], 0);
});
test('Ejercicios D por flanco: no cambia D en un flanco y conservan estado entre capturas', () => {
  for (const type of ['d-rising', 'd-falling']) for (let n = 0; n < 100; n++) {
    const e = generate(type);
    assert.equal(e.initial, 0);
    assert.equal(e.r.length, 12);
    assert.ok(e.s.some((v,i) => i && v > e.s[i-1]));
    assert.ok(e.s.some((v,i) => i && v < e.s[i-1]));
    e.q.forEach((q,i) => {
      const prevCLK = i ? e.s[i-1] : 0;
      if (i && e.s[i] !== prevCLK) assert.equal(e.r[i], e.r[i-1]);
      const captures = prevCLK !== e.s[i] && e.s[i] === (type === 'd-rising' ? 1 : 0);
      assert.equal(q, captures ? e.r[i] : i ? e.q[i-1] : 0);
    });
  }
});
test('JK: tabla completa para ambos flancos y ambos estados anteriores', () => {
  for (const type of ['jk-rising','jk-falling']) for (const initial of [0,1]) {
    for (const j of [0,1]) for (const k of [0,1]) {
      const clk = type === 'jk-rising' ? [0,1] : [1,0];
      const expected = j && k ? 1-initial : j ? 1 : k ? 0 : initial;
      assert.deepEqual(solve(type, [j,j], clk, initial, [k,k]).q, [initial,expected]);
    }
  }
});
test('T: conserva con T=0 e invierte una sola vez en cada flanco activo con T=1', () => {
  for (const type of ['t-rising','t-falling']) for (const initial of [0,1]) {
    const clk = type === 't-rising' ? [0,1,1,0,0,1] : [1,0,0,1,1,0];
    assert.deepEqual(solve(type, [1,1,1,1,1,1], clk, initial).q,
      [initial,1-initial,1-initial,1-initial,1-initial,initial]);
    assert.deepEqual(solve(type, [0,0,0,0,0,0], clk, initial).q, Array(6).fill(initial));
  }
});
test('JK no cambia entre flancos aunque cambien J y K', () => {
  assert.deepEqual(solve('jk-rising', [1,1,0,1,0,0], [0,1,1,1,0,0], 0, [0,0,1,1,1,0]).q, [0,1,1,1,1,1]);
});
test('Generadores JK y T: entradas estables en flancos, Q inicial 0 y recálculo conservando señales', () => {
  for (const family of ['jk','t']) for (let n=0; n<100; n++) {
    const e = generate(`${family}-rising`);
    assert.equal(e.initial, 0);
    for (const key of family === 'jk' ? ['r','k'] : ['r']) {
      assert.equal(e[key].length,12);
      e.s.forEach((v,i) => { if (i && v !== e.s[i-1]) assert.equal(e[key][i],e[key][i-1]); });
    }
    const original = JSON.stringify(e);
    for (const edge of ['rising','falling']) {
      const result = solve(`${family}-${edge}`,e.r,e.s,e.initial,e.k);
      let previous = 0;
      result.q.forEach((q,i) => {
        const prevCLK = i ? e.s[i-1] : 0;
        if (prevCLK !== e.s[i] && e.s[i] === (edge === 'rising' ? 1 : 0)) {
          if (family === 't') previous = e.r[i] ? 1-previous : previous;
          else previous = e.r[i] && e.k[i] ? 1-previous : e.r[i] ? 1 : e.k[i] ? 0 : previous;
        }
        assert.equal(q,previous);
      });
    }
    assert.equal(JSON.stringify(e), original);
  }
});
