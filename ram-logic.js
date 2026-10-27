/* RAM de 4 palabras de 4 bits: escritura síncrona y lectura combinacional. */
(function (root) {
  function initial() { return {data: 0, address: 0, we: 0, clk: 0, words: [0, 0, 0, 0]}; }
  function enables(state) { return state.words.map((_, i) => Number(!!state.we && state.address === i)); }
  function read(state) { return state.words[state.address]; }
  function update(state, change) {
    const next = {...state, ...change, words: [...state.words]};
    if (!Number.isInteger(next.data) || next.data < 0 || next.data > 15) throw new RangeError('Dato fuera de 0–15');
    if (!Number.isInteger(next.address) || next.address < 0 || next.address > 3) throw new RangeError('Dirección fuera de 0–3');
    if (!state.clk && next.clk && next.we) next.words[next.address] = next.data;
    return next;
  }
  const api = {initial, enables, read, update};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.RamLab = api;
})(globalThis);
