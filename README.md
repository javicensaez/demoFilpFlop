# Logic Lab

Demos educativas: biestable RS con puertas NOR y NAND, y D sensible a nivel alto o bajo.

Abre `index.html` en un navegador y elige una demo. No necesita instalación ni compilación. También se puede alojar esta carpeta en cualquier servidor de archivos estáticos.

## Uso

1. Elige NOR (entradas activas a 1) o NAND (activas a 0, indicadas R̅ y S̅).
2. El estado inicial anterior a t = 0 es siempre Q = 0 (en RS, Q̅ = 1).
3. Pulsa o arrastra en la parte alta de un tramo para poner 1, o en la parte baja para poner 0. Este comportamiento se aplica a RS, D, JK y T. Con teclado: Tab para moverte y Espacio para alternar.
4. Pulsa Comprobar. Los errores se indican con fondo rojo y una ×; puedes corregirlos y volver a comprobar.
5. Nuevo ejercicio genera otras entradas. Cambiar entre NOR y NAND conserva las señales R/S y el estado inicial, recalcula la solución y limpia las respuestas. Borrar conserva el ejercicio.

Los cambios suceden en segundos enteros. El valor de cada columna corresponde al intervalo [t, t + 1), después de aplicar las entradas en t. Se usa un modelo ideal sin retardos. Se incluyen las combinaciones prohibidas: NOR 11 fuerza Q = Q̅ = 0; NAND 00 fuerza Q = Q̅ = 1. Al pasar directamente a memoria, ambas salidas se representan con X (indeterminadas) hasta un Set o Reset. Cada ejercicio incluye este caso. Activa el botón X para dibujar indeterminación; desactívalo para volver a alternar 1/0.

## Estructura para las siguientes demos

- `index.html`: índice de laboratorios.
- `rs.html`: demo RS con variantes NOR y NAND.
- `d.html`: demo D con variantes por nivel alto y bajo.
- `d-flanco.html`: demo D por flanco ascendente o descendente.
- `jk.html`: demo JK por flanco ascendente o descendente.
- `t.html`: demo T por flanco ascendente o descendente.
- `styles.css`: diseño adaptable y componentes compartidos.
- `logic.js`: motor de cálculo sin dependencia del DOM y generador RS.
- `app.js`: controles, edición del cronograma y evaluación.

La demo `d.html` muestra y evalúa únicamente Q (12 tramos), sin Q̅ en su tabla ni cronograma. Usa el mismo motor e interfaz: D sigue a la entrada mientras EN está en el nivel activo y mantiene Q durante el inactivo. El selector de nivel conserva D, EN y el estado inicial. Incluye Comprobar, Ver solución, dibujo por clic o arrastre y formato 16:9. Usa los enlaces superiores para cambiar entre RS y D por nivel.

La demo `d-flanco.html` captura D únicamente en el flanco seleccionado de CLK y mantiene Q entre capturas. Q y CLK son 0 antes de t = 0. El reloj tiene un período de 4 segundos; D cambia entre los flancos para evitar ambigüedad de muestreo. Cambiar de flanco conserva las entradas.

Las demos `jk.html` y `t.html` incluyen flanco ascendente y descendente, solo Q, estado inicial 0 y controles compartidos. JK aplica 00 memoria, 01 Reset, 10 Set y 11 conmutación; T conserva con 0 e invierte con 1. Las entradas permanecen estables en los flancos. Cambiar de flanco conserva todas las señales y recalcula la solución.

## Verificación

`node --test tests/logic.test.cjs`

Las fuentes de Google son opcionales; si no hay conexión se usan las fuentes del sistema.

## Proyección

En pantallas panorámicas se usa un lienzo común de 1600×900, escalado proporcionalmente al ancho y alto disponibles. El ajuste se recalcula al redimensionar o entrar en pantalla completa; no depende de una resolución física concreta. En pantallas más estrechas se mantiene la distribución adaptable con desplazamiento. `projection.js` gestiona este ajuste en el índice y todas las demos.

## Registro PIPO de 4 bits

`registro-pipo.html`, en la categoría Registros, permite cambiar D3–D0, Enable, reset asíncrono activo a 1 y CLK manualmente, o generar un pulso completo. Q captura los cuatro bits en el flanco ascendente con Enable = 1. Reset tiene prioridad, borra inmediatamente y mantiene Q = 0000 mientras está activo. Al liberarlo no captura hasta una nueva subida válida. La demo incluye lectura binaria, historial y reinicio.

