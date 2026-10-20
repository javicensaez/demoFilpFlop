/* Registro PIPO de cuatro bits. Reset asíncrono activo alto y prioritario. */
(function(root) {
  function initial(mode = 'pipo') { return { mode, d:[0,0,0,0], q:[0,0,0,0], clk:0, enable:1, reset:0, load:1 }; }
  function update(state, change) {
    const next = { ...state, ...change, d:[...(change.d || state.d)], q:[...state.q] };
    if (next.reset) next.q = [0,0,0,0];
    else if (state.clk === 0 && next.clk === 1 && next.enable) {
      if (next.mode === 'siso' || next.mode === 'sipo') next.q = [next.d[0], ...state.q.slice(0,3)];
      else if (next.mode === 'piso' && !next.load) next.q = [0, ...state.q.slice(0,3)];
      else next.q = [...next.d];
    }
    return next;
  }
  root.RegisterLab = { initial, update };
  if (typeof module !== 'undefined') module.exports = root.RegisterLab;
})(typeof window !== 'undefined' ? window : globalThis);
