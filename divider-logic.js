/* Cascada JK por flanco descendente. Orden: A, B, C, D. */
(function (root) {
  function initial() { return {q: [0, 0, 0, 0], clk: 0}; }
  function update(state, change) {
    const next = {...state, ...change, q: [...state.q]};
    if (state.clk && !next.clk) {
      for (let i = 0; i < 4; i++) {
        next.q[i] ^= 1;
        if (next.q[i]) break; // Solo una caída propaga el cambio a la siguiente etapa.
      }
    }
    return next;
  }
  const api = {initial, update};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DividerLab = api;
})(globalThis);