Verificación del registro: `node --test tests/register.test.cjs`.

## Registro SISO de 4 bits

`registro-siso.html`, en Registros: una entrada Din y una salida Dout = Q0. Cada flanco ascendente habilitado desplaza Din → Q3 → Q2 → Q1 → Q0. Las cuatro etapas se muestran para seguir el estado interno. Un bit introducido alcanza Q0 en la cuarta captura. Incluye Enable, reset asíncrono activo a 1, reloj manual, pulsos e historial.

## Registro PISO de 4 bits

`registro-piso.html`: LOAD = 1 carga D3–D0 en paralelo; LOAD = 0 desplaza hacia Q0, rellenando Q3 con cero. Ambas operaciones requieren flanco ascendente y Enable = 1. Reset asíncrono activo a 1 tiene prioridad. Dout = Q0: tras cargar, D0 es visible inmediatamente; los tres siguientes pulsos presentan D1, D2 y D3. El cuarto pulso de desplazamiento deja el registro a cero. Incluye modo de carga, historial y controles compartidos.

## Registro SIPO de 4 bits

`registro-sipo.html`: entrada serie Din y salidas paralelas Q3–Q0. Cada subida habilitada desplaza Din → Q3 → Q2 → Q1 → Q0. Tras cuatro capturas, el primer bit está en Q0 y el último en Q3. Enable conserva el contenido cuando vale 0; reset asíncrono activo a 1 borra todas las etapas. Controles compactos, historial y formato de proyección compartidos.

## Máquina sencilla

`maquina-sencilla.html`, accesible desde la nueva categoría del índice, ofrece ejercicios aleatorios de ensamblador a binario y de binario a ensamblador, comprobación, solución y contador de aciertos en el primer intento válido (consultar la solución cuenta como no acertado).

Cada instrucción tiene 16 bits: código (2), dirección fuente (7) y dirección destino (7). Las direcciones se escriben en decimal, de 0 a 127. Códigos: `00 ADD`, `01 CMP`, `10 MOV`, `11 BEQ`. ADD suma ambos contenidos en destino; CMP compara sin modificar memoria; MOV copia fuente a destino. Estas tres instrucciones actualizan Z según resultado cero, igualdad o valor copiado cero, respectivamente. BEQ salta a destino si Z = 1 y continúa si Z = 0.

BEQ se escribe `BEQ destino`: al generar su código se usa fuente cero, pero al comprobar y decodificar se acepta cualquier campo fuente. Los ejercicios de decodificación también incluyen fuentes no nulas para BEQ. El juego practica la codificación; no ejecuta programas.

Verificación: `node --test tests/*.test.cjs`.

## Codifica programas

`programas-maquina.html` incluye el programa de suma repetida con etiquetas `bucle` y `fi`, además de suma de 1 hasta n y comparación y copia. Cada ejercicio elige una base de datos entre 50 y 100 inclusive. Las instrucciones se ubican desde 0 y los datos desde la base, consecutivamente, una palabra por dirección.

Cada fila permite introducir código, fuente y destino (o un valor de 16 bits para los datos), con vista binaria y hexadecimal. Comprobar marca cada fila; Ver solución completa la tabla; Nuevo ejercicio elige un programa diferente y cambia la base. BEQ acepta cualquier fuente. `program-logic.js` resuelve etiquetas en dos pasadas, incluidas referencias hacia delante.

El programa «Acumulador con etiquetas» conserva la secuencia facilitada con `inici`, `bucle`, `fi` y los datos `zero`, `uno`, `n`, `i`, `acumulador`. Con base 100 coincide con los operandos originales 100–104; otras bases relocalizan los datos. Admite terminadores `;` y comentarios `#`, como `#Dades`.

«Comparación por incremento» añade el programa con datos `zero`, `uno`, `a`, `b`, `i`, `resultat` y etiquetas de código `inici`, `bucle`, `trobat_a`, `trobat_b`, `fi`. Conserva los saltos a 8, 11, 1 y 13 y relocaliza los operandos de datos según la base aleatoria.

## Contador síncrono JK de 4 bits

`contador-jk.html`, en la categoría Contadores (antes de Máquina sencilla), reproduce un contador ascendente módulo 16 con reloj común por flanco ascendente y reset asíncrono activo a 0. Q0 es el bit de menor peso. Las excitaciones son J0=K0=1, J1=K1=Q0, J2=K2=Q0·Q1 y J3=K3=Q0·Q1·Q2. Todos los bits se calculan simultáneamente con el estado anterior.

