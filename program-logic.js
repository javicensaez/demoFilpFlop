(function (root) {
  const machine = typeof module !== 'undefined' && module.exports ? require('./machine-logic.js') : root.Machine;
  const examples = [
    {name: 'Suma repetida', source: `        MOV zero, c
        MOV zero, i
bucle:  ADD a, c
        ADD u, i
        CMP i, b
        BEQ fi
        CMP zero, zero
        BEQ bucle
fi:     BEQ fi

zero:   0
u:      1
i:      0
a:      3
b:      5
c:      0`},
    {name: 'Suma de 1 hasta n', source: `        MOV zero, suma
        MOV zero, i
bucle:  ADD uno, i
        ADD i, suma
        CMP i, n
        BEQ fin
        CMP zero, zero
        BEQ bucle
fin:    BEQ fin

zero:   0
uno:    1
i:      0
n:      4
suma:   0`},
    {name: 'Comparación y copia', source: `        CMP a, b
        BEQ iguales
        MOV a, resultado
        CMP zero, zero
        BEQ fin
iguales: MOV b, resultado
fin:    CMP zero, zero
        BEQ fin

zero:   0
a:      7
b:      7
resultado: 0`},
    {name: 'Acumulador con etiquetas', source: `inici:  MOV zero, i;
        MOV zero, acumulador;
bucle:  ADD uno, i;
        ADD i, acumulador;
        CMP n, i;
        BEQ fi;
        CMP zero, zero;
        BEQ bucle;
fi:     BEQ fi;

#Dades

zero:       0;
uno:         1;
n:          4;
i:          0;
acumulador: 0;`},
    {name: 'Comparación por incremento', source: `inici:  MOV zero, i;
bucle:  ADD uno, i;
        CMP a, i;
        BEQ trobat_a;
        CMP b, i;
        BEQ trobat_b;
        CMP zero, zero;
        BEQ bucle;
trobat_a: MOV zero, resultat;
        CMP zero, zero;
        BEQ fi;
trobat_b: MOV uno, resultat;
        CMP zero, zero;
fi:     BEQ fi;

#Dades

zero:     0;
uno:       1;
a:        2;
b:        1;
i:        0;
resultat: 0;`}
  ];
  function assemble(source, base) {
    if (!Number.isInteger(base) || base < 50 || base > 100) throw new Error('La base de datos debe estar entre 50 y 100.');
    const symbols = Object.create(null), rows = [];
    let code = 0, data = 0;
    for (const line of source.split('\n')) {
      const contentLine = line.split(/[;#]/, 1)[0].trim();
      if (!contentLine) continue;
      const match = contentLine.match(/^(?:([a-zA-Z_]\w*):\s*)?(.+)$/);
      if (!match) throw new Error('Línea no válida.');
      const [, label, content] = match;
      const isData = /^\d+$/.test(content);
      const address = isData ? base + data++ : code++;
      if (address > 127 || (!isData && address >= base)) throw new Error('El programa excede el espacio disponible.');
      if (label) {
        if (Object.hasOwn(symbols, label)) throw new Error('Etiqueta duplicada.');
        symbols[label] = address;
      }
      rows.push({label: label || '', content, address, isData});
    }
    function resolve(operand) {
      if (/^\d+$/.test(operand)) return operand;
      if (!Object.hasOwn(symbols, operand)) throw new Error(`Etiqueta desconocida: ${operand}`);
      return String(symbols[operand]);
    }
    for (const row of rows) {
      if (row.isData) {
        const value = Number(row.content);
        if (value > 65535) throw new Error('Dato fuera de 16 bits.');
        row.bits = value.toString(2).padStart(16, '0');
      } else {
        const numeric = row.content.replace(/\b(?!ADD\b|CMP\b|MOV\b|BEQ\b)[a-zA-Z_]\w*\b|\b\d+\b/g, resolve);
        row.instruction = machine.parseAssembly(numeric);
        row.bits = machine.encode(row.instruction);
      }
    }
    return {rows, symbols};
  }
  const api = {examples, assemble};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ProgramMachine = api;
})(globalThis);
