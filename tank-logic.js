(function (root) {
  const outputs = {APA: '00', APB: '00', B1: '01', B2: '10', ENA: '11', ENB: '11'};
  const transitions = {
    APA: {'11': 'APA', '10': 'B1'}, APB: {'11': 'APB', '10': 'B2'},
    B1: {'00': 'ENA', '11': 'APB', '10': 'B1'}, B2: {'11': 'APA', '10': 'B2', '00': 'ENB'},
    ENA: {'10': 'B2', '00': 'ENA'}, ENB: {'10': 'B1', '00': 'ENB'}
  };
  function sensors(level) { return `${Number(level >= 30)}${Number(level >= 75)}`; }
  function step(state, input) {
    if (!Object.hasOwn(outputs, state) || !/^[01]{2}$/.test(input)) throw new Error('Estado o entrada no válidos.');
    const next = transitions[state][input];
    return {from: state, state: next || state, input, defined: next !== undefined, output: outputs[next || state]};
  }
  function advance(level, output, consumption) {
    const flow = [...output].reduce((sum, bit) => sum + Number(bit) * 8, 0);
    return Math.max(0, Math.min(100, level + flow - consumption));
  }
  const api = {outputs, transitions, sensors, step, advance};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TankFSM = api;
})(globalThis);
