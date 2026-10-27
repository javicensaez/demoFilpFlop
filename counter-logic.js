/* Contador binario síncrono JK, módulo 16. Q se guarda en orden Q0 → Q3. */
(function (root) {
  function initial() { return {q: [0, 0, 0, 0], clk: 0, resetN: 1}; }
  function excitation(q) { return [1, q[0], q[0] & q[1], q[0] & q[1] & q[2]]; }
  function update(state, change) {
    const next = {...state, ...change, q: [...state.q]};
    if (!next.resetN) next.q = [0, 0, 0, 0];
    else if (!state.clk && next.clk) {
      const jk = excitation(state.q);
      next.q = state.q.map((bit, index) => bit ^ jk[index]);
    }
    return next;
  }
  const api = {initial, excitation, update};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CounterLab = api;
})(globalThis);