Incluye diagrama con niveles lógicos y dos AND de dos entradas en cascada (Q0·Q1 y su salida combinada con Q2), reloj manual, pulso completo, reloj automático, reset, lectura binaria/decimal/hexadecimal e historial. El nivel bajo del reloj conserva el estado; reset tiene prioridad y su liberación no cuenta sin una nueva subida. `counter-logic.js` contiene el motor independiente del DOM.

## LFSR de 4 bits

`lfsr-4.html` añade una segunda demo en Contadores. Usa cuatro biestables D con reloj común ascendente: Q3 siguiente = Q0 XOR Q1; Q2 siguiente = Q3; Q1 siguiente = Q2; Q0 siguiente = Q1. El diagrama conecta las derivaciones Q0 y Q1 a la XOR y devuelve su salida a D3, mostrando los niveles lógicos.

Incluye reloj manual, pulsos, reloj automático, semilla configurable, lectura binaria/decimal/hexadecimal e historial. Empieza en 0001. INIT activo bajo inicializa asíncronamente a 0001 mediante preset de Q0 y clear de los demás bits. Una semilla no nula recorre 15 estados; 0000 queda bloqueado. Las pruebas verifican el período para las 15 semillas no nulas, los flancos, el bloqueo y la prioridad de inicialización.

## Divisor de frecuencia con JK en cascada

`divisor-frecuencia.html`, en Contadores, reproduce cuatro JK con J = K = 1 y flanco descendente. CLK acciona A, y cada salida acciona el reloj de la siguiente etapa: A = f/2, B = f/4, C = f/8 y D = f/16. DCBA cuenta de 0 a 15 y vuelve a cero. Incluye reloj manual, pulsos, reloj automático, niveles del circuito y cronograma de los últimos 64 cambios. Reiniciar vuelve a CLK = 0 y DCBA = 0000. El modelo muestra estados estabilizados sin retardos de propagación.

Verificación: `node --test tests/*.test.cjs`.

## RAM de 4 registros D

`ram-4.html`, en Registros, simula una RAM de 4 palabras de 4 bits (16 bits en total). DIN llega a todas las entradas D. A1 A0 se conecta al decodificador 2→4 y al selector del multiplexador 4→1. WE habilita el decodificador: solo el registro seleccionado recibe Enable = 1 y captura DIN en el flanco ascendente del reloj común. WE = 0 impide escribir. Las cuatro salidas Q llegan al multiplexador; DOUT presenta la palabra de la dirección actual sin esperar al reloj.

Incluye edición de bits de datos y dirección, WE, reloj manual, pulso completo, diagrama con buses y enables, tabla de memoria e historial. Cambiar datos, dirección o WE sin una subida no modifica la memoria. Reiniciar pone palabras y controles a cero. Modelo ideal sin retardos. Motor independiente en `ram-logic.js`; pruebas en `tests/ram.test.cjs`.

## Simulador de máquina sencilla

`simulador-maquina.html` permite escribir instrucciones con etiquetas (direcciones 0–99) y datos en un editor independiente (100–127, asignados en orden). Admite los cinco programas de ejemplo, instrucciones en mayúsculas o minúsculas, etiquetas aisladas, operandos numéricos, terminadores `;` y comentarios `#`. Cada dato es un entero sin signo de 16 bits; ADD guarda la suma módulo 65536. La interfaz indica esta convención.

Ensamblar y reiniciar valida la sintaxis y las referencias, genera código máquina y carga memoria. Paso a paso o Ejecutar muestra PC, Z, instrucción siguiente, memoria inicial y actual, última escritura e historial de las últimas 100 instrucciones. MOV y ADD actualizan Z según el valor guardado; CMP actualiza Z por igualdad sin escribir; BEQ conserva Z. Los saltos deben apuntar a instrucciones cargadas y los operandos de datos a 100–127.

La ejecución automática se puede pausar y cambiar de velocidad; pausa al terminar, al ejecutar un BEQ tomado hacia sí mismo o tras 1000 pasos consecutivos. Los demás bucles continúan hasta pausar o alcanzar ese límite. Editar los textos pausa y exige ensamblar de nuevo. Reiniciar ejecución restaura memoria, PC y Z. El motor `simulator-logic.js` no depende del DOM.
