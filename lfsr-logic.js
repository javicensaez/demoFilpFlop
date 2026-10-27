/* LFSR Fibonacci de 4 bits: Q3' = Q0 XOR Q1; desplazamiento hacia Q0. */
(function (root) {
  function initial() { return {q: [1, 0, 0, 0], clk: 0, resetN: 1}; }
  function inputs(q) { return [q[1], q[2], q[3], q[0] ^ q[1]]; }
  function update(state, change) {
    const next = {...state, ...change, q: [...state.q]};
    if (!next.resetN) next.q = initial().q;
    else if (change.seed !== undefined) {
      if (!/^[01]{4}$/.test(change.seed)) throw new Error('La semilla debe tener exactamente 4 bits.');
      next.q = [...change.seed].reverse().map(Number);
    } else if (!state.clk && next.clk) next.q = inputs(state.q);
    delete next.seed;
    return next;
  }
  const api = {initial, inputs, update};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.LfsrLab = api;
})(globalThis);
